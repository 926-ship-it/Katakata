export interface SessionLogEntry {
  date: string;
  kpm: number;
  accuracy: number;
  xpGained: number;
  timestamp: number;
}

const STORAGE_KEY = "fifty_sound_session_log";
export const MAX_SESSION_LOGS = 15;

/**
 * Retrieves the past up to 15 session logs from localStorage
 */
export function getSessionLogs(): SessionLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, idx) => ({
        date: typeof item.date === "string" ? item.date : `Session ${idx + 1}`,
        kpm: Math.max(0, Math.round(Number(item.kpm) || 0)),
        accuracy: Math.min(100, Math.max(0, Math.round(Number(item.accuracy) || 0))),
        xpGained: Math.max(0, Math.round(Number(item.xpGained) || 0)),
        timestamp: Number(item.timestamp) || Date.now(),
      }))
      .slice(-MAX_SESSION_LOGS);
  } catch (err) {
    console.warn("Failed to parse fifty_sound_session_log", err);
    return [];
  }
}

/**
 * Appends a new session log to localStorage (maintaining the latest 15 records)
 */
export function saveSessionLog(entry: {
  kpm: number;
  accuracy: number;
  xpGained?: number;
}): SessionLogEntry[] {
  try {
    const existing = getSessionLogs();

    // Deduplication check: if a log was saved within the last 5000ms with identical kpm and accuracy
    const last = existing[existing.length - 1];
    if (
      last &&
      Math.abs(Date.now() - (last.timestamp || 0)) < 5000 &&
      last.kpm === Math.max(0, Math.round(entry.kpm)) &&
      last.accuracy === Math.min(100, Math.max(0, Math.round(entry.accuracy)))
    ) {
      return existing;
    }

    const now = new Date();
    const formattedDate = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const newLog: SessionLogEntry = {
      date: formattedDate,
      kpm: Math.max(0, Math.round(entry.kpm)),
      accuracy: Math.min(100, Math.max(0, Math.round(entry.accuracy))),
      xpGained: Math.max(0, Math.round(entry.xpGained || 0)),
      timestamp: Date.now(),
    };

    const updated = [...existing, newLog].slice(-MAX_SESSION_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Notify listeners in other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fifty_sound_session_log_updated", { detail: updated }));
    }

    return updated;
  } catch (err) {
    console.warn("Failed to save session log to localStorage", err);
    return getSessionLogs();
  }
}
