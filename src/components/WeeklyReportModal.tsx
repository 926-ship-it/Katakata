import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  Download,
  Copy,
  CheckCircle2,
  Calendar,
  Flame,
  Clock,
  Layers,
  X,
  Share2,
  Zap,
  BookmarkCheck,
  Languages,
} from "lucide-react";
import { getSpanishMasteryMap } from "../data/spanishData";
import { getMistakes } from "../utils/reciteStorage";
import { getDailyGoal } from "../utils/dailyGoal";
import { audioSynth } from "../utils/audio";

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectedCardsCount?: number;
  totalCardsCount?: number;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  isOpen,
  onClose,
  collectedCardsCount = 0,
  totalCardsCount = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedNotice, setCopiedNotice] = useState<string>("");
  const [activeReportLang, setActiveReportLang] = useState<"es" | "ja" | "en">("es");

  const dailyGoal = useMemo(() => getDailyGoal(), [isOpen]);

  // Read mastery and stats
  const spanishMastery = useMemo(() => getSpanishMasteryMap(), [isOpen]);
  const spanishMasteredCount = useMemo(() => {
    return Object.values(spanishMastery).filter((e) => e.status === "mastered").length;
  }, [spanishMastery]);

  const spanishMistakes = useMemo(() => getMistakes("es"), [isOpen]);
  const japaneseMistakes = useMemo(() => getMistakes("ja"), [isOpen]);

  // Read session logs for accuracy & KPM
  const sessionStats = useMemo(() => {
    try {
      const raw = localStorage.getItem("fifty_sound_session_log");
      const logs = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(logs) || logs.length === 0) {
        return { totalRounds: 0, avgAccuracy: 96, peakKpm: 180, totalTimeMin: 28 };
      }
      const totalRounds = logs.length;
      const avgAccuracy = Math.round(
        logs.reduce((acc, curr) => acc + (curr.accuracy || 95), 0) / Math.max(1, logs.length)
      );
      const peakKpm = Math.max(...logs.map((l) => l.kpm || 120), 160);
      return { totalRounds, avgAccuracy, peakKpm, totalTimeMin: Math.round(totalRounds * 3.5) };
    } catch {
      return { totalRounds: 8, avgAccuracy: 95, peakKpm: 160, totalTimeMin: 24 };
    }
  }, [isOpen]);

  const xp = useMemo(() => {
    try {
      return Number(localStorage.getItem("fifty_sound_xp") || "350");
    } catch {
      return 350;
    }
  }, [isOpen]);

  // Determine Language Milestones
  const proficiencyMilestone = useMemo(() => {
    if (activeReportLang === "es") {
      if (spanishMasteredCount >= 400) {
        return {
          badge: "👑 SIELE B2 专业达人",
          levelCode: "B2 独立精通",
          desc: "已全面掌握高频词汇与复杂句式，可自如进行西班牙语专业叙事与思辨。",
          vocabGoal: `${spanishMasteredCount} 词熟化`,
          reflexDesc: "西语活字盲打心流达成",
        };
      } else if (spanishMasteredCount >= 150) {
        return {
          badge: "🥇 SIELE B1 进阶叙事者",
          levelCode: "B1 熟练自如",
          desc: "已攻克日常生活、旅行交互与情感表达核心词库，具备连贯西语应用力。",
          vocabGoal: `${spanishMasteredCount} 词熟化`,
          reflexDesc: "重音与辅音连击节奏稳定",
        };
      } else if (spanishMasteredCount >= 50) {
        return {
          badge: "🥈 SIELE A2 破茧学徒",
          levelCode: "A2 基础达人",
          desc: "已熟练运用日常高频生存西语词，购物、点餐、问路与短句拼写游刃有余。",
          vocabGoal: `${spanishMasteredCount} 词熟化`,
          reflexDesc: "击键延迟进入 280ms 肌肉记忆区",
        };
      } else {
        return {
          badge: "🥉 SIELE A1 启蒙探索者",
          levelCode: "A1 初露锋芒",
          desc: "已完成基础发音规则与核心生词筑基，正在稳步拓展活字词库。",
          vocabGoal: `${Math.max(spanishMasteredCount, 18)} 词筑基`,
          reflexDesc: "西语声韵骨架搭建完成",
        };
      }
    } else if (activeReportLang === "ja") {
      const cardsRatio = collectedCardsCount / Math.max(1, totalCardsCount);
      if (cardsRatio >= 0.7) {
        return {
          badge: "⚔️ 咔嗒大宗师 · 免许皆传",
          levelCode: "N1/N2 级言灵反射",
          desc: "五十音全平假/片假名达成光速盲打条件反射，和风神兽图鉴大成！",
          vocabGoal: `${collectedCardsCount} 张神珍典藏`,
          reflexDesc: "假名击键延迟突破 180ms",
        };
      } else if (cardsRatio >= 0.3) {
        return {
          badge: "👘 和风物语学士 · 渐入佳境",
          levelCode: "N3/N4 级假名熟化",
          desc: "熟稔清音、浊音与拗音拼写，词源风俗故事与打字韵律融会贯通。",
          vocabGoal: `${collectedCardsCount} 张和风卡牌`,
          reflexDesc: "五十音指尖律动自如",
        };
      } else {
        return {
          badge: "🌸 五十音清音学子 · 初识言灵",
          levelCode: "N5 启蒙筑基",
          desc: "扎实掌握五十音基础假名架构，正在通过击键唤醒和风图鉴。",
          vocabGoal: `${Math.max(collectedCardsCount, 12)} 张图鉴收录`,
          reflexDesc: "假名字形肌肉记忆构建中",
        };
      }
    } else {
      return {
        badge: "💎 英语词汇盲打精英",
        levelCode: "CET/IELTS 核心储备",
        desc: "英文单词盲打手感丝滑流畅，指尖音形义瞬间合一。",
        vocabGoal: "高频盲打词汇筑基",
        reflexDesc: "盲打键速超越常态",
      };
    }
  }, [activeReportLang, spanishMasteredCount, collectedCardsCount, totalCardsCount]);

  // Draw Poster on HTML5 Canvas for instant HD export
  const renderCanvasPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High resolution canvas (800 x 1120)
    canvas.width = 800;
    canvas.height = 1120;

    // 1. Background Parchment Texture
    ctx.fillStyle = "#F6F1E5";
    ctx.fillRect(0, 0, 800, 1120);

    // Decorative Borders
    ctx.strokeStyle = "#C4482A";
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 728, 1048);

    ctx.strokeStyle = "#D6CDBC";
    ctx.lineWidth = 1;
    ctx.strokeRect(44, 44, 712, 1032);

    // Four traditional corner marks
    const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
      ctx.strokeStyle = "#C4482A";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + dirY * 20);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dirX * 20, y);
      ctx.stroke();
    };
    drawCorner(50, 50, 1, 1);
    drawCorner(750, 50, -1, 1);
    drawCorner(50, 1070, 1, -1);
    drawCorner(750, 1070, -1, -1);

    // 2. Header Calligraphy
    ctx.fillStyle = "#1E1A16";
    ctx.font = "bold 22px 'Noto Serif SC', serif";
    ctx.textAlign = "center";
    ctx.fillText("K A T A K A T A  ·  咔 嗒 沉 浸 工 坊", 400, 95);

    ctx.fillStyle = "#C4482A";
    ctx.font = "900 38px 'Noto Serif SC', serif";
    ctx.fillText("言語修行 · 週間成就之証", 400, 155);

    ctx.fillStyle = "#736859";
    ctx.font = "14px 'Noto Sans SC', sans-serif";
    ctx.fillText(`修行结止日：${new Date().toLocaleDateString("zh-CN")}  ·  言灵印刻认证`, 400, 195);

    // Vermilion Seal (Top Right)
    ctx.fillStyle = "#C4482A";
    ctx.fillRect(660, 75, 54, 54);
    ctx.fillStyle = "#FAF6ED";
    ctx.font = "bold 16px 'Noto Serif SC', serif";
    ctx.fillText("秘蔵", 687, 102);
    ctx.font = "bold 13px 'Noto Serif SC', serif";
    ctx.fillText("印定", 687, 120);

    // 3. User Level & Milestone Card Block
    ctx.fillStyle = "#ECE4D2";
    ctx.fillRect(70, 230, 660, 200);
    ctx.strokeStyle = "#C4B69C";
    ctx.strokeRect(70, 230, 660, 200);

    ctx.fillStyle = "#C4482A";
    ctx.font = "bold 15px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("【 当前语言掌握度具象对标 】", 100, 275);

    ctx.fillStyle = "#1E1A16";
    ctx.font = "900 32px 'Noto Serif SC', serif";
    ctx.fillText(proficiencyMilestone.badge, 100, 325);

    ctx.fillStyle = "#4A3F35";
    ctx.font = "16px 'Noto Sans SC', sans-serif";
    ctx.fillText(proficiencyMilestone.desc, 100, 370);

    ctx.fillStyle = "#7C3AED";
    ctx.font = "bold 15px 'Noto Sans SC', sans-serif";
    ctx.fillText(`⚡ ${proficiencyMilestone.reflexDesc}`, 100, 405);

    // 4. Core Digest Metrics (2x2 Grid)
    const metrics = [
      { label: "本周连续修行", val: `${Math.max(dailyGoal.streakDays, 1)} 天`, sub: "持之以恒 · 坚韧不拔" },
      { label: "本周累计时长", val: `${sessionStats.totalTimeMin} 分钟`, sub: "沉浸专注 · 心流深耕" },
      { label: "平均击键准确率", val: `${sessionStats.avgAccuracy}%`, sub: "活字盲打 · 运指如飞" },
      { label: "本周攻克词汇", val: `${activeReportLang === "es" ? spanishMasteredCount : collectedCardsCount} 词`, sub: "破茧毕业 · 错题清零" },
    ];

    metrics.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const boxX = 70 + col * 340;
      const boxY = 460 + row * 140;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(boxX, boxY, 320, 120);
      ctx.strokeStyle = "#DDD5C7";
      ctx.strokeRect(boxX, boxY, 320, 120);

      ctx.fillStyle = "#8C7E6A";
      ctx.font = "14px 'Noto Sans SC', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(m.label, boxX + 24, boxY + 36);

      ctx.fillStyle = "#C4482A";
      ctx.font = "bold 34px 'Noto Serif SC', serif";
      ctx.fillText(m.val, boxX + 24, boxY + 78);

      ctx.fillStyle = "#6B6051";
      ctx.font = "12px 'Noto Sans SC', sans-serif";
      ctx.fillText(m.sub, boxX + 24, boxY + 104);
    });

    // 5. Epigram / Motivational Calligraphy Box
    ctx.fillStyle = "#FAF6ED";
    ctx.fillRect(70, 770, 660, 180);
    ctx.strokeStyle = "#D1C7B5";
    ctx.strokeRect(70, 770, 660, 180);

    ctx.fillStyle = "#C4482A";
    ctx.font = "900 24px 'Noto Serif SC', serif";
    ctx.textAlign = "center";
    ctx.fillText("「 一日一歩、指先に言霊を宿す 」", 400, 830);

    ctx.fillStyle = "#5C5042";
    ctx.font = "15px 'Noto Serif SC', serif";
    ctx.fillText("日拱一卒，功不唐捐。每一次清脆的击键与默写，", 400, 875);
    ctx.fillText("都将陌生字符酿造成终身不忘的母语级肌肉反射。", 400, 905);

    // 6. Footer Stamp & QR/Brand
    ctx.fillStyle = "#9C8E7B";
    ctx.font = "13px 'Noto Sans SC', sans-serif";
    ctx.fillText("KATAKATA 多语言沉浸击键工坊 · 纸质拍照圈词与活字背诵", 400, 995);

    // Golden Certificate Stamp (Bottom Center)
    ctx.strokeStyle = "#C4482A";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(400, 1045, 26, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#C4482A";
    ctx.font = "bold 13px 'Noto Serif SC', serif";
    ctx.fillText("登竜門", 400, 1050);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(renderCanvasPoster, 100);
    }
  }, [isOpen, activeReportLang, proficiencyMilestone, sessionStats, spanishMasteredCount]);

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      audioSynth.playFanfare();
      const imageUri = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imageUri;
      a.download = `katakata-weekly-certificate-${activeReportLang}-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      setCopiedNotice("🎉 海报已生成并开始下载！可分享至小红书或朋友圈打卡。");
      setTimeout(() => setCopiedNotice(""), 3500);
    } catch (_) {
      setCopiedNotice("下载失败，请长按或右键下方海报另存为图片。");
    }
  };

  const handleCopyShareText = () => {
    const text = `【Katakana 言语修行 · 学习周报】\n🏅 当前能力对标：${proficiencyMilestone.badge}\n🔥 连续打卡：${Math.max(dailyGoal.streakDays, 1)} 天 | 准确率：${sessionStats.avgAccuracy}%\n📚 攻克词库：${proficiencyMilestone.vocabGoal}\n✨ ${proficiencyMilestone.reflexDesc}\n“一日一歩、指先に言霊を宿す” —— 纸质圈词拍照即收，沉浸式活字盲打背词！`;
    navigator.clipboard?.writeText(text);
    try {
      audioSynth.playCarriageReturn();
    } catch (_) {}
    setCopiedNotice("📋 打卡荣誉话术已复制！可直接粘贴至社交平台。");
    setTimeout(() => setCopiedNotice(""), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden bg-[#FAF7F0] border-2 border-stone-800 rounded-2xl shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-white/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#C4482A] text-white rounded-md shadow-2xs">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-black text-stone-900 tracking-wide">
                和风学习周报 · 语言能力具象对标
              </h2>
              <span className="text-[11px] text-stone-500 font-sans">
                Weekly Mastery Certificate & Share Poster
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="px-5 py-2.5 bg-stone-100/70 border-b border-stone-200 flex items-center gap-2">
          <span className="text-xs font-mono text-stone-500 mr-1">选择语种对标:</span>
          {(["es", "ja", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setActiveReportLang(lang);
                audioSynth.playCardSlide();
              }}
              className={`px-3 py-1 rounded-md text-xs font-serif font-bold transition-all cursor-pointer ${
                activeReportLang === lang
                  ? "bg-stone-900 text-white shadow-2xs"
                  : "bg-white hover:bg-stone-200 text-stone-700 border border-stone-300"
              }`}
            >
              {lang === "es" ? "🇪🇸 西班牙语 (SIELE)" : lang === "ja" ? "🇯🇵 日语 (JLPT/和风)" : "🇬🇧 英语 (盲打)"}
            </button>
          ))}
        </div>

        {/* Toast Notice */}
        {copiedNotice && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-serif rounded-md flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{copiedNotice}</span>
          </div>
        )}

        {/* Body Content Area (Two Columns: Summary + Poster Preview) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Milestone Banner */}
          <div className="bg-white border border-stone-300/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-mono">
                {proficiencyMilestone.levelCode}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                连续打卡 {Math.max(dailyGoal.streakDays, 1)} 天
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-black text-[#C4482A]">
              {proficiencyMilestone.badge}
            </h3>

            <p className="text-xs sm:text-sm font-serif text-stone-700 leading-relaxed">
              {proficiencyMilestone.desc}
            </p>

            <div className="pt-2 border-t border-stone-100 flex items-center gap-4 text-xs font-serif text-stone-600 flex-wrap">
              <span className="flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>掌握量：{proficiencyMilestone.vocabGoal}</span>
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                <span>反射：{proficiencyMilestone.reflexDesc}</span>
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>累计经验：{xp} XP</span>
              </span>
            </div>
          </div>

          {/* 2. Poster Preview with Hidden High-DPI Canvas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#C4482A]" />
                <span>和风典雅修行证书海报预览（可一键下载分享）：</span>
              </span>
            </div>

            <div className="flex justify-center p-3 bg-stone-200/50 rounded-xl border border-stone-300/60 overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto max-h-[460px] rounded-lg shadow-md border border-stone-400/40 bg-[#F6F1E5]"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-white/90 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-stone-500 font-sans">
            长按图片可另存，或点击右侧按钮一键导出高清大图
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyShareText}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>复制打卡话术</span>
            </button>

            <button
              onClick={handleDownloadPoster}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-[#C4482A] text-white text-xs font-serif font-black tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>下载打卡海报 (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
