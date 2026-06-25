import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Clock, Zap, RotateCcw, Volume2, VolumeX, AlertCircle, Award, Trophy } from "lucide-react";
import { DictionaryItem, getDictionary } from "../data/dictionary";
import { audioSynth } from "../utils/audio";
import { CardIllustration } from "./CardIllustration";
import { NarrativeStyle, nTrans } from "../utils/narrative";

interface SpellRushPageProps {
  collectedIds: string[];
  onGoBack: () => void;
  isEnglishMode?: boolean;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  narrativeStyle: NarrativeStyle;
}

export const SpellRushPage: React.FC<SpellRushPageProps> = ({
  collectedIds,
  onGoBack,
  isEnglishMode = false,
  coins,
  setCoins,
  narrativeStyle,
}) => {
  const activeDict = React.useMemo(() => {
    return getDictionary(isEnglishMode);
  }, [isEnglishMode]);

  // Determine game card pool: collected cards if we have at least 6, otherwise fallback to the whole dict
  const gamePool = React.useMemo(() => {
    const collected = activeDict.filter(item => collectedIds.includes(item.id));
    return collected.length >= 6 ? collected : activeDict;
  }, [activeDict, collectedIds]);

  // --- GAME STATES ---
  const [gameState, setGameState] = useState<"lobby" | "playing" | "summary">("lobby");
  const [currentCard, setCurrentCard] = useState<DictionaryItem | null>(null);
  
  // Scoring & Stats
  const [score, setScore] = useState<number>(0); // count of correctly spelled words
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [keysTyped, setKeysTyped] = useState<number>(0);
  const [correctKeys, setCorrectKeys] = useState<number>(0);

  // Keyboard and typing states
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState<number>(0);
  const [romajiProgress, setRomajiProgress] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(() => audioSynth.getMuted());

  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(60000); // 60 seconds
  const [endTime, setEndTime] = useState<number>(0);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastProcessedKeyRef = useRef<{ key: string; time: number } | null>(null);

  // Popups for XP or Score points
  const [scorePopups, setScorePopups] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Sound Synth Mute Sync
  useEffect(() => {
    audioSynth.setMute(muted);
  }, [muted]);

  // Automatically focus on typing input for mobile devices
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentCard, currentSegmentIdx]);

  // --- AUDIO SYNTH FOR PITCH-RISING COMBO ---
  const playComboTone = (comboLevel: number) => {
    if (muted) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        const now = ctx.currentTime;
        // Base frequency increases by semitones up to a limit
        const baseFreq = 380; // G4
        const semitones = Math.min(18, comboLevel);
        const freq = baseFreq * Math.pow(2, semitones / 12);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = comboLevel > 10 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      audioSynth.playTypewriterBell();
    }
  };

  // --- GAMEPLAY ACTION TRIGGERS ---
  const startNewGame = () => {
    audioSynth.playCarriageReturn();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setKeysTyped(0);
    setCorrectKeys(0);
    setCurrentSegmentIdx(0);
    setRomajiProgress("");
    setScorePopups([]);

    // Select first random card
    const firstCard = gamePool[Math.floor(Math.random() * gamePool.length)];
    setCurrentCard(firstCard);

    // Setup 60s Timer
    const duration = 60000;
    setEndTime(Date.now() + duration);
    setTimeLeft(duration);
    setGameState("playing");
  };

  // Timer Countdown loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const tick = () => {
      const now = Date.now();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft(0);
        setGameState("summary");
        audioSynth.playTimeCompleted();
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setTimeLeft(difference);
      }
    };

    timerRef.current = setInterval(tick, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, endTime]);

  // Handle Keystrokes
  const handleTypewriterInput = (key: string) => {
    if (gameState !== "playing" || !currentCard) return;

    const lowerKey = key.toLowerCase();
    const isValidKey = /^[a-z0-9]$/.test(lowerKey) || lowerKey === " " || lowerKey === "-" || lowerKey === "_";
    if (!isValidKey) return;

    // Throttle duplicate keystrokes
    const now = Date.now();
    if (lastProcessedKeyRef.current && 
        lastProcessedKeyRef.current.key === lowerKey && 
        now - lastProcessedKeyRef.current.time < 35) {
      return;
    }
    lastProcessedKeyRef.current = { key: lowerKey, time: now };

    setKeysTyped(prev => prev + 1);

    const segment = currentCard.segments[currentSegmentIdx];
    const proposed = romajiProgress + lowerKey;

    const isPrefix = segment.romaji.some(r => r.startsWith(proposed));
    const isMatch = segment.romaji.some(r => r === proposed);

    if (isMatch) {
      // Sub-segment matched!
      setCorrectKeys(prev => prev + 1);
      audioSynth.playTyping();
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Play pitch-rising tone
      playComboTone(newCombo);

      // Speak syllable
      audioSynth.speakJapanese(segment.kana);

      // Reset progress
      setRomajiProgress("");

      // Check if word is completed
      if (currentSegmentIdx + 1 >= currentCard.segments.length) {
        // Full word correct!
        setScore(prev => prev + 1);
        audioSynth.playFanfare();

        // Trigger dynamic score popup
        const pointsAwarded = 10 + Math.min(10, Math.floor(newCombo / 2));
        const newPopup = {
          id: Date.now() + Math.random(),
          text: `+${pointsAwarded} 和币! ${newCombo > 4 ? `🔥 Combo x${newCombo}` : ""}`,
          x: Math.random() * 80 - 40,
          y: Math.random() * -50 - 40,
        };
        setScorePopups(prev => [...prev, newPopup]);

        // Speak full word
        setTimeout(() => {
          audioSynth.speakJapanese(currentCard.kanaStr, false);
        }, 180);

        // Fetch next card
        let nextCard = currentCard;
        while (nextCard.id === currentCard.id && gamePool.length > 1) {
          nextCard = gamePool[Math.floor(Math.random() * gamePool.length)];
        }
        setCurrentCard(nextCard);
        setCurrentSegmentIdx(0);
      } else {
        // Go to next segment
        setCurrentSegmentIdx(prev => prev + 1);
      }
    } else if (isPrefix) {
      // Partially correct, keep progress
      setCorrectKeys(prev => prev + 1);
      audioSynth.playTyping();
      setRomajiProgress(proposed);
    } else {
      // WRONG! Reset combo, shake, and clear current segment progress
      audioSynth.playError();
      setCombo(0);
      setRomajiProgress("");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 250);
    }
  };

  // --- RANKING & COIN CALCULATION ---
  const accuracy = keysTyped > 0 ? Math.round((correctKeys / keysTyped) * 100) : 100;
  
  const getGradeInfo = (correctCount: number) => {
    let title = "";
    let desc = "";
    let seal = "";

    if (correctCount >= 18) {
      seal = "神珍";
      if (narrativeStyle === "mythology") {
        title = "五十音神仙 (Kami)";
        desc = "出神入化的指尖速度！你对五十音的熟悉度如同神明般无懈可击！";
      } else if (narrativeStyle === "cultural") {
        title = "五十音笔墨宗师 (Master)";
        desc = "行云流水般的指尖笔锋！您对五十音字音的掌握精妙绝伦，登峰造极！";
      } else {
        title = "极速拼写权威评级S (Expert)";
        desc = "认知匹配反应时极其敏锐，拼写正确率接近完美，已掌握了高级拼写技能评估指标。";
      }
      return {
        grade: "S",
        title,
        desc,
        coins: 180,
        color: "text-rose-600 bg-rose-50 border-rose-300",
        seal,
        cardPackGift: "legendary" as const
      };
    } else if (correctCount >= 12) {
      seal = "极品";
      if (narrativeStyle === "mythology") {
        title = "流利和风达人 (Master)";
        desc = "极速拼写，行云流水！距离宗师境界只有一步之遥！";
      } else if (narrativeStyle === "cultural") {
        title = "儒雅风骨文士 (Scholar)";
        desc = "落笔生花，气韵连贯！您在极短的时间里完成了卓越的字音映射检索！";
      } else {
        title = "高阶拼写能手评级A (Advanced)";
        desc = "极速拼写转换良好，具备高水平的拼写认知负荷耐受力与检索提取速率。";
      }
      return {
        grade: "A",
        title,
        desc,
        coins: 125,
        color: "text-amber-700 bg-amber-50 border-amber-300",
        seal,
        cardPackGift: "culture" as const
      };
    } else if (correctCount >= 6) {
      seal = "精勤";
      if (narrativeStyle === "mythology") {
        title = "精勤和卡学者 (Practitioner)";
        desc = "平稳通关！拼写基本功扎实，多加练习，很快能问鼎极速！";
      } else if (narrativeStyle === "cultural") {
        title = "研习精进书生 (Practitioner)";
        desc = "字字殷实，平稳顺利！基本音意连结清晰，稍加勤习，落笔必能健步如飞！";
      } else {
        title = "标准拼写学员评级B (Intermediate)";
        desc = "成功通过了本次常态认知速度评估，基础字形检索技能已达标，多加练习能继续突破！";
      }
      return {
        grade: "B",
        title,
        desc,
        coins: 70,
        color: "text-blue-700 bg-blue-50 border-blue-300",
        seal,
        cardPackGift: "beginner" as const
      };
    } else {
      seal = "初心";
      if (narrativeStyle === "mythology") {
        title = "初心修行和子 (Novice)";
        desc = "不要气馁！罗马音拼写需要熟能生巧，回到卡片库多温故一下吧！";
      } else if (narrativeStyle === "cultural") {
        title = "初见握笔书童 (Novice)";
        desc = "无需气馁！笔墨研习自古贵在持之以恒，回到卡片库多加温习，下次定能游刃有余！";
      } else {
        title = "基础改进评级C (Novice)";
        desc = "暂未达到极速指标。罗马音与假名的字音认知映射有待熟化，建议返回学习主库多加巩固。";
      }
      return {
        grade: "C",
        title,
        desc,
        coins: 30,
        color: "text-stone-600 bg-stone-50 border-stone-250",
        seal,
        cardPackGift: null
      };
    }
  };

  const gradeDetails = getGradeInfo(score);

  const handleClaimRewards = () => {
    // Add coins
    setCoins(prev => prev + gradeDetails.coins);
    
    // Play award slide
    audioSynth.playTypewriterBell();
    
    // Go to library to show shrine/binder tab
    onGoBack();
  };

  // Traditional Shinto circular sundial clock needle angle
  const sundialAngle = (timeLeft / 60000) * 360;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top action nav header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onGoBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 hover:text-stone-950 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>{narrativeStyle === "mythology" ? "返回拼写大厅" : narrativeStyle === "cultural" ? "返回练习大厅" : "返回主控制台"}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-lg border border-stone-250 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title={muted ? "取消静音" : "静音"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
          </button>
          <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 border px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
            🪙 <b>{coins}</b> {nTrans("coinName", narrativeStyle)}
          </span>
        </div>
      </div>

      {gameState === "playing" && (
        <input
          ref={inputRef}
          type="text"
          value=""
          onChange={(e) => {
            const val = e.target.value;
            if (val.length > 0) {
              handleTypewriterInput(val[val.length - 1]);
            }
          }}
          className="opacity-0 fixed top-0 left-0 w-0 h-0 pointer-events-none"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
        />
      )}

      {/* --- LOBBY VIEW --- */}
      {gameState === "lobby" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl border-2 border-stone-800 bg-[#f9f7f4] space-y-6 shadow-md text-center select-none relative overflow-hidden"
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-stone-800 opacity-20" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-stone-800 opacity-20" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-stone-800 opacity-20" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-stone-800 opacity-20" />

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 text-3xl font-serif">
            ⚡
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-amber-800 font-bold uppercase">
              {narrativeStyle === "mythology" ? "CHALLENGE MODE • 限时拼写迷你竞速" : narrativeStyle === "cultural" ? "SPEED CHALLENGE • 罗马音限时疾驰" : "COGNITIVE EVALUATION • 拼写速度常态评估"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 tracking-wide">
              {narrativeStyle === "mythology" 
                ? "时钟守卫战：限时罗马音疾驰" 
                : narrativeStyle === "cultural" 
                ? "时钟疾驰战：限时罗马音竞速" 
                : "罗马音极速拼写测试"}
            </h2>
            <p className="text-xs text-stone-500 max-w-xl mx-auto leading-relaxed">
              {narrativeStyle === "mythology" 
                ? "五十音守卫集结！古老的神社日晷已经启动，在 60 秒 倒计时里快速拼出随机降临的假名罗马音。每一次连续拼对，都将带来响彻神社的神圣音调连击 (Combo)，赚取巨额和币和神社限定好礼！"
                : narrativeStyle === "cultural"
                ? "风雅罗马音时钟已启动！在 60 秒 倒计时里快速拼出随机出现的假名罗马音。每一次连续拼对，都将带来渐进的和声连击 (Combo)，赚取大量岁币成果！"
                : "极速拼写认知评估启动。在 60 秒 限时中，根据呈现的假名快速输入对应的标准罗马拼写方案，连续正确击键将产生 Combo 连击加成，优化积分评级！"}
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border max-w-md mx-auto grid grid-cols-2 gap-4 text-left font-mono text-[11px] text-stone-600">
            <div className="space-y-1">
              <div className="font-bold text-stone-800">
                {narrativeStyle === "mythology" ? "• 60秒日晷倒计时" : narrativeStyle === "cultural" ? "• 60秒和声倒计时" : "• 60秒严谨时限"}
              </div>
              <div>{narrativeStyle === "academic" ? "标准认知反应时间限制。" : "紧张刺激的流沙倒计时。"}</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-stone-800">
                {narrativeStyle === "mythology" ? "• 递增音调连击" : narrativeStyle === "cultural" ? "• 渐进音律连击" : "• 连续正确加成"}
              </div>
              <div>连击数越高，音效音调越高。</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-stone-800">
                {narrativeStyle === "mythology" ? "• 丰厚和币奖励" : narrativeStyle === "cultural" ? "• 丰厚岁币奖赏" : "• 阶梯表现积分"}
              </div>
              <div>S级结算可得 180 {nTrans("coinName", narrativeStyle)}！</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-stone-800">• 卡牌适用范围</div>
              <div>
                {gamePool.length === activeDict.length 
                  ? "未解卡，本场使用基础新手假名库" 
                  : `使用您已解锁的 ${gamePool.length} 张个人卡牌`}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={startNewGame}
              className="px-8 py-3.5 rounded-xl bg-stone-900 border border-transparent text-stone-50 hover:bg-amber-600 hover:text-stone-950 font-black text-sm cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-2 mx-auto"
            >
              <Zap className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
              <span>开启时钟挑战 (60s)</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* --- PLAYING VIEW --- */}
      {gameState === "playing" && currentCard && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 select-none">
          {/* Left panel: Retro sundial clock progress indicator */}
          <div className="md:col-span-4 p-6 rounded-2xl border-2 border-stone-800 bg-[#f9f7f4] flex flex-col items-center justify-center space-y-6 shadow relative">
            <div className="text-center">
              <div className="text-[10px] font-mono text-stone-400">
                {narrativeStyle === "mythology" ? "SHINTO SUNDIAL CLOCK" : narrativeStyle === "cultural" ? "ELEGANT TIMING CLOCK" : "COGNITIVE SPEED TIMER"}
              </div>
              <h3 className="font-serif font-black text-stone-800 text-sm">
                {narrativeStyle === "mythology" ? "古风日晷神明时钟" : narrativeStyle === "cultural" ? "雅致十二时辰钟" : "认知实验计时器"}
              </h3>
            </div>

            {/* Sundial clock visualization */}
            <div className="relative w-36 h-36 rounded-full border-4 border-stone-800 bg-stone-200/50 flex items-center justify-center shadow-inner">
              {/* Traditional Zodiac hour ticks */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-3 bg-stone-800/40"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-60px)`,
                  }}
                />
              ))}

              {/* Japanese zodiac characters printed elegantly on edges */}
              <span className="absolute top-2.5 text-[10px] font-serif font-bold text-stone-700">子</span>
              <span className="absolute right-2.5 text-[10px] font-serif font-bold text-stone-700">卯</span>
              <span className="absolute bottom-2.5 text-[10px] font-serif font-bold text-stone-700">午</span>
              <span className="absolute left-2.5 text-[10px] font-serif font-bold text-stone-700">酉</span>

              {/* Inner dial rotation needle */}
              <div 
                className="absolute w-1.5 h-16 bg-red-600 rounded-full origin-bottom"
                style={{
                  transform: `rotate(${sundialAngle}deg) translateY(-24px)`,
                  transition: "transform 0.1s linear"
                }}
              />
              <div className="absolute w-4.5 h-4.5 rounded-full bg-stone-900 border-2 border-stone-200" />
            </div>

            {/* Electronic digital countdown overlay */}
            <div className="text-center space-y-1">
              <div className="text-3xl font-mono font-black text-stone-900">
                {Math.ceil(timeLeft / 1000)} <span className="text-sm font-bold text-stone-400">秒</span>
              </div>
              <div className="w-32 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${timeLeft < 15000 ? "bg-red-500 animate-pulse" : "bg-amber-600"}`} 
                  style={{ width: `${(timeLeft / 60000) * 100}%` }}
                />
              </div>
            </div>

            {/* Combo Count & Floating Score popups display */}
            <div className="h-16 w-full flex items-center justify-center relative">
              <AnimatePresence>
                {combo > 1 && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1, 1.3, 1], opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    key={combo}
                    className="text-center select-none"
                  >
                    <span className="text-[10px] font-mono font-black text-rose-500 block uppercase tracking-widest animate-pulse">
                      COMBO FIRE!
                    </span>
                    <h4 
                      className="text-2xl font-serif font-black text-stone-950 drop-shadow-sm tracking-wide"
                      style={{ fontSize: `${Math.min(3.5, 1.5 + combo * 0.05)}rem` }}
                    >
                      连击 ×{combo}
                    </h4>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Float Points Score popups */}
              <AnimatePresence>
                {scorePopups.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.8, y: 0 }}
                    animate={{ opacity: 1, scale: 1.1, y: p.y }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute text-emerald-600 text-xs font-mono font-black select-none pointer-events-none"
                    style={{ left: `calc(50% + ${p.x}px)` }}
                  >
                    {p.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right panel: Active Card & Speller typewriter interface */}
          <div className="md:col-span-8 p-6 md:p-8 rounded-2xl border-2 border-stone-800 bg-white shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Shake class trigger on error */}
            <div className={`space-y-6 h-full flex flex-col justify-between transition-transform duration-100 ${isShaking ? "translate-x-1 animate-ping" : ""}`}>
              
              {/* Header: Score Counter */}
              <div className="flex justify-between items-center text-xs font-mono text-stone-500 pb-3 border-b border-dashed">
                <span>时钟守卫战 · 第 {score + 1} 关</span>
                <span className="bg-stone-900 text-stone-50 px-2 py-0.5 rounded font-bold">
                  已拼对: <b>{score}</b> 张卡牌
                </span>
              </div>

              {/* Main Card graphic */}
              <div className="flex flex-col items-center justify-center space-y-4 text-center py-4">
                <div className="p-3 bg-[#fcfbf9] border-2 border-stone-250 rounded-2xl shadow-sm hover:scale-105 transition-all">
                  <CardIllustration id={currentCard.id} category={currentCard.category} className="w-16 h-16" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-4xl font-serif font-black text-stone-950 tracking-wide">{currentCard.kanji}</h4>
                  <p className="text-xs text-stone-500 font-sans italic max-w-md">
                    {currentCard.meaning}
                  </p>
                </div>
              </div>

              {/* Speller Interactive UI */}
              <div className="space-y-4 pt-2">
                {/* Segments Display */}
                <div className="flex items-center justify-center gap-2 select-none">
                  {currentCard.segments.map((seg, idx) => {
                    const isCompleted = idx < currentSegmentIdx;
                    const isActive = idx === currentSegmentIdx;

                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center w-16 h-20 transition-all ${
                          isCompleted 
                            ? "bg-emerald-50 border-emerald-400 text-emerald-950"
                            : isActive
                            ? "bg-amber-500/10 border-amber-500 text-stone-900 shadow-md scale-105"
                            : "bg-stone-50 border-stone-200 text-stone-400"
                        }`}
                      >
                        {/* Syllable Kana */}
                        <span className="text-xl font-serif font-black">{seg.kana}</span>
                        {/* Syllable Romaji */}
                        <span className="text-[10px] font-mono font-bold uppercase mt-1">
                          {isCompleted ? seg.displayRomaji : isActive ? (romajiProgress || "•") : "?"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Keyboard guide helper text */}
                <p className="text-center text-[10px] text-stone-450 font-mono tracking-wide leading-relaxed">
                  💡 电脑端请直接在键盘上敲击对应罗马音字母！手机端可点击输入框唤醒系统键盘拼写。
                  <br />
                  当前拼写进度: <span className="text-amber-800 font-bold font-mono">[{romajiProgress || "..."}]</span> | 
                  本段期望: <span className="text-stone-700 font-bold font-mono">[{currentCard.segments[currentSegmentIdx]?.displayRomaji}]</span>
                </p>

                {/* Desktop Virtual Keyboard Helper view */}
                <div className="hidden sm:flex flex-col gap-1.5 pt-4 max-w-md mx-auto">
                  {[
                    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
                    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
                    ["Z", "X", "C", "V", "B", "N", "M"]
                  ].map((row, rowIdx) => (
                    <div key={rowIdx} className="flex justify-center gap-1 text-[9px] font-mono">
                      {row.map((char) => {
                        const isPrimaryTarget = currentCard.segments[currentSegmentIdx]?.displayRomaji.toUpperCase().includes(char);
                        return (
                          <span 
                            key={char} 
                            className={`w-7 h-7 rounded border flex items-center justify-center font-bold transition-all ${
                              isPrimaryTarget 
                                ? "border-amber-400 bg-amber-50 text-amber-900 shadow-sm font-black scale-105" 
                                : "border-stone-200 bg-stone-50 text-stone-400"
                            }`}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- SUMMARY RESULTS VIEW --- */}
      {gameState === "summary" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-2xl border-2 border-stone-800 bg-[#f9f7f4] space-y-6 shadow-xl relative overflow-hidden select-none"
        >
          {/* Authentic red calligraphy stamp overlay depending on Grade */}
          <div className="absolute top-12 right-12 pointer-events-none select-none opacity-20 transform rotate-12 scale-150">
            <div className="w-16 h-16 rounded-full border-4 border-double border-red-600 flex items-center justify-center font-serif text-sm font-black text-red-600">
              {gradeDetails.seal}
            </div>
          </div>

          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 font-bold uppercase block">
              {narrativeStyle === "mythology" ? "CHALLENGE COMPLETED • 战绩功勋书" : narrativeStyle === "cultural" ? "CHALLENGE COMPLETED • 战绩成果单" : "EVALUATION COMPLETED • 评测成绩单"}
            </span>
            <h2 className="text-3xl font-serif font-black text-stone-900 tracking-wide">
              {narrativeStyle === "mythology" 
                ? "时钟守卫战·限时疾驰结算" 
                : narrativeStyle === "cultural" 
                ? "时钟疾驰战·限时竞速结算" 
                : "极速拼写测试·限时认知评估"}
            </h2>
          </div>

          {/* Central score badge & grade */}
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-white border-2 border-stone-800 text-center space-y-4 shadow-sm">
            <div className="flex justify-center items-center gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-stone-400">SPELL RUSH GRADE</div>
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-4xl font-black font-serif ${gradeDetails.color}`}>
                  {gradeDetails.grade}
                </div>
              </div>

              <div className="text-left space-y-1">
                <h3 className="text-lg font-serif font-black text-stone-850">{gradeDetails.title}</h3>
                <p className="text-xs text-stone-500 leading-normal max-w-xs">{gradeDetails.desc}</p>
              </div>
            </div>

            {/* Quick statistics row */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-dashed text-stone-600 text-xs font-mono">
              <div className="p-2 bg-stone-50 rounded-xl border">
                <div className="text-stone-400 text-[9px]">{narrativeStyle === "academic" ? "拼对总数" : "已拼对卡牌"}</div>
                <div className="text-stone-800 font-black text-lg mt-0.5">{score}</div>
              </div>
              <div className="p-2 bg-stone-50 rounded-xl border">
                <div className="text-stone-400 text-[9px]">最大连击 Combo</div>
                <div className="text-stone-800 font-black text-lg mt-0.5">{maxCombo}</div>
              </div>
              <div className="p-2 bg-stone-50 rounded-xl border">
                <div className="text-stone-400 text-[9px]">输入准确率</div>
                <div className="text-stone-800 font-black text-lg mt-0.5">{accuracy}%</div>
              </div>
            </div>
          </div>

          {/* Reward Ceremony notification bar */}
          <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/80 max-w-md mx-auto text-center space-y-2">
            <div className="text-xs text-amber-950 font-serif font-black flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>
                {narrativeStyle === "mythology" 
                  ? "神明赐予您以下修行奖赏：" 
                  : narrativeStyle === "cultural" 
                  ? "恭喜您获得以下研习成果奖赏：" 
                  : "恭喜您获得以下拼写评测积分："}
              </span>
            </div>
            <div className="text-2xl font-mono font-black text-amber-900">
              🪙 +{gradeDetails.coins} {nTrans("coinName", narrativeStyle)}
            </div>
            {gradeDetails.cardPackGift && (
              <p className="text-[10px] text-amber-800/80 leading-relaxed font-sans max-w-xs mx-auto">
                🎉 额外解锁大礼！您获得了在抽卡中心抽取一张<b>
                  {narrativeStyle === "mythology"
                    ? (gradeDetails.cardPackGift === "legendary" ? "天道神珍宿命包" : gradeDetails.cardPackGift === "culture" ? "万叶繁茂名物包" : "和风新手御守包")
                    : narrativeStyle === "cultural"
                    ? (gradeDetails.cardPackGift === "legendary" ? "典藏流光岁时包" : gradeDetails.cardPackGift === "culture" ? "风物繁华集赞包" : "新手雅致入门包")
                    : (gradeDetails.cardPackGift === "legendary" ? "高阶记忆扩容包" : gradeDetails.cardPackGift === "culture" ? "中阶字形巩固包" : "初阶基础强化包")
                  }
                </b>卡包的等额{nTrans("coinName", narrativeStyle)}福利！
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <button
              onClick={startNewGame}
              className="flex-1 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-black text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>再次挑战</span>
            </button>

            <button
              onClick={handleClaimRewards}
              className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-50 font-black text-xs transition-colors cursor-pointer shadow flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {narrativeStyle === "mythology" ? "收下和币并离开" : narrativeStyle === "cultural" ? "收下岁币并离开" : "结束评测并返回"}
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
