import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, Sparkles, Volume2, RotateCcw, Heart, Flame, 
  ChevronLeft, Trophy, Coins, Zap, Star, ShieldAlert, Award
} from "lucide-react";
import { audioSynth } from "../utils/audio";
import { BASE_SPANISH_WORDS } from "../data/spanishData";
import { getDictionary } from "../data/dictionary";
import { addDailyProgress } from "../utils/dailyGoal";

export type LanguageCode = "es" | "ja" | "en";

interface FloatingCard {
  uid: string;
  lang: LanguageCode;
  displayWord: string; // The word displayed
  meaning: string; // The translation
  targetInput: string; // Clean lowercased string player needs to type
  typed: string; // What player has typed so far for this card
  x: number; // Percentage horizontal position (15% to 75%)
  y: number; // Vertical position in px
  speed: number;
  maxLife: number; // Total seconds
  remainingLife: number;
  bgPastel: string;
  accentColor: string;
  flag: string;
}

interface PolyglotGamePageProps {
  onBack: () => void;
  onRewardCoins?: (coins: number) => void;
  isEnglishMode?: boolean;
}

export const PolyglotGamePage: React.FC<PolyglotGamePageProps> = ({
  onBack,
  onRewardCoins,
  isEnglishMode = false,
}) => {
  // Game Setup States
  const [selectedLangs, setSelectedLangs] = useState<LanguageCode[]>(["es", "ja"]);
  const [difficulty, setDifficulty] = useState<"gentle" | "warp" | "blitz">("warp");
  const [gameState, setGameState] = useState<"setup" | "playing" | "gameover">("setup");

  // In-Game States
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [starPower, setStarPower] = useState<number>(0); // 0 to 100
  const [activeCards, setActiveCards] = useState<FloatingCard[]>([]);
  const [lastClearedLang, setLastClearedLang] = useState<LanguageCode | null>(null);
  const [synergyText, setSynergyText] = useState<string | null>(null);

  // Stats Breakdown
  const [clearedStats, setClearedStats] = useState<Record<LanguageCode, number>>({
    es: 0,
    ja: 0,
    en: 0,
  });

  const [sparkleBursts, setSparkleBursts] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  // Timer Ref
  const gameLoopRef = useRef<any>(null);
  const spawnTimerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // Pre-cached vocabularies
  const vocabPool = useRef<{
    es: { word: string; meaning: string; target: string }[];
    ja: { word: string; meaning: string; target: string }[];
    en: { word: string; meaning: string; target: string }[];
  }>({
    es: [],
    ja: [],
    en: [],
  });

  // Prepare vocabulary pools
  useEffect(() => {
    // 1. Spanish pool
    const esItems = BASE_SPANISH_WORDS.slice(0, 80).map((w) => ({
      word: w.word,
      meaning: w.meaning.split("；")[0].split("（")[0].slice(0, 10),
      target: w.word.toLowerCase().replace(/[^a-záéíóúñü]/g, ""),
    })).filter((w) => w.target.length >= 3 && w.target.length <= 10);

    // 2. Japanese pool (from dictionary kana & romaji)
    const jaDict = getDictionary(false, false);
    const jaItems = jaDict.slice(0, 80).map((w) => {
      const romajiTarget = w.segments.map((s) => s.displayRomaji).join("").toLowerCase();
      return {
        word: `${w.kanji} (${w.kanaStr})`,
        meaning: w.meaning.slice(0, 12),
        target: romajiTarget || w.kanaStr,
      };
    }).filter((w) => w.target.length >= 2 && w.target.length <= 9);

    // 3. English pool
    const enDict = getDictionary(false, true);
    const enItems = enDict.slice(0, 80).map((w) => ({
      word: w.kanji,
      meaning: w.meaning.slice(0, 12),
      target: w.kanji.toLowerCase().replace(/[^a-z]/g, ""),
    })).filter((w) => w.target.length >= 3 && w.target.length <= 9);

    vocabPool.current = {
      es: esItems,
      ja: jaItems,
      en: enItems,
    };
  }, []);

  const toggleLanguage = (lang: LanguageCode) => {
    try {
      audioSynth.playCardSlide();
    } catch (_) {}
    setSelectedLangs((prev) => {
      if (prev.includes(lang)) {
        if (prev.length <= 2) return prev; // Keep at least 2 for polyglot mixing!
        return prev.filter((l) => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  // Spawn a new floating card
  const spawnCard = useCallback(() => {
    if (selectedLangs.length === 0) return;

    // Pick random language from chosen set
    const lang = selectedLangs[Math.floor(Math.random() * selectedLangs.length)];
    const pool = vocabPool.current[lang];
    if (!pool || pool.length === 0) return;

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    const speedMap = {
      gentle: 14,
      warp: 10,
      blitz: 7,
    };
    const maxLife = speedMap[difficulty];

    const styleMap: Record<LanguageCode, { bg: string; accent: string; flag: string }> = {
      es: { bg: "from-amber-100 via-rose-100 to-pink-100", accent: "text-rose-600 border-rose-300", flag: "🇪🇸 西语" },
      ja: { bg: "from-pink-100 via-purple-100 to-indigo-100", accent: "text-purple-600 border-purple-300", flag: "🇯🇵 日语" },
      en: { bg: "from-sky-100 via-cyan-100 to-teal-100", accent: "text-cyan-700 border-cyan-300", flag: "🇬🇧 英语" },
    };

    const newCard: FloatingCard = {
      uid: "card_" + Math.random().toString(36).substr(2, 9),
      lang,
      displayWord: chosen.word,
      meaning: chosen.meaning,
      targetInput: chosen.target,
      typed: "",
      x: 10 + Math.random() * 65, // % horizontal
      y: 40 + Math.random() * 60, // starting top position in px
      speed: 1,
      maxLife,
      remainingLife: maxLife,
      bgPastel: styleMap[lang].bg,
      accentColor: styleMap[lang].accent,
      flag: styleMap[lang].flag,
    };

    setActiveCards((prev) => {
      if (prev.length >= 5) return prev; // max 5 concurrent cards
      return [...prev, newCard];
    });
  }, [selectedLangs, difficulty]);

  // Start the game
  const startGame = () => {
    if (selectedLangs.length < 2) {
      alert("请至少勾选 2 个语种以开启混合练习对决！");
      return;
    }

    try {
      audioSynth.playFanfare();
    } catch (_) {}

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setStarPower(0);
    setActiveCards([]);
    setLastClearedLang(null);
    setSynergyText(null);
    setClearedStats({ es: 0, ja: 0, en: 0 });
    setGameState("playing");
    startTimeRef.current = Date.now();

    // Initial spawn
    setTimeout(spawnCard, 300);
    setTimeout(spawnCard, 1800);
  };

  // Game loop for moving cards down and checking expiration
  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setActiveCards((prev) => {
        const nextCards: FloatingCard[] = [];
        let lostLifeCount = 0;

        for (const card of prev) {
          const newLife = card.remainingLife - 0.1;
          const newY = card.y + (difficulty === "blitz" ? 1.8 : 1.2);

          if (newLife <= 0 || newY > 480) {
            // Card dropped and expired!
            lostLifeCount++;
            try {
              audioSynth.playError();
            } catch (_) {}
          } else {
            nextCards.push({
              ...card,
              remainingLife: newLife,
              y: newY,
            });
          }
        }

        if (lostLifeCount > 0) {
          setLives((l) => {
            const nextL = l - lostLifeCount;
            if (nextL <= 0) {
              endGame();
              return 0;
            }
            return nextL;
          });
          setCombo(0);
        }

        return nextCards;
      });
    }, 100);

    gameLoopRef.current = interval;

    // Card spawner
    const spawnInterval = setInterval(() => {
      spawnCard();
    }, difficulty === "blitz" ? 2200 : 3200);

    spawnTimerRef.current = spawnInterval;

    return () => {
      clearInterval(interval);
      clearInterval(spawnInterval);
    };
  }, [gameState, difficulty, spawnCard]);

  // End Game
  const endGame = () => {
    setGameState("gameover");
    try {
      audioSynth.playCelebrationTriumph();
    } catch (_) {}

    // Record progress
    const elapsedMins = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
    const totalWords = clearedStats.es + clearedStats.ja + clearedStats.en;
    addDailyProgress(elapsedMins, totalWords);

    // Reward coins
    const earnedCoins = Math.max(60, Math.floor(score / 8));
    if (onRewardCoins) {
      onRewardCoins(earnedCoins);
    }
  };

  // Clear all cards using Star Nova
  const triggerStarNova = () => {
    if (starPower < 100 || activeCards.length === 0) return;

    try {
      audioSynth.playCelebrationTriumph();
    } catch (_) {}

    setStarPower(0);
    const bonus = activeCards.length * 150;
    setScore((s) => s + bonus);

    // Record stats
    activeCards.forEach((c) => {
      setClearedStats((prev) => ({ ...prev, [c.lang]: prev[c.lang] + 1 }));
    });

    setSparkleBursts((prev) => [
      ...prev,
      { id: Date.now(), x: 50, y: 40, text: `✨ STAR NOVA PURGE +${bonus}!` },
    ]);

    setActiveCards([]);
  };

  // Keyboard Event Listener
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && starPower >= 100) {
        e.preventDefault();
        triggerStarNova();
        return;
      }

      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      const typedChar = e.key.toLowerCase();

      // Find an active card whose next expected character matches typedChar
      setActiveCards((prevCards) => {
        // Prioritize a card that the player has already begun typing
        let targetIndex = prevCards.findIndex((c) => {
          if (c.typed.length > 0 && c.typed.length < c.targetInput.length) {
            const expected = c.targetInput[c.typed.length];
            return matchChar(typedChar, expected);
          }
          return false;
        });

        // Otherwise find the lowest card whose first char matches
        if (targetIndex === -1) {
          targetIndex = prevCards.findIndex((c) => {
            if (c.typed.length === 0) {
              const expected = c.targetInput[0];
              return matchChar(typedChar, expected);
            }
            return false;
          });
        }

        if (targetIndex === -1) {
          // No match, play micro-error tick
          try {
            audioSynth.playError();
          } catch (_) {}
          return prevCards;
        }

        const targetCard = prevCards[targetIndex];
        const nextCharExpected = targetCard.targetInput[targetCard.typed.length];
        const newTyped = targetCard.typed + nextCharExpected;

        // Correct key sound
        try {
          audioSynth.playTyping({ isCompletion: newTyped.length === targetCard.targetInput.length });
        } catch (_) {}

        // Check if card is fully cleared!
        if (newTyped.length >= targetCard.targetInput.length) {
          // Play card pronunciation
          try {
            if (targetCard.lang === "es") {
              audioSynth.speakSpanish(targetCard.displayWord);
            } else if (targetCard.lang === "ja") {
              audioSynth.speakJapanese(targetCard.displayWord);
            } else {
              audioSynth.speakEnglish(targetCard.displayWord);
            }
          } catch (_) {}

          // Calculate score & Polyglot Combo
          let isSynergy = false;
          if (lastClearedLang && lastClearedLang !== targetCard.lang) {
            isSynergy = true;
          }
          setLastClearedLang(targetCard.lang);

          const newCombo = combo + 1;
          setCombo(newCombo);
          setMaxCombo((m) => Math.max(m, newCombo));

          const basePoints = 100;
          const comboBonus = newCombo * 20;
          const synergyMultiplier = isSynergy ? 2 : 1;
          const gainedScore = (basePoints + comboBonus) * synergyMultiplier;

          setScore((s) => s + gainedScore);
          setStarPower((sp) => Math.min(100, sp + (isSynergy ? 25 : 15)));

          // Update stats
          setClearedStats((prev) => ({
            ...prev,
            [targetCard.lang]: prev[targetCard.lang] + 1,
          }));

          if (isSynergy) {
            setSynergyText(`✦ POLYGLOT SYNERGY 2x! ✦`);
            setTimeout(() => setSynergyText(null), 1800);
          }

          // Add sparkle burst
          setSparkleBursts((bursts) => [
            ...bursts,
            { id: Date.now() + Math.random(), x: targetCard.x, y: targetCard.y, text: `+${gainedScore}` },
          ]);

          // Remove card from active list
          return prevCards.filter((_, idx) => idx !== targetIndex);
        } else {
          // Card partially typed
          return prevCards.map((c, idx) => (idx === targetIndex ? { ...c, typed: newTyped } : c));
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, starPower, combo, lastClearedLang]);

  // Accent and character tolerant matching
  const matchChar = (input: string, target: string) => {
    if (!target) return false;
    const inp = input.toLowerCase();
    const tgt = target.toLowerCase();
    if (inp === tgt) return true;
    if (inp === "a" && tgt === "á") return true;
    if (inp === "e" && tgt === "é") return true;
    if (inp === "i" && tgt === "í") return true;
    if (inp === "o" && tgt === "ó") return true;
    if (inp === "u" && (tgt === "ú" || tgt === "ü")) return true;
    if (inp === "n" && tgt === "ñ") return true;
    return false;
  };

  return (
    <div className="min-h-screen w-full bg-halftone-dots py-6 px-4 md:px-8 text-stone-800 flex flex-col justify-between select-none">
      {/* Top Bar Navigation */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-4 border-b border-pink-200/80">
        <button
          onClick={onBack}
          className="p-2.5 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-stone-600 hover:text-pink-600 shadow-sm flex items-center gap-1.5 text-xs font-bold transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isEnglishMode ? "Exit Game" : "返回主页"}</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-pink-600 font-mono tracking-wider">
            <span>✦ ✧</span>
            <span>POLYGLOT STAR WARP</span>
            <span>✧ ✦</span>
          </div>
          <h1 className="font-script text-2xl md:text-3xl font-bold text-rose-500">
            多语种星芒穿梭赛
          </h1>
        </div>

        {gameState === "playing" && (
          <div className="flex items-center gap-3">
            {/* Lives */}
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-pink-200 shadow-xs">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < lives ? "text-rose-500 fill-rose-500" : "text-stone-300"
                  }`}
                />
              ))}
            </div>

            {/* Score */}
            <div className="bg-white px-3.5 py-1.5 rounded-full border border-pink-200 shadow-xs font-mono font-bold text-sm text-purple-700">
              {score} pts
            </div>
          </div>
        )}
        {gameState !== "playing" && <div className="w-20" />}
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full flex-1 my-4 flex items-center justify-center">
        {/* State 1: Setup Screen */}
        {gameState === "setup" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-pink-200/80 bg-riso-noise relative"
          >
            <div className="washi-tape" />

            <div className="text-center space-y-2 mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-mono font-bold">
                MULTI-LANGUAGE ATELIER CHALLENGE
              </span>
              <h2 className="font-serif-vintage text-2xl md:text-3xl font-bold text-stone-900">
                选择你的跨语种混合对决
              </h2>
              <p className="text-xs md:text-sm text-stone-500 font-sans max-w-md mx-auto">
                自由勾选 2 ~ 3 种语言混合出题。在多语种间快速敲击盲打，触发连续共鸣翻倍积分！
              </p>
            </div>

            {/* Language Selection Grid */}
            <div className="space-y-4 mb-6">
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                1. 勾选参与混合练习的语种 (支持多选)：
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "es" as LanguageCode, label: "🇪🇸 西班牙语", sub: "SIELE 高频词汇", border: "border-rose-300" },
                  { id: "ja" as LanguageCode, label: "🇯🇵 日语假名", sub: "和风假名/罗马音", border: "border-purple-300" },
                  { id: "en" as LanguageCode, label: "🇬🇧 英语核心", sub: "核心释义盲打", border: "border-sky-300" },
                ].map((item) => {
                  const isChecked = selectedLangs.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleLanguage(item.id)}
                      className={`p-3.5 rounded-2xl cursor-pointer text-center transition-all border-2 ${
                        isChecked
                          ? `bg-pink-50/80 ${item.border} shadow-sm ring-2 ring-pink-200`
                          : "bg-stone-50 border-stone-200/80 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="text-sm font-bold text-stone-800">{item.label}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{item.sub}</div>
                      <div className="mt-2 text-xs font-bold font-mono text-pink-600">
                        {isChecked ? "✓ 已勾选" : "+ 点击加入"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                2. 穿梭节奏与难度：
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "gentle", name: "马卡龙慢调", desc: "14秒停留 · 从容适应" },
                  { id: "warp", name: "星芒穿梭", desc: "10秒停留 · 经典节奏" },
                  { id: "blitz", name: "闪电风暴", desc: "7秒停留 · 极速指尖" },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDifficulty(d.id as any);
                      audioSynth.playCardSlide();
                    }}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      difficulty === d.id
                        ? "bg-purple-50 border-purple-300 ring-2 ring-purple-200 font-bold"
                        : "bg-white border-stone-200 hover:bg-stone-50 text-stone-600"
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-800">{d.name}</div>
                    <div className="text-[10px] text-stone-500">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 hover:from-rose-500 hover:to-purple-600 text-white font-bold text-base shadow-lg shadow-pink-300/40 flex items-center justify-center gap-2 transform active:scale-98 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>启动多语种穿梭对决</span>
            </button>
          </motion.div>
        )}

        {/* State 2: Active Playing Canvas */}
        {gameState === "playing" && (
          <div className="relative w-full h-[540px] bg-white/70 backdrop-blur-xs rounded-3xl border-2 border-pink-200 shadow-xl overflow-hidden bg-halftone-dots">
            {/* Ambient Star particles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-12 text-pink-300 text-xl animate-sparkle">✦</div>
              <div className="absolute top-32 right-16 text-purple-300 text-2xl animate-sparkle" style={{ animationDelay: "1s" }}>✧</div>
              <div className="absolute bottom-20 left-28 text-yellow-300 text-lg animate-sparkle" style={{ animationDelay: "1.5s" }}>⋆</div>
              <div className="absolute bottom-16 right-36 text-blue-300 text-xl animate-sparkle" style={{ animationDelay: "0.5s" }}>✦</div>
            </div>

            {/* Synergy Notification Banner */}
            <AnimatePresence>
              {synergyText && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 text-white font-bold font-mono text-sm shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{synergyText}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Cards Arena */}
            {activeCards.map((card) => {
              const lifePercent = Math.max(0, Math.min(100, (card.remainingLife / card.maxLife) * 100));

              return (
                <div
                  key={card.uid}
                  style={{
                    position: "absolute",
                    left: `${card.x}%`,
                    top: `${card.y}px`,
                    transform: "translateX(-50%)",
                    transition: "top 0.1s linear",
                  }}
                  className="w-56 bg-white rounded-2xl p-3.5 shadow-lg border-2 border-pink-200/90 z-20"
                >
                  {/* Card Header with flag badge and life bar */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-mono">
                      {card.flag}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {Math.ceil(card.remainingLife)}s
                    </span>
                  </div>

                  {/* Word title */}
                  <div className="font-serif-vintage text-base font-bold text-stone-800 truncate">
                    {card.displayWord}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate mb-2">
                    {card.meaning}
                  </div>

                  {/* Target typing prompt */}
                  <div className="bg-stone-50 rounded-lg p-1.5 border border-pink-100 text-center font-mono text-sm tracking-wider">
                    {card.targetInput.split("").map((ch, i) => {
                      const isTyped = i < card.typed.length;
                      const isNext = i === card.typed.length;
                      return (
                        <span
                          key={i}
                          className={`${
                            isTyped
                              ? "text-rose-600 font-bold bg-pink-100/80 rounded-xs"
                              : isNext
                              ? "text-stone-900 border-b border-rose-500 font-bold"
                              : "text-stone-400"
                          }`}
                        >
                          {ch}
                        </span>
                      );
                    })}
                  </div>

                  {/* Life progress bar */}
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all duration-100 ${
                        lifePercent > 50
                          ? "bg-emerald-400"
                          : lifePercent > 25
                          ? "bg-amber-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${lifePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Sparkle Score Bursts */}
            {sparkleBursts.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 1, scale: 0.8, y: 0 }}
                animate={{ opacity: 0, scale: 1.4, y: -40 }}
                transition={{ duration: 0.8 }}
                style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}px` }}
                className="pointer-events-none z-30 font-bold font-mono text-pink-600 text-base drop-shadow-sm"
              >
                {b.text}
              </motion.div>
            ))}

            {/* Bottom In-Game Controls & Star Power Bar */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-pink-200 shadow-sm z-30">
              <div className="flex items-center gap-3">
                {/* Combo meter */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-mono font-bold text-stone-700">
                    Combo: <span className="text-rose-600">{combo}x</span>
                  </span>
                </div>

                {/* Star Nova Energy Gauge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-700 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> 星光净化:
                  </span>
                  <div className="w-32 bg-stone-100 h-3 rounded-full overflow-hidden border border-purple-200">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-purple-500 transition-all duration-300"
                      style={{ width: `${starPower}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-stone-500">{starPower}%</span>
                </div>
              </div>

              {/* Star Nova Trigger Button */}
              <button
                onClick={triggerStarNova}
                disabled={starPower < 100}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm transition-all ${
                  starPower >= 100
                    ? "bg-gradient-to-r from-amber-400 to-pink-500 text-white animate-pulse cursor-pointer shadow-amber-300/50"
                    : "bg-stone-100 text-stone-400 cursor-not-allowed"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>[Space] 全屏净化</span>
              </button>
            </div>
          </div>
        )}

        {/* State 3: Game Over Settlement Card */}
        {gameState === "gameover" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-pink-200 bg-halftone-dots relative text-center"
          >
            <div className="washi-tape" />

            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-pink-300 to-purple-300 p-1 shadow-lg border-2 border-dashed border-pink-400 flex items-center justify-center mb-3">
              <Trophy className="w-10 h-10 text-amber-500 animate-bounce-slow" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-mono font-bold mb-1">
              CHALLENGE CONCLUDED
            </div>
            <h2 className="font-script text-4xl text-rose-500 font-bold">
              穿梭试炼结算战报
            </h2>
            <p className="font-serif-vintage italic text-stone-600 text-xs md:text-sm">
              "Polylingual resonance · 多语言思维碰撞，行之苟有恒，久久自芬芳"
            </p>

            {/* Score & Combo */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-pink-50/80 rounded-2xl border border-pink-100">
                <div className="text-xs text-stone-500">最终总分</div>
                <div className="text-2xl font-bold font-mono text-rose-600">{score}</div>
              </div>

              <div className="p-3 bg-purple-50/80 rounded-2xl border border-purple-100">
                <div className="text-xs text-stone-500">最高连击 Combo</div>
                <div className="text-2xl font-bold font-mono text-purple-600">{maxCombo}x</div>
              </div>
            </div>

            {/* Language Breakdown */}
            <div className="bg-stone-50/90 rounded-2xl p-3.5 border border-pink-100 mb-4 text-left space-y-1.5">
              <div className="text-xs font-bold text-stone-600 mb-2">多语种击中分布统计：</div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span>🇪🇸 西班牙语命中：</span>
                <strong className="text-rose-600">{clearedStats.es} 词</strong>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span>🇯🇵 日语假名命中：</span>
                <strong className="text-purple-600">{clearedStats.ja} 词</strong>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span>🇬🇧 英语核心命中：</span>
                <strong className="text-cyan-700">{clearedStats.en} 词</strong>
              </div>
            </div>

            {/* Coin reward */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-100 to-pink-100 border border-amber-200 mb-5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>穿梭通关奖励：</span>
              </div>
              <span className="font-mono font-bold text-amber-700">
                +{Math.max(60, Math.floor(score / 8))} 🪙
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGameState("setup")}
                className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>换组语种重选</span>
              </button>

              <button
                onClick={startGame}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-pink-300/40 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>再来一局穿梭</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
