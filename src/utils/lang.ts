// Clean translation system for English mode in Katakata
import { ENGLISH_OVERLAYS } from "../data/dictionary";

export const LANG_MAPPING: Record<string, { title: string; categoryName: string; meaning: string }> = Object.entries(ENGLISH_OVERLAYS).reduce(
  (acc, [k, v]) => {
    acc[k] = {
      title: v.word,
      categoryName: v.categoryName,
      meaning: v.meaning
    };
    return acc;
  },
  {} as Record<string, { title: string; categoryName: string; meaning: string }>
);

// UI translation helper
export const uiTranslate = (_key: string, _isEnglish: boolean, fallback: string): string => {
  return fallback;
};


