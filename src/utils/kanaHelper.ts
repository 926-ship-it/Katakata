import { KanaSegment, DictionaryItem, hiraganaToKatakana } from "../data/dictionary";

// Comprehensive multi-map for Kana to Romaji conversions
const KANA_ROMAJI_TABLE: Record<string, string[]> = {
  // Hiragana
  "あ": ["a"], "い": ["i"], "う": ["u"], "え": ["e"], "お": ["o"],
  "か": ["ka"], "き": ["ki"], "く": ["ku"], "け": ["ke"], "こ": ["ko"],
  "さ": ["sa"], "し": ["shi", "si"], "す": ["su"], "せ": ["se"], "そ": ["so"],
  "た": ["ta"], "ち": ["chi", "ti"], "つ": ["tsu", "tu"], "て": ["te"], "と": ["to"],
  "な": ["na"], "に": ["ni"], "ぬ": ["nu"], "ね": ["ne"], "の": ["no"],
  "は": ["ha"], "ひ": ["hi"], "ふ": ["fu", "hu"], "へ": ["he"], "ほ": ["ho"],
  "ま": ["ma"], "み": ["mi"], "む": ["mu"], "め": ["me"], "も": ["mo"],
  "や": ["ya"], "ゆ": ["yu"], "よ": ["yo"],
  "ら": ["ra"], "り": ["ri"], "る": ["ru"], "れ": ["re"], "ろ": ["ro"],
  "わ": ["wa"], "を": ["wo", "o"], "ん": ["n", "nn"],

  // Dakuten
  "が": ["ga"], "ぎ": ["gi"], "ぐ": ["gu"], "げ": ["ge"], "ご": ["go"],
  "ざ": ["za"], "じ": ["ji", "zi"], "ず": ["zu"], "ぜ": ["ze"], "ぞ": ["zo"],
  "だ": ["da"], "ぢ": ["ji", "di"], "づ": ["zu", "du"], "で": ["de"], "ど": ["do"],
  "ば": ["ba"], "び": ["bi"], "ぶ": ["bu"], "べ": ["be"], "ぼ": ["bo"],
  "ぱ": ["pa"], "ぴ": ["pi"], "ぷ": ["pu"], "ぺ": ["pe"], "ぽ": ["po"],

  // Yoon Digraphs
  "きゃ": ["kya"], "きゅ": ["kyu"], "きょ": ["kyo"],
  "しゃ": ["sha", "sya"], "しゅ": ["shu", "syu"], "しょ": ["sho", "syo"],
  "ちゃ": ["cha", "tya"], "ちゅ": ["chu", "tyu"], "ちょ": ["cho", "tyo"],
  "にゃ": ["nya"], "にゅ": ["nyu"], "にょ": ["nyo"],
  "ひゃ": ["hya"], "ひゅ": ["hyu"], "ひょ": ["hyo"],
  "みゃ": ["mya"], "みゅ": ["myu"], "みょ": ["myo"],
  "りゃ": ["rya"], "りゅ": ["ryu"], "りょ": ["ryo"],
  "ぎゃ": ["gya"], "ぎゅ": ["gyu"], "ぎょ": ["gyo"],
  "じゃ": ["ja", "zya"], "じゅ": ["ju", "zyu"], "じょ": ["jo", "zyo"],
  "びゃ": ["bya"], "びゅ": ["byu"], "びょ": ["byo"],
  "ぴゃ": ["pya"], "ぴゅ": ["pyu"], "ぴょ": ["pyo"],

  // Katakana equivalents
  "ア": ["a"], "イ": ["i"], "ウ": ["u"], "エ": ["e"], "オ": ["o"],
  "カ": ["ka"], "キ": ["ki"], "ク": ["ku"], "ケ": ["ke"], "コ": ["ko"],
  "サ": ["sa"], "シ": ["shi", "si"], "ス": ["su"], "セ": ["se"], "ソ": ["so"],
  "タ": ["ta"], "チ": ["chi", "ti"], "ツ": ["tsu", "tu"], "テ": ["te"], "ト": ["to"],
  "ナ": ["na"], "ニ": ["ni"], "ヌ": ["nu"], "ネ": ["ne"], "ノ": ["no"],
  "ハ": ["ha"], "ヒ": ["hi"], "フ": ["fu", "hu"], "ヘ": ["he"], "ホ": ["ho"],
  "マ": ["ma"], "ミ": ["mi"], "ム": ["mu"], "メ": ["me"], "モ": ["mo"],
  "ヤ": ["ya"], "ユ": ["yu"], "ヨ": ["yo"],
  "ラ": ["ra"], "リ": ["ri"], "ル": ["ru"], "レ": ["re"], "ロ": ["ro"],
  "ワ": ["wa"], "ヲ": ["wo", "o"], "ン": ["n", "nn"],
  "ガ": ["ga"], "ギ": ["gi"], "グ": ["gu"], "ゲ": ["ge"], "ゴ": ["go"],
  "ザ": ["za"], "ジ": ["ji", "zi"], "ズ": ["zu"], "ゼ": ["ze"], "ゾ": ["zo"],
  "ダ": ["da"], "ヂ": ["ji", "di"], "ヅ": ["zu", "du"], "デ": ["de"], "ド": ["do"],
  "バ": ["ba"], "ビ": ["bi"], "ブ": ["bu"], "ベ": ["be"], "ボ": ["bo"],
  "パ": ["pa"], "ピ": ["pi"], "プ": ["pu"], "ペ": ["pe"], "ポ": ["po"],
  "キャ": ["kya"], "キュ": ["kyu"], "キョ": ["kyo"],
  "シャ": ["sha", "sya"], "シュ": ["shu", "syu"], "ショ": ["sho", "syo"],
  "チャ": ["cha", "tya"], "チュ": ["chu", "tyu"], "チョ": ["cho", "tyo"],
  "ニャ": ["nya"], "ニュ": ["nyu"], "ニョ": ["nyo"],
  "ヒャ": ["hya"], "ヒュ": ["hyu"], "ヒョ": ["hyo"],
  "ミャ": ["mya"], "ミュ": ["myu"], "ミョ": ["myo"],
  "リャ": ["rya"], "リュ": ["ryu"], "リョ": ["ryo"],
  "ギャ": ["gya"], "ギュ": ["gyu"], "ギョ": ["gyo"],
  "ジャ": ["ja", "zya"], "ジュ": ["ju", "zyu"], "ジョ": ["jo", "zyo"],
  "ビャ": ["bya"], "ビュ": ["byu"], "ビョ": ["byo"],
  "ピャ": ["pya"], "ピュ": ["pyu"], "ピョ": ["pyo"],
  "ティ": ["ti"], "ディ": ["di"], "ファ": ["fa"], "フィ": ["fi"], "フェ": ["fe"], "フォ": ["fo"],
  "ウィ": ["wi"], "ウェ": ["we"], "ウォ": ["wo"], "ヴ": ["vu"],

  // Special markers
  "ー": ["-"], " ": [" "],
};

export function splitKanaIntoSyllables(kana: string): KanaSegment[] {
  const syllables: KanaSegment[] = [];
  const cleanKana = (kana || "").trim();
  let i = 0;

  const smallDigraphs = ["ゃ", "ゅ", "ょ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ャ", "ュ", "ョ", "ァ", "ィ", "ゥ", "ェ", "ォ"];

  while (i < cleanKana.length) {
    const char = cleanKana[i];
    const nextChar = cleanKana[i + 1] || "";

    // Sokuon (促音) っ / ッ
    if (char === "っ" || char === "ッ") {
      // Lookahead next syllable's initial consonant
      let nextConsonant = "t";
      if (nextChar) {
        const lookup = KANA_ROMAJI_TABLE[nextChar] || [nextChar];
        const nextRom = lookup[0] || "t";
        nextConsonant = nextRom[0] || "t";
      }
      syllables.push({
        kana: char,
        romaji: [nextConsonant, "tsu", "xtsu", "ltu"],
        displayRomaji: nextConsonant,
      });
      i += 1;
      continue;
    }

    // Digraph check
    if (nextChar && smallDigraphs.includes(nextChar)) {
      const combined = char + nextChar;
      const romList = KANA_ROMAJI_TABLE[combined] || [combined];
      syllables.push({
        kana: combined,
        romaji: romList,
        displayRomaji: romList[0],
      });
      i += 2;
    } else {
      const romList = KANA_ROMAJI_TABLE[char] || [char.toLowerCase()];
      syllables.push({
        kana: char,
        romaji: romList,
        displayRomaji: romList[0],
      });
      i += 1;
    }
  }

  return syllables;
}

export function splitAlphabeticIntoSegments(word: string): KanaSegment[] {
  return word.split("").map((char) => {
    const isSpace = char === " ";
    const lower = char.toLowerCase();
    return {
      kana: char,
      romaji: isSpace ? [" "] : [lower],
      displayRomaji: char,
    };
  });
}

const CUSTOM_WORDS_KEY = "fifty_sound_custom_words";

export function getStoredCustomWords(): DictionaryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_WORDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

export function saveStoredCustomWord(item: DictionaryItem): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredCustomWords();
    const filtered = current.filter((w) => w.id !== item.id);
    filtered.unshift(item);
    localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(filtered));
  } catch (_) {}
}

export function deleteStoredCustomWord(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredCustomWords();
    const filtered = current.filter((w) => w.id !== id);
    localStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(filtered));
  } catch (_) {}
}
