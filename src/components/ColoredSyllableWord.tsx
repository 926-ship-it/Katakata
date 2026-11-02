import React from "react";
import { splitWordIntoSyllables, getSyllableColor, SupportedLanguage } from "../utils/syllableColorHelper";

interface ColoredSyllableWordProps {
  word: string;
  kanaStr?: string;
  lang?: SupportedLanguage;
  isEnglishMode?: boolean;
  className?: string;
  showDots?: boolean;
  enabled?: boolean;
}

/**
 * Universal component to render words with phonetic/mora syllable color-coding across English, Spanish, and Japanese.
 * - English: "TODAY" -> "TO" in green, "DAY" in red
 * - Spanish: "HOLA" -> "HO" in green, "LA" in red
 * - Japanese: "宮崎" -> "宮" in green, "崎" in red (with furigana "み" in green, "や" in red...)
 */
export const ColoredSyllableWord: React.FC<ColoredSyllableWordProps> = ({
  word,
  kanaStr,
  lang,
  isEnglishMode = false,
  className = "",
  showDots = false,
  enabled = true,
}) => {
  if (!word) return null;

  if (!enabled) {
    if (word.includes(" ")) {
      const parts = word.split(/(\s+)/);
      return (
        <span className={className}>
          {parts.map((part, pIdx) => {
            if (/^\s+$/.test(part)) {
              return (
                <span
                  key={pIdx}
                  className="inline-flex items-center justify-center mx-1 sm:mx-1.5 select-none align-middle"
                  title="此处有空格 (Space / 按空格键或减号键)"
                >
                  <span className="text-stone-400 font-sans font-black text-base sm:text-lg md:text-xl leading-none px-0.5 select-none transform -translate-y-0.5">
                    -
                  </span>
                </span>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </span>
      );
    }
    return <span className={className}>{word}</span>;
  }

  // Determine actual target language
  const effectiveLang: SupportedLanguage = lang || (isEnglishMode ? "en" : /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-_.'’]+$/.test(word) ? "es" : "ja");

  // Japanese Kanji word with separate Kana reading
  if (effectiveLang === "ja") {
    // If predominantly Kanji (e.g. "宮崎", "佐藤", "坂本舞白")
    if (/^[\u4E00-\u9FAF]+/.test(word)) {
      const kanjiChars = word.split("");
      return (
        <span className={`inline-flex items-baseline flex-wrap justify-center ${className}`}>
          {kanjiChars.map((char, idx) => {
            const color = getSyllableColor(idx);
            return (
              <span
                key={idx}
                className={`${color.textColor} transition-colors duration-200 select-none inline-block`}
                title={`汉字: ${char} (${color.label})`}
              >
                {char}
              </span>
            );
          })}
        </span>
      );
    }
  }

  // English, Spanish, or pure Kana words
  const syllables = splitWordIntoSyllables(word, effectiveLang);

  // If word has only 1 syllable and no spaces, render with primary emerald
  if (syllables.length <= 1 && !word.includes(" ")) {
    return (
      <span className={className}>
        <span className="text-emerald-600 drop-shadow-2xs">{word}</span>
      </span>
    );
  }

  let syllableCounter = 0;

  return (
    <span className={`inline-flex items-baseline flex-wrap justify-center ${className}`}>
      {syllables.map((syl, idx) => {
        const isSpace = syl === " " || /^\s+$/.test(syl);
        if (isSpace) {
          return (
            <span
              key={idx}
              className="inline-flex items-center justify-center mx-1 sm:mx-1.5 select-none align-middle"
              title="此处有空格 (Space / 按空格键或减号键)"
            >
              <span className="text-stone-400 font-sans font-black text-base sm:text-lg md:text-xl leading-none px-0.5 select-none transform -translate-y-0.5">
                -
              </span>
            </span>
          );
        }

        const color = getSyllableColor(syllableCounter);
        syllableCounter++;

        return (
          <React.Fragment key={idx}>
            <span
              className={`${color.textColor} transition-colors duration-200 select-none inline-block`}
              title={`音节: ${syl} (${color.label})`}
            >
              {syl}
            </span>
            {showDots && idx < syllables.length - 1 && syllables[idx + 1] !== " " && !/^\s+$/.test(syllables[idx + 1]) && (
              <span className="text-stone-300 font-sans mx-0.5 text-xs select-none pointer-events-none opacity-60">
                ·
              </span>
            )}
          </React.Fragment>
        );
      })}
    </span>
  );
};
