import { ReciteLanguage } from "../components/SpanishRecitePage";

export interface MistakeRecord {
  wordId: string;
  lang: ReciteLanguage;
  wordText: string;
  meaning?: string;
  errorCount: number;
  mistakeCount?: number;
  lastErrorTime: number;
  lastErrorInput?: string;
}

export interface ReciteProgress {
  lang: ReciteLanguage;
  wordId: string;
  wordText?: string;
  index: number;
  total?: number;
  category: string;
  level: string;
  tab: "flashcard" | "dictation" | "library";
  timestamp: number;
}

export interface ReciteHistoryLog {
  id: string;
  wordId: string;
  lang: ReciteLanguage;
  wordText: string;
  meaning?: string;
  action: "mastered" | "familiar" | "learning" | "dictation_pass" | "dictation_fail" | "mistake_add" | "mistake_resolve";
  timestamp: number;
}

function getMistakesKey(lang: ReciteLanguage): string {
  return `fifty_sound_${lang}_mistakes_v2`;
}

function getProgressKey(lang: ReciteLanguage): string {
  return `fifty_sound_${lang}_last_progress_v2`;
}

const HISTORY_KEY = "fifty_sound_recite_history_v2";

/**
 * Retrieves mistake collection for a given language
 */
export function getMistakes(lang: ReciteLanguage): Record<string, MistakeRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getMistakesKey(lang));
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

/**
 * Adds or increments an error in the mistake notebook
 */
export function addMistake(
  lang: ReciteLanguage,
  wordId: string,
  wordText: string,
  meaning?: string,
  wrongInput?: string
): Record<string, MistakeRecord> {
  if (typeof window === "undefined") return {};
  try {
    const current = getMistakes(lang);
    const existing = current[wordId];
    const updated: MistakeRecord = {
      wordId,
      lang,
      wordText: wordText || existing?.wordText || "",
      meaning: meaning || existing?.meaning || "",
      errorCount: (existing?.errorCount || 0) + 1,
      mistakeCount: (existing?.errorCount || 0) + 1,
      lastErrorTime: Date.now(),
      lastErrorInput: wrongInput || existing?.lastErrorInput,
    };
    const next = { ...current, [wordId]: updated };
    localStorage.setItem(getMistakesKey(lang), JSON.stringify(next));

    // Also record into history log
    appendHistoryLog({
      id: `${wordId}_${Date.now()}`,
      wordId,
      lang,
      wordText,
      meaning,
      action: "dictation_fail",
      timestamp: Date.now(),
    });

    return next;
  } catch (_) {
    return getMistakes(lang);
  }
}

/**
 * Removes a word from the mistake collection (e.g. conquered/mastered)
 */
export function removeMistake(lang: ReciteLanguage, wordId: string): Record<string, MistakeRecord> {
  if (typeof window === "undefined") return {};
  try {
    const current = getMistakes(lang);
    if (!current[wordId]) return current;
    const next = { ...current };
    delete next[wordId];
    localStorage.setItem(getMistakesKey(lang), JSON.stringify(next));
    return next;
  } catch (_) {
    return getMistakes(lang);
  }
}

/**
 * Clears all mistakes for a language
 */
export function clearMistakes(lang: ReciteLanguage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getMistakesKey(lang));
  } catch (_) {}
}

/**
 * Checks whether a word is currently in the mistake collection
 */
export function isWordInMistakes(lang: ReciteLanguage, wordId: string): boolean {
  const map = getMistakes(lang);
  return Boolean(map[wordId]);
}

/**
 * Returns mistakes as an array sorted by last error time (most recent first)
 */
export function getMistakeList(lang: ReciteLanguage): MistakeRecord[] {
  const map = getMistakes(lang);
  return Object.values(map).sort((a, b) => b.lastErrorTime - a.lastErrorTime);
}

/**
 * Saves current learning position and progress
 */
export function saveReciteProgress(progress: ReciteProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getProgressKey(progress.lang), JSON.stringify(progress));
    localStorage.setItem("recite_last_lang", progress.lang);
  } catch (_) {}
}

/**
 * Retrieves last saved learning position and progress
 */
export function getReciteProgress(lang: ReciteLanguage): ReciteProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getProgressKey(lang));
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Clears saved learning progress for a language
 */
export function clearReciteProgress(lang: ReciteLanguage): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getProgressKey(lang));
  } catch (_) {}
}

/**
 * Internal append for recent history logs (max 100 entries)
 */
function appendHistoryLog(entry: ReciteHistoryLog): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: ReciteHistoryLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    const trimmed = list.slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (_) {}
}

/**
 * Records a positive or learning action into history
 */
export function recordReciteAction(
  lang: ReciteLanguage,
  wordId: string,
  wordText: string,
  action: "mastered" | "familiar" | "learning" | "dictation_pass",
  meaning?: string
): void {
  appendHistoryLog({
    id: `${wordId}_${Date.now()}`,
    wordId,
    lang,
    wordText,
    meaning,
    action,
    timestamp: Date.now(),
  });
}

/**
 * Retrieves recent history logs
 */
export function getReciteHistoryLogs(lang?: ReciteLanguage, limit: number = 20): ReciteHistoryLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: ReciteHistoryLog[] = raw ? JSON.parse(raw) : [];
    if (lang) {
      return list.filter((item) => item.lang === lang).slice(0, limit);
    }
    return list.slice(0, limit);
  } catch (_) {
    return [];
  }
}

/**
 * Clears history logs, optionally filtered by language
 */
export function clearReciteHistoryLogs(lang?: ReciteLanguage): void {
  if (typeof window === "undefined") return;
  try {
    if (!lang) {
      localStorage.removeItem(HISTORY_KEY);
      return;
    }
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    const list: ReciteHistoryLog[] = JSON.parse(raw);
    const filtered = list.filter((item) => item.lang !== lang);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (_) {}
}
