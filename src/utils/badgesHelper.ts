/**
 * badgesHelper.ts
 * Manages learner achievement badges, unlock criteria, and visual showcase.
 */

export interface LearnerBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  category: "japanese" | "spanish" | "streak" | "mastery";
  progressText: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const STORAGE_KEY = "katakata_badges_unlocked_v1";

export function getUnlockedBadgeIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function saveUnlockedBadgeIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (_) {}
}

export function calculateBadges(stats: {
  spanishMasteredCount: number;
  japaneseCollectedCount: number;
  streakDays: number;
  maxSessionStreak: number;
  graduatedMistakesCount: number;
  srsReviewCount: number;
}): { badges: LearnerBadge[]; newlyUnlocked: LearnerBadge[] } {
  const previouslyUnlocked = new Set(getUnlockedBadgeIds());
  const nowUnlocked: string[] = [];
  const newlyUnlocked: LearnerBadge[] = [];

  const definitions: Omit<LearnerBadge, "unlocked" | "progressText">[] = [
    {
      id: "kana_novice",
      title: "五十音行者",
      description: "在五十音学宫解锁至少 15 个假名字形与标准发音",
      icon: "🌸",
      category: "japanese",
      rarity: "common",
    },
    {
      id: "kana_master",
      title: "清浊音大圆满",
      description: "在五十音学宫收集并熟练掌握至少 46 个基础假名",
      icon: "⛩️",
      category: "japanese",
      rarity: "epic",
    },
    {
      id: "es_starter",
      title: "西语筑基者",
      description: "在 SIELE 默写工坊成功攻克并掌握至少 20 个西班牙语核心词汇",
      icon: "🇪🇸",
      category: "spanish",
      rarity: "common",
    },
    {
      id: "es_expert",
      title: "SIELE 突击先锋",
      description: "在西班牙语词库中完全掌握至少 100 个词汇，具备高频交流基础",
      icon: "⚔️",
      category: "spanish",
      rarity: "rare",
    },
    {
      id: "es_master",
      title: "西语千词破茧",
      description: "在西班牙语词库中累计掌握至少 300 个词汇，奠定 B2 坚实底座",
      icon: "👑",
      category: "spanish",
      rarity: "legendary",
    },
    {
      id: "streak_3",
      title: "三日初成",
      description: "连续坚持完成 3 天每日词汇练习与签到",
      icon: "🌱",
      category: "streak",
      rarity: "common",
    },
    {
      id: "streak_7",
      title: "恒心之火",
      description: "连续完成 7 天每日学习打卡，养成肌肉记忆与学习习惯",
      icon: "🔥",
      category: "streak",
      rarity: "rare",
    },
    {
      id: "streak_14",
      title: "习惯金石",
      description: "连续坚持打卡 14 天，成为自律卓越的语言修行者",
      icon: "💎",
      category: "streak",
      rarity: "epic",
    },
    {
      id: "perfect_streak",
      title: "绝不击错神射手",
      description: "在单次默写练习中实现连续 15 词无任何击键失误",
      icon: "🎯",
      category: "mastery",
      rarity: "rare",
    },
    {
      id: "ebbinghaus_voyager",
      title: "艾宾浩斯复读者",
      description: "按照艾宾浩斯科学遗忘曲线完成至少 10 次到期阶段复习",
      icon: "⏰",
      category: "mastery",
      rarity: "rare",
    },
    {
      id: "mistake_slayer",
      title: "破茧错词斩",
      description: "在错题本中通过连续 2 次全对成功毕业 3 个易错单词",
      icon: "🦋",
      category: "mastery",
      rarity: "epic",
    },
  ];

  const badges: LearnerBadge[] = definitions.map((def) => {
    let unlocked = false;
    let progressText = "";

    switch (def.id) {
      case "kana_novice":
        unlocked = stats.japaneseCollectedCount >= 15;
        progressText = `${Math.min(stats.japaneseCollectedCount, 15)} / 15`;
        break;
      case "kana_master":
        unlocked = stats.japaneseCollectedCount >= 46;
        progressText = `${Math.min(stats.japaneseCollectedCount, 46)} / 46`;
        break;
      case "es_starter":
        unlocked = stats.spanishMasteredCount >= 20;
        progressText = `${Math.min(stats.spanishMasteredCount, 20)} / 20`;
        break;
      case "es_expert":
        unlocked = stats.spanishMasteredCount >= 100;
        progressText = `${Math.min(stats.spanishMasteredCount, 100)} / 100`;
        break;
      case "es_master":
        unlocked = stats.spanishMasteredCount >= 300;
        progressText = `${Math.min(stats.spanishMasteredCount, 300)} / 300`;
        break;
      case "streak_3":
        unlocked = stats.streakDays >= 3;
        progressText = `${Math.min(stats.streakDays, 3)} / 3 天`;
        break;
      case "streak_7":
        unlocked = stats.streakDays >= 7;
        progressText = `${Math.min(stats.streakDays, 7)} / 7 天`;
        break;
      case "streak_14":
        unlocked = stats.streakDays >= 14;
        progressText = `${Math.min(stats.streakDays, 14)} / 14 天`;
        break;
      case "perfect_streak":
        unlocked = stats.maxSessionStreak >= 15;
        progressText = `${Math.min(stats.maxSessionStreak, 15)} / 15 连击`;
        break;
      case "ebbinghaus_voyager":
        unlocked = stats.srsReviewCount >= 10;
        progressText = `${Math.min(stats.srsReviewCount, 10)} / 10 次`;
        break;
      case "mistake_slayer":
        unlocked = stats.graduatedMistakesCount >= 3;
        progressText = `${Math.min(stats.graduatedMistakesCount, 3)} / 3 个`;
        break;
      default:
        unlocked = false;
        progressText = "进行中";
    }

    if (unlocked) {
      nowUnlocked.push(def.id);
      if (!previouslyUnlocked.has(def.id)) {
        newlyUnlocked.push({ ...def, unlocked: true, progressText });
      }
    }

    return {
      ...def,
      unlocked,
      progressText,
    };
  });

  saveUnlockedBadgeIds(nowUnlocked);

  return { badges, newlyUnlocked };
}
