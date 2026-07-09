import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, BookOpen, Volume2, VolumeX, Key, HelpCircle, Gamepad2, Info, ChevronLeft, ChevronRight, Music, Smile, Mic, Home, Clock } from "lucide-react";
import { StartPage } from "./components/StartPage";
import { TrainingPage } from "./components/TrainingPage";
import { CardLibraryPage } from "./components/CardLibraryPage";
import { MascotComponent } from "./components/MascotComponent";
import { SpellRushPage } from "./components/SpellRushPage";
import { MemoryMatchPage } from "./components/MemoryMatchPage";
import { KanaTrainingPage } from "./components/KanaTrainingPage";
import { OnlineTimer } from "./components/OnlineTimer";
import { DictionaryItem } from "./data/dictionary";
import { audioSynth } from "./utils/audio";
import { recordPracticeBatch } from "./utils/srs";
import { uiTranslate } from "./utils/lang";
import { NarrativeStyle, nTrans } from "./utils/narrative";

type ScreenState = "start" | "training" | "library" | "unlocked_ceremony" | "spell_rush" | "memory_match" | "kana_training";

export function toHanNumerals(num: number): string {
  const chars = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  return String(num).split("").map(digit => {
    const n = Number(digit);
    return isNaN(n) ? digit : chars[n];
  }).join("");
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<ScreenState>("start");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [practiceTimes, setPracticeTimes] = useState<Record<string, number>>({});
  
  // Custom states for Gamification (B: Gacha, D: Card Leveling/Stars)
  const [coins, setCoins] = useState<number>(() => {
    try {
      const val = localStorage.getItem("fifty_sound_coins");
      return val ? Number(val) : 300; // Start with 300 coins so users can enjoy pulling Gacha packs!
    } catch (_) {
      return 300;
    }
  });

  const [cardUpgrades, setCardUpgrades] = useState<Record<string, { level: number; exp: number; stars: number }>>(() => {
    try {
      const val = localStorage.getItem("fifty_sound_card_upgrades");
      return val ? JSON.parse(val) : {};
    } catch (_) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("fifty_sound_coins", String(coins));
    } catch (_) {}
  }, [coins]);

  useEffect(() => {
    try {
      localStorage.setItem("fifty_sound_card_upgrades", JSON.stringify(cardUpgrades));
    } catch (_) {}
  }, [cardUpgrades]);

  // Custom interactive panel states
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fifty_sound_muted") === "true";
    } catch (_) {
      return false;
    }
  });
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fifty_sound_bgm") === "true";
    } catch (_) {
      return false;
    }
  });
  const [voiceType, setVoiceType] = useState<string>(() => {
    try {
      return localStorage.getItem("fifty_sound_voice_type") || "female";
    } catch (_) {
      return "female";
    }
  });
  const [showMascot, setShowMascot] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fifty_sound_show_mascot") !== "false";
    } catch (_) {
      return true;
    }
  });
  const [lastAction, setLastAction] = useState<"correct" | "error" | "complete" | "">("");
  const [practiceMode, setPracticeMode] = useState<"typing" | "handwriting">("typing");
  const [isEnglishMode, setIsEnglishMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fifty_sound_english_mode") === "true";
    } catch (_) {
      return false;
    }
  });

  const [isKatakanaMode, setIsKatakanaMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fifty_sound_katakana_mode") === "true";
    } catch (_) {
      return false;
    }
  });

  const [narrativeStyle, setNarrativeStyle] = useState<NarrativeStyle>(() => {
    try {
      const val = localStorage.getItem("fifty_sound_narrative_style");
      return (val as NarrativeStyle) || "cultural"; // default to inclusive 'cultural'
    } catch (_) {
      return "cultural";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("fifty_sound_narrative_style", narrativeStyle);
    } catch (_) {}
  }, [narrativeStyle]);

  // Selection for active training
  const [activeCards, setActiveCards] = useState<DictionaryItem[]>([]);
  const [activeDurationMs, setActiveDurationMs] = useState<number>(3 * 60 * 1000);
  const [trainingKanaType, setTrainingKanaType] = useState<"hiragana" | "katakana" | "both">("hiragana");
  
  // Last newly unlocked cards representation for ceremony modal
  const [ceremonyCards, setCeremonyCards] = useState<DictionaryItem[]>([]);
  const [ceremonyRounds, setCeremonyRounds] = useState<number>(0);
  const [activeCeremonyIdx, setActiveCeremonyIdx] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Synchronize state preferences
  useEffect(() => {
    try {
      localStorage.setItem("fifty_sound_english_mode", String(isEnglishMode));
    } catch (e) {
      console.warn("localStorage restricted", e);
    }
  }, [isEnglishMode]);

  useEffect(() => {
    try {
      localStorage.setItem("fifty_sound_katakana_mode", String(isKatakanaMode));
    } catch (e) {
      console.warn("localStorage restricted", e);
    }
  }, [isKatakanaMode]);

  useEffect(() => {
    audioSynth.setMute(isMuted);
    try {
      localStorage.setItem("fifty_sound_muted", String(isMuted));
    } catch (e) {
      console.warn("localStorage restricted", e);
    }
  }, [isMuted]);

  useEffect(() => {
    if (bgmEnabled && !isMuted) {
      audioSynth.startAmbientBGM();
    } else {
      audioSynth.stopAmbientBGM();
    }
    try {
      localStorage.setItem("fifty_sound_bgm", String(bgmEnabled));
    } catch (e) {
      console.warn("localStorage restricted", e);
    }
  }, [bgmEnabled, isMuted]);

  useEffect(() => {
    audioSynth.setVoiceType(voiceType);
    try {
      localStorage.setItem("fifty_sound_voice_type", voiceType);
    } catch (e) {
      console.warn("localStorage restricted", e);
    }
  }, [voiceType]);

  useEffect(() => {
    try {
      localStorage.setItem("fifty_sound_show_mascot", String(showMascot));
    } catch (e) {
      console.warn("localStorage restricted", e);
    }
  }, [showMascot]);

  // Robust gesture click handler to bind to AudioContext autoplay permissions
  useEffect(() => {
    const handleAutoplayGesture = () => {
      if (bgmEnabled && !isMuted) {
        audioSynth.startAmbientBGM();
      }
    };
    window.addEventListener("click", handleAutoplayGesture);
    return () => window.removeEventListener("click", handleAutoplayGesture);
  }, [bgmEnabled, isMuted]);

  // Initialize and retrieve storage
  useEffect(() => {
    try {
      const storedCards = localStorage.getItem("fifty_sound_unlocked_cards");
      if (storedCards) {
        setCollectedIds(JSON.parse(storedCards));
      }

      const storedPractices = localStorage.getItem("fifty_sound_practice_times");
      if (storedPractices) {
        setPracticeTimes(JSON.parse(storedPractices));
      }
    } catch (e) {
      console.error("Failed to load local storage keys:", e);
    }
  }, []);

  // Listen to active Ceremony item changes to trigger sound/voice effects
  useEffect(() => {
    if (currentPage === "unlocked_ceremony" && ceremonyCards.length > 0) {
      // Play slide whoosh sound
      audioSynth.playCardSlide();

      const currentCard = ceremonyCards[activeCeremonyIdx];
      if (currentCard) {
        // Speak pronunciation after short delay
        const timer = setTimeout(() => {
          audioSynth.speakJapanese(currentCard.kanaStr);
        }, 250);
        return () => clearTimeout(timer);
      }
    }
  }, [activeCeremonyIdx, currentPage, ceremonyCards]);

  // Keyboard controls for ceremony sliders (Left/Right arrows)
  useEffect(() => {
    if (currentPage !== "unlocked_ceremony" || ceremonyCards.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSlideDirection(-1);
        setActiveCeremonyIdx((prev) => (prev - 1 + ceremonyCards.length) % ceremonyCards.length);
      } else if (e.key === "ArrowRight") {
        setSlideDirection(1);
        setActiveCeremonyIdx((prev) => (prev + 1) % ceremonyCards.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, ceremonyCards, activeCeremonyIdx]);

  // Handler on training cycle finish
  const handleTrainingFinished = (rounds: number, kpm?: number, accuracy?: number, xpGained?: number) => {
    if (activeCards.length === 0) return;

    // Update practice times
    const nextPractices = { ...practiceTimes };
    activeCards.forEach((card) => {
      nextPractices[card.id] = (nextPractices[card.id] || 0) + rounds;
    });
    setPracticeTimes(nextPractices);
    try {
      localStorage.setItem("fifty_sound_practice_times", JSON.stringify(nextPractices));
    } catch (e) {
      console.warn("localStorage restricted", e);
    }

    // Record SRS spaced repetition progress
    try {
      const cardIds = activeCards.map(c => c.id);
      recordPracticeBatch(cardIds);
    } catch (e) {
      console.error("Failed to record SRS batch", e);
    }

    // Earn coins and Card XP / Leveling upgrades (D)
    const baseCoins = rounds * 20;
    const accBonus = accuracy && accuracy >= 80 ? Math.floor((accuracy - 50) * 0.8) : 0;
    const earnedCoins = Math.max(10, baseCoins + accBonus);
    setCoins((prev) => prev + earnedCoins);

    const nextUpgrades = { ...cardUpgrades };
    activeCards.forEach((card) => {
      const upgrade = nextUpgrades[card.id] || { level: 1, exp: 0, stars: 0 };
      const expGain = rounds * 25; // 25 XP per practice round
      let nextExp = upgrade.exp + expGain;
      let nextLevel = upgrade.level;
      while (nextExp >= 100 && nextLevel < 5) {
        nextExp -= 100;
        nextLevel += 1;
      }
      if (nextLevel >= 5) {
        nextLevel = 5;
        nextExp = Math.min(100, nextExp);
      }
      nextUpgrades[card.id] = { level: nextLevel, exp: nextExp, stars: upgrade.stars };
    });
    setCardUpgrades(nextUpgrades);

    // Save session logs for dynamic analytics trend visualization
    if (kpm !== undefined && accuracy !== undefined) {
      try {
        const storedLogs = localStorage.getItem("fifty_sound_session_log");
        const logs = storedLogs ? JSON.parse(storedLogs) : [];
        const newLog = {
          date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          kpm: kpm,
          accuracy: accuracy,
          xpGained: xpGained || 0,
          timestamp: Date.now()
        };
        // Keep last 15 sessions for the chart
        const updatedLogs = [...logs, newLog].slice(-15);
        localStorage.setItem("fifty_sound_session_log", JSON.stringify(updatedLogs));
      } catch (e) {
        console.warn("localStorage log write failed", e);
      }
    }

    // Handle card unlock criteria (needs at least 3 correct spellings)
    if (rounds >= 3) {
      const isNewUnlockList = activeCards.filter(card => !collectedIds.includes(card.id));
      if (isNewUnlockList.length > 0) {
        const nextCollected = [...collectedIds, ...isNewUnlockList.map(c => c.id)];
        setCollectedIds(nextCollected);
        try {
          localStorage.setItem("fifty_sound_unlocked_cards", JSON.stringify(nextCollected));
        } catch (e) {
          console.warn("localStorage restricted", e);
        }
      }

      setCeremonyCards(activeCards);
      setCeremonyRounds(rounds);
      setActiveCeremonyIdx(0);
      setSlideDirection(1);
      setCurrentPage("unlocked_ceremony");
    } else {
      // Just return to start
      setCurrentPage("start");
    }

    setActiveCards([]);
  };

  const handleImportData = (
    unlockedCards: string[], 
    ptTimes: Record<string, number>, 
    settings?: any,
    importedCoins?: number,
    importedUpgrades?: any
  ) => {
    setCollectedIds(unlockedCards);
    setPracticeTimes(ptTimes);
    if (importedCoins !== undefined) setCoins(importedCoins);
    if (importedUpgrades !== undefined) setCardUpgrades(importedUpgrades);
    if (settings) {
      if (settings.hasOwnProperty("muted")) setIsMuted(settings.muted);
      if (settings.hasOwnProperty("bgm")) setBgmEnabled(settings.bgm);
      if (settings.hasOwnProperty("voiceType")) setVoiceType(settings.voiceType);
      if (settings.hasOwnProperty("showMascot")) setShowMascot(settings.showMascot);
    }
  };

  const handleStartTraining = (cardsList: DictionaryItem[], durationMs: number) => {
    setActiveCards(cardsList);
    setActiveDurationMs(durationMs);
    setCurrentPage("training");
  };

  const celebrateCongratulationsEffect = () => {
    if (ceremonyCards.length === 0) return null;
    const card = ceremonyCards[activeCeremonyIdx] || ceremonyCards[0];

    return (
      <div className="min-h-screen bg-stone-950 text-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full bg-stone-900 border-2 border-amber-500 rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-2xl shadow-amber-500/10 relative overflow-hidden"
        >
          {/* Sparkles background halo */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Golden Ribbon banner */}
          <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto text-stone-900 shadow-lg shadow-amber-500/20">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-black text-amber-400">
              {ceremonyCards.length > 1 ? "恭喜联合熟化解锁全新闪卡群！" : "恭喜解锁全新闪卡！"}
            </h2>
            <p className="text-[11px] font-mono text-stone-400">NEW NOMINAL CARD COLLECTED</p>
          </div>

          {/* Premium Carousel with Framer Motion swiping physics and direction vectors */}
          <div className="relative flex flex-col items-center justify-center max-w-lg mx-auto py-3">
            <div className="flex items-center justify-center gap-4 w-full relative">
              {/* Left Navigation Arrow */}
              {ceremonyCards.length > 1 && (
                <button
                  onClick={() => {
                    setSlideDirection(-1);
                    setActiveCeremonyIdx((prev) => (prev - 1 + ceremonyCards.length) % ceremonyCards.length);
                  }}
                  className="w-10 h-10 rounded-full border border-stone-700 bg-stone-800 hover:bg-stone-800 text-stone-100 flex items-center justify-center transition-all duration-200 cursor-pointer shadow hover:scale-105 active:scale-95 focus:outline-none z-10"
                  aria-label="Previous card"
                >
                  <ChevronLeft className="w-6 h-6 text-amber-500" />
                </button>
              )}

              {/* Animating Card Viewport */}
              <div className="relative overflow-visible w-[240px] h-[330px] flex items-center justify-center select-none" style={{ perspective: "1200px" }}>
                {/* Vintage Card Stack Layers underneath to express tactical density */}
                <div className="absolute w-[228px] h-[298px] border border-stone-800/15 bg-stone-900/45 rounded-2xl rotate-[-2deg] translate-y-2 opacity-60 pointer-events-none shadow-sm transition-transform" />
                <div className="absolute w-[232px] h-[302px] border border-stone-800/20 bg-stone-900/30 rounded-2xl rotate-[1.5deg] translate-y-1 opacity-80 pointer-events-none shadow-md transition-transform" />

                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={card.id}
                    custom={slideDirection}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? 180 : -180,
                        y: 40, // Typewriter cylinder/carriage feed offset
                        opacity: 0,
                        rotateY: dir > 0 ? 70 : -70, // 3D page curl tilt
                        rotateZ: dir > 0 ? 8 : -8, // Cocked carriage tilt
                        scale: 0.82,
                        filter: "brightness(0.8) contrast(1.1)",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.4), 0 0 0 rgb(0 0 0 / 0)"
                      }),
                      center: {
                        x: 0,
                        y: 0,
                        opacity: 1,
                        rotateY: 0,
                        rotateZ: 0,
                        scale: 1,
                        filter: "brightness(1) contrast(1)",
                        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.55), 0 0 16px ${card.glowColor}`,
                        transition: {
                          x: { type: "spring", stiffness: 280, damping: 20 },
                          y: { type: "spring", stiffness: 300, damping: 22 },
                          rotateY: { type: "spring", stiffness: 220, damping: 18 },
                          rotateZ: { type: "spring", stiffness: 180, damping: 10, delay: 0.02 },
                          scale: { duration: 0.28, ease: "easeOut" },
                          filter: { duration: 0.25 }
                        }
                      },
                      exit: (dir: number) => ({
                        x: dir < 0 ? 180 : -180,
                        y: -55, // Mechanical eject slide upward
                        opacity: 0,
                        rotateY: dir < 0 ? -65 : 65,
                        rotateZ: dir < 0 ? -10 : 10,
                        scale: 0.85,
                        filter: "brightness(0.75)",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.4)",
                        transition: {
                          x: { type: "spring", stiffness: 300, damping: 24 },
                          y: { type: "spring", stiffness: 280, damping: 24 },
                          rotateY: { duration: 0.25 },
                          scale: { duration: 0.25 }
                        }
                      })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className={`p-6 rounded-2xl border-2 ${
                      card.rarity === "SSR" 
                        ? "bg-gradient-to-tr from-pink-300 via-purple-300 via-indigo-200 via-emerald-200 via-yellow-200 to-rose-200 border-amber-400 shadow-xl shadow-purple-500/20 animate-[pulse_3s_infinite]"
                        : `bg-gradient-to-br ${card.bgGradient} ${card.borderColor}`
                    } text-stone-950 w-[240px] h-[310px] space-y-4 flex flex-col justify-between relative cursor-pointer`}
                    style={{ 
                      backfaceVisibility: "hidden",
                      transformStyle: "preserve-3d"
                    }}
                    onClick={() => {
                      audioSynth.playCardSlide();
                      audioSynth.speakJapanese(card.kanaStr);
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono font-black border-b border-stone-950/5 pb-2">
                      <span>{card.rarityName}</span>
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        ★ UNLOCKED
                      </span>
                    </div>

                    <div className="text-center space-y-2 flex-grow flex flex-col justify-center py-4">
                      <h3 
                        className="text-4xl font-extrabold font-serif tracking-wide text-stone-900"
                        style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                      >
                        {card.kanji}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5 bg-stone-950/5 py-1 px-3 rounded-full w-max mx-auto hover:bg-stone-950/10 transition-colors">
                        <p className="text-xs font-mono font-bold text-stone-800 italic">{card.kanaStr}</p>
                        <Volume2 className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed font-sans border-t border-stone-950/10 pt-3 text-left line-clamp-4 min-h-[70px]">
                      {card.meaning}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Navigation Arrow */}
              {ceremonyCards.length > 1 && (
                <button
                  onClick={() => {
                    setSlideDirection(1);
                    setActiveCeremonyIdx((prev) => (prev + 1) % ceremonyCards.length);
                  }}
                  className="w-10 h-10 rounded-full border border-stone-700 bg-stone-800 hover:bg-stone-800 text-stone-100 flex items-center justify-center transition-all duration-200 cursor-pointer shadow hover:scale-105 active:scale-95 focus:outline-none z-10"
                  aria-label="Next card"
                >
                  <ChevronRight className="w-6 h-6 text-amber-500" />
                </button>
              )}
            </div>

            {/* Pagination Bullet Indicators */}
            {ceremonyCards.length > 1 && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex justify-center gap-1.5">
                  {ceremonyCards.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSlideDirection(idx > activeCeremonyIdx ? 1 : -1);
                        setActiveCeremonyIdx(idx);
                      }}
                      className={`h-2 transition-all rounded-full ${
                        idx === activeCeremonyIdx ? "w-6 bg-amber-500" : "w-2 bg-stone-700 hover:bg-stone-600"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="text-[10px] font-mono text-stone-400 select-none">
                  卡牌 {activeCeremonyIdx + 1} / {ceremonyCards.length} (也支持键盘左右物理方向键切卡)
                </div>
              </div>
            )}
          </div>

          <p className="text-stone-300 text-xs">
            你在本次限时练习里完成了连续 <span className="font-bold font-mono text-amber-400 text-sm">{ceremonyRounds}</span> 轮极致熟化拼写！<br />
            {ceremonyCards.length > 1 ? "这批卡牌" : "该卡牌"}已经永久存放进您的 <b>“个人收藏馆”</b>，您可以随时翻阅并请求博学人工智能 <b>Gemini 解构文化故事</b>。
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                setCeremonyCards([]);
                setCurrentPage("start");
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              🔒 永久存入个人图鉴藏馆
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-paper bg-japanese-pattern text-ink font-sans pb-12 transition-colors">
      {/* Upper Navigation Header */}
      <header className="bg-[#F3EFE3] border-b border-stone-300 sticky top-0 z-40 select-none">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            onClick={() => { if (currentPage !== "training") { setCurrentPage("start"); setIsDrawerOpen(false); } }} 
            className="flex items-center gap-1.5 cursor-pointer shrink-0 font-serif font-black tracking-widest text-stone-900 text-sm md:text-base uppercase"
          >
            <span>KATAKATA 假名图鉴</span>
          </div>

          <div className="flex items-center gap-4 md:gap-6 shrink-0 font-serif text-xs md:text-sm text-stone-700">
            {/* Premium Mode Segmented Toggle Switch (Highly Visible & Responsive 3-Way Mode) */}
            <div className="flex items-center bg-stone-200/60 p-0.5 rounded-full border border-stone-300 shadow-inner select-none">
              <button
                onClick={() => {
                  setIsEnglishMode(false);
                  setIsKatakanaMode(false);
                  audioSynth.playCardSlide();
                }}
                className={`px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  !isEnglishMode && !isKatakanaMode
                    ? "bg-[#C4482A] text-white shadow-xs font-black scale-102"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-300/30"
                }`}
                title="平假名模式"
              >
                <span>🇯🇵</span>
                <span className="hidden xs:inline">平假</span>
              </button>
              <button
                onClick={() => {
                  setIsEnglishMode(true);
                  setIsKatakanaMode(false);
                  audioSynth.playCardSlide();
                }}
                className={`px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  isEnglishMode
                    ? "bg-stone-900 text-[#F3EFE3] shadow-xs font-black scale-102"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-300/30"
                }`}
                title="英文模式"
              >
                <span>🔤</span>
                <span className="hidden xs:inline">EN</span>
              </button>
              <button
                onClick={() => {
                  setIsEnglishMode(false);
                  setIsKatakanaMode(true);
                  audioSynth.playCardSlide();
                }}
                className={`px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  !isEnglishMode && isKatakanaMode
                    ? "bg-amber-600 text-white shadow-xs font-black scale-102"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-300/30"
                }`}
                title="片假名模式"
              >
                <span>⛩️</span>
                <span className="hidden xs:inline">片假</span>
              </button>
            </div>

            {currentPage !== "training" ? (
              <>
                <button
                  onClick={() => { setCurrentPage("start"); setIsDrawerOpen(false); }}
                  className={`cursor-pointer hover:text-[#C4482A] transition-colors ${currentPage === "start" ? "text-stone-950 font-black border-b-2 border-stone-900 pb-0.5" : "text-stone-600"}`}
                >
                  练习
                </button>
                <button
                  onClick={() => { setCurrentPage("library"); setIsDrawerOpen(false); }}
                  className={`cursor-pointer hover:text-[#C4482A] transition-colors ${currentPage === "library" ? "text-stone-950 font-black border-b-2 border-stone-900 pb-0.5" : "text-stone-600"}`}
                >
                  收藏
                </button>
                <div className="flex items-center gap-1 text-stone-700 select-none">
                  <span>岁币</span>
                  <span className="font-bold text-[#C4482A]">{toHanNumerals(coins)}</span>
                </div>
              </>
            ) : (
              <div className="px-3 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-mono font-bold text-amber-700 flex items-center gap-1 animate-pulse">
                <span>锁定深度熟化中...</span>
              </div>
            )}

            <button
              onClick={() => setIsDrawerOpen(prev => !prev)}
              className="p-1 text-stone-850 hover:text-[#C4482A] transition-colors text-lg md:text-xl font-bold focus:outline-none cursor-pointer"
              title="设置与工具"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Elegant Wabi-Sabi Slide-Over Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Drawer Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-stone-950/40 z-40 cursor-pointer"
            />
            
            {/* Drawer Body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#F3EFE3] border-l border-stone-300 z-50 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-300 pb-3">
                  <h3 className="font-serif font-black text-stone-900 text-lg uppercase tracking-wider">秘藏和风阁设定</h3>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-stone-400 hover:text-stone-900 text-lg font-black transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Sound & Music Group */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-stone-800 text-xs uppercase tracking-widest text-[#C4482A]">声乐雅韵 / Audio & BGM</h4>
                  <div className="flex items-center justify-between p-3 rounded bg-white/50 border border-stone-200">
                    <span className="text-xs font-serif text-stone-700">主音量开关 (Master Silence)</span>
                    <button
                      onClick={() => {
                        setIsMuted(!isMuted);
                        audioSynth.playCardSlide();
                      }}
                      className={`px-3 py-1 text-xs rounded border transition-all cursor-pointer ${
                        isMuted 
                          ? "bg-rose-50 border-rose-300 text-rose-600" 
                          : "bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200"
                      }`}
                    >
                      {isMuted ? "已静音" : "开启"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded bg-white/50 border border-stone-200">
                    <span className="text-xs font-serif text-stone-700">禅意背景音乐 (Ambient Zen BGM)</span>
                    <button
                      onClick={() => {
                        setBgmEnabled(!bgmEnabled);
                        audioSynth.playCardSlide();
                      }}
                      className={`px-3 py-1 text-xs rounded border transition-all cursor-pointer ${
                        bgmEnabled && !isMuted
                          ? "bg-amber-50 border-amber-300 text-amber-800 animate-pulse" 
                          : "bg-stone-100 border-stone-300 text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      {bgmEnabled ? "和乐开启" : "静音"}
                    </button>
                  </div>
                </div>

                {/* Companion Mascot Group */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-stone-800 text-xs uppercase tracking-widest text-[#C4482A]">契约守护灵 / Mascot Companion</h4>
                  <div className="flex items-center justify-between p-3 rounded bg-white/50 border border-stone-200">
                    <div className="flex flex-col">
                      <span className="text-xs font-serif text-stone-700">召唤守护灵福狸酱</span>
                      <span className="text-[10px] text-stone-400 font-sans">互动反馈 & 快捷功能</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowMascot(!showMascot);
                        audioSynth.playCardSlide();
                      }}
                      className={`px-3 py-1 text-xs rounded border transition-all cursor-pointer ${
                        showMascot 
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                          : "bg-stone-100 border-stone-300 text-stone-400 hover:bg-stone-200"
                      }`}
                    >
                      {showMascot ? "福狸在侧" : "藏纳柜中"}
                    </button>
                  </div>
                </div>

                {/* Teacher Voice Group */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-stone-800 text-xs uppercase tracking-widest text-[#C4482A]">假名导师 / Pronunciation Voice</h4>
                  <div className="p-3 rounded bg-white/50 border border-stone-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-serif text-stone-700">声优音色</span>
                      <select
                        value={voiceType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVoiceType(val);
                          audioSynth.playCardSlide();
                        }}
                        className="text-xs font-serif text-stone-800 bg-white border border-stone-300 rounded px-2 py-1 outline-none cursor-pointer"
                      >
                        <option value="female">女声导师</option>
                        <option value="male">男声导师</option>
                        <option value="child">童声伴读</option>
                        <option value="alien">外星人声</option>
                        <option value="elderly">智慧老人</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Narrative Style Group */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-stone-800 text-xs uppercase tracking-widest text-[#C4482A]">世界观学术语 / Theme Narrative Style</h4>
                  <div className="p-3 rounded bg-white/50 border border-stone-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-serif text-stone-700">文风背景</span>
                      <select
                        value={narrativeStyle}
                        onChange={(e) => {
                          setNarrativeStyle(e.target.value as NarrativeStyle);
                          audioSynth.playCardSlide();
                        }}
                        className="text-xs font-serif text-stone-800 bg-white border border-stone-300 rounded px-2 py-1 outline-none cursor-pointer"
                      >
                        <option value="cultural">🏮 人文古风</option>
                        <option value="mythology">⛩️ 神道传说</option>
                        <option value="academic">🏫 现代学术</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Online Timer */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-stone-800 text-xs uppercase tracking-widest text-[#C4482A]">本次课时计时 / Session Live Duration</h4>
                  <div className="p-3 rounded bg-white/50 border border-stone-200 flex items-center justify-between">
                    <span className="text-xs font-serif text-stone-700">当前修行时长</span>
                    <OnlineTimer isEnglishMode={isEnglishMode} narrativeStyle={narrativeStyle} />
                  </div>
                </div>
              </div>

              {/* Decorative Drawer stamp or footer */}
              <div className="border-t border-stone-300 pt-4 mt-6 text-center text-[10px] text-stone-400 font-mono">
                KATAKATA SYSTEM CONFIG PANEL V1.2
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pages Container with smooth animations */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentPage === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <StartPage
                onStartTraining={handleStartTraining}
                onGoToLibrary={() => setCurrentPage("library")}
                onGoToSpellRush={() => setCurrentPage("spell_rush")}
                onGoToMemoryMatch={() => setCurrentPage("memory_match")}
                onGoToKanaTraining={(type) => {
                  setTrainingKanaType(type || "hiragana");
                  setCurrentPage("kana_training");
                }}
                collectedIds={collectedIds}
                practiceTimes={practiceTimes}
                practiceMode={practiceMode}
                setPracticeMode={setPracticeMode}
                isEnglishMode={isEnglishMode}
                isKatakanaMode={isKatakanaMode}
                narrativeStyle={narrativeStyle}
              />
            </motion.div>
          )}

          {currentPage === "training" && activeCards.length > 0 && (
            <motion.div
              key="training"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <TrainingPage
                items={activeCards}
                durationMs={activeDurationMs}
                onFinished={handleTrainingFinished}
                practiceMode={practiceMode}
                onKeyStrike={(action) => {
                  setLastAction(action);
                  // Quick timeout reset to avoid double-triggers
                  setTimeout(() => setLastAction(""), 120);
                }}
                onQuit={() => {
                  setCurrentPage("start");
                  setActiveCards([]);
                }}
                isEnglishMode={isEnglishMode}
                isKatakanaMode={isKatakanaMode}
              />
            </motion.div>
          )}

          {currentPage === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <CardLibraryPage
                collectedIds={collectedIds}
                practiceTimes={practiceTimes}
                onGoBack={() => setCurrentPage("start")}
                onImportData={handleImportData}
                isEnglishMode={isEnglishMode}
                isKatakanaMode={isKatakanaMode}
                coins={coins}
                setCoins={setCoins}
                cardUpgrades={cardUpgrades}
                setCardUpgrades={setCardUpgrades}
              />
            </motion.div>
          )}

          {currentPage === "unlocked_ceremony" && (
            <motion.div
              key="ceremony"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {celebrateCongratulationsEffect()}
            </motion.div>
          )}

          {currentPage === "spell_rush" && (
            <motion.div
              key="spell_rush"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <SpellRushPage
                collectedIds={collectedIds}
                onGoBack={() => setCurrentPage("start")}
                isEnglishMode={isEnglishMode}
                isKatakanaMode={isKatakanaMode}
                coins={coins}
                setCoins={setCoins}
                narrativeStyle={narrativeStyle}
              />
            </motion.div>
          )}

          {currentPage === "memory_match" && (
            <motion.div
              key="memory_match"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <MemoryMatchPage
                collectedIds={collectedIds}
                onGoBack={() => setCurrentPage("start")}
                isEnglishMode={isEnglishMode}
                isKatakanaMode={isKatakanaMode}
                coins={coins}
                setCoins={setCoins}
                narrativeStyle={narrativeStyle}
              />
            </motion.div>
          )}

          {currentPage === "kana_training" && (
            <motion.div
              key="kana_training"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <KanaTrainingPage
                onGoBack={() => setCurrentPage("start")}
                narrativeStyle={narrativeStyle}
                coins={coins}
                setCoins={setCoins}
                defaultKanaType={trainingKanaType}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mascot Companion rendered conditionally with state bindings */}
      {showMascot && (
        <MascotComponent 
          currentPage={currentPage} 
          lastAction={lastAction} 
          voiceType={voiceType} 
          isEnglishMode={isEnglishMode}
          onToggleEnglishMode={() => setIsEnglishMode(p => !p)}
          practiceMode={practiceMode}
        />
      )}

      {/* Footer information bar */}
      <footer className="text-center text-stone-400 py-6 text-xs font-mono max-w-xl mx-auto space-y-1.5 border-t border-stone-200 select-none">
        <p>©Katakata「カタカタ」五十音集卡练习 2026 EDITION. POWERED BY GOOGLE DEEPMIND GEMINI & REACT.</p>
        <p className="text-[10px] text-stone-300">
          DESIGNED FOR CLASSICAL JAPANESE ROMAJI LEARNING RETENTION. ALL INTELLECTUAL PROPERTY SECURED.
        </p>
      </footer>
    </div>
  );
}
