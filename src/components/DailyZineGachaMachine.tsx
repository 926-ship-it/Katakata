import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RotateCw, Heart, Gift, Volume2 } from "lucide-react";
import { audioSynth } from "../utils/audio";
import { PearlString, GirlhoodUmbrella, DessertPlateDoodle, HandDrawnPencil } from "./AestheticDoodles";

interface DailyZineGachaMachineProps {
  onOpenZine: () => void;
  isEnglishMode?: boolean;
}

type GachaStatus = "idle" | "cranking" | "dispensing" | "opened";

interface Capsule {
  id: number;
  topColor: string;
  botColor: string;
  x: number;
  y: number;
  rot: number;
}

const PRESET_CAPSULES: Capsule[] = [
  { id: 1, topColor: "#FDA4AF", botColor: "#FFFFFF", x: 18, y: 35, rot: 15 },
  { id: 2, topColor: "#C084FC", botColor: "#FEF08A", x: 42, y: 20, rot: -25 },
  { id: 3, topColor: "#93C5FD", botColor: "#FFFFFF", x: 68, y: 32, rot: 40 },
  { id: 4, topColor: "#F472B6", botColor: "#BAE6FD", x: 28, y: 55, rot: -10 },
  { id: 5, topColor: "#FDE047", botColor: "#FCE7F3", x: 55, y: 52, rot: 20 },
  { id: 6, topColor: "#86EFAC", botColor: "#FFFFFF", x: 75, y: 62, rot: -30 },
];

export const DailyZineGachaMachine: React.FC<DailyZineGachaMachineProps> = ({
  onOpenZine,
  isEnglishMode = false,
}) => {
  const [status, setStatus] = useState<GachaStatus>("idle");
  const [crankAngle, setCrankAngle] = useState<number>(0);
  const [activeCapsuleColor, setActiveCapsuleColor] = useState<{ top: string; bot: string }>({
    top: "#FDA4AF",
    bot: "#FFFFFF",
  });
  const [capsuleShake, setCapsuleShake] = useState<boolean>(false);

  const handleTurnCrank = () => {
    if (status !== "idle") return;

    // Pick random capsule colors
    const randomPick = PRESET_CAPSULES[Math.floor(Math.random() * PRESET_CAPSULES.length)];
    setActiveCapsuleColor({ top: randomPick.topColor, bot: randomPick.botColor });

    // Step 1: Cranking with Ratchet Sound
    setStatus("cranking");
    setCrankAngle((prev) => prev + 360);
    setCapsuleShake(true);
    audioSynth.playGachaCrank();

    // Step 2: Capsule Rolling Down Chute
    setTimeout(() => {
      setCapsuleShake(false);
      setStatus("dispensing");
      audioSynth.playGachaRoll();

      // Step 3: Capsule Pops Open with Stars & Fanfare
      setTimeout(() => {
        setStatus("opened");
        audioSynth.playGachaPop();
      }, 1200);
    }, 900);
  };

  const handleClaimPostcard = () => {
    setStatus("idle");
    onOpenZine();
  };

  return (
    <div className="relative w-full max-w-[320px] mx-auto select-none">
      {/* 1. GACHA MACHINE BODY (Retro Pastel Strawberry & Cream Cabinet) */}
      <div className="relative rounded-3xl bg-[#FFF8F8] border-2 border-stone-850 shadow-[6px_6px_0px_#2E2530] p-4 pt-3 overflow-hidden">
        
        {/* Top Diagonal Corner Tape */}
        <div className="tape-corner-tr opacity-80" />

        {/* Machine Header Marquee */}
        <div className="flex items-center justify-between border-b-2 border-stone-850 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🎰</span>
            <div>
              <div className="font-mono text-xs font-black text-stone-900 tracking-tight leading-none">
                DAILY ZINE GACHA
              </div>
              <div className="text-[10px] font-sans font-bold text-rose-600">
                &lt;今日手作日签扭蛋机&gt;
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full">
            FREE COIN
          </span>
        </div>

        {/* 2. TRANSPARENT CAPSULE GLOBE (Dome with colorful tumbling capsules) */}
        <div className="relative h-44 w-full rounded-2xl bg-gradient-to-b from-sky-50 via-white/80 to-pink-50 border-2 border-stone-850 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Glass Specular Glare Arc */}
          <div className="absolute top-2 left-3 w-16 h-8 rounded-full border-t-2 border-l-2 border-white/90 rotate-[-20deg] pointer-events-none" />
          <div className="absolute top-2 right-3 text-pink-300 text-xs font-serif pointer-events-none animate-sparkle">✦</div>

          {/* Capsules tumbling inside the globe */}
          <div className="relative w-full h-full">
            {PRESET_CAPSULES.map((cap) => (
              <motion.div
                key={cap.id}
                animate={
                  capsuleShake
                    ? {
                        x: [cap.x, cap.x + (Math.random() * 24 - 12), cap.x],
                        y: [cap.y, cap.y + (Math.random() * 24 - 12), cap.y],
                        rotate: [cap.rot, cap.rot + (Math.random() * 120 - 60), cap.rot],
                      }
                    : {
                        y: [cap.y, cap.y - 3, cap.y],
                        rotate: [cap.rot, cap.rot + 2, cap.rot],
                      }
                }
                transition={{
                  duration: capsuleShake ? 0.18 : 3 + cap.id * 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="absolute w-8 h-8 rounded-full border border-stone-850 shadow-sm flex flex-col overflow-hidden cursor-pointer"
                style={{
                  left: `${cap.x}%`,
                  top: `${cap.y}%`,
                  transform: `rotate(${cap.rot}deg)`,
                }}
                onClick={handleTurnCrank}
                title="点击扭蛋机扭动！"
              >
                {/* Top Half Dome */}
                <div className="h-1/2 w-full" style={{ backgroundColor: cap.topColor }} />
                {/* Bottom Half Dome */}
                <div className="h-1/2 w-full" style={{ backgroundColor: cap.botColor }} />
                {/* Center Seam Ring */}
                <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-stone-850/40 -translate-y-1/2" />
              </motion.div>
            ))}
          </div>

          {/* Doodles inside globe */}
          <div className="absolute bottom-1 right-2 pointer-events-none opacity-40">
            <DessertPlateDoodle size={18} />
          </div>
        </div>

        {/* 3. CENTER ROTARY CRANK & MECHANISM CONTROLS */}
        <div className="my-3 py-2 px-3 rounded-xl bg-pink-100/70 border-2 border-stone-850 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono font-bold text-stone-850 flex items-center gap-1">
              <span>旋钮机构</span>
              <span className="text-rose-600 animate-pulse">●</span>
            </div>
            <div className="text-[10px] text-stone-500 font-sans">
              {status === "idle" && "点击旋钮或按钮启动扭蛋"}
              {status === "cranking" && "⚙️ 齿轮机械咬合旋转中..."}
              {status === "dispensing" && "✨ 扭蛋滚入取物口..."}
              {status === "opened" && "🎉 扭蛋开启！日签就绪！"}
            </div>
          </div>

          {/* The Turning Crank Handle */}
          <motion.button
            type="button"
            onClick={handleTurnCrank}
            disabled={status !== "idle"}
            animate={{ rotate: crankAngle }}
            transition={{ type: "spring", damping: 14, stiffness: 120 }}
            className={`w-12 h-12 rounded-full bg-white border-2 border-stone-850 shadow-[2px_2px_0px_#2E2530] flex items-center justify-center relative cursor-pointer group active:scale-90 ${
              status !== "idle" ? "opacity-90" : "hover:border-rose-600"
            }`}
            title="点击扭动 360° 获取今日日签"
          >
            {/* Rotary handle bar */}
            <div className="w-9 h-2.5 rounded-full bg-gradient-to-r from-amber-300 via-rose-300 to-amber-300 border border-stone-850 transform rotate-45" />
            <div className="absolute w-4 h-4 rounded-full bg-stone-900 border border-white flex items-center justify-center">
              <span className="text-[8px] text-white">✦</span>
            </div>
          </motion.button>
        </div>

        {/* 4. CAPSULE EXIT TRAY / RETRIEVAL SLOT (取蛋口) */}
        <div className="relative rounded-2xl bg-stone-900 border-2 border-stone-850 p-2.5 min-h-[68px] flex items-center justify-center text-center overflow-hidden shadow-inner">
          
          {status === "idle" && (
            <div className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
              <span>⬇️ 取物口已就绪</span>
            </div>
          )}

          {status === "cranking" && (
            <div className="text-[11px] font-mono text-amber-300 flex items-center gap-1 animate-pulse">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>摇晃掉落中...</span>
            </div>
          )}

          {status === "dispensing" && (
            <motion.div
              initial={{ y: -30, scale: 0.5, rotate: -45 }}
              animate={{ y: 0, scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                setStatus("opened");
                audioSynth.playGachaPop();
              }}
            >
              {/* Dropped Capsule */}
              <div className="w-10 h-10 rounded-full border-2 border-stone-850 shadow-md flex flex-col overflow-hidden animate-bounce">
                <div className="h-1/2 w-full" style={{ backgroundColor: activeCapsuleColor.top }} />
                <div className="h-1/2 w-full" style={{ backgroundColor: activeCapsuleColor.bot }} />
              </div>
              <span className="text-xs font-mono font-bold text-amber-200">
                滚出啦！正在开启...
              </span>
            </motion.div>
          )}

          {status === "opened" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-between w-full px-1"
            >
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-xl animate-bounce">💌</span>
                <div>
                  <div className="text-xs font-mono font-bold text-pink-300">
                    日签胶囊已开启！
                  </div>
                  <div className="text-[10px] text-stone-300 font-sans">
                    点击立刻翻开日签海报
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimPostcard}
                className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-mono font-bold text-[11px] shadow-sm hover:from-rose-600 hover:to-pink-600 active:scale-95 transition-all cursor-pointer"
              >
                翻开 ＞
              </button>
            </motion.div>
          )}
        </div>

        {/* 5. PRIMARY ACTION BUTTON */}
        <div className="mt-3 space-y-1.5">
          <button
            type="button"
            onClick={status === "opened" ? handleClaimPostcard : handleTurnCrank}
            disabled={status === "cranking" || status === "dispensing"}
            className={`w-full py-2.5 px-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-1.5 border-2 border-stone-850 shadow-[3px_3px_0px_#2E2530] transition-all cursor-pointer ${
              status === "opened"
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
                : "bg-stone-900 hover:bg-stone-800 text-white active:scale-95"
            } disabled:opacity-60`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {status === "idle" && "💫 扭一扭 · 获取今日手作日签"}
              {status === "cranking" && "正在扭动齿轮..."}
              {status === "dispensing" && "扭蛋掉落中..."}
              {status === "opened" && "💌 翻开展开今日手作日签"}
            </span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-1">
            <span className="flex items-center gap-1">
              <HandDrawnPencil size={11} />
              <span>纯手工音效 · 模拟机械</span>
            </span>
            <button
              type="button"
              onClick={handleTurnCrank}
              disabled={status !== "idle"}
              className="text-rose-600 font-bold hover:underline cursor-pointer disabled:opacity-50"
            >
              再扭一次 ↺
            </button>
          </div>
        </div>

        {/* Pearl chain decoration along bottom */}
        <div className="mt-2 pt-2 border-t border-pink-100 flex justify-center">
          <PearlString count={9} />
        </div>

      </div>
    </div>
  );
};
