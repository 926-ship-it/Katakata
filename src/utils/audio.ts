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
  romajiHint?: string,
  langHint?: "ja" | "es" | "en"
): { speechText: string; isEnglish: boolean; isSpanish: boolean; lang: string; romajiFallback: string } {
  const cleanText = (text || "").trim();
  const cleanKanji = (kanjiHint || "").trim();

  // Explicit Spanish mode or Spanish accented characters
  if (langHint === "es" || /[áéíóúÁÉÍÓÚñÑüÜ¡¿]/.test(cleanText)) {
    const ttsClean = cleanText.replace(/^[¡¿\s]+|[!?\s]+$/g, "").trim() || cleanText;
    return {
      speechText: ttsClean,
      isEnglish: false,
      isSpanish: true,
      lang: "es-ES",
      romajiFallback: ttsClean,
    };
  }

  // Explicit English or Latin characters
  if (langHint === "en" || /^[a-zA-Z0-9\s\.\-\'\,\!\?\(\)]+$/.test(cleanText)) {
    return {
      speechText: cleanText,
      isEnglish: true,
      isSpanish: false,
      lang: "en-US",
      romajiFallback: cleanText,
    };
  }

  // Check override dictionary for Japanese words
  const key = cleanText.toLowerCase();
  const entry =
    PHONETIC_PRONUNCIATION_MAP[key] ||
    PHONETIC_PRONUNCIATION_MAP[cleanText] ||
    (cleanKanji ? PHONETIC_PRONUNCIATION_MAP[cleanKanji.toLowerCase()] || PHONETIC_PRONUNCIATION_MAP[cleanKanji] : undefined);

  if (entry) {
    return {
      // Strictly phonetic Katakana - NEVER raw Kanji, which browser TTS might read in Chinese!
      speechText: entry.phonetic,
      isEnglish: false,
      isSpanish: false,
      lang: "ja-JP",
      romajiFallback: entry.romaji || romajiHint || cleanText,
    };
  }

  // Convert Hiragana to Katakana to prevent "ha" -> "wa" particle confusion and Chinese reading
  const katakanaText = toPhoneticKatakana(cleanText);

  // If text does not contain Kanji, phonetic Katakana is 100% unambiguous Japanese
  if (!/[\u4e00-\u9faf]/.test(katakanaText)) {
    return {
      speechText: katakanaText,
      isEnglish: false,
      isSpanish: false,
      lang: "ja-JP",
      romajiFallback: romajiHint || cleanText,
    };
  }

  // If cleanText contained Kanji and we have romajiHint or cleanKanji
  return {
    speechText: katakanaText,
    isEnglish: false,
    isSpanish: false,
    lang: "ja-JP",
    romajiFallback: romajiHint || cleanText,
  };
}

export type TypingSoundStyle = "crisp" | "typewriter" | "bubble" | "soft";

class RetroAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceType: string = "female"; // "female" | "male" | "child"
  private speechRate: number = 1.0; // 0.8 | 1.0 | 1.25 | 1.5 | 1.75 | 2.0
  private lastSpeakTime: number = 0;
  private activeFullWordUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private activeOnlineAudio: HTMLAudioElement | null = null;
  private currentSpeechId: number = 0;
  private typingSoundStyle: TypingSoundStyle = "crisp";

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const savedRate = localStorage.getItem("fifty_sound_speech_rate");
        if (savedRate) {
          const parsed = parseFloat(savedRate);
          if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2.5) {
            this.speechRate = parsed;
          }
        }
        const savedStyle = localStorage.getItem("typing_sound_style") as TypingSoundStyle;
        if (savedStyle && ["crisp", "typewriter", "bubble", "soft"].includes(savedStyle)) {
          this.typingSoundStyle = savedStyle;
        }
      } catch (_) {}

      if ("speechSynthesis" in window) {
        try {
          const syncVoices = () => {
            try {
              const v = window.speechSynthesis.getVoices();
              if (v && v.length > 0) {
                this.cachedVoices = v;
              }
            } catch (_) {}
          };
          syncVoices();
          window.speechSynthesis.addEventListener("voiceschanged", syncVoices);
          setTimeout(syncVoices, 100);
          setTimeout(syncVoices, 500);
          setTimeout(syncVoices, 1500);

          // User interaction unblocker for SpeechSynthesis in iframe / strict policy environments
          const unlockSpeech = () => {
            try {
              if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
              }
            } catch (_) {}
          };
          window.addEventListener("click", unlockSpeech, { passive: true });
          window.addEventListener("keydown", unlockSpeech, { passive: true });
          window.addEventListener("touchstart", unlockSpeech, { passive: true });
        } catch (_) {}
      }
    }
  }

  // Hard cancels any in-flight speech from all audio engines (SpeechSynthesis + HTML5 Audio)
  // Ensures zero audio overlaps or duplicate voices!
  stopAllSpeech() {
    this.currentSpeechId++;
    if (this.activeOnlineAudio) {
      try {
        this.activeOnlineAudio.pause();
        this.activeOnlineAudio.currentTime = 0;
        this.activeOnlineAudio.src = "";
      } catch (_) {}
      this.activeOnlineAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    this.activeFullWordUtterance = null;
    if (typeof window !== "undefined") {
      (window as any).__katakata_utterance = null;
    }
  }

  setTypingSoundStyle(style: TypingSoundStyle) {
    this.typingSoundStyle = style;
    try {
      localStorage.setItem("typing_sound_style", style);
    } catch (_) {}
  }

  getTypingSoundStyle(): TypingSoundStyle {
    return this.typingSoundStyle;
  }

  // Plays human pronunciation using online dictionary audio endpoint with HTML5 Audio element
  // Works reliably across iframes and mobile webviews where native SpeechSynthesis might be restricted
  playOnlineTTSAudio(
    text: string,
    langHint: "ja" | "es" | "en",
    onEnd?: () => void
  ): boolean {
    if (this.isMuted || typeof window === "undefined") {
      if (onEnd) onEnd();
      return false;
    }

    // Stop any existing speech first to avoid overlapping voices!
    this.stopAllSpeech();
    const requestId = this.currentSpeechId;

    try {
      const clean = encodeURIComponent((text || "").trim().replace(/[¡¿\?!]/g, ""));
      if (!clean) {
        if (onEnd) onEnd();
        return false;
      }

      let audioUrl = "";
      if (langHint === "es") {
        audioUrl = `https://dict.youdao.com/dictvoice?le=spa&audio=${clean}`;
      } else if (langHint === "en") {
        audioUrl = `https://dict.youdao.com/dictvoice?type=2&audio=${clean}`;
      } else {
        audioUrl = `https://dict.youdao.com/dictvoice?le=jap&audio=${clean}`;
      }

      const audio = new Audio(audioUrl);
      this.activeOnlineAudio = audio;
      audio.playbackRate = Math.max(0.8, Math.min(1.3, this.speechRate));
      
      let triggered = false;
      const finish = () => {
        if (!triggered && this.currentSpeechId === requestId) {
          triggered = true;
          if (this.activeOnlineAudio === audio) {
            this.activeOnlineAudio = null;
          }
          if (onEnd) onEnd();
        }
      };

      audio.onended = finish;
      audio.onerror = () => {
        if (this.currentSpeechId === requestId) {
          // If online audio network fails, fallback to synthesized resonant vocal chime
          this.playPhoneticVocalChime(text, finish);
        }
      };

      // Safeguard watchdog: don't hang if audio takes too long to load
      setTimeout(() => {
        if (!triggered && this.currentSpeechId === requestId) {
          finish();
        }
      }, 3500);

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          if (this.currentSpeechId === requestId) {
            this.playPhoneticVocalChime(text, finish);
          }
        });
      }
      return true;
    } catch (_) {
      this.playPhoneticVocalChime(text, onEnd);
      return false;
    }
  }

  // Synthesizes pleasant acoustic harmonic vocal chimes using Web Audio API
  // Guaranteed zero-silence fallback that works 100% offline without any external services
  playPhoneticVocalChime(text: string, onEnd?: () => void) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }
    this.init();
    if (!this.ctx) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const seed = (text || "word").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const baseFreq = 260 + (seed % 140);
      const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Warm major triad

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);
        gain.gain.setValueAtTime(0.09, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.40);
      });

      setTimeout(() => {
        if (onEnd) onEnd();
      }, 420);
    } catch (_) {
      if (onEnd) onEnd();
    }
  }

  private getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
    try {
      const current = window.speechSynthesis.getVoices();
      if (current && current.length > 0) {
        this.cachedVoices = current;
      }
    } catch (_) {}
    return this.cachedVoices || [];
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

  setSpeechRate(rate: number) {
    if (rate >= 0.5 && rate <= 2.5) {
      this.speechRate = rate;
      try {
        localStorage.setItem("fifty_sound_speech_rate", String(rate));
      } catch (_) {}
    }
  }

  getSpeechRate(): number {
    return this.speechRate;
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
        const baseRate = payload.isEnglish ? 1.08 : 1.18; // Snappy, crisp and agile response
        utterance.rate = Math.min(2.5, Math.max(0.5, baseRate * this.speechRate));
        utterance.pitch = this.voiceType === "male" ? 0.85 : (this.voiceType === "child" ? 1.35 : 1.05);

        const voices = this.getAvailableVoices();
        let targetVoice = null;
        if (payload.isEnglish) {
          targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        } else {
          targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ja"));
        }

        if (targetVoice) {
          if (targetVoice.lang.toLowerCase().startsWith("zh") || targetVoice.name.toLowerCase().includes("chinese")) {
            this.playOnlineTTSAudio(payload.speechText, payload.isEnglish ? "en" : "ja");
            return;
          }
          utterance.voice = targetVoice;
          if (targetVoice.lang.toLowerCase().startsWith("en") && !payload.isEnglish) {
            utterance.text = payload.romajiFallback;
            utterance.lang = "en-US";
          }
          window.speechSynthesis.speak(utterance);
        } else {
          // If no authentic native voice exists, NEVER fall back to system default (which is Chinese on many devices)!
          this.playOnlineTTSAudio(payload.speechText, payload.isEnglish ? "en" : "ja");
        }
      } catch (err) {
        console.warn("Instant kana speech synthesis failed:", err);
      }
    }
  }

  // Speaks Japanese syllable or full word using SpeechSynthesis API (with automatic English detection for English Mode)
  speakJapanese(text: string, cancelActive: boolean = true, kanjiHint?: string, romajiHint?: string) {
    this.speakFullWord(text, undefined, kanjiHint, romajiHint, "ja");
  }

  // Speaks Spanish word with authentic native cadence and accent support
  speakSpanish(text: string, onEnd?: () => void) {
    this.speakFullWord(text, onEnd, undefined, undefined, "es");
  }

  // Speaks English word with native pronunciation
  speakEnglish(text: string, onEnd?: () => void) {
    this.speakFullWord(text, onEnd, undefined, undefined, "en");
  }

  // Speaks the entire completed word IMMEDIATELY with zero delay, hard-canceling any in-flight syllables.
  // Invokes onEnd when the pronunciation has finished playing so the UI does not advance prematurely!
  speakFullWord(
    text: string,
    onEnd?: () => void,
    kanjiHint?: string,
    romajiHint?: string,
    langHint?: "ja" | "es" | "en"
  ) {
    if (!text || text.trim() === "") {
      if (onEnd) onEnd();
      return;
    }

    if (this.isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) {
        // When muted or unsupported, provide a natural 400ms grace window before advancing
        setTimeout(() => onEnd(), 400);
      }
      return;
    }

    try {
      // Unpause if suspended by browser auto-play/inactivity policies
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Record whether speech was active so we can clear on microtask if needed
      const wasSpeaking = window.speechSynthesis.speaking;
      if (wasSpeaking) {
        window.speechSynthesis.cancel();
      }

      const payload = resolveJapaneseSpeechPayload(text, kanjiHint, romajiHint, langHint);
      const voices = this.getAvailableVoices();
      let targetVoice: SpeechSynthesisVoice | null = null;
      let spokenText = payload.speechText;
      let spokenLang = payload.lang;

      if (payload.isSpanish) {
        // Robust Spanish voice lookup: check language tag variants and voice names
        targetVoice =
          voices.find((v) => {
            const lang = (v.lang || "").toLowerCase().replace("_", "-");
            return (
              lang.startsWith("es-") ||
              lang === "es" ||
              lang.startsWith("spa")
            );
          }) ||
          voices.find((v) => {
            const name = (v.name || "").toLowerCase();
            return (
              name.includes("spanish") ||
              name.includes("español") ||
              name.includes("castellano") ||
              name.includes("helena") ||
              name.includes("laura") ||
              name.includes("pablo") ||
              name.includes("sabina") ||
              name.includes("monica") ||
              name.includes("jorge")
            );
          }) ||
          null;

        if (targetVoice) {
          spokenLang = targetVoice.lang || "es-ES";
        } else {
          // If no Spanish voice is installed in the client OS, NEVER fall back to Chinese or default OS voice!
          // Try a clean English voice if available, otherwise IMMEDIATELY use authentic Spanish online audio!
          const englishVoice = voices.find((v) => {
            const lang = (v.lang || "").toLowerCase().replace("_", "-");
            return lang.startsWith("en-") || lang === "en";
          });

          if (englishVoice && !englishVoice.lang.toLowerCase().startsWith("zh")) {
            targetVoice = englishVoice;
            spokenLang = englishVoice.lang || "en-US";
          } else {
            // Immediately use authentic online human Spanish pronunciation!
            this.playOnlineTTSAudio(text, "es", onEnd);
            return;
          }
        }
      } else if (payload.isEnglish) {
        // English voice lookup
        if (this.voiceType === "male" || this.voiceType === "elderly") {
          targetVoice =
            voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (
                (lang === "en-us" || lang.startsWith("en")) &&
                (name.includes("male") || name.includes("man") || name.includes("guy") || name.includes("david") || name.includes("mark") || name.includes("daniel"))
              );
            }) || null;
        } else {
          targetVoice =
            voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (
                (lang === "en-us" || lang.startsWith("en")) &&
                (name.includes("female") || name.includes("woman") || name.includes("girl") || name.includes("zira") || name.includes("samantha"))
              );
            }) || null;
        }
        if (!targetVoice) {
          targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en")) || null;
        }

        if (!targetVoice) {
          // No English voice: immediately use authentic English online audio!
          this.playOnlineTTSAudio(text, "en", onEnd);
          return;
        }
      } else {
        // Japanese voice lookup
        if (this.voiceType === "male") {
          targetVoice =
            voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (
                (lang === "ja-jp" || lang.startsWith("ja")) &&
                (name.includes("ichiro") || name.includes("otoya") || name.includes("male") || name.includes("man") || name.includes("guy"))
              );
            }) || null;
        } else if (this.voiceType === "child") {
          targetVoice =
            voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (
                (lang === "ja-jp" || lang.startsWith("ja")) &&
                (name.includes("ayumi") || name.includes("haruka") || name.includes("sakura") || name.includes("child"))
              );
            }) || null;
        } else if (this.voiceType === "elderly") {
          targetVoice =
            voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (
                (lang === "ja-jp" || lang.startsWith("ja")) &&
                (name.includes("ichiro") || name.includes("otoya") || name.includes("keiji"))
              );
            }) || null;
        } else {
          targetVoice =
            voices.find((v) => {
              const name = v.name.toLowerCase();
              const lang = v.lang.toLowerCase();
              return (
                (lang === "ja-jp" || lang.startsWith("ja")) &&
                (name.includes("kyoko") || name.includes("nanami") || name.includes("female") || name.includes("woman") || name.includes("ayumi"))
              );
            }) || null;
        }

        if (!targetVoice) {
          targetVoice = voices.find((v) => v.lang === "ja-JP" || v.lang.toLowerCase().startsWith("ja")) || null;
        }

        // CRITICAL ANTI-CHINESE AUDIO PROTECTION:
        // If the client system lacks a genuine Japanese voice, NEVER read in Chinese!
        // Immediately trigger authentic native Japanese online audio!
        if (!targetVoice) {
          this.playOnlineTTSAudio(text, "ja", onEnd);
          return;
        }
      }

      const langCategory: "ja" | "es" | "en" = payload.isSpanish ? "es" : payload.isEnglish ? "en" : "ja";

      // Safeguard: NEVER allow a Chinese voice to speak non-Chinese words!
      if (targetVoice && (targetVoice.lang.toLowerCase().startsWith("zh") || targetVoice.name.toLowerCase().includes("chinese"))) {
        this.playOnlineTTSAudio(text, langCategory, onEnd);
        return;
      }

      this.stopAllSpeech();
      const requestId = this.currentSpeechId;

      let hasStarted = false;
      let hasTriggered = false;
      let safetyWatchdog: any = null;

      const triggerCompletion = () => {
        if (hasTriggered || this.currentSpeechId !== requestId) return;
        hasTriggered = true;
        if (safetyWatchdog) clearTimeout(safetyWatchdog);
        this.activeFullWordUtterance = null;
        if (typeof window !== "undefined") {
          (window as any).__katakata_utterance = null;
        }
        if (onEnd) {
          onEnd();
        }
      };

      // Safety watchdog: ensure callback is always reached even if speech is slow
      const cleanLen = spokenText.length;
      const maxEstimatedMs = Math.min(10000, Math.max(2800, (cleanLen * 450 + 1500) / this.speechRate));
      safetyWatchdog = setTimeout(() => {
        triggerCompletion();
      }, maxEstimatedMs);

      // Voice pitch and rate customization
      let baseRate = 1.12;
      let targetPitch = 1.0;
      if (payload.isSpanish) {
        baseRate = 1.15;
        targetPitch = this.voiceType === "male" ? 0.92 : 1.05;
      } else if (this.voiceType === "male") {
        baseRate = payload.isEnglish ? 1.02 : 1.08;
        targetPitch = payload.isEnglish ? 0.90 : 0.82;
      } else if (this.voiceType === "child") {
        baseRate = 1.18;
        targetPitch = 1.30;
      } else if (this.voiceType === "alien") {
        baseRate = 1.45;
        targetPitch = 1.80;
      } else if (this.voiceType === "elderly") {
        baseRate = 0.88;
        targetPitch = 0.65;
      } else {
        baseRate = payload.isEnglish ? 1.08 : 1.15;
        targetPitch = payload.isEnglish ? 1.00 : 1.02;
      }

      const effectiveRate = Math.min(2.5, Math.max(0.5, baseRate * this.speechRate));

      const attemptNativeSpeak = (attempt: number) => {
        if (hasTriggered || this.isMuted || this.currentSpeechId !== requestId) return;

        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }

          // Always construct a FRESH utterance instance for every attempt
          const freshUtterance = new SpeechSynthesisUtterance(spokenText);
          freshUtterance.lang = spokenLang;
          if (targetVoice) {
            freshUtterance.voice = targetVoice;
          }
          freshUtterance.rate = effectiveRate;
          freshUtterance.pitch = targetPitch;

          freshUtterance.onstart = () => {
            hasStarted = true;
          };

          freshUtterance.onend = () => {
            triggerCompletion();
          };

          freshUtterance.onerror = (e) => {
            console.warn(`Speech synthesis notice (attempt ${attempt}):`, e);

            // If interrupted before speech even started and attempts remain, retry with fresh utterance
            if (!hasStarted && attempt < 2 && this.currentSpeechId === requestId) {
              setTimeout(() => {
                attemptNativeSpeak(attempt + 1);
              }, 75);
              return;
            }

            // If native speech fails, gracefully fall back to online audio player with single voice
            if (!hasStarted && !hasTriggered && this.currentSpeechId === requestId) {
              this.playOnlineTTSAudio(text, langCategory, triggerCompletion);
            } else {
              triggerCompletion();
            }
          };

          this.activeFullWordUtterance = freshUtterance;
          if (typeof window !== "undefined") {
            (window as any).__katakata_utterance = freshUtterance;
          }
          this.lastSpeakTime = Date.now();

          window.speechSynthesis.speak(freshUtterance);
        } catch (err) {
          console.warn("Exception during native speak:", err);
          if (!hasStarted && !hasTriggered && this.currentSpeechId === requestId) {
            this.playOnlineTTSAudio(text, langCategory, triggerCompletion);
          } else {
            triggerCompletion();
          }
        }
      };

      if (wasSpeaking) {
        setTimeout(() => attemptNativeSpeak(0), 65);
      } else {
        attemptNativeSpeak(0);
      }
    } catch (err) {
      console.warn("Full word speech synthesis failed:", err);
      const langCategory: "ja" | "es" | "en" = langHint === "es" ? "es" : langHint === "en" ? "en" : "ja";
      this.playOnlineTTSAudio(text, langCategory, onEnd);
    }
  }

  // Ultra-crisp tactile mechanical keyboard sound synthesis
  // Eliminates muffled low-frequency bass mud (no 75Hz boomy thuds!)
  // Delivers bright, tactile, satisfying mechanical switch actuation (青轴/白轴/打字机)
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

      // Natural acoustic micro-randomization (±4%)
      const naturalPitch = pitchMod * (0.98 + Math.random() * 0.04);
      const effectiveVol = isCompletion ? Math.min(1.4, vol * 1.25) : vol;

      if (this.typingSoundStyle === "bubble") {
        // Crisp gentle water droplet / bubble pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime((isCompletion ? 950 : 780) * naturalPitch, now);
        osc.frequency.exponentialRampToValueAtTime(isCompletion ? 1800 : 1550, now + 0.035);
        gain.gain.setValueAtTime(0.12 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        return;
      }

      if (this.typingSoundStyle === "soft") {
        // Soft dampened tactile switch (quiet, pleasant, non-intrusive)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1400 * naturalPitch, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.012);
        gain.gain.setValueAtTime(0.09 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.015);
        return;
      }

      if (this.typingSoundStyle === "typewriter") {
        // Vintage typewriter metal typebar strike
        const metalOsc = this.ctx.createOscillator();
        const metalGain = this.ctx.createGain();
        metalOsc.type = "triangle";
        metalOsc.frequency.setValueAtTime((isCompletion ? 4500 : 3900) * naturalPitch, now);
        metalOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.015);
        metalGain.gain.setValueAtTime(0.16 * effectiveVol, now);
        metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
        metalOsc.connect(metalGain);
        metalGain.connect(this.ctx.destination);
        metalOsc.start(now);
        metalOsc.stop(now + 0.018);

        // Subtle spring rebound
        const ringOsc = this.ctx.createOscillator();
        const ringGain = this.ctx.createGain();
        ringOsc.type = "sine";
        ringOsc.frequency.setValueAtTime(5200 * naturalPitch, now + 0.003);
        ringGain.gain.setValueAtTime(0.06 * effectiveVol, now + 0.003);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        ringOsc.connect(ringGain);
        ringGain.connect(this.ctx.destination);
        ringOsc.start(now + 0.003);
        ringOsc.stop(now + 0.05);
        return;
      }

      // --- DEFAULT: ULTRA-CRISP MECHANICAL SWITCH (清脆青轴 / Kailh Box White) ---
      // 1. High-frequency metallic switch contact leaf click (3800Hz -> 1800Hz, 11ms)
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime((isCompletion ? 4200 : 3800) * naturalPitch, now);
      clickOsc.frequency.exponentialRampToValueAtTime(1600, now + 0.011);
      clickGain.gain.setValueAtTime(0.18 * effectiveVol, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.011);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.014);

      // 2. Tactile actuation snap (Bandpass filtered white noise burst at 4800Hz, crisp & snappy)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.012);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = isCompletion ? 5400 : 4800;
      filter.Q.value = 7.5; // High Q for crisp, metallic mechanical actuation snap
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.14 * effectiveVol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.010);
      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseNode.start(now);
      noiseNode.stop(now + 0.012);

      // 3. Crisp plate contact (650Hz -> 380Hz, 8ms, absolutely zero 75Hz muffled sub-bass!)
      const plateOsc = this.ctx.createOscillator();
      const plateGain = this.ctx.createGain();
      plateOsc.type = "sine";
      plateOsc.frequency.setValueAtTime((isCompletion ? 750 : 640) * naturalPitch, now);
      plateOsc.frequency.exponentialRampToValueAtTime(320, now + 0.009);
      plateGain.gain.setValueAtTime(0.035 * effectiveVol, now);
      plateGain.gain.exponentialRampToValueAtTime(0.001, now + 0.009);
      plateOsc.connect(plateGain);
      plateGain.connect(this.ctx.destination);
      plateOsc.start(now);
      plateOsc.stop(now + 0.011);

      // 4. If completing word segment, add crisp high chime harmonic
      if (isCompletion) {
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chimeOsc.type = "sine";
        chimeOsc.frequency.setValueAtTime(1760 * naturalPitch, now + 0.004); // A6 bright ping
        chimeGain.gain.setValueAtTime(0.07 * effectiveVol, now + 0.004);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chimeOsc.start(now + 0.004);
        chimeOsc.stop(now + 0.08);
      }
    } catch (e) {
      // Fallback simple beep to guarantee no crashes
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
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

  // Delicate retro arcade chime for completing word spelling (quick & non-intrusive so voice is never occluded)
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.035, now + idx * 0.035 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.14);
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
