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
  Trash2
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
import { audioSynth } from "../utils/audio";

interface SpanishRecitePageProps {
  onBack: () => void;
  onOpenAddModal?: () => void;
}

export const SpanishRecitePage: React.FC<SpanishRecitePageProps> = ({
  onBack,
  onOpenAddModal
}) => {
  // Mode: "flashcard" (翻卡背诵) | "dictation" (默写拼写) | "library" (词库查阅)
  const [activeTab, setActiveTab] = useState<"flashcard" | "dictation" | "library">("flashcard");

  // Deck & Filtering
  const [allWords, setAllWords] = useState<SpanishWord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [masteryMap, setMasteryMap] = useState<Record<string, { status: MasteryStatus; reviewCount: number }>>({});

  // Flashcard State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sessionStreak, setSessionStreak] = useState<number>(0);

  // Dictation State
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
  }, []);

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

  // Auto pronounce on card change in flashcard mode
  useEffect(() => {
    if (currentWord && activeTab === "flashcard") {
      setIsFlipped(false);
      // Read Spanish pronunciation
      audioSynth.speakSpanish(currentWord.word);
    } else if (currentWord && activeTab === "dictation") {
      setDictationInput("");
      setDictationSuccess(false);
      setDictationError(false);
      audioSynth.speakSpanish(currentWord.word);
      setTimeout(() => {
        dictationInputRef.current?.focus();
      }, 100);
    }
  }, [currentIndex, activeTab, selectedCategory]);

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

  const handleAppendAccent = (char: string) => {
    setDictationInput((prev) => prev + char);
    dictationInputRef.current?.focus();
  };

  // Check dictation typing
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
      audioSynth.playFanfare();
      audioSynth.speakSpanish(currentWord.word);
      updateSpanishWordMastery(currentWord.id, "mastered");
      setMasteryMap(getSpanishMasteryMap());

      setTimeout(() => {
        if (activeDeck.length > 1) {
          setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
        }
      }, 1200);
    } else {
      setDictationError(true);
      audioSynth.playErrorThud();
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
            <button
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

        {/* DICTATION / SPELLING PRACTICE MODE */}
        {activeTab === "dictation" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {currentWord ? (
              <div className="bg-white rounded-3xl border-2 border-stone-800 p-6 sm:p-9 shadow-lg space-y-6 text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => audioSynth.speakSpanish(currentWord.word)}
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>听音默写 / 重新播报</span>
                    </button>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-900 pt-2">
                    {currentWord.meaning}
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    {currentWord.categoryName} ・ 单词长度: {currentWord.word.length} 字符
                  </p>
                </div>

                {/* Input area */}
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
