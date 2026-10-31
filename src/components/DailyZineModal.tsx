import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Copy, Check, RefreshCw, Heart, Calendar, Award, Share2, Volume2 } from "lucide-react";
import { audioSynth } from "../utils/audio";
import { getDailyGoal } from "../utils/dailyGoal";
import { 
  PearlString, 
  GirlhoodUmbrella, 
  DessertPlateDoodle, 
  HandDrawnPencil, 
  PencilSquiggleUnderline,
  ScallopLaceTrim
} from "./AestheticDoodles";

interface DailyZineModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEnglishMode?: boolean;
}

const DAILY_QUOTES: {
  lang: "ja" | "es" | "en" | "fr" | "it";
  langName: string;
  flag: string;
  original: string;
  zh: string;
  en: string;
  author: string;
}[] = [
  // 🇪🇸 Español (Spanish)
  {
    lang: "es",
    langName: "Español",
    flag: "🇪🇸",
    original: "Cada día es una nueva oportunidad para florecer.",
    zh: "每一天都是崭新绽放的奇迹契机。",
    en: "Every day is a new chance to bloom.",
    author: "Latinoamérica Proverbio",
  },
  {
    lang: "es",
    langName: "Español",
    flag: "🇪🇸",
    original: "El viaje de mil millas comienza con una sola palabra.",
    zh: "千里之行，始于舌尖敲出的第一个音节。",
    en: "The journey of a thousand miles begins with a single word.",
    author: "Sabiduría Clásica",
  },
  {
    lang: "es",
    langName: "Español",
    flag: "🇪🇸",
    original: "Pies, ¿para qué los quiero si tengo alas para volar?",
    zh: "双脚，既然我拥有飞翔的翅膀，又何须你？",
    en: "Feet, what do I need them for if I have wings to fly?",
    author: "Frida Kahlo (弗里达·卡罗)",
  },
  {
    lang: "es",
    langName: "Español",
    flag: "🇪🇸",
    original: "Podrán cortar todas las flores, pero no podrán detener la primavera.",
    zh: "哪怕摘尽世间所有繁花，也无法阻挡春天的步伐。",
    en: "You can cut all the flowers, but you cannot keep spring from coming.",
    author: "Pablo Neruda (聂鲁达)",
  },
  {
    lang: "es",
    langName: "Español",
    flag: "🇪🇸",
    original: "La memoria del corazón elimina los malos recuerdos y magnifica los buenos.",
    zh: "心灵的记忆会过滤掉阴霾，将美好无限放大。",
    en: "The heart's memory eliminates the bad and magnifies the good.",
    author: "Gabriel García Márquez (马尔克斯)",
  },

  // 🇬🇧 English
  {
    lang: "en",
    langName: "English",
    flag: "🇬🇧",
    original: "Quiet rituals make softer weeks and brightest minds.",
    zh: "温柔而专注的日常，酿造最丰盈明亮的自己。",
    en: "Quiet rituals make softer weeks and brightest minds.",
    author: "Slow Rituals",
  },
  {
    lang: "en",
    langName: "English",
    flag: "🇬🇧",
    original: "Hope is the thing with feathers that perches in the soul.",
    zh: "希望是一只拥有羽翼的小鸟，栖居在灵魂深处轻声歌唱。",
    en: "Hope is the thing with feathers that perches in the soul.",
    author: "Emily Dickinson (艾米莉·狄金森)",
  },
  {
    lang: "en",
    langName: "English",
    flag: "🇬🇧",
    original: "We are all in the gutter, but some of us are looking at the stars.",
    zh: "我们都身处泥泞，但总有人在仰望星空。",
    en: "We are all in the gutter, but some of us are looking at the stars.",
    author: "Oscar Wilde (王尔德)",
  },
  {
    lang: "en",
    langName: "English",
    flag: "🇬🇧",
    original: "Tell me, what is it you plan to do with your one wild and precious life?",
    zh: "告诉我，你打算如何度过这绝无仅有、热烈珍贵的这一生？",
    en: "Tell me, what is it you plan to do with your one wild and precious life?",
    author: "Mary Oliver (玛丽·奥利弗)",
  },

  // 🇯🇵 日本語 (Japanese)
  {
    lang: "ja",
    langName: "日本語",
    flag: "🇯🇵",
    original: "一歩一歩、小さな光を集めて夢に届く。",
    zh: "一步一步，收拢细小的微光，终将触及梦想。",
    en: "Step by step, gathering small lights to reach your dreams.",
    author: "日和のことば",
  },
  {
    lang: "ja",
    langName: "日本語",
    flag: "🇯🇵",
    original: "好きなことに出会えたこと、それ自体が奇跡。",
    zh: "能与心爱的事物相遇，本身就是最棒的奇迹。",
    en: "Meeting something you love is a miracle in itself.",
    author: "少女手帖",
  },
  {
    lang: "ja",
    langName: "日本語",
    flag: "🇯🇵",
    original: "雨ニモマケズ、風ニモマケズ、静カニワラッテヰル。",
    zh: "不畏风雨，在安宁中报以温柔而澄澈的微笑。",
    en: "Not losing to the rain, not losing to the wind, smiling quietly.",
    author: "宮沢賢治 (宫泽贤治)",
  },
  {
    lang: "ja",
    langName: "日本語",
    flag: "🇯🇵",
    original: "みんなちがって、みんないい。",
    zh: "大家各不相同，但大家都一样美妙出彩。",
    en: "Everyone is different, everyone is wonderful.",
    author: "金子みすゞ (金子美铃)",
  },
  {
    lang: "ja",
    langName: "日本語",
    flag: "🇯🇵",
    original: "一度あったことは忘れないものさ、思い出せないだけで。",
    zh: "曾经发生过的事情绝不会被遗忘，只是暂时想不起来而已。",
    en: "Nothing that happens is ever forgotten, even if you can't remember it.",
    author: "千と千尋の神隠し (千与千寻)",
  },

  // 🇫🇷 Français (French)
  {
    lang: "fr",
    langName: "Français",
    flag: "🇫🇷",
    original: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.",
    zh: "只有用心灵才能看清本质，真正重要的东西是眼睛看不见的。",
    en: "It is only with the heart that one can see rightly; what is essential is invisible to the eye.",
    author: "Le Petit Prince (小王子)",
  },
  {
    lang: "fr",
    langName: "Français",
    flag: "🇫🇷",
    original: "La musique exprime ce qui ne peut être dit et sur quoi il est impossible de rester silencieux.",
    zh: "音乐表达了无法言说的情愫，也诉说了不可沉默的深情。",
    en: "Music expresses that which cannot be put into words and that which cannot remain silent.",
    author: "Victor Hugo (维克多·雨果)",
  },

  // 🇮🇹 Italiano (Italian)
  {
    lang: "it",
    langName: "Italiano",
    flag: "🇮🇹",
    original: "L'amor che move il sole e l'altre stelle.",
    zh: "爱是推动太阳与万千星辰的永恒神力。",
    en: "The love that moves the sun and the other stars.",
    author: "Dante Alighieri (但丁)",
  },
  {
    lang: "it",
    langName: "Italiano",
    flag: "🇮🇹",
    original: "Le cose più belle della vita non si guardano, si sentono con il cuore.",
    zh: "生命中最美好的事物不仅是用来看的，而是用来用心感受的。",
    en: "The most beautiful things in life are felt with the heart.",
    author: "Proverbio Italiano",
  },
];

export const DailyZineModal: React.FC<DailyZineModalProps> = ({
  isOpen,
  onClose,
  isEnglishMode = false,
}) => {
  const [quoteIdx, setQuoteIdx] = useState<number>(() => Math.floor(Math.random() * DAILY_QUOTES.length));
  const [copied, setCopied] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [shareToastMsg, setShareToastMsg] = useState<string>("");
  const [goal, setGoal] = useState(getDailyGoal());
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setGoal(getDailyGoal());
      setCopied(false);
      setShareSuccess(false);
      setIsPlayingSpeech(false);
      // Guarantee pure randomized quote across all multi-language candidates on open
      setQuoteIdx(Math.floor(Math.random() * DAILY_QUOTES.length));
      try {
        audioSynth.playCardSlide();
      } catch (_) {}
    } else {
      setIsPlayingSpeech(false);
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        audioSynth.stopAllSpeech();
      } catch (_) {}
    }
  }, [isOpen]);

  useEffect(() => {
    setIsPlayingSpeech(false);
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      audioSynth.stopAllSpeech();
    } catch (_) {}
  }, [quoteIdx]);

  if (!isOpen) return null;

  const currentQuote = DAILY_QUOTES[quoteIdx];
  const todayStr = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, ".");

  const getShareText = () => {
    return isEnglishMode
      ? `💌 Katakata Atelier · Daily Aesthetic Zine (${todayStr})\n"${currentQuote.original}"\n— ${currentQuote.zh}\nToday's Ritual: ${goal.actualMinutes} mins · ${goal.actualWords} words · ${Math.max(1, goal.streakDays)} day streak! 🌸\n#KatakataAtelier #DailyRitual`
      : `💌 咔嗒工坊 · 手作日签 (${todayStr})\n「${currentQuote.original}」\n— ${currentQuote.zh}\n今日打卡：专注 ${goal.actualMinutes} 分钟 · 默写 ${goal.actualWords} 词 · 连续练习 ${Math.max(1, goal.streakDays)} 天！🌸\n#咔嗒工坊 #多语言手作日签`;
  };

  const handleRandomizeQuote = () => {
    try {
      audioSynth.playTyping({ volume: 0.8 });
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      audioSynth.stopAllSpeech();
    } catch (_) {}
    setIsPlayingSpeech(false);
    setQuoteIdx((prev) => {
      let next = Math.floor(Math.random() * DAILY_QUOTES.length);
      while (next === prev && DAILY_QUOTES.length > 1) {
        next = Math.floor(Math.random() * DAILY_QUOTES.length);
      }
      return next;
    });
  };

  // Play quote pronunciation on clicking the heart icon
  const handlePlayQuoteSpeech = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Toggle stop if already speaking
    if (isPlayingSpeech) {
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        audioSynth.stopAllSpeech();
      } catch (_) {}
      setIsPlayingSpeech(false);
      return;
    }

    setIsPlayingSpeech(true);
    try {
      audioSynth.playCoin();
    } catch (_) {}

    const langHint = currentQuote.lang;
    audioSynth.speakFullWord(
      currentQuote.original,
      () => {
        setIsPlayingSpeech(false);
      },
      undefined,
      undefined,
      langHint
    );

    // Fallback timer
    setTimeout(() => {
      setIsPlayingSpeech(false);
    }, 8500);
  };

  // Direct Native App Share (Calls mobile share sheet for WeChat, Xiaohongshu, Notes, Instagram, etc.)
  const handleShareToApp = async () => {
    const text = getShareText();
    const shareTitle = isEnglishMode ? "Katakata Atelier · Daily Zine" : "咔嗒工坊 · 每日手作日签";

    try {
      audioSynth.playCoin();
    } catch (_) {}

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: text,
          url: window.location.href,
        });
        setShareSuccess(true);
        setShareToastMsg(isEnglishMode ? "Shared successfully!" : "已调起系统分享面板！");
        setTimeout(() => setShareSuccess(false), 3000);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return; // User dismissed share sheet
        }
      }
    }

    // Fallback if Web Share is unsupported on device/browser: copy text directly to clipboard
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setShareToastMsg(isEnglishMode ? "Copied! Paste into WeChat/Instagram/Notes" : "已复制日签！可直接粘贴分享至微信/小红书/备忘录~");
        setTimeout(() => {
          setCopied(false);
          setShareToastMsg("");
        }, 3200);
      }
    } catch (_) {}
  };

  const handleCopyText = () => {
    const text = getShareText();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        audioSynth.playCoin();
        setShareToastMsg(isEnglishMode ? "Copied to clipboard!" : "已复制手作日签文本！");
        setTimeout(() => {
          setCopied(false);
          setShareToastMsg("");
        }, 2600);
      }
    } catch (_) {}
  };

  const tearOffWords = [
    { label: "✦ 坚持", code: "01" },
    { label: "✦ 闪光", code: "02" },
    { label: "✦ 专注", code: "03" },
    { label: "✦ 进步", code: "04" },
    { label: "✦ 自由", code: "05" },
    { label: "✦ 浪漫", code: "06" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-stone-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-md w-full my-auto">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-30 w-8 h-8 rounded-full bg-white border-2 border-stone-850 text-stone-800 shadow-[3px_3px_0px_#2E2530] flex items-center justify-center hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="关闭"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* 1. SQUARE WHITE PAPER CARD (Replicating user's screenshot layout) */}
        <div className="relative bg-[#FCFAF7] rounded-2xl p-4 sm:p-5 border-2 border-stone-850 shadow-[5px_5px_0px_#2E2530] overflow-hidden max-h-[90vh] overflow-y-auto">
          
          {/* Top-Right Diagonal Wrinkled Washi Tape */}
          <div className="tape-corner-tr" />
          {/* Bottom-Left Diagonal Wrinkled Washi Tape */}
          <div className="tape-corner-bl" />

          {/* Top Header: Supermarket / Daily Aesthetic in Retro Typewriter Font */}
          <div className="text-right pr-6 sm:pr-8 pt-1 mb-3">
            <div className="font-mono text-xl sm:text-2xl font-black text-stone-800 tracking-tight leading-tight">
              Supermarket aesthetic.
            </div>
            <div className="text-xs sm:text-sm font-sans font-bold text-pink-600/90 tracking-widest">
              &lt;今日手作日签 · {todayStr}&gt;
            </div>
          </div>

          {/* Doodles Accents: Pearl necklace string along top banner */}
          <div className="flex justify-between items-center px-2 mb-2">
            <PearlString count={7} />
            <div className="flex items-center gap-2">
              <GirlhoodUmbrella size={22} />
              <DessertPlateDoodle size={24} />
            </div>
          </div>

          {/* 2. CENTER TILTED PINK RETRO FLYER POSTER (Matching image_60c0f31c.png) */}
          <div className="relative mx-auto my-2 rounded-xl bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 sm:p-5 border-2 border-rose-600 shadow-[4px_4px_0px_#E11D48] transform -rotate-1.5 transition-transform hover:rotate-0 duration-300">
            
            {/* Top Stars & Header of Flyer */}
            <div className="flex items-center justify-between border-b-2 border-rose-500/70 pb-2 mb-3">
              <span className="text-rose-700 text-sm font-mono font-bold">✦ NO. {todayStr} ✦</span>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-600 text-xs animate-sparkle">★</span>
                <span className="text-xs font-mono font-black text-rose-800 bg-white/70 px-2 py-0.5 rounded-full border border-rose-300">
                  GIRLHOOD MAG
                </span>
                <span className="text-rose-600 text-xs animate-sparkle" style={{ animationDelay: "0.5s" }}>★</span>
              </div>
            </div>

            {/* Poster Main Slogan */}
            <div className="text-center relative py-1">
              <div className="font-mono text-2xl sm:text-3xl font-black text-rose-900 tracking-tight leading-none drop-shadow-xs">
                WE'RE CALLING
              </div>
              <div className="text-[11px] sm:text-xs font-mono font-bold text-rose-700 mt-1 uppercase tracking-wider">
                ★ BUT WILL YOU PICK UP TODAY'S PROGRESS? ★
              </div>
            </div>

            {/* Central 3D Pink Heart Sticker & Quotation */}
            <div className="relative my-3 p-3.5 rounded-xl bg-white/85 border-2 border-rose-400 shadow-inner">
              {/* 3D Glossy Heart Pin - Click to play speech audio */}
              <button
                type="button"
                onClick={handlePlayQuoteSpeech}
                className={`group absolute -top-3.5 right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full p-1 shadow-md flex items-center justify-center transform transition-all cursor-pointer border-2 border-white select-none active:scale-90 ${
                  isPlayingSpeech
                    ? "bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 scale-110 rotate-0 shadow-[0_0_15px_rgba(244,63,94,0.7)] ring-2 ring-pink-300"
                    : "bg-gradient-to-tr from-pink-500 to-rose-400 hover:scale-110 rotate-12 hover:rotate-0 hover:shadow-lg"
                }`}
                title={isPlayingSpeech ? "点击暂停语音朗读" : "点击播放日签金句原声朗读 (语音)"}
              >
                {/* Animated sound ripple aura when speaking */}
                {isPlayingSpeech && (
                  <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75 pointer-events-none" />
                )}

                {isPlayingSpeech ? (
                  <Volume2 className="w-5 h-5 text-white drop-shadow-2xs animate-pulse" />
                ) : (
                  <Heart className="w-5 h-5 fill-white text-white drop-shadow-2xs group-hover:scale-110 transition-transform animate-pulse" />
                )}

                {/* Floating tooltip badge */}
                <span className="absolute -bottom-6 right-0 bg-stone-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  {isPlayingSpeech ? "朗读中..." : "点爱心播音 ♫"}
                </span>
              </button>

              {/* Quote details & quick audio button */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5 pr-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{currentQuote.flag}</span>
                  <span className="text-xs font-mono font-bold text-rose-700">{currentQuote.langName}</span>
                  <span className="text-[10px] text-stone-400">· {currentQuote.author}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePlayQuoteSpeech}
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer active:scale-95 ${
                    isPlayingSpeech
                      ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                      : "bg-white/80 hover:bg-white text-rose-700 border-rose-300"
                  }`}
                  title="点击聆听金句原声朗读"
                >
                  <Volume2 className={`w-3 h-3 ${isPlayingSpeech ? "animate-bounce text-white" : "text-pink-600"}`} />
                  <span>{isPlayingSpeech ? "朗读中..." : "播语音"}</span>
                </button>
              </div>

              <div className="font-serif-vintage text-base sm:text-lg text-stone-800 font-extrabold italic leading-snug">
                "{currentQuote.original}"
              </div>
              <div className="text-xs font-sans text-stone-600 mt-1 font-medium">
                {currentQuote.zh}
              </div>
              
              <PencilSquiggleUnderline className="mt-2 text-rose-400" />
            </div>

            {/* Today's Learning Achievements Grid */}
            <div className="grid grid-cols-3 gap-2 py-2 text-center">
              <div className="bg-white/75 rounded-lg p-2 border border-rose-300">
                <div className="text-[10px] text-rose-700 font-mono font-bold">MINUTES</div>
                <div className="text-base font-black font-mono text-stone-800">
                  {goal.actualMinutes}<span className="text-[10px] font-normal text-stone-500">m</span>
                </div>
              </div>

              <div className="bg-white/75 rounded-lg p-2 border border-rose-300">
                <div className="text-[10px] text-rose-700 font-mono font-bold">WORDS</div>
                <div className="text-base font-black font-mono text-stone-800">
                  {goal.actualWords}<span className="text-[10px] font-normal text-stone-500">词</span>
                </div>
              </div>

              <div className="bg-white/75 rounded-lg p-2 border border-rose-300">
                <div className="text-[10px] text-rose-700 font-mono font-bold">STREAK</div>
                <div className="text-base font-black font-mono text-stone-800">
                  {Math.max(1, goal.streakDays)}<span className="text-[10px] font-normal text-stone-500">天</span>
                </div>
              </div>
            </div>

            {/* 3. PERFORATED TEAR-OFF STRIPS (Like the telephone slip tabs in the reference screenshot) */}
            <div className="mt-2 pt-2 border-t-2 border-dashed border-rose-500/80">
              <div className="text-[9px] font-mono text-rose-800 text-center uppercase tracking-widest mb-1.5 opacity-80">
                - - - TEAR OFF YOUR DAILY ENERGY SLIP - - -
              </div>
              <div className="grid grid-cols-6 gap-1">
                {tearOffWords.map((tab, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveTab(idx);
                      try {
                        audioSynth.playCoin();
                      } catch (_) {}
                    }}
                    className={`py-2 px-1 text-center rounded-sm border border-rose-400 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      activeTab === idx
                        ? "bg-rose-600 text-white shadow-sm -translate-y-1"
                        : "bg-white/80 hover:bg-white text-rose-900"
                    }`}
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                    }}
                    title={`撕下一张能量条: ${tab.label}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lace Scallop Divider */}
          <div className="my-3">
            <ScallopLaceTrim className="text-pink-300/80" />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            {/* Share to App Button (Web Share API for WeChat/Xiaohongshu/Instagram/Notes) */}
            <button
              onClick={handleShareToApp}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 border-2 border-stone-850 shadow-[3px_3px_0px_#2E2530] active:scale-95 transition-all cursor-pointer"
              title="一键调起手机系统分享面板，可直接分享至微信、小红书、备忘录等"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isEnglishMode ? "Share to App" : "📲 分享到 App"}</span>
            </button>

            {/* Copy Quote Text Button */}
            <button
              onClick={handleCopyText}
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 border-2 border-stone-850 shadow-[2px_2px_0px_#2E2530] active:scale-95 transition-all cursor-pointer"
              title="复制日签图文内容到剪贴板"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isEnglishMode ? "Copied" : "已复制") : (isEnglishMode ? "Copy Text" : "复制文本")}</span>
            </button>

            {/* Randomize Quote Button */}
            <button
              onClick={handleRandomizeQuote}
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 font-mono font-bold text-xs flex items-center justify-center gap-1.5 border-2 border-pink-400 shadow-[2px_2px_0px_#F472B6] active:scale-95 transition-all cursor-pointer"
              title="换一句箴言"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>换一句</span>
            </button>

            {/* Continue Practice Button */}
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-mono font-bold text-xs flex items-center justify-center gap-1 border-2 border-stone-800 shadow-[2px_2px_0px_#2E2530] active:scale-95 transition-all cursor-pointer"
            >
              <span>继续练习</span>
            </button>
          </div>

          {/* Share/Copy Toast Feedback */}
          {shareToastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-center text-[11px] font-mono font-bold text-rose-700 bg-rose-50/90 border border-rose-300 py-1 px-3 rounded-lg shadow-2xs"
            >
              ✦ {shareToastMsg}
            </motion.div>
          )}

          {/* Footer Handwritten & Pencil Doodles */}
          <div className="mt-3 pt-2 border-t border-pink-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
            <span className="flex items-center gap-1">
              <HandDrawnPencil size={14} />
              <span>KATAKATA SCRAPBOOK</span>
            </span>
            <span>✦ ✧ SOFTER WEEKS ✧ ✦</span>
            <span>100% HANDCRAFTED</span>
          </div>

        </div>
      </div>
    </div>
  );
};
