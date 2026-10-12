export type GoalTargetType = "duration" | "words";

export interface DailyGoalConfig {
  date: string; // "YYYY-MM-DD"
  targetType: GoalTargetType;
  durationTarget: number; // in minutes, e.g. 15
  wordsTarget: number; // in words, e.g. 30
  actualMinutes: number; // float/number, e.g. 12
  actualWords: number; // integer
  streakDays: number; // streak of days reaching goal
  lastCompletedDate?: string; // "YYYY-MM-DD"
}

const STORAGE_KEY = "katakata_daily_goal";

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyGoal(): DailyGoalConfig {
  const today = getTodayDateString();
  const defaultGoal: DailyGoalConfig = {
    date: today,
    targetType: "duration",
    durationTarget: 15,
    wordsTarget: 30,
    actualMinutes: 0,
    actualWords: 0,
    streakDays: 0,
  };

  if (typeof window === "undefined") return defaultGoal;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGoal));
      return defaultGoal;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultGoal;

    // Check if a new day has arrived
    if (parsed.date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yYear = yesterday.getFullYear();
      const yMonth = String(yesterday.getMonth() + 1).padStart(2, "0");
      const yDay = String(yesterday.getDate()).padStart(2, "0");
      const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

      const wasYesterdayCompleted = parsed.lastCompletedDate === yesterdayStr || (
        parsed.targetType === "duration" 
          ? (parsed.actualMinutes >= (parsed.durationTarget || 15))
          : (parsed.actualWords >= (parsed.wordsTarget || 30))
      );

      const newStreak = wasYesterdayCompleted ? Math.max(1, (parsed.streakDays || 1)) : 0;

      const newDayGoal: DailyGoalConfig = {
        date: today,
        targetType: parsed.targetType === "words" ? "words" : "duration",
        durationTarget: Math.max(1, Number(parsed.durationTarget) || 15),
        wordsTarget: Math.max(1, Number(parsed.wordsTarget) || 30),
        actualMinutes: 0,
        actualWords: 0,
        streakDays: newStreak,
        lastCompletedDate: wasYesterdayCompleted ? yesterdayStr : parsed.lastCompletedDate,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDayGoal));
      return newDayGoal;
    }

    return {
      date: today,
      targetType: parsed.targetType === "words" ? "words" : "duration",
      durationTarget: Math.max(1, Number(parsed.durationTarget) || 15),
      wordsTarget: Math.max(1, Number(parsed.wordsTarget) || 30),
      actualMinutes: Math.max(0, Number(parsed.actualMinutes) || 0),
      actualWords: Math.max(0, Number(parsed.actualWords) || 0),
      streakDays: Math.max(0, Number(parsed.streakDays) || 0),
      lastCompletedDate: parsed.lastCompletedDate,
    };
  } catch (err) {
    console.warn("Failed to load daily goal", err);
    return defaultGoal;
  }
}

export function saveDailyGoal(goal: DailyGoalConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
    window.dispatchEvent(new CustomEvent("katakata_daily_goal_updated", { detail: goal }));
  } catch (e) {
    console.warn("localStorage restricted", e);
  }
}

function checkAndRecordCompletion(goal: DailyGoalConfig): void {
  const today = getTodayDateString();
  const isCompleted = goal.targetType === "duration"
    ? goal.actualMinutes >= goal.durationTarget
    : goal.actualWords >= goal.wordsTarget;

  if (isCompleted && goal.lastCompletedDate !== today) {
    goal.lastCompletedDate = today;
    goal.streakDays = (goal.streakDays || 0) + 1;
  }
}

export function updateDailyGoalTarget(targetType: GoalTargetType, targetValue: number): DailyGoalConfig {
  const current = getDailyGoal();
  if (targetType === "duration") {
    current.durationTarget = Math.max(1, Math.round(targetValue));
  } else {
    current.wordsTarget = Math.max(1, Math.round(targetValue));
  }
  current.targetType = targetType;
  checkAndRecordCompletion(current);
  saveDailyGoal(current);
  return current;
}

export function addDailyProgress(minutes: number, words: number): DailyGoalConfig {
  const current = getDailyGoal();
  if (minutes > 0) {
    current.actualMinutes = Math.round((current.actualMinutes + minutes) * 10) / 10;
  }
  if (words > 0) {
    current.actualWords = Math.round(current.actualWords + words);
  }
  checkAndRecordCompletion(current);
  saveDailyGoal(current);
  return current;
}

export function setDailyProgress(actualMinutes?: number, actualWords?: number): DailyGoalConfig {
  const current = getDailyGoal();
  if (typeof actualMinutes === "number") {
    current.actualMinutes = Math.max(0, Math.round(actualMinutes * 10) / 10);
  }
  if (typeof actualWords === "number") {
    current.actualWords = Math.max(0, Math.round(actualWords));
  }
  checkAndRecordCompletion(current);
  saveDailyGoal(current);
  return current;
}
