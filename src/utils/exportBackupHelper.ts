import { getStoredCustomWords } from "./kanaHelper";
import { getCustomSpanishWords, SpanishWord } from "../data/spanishData";
import { getMistakes } from "./reciteStorage";
import { ReciteLanguage } from "../components/SpanishRecitePage";
import { getDailyGoal, DailyGoalConfig } from "./dailyGoal";
import { getSessionLogs, SessionLogEntry } from "./sessionLogs";
import { getDictionary, DictionaryItem } from "../data/dictionary";

export interface BackupSummary {
  totalVocabularyWords: number;
  unlockedCardsCount: number;
  totalCardsAvailable: number;
  unlockRatePercent: number;
  totalPracticeRounds: number;
  todayPracticeMinutes: number;
  streakDays: number;
  totalXp: number;
  totalCoins: number;
}

export interface KatakataFullBackup {
  app: "katakata";
  version: "2.0.0";
  exportTime: string;
  exportDate: string;
  summary: BackupSummary;
  vocabulary: {
    customWords: DictionaryItem[];
    spanishCustomWords: SpanishWord[];
    mistakes: {
      ja: Record<string, any>;
      en: Record<string, any>;
      es: Record<string, any>;
    };
  };
  unlockedCards: Array<{
    id: string;
    kanji: string;
    kanaStr: string;
    meaning: string;
    category: string;
    categoryName: string;
    rarity: string;
    rarityName: string;
    practiceCount: number;
    level: number;
    stars: number;
  }>;
  practiceStats: {
    dailyGoal: DailyGoalConfig;
    sessionLogs: SessionLogEntry[];
    practiceTimes: Record<string, number>;
    totalPracticeRounds: number;
    totalXp: number;
  };
  rawStorageSnapshot: Record<string, string | null>;
}

/**
 * Escapes values for RFC 4180 CSV compliance
 */
export function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Initiates browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([mimeType.includes("csv") ? "\uFEFF" + content : content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gathers current stats summary
 */
export function getExportSummary(
  collectedIds: string[],
  practiceTimes: Record<string, number>,
  coins: number = 0
): BackupSummary {
  const customWords = getStoredCustomWords();
  const spanishWords = getCustomSpanishWords();
  const mistakesJa = getMistakes("ja");
  const mistakesEn = getMistakes("en");
  const mistakesEs = getMistakes("es");

  const totalVocab =
    customWords.length +
    spanishWords.length +
    Object.keys(mistakesJa).length +
    Object.keys(mistakesEn).length +
    Object.keys(mistakesEs).length;

  const allCards = getDictionary(false, false);
  const totalRounds = Object.values(practiceTimes || {}).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  const dailyGoal = getDailyGoal();

  let xp = 0;
  try {
    xp = Number(localStorage.getItem("fifty_sound_xp") || "0");
  } catch (_) {}

  const unlockedCount = (collectedIds || []).length;
  const totalCardsCount = Math.max(allCards.length, 1);
  const unlockRate = Math.min(100, Math.round((unlockedCount / totalCardsCount) * 100));

  return {
    totalVocabularyWords: totalVocab,
    unlockedCardsCount: unlockedCount,
    totalCardsAvailable: totalCardsCount,
    unlockRatePercent: unlockRate,
    totalPracticeRounds: totalRounds,
    todayPracticeMinutes: Math.round(dailyGoal.actualMinutes * 10) / 10,
    streakDays: dailyGoal.streakDays || 0,
    totalXp: xp,
    totalCoins: coins,
  };
}

/**
 * Builds comprehensive JSON backup object
 */
export function buildFullBackupJson(
  collectedIds: string[],
  practiceTimes: Record<string, number>,
  coins: number = 0,
  cardUpgrades: Record<string, { level: number; exp: number; stars: number }> = {}
): KatakataFullBackup {
  const now = new Date();
  const summary = getExportSummary(collectedIds, practiceTimes, coins);

  const customWords = getStoredCustomWords();
  const spanishCustomWords = getCustomSpanishWords();
  const mistakes = {
    ja: getMistakes("ja"),
    en: getMistakes("en"),
    es: getMistakes("es"),
  };

  const allDict = getDictionary(false, false);
  const cardMap = new Map<string, DictionaryItem>();
  allDict.forEach((item) => cardMap.set(item.id, item));
  customWords.forEach((item) => cardMap.set(item.id, item));

  const unlockedCards = (collectedIds || []).map((id) => {
    const card = cardMap.get(id);
    const upgrade = cardUpgrades[id] || { level: 1, exp: 0, stars: 0 };
    return {
      id,
      kanji: card?.kanji || id,
      kanaStr: card?.kanaStr || "",
      meaning: card?.meaning || "",
      category: card?.category || "custom",
      categoryName: card?.categoryName || "卡牌",
      rarity: card?.rarity || "N",
      rarityName: card?.rarityName || "普通 (N)",
      practiceCount: practiceTimes[id] || 0,
      level: upgrade.level || 1,
      stars: upgrade.stars || 0,
    };
  });

  const dailyGoal = getDailyGoal();
  const sessionLogs = getSessionLogs();

  const keysToSnapshot = [
    "fifty_sound_unlocked_cards",
    "fifty_sound_practice_times",
    "fifty_sound_custom_words",
    "spanish_custom_words",
    "fifty_sound_ja_mistakes_v2",
    "fifty_sound_en_mistakes_v2",
    "fifty_sound_es_mistakes_v2",
    "katakata_daily_goal",
    "fifty_sound_session_log",
    "fifty_sound_xp",
    "fifty_sound_card_upgrades",
    "fifty_sound_coins",
    "fifty_sound_muted",
    "fifty_sound_bgm",
    "fifty_sound_voice_type",
    "fifty_sound_speech_rate",
    "fifty_sound_show_mascot",
    "typing_sound_style",
  ];

  const rawSnapshot: Record<string, string | null> = {};
  if (typeof window !== "undefined") {
    keysToSnapshot.forEach((key) => {
      try {
        rawSnapshot[key] = localStorage.getItem(key);
      } catch (_) {}
    });
  }

  return {
    app: "katakata",
    version: "2.0.0",
    exportTime: now.toISOString(),
    exportDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
    summary,
    vocabulary: {
      customWords,
      spanishCustomWords,
      mistakes,
    },
    unlockedCards,
    practiceStats: {
      dailyGoal,
      sessionLogs,
      practiceTimes,
      totalPracticeRounds: summary.totalPracticeRounds,
      totalXp: summary.totalXp,
    },
    rawStorageSnapshot: rawSnapshot,
  };
}

/**
 * Generates Vocabulary CSV
 */
export function generateVocabularyCsv(): string {
  const customWords = getStoredCustomWords();
  const spanishWords = getCustomSpanishWords();
  const mistakesJa = getMistakes("ja");
  const mistakesEn = getMistakes("en");
  const mistakesEs = getMistakes("es");

  const rows: string[] = [];

  // CSV Header
  rows.push([
    escapeCsvCell("序号"),
    escapeCsvCell("所属语言"),
    escapeCsvCell("生词/词条"),
    escapeCsvCell("读音/假名/音标"),
    escapeCsvCell("中文释义"),
    escapeCsvCell("词库分类"),
    escapeCsvCell("来源类型"),
    escapeCsvCell("例句与语境"),
    escapeCsvCell("错题统计/练习状态"),
  ].join(","));

  let index = 1;

  // 1. Japanese/English custom words
  customWords.forEach((word) => {
    const isEn = /[a-zA-Z]/.test(word.kanji);
    rows.push([
      escapeCsvCell(index++),
      escapeCsvCell(isEn ? "英语" : "日语"),
      escapeCsvCell(word.kanji),
      escapeCsvCell(word.kanaStr || word.phonetic || ""),
      escapeCsvCell(word.meaning || ""),
      escapeCsvCell(word.categoryName || "自定义词库"),
      escapeCsvCell("自定义添加"),
      escapeCsvCell(""),
      escapeCsvCell(`稀有度: ${word.rarityName || "普通"}`),
    ].join(","));
  });

  // 2. Spanish custom words (includes circle/highlight OCR tags)
  spanishWords.forEach((word) => {
    rows.push([
      escapeCsvCell(index++),
      escapeCsvCell("西语"),
      escapeCsvCell(word.word),
      escapeCsvCell(word.partOfSpeech || ""),
      escapeCsvCell(word.meaning || ""),
      escapeCsvCell(word.categoryName || "西语错题本"),
      escapeCsvCell(word.markType ? `拍照标记 (${word.markType})` : "自定义添加"),
      escapeCsvCell(word.contextSentence || word.exampleEs ? `${word.exampleEs || word.contextSentence} ${word.exampleZh ? `(${word.exampleZh})` : ""}` : ""),
      escapeCsvCell(`难度等级: ${word.level || "常用"}`),
    ].join(","));
  });

  // 3. Mistakes
  const appendMistakes = (map: Record<string, any>, langLabel: string) => {
    Object.values(map).forEach((m) => {
      rows.push([
        escapeCsvCell(index++),
        escapeCsvCell(langLabel),
        escapeCsvCell(m.wordText || m.wordId),
        escapeCsvCell(""),
        escapeCsvCell(m.meaning || ""),
        escapeCsvCell("错题回顾集"),
        escapeCsvCell("练习错题自动归纳"),
        escapeCsvCell(m.lastErrorInput ? `上次误输: ${m.lastErrorInput}` : ""),
        escapeCsvCell(`错误次数: ${m.errorCount || m.mistakeCount || 1}`),
      ].join(","));
    });
  };

  appendMistakes(mistakesJa, "日语错题");
  appendMistakes(mistakesEn, "英语错题");
  appendMistakes(mistakesEs, "西语错题");

  return rows.join("\r\n");
}

/**
 * Generates Unlocked Cards Compendium CSV
 */
export function generateCardsCompendiumCsv(
  collectedIds: string[],
  practiceTimes: Record<string, number>,
  cardUpgrades: Record<string, { level: number; exp: number; stars: number }> = {}
): string {
  const allDict = getDictionary(false, false);
  const customWords = getStoredCustomWords();
  const cardMap = new Map<string, DictionaryItem>();
  allDict.forEach((item) => cardMap.set(item.id, item));
  customWords.forEach((item) => cardMap.set(item.id, item));

  const rows: string[] = [];

  rows.push([
    escapeCsvCell("序号"),
    escapeCsvCell("卡牌ID"),
    escapeCsvCell("汉字/词条"),
    escapeCsvCell("读音/假名/罗马音"),
    escapeCsvCell("稀有度"),
    escapeCsvCell("所属分类"),
    escapeCsvCell("中文释义与典故背景"),
    escapeCsvCell("累计练习次数"),
    escapeCsvCell("强化等级"),
    escapeCsvCell("已升星数"),
    escapeCsvCell("图鉴解锁状态"),
  ].join(","));

  const unlockedSet = new Set(collectedIds || []);
  let index = 1;

  // Export all unlocked cards first
  (collectedIds || []).forEach((id) => {
    const card = cardMap.get(id);
    const upgrade = cardUpgrades[id] || { level: 1, exp: 0, stars: 0 };
    const ptCount = practiceTimes[id] || 0;
    const romaji = card?.segments?.map((s) => s.displayRomaji).join(" ") || "";

    rows.push([
      escapeCsvCell(index++),
      escapeCsvCell(id),
      escapeCsvCell(card?.kanji || id),
      escapeCsvCell(`${card?.kanaStr || ""} [${romaji}]`.trim()),
      escapeCsvCell(card?.rarityName || card?.rarity || "N"),
      escapeCsvCell(card?.categoryName || "和风图鉴"),
      escapeCsvCell(card?.meaning || ""),
      escapeCsvCell(ptCount),
      escapeCsvCell(`Lv.${upgrade.level || 1}`),
      escapeCsvCell(`${upgrade.stars || 0} 星`),
      escapeCsvCell("已解锁 ✨"),
    ].join(","));
  });

  return rows.join("\r\n");
}

/**
 * Generates Practice Stats & Session Duration CSV
 */
export function generatePracticeStatsCsv(
  practiceTimes: Record<string, number>,
  collectedIds: string[] = [],
  coins: number = 0
): string {
  const dailyGoal = getDailyGoal();
  const sessionLogs = getSessionLogs();
  const summary = getExportSummary(collectedIds, practiceTimes, coins);

  const rows: string[] = [];

  // Summary header block
  rows.push([escapeCsvCell("=== 练习统计与时长总览 ==="), escapeCsvCell(""), escapeCsvCell("")].join(","));
  rows.push([escapeCsvCell("指标项目"), escapeCsvCell("统计数值"), escapeCsvCell("说明备注")].join(","));
  rows.push([escapeCsvCell("今日学习时长"), escapeCsvCell(`${summary.todayPracticeMinutes} 分钟`), escapeCsvCell(`每日目标: ${dailyGoal.durationTarget} 分钟`)].join(","));
  rows.push([escapeCsvCell("今日练习词数"), escapeCsvCell(`${dailyGoal.actualWords} 词`), escapeCsvCell(`目标词数: ${dailyGoal.wordsTarget} 词`)].join(","));
  rows.push([escapeCsvCell("连续打卡天数"), escapeCsvCell(`${summary.streakDays} 天`), escapeCsvCell("持续练习天数累计")].join(","));
  rows.push([escapeCsvCell("总练习完成轮次"), escapeCsvCell(`${summary.totalPracticeRounds} 轮`), escapeCsvCell("所有卡片练习打卡总和")].join(","));
  rows.push([escapeCsvCell("累计获得经验值 (XP)"), escapeCsvCell(`${summary.totalXp} XP`), escapeCsvCell("打字与练习积分")].join(","));
  rows.push([escapeCsvCell("已解锁卡片图鉴"), escapeCsvCell(`${summary.unlockedCardsCount} 张 (${summary.unlockRatePercent}%)`), escapeCsvCell(`总可解锁: ${summary.totalCardsAvailable} 张`)].join(","));
  rows.push([escapeCsvCell("总收录生词与错题"), escapeCsvCell(`${summary.totalVocabularyWords} 词`), escapeCsvCell("含自定义生词与错题本")].join(","));
  rows.push(["", "", ""].join(","));

  // Recent practice session logs table
  rows.push([escapeCsvCell("=== 最近练习场次明细 ==="), escapeCsvCell(""), escapeCsvCell(""), escapeCsvCell(""), escapeCsvCell("")].join(","));
  rows.push([
    escapeCsvCell("序号"),
    escapeCsvCell("练习日期时间"),
    escapeCsvCell("击键速度 (KPM)"),
    escapeCsvCell("击键正确率 (%)"),
    escapeCsvCell("获得经验 (XP)"),
  ].join(","));

  if (sessionLogs.length === 0) {
    rows.push([escapeCsvCell("暂无近期场次记录"), escapeCsvCell("-"), escapeCsvCell("-"), escapeCsvCell("-"), escapeCsvCell("-")].join(","));
  } else {
    sessionLogs.forEach((log, idx) => {
      rows.push([
        escapeCsvCell(idx + 1),
        escapeCsvCell(log.date),
        escapeCsvCell(`${log.kpm} KPM`),
        escapeCsvCell(`${log.accuracy}%`),
        escapeCsvCell(`+${log.xpGained} XP`),
      ].join(","));
    });
  }

  rows.push(["", "", "", "", ""].join(","));

  // Top practiced cards
  rows.push([escapeCsvCell("=== 高频练习卡片排行 (Top 30) ==="), escapeCsvCell(""), escapeCsvCell("")].join(","));
  rows.push([escapeCsvCell("排名"), escapeCsvCell("卡牌标识 / 词汇"), escapeCsvCell("练习次数")].join(","));

  const sortedCards = Object.entries(practiceTimes || {})
    .sort(([, a], [, b]) => (b || 0) - (a || 0))
    .slice(0, 30);

  if (sortedCards.length === 0) {
    rows.push([escapeCsvCell("暂无卡片练习记录"), escapeCsvCell("-"), escapeCsvCell("-")].join(","));
  } else {
    sortedCards.forEach(([cardId, count], idx) => {
      rows.push([
        escapeCsvCell(idx + 1),
        escapeCsvCell(cardId),
        escapeCsvCell(`${count} 次`),
      ].join(","));
    });
  }

  return rows.join("\r\n");
}

/**
 * Restores Katakata data from a parsed JSON backup
 */
export function restoreBackupData(parsed: any): {
  success: boolean;
  message: string;
  unlockedCards?: string[];
  practiceTimes?: Record<string, number>;
  coins?: number;
  cardUpgrades?: any;
  settings?: any;
} {
  if (!parsed || (parsed.app !== "katakata" && !parsed.rawStorageSnapshot && !parsed.payload)) {
    return {
      success: false,
      message: "未能识别合法的 Katakata 备份存档文件 (文件签名不匹配)。",
    };
  }

  try {
    // 1. If v2 full backup with rawStorageSnapshot
    if (parsed.rawStorageSnapshot) {
      const snap = parsed.rawStorageSnapshot;
      Object.entries(snap).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          try {
            localStorage.setItem(k, String(v));
          } catch (_) {}
        }
      });
    }

    // 2. If v1 backup with payload
    if (parsed.payload) {
      Object.entries(parsed.payload).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          try {
            localStorage.setItem(k, String(v));
          } catch (_) {}
        }
      });
    }

    // 3. Extract core states for immediate in-memory sync
    let unlockedCards: string[] = [];
    let practiceTimes: Record<string, number> = {};
    let coins = parsed.summary?.totalCoins;
    let cardUpgrades = {};

    try {
      const rawCards = localStorage.getItem("fifty_sound_unlocked_cards");
      if (rawCards) unlockedCards = JSON.parse(rawCards);
      else if (parsed.unlockedCards) unlockedCards = parsed.unlockedCards.map((c: any) => c.id);
    } catch (_) {}

    try {
      const rawPt = localStorage.getItem("fifty_sound_practice_times");
      if (rawPt) practiceTimes = JSON.parse(rawPt);
      else if (parsed.practiceStats?.practiceTimes) practiceTimes = parsed.practiceStats.practiceTimes;
    } catch (_) {}

    try {
      const rawUpgrades = localStorage.getItem("fifty_sound_card_upgrades");
      if (rawUpgrades) cardUpgrades = JSON.parse(rawUpgrades);
    } catch (_) {}

    const settings = {
      muted: localStorage.getItem("fifty_sound_muted") === "true",
      bgm: localStorage.getItem("fifty_sound_bgm") === "true",
      voiceType: localStorage.getItem("fifty_sound_voice_type") || "female",
      showMascot: localStorage.getItem("fifty_sound_show_mascot") !== "false",
    };

    return {
      success: true,
      message: "存档导入成功！您的词库、解锁图鉴与练习时长统计已完全同步。",
      unlockedCards,
      practiceTimes,
      coins,
      cardUpgrades,
      settings,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `恢复存档时出现异常: ${err?.message || "数据解析失败"}`,
    };
  }
}
