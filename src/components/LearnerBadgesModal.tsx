import React from "react";
import { X, Award, CheckCircle, Lock, Sparkles, Flame } from "lucide-react";
import { LearnerBadge } from "../utils/badgesHelper";

interface LearnerBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: LearnerBadge[];
}

export const LearnerBadgesModal: React.FC<LearnerBadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
}) => {
  if (!isOpen) return null;

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-stone-50 border-2 border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-600/30 flex items-center justify-center text-amber-900 shadow-2xs">
              <Award className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                <span>学习者成就勋章图鉴</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold border border-amber-300">
                  {unlockedCount} / {badges.length} 已解锁
                </span>
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                记录多语言指尖刻意练习路上的每一座里程碑
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 [scrollbar-width:thin]">
          {badges.map((badge) => {
            const isUnlocked = badge.unlocked;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative overflow-hidden ${
                  isUnlocked
                    ? "bg-white border-amber-300 shadow-xs hover:shadow-md hover:border-amber-400"
                    : "bg-stone-100/70 border-stone-200 opacity-75"
                }`}
              >
                {/* Visual Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                    isUnlocked
                      ? "bg-amber-50 border-amber-200 shadow-2xs animate-in zoom-in-90 duration-300"
                      : "bg-stone-200/80 border-stone-300 grayscale"
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Details */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold font-serif truncate ${
                        isUnlocked ? "text-stone-900" : "text-stone-600"
                      }`}
                    >
                      {badge.title}
                    </span>
                    {isUnlocked ? (
                      <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5 text-amber-700" />
                        已获得
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500 bg-stone-200/80 px-1.5 py-0.5 rounded-full font-mono flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        {badge.progressText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-serif">
          <div className="flex items-center gap-1.5 text-amber-800 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>不断精进击键与默写，所有勋章皆在指尖铸就</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl font-bold transition-all cursor-pointer text-xs shadow-xs"
          >
            知晓并继续练习
          </button>
        </div>
      </div>
    </div>
  );
};
