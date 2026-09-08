import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Sparkles, Volume2, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react";
import { DictionaryItem } from "../data/dictionary";
import { splitKanaIntoSyllables, splitAlphabeticIntoSegments, saveStoredCustomWord } from "../utils/kanaHelper";
import { saveCustomSpanishWord, SpanishWord, SPANISH_CATEGORIES } from "../data/spanishData";
import { audioSynth } from "../utils/audio";

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: "ja" | "es" | "en";
  onWordAdded?: (item: DictionaryItem | SpanishWord, lang: "ja" | "es" | "en") => void;
  onSwitchToBatchImport?: (lang: "ja" | "es" | "en") => void;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  onClose,
  defaultLanguage = "ja",
  onWordAdded,
  onSwitchToBatchImport,
}) => {
  const [langTab, setLangTab] = useState<"ja" | "es" | "en">(defaultLanguage);

  // Japanese Form
  const [jaWord, setJaWord] = useState("");
  const [jaKana, setJaKana] = useState("");
  const [jaMeaning, setJaMeaning] = useState("");
  const [jaCategory, setJaCategory] = useState<"name" | "nature" | "culture" | "food" | "custom">("custom");

  // Spanish Form
  const [esWord, setEsWord] = useState("");
  const [esPhonetic, setEsPhonetic] = useState("");
  const [esPartOfSpeech, setEsPartOfSpeech] = useState("s.m.");
  const [esMeaning, setEsMeaning] = useState("");
  const [esCategory, setEsCategory] = useState<SpanishWord["category"]>("daily");
  const [esExample, setEsExample] = useState("");
  const [esExampleZh, setEsExampleZh] = useState("");

  // English Form
  const [enWord, setEnWord] = useState("");
  const [enMeaning, setEnMeaning] = useState("");
  const [enCategory, setEnCategory] = useState("custom");

  // State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const SPANISH_ACCENT_KEYS = ["á", "é", "í", "ó", "ú", "ñ", "ü", "¡", "¿"];

  const handleInsertSpanishChar = (char: string) => {
    setEsWord((prev) => prev + char);
  };

  const handleTestAudio = () => {
    if (langTab === "es") {
      const text = esWord.trim();
      if (!text) return;
      audioSynth.speakSpanish(text);
    } else if (langTab === "ja") {
      const text = jaKana.trim() || jaWord.trim();
      if (!text) return;
      audioSynth.speakFullWord(text, undefined, jaWord.trim(), undefined, "ja");
    } else {
      const text = enWord.trim();
      if (!text) return;
      audioSynth.speakFullWord(text, undefined, undefined, undefined, "en");
    }
  };

  const handleAiFill = async () => {
    const targetWord = langTab === "ja" ? jaWord.trim() : langTab === "es" ? esWord.trim() : enWord.trim();
    if (!targetWord) {
      setNotification({ type: "error", message: "请先在上方输入需要查询的词汇！" });
      return;
    }

    setIsAiLoading(true);
    setNotification(null);

    try {
      const res = await fetch("/api/smart-word-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: targetWord, lang: langTab }),
      });

      if (!res.ok) {
        throw new Error("服务请求失败");
      }

      const data = await res.json();
      if (data.success && data.data) {
        const item = data.data;
        if (langTab === "ja") {
          if (item.kanji && !jaWord) setJaWord(item.kanji);
          if (item.kana) setJaKana(item.kana);
          if (item.meaning) setJaMeaning(item.meaning);
        } else if (langTab === "es") {
          if (item.word) setEsWord(item.word);
          if (item.phonetic) setEsPhonetic(item.phonetic);
          if (item.partOfSpeech) setEsPartOfSpeech(item.partOfSpeech);
          if (item.meaning) setEsMeaning(item.meaning);
          if (item.exampleSentence) setEsExample(item.exampleSentence);
          if (item.exampleTranslation) setEsExampleZh(item.exampleTranslation);
        } else {
          if (item.word) setEnWord(item.word);
          if (item.meaning) setEnMeaning(item.meaning);
        }
        setNotification({ type: "success", message: "✨ AI 智能填充完成！已生成注音与释义。" });
      } else {
        setNotification({
          type: "error",
          message: data.message || "未能自动获取注音释义，请手动填写。",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: "AI 请求连接异常，请手动填写所需内容。",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (langTab === "ja") {
      const cleanWord = jaWord.trim();
      const cleanKana = jaKana.trim() || cleanWord;
      const cleanMeaning = jaMeaning.trim();

      if (!cleanWord || !cleanMeaning) {
        setNotification({ type: "error", message: "单词原词和中文释义为必填项！" });
        return;
      }

      const segments = splitKanaIntoSyllables(cleanKana);
      if (segments.length === 0) {
        setNotification({ type: "error", message: "无法解析假名注音，请检查假名格式！" });
        return;
      }

      const newItem: DictionaryItem = {
        id: "custom-ja-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        kanji: cleanWord,
        kanaStr: cleanKana,
        category: jaCategory,
        categoryName: jaCategory === "custom" ? "自定义词库" : jaCategory,
        meaning: cleanMeaning,
        rarity: "SR",
        rarityName: "卓越 (SR)",
        glowColor: "rgba(245, 158, 11, 0.25)",
        borderColor: "border-amber-400",
        bgGradient: "from-amber-50 to-orange-100",
        segments: segments,
      };

      saveStoredCustomWord(newItem);
      if (onWordAdded) onWordAdded(newItem, "ja");
      setNotification({ type: "success", message: `✅ 成功录入日语词条「${cleanWord}」！` });

      // Reset form
      setJaWord("");
      setJaKana("");
      setJaMeaning("");
      setTimeout(() => {
        onClose();
      }, 700);
    } else if (langTab === "es") {
      const cleanWord = esWord.trim();
      const cleanMeaning = esMeaning.trim();

      if (!cleanWord || !cleanMeaning) {
        setNotification({ type: "error", message: "西语单词和中文释义为必填项！" });
        return;
      }

      const newSpanish: SpanishWord = {
        id: "custom-es-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        word: cleanWord,
        phonetic: esPhonetic.trim() || undefined,
        partOfSpeech: esPartOfSpeech.trim() || "s.m.",
        meaning: cleanMeaning,
        category: esCategory,
        categoryName: esCategory === "custom" ? "自定义生词" : "自定义词库",
        exampleEs: esExample.trim() || undefined,
        exampleZh: esExampleZh.trim() || undefined,
        level: "A1",
        isCustom: true,
      };

      saveCustomSpanishWord(newSpanish);
      if (onWordAdded) onWordAdded(newSpanish, "es");
      setNotification({ type: "success", message: `✅ 成功录入西语单词「${cleanWord}」！` });

      setEsWord("");
      setEsPhonetic("");
      setEsMeaning("");
      setEsExample("");
      setEsExampleZh("");
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      const cleanWord = enWord.trim();
      const cleanMeaning = enMeaning.trim();

      if (!cleanWord || !cleanMeaning) {
        setNotification({ type: "error", message: "英文单词和中文释义为必填项！" });
        return;
      }

      const segments = splitAlphabeticIntoSegments(cleanWord);
      const newItem: DictionaryItem = {
        id: "custom-en-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        kanji: cleanWord,
        kanaStr: cleanWord,
        category: "custom",
        categoryName: "自定义英语词",
        meaning: cleanMeaning,
        rarity: "SR",
        rarityName: "Elite (SR)",
        glowColor: "rgba(59, 130, 246, 0.25)",
        borderColor: "border-blue-400",
        bgGradient: "from-blue-50 to-indigo-100",
        segments: segments,
      };

      saveStoredCustomWord(newItem);
      if (onWordAdded) onWordAdded(newItem, "en");
      setNotification({ type: "success", message: `✅ 成功录入英语单词「${cleanWord}」！` });

      setEnWord("");
      setEnMeaning("");
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-stone-50 border-2 border-stone-800 rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-250">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black font-serif text-stone-900 leading-tight">
                  录入新单词到词库
                </h3>
                <p className="text-[11px] text-stone-500 font-mono">
                  ADD NEW VOCABULARY CARD WITH SPEECH & SPELLING
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selection Tabs and Mode Switcher */}
          <div className="space-y-2">
            <div className="flex rounded-xl bg-stone-200/80 p-1 text-xs font-bold select-none">
              <button
                type="button"
                onClick={() => {
                  setLangTab("ja");
                  setNotification(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  langTab === "ja"
                    ? "bg-white text-stone-900 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>🇯🇵</span>
                <span>日语五十音词卡</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLangTab("es");
                  setNotification(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  langTab === "es"
                    ? "bg-white text-stone-900 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>🇪🇸</span>
                <span>西语背诵单词</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLangTab("en");
                  setNotification(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  langTab === "en"
                    ? "bg-white text-stone-900 shadow-xs font-black"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>🔤</span>
                <span>英语词汇</span>
              </button>
            </div>

            {onSwitchToBatchImport && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToBatchImport(langTab);
                  }}
                  className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 py-1 px-2 rounded hover:bg-amber-100/50 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>想批量粘贴多行短句？切换至「批量导入工坊」→</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification banner */}
          {notification && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                notification.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-rose-50 border-rose-300 text-rose-800"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {langTab === "ja" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      原词（汉字 / 混合书写）*
                    </label>
                    <input
                      type="text"
                      required
                      value={jaWord}
                      onChange={(e) => setJaWord(e.target.value)}
                      placeholder="如：桜、先生、ありがとう"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      全平假名注音（用于打字切分）*
                    </label>
                    <input
                      type="text"
                      required
                      value={jaKana}
                      onChange={(e) => setJaKana(e.target.value)}
                      placeholder="如：さくら、せんせい"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    中文简要释义 *
                  </label>
                  <input
                    type="text"
                    required
                    value={jaMeaning}
                    onChange={(e) => setJaMeaning(e.target.value)}
                    placeholder="如：樱花，日本国花；美丽的落樱"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    分类标签
                  </label>
                  <select
                    value={jaCategory}
                    onChange={(e) => setJaCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="custom">✍️ 我的自定义词库</option>
                    <option value="name">人名与苗字</option>
                    <option value="nature">自然风物</option>
                    <option value="culture">民俗概念</option>
                    <option value="food">和食美味</option>
                  </select>
                </div>
              </>
            )}

            {langTab === "es" && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-stone-600">
                      西语单词 / 短语 *
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">
                      点击下方按键可插入变音符
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={esWord}
                    onChange={(e) => setEsWord(e.target.value)}
                    placeholder="如：Buenos días, Esperanza, Canción"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  />
                  {/* Spanish Special Accent Quick-Insert Buttons */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {SPANISH_ACCENT_KEYS.map((char) => (
                      <button
                        key={char}
                        type="button"
                        onClick={() => handleInsertSpanishChar(char)}
                        className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      国际音标 (IPA)
                    </label>
                    <input
                      type="text"
                      value={esPhonetic}
                      onChange={(e) => setEsPhonetic(e.target.value)}
                      placeholder="如：[es.peˈɾan.sa]"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      词性简写
                    </label>
                    <input
                      type="text"
                      value={esPartOfSpeech}
                      onChange={(e) => setEsPartOfSpeech(e.target.value)}
                      placeholder="如：s.m., s.f., adj., v."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    中文释义 *
                  </label>
                  <input
                    type="text"
                    required
                    value={esMeaning}
                    onChange={(e) => setEsMeaning(e.target.value)}
                    placeholder="如：希望，期待；信赖"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      西语例句（选填）
                    </label>
                    <input
                      type="text"
                      value={esExample}
                      onChange={(e) => setEsExample(e.target.value)}
                      placeholder="如：La esperanza nunca muere."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      例句中文翻译（选填）
                    </label>
                    <input
                      type="text"
                      value={esExampleZh}
                      onChange={(e) => setEsExampleZh(e.target.value)}
                      placeholder="如：希望永不泯灭。"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    背诵分类
                  </label>
                  <select
                    value={esCategory}
                    onChange={(e) => setEsCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {SPANISH_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {langTab === "en" && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    英文单词 *
                  </label>
                  <input
                    type="text"
                    required
                    value={enWord}
                    onChange={(e) => setEnWord(e.target.value)}
                    placeholder="如：Ephemeral, Serendipity"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    中文简明释义 *
                  </label>
                  <input
                    type="text"
                    required
                    value={enMeaning}
                    onChange={(e) => setEnMeaning(e.target.value)}
                    placeholder="如：转瞬即逝的，短暂的"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            {/* Action Bar: AI Helper + Audio Preview + Save */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-stone-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAiFill}
                  disabled={isAiLoading}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="使用 Gemini AI 自动解析并填写释义与注音"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{isAiLoading ? "AI 查询中..." : "AI 智能填充"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestAudio}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="试听发音"
                >
                  <Volume2 className="w-3.5 h-3.5 text-stone-600" />
                  <span>试听发音</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-black tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>保存至词库</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
