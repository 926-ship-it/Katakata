import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Trophy, Flame, Clock, BookOpen, Coins, Share2, Check, ArrowRight, X, Heart } from "lucide-react";
import { audioSynth } from "../utils/audio";
import { DailyGoalConfig, getDailyGoal } from "../utils/dailyGoal";
import { PearlString, GirlhoodUmbrella, DessertPlateDoodle, HandDrawnPencil, ScallopLaceTrim } from "./AestheticDoodles";
import { DailyZineModal } from "./DailyZineModal";

interface DailyCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (bonusCoins: number) => void;
  onNavigateToGame?: () => void;
  isEnglishMode?: boolean;
}

export const DailyCelebrationModal: React.FC<DailyCelebrationModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
  onNavigateToGame,
  isEnglishMode = false,
}) => {
  const [goal, setGoal] = useState<DailyGoalConfig>(getDailyGoal);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZineOpen, setIsZineOpen] = useState<boolean>(false);


  useEffect(() => {
    if (isOpen) {
      setGoal(getDailyGoal());
      setClaimed(false);
      setCopied(false);
      try {
        audioSynth.playCelebrationTriumph();
      } catch (_) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const bonusCoins = 150;

  const handleClaim = () => {
    if (!claimed) {
      setClaimed(true);
      try {
        audioSynth.playCoin();
      } catch (_) {}
      if (onRewardClaimed) {
        onRewardClaimed(bonusCoins);
      }
    }
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleShare = () => {
    const text = isEnglishMode
      ? `✨ I completed today's language practice on Katakata Atelier! ${goal.actualMinutes} mins · ${goal.actualWords} words · ${Math.max(1, goal.streakDays)} day streak! 🌸`
      : `✨ 我在「Katakata 咔嗒 · 多语言工坊」达成了今日学习目标！已坚持 ${goal.actualMinutes} 分钟 · 默写 ${goal.actualWords} 个词汇 · 连续打卡 ${Math.max(1, goal.streakDays)} 天！🌸`;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        audioSynth.playCoin();
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (_) {}
  };

  // 18 Floating stars/sparkles with pseudo-random offsets
  const sparklesList = [
    { left: "10%", top: "18%", delay: 0.1, size: 18, color: "#FDE047" },
    { left: "85%", top: "15%", delay: 0.3, size: 24, color: "#F472B6" },
    { left: "8%", top: "60%", delay: 0.5, size: 20, color: "#C084FC" },
    { left: "88%", top: "65%", delay: 0.2, size: 22, color: "#60A5FA" },
    { left: "22%", top: "82%", delay: 0.4, size: 16, color: "#34D399" },
    { left: "75%", top: "85%", delay: 0.6, size: 20, color: "#FBBF24" },
    { left: "30%", top: "12%", delay: 0.7, size: 14, color: "#F472B6" },
    { left: "68%", top: "20%", delay: 0.2, size: 18, color: "#A78BFA" },
    { left: "48%", top: "8%", delay: 0.5, size: 26, color: "#FDE047" },
  ];

  // 12 Confetti streamers
  const confettiList = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    left: `${(i * 7 + 4) % 96}%`,
    delay: (i * 0.15) % 1.8,
    duration: 3 + (i % 3) * 0.8,
    bg: ["#fbcfe8", "#bae6fd", "#fef08a", "#ddd6fe", "#bbf7d0", "#fed7aa"][i % 6],
    width: 8 + (i % 4) * 3,
    height: 14 + (i % 3) * 6,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-stone-900/60 backdrop-blur-md">
      {/* Falling Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiList.map((c) => (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: c.left,
              top: "-20px",
              width: `${c.width}px`,
              height: `${c.height}px`,
              backgroundColor: c.bg,
              borderRadius: "3px",
              opacity: 0.85,
              animation: `confetti-fall ${c.duration}s linear infinite`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}

        {/* Ambient twinkle stars */}
        {sparklesList.map((s, idx) => (
          <div
            key={idx}
            className="absolute animate-sparkle select-none pointer-events-none"
            style={{
              left: s.left,
              top: s.top,
              animationDelay: `${s.delay}s`,
              color: s.color,
              fontSize: `${s.size}px`,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* Main Polaroid Celebration Card with Solid Scrapbook Border - Compact & Screen-Fit */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, rotate: -1.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 15 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        className="relative w-full max-w-[420px] bg-white rounded-2xl p-4 sm:p-5 border-2 border-stone-850 shadow-[5px_5px_0px_#2E2530] z-10 bg-halftone-dots my-auto max-h-[90vh] overflow-y-auto"
      >
        {/* Washi tape header */}
        <div className="washi-tape scale-90" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-pink-100 transition-colors border border-stone-300 bg-white shadow-2xs z-20 cursor-pointer"
          title="关闭"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Top Doodles: Pearl string, umbrella, plate */}
        <div className="flex justify-between items-center px-1 mb-1">
          <PearlString count={5} />
          <div className="flex items-center gap-1.5">
            <GirlhoodUmbrella size={18} />
            <DessertPlateDoodle size={20} />
          </div>
        </div>

        {/* Art Nouveau decorative corner flourish */}
        <div className="text-center pt-0.5 pb-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-100/90 text-rose-700 text-[10px] tracking-wider uppercase font-bold mb-1 border border-rose-300 shadow-2xs">
            <span>⋆ ✦ ⋆</span>
            <span>{isEnglishMode ? "Daily Ritual Complete" : "今日练习修行圆满达成"}</span>
            <span>⋆ ✦ ⋆</span>
          </div>

          <h2 className="font-script text-2xl sm:text-3xl text-rose-500 font-bold tracking-wide drop-shadow-2xs my-0.5">
            Daydream Accomplished
          </h2>
          <p className="font-serif-vintage italic text-stone-600 text-[11px] sm:text-xs">
            "Slow rituals for softer weeks · 繁星不问赶路人，时光不负有心者"
          </p>
        </div>

        {/* Rosette Medal / Stamp - Compact version */}
        <div className="flex justify-center my-1.5">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-pink-300 via-purple-200 to-sky-200 p-0.5 shadow-md border-2 border-dashed border-pink-400">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-1 text-center shadow-inner">
              <Trophy className="w-4 h-4 text-amber-500 mb-0.5 animate-bounce-slow" />
              <span className="text-[9px] font-bold text-pink-600 tracking-wider leading-none">
                {isEnglishMode ? "VICTORY" : "今日圆满"}
              </span>
              <span className="text-[8px] text-purple-600 font-mono scale-90">100% DONE</span>
            </div>
          </div>
        </div>

        {/* Stats Grid inside Polaroid Frame */}
        <div className="grid grid-cols-3 gap-2 my-2.5 bg-white/85 p-2 rounded-xl border border-pink-100 shadow-2xs backdrop-blur-xs">
          <div className="text-center p-1.5 rounded-lg bg-pink-50/70 border border-pink-100">
            <div className="flex items-center justify-center gap-1 text-pink-600 mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">{isEnglishMode ? "Time" : "今日时长"}</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-stone-800">
              {goal.actualMinutes}
              <span className="text-[10px] font-normal text-stone-500 ml-0.5">m</span>
            </div>
          </div>

          <div className="text-center p-1.5 rounded-lg bg-purple-50/70 border border-purple-100">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-0.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">{isEnglishMode ? "Words" : "打卡词汇"}</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-stone-800">
              {goal.actualWords}
              <span className="text-[10px] font-normal text-stone-500 ml-0.5">{isEnglishMode ? "w" : "词"}</span>
            </div>
          </div>

          <div className="text-center p-1.5 rounded-lg bg-amber-50/70 border border-amber-100">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-medium">{isEnglishMode ? "Streak" : "连击天数"}</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-stone-800">
              {Math.max(1, goal.streakDays)}
              <span className="text-[10px] font-normal text-stone-500 ml-0.5">{isEnglishMode ? "d" : "天"}</span>
            </div>
          </div>
        </div>

        {/* Coin reward highlight */}
        <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-100/90 via-pink-100/80 to-purple-100/90 border border-amber-300/80 shadow-2xs mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-amber-400 text-stone-900 shadow-2xs animate-pulse">
              <Coins className="w-4 h-4 text-amber-950" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-800">
                {isEnglishMode ? "Daily Achievement Bonus" : "每日达成奖励礼包"}
              </div>
              <div className="text-[10px] text-stone-600">
                {isEnglishMode ? "+150 Katakata Coins credited" : "+150 咔嗒铜钱已备好"}
              </div>
            </div>
          </div>
          <span className="font-mono font-bold text-xs text-amber-800 bg-white/80 px-2 py-0.5 rounded border border-amber-200">
            +150 🪙
          </span>
        </div>

        {/* Generate Daily Zine Highlight Banner */}
        <button
          onClick={() => setIsZineOpen(true)}
          className="w-full mb-2.5 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 hover:from-rose-200 hover:to-pink-200 text-rose-800 font-mono font-bold text-xs flex items-center justify-between border-2 border-rose-400 shadow-[2px_2px_0px_#F43F5E] active:scale-98 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base">💌</span>
            <span className="font-sans font-bold text-xs text-rose-900">
              {isEnglishMode ? "Generate Daily Aesthetic Zine" : "生成今日手作日签"}
            </span>
          </div>
          <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-sans font-bold flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            <span>查看日签 →</span>
          </span>
        </button>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={handleClaim}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#2E2530] border-2 border-stone-850 flex items-center justify-center gap-1.5 transform active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isEnglishMode ? "Collect Rewards & Keep Glowing" : "收下奖励并继续发光"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 border-2 border-pink-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (isEnglishMode ? "Copied!" : "已复制战报！") : (isEnglishMode ? "Share Record" : "分享成就战报")}</span>
            </button>

            {onNavigateToGame && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToGame();
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border-2 border-purple-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>{isEnglishMode ? "Polyglot Game" : "多语穿梭对决"}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Vintage polaroid footer signature */}
        <div className="mt-2.5 pt-2 border-t border-pink-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
          <span className="flex items-center gap-1">
            <HandDrawnPencil size={11} />
            <span>KATAKATA · 咔嗒工坊</span>
          </span>
          <span>✦ ✧ SOFTER RITUALS ✧ ✦</span>
          <span>{goal.date}</span>
        </div>
      </motion.div>

      {/* Embedded Daily Zine Modal */}
      <DailyZineModal
        isOpen={isZineOpen}
        onClose={() => setIsZineOpen(false)}
        isEnglishMode={isEnglishMode}
      />
    </div>
  );
};
