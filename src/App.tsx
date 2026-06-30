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
import { DictionaryItem } from "./data/dictionary";
import { audioSynth } from "./utils/audio";
import { uiTranslate } from "./utils/lang";
import { NarrativeStyle, nTrans } from "./utils/narrative";

type ScreenState = "start" | "training" | "library" | "unlocked_ceremony" | "spell_rush" | "memory_match" | "kana_training";

export default function App() {
  const [currentPage, setCurrentPage] = useState<ScreenState>("start");
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

  const [onlineSeconds, setOnlineSeconds] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatOnlineTime = (totalSecs: number, isEng: boolean) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (isEng) {
      if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
      if (mins > 0) return `${mins}m ${secs}s`;
      return `${secs}s`;
    } else {
      if (hrs > 0) return `${hrs}小时${mins}分${secs}秒`;
      if (mins > 0) return `${mins}分${secs}秒`;
      return `${secs}秒`;
    }
  };

  // Selection for active training
  const [activeCards, setActiveCards] = useState<DictionaryItem[]>([]);
  const [activeDurationMs, setActiveDurationMs] = useState<number>(3 * 60 * 1000);

  // Custom uploaded/pasted user dictionary cards (decommissioned & purged as requested)
  const [customCards, setCustomCards] = useState<DictionaryItem[]>([]);

  // Purge any existing custom cards from local storage immediately to ensure privacy & cleanliness
  useEffect(() => {
    try {
      localStorage.removeItem("fifty_sound_custom_cards");
    } catch (_) {}
  }, []);
  
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
                  className="w-10 h-10 rounded-full border border-stone-700 bg-stone-850 hover:bg-stone-800 text-stone-100 flex items-center justify-center transition-all duration-200 cursor-pointer shadow hover:scale-105 active:scale-95 focus:outline-none z-10"
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
                  className="w-10 h-10 rounded-full border border-stone-700 bg-stone-850 hover:bg-stone-800 text-stone-100 flex items-center justify-center transition-all duration-200 cursor-pointer shadow hover:scale-105 active:scale-95 focus:outline-none z-10"
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
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans pb-12 transition-colors">
      {/* Upper Navigation Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 select-none">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          <div 
            onClick={() => { if (currentPage !== "training") setCurrentPage("start"); }} 
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-100 text-sm font-serif font-black">
              カ
            </div>
            <div>
              <span className="font-serif font-black tracking-tight text-stone-900">Katakata「カタカタ」</span>
              <span className="text-[9px] font-mono block text-stone-400 -mt-1 font-bold">50-SOUNDS COLLECTIVE TRAINING</span>
            </div>
          </div>

          {/* Controls Hub for Audio Synth, Ambient BGM, and Mascot Companion */}
          <div className="flex items-center gap-1.5 border-t border-b md:border-t-0 md:border-b-0 border-r-0 border-l-0 md:border-l md:border-r border-stone-200 py-1.5 md:py-0 md:px-3 mx-2 shrink-0 flex-wrap justify-center">
            {/* Master Silence Switch */}
            <button
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                audioSynth.playCardSlide();
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isMuted 
                  ? "bg-rose-50 border-rose-300 text-rose-600 shadow-sm" 
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
              title={isMuted ? "已静音所有声效 - 点击开启" : "音效正常 - 点击静音"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Ambient Chill Zen BGM Switch */}
            <button
              onClick={() => {
                const next = !bgmEnabled;
                setBgmEnabled(next);
                audioSynth.playCardSlide();
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                bgmEnabled && !isMuted
                  ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm animate-pulse" 
                  : "bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100"
              }`}
              title={bgmEnabled ? "和风禅意背景背景音已开启 - 点击关闭" : "背景背景音已关闭 - 点击开启"}
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Mascot Companion switch */}
            <button
              onClick={() => {
                const next = !showMascot;
                setShowMascot(next);
                audioSynth.playCardSlide();
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                showMascot 
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm" 
                  : "bg-stone-50 border-stone-200 text-stone-400 hover:bg-stone-100"
              }`}
              title={showMascot ? "守护灵福狸酱已召唤 - 点击收回" : "召唤守护灵福狸酱"}
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Pronunciation Voice Switcher (女声/男声/童声/外星人/老人) */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-1.5 py-1 rounded-lg shadow-sm">
              <Mic className="w-3.5 h-3.5 text-stone-400 animate-pulse" />
              <select
                value={voiceType}
                onChange={(e) => {
                  const val = e.target.value;
                  setVoiceType(val);
                  audioSynth.playCardSlide();
                  // Speak a short confirmation test word so the user hears the audio swap instantly
                  setTimeout(() => {
                    if (val === "male") {
                      audioSynth.speakJapanese("はじめまして"); // Nice to meet you (male voice)
                    } else if (val === "child") {
                      audioSynth.speakJapanese("にほんご"); // Japanese Language (child/mascot voice)
                    } else if (val === "alien") {
                      audioSynth.speakJapanese("われわれは"); // "We are..." (Sci-Fi alien trope test speech)
                    } else if (val === "elderly") {
                      audioSynth.speakJapanese("ようこそ"); // Welcome (wise elderly style)
                    } else {
                      audioSynth.speakJapanese("さくら"); // Sakura/Cherry Blossom (standard female voice)
                    }
                  }, 120);
                }}
                className="text-[10px] font-mono font-bold text-stone-700 bg-transparent outline-none border-none py-0.5 cursor-pointer max-w-[90px] sm:max-w-none"
                title={isEnglishMode ? "Select Japanese pronunciation presenter voice type" : "选择五十音导师朗读发音类型"}
              >
                <option value="female">{isEnglishMode ? "Female Voice" : "女声导师"}</option>
                <option value="male">{isEnglishMode ? "Male Voice" : "男声导师"}</option>
                <option value="child">{isEnglishMode ? "Child Companion" : "童声伴读"}</option>
                <option value="alien">{isEnglishMode ? "Alien Echo" : "外星人声"}</option>
                <option value="elderly">{isEnglishMode ? "Elderly Wisdom" : "智慧老人"}</option>
              </select>
            </div>

            {/* Inclusive Narrative & Vocabulary Style Switcher */}
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-1.5 py-1 rounded-lg shadow-sm">
              <span className="text-xs select-none">🎭</span>
              <select
                value={narrativeStyle}
                onChange={(e) => {
                  setNarrativeStyle(e.target.value as NarrativeStyle);
                  audioSynth.playCardSlide();
                }}
                className="text-[10px] font-mono font-bold text-stone-700 bg-transparent outline-none border-none py-0.5 cursor-pointer max-w-[90px] sm:max-w-none"
                title={isEnglishMode ? "Select theme terminology narrative style" : "选择语境与术语风格（对无信仰者友好选择）"}
              >
                <option value="cultural">🏮 {isEnglishMode ? "Cultural Style" : "人文古风"}</option>
                <option value="mythology">⛩️ {isEnglishMode ? "Mythology Style" : "神道传说"}</option>
                <option value="academic">🏫 {isEnglishMode ? "Academic Style" : "现代学术"}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* ⏱️ Online Session Timer */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 shadow-sm text-stone-700"
              title={isEnglishMode ? "Current online duration of this session" : `本次网页在线时间：${nTrans("onlineTime", narrativeStyle)}`}
            >
              <Clock className="w-3.5 h-3.5 text-stone-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-stone-600 flex items-center gap-1">
                <span className="opacity-70 text-[9px] font-sans font-normal">{nTrans("onlineTime", narrativeStyle)}:</span>
                <span>{formatOnlineTime(onlineSeconds, isEnglishMode)}</span>
              </span>
            </div>

            {currentPage !== "training" && (
              <>
                {/* 🪙 Gamified Coins Counter */}
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-sm text-stone-850"
                  title={narrativeStyle === "mythology" ? "我的和币：在集卡藏馆中用于召唤卡包或强化卡牌等级" : narrativeStyle === "cultural" ? "我的岁币：在集卡藏馆中用于兑换卡包或提升卡牌等级" : "我的积分：在卡牌库中用于解锁卡包和评估等级"}
                >
                  <span className="text-xs select-none">🪙</span>
                  <span className="text-xs font-mono font-black text-amber-800">{coins} {nTrans("coinName", narrativeStyle)}</span>
                </div>

                <button
                  onClick={() => setCurrentPage("start")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    currentPage === "start" 
                      ? "bg-stone-900 text-stone-50" 
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{uiTranslate("🏫 练习大厅", isEnglishMode, "练习大厅")}</span>
                </button>
                <button
                  onClick={() => setCurrentPage("library")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    currentPage === "library" 
                      ? "bg-stone-900 text-stone-50" 
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>{uiTranslate("个人收藏馆", isEnglishMode, "个人收藏馆")}</span>
                </button>
              </>
            )}
            {currentPage === "training" && (
              <div className="px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-700 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEnglishMode ? "Deep Practice Active..." : "锁定深度熟化练习中..."}</span>
              </div>
            )}
          </div>
        </div>
      </header>

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
                onGoToKanaTraining={() => setCurrentPage("kana_training")}
                collectedIds={collectedIds}
                practiceTimes={practiceTimes}
                practiceMode={practiceMode}
                setPracticeMode={setPracticeMode}
                isEnglishMode={isEnglishMode}
                customCards={customCards}
                setCustomCards={setCustomCards}
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
                customCards={customCards}
                setCustomCards={setCustomCards}
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
          DESIGNED FOR CLASSICAL JAPANESE ROMAJI LEARNING RETENTION. ALL INTELLECTUALS SECURE.
        </p>
      </footer>
    </div>
  );
}
