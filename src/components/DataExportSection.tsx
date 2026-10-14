import React, { useState, useRef, useMemo } from "react";
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  Layers,
  Clock,
  Flame,
  HelpCircle,
  FolderArchive,
  RefreshCw,
} from "lucide-react";
import {
  getExportSummary,
  buildFullBackupJson,
  generateVocabularyCsv,
  generateCardsCompendiumCsv,
  generatePracticeStatsCsv,
  downloadFile,
  restoreBackupData,
} from "../utils/exportBackupHelper";
import { audioSynth } from "../utils/audio";

interface DataExportSectionProps {
  collectedIds: string[];
  practiceTimes: Record<string, number>;
  coins?: number;
  cardUpgrades?: Record<string, { level: number; exp: number; stars: number }>;
  isEnglishMode?: boolean;
  onImportData: (
    unlockedCards: string[],
    ptTimes: Record<string, number>,
    settings?: any,
    importedCoins?: number,
    importedUpgrades?: any
  ) => void;
}

export const DataExportSection: React.FC<DataExportSectionProps> = ({
  collectedIds,
  practiceTimes,
  coins = 0,
  cardUpgrades = {},
  isEnglishMode = false,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");
  const [confirmRestore, setConfirmRestore] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  // Compute live summary stats
  const summary = useMemo(() => {
    return getExportSummary(collectedIds, practiceTimes, coins);
  }, [collectedIds, practiceTimes, coins]);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const getDateSuffix = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  };

  // Export JSON
  const handleExportJson = () => {
    try {
      setIsExporting(true);
      const backupObj = buildFullBackupJson(collectedIds, practiceTimes, coins, cardUpgrades);
      const jsonStr = JSON.stringify(backupObj, null, 2);
      downloadFile(jsonStr, `katakata-full-backup-${getDateSuffix()}.json`, "application/json");
      audioSynth.playCarriageReturn();
      showToast(
        "success",
        isEnglishMode
          ? "🎉 Complete backup exported (JSON)! Keep this file safe for cross-device migration."
          : "🎉 完整数据备份已导出 (JSON)！可直接在其他设备上导入无损还原。"
      );
    } catch (err: any) {
      console.error(err);
      audioSynth.playError();
      showToast("error", `导出失败: ${err?.message || "未知错误"}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Vocabulary CSV
  const handleExportVocabCsv = () => {
    try {
      setIsExporting(true);
      const csvStr = generateVocabularyCsv();
      downloadFile(csvStr, `katakata-vocabulary-${getDateSuffix()}.csv`, "text/csv;charset=utf-8;");
      audioSynth.playCarriageReturn();
      showToast(
        "success",
        isEnglishMode
          ? "📊 Vocabulary exported as CSV! Ready to open in Excel/Numbers/WPS."
          : "📊 词库清单已导出 (CSV)！可在 Excel、WPS 或 Numbers 中直接查看与编辑生词。"
      );
    } catch (err: any) {
      console.error(err);
      audioSynth.playError();
      showToast("error", `词库导出失败: ${err?.message || "未知错误"}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Cards Compendium CSV
  const handleExportCardsCsv = () => {
    try {
      setIsExporting(true);
      const csvStr = generateCardsCompendiumCsv(collectedIds, practiceTimes, cardUpgrades);
      downloadFile(csvStr, `katakata-cards-compendium-${getDateSuffix()}.csv`, "text/csv;charset=utf-8;");
      audioSynth.playCarriageReturn();
      showToast(
        "success",
        isEnglishMode
          ? "🎴 Unlocked cards exported as CSV! Includes levels, stars & practice counts."
          : "🎴 已解锁卡片图鉴已导出 (CSV)！包含所有和风卡牌、强化等级与练习频次。"
      );
    } catch (err: any) {
      console.error(err);
      audioSynth.playError();
      showToast("error", `图鉴导出失败: ${err?.message || "未知错误"}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Practice Stats CSV
  const handleExportStatsCsv = () => {
    try {
      setIsExporting(true);
      const csvStr = generatePracticeStatsCsv(practiceTimes, collectedIds, coins);
      downloadFile(csvStr, `katakata-practice-stats-${getDateSuffix()}.csv`, "text/csv;charset=utf-8;");
      audioSynth.playCarriageReturn();
      showToast(
        "success",
        isEnglishMode
          ? "📈 Practice duration & statistics exported as CSV!"
          : "📈 练习时长与场次统计已导出 (CSV)！包含每日学时、击键指标与高频卡片。"
      );
    } catch (err: any) {
      console.error(err);
      audioSynth.playError();
      showToast("error", `统计导出失败: ${err?.message || "未知错误"}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Export All Bundle
  const handleExportAllBundle = () => {
    handleExportJson();
    setTimeout(() => handleExportVocabCsv(), 300);
    setTimeout(() => handleExportCardsCsv(), 600);
    setTimeout(() => handleExportStatsCsv(), 900);
  };

  // File selected for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        setConfirmRestore({ open: true, data: parsed });
      } catch (err) {
        audioSynth.playError();
        showToast("error", "文件格式损坏或不是有效的 JSON 备份文件。");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Perform confirmed restoration
  const executeRestore = () => {
    if (!confirmRestore.data) return;
    const result = restoreBackupData(confirmRestore.data);
    setConfirmRestore({ open: false, data: null });

    if (result.success) {
      audioSynth.playFanfare();
      if (result.unlockedCards) {
        onImportData(
          result.unlockedCards,
          result.practiceTimes || {},
          result.settings,
          result.coins,
          result.cardUpgrades
        );
      }
      showToast("success", result.message);
    } else {
      audioSynth.playError();
      showToast("error", result.message);
    }
  };

  return (
    <div className="space-y-3">
      {/* Group Title */}
      <div className="flex items-center justify-between">
        <h4 className="font-serif font-bold text-stone-800 text-xs uppercase tracking-widest text-[#C4482A] flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-[#C4482A]" />
          <span>数据备份与跨设备迁移 / Backup & Export</span>
        </h4>
        <div className="flex rounded-md bg-stone-200/80 p-0.5 text-[10px] font-sans">
          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
              activeTab === "export"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            导出备份
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer font-bold ${
              activeTab === "import"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            导入还原
          </button>
        </div>
      </div>

      {/* Stats Snapshot Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="bg-white/60 border border-stone-200/90 rounded p-1.5 text-center flex flex-col justify-center">
          <span className="text-[10px] text-stone-500 font-sans flex items-center justify-center gap-0.5">
            <Layers className="w-2.5 h-2.5 text-amber-600" />
            <span>词库</span>
          </span>
          <span className="text-xs font-mono font-black text-stone-800">
            {summary.totalVocabularyWords}
            <span className="text-[9px] font-normal text-stone-500 ml-0.5">词</span>
          </span>
        </div>

        <div className="bg-white/60 border border-stone-200/90 rounded p-1.5 text-center flex flex-col justify-center">
          <span className="text-[10px] text-stone-500 font-sans flex items-center justify-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
            <span>图鉴</span>
          </span>
          <span className="text-xs font-mono font-black text-stone-800">
            {summary.unlockedCardsCount}
            <span className="text-[9px] font-normal text-stone-500 ml-0.5">张</span>
          </span>
        </div>

        <div className="bg-white/60 border border-stone-200/90 rounded p-1.5 text-center flex flex-col justify-center">
          <span className="text-[10px] text-stone-500 font-sans flex items-center justify-center gap-0.5">
            <Clock className="w-2.5 h-2.5 text-emerald-600" />
            <span>今日学时</span>
          </span>
          <span className="text-xs font-mono font-black text-stone-800">
            {summary.todayPracticeMinutes}
            <span className="text-[9px] font-normal text-stone-500 ml-0.5">分</span>
          </span>
        </div>

        <div className="bg-white/60 border border-stone-200/90 rounded p-1.5 text-center flex flex-col justify-center">
          <span className="text-[10px] text-stone-500 font-sans flex items-center justify-center gap-0.5">
            <Flame className="w-2.5 h-2.5 text-[#C4482A]" />
            <span>连胜</span>
          </span>
          <span className="text-xs font-mono font-black text-stone-800">
            {summary.streakDays}
            <span className="text-[9px] font-normal text-stone-500 ml-0.5">天</span>
          </span>
        </div>
      </div>

      {/* Toast Feedback */}
      {notification && (
        <div
          className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 shadow-xs transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-tight font-medium">{notification.message}</span>
        </div>
      )}

      {/* Confirmation Modal for Restore */}
      {confirmRestore.open && (
        <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/90 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>确认导入此备份数据？</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
            检测到备份文件（含词库、卡片图鉴、练习学时统计）。导入将与当前数据进行合并与同步更新，是否继续？
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setConfirmRestore({ open: false, data: null })}
              className="px-2.5 py-1 text-xs rounded border border-stone-300 bg-white text-stone-600 hover:bg-stone-50 font-bold cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={executeRestore}
              className="px-3 py-1 text-xs rounded bg-[#C4482A] text-white hover:bg-[#A93B20] font-bold shadow-xs cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>确认恢复</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Export Tab */}
      {activeTab === "export" && (
        <div className="p-3 rounded bg-white/50 border border-stone-200 space-y-3">
          {/* Format 1: JSON Full Backup */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1">
                <FileCode2 className="w-3.5 h-3.5 text-amber-700" />
                <span>JSON 格式 · 完整存档导出</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                推荐跨设备迁移
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
              打包全部词库（自定义词+错题本）、已解锁和风图鉴、练习学时统计、经验值与系统设置，便于在新设备上一键恢复。
            </p>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportJson}
              className="w-full py-2 px-3 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100/80 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>导出 JSON 完整备份 (.json)</span>
            </button>
          </div>

          <div className="border-t border-stone-200/80 pt-2.5 space-y-2">
            {/* Format 2: CSV Data Sheets */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>CSV 格式 · 分类表格导出</span>
              </span>
              <span className="text-[9px] text-stone-400 font-sans">
                兼容 Excel / WPS / Numbers
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
              以标准 UTF-8 带 BOM 编码输出结构化表格，可直接用表格软件打印或制作生词单词卡。
            </p>

            {/* CSV Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5">
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportVocabCsv}
                className="py-1.5 px-2 rounded border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                title="导出中日英西全部自定义生词与错题本"
              >
                <Download className="w-3 h-3 text-stone-500" />
                <span>📊 词库清单</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportCardsCsv}
                className="py-1.5 px-2 rounded border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                title="导出已集齐卡片图鉴与等级数据"
              >
                <Download className="w-3 h-3 text-stone-500" />
                <span>🎴 卡片图鉴</span>
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportStatsCsv}
                className="py-1.5 px-2 rounded border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                title="导出今日与累计学时、打字速率与场次"
              >
                <Download className="w-3 h-3 text-stone-500" />
                <span>📈 时长统计</span>
              </button>
            </div>

            {/* Quick Export All */}
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportAllBundle}
              className="w-full py-1.5 px-2 rounded border border-stone-200 bg-stone-100 hover:bg-stone-200/80 text-stone-600 hover:text-stone-900 text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <FolderArchive className="w-3 h-3 text-stone-500" />
              <span>一键导出全部文件 (JSON + 3份 CSV)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Import Tab */}
      {activeTab === "import" && (
        <div className="p-3 rounded bg-white/50 border border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-stone-800 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-stone-700" />
              <span>从 JSON 备份文件恢复数据</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              跨设备还原
            </span>
          </div>

          <p className="text-[10px] text-stone-500 font-sans leading-relaxed">
            选取您之前从电脑或另一台手机导出的 <strong className="text-stone-700">.json 备份文件</strong>，即可恢复您积累的词库、已收集的和风卡牌与练习统计数据。
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded border border-dashed border-stone-400 bg-white/80 hover:bg-white text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:border-amber-600 hover:text-amber-900"
          >
            <Upload className="w-4 h-4 text-amber-700" />
            <span>选择本地 JSON 备份文件</span>
          </button>
        </div>
      )}
    </div>
  );
};
