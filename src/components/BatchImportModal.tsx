import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FileText, CheckCircle2, AlertCircle, Volume2, Trash2, ArrowRight, Sparkles, Check, HelpCircle } from "lucide-react";
import { audioSynth } from "../utils/audio";
import { SpanishWord, saveBatchCustomSpanishWords, SPANISH_CATEGORIES } from "../data/spanishData";
import { DictionaryItem } from "../data/dictionary";
import { splitKanaIntoSyllables, splitAlphabeticIntoSegments, saveBatchStoredCustomWords } from "../utils/kanaHelper";

export interface ParsedItem {
  id: string;
  originalText: string;
  target: string;       // Foreign word or sentence (e.g. ¿Dónde puedo cambiar dinero?)
  meaning: string;      // Chinese translation (e.g. 请问哪里有兑换货币的服务台？)
  phonetic?: string;
  selected: boolean;
  error?: string;
}

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: "es" | "ja" | "en";
  onImportComplete?: (count: number, lang: "es" | "ja" | "en") => void;
}

const SAMPLE_TEXT_ES = `请问哪里有兑换货币的服务台？\t¿Dónde puedo cambiar dinero?
12. 我想把 X 换成欧元。\tMe gustaría cambiar X dólares a euros.
13. 请问现在几点？\t¿Qué hora es?
14. 请问洗手间在哪里？\t¿Dónde está el baño?
15. 请问我能够在哪里购买旅行支票？\t¿Dónde puedo comprar cheques de viajero?
16. 有，我有带护照。\tSí, tengo mi pasaporte.
17. 可以麻烦你帮我吗？\t¿Me puede ayudar, por favor?
18. 请问你会说英文吗？\t¿Habla inglés?`;

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  defaultLanguage = "es",
  onImportComplete,
}) => {
  const [lang, setLang] = useState<"es" | "ja" | "en">(defaultLanguage);
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT_ES);
  const [esCategory, setEsCategory] = useState<SpanishWord["category"]>("travel");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // Smart Parser
  const parsedItems = useMemo<ParsedItem[]>(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const results: ParsedItem[] = [];

    lines.forEach((line, index) => {
      // 1. Strip leading numbering like "12. ", "13、", "(14)", "15) ", "- "
      const cleanLine = line.replace(/^\s*(?:\d+[\.、\)\s]+|\(\d+\)\s*|\[\d+\]\s*|[-*•]\s*)/, "").trim();
      if (!cleanLine) return;

      let part1 = "";
      let part2 = "";

      // 2. Identify delimiter
      if (cleanLine.includes("\t")) {
        const parts = cleanLine.split("\t").map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
      } else if (/\s{2,}/.test(cleanLine)) {
        // Two or more spaces
        const parts = cleanLine.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
      } else if (/ (?:——|—|--|\||\/) /.test(cleanLine)) {
        const parts = cleanLine.split(/ (?:——|—|--|\||\/) /).map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
      } else if (cleanLine.includes("：") || cleanLine.includes(" : ")) {
        const parts = cleanLine.split(/[:：]/).map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
      } else if (cleanLine.includes(" - ")) {
        const parts = cleanLine.split(" - ").map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
      } else {
        // Script boundary matching (e.g. Chinese followed by Spanish/Latin or vice versa)
        // Chinese characters [\u4e00-\u9fa5]
        const hanMatch = cleanLine.match(/^([\u4e00-\u9fa5\s，。？！、（）]+?)\s+([A-Za-z¿¡áéíóúÁÉÍÓÚñÑüÜ].+)$/);
        const latinMatch = cleanLine.match(/^([A-Za-z¿¡áéíóúÁÉÍÓÚñÑüÜ0-9\s,.\?!'’¿¡]+?)\s+([\u4e00-\u9fa5].+)$/);

        if (hanMatch) {
          part1 = hanMatch[1].trim();
          part2 = hanMatch[2].trim();
        } else if (latinMatch) {
          part1 = latinMatch[1].trim();
          part2 = latinMatch[2].trim();
        } else {
          part1 = cleanLine;
          part2 = "";
        }
      }

      // 3. Smart orientation: determine target sentence vs Chinese meaning
      let target = "";
      let meaning = "";

      const hasChinese = (s: string) => /[\u4e00-\u9fa5]/.test(s);
      const hasSpanishChars = (s: string) => /[¿¡áéíóúÁÉÍÓÚñÑüÜ]|[a-zA-Z]/.test(s);

      if (hasChinese(part1) && !hasChinese(part2) && part2.length > 0) {
        meaning = part1;
        target = part2;
      } else if (hasChinese(part2) && !hasChinese(part1) && part1.length > 0) {
        target = part1;
        meaning = part2;
      } else {
        // Default: If Lang is ES or EN, whichever has Latin is target
        if (lang === "es" || lang === "en") {
          if (hasSpanishChars(part2) && !hasChinese(part2)) {
            target = part2;
            meaning = part1;
          } else {
            target = part1;
            meaning = part2;
          }
        } else {
          // Japanese
          target = part1;
          meaning = part2;
        }
      }

      results.push({
        id: `parsed-${index}-${Date.now()}`,
        originalText: line,
        target,
        meaning,
        selected: Boolean(target && meaning),
        error: !target ? "未检测到外语短句" : !meaning ? "未检测到中文释义" : undefined,
      });
    });

    return results;
  }, [inputText, lang]);

  const validCount = parsedItems.filter((item) => item.selected && item.target && item.meaning).length;

  const handleToggleSelect = (index: number) => {
    // If user clicks toggle on a row
    const item = parsedItems[index];
    if (item) {
      item.selected = !item.selected;
      setInputText((prev) => prev); // re-trigger render
    }
  };

  const handleTestAudio = (text: string) => {
    if (!text.trim()) return;
    if (lang === "es") {
      audioSynth.speakSpanish(text);
    } else if (lang === "ja") {
      audioSynth.speakFullWord(text, undefined, text, undefined, "ja");
    } else {
      audioSynth.speakFullWord(text, undefined, undefined, undefined, "en");
    }
  };

  const handleExecuteImport = () => {
    const activeItems = parsedItems.filter((item) => item.selected && item.target && item.meaning);
    if (activeItems.length === 0) {
      setNotification({ type: "error", message: "没有选中有效的数据条目进行导入！" });
      return;
    }

    if (lang === "es") {
      const newWords: SpanishWord[] = activeItems.map((item, idx) => {
        return {
          id: `custom-es-batch-${Date.now()}-${idx}`,
          word: item.target.trim(),
          meaning: item.meaning.trim(),
          partOfSpeech: item.target.includes(" ") ? "oración" : "frase",
          category: esCategory,
          categoryName: esCategory === "travel" ? "旅行实用短句" : "自定义词库",
          level: "A1",
          isCustom: true,
          exampleEs: item.target.trim(),
          exampleZh: item.meaning.trim(),
        };
      });

      saveBatchCustomSpanishWords(newWords);
      audioSynth.playFanfare();
      setNotification({
        type: "success",
        message: `🎉 成功批量导入 ${newWords.length} 条西班牙语短句/词条至词库！`,
      });
      setIsSuccessState(true);

      if (onImportComplete) {
        onImportComplete(newWords.length, "es");
      }

      setTimeout(() => {
        onClose();
      }, 1400);
    } else if (lang === "en") {
      const newItems: DictionaryItem[] = activeItems.map((item, idx) => {
        const segments = splitAlphabeticIntoSegments(item.target.trim());
        return {
          id: `custom-en-batch-${Date.now()}-${idx}`,
          kanji: item.target.trim(),
          kanaStr: item.target.trim(),
          meaning: item.meaning.trim(),
          category: "custom",
          categoryName: "自定义英语短句",
          rarity: "SR",
          rarityName: "Elite (SR)",
          glowColor: "rgba(59, 130, 246, 0.25)",
          borderColor: "border-blue-400",
          bgGradient: "from-blue-50 to-indigo-100",
          segments: segments,
        };
      });

      saveBatchStoredCustomWords(newItems);
      audioSynth.playFanfare();
      setNotification({
        type: "success",
        message: `🎉 成功批量导入 ${newItems.length} 条英语短句！`,
      });
      setIsSuccessState(true);

      if (onImportComplete) {
        onImportComplete(newItems.length, "en");
      }

      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      // Japanese
      const newItems: DictionaryItem[] = activeItems.map((item, idx) => {
        const cleanKana = item.target.trim();
        const segments = splitKanaIntoSyllables(cleanKana);
        return {
          id: `custom-ja-batch-${Date.now()}-${idx}`,
          kanji: item.target.trim(),
          kanaStr: cleanKana,
          meaning: item.meaning.trim(),
          category: "custom",
          categoryName: "自定义日语短句",
          rarity: "SR",
          rarityName: "卓越 (SR)",
          glowColor: "rgba(245, 158, 11, 0.25)",
          borderColor: "border-amber-400",
          bgGradient: "from-amber-50 to-orange-100",
          segments: segments.length > 0 ? segments : splitAlphabeticIntoSegments(cleanKana),
        };
      });

      saveBatchStoredCustomWords(newItems);
      audioSynth.playFanfare();
      setNotification({
        type: "success",
        message: `🎉 成功批量导入 ${newItems.length} 条日语短句！`,
      });
      setIsSuccessState(true);

      if (onImportComplete) {
        onImportComplete(newItems.length, "ja");
      }

      setTimeout(() => {
        onClose();
      }, 1400);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-stone-50 border-2 border-stone-800 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-250 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black font-serif text-stone-900 leading-tight flex items-center gap-2">
                  <span>批量导入短句与生词库</span>
                  <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                    智能解析
                  </span>
                </h3>
                <p className="text-[11px] text-stone-500 font-mono tracking-tight">
                  SMART BATCH IMPORT: TAB/SPACE/NUMBERED DELIMITED TEXT & AUDIO PREVIEW
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
                title="支持的格式说明"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Help Accordion */}
          {showHelper && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-50 border border-amber-250 p-3.5 rounded-xl text-xs text-amber-950 space-y-2 shrink-0 leading-relaxed font-sans"
            >
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>智能批量解析支持以下常见格式：</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[12px] text-amber-900/90 pl-1">
                <li>
                  <strong>制表符 (Tab) 分隔（常见于 Excel/表格复制）：</strong>
                  <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono ml-1">请问洗手间在哪里？[Tab]¿Dónde está el baño?</code>
                </li>
                <li>
                  <strong>带编号的前缀（自动智能剥离）：</strong>
                  <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono ml-1">12. 我想换成欧元。[Tab]Me gustaría cambiar X dólares a euros.</code>
                </li>
                <li>
                  <strong>连接符/破折号/冒号分隔：</strong>
                  <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono ml-1">¿Qué hora es? - 请问现在几点？</code>
                </li>
                <li>
                  <strong>中文与外语顺序自动识别：</strong>
                  无论你把中文放前面还是西语放前面，系统均会自动按字符语种归类。
                </li>
              </ul>
            </motion.div>
          )}

          {/* Language and Category Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Language switch */}
            <div className="flex rounded-xl bg-stone-200/80 p-1 text-xs font-bold select-none">
              <button
                type="button"
                onClick={() => setLang("es")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  lang === "es"
                    ? "bg-white text-stone-900 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>🇪🇸</span>
                <span>西班牙语短句</span>
              </button>
              <button
                type="button"
                onClick={() => setLang("ja")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  lang === "ja"
                    ? "bg-white text-stone-900 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>🇯🇵</span>
                <span>日语词句</span>
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  lang === "en"
                    ? "bg-white text-stone-900 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>🇬🇧</span>
                <span>英语表达</span>
              </button>
            </div>

            {/* If Spanish, Category selection */}
            {lang === "es" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-stone-600">归入分类:</span>
                <select
                  value={esCategory}
                  onChange={(e) => setEsCategory(e.target.value as SpanishWord["category"])}
                  className="bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {SPANISH_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => setInputText(SAMPLE_TEXT_ES)}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold underline decoration-amber-400 underline-offset-2 ml-auto cursor-pointer"
            >
              载入范例短句
            </button>
          </div>

          {/* Textarea Area */}
          <div className="shrink-0 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700">
              <label htmlFor="batch-paste-textarea">请粘贴文本（每行一条，支持制表符 Tab、破折号或空格分隔）：</label>
              <span className="text-stone-400 font-mono text-[11px]">
                共检测到 {parsedItems.length} 行
              </span>
            </div>
            <textarea
              id="batch-paste-textarea"
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例如：\n请问哪里有兑换货币的服务台？\t¿Dónde puedo cambiar dinero?\n12. 我想把 X 换成欧元。\tMe gustaría cambiar X dólares a euros."
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs sm:text-sm font-mono text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden leading-relaxed shadow-inner resize-y"
            />
          </div>

          {/* Real-time Parsed Preview Table */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-[160px] border border-stone-250 rounded-xl bg-white shadow-xs">
            <div className="bg-stone-100/90 px-3.5 py-2 border-b border-stone-250 flex items-center justify-between text-xs font-bold text-stone-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>实时解析结果预览 ({validCount}/{parsedItems.length} 有效)</span>
              </div>
              <span className="text-[11px] text-stone-400 font-normal">
                点击 🔊 试听发音
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-150 text-xs">
              {parsedItems.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-stone-400 space-y-1">
                  <p>请在上方文本框中粘贴需要导入的短句或单词</p>
                </div>
              ) : (
                parsedItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3 flex items-center gap-3 transition-colors ${
                      !item.target || !item.meaning ? "bg-red-50/40 text-stone-400" : "hover:bg-amber-50/30"
                    }`}
                  >
                    {/* Index */}
                    <span className="w-5 text-center font-mono font-bold text-stone-400 shrink-0">
                      {idx + 1}
                    </span>

                    {/* Target Foreign Sentence */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-stone-900 font-serif text-sm tracking-wide truncate">
                        {item.target || <span className="text-red-500 font-normal italic">未匹配到短句</span>}
                      </div>
                      <div className="text-stone-500 text-[11px] truncate mt-0.5">
                        {item.meaning || <span className="text-red-500 font-normal italic">未匹配到释义</span>}
                      </div>
                    </div>

                    {/* Audio Preview */}
                    {item.target && (
                      <button
                        type="button"
                        onClick={() => handleTestAudio(item.target)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-amber-700 hover:bg-amber-100/60 transition-colors shrink-0 cursor-pointer"
                        title="试听发音"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Status Badge */}
                    <div className="shrink-0 text-right">
                      {item.target && item.meaning ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" />
                          已就绪
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <AlertCircle className="w-3 h-3" />
                          格式待查
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notifications */}
          {notification && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 shrink-0 ${
                notification.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-250 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold text-xs cursor-pointer"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={validCount === 0 || isSuccessState}
              className={`px-6 py-2.5 rounded-xl font-black text-xs font-serif tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                validCount > 0 && !isSuccessState
                  ? "bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-98"
                  : "bg-stone-300 text-stone-500 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>一键导入这 {validCount} 条短句至词库</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
