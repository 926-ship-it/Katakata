import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Sparkles, MessageCircle, Heart, Minus } from "lucide-react";
import { audioSynth } from "../utils/audio";

interface MascotComponentProps {
  currentPage: string;
  lastAction?: "correct" | "error" | "complete" | "";
  voiceType?: string;
  isEnglishMode?: boolean;
  onToggleEnglishMode?: () => void;
  practiceMode?: "typing" | "handwriting";
}

export const MascotComponent: React.FC<MascotComponentProps> = ({ 
  currentPage, 
  lastAction, 
  voiceType,
  isEnglishMode = false,
  onToggleEnglishMode,
  practiceMode = "typing"
}) => {
  const [speech, setSpeech] = useState<string>("");
  const [expression, setExpression] = useState<"happy" | "determined" | "cheering" | "shocked" | "celebrate" >("happy");
  const [showBubble, setShowBubble] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [prevVoiceType, setPrevVoiceType] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Combo tap state for English mode toggle
  const [comboCount, setComboCount] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  // Initial greeting
  useEffect(() => {
    if (isEnglishMode) {
      setSpeech("哈罗！我是守护灵福狸酱，今天我们也要努力熟练英语名词与西式人名拼写哦！");
    } else {
      setSpeech("哈罗！我是五音守护灵福狸酱，今天我们也要努力熟化拼音哦！");
    }
  }, [isEnglishMode]);

  // Action when user swaps the pronunciation presenter voice type
  useEffect(() => {
    if (!voiceType) return;
    if (prevVoiceType === "") {
      setPrevVoiceType(voiceType);
      return;
    }
    setPrevVoiceType(voiceType);

    if (isEnglishMode) {
      if (voiceType === "male") {
        setSpeech("已切换为沉厚博雅的男声导师！雄浑有磁性，快去敲打拼读英文字词吧！");
        setExpression("determined");
      } else if (voiceType === "child") {
        setSpeech("哇塞！你选了软萌的童声伴读！太清脆好听啦，听着像我的小伙伴！");
        setExpression("celebrate");
      } else if (voiceType === "alien") {
        setSpeech("哔哔……检测到跨纬度宇宙的外星人声！音调居然如此魔性高亢，难道是来自外星的赛博来客？！");
        setExpression("shocked");
      } else if (voiceType === "elderly") {
        setSpeech("已切换为宽仁和蔼的智慧老人！温热迟缓的声音里满是岁月沉淀，非常有韵味哦~");
        setExpression("happy");
      } else {
        setSpeech("已切回亲切温婉的女声导师！风吟拂面，标准英文拼写最配你啦。");
        setExpression("happy");
      }
    } else {
      if (voiceType === "male") {
        setSpeech("已切换为沉厚博雅的男声导师！雄浑有磁性，快去敲打拼读听听吧！");
        setExpression("determined");
      } else if (voiceType === "child") {
        setSpeech("哇塞！你选了软萌的童声伴读！太清脆好听啦，听着像我的小伙伴！");
        setExpression("celebrate");
      } else if (voiceType === "alien") {
        setSpeech("哔哔……检测到跨纬度宇宙的外星人声！音调居然如此魔性高亢，难道是狸狸母星的赛博来客？！");
        setExpression("shocked");
      } else if (voiceType === "elderly") {
        setSpeech("已切换为宽仁和蔼的智慧老人！温热迟缓的声音里满是岁月沉淀，非常有韵味哦~");
        setExpression("happy");
      } else {
        setSpeech("已切回亲切温婉的女声导师！风吟拂面，标准和风朗读最配你啦。");
        setExpression("happy");
      }
    }
  }, [voiceType, isEnglishMode]);

  // Dynamic dialogue reactions depending on active page state
  useEffect(() => {
    const bubbleTimeout = setTimeout(() => {
      // Keep bubble visible longer but refresh its contents beautifully
    }, 5000);

    if (isEnglishMode) {
      if (currentPage === "start") {
        const startSpeeches = [
          "今天也要开始优雅的西式词汇/姓名联训拼写吗？我都准备好啦！",
          "知道吗？多敲击键盘练习拼写，能让手指形成牢固的英语单词肌肉记忆哦！",
          "点击我的小肚子，我可以通过琴弦发出神秘的风铃之声哦！",
          "每一张闪卡都有专属的英文词源故事与标准发音，快去解锁看看吧！",
          "快把想挑战的西方词条打上勾勾，开启‘一气呵成’的联合拼写训练吧！"
        ];
        setSpeech(startSpeeches[Math.floor(Math.random() * startSpeeches.length)]);
        setExpression("happy");
      } else if (currentPage === "training") {
        if (practiceMode === "handwriting") {
          setSpeech("执笔凝神！在一笔一划间感受英文字母线条的优美流畅吧！");
        } else {
          setSpeech("打起精神！敲击对应键位，心手合一，拼出正确的英文单词吧！");
        }
        setExpression("determined");
      } else if (currentPage === "library") {
        setSpeech("哇！这就是你一路汗水打磨出来的精美收藏馆吗？好多璀璨的西式词条卡牌啊！");
        setExpression("celebrate");
      } else if (currentPage === "unlocked_ceremony") {
        setSpeech("天呐！天降祥瑞！恭喜你完成了高级拼写，解锁了高贵金色图鉴！");
        setExpression("celebrate");
      }
    } else {
      if (currentPage === "start") {
        const startSpeeches = [
          "今天也要开始优雅的联训组合熟化吗？我都准备好啦！",
          "知道吗？把多个卡牌绑在一起练习，更锻炼五十音肌肉记忆哦！",
          "点击我的小肚子，我可以通过琴弦发出神秘的风铃之声哦！",
          "每一张闪卡都有专属的故事跟发音，去解锁看看吧！",
          "快把想挑战的人名打上勾勾，开启‘一气呵成’的联合训练吧！"
        ];
        setSpeech(startSpeeches[Math.floor(Math.random() * startSpeeches.length)]);
        setExpression("happy");
      } else if (currentPage === "training") {
        if (practiceMode === "handwriting") {
          setSpeech("执笔凝神！在一笔一划间感受假名之风骨，让指尖流变古风墨卷吧！");
        } else {
          setSpeech("打起精神！敲击对应键位，心手合一，让指尖起舞吧！加油！");
        }
        setExpression("determined");
      } else if (currentPage === "library") {
        setSpeech("哇！这就是你一路汗水打磨出来的精美收藏馆吗？太耀眼了！");
        setExpression("celebrate");
      } else if (currentPage === "unlocked_ceremony") {
        setSpeech("天呐！天降祥瑞！恭喜你完成了高级熟化，解锁了高贵金色图鉴！");
        setExpression("celebrate");
      }
    }

    return () => clearTimeout(bubbleTimeout);
  }, [currentPage, isEnglishMode, practiceMode]);

  // Reaction to physical typing actions in training mode
  useEffect(() => {
    if (currentPage === "training" && lastAction) {
      if (isEnglishMode) {
        if (lastAction === "correct") {
          const cheerWords = ["好棒！", "精准！", "就是这个节奏！", "行云流水！", "太强啦！"];
          setSpeech(cheerWords[Math.floor(Math.random() * cheerWords.length)]);
          setExpression("cheering");
        } else if (lastAction === "error") {
          setSpeech("哎呀，拼错了。深呼吸再试一次，福狸酱陪着你！");
          setExpression("shocked");
        } else if (lastAction === "complete") {
          setSpeech("完美熟化英语拼写！太厉害了我的朋友！");
          setExpression("celebrate");
          setTimeout(() => setExpression("happy"), 1500);
        }
      } else {
        if (lastAction === "correct") {
          const cheerWords = ["好棒！", "精准！", "就是这个节奏！", "行云流水！", "太强啦！"];
          setSpeech(cheerWords[Math.floor(Math.random() * cheerWords.length)]);
          setExpression("cheering");
        } else if (lastAction === "error") {
          setSpeech("哎呀，稍微偏了一点点，深呼吸再试一次，福狸酱陪着你！");
          setExpression("shocked");
        } else if (lastAction === "complete") {
          setSpeech("完美熟化拼写！太厉害了我的朋友！");
          setExpression("celebrate");
          setTimeout(() => setExpression("happy"), 1500);
        }
      }
    }
  }, [lastAction, currentPage, isEnglishMode]);

  const handleMascotClick = () => {
    audioSynth.playCardSlide();
    setClickCount((p) => p + 1);

    // Combo tap trigger
    const nowTime = Date.now();
    let currentCombo = 1;
    if (nowTime - lastClickTime < 1800) {
      currentCombo = comboCount + 1;
    }
    setComboCount(currentCombo);
    setLastClickTime(nowTime);

    if (currentCombo === 9) {
      if (onToggleEnglishMode) {
        onToggleEnglishMode();
      }
      setComboCount(0); // Reset combo count
      return;
    }
    
    // Play randomly selected bell chime inside audio system
    const systemNotes = [523.25, 659.25, 783.99, 880.00, 1046.50];
    const randomNote = systemNotes[Math.floor(Math.random() * systemNotes.length)];
    
    try {
      const audioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (audioCtx) {
        const ctx = new audioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(randomNote * 1.2, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch(e){}

    if (isEnglishMode) {
      const funSpeeches = [
        "呀！好痒呀！(*^▽^*) 练习拼写的时候，我的大尾巴也在为你加油哦！",
        "点击我不仅能听到清脆的风铃，英语单词也能更牢固地印在大脑里呢！",
        "狸狸在偷偷背英文单词呢，今天又多掌握几个漂亮的英文词啦！",
        "连续练习，让手指在键盘上飞舞，你就是最棒的拼写达人！",
        "啾咪！给你充满元气满满的一天，加油！❤"
      ];
      setSpeech(funSpeeches[Math.floor(Math.random() * funSpeeches.length)]);
    } else {
      const funSpeeches = [
        "呀！好痒呀！(*^▽^*)",
        "点击我不仅能听到清脆的风铃，连学习效率也会上升哦！",
        "呼呼，我的小尾巴是不是毛茸茸、软绵绵的？",
        "你在看我的小耳朵吗？它们对美丽的五十音发音非常灵敏！",
        "悄悄告诉你，多练习几轮，连平时生疏的罗马音也能像母语般自然流淌！",
        "啾咪！给你充满元气满满的一天，加油！❤"
      ];
      setSpeech(funSpeeches[Math.floor(Math.random() * funSpeeches.length)]);
    }
    setExpression("cheering");
    setShowBubble(true);
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsMinimized(false);
          setShowBubble(true);
          try {
            audioSynth.playCardSlide();
          } catch (_) {}
        }}
        className="fixed top-14 sm:top-16 right-3 sm:right-5 z-[70] flex flex-col items-center gap-1 cursor-pointer select-none pointer-events-auto"
      >
        {/* Cute small floating orb when minimized */}
        <div className="relative w-9 h-9 rounded-full bg-amber-400 border-2 border-stone-850 flex items-center justify-center shadow-[2px_2px_0px_#2E2530] group hover:scale-110 transition-all">
          <div className="absolute inset-0 rounded-full bg-amber-300 animate-ping opacity-25" />
          <svg viewBox="0 0 100 100" className="w-6 h-6 pointer-events-none">
            <polygon points="25,35 15,12 40,24" fill="#ea580c" stroke="#7c2d12" strokeWidth="4" />
            <polygon points="75,35 85,12 60,24" fill="#ea580c" stroke="#7c2d12" strokeWidth="4" />
            <circle cx="50" cy="55" r="32" fill="#f59e0b" stroke="#7c2d12" strokeWidth="4" />
            <path d="M 36 54 Q 42 58 48 54" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
            <path d="M 52 54 Q 58 58 64 54" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <span className="bg-stone-900 text-amber-300 text-[8px] font-black font-mono border border-amber-500 px-1 py-0.2 rounded shadow-xs scale-90">
          {isEnglishMode ? "WAKE" : "唤醒"}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ left: -360, right: 10, top: -10, bottom: 600 }}
      className="fixed top-14 sm:top-16 right-3 sm:right-5 z-[70] flex flex-col items-end select-none cursor-grab active:cursor-grabbing pointer-events-auto"
      style={{ touchAction: "none" }}
    >
      {/* Round Ball Mascot Avatar (Floating at Top) */}
      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.8 + (clickCount % 2),
          ease: "easeInOut",
        }}
        className="relative group flex flex-col items-center justify-center"
        onClick={handleMascotClick}
      >
        {/* Soft background aura */}
        <div className="absolute inset-0 bg-amber-400/20 rounded-full filter blur-[10px] scale-90 group-hover:scale-110 transition-transform duration-300" />

        {/* Adorable Round Sphere / Ball (圆球福狸) */}
        <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 border-2 border-stone-850 shadow-[3px_3px_0px_#2E2530] flex items-center justify-center transform active:scale-95 transition-transform overflow-visible">
          
          {/* Top Fox Ears perched on the sphere */}
          <div className="absolute -top-3.5 inset-x-0 flex justify-between px-1 pointer-events-none">
            {/* Left Ear */}
            <motion.div
              animate={{ rotate: expression === "shocked" ? [-6, 6, -6] : [0, 4, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-4 h-4"
            >
              <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
                <polygon points="20,5 35,35 5,35" fill="#ea580c" stroke="#2E2530" strokeWidth="4" strokeLinejoin="round" />
                <polygon points="20,12 30,32 10,32" fill="#fed7aa" />
              </svg>
            </motion.div>

            {/* Right Ear */}
            <motion.div
              animate={{ rotate: expression === "shocked" ? [6, -6, 6] : [0, -4, 4, 0] }}
              transition={{ repeat: Infinity, duration: 3.2 }}
              className="w-4 h-4"
            >
              <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
                <polygon points="20,5 35,35 5,35" fill="#ea580c" stroke="#2E2530" strokeWidth="4" strokeLinejoin="round" />
                <polygon points="20,12 30,32 10,32" fill="#fed7aa" />
              </svg>
            </motion.div>
          </div>

          {/* Sphere Ball Vector Details */}
          <svg viewBox="0 0 100 100" className="w-full h-full rounded-full pointer-events-none">
            {/* 3D Gloss highlight curve */}
            <ellipse cx="38" cy="24" rx="18" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-20 38 24)" />

            {/* White Fox Cheek patches */}
            <path d="M 12 55 C 12 75, 30 82, 50 82 C 70 82, 88 75, 88 55 C 88 70, 70 88, 50 88 C 30 88, 12 70, 12 55 Z" fill="#ffffff" opacity="0.9" />

            {/* Pink Blush Circles */}
            <circle cx="24" cy="58" r="6" fill="#f43f5e" opacity="0.65" />
            <circle cx="76" cy="58" r="6" fill="#f43f5e" opacity="0.65" />

            {/* Expression-specific eyes */}
            {expression === "happy" && (
              <>
                <path d="M 28 48 Q 36 40 42 48" fill="none" stroke="#2E2530" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M 58 48 Q 64 40 72 48" fill="none" stroke="#2E2530" strokeWidth="4.5" strokeLinecap="round" />
              </>
            )}

            {expression === "cheering" && (
              <>
                <circle cx="35" cy="46" r="4.5" fill="#2E2530" />
                <circle cx="36" cy="44" r="1.5" fill="#ffffff" />
                <path d="M 58 48 Q 64 40 72 48" fill="none" stroke="#2E2530" strokeWidth="4.5" strokeLinecap="round" />
              </>
            )}

            {expression === "determined" && (
              <>
                <path d="M 26 42 L 42 46" stroke="#2E2530" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="35" cy="48" r="4" fill="#2E2530" />
                <path d="M 74 42 L 58 46" stroke="#2E2530" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="65" cy="48" r="4" fill="#2E2530" />
              </>
            )}

            {expression === "shocked" && (
              <>
                <circle cx="35" cy="46" r="6.5" fill="#ffffff" stroke="#2E2530" strokeWidth="3" />
                <circle cx="35" cy="46" r="2.5" fill="#2E2530" />
                <circle cx="65" cy="46" r="6.5" fill="#ffffff" stroke="#2E2530" strokeWidth="3" />
                <circle cx="65" cy="46" r="2.5" fill="#2E2530" />
              </>
            )}

            {expression === "celebrate" && (
              <>
                {/* Twinkling star eyes */}
                <path d="M 30 46 L 40 46 M 35 41 L 35 51" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
                <path d="M 60 46 L 70 46 M 65 41 L 65 51" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
              </>
            )}

            {/* Cute nose */}
            <polygon points="47,56 53,56 50,60" fill="#7c2d12" />

            {/* Mouth */}
            {expression === "shocked" ? (
              <circle cx="50" cy="67" r="4" fill="#7c2d12" />
            ) : (
              <path d="M 43 64 Q 50 69 57 64" fill="none" stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" />
            )}

            {/* Whiskers */}
            <line x1="16" y1="56" x2="6" y2="55" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="62" x2="6" y2="64" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
            <line x1="84" y1="56" x2="94" y2="55" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
            <line x1="84" y1="62" x2="94" y2="64" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Small floating tag & minimize button */}
        <div className="flex items-center gap-1 mt-1 select-none">
          <span className="bg-stone-900 border border-amber-500 text-[8px] font-black font-mono text-amber-300 px-1.5 py-0.2 rounded-full shadow-xs uppercase tracking-wider">
            {isEnglishMode ? "Fuku-Ball" : "福狸球"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
              try {
                audioSynth.playCardSlide();
              } catch (_) {}
            }}
            className="w-4 h-4 rounded-full bg-white hover:bg-stone-100 border border-stone-850 text-stone-700 shadow-2xs cursor-pointer flex items-center justify-center active:scale-90"
            title={isEnglishMode ? "Minimize Fuku-chan" : "最小化"}
          >
            <Minus className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        </div>
      </motion.div>

      {/* Downward Speech Bubble with upward arrow, avoids covering training card */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -6 }}
            className="mt-2 max-w-[210px] bg-white text-stone-900 border-2 border-stone-850 rounded-2xl p-2.5 shadow-[3px_3px_0px_#2E2530] relative cursor-pointer"
            onClick={() => setShowBubble(false)}
          >
            {/* Arrow pointing UP toward the ball */}
            <div className="absolute right-5 -top-2 w-3.5 h-3.5 bg-white border-l-2 border-t-2 border-stone-850 transform rotate-45" />
            <div className="text-[11px] font-sans leading-relaxed text-stone-800 flex flex-col gap-1">
              <span className="font-bold text-amber-800 flex items-center justify-between text-[10px] font-mono tracking-wider border-b border-pink-100 pb-0.5">
                <span>{isEnglishMode ? "FUKU-CHAN" : "福狸酱"}</span>
                <span className="flex items-center gap-0.5 text-rose-500">
                  <Heart className="w-2.5 h-2.5 fill-current" /> {isEnglishMode ? "GUARDIAN" : "守护灵"}
                </span>
              </span>
              <span>{speech}</span>
              <span className="text-[8px] text-stone-400 text-right mt-0.5 font-mono">
                {isEnglishMode ? "Tap to close" : "点击对话框可关闭 ✕"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
