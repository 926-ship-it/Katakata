import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { NarrativeStyle, nTrans } from "../utils/narrative";

interface OnlineTimerProps {
  isEnglishMode: boolean;
  narrativeStyle: NarrativeStyle;
}

export function OnlineTimer({ isEnglishMode, narrativeStyle }: OnlineTimerProps) {
  const [onlineSeconds, setOnlineSeconds] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatOnlineTime = (totalSecs: number, isEng: boolean) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (isEng) {
      if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
      if (mins > 0) return `${mins}m ${secs}s`;
      return `${secs}s`;
    } else {
      if (hrs > 0) return `${hrs}小时${mins}分${secs}秒`;
      if (mins > 0) return `${mins}分${secs}秒`;
      return `${secs}秒`;
    }
  };

  return (
    <div 
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 shadow-sm text-stone-700 font-sans"
      title={isEnglishMode ? "Current online duration of this session" : `本次网页在线时间：${nTrans("onlineTime", narrativeStyle)}`}
    >
      <Clock className="w-3.5 h-3.5 text-stone-500 animate-pulse" />
      <span className="text-xs font-mono font-bold text-stone-600 flex items-center gap-1">
        <span className="opacity-70 text-[9px] font-sans font-normal">{nTrans("onlineTime", narrativeStyle)}:</span>
        <span>{formatOnlineTime(onlineSeconds, isEnglishMode)}</span>
      </span>
    </div>
  );
}
