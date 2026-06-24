import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface TracingKanaProps {
  kana: string;
  isCorrect: boolean;
  active: boolean;
  displayRomaji: string;
  romajiProgress: string; // what the user has currently typed for this kana (e.g., "s" for "sa")
  isEnglishMode?: boolean;
}

export const TracingKana: React.FC<TracingKanaProps> = ({
  kana,
  isCorrect,
  active,
  displayRomaji,
  romajiProgress,
  isEnglishMode = false,
}) => {
  // Let's create a beautiful traditional Japanese gridded paper (田字格)
  return (
    <div
      className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg border-2 flex flex-col items-center justify-center bg-stone-50 transition-all duration-300 ${
        active
          ? "border-amber-500 shadow-md ring-2 ring-amber-200"
          : isCorrect
          ? "border-rose-400 bg-rose-50/20"
          : "border-stone-300"
      }`}
    >
      {/* Background traditional dashed grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-stone-400" />
        <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-stone-400" />
      </div>

      {/* Rarity/Progress indicator inside grid corner */}
      <div className="absolute top-1 right-2 text-[8px] sm:text-[10px] font-mono text-stone-400 select-none">
        {displayRomaji === " " ? "SPACE" : displayRomaji.toUpperCase()}
      </div>

      {/* Main Calligraphic Character */}
      <div className="relative select-none text-center">
        {/* Underlay character - grayed out or placeholder */}
        <span
          className={`text-3xl sm:text-4xl md:text-6xl font-bold tracking-normal transition-colors duration-300 ${
            isCorrect ? "text-stone-300/40" : active ? "text-stone-800" : "text-stone-400"
          }`}
          style={{ fontFamily: isEnglishMode ? 'ui-sans-serif, system-ui, sans-serif' : '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
        >
          {kana === " " ? "␣" : kana}
        </span>

        {/* Animated Red-Ink Calligraphy Tracing Overlay (描红效果) */}
        <AnimatePresence>
          {isCorrect && (
            <motion.span
              initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", opacity: 0.2 }}
              animate={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                opacity: [0.3, 1, 0.95],
              }}
              transition={{ duration: 0.75, ease: "easeInOut" }}
              className="absolute inset-0 text-3xl sm:text-4xl md:text-6xl text-rose-600 font-bold drop-shadow-[0_0_8px_rgba(225,29,72,0.6)]"
              style={{
                fontFamily: isEnglishMode ? 'ui-sans-serif, system-ui, sans-serif' : '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif',
                WebkitTextStroke: isEnglishMode ? "0px" : "1.5px #e11d48",
              }}
            >
              {kana === " " ? "␣" : kana}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Romaji completion guide underneath */}
      <div className="absolute bottom-1 w-full text-center">
        {isCorrect ? (
          <span className="text-[10px] sm:text-xs font-semibold text-rose-600 font-mono flex items-center justify-center gap-0.5">
            ✓ {displayRomaji === " " ? "SPACE" : displayRomaji}
          </span>
        ) : active ? (
          <div className="flex justify-center items-center font-mono text-[10px] sm:text-xs">
            <span className="text-amber-600 font-bold underline bg-amber-50 px-1 rounded">
              {romajiProgress === " " ? "SPACE" : (romajiProgress || "...")}
            </span>
            <span className="text-stone-300">
              {(displayRomaji === " " ? " " : displayRomaji).substring(romajiProgress.length)}
            </span>
          </div>
        ) : (
          <span className="text-[10px] sm:text-xs text-stone-400 font-mono tracking-wider">
            {displayRomaji === " " ? "SPACE" : displayRomaji}
          </span>
        )}
      </div>

      {/* Decorative active brush stroke point on correct */}
      {isCorrect && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.5, 0], opacity: [1, 0.8, 0] }}
          transition={{ duration: 0.5 }}
          className="absolute w-4 h-4 rounded-full bg-rose-500 pointer-events-none"
        />
      )}
    </div>
  );
};
