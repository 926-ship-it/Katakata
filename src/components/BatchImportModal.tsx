import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
  Check,
  HelpCircle,
  Edit3,
  BookOpen,
  Copy,
  CheckCheck,
  ClipboardPaste,
  Trash2,
  ArrowRight,
  RotateCcw,
  CheckSquare,
  Square,
  Filter,
  GraduationCap
} from "lucide-react";
import { audioSynth } from "../utils/audio";
import { SpanishWord, saveBatchCustomSpanishWords, SPANISH_CATEGORIES, BASE_SPANISH_WORDS } from "../data/spanishData";
import { DICTIONARY, DictionaryItem } from "../data/dictionary";
import { splitKanaIntoSyllables, splitAlphabeticIntoSegments, saveBatchStoredCustomWords } from "../utils/kanaHelper";

export interface ParsedItem {
  id: string;
  originalText: string;
  target: string;       // Foreign word or sentence (e.g. ¿Dónde puedo cambiar dinero? / ありがとうございます / 乾杯)
  reading?: string;     // Phonetic/kana reading (e.g. かんぱい / /ˈɡɾasjas/)
  meaning: string;      // Chinese translation (e.g. 请问哪里有兑换货币的服务台？ / 非常感谢 / 干杯)
  isAutoMatched?: boolean;
  isSingleColumn?: boolean;
  hasReading?: boolean;
  selected: boolean;
  error?: string;
}

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: "es" | "ja" | "en";
  onImportComplete?: (count: number, lang: "es" | "ja" | "en") => void;
  onNavigateToRecite?: (lang: "es" | "ja" | "en") => void;
  onNavigateToLibrary?: () => void;
}

// Common Japanese dictionary with both reading (kana) and meaning (Chinese)
const COMMON_JA_DICT: Record<string, { meaning: string; reading?: string }> = {
  "ありがとうございます": { meaning: "非常感谢 / 谢谢", reading: "ありがとうございます" },
  "どうもありがとうございます": { meaning: "非常感谢", reading: "どうもありがとうございます" },
  "どうもありがとう": { meaning: "多谢", reading: "どうもありがとう" },
  "ありがとう": { meaning: "谢谢", reading: "ありがとう" },
  "おはようございます": { meaning: "早上好", reading: "おはようございます" },
  "おはよう": { meaning: "早安", reading: "おはよう" },
  "こんにちは": { meaning: "你好（白天问候）", reading: "こんにちは" },
  "こんばんは": { meaning: "晚上好", reading: "こんばんは" },
  "おやすみなさい": { meaning: "晚安", reading: "おやすみなさい" },
  "おやすみ": { meaning: "晚安", reading: "おやすみ" },
  "さようなら": { meaning: "再见", reading: "さようなら" },
  "さよなら": { meaning: "再见", reading: "さよなら" },
  "またね": { meaning: "回头见 / 下次见", reading: "またね" },
  "じゃあね": { meaning: "拜拜 / 再见", reading: "じゃあね" },
  "すみません": { meaning: "不好意思 / 对不起 / 劳驾", reading: "すみません" },
  "すいません": { meaning: "不好意思 / 对不起", reading: "すいません" },
  "ごめんなさい": { meaning: "对不起", reading: "ごめんなさい" },
  "失礼します": { meaning: "打扰了 / 失礼了", reading: "しつれいします" },
  "しつれいします": { meaning: "打扰了 / 失礼了", reading: "しつれいします" },
  "いただきます": { meaning: "我开动了", reading: "いただきます" },
  "ごちそうさ免费": { meaning: "多谢款待", reading: "ごちそうさまでした" },
  "ごちそうさまでした": { meaning: "多谢款待", reading: "ごちそうさ免费でした" },
  "よろしくおねがいします": { meaning: "请多关照", reading: "よろしくおねがいします" },
  "よろしくお願いします": { meaning: "请多关照", reading: "よろしくおねがいします" },
  "お疲れ様でした": { meaning: "辛苦了", reading: "おつかれさまでした" },
  "おつかれさまでした": { meaning: "辛苦了", reading: "おつかれさまでした" },
  "はじめまして": { meaning: "初次见面", reading: "はじめまして" },
  "初めまして": { meaning: "初次见面", reading: "はじめまして" },
  "乾杯": { meaning: "干杯", reading: "かんぱい" },
  "かんぱい": { meaning: "干杯", reading: "かんぱい" },
  "大丈夫": { meaning: "没关系 / 不要紧", reading: "だいじょうぶ" },
  "だいじょうぶ": { meaning: "没关系 / 不要紧", reading: "だいじょうぶ" },
  "はい": { meaning: "是的 / 好的", reading: "はい" },
  "いいえ": { meaning: "不 / 不是", reading: "いいえ" },
  "わかりました": { meaning: "明白了 / 知道了", reading: "わかりました" },
  "分かりました": { meaning: "明白了 / 知道了", reading: "わかりました" },
  "いってきます": { meaning: "我出门了", reading: "いってきます" },
  "いってらっしゃい": { meaning: "路上小心 / 慢走", reading: "いってらっしゃい" },
  "ただいま": { meaning: "我回来了", reading: "ただいま" },
  "おかえりなさい": { meaning: "欢迎回来", reading: "おかえりなさい" },
  "おいしい": { meaning: "好吃 / 美味", reading: "おいしい" },
  "美味しい": { meaning: "好吃 / 美味", reading: "おいしい" },
  "すごい": { meaning: "好厉害 / 了不起", reading: "すごい" },
  "すごいですね": { meaning: "太厉害了呢", reading: "すごいですね" },
  "かわいい": { meaning: "可爱", reading: "かわいい" },
  "可愛い": { meaning: "可爱", reading: "かわいい" },
  "好き": { meaning: "喜欢", reading: "すき" },
  "すき": { meaning: "喜欢", reading: "すき" },
  "愛してる": { meaning: "我爱你", reading: "あいしてる" },
  "あいしてる": { meaning: "我爱你", reading: "あいしてる" },
  "頑張って": { meaning: "加油", reading: "がんばって" },
  "がんばって": { meaning: "加油", reading: "がんばって" },
  "おめでとう": { meaning: "祝贺 / 恭喜", reading: "おめでとう" },
  "おめでとうございます": { meaning: "恭喜 / 祝贺", reading: "おめでとうございます" },
  "元気ですか": { meaning: "身体好吗 / 最近好吗", reading: "げんきですか" },
  "げんきですか": { meaning: "身体好吗 / 最近好吗", reading: "げんきですか" },
  "学生": { meaning: "学生", reading: "がくせい" },
  "先生": { meaning: "老师 / 医生", reading: "せんせい" },
  "友達": { meaning: "朋友", reading: "ともだち" },
  "桜": { meaning: "樱花", reading: "さくら" },
  "富士山": { meaning: "富士山", reading: "ふじさん" },
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
  "welcome": "欢迎",
  "congratulations": "祝贺 / 恭喜",
  "cheers": "干杯",
  "delicious": "美味的",
  "beautiful": "美丽的",
  "knowledge": "知识",
};

const SAMPLE_TEXT_ES = `¿Dónde puedo cambiar dinero?\t请问哪里有兑换货币的服务台？
¿Cuánto cuesta un billete para el metro?\t请问一张地铁票多少钱？
La cuenta, por favor.\t服务员，请结账。
¿Tiene una mesa para dos personas?\t请问有两个人坐的空位吗？
Mucho gusto en conocerle.\t非常荣幸认识您。
¡Que tenga un buen viaje!\t祝您旅途愉快！`;

const SAMPLE_TEXT_JA = `ありがとうございます\t非常感谢
おはようございます\t早上好
こんにちは\t你好
お疲れ様でした\t辛苦了
乾杯\tかんぱい\t干杯
友達\tともだち\t朋友
いただきます\t我开动了
失礼します\t打扰了`;

const SAMPLE_TEXT_EN = `Where is the nearest subway station?\t请问最近的地铁站在哪里？
Could you please help me with this?\t能麻烦您帮我看一下这个吗？
How much does this cup of coffee cost?\t请问这杯咖啡多少钱？
I would like to make a reservation.\t我想预订一个位置。
Nice to meet you.\t很高兴认识你。
Have a wonderful day!\t祝你有美好的一天！`;

export const STANDARD_TEMPLATES = {
  tab: {
    id: "tab" as const,
    name: "双列 Tab 制表符（Excel/表格复制）",
    shortName: "双列 Tab",
    badge: "最推荐",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    pattern: "外语原词 [Tab] 中文释义",
    tip: "Excel / WPS / 飞书表格中：A列外语、B列中文，框选复制即为此格式！",
    example: {
      ja: `ありがとうございます\t非常感谢\nおはようございます\t早上好\nこんにちは\t你好\nすみません\t不好意思 / 对不起\nいただきます\t我开动了`,
      es: `¡Hola!\t你好\nBuenos días\t早上好\nMuchas gracias\t非常感谢\n¿Dónde está el baño?\t请问洗手间在哪里？\nHasta luego\t回头见`,
      en: `Thank you very much\t非常感谢\nGood morning\t早上好\nExcuse me\t打扰一下\nNice to meet you\t很高兴认识你\nHave a nice day\t祝你有美好的一天`,
    },
  },
  three: {
    id: "three" as const,
    name: "三列进阶（原词 + 读音/假名 + 释义）",
    shortName: "三列含读音",
    badge: "含发音",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    pattern: "外语原词 [Tab] 读音/假名/音标 [Tab] 中文释义",
    tip: "适合带注音的精细词汇表（如：日文汉字+假名读音、英文+音标）",
    example: {
      ja: `乾杯\tかんぱい\t干杯\n友達\tともだち\t朋友\n学生\tがくせい\t学生\n元気\tげんき\t健康 / 精神\n可愛い\tかわいい\t可爱`,
      es: `gracias\t/ˈɡɾasjas/\t谢谢\nbuenos días\t/ˈbwenoz ˈði.as/\t早上好\npor favor\t/poɾ faˈβoɾ/\t请\namigo\t/aˈmiɣo/\t朋友`,
      en: `delicious\t/dɪˈlɪʃ.əs/\t美味的\nbeautiful\t/ˈbjuː.tɪ.fəl/\t美丽的\nwelcome\t/ˈwel.kəm/\t欢迎\nknowledge\t/ˈnɒl.ɪdʒ/\t知识`,
    },
  },
  dash: {
    id: "dash" as const,
    name: "破折号/空格（记事本/聊天记录）",
    shortName: "破折号 -",
    badge: "手工速记",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    pattern: "外语 - 中文释义  或  外语(注音) 中文释义",
    tip: "使用连字符、空格或括号分隔外语与中文，如记事本、微信聊天记录复制",
    example: {
      ja: `ありがとうございます - 非常感谢\nおはようございます - 早上好\nこんにちは - 你好\n乾杯（かんぱい） 干杯\n友達(ともだち) 朋友`,
      es: `¡Hola! - 你好\nBuenos días - 早上好\nMuchas gracias - 非常感谢\n¿Cómo estás? - 你好吗？`,
      en: `Thank you very much - 非常感谢\nGood morning - 早上好\nNice to meet you - 很高兴认识你\nHave a good day - 祝你开心`,
    },
  },
  single: {
    id: "single" as const,
    name: "纯词单列（无需中文，智能自动匹配）",
    shortName: "纯词单列",
    badge: "免输释义",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    pattern: "外语单词或短句（一行一条）",
    tip: "仅需粘贴外语单词，系统自带高频释义库智能匹配，支持在下方预览直接修改",
    example: {
      ja: `ありがとうございます\nおはようございます\nこんにちは\nすみません\nいただきます\n乾杯\n友達`,
      es: `¡Hola!\nBuenos días\nMuchas gracias\nPor favor\nDe nada\nBienvenido`,
      en: `Thank you\nGood morning\nExcuse me\nWelcome\nCongratulations\nKnowledge`,
    },
  },
};

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  defaultLanguage = "es",
  onImportComplete,
  onNavigateToRecite,
  onNavigateToLibrary,
}) => {
  const [lang, setLang] = useState<"es" | "ja" | "en">(defaultLanguage);
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT_ES);
  const [esCategory, setEsCategory] = useState<SpanishWord["category"]>("travel");
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [showHelper, setShowHelper] = useState(true);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [activeTemplateType, setActiveTemplateType] = useState<"tab" | "three" | "dash" | "single">("tab");
  const [meaningOverrides, setMeaningOverrides] = useState<Record<string, string>>({});
  const [readingOverrides, setReadingOverrides] = useState<Record<string, string>>({});
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
      setReadingOverrides({});
      setDeselectedIds(new Set());
      setNotification(null);
      setIsSuccessState(false);
      setSuccessCount(0);
    }
  }, [isOpen, defaultLanguage]);

  // Helper function to auto-lookup meaning and reading in dictionaries
  const lookupDict = (word: string, currentLang: "es" | "ja" | "en"): { meaning: string | null; reading?: string } => {
    const clean = word.trim();
    if (!clean) return { meaning: null };

    if (currentLang === "ja") {
      // 1. Check quick table
      if (COMMON_JA_DICT[clean]) {
        return { meaning: COMMON_JA_DICT[clean].meaning, reading: COMMON_JA_DICT[clean].reading };
      }
      // 2. Check full DICTIONARY
      const found = DICTIONARY.find((item) => item.kanji === clean || item.kanaStr === clean);
      if (found) {
        return { meaning: found.meaning, reading: found.kanaStr };
      }
      // If all kana, the reading is itself
      if (/^[\u3040-\u309f\u30a0-\u30ff\sー]+$/.test(clean)) {
        return { meaning: null, reading: clean };
      }
    } else if (currentLang === "es") {
      const lower = clean.toLowerCase();
      if (COMMON_ES_DICT[lower]) return { meaning: COMMON_ES_DICT[lower] };
      const found = BASE_SPANISH_WORDS.find((item) => item.word.toLowerCase() === lower);
      if (found) return { meaning: found.meaning };
    } else {
      const lower = clean.toLowerCase();
      if (COMMON_EN_DICT[lower]) return { meaning: COMMON_EN_DICT[lower] };
    }
    return { meaning: null };
  };

  // Smart Parser supporting 1-column, 2-column, 3-column, and parenthesized pronunciation
  const parsedItems = useMemo<ParsedItem[]>(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    const results: ParsedItem[] = [];

    lines.forEach((line, index) => {
      // 1. Strip leading numbering like "12. ", "13、", "(14)", "15) ", "- ", "* "
      const cleanLine = line.replace(/^\s*(?:\d+[\.、\)\s]+|\(\d+\)\s*|\[\d+\]\s*|[-*•]\s*)/, "").trim();
      if (!cleanLine) return;

      let target = "";
      let reading: string | undefined = undefined;
      let rawMeaning = "";
      let hasExplicitDelimiter = false;
      let hasReading = false;

      // Check for parentheses enclosing reading or meaning:
      // Pattern A: "word（reading） meaning" (e.g. 乾杯（かんぱい） 干杯)
      const parenThreeMatch = cleanLine.match(/^([^\(（]+?)\s*[（\(]([^）\)]+)[）\)]\s*[\t\s—\-—:：、,]+(.+)$/);
      // Pattern B: "word（meaning）" (e.g. ありがとうございます（非常感谢）)
      const parenTwoMatch = cleanLine.match(/^([^\(（]+?)\s*[（\(]([^）\)]+)[）\)]\s*$/);

      if (parenThreeMatch) {
        target = parenThreeMatch[1].trim();
        reading = parenThreeMatch[2].trim();
        rawMeaning = parenThreeMatch[3].trim();
        hasExplicitDelimiter = true;
        hasReading = true;
      } else if (parenTwoMatch) {
        const p1 = parenTwoMatch[1].trim();
        const p2 = parenTwoMatch[2].trim();
        const p2HasChinese = /[\u4e00-\u9fa5]/.test(p2);
        const p1HasKana = /[\u3040-\u309f\u30a0-\u30ff]/.test(p1);
        const p2HasKana = /[\u3040-\u309f\u30a0-\u30ff]/.test(p2);

        if (p2HasChinese) {
          target = p1;
          rawMeaning = p2;
        } else if (p2HasKana && !p1HasKana) {
          // Kanji + Kana reading: e.g. 乾杯（かんぱい）
          target = p1;
          reading = p2;
          hasReading = true;
          rawMeaning = "";
        } else {
          target = p1;
          rawMeaning = p2;
        }
        hasExplicitDelimiter = true;
      } else if (cleanLine.includes("\t")) {
        // Tab-delimited (Check if 3-column or 2-column)
        const parts = cleanLine.split("\t").map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
          target = parts[0] || "";
          reading = parts[1] || "";
          rawMeaning = parts.slice(2).join(" ") || "";
          hasReading = true;
          hasExplicitDelimiter = true;
        } else if (parts.length === 2) {
          target = parts[0] || "";
          rawMeaning = parts[1] || "";
          hasExplicitDelimiter = true;
        }
      } else if (/\s{2,}/.test(cleanLine)) {
        // Two or more spaces delimiter
        const parts = cleanLine.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
          target = parts[0] || "";
          reading = parts[1] || "";
          rawMeaning = parts.slice(2).join(" ") || "";
          hasReading = true;
          hasExplicitDelimiter = true;
        } else if (parts.length === 2) {
          target = parts[0] || "";
          rawMeaning = parts[1] || "";
          hasExplicitDelimiter = true;
        }
      } else if (/\s*(?:——|—|--|\||\/\/)\s*/.test(cleanLine)) {
        const parts = cleanLine.split(/\s*(?:——|—|--|\||\/\/)\s*/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
          target = parts[0] || "";
          reading = parts[1] || "";
          rawMeaning = parts.slice(2).join(" ") || "";
          hasReading = true;
          hasExplicitDelimiter = true;
        } else {
          target = parts[0] || "";
          rawMeaning = parts.slice(1).join(" ") || "";
          hasExplicitDelimiter = true;
        }
      } else if (cleanLine.includes("：") || cleanLine.includes(" : ") || /^[^\s:]+:\s*.+/.test(cleanLine)) {
        const parts = cleanLine.split(/\s*[:：]\s*/).map((p) => p.trim()).filter(Boolean);
        target = parts[0] || "";
        rawMeaning = parts.slice(1).join(" ") || "";
        hasExplicitDelimiter = true;
      } else if (/\s+-\s+/.test(cleanLine) || /^[^\s-]+ - .*/.test(cleanLine)) {
        const parts = cleanLine.split(/\s+-\s+/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
          target = parts[0] || "";
          reading = parts[1] || "";
          rawMeaning = parts.slice(2).join(" ") || "";
          hasReading = true;
          hasExplicitDelimiter = true;
        } else {
          target = parts[0] || "";
          rawMeaning = parts.slice(1).join(" ") || "";
          hasExplicitDelimiter = true;
        }
      } else {
        // Script boundary detection
        const jaFollowedByZh = cleanLine.match(/^([\u3040-\u309f\u30a0-\u30ff\sA-Za-z0-9\.\!\?¿¡~-]+?)[,\s，、]+([\u4e00-\u9fa5].+)$/);
        const zhFollowedByJa = cleanLine.match(/^([\u4e00-\u9fa5\s，。？！、（）]+?)[,\s，、]+([\u3040-\u309f\u30a0-\u30ff].+)$/);
        const latinFollowedByZh = cleanLine.match(/^([A-Za-z¿¡áéíóúÁÉÍÓÚñÑüÜ0-9\s,.\?!'’¿¡-]+?)[,\s，、]+([\u4e00-\u9fa5].+)$/);
        const zhFollowedByLatin = cleanLine.match(/^([\u4e00-\u9fa5\s，。？！、（）]+?)[,\s，、]+([A-Za-z¿¡áéíóúÁÉÍÓÚñÑüÜ0-9].+)$/);

        if (jaFollowedByZh) {
          target = jaFollowedByZh[1].trim();
          rawMeaning = jaFollowedByZh[2].trim();
          hasExplicitDelimiter = true;
        } else if (zhFollowedByJa) {
          target = zhFollowedByJa[2].trim();
          rawMeaning = zhFollowedByJa[1].trim();
          hasExplicitDelimiter = true;
        } else if (latinFollowedByZh) {
          target = latinFollowedByZh[1].trim();
          rawMeaning = latinFollowedByZh[2].trim();
          hasExplicitDelimiter = true;
        } else if (zhFollowedByLatin) {
          target = zhFollowedByLatin[2].trim();
          rawMeaning = zhFollowedByLatin[1].trim();
          hasExplicitDelimiter = true;
        } else if (cleanLine.includes(" - ")) {
          const parts = cleanLine.split(" - ").map((p) => p.trim()).filter(Boolean);
          target = parts[0] || "";
          rawMeaning = parts.slice(1).join(" ") || "";
          hasExplicitDelimiter = true;
        } else if (cleanLine.includes("/") && !cleanLine.includes("://")) {
          const parts = cleanLine.split("/").map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 3) {
            target = parts[0] || "";
            reading = parts[1] || "";
            rawMeaning = parts.slice(2).join(" ") || "";
            hasReading = true;
            hasExplicitDelimiter = true;
          } else if (parts.length === 2) {
            target = parts[0] || "";
            rawMeaning = parts[1] || "";
            hasExplicitDelimiter = true;
          } else {
            target = cleanLine;
            rawMeaning = "";
          }
        } else {
          // Single column input
          target = cleanLine;
          rawMeaning = "";
          hasExplicitDelimiter = false;
        }
      }

      // Orientation check if target and meaning might be swapped
      const hasChinese = (s: string) => /[\u4e00-\u9fa5]/.test(s);
      if (rawMeaning && hasChinese(target) && !hasChinese(rawMeaning)) {
        const tmp = target;
        target = rawMeaning;
        rawMeaning = tmp;
      }

      // Auto-lookup if meaning or reading is missing
      let isAutoMatched = false;
      let finalMeaning = rawMeaning;
      let finalReading = reading;

      if (target) {
        const lookupResult = lookupDict(target, lang);
        if (!finalMeaning) {
          if (lookupResult.meaning) {
            finalMeaning = lookupResult.meaning;
            isAutoMatched = true;
          } else {
            finalMeaning = "（待补充释义）";
          }
        }
        if (!finalReading && lookupResult.reading) {
          finalReading = lookupResult.reading;
          hasReading = true;
        }
        // If Japanese and target is already pure kana, reading is target itself
        if (lang === "ja" && !finalReading && /^[\u3040-\u309f\u30a0-\u30ff\sー]+$/.test(target)) {
          finalReading = target;
        }
      }

      const itemId = `parsed-${index}-${target}`;
      const isSingleColumn = !hasExplicitDelimiter && !rawMeaning;

      results.push({
        id: itemId,
        originalText: line,
        target,
        reading: finalReading,
        meaning: finalMeaning,
        isAutoMatched,
        isSingleColumn,
        hasReading: Boolean(finalReading),
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

  const handleUpdateReading = (itemId: string, newReading: string) => {
    setReadingOverrides((prev) => ({
      ...prev,
      [itemId]: newReading,
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

  const handleSelectAll = () => {
    setDeselectedIds(new Set());
  };

  const handleDeselectAll = () => {
    const allIds = new Set(parsedItems.map((i) => i.id));
    setDeselectedIds(allIds);
  };

  const handleDeduplicate = () => {
    const lines = inputText.split("\n");
    const seen = new Set<string>();
    const uniqueLines: string[] = [];
    let dupeCount = 0;
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed) continue;
      if (seen.has(trimmed)) {
        dupeCount++;
      } else {
        seen.add(trimmed);
        uniqueLines.push(l);
      }
    }
    if (dupeCount > 0) {
      setInputText(uniqueLines.join("\n"));
      setNotification({ type: "success", message: `🧹 已为您清除 ${dupeCount} 条重复记录！` });
    } else {
      setNotification({ type: "info", message: "当前文本中未检测到重复条目。" });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputText((prev) => (prev.trim() ? prev + "\n" + text.trim() : text.trim()));
          setNotification({ type: "success", message: "📋 已成功从剪贴板粘贴文本并自动解析！" });
          return;
        }
      }
    } catch (err) {
      console.warn("Clipboard read error:", err);
    }
    // Fallback: focus textarea
    const el = document.getElementById("batch-paste-textarea");
    if (el) {
      el.focus();
      setNotification({ type: "info", message: "请在输入框内按 Ctrl+V（或手机长按粘贴）即可！" });
    }
  };

  const handleClear = () => {
    setInputText("");
    setMeaningOverrides({});
    setReadingOverrides({});
    setDeselectedIds(new Set());
    setNotification(null);
  };

  // Compute final valid items to import
  const validItems = useMemo(() => {
    return parsedItems.filter((item) => !item.error && !deselectedIds.has(item.id));
  }, [parsedItems, deselectedIds]);

  const validCount = validItems.length;

  const handleSpeak = (textToSpeak: string) => {
    if (!textToSpeak) return;
    if (lang === "ja") {
      audioSynth.speakJapanese(textToSpeak);
    } else if (lang === "es") {
      audioSynth.speakSpanish(textToSpeak);
    } else {
      audioSynth.speakEnglish(textToSpeak);
    }
  };

  const handleExecuteImport = () => {
    const activeItems = parsedItems
      .filter((item) => !item.error && !deselectedIds.has(item.id))
      .map((item) => ({
        ...item,
        meaning: meaningOverrides[item.id] !== undefined ? meaningOverrides[item.id] : item.meaning,
        reading: readingOverrides[item.id] !== undefined ? readingOverrides[item.id] : item.reading,
      }));

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
      setSuccessCount(newWords.length);
      setIsSuccessState(true);

      if (onImportComplete) {
        onImportComplete(newWords.length, "es");
      }
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
      setSuccessCount(newItems.length);
      setIsSuccessState(true);

      if (onImportComplete) {
        onImportComplete(newItems.length, "en");
      }
    } else {
      // Japanese
      const newItems: DictionaryItem[] = activeItems.map((item, idx) => {
        const cleanTarget = item.target.trim();
        const cleanReading = (item.reading || cleanTarget).trim();
        const cleanMeaning = (item.meaning || "（待补充释义）").trim();
        const segments = splitKanaIntoSyllables(cleanReading);
        return {
          id: `custom-ja-batch-${Date.now()}-${idx}`,
          kanji: cleanTarget,
          kanaStr: cleanReading,
          meaning: cleanMeaning,
          category: "custom",
          categoryName: "自定义日语短句",
          rarity: "SR",
          rarityName: "卓越 (SR)",
          glowColor: "rgba(245, 158, 11, 0.25)",
          borderColor: "border-amber-400",
          bgGradient: "from-amber-50 to-orange-100",
          segments: segments.length > 0 ? segments : splitAlphabeticIntoSegments(cleanReading),
        };
      });

      saveBatchStoredCustomWords(newItems);
      audioSynth.playFanfare();
      setSuccessCount(newItems.length);
      setIsSuccessState(true);

      if (onImportComplete) {
        onImportComplete(newItems.length, "ja");
      }
    }
  };

  const handleSwitchLanguage = (newLang: "es" | "ja" | "en") => {
    setLang(newLang);
    setMeaningOverrides({});
    setReadingOverrides({});
    setDeselectedIds(new Set());
    setNotification(null);
    setIsSuccessState(false);
    if (newLang === "ja") {
      setInputText(SAMPLE_TEXT_JA);
    } else if (newLang === "en") {
      setInputText(SAMPLE_TEXT_EN);
    } else {
      setInputText(SAMPLE_TEXT_ES);
    }
  };

  const handleApplyTemplate = (templateKey: "tab" | "three" | "dash" | "single") => {
    setActiveTemplateType(templateKey);
    const template = STANDARD_TEMPLATES[templateKey];
    if (template) {
      setInputText(template.example[lang]);
      setMeaningOverrides({});
      setReadingOverrides({});
      setDeselectedIds(new Set());
      setNotification({
        type: "info",
        message: `已填入「${template.name}」示例数据，您可直接修改或导入！`,
      });
    }
  };

  const handleCopyTemplateExample = (templateKey: "tab" | "three" | "dash" | "single") => {
    const template = STANDARD_TEMPLATES[templateKey];
    if (template) {
      navigator.clipboard.writeText(template.example[lang]);
      setCopiedFormat(templateKey);
      setTimeout(() => setCopiedFormat(null), 2000);
      setNotification({
        type: "success",
        message: `已复制「${template.shortName}」模板格式到剪贴板，可粘贴至 Excel / 记事本中填写！`,
      });
    }
  };

  const handleResetForNextBatch = () => {
    setInputText("");
    setMeaningOverrides({});
    setReadingOverrides({});
    setDeselectedIds(new Set());
    setIsSuccessState(false);
    setSuccessCount(0);
    setNotification(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#fcfbf9] border-2 border-stone-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-stone-800"
        >
          {/* Header Bar */}
          <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif flex items-center gap-2">
                  <span>批量导入生词与短句</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold">
                    BATCH WIZARD
                  </span>
                </h2>
                <p className="text-xs text-stone-400 font-sans">
                  支持 Excel 表格复制、双列/三列制表符、单列纯词及破折号速记
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State Celebration View */}
          {isSuccessState ? (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 overflow-y-auto my-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-lg animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-2 max-w-md">
                <h3 className="text-2xl font-black font-serif text-stone-900">
                  🎉 批量入库成功！
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  共计已为您成功导入 <span className="font-bold text-emerald-700 text-base">{successCount}</span> 条短句至
                  <span className="font-bold text-stone-800">
                    {lang === "es" ? "「西班牙语」" : lang === "ja" ? "「日语」" : "「英语」"}
                  </span>
                  词库。已自动生成专属学习闪卡与打字练习音效！
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
                {onNavigateToRecite && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToRecite(lang);
                      onClose();
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs font-serif flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>🚀 立即开启本批词背诵</span>
                  </button>
                )}

                {onNavigateToLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToLibrary();
                      onClose();
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs font-serif flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>📖 前往图鉴馆查看</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-stone-500 pt-2">
                <button
                  type="button"
                  onClick={handleResetForNextBatch}
                  className="hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>继续录入下一批</span>
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="hover:text-stone-900 cursor-pointer transition-colors"
                >
                  完成并退出
                </button>
              </div>
            </div>
          ) : (
            /* Main Working Area */
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Language Selector + Category Selection */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-100 p-2.5 rounded-xl border border-stone-250">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-600 font-serif mr-1">
                    目标语种:
                  </span>
                  {[
                    { id: "es", label: "🇪🇸 西班牙语" },
                    { id: "ja", label: "🇯🇵 日语" },
                    { id: "en", label: "🇬🇧 英语" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleSwitchLanguage(l.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        lang === l.id
                          ? "bg-amber-800 text-white shadow-sm"
                          : "bg-white text-stone-600 hover:bg-stone-50 border border-stone-200"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {lang === "es" && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-stone-600">归属分类:</span>
                    <select
                      value={esCategory}
                      onChange={(e) => setEsCategory(e.target.value as any)}
                      className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {SPANISH_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Standard Templates Guide Selector */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>选择输入格式与参考模板：</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHelper((prev) => !prev)}
                    className="text-[11px] text-amber-800/80 hover:text-amber-900 font-medium underline cursor-pointer"
                  >
                    {showHelper ? "收起模板指南 ▲" : "展开参考模板 ▼"}
                  </button>
                </div>

                {showHelper && (
                  <div className="space-y-2.5 pt-1">
                    {/* Template Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(Object.keys(STANDARD_TEMPLATES) as Array<keyof typeof STANDARD_TEMPLATES>).map((key) => {
                        const t = STANDARD_TEMPLATES[key];
                        const isCurrent = activeTemplateType === key;
                        return (
                          <div
                            key={key}
                            className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                              isCurrent
                                ? "bg-white border-amber-500 shadow-sm ring-1 ring-amber-400"
                                : "bg-white/70 border-stone-200 hover:bg-white hover:border-amber-300"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono font-bold ${t.badgeColor}`}>
                                  {t.badge}
                                </span>
                                {copiedFormat === key ? (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> 已复制
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyTemplateExample(key)}
                                    title="复制此模板空白格式到剪贴板"
                                    className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs font-bold text-stone-800 leading-tight">
                                {t.shortName}
                              </p>
                              <p className="text-[11px] font-mono text-stone-500 truncate" title={t.pattern}>
                                {t.pattern}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplyTemplate(key)}
                              className={`mt-2 py-1 px-2 rounded text-[11px] font-bold text-center w-full transition-colors cursor-pointer ${
                                isCurrent
                                  ? "bg-amber-600 text-white"
                                  : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                              }`}
                            >
                              {isCurrent ? "当前填入中" : "填入此示例"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-amber-900/80 leading-relaxed">
                      💡 <strong>小贴士：</strong>
                      {STANDARD_TEMPLATES[activeTemplateType]?.tip || "直接在下方文本框中粘贴您的词汇列表即可。"}
                    </p>
                  </div>
                )}
              </div>

              {/* Input Area Header with Quick Toolbar */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="batch-paste-textarea"
                      className="text-xs font-bold text-stone-700 font-serif flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-amber-700" />
                      <span>粘贴文本内容（支持多行输入）：</span>
                    </label>
                    <span className="text-[11px] text-stone-400 font-mono">
                      ({inputText.split("\n").filter((l) => l.trim()).length} 行)
                    </span>
                  </div>

                  {/* Fast Action Tools */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-[11px] font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                      title="从系统剪贴板快速读取并粘贴到输入框"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" />
                      <span>一键粘贴剪贴板</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeduplicate}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-[11px] font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                      title="自动剔除完全相同的重复条目"
                    >
                      <Filter className="w-3.5 h-3.5 text-blue-600" />
                      <span>一键去重</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-500 hover:text-rose-600 hover:border-rose-300 text-[11px] font-medium shadow-xs cursor-pointer transition-all active:scale-95"
                      title="清空输入框"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>清空</span>
                    </button>
                  </div>
                </div>

                <textarea
                  id="batch-paste-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={6}
                  placeholder={`在此粘贴您的词汇列表...\n例如：\n外语单词\\t中文释义\n外语\\t假名或音标\\t中文释义\n或者纯外语短句（每行一句）`}
                  className="w-full bg-white border-2 border-stone-300 rounded-xl p-3 text-xs font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 leading-relaxed shadow-inner"
                />
              </div>

              {/* Parsing Results & Live Preview Section */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-250 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-800 font-serif">
                      实时解析预览表
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono font-bold">
                      {validCount} / {parsedItems.length} 条已就绪
                    </span>
                  </div>

                  {parsedItems.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-stone-600 hover:text-stone-900 font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>全选</span>
                      </button>
                      <span className="text-stone-300">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="text-stone-600 hover:text-stone-900 font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 text-stone-400" />
                        <span>全不选</span>
                      </button>
                    </div>
                  )}
                </div>

                {parsedItems.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs border-2 border-dashed border-stone-200 rounded-xl space-y-1 bg-stone-50/50">
                    <HelpCircle className="w-6 h-6 mx-auto text-stone-300" />
                    <p>暂无可解析内容，请在上方输入或粘贴文本</p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {parsedItems.map((item, idx) => {
                      const isSelected = !deselectedIds.has(item.id);
                      const currentMeaning =
                        meaningOverrides[item.id] !== undefined
                          ? meaningOverrides[item.id]
                          : item.meaning;
                      const currentReading =
                        readingOverrides[item.id] !== undefined
                          ? readingOverrides[item.id]
                          : item.reading;

                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                            item.error
                              ? "bg-rose-50/50 border-rose-200 text-rose-700"
                              : isSelected
                              ? "bg-white border-stone-300 shadow-xs"
                              : "bg-stone-100/70 border-stone-200 opacity-60"
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={Boolean(item.error)}
                            onChange={() => handleToggleSelect(item.id)}
                            className="mt-1 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                          />

                          {/* Index Number */}
                          <span className="mt-0.5 text-[10px] font-mono font-bold text-stone-400 w-5 shrink-0">
                            {idx + 1}.
                          </span>

                          {/* Target Word + Pronunciation + Meaning */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Word / Sentence Header */}
                              <span className="font-bold text-stone-900 text-sm font-serif">
                                {item.target}
                              </span>

                              {/* Kana or Phonetic Reading Badge */}
                              {currentReading && (
                                <span className="text-[11px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono">
                                  {currentReading}
                                </span>
                              )}

                              {/* Speaker Audio Test */}
                              <button
                                type="button"
                                onClick={() => handleSpeak(currentReading || item.target)}
                                className="p-1 rounded text-stone-400 hover:text-amber-700 hover:bg-stone-100 transition-colors cursor-pointer"
                                title="试听发音"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Status Badges */}
                              {item.hasReading && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-medium font-sans">
                                  三列含读音
                                </span>
                              )}
                              {item.isAutoMatched && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium font-sans">
                                  智能已匹配
                                </span>
                              )}
                              {item.isSingleColumn && !item.isAutoMatched && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium font-sans">
                                  单列就绪
                                </span>
                              )}
                            </div>

                            {/* Meaning Inline Editor */}
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span className="text-[11px] text-stone-400 shrink-0">
                                释义:
                              </span>
                              <input
                                type="text"
                                value={currentMeaning}
                                onChange={(e) => handleUpdateMeaning(item.id, e.target.value)}
                                placeholder="点击补充中文释义..."
                                className="flex-1 bg-stone-50 hover:bg-white focus:bg-white border border-transparent hover:border-stone-300 focus:border-amber-500 rounded px-2 py-0.5 text-xs text-stone-750 transition-colors outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notification Banner */}
              {notification && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 shrink-0 ${
                    notification.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : notification.type === "error"
                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {notification.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : notification.type === "error" ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <span className="font-medium">{notification.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Bottom Control Bar */}
          {!isSuccessState && (
            <div className="flex items-center justify-between p-4 bg-stone-50 border-t border-stone-250 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold text-xs cursor-pointer transition-colors"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={validCount === 0}
                className={`px-6 py-2.5 rounded-xl font-black text-xs font-serif tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                  validCount > 0
                    ? "bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-98"
                    : "bg-stone-300 text-stone-500 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>一键导入这 {validCount} 条短句至词库</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
