import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Keyboard, ArrowLeft, RefreshCw, Volume2, VolumeX, AlertTriangle, Play, Pause, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, PenTool, Maximize2, Minimize2, Zap } from "lucide-react";
import { DictionaryItem } from "../data/dictionary";
import { TracingKana } from "./TracingKana";
import { audioSynth, TypingSoundStyle } from "../utils/audio";
import { CardIllustration } from "./CardIllustration";
import { CalligraphyCanvas } from "./CalligraphyCanvas";
import { uiTranslate, LANG_MAPPING } from "../utils/lang";

interface TrainingPageProps {
  items: DictionaryItem[];
  durationMs: number;
  onFinished: (rounds: number, kpm?: number, accuracy?: number, xpGained?: number) => void;
  onQuit: () => void;
  practiceMode?: "typing" | "handwriting";
  onKeyStrike?: (action: "correct" | "error" | "complete") => void;
  isEnglishMode?: boolean;
  isKatakanaMode?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const TrainingPage: React.FC<TrainingPageProps> = ({
  items,
  durationMs,
  onFinished,
  onQuit,
  practiceMode = "typing",
  onKeyStrike,
  isEnglishMode = false,
  isKatakanaMode = false,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  // Loop sequential indices
  const [currentItemIdx, setCurrentItemIdx] = useState<number>(0);
  const item = items[currentItemIdx] || items[0];

  // Animated sliding direction indicator
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Timer states
  const [endTime, setEndTime] = useState<number>(() => Date.now() + durationMs);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(durationMs);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);

  // Sound control
  const [muted, setMuted] = useState<boolean>(() => audioSynth.getMuted());
  const [speechRate, setSpeechRate] = useState<number>(() => audioSynth.getSpeechRate());
  const [typingSoundStyle, setTypingSoundStyle] = useState<TypingSoundStyle>(() => audioSynth.getTypingSoundStyle());

  const handleCycleSpeechRate = () => {
    const rates = [1.0, 1.25, 1.5, 1.75, 0.8];
    const current = audioSynth.getSpeechRate();
    const nextIdx = (rates.findIndex((r) => Math.abs(r - current) < 0.05) + 1) % rates.length;
    const newRate = rates[nextIdx >= 0 ? nextIdx : 1];
    audioSynth.setSpeechRate(newRate);
    setSpeechRate(newRate);
    audioSynth.playCardSlide();
  };

  const handleCycleTypingSound = () => {
    const styles: { id: TypingSoundStyle; label: string }[] = [
      { id: "crisp", label: "清脆青轴" },
      { id: "typewriter", label: "打字机" },
      { id: "bubble", label: "清脆水滴" },
      { id: "soft", label: "清音木作" },
    ];
    const currentIdx = styles.findIndex((s) => s.id === typingSoundStyle);
    const nextStyle = styles[(currentIdx + 1) % styles.length].id;
    audioSynth.setTypingSoundStyle(nextStyle);
    setTypingSoundStyle(nextStyle);
    audioSynth.playTyping({ volume: 1.0, isCompletion: true });
  };

  // Loop/Typewriter spelling states
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState<number>(0);
  const [romajiProgress, setRomajiProgress] = useState<string>("");
  const [wordCorrect, setWordCorrect] = useState<boolean>(false); // Triggers final word completion "描红" trace view
  const [isPronouncing, setIsPronouncing] = useState<boolean>(false); // Tracks whether full word audio is currently playing
  const [errorFlash, setErrorFlash] = useState<boolean>(false);
  const [handwritingPassed, setHandwritingPassed] = useState<boolean>(false);

  // Game/RPG Arcade States
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [sessionXpEarned, setSessionXpEarned] = useState<number>(0);
  const [xpPopups, setXpPopups] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  const [xp, setXp] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("fifty_sound_xp") || "0");
    } catch {
      return 0;
    }
  });

  const triggerXpGain = (points: number, label: string = "XP") => {
    const nextXp = xp + points;
    setXp(nextXp);
    setSessionXpEarned(prev => prev + points);
    try {
      localStorage.setItem("fifty_sound_xp", String(nextXp));
    } catch (e) {
      console.warn(e);
    }
    
    const newPopup = {
      id: Date.now() + Math.random(),
      text: `+${points} ${label}`,
      x: Math.random() * 80 - 40,
      y: Math.random() * -60 - 30,
    };
    setXpPopups(prev => [...prev, newPopup]);
  };

  useEffect(() => {
    setHandwritingPassed(false);
  }, [currentItemIdx]);

  // Monitor physical keystrokes
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Keep a reference of time values for background robustness
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const showQuitConfirmRef = useRef(showQuitConfirm);
  showQuitConfirmRef.current = showQuitConfirm;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainTerminalRef = useRef<HTMLDivElement>(null);
  const lastProcessedKeyRef = useRef<{ key: string; time: number } | null>(null);

  // Automatically keep keyboard focus on initial mount if desired, but NEVER re-focus on currentItemIdx changes
  // Calling .focus() on item transitions causes mobile WebKit/Chrome to violently scroll to the top!
  useEffect(() => {
    // Only on initial mount or when unpausing
    if (practiceMode !== "handwriting" && !isPaused && !timerFinished && !showQuitConfirm) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isPaused, timerFinished, showQuitConfirm, practiceMode]);

  // Background and minimization resilience:
  // Instead of subtracting 1 second progressively, we compute the delta against endTime.
  useEffect(() => {
    // Sound initialization check
    audioSynth.setMute(muted);

    const tick = () => {
      if (isPausedRef.current || timerFinished || showQuitConfirmRef.current) return;

      const now = Date.now();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeftMs(0);
        setTimerFinished(true);
        audioSynth.playTimeCompleted();
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setTimeLeftMs(difference);
      }
    };

    timerRef.current = setInterval(tick, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [endTime, timerFinished, muted]);

  // Adjust end time when resuming from Pause state
  const handleTogglePause = () => {
    if (isPaused) {
      // Resuming training
      setEndTime(Date.now() + timeLeftMs);
      setIsPaused(false);
    } else {
      // Pausing training
      setIsPaused(true);
    }
  };

  // Sound mute toggle
  const handleToggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    audioSynth.setMute(nextMute);
  };

  // Keyboard layout for visual representation (Typing game vibe)
  const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];

  // Core spelling engine input validator
  const processInputKey = (key: string, fromHardwareListener: boolean = false) => {
    if (practiceMode === "handwriting") return;
    if (isPaused || timerFinished || wordCorrect || isPronouncing) return;

    // Normalize full-width or alternative dots / hyphens / quotes from various keyboards & IMEs
    let normalizedKey = key;
    if (normalizedKey === "。" || normalizedKey === "·" || normalizedKey === "・") {
      normalizedKey = ".";
    }
    if (normalizedKey === "—" || normalizedKey === "–") {
      normalizedKey = "-";
    }
    if (normalizedKey === "’" || normalizedKey === "‘") {
      normalizedKey = "'";
    }

    // Accept alphabetic, numeric, space, and valid punctuation: dot (.), hyphen (-), underscore (_), apostrophe, slash, etc.
    const isValidKey = /^[a-z0-9]$/.test(normalizedKey) || 
      normalizedKey === " " || 
      normalizedKey === "." || 
      normalizedKey === "-" || 
      normalizedKey === "_" || 
      normalizedKey === "'" || 
      normalizedKey === "," || 
      normalizedKey === "/" || 
      normalizedKey === "&";
    if (!isValidKey) return;

    // De-duplicate rapid duplicate events (e.g. from keydown + onChange firing together within 30ms)
    const now = Date.now();
    if (lastProcessedKeyRef.current && 
        lastProcessedKeyRef.current.key === normalizedKey && 
        now - lastProcessedKeyRef.current.time < 30) {
      return;
    }
    lastProcessedKeyRef.current = { key: normalizedKey, time: now };

    setPressedKey(normalizedKey === " " ? "SPACE" : (normalizedKey === "." ? "." : normalizedKey.toUpperCase()));
    setTimeout(() => setPressedKey(null), 150);

    const segment = item.segments[currentSegmentIdx];
    const proposedString = romajiProgress + normalizedKey;

    // Check if proposedString is a prefix match of any acceptable romaji
    const isPrefixOfAny = segment.romaji.some(r => r.startsWith(proposedString));
    const isMatchOfAny = segment.romaji.some(r => r === proposedString);

    if (isMatchOfAny) {
      // Correct character fully completed! Play mechanical typewriter strike
      audioSynth.playTyping({ isCompletion: true, volume: 1.0 });
      audioSynth.playCharacterResolved();
      
      setCorrectCount(prev => prev + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      // Standard XP reward
      triggerXpGain(3, "XP");
      
      // Extra combo rewards for multiples of 5
      if (nextCombo >= 5 && nextCombo % 5 === 0) {
        triggerXpGain(Math.floor(nextCombo / 5) * 2, "Combo! 🔥");
      }

      setRomajiProgress("");
      
      // Advance segment index or complete whole word
      if (currentSegmentIdx + 1 >= item.segments.length) {
        // Entire phrase/word spelled correctly!
        setWordCorrect(true);
        setIsPronouncing(true);
        audioSynth.playTypewriterBell();
        audioSynth.playFanfare();
        if (onKeyStrike) onKeyStrike("complete");

        // Reward major word-complete bonus!
        triggerXpGain(10 + item.segments.length * 2, "Word Mastery ✨");
        
        const romajiHint = item.segments.map(s => s.displayRomaji || (s.romaji && s.romaji[0]) || "").join("");
        const langHint: "ja" | "es" | "en" = (item as any).lang || (isEnglishMode ? "en" : "ja");

        // Speak full word clearly with automatic language detection, kanji hints, and romaji fallback
        audioSynth.speakFullWord(
          item.kanaStr || item.kanji,
          () => {
            // Reading finished! Crisp micro-pause for natural acoustics, then advance to next word
            const advancePauseMs = Math.max(40, Math.round(70 / Math.max(0.8, audioSynth.getSpeechRate())));
            setTimeout(() => {
              setIsPronouncing(false);
              setCompletedRounds(prev => prev + 1);
              setSlideDirection(1);
              audioSynth.playCarriageReturn();
              setCurrentItemIdx((prevIdx) => (prevIdx + 1) % items.length);
              setCurrentSegmentIdx(0);
              setRomajiProgress("");
              setWordCorrect(false);
            }, advancePauseMs);
          },
          item.kanji,
          romajiHint,
          langHint
        );
      } else {
        // Only speak instant syllable for Japanese kana. In English and Spanish alphabet typing, avoid queuing letter voices so the speech engine is completely clear for zero-lag full-word pronunciation upon completion!
        if (!isEnglishMode && (item as any).lang !== "es") {
          audioSynth.speakKanaInstant(segment.kana);
        }
        setCurrentSegmentIdx(currentSegmentIdx + 1);
        if (onKeyStrike) onKeyStrike("correct");
      }
    } else if (isPrefixOfAny) {
      // Mid-spelling of romaji character (e.g. typed 't' of 'tsu')
      if (!fromHardwareListener) {
        audioSynth.playTyping({ volume: 0.65 });
      }
      setRomajiProgress(proposedString);
      
      setCorrectCount(prev => prev + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      triggerXpGain(1, "XP");
      if (nextCombo >= 5 && nextCombo % 5 === 0) {
        triggerXpGain(Math.floor(nextCombo / 5) * 2, "Combo! 🔥");
      }

      if (onKeyStrike) onKeyStrike("correct");
    } else {
      // Typing error/deviation! Trigger a warning shake and reset entire word.
      audioSynth.playError();
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 300);

      setErrorCount(prev => prev + 1);
      setCombo(0);

      // Reset to first kana segment on error (forced deep learning reinforcement!)
      setCurrentSegmentIdx(0);
      setRomajiProgress("");
      if (onKeyStrike) onKeyStrike("error");
    }
  };

  // Keep processInputKey fresh using a Ref to avoid stale closure issues in the event listener
  const processInputKeyRef = useRef(processInputKey);
  useEffect(() => {
    processInputKeyRef.current = processInputKey;
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // If the user is typing inside an input or textarea element, ignore the window-level keydown 
      // listener to prevent double-triggering. We use tagNames instead of instanceof to be robust inside iframes/realms.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      
      // Prevent default browser scroll when spacebar is pressed during training/typing
      if (e.key === " ") {
        e.preventDefault();
      }

      let key = e.key;
      // Allow dot, punctuation, or lowercase letter
      if (key !== " " && key !== "." && key !== "-" && key !== "_" && key !== "'" && key !== "。" && key !== "·" && key !== "・") {
        key = key.toLowerCase();
      }

      // Play subtle mechanical typewriter keystroke sound in the input listener
      const isTypingChar = /^[a-z0-9]$/.test(key) || 
        key === " " || key === "." || key === "-" || key === "_" || key === "'" || key === "。" || key === "·" || key === "・";
      if (isTypingChar && !isPaused && !timerFinished && !wordCorrect && practiceMode !== "handwriting") {
        audioSynth.playTyping({ volume: 0.65 });
      }

      processInputKeyRef.current(key, true);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isPaused, timerFinished, wordCorrect, practiceMode]);

  // Formatter for time display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const ss = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const currentSegment = item.segments[currentSegmentIdx];

  // Helper to determine active alphabet guidelines
  const getExpectedPrefixHelp = () => {
    if (wordCorrect || isPronouncing) {
      return isEnglishMode 
        ? "🔊 Spelling Complete! Reading full word pronunciation (auto-advancing after reading)..." 
        : "🔊 全部拼写正确！正在朗读完整词汇读音（朗读完毕后自动切换下一词）...";
    }
    if (isPaused) {
      return isEnglishMode ? "Practice paused. Press Space or [Resume] to continue." : "训练暂停中，按下 [暂停/继续] 或空格继续";
    }
    
    // Provide neat prompt of expected correct letter keys to tap
    const currentExpecteds = currentSegment.romaji.map(r => r.substring(romajiProgress.length));
    return isEnglishMode 
      ? `Press: ${currentExpecteds.map(x => {
          const char = x[0] || "";
          if (char === " ") return "[SPACE]";
          if (char === ".") return "[DOT .]";
          if (char === "-") return "[HYPHEN -]";
          return `[${char.toUpperCase()}]`;
        }).join(" or ")}`
      : `当前假名拼写预期: ${currentExpecteds.map(x => `[${x[0] || ""}]`).join(" 或 ")}`;
  };

  // Triggers final wrap-up and submits the score to claim the card
  const handleClaimCard = () => {
    const minutes = (durationMs - Math.max(0, timeLeftMs)) / 60000 || 0.1;
    const finalKpm = correctCount > 0 ? Math.round(correctCount / minutes) : 0;
    const totalKeys = correctCount + errorCount;
    const finalAccuracy = totalKeys > 0 ? Math.round((correctCount / totalKeys) * 100) : 100;

    onFinished(completedRounds, finalKpm, finalAccuracy, sessionXpEarned);
  };

  return (
    <div 
      className="max-w-3xl mx-auto space-y-2.5 sm:space-y-6 px-2 md:px-0"
      onClick={() => {
        if (practiceMode !== "handwriting" && !isPaused && !timerFinished && !showQuitConfirm) {
          const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
          if (isMobileDevice) {
            inputRef.current?.focus({ preventScroll: true });
          }
        }
      }}
    >
      {/* Upper bar: Quit & Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 bg-white hover:bg-stone-50 hover:text-stone-900 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>作废并退出</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick Speech Rate Cycler */}
          <button
            type="button"
            onClick={handleCycleSpeechRate}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-amber-50 text-stone-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={`点击循环调整朗读语速 (当前: ${speechRate}x)`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>{speechRate}x</span>
          </button>

          {/* Typing Sound Style Switcher */}
          <button
            type="button"
            onClick={handleCycleTypingSound}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-amber-50 text-stone-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={`点击切换击键音效 (当前: ${typingSoundStyle === "crisp" ? "清脆青轴" : typingSoundStyle === "typewriter" ? "复古打字机" : typingSoundStyle === "bubble" ? "清脆水滴" : "清音木作"})`}
          >
            <Keyboard className="w-3.5 h-3.5 text-amber-600" />
            <span>{typingSoundStyle === "crisp" ? "清脆青轴" : typingSoundStyle === "typewriter" ? "打字机" : typingSoundStyle === "bubble" ? "水滴气泡" : "清音木作"}</span>
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isFullscreen
                  ? "border-[#C4482A] bg-[#C4482A]/10 text-[#C4482A]"
                  : "border-stone-300 bg-white hover:bg-stone-50 text-stone-600"
              }`}
              title={isFullscreen ? "退出全屏 (Esc)" : "全屏沉浸模式 (隐藏浏览器域名与工具栏)"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-lg border text-stone-600 ${
              muted ? "border-red-300 bg-red-50 text-red-600" : "border-stone-300 bg-white hover:bg-stone-50"
            }`}
            title={muted ? "解除静音" : "静音"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main retro Terminal casing */}
      <div ref={mainTerminalRef} className={`p-3 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 relative scroll-mt-6 ${
        errorFlash 
          ? "border-red-600 bg-red-50/20 shadow-[0_0_20px_rgba(239,68,68,0.25)]" 
          : "border-stone-800 bg-stone-50 shadow-md"
      }`}>
        
        {/* Top ribbon: Clock and Score counter */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 pb-2 sm:pb-4 border-b border-stone-300 items-center">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-[8px] sm:text-[10px] font-mono text-stone-500 tracking-wider">RETRO TERMINAL COUNTDOWN</div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={`text-xl sm:text-3xl md:text-4xl font-mono font-black ${
                timeLeftMs < 30000 && !isPaused ? "text-red-600 animate-pulse font-extrabold" : "text-stone-900"
              }`}>
                {formatTime(timeLeftMs)}
              </span>
              <button
                onClick={handleTogglePause}
                disabled={timerFinished}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  isPaused 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-stone-50" 
                    : "bg-amber-600 hover:bg-amber-700 text-stone-900"
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? "继续" : "暂停"}</span>
              </button>
            </div>
          </div>

          <div className="text-right space-y-0.5 sm:space-y-1">
            <div className="text-[8px] sm:text-[10px] font-mono text-stone-500 tracking-wider">COMPLETED ROUNDS</div>
            <div className="text-xl sm:text-3xl md:text-4xl font-extrabold font-serif text-indigo-900">
              {completedRounds} <span className="text-xs sm:text-sm font-sans font-medium text-stone-500">轮</span>
            </div>
          </div>
        </div>

        {/* If group training, show queue progress indicator */}
        {items.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 pb-2 sm:pb-4 pt-2 sm:pt-4 border-b border-stone-200 select-none">
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest mr-1">
              联训序列:
            </span>
            {items.map((it, idx) => {
              const isActive = idx === currentItemIdx;
              return (
                <div
                  key={it.id}
                  className={`px-3 py-1 rounded-xl text-xs transition-all font-serif font-black ${
                    isActive
                      ? "bg-amber-500 text-stone-950 scale-105 shadow-sm border border-amber-600 animate-pulse"
                      : "bg-stone-200 text-stone-500 border border-stone-300 opacity-60"
                  }`}
                >
                  {it.kanji}
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Card Slider Carousel Area */}
        <div className="relative overflow-hidden my-2 sm:my-4 min-h-[240px] sm:min-h-[300px] py-3 sm:py-6 flex items-center justify-between px-1 sm:px-12 bg-white/40 rounded-xl sm:rounded-2xl border border-stone-200 shadow-inner">
          
          {/* Slide Left Button */}
          <button
            onClick={() => {
              if (items.length <= 1 || isPronouncing || wordCorrect) return;
              setSlideDirection(-1);
              audioSynth.playCarriageReturn();
              setCurrentItemIdx((prev) => (prev - 1 + items.length) % items.length);
              setCurrentSegmentIdx(0);
              setRomajiProgress("");
              setWordCorrect(false);
            }}
            disabled={items.length <= 1 || isPronouncing || wordCorrect}
            className={`p-2.5 rounded-full border border-stone-300 bg-white text-stone-600 transition-all z-10 ${
              items.length <= 1 || isPronouncing || wordCorrect
                ? "opacity-25 cursor-not-allowed"
                : "hover:bg-amber-100 hover:text-amber-900 active:scale-95 shadow-sm cursor-pointer"
            }`}
            title="查看上一张卡（拼写状态将重置）"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Animated Card Body Container */}
          <div className="flex-1 overflow-hidden py-4 flex justify-center relative">
            {/* Floating Arcade XP Popups */}
            <AnimatePresence>
              {xpPopups.map(popup => (
                <motion.div
                  key={popup.id}
                  initial={{ opacity: 1, scale: 0.8, y: 0 }}
                  animate={{ opacity: 0, scale: 1.25, y: popup.y, x: popup.x }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  onAnimationComplete={() => {
                    setXpPopups(prev => prev.filter(p => p.id !== popup.id));
                  }}
                  className="absolute pointer-events-none text-amber-500 font-mono font-black text-sm z-50 drop-shadow-md select-none"
                  style={{ top: "45%", left: "50%" }}
                >
                  {popup.text}
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={currentItemIdx}
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection * 120, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -slideDirection * 120, scale: 0.96 }}
                transition={{ type: "spring", damping: 20, stiffness: 140 }}
                className="w-full flex flex-col items-center justify-center space-y-2.5 sm:space-y-4"
              >
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] sm:text-[10px] text-amber-800 font-mono tracking-wider font-bold uppercase bg-amber-500/10 border border-amber-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      {item.categoryName} ・ {item.rarity} 稀有度
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const romajiHint = item.segments.map(s => s.displayRomaji || (s.romaji && s.romaji[0]) || "").join("");
                        const langHint: "ja" | "es" | "en" = (item as any).lang || (isEnglishMode ? "en" : "ja");
                        audioSynth.speakFullWord(item.kanaStr || item.kanji, undefined, item.kanji, romajiHint, langHint);
                      }}
                      className="p-1 rounded-full text-stone-500 hover:text-amber-700 hover:bg-amber-100/80 transition-all cursor-pointer"
                      title="朗读当前词条发音"
                      aria-label="朗读发音"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCycleSpeechRate();
                        const romajiHint = item.segments.map(s => s.displayRomaji || (s.romaji && s.romaji[0]) || "").join("");
                        const langHint: "ja" | "es" | "en" = (item as any).lang || (isEnglishMode ? "en" : "ja");
                        audioSynth.speakFullWord(item.kanaStr || item.kanji, undefined, item.kanji, romajiHint, langHint);
                      }}
                      className="px-1.5 py-0.5 rounded-full bg-amber-100/70 hover:bg-amber-100 text-amber-900 border border-amber-300/60 font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5 active:scale-95"
                      title="切换发音语速 (0.8x - 1.75x)"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-600" />
                      <span>{speechRate}x</span>
                    </button>
                  </div>
                  <h3 className="text-stone-750 font-medium font-serif text-xs sm:text-sm mt-1 sm:mt-1.5 opacity-90 leading-relaxed max-w-lg mx-auto">
                    {item.meaning}
                  </h3>
                </div>

                {/* Practice Mode Conditional Rendering */}
                {practiceMode === "handwriting" ? (
                  <div className="w-full space-y-4">
                    <CalligraphyCanvas
                      segments={item.segments}
                      onPassChange={(passed) => {
                        setHandwritingPassed(passed);
                      }}
                    />
                    
                    {handwritingPassed && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex justify-center pt-2"
                      >
                        <button
                          onClick={() => {
                            audioSynth.speakJapanese(item.kanaStr, false);
                            setCompletedRounds((prev) => prev + 1);
                            setSlideDirection(1);
                            audioSynth.playCarriageReturn();
                            setCurrentItemIdx((prevIdx) => (prevIdx + 1) % items.length);
                            setCurrentSegmentIdx(0);
                            setRomajiProgress("");
                            setWordCorrect(false);
                            setHandwritingPassed(false);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 hover:text-stone-50 font-black text-sm tracking-wider rounded-xl border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] cursor-pointer transition-all flex items-center gap-2 animate-pulse"
                        >
                          <PenTool className="w-4 h-4" />
                          <span>契印契合通过！晋级下一个词条 ＞</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Gridded TracingKana slots array */}
                    <div className={`flex items-center justify-center py-2 max-w-full ${
                      isEnglishMode 
                        ? "flex-nowrap gap-1 sm:gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1" 
                        : "flex-wrap gap-2.5 sm:gap-4"
                    }`}>
                      {item.segments.map((segment, idx) => {
                        const isCorrectSegment = wordCorrect || idx < currentSegmentIdx;
                        const isActiveSegment = !wordCorrect && idx === currentSegmentIdx;
                        const currentTypingProgress = isActiveSegment ? romajiProgress : "";

                        return (
                          <TracingKana
                            key={idx}
                            kana={segment.kana}
                            displayRomaji={segment.displayRomaji}
                            romajiProgress={currentTypingProgress}
                            isCorrect={isCorrectSegment}
                            active={isActiveSegment}
                            isEnglishMode={isEnglishMode}
                          />
                        );
                      })}
                    </div>

                    {/* Guidelines info label under input block */}
                    <div className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all font-mono select-none ${
                      wordCorrect 
                        ? "bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm" 
                        : "bg-white border-stone-200 text-stone-600 shadow-sm"
                    }`}>
                      {getExpectedPrefixHelp()}
                    </div>

                    {/* Live Game Combo and XP Info Overlay */}
                    {practiceMode !== "handwriting" && (
                      <div className="flex items-center justify-between gap-2 sm:gap-4 mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-stone-900/5 rounded-lg border border-stone-200/50 text-[10px] sm:text-xs font-mono select-none">
                        <div className="flex items-center gap-1.5 text-stone-500">
                          <span>LEVEL</span>
                          <span className="font-black text-stone-800">{Math.floor(xp / 250) + 1}</span>
                          <span className="text-[10px] text-stone-400">({xp % 250}/250 XP)</span>
                        </div>
                        
                        {combo > 0 && (
                          <motion.div
                            key={combo}
                            initial={{ scale: 0.8, rotate: -5 }}
                            animate={{ scale: [1, 1.25, 1], rotate: [0, 5, 0] }}
                            className="flex items-center gap-1 font-black text-amber-600 tracking-wider"
                          >
                            <span>{combo} COMBO</span>
                            <span className="animate-pulse">🔥</span>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Right Button */}
          <button
            onClick={() => {
              if (items.length <= 1 || isPronouncing || wordCorrect) return;
              setSlideDirection(1);
              audioSynth.playCarriageReturn();
              setCurrentItemIdx((prev) => (prev + 1) % items.length);
              setCurrentSegmentIdx(0);
              setRomajiProgress("");
              setWordCorrect(false);
            }}
            disabled={items.length <= 1 || isPronouncing || wordCorrect}
            className={`p-2.5 rounded-full border border-stone-300 bg-white text-stone-600 transition-all z-10 ${
              items.length <= 1 || isPronouncing || wordCorrect
                ? "opacity-25 cursor-not-allowed"
                : "hover:bg-amber-100 hover:text-amber-900 active:scale-95 shadow-sm cursor-pointer"
            }`}
            title="查看下一张卡（拼写状态将重置）"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* The Retro Mechanical Keyboard Emulator */}
        {practiceMode !== "handwriting" && (
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-stone-300 space-y-1 sm:space-y-2">
            <div className="text-center text-[8px] sm:text-[10px] font-mono text-stone-400 tracking-wider select-none">
              VIRTUAL TYPEWRITER PRESSURE PLATES
            </div>
            
            <div className="flex flex-col gap-1 sm:gap-1.5 max-w-lg mx-auto bg-stone-900 p-1.5 sm:p-3 rounded-lg sm:rounded-xl border border-stone-700 shadow-inner">
              {KEYBOARD_ROWS.map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-1">
                  {row.map((char) => {
                    const isPressed = pressedKey === char;
                    
                    // Highlight keys that could be next character targets
                    const isGuideKey = !isPaused && !timerFinished && !wordCorrect &&
                      currentSegment.romaji.some(
                        r => r.startsWith(romajiProgress) && 
                        r[romajiProgress.length]?.toUpperCase() === char
                      );

                    return (
                      <motion.button
                        key={char}
                        whileTap={{ scale: 0.85 }}
                        animate={{
                          scale: isPressed ? 0.9 : 1,
                          y: isPressed ? 2 : 0,
                        }}
                        onClick={() => {
                          processInputKey(char.toLowerCase());
                        }}
                        className={`w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center rounded text-[9px] sm:text-xs font-mono font-bold transition-all select-none cursor-pointer ${
                          isPressed
                            ? "bg-amber-500 text-stone-950 shadow-inner"
                            : isGuideKey
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)] animate-pulse"
                            : "bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-750"
                        }`}
                      >
                        {char}
                      </motion.button>
                    );
                  })}
                </div>
              ))}

              {isEnglishMode && (
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: pressedKey === "SPACE" ? 0.95 : 1,
                      y: pressedKey === "SPACE" ? 2 : 0,
                    }}
                    onClick={() => {
                      processInputKey(" ");
                    }}
                    className={`w-28 sm:w-40 h-5.5 sm:h-7 flex items-center justify-center rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all select-none border cursor-pointer ${
                      pressedKey === "SPACE"
                        ? "bg-amber-500 text-stone-950 border-amber-600 shadow-inner"
                        : (!isPaused && !timerFinished && !wordCorrect && currentSegment.romaji.some(r => r.startsWith(romajiProgress) && r[romajiProgress.length] === " "))
                        ? "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)] animate-pulse"
                        : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750"
                    }`}
                  >
                    Space
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: pressedKey === "." ? 0.95 : 1,
                      y: pressedKey === "." ? 2 : 0,
                    }}
                    onClick={() => {
                      processInputKey(".");
                    }}
                    title="Dot / Period (.)"
                    className={`w-8 sm:w-10 h-5.5 sm:h-7 flex items-center justify-center rounded text-xs font-mono font-bold transition-all select-none border cursor-pointer ${
                      pressedKey === "."
                        ? "bg-amber-500 text-stone-950 border-amber-600 shadow-inner"
                        : (!isPaused && !timerFinished && !wordCorrect && currentSegment.romaji.some(r => r.startsWith(romajiProgress) && r[romajiProgress.length] === "."))
                        ? "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)] animate-pulse"
                        : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750"
                    }`}
                  >
                    .
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: pressedKey === "-" ? 0.95 : 1,
                      y: pressedKey === "-" ? 2 : 0,
                    }}
                    onClick={() => {
                      processInputKey("-");
                    }}
                    title="Hyphen (-)"
                    className={`w-8 sm:w-10 h-5.5 sm:h-7 flex items-center justify-center rounded text-xs font-mono font-bold transition-all select-none border cursor-pointer ${
                      pressedKey === "-"
                        ? "bg-amber-500 text-stone-950 border-amber-600 shadow-inner"
                        : (!isPaused && !timerFinished && !wordCorrect && currentSegment.romaji.some(r => r.startsWith(romajiProgress) && r[romajiProgress.length] === "-"))
                        ? "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)] animate-pulse"
                        : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750"
                    }`}
                  >
                    -
                  </motion.button>
                </div>
              )}
            </div>

            {/* Hidden Input for Mobile Native Keyboard Triggering (Centered without jumping) */}
            <div className="flex flex-col items-center justify-center pt-1.5 sm:pt-3 gap-1 sm:gap-2 relative">
              <input
                ref={inputRef}
                type="text"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length > 0) {
                    const lastChar = val[val.length - 1];
                    processInputKey(lastChar.toLowerCase());
                  }
                  e.target.value = "";
                }}
                className="opacity-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none z-0"
                aria-hidden="true"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  audioSynth.playCardSlide();
                  inputRef.current?.focus({ preventScroll: true });
                }}
                className="md:hidden relative z-10 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[10px] sm:text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <Keyboard className="w-3.5 h-3.5 text-stone-950" />
                <span>唤起手机键盘</span>
              </button>
              <p className="md:hidden relative z-10 text-[8px] sm:text-[9px] text-stone-400 font-mono text-center leading-normal">
                (提示: 点击上方虚拟按键或点击唤起键盘)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Completion Modal / Shield when Timer Ends */}
      <AnimatePresence>
        {timerFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-stone-50 rounded-2xl border-2 border-stone-800 p-6 md:p-8 text-center space-y-6 shadow-xl relative overflow-hidden"
            >
              {/* Gold laurels stamp */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

              <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-600">
                <Keyboard className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 
                  className="text-3xl font-black text-stone-950 font-serif"
                  style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                >
                  ⏳ 训练时间达成！
                </h2>
                <p className="text-xs font-mono text-stone-400">SESSION TIME CYCLE ELAPSED</p>
                <div className="text-stone-600 text-sm">
                  <p>
                    你对{isEnglishMode ? (items.length > 1 ? "单词组合" : "单词") : (items.length > 1 ? "人名组合" : "人名")}{" "}
                    <span className="font-bold text-stone-900 font-serif">
                      “{items.length > 1 ? items.map((it) => it.kanji).join("、") : item.kanji}”
                    </span>{" "}
                    完成了连续{" "}
                    <span className="font-mono text-lg font-black text-amber-600">
                      {completedRounds}
                    </span>{" "}
                    轮极致熟化拼写！
                  </p>
                </div>
              </div>

              {/* Dynamic stats overview panel */}
              {practiceMode !== "handwriting" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-100/80 rounded-xl border border-stone-200/60 text-left">
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 block uppercase">{isEnglishMode ? "SPEED (KPM)" : "打字速率 (KPM)"}</span>
                    <span className="text-base font-black text-stone-900 font-mono">
                      {correctCount > 0 ? Math.round(correctCount / ((durationMs - Math.max(0, timeLeftMs)) / 60000 || 0.1)) : 0} <span className="text-[10px] font-normal text-stone-500">键/分</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 block uppercase">{isEnglishMode ? "ACCURACY" : "拼写正确率"}</span>
                    <span className="text-base font-black text-stone-900 font-mono">
                      {correctCount + errorCount > 0 ? Math.round((correctCount / (correctCount + errorCount)) * 100) : 100}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 block uppercase">{isEnglishMode ? "MAX COMBO" : "最高连击数"}</span>
                    <span className="text-base font-black text-orange-600 font-mono">
                      {maxCombo} <span className="text-[10px] font-normal text-stone-500">Hits</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 block uppercase">{isEnglishMode ? "XP EARNED" : "本轮获得修为"}</span>
                    <span className="text-base font-black text-amber-600 font-mono">
                      +{sessionXpEarned} <span className="text-[10px] font-normal text-stone-500">XP</span>
                    </span>
                  </div>
                </div>
              )}

              {completedRounds >= 3 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs font-mono">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>恭喜：卡牌已解锁 CONGRATULATIONS: CARD UNLOCKED!</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    由于你的辛勤练习，你的手指已经记住了这个{isEnglishMode ? "英文单词" : "名字"}。你成功得到了专属卡牌！你可以随时通过收藏馆查看它，并能请求 <b>Gemini AI 分解它的独特文化轶事</b>。
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 text-red-650" />
                    <span>练习轮数偏少 UNLOCKED CRITERIA ALERT</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    本词最少需要成功输入 <b>3</b> 轮（当前完成：{completedRounds} 轮），才能够成功解锁。不要气馁，建议再次开启一个短训练周期，深度扎实练习！
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {completedRounds < 3 ? (
                  <>
                    <button
                      onClick={onQuit}
                      className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-sm transition-all cursor-pointer"
                    >
                      返回首页
                    </button>
                    <button
                      onClick={() => {
                        setEndTime(Date.now() + durationMs);
                        setTimeLeftMs(durationMs);
                        setCompletedRounds(0);
                        setCurrentSegmentIdx(0);
                        setRomajiProgress("");
                        setTimerFinished(false);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>重新开始</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleClaimCard}
                    className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-amber-600 hover:text-stone-950 text-stone-50 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer cursor-custom select-none"
                  >
                    <span>🎁 翻开并永久收录此闪卡</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Custom styled Confirmation dialog for exiting training session */}
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-2xl border-2 border-stone-800 p-6 md:p-8 text-center space-y-6 shadow-xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 flex items-center justify-center mx-auto text-red-650">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-stone-950 font-serif">
                  确定要作废本次练习并退出吗？
                </h3>
                <p className="text-xs font-mono text-stone-400">ABORT AND TERMINATE PRACTICE CURRENT CYCLE</p>
                <div className="text-xs text-stone-600 leading-normal">
                  <p>
                    中途退出后，本次已拼写了 <span className="font-bold font-mono text-amber-600 text-sm">{completedRounds}</span> 轮，但由于未到计时结束无法存留成绩。本次练习将会作废，且无法获得该卡牌！
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    // Resume training and append the delta spent in modal
                    setEndTime(Date.now() + timeLeftMs);
                    setShowQuitConfirm(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-205 text-stone-800 font-bold text-xs font-sans transition-all cursor-pointer select-none"
                >
                  🛡️ 留在这里，继续拼写
                </button>
                <button
                  onClick={onQuit}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs font-sans transition-all cursor-pointer select-none"
                >
                  🚪 意已决，狠心退出
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
