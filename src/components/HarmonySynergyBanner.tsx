import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Sparkles, Music, Flame, Zap } from "lucide-react";

export interface HarmonyEventPayload {
  player1Id: string;
  player1Name: string;
  player1Avatar?: string;
  player2Id: string;
  player2Name: string;
  player2Avatar?: string;
  syllable1: string;
  syllable2: string;
  coopBonus: number;
  timeDiffMs: number;
  harmonyCount?: number;
}

interface HarmonySynergyBannerProps {
  event: HarmonyEventPayload;
  avatarOptions: Array<{ id: string; icon: string; label: string; color: string }>;
}

export const HarmonySynergyBanner: React.FC<HarmonySynergyBannerProps> = ({
  event,
  avatarOptions,
}) => {
  const av1 = avatarOptions.find((a) => a.id === event.player1Avatar) || avatarOptions[0];
  const av2 = avatarOptions.find((a) => a.id === event.player2Avatar) || avatarOptions[1] || avatarOptions[0];

  // Timing synergy level
  const synergyTier = useMemo(() => {
    const diff = event.timeDiffMs;
    if (diff <= 350) {
      return {
        title: "绝景 · 天衣无缝",
        sub: `神级共振仅相差 ${diff}ms`,
        badgeColor: "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950",
        borderGlow: "border-amber-300 shadow-amber-400/50",
        particleColor: "text-amber-300",
        label: "PERFECT HARMONY",
      };
    }
    if (diff <= 850) {
      return {
        title: "疾风 · 心有灵犀",
        sub: `同步节拍相差 ${diff}ms`,
        badgeColor: "bg-gradient-to-r from-rose-400 via-orange-300 to-amber-400 text-stone-950",
        borderGlow: "border-rose-300 shadow-rose-400/50",
        particleColor: "text-rose-300",
        label: "SUPER SYNERGY",
      };
    }
    return {
      title: "灵犀 · 双人和鸣",
      sub: `默契接力相差 ${diff}ms`,
      badgeColor: "bg-gradient-to-r from-purple-400 via-pink-300 to-amber-400 text-stone-950",
      borderGlow: "border-purple-300 shadow-purple-400/40",
      particleColor: "text-purple-300",
      label: "CO-OP HARMONY",
    };
  }, [event.timeDiffMs]);

  // Burst particles definition
  const particles = useMemo(() => [
    { text: "🎵", x: -80, y: -45, r: -25, scale: 1.2, delay: 0 },
    { text: "✨", x: 85, y: -50, r: 25, scale: 1.1, delay: 0.05 },
    { text: "和", x: -120, y: 15, r: -15, scale: 1.0, delay: 0.08 },
    { text: "鳴", x: 125, y: 20, r: 18, scale: 1.0, delay: 0.1 },
    { text: "奏", x: -60, y: 55, r: 20, scale: 0.9, delay: 0.12 },
    { text: "響", x: 65, y: 50, r: -20, scale: 0.9, delay: 0.14 },
    { text: "🎶", x: -140, y: -20, r: 35, scale: 1.1, delay: 0.06 },
    { text: "⭐", x: 140, y: -25, r: -35, scale: 1.0, delay: 0.09 },
  ], []);

  const streak = event.harmonyCount || 1;

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none flex flex-col items-center">
      {/* 1. Celestial Screen-Top Light Wash (天际极光和鸣流光) */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        exit={{ opacity: 0, scaleY: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full h-36 sm:h-44 bg-gradient-to-b from-amber-400/30 via-rose-400/15 to-transparent blur-md origin-top absolute top-0 inset-x-0"
      />

      {/* 2. Expanding Shockwave Collision Rings */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: [0.2, 2.4, 3.2], opacity: [0.9, 0.4, 0] }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="w-36 h-36 rounded-full border-2 border-amber-300 bg-amber-400/15"
        />
        <motion.div
          initial={{ scale: 0.1, opacity: 1 }}
          animate={{ scale: [0.1, 1.8, 2.6], opacity: [1, 0.5, 0] }}
          transition={{ duration: 0.9, delay: 0.08, ease: "easeOut" }}
          className="w-36 h-36 rounded-full border-2 border-rose-300 bg-rose-400/15 absolute inset-0"
        />
      </div>

      {/* 3. Floating Sparkle & Kanji Burst Particles */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {particles.map((p, idx) => (
          <motion.div
            key={idx}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
            animate={{
              x: p.x * 1.4,
              y: p.y * 1.4,
              scale: [0.3, p.scale, 0],
              opacity: [0, 1, 0],
              rotate: [0, p.r],
            }}
            transition={{
              duration: 1.4,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute font-serif font-black text-sm sm:text-base select-none drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] text-amber-200"
            style={{ left: 0, top: 0 }}
          >
            {p.text}
          </motion.div>
        ))}
      </div>

      {/* 4. MAIN SYNERGY HERALDRY BANNER (连携合奏华丽横幅) */}
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.75 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: [0.75, 1.06, 1],
        }}
        exit={{ opacity: 0, y: -30, scale: 0.85 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="mt-6 sm:mt-8 w-11/12 max-w-xl relative"
      >
        <div className={`relative rounded-3xl bg-gradient-to-r from-stone-950/95 via-stone-900/95 to-stone-950/95 border-2 ${synergyTier.borderGlow} shadow-2xl backdrop-blur-xl p-3 sm:p-4 text-white overflow-hidden`}>
          {/* Subtle Japanese lacquer pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-rose-500/10 to-transparent pointer-events-none" />

          {/* Top Tier Strip */}
          <div className="flex items-center justify-between border-b border-amber-400/20 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-widest ${synergyTier.badgeColor} shadow-xs`}>
                {synergyTier.label}
              </span>
              <span className="text-amber-200 text-xs font-serif font-bold tracking-wide">
                {synergyTier.title}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-black text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-current text-yellow-400 animate-bounce" />
              <span>+{event.coopBonus} 共鸣分</span>
            </div>
          </div>

          {/* Center Convergence Layout: Player 1 -> Resonance Clef <- Player 2 */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            {/* LEFT: Player 1 Card */}
            <motion.div
              initial={{ x: -25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center gap-2 min-w-0 flex-1"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md shrink-0">
                <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-lg sm:text-xl">
                  {av1.icon}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold font-serif text-stone-200 truncate">
                  {event.player1Name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-stone-400 font-mono">击发:</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-serif font-black text-xs border border-amber-500/40 shadow-xs">
                    {event.syllable1}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* CENTER: Resonance Jewel & Clef */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", damping: 12 }}
              className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4 text-center"
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30">
                  <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center text-base sm:text-lg">
                    🎶
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: "4s" }} />
              </div>

              <div className="mt-1 flex items-center gap-1">
                {streak > 1 ? (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 text-white font-mono font-black text-[10px] tracking-wider shadow-xs flex items-center gap-0.5 animate-pulse">
                    <Flame className="w-2.5 h-2.5 fill-current" />
                    <span>{streak}x 连携</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-amber-300/80">
                    {event.timeDiffMs}ms
                  </span>
                )}
              </div>
            </motion.div>

            {/* RIGHT: Player 2 Card */}
            <motion.div
              initial={{ x: 25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right"
            >
              <div className="min-w-0">
                <div className="text-[11px] sm:text-xs font-bold font-serif text-stone-200 truncate">
                  {event.player2Name}
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[9px] text-stone-400 font-mono">击发:</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-serif font-black text-xs border border-rose-500/40 shadow-xs">
                    {event.syllable2}
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 p-0.5 shadow-md shrink-0">
                <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-lg sm:text-xl">
                  {av2.icon}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Footer Description */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-serif text-stone-400">
            <span className="flex items-center gap-1 text-amber-300/90 font-sans">
              <Music className="w-3 h-3 text-amber-400" />
              <span>双人乐音合鸣共振</span>
            </span>
            <span className="font-mono text-stone-400">
              {synergyTier.sub}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
