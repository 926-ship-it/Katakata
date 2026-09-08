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
  FileText,
  Zap
} from "lucide-react";
import {
  SpanishWord,
  SPANISH_CATEGORIES,
  getAllSpanishWords,
  getSpanishMasteryMap,
  updateSpanishWordMastery,
  deleteCustomSpanishWord,
  MasteryStatus,
  spanishWordToDictionaryItem
} from "../data/spanishData";
import { audioSynth } from "../utils/audio";

interface SpanishRecitePageProps {
  onBack: () => void;
  onOpenAddModal?: () => void;
  onOpenBatchModal?: () => void;
  onStartTraining?: (items: any[], durationMs: number) => void;
  refreshTrigger?: number;
}

export const SpanishRecitePage: React.FC<SpanishRecitePageProps> = ({
  onBack,
  onOpenAddModal,
  onOpenBatchModal,
  onStartTraining,
  refreshTrigger = 0,
}) => {
  // Mode: "flashcard" (翻卡背诵) | "dictation" (默写拼写) | "library" (词库查阅)
  const [activeTab, setActiveTab] = useState<"flashcard" | "dictation" | "library">("dictation");

  // Deck & Filtering
  const [allWords, setAllWords] = useState<SpanishWord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [masteryMap, setMasteryMap] = useState<Record<string, { status: MasteryStatus; reviewCount: number }>>({});

  // Flashcard State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sessionStreak, setSessionStreak] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(() => audioSynth.getSpeechRate());

  const cycleSpeechRate = (speakSample: boolean = true) => {
    const rates = [1.0, 1.25, 1.5, 1.75, 0.8];
    const current = audioSynth.getSpeechRate();
    const nextIdx = (rates.findIndex((r) => Math.abs(r - current) < 0.05) + 1) % rates.length;
    const newRate = rates[nextIdx >= 0 ? nextIdx : 1];
    audioSynth.setSpeechRate(newRate);
    setSpeechRate(newRate);
    audioSynth.playCardSlide();
    if (speakSample && currentWord) {
      audioSynth.speakSpanish(currentWord.word);
    }
  };

  // Dictation & Guided Letter-by-Letter Prompt State
  const [promptMode, setPromptMode] = useState<"guided" | "hint" | "blind">("guided");
  const [useTypewriterGrid, setUseTypewriterGrid] = useState<boolean>(true);
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const [dictationInput, setDictationInput] = useState<string>("");
  const [dictationSuccess, setDictationSuccess] = useState<boolean>(false);
  const [dictationError, setDictationError] = useState<boolean>(false);
  const dictationInputRef = useRef<HTMLInputElement>(null);

  // Reload deck on mount or updates
  const reloadWords = () => {
    const words = getAllSpanishWords();
    setAllWords(words);
    setMasteryMap(getSpanishMasteryMap());
  };

  useEffect(() => {
    reloadWords();
  }, [refreshTrigger]);

  // Filtered Deck
  const activeDeck = useMemo(() => {
    return allWords.filter((w) => {
      const matchCat = selectedCategory === "all" || w.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allWords, selectedCategory, searchQuery]);

  const currentWord: SpanishWord | undefined = activeDeck[currentIndex] || activeDeck[0];

  const targetChars = useMemo(() => {
    if (!currentWord) return [];
    return currentWord.word.split("");
  }, [currentWord]);

  // Auto pronounce on card change in flashcard & dictation mode
  useEffect(() => {
    if (currentWord && activeTab === "flashcard") {
      setIsFlipped(false);
      audioSynth.speakSpanish(currentWord.word);
    } else if (currentWord && activeTab === "dictation") {
      setDictationInput("");
      setDictationSuccess(false);
      setDictationError(false);
      setShakeIndex(null);

      // Auto-advance inverted punctuation (¡, ¿) if word starts with it
      const first = currentWord.word[0];
      if (first === "¡" || first === "¿") {
        setTypedChars([first]);
      } else {
        setTypedChars([]);
      }

      audioSynth.speakSpanish(currentWord.word);
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
    updateSpanishWordMastery(currentWord.id, status);
    setMasteryMap(getSpanishMasteryMap());

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

  // Accent helper keys for Spanish input
  const SPANISH_KEYS = ["á", "é", "í", "ó", "ú", "ñ", "ü", "¡", "¿"];

  // Smart character matching (handles case and accents, e.g. typing 'a' matches 'á')
  const isCharMatch = (typed: string, target: string) => {
    if (!typed || !target) return false;
    if (typed.toLowerCase() === target.toLowerCase()) return true;
    const normTyped = typed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normTarget = target.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normTyped === normTarget;
  };

  const checkCompletion = (newTyped: string[]) => {
    if (!currentWord) return;
    if (newTyped.length >= targetChars.length) {
      setDictationSuccess(true);
      setDictationError(false);
      audioSynth.playTypewriterBell();
      
      updateSpanishWordMastery(currentWord.id, "mastered");
      setMasteryMap(getSpanishMasteryMap());
      setSessionStreak((prev) => prev + 1);

      // Speak the completed word clearly, and advance ONLY after pronunciation completes!
      audioSynth.speakSpanish(currentWord.word, () => {
        const pauseDelay = Math.max(120, Math.round(180 / Math.max(0.8, audioSynth.getSpeechRate())));
        setTimeout(() => {
          if (activeDeck.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
          }
        }, pauseDelay);
      });
    }
  };

  const handleTypeCharacter = (inputChar: string) => {
    if (!currentWord || dictationSuccess) return;

    let currIdx = typedChars.length;
    if (currIdx >= targetChars.length) return;

    let expected = targetChars[currIdx];

    // If expected is space or punctuation, and user typed the next letter: auto-advance past punctuation
    if (/[ \-\.,\?!¡¿]/.test(expected) && inputChar !== expected && inputChar !== " ") {
      const nextExpected = targetChars[currIdx + 1];
      if (nextExpected && isCharMatch(inputChar, nextExpected)) {
        const nextTyped = [...typedChars, expected, nextExpected];
        setTypedChars(nextTyped);
        const isComp = nextTyped.length >= targetChars.length;
        audioSynth.playTyping({ isCompletion: isComp });
        checkCompletion(nextTyped);
        return;
      }
    }

    if (isCharMatch(inputChar, expected) || (expected === " " && inputChar === " ")) {
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
    if (typedChars.length > 0) {
      const first = targetChars[0];
      if ((first === "¡" || first === "¿") && typedChars.length === 1) {
        return;
      }
      audioSynth.playTyping({ volume: 0.6 });
      setTypedChars((prev) => prev.slice(0, -1));
    }
  };

  const handleAppendAccent = (char: string) => {
    if (useTypewriterGrid) {
      handleTypeCharacter(char);
    } else {
      setDictationInput((prev) => prev + char);
      dictationInputRef.current?.focus();
    }
  };

  // Keyboard listener for physical keyboard typing in typewriter guided mode
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
        audioSynth.speakSpanish(currentWord.word);
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        handleTypeCharacter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, useTypewriterGrid, currentWord, typedChars, targetChars, dictationSuccess]);

  // Check dictation typing for classic input mode
  const normalizeSpanish = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[¡!¿?,.]/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const handleCheckDictation = (inputVal: string) => {
    if (!currentWord) return;
    const cleanInput = inputVal.trim();
    const cleanTarget = currentWord.word.trim();

    const isExact = cleanInput.toLowerCase() === cleanTarget.toLowerCase();
    const isNormalized = normalizeSpanish(cleanInput) === normalizeSpanish(cleanTarget);

    if (isExact || isNormalized) {
      setDictationSuccess(true);
      setDictationError(false);
      audioSynth.playTypewriterBell();
      updateSpanishWordMastery(currentWord.id, "mastered");
      setMasteryMap(getSpanishMasteryMap());

      audioSynth.speakSpanish(currentWord.word, () => {
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

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b-2 border-stone-800 px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white hover:bg-stone-200 border border-stone-300 text-stone-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回主界面</span>
            </button>

            <div className="h-6 w-px bg-stone-300 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🇪🇸</span>
              <div>
                <h1 className="text-base sm:text-lg font-black font-serif text-stone-950 leading-tight">
                  西语沉浸背诵工坊
                </h1>
                <p className="text-[10px] text-stone-500 font-mono tracking-wide">
                  SPANISH FLASHCARD & DICTATION ACCENT WORKSHOP
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Speed selector pill */}
            <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-mono text-stone-500 font-bold hidden sm:inline">语速:</span>
              <select
                value={speechRate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value);
                  setSpeechRate(newRate);
                  audioSynth.setSpeechRate(newRate);
                  audioSynth.playCardSlide();
                  if (currentWord) {
                    audioSynth.speakSpanish(currentWord.word);
                  }
                }}
                className="font-mono font-black text-xs text-stone-900 bg-transparent outline-none cursor-pointer"
                title="调整西语发音与例句朗读语速"
              >
                <option value={0.8}>0.8x 慢速</option>
                <option value={1.0}>1.0x 原速</option>
                <option value={1.25}>1.25x 提速</option>
                <option value={1.5}>1.5x 倍速</option>
                <option value={1.75}>1.75x 极速</option>
              </select>
            </div>

            {onStartTraining && (
              <button
                type="button"
                onClick={() => {
                  const items = activeDeck.map(spanishWordToDictionaryItem);
                  onStartTraining(items, 0);
                  audioSynth.playTypewriterBell();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 border border-stone-700"
                title="进入全屏活字打字机联训模式，享受连击音效与沉浸打字"
              >
                <Keyboard className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">活字打字机联训</span>
                <span className="sm:hidden">打字机</span>
              </button>
            )}

            {onOpenBatchModal && (
              <button
                type="button"
                onClick={onOpenBatchModal}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-200 border border-stone-300 text-stone-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="批量导入多行短句（支持制表符 Tab、编号列表复制）"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>批量导入短句</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              title="录入新的西班牙语词汇"
            >
              <Plus className="w-4 h-4" />
              <span>录入西语单词</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Mode Switcher & Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mode Tabs */}
          <div className="md:col-span-2 flex rounded-2xl bg-stone-200/90 p-1.5 border border-stone-300 text-xs font-bold select-none">
            <button
              onClick={() => setActiveTab("flashcard")}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "flashcard"
                  ? "bg-stone-900 text-stone-50 shadow-md font-black"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>🎴 翻卡背诵模式</span>
            </button>

            <button
              onClick={() => setActiveTab("dictation")}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "dictation"
                  ? "bg-stone-900 text-stone-50 shadow-md font-black"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>✍️ 默写拼写模式</span>
            </button>

            <button
              onClick={() => setActiveTab("library")}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "library"
                  ? "bg-stone-900 text-stone-50 shadow-md font-black"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📚 词库检索浏览</span>
            </button>
          </div>

          {/* Stats badge */}
          <div className="bg-white border-2 border-stone-800 rounded-2xl p-3 flex items-center justify-around shadow-2xs text-center font-mono">
            <div>
              <div className="text-[10px] text-stone-400">已牢记</div>
              <div className="text-base font-black text-emerald-600">{stats.mastered}</div>
            </div>
            <div className="h-7 w-px bg-stone-200" />
            <div>
              <div className="text-[10px] text-stone-400">复习中</div>
              <div className="text-base font-black text-amber-600">{stats.familiar}</div>
            </div>
            <div className="h-7 w-px bg-stone-200" />
            <div>
              <div className="text-[10px] text-stone-400">总词汇</div>
              <div className="text-base font-black text-stone-800">{stats.total}</div>
            </div>
          </div>
        </div>

        {/* Category Pills & Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-stone-900 text-stone-50 shadow-xs"
                : "bg-white border border-stone-300 text-stone-600 hover:bg-stone-200"
            }`}
          >
            全部 ({allWords.length})
          </button>
          {SPANISH_CATEGORIES.map((cat) => {
            const count = allWords.filter((w) => w.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-stone-900 text-stone-50 shadow-xs"
                    : "bg-white border border-stone-300 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] font-mono opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* MAIN INTERFACE: FLASHCARD MODE */}
        {activeTab === "flashcard" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {currentWord ? (
              <>
                {/* Active Card Container */}
                <div className="relative min-h-[360px] w-full perspective-1000">
                  <motion.div
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="w-full min-h-[360px] rounded-3xl border-2 border-stone-800 bg-white p-7 sm:p-9 flex flex-col justify-between items-center text-center shadow-lg hover:shadow-xl transition-all cursor-pointer relative select-none overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Corner Tag */}
                    <div className="w-full flex items-center justify-between text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 font-bold">
                        {currentWord.categoryName} ・ {currentWord.level}
                      </span>

                      <span className="text-stone-400">
                        {currentIndex + 1} / {activeDeck.length}
                      </span>
                    </div>

                    {/* Word Display (Card Front & Back) */}
                    <div className="my-auto space-y-3 py-6">
                      <div className="flex items-center justify-center gap-2.5">
                        <h2 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 tracking-tight">
                          {currentWord.word}
                        </h2>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            audioSynth.speakSpanish(currentWord.word);
                          }}
                          className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all cursor-pointer active:scale-90"
                          title="点击发音"
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
                          title="点击循环切换发音语速 (1.0x → 1.25x → 1.5x → 1.75x → 0.8x)"
                        >
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>{speechRate}x</span>
                        </button>
                      </div>

                      {/* Phonetic & Part of Speech */}
                      <div className="flex items-center justify-center gap-2 font-mono text-sm text-stone-500">
                        {currentWord.phonetic && <span>{currentWord.phonetic}</span>}
                        {currentWord.partOfSpeech && (
                          <span className="italic font-serif text-amber-700 font-semibold">
                            {currentWord.partOfSpeech}
                          </span>
                        )}
                      </div>

                      {/* Flip Hint or Revealed Meaning */}
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

                            {currentWord.exampleEs && (
                              <div className="p-3 bg-amber-50/60 rounded-xl border border-dashed border-amber-300 text-left space-y-1">
                                <div className="text-xs font-mono font-bold text-amber-900 flex items-center justify-between">
                                  <span>{currentWord.exampleEs}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      audioSynth.speakSpanish(currentWord.exampleEs!);
                                    }}
                                    className="p-1 hover:bg-amber-200 rounded text-amber-800"
                                    title="朗读例句"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                {currentWord.exampleZh && (
                                  <div className="text-xs text-stone-600 font-serif">
                                    {currentWord.exampleZh}
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <div className="text-xs text-stone-400 font-mono flex items-center justify-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>点击卡片翻面，揭晓中文释义与例句</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="text-[11px] text-stone-400 font-mono">
                      {sessionStreak > 2 && (
                        <span className="text-amber-600 font-bold mr-2">🔥 连对 {sessionStreak} 词</span>
                      )}
                      <span>Katakata 西语沉浸引擎</span>
                    </div>
                  </motion.div>
                </div>

                {/* Rating & Navigation Control Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRateWord("learning")}
                    className="py-3 px-4 rounded-2xl bg-white hover:bg-rose-50 border-2 border-stone-800 text-stone-800 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 shadow-sm hover:border-rose-400 transition-all cursor-pointer active:scale-95"
                  >
                    <span className="text-rose-600 font-black">🔴 还不熟练</span>
                    <span className="text-[10px] text-stone-400 font-mono">稍后重新复习</span>
                  </button>

                  <button
                    onClick={() => handleRateWord("familiar")}
                    className="py-3 px-4 rounded-2xl bg-white hover:bg-amber-50 border-2 border-stone-800 text-stone-800 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 shadow-sm hover:border-amber-400 transition-all cursor-pointer active:scale-95"
                  >
                    <span className="text-amber-600 font-black">🟡 印象模糊</span>
                    <span className="text-[10px] text-stone-400 font-mono">略知一二</span>
                  </button>

                  <button
                    onClick={() => handleRateWord("mastered")}
                    className="py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-50 border-2 border-stone-800 font-bold text-xs sm:text-sm flex flex-col items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <span className="text-emerald-400 font-black">🟢 已经牢记</span>
                    <span className="text-[10px] text-stone-400 font-mono">完美掌握</span>
                  </button>
                </div>

                {/* Quick Prev / Next Buttons */}
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
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
                >
                  立即录入词汇
                </button>
              </div>
            )}
          </div>
        )}

        {/* DICTATION / GUIDED SPELLING PRACTICE MODE */}
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
                      title="显示每个活字槽位的浅色底纹提示，支持像五十音那样逐字拼写"
                    >
                      💡 全字母提示
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
                      title="只显示词首字母，其他字母隐藏为圆点"
                    >
                      🔤 首字提示
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
                      title="空白卡槽盲打默写"
                    >
                      🙈 纯默写
                    </button>
                  </div>

                  {/* Switch to single input box */}
                  <button
                    type="button"
                    onClick={() => {
                      setUseTypewriterGrid((prev) => !prev);
                      audioSynth.playCardSlide();
                    }}
                    className="text-xs font-mono text-stone-500 hover:text-stone-900 underline underline-offset-4 cursor-pointer"
                  >
                    {useTypewriterGrid ? "📝 切换至传统输入框" : "⌨️ 切换至活字字块提示模式"}
                  </button>
                </div>

                {/* Target Meaning & Audio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => audioSynth.speakSpanish(currentWord.word)}
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>听音发音 / 重新播报 (Space)</span>
                    </button>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 pt-1">
                    {currentWord.meaning}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    {currentWord.categoryName} ・ 共 {targetChars.length} 个字符
                  </p>
                </div>

                {/* Hidden input for mobile keyboard focus */}
                <input
                  ref={hiddenInputRef}
                  type="text"
                  className="opacity-0 absolute -z-10 w-0 h-0 pointer-events-none"
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      e.preventDefault();
                      handleBackspace();
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      audioSynth.speakSpanish(currentWord.word);
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
                      {targetChars.map((char, idx) => {
                        const isTyped = idx < typedChars.length;
                        const isActive = idx === typedChars.length;
                        const isSpace = char === " ";
                        const isPunct = /[\-,\.!\?¡¿']/.test(char);
                        const isShaking = shakeIndex === idx;

                        // Letter prompt visibility
                        let promptChar = "";
                        if (promptMode === "guided") {
                          promptChar = char;
                        } else if (promptMode === "hint") {
                          if (idx === 0 || targetChars[idx - 1] === " " || isPunct) {
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
                                ? "w-11 h-16 sm:w-13 sm:h-20"
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
                            {/* Paper grid guides */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-stone-500" />
                              <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-stone-500" />
                            </div>

                            {/* Position indicator */}
                            <div className="absolute top-1 right-1.5 font-mono text-[8px] text-stone-400">
                              {idx + 1}
                            </div>

                            {/* Main Character text */}
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
                                <span className="text-amber-700 font-bold opacity-75">
                                  {promptChar}
                                </span>
                              ) : (
                                <span className="text-stone-300 font-medium">
                                  {promptChar}
                                </span>
                              )}
                            </div>

                            {/* Bottom guide marker */}
                            <div className="absolute bottom-1 text-[9px] font-mono">
                              {isTyped ? (
                                <span className="text-emerald-600 font-bold">✓</span>
                              ) : isActive ? (
                                <span className="text-amber-600 font-black animate-pulse">▲</span>
                              ) : (
                                <span className="text-stone-300">_</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Accent Buttons Toolbar with Backspace & Clear */}
                    <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-stone-400 mr-1 hidden sm:inline">变音快捷键:</span>
                      {SPANISH_KEYS.map((char) => (
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

                      <button
                        type="button"
                        onClick={() => {
                          const first = currentWord.word[0];
                          if (first === "¡" || first === "¿") {
                            setTypedChars([first]);
                          } else {
                            setTypedChars([]);
                          }
                          setDictationSuccess(false);
                          audioSynth.playCardSlide();
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-bold transition-all cursor-pointer"
                        title="清空当前输入重来"
                      >
                        🔄 重写
                      </button>
                    </div>

                    {/* Progress Info & Quick Tips */}
                    <div className="text-[11px] text-stone-500 font-serif flex items-center justify-center gap-4">
                      <span>💡 提示：在物理键盘直接敲击字母即可输入，无需变音符号也可以输入基础字母（如 a 对应 á）</span>
                    </div>
                  </div>
                ) : (
                  /* CLASSIC INPUT FIELD */
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="relative">
                      <input
                        ref={dictationInputRef}
                        type="text"
                        value={dictationInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDictationInput(val);
                          audioSynth.playTyping();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCheckDictation(dictationInput);
                          }
                        }}
                        placeholder="在此处拼写西语单词并回车..."
                        className={`w-full py-3.5 px-4 text-center font-sans font-bold text-lg sm:text-xl rounded-2xl border-2 focus:outline-none transition-all ${
                          dictationSuccess
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : dictationError
                            ? "border-rose-500 bg-rose-50 text-rose-900 animate-shake"
                            : "border-stone-800 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-amber-400/30"
                        }`}
                        autoFocus
                      />

                      {dictationSuccess && (
                        <div className="absolute right-3 top-3.5 text-emerald-600">
                          <CheckCircle2 className="w-6 h-6 animate-bounce" />
                        </div>
                      )}
                    </div>

                    {/* Accent Key Toolbar */}
                    <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-stone-400 mr-1">变音符:</span>
                      {SPANISH_KEYS.map((char) => (
                        <button
                          key={char}
                          type="button"
                          onClick={() => handleAppendAccent(char)}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          {char}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => handleCheckDictation(dictationInput)}
                        className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-black text-xs tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        提交检验 (Enter)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDictationInput(currentWord.word);
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

                {/* Action Controls & Skip */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Reveal word
                      setTypedChars(targetChars);
                      setDictationSuccess(true);
                      audioSynth.playTypewriterBell();
                      audioSynth.speakSpanish(currentWord.word);
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 font-bold text-xs transition-all cursor-pointer"
                  >
                    👀 提示答案
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (activeDeck.length > 1) {
                        setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
                        audioSynth.playCardSlide();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-bold text-xs transition-all cursor-pointer"
                  >
                    ⏭️ 跳过此词
                  </button>
                </div>

                {/* Example sentence hint */}
                {currentWord.exampleEs && (
                  <div className="pt-4 border-t border-stone-200 text-xs text-stone-500 font-serif">
                    例句：{currentWord.exampleEs} （{currentWord.exampleZh}）
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border-2 border-stone-800">
                暂无单词
              </div>
            )}
          </div>
        )}

        {/* LIBRARY / SEARCH MODE */}
        {activeTab === "library" && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索西语单词或中文释义..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif shadow-2xs"
              />
            </div>

            {/* Word Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activeDeck.map((word) => {
                const mastery = masteryMap[word.id]?.status || "learning";
                return (
                  <div
                    key={word.id}
                    className="p-4 rounded-2xl bg-white border-2 border-stone-800 hover:border-amber-500 transition-all shadow-xs flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-amber-800 font-bold">{word.categoryName}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            mastery === "mastered"
                              ? "bg-emerald-100 text-emerald-800"
                              : mastery === "familiar"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {mastery === "mastered"
                            ? "已牢记"
                            : mastery === "familiar"
                            ? "复习中"
                            : "待学习"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <h4 className="text-lg font-black font-serif text-stone-900">
                          {word.word}
                        </h4>
                        <button
                          type="button"
                          onClick={() => audioSynth.speakSpanish(word.word)}
                          className="p-1.5 rounded-full hover:bg-amber-100 text-stone-600 hover:text-amber-900 transition-colors cursor-pointer"
                          title="点击发音"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-stone-600 font-medium pt-0.5">{word.meaning}</p>
                    </div>

                    {word.exampleEs && (
                      <div className="pt-2 border-t border-stone-150 text-[11px] text-stone-400 font-serif leading-tight">
                        {word.exampleEs}
                      </div>
                    )}

                    {word.isCustom && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`确定要删除生词「${word.word}」吗？`)) {
                              deleteCustomSpanishWord(word.id);
                              reloadWords();
                            }
                          }}
                          className="p-1 text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                          title="删除生词"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
