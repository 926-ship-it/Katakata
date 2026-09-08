import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FileText, CheckCircle2, AlertCircle, Volume2, Sparkles, Check, HelpCircle, Edit3, BookOpen, Copy, CheckCheck } from "lucide-react";
import { audioSynth } from "../utils/audio";
import { SpanishWord, saveBatchCustomSpanishWords, SPANISH_CATEGORIES, BASE_SPANISH_WORDS } from "../data/spanishData";
import { DICTIONARY, DictionaryItem } from "../data/dictionary";
import { splitKanaIntoSyllables, splitAlphabeticIntoSegments, saveBatchStoredCustomWords } from "../utils/kanaHelper";

export interface ParsedItem {
  id: string;
  originalText: string;
  target: string;       // Foreign word or sentence (e.g. ¿Dónde puedo cambiar dinero? / ありがとうございます)
  meaning: string;      // Chinese translation (e.g. 请问哪里有兑换货币的服务台？ / 非常感谢)
  isAutoMatched?: boolean;
  isSingleColumn?: boolean;
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

// Built-in common high-frequency phrases dictionary for instant auto-translation
const COMMON_JA_DICT: Record<string, string> = {
  "ありがとうございます": "非常感谢 / 谢谢",
  "どうもありがとうございます": "非常感谢",
  "どうもありがとう": "多谢",
  "ありがとう": "谢谢",
  "おはようございます": "早上好",
  "おはよう": "早安",
  "こんにちは": "你好（白天问候）",
  "こんばんは": "晚上好",
  "おやすみなさい": "晚安",
  "おやすみ": "晚安",
  "さようなら": "再见",
  "さよなら": "再见",
  "またね": "回头见 / 下次见",
  "じゃあね": "拜拜 / 再见",
  "すみません": "不好意思 / 对不起 / 劳驾",
  "すいません": "不好意思 / 对不起",
  "ごめんなさい": "对不起",
  "失礼します": "打扰了 / 失礼了",
  "しつれいします": "打扰了 / 失礼了",
  "いただきます": "我开动了",
  "ごちそうさまでした": "多谢款待",
  "よろしくおねがいします": "请多关照",
  "よろしくお願いします": "请多关照",
  "お疲れ様でした": "辛苦了",
  "おつかれさまでした": "辛苦了",
  "はじめまして": "初次见面",
  "初めまして": "初次见面",
  "乾杯": "干杯",
  "かんぱい": "干杯",
  "大丈夫": "没关系 / 不要紧",
  "だいじょうぶ": "没关系 / 不要紧",
  "はい": "是的 / 好的",
  "いいえ": "不 / 不是",
  "わかりました": "明白了 / 知道了",
  "分かりました": "明白了 / 知道了",
  "いってきます": "我出门了",
  "いってらっしゃい": "路上小心 / 慢走",
  "ただいま": "我回来了",
  "おかえりなさい": "欢迎回来",
  "おいしい": "好吃 / 美味",
  "美味しい": "好吃 / 美味",
  "すごい": "好厉害 / 了不起",
  "すごいですね": "太厉害了呢",
  "かわいい": "可爱",
  "好き": "喜欢",
  "すき": "喜欢",
  "愛してる": "我爱你",
  "あいしてる": "我爱你",
  "頑張って": "加油",
  "がんばって": "加油",
  "おめでとう": "祝贺 / 恭喜",
  "おめでとうございます": "恭喜 / 祝贺",
  "元気ですか": "身体好吗 / 最近好吗",
  "げんきですか": "身体好吗 / 最近好吗",
};

const COMMON_ES_DICT: Record<string, string> = {
  "hola": "你好",
  "buenos días": "早上好",
  "buenos dias": "早上好",
  "buenas tardes": "下午好",
  "buenas noches": "晚上好 / 晚安",
  "gracias": "谢谢",
  "muchas gracias": "非常感谢",
  "de nada": "不客气",
  "por favor": "请",
  "adiós": "再见",
  "adios": "再见",
  "hasta luego": "回头见",
  "hasta mañana": "明天见",
  "hasta pronto": "一会儿见",
  "sí": "是的",
  "si": "是的",
  "no": "不 / 不是",
  "perdón": "抱歉 / 对不起",
  "perdon": "抱歉 / 对不起",
  "disculpe": "不好意思 / 打扰一下",
  "lo siento": "对不起 / 很抱歉",
  "cómo estás": "你好吗 / 最近怎么样",
  "como estas": "你好吗 / 最近怎么样",
  "muy bien": "很好",
  "bienvenido": "欢迎",
  "bienvenidos": "欢迎大家",
  "buen provecho": "用餐愉快 / 慢用",
  "salud": "干杯 / 祝你健康",
  "te amo": "我爱你",
  "te quiero": "我喜欢你 / 我爱你",
  "amigo": "朋友",
  "amiga": "女性朋友",
};

const COMMON_EN_DICT: Record<string, string> = {
  "hello": "你好",
  "hi": "嗨 / 你好",
  "good morning": "早上好",
  "good afternoon": "下午好",
  "good evening": "晚上好",
  "good night": "晚安",
  "thank you": "谢谢你",
  "thanks": "谢谢",
  "thank you very much": "非常感谢你",
  "you are welcome": "不客气",
  "you're welcome": "不客气",
  "please": "请",
  "sorry": "对不起",
  "excuse me": "打扰一下 / 请问",
  "goodbye": "再见",
  "bye": "拜拜",
  "see you": "再见",
  "see you later": "回头见",
  "how are you": "你好吗",
  "nice to meet you": "很高兴认识你",
  "welcome": "欢迎",
  "yes": "是的",
  "no": "不 / 不是",
  "cheers": "干杯 / 谢谢",
  "congratulations": "恭喜 / 祝贺",
  "have a nice day": "祝你有美好的一天",
  "take care": "保重",
};

const SAMPLE_TEXT_ES = `请问哪里有兑换货币的服务台？\t¿Dónde puedo cambiar dinero?
12. 我想把 X 换成欧元。\tMe gustaría cambiar X dólares a euros.
13. 请问现在几点？\t¿Qué hora es?
14. 请问洗手间在哪里？\t¿Dónde está el baño?
15. 请问我能够在哪里购买旅行支票？\t¿Dónde puedo comprar cheques de viajero?
16. 有，我有带护照。\tSí, tengo mi pasaporte.
17. 可以麻烦你帮我吗？\t¿Me puede ayudar, por favor?
18. 请问你会说英文吗？\t¿Habla inglés?`;

const SAMPLE_TEXT_JA = `ありがとうございます\t非常感谢
おはようございます\t早上好
こんにちは\t你好
すみません\t不好意思 / 对不起
いただきます\t我开动了
ごちそうさまでした\t多谢款待
よろしくお願いします\t请多关照
お疲れ様でした\t辛苦了`;

const SAMPLE_TEXT_JA_SINGLE = `ありがとうございます
おはようございます
こんにちは
すみません
いただきます
ごちそうさまでした`;

const SAMPLE_TEXT_EN = `Thank you very much.\t非常感谢你。
Good morning!\t早上好！
Excuse me, where is the station?\t打扰一下，请问车站在哪里？
How have you been lately?\t你最近过得怎么样？
Nice to meet you.\t很高兴认识你。
Have a wonderful day!\t祝你有美好的一天！`;

export const STANDARD_TEMPLATES = {
  tab: {
    id: "tab" as const,
    name: "标准双列（Tab制表符/Excel表格）",
    shortName: "双列 Tab",
    badge: "最推荐",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    pattern: "外语 [Tab] 中文释义",
    tip: "Excel / WPS / 飞书表格中：A列外语、B列中文，框选复制粘贴即为此格式！",
    example: {
      ja: `ありがとうございます\t非常感谢\nおはようございます\t早上好\nこんにちは\t你好\nすみません\t不好意思 / 对不起\nいただきます\t我开动了`,
      es: `¡Hola!\t你好\nBuenos días\t早上好\nMuchas gracias\t非常感谢\n¿Dónde está el baño?\t请问洗手间在哪里？\nHasta luego\t回头见`,
      en: `Thank you very much\t非常感谢\nGood morning\t早上好\nExcuse me\t打扰一下\nNice to meet you\t很高兴认识你\nHave a nice day\t祝你有美好的一天`,
    },
  },
  dash: {
    id: "dash" as const,
    name: "破折号/连字符格式",
    shortName: "破折号 -",
    badge: "手工录入",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    pattern: "外语 - 中文释义",
    tip: "使用连字符或空格分隔外语与中文，如记事本、微信聊天记录复制",
    example: {
      ja: `ありがとうございます - 非常感谢\nおはようございます - 早上好\nこんにちは - 你好\nすみません - 不好意思 / 对不起\n乾杯 - 干杯`,
      es: `¡Hola! - 你好\nBuenos días - 早上好\nMuchas gracias - 非常感谢\n¿Cómo estás? - 你好吗？`,
      en: `Thank you very much - 非常感谢\nGood morning - 早上好\nNice to meet you - 很高兴认识你\nHave a good day - 祝你开心`,
    },
  },
  single: {
    id: "single" as const,
    name: "纯外语单列（无需中文）",
    shortName: "纯词单列",
    badge: "免输释义",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    pattern: "外语单词或短句（一行一条）",
    tip: "仅需粘贴外语单词，系统自带高频释义库智能匹配，支持在下方预览直接修改",
    example: {
      ja: `ありがとうございます\nおはようございます\nこんにちは\nすみません\nいただきます\nごちそうさまでした`,
      es: `¡Hola!\nBuenos días\nMuchas gracias\nPor favor\nDe nada\nBienvenido`,
      en: `Thank you\nGood morning\nExcuse me\nWelcome\nCongratulations\nTake care`,
    },
  },
};

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
  const [showHelper, setShowHelper] = useState(true);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [activeTemplateType, setActiveTemplateType] = useState<"tab" | "dash" | "single">("tab");
  const [meaningOverrides, setMeaningOverrides] = useState<Record<string, string>>({});
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());

  // Sync language and sample on initial open
  useEffect(() => {
    if (isOpen) {
      setLang(defaultLanguage);
      if (defaultLanguage === "ja") {
        setInputText(SAMPLE_TEXT_JA);
      } else if (defaultLanguage === "en") {
        setInputText(SAMPLE_TEXT_EN);
      } else {
        setInputText(SAMPLE_TEXT_ES);
      }
      setMeaningOverrides({});
      setDeselectedIds(new Set());
      setNotification(null);
      setIsSuccessState(false);
    }
  }, [isOpen, defaultLanguage]);

  // Helper function to auto-lookup meaning in dictionaries
  const lookupMeaning = (word: string, currentLang: "es" | "ja" | "en"): string | null => {
    const clean = word.trim();
    if (!clean) return null;

    if (currentLang === "ja") {
      // 1. Check quick table
      if (COMMON_JA_DICT[clean]) return COMMON_JA_DICT[clean];
      // 2. Check full DICTIONARY
      const found = DICTIONARY.find((item) => item.kanji === clean || item.kanaStr === clean);
      if (found) return found.meaning;
    } else if (currentLang === "es") {
      const lower = clean.toLowerCase();
      if (COMMON_ES_DICT[lower]) return COMMON_ES_DICT[lower];
      const found = BASE_SPANISH_WORDS.find((item) => item.word.toLowerCase() === lower);
      if (found) return found.meaning;
    } else {
      const lower = clean.toLowerCase();
      if (COMMON_EN_DICT[lower]) return COMMON_EN_DICT[lower];
    }
    return null;
  };

  // Smart Parser
  const parsedItems = useMemo<ParsedItem[]>(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const results: ParsedItem[] = [];

    lines.forEach((line, index) => {
      // 1. Strip leading numbering like "12. ", "13、", "(14)", "15) ", "- ", "* "
      const cleanLine = line.replace(/^\s*(?:\d+[\.、\)\s]+|\(\d+\)\s*|\[\d+\]\s*|[-*•]\s*)/, "").trim();
      if (!cleanLine) return;

      let part1 = "";
      let part2 = "";
      let hasExplicitDelimiter = false;

      // 2. Check for parentheses enclosing translation: "target (meaning)" or "target（meaning）"
      const parenMatch = cleanLine.match(/^(.+?)\s*[（\(]([^）\)]+)[）\)]\s*$/);
      if (parenMatch) {
        part1 = parenMatch[1].trim();
        part2 = parenMatch[2].trim();
        hasExplicitDelimiter = true;
      }
      // 3. Check for Tab
      else if (cleanLine.includes("\t")) {
        const parts = cleanLine.split("\t").map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
        hasExplicitDelimiter = true;
      }
      // 4. Check for two or more spaces
      else if (/\s{2,}/.test(cleanLine)) {
        const parts = cleanLine.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
        hasExplicitDelimiter = true;
      }
      // 5. Explicit divider symbols: ——, —, --, |, //, /
      else if (/\s*(?:——|—|--|\||\/\/)\s*/.test(cleanLine)) {
        const parts = cleanLine.split(/\s*(?:——|—|--|\||\/\/)\s*/).map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
        hasExplicitDelimiter = true;
      }
      // 6. Colon divider
      else if (cleanLine.includes("：") || cleanLine.includes(" : ") || /^[^\s:]+:\s*.+/.test(cleanLine)) {
        const parts = cleanLine.split(/\s*[:：]\s*/).map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
        hasExplicitDelimiter = true;
      }
      // 7. Dash divider
      else if (/\s+-\s+/.test(cleanLine) || /^[^\s-]+ - .*/.test(cleanLine)) {
        const parts = cleanLine.split(/\s+-\s+/).map((p) => p.trim()).filter(Boolean);
        part1 = parts[0] || "";
        part2 = parts.slice(1).join(" ") || "";
        hasExplicitDelimiter = true;
      }
      // 8. Script boundary matching with single space or comma:
      // Japanese kana / latin + Chinese hanzi, or Chinese hanzi + Japanese kana / latin
      else {
        // Japanese Kana: [\u3040-\u309f\u30a0-\u30ff]
        // Chinese Hanzi: [\u4e00-\u9fa5]
        const jaFollowedByZh = cleanLine.match(/^([\u3040-\u309f\u30a0-\u30ff\sA-Za-z0-9\.\!\?¿¡~-]+?)[,\s，、]+([\u4e00-\u9fa5].+)$/);
        const zhFollowedByJa = cleanLine.match(/^([\u4e00-\u9fa5\s，。？！、（）]+?)[,\s，、]+([\u3040-\u309f\u30a0-\u30ff].+)$/);
        const latinFollowedByZh = cleanLine.match(/^([A-Za-z¿¡áéíóúÁÉÍÓÚñÑüÜ0-9\s,.\?!'’¿¡-]+?)[,\s，、]+([\u4e00-\u9fa5].+)$/);
        const zhFollowedByLatin = cleanLine.match(/^([\u4e00-\u9fa5\s，。？！、（）]+?)[,\s，、]+([A-Za-z¿¡áéíóúÁÉÍÓÚñÑüÜ0-9].+)$/);

        if (jaFollowedByZh) {
          part1 = jaFollowedByZh[1].trim();
          part2 = jaFollowedByZh[2].trim();
          hasExplicitDelimiter = true;
        } else if (zhFollowedByJa) {
          part1 = zhFollowedByJa[1].trim();
          part2 = zhFollowedByJa[2].trim();
          hasExplicitDelimiter = true;
        } else if (latinFollowedByZh) {
          part1 = latinFollowedByZh[1].trim();
          part2 = latinFollowedByZh[2].trim();
          hasExplicitDelimiter = true;
        } else if (zhFollowedByLatin) {
          part1 = zhFollowedByLatin[1].trim();
          part2 = zhFollowedByLatin[2].trim();
          hasExplicitDelimiter = true;
        } else if (cleanLine.includes(" - ")) {
          const parts = cleanLine.split(" - ").map((p) => p.trim()).filter(Boolean);
          part1 = parts[0] || "";
          part2 = parts.slice(1).join(" ") || "";
          hasExplicitDelimiter = true;
        } else if (cleanLine.includes("/") && !cleanLine.includes("://")) {
          const parts = cleanLine.split("/").map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            part1 = parts[0] || "";
            part2 = parts.slice(1).join(" ") || "";
            hasExplicitDelimiter = true;
          } else {
            part1 = cleanLine;
            part2 = "";
          }
        } else {
          // No delimiter found: single column word/phrase!
          part1 = cleanLine;
          part2 = "";
          hasExplicitDelimiter = false;
        }
      }

      // 9. Smart orientation: determine target sentence vs Chinese meaning
      let target = "";
      let rawMeaning = "";

      const hasChinese = (s: string) => /[\u4e00-\u9fa5]/.test(s);
      const hasSpanishChars = (s: string) => /[¿¡áéíóúÁÉÍÓÚñÑüÜ]|[a-zA-Z]/.test(s);

      if (part2.length > 0) {
        if (hasChinese(part1) && !hasChinese(part2)) {
          rawMeaning = part1;
          target = part2;
        } else if (hasChinese(part2) && !hasChinese(part1)) {
          target = part1;
          rawMeaning = part2;
        } else if (lang === "es" || lang === "en") {
          if (hasSpanishChars(part2) && !hasChinese(part2)) {
            target = part2;
            rawMeaning = part1;
          } else {
            target = part1;
            rawMeaning = part2;
          }
        } else {
          target = part1;
          rawMeaning = part2;
        }
      } else {
        // Single column input: e.g. "ありがとうございます"
        target = part1.trim();
        rawMeaning = "";
      }

      // 10. Auto-lookup meaning if empty
      let isAutoMatched = false;
      let finalMeaning = rawMeaning;

      if (!finalMeaning && target) {
        const matched = lookupMeaning(target, lang);
        if (matched) {
          finalMeaning = matched;
          isAutoMatched = true;
        } else {
          finalMeaning = "（待补充释义）";
        }
      }

      const itemId = `parsed-${index}-${target}`;
      const isSingleColumn = !hasExplicitDelimiter && !rawMeaning;

      results.push({
        id: itemId,
        originalText: line,
        target,
        meaning: finalMeaning,
        isAutoMatched,
        isSingleColumn,
        selected: Boolean(target),
        error: !target ? "未检测到有效词句" : undefined,
      });
    });

    return results;
  }, [inputText, lang]);

  const handleUpdateMeaning = (itemId: string, newMeaning: string) => {
    setMeaningOverrides((prev) => ({
      ...prev,
      [itemId]: newMeaning,
    }));
  };

  const handleToggleSelect = (itemId: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Get active items taking overrides into account
  const activeItems = useMemo(() => {
    return parsedItems
      .filter((item) => item.target && !deselectedIds.has(item.id))
      .map((item) => ({
        ...item,
        meaning: meaningOverrides[item.id] !== undefined ? meaningOverrides[item.id] : item.meaning,
      }));
  }, [parsedItems, deselectedIds, meaningOverrides]);

  const validCount = activeItems.length;

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
    if (activeItems.length === 0) {
      setNotification({ type: "error", message: "没有选中有效的数据条目进行导入！" });
      return;
    }

    if (lang === "es") {
      const newWords: SpanishWord[] = activeItems.map((item, idx) => {
        const cleanTarget = item.target.trim();
        const cleanMeaning = (item.meaning || "（待补充释义）").trim();
        return {
          id: `custom-es-batch-${Date.now()}-${idx}`,
          word: cleanTarget,
          meaning: cleanMeaning,
          partOfSpeech: cleanTarget.includes(" ") ? "oración" : "frase",
          category: esCategory,
          categoryName: esCategory === "travel" ? "旅行实用短句" : "自定义词库",
          level: "A1",
          isCustom: true,
          exampleEs: cleanTarget,
          exampleZh: cleanMeaning,
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
        const cleanTarget = item.target.trim();
        const cleanMeaning = (item.meaning || "（待补充释义）").trim();
        const segments = splitAlphabeticIntoSegments(cleanTarget);
        return {
          id: `custom-en-batch-${Date.now()}-${idx}`,
          kanji: cleanTarget,
          kanaStr: cleanTarget,
          meaning: cleanMeaning,
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
        const cleanMeaning = (item.meaning || "（待补充释义）").trim();
        const segments = splitKanaIntoSyllables(cleanKana);
        return {
          id: `custom-ja-batch-${Date.now()}-${idx}`,
          kanji: cleanKana,
          kanaStr: cleanKana,
          meaning: cleanMeaning,
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

  const handleSwitchLanguage = (newLang: "es" | "ja" | "en") => {
    setLang(newLang);
    setMeaningOverrides({});
    setDeselectedIds(new Set());
    if (newLang === "ja") {
      setInputText(SAMPLE_TEXT_JA);
    } else if (newLang === "en") {
      setInputText(SAMPLE_TEXT_EN);
    } else {
      setInputText(SAMPLE_TEXT_ES);
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
                  <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    全格式智能解析
                  </span>
                </h3>
                <p className="text-[11px] text-stone-500 font-mono tracking-tight">
                  SMART BATCH IMPORT: TAB/SPACE/SINGLE-WORD & AUTO-DICTIONARY TRANSLATION
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
                <span>智能批量解析现已全面支持多种输入格式：</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-[12px] text-amber-900/90 pl-1">
                <li>
                  <strong className="text-amber-950">✨ 单列外语词句（无需释义即可直接导入）：</strong>
                  例如直接粘贴 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">ありがとうございます</code> 或生词列表，系统会自动匹配常用词典释义或设为待补充，支持在下方预览列表中随时双击修改！
                </li>
                <li>
                  <strong>制表符 (Tab) 分隔（常见于 Excel/Word 复制）：</strong>
                  <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono ml-1">ありがとうございます[Tab]非常感谢</code>
                </li>
                <li>
                  <strong>空格、破折号或冒号分隔：</strong>
                  <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono ml-1">ありがとうございます 谢谢</code> 或 <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono ml-1">Hola - 你好</code>
                </li>
                <li>
                  <strong>括号格式：</strong>
                  <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono ml-1">ありがとうございます（非常感谢）</code>
                </li>
                <li>
                  <strong>带序号前缀（自动智能过滤）：</strong>
                  <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono ml-1">1. おはようございます 早上好</code> 会自动剥离 "1." 序号。
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
                onClick={() => handleSwitchLanguage("es")}
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
                onClick={() => handleSwitchLanguage("ja")}
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
                onClick={() => handleSwitchLanguage("en")}
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

            {/* Preset Loaders */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className="text-xs text-stone-600 hover:text-stone-900 bg-stone-200/70 hover:bg-stone-200 px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHelper ? "收起格式说明" : "查看格式说明"}</span>
              </button>
            </div>
          </div>

          {/* Standard Format Selector Card */}
          <div className="bg-stone-100/90 border border-stone-250 rounded-xl p-3 text-xs space-y-2 shrink-0 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>标准格式指引（支持直接套用）：</span>
              </div>
              <div className="flex items-center gap-1 bg-stone-200/60 p-0.5 rounded-lg">
                {(["tab", "dash", "single"] as const).map((type) => {
                  const item = STANDARD_TEMPLATES[type];
                  const isActive = activeTemplateType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveTemplateType(type)}
                      className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? "bg-white text-stone-900 shadow-2xs font-black"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <span>{item.shortName}</span>
                      <span className={`text-[10px] px-1 py-0.2 rounded border font-sans ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Template Explanation & Pattern */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white/95 p-2.5 rounded-lg border border-stone-200/80">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-xs">
                    标准规则：{STANDARD_TEMPLATES[activeTemplateType].pattern}
                  </span>
                </div>
                <p className="text-stone-500 text-[11px] leading-relaxed pt-0.5">
                  💡 {STANDARD_TEMPLATES[activeTemplateType].tip}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const sample = STANDARD_TEMPLATES[activeTemplateType].example[lang];
                    setInputText(sample);
                    setMeaningOverrides({});
                    setDeselectedIds(new Set());
                    setNotification({
                      type: "success",
                      message: `已填入【${STANDARD_TEMPLATES[activeTemplateType].name}】标准示例，您可直接替换！`,
                    });
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-md shadow-2xs transition-colors flex items-center gap-1 cursor-pointer text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>填入此标准模板</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sample = STANDARD_TEMPLATES[activeTemplateType].example[lang];
                    navigator.clipboard.writeText(sample);
                    setCopiedFormat(activeTemplateType);
                    setTimeout(() => setCopiedFormat(null), 1800);
                  }}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-bold rounded-md border border-stone-250 transition-colors flex items-center gap-1 cursor-pointer text-xs"
                  title="复制示例到剪贴板"
                >
                  {copiedFormat === activeTemplateType ? (
                    <>
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>复制示例</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Textarea Area */}
          <div className="shrink-0 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-stone-700">
              <label htmlFor="batch-paste-textarea" className="flex items-center gap-1.5">
                <span>待导入文本框（每行一条）：</span>
              </label>
              <div className="flex items-center gap-3">
                {inputText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText("");
                      setMeaningOverrides({});
                      setDeselectedIds(new Set());
                    }}
                    className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors font-normal cursor-pointer"
                  >
                    清空重填
                  </button>
                )}
                <span className="text-stone-400 font-mono text-[11px]">
                  共检测到 {parsedItems.length} 行
                </span>
              </div>
            </div>
            <textarea
              id="batch-paste-textarea"
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                lang === "ja"
                  ? "支持单列直接粘贴（如：ありがとうございます）\n或者：\nありがとうございます\t非常感谢\nおはようございます 早上好\n乾杯 (干杯)"
                  : "支持单列或双列粘贴，例如：\nHola\t你好\nBuenos días 早上好\n¿Dónde está el baño?"
              }
              className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs sm:text-sm font-mono text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden leading-relaxed shadow-inner resize-y"
            />
          </div>

          {/* Real-time Parsed Preview Table */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-[160px] border border-stone-250 rounded-xl bg-white shadow-xs">
            <div className="bg-stone-100/90 px-3.5 py-2 border-b border-stone-250 flex items-center justify-between text-xs font-bold text-stone-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>实时解析结果预览 ({validCount}/{parsedItems.length} 有效)</span>
              </div>
              <span className="text-[11px] text-stone-400 font-normal">
                可直接点击修改释义 • 点击 🔊 试听发音
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-150 text-xs">
              {parsedItems.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-stone-400 space-y-1">
                  <p>请在上方文本框中粘贴需要导入的短句或单词</p>
                  <p className="text-[11px] text-stone-400">（单列生词也可直接导入，系统自动识别并补全释义）</p>
                </div>
              ) : (
                parsedItems.map((item, idx) => {
                  const isDeselected = deselectedIds.has(item.id);
                  const currentMeaning = meaningOverrides[item.id] !== undefined ? meaningOverrides[item.id] : item.meaning;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 sm:p-3 flex items-center gap-3 transition-colors ${
                        isDeselected
                          ? "bg-stone-100/70 opacity-60"
                          : !item.target
                          ? "bg-red-50/40 text-stone-400"
                          : "hover:bg-amber-50/30"
                      }`}
                    >
                      {/* Checkbox toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          !isDeselected && item.target
                            ? "bg-amber-500 border-amber-600 text-stone-950"
                            : "border-stone-300 bg-white"
                        }`}
                        title={isDeselected ? "勾选导入此条" : "取消导入此条"}
                      >
                        {!isDeselected && item.target && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Index */}
                      <span className="w-5 text-center font-mono font-bold text-stone-400 shrink-0">
                        {idx + 1}
                      </span>

                      {/* Target Foreign Sentence & Inline Editable Meaning */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="font-bold text-stone-900 font-serif text-sm tracking-wide truncate flex items-center gap-2">
                          <span>{item.target || <span className="text-red-500 font-normal italic">未匹配到短句</span>}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-stone-400 shrink-0">释义:</span>
                          <input
                            type="text"
                            value={currentMeaning}
                            onChange={(e) => handleUpdateMeaning(item.id, e.target.value)}
                            placeholder="点击输入或修改中文释义..."
                            className="flex-1 min-w-0 bg-transparent hover:bg-stone-100/80 focus:bg-white border border-transparent hover:border-stone-200 focus:border-amber-400 rounded px-1.5 py-0.5 text-stone-700 text-[11px] focus:outline-hidden transition-all placeholder:text-stone-400"
                          />
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
                        {!item.target ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3" />
                            空行
                          </span>
                        ) : item.isAutoMatched ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            智能匹配释义
                          </span>
                        ) : item.isSingleColumn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-800 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3 text-blue-600" />
                            单列已就绪
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" />
                            已就绪
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
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

