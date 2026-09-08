import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Volume2,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Search,
  Plus,
  BookOpen,
  Keyboard,
  Layers,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  RefreshCw,
  Trash2,
  Zap,
  Globe
} from "lucide-react";
import {
  SpanishWord,
  SPANISH_CATEGORIES,
  getAllSpanishWords,
  getSpanishMasteryMap,
  updateSpanishWordMastery,
  deleteCustomSpanishWord,
  MasteryStatus
} from "../data/spanishData";
import { getDictionary, DictionaryItem } from "../data/dictionary";
import { audioSynth } from "../utils/audio";

export type ReciteLanguage = "ja" | "en" | "es";

export interface UnifiedReciteWord {
  id: string;
  lang: ReciteLanguage;
  word: string;
  displayTitle: string;
  kanaStr?: string;
  subTitle?: string;
  phonetic?: string;
  partOfSpeech?: string;
  meaning: string;
  category: string;
  categoryName: string;
  level?: string;
  segments: {
    display: string;
    romaji: string[];
    displayRomaji?: string;
  }[];
  pronounceText: string;
  kanjiHint?: string;
  romajiHint?: string;
  isCustom?: boolean;
}

interface SpanishRecitePageProps {
  onBack: () => void;
  onOpenAddModal?: (lang?: ReciteLanguage) => void;
  onOpenBatchModal?: (lang?: ReciteLanguage) => void;
  onStartTraining?: (items: any[], durationMs: number) => void;
  refreshTrigger?: number;
  initialLanguage?: ReciteLanguage;
}

// Category configs per language
const CATEGORIES_MAP: Record<ReciteLanguage, { id: string; label: string; icon: string }[]> = {
  ja: [
    { id: "all", label: "全部", icon: "🇯🇵" },
    { id: "name", label: "日本人名", icon: "👘" },
    { id: "nature", label: "自然生灵", icon: "🌸" },
    { id: "culture", label: "文化风情", icon: "⛩️" },
    { id: "food", label: "美食风物", icon: "🍱" },
    { id: "custom", label: "自定义词", icon: "✍️" },
  ],
  en: [
    { id: "all", label: "全部", icon: "🇬🇧" },
    { id: "name", label: "人物名家", icon: "🏛️" },
    { id: "nature", label: "自然万象", icon: "🌿" },
    { id: "culture", label: "人文社科", icon: "📚" },
    { id: "food", label: "美食餐饮", icon: "☕" },
    { id: "custom", label: "自定义词", icon: "✍️" },
  ],
  es: [
    { id: "all", label: "全部", icon: "🇪🇸" },
    { id: "daily", label: "日常交流", icon: "💬" },
    { id: "travel", label: "旅行交通", icon: "✈️" },
    { id: "business", label: "职场商务", icon: "💼" },
    { id: "food", label: "美食餐饮", icon: "🥘" },
    { id: "emotion", label: "情绪性格", icon: "❤️" },
    { id: "grammar", label: "动词介词", icon: "📖" },
    { id: "custom", label: "自定义词", icon: "✍️" },
  ],
};

// Common Kana keys for mobile/virtual input in Japanese mode
const QUICK_KANA_PALETTE = [
  "あ", "い", "う", "え", "お",
  "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ",
  "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の",
  "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も",
  "や", "ゆ", "よ", "ら", "り",
  "る", "れ", "ろ", "わ", "を", "ん"
];

const SPANISH_ACCENT_KEYS = ["á", "é", "í", "ó", "ú", "ñ", "ü", "¡", "¿"];

function getMasteryStorageKey(lang: ReciteLanguage): string {
  if (lang === "es") return "fifty_sound_spanish_mastery";
  return `fifty_sound_${lang}_recite_mastery`;
}

function getStoredMastery(lang: ReciteLanguage): Record<string, { status: MasteryStatus; reviewCount: number }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getMasteryStorageKey(lang));
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveStoredMastery(lang: ReciteLanguage, map: Record<string, { status: MasteryStatus; reviewCount: number }>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getMasteryStorageKey(lang), JSON.stringify(map));
  } catch (_) {}
}

export const SpanishRecitePage: React.FC<SpanishRecitePageProps> = ({
  onBack,
  onOpenAddModal,
  onOpenBatchModal,
  onStartTraining,
  refreshTrigger = 0,
  initialLanguage = "es",
}) => {
  // Current active language: Japanese | English | Spanish
  const [currentLang, setCurrentLang] = useState<ReciteLanguage>(initialLanguage);

  // Mode: "flashcard" (翻卡背诵) | "dictation" (活字拼写默写) | "library" (词库查阅)
  const [activeTab, setActiveTab] = useState<"flashcard" | "dictation" | "library">("dictation");

  // Word Deck & Filtering
  const [allWords, setAllWords] = useState<UnifiedReciteWord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [masteryMap, setMasteryMap] = useState<Record<string, { status: MasteryStatus; reviewCount: number }>>({});

  // Flashcard State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPronouncing, setIsPronouncing] = useState<boolean>(false);
  const [sessionStreak, setSessionStreak] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(() => audioSynth.getSpeechRate());

  // Dictation & Guided Letter-by-Letter Prompt State
  const [promptMode, setPromptMode] = useState<"guided" | "hint" | "blind">("guided");
  const [useTypewriterGrid, setUseTypewriterGrid] = useState<boolean>(true);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [romajiBuffer, setRomajiBuffer] = useState<string>("");
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const [dictationInput, setDictationInput] = useState<string>("");
  const [dictationSuccess, setDictationSuccess] = useState<boolean>(false);
  const [dictationError, setDictationError] = useState<boolean>(false);
  const dictationInputRef = useRef<HTMLInputElement>(null);

  // Load words whenever language or refreshTrigger changes
  const reloadWords = (langToLoad: ReciteLanguage = currentLang) => {
    let unified: UnifiedReciteWord[] = [];

    if (langToLoad === "es") {
      const rawSpanish = getAllSpanishWords();
      unified = rawSpanish.map((w): UnifiedReciteWord => {
        const cleanWord = w.word.trim();
        const letterSegments = cleanWord.split("").map((char) => {
          const lower = char.toLowerCase();
          const unaccented = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return {
            display: char,
            romaji: char === " " ? [" "] : lower === unaccented ? [lower] : [lower, unaccented],
            displayRomaji: char,
          };
        });
        return {
          id: w.id,
          lang: "es",
          word: cleanWord,
          displayTitle: cleanWord,
          subTitle: [w.partOfSpeech, w.phonetic].filter(Boolean).join(" "),
          phonetic: w.phonetic,
          partOfSpeech: w.partOfSpeech,
          meaning: w.meaning,
          category: w.category,
          categoryName: w.categoryName,
          level: w.level,
          segments: letterSegments,
          pronounceText: cleanWord,
          isCustom: w.isCustom,
        };
      });
    } else if (langToLoad === "en") {
      const rawEnglish = getDictionary(true);
      unified = rawEnglish.map((item): UnifiedReciteWord => {
        const cleanWord = item.kanji.trim();
        const letterSegments = cleanWord.split("").map((char) => ({
          display: char,
          romaji: char === " " ? [" "] : [char.toLowerCase()],
          displayRomaji: char,
        }));
        return {
          id: item.id,
          lang: "en",
          word: cleanWord,
          displayTitle: cleanWord,
          subTitle: item.categoryName,
          meaning: item.meaning,
          category: item.category,
          categoryName: item.categoryName,
          level: item.rarity,
          segments: letterSegments,
          pronounceText: cleanWord,
          isCustom: (item as any).isCustom,
        };
      });
    } else {
      // Japanese
      const rawJapanese = getDictionary(false);
      unified = rawJapanese.map((item): UnifiedReciteWord => {
        const syllables = item.segments.map((s) => ({
          display: s.kana,
          romaji: s.romaji,
          displayRomaji: s.displayRomaji || s.romaji[0],
        }));
        return {
          id: item.id,
          lang: "ja",
          word: item.kanaStr,
          displayTitle: item.kanji,
          kanaStr: item.kanaStr,
          subTitle: `${item.kanaStr} ・ ${syllables.map((s) => s.displayRomaji).join(" ")}`,
          meaning: item.meaning,
          category: item.category,
          categoryName: item.categoryName,
          level: item.rarity,
          segments: syllables,
          pronounceText: item.kanaStr || item.kanji,
          kanjiHint: item.kanji,
          romajiHint: syllables.map((s) => s.displayRomaji).join(""),
          isCustom: (item as any).isCustom,
        };
      });
    }

    setAllWords(unified);
    setMasteryMap(getStoredMastery(langToLoad));
  };

  useEffect(() => {
    reloadWords(currentLang);
    setCurrentIndex(0);
    setSelectedCategory("all");
    setTypedChars([]);
    setRomajiBuffer("");
    setDictationSuccess(false);
  }, [currentLang, refreshTrigger]);

  // Filtered Deck
  const activeDeck = useMemo(() => {
    return allWords.filter((w) => {
      const matchCat = selectedCategory === "all" || w.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        w.displayTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.kanaStr && w.kanaStr.toLowerCase().includes(searchQuery.toLowerCase())) ||
        w.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allWords, selectedCategory, searchQuery]);

  const currentWord: UnifiedReciteWord | undefined = activeDeck[currentIndex] || activeDeck[0];

  // Target blocks for typewriter grid
  const targetChars = useMemo(() => {
    if (!currentWord) return [];
    return currentWord.segments.map((s) => s.display);
  }, [currentWord]);

  // Play pronunciation of current word safely
  const pronounceCurrentWord = (onEnd?: () => void) => {
    if (!currentWord) {
      if (onEnd) onEnd();
      return;
    }
    setIsPronouncing(true);
    audioSynth.speakFullWord(
      currentWord.pronounceText,
      () => {
        setIsPronouncing(false);
        if (onEnd) onEnd();
      },
      currentWord.kanjiHint,
      currentWord.romajiHint,
      currentWord.lang
    );
  };

  const cycleSpeechRate = (speakSample: boolean = true) => {
    const rates = [1.0, 1.25, 1.5, 1.75, 0.8];
    const current = audioSynth.getSpeechRate();
    const nextIdx = (rates.findIndex((r) => Math.abs(r - current) < 0.05) + 1) % rates.length;
    const newRate = rates[nextIdx >= 0 ? nextIdx : 1];
    audioSynth.setSpeechRate(newRate);
    setSpeechRate(newRate);
    audioSynth.playCardSlide();
    if (speakSample && currentWord) {
      pronounceCurrentWord();
    }
  };

  // Auto pronounce on card change in flashcard & dictation mode
  useEffect(() => {
    if (currentWord && activeTab === "flashcard") {
      setIsFlipped(false);
      pronounceCurrentWord();
    } else if (currentWord && activeTab === "dictation") {
      setDictationInput("");
      setDictationSuccess(false);
      setDictationError(false);
      setShakeIndex(null);
      setRomajiBuffer("");

      // Auto-advance inverted punctuation (¡, ¿) if word starts with it in Spanish
      const first = currentWord.segments[0]?.display;
      if (first === "¡" || first === "¿") {
        setTypedChars([first]);
      } else {
        setTypedChars([]);
      }

      pronounceCurrentWord();
      setTimeout(() => {
        dictationInputRef.current?.focus();
        hiddenInputRef.current?.focus();
      }, 100);
    }
  }, [currentIndex, activeTab, selectedCategory, currentWord?.id]);

  // Statistics
  const stats = useMemo(() => {
    let mastered = 0;
    let familiar = 0;
    let learning = 0;

    allWords.forEach((w) => {
      const m = masteryMap[w.id];
      if (m?.status === "mastered") mastered++;
      else if (m?.status === "familiar") familiar++;
      else learning++;
    });

    return { mastered, familiar, learning, total: allWords.length };
  }, [allWords, masteryMap]);

  // Handle Mastery Evaluation in Flashcard mode
  const handleRateWord = (status: MasteryStatus) => {
    if (!currentWord) return;
    const currentEntry = masteryMap[currentWord.id] || { status: "learning", reviewCount: 0 };
    const nextMap = {
      ...masteryMap,
      [currentWord.id]: {
        status,
        reviewCount: currentEntry.reviewCount + 1,
      },
    };
    setMasteryMap(nextMap);
    saveStoredMastery(currentLang, nextMap);

    if (currentLang === "es") {
      updateSpanishWordMastery(currentWord.id, status);
    }

    if (status === "mastered") {
      audioSynth.playFanfare();
      setSessionStreak((prev) => prev + 1);
    } else if (status === "familiar") {
      audioSynth.playTypewriterBell();
    } else {
      audioSynth.playTyping({ volume: 0.8 });
      setSessionStreak(0);
    }

    // Advance to next word
    if (activeDeck.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
      setIsFlipped(false);
    }
  };

  // Completion callback: rings bell, speaks word in authentic native voice, advances on end!
  const checkCompletion = (newTyped: string[]) => {
    if (!currentWord) return;
    if (newTyped.length >= targetChars.length) {
      setDictationSuccess(true);
      setDictationError(false);
      audioSynth.playTypewriterBell();

      const currentEntry = masteryMap[currentWord.id] || { status: "learning", reviewCount: 0 };
      const nextMap = {
        ...masteryMap,
        [currentWord.id]: {
          status: "mastered" as MasteryStatus,
          reviewCount: currentEntry.reviewCount + 1,
        },
      };
      setMasteryMap(nextMap);
      saveStoredMastery(currentLang, nextMap);
      if (currentLang === "es") {
        updateSpanishWordMastery(currentWord.id, "mastered");
      }
      setSessionStreak((prev) => prev + 1);

      // Pronounce completed word and advance ONLY after pronunciation completes!
      pronounceCurrentWord(() => {
        const pauseDelay = Math.max(120, Math.round(180 / Math.max(0.8, audioSynth.getSpeechRate())));
        setTimeout(() => {
          if (activeDeck.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
          }
        }, pauseDelay);
      });
    }
  };

  // Typewriter input handling for Latin (Spanish/English) and Japanese (Kana/Romaji)
  const handleTypeCharacter = (inputChar: string) => {
    if (!currentWord || dictationSuccess) return;

    let currIdx = typedChars.length;
    if (currIdx >= targetChars.length) return;

    const currentSegment = currentWord.segments[currIdx];
    if (!currentSegment) return;

    // --- JAPANESE LOGIC ---
    if (currentLang === "ja") {
      const charLower = inputChar.toLowerCase();

      // Check if user directly tapped/input the Kana character
      if (inputChar === currentSegment.display) {
        setRomajiBuffer("");
        const nextTyped = [...typedChars, currentSegment.display];
        setTypedChars(nextTyped);
        const isComp = nextTyped.length >= targetChars.length;
        audioSynth.playTyping({ isCompletion: isComp });
        checkCompletion(nextTyped);
        return;
      }

      // Handle Romaji keystroke
      const proposed = romajiBuffer + charLower;
      const isMatch = currentSegment.romaji.some((r) => r === proposed);
      const isPrefix = currentSegment.romaji.some((r) => r.startsWith(proposed));

      if (isMatch) {
        setRomajiBuffer("");
        const nextTyped = [...typedChars, currentSegment.display];
        setTypedChars(nextTyped);
        const isComp = nextTyped.length >= targetChars.length;
        audioSynth.playTyping({ isCompletion: isComp });
        checkCompletion(nextTyped);
      } else if (isPrefix) {
        setRomajiBuffer(proposed);
        audioSynth.playTyping({ volume: 0.7 });
      } else {
        // Check if user is typing for the next character (e.g. punctuation or fresh start)
        audioSynth.playError();
        setShakeIndex(currIdx);
        setTimeout(() => setShakeIndex(null), 400);
      }
      return;
    }

    // --- LATIN LOGIC (ENGLISH & SPANISH) ---
    const expected = currentSegment.display;
    const isExact = inputChar.toLowerCase() === expected.toLowerCase();
    const normTyped = inputChar.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normExpected = expected.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isNormMatch = normTyped === normExpected;

    // Auto-advance punctuation if needed
    if (/[ \-\.,\?!¡¿']/.test(expected) && inputChar !== expected && inputChar !== " ") {
      const nextSegment = currentWord.segments[currIdx + 1];
      if (nextSegment) {
        const nextExp = nextSegment.display;
        if (inputChar.toLowerCase() === nextExp.toLowerCase() || inputChar.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === nextExp.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
          const nextTyped = [...typedChars, expected, nextExp];
          setTypedChars(nextTyped);
          const isComp = nextTyped.length >= targetChars.length;
          audioSynth.playTyping({ isCompletion: isComp });
          checkCompletion(nextTyped);
          return;
        }
      }
    }

    if (isExact || isNormMatch || (expected === " " && inputChar === " ")) {
      const nextTyped = [...typedChars, expected];
      setTypedChars(nextTyped);
      const isComp = nextTyped.length >= targetChars.length;
      audioSynth.playTyping({ isCompletion: isComp });
      checkCompletion(nextTyped);
    } else {
      audioSynth.playError();
      setShakeIndex(currIdx);
      setTimeout(() => setShakeIndex(null), 400);
    }
  };

  const handleBackspace = () => {
    if (dictationSuccess) return;

    if (currentLang === "ja" && romajiBuffer.length > 0) {
      setRomajiBuffer((prev) => prev.slice(0, -1));
      audioSynth.playTyping({ volume: 0.6 });
      return;
    }

    if (typedChars.length > 0) {
      const first = targetChars[0];
      if ((first === "¡" || first === "¿") && typedChars.length === 1) {
        return;
      }
      audioSynth.playTyping({ volume: 0.6 });
      setTypedChars((prev) => prev.slice(0, -1));
      setRomajiBuffer("");
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    if (activeTab !== "dictation" || !useTypewriterGrid || !currentWord || dictationSuccess) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (document.activeElement?.tagName === "INPUT" && document.activeElement !== hiddenInputRef.current) {
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        pronounceCurrentWord();
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        handleTypeCharacter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, useTypewriterGrid, currentWord, typedChars, romajiBuffer, dictationSuccess, targetChars, currentLang]);

  // Classic fallback input check
  const handleCheckClassicDictation = (inputVal: string) => {
    if (!currentWord) return;
    const cleanInput = inputVal.trim().toLowerCase();
    const cleanTarget = (currentWord.kanaStr || currentWord.displayTitle).trim().toLowerCase();

    const isMatch =
      cleanInput === cleanTarget ||
      cleanInput.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === cleanTarget.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ||
      (currentWord.romajiHint && cleanInput === currentWord.romajiHint.toLowerCase());

    if (isMatch) {
      setDictationSuccess(true);
      setDictationError(false);
      audioSynth.playTypewriterBell();

      const currentEntry = masteryMap[currentWord.id] || { status: "learning", reviewCount: 0 };
      const nextMap = {
        ...masteryMap,
        [currentWord.id]: {
          status: "mastered" as MasteryStatus,
          reviewCount: currentEntry.reviewCount + 1,
        },
      };
      setMasteryMap(nextMap);
      saveStoredMastery(currentLang, nextMap);
      if (currentLang === "es") {
        updateSpanishWordMastery(currentWord.id, "mastered");
      }

      pronounceCurrentWord(() => {
        const pauseDelay = Math.max(120, Math.round(180 / Math.max(0.8, audioSynth.getSpeechRate())));
        setTimeout(() => {
          if (activeDeck.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
          }
        }, pauseDelay);
      });
    } else {
      setDictationError(true);
      audioSynth.playError();
      setTimeout(() => setDictationError(false), 800);
    }
  };

  const categories = CATEGORIES_MAP[currentLang];

  return (
    <div className="min-h-screen pb-16 text-stone-900 select-none">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 space-y-6">
        {/* Top Bar: Return, Title & Language Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition-all cursor-pointer shadow-2xs"
              title="返回首页"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-serif font-black tracking-wide text-stone-900">
                  沉浸背诵与活字默写工坊
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-900">
                  {currentLang === "ja" ? "日本語" : currentLang === "en" ? "English" : "Español"}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-serif">
                翻卡熟化 · 活字打字机听音默写 · 自动发音切词
              </p>
            </div>
          </div>

          {/* Language Switcher Tabs */}
          <div className="flex items-center bg-stone-200/80 p-1 rounded-2xl border border-stone-300/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setCurrentLang("ja");
                audioSynth.playCardSlide();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentLang === "ja"
                  ? "bg-red-700 text-stone-50 shadow-xs font-black"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>🇯🇵</span>
              <span>日语</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentLang("en");
                audioSynth.playCardSlide();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentLang === "en"
                  ? "bg-stone-900 text-stone-50 shadow-xs font-black"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>🇬🇧</span>
              <span>英语</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentLang("es");
                audioSynth.playCardSlide();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentLang === "es"
                  ? "bg-amber-500 text-stone-950 shadow-xs font-black"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <span>🇪🇸</span>
              <span>西语</span>
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-stone-300 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("dictation");
                audioSynth.playCardSlide();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "dictation"
                  ? "bg-amber-500 text-stone-950 shadow-xs font-black"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>✍️ 活字默写</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("flashcard");
                audioSynth.playCardSlide();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "flashcard"
                  ? "bg-stone-900 text-stone-50 shadow-xs font-black"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>🎴 翻卡背诵</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("library");
                audioSynth.playCardSlide();
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "library"
                  ? "bg-stone-900 text-stone-50 shadow-xs font-black"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>📚 词库查阅</span>
            </button>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                type="button"
                onClick={() => onOpenAddModal(currentLang)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="录入新生词"
              >
                <Plus className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">录入词汇</span>
              </button>
            )}

            {onOpenBatchModal && (
              <button
                type="button"
                onClick={() => onOpenBatchModal(currentLang)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="批量导入生词"
              >
                <span>📥</span>
                <span className="hidden sm:inline">批量导入</span>
              </button>
            )}

            {onStartTraining && (
              <button
                type="button"
                onClick={() => {
                  const trainingItems = allWords.map((w) => ({
                    id: w.id,
                    kanji: w.displayTitle,
                    kanaStr: w.kanaStr || w.displayTitle,
                    category: w.category as any,
                    categoryName: w.categoryName,
                    meaning: w.meaning,
                    rarity: (w.level || "N") as any,
                    rarityName: w.level || "N",
                    glowColor: "rgba(245, 158, 11, 0.25)",
                    borderColor: "border-amber-400",
                    bgGradient: "from-amber-50 to-orange-100",
                    segments: w.segments.map((s) => ({
                      kana: s.display,
                      romaji: s.romaji,
                      displayRomaji: s.displayRomaji || s.romaji[0],
                    })),
                    lang: w.lang,
                  }));
                  onStartTraining(trainingItems, 0);
                }}
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                title="开启全屏活字打字机联训"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>打字联训</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats & Streak Banner */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-600 font-black">
              <Flame className="w-4 h-4 fill-current" />
              <span>连续熟练 {sessionStreak} 词</span>
            </div>

            <span className="text-stone-300">|</span>

            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <span>🟢 已牢记 {stats.mastered}</span>
            </div>

            <div className="flex items-center gap-1 text-amber-600 font-bold">
              <span>🟡 略知 {stats.familiar}</span>
            </div>

            <div className="flex items-center gap-1 text-rose-600 font-bold">
              <span>🔴 待复习 {stats.learning}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-stone-400 font-mono">总收录</div>
              <div className="text-sm font-black text-stone-800">{stats.total} 词</div>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categories.map((cat) => {
            const count =
              cat.id === "all"
                ? allWords.length
                : allWords.filter((w) => w.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentIndex(0);
                  audioSynth.playCardSlide();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-stone-900 text-stone-50 shadow-xs"
                    : "bg-white border border-stone-300 text-stone-600 hover:bg-stone-100"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] font-mono opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: FLASHCARD REVIEW MODE */}
        {activeTab === "flashcard" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {currentWord ? (
              <>
                <div className="relative min-h-[380px] w-full perspective-1000">
                  <motion.div
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="w-full min-h-[380px] rounded-3xl border-2 border-stone-800 bg-white p-7 sm:p-9 flex flex-col justify-between items-center text-center shadow-lg hover:shadow-xl transition-all cursor-pointer relative select-none overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Header bar inside card */}
                    <div className="w-full flex items-center justify-between text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 font-bold">
                        {currentWord.categoryName} {currentWord.level ? `・ ${currentWord.level}` : ""}
                      </span>

                      <span className="text-stone-400">
                        {currentIndex + 1} / {activeDeck.length}
                      </span>
                    </div>

                    {/* Word Display & Pronunciation */}
                    <div className="my-auto space-y-3 py-6">
                      <div className="flex items-center justify-center gap-2.5">
                        <h2 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 tracking-tight">
                          {currentWord.displayTitle}
                        </h2>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            pronounceCurrentWord();
                          }}
                          className={`p-2 rounded-full transition-all cursor-pointer active:scale-90 ${
                            isPronouncing
                              ? "bg-amber-400 text-stone-950 animate-pulse scale-110 shadow-xs"
                              : "bg-amber-100 hover:bg-amber-200 text-amber-900"
                          }`}
                          title={isPronouncing ? "正在朗读..." : "点击发音"}
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cycleSpeechRate(true);
                          }}
                          className="px-2 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-900 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-0.5 active:scale-95"
                          title="点击循环切换发音语速"
                        >
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>{speechRate}x</span>
                        </button>
                      </div>

                      {/* Subtitle / Phonetic / Kana */}
                      {currentWord.subTitle && (
                        <div className="flex items-center justify-center gap-2 font-mono text-sm text-stone-500">
                          <span>{currentWord.subTitle}</span>
                        </div>
                      )}

                      {/* Meaning Reveal */}
                      <div className="pt-4">
                        {isFlipped ? (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                          >
                            <div className="p-3 bg-stone-100/90 rounded-xl border border-stone-250 text-stone-900 font-bold text-base sm:text-lg">
                              {currentWord.meaning}
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-xs text-stone-400 font-serif flex items-center justify-center gap-1.5">
                            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                            <span>点击卡片翻转查看释义与评级</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status Tag */}
                    <div className="text-[11px] font-mono text-stone-400">
                      当前掌握度:{" "}
                      <span className="font-bold text-stone-700">
                        {masteryMap[currentWord.id]?.status === "mastered"
                          ? "🟢 已经牢记"
                          : masteryMap[currentWord.id]?.status === "familiar"
                          ? "🟡 略知一二"
                          : "🔴 待复习"}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Rating Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRateWord("learning")}
                    className="py-3 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <span className="text-rose-600 font-black">🔴 需再复习</span>
                    <span className="text-[10px] text-stone-400 font-mono">生疏重温</span>
                  </button>

                  <button
                    onClick={() => handleRateWord("familiar")}
                    className="py-3 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border-2 border-stone-300 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    <span className="text-amber-600 font-black">🟡 略知一二</span>
                    <span className="text-[10px] text-stone-400 font-mono">加深记忆</span>
                  </button>

                  <button
                    onClick={() => handleRateWord("mastered")}
                    className="py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-50 border-2 border-stone-800 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <span className="text-emerald-400 font-black">🟢 已经牢记</span>
                    <span className="text-[10px] text-stone-400 font-mono">完美掌握</span>
                  </button>
                </div>

                {/* Quick Prev / Next */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => {
                      if (activeDeck.length > 1) {
                        setCurrentIndex((prev) => (prev - 1 + activeDeck.length) % activeDeck.length);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>上一个</span>
                  </button>

                  <button
                    onClick={() => {
                      if (activeDeck.length > 1) {
                        setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>下一个</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border-2 border-stone-800 space-y-4">
                <p className="text-stone-500 font-serif">当前分类下暂无词汇</p>
                {onOpenAddModal && (
                  <button
                    onClick={() => onOpenAddModal(currentLang)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    立即录入词汇
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DICTATION & GUIDED TYPEWRITER MODE */}
        {activeTab === "dictation" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {currentWord ? (
              <div className="bg-white rounded-3xl border-2 border-stone-800 p-5 sm:p-8 shadow-lg space-y-6 text-center">
                {/* Header & Prompt Level Selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-[11px] font-bold">
                    <span className="text-stone-400 px-1">提示模式:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromptMode("guided");
                        setUseTypewriterGrid(true);
                        audioSynth.playCardSlide();
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        promptMode === "guided" && useTypewriterGrid
                          ? "bg-amber-500 text-stone-950 font-black shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="显示每个活字槽位的浅色底纹提示，支持逐字拼写引导"
                    >
                      💡 全提示
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPromptMode("hint");
                        setUseTypewriterGrid(true);
                        audioSynth.playCardSlide();
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        promptMode === "hint" && useTypewriterGrid
                          ? "bg-amber-500 text-stone-950 font-black shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="仅展示首字/首音提示，其余字母隐藏为原点"
                    >
                      🔤 首音提示
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPromptMode("blind");
                        setUseTypewriterGrid(true);
                        audioSynth.playCardSlide();
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        promptMode === "blind" && useTypewriterGrid
                          ? "bg-amber-500 text-stone-950 font-black shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="完全隐藏底纹字母，盲打考验真实记忆"
                    >
                      🙈 纯默写
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUseTypewriterGrid((prev) => !prev);
                        audioSynth.playCardSlide();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-mono transition-all cursor-pointer"
                      title="切换逐字活字格与经典整行输入框"
                    >
                      {useTypewriterGrid ? "⌨️ 活字格" : "📝 整行输入"}
                    </button>

                    <div className="text-xs font-mono text-stone-400">
                      {currentIndex + 1} / {activeDeck.length}
                    </div>
                  </div>
                </div>

                {/* Target Meaning & Audio */}
                <div className="space-y-2">
                  <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                    {currentWord.meaning}
                  </div>
                  <div className="text-xs font-mono text-stone-500 flex items-center justify-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200">
                      {currentWord.categoryName}
                    </span>
                    {currentWord.phonetic && <span>{currentWord.phonetic}</span>}
                  </div>
                </div>

                {/* Audio Listen Buttons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => pronounceCurrentWord()}
                    className={`px-4 py-2 rounded-full border text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                      isPronouncing
                        ? "bg-amber-400 border-amber-500 text-stone-950 font-black animate-pulse"
                        : "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950 font-bold"
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 ${isPronouncing ? "text-stone-950 animate-bounce" : "text-amber-800"}`} />
                    <span>{isPronouncing ? "正在朗读..." : "重听发音 (Enter)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cycleSpeechRate(true)}
                    className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="切换语速"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>{speechRate}x</span>
                  </button>
                </div>

                {/* Hidden Input for mobile & focus management */}
                <input
                  ref={hiddenInputRef}
                  type="text"
                  className="opacity-0 pointer-events-none absolute -left-9999px"
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      e.preventDefault();
                      handleBackspace();
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      pronounceCurrentWord();
                    } else if (e.key.length === 1) {
                      e.preventDefault();
                      handleTypeCharacter(e.key);
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const lastChar = val[val.length - 1];
                      handleTypeCharacter(lastChar);
                      e.target.value = "";
                    }
                  }}
                />

                {/* TYPEWRITER GUIDED LETTER BLOCKS */}
                {useTypewriterGrid ? (
                  <div className="space-y-5">
                    <div
                      onClick={() => hiddenInputRef.current?.focus()}
                      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4 cursor-text outline-none"
                      tabIndex={0}
                    >
                      {currentWord.segments.map((seg, idx) => {
                        const char = seg.display;
                        const isTyped = idx < typedChars.length;
                        const isActive = idx === typedChars.length;
                        const isSpace = char === " ";
                        const isPunct = /[\-,\.!\?¡¿']/.test(char);
                        const isShaking = shakeIndex === idx;

                        // Prompt text
                        let promptChar = "";
                        if (promptMode === "guided") {
                          promptChar = char;
                        } else if (promptMode === "hint") {
                          if (idx === 0 || isPunct) {
                            promptChar = char;
                          } else {
                            promptChar = "·";
                          }
                        } else {
                          promptChar = isPunct ? char : "·";
                        }

                        if (isSpace) {
                          return (
                            <div
                              key={idx}
                              className="w-4 sm:w-6 flex items-center justify-center text-stone-300 font-mono text-sm select-none"
                            >
                              ␣
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className={`relative rounded-xl border-2 flex flex-col items-center justify-center transition-all select-none ${
                              char.length > 1
                                ? "w-12 h-16 sm:w-14 sm:h-20"
                                : "w-10 h-15 sm:w-12 sm:h-18 md:w-14 md:h-20"
                            } ${
                              isTyped
                                ? "border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-xs"
                                : isActive
                                ? `border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-300/90 ${
                                    isShaking ? "animate-shake border-rose-500 bg-rose-50 ring-rose-300" : ""
                                  }`
                                : "border-stone-300 bg-stone-50/40 text-stone-400"
                            }`}
                          >
                            {/* Wabi-sabi paper grid lines */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-stone-500" />
                              <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-stone-500" />
                            </div>

                            {/* Position number */}
                            <div className="absolute top-1 right-1.5 font-mono text-[8px] text-stone-400">
                              {idx + 1}
                            </div>

                            {/* Main Character / Syllable text */}
                            <div className="relative text-2xl sm:text-3xl font-bold font-sans">
                              {isTyped ? (
                                <motion.span
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="text-emerald-700 font-black"
                                >
                                  {typedChars[idx]}
                                </motion.span>
                              ) : isActive ? (
                                <div className="flex flex-col items-center">
                                  <span className="text-amber-700 font-bold opacity-75">
                                    {promptChar}
                                  </span>
                                  {/* In Japanese mode: display live Romaji buffer progress */}
                                  {currentLang === "ja" && romajiBuffer && (
                                    <span className="text-[10px] font-mono font-black text-amber-900 animate-pulse -mt-1">
                                      {romajiBuffer}_
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-stone-300 font-medium">
                                  {promptChar}
                                </span>
                              )}
                            </div>

                            {/* Romaji guide under Kana for Japanese */}
                            {currentLang === "ja" && seg.displayRomaji && (
                              <div className="absolute bottom-1 font-mono text-[9px] text-stone-400">
                                {isTyped ? (
                                  <span className="text-emerald-600 font-bold">✓</span>
                                ) : isActive ? (
                                  <span className="text-amber-700 font-bold">{seg.displayRomaji}</span>
                                ) : (
                                  <span>{promptMode === "guided" ? seg.displayRomaji : ""}</span>
                                )}
                              </div>
                            )}

                            {/* Bottom guide marker for Latin */}
                            {currentLang !== "ja" && (
                              <div className="absolute bottom-1 text-[9px] font-mono">
                                {isTyped ? (
                                  <span className="text-emerald-600 font-bold">✓</span>
                                ) : isActive ? (
                                  <span className="text-amber-600 font-black animate-pulse">▲</span>
                                ) : (
                                  <span className="text-stone-300">_</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Virtual Keypad Toolbar */}
                    {currentLang === "es" && (
                      <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-mono text-stone-400 mr-1 hidden sm:inline">
                          变音快捷键:
                        </span>
                        {SPANISH_ACCENT_KEYS.map((char) => (
                          <button
                            key={char}
                            type="button"
                            onClick={() => handleTypeCharacter(char)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                          >
                            {char}
                          </button>
                        ))}
                        <div className="h-4 w-px bg-stone-300 mx-1 hidden sm:block" />
                        <button
                          type="button"
                          onClick={handleBackspace}
                          className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95"
                          title="删除上一字符 (Backspace)"
                        >
                          ⌫ 退格
                        </button>
                      </div>
                    )}

                    {currentLang === "ja" && (
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <div className="flex items-center justify-center flex-wrap gap-1">
                          <span className="text-[10px] font-mono text-stone-400 mr-1">
                            假名/退格:
                          </span>
                          {currentWord.segments.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleTypeCharacter(s.display)}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-sans text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                              title={`输入假名 ${s.display} (${s.displayRomaji})`}
                            >
                              {s.display}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={handleBackspace}
                            className="px-3 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95"
                          >
                            ⌫ 退格
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-500 font-mono">
                          💡 支持实体键盘直接打罗马音（如输入 sa 对应 さ，to 对应 と）
                        </p>
                      </div>
                    )}

                    {currentLang === "en" && (
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <span className="text-[11px] text-stone-500 font-mono">
                          ⌨️ 请直接在实体键盘键入英文字母 (支持大小写自动校准)
                        </span>
                        <button
                          type="button"
                          onClick={handleBackspace}
                          className="px-3 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95"
                        >
                          ⌫ 退格
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* CLASSIC SINGLE-LINE INPUT FALLBACK */
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="relative">
                      <input
                        ref={dictationInputRef}
                        type="text"
                        value={dictationInput}
                        onChange={(e) => setDictationInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCheckClassicDictation(dictationInput);
                          }
                        }}
                        placeholder={`请输入完整的拼写...`}
                        className={`w-full py-3 px-4 rounded-2xl border-2 text-center text-lg font-bold outline-none transition-all ${
                          dictationError
                            ? "border-rose-500 bg-rose-50 ring-2 ring-rose-200 animate-shake"
                            : dictationSuccess
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-stone-400 focus:border-stone-900 bg-white"
                        }`}
                        autoFocus
                      />
                      {dictationSuccess && (
                        <div className="absolute right-3 top-3.5 text-emerald-600">
                          <CheckCircle2 className="w-6 h-6 animate-bounce" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleCheckClassicDictation(dictationInput)}
                        className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-black text-xs tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        提交检验 (Enter)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDictationInput(currentWord.displayTitle);
                          dictationInputRef.current?.focus();
                        }}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 font-bold text-xs transition-all cursor-pointer"
                      >
                        查看答案
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Feedback Banner */}
                {dictationSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-2xl text-emerald-950 flex items-center justify-center gap-2 font-bold text-sm shadow-xs"
                  >
                    <span>🎉</span>
                    <span>拼写正确！朗读中，正在自动前往下一词...</span>
                  </motion.div>
                )}

                {/* Bottom Action Controls & Skip */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTypedChars(targetChars);
                      setDictationSuccess(true);
                      audioSynth.playTypewriterBell();
                      pronounceCurrentWord(() => {
                        setTimeout(() => {
                          if (activeDeck.length > 1) {
                            setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
                          }
                        }, 500);
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all cursor-pointer"
                  >
                    💡 揭晓答案并前往下一词
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeDeck.length > 1) {
                        setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
                        setTypedChars([]);
                        setRomajiBuffer("");
                      }
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    跳过此词 ⏩
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border-2 border-stone-800 space-y-4">
                <p className="text-stone-500 font-serif">当前分类下暂无词汇</p>
                {onOpenAddModal && (
                  <button
                    onClick={() => onOpenAddModal(currentLang)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    立即录入词汇
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VOCABULARY LIBRARY & SEARCH */}
        {activeTab === "library" && (
          <div className="space-y-6">
            {/* Search Bar & Header */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                placeholder={`在 ${currentLang === "ja" ? "日语" : currentLang === "en" ? "英语" : "西语"} 词库中搜索词条、假名或中文释义...`}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-stone-300 focus:border-stone-900 outline-none text-sm font-serif shadow-xs"
              />
            </div>

            {/* Word Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeDeck.map((w, idx) => {
                const isMastered = masteryMap[w.id]?.status === "mastered";
                const isFamiliar = masteryMap[w.id]?.status === "familiar";

                return (
                  <div
                    key={w.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-base font-black font-serif text-stone-900">
                          {w.displayTitle}
                        </div>
                        {w.subTitle && (
                          <div className="text-xs font-mono text-stone-500">
                            {w.subTitle}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            audioSynth.speakFullWord(
                              w.pronounceText,
                              undefined,
                              w.kanjiHint,
                              w.romajiHint,
                              w.lang
                            );
                          }}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                          title="播放朗读"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {w.isCustom && currentLang === "es" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`确定删除自定义词条「${w.displayTitle}」吗？`)) {
                                deleteCustomSpanishWord(w.id);
                                reloadWords(currentLang);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="删除自定义词条"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 font-sans line-clamp-2">
                      {w.meaning}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-stone-400">
                      <span>{w.categoryName}</span>
                      <span
                        className={`font-bold ${
                          isMastered
                            ? "text-emerald-600"
                            : isFamiliar
                            ? "text-amber-600"
                            : "text-stone-400"
                        }`}
                      >
                        {isMastered ? "🟢 已牢记" : isFamiliar ? "🟡 略知" : "🔴 待复习"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeDeck.length === 0 && (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
                <p className="text-stone-500 font-serif">未查找到匹配的词条</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
                >
                  清除搜索关键字
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpanishRecitePage;
