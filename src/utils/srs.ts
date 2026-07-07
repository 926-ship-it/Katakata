// srs.ts — 间隔重复(Spaced Repetition)调度逻辑
// 放置位置:src/utils/srs.ts

export interface SrsCardState {
  lastPracticed: number;
  intervalIndex: number;
}

export interface SrsData {
  version: 1;
  cards: Record<string, SrsCardState>;
}

const STORAGE_KEY = "fifty_sound_srs_v1";

export const INTERVALS_DAYS = [1, 2, 4, 7, 15, 30] as const;

export function loadSrsData(): SrsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && parsed.cards) {
        return parsed as SrsData;
      }
    }
  } catch (_) {}
  return { version: 1, cards: {} };
}

export function saveSrsData(data: SrsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getDueDate(state: SrsCardState): number {
  const intervalDays =
    INTERVALS_DAYS[Math.min(state.intervalIndex, INTERVALS_DAYS.length - 1)];
  return startOfDay(state.lastPracticed) + intervalDays * 24 * 60 * 60 * 1000;
}

export function isDue(state: SrsCardState, now: number = Date.now()): boolean {
  return startOfDay(now) >= getDueDate(state);
}

export function getDueCardIds(
  collectedIds: string[],
  data: SrsData = loadSrsData(),
  now: number = Date.now()
): string[] {
  return collectedIds.filter((id) => {
    const state = data.cards[id];
    if (!state) return true;
    return isDue(state, now);
  });
}

export function recordPractice(
  id: string,
  data: SrsData,
  now: number = Date.now()
): SrsData {
  const prev = data.cards[id];
  let next: SrsCardState;

  if (!prev) {
    next = { lastPracticed: now, intervalIndex: 0 };
  } else if (isDue(prev, now)) {
    next = {
      lastPracticed: now,
      intervalIndex: Math.min(prev.intervalIndex + 1, INTERVALS_DAYS.length - 1),
    };
  } else {
    next = { ...prev, lastPracticed: now };
  }

  return {
    ...data,
    cards: { ...data.cards, [id]: next },
  };
}

export function recordPracticeBatch(
  ids: string[],
  now: number = Date.now()
): SrsData {
  let data = loadSrsData();
  for (const id of ids) {
    data = recordPractice(id, data, now);
  }
  saveSrsData(data);
  return data;
}

export function getReviewSummary(
  collectedIds: string[],
  now: number = Date.now()
): { dueCount: number; nextDueInDays: number | null } {
  const data = loadSrsData();
  const dueIds = getDueCardIds(collectedIds, data, now);
  if (dueIds.length > 0) {
    return { dueCount: dueIds.length, nextDueInDays: 0 };
  }
  if (collectedIds.length === 0) {
    return { dueCount: 0, nextDueInDays: null };
  }
  const dayMs = 24 * 60 * 60 * 1000;
  const today = startOfDay(now);
  let minDays = Infinity;
  for (const id of collectedIds) {
    const state = data.cards[id];
    if (!state) continue;
    const days = Math.ceil((getDueDate(state) - today) / dayMs);
    if (days < minDays) minDays = days;
  }
  return {
    dueCount: 0,
    nextDueInDays: Number.isFinite(minDays) ? minDays : null,
  };
}
