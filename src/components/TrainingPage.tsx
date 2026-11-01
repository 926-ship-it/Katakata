import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Keyboard, ArrowLeft, RefreshCw, Volume2, VolumeX, AlertTriangle, Play, Pause, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, PenTool, Maximize2, Minimize2, Zap, BookOpen } from "lucide-react";
import { DictionaryItem } from "../data/dictionary";
import { TracingKana } from "./TracingKana";
import { audioSynth, TypingSoundStyle, AmbientSoundType } from "../utils/audio";
import { CardIllustration } from "./CardIllustration";
import { CalligraphyCanvas } from "./CalligraphyCanvas";
import { uiTranslate, LANG_MAPPING } from "../utils/lang";
import { SessionTrendChart } from "./SessionTrendChart";
import { saveSessionLog } from "../utils/sessionLogs";
import { getEnglishPhonetic } from "../utils/englishPhonetics";
import { DailyZineModal } from "./DailyZineModal";
import { ColoredSyllableWord } from "./ColoredSyllableWord";
import { mapWordSegmentsToSyllables, splitWordIntoSyllables, getSyllableColor } from "../utils/syllableColorHelper";


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
  const item = (items && items.length > 0) ? (items[currentItemIdx] || items[0]) : null;

  // Animated sliding direction indicator
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Timer states with minimum duration protection (prevent instant timeout)
  const effectiveDuration = durationMs > 0 ? durationMs : 3 * 60 * 1000;
  const [endTime, setEndTime] = useState<number>(() => Date.now() + effectiveDuration);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(effectiveDuration);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);
  const [showPhonetic, setShowPhonetic] = useState<boolean>(true);
  const [showMeaning, setShowMeaning] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fifty_sound_show_meaning") !== "false";
    } catch {
      return true;
    }
  });
  const hasSavedSessionLogRef = useRef<boolean>(false);
  const advanceRoundRef = useRef<(() => void) | null>(null);

  // Sound control
  const [muted, setMuted] = useState<boolean>(() => audioSynth.getMuted());
  const [speechRate, setSpeechRate] = useState<number>(() => audioSynth.getSpeechRate());
  const [typingSoundStyle, setTypingSoundStyle] = useState<TypingSoundStyle>(() => audioSynth.getTypingSoundStyle());

  // Ambient soundscape states (雨落窗棂、打字机书房、古风书斋、翻书沙沙声)
  const [ambientType, setAmbientType] = useState<AmbientSoundType>(() => audioSynth.getAmbientType());
  const [ambientVolume, setAmbientVolume] = useState<number>(() => audioSynth.getAmbientVolume());
  const [showAmbientMenu, setShowAmbientMenu] = useState<boolean>(false);

  // Synchronize ambient audio lifecycle during full-screen or standard practice
  useEffect(() => {
    if (ambientType !== "none" && !isPaused && !timerFinished && !muted) {
      audioSynth.startAmbient(ambientType, ambientVolume);
    } else {
      audioSynth.stopAmbient();
    }
    return () => {
      audioSynth.stopAmbient();
    };
  }, [ambientType, isPaused, timerFinished, muted, ambientVolume]);

  const AMBIENT_OPTIONS: { id: AmbientSoundType; label: string; icon: string; desc: string }[] = [
    { id: "none", label: "无白噪音", icon: "🔇", desc: "静心练习，仅敲击音效" },
    { id: "rain", label: "雨落窗棂", icon: "🌧️", desc: "细雨拍打 Art Nouveau 彩窗" },
    { id: "study", label: "古风书斋", icon: "🕯️", desc: "暖炉微炭与沉浸式书斋" },
    { id: "typewriter", label: "打字机室", icon: "⌨️", desc: "机械轻敲与滚轮回车氛围" },
    { id: "paper", label: "古风书卷", icon: "📜", desc: "宣纸轻翻与翻书沙沙声" },
  ];

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
  const [isZineOpen, setIsZineOpen] = useState<boolean>(false);

  // Virtual Keyboard collapsible state (saves ~220px vertical space to keep entire word card in view)
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("fifty_sound_show_vk");
      if (saved !== null) return saved === "true";
      return true;
    } catch {
      return true;
    }
  });

  const toggleVirtualKeyboard = () => {
    setShowVirtualKeyboard((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("fifty_sound_show_vk", String(next));
      } catch (_) {}
      return next;
    });
  };

  // Phonics Syllable Color-Coding (e.g. TODAY: to in green, day in red)
  const [showSyllableColor, setShowSyllableColor] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("fifty_sound_syllable_color");
      if (saved !== null) return saved === "true";
      return true; // Enabled by default to guide phonics chunking
    } catch {
      return true;
    }
  });

  const toggleSyllableColor = () => {
    setShowSyllableColor((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("fifty_sound_syllable_color", String(next));
      } catch (_) {}
      return next;
    });
  };

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

  const [isMeaningExpanded, setIsMeaningExpanded] = useState<boolean>(false);

  useEffect(() => {
    setHandwritingPassed(false);
    setIsMeaningExpanded(false);
    currentSegmentIdxRef.current = 0;
    romajiProgressRef.current = "";
    completedSegmentsCountRef.current = 0;
    lastProcessedKeyRef.current = null;
  }, [currentItemIdx]);

  // Automatically record this session log when practice cycle finishes
  useEffect(() => {
    if (timerFinished && !hasSavedSessionLogRef.current && (correctCount > 0 || completedRounds > 0)) {
      hasSavedSessionLogRef.current = true;
      const minutes = (effectiveDuration - Math.max(0, timeLeftMs)) / 60000 || 0.1;
      const finalKpm = correctCount > 0 ? Math.round(correctCount / minutes) : 0;
      const totalKeys = correctCount + errorCount;
      const finalAccuracy = totalKeys > 0 ? Math.round((correctCount / totalKeys) * 100) : 100;

      saveSessionLog({
        kpm: finalKpm,
        accuracy: finalAccuracy,
        xpGained: sessionXpEarned,
      });
    }
  }, [timerFinished, effectiveDuration, timeLeftMs, correctCount, errorCount, completedRounds, sessionXpEarned]);

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
  const lastProcessedKeyRef = useRef<{ key: string; time: number; fromHardware?: boolean } | null>(null);
  const currentSegmentIdxRef = useRef<number>(0);
  const romajiProgressRef = useRef<string>("");
  const completedSegmentsCountRef = useRef<number>(0);

  // Scroll to the very top upon entering training mode so full card and countdown are immediately visible
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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
  // Enforces strict 1-to-1 character matching and exact word length correspondence.
  // Prohibits short-circuiting or skipping of repeated letters (e.g. "auu").
  const processInputKey = (key: string, fromHardwareListener: boolean = false) => {
    if (practiceMode === "handwriting") return;

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

    // Responsive Space key actions: unpause or immediate advance on completed word
    if (normalizedKey === " ") {
      if (isPaused) {
        handleTogglePause();
        return;
      }
      if ((wordCorrect || isPronouncing) && advanceRoundRef.current) {
        advanceRoundRef.current();
        return;
      }
    }

    if (isPaused || timerFinished || wordCorrect || isPronouncing) return;

    // De-duplicate rapid duplicate events to prevent synthetic DOM echoes (e.g. keydown + onChange firing together)
    // 1) Alternating source filter: if identical key arrives from an alternate event source within 150ms, discard echo.
    // 2) Mechanical bounce filter: humans cannot physically strike, release, and strike the same key in < 55ms.
    const now = Date.now();
    if (lastProcessedKeyRef.current && lastProcessedKeyRef.current.key === normalizedKey) {
      const elapsed = now - lastProcessedKeyRef.current.time;
      if (lastProcessedKeyRef.current.fromHardware !== fromHardwareListener && elapsed < 150) {
        return;
      }
      if (elapsed < 55) {
        return;
      }
    }
    lastProcessedKeyRef.current = { key: normalizedKey, time: now, fromHardware: fromHardwareListener };

    setPressedKey(normalizedKey === " " ? "SPACE" : (normalizedKey === "." ? "." : normalizedKey.toUpperCase()));
    setTimeout(() => setPressedKey(null), 150);

    const activeSegIdx = currentSegmentIdxRef.current;
    if (activeSegIdx >= item.segments.length) return;

    const segment = item.segments[activeSegIdx];
    const currentProgress = romajiProgressRef.current;
    const proposedString = currentProgress + normalizedKey;

    // Check if proposedString is a prefix match or complete match of any acceptable romaji for THIS segment
    const isPrefixOfAny = segment.romaji.some(r => r.startsWith(proposedString));
    const isMatchOfAny = segment.romaji.some(r => r === proposedString);

    if (isMatchOfAny) {
      // Correct character/segment fully matched! Play crisp completion strike
      audioSynth.playTyping({ isCompletion: true, volume: 1.0 });

      // Synchronously record completed segment and advance pointer
      completedSegmentsCountRef.current += 1;
      const nextSegmentIdx = activeSegIdx + 1;
      currentSegmentIdxRef.current = nextSegmentIdx;
      romajiProgressRef.current = "";

      setCurrentSegmentIdx(nextSegmentIdx);
      setRomajiProgress("");

      setCorrectCount(prev => prev + 1);
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      triggerXpGain(3, "XP");
      if (nextCombo >= 5 && nextCombo % 5 === 0) {
        triggerXpGain(Math.floor(nextCombo / 5) * 2, "Combo! 🔥");
      }

      // Check if entire word is finished:
      // STRICT CONSTRAINT: user input length must equal target segment length exactly
      // and every segment from 0 to length-1 must have been completed.
      if (nextSegmentIdx === item.segments.length && completedSegmentsCountRef.current === item.segments.length) {
        // Entire phrase/word spelled correctly!
        setWordCorrect(true);
        setIsPronouncing(true);
        audioSynth.playTypewriterBell();
        audioSynth.playFanfare();
        if (onKeyStrike) onKeyStrike("complete");

        triggerXpGain(10 + item.segments.length * 2, "Word Mastery ✨");
        
        const romajiHint = item.segments.map(s => s.displayRomaji || (s.romaji && s.romaji[0]) || "").join("");
        const langHint: "ja" | "es" | "en" = (item as any).lang || (isEnglishMode ? "en" : "ja");

        // Speak full word clearly with automatic language detection, kanji hints, and multi-source fallback
        let roundAdvanced = false;
        const doAdvanceRound = () => {
          if (roundAdvanced) return;
          roundAdvanced = true;
          advanceRoundRef.current = null;
          setIsPronouncing(false);
          setCompletedRounds((prev) => prev + 1);
          setSlideDirection(1);
          audioSynth.playCarriageReturn();
          setCurrentItemIdx((prevIdx) => (prevIdx + 1) % items.length);
          currentSegmentIdxRef.current = 0;
          romajiProgressRef.current = "";
          completedSegmentsCountRef.current = 0;
          lastProcessedKeyRef.current = null;
          setCurrentSegmentIdx(0);
          setRomajiProgress("");
          setWordCorrect(false);
        };

        advanceRoundRef.current = doAdvanceRound;

        const roundFailsafe = setTimeout(doAdvanceRound, 1200);

        audioSynth.speakFullWord(
          item.kanaStr || item.kanji,
          () => {
            clearTimeout(roundFailsafe);
            // Reading finished! Crisp micro-pause for natural acoustics, then advance to next word
            const advancePauseMs = Math.max(40, Math.round(70 / Math.max(0.8, audioSynth.getSpeechRate())));
            setTimeout(doAdvanceRound, advancePauseMs);
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
        if (onKeyStrike) onKeyStrike("correct");
      }
    } else if (isPrefixOfAny) {
      // Mid-spelling of romaji character (e.g. typed 't' of 'tsu')
      audioSynth.playTyping({ volume: 0.85 });
      romajiProgressRef.current = proposedString;
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
      // If the user tapped space, but the current segment does not expect a space:
      // In typing practice, users frequently tap space reflexively.
      // Give a gentle notice flash without destructively resetting partially typed word progress!
      if (normalizedKey === " ") {
        audioSynth.playTyping({ volume: 0.5 });
        setErrorFlash(true);
        setTimeout(() => setErrorFlash(false), 200);
        return;
      }

      // Typing error/deviation! Trigger a warning shake and reset entire word.
      audioSynth.playError();
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 300);

      setErrorCount(prev => prev + 1);
      setCombo(0);

      // Reset to first segment on error
      currentSegmentIdxRef.current = 0;
      romajiProgressRef.current = "";
      completedSegmentsCountRef.current = 0;
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
      // Strict prohibition on hardware key repeat auto-advancing consecutive duplicate letters (e.g. holding 'u' in 'auu')
      if (e.repeat) return;

      // If the user is typing inside an input or textarea element, ignore the window-level keydown 
      // listener to prevent double-triggering. We use tagNames instead of instanceof to be robust inside iframes/realms.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      
      // Prevent default browser scroll when spacebar is pressed during training/typing
      if (e.key === " ") {
        e.preventDefault();
        if (isPaused) {
          handleTogglePause();
          return;
        }
        if ((wordCorrect || isPronouncing) && advanceRoundRef.current) {
          advanceRoundRef.current();
          return;
        }
      }

      let key = e.key;
      // Allow dot, punctuation, or lowercase letter
      if (key !== " " && key !== "." && key !== "-" && key !== "_" && key !== "'" && key !== "。" && key !== "·" && key !== "・") {
        key = key.toLowerCase();
      }

      processInputKeyRef.current(key, true);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isPaused, timerFinished, wordCorrect, practiceMode]);

  // Global Escape key listener to guarantee an immediate exit path
  useEffect(() => {
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (timerFinished) {
          onQuit();
        } else if (showQuitConfirm) {
          setShowQuitConfirm(false);
        } else {
          setShowQuitConfirm(true);
        }
      }
    };
    window.addEventListener("keydown", handleGlobalEsc);
    return () => window.removeEventListener("keydown", handleGlobalEsc);
  }, [timerFinished, showQuitConfirm, onQuit]);

  // Formatter for time display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const ss = (totalSeconds % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const currentSegment = item?.segments?.[currentSegmentIdx] || item?.segments?.[0];

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
    const currentExpecteds = (currentSegment?.romaji || []).map(r => r.substring(romajiProgress.length));
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

  if (!item || !item.segments || item.segments.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center space-y-4 bg-white rounded-2xl border border-stone-200 shadow-lg">
        <p className="text-sm font-serif text-stone-700">暂无待训练词汇或数据已完成</p>
        <button
          type="button"
          onClick={onQuit}
          className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-serif font-bold cursor-pointer transition-all"
        >
          返回上一页
        </button>
      </div>
    );
  }

  return (
    <div 
      className="max-w-3xl mx-auto space-y-1 sm:space-y-2.5 px-1.5 md:px-0 relative"
      onClick={() => {
        if (practiceMode !== "handwriting" && !isPaused && !timerFinished && !showQuitConfirm) {
          const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
          if (isMobileDevice) {
            inputRef.current?.focus({ preventScroll: true });
          }
        }
      }}
    >
      {/* Hidden input placed at top-0 left-0: guarantees focusing will never trigger browser downward scroll! */}
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
        className="fixed top-0 left-0 w-1 h-1 opacity-0 pointer-events-none -z-50"
        aria-hidden="true"
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
      />

      {/* Universal Floating Exit Button: always visible & clickable at all times */}
      <button
        type="button"
        onClick={() => {
          if (timerFinished) {
            onQuit();
          } else {
            setShowQuitConfirm(true);
          }
        }}
        className="fixed top-3 right-3 z-50 px-3.5 py-1.5 rounded-full bg-stone-900/90 hover:bg-red-600 text-stone-100 border border-stone-700 shadow-xl flex items-center gap-1.5 text-xs font-bold font-serif cursor-pointer transition-all backdrop-blur-md select-none active:scale-95"
        title="随时退出联训 (快捷键 Esc)"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>退出训练 (Esc)</span>
      </button>

      {/* Upper bar: Quit & Controls (Compact responsive flex wrap) */}
      <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="退出训练"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>退出练习</span>
          </button>

          {/* Quick finish button when at least 1 round completed */}
          {completedRounds >= 1 && !timerFinished && (
            <button
              type="button"
              onClick={() => {
                setTimeLeftMs(0);
                setTimerFinished(true);
                audioSynth.playTimeCompleted();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="提前达成练习目标并结算生成成长轨迹"
            >
              <span>🏁 提前结算 ({completedRounds}轮)</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {/* Phonetic toggle for English mode */}
          {isEnglishMode && (
            <button
              type="button"
              onClick={() => setShowPhonetic(prev => !prev)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                showPhonetic
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : "border-stone-300 bg-white text-stone-500 hover:bg-stone-50"
              }`}
              title={showPhonetic ? "点击隐藏音标显示" : "点击开启音标显示"}
            >
              <span>{showPhonetic ? "音标: 显" : "音标: 隐"}</span>
            </button>
          )}

          {/* Word Meaning toggle */}
          <button
            type="button"
            onClick={() => {
              setShowMeaning(prev => {
                const next = !prev;
                try { localStorage.setItem("fifty_sound_show_meaning", String(next)); } catch (_) {}
                return next;
              });
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
              showMeaning
                ? "border-amber-400 bg-amber-50 text-amber-900"
                : "border-stone-300 bg-white text-stone-500 hover:bg-stone-50"
            }`}
            title={showMeaning ? "点击隐藏词意显示" : "点击开启词意显示"}
          >
            <BookOpen className="w-3 h-3 text-amber-700" />
            <span>{showMeaning ? "词意: 显" : "词意: 隐"}</span>
          </button>

          {/* Phonics Syllable Color-Coding Toggle (e.g. TODAY -> to in green, day in red) */}
          <button
            type="button"
            onClick={toggleSyllableColor}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
              showSyllableColor
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-stone-300 bg-white text-stone-500 hover:bg-stone-50"
            }`}
            title={showSyllableColor ? "音节分色已开启 (如 TODAY: to绿/day红)，点击可切换单色" : "点击开启音节分色助记 (不同音节不同色彩)"}
          >
            <span>🎨</span>
            <span>{showSyllableColor ? "音节: 分色" : "音节: 单色"}</span>
          </button>

          {/* Virtual Keyboard Collapse/Expand Toggle (Saves 220px to show 100% of card) */}
          {practiceMode !== "handwriting" && (
            <button
              type="button"
              onClick={toggleVirtualKeyboard}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                showVirtualKeyboard
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : "border-stone-300 bg-white text-stone-500 hover:bg-stone-50"
              }`}
              title={showVirtualKeyboard ? "收起虚拟按键，节省垂直空间，一屏完整尽收眼底" : "展开虚拟按键"}
            >
              <Keyboard className="w-3 h-3 text-amber-700" />
              <span>{showVirtualKeyboard ? "按键: 显" : "按键: 隐"}</span>
            </button>
          )}

          {/* Quick Speech Rate Cycler */}
          <button
            type="button"
            onClick={handleCycleSpeechRate}
            className="flex items-center gap-0.5 px-2 py-1 rounded-lg border border-stone-300 bg-white hover:bg-amber-50 text-stone-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={`点击循环调整朗读语速 (当前: ${speechRate}x)`}
          >
            <Zap className="w-3 h-3 text-amber-600" />
            <span>{speechRate}x</span>
          </button>

          {/* Typing Sound Style Switcher */}
          <button
            type="button"
            onClick={handleCycleTypingSound}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-stone-300 bg-white hover:bg-amber-50 text-stone-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={`点击切换击键音效 (当前: ${typingSoundStyle === "crisp" ? "清脆青轴" : typingSoundStyle === "typewriter" ? "复古打字机" : "水滴气泡"})`}
          >
            <span>{typingSoundStyle === "crisp" ? "青轴" : typingSoundStyle === "typewriter" ? "打字机" : "水滴"}</span>
          </button>

          {/* Ambient Soundscape White Noise Switcher (环境白噪音) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAmbientMenu(prev => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                ambientType !== "none"
                  ? "border-pink-400 bg-pink-100 text-pink-900 shadow-sm"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
              }`}
              title="设置练习背景环境音效与白噪音（雨声、古风书斋、打字机、宣纸翻书）"
            >
              <span>{ambientType === "none" ? "🎧" : ambientType === "rain" ? "🌧️" : ambientType === "study" ? "🕯️" : ambientType === "typewriter" ? "⌨️" : "📜"}</span>
              <span className="hidden sm:inline">环境:</span>
              <span>{ambientType === "none" ? "无" : ambientType === "rain" ? "窗雨" : ambientType === "study" ? "书斋" : ambientType === "typewriter" ? "打字机" : "翻书"}</span>
            </button>

            {/* Dropdown Menu */}
            {showAmbientMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border-2 border-stone-850 shadow-[4px_4px_0px_#2E2530] p-3 z-50 text-stone-800 space-y-2 select-none animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                  <span className="font-sans font-bold text-xs text-stone-900 flex items-center gap-1">
                    <span>🎧</span>
                    <span>沉浸环境音效</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAmbientMenu(false)}
                    className="text-stone-400 hover:text-stone-700 text-xs font-bold px-1 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Sound options list */}
                <div className="space-y-1">
                  {AMBIENT_OPTIONS.map((opt) => {
                    const isSel = ambientType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setAmbientType(opt.id);
                          audioSynth.startAmbient(opt.id, ambientVolume);
                        }}
                        className={`w-full text-left p-1.5 rounded-xl border text-xs transition-all flex items-start gap-2 cursor-pointer ${
                          isSel
                            ? "bg-pink-100/90 border-pink-400 text-pink-950 font-bold"
                            : "bg-stone-50/70 border-stone-200 hover:bg-pink-50/50 text-stone-700"
                        }`}
                      >
                        <span className="text-base shrink-0">{opt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] leading-tight">{opt.label}</div>
                          <div className="text-[9.5px] text-stone-500 font-normal leading-tight truncate">{opt.desc}</div>
                        </div>
                        {isSel && <span className="text-pink-600 font-black text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Volume slider */}
                {ambientType !== "none" && (
                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                      <span>环境音量</span>
                      <span>{Math.round(ambientVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={ambientVolume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setAmbientVolume(v);
                        audioSynth.setAmbientVolume(v);
                      }}
                      className="w-full accent-pink-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

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

      {/* Main retro Terminal casing (Compact, responsive padding to fit viewport) */}
      <div ref={mainTerminalRef} className={`p-2 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 relative scroll-mt-2 ${
        errorFlash 
          ? "border-red-600 bg-red-50/20 shadow-[0_0_20px_rgba(239,68,68,0.25)]" 
          : "border-stone-800 bg-stone-50 shadow-md"
      }`}>
        
        {/* Top ribbon: Clock and Score counter */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-3 pb-1.5 sm:pb-2.5 border-b border-stone-300 items-center">
          <div className="space-y-0.5">
            <div className="text-[7.5px] sm:text-[9px] font-mono text-stone-500 tracking-wider">RETRO TERMINAL COUNTDOWN</div>
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className={`text-lg sm:text-2xl md:text-3xl font-mono font-black ${
                timeLeftMs < 30000 && !isPaused ? "text-red-600 animate-pulse font-extrabold" : "text-stone-900"
              }`}>
                {formatTime(timeLeftMs)}
              </span>
              <button
                onClick={handleTogglePause}
                disabled={timerFinished}
                className={`px-2.5 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  isPaused 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-stone-50" 
                    : "bg-amber-600 hover:bg-amber-700 text-stone-900"
                }`}
              >
                {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                <span>{isPaused ? "继续" : "暂停"}</span>
              </button>
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <div className="text-[7.5px] sm:text-[9px] font-mono text-stone-500 tracking-wider">COMPLETED ROUNDS</div>
            <div className="text-lg sm:text-2xl md:text-3xl font-extrabold font-serif text-indigo-900">
              {completedRounds} <span className="text-xs font-sans font-medium text-stone-500">轮</span>
            </div>
          </div>
        </div>

        {/* If group training, show queue progress indicator */}
        {items.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 border-b border-stone-200 select-none">
            <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-stone-400 uppercase tracking-widest mr-1">
              联训序列:
            </span>
            {items.map((it, idx) => {
              const isActive = idx === currentItemIdx;
              return (
                <div
                  key={it.id}
                  className={`px-2 sm:px-2.5 py-0.5 rounded-lg text-[11px] sm:text-xs transition-all font-serif font-black ${
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

        {/* Dynamic Card Slider Carousel Area (Compact height & padding) */}
        <div className="relative overflow-hidden my-1 sm:my-2 min-h-[160px] sm:min-h-[190px] py-1.5 sm:py-2.5 flex items-center justify-between px-1 sm:px-6 bg-white/40 rounded-xl sm:rounded-2xl border border-stone-200 shadow-inner">
          
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

                  {/* Target Word Main Title Display with Multilingual Syllable Color-Coding (English, Spanish & Japanese) */}
                  {(() => {
                    const itemLang: "en" | "ja" | "es" = (item as any).lang || (isEnglishMode ? "en" : /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_.'’]+$/.test(item.kanji) ? "es" : "ja");
                    const syllables = splitWordIntoSyllables(item.kanji, itemLang);

                    return (
                      <div className="mt-1 flex flex-col items-center justify-center">
                        <div className="flex items-baseline justify-center gap-2 flex-wrap">
                          {showSyllableColor ? (
                            <ColoredSyllableWord
                              word={item.kanji}
                              kanaStr={item.kanaStr}
                              lang={itemLang}
                              showDots={itemLang !== "ja"}
                              className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-wide drop-shadow-2xs select-none"
                            />
                          ) : (
                            <span 
                              className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 font-serif tracking-wide drop-shadow-2xs select-none"
                              style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                            >
                              {item.kanji}
                            </span>
                          )}

                          {/* Japanese Kana Furigana Reading Display with matching mora colors */}
                          {itemLang === "ja" && item.kanaStr && item.kanaStr !== item.kanji && (
                            <span className="text-sm sm:text-base font-serif font-bold text-stone-700 select-none flex items-center">
                              <span>(</span>
                              {showSyllableColor ? (
                                <span className="inline-flex items-baseline">
                                  {item.segments.map((seg, sIdx) => {
                                    const c = getSyllableColor(sIdx);
                                    return (
                                      <span key={sIdx} className={`${c.textColor} font-bold`}>
                                        {seg.kana}
                                      </span>
                                    );
                                  })}
                                </span>
                              ) : (
                                <span className="text-amber-800/90">{item.kanaStr}</span>
                              )}
                              <span>)</span>
                            </span>
                          )}
                        </div>

                        {/* Syllable / Mora breakdown badges below multi-syllable word */}
                        {showSyllableColor && (
                          <div className="mt-1 flex items-center justify-center gap-1 flex-wrap select-none">
                            {itemLang === "ja" ? (
                              item.segments.length > 1 && item.segments.map((seg, sIdx) => {
                                const sylColor = getSyllableColor(sIdx);
                                return (
                                  <span
                                    key={sIdx}
                                    className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${sylColor.badgeColor} shadow-2xs`}
                                    title={`第 ${sIdx + 1} 拍 (Mora): ${seg.kana} (${seg.displayRomaji})`}
                                  >
                                    {seg.kana} <span className="opacity-70 text-[8px]">{seg.displayRomaji}</span>
                                  </span>
                                );
                              })
                            ) : (
                              syllables.filter(s => s !== " " && !/^\s+$/.test(s)).length > 1 && (
                                syllables.map((syl, sIdx) => {
                                  if (syl === " " || /^\s+$/.test(syl)) return null;
                                  const sylColor = getSyllableColor(sIdx);
                                  return (
                                    <span
                                      key={sIdx}
                                      className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${sylColor.badgeColor} shadow-2xs`}
                                      title={`音节 ${sIdx + 1}: ${syl}`}
                                    >
                                      {syl}
                                    </span>
                                  );
                                })
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* English Mode Phonetic Symbol (IPA) Badge */}
                  {isEnglishMode && showPhonetic && (item.phonetic || getEnglishPhonetic(item.kanji)) && (
                    <div className="mt-1 flex items-center justify-center gap-2 select-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          audioSynth.speakFullWord(item.kanji, undefined, item.kanji, undefined, "en");
                        }}
                        className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="点击聆听标准英语读音"
                      >
                        <span className="text-[10px] font-mono text-amber-700/80 font-bold uppercase tracking-wider">IPA</span>
                        <span className="text-sm font-serif font-black tracking-wide text-amber-950">
                          {item.phonetic || getEnglishPhonetic(item.kanji)}
                        </span>
                        <Volume2 className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* Lexicon Meaning Banner - Click to Expand to save vertical space on mobile */}
                  {showMeaning && item.meaning && (
                    <div className="mt-1.5 max-w-xl mx-auto flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMeaningExpanded(!isMeaningExpanded);
                          try {
                            audioSynth.playCardSlide();
                          } catch (_) {}
                        }}
                        className={`px-3 py-1 rounded-full border text-xs font-serif transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 ${
                          isMeaningExpanded
                            ? "bg-amber-100 border-amber-300 text-amber-950 font-bold"
                            : "bg-amber-50/90 hover:bg-amber-100/80 border-amber-200/90 text-stone-700"
                        }`}
                        title={isMeaningExpanded ? "收起词意" : "展开完整词意解释"}
                      >
                        <span className="px-1.5 py-0.2 rounded bg-amber-200/90 text-amber-900 font-bold text-[10px] font-mono flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5 text-amber-800" />
                          <span>词意</span>
                        </span>
                        <span className="max-w-[150px] sm:max-w-[280px] truncate text-[11px] sm:text-xs text-stone-600">
                          {item.meaning}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-800 shrink-0">
                          {isMeaningExpanded ? "▴ 收起" : "▾ 点击展开"}
                        </span>
                      </button>

                      {/* Expanded full meaning card */}
                      <AnimatePresence>
                        {isMeaningExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -4 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                            className="w-full mt-1.5 px-3 py-2 bg-amber-50/95 border border-amber-300/80 rounded-xl shadow-xs text-center select-text"
                          >
                            <p className="text-stone-850 font-medium font-serif text-xs sm:text-sm leading-relaxed">
                              {item.meaning}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
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
                    {/* Gridded TracingKana slots array with Syllable Color-Coding (Japanese Mora, Spanish & English) */}
                    {(() => {
                      const itemLang: "en" | "ja" | "es" = (item as any).lang 
                        ? (item as any).lang 
                        : (isEnglishMode ? "en" : /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_.'’]+$/.test(item.kanji) ? "es" : "ja");
                      const segmentSyllableMap = showSyllableColor
                        ? mapWordSegmentsToSyllables(item.kanji, item.segments.length, itemLang)
                        : [];

                      return (
                        <div className={`flex items-center justify-center py-2 max-w-full ${
                          isEnglishMode 
                            ? "flex-nowrap gap-1 sm:gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1" 
                            : "flex-wrap gap-2.5 sm:gap-4"
                        }`}>
                          {item.segments.map((segment, idx) => {
                            const isCorrectSegment = wordCorrect || idx < currentSegmentIdx;
                            const isActiveSegment = !wordCorrect && idx === currentSegmentIdx;
                            const currentTypingProgress = isActiveSegment ? romajiProgress : "";
                            const syllableInfo = segmentSyllableMap[idx];

                            return (
                              <TracingKana
                                key={idx}
                                kana={segment.kana}
                                displayRomaji={segment.displayRomaji}
                                romajiProgress={currentTypingProgress}
                                isCorrect={isCorrectSegment}
                                active={isActiveSegment}
                                isEnglishMode={isEnglishMode}
                                syllableColor={syllableInfo?.color}
                              />
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Guidelines info label under input block */}
                    <div className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition-all font-mono select-none ${
                      wordCorrect 
                        ? "bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm" 
                        : "bg-white border-stone-200 text-stone-600 shadow-sm"
                    }`}>
                      {getExpectedPrefixHelp()}
                    </div>

                    {/* Live Game Combo Only - Level & XP removed per user request */}
                    {combo > 0 && (
                      <div className="flex items-center justify-center mt-1 sm:mt-1.5 select-none">
                        <motion.div
                          key={combo}
                          initial={{ scale: 0.8, rotate: -4 }}
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 4, 0] }}
                          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 font-mono font-black text-xs tracking-wider shadow-2xs"
                        >
                          <span>{combo} COMBO</span>
                          <span className="animate-pulse">🔥</span>
                        </motion.div>
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

        {/* The Retro Mechanical Keyboard Emulator (Collapsible to guarantee zero-scroll viewport fitting) */}
        {practiceMode !== "handwriting" && (
          <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-stone-300 space-y-1">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[7.5px] sm:text-[9px] font-mono text-stone-500 font-bold uppercase tracking-wider select-none flex items-center gap-1">
                  <span>⌨️</span>
                  <span>VIRTUAL TYPEWRITER</span>
                </span>
                <span className="hidden sm:inline text-[8.5px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  支持实体键盘直接打字
                </span>
              </div>
              <button
                type="button"
                onClick={toggleVirtualKeyboard}
                className="text-[10px] sm:text-[11px] font-serif font-bold text-amber-800 hover:text-amber-950 px-2 py-0.5 rounded hover:bg-amber-100/70 transition-all cursor-pointer flex items-center gap-1"
                title={showVirtualKeyboard ? "收起虚拟按键，节省垂直空间，一屏完整尽收眼底" : "展开虚拟按键"}
              >
                <span>{showVirtualKeyboard ? "▴ 收起按键 (一屏显示全貌)" : "▾ 展开按键"}</span>
              </button>
            </div>
            
            {!showVirtualKeyboard ? (
              <div 
                onClick={toggleVirtualKeyboard}
                className="py-1 px-3 bg-stone-100/90 hover:bg-amber-50 rounded-lg border border-dashed border-stone-300 text-center cursor-pointer transition-all flex items-center justify-center gap-2 text-stone-600 hover:text-stone-900 select-none active:scale-99"
                title="点击展开虚拟键盘"
              >
                <Keyboard className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-[10.5px] font-sans">
                  虚拟按键已收起（当前支持直接使用电脑实体键盘盲打，整张词条卡一屏尽收眼底）
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-700">展开 ▾</span>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 sm:gap-1 max-w-lg mx-auto bg-stone-900 p-1 sm:p-2 rounded-lg sm:rounded-xl border border-stone-700 shadow-inner">
                {KEYBOARD_ROWS.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex justify-center gap-0.5 sm:gap-1">
                    {row.map((char) => {
                      const isPressed = pressedKey === char;
                      
                      // Highlight keys that could be next character targets
                      const isGuideKey = !isPaused && !timerFinished && !wordCorrect &&
                        Boolean(currentSegment?.romaji?.some(
                          r => r.startsWith(romajiProgress) && 
                          r[romajiProgress.length]?.toUpperCase() === char
                        ));

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
                          className={`w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 md:w-7.5 md:h-7.5 flex items-center justify-center rounded text-[9px] sm:text-xs font-mono font-bold transition-all select-none cursor-pointer ${
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
                  <div className="flex justify-center items-center gap-1 sm:gap-1.5 mt-0.5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        scale: pressedKey === "SPACE" ? 0.95 : 1,
                        y: pressedKey === "SPACE" ? 2 : 0,
                      }}
                      onClick={() => {
                        if (isPaused) {
                          handleTogglePause();
                          return;
                        }
                        if ((wordCorrect || isPronouncing) && advanceRoundRef.current) {
                          advanceRoundRef.current();
                          return;
                        }
                        processInputKey(" ");
                      }}
                      title={
                        isPaused 
                          ? "恢复训练 (或按空格键)" 
                          : (wordCorrect || isPronouncing) 
                          ? "前往下一词 (或按空格键)" 
                          : "空格键 (Space)"
                      }
                      className={`w-24 sm:w-36 h-5 sm:h-6 flex items-center justify-center rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all select-none border cursor-pointer ${
                        pressedKey === "SPACE"
                          ? "bg-amber-500 text-stone-950 border-amber-600 shadow-inner"
                          : (!isPaused && !timerFinished && !wordCorrect && Boolean(currentSegment?.romaji?.some(r => r.startsWith(romajiProgress) && r[romajiProgress.length] === " ")))
                          ? "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)] animate-pulse"
                          : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750"
                      }`}
                    >
                      {isPaused ? "继续 (Space)" : (wordCorrect || isPronouncing) ? "下一词 (Space)" : "Space"}
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
                      className={`w-7 sm:w-8 h-5 sm:h-6 flex items-center justify-center rounded text-xs font-mono font-bold transition-all select-none border cursor-pointer ${
                        pressedKey === "."
                          ? "bg-amber-500 text-stone-950 border-amber-600 shadow-inner"
                          : (!isPaused && !timerFinished && !wordCorrect && Boolean(currentSegment?.romaji?.some(r => r.startsWith(romajiProgress) && r[romajiProgress.length] === ".")))
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
                      className={`w-7 sm:w-8 h-5 sm:h-6 flex items-center justify-center rounded text-xs font-mono font-bold transition-all select-none border cursor-pointer ${
                        pressedKey === "-"
                          ? "bg-amber-500 text-stone-950 border-amber-600 shadow-inner"
                          : (!isPaused && !timerFinished && !wordCorrect && Boolean(currentSegment?.romaji?.some(r => r.startsWith(romajiProgress) && r[romajiProgress.length] === "-")))
                          ? "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)] animate-pulse"
                          : "bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750"
                      }`}
                    >
                      -
                    </motion.button>
                  </div>
                )}

                {/* Mobile Keyboard Trigger inside collapsed space */}
                <div className="flex items-center justify-center pt-1 md:hidden">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioSynth.playCardSlide();
                      inputRef.current?.focus({ preventScroll: true });
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[9.5px] flex items-center justify-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    <Keyboard className="w-3 h-3 text-stone-950" />
                    <span>唤起手机输入法</span>
                  </button>
                </div>
              </div>
            )}
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
              className="max-w-xl md:max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-stone-50 rounded-3xl border-2 border-stone-800 p-5 sm:p-7 text-center space-y-5 shadow-2xl relative"
            >
              {/* Close Button at top-right */}
              <button
                type="button"
                onClick={onQuit}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                title="退出并返回 (Esc)"
              >
                ✕
              </button>

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
                      {items.length > 5
                        ? `“${items.slice(0, 4).map((it) => it.kanji).join("”、“")}” 等共 ${items.length} 词`
                        : items.length > 1
                        ? `“${items.map((it) => it.kanji).join("”、“")}”`
                        : `“${item.kanji}”`}
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
                      {correctCount > 0 ? Math.round(correctCount / ((effectiveDuration - Math.max(0, timeLeftMs)) / 60000 || 0.1)) : 0} <span className="text-[10px] font-normal text-stone-500">键/分</span>
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

              {/* D3.js 15-Session Growth Trajectory Chart */}
              <div className="text-left w-full pt-1">
                <SessionTrendChart isEnglishMode={isEnglishMode} />
              </div>

              {completedRounds >= 3 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs font-mono">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>恭喜：卡牌已解锁 CONGRATULATIONS: CARD UNLOCKED!</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    由于你的辛勤练习，你的手指已经记住了这个{isEnglishMode ? "英文单词" : "名字"}。你成功得到了专属卡牌！你可以随时通过收藏馆查看它，并能请求 <b>Gemini AI {isEnglishMode ? "解读它的词源与生动故事" : "分解它的独特文化轶事"}</b>。
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
                        setEndTime(Date.now() + effectiveDuration);
                        setTimeLeftMs(effectiveDuration);
                        setCompletedRounds(0);
                        setCurrentSegmentIdx(0);
                        setRomajiProgress("");
                        hasSavedSessionLogRef.current = false;
                        setTimerFinished(false);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>重新开始</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 w-full">
                    <button
                      onClick={handleClaimCard}
                      className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-black text-sm transition-all flex items-center justify-center gap-2 border-2 border-stone-850 shadow-[3px_3px_0px_#2E2530] cursor-pointer cursor-custom select-none"
                    >
                      <span>🎁 翻开并永久收录此闪卡</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsZineOpen(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-900 font-mono font-bold text-xs transition-all flex items-center justify-center gap-1.5 border-2 border-pink-400 shadow-[2px_2px_0px_#F472B6] cursor-pointer"
                    >
                      <span>💌 生成今日手作日签</span>
                    </button>
                  </div>
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

              <div className="flex flex-col gap-2 pt-2">
                {correctCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuitConfirm(false);
                      setTimeLeftMs(0);
                      setTimerFinished(true);
                      audioSynth.playTimeCompleted();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs font-sans transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>📊 提前结算本次练习 (记录成长轨迹)</span>
                  </button>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Resume training and append the delta spent in modal
                      setEndTime(Date.now() + timeLeftMs);
                      setShowQuitConfirm(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs font-sans transition-all cursor-pointer select-none"
                  >
                    🛡️ 留在这里，继续拼写
                  </button>
                  <button
                    onClick={onQuit}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs font-sans transition-all cursor-pointer select-none"
                  >
                    🚪 意已决，放弃退出
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Aesthetic Zine Postcard Modal */}
      <DailyZineModal
        isOpen={isZineOpen}
        onClose={() => setIsZineOpen(false)}
        isEnglishMode={isEnglishMode}
      />
    </div>
  );
};

