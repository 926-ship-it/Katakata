import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Keyboard, ArrowLeft, RefreshCw, Volume2, VolumeX, AlertTriangle, Play, Pause, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, PenTool } from "lucide-react";
import { DictionaryItem } from "../data/dictionary";
import { TracingKana } from "./TracingKana";
import { audioSynth } from "../utils/audio";
import { CardIllustration } from "./CardIllustration";
import { CalligraphyCanvas } from "./CalligraphyCanvas";
import { uiTranslate, LANG_MAPPING } from "../utils/lang";

interface TrainingPageProps {
  items: DictionaryItem[];
  durationMs: number;
  onFinished: (rounds: number) => void;
  onQuit: () => void;
  practiceMode?: "typing" | "handwriting";
  onKeyStrike?: (action: "correct" | "error" | "complete") => void;
  isEnglishMode?: boolean;
}

export const TrainingPage: React.FC<TrainingPageProps> = ({
  items,
  durationMs,
  onFinished,
  onQuit,
  practiceMode = "typing",
  onKeyStrike,
  isEnglishMode = false,
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
  const [muted, setMuted] = useState<boolean>(false);

  // Loop/Typewriter spelling states
  const [completedRounds, setCompletedRounds] = useState<number>(0);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState<number>(0);
  const [romajiProgress, setRomajiProgress] = useState<string>("");
  const [wordCorrect, setWordCorrect] = useState<boolean>(false); // Triggers final word completion "描红" trace view
  const [errorFlash, setErrorFlash] = useState<boolean>(false);
  const [handwritingPassed, setHandwritingPassed] = useState<boolean>(false);

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
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (practiceMode === "handwriting") return;
      if (isPaused || timerFinished || wordCorrect) return;

      const key = e.key === " " ? " " : e.key.toLowerCase();
      // Only listen to standard alphabetic keys or space if in English Mode
      const isValidKey = /^[a-z]$/.test(key) || (isEnglishMode && key === " ");
      if (!isValidKey) return;

      setPressedKey(key === " " ? "SPACE" : key.toUpperCase());
      setTimeout(() => setPressedKey(null), 150);

      const segment = item.segments[currentSegmentIdx];
      const proposedString = romajiProgress + key;

      // Check if proposedString is a prefix match of any acceptable romaji
      const isPrefixOfAny = segment.romaji.some(r => r.startsWith(proposedString));
      const isMatchOfAny = segment.romaji.some(r => r === proposedString);

      if (isMatchOfAny) {
        // Correct character fully completed!
        audioSynth.playTyping();
        audioSynth.playTypewriterBell();
        
        // Speak the individual syllable completed!
        audioSynth.speakJapanese(segment.kana);
        
        setRomajiProgress("");
        
        // Advance segment index or complete whole word
        if (currentSegmentIdx + 1 >= item.segments.length) {
          // Entire Japanese phrase spelled correctly!
          setWordCorrect(true);
          audioSynth.playFanfare();
          if (onKeyStrike) onKeyStrike("complete");
          
          // Read out the entire name/phrase with a gorgeous micro-delay
          setTimeout(() => {
            audioSynth.speakJapanese(item.kanaStr, false);
          }, 450);
          
          // Show calligraphic stroke red tracing overlay for a feedback period, then proceed to next round
          setTimeout(() => {
            setCompletedRounds(prev => prev + 1);
            setSlideDirection(1);
            audioSynth.playCarriageReturn();
            setCurrentItemIdx((prevIdx) => (prevIdx + 1) % items.length);
            setCurrentSegmentIdx(0);
            setRomajiProgress("");
            setWordCorrect(false);
          }, 1200);
        } else {
          setCurrentSegmentIdx(currentSegmentIdx + 1);
          if (onKeyStrike) onKeyStrike("correct");
        }
      } else if (isPrefixOfAny) {
        // Mid-spelling of romaji character (e.g. typed 't' of 'tsu')
        audioSynth.playTyping();
        setRomajiProgress(proposedString);
        if (onKeyStrike) onKeyStrike("correct");
      } else {
        // Typing error/deviation! Trigger a warning shake and reset entire word.
        audioSynth.playError();
        setErrorFlash(true);
        setTimeout(() => setErrorFlash(false), 300);

        // Reset to first kana segment on error (forced deep learning reinforcement!)
        setCurrentSegmentIdx(0);
        setRomajiProgress("");
        if (onKeyStrike) onKeyStrike("error");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentSegmentIdx, romajiProgress, item, isPaused, timerFinished, wordCorrect, onKeyStrike, isEnglishMode]);

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
    if (wordCorrect) {
      return isEnglishMode ? "All spelled correctly!" : "全部拼对，正在进行假名描红！";
    }
    if (isPaused) {
      return isEnglishMode ? "Practice paused. Press Space or [Resume] to continue." : "训练暂停中，按下 [暂停/继续] 或空格继续";
    }
    
    // Provide neat prompt of expected correct letter keys to tap
    const currentExpecteds = currentSegment.romaji.map(r => r.substring(romajiProgress.length));
    return isEnglishMode 
      ? `Press: ${currentExpecteds.map(x => `[${x[0] === " " ? "SPACE" : (x[0] || "").toUpperCase()}]`).join(" or ")}`
      : `当前假名拼写预期: ${currentExpecteds.map(x => `[${x[0] || ""}]`).join(" 或 ")}`;
  };

  // Triggers final wrap-up and submits the score to claim the card
  const handleClaimCard = () => {
    onFinished(completedRounds);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-2 md:px-0">
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
      <div className={`p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 relative ${
        errorFlash 
          ? "border-red-600 bg-red-50/20 shadow-[0_0_20px_rgba(239,68,68,0.25)]" 
          : "border-stone-800 bg-stone-50 shadow-md"
      }`}>
        
        {/* Top ribbon: Clock and Score counter */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-stone-300 items-center">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-stone-500 tracking-wider">RETRO TERMINAL COUNTDOWN</div>
            <div className="flex items-center gap-3">
              <span className={`text-3xl md:text-4xl font-mono font-black ${
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

          <div className="text-right space-y-1">
            <div className="text-[10px] font-mono text-stone-500 tracking-wider">COMPLETED ROUNDS</div>
            <div className="text-3xl md:text-4xl font-extrabold font-serif text-indigo-900">
              {completedRounds} <span className="text-sm font-sans font-medium text-stone-500">轮</span>
            </div>
          </div>
        </div>

        {/* If group training, show queue progress indicator */}
        {items.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pb-4 pt-4 border-b border-stone-200 select-none">
            <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest mr-1">
              {isEnglishMode ? "DECK QUEUE:" : "联训序列:"}
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
                  {isEnglishMode ? (LANG_MAPPING[it.id]?.title || it.kanji) : it.kanji}
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Card Slider Carousel Area */}
        <div className="relative overflow-hidden my-4 min-h-[230px] flex items-center justify-between px-2 sm:px-12 bg-white/40 rounded-2xl border border-stone-200 shadow-inner">
          
          {/* Slide Left Button */}
          <button
            onClick={() => {
              if (items.length <= 1) return;
              setSlideDirection(-1);
              audioSynth.playCarriageReturn();
              setCurrentItemIdx((prev) => (prev - 1 + items.length) % items.length);
              setCurrentSegmentIdx(0);
              setRomajiProgress("");
              setWordCorrect(false);
            }}
            disabled={items.length <= 1}
            className={`p-2.5 rounded-full border border-stone-300 bg-white text-stone-600 transition-all z-10 ${
              items.length <= 1
                ? "opacity-25 cursor-not-allowed"
                : "hover:bg-amber-100 hover:text-amber-900 active:scale-95 shadow-sm cursor-pointer"
            }`}
            title="查看上一张卡（拼写状态将重置）"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Animated Card Body Container */}
          <div className="flex-1 overflow-hidden py-4 flex justify-center">
            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={currentItemIdx}
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection * 120, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -slideDirection * 120, scale: 0.96 }}
                transition={{ type: "spring", damping: 20, stiffness: 140 }}
                className="w-full flex flex-col items-center justify-center space-y-4"
              >
                <div className="text-center">
                  <span className="text-[10px] text-amber-800 font-mono tracking-wider font-bold uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    {isEnglishMode ? (LANG_MAPPING[item.id]?.categoryName || uiTranslate(item.categoryName, isEnglishMode, item.categoryName)) : item.categoryName} ・ {item.rarity} {isEnglishMode ? "Rarity" : "稀有度"}
                  </span>
                  <h3 className="text-stone-750 font-medium font-serif text-sm mt-1.5 opacity-90 leading-relaxed max-w-lg mx-auto">
                    {isEnglishMode ? (LANG_MAPPING[item.id]?.meaning || item.meaning) : item.meaning}
                  </h3>
                </div>

                {/* Animated Physical Card Illustration */}
                <div className="p-2.5 bg-gradient-to-b from-stone-50 to-stone-100/50 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-radial-gradient from-white/80 to-transparent pointer-events-none" />
                  <CardIllustration
                    id={item.id}
                    category={item.category}
                    className="w-14 h-14 pointer-events-none relative z-10 animate-bounce-slow"
                  />
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
                    <div className="flex flex-wrap items-center justify-center gap-4 py-2">
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
                    <div className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-mono select-none ${
                      wordCorrect 
                        ? "bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-sm" 
                        : "bg-white border-stone-200 text-stone-600 shadow-sm"
                    }`}>
                      {getExpectedPrefixHelp()}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Right Button */}
          <button
            onClick={() => {
              if (items.length <= 1) return;
              setSlideDirection(1);
              audioSynth.playCarriageReturn();
              setCurrentItemIdx((prev) => (prev + 1) % items.length);
              setCurrentSegmentIdx(0);
              setRomajiProgress("");
              setWordCorrect(false);
            }}
            disabled={items.length <= 1}
            className={`p-2.5 rounded-full border border-stone-300 bg-white text-stone-600 transition-all z-10 ${
              items.length <= 1
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
          <div className="mt-4 pt-4 border-t border-stone-300 space-y-2">
            <div className="text-center text-[10px] font-mono text-stone-400 tracking-wider select-none">
              VIRTUAL TYPEWRITER PRESSURE PLATES
            </div>
            
            <div className="flex flex-col gap-1.5 max-w-lg mx-auto bg-stone-900 p-3 rounded-xl border border-stone-700 shadow-inner">
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
                      <motion.div
                        key={char}
                        animate={{
                          scale: isPressed ? 0.9 : 1,
                          y: isPressed ? 2 : 0,
                        }}
                        className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded text-xs font-mono font-bold transition-all select-none ${
                          isPressed
                            ? "bg-amber-500 text-stone-950 shadow-inner"
                            : isGuideKey
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                            : "bg-stone-800 text-stone-300 border border-stone-700"
                        }`}
                      >
                        {char}
                      </motion.div>
                    );
                  })}
                </div>
              ))}

              {isEnglishMode && (
                <div className="flex justify-center mt-1">
                  <motion.div
                    animate={{
                      scale: pressedKey === "SPACE" ? 0.95 : 1,
                      y: pressedKey === "SPACE" ? 2 : 0,
                    }}
                    className={`w-40 h-7 flex items-center justify-center rounded text-[10px] font-mono font-bold uppercase transition-all select-none border ${
                      pressedKey === "SPACE"
                        ? "bg-amber-500 text-stone-950 border-amber-600 shadow-inner"
                        : (!isPaused && !timerFinished && !wordCorrect && currentSegment.romaji.some(r => r.startsWith(romajiProgress) && r[romajiProgress.length] === " "))
                        ? "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.3)]"
                        : "bg-stone-800 text-stone-300 border-stone-700"
                    }`}
                  >
                    Space
                  </motion.div>
                </div>
              )}
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
                  {isEnglishMode ? "⏳ Practice Time Complete!" : "⏳ 训练时间达成！"}
                </h2>
                <p className="text-xs font-mono text-stone-400">SESSION TIME CYCLE ELAPSED</p>
                <div className="text-stone-600 text-sm">
                  {isEnglishMode ? (
                    <p>
                      You completed{" "}
                      <span className="font-mono text-lg font-black text-amber-600">
                        {completedRounds}
                      </span>{" "}
                      continuous practice rounds for{" "}
                      <span className="font-bold text-stone-900 font-serif">
                        "{items.length > 1 ? items.map((it) => LANG_MAPPING[it.id]?.title || it.kanji).join(", ") : (LANG_MAPPING[item.id]?.title || item.kanji)}"
                      </span>!
                    </p>
                  ) : (
                    <p>
                      你对{items.length > 1 ? "人名组合" : "人名"}{" "}
                      <span className="font-bold text-stone-900 font-serif">
                        “{items.length > 1 ? items.map((it) => it.kanji).join("、") : item.kanji}”
                      </span>{" "}
                      完成了连续{" "}
                      <span className="font-mono text-lg font-black text-amber-600">
                        {completedRounds}
                      </span>{" "}
                      轮极致熟化拼写！
                    </p>
                  )}
                </div>
              </div>

              {completedRounds >= 3 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs font-mono">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>CONGRATULATIONS: CARD UNLOCKED!</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    {isEnglishMode ? (
                      <>
                        Thanks to your dedicated practice, your fingers have memorized these words. You successfully unlocked the card! You can view it in the Card Ledger anytime and prompt <b>Gemini AI to analyze its unique cultural origin</b>.
                      </>
                    ) : (
                      <>
                        由于你的辛勤练习，你的手指已经记住了这个名字。你成功得到了专属卡牌！你可以随时通过收藏馆查看它，并能请求 <b>Gemini AI 分解它的独特文化轶事</b>。
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 text-red-650" />
                    <span>练习轮数偏少 UNLOCKED CRITERIA ALERT</span>
                  </div>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    {isEnglishMode ? (
                      <>
                        This card requires at least <b>3</b> completed rounds to unlock (current: {completedRounds} rounds). Don't give up! We recommend starting another quick training round to build solid muscle memory!
                      </>
                    ) : (
                      <>
                        本词最少需要成功输入 <b>3</b> 轮（当前完成：{completedRounds} 轮），才能够成功解锁。不要气馁，建议再次开启一个短训练周期，深度扎实练习！
                      </>
                    )}
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
                      {isEnglishMode ? "Dashboard" : "返回首页"}
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
                      className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-100 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{isEnglishMode ? "Restart" : "重新开始"}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleClaimCard}
                    className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-amber-600 hover:text-stone-950 text-stone-50 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer cursor-custom select-none"
                  >
                    <span>{isEnglishMode ? "🎁 Claim & Permanently Reveal Card" : "🎁 翻开并永久收录此闪卡"}</span>
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
                  {isEnglishMode ? "Are you sure you want to quit and discard progress?" : "确定要作废本次练习并退出吗？"}
                </h3>
                <p className="text-xs font-mono text-stone-400">ABORT AND TERMINATE PRACTICE CURRENT CYCLE</p>
                <div className="text-xs text-stone-600 leading-normal">
                  {isEnglishMode ? (
                    <p>
                      If you exit mid-session, your <span className="font-bold font-mono text-amber-600 text-sm">{completedRounds}</span> practiced rounds in this cycle will be discarded. You will not save any progress or unlock this card!
                    </p>
                  ) : (
                    <p>
                      中途退出后，本次已拼写了 <span className="font-bold font-mono text-amber-600 text-sm">{completedRounds}</span> 轮，但由于未到计时结束无法存留成绩。本次练习将会作废，且无法获得该卡牌！
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    // Resume training and append the delta spent in modal
                    setEndTime(Date.now() + timeLeftMs);
                    setShowQuitConfirm(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-205 text-stone-850 font-bold text-xs font-sans transition-all cursor-pointer select-none"
                >
                  {isEnglishMode ? "🛡️ Stay & Continue" : "🛡️ 留在这里，继续拼写"}
                </button>
                <button
                  onClick={onQuit}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs font-sans transition-all cursor-pointer select-none"
                >
                  {isEnglishMode ? "🚪 Discard & Exit" : "🚪 意已决，狠心退出"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
