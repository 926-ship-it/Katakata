import React, { useState, useEffect } from "react";
import { Target, Clock, BookOpen, Flame, CheckCircle, Edit3, Plus, RotateCcw, Award } from "lucide-react";
import { 
  DailyGoalConfig, 
  GoalTargetType, 
  getDailyGoal, 
  updateDailyGoalTarget, 
  addDailyProgress, 
  setDailyProgress 
} from "../utils/dailyGoal";
import { audioSynth } from "../utils/audio";

interface DailyGoalPanelProps {
  isEnglishMode?: boolean;
  onStartPracticeQuick?: (minutes: number) => void;
}

export const DailyGoalPanel: React.FC<DailyGoalPanelProps> = ({
  isEnglishMode = false,
  onStartPracticeQuick,
}) => {
  const [goal, setGoal] = useState<DailyGoalConfig>(getDailyGoal);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customInputValue, setCustomInputValue] = useState<string>("");
  const [customInputType, setCustomInputType] = useState<GoalTargetType>("duration");
  const [showAdjustmentControls, setShowAdjustmentControls] = useState<boolean>(false);

  // Sync state with storage & events
  useEffect(() => {
    const handleGoalUpdate = (e: any) => {
      if (e.detail) {
        setGoal(e.detail);
      } else {
        setGoal(getDailyGoal());
      }
    };

    window.addEventListener("katakata_daily_goal_updated", handleGoalUpdate);
    window.addEventListener("storage", handleGoalUpdate);
    return () => {
      window.removeEventListener("katakata_daily_goal_updated", handleGoalUpdate);
      window.removeEventListener("storage", handleGoalUpdate);
    };
  }, []);

  const isDurationMode = goal.targetType === "duration";
  const currentActual = isDurationMode ? goal.actualMinutes : goal.actualWords;
  const currentTarget = isDurationMode ? goal.durationTarget : goal.wordsTarget;
  const percent = Math.min(100, Math.round((currentActual / Math.max(1, currentTarget)) * 100));
  const isCompleted = percent >= 100;

  // Circular progress math
  const size = 114;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const handleSelectPreset = (type: GoalTargetType, value: number) => {
    try {
      audioSynth.playCardSlide();
    } catch (_) {}
    const updated = updateDailyGoalTarget(type, value);
    setGoal(updated);
  };

  const handleSwitchTargetType = (type: GoalTargetType) => {
    try {
      audioSynth.playCardSlide();
    } catch (_) {}
    const targetVal = type === "duration" ? goal.durationTarget : goal.wordsTarget;
    const updated = updateDailyGoalTarget(type, targetVal);
    setGoal(updated);
  };

  const handleSaveCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInputValue, 10);
    if (!isNaN(val) && val > 0) {
      try {
        audioSynth.playCoin();
      } catch (_) {}
      const updated = updateDailyGoalTarget(customInputType, val);
      setGoal(updated);
      setShowCustomModal(false);
      setCustomInputValue("");
    }
  };

  const handleQuickAdd = (minutes: number, words: number) => {
    try {
      audioSynth.playTyping({ volume: 0.7 });
    } catch (_) {}
    const updated = addDailyProgress(minutes, words);
    setGoal(updated);
  };

  const handleResetToday = () => {
    if (window.confirm(isEnglishMode ? "Reset today's recorded progress to 0?" : "确定要重置今日的已完成进度为 0 吗？")) {
      const updated = setDailyProgress(0, 0);
      setGoal(updated);
    }
  };

  const durationPresets = [5, 10, 15, 20, 30];
  const wordsPresets = [10, 20, 30, 50, 100];

  return (
    <div className="p-5 md:p-6 rounded-2xl border-2 border-stone-850 bg-[#FAF7F2] shadow-sm relative overflow-hidden select-none">
      {/* Subtle traditional watermark in background */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-stone-900">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" />
          <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="4" />
        </svg>
      </div>

      {/* Top Banner: Title, Streak Badge & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-300/70 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
            <Target className="w-4 h-4 text-[#C4482A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-black text-stone-900 text-base md:text-lg tracking-wide">
                {isEnglishMode ? "Daily Practice Goal" : "每日练习目标"}
              </h3>
              {goal.streakDays > 0 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>{goal.streakDays} {isEnglishMode ? "Day Streak" : "天连续达成"}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-sans">
              {isEnglishMode 
                ? "Set daily target duration or vocabulary count to build consistent muscle memory" 
                : "设定每日计划时长或词汇量，指尖肌肉记忆日积月累、水滴石穿"}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs (Duration vs Words) */}
        <div className="flex items-center bg-stone-200/70 p-1 rounded-lg border border-stone-300/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleSwitchTargetType("duration")}
            className={`px-3 py-1 rounded-md text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isDurationMode
                ? "bg-white text-stone-900 shadow-xs border border-stone-300/70"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEnglishMode ? "Time Goal" : "时长目标"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTargetType("words")}
            className={`px-3 py-1 rounded-md text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              !isDurationMode
                ? "bg-white text-stone-900 shadow-xs border border-stone-300/70"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C4482A]" />
            <span>{isEnglishMode ? "Word Goal" : "词数目标"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Body: Left Circle Visualizer + Right Target Setter & Action */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-4">
        {/* Left Circular Progress Visualization */}
        <div className="md:col-span-5 flex items-center justify-center sm:justify-start gap-5">
          <div className="relative w-[114px] h-[114px] shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
              <defs>
                <linearGradient id="dailyGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#C4482A" />
                </linearGradient>
                <linearGradient id="dailyGoalCompletedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e7e5e4"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Foreground Animated Ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={isCompleted ? "url(#dailyGoalCompletedGradient)" : "url(#dailyGoalGradient)"}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <span className={`text-2xl font-black font-mono leading-none tracking-tight ${
                isCompleted ? "text-emerald-700" : "text-stone-900"
              }`}>
                {percent}%
              </span>
              <span className="text-[10px] font-serif font-bold text-stone-500 mt-1 flex items-center gap-0.5">
                {isCompleted ? (
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3 fill-emerald-600 text-white" />
                    {isEnglishMode ? "Done" : "已达成"}
                  </span>
                ) : (
                  <span>{isEnglishMode ? "In Progress" : "今日进度"}</span>
                )}
              </span>
            </div>
          </div>

          {/* Stats Readout beside Ring */}
          <div className="space-y-1.5 text-left">
            <div className="text-xs font-mono text-stone-400 font-bold uppercase tracking-wider">
              {isDurationMode 
                ? (isEnglishMode ? "TODAY'S TIME" : "今日练习时长") 
                : (isEnglishMode ? "TODAY'S WORDS" : "今日已练词数")}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black font-mono ${
                isCompleted ? "text-emerald-700" : "text-stone-900"
              }`}>
                {isDurationMode ? Math.round(currentActual * 10) / 10 : currentActual}
              </span>
              <span className="text-stone-400 font-mono text-sm font-bold">
                / {currentTarget} {isDurationMode ? (isEnglishMode ? "min" : "分钟") : (isEnglishMode ? "words" : "词")}
              </span>
            </div>

            <div className="text-xs font-sans text-stone-600 leading-snug">
              {isCompleted ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  {isEnglishMode ? "Goal accomplished! Outstanding work!" : "太棒了！今日目标已圆满达成！🎉"}
                </span>
              ) : (
                <span>
                  {isEnglishMode 
                    ? `Remaining: ${Math.max(0, Math.round((currentTarget - currentActual) * 10) / 10)} ${isDurationMode ? "min" : "words"}`
                    : `还需 ${Math.max(0, Math.round((currentTarget - currentActual) * 10) / 10)} ${isDurationMode ? "分钟" : "个词"} 达成今日计划`}
                </span>
              )}
            </div>

            {/* Quick Practice button if onStartPracticeQuick provided */}
            {onStartPracticeQuick && !isCompleted && isDurationMode && (
              <button
                type="button"
                onClick={() => onStartPracticeQuick(Math.min(30, Math.max(1, currentTarget - currentActual)))}
                className="mt-1 text-[11px] font-serif font-bold text-[#C4482A] hover:text-red-700 underline flex items-center gap-1 cursor-pointer"
              >
                <span>⚡ {isEnglishMode ? "Practice Remaining Time" : "立即补足剩余时长 ＞"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Settings & Action Column */}
        <div className="md:col-span-7 space-y-3.5 border-t md:border-t-0 md:border-l border-stone-300/70 pt-3 md:pt-0 md:pl-6">
          {/* Preset Buttons for Goal Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-serif font-bold text-stone-700">
              <span>
                {isDurationMode 
                  ? (isEnglishMode ? "Quick Select Daily Time Target:" : "快捷设定每日目标时长：")
                  : (isEnglishMode ? "Quick Select Daily Word Target:" : "快捷设定每日目标词数：")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomInputType(goal.targetType);
                  setCustomInputValue(String(currentTarget));
                  setShowCustomModal(true);
                }}
                className="text-[11px] text-amber-800 hover:text-[#C4482A] font-sans font-bold flex items-center gap-0.5 cursor-pointer underline"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEnglishMode ? "Custom Number" : "自定义数值"}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(isDurationMode ? durationPresets : wordsPresets).map((val) => {
                const isSelected = currentTarget === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectPreset(goal.targetType, val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-stone-900 text-stone-50 shadow-sm border border-stone-900"
                        : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-300"
                    }`}
                  >
                    {val} {isDurationMode ? (isEnglishMode ? "min" : "分钟") : (isEnglishMode ? "词" : "词")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Progress Helper Bar */}
          <div className="pt-2 border-t border-dashed border-stone-300/70 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-500 font-sans text-[11px]">
              <span>{isEnglishMode ? "Quick Log / Tweak:" : "快速打卡记录 / 调整："}</span>
              <button
                type="button"
                onClick={() => handleQuickAdd(5, 5)}
                className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 border border-stone-300 text-stone-800 font-mono font-bold flex items-center gap-0.5 cursor-pointer"
                title={isEnglishMode ? "Add +5 minutes / +5 words" : "手动记入 +5分钟 / +5词"}
              >
                <Plus className="w-3 h-3 text-emerald-600" />
                <span>+5</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(10, 10)}
                className="px-2 py-0.5 rounded bg-white hover:bg-stone-200 border border-stone-300 text-stone-800 font-mono font-bold flex items-center gap-0.5 cursor-pointer"
                title={isEnglishMode ? "Add +10 minutes / +10 words" : "手动记入 +10分钟 / +10词"}
              >
                <Plus className="w-3 h-3 text-emerald-600" />
                <span>+10</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdjustmentControls(prev => !prev)}
                className="text-[11px] text-stone-400 hover:text-stone-700 font-sans cursor-pointer underline"
              >
                {showAdjustmentControls 
                  ? (isEnglishMode ? "Hide Adjustments" : "收起校准") 
                  : (isEnglishMode ? "Manual Adjust" : "微调记录")}
              </button>
            </div>
          </div>

          {/* Collapsible Manual Adjustment Panel */}
          {showAdjustmentControls && (
            <div className="p-3 bg-white border border-stone-300 rounded-xl space-y-2 text-xs animate-fadeIn">
              <div className="flex items-center justify-between text-stone-600 font-bold">
                <span>{isEnglishMode ? "Directly Set Today's Values:" : "直接校准今日完成数值："}</span>
                <button
                  type="button"
                  onClick={handleResetToday}
                  className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer font-sans"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isEnglishMode ? "Reset to 0" : "清零今日"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">{isEnglishMode ? "Minutes:" : "时长:"}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={goal.actualMinutes}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const updated = setDailyProgress(val, undefined);
                      setGoal(updated);
                    }}
                    className="w-20 px-2 py-1 border border-stone-300 rounded font-mono font-bold text-center bg-stone-50"
                  />
                  <span className="text-stone-400 text-[11px]">{isEnglishMode ? "min" : "分"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">{isEnglishMode ? "Words:" : "词数:"}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={goal.actualWords}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      const updated = setDailyProgress(undefined, val);
                      setGoal(updated);
                    }}
                    className="w-20 px-2 py-1 border border-stone-300 rounded font-mono font-bold text-center bg-stone-50"
                  />
                  <span className="text-stone-400 text-[11px]">{isEnglishMode ? "words" : "词"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Target Modal Popover */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#FAF7F2] border-2 border-stone-850 p-6 rounded-2xl shadow-xl max-w-sm w-full space-y-4 text-stone-900">
            <div className="flex justify-between items-center border-b border-stone-300 pb-2">
              <h4 className="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#C4482A]" />
                <span>{isEnglishMode ? "Custom Daily Goal" : "自定义每日目标"}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg cursor-pointer leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomTarget} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-serif font-bold text-stone-700">
                  {isEnglishMode ? "Target Type" : "目标类型"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomInputType("duration")}
                    className={`py-2 px-3 rounded-lg text-xs font-serif font-bold border cursor-pointer ${
                      customInputType === "duration"
                        ? "bg-stone-900 text-stone-50 border-stone-900"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    ⏱️ {isEnglishMode ? "Duration (Minutes)" : "练习时长 (分钟)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomInputType("words")}
                    className={`py-2 px-3 rounded-lg text-xs font-serif font-bold border cursor-pointer ${
                      customInputType === "words"
                        ? "bg-stone-900 text-stone-50 border-stone-900"
                        : "bg-white text-stone-700 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    📖 {isEnglishMode ? "Vocabulary (Words)" : "单词数量 (词数)"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-serif font-bold text-stone-700">
                  {customInputType === "duration"
                    ? (isEnglishMode ? "Target Duration (1 - 180 Minutes)" : "每日目标时长（1 - 180 分钟）")
                    : (isEnglishMode ? "Target Words (1 - 500 Words)" : "每日目标词汇量（1 - 500 词）")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={customInputType === "duration" ? 180 : 500}
                    value={customInputValue}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    placeholder={customInputType === "duration" ? "15" : "30"}
                    autoFocus
                    className="flex-1 px-3 py-2 border-2 border-stone-400 rounded-lg font-mono font-bold text-stone-900 bg-white focus:outline-none focus:border-stone-850"
                  />
                  <span className="font-serif font-bold text-stone-600 text-sm">
                    {customInputType === "duration" ? (isEnglishMode ? "min" : "分钟") : (isEnglishMode ? "words" : "词")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2 px-4 border border-stone-300 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg cursor-pointer"
                >
                  {isEnglishMode ? "Cancel" : "取消"}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-stone-900 hover:bg-[#A33B22] text-stone-50 font-bold text-xs rounded-lg shadow-md cursor-pointer"
                >
                  {isEnglishMode ? "Confirm Goal" : "保存目标"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
