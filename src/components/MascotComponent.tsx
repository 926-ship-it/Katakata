import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Sparkles, MessageCircle, Heart } from "lucide-react";
import { audioSynth } from "../utils/audio";

interface MascotComponentProps {
  currentPage: "start" | "training" | "library" | "unlocked_ceremony";
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
  const [expression, setExpression] = useState<"happy" | "determined" | "cheering" | "shocked" | "celebrate">("happy");
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [clickCount, setClickCount] = useState<number>(0);
  const [prevVoiceType, setPrevVoiceType] = useState<string>("");

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
    setShowBubble(true);

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
    setShowBubble(true);
    const bubbleTimeout = setTimeout(() => {
      // Keep bubble visible longer but refresh its contents beautifully
    }, 5000);

    if (isEnglishMode) {
      if (currentPage === "start") {
        const startSpeeches = [
          "今天也要开始优雅的西式词汇/姓名联训拼写吗？我都准备好啦！",
          "知道吗？多敲击键盘练习拼写，能让手指形成牢固的英语单词肌肉记忆哦！",
          "点击我的小肚子，我可以通过琴弦发出神秘的风铃之声哦！",
          "每一张闪卡都有专属的西方文化典故与发音，快去解锁看看吧！",
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
        "狸狸在偷偷学习西方文化呢，今天又多认得几个西方名字啦！",
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

  return (
    <motion.div 
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ left: -450, right: 30, top: -750, bottom: 30 }}
      className="fixed bottom-4 right-4 z-[70] flex flex-col items-end select-none cursor-grab active:cursor-grabbing pointer-events-auto"
      style={{ touchAction: "none" }} // Prevents browser scroll interference while dragging on mobile!
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-2 max-w-[200px] bg-white text-stone-905 border-2 border-amber-500 rounded-2xl p-3 shadow-xl relative cursor-pointer"
            onClick={() => setShowBubble(false)}
          >
            {/* Tiny arrow down */}
            <div className="absolute right-6 -bottom-2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-amber-500 transform rotate-45" />
            <div className="text-[11px] font-sans leading-relaxed text-stone-800 flex flex-col gap-1">
              <span className="font-bold text-amber-700 flex items-center justify-between text-[10px] font-mono tracking-wider border-b border-stone-100 pb-0.5">
                <span>{isEnglishMode ? "FUKU-CHAN" : "福狸酱"}</span>
                <span className="flex items-center gap-0.5 text-rose-500">
                  <Heart className="w-2.5 h-2.5 fill-current" /> {isEnglishMode ? "GUARDIAN" : "守护灵"}
                </span>
              </span>
              <span>{speech}</span>
              <span className="text-[8px] text-stone-400 text-right mt-1 font-mono">
                {isEnglishMode ? "Click bubble to close" : "点击对话框可关闭"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot character avatar with float physics */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3 + (clickCount % 2),
          ease: "easeInOut",
        }}
        className="relative group flex flex-col items-center justify-end"
        onClick={handleMascotClick}
      >
        {/* Glow behind mascot */}
        <div className="absolute inset-0 bg-amber-400/20 rounded-full filter blur-[15px] scale-75 group-hover:scale-95 transition-transform duration-500" />

        {/* Dynamic hand-designed vector raccoon/fox companion */}
        <svg
          width="88"
          height="88"
          viewBox="0 0 100 100"
          className="drop-shadow-lg transform active:scale-95 transition-transform pointer-events-none"
        >
          {/* Big fluffy fox tail with orange gradient */}
          <motion.path
            d="M 65 65 C 85 45, 95 65, 85 85 C 75 95, 55 85, 65 65 Z"
            fill="#ea580c"
            stroke="#7c2d12"
            strokeWidth="2.5"
            strokeLinejoin="round"
            animate={{
              rotate: [0, 10, -5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "65px 75px" }}
          />
          {/* Fox tail tip (white) */}
          <path
            d="M 85 85 C 80 88, 77 86, 75 80 C 80 78, 88 72, 85 85 Z"
            fill="#ffffff"
            stroke="#7c2d12"
            strokeWidth="1.5"
          />

          {/* Fox Back ears */}
          {/* Left ear */}
          <motion.polygon
            points="22,35 12,10 38,22"
            fill="#d97706"
            stroke="#7c2d12"
            strokeWidth="2.5"
            animate={{
              rotate: expression === "shocked" ? [0, -5, 5, 0] : [0, 8, -8, 0],
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{ transformOrigin: "22px 35px" }}
          />
          {/* Right ear */}
          <motion.polygon
            points="78,35 88,10 62,22"
            fill="#d97706"
            stroke="#7c2d12"
            strokeWidth="2.5"
            animate={{
              rotate: expression === "shocked" ? [0, 5, -5, 0] : [0, -6, 6, 0],
            }}
            transition={{ repeat: Infinity, duration: 3.5 }}
            style={{ transformOrigin: "78px 35px" }}
          />

          {/* Ear inners */}
          <polygon points="24,30 16,14 34,22" fill="#fed7aa" />
          <polygon points="76,30 84,14 66,22" fill="#fed7aa" />

          {/* Golden round body */}
          <circle cx="50" cy="65" r="24" fill="#f59e0b" stroke="#7c2d12" strokeWidth="2.5" />
          {/* Fluffy white chest patch */}
          <ellipse cx="50" cy="68" rx="14" ry="12" fill="#fafaf9" stroke="#7c2d12" strokeWidth="1.5" />

          {/* Main adorable round head */}
          <circle cx="50" cy="42" r="26" fill="#f59e0b" stroke="#7c2d12" strokeWidth="2.5" />

          {/* White cheeks circles */}
          <path d="M 24 42 C 24 55, 34 58, 50 58" fill="#ffffff" />
          <path d="M 76 42 C 76 55, 66 58, 50 58" fill="#ffffff" />
          <path d="M 24 42 C 24 55, 34 58, 50 58 C 50 58, 76 58, 76 42 C 76 56, 50 63, 24 42 Z" fill="#ffffff" stroke="#7c2d12" strokeWidth="2" strokeLinejoin="round" />

          {/* Cheek pink blush circles */}
          <circle cx="34" cy="48" r="4" fill="#f43f5e" opacity="0.6" />
          <circle cx="66" cy="48" r="4" fill="#f43f5e" opacity="0.6" />

          {/* Dynamic expression-specific eyes */}
          {expression === "happy" && (
            <>
              {/* Happy arches eyes */}
              <path d="M 32 40 Q 38 34 40 40" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
              <path d="M 68 40 Q 62 34 60 40" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {expression === "cheering" && (
            <>
              {/* Winking happy eyes */}
              <circle cx="36" cy="38" r="3" fill="#292524" />
              <path d="M 60 38 Q 64 34 68 38" fill="none" stroke="#292524" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {expression === "determined" && (
            <>
              {/* Cool focused eyes */}
              <path d="M 30 35 L 42 38" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="36" cy="40" r="3.5" fill="#292524" />
              <path d="M 70 35 L 58 38" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="64" cy="40" r="3.5" fill="#292524" />
            </>
          )}

          {expression === "shocked" && (
            <>
              {/* Wide circular eyes with tiny pupils */}
              <circle cx="36" cy="40" r="5" fill="#ffffff" stroke="#292524" strokeWidth="2" />
              <circle cx="36" cy="40" r="2" fill="#292524" />
              <circle cx="64" cy="40" r="5" fill="#ffffff" stroke="#292524" strokeWidth="2" />
              <circle cx="64" cy="40" r="2" fill="#292524" />
            </>
          )}

          {expression === "celebrate" && (
            <>
              {/* Stars / Sparkles eyes representation */}
              <path d="M 32 36 L 40 44 M 40 36 L 32 44" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
              <path d="M 60 36 L 68 44 M 68 36 L 60 44" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* Small adorable triangular nose */}
          <polygon points="48,46 52,46 50,49" fill="#7c2d12" />

          {/* Dynamic mouth */}
          {expression === "shocked" ? (
            <circle cx="50" cy="53" r="3.5" fill="#7c2d12" />
          ) : expression === "determined" ? (
            <path d="M 46 53 Q 50 51 54 53" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
          ) : (
            // Smiling mouth opens
            <path d="M 45 51 Q 50 55 55 51" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Left and Right Whiskers */}
          <line x1="20" y1="46" x2="10" y2="45" stroke="#7c2d12" strokeWidth="1.5" />
          <line x1="20" y1="51" x2="8" y2="52" stroke="#7c2d12" strokeWidth="1.5" />
          <line x1="80" y1="46" x2="90" y2="45" stroke="#7c2d12" strokeWidth="1.5" />
          <line x1="80" y1="51" x2="92" y2="52" stroke="#7c2d12" strokeWidth="1.5" />

          {/* Left & Right fluffy tiny paws */}
          <circle cx="34" cy="80" r="4.5" fill="#fafaf9" stroke="#7c2d12" strokeWidth="2" />
          <circle cx="66" cy="80" r="4.5" fill="#fafaf9" stroke="#7c2d12" strokeWidth="2" />
        </svg>

        {/* Small mascot name tag */}
        <span className="bg-stone-900 border border-amber-600 text-[9px] font-black font-mono text-amber-400 px-2.5 py-0.5 rounded-full shadow-md mt-1 animate-pulse uppercase tracking-widest scale-90 group-hover:scale-100 transition-all">
          {isEnglishMode ? "Fuku-chan" : "福狸酱"}
        </span>
      </motion.div>
    </motion.div>
  );
};
