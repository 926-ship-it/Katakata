// Safe Web Audio API synthesizer for retro mechanical game sounds
// Avoids requiring external static files, keeping it 100% responsive and offline-first!

// Converts Japanese Hiragana to Katakana to ensure 100% accurate phonetic TTS pronunciation.
// In Hiragana, browser TTS engines often mistakenly treat 「は」 as the topic particle "wa" (e.g. reading はしもとかんな as "washimoto kanna").
// In Katakana, 「ハ」 is strictly and unambiguously pronounced "ha", and 「ワ」 is strictly "wa".
export function toPhoneticKatakana(text: string): string {
  return text.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

// Master phonetic pronunciation database for words, names, and celebrity entries.
// Whenever Japanese TTS encounters ambiguous Hiragana names, standard Kanji or phonetic Katakana guarantees 100% exact articulation!
export const PHONETIC_PRONUNCIATION_MAP: Record<string, { kanji: string; phonetic: string; romaji: string }> = {
  // Hashimoto Kanna: strictly "Hashimoto Kanna", never "washimoto kanna"!
  "hashimoto_kanna": { kanji: "橋本環奈", phonetic: "ハシモト カンナ", romaji: "Hashimoto Kanna" },
  "はしもとかんな": { kanji: "橋本環奈", phonetic: "ハシモト カンナ", romaji: "Hashimoto Kanna" },
  "ハシモトカンナ": { kanji: "橋本環奈", phonetic: "ハシモト カンナ", romaji: "Hashimoto Kanna" },
  "橋本環奈": { kanji: "橋本環奈", phonetic: "ハシモト カンナ", romaji: "Hashimoto Kanna" },
  "橋本环奈": { kanji: "橋本環奈", phonetic: "ハシモト カンナ", romaji: "Hashimoto Kanna" },

  // Hamabe Minami
  "hamabe_minami": { kanji: "浜辺美波", phonetic: "ハマベ ミナミ", romaji: "Hamabe Minami" },
  "はまべみなみ": { kanji: "浜辺美波", phonetic: "ハマベ ミナミ", romaji: "Hamabe Minami" },
  "浜辺美波": { kanji: "浜辺美波", phonetic: "ハマベ ミナミ", romaji: "Hamabe Minami" },

  // Hanyu Yuzuru
  "hanyuu_yuzuru": { kanji: "羽生結弦", phonetic: "ハニュウ ユヅル", romaji: "Hanyu Yuzuru" },
  "はにゅうゆづる": { kanji: "羽生結弦", phonetic: "ハニュウ ユヅル", romaji: "Hanyu Yuzuru" },
  "羽生結弦": { kanji: "羽生結弦", phonetic: "ハニュウ ユヅル", romaji: "Hanyu Yuzuru" },

  // Ayase Haruka
  "ayase_haruka": { kanji: "綾瀬はるか", phonetic: "アヤセ ハルカ", romaji: "Ayase Haruka" },
  "あやせはるか": { kanji: "綾瀬はるか", phonetic: "アヤセ ハルカ", romaji: "Ayase Haruka" },
  "綾瀬はるか": { kanji: "綾瀬はるか", phonetic: "アヤセ ハルカ", romaji: "Ayase Haruka" },

  // Fukuyama Masaharu
  "fukuyama_masaharu": { kanji: "福山雅治", phonetic: "フクヤマ マサハル", romaji: "Fukuyama Masaharu" },
  "ふくやままさはる": { kanji: "福山雅治", phonetic: "フクヤマ マサハル", romaji: "Fukuyama Masaharu" },
  "福山雅治": { kanji: "福山雅治", phonetic: "フクヤマ マサハル", romaji: "Fukuyama Masaharu" },

  // Yokohama Ryusei
  "yokohama_ryuusei": { kanji: "横浜流星", phonetic: "ヨコハマ リュウセイ", romaji: "Yokohama Ryusei" },
  "よこはまりゅうせい": { kanji: "横浜流星", phonetic: "ヨコハマ リュウセイ", romaji: "Yokohama Ryusei" },
  "横浜流星": { kanji: "横浜流星", phonetic: "ヨコハマ リュウセイ", romaji: "Yokohama Ryusei" },

  // Nakamura Kazuha
  "nakamura_kazuha": { kanji: "中村一葉", phonetic: "ナカムラ カズハ", romaji: "Nakamura Kazuha" },
  "なかむらかずは": { kanji: "中村一葉", phonetic: "ナカムラ カズハ", romaji: "Nakamura Kazuha" },
  "中村一葉": { kanji: "中村一葉", phonetic: "ナカムラ カズハ", romaji: "Nakamura Kazuha" },

  // Watanabe Haruto
  "watanabe_haruto": { kanji: "渡辺温斗", phonetic: "ワタナベ ハルト", romaji: "Watanabe Haruto" },
  "わたなべはると": { kanji: "渡辺温斗", phonetic: "ワタナベ ハルト", romaji: "Watanabe Haruto" },
  "渡辺温斗": { kanji: "渡辺温斗", phonetic: "ワタナベ ハルト", romaji: "Watanabe Haruto" },

  // Hokazono Iroha
  "hokazono_iroha": { kanji: "外園いろは", phonetic: "ホカゾノ イロハ", romaji: "Hokazono Iroha" },
  "ほかぞのいろは": { kanji: "外園いろは", phonetic: "ホカゾノ イロハ", romaji: "Hokazono Iroha" },
  "外園いろは": { kanji: "外園いろは", phonetic: "ホカゾノ イロハ", romaji: "Hokazono Iroha" },

  // Ishihara Satomi
  "ishihara_satomi": { kanji: "石原さとみ", phonetic: "イシハラ サトミ", romaji: "Ishihara Satomi" },
  "いしはらさとみ": { kanji: "石原さとみ", phonetic: "イシハラ サトミ", romaji: "Ishihara Satomi" },
  "石原さとみ": { kanji: "石原さとみ", phonetic: "イシハラ サトミ", romaji: "Ishihara Satomi" },

  // Haiku
  "haiku": { kanji: "俳句", phonetic: "ハイク", romaji: "Haiku" },
  "はいく": { kanji: "俳句", phonetic: "ハイク", romaji: "Haiku" },
  "俳句": { kanji: "俳句", phonetic: "ハイク", romaji: "Haiku" },

  // Hanabi
  "hanabi": { kanji: "花火", phonetic: "ハナビ", romaji: "Hanabi" },
  "はなび": { kanji: "花火", phonetic: "ハナビ", romaji: "Hanabi" },
  "花火": { kanji: "花火", phonetic: "ハナビ", romaji: "Hanabi" },

  // Senkouhanabi
  "senkouhanabi": { kanji: "線香花火", phonetic: "センコウハナビ", romaji: "Senkouhanabi" },
  "せんこうはなび": { kanji: "線香花火", phonetic: "センコウハナビ", romaji: "Senkouhanabi" },
  "線香花火": { kanji: "線香花火", phonetic: "センコウハナビ", romaji: "Senkouhanabi" },

  // Gohan
  "gohan": { kanji: "御飯", phonetic: "ゴハン", romaji: "Gohan" },
  "ごはん": { kanji: "御飯", phonetic: "ゴハン", romaji: "Gohan" },
  "御飯": { kanji: "御飯", phonetic: "ゴハン", romaji: "Gohan" },

  // Haruto
  "haruto": { kanji: "陽翔", phonetic: "ハルト", romaji: "Haruto" },
  "はると": { kanji: "陽翔", phonetic: "ハルト", romaji: "Haruto" },
  "陽翔": { kanji: "陽翔", phonetic: "ハルト", romaji: "Haruto" },

  // Yua
  "yua": { kanji: "結愛", phonetic: "ユア", romaji: "Yua" },
  "ゆあ": { kanji: "結愛", phonetic: "ユア", romaji: "Yua" },
  "結愛": { kanji: "結愛", phonetic: "ユア", romaji: "Yua" },

  // Akira
  "akira": { kanji: "輝", phonetic: "アキラ", romaji: "Akira" },
  "あきら": { kanji: "輝", phonetic: "アキラ", romaji: "Akira" },
  "輝": { kanji: "輝", phonetic: "アキラ", romaji: "Akira" },

  // Ren
  "ren": { kanji: "蓮", phonetic: "レン", romaji: "Ren" },
  "れん": { kanji: "蓮", phonetic: "レン", romaji: "Ren" },
  "蓮": { kanji: "蓮", phonetic: "レン", romaji: "Ren" },

  // Shamisen
  "shamisen": { kanji: "三味線", phonetic: "シャミセン", romaji: "Shamisen" },
  "しゃみせん": { kanji: "三味線", phonetic: "シャミセン", romaji: "Shamisen" },
  "三味線": { kanji: "三味線", phonetic: "シャミセン", romaji: "Shamisen" },

  // Shodou
  "shodou": { kanji: "書道", phonetic: "ショドウ", romaji: "Shodou" },
  "しょどう": { kanji: "書道", phonetic: "ショドウ", romaji: "Shodou" },
  "書道": { kanji: "書道", phonetic: "ショドウ", romaji: "Shodou" },

  // Wagasa
  "wagasa": { kanji: "和傘", phonetic: "ワガサ", romaji: "Wagasa" },
  "わがさ": { kanji: "和傘", phonetic: "ワガサ", romaji: "Wagasa" },
  "和傘": { kanji: "和傘", phonetic: "ワガサ", romaji: "Wagasa" },

  // Furoshiki
  "furoshiki": { kanji: "風呂敷", phonetic: "フロシキ", romaji: "Furoshiki" },
  "ふろしき": { kanji: "風呂敷", phonetic: "フロシキ", romaji: "Furoshiki" },
  "風呂敷": { kanji: "風呂敷", phonetic: "フロシキ", romaji: "Furoshiki" },

  // Soji
  "soji": { kanji: "掃除", phonetic: "ソウジ", romaji: "Soji" },
  "そうじ": { kanji: "掃除", phonetic: "ソウジ", romaji: "Soji" },
  "掃除": { kanji: "掃除", phonetic: "ソウジ", romaji: "Soji" },

  // Kendama
  "kendama": { kanji: "剣玉", phonetic: "ケンダマ", romaji: "Kendama" },
  "けんだま": { kanji: "剣玉", phonetic: "ケンダマ", romaji: "Kendama" },
  "剣玉": { kanji: "剣玉", phonetic: "ケンダマ", romaji: "Kendama" },

  // Soroban
  "soroban": { kanji: "算盤", phonetic: "ソロバン", romaji: "Soroban" },
  "そろばん": { kanji: "算盤", phonetic: "ソロバン", romaji: "Soroban" },
  "算盤": { kanji: "算盤", phonetic: "ソロバン", romaji: "Soroban" },

  // Manekineko
  "manekineko": { kanji: "招き猫", phonetic: "マネキネコ", romaji: "Manekineko" },
  "まねきねこ": { kanji: "招き猫", phonetic: "マネキネコ", romaji: "Manekineko" },
  "招き猫": { kanji: "招き猫", phonetic: "マネキネコ", romaji: "Manekineko" },

  // Tanzaku
  "tanzaku": { kanji: "短冊", phonetic: "タンザク", romaji: "Tanzaku" },
  "たんざく": { kanji: "短冊", phonetic: "タンザク", romaji: "Tanzaku" },
  "短冊": { kanji: "短冊", phonetic: "タンザク", romaji: "Tanzaku" },

  // Obento
  "obento": { kanji: "お弁当", phonetic: "オベントウ", romaji: "Obento" },
  "おべんとう": { kanji: "お弁当", phonetic: "オベントウ", romaji: "Obento" },
  "お弁当": { kanji: "お弁当", phonetic: "オベントウ", romaji: "Obento" },

  // Origami Tsuru
  "origami_tsuru": { kanji: "折鶴", phonetic: "オリヅル", romaji: "Origami Tsuru" },
  "おりづる": { kanji: "折鶴", phonetic: "オリヅル", romaji: "Origami Tsuru" },
  "折鶴": { kanji: "折鶴", phonetic: "オリヅル", romaji: "Origami Tsuru" },
};

export function resolveJapaneseSpeechPayload(
  text: string,
  kanjiHint?: string,
  romajiHint?: string
): { speechText: string; isEnglish: boolean; romajiFallback: string } {
  const cleanText = (text || "").trim();
  const cleanKanji = (kanjiHint || "").trim();

  // If input is purely English/Latin
  if (/^[a-zA-Z\s\.\-\'\,\!\?\(\)]+$/.test(cleanText)) {
    return { speechText: cleanText, isEnglish: true, romajiFallback: cleanText };
  }

  // Check override dictionary
  const key = cleanText.toLowerCase();
  const entry =
    PHONETIC_PRONUNCIATION_MAP[key] ||
    PHONETIC_PRONUNCIATION_MAP[cleanText] ||
    (cleanKanji ? PHONETIC_PRONUNCIATION_MAP[cleanKanji.toLowerCase()] || PHONETIC_PRONUNCIATION_MAP[cleanKanji] : undefined);

  if (entry) {
    return {
      speechText: entry.kanji || entry.phonetic,
      isEnglish: false,
      romajiFallback: entry.romaji || romajiHint || cleanText,
    };
  }

  // If Kanji hint is provided and has Kanji characters, prefer Kanji for Japanese TTS
  if (cleanKanji && /[\u4e00-\u9faf]/.test(cleanKanji)) {
    return {
      speechText: cleanKanji,
      isEnglish: false,
      romajiFallback: romajiHint || cleanText,
    };
  }

  // If text itself has Kanji
  if (/[\u4e00-\u9faf]/.test(cleanText)) {
    return {
      speechText: cleanText,
      isEnglish: false,
      romajiFallback: romajiHint || cleanText,
    };
  }

  // Otherwise convert to phonetic Katakana to prevent "ha" -> "wa" particle confusion
  return {
    speechText: toPhoneticKatakana(cleanText),
    isEnglish: false,
    romajiFallback: romajiHint || cleanText,
  };
}

class RetroAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceType: string = "female"; // "female" | "male" | "child"
  private lastSpeakTime: number = 0;
  private activeFullWordUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  private getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
    if (!this.cachedVoices || this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  private bgmInterval: any = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    // resume if suspended by browser auto-play policy
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    this.updateBgmVolume();
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setVoiceType(type: string) {
    this.voiceType = type;
  }

  getVoiceType(): string {
    return this.voiceType;
  }

  // Speaks an individual kana or syllable instantly with zero lag and optimized brisk rate
  speakKanaInstant(text: string) {
    if (this.isMuted || !text || text.trim() === "") return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const cleanText = text.trim();
        const payload = resolveJapaneseSpeechPayload(cleanText);
        const utterance = new SpeechSynthesisUtterance(payload.speechText);
        utterance.lang = payload.isEnglish ? "en-US" : "ja-JP";
        utterance.rate = payload.isEnglish ? 1.05 : 1.15; // Snappy, crisp and agile response
        utterance.pitch = this.voiceType === "male" ? 0.85 : (this.voiceType === "child" ? 1.35 : 1.05);

        const voices = this.getAvailableVoices();
        let targetVoice = null;
        if (payload.isEnglish) {
          targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        } else {
          targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ja"));
        }

        if (targetVoice) {
          utterance.voice = targetVoice;
          if (targetVoice.lang.toLowerCase().startsWith("en") && !payload.isEnglish) {
            utterance.text = payload.romajiFallback;
            utterance.lang = "en-US";
          }
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Instant kana speech synthesis failed:", err);
      }
    }
  }

  // Speaks Japanese syllable or full word using SpeechSynthesis API (with automatic English detection for English Mode)
  speakJapanese(text: string, cancelActive: boolean = true, kanjiHint?: string, romajiHint?: string) {
    if (this.isMuted || !text || text.trim() === "") return;
    this.lastSpeakTime = Date.now();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const payload = resolveJapaneseSpeechPayload(text, kanjiHint, romajiHint);
        const utterance = new SpeechSynthesisUtterance(payload.speechText);
        utterance.lang = payload.isEnglish ? "en-US" : "ja-JP";
        
        // Custom pitch/rate based on selected speaker gender/type
        if (this.voiceType === "male") {
          utterance.rate = payload.isEnglish ? 1.00 : 1.05; // clear, authoritative cadence
          utterance.pitch = payload.isEnglish ? 0.90 : 0.82; // deeper masculine register
        } else if (this.voiceType === "child") {
          utterance.rate = 1.15; // bouncy and energetic
          utterance.pitch = 1.38; // high-pitched cute anime guide
        } else if (this.voiceType === "alien") {
          utterance.rate = 1.45; // ultra-fast cyber alien
          utterance.pitch = 1.95; // maximum high pitch electronic squeal
        } else if (this.voiceType === "elderly") {
          utterance.rate = 0.85; // steady wise grandpa pace
          utterance.pitch = 0.65; // deep, weathered hoarse quality
        } else {
          // female (default)
          utterance.rate = payload.isEnglish ? 1.05 : 1.12; // snappy, crisp, immediate feedback
          utterance.pitch = payload.isEnglish ? 1.00 : 1.05; // bright, high contrast clarity
        }

        // Try selecting a specific voice package if available
        const voices = this.getAvailableVoices();
        let targetVoice = null;

        if (payload.isEnglish) {
          if (this.voiceType === "male" || this.voiceType === "elderly") {
            targetVoice = voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (lang === "en-us" || lang.startsWith("en")) &&
                (name.includes("male") || name.includes("man") || name.includes("guy") || name.includes("david") || name.includes("mark"));
            });
          } else {
            targetVoice = voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (lang === "en-us" || lang.startsWith("en")) &&
                (name.includes("female") || name.includes("woman") || name.includes("girl") || name.includes("zira") || name.includes("samantha"));
            });
          }
          if (!targetVoice) {
            targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
          }
        } else {
          if (this.voiceType === "male") {
            // Look for male Japanese voices
            targetVoice = voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (lang === "ja-jp" || lang.startsWith("ja")) &&
                (name.includes("ichiro") || name.includes("otoya") || name.includes("male") || name.includes("man") || name.includes("guy"));
            });
          } else if (this.voiceType === "child") {
            // Look for cute / young sounding voices or standard female
            targetVoice = voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (lang === "ja-jp" || lang.startsWith("ja")) &&
                (name.includes("ayumi") || name.includes("haruka") || name.includes("sakura") || name.includes("child") || name.includes("xiaoxiao"));
            });
          } else if (this.voiceType === "alien") {
            // Cosmic / Google-synthesized robotic character voice
            targetVoice = voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (lang === "ja-jp" || lang.startsWith("ja")) && (name.includes("google") || name.includes("natural"));
            });
          } else if (this.voiceType === "elderly") {
            // Elderly can try to find a deep male voice (e.g. Ichiro / Otoya)
            targetVoice = voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (lang === "ja-jp" || lang.startsWith("ja")) &&
                (name.includes("ichiro") || name.includes("otoya") || name.includes("male") || name.includes("keiji"));
            });
          } else {
            // Look for elegant female voices
            targetVoice = voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (lang === "ja-jp" || lang.startsWith("ja")) &&
                (name.includes("kyoko") || name.includes("nanami") || name.includes("female") || name.includes("woman") || name.includes("ayumi"));
            });
          }

          // Fallback to generic Japanese speakers if the customized searches yielded nothing
          if (!targetVoice) {
            targetVoice = voices.find((v) => v.lang === "ja-JP" || v.lang.toLowerCase().startsWith("ja"));
          }
        }

        if (targetVoice) {
          utterance.voice = targetVoice;
          if (targetVoice.lang.toLowerCase().startsWith("en") && !payload.isEnglish) {
            utterance.text = payload.romajiFallback;
            utterance.lang = "en-US";
          }
        }

        if (cancelActive && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          // Give a small setTimeout buffer for Chrome/Safari to safely clear and speak the new utterance
          setTimeout(() => {
            if (!this.isMuted) {
              window.speechSynthesis.speak(utterance);
            }
          }, 15);
        } else {
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.warn("Speech synthesis failed or was interrupted:", err);
      }
    }
  }

  // Speaks the entire completed word IMMEDIATELY with zero delay, hard-canceling any in-flight syllables.
  // Invokes onEnd when the pronunciation has finished playing so the UI does not advance prematurely!
  speakFullWord(text: string, onEnd?: () => void, kanjiHint?: string, romajiHint?: string) {
    if (!text || text.trim() === "") {
      if (onEnd) onEnd();
      return;
    }

    if (this.isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) {
        // When muted or unsupported, provide a natural 600ms grace window before advancing
        setTimeout(() => onEnd(), 600);
      }
      return;
    }

    try {
      // Unpause if suspended by browser auto-play/inactivity policies
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Hard cancel any lingering syllable speech immediately so full word plays instantly!
      window.speechSynthesis.cancel();

      const payload = resolveJapaneseSpeechPayload(text, kanjiHint, romajiHint);
      const utterance = new SpeechSynthesisUtterance(payload.speechText);
      this.activeFullWordUtterance = utterance; // Prevent garbage collection in V8/WebKit engines
      utterance.lang = payload.isEnglish ? "en-US" : "ja-JP";

      if (this.voiceType === "male") {
        utterance.rate = payload.isEnglish ? 1.02 : 1.05;
        utterance.pitch = payload.isEnglish ? 0.90 : 0.82;
      } else if (this.voiceType === "child") {
        utterance.rate = 1.15;
        utterance.pitch = 1.30;
      } else if (this.voiceType === "alien") {
        utterance.rate = 1.35;
        utterance.pitch = 1.80;
      } else if (this.voiceType === "elderly") {
        utterance.rate = 0.85;
        utterance.pitch = 0.65;
      } else {
        utterance.rate = payload.isEnglish ? 1.05 : 1.10;
        utterance.pitch = payload.isEnglish ? 1.00 : 1.02;
      }

      const voices = this.getAvailableVoices();
      let targetVoice = null;
      if (payload.isEnglish) {
        if (this.voiceType === "male" || this.voiceType === "elderly") {
          targetVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "en-us" || lang.startsWith("en")) &&
              (name.includes("male") || name.includes("man") || name.includes("guy") || name.includes("david") || name.includes("mark") || name.includes("daniel"));
          });
        } else {
          targetVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "en-us" || lang.startsWith("en")) &&
              (name.includes("female") || name.includes("woman") || name.includes("girl") || name.includes("zira") || name.includes("samantha"));
          });
        }
        if (!targetVoice) {
          targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        }
      } else {
        if (this.voiceType === "male") {
          targetVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) &&
              (name.includes("ichiro") || name.includes("otoya") || name.includes("male") || name.includes("man") || name.includes("guy"));
          });
        } else if (this.voiceType === "child") {
          targetVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) &&
              (name.includes("ayumi") || name.includes("haruka") || name.includes("sakura") || name.includes("child"));
          });
        } else if (this.voiceType === "elderly") {
          targetVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) &&
              (name.includes("ichiro") || name.includes("otoya") || name.includes("keiji"));
          });
        } else {
          targetVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) &&
              (name.includes("kyoko") || name.includes("nanami") || name.includes("female") || name.includes("woman") || name.includes("ayumi"));
          });
        }
        if (!targetVoice) {
          targetVoice = voices.find((v) => v.lang === "ja-JP" || v.lang.toLowerCase().startsWith("ja"));
        }
      }

      if (targetVoice) {
        utterance.voice = targetVoice;
        if (targetVoice.lang.toLowerCase().startsWith("en") && !payload.isEnglish) {
          utterance.text = payload.romajiFallback;
          utterance.lang = "en-US";
        }
      }

      this.lastSpeakTime = Date.now();

      let hasTriggered = false;
      let safetyWatchdog: any = null;

      const triggerCompletion = () => {
        if (hasTriggered) return;
        hasTriggered = true;
        if (safetyWatchdog) clearTimeout(safetyWatchdog);
        this.activeFullWordUtterance = null;
        if (onEnd) {
          onEnd();
        }
      };

      utterance.onend = () => {
        triggerCompletion();
      };

      utterance.onerror = (e) => {
        console.warn("Full word speech synthesis error/interrupted:", e);
        triggerCompletion();
      };

      // Safety watchdog: ensure callback is always reached even if browser drops onend
      const cleanLen = (payload.speechText || text).length;
      const maxEstimatedMs = Math.min(8000, Math.max(1400, cleanLen * 450 + 1200));
      safetyWatchdog = setTimeout(() => {
        triggerCompletion();
      }, maxEstimatedMs);

      // Immediate play - micro delay (8ms) ensures preceding window.speechSynthesis.cancel() cleanly finishes
      setTimeout(() => {
        if (!this.isMuted) {
          window.speechSynthesis.speak(utterance);
        } else {
          triggerCompletion();
        }
      }, 8);
    } catch (err) {
      console.warn("Full word speech synthesis failed:", err);
      if (onEnd) onEnd();
    }
  }

  // Soft crisp typewriter key click synthesis with wood/metal resonance
  // Accepts optional volume scale or options object for character completion hammer impact
  playTyping(options?: number | { volume?: number; isCompletion?: boolean; pitchMultiplier?: number }) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      let vol = 1.0;
      let isCompletion = false;
      let pitchMod = 1.0;

      if (typeof options === "number") {
        vol = options;
      } else if (options) {
        if (options.volume !== undefined) vol = options.volume;
        if (options.isCompletion !== undefined) isCompletion = options.isCompletion;
        if (options.pitchMultiplier !== undefined) pitchMod = options.pitchMultiplier;
      }

      // Micro-randomization of pitch (±5%) to simulate authentic physical tactile variance between mechanical key levers
      const naturalRandomPitch = pitchMod * (0.95 + Math.random() * 0.10);
      const effectiveVol = isCompletion ? vol * 1.25 : vol;

      const playSingleClick = (timeOffset: number, isSecondary: boolean) => {
        if (!this.ctx) return;
        const clickTime = now + timeOffset;
        const volumeMultiplier = (isSecondary ? 0.75 : 1.0) * effectiveVol;
        const pitchMultiplier = (isSecondary ? 1.15 : 1.0) * naturalRandomPitch;

        // 1. Bottom-out mechanical thud (the "clack" base)
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thudOsc.type = "sine";
        thudOsc.frequency.setValueAtTime((isCompletion ? 180 : 160) * pitchMultiplier, clickTime);
        thudOsc.frequency.exponentialRampToValueAtTime(75, clickTime + 0.035);
        thudGain.gain.setValueAtTime(0.14 * volumeMultiplier, clickTime);
        thudGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.035);
        
        thudOsc.connect(thudGain);
        thudGain.connect(this.ctx.destination);
        thudOsc.start(clickTime);
        thudOsc.stop(clickTime + 0.04);

        // 2. Sharp mechanical metal contact click
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = "triangle";
        // Mechanical switch click frequency is usually around 2000-3000 Hz, decaying extremely fast (10-15ms)
        clickOsc.frequency.setValueAtTime((isCompletion ? 2800 : 2500) * pitchMultiplier, clickTime);
        clickOsc.frequency.exponentialRampToValueAtTime(600, clickTime + 0.015);
        
        clickGain.gain.setValueAtTime(0.18 * volumeMultiplier, clickTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.015);
        
        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        clickOsc.start(clickTime);
        clickOsc.stop(clickTime + 0.02);

        // 3. Resonant spring metallic noise burst
        const bufferSize = this.ctx.sampleRate * 0.015; // 15ms burst
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = isSecondary ? 4200 : 3600; // High frequency metallic resonance
        filter.Q.value = 6.0; // Sharp filter Q for high click resonance

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.09 * volumeMultiplier, clickTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.012);

        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        
        noiseNode.start(clickTime);
        noiseNode.stop(clickTime + 0.015);
      };

      // Play the "Ka" (咔)
      playSingleClick(0, false);
      
      // Play the "Ta" (哒) with a very slight delay (22ms) to emulate mechanical typewriter rebound friction
      playSingleClick(0.022, true);

      // If character completed, add authentic typewriter platen hammer impact ("Tok")
      if (isCompletion) {
        const hammerTime = now + 0.036;
        const hammerOsc = this.ctx.createOscillator();
        const hammerGain = this.ctx.createGain();
        hammerOsc.type = "sine";
        hammerOsc.frequency.setValueAtTime(320 * naturalRandomPitch, hammerTime);
        hammerOsc.frequency.exponentialRampToValueAtTime(110, hammerTime + 0.025);
        hammerGain.gain.setValueAtTime(0.13 * effectiveVol, hammerTime);
        hammerGain.gain.exponentialRampToValueAtTime(0.001, hammerTime + 0.03);
        hammerOsc.connect(hammerGain);
        hammerGain.connect(this.ctx.destination);
        hammerOsc.start(hammerTime);
        hammerOsc.stop(hammerTime + 0.035);
      }

    } catch (e) {
      // Fallback simple beep to guarantee no crashes
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(750, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
      } catch (err) {}
    }
  }

  // Vintage Desk Typewriter margin bell "Ding!"
  playTypewriterBell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // High-pitched crystal clear bell resonance
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(2637.02, now); // E7 high chime
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(3135.96, now); // G7 harmonics
      
      bellGain.gain.setValueAtTime(0, now);
      bellGain.gain.linearRampToValueAtTime(0.18, now + 0.005);
      bellGain.gain.exponentialRampToValueAtTime(0.06, now + 0.06);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.connect(bellGain);
      osc2.connect(bellGain);
      bellGain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {
      this.playCharacterResolved();
    }
  }

  // Mechanical carriage return "whir-clack-zing" when cards are flipped
  playCarriageReturn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // 1. Spring tension release swept sound ("Zing")
      const sweepOsc = this.ctx.createOscillator();
      const sweepGain = this.ctx.createGain();
      sweepOsc.type = "triangle";
      sweepOsc.frequency.setValueAtTime(150, now);
      sweepOsc.frequency.exponentialRampToValueAtTime(650, now + 0.16);
      
      sweepGain.gain.setValueAtTime(0.06, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      
      sweepOsc.connect(sweepGain);
      sweepGain.connect(this.ctx.destination);
      sweepOsc.start(now);
      sweepOsc.stop(now + 0.2);

      // 2. Carriage slide mechanical impact ("Clack")
      const impactOsc = this.ctx.createOscillator();
      const impactGain = this.ctx.createGain();
      impactOsc.type = "sawtooth";
      impactOsc.frequency.setValueAtTime(80, now + 0.15);
      
      impactGain.gain.setValueAtTime(0, now);
      impactGain.gain.setValueAtTime(0.12, now + 0.15);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
      
      impactOsc.connect(impactGain);
      impactGain.connect(this.ctx.destination);
      impactOsc.start(now + 0.14);
      impactOsc.stop(now + 0.22);
    } catch (e) {
      this.playCardSlide();
    }
  }

  // Gentle pop when complete single character is resolved
  playCharacterResolved() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Classic low buzzer sound for wrong key typed
  playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Retro 8-bit coin pickup sound effect (B5 then E6 rapid arpeggio)
  playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  // Joyous retro arcade chord fanfare for completing the entire word spelling!
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.07 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  }

  // Retro alarm sound for training session complete
  playTimeCompleted() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 698.46, 880.00, 1174.66, 1396.91];

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + index * 0.1 + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + index * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.35);
    });
  }

  // Whoosh slider / card sliding sound effect using audio synthesizer
  playCardSlide() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Procedural Zen environment pad and wind-chimes synthesizer
  startAmbientBGM() {
    if (this.isBgmPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.isBgmPlaying = true;

    try {
      const now = this.ctx.currentTime;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0, now);
      // Very soft background atmospheric level (0.02 volume)
      this.droneGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.02, now + 2);
      this.droneGain.connect(this.ctx.destination);

      // Low frequency calming chord: 110Hz (A2) and 165Hz (E3)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = "sine";
      this.droneOsc1.frequency.setValueAtTime(110.00, now);
      this.droneOsc1.connect(this.droneGain);

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(165.00, now);
      this.droneOsc2.connect(this.droneGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // Periodic gentle Japanese pentatonic wind chimes (C5, D5, E5, G5, A5, C6)
      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const playChime = () => {
        if (!this.ctx || this.isMuted || !this.isBgmPlaying) return;
        try {
          const chimeOsc = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();

          chimeOsc.type = "sine";
          const randomNote = pentatonic[Math.floor(Math.random() * pentatonic.length)];
          chimeOsc.frequency.setValueAtTime(randomNote, this.ctx.currentTime);

          chimeGain.gain.setValueAtTime(0, this.ctx.currentTime);
          chimeGain.gain.linearRampToValueAtTime(0.012, this.ctx.currentTime + 1.2);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.8);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(this.ctx.destination);

          chimeOsc.start();
          chimeOsc.stop(this.ctx.currentTime + 5.0);
        } catch (e) {}
      };

      playChime();
      this.bgmInterval = setInterval(playChime, 4500);
    } catch (e) {
      console.error("Failed to compile ambient music:", e);
    }
  }

  stopAmbientBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }

    const fadeOutAndStop = (osc: OscillatorNode | null, gain: GainNode | null) => {
      if (!this.ctx || !osc || !gain) return;
      try {
        const now = this.ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        }, 500);
      } catch (err) {}
    };

    fadeOutAndStop(this.droneOsc1, this.droneGain);
    fadeOutAndStop(this.droneOsc2, this.droneGain);
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
  }

  updateBgmVolume() {
    if (!this.droneGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.02, now + 0.5);
    } catch (e) {}
  }
}

export const audioSynth = new RetroAudioSynth();
