/**
 * Syllable division & phonetic color-coding engine
 * Specially designed for phonics-based multilingual language learning:
 * - English: "TODAY" -> "to" (Green) · "day" (Red)
 * - Spanish: "HOLA" -> "ho" (Green) · "la" (Red), "AMIGO" -> "a" (Green) · "mi" (Red) · "go" (Amber)
 * - Japanese: "宮崎" -> "宮" (Green) "崎" (Red), "みやざき" -> "み" (Green) "や" (Red) "ざ" (Amber) "き" (Sky)
 */

export interface SyllableColorDef {
  name: string;
  textColor: string;      // Tailwind text class
  bgColor: string;        // Tailwind bg class for badges/cards
  borderColor: string;    // Tailwind border class
  ringColor: string;      // Tailwind ring class
  badgeColor: string;     // Combined badge style
  accentHex: string;      // Raw hex code for canvas/custom styles
  label: string;
}

export const SYLLABLE_PALETTE: SyllableColorDef[] = [
  {
    name: "emerald",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-400",
    ringColor: "ring-emerald-300",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    accentHex: "#059669",
    label: "音节 1 (翡翠绿)",
  },
  {
    name: "rose",
    textColor: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-400",
    ringColor: "ring-rose-300",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    accentHex: "#e11d48",
    label: "音节 2 (赤红/珊瑚)",
  },
  {
    name: "amber",
    textColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    ringColor: "ring-amber-300",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    accentHex: "#d97706",
    label: "音节 3 (琥珀黄)",
  },
  {
    name: "sky",
    textColor: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-400",
    ringColor: "ring-sky-300",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    accentHex: "#0284c7",
    label: "音节 4 (晴空蓝)",
  },
  {
    name: "purple",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-400",
    ringColor: "ring-purple-300",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    accentHex: "#9333ea",
    label: "音节 5 (紫罗兰)",
  },
  {
    name: "teal",
    textColor: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-400",
    ringColor: "ring-teal-300",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    accentHex: "#0d9488",
    label: "音节 6 (青碧色)",
  },
];

// =========================================================================
// 1. ENGLISH SYLLABLE DEFINITIONS & LOGIC
// =========================================================================

const CURATED_ENGLISH_SYLLABLES: Record<string, string[]> = {
  "today": ["to", "day"],
  "tomorrow": ["to", "mor", "row"],
  "yesterday": ["yes", "ter", "day"],
  "apple": ["ap", "ple"],
  "rainbow": ["rain", "bow"],
  "sunshine": ["sun", "shine"],
  "banana": ["ba", "na", "na"],
  "cat": ["cat"],
  "dog": ["dog"],
  "bird": ["bird"],
  "butterfly": ["but", "ter", "fly"],
  "chocolate": ["choc", "o", "late"],
  "elephant": ["el", "e", "phant"],
  "rabbit": ["rab", "bit"],
  "panda": ["pan", "da"],
  "flower": ["flow", "er"],
  "water": ["wa", "ter"],
  "orange": ["or", "ange"],
  "guitar": ["gui", "tar"],
  "piano": ["pi", "an", "o"],
  "happy": ["hap", "py"],
  "family": ["fam", "i", "ly"],
  "friend": ["friend"],
  "school": ["school"],
  "pencil": ["pen", "cil"],
  "cookie": ["cook", "ie"],
  "kitten": ["kit", "ten"],
  "puppy": ["pup", "py"],
  "monkey": ["mon", "key"],
  "tiger": ["ti", "ger"],
  "dragon": ["drag", "on"],
  "star": ["star"],
  "moon": ["moon"],
  "cloud": ["cloud"],
  "river": ["riv", "er"],
  "ocean": ["o", "cean"],
  "honey": ["hon", "ey"],
  "achieve": ["a", "chieve"],
  "curiosity": ["cu", "ri", "os", "i", "ty"],
  "environment": ["en", "vi", "ron", "ment"],
  "heritage": ["her", "i", "tage"],
  "inspire": ["in", "spire"],
  "journey": ["jour", "ney"],
  "knowledge": ["knowl", "edge"],
  "legacy": ["leg", "a", "cy"],
  "memory": ["mem", "o", "ry"],
  "navigate": ["nav", "i", "gate"],
  "opportunity": ["op", "por", "tu", "ni", "ty"],
  "passion": ["pas", "sion"],
  "resilience": ["re", "sil", "ience"],
  "symphony": ["sym", "pho", "ny"],
  "tradition": ["tra", "di", "tion"],
  "universe": ["u", "ni", "verse"],
  "venture": ["ven", "ture"],
  "wisdom": ["wis", "dom"],
  "youth": ["youth"],
  "zenith": ["ze", "nith"],
  "strawberry": ["straw", "ber", "ry"],
  "morning glory": ["morn", "ing", " ", "glo", "ry"],
  "morning": ["morn", "ing"],
  "glory": ["glo", "ry"],
  "cheesecake": ["cheese", "cake"],
  "cathedral": ["ca", "the", "dral"],
  "harmony": ["har", "mo", "ny"],
  "melody": ["mel", "o", "dy"],
  "broadway": ["broad", "way"],
  "director": ["di", "rec", "tor"],
  "festival": ["fes", "ti", "val"],
  "fireworks": ["fire", "works"],
  "coffee": ["cof", "fee"],
  "computer": ["com", "pu", "ter"],
  "beautiful": ["beau", "ti", "ful"],
  "welcome": ["wel", "come"],
};

function algorithmicEnglishSyllabify(rawWord: string): string[] {
  if (!rawWord || rawWord.length <= 3) return [rawWord];

  if (/[\s\-_]/.test(rawWord)) {
    const parts = rawWord.split(/([\s\-_]+)/);
    const result: string[] = [];
    for (const part of parts) {
      if (/[\s\-_]+/.test(part)) {
        result.push(part);
      } else {
        result.push(...algorithmicEnglishSyllabify(part));
      }
    }
    return result;
  }

  const lower = rawWord.toLowerCase();
  if (CURATED_ENGLISH_SYLLABLES[lower]) {
    const cur = CURATED_ENGLISH_SYLLABLES[lower];
    let offset = 0;
    const mapped: string[] = [];
    for (const syl of cur) {
      mapped.push(rawWord.substring(offset, offset + syl.length));
      offset += syl.length;
    }
    return mapped;
  }

  const vowels = "aeiouy";
  const isVowel = (c: string) => vowels.includes(c.toLowerCase());
  const prefixes = ["un", "dis", "re", "pre", "mis", "in", "im", "non", "anti", "auto", "sub", "super", "trans"];
  const suffixes = ["ing", "tion", "sion", "ment", "ness", "able", "ible", "less", "ful", "ous", "ity", "ward", "ship"];

  let prefixMatch = "";
  for (const p of prefixes) {
    if (lower.startsWith(p) && lower.length > p.length + 2) {
      prefixMatch = rawWord.substring(0, p.length);
      break;
    }
  }

  let suffixMatch = "";
  for (const s of suffixes) {
    if (lower.endsWith(s) && lower.length > s.length + 2) {
      suffixMatch = rawWord.substring(rawWord.length - s.length);
      break;
    }
  }

  const baseStart = prefixMatch ? prefixMatch.length : 0;
  const baseEnd = suffixMatch ? rawWord.length - suffixMatch.length : rawWord.length;
  const middle = rawWord.substring(baseStart, baseEnd);

  if (middle.length <= 3) {
    const res: string[] = [];
    if (prefixMatch) res.push(prefixMatch);
    if (middle) res.push(middle);
    if (suffixMatch) res.push(suffixMatch);
    return res.length > 0 ? res : [rawWord];
  }

  const syllables: string[] = [];
  let currentSyl = "";
  for (let i = 0; i < middle.length; i++) {
    currentSyl += middle[i];
    const char = middle[i].toLowerCase();
    const nextChar = (middle[i + 1] || "").toLowerCase();
    const nextNextChar = (middle[i + 2] || "").toLowerCase();

    if (isVowel(char) && !isVowel(nextChar) && isVowel(nextNextChar) && i < middle.length - 2) {
      syllables.push(currentSyl);
      currentSyl = "";
    } else if (!isVowel(char) && !isVowel(nextChar) && i > 0 && isVowel(middle[i - 1].toLowerCase()) && i < middle.length - 1) {
      const pair = (char + nextChar).toLowerCase();
      if (!["th", "sh", "ch", "ph", "wh", "ck", "qu"].includes(pair)) {
        syllables.push(currentSyl);
        currentSyl = "";
      }
    }
  }

  if (currentSyl) {
    if (syllables.length > 0 && !isVowel(currentSyl.toLowerCase()) && currentSyl.length <= 1) {
      syllables[syllables.length - 1] += currentSyl;
    } else {
      syllables.push(currentSyl);
    }
  }

  const output: string[] = [];
  if (prefixMatch) output.push(prefixMatch);
  output.push(...(syllables.length > 0 ? syllables : [middle]));
  if (suffixMatch) output.push(suffixMatch);

  if (output.join("") !== rawWord) return [rawWord];
  return output;
}

// =========================================================================
// 2. SPANISH SYLLABLE (SILABEO) DEFINITIONS & LOGIC
// =========================================================================

const CURATED_SPANISH_SYLLABLES: Record<string, string[]> = {
  "hola": ["ho", "la"],
  "amigo": ["a", "mi", "go"],
  "amiga": ["a", "mi", "ga"],
  "gracias": ["gra", "cias"],
  "buenos": ["bue", "nos"],
  "dias": ["dí", "as"],
  "días": ["dí", "as"],
  "buenas": ["bue", "nas"],
  "tardes": ["tar", "des"],
  "noches": ["no", "ches"],
  "mañana": ["ma", "ña", "na"],
  "español": ["es", "pa", "ñol"],
  "adios": ["a", "diós"],
  "adiós": ["a", "diós"],
  "por favor": ["por", " ", "fa", "vor"],
  "favor": ["fa", "vor"],
  "bienvenido": ["bien", "ve", "ni", "do"],
  "bienvenida": ["bien", "ve", "ni", "da"],
  "familia": ["fa", "mi", "lia"],
  "restaurante": ["res", "tau", "ran", "te"],
  "computadora": ["com", "pu", "ta", "do", "ra"],
  "biblioteca": ["bi", "blio", "te", "ca"],
  "universidad": ["u", "ni", "ver", "si", "dad"],
  "estudiante": ["es", "tu", "dian", "te"],
  "profesor": ["pro", "fe", "sor"],
  "profesora": ["pro", "fe", "so", "ra"],
  "escuela": ["es", "cue", "la"],
  "trabajo": ["tra", "ba", "jo"],
  "tiempo": ["tiem", "po"],
  "hermano": ["her", "ma", "no"],
  "hermana": ["her", "ma", "na"],
  "guitarra": ["gui", "ta", "rra"],
  "música": ["mú", "si", "ca"],
  "comida": ["co", "mi", "da"],
  "ciudad": ["ciu", "dad"],
  "palabra": ["pa", "la", "bra"],
  "aeropuerto": ["a", "e", "ro", "puer", "to"],
  "dinero": ["di", "ne", "ro"],
  "mercado": ["mer", "ca", "do"],
  "mariposa": ["ma", "ri", "po", "sa"],
  "primavera": ["pri", "ma", "ve", "ra"],
  "chocolate": ["cho", "co", "la", "te"],
  "sol": ["sol"],
  "luna": ["lu", "na"],
  "estrella": ["es", "tre", "lla"],
  "libro": ["li", "bro"],
  "corazón": ["co", "ra", "zón"],
};

/**
 * Algorithmic Spanish silabeo (syllabification) engine following RAE standard rules:
 * - Strong vowels (A, E, O, Á, É, Í, Ó, Ú)
 * - Weak vowels (I, U, Ü)
 * - Inseparable clusters: pr, pl, br, bl, fr, fl, tr, dr, cr, cl, gr, gl, ch, ll, rr
 */
function algorithmicSpanishSyllabify(rawWord: string): string[] {
  if (!rawWord || rawWord.length <= 2) return [rawWord];

  if (/[\s\-_]/.test(rawWord)) {
    const parts = rawWord.split(/([\s\-_]+)/);
    const result: string[] = [];
    for (const part of parts) {
      if (/[\s\-_]+/.test(part)) {
        result.push(part);
      } else {
        result.push(...algorithmicSpanishSyllabify(part));
      }
    }
    return result;
  }

  const lower = rawWord.toLowerCase();
  if (CURATED_SPANISH_SYLLABLES[lower]) {
    const cur = CURATED_SPANISH_SYLLABLES[lower];
    let offset = 0;
    const mapped: string[] = [];
    for (const syl of cur) {
      mapped.push(rawWord.substring(offset, offset + syl.length));
      offset += syl.length;
    }
    return mapped;
  }

  const isStrong = (c: string) => "aeoáéóAEÓAEO".includes(c);
  const isWeak = (c: string) => "iuüIUÜ".includes(c);
  const isAccentedWeak = (c: string) => "íúÍÚ".includes(c);
  const isVowel = (c: string) => isStrong(c) || isWeak(c) || isAccentedWeak(c);

  // Inseparable consonant pairs in Spanish
  const inseparable = ["pr", "pl", "br", "bl", "fr", "fl", "tr", "dr", "cr", "cl", "gr", "gl", "ch", "ll", "rr", "qu", "gu"];

  const syllables: string[] = [];
  let current = "";

  for (let i = 0; i < rawWord.length; i++) {
    current += rawWord[i];
    const c = rawWord[i];
    const next = rawWord[i + 1] || "";
    const next2 = rawWord[i + 2] || "";

    // If reached end, finish
    if (!next) break;

    // 1. Hiatus between two strong vowels or accented weak vowel:
    // e.g. "ca-os", "te-a-tro", "dí-as", "pa-ís"
    if (isStrong(c) && isStrong(next)) {
      syllables.push(current);
      current = "";
      continue;
    }
    if ((isAccentedWeak(c) && isVowel(next)) || (isVowel(c) && isAccentedWeak(next))) {
      syllables.push(current);
      current = "";
      continue;
    }

    // 2. Vowel followed by single consonant then vowel (V-CV):
    // e.g. "ho-la", "a-mi-go", "ma-ña-na"
    if (isVowel(c) && !isVowel(next) && isVowel(next2)) {
      syllables.push(current);
      current = "";
      continue;
    }

    // 3. Vowel followed by inseparable cluster then vowel (V-CCV):
    // e.g. "gra-cias", "li-bro", "no-ches"
    const pair = (next + next2).toLowerCase();
    if (isVowel(c) && inseparable.includes(pair) && isVowel(rawWord[i + 3] || "")) {
      syllables.push(current);
      current = "";
      continue;
    }

    // 4. Two consonants between vowels split (VC-CV):
    // e.g. "es-pa-ñol", "par-que"
    if (!isVowel(c) && isVowel(rawWord[i - 1] || "") && !isVowel(next) && isVowel(next2)) {
      const nextPair = (c + next).toLowerCase();
      if (!inseparable.includes(nextPair)) {
        syllables.push(current);
        current = "";
        continue;
      }
    }
  }

  if (current) {
    syllables.push(current);
  }

  if (syllables.join("") !== rawWord) return [rawWord];
  return syllables.length > 0 ? syllables : [rawWord];
}

// =========================================================================
// 3. JAPANESE MORA / SYLLABLE ENGINE
// =========================================================================

/**
 * Splits Japanese Kana string into linguistic moras:
 * Contracted sounds (拗音 e.g. しゃ, きょ, ちょ) bind to the preceding kana to form a single mora!
 */
export function splitJapaneseKanaMoras(kanaStr: string): string[] {
  if (!kanaStr) return [];
  const smallKana = "ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ";
  const moras: string[] = [];

  for (let i = 0; i < kanaStr.length; i++) {
    const char = kanaStr[i];
    const nextChar = kanaStr[i + 1] || "";

    if (smallKana.includes(nextChar)) {
      // Contracted sound mora: e.g. "きょ", "しゃ"
      moras.push(char + nextChar);
      i++; // Skip the small kana
    } else {
      moras.push(char);
    }
  }

  return moras;
}

/**
 * Splits Kanji words into character syllables.
 */
export function splitJapaneseKanji(kanjiStr: string): string[] {
  if (!kanjiStr) return [];
  return kanjiStr.split("");
}

// =========================================================================
// 4. UNIVERSAL SYLLABLE DISPATCHER
// =========================================================================

export type SupportedLanguage = "en" | "ja" | "es";

/**
 * Universal syllable breaker across English, Spanish, and Japanese.
 */
export function splitWordIntoSyllables(
  word: string,
  lang: SupportedLanguage = "en"
): string[] {
  if (!word) return [];

  if (lang === "es") {
    return algorithmicSpanishSyllabify(word);
  }

  if (lang === "ja") {
    // If predominantly kana, split by mora
    if (/^[\u3040-\u309F\u30A0-\u30FF\u30FC\s]+$/.test(word)) {
      return splitJapaneseKanaMoras(word);
    }
    // If kanji compound, split character-by-character
    return splitJapaneseKanji(word);
  }

  // Default English / Latin mode
  if (word.includes(" ")) {
    const parts = word.split(/(\s+)/);
    const res: string[] = [];
    for (const p of parts) {
      if (/^\s+$/.test(p)) {
        res.push(p);
      } else {
        res.push(...algorithmicEnglishSyllabify(p));
      }
    }
    return res;
  }
  return algorithmicEnglishSyllabify(word);
}

/**
 * Returns color definition for a given syllable index.
 * Index 0 = Emerald Green, Index 1 = Rose Red, Index 2 = Amber Yellow, etc.
 */
export function getSyllableColor(syllableIndex: number): SyllableColorDef {
  const idx = Math.abs(syllableIndex) % SYLLABLE_PALETTE.length;
  return SYLLABLE_PALETTE[idx];
}

/**
 * Maps each segment in word.segments to its corresponding syllable index and color definition.
 * Works seamlessly across English, Spanish, and Japanese!
 */
export function mapWordSegmentsToSyllables(
  word: string,
  segmentsCount: number,
  lang: SupportedLanguage = "en"
): { syllableIndex: number; color: SyllableColorDef }[] {
  const result: { syllableIndex: number; color: SyllableColorDef }[] = [];

  // In Japanese, each segment is directly a mora!
  if (lang === "ja") {
    for (let i = 0; i < segmentsCount; i++) {
      result.push({
        syllableIndex: i,
        color: getSyllableColor(i),
      });
    }
    return result;
  }

  // In English / Spanish, segments are individual letters, mapped to syllables
  const syllables = splitWordIntoSyllables(word, lang);
  let currentSyllableIdx = 0;
  let remainingInCurrentSyl = (syllables[0] || "").length;

  for (let i = 0; i < segmentsCount; i++) {
    const currentSylText = syllables[currentSyllableIdx] || "";
    if (currentSylText === " ") {
      result.push({
        syllableIndex: currentSyllableIdx,
        color: getSyllableColor(Math.max(0, currentSyllableIdx - 1)),
      });
      currentSyllableIdx++;
      remainingInCurrentSyl = (syllables[currentSyllableIdx] || "").length;
      continue;
    }

    result.push({
      syllableIndex: currentSyllableIdx,
      color: getSyllableColor(currentSyllableIdx),
    });

    remainingInCurrentSyl--;
    if (remainingInCurrentSyl <= 0 && currentSyllableIdx < syllables.length - 1) {
      currentSyllableIdx++;
      remainingInCurrentSyl = (syllables[currentSyllableIdx] || "").length;
    }
  }

  return result;
}
