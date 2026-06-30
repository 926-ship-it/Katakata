import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Check, Play, Eye, EyeOff, RotateCcw, Volume2, Award, Sparkles, CheckCircle, Flame, Keyboard, Layers, BookOpen } from "lucide-react";
import { audioSynth } from "../utils/audio";
import { NarrativeStyle } from "../utils/narrative";

interface KanaItem {
  hiragana: string;
  katakana: string;
  romaji: string;
  alternatives?: string[]; // e.g. "ji" / "di", "zu" / "du", "wo" / "o"
  row: string; // row classification (a, ka, sa, ta, na, ha, ma, ya, ra, wa, voiced, contracted)
  rowName: string;
}

// Full Japanese Kana Set (Gojūon, Dakuon, Yōon)
const KANA_DATASET: KanaItem[] = [
  // あ行 (A)
  { hiragana: "あ", katakana: "ア", romaji: "a", row: "a", rowName: "あ行" },
  { hiragana: "い", katakana: "イ", romaji: "i", row: "a", rowName: "あ行" },
  { hiragana: "う", katakana: "ウ", romaji: "u", row: "a", rowName: "あ行" },
  { hiragana: "え", katakana: "エ", romaji: "e", row: "a", rowName: "あ行" },
  { hiragana: "お", katakana: "オ", romaji: "o", row: "a", rowName: "あ行" },
  // か行 (Ka)
  { hiragana: "か", katakana: "カ", romaji: "ka", row: "ka", rowName: "か行" },
  { hiragana: "き", katakana: "キ", romaji: "ki", row: "ka", rowName: "か行" },
  { hiragana: "く", katakana: "ク", romaji: "ku", row: "ka", rowName: "か行" },
  { hiragana: "け", katakana: "ケ", romaji: "ke", row: "ka", rowName: "か行" },
  { hiragana: "こ", katakana: "コ", romaji: "ko", row: "ka", rowName: "か行" },
  // さ行 (Sa)
  { hiragana: "さ", katakana: "サ", romaji: "sa", row: "sa", rowName: "さ行" },
  { hiragana: "し", katakana: "シ", romaji: "shi", alternatives: ["si"], row: "sa", rowName: "さ行" },
  { hiragana: "す", katakana: "ス", romaji: "su", row: "sa", rowName: "さ行" },
  { hiragana: "せ", katakana: "セ", romaji: "se", row: "sa", rowName: "さ行" },
  { hiragana: "そ", katakana: "ソ", romaji: "so", row: "sa", rowName: "さ行" },
  // た行 (Ta)
  { hiragana: "た", katakana: "タ", romaji: "ta", row: "ta", rowName: "た行" },
  { hiragana: "ち", katakana: "チ", romaji: "chi", alternatives: ["ti"], row: "ta", rowName: "た行" },
  { hiragana: "つ", katakana: "ツ", romaji: "tsu", alternatives: ["tu"], row: "ta", rowName: "た行" },
  { hiragana: "て", katakana: "テ", romaji: "te", row: "ta", rowName: "た行" },
  { hiragana: "と", katakana: "ト", romaji: "to", row: "ta", rowName: "た行" },
  // な行 (Na)
  { hiragana: "な", katakana: "ナ", romaji: "na", row: "na", rowName: "な行" },
  { hiragana: "に", katakana: "ニ", romaji: "ni", row: "na", rowName: "な行" },
  { hiragana: "ぬ", katakana: "ヌ", romaji: "nu", row: "na", rowName: "な行" },
  { hiragana: "ね", katakana: "ネ", romaji: "ne", row: "na", rowName: "な行" },
  { hiragana: "の", katakana: "ノ", romaji: "no", row: "na", rowName: "な行" },
  // は行 (Ha)
  { hiragana: "は", katakana: "ハ", romaji: "ha", row: "ha", rowName: "は行" },
  { hiragana: "ひ", katakana: "ヒ", romaji: "hi", row: "ha", rowName: "は行" },
  { hiragana: "ふ", katakana: "フ", romaji: "fu", alternatives: ["hu"], row: "ha", rowName: "は行" },
  { hiragana: "へ", katakana: "ヘ", romaji: "he", row: "ha", rowName: "は行" },
  { hiragana: "ほ", katakana: "ホ", romaji: "ho", row: "ha", rowName: "は行" },
  // ま行 (Ma)
  { hiragana: "ま", katakana: "マ", romaji: "ma", row: "ma", rowName: "ま行" },
  { hiragana: "み", katakana: "ミ", romaji: "mi", row: "ma", rowName: "ま行" },
  { hiragana: "む", katakana: "ム", romaji: "mu", row: "ma", rowName: "ま行" },
  { hiragana: "め", katakana: "メ", romaji: "me", row: "ma", rowName: "ま行" },
  { hiragana: "も", katakana: "モ", romaji: "mo", row: "ma", rowName: "ま行" },
  // や行 (Ya)
  { hiragana: "や", katakana: "ヤ", romaji: "ya", row: "ya", rowName: "や行" },
  { hiragana: "ゆ", katakana: "ユ", romaji: "yu", row: "ya", rowName: "や行" },
  { hiragana: "よ", katakana: "ヨ", romaji: "yo", row: "ya", rowName: "や行" },
  // ら行 (Ra)
  { hiragana: "ら", katakana: "ラ", romaji: "ra", row: "ra", rowName: "ら行" },
  { hiragana: "り", katakana: "リ", romaji: "ri", row: "ra", rowName: "ら行" },
  { hiragana: "る", katakana: "ル", romaji: "ru", row: "ra", rowName: "ら行" },
  { hiragana: "れ", katakana: "レ", romaji: "re", row: "ra", rowName: "ら行" },
  { hiragana: "ろ", katakana: "ロ", romaji: "ro", row: "ra", rowName: "ら行" },
  // わ行 (Wa)
  { hiragana: "わ", katakana: "ワ", romaji: "wa", row: "wa", rowName: "わ行" },
  { hiragana: "を", katakana: "ヲ", romaji: "wo", alternatives: ["o"], row: "wa", rowName: "わ行" },
  { hiragana: "ん", katakana: "ン", romaji: "n", row: "wa", rowName: "わ行" },

  // 浊音/半浊音 (Voiced / Semi-voiced)
  { hiragana: "が", katakana: "ガ", romaji: "ga", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぎ", katakana: "ギ", romaji: "gi", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぐ", katakana: "グ", romaji: "gu", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "げ", katakana: "ゲ", romaji: "ge", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ご", katakana: "ゴ", romaji: "go", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ざ", katakana: "ザ", romaji: "za", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "じ", katakana: "ジ", romaji: "ji", alternatives: ["zi"], row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ず", katakana: "ズ", romaji: "zu", alternatives: ["zu"], row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぜ", katakana: "ゼ", romaji: "ze", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぞ", katakana: "ゾ", romaji: "zo", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "だ", katakana: "ダ", romaji: "da", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぢ", katakana: "ヂ", romaji: "ji", alternatives: ["di"], row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "づ", katakana: "ヅ", romaji: "zu", alternatives: ["du"], row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "de", katakana: "デ", romaji: "de", row: "voiced", rowName: "浊音/半浊" }, // Wait, correct hiragana for で is で
  { hiragana: "で", katakana: "デ", romaji: "de", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ど", katakana: "ド", romaji: "do", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ば", katakana: "バ", romaji: "ba", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "び", katakana: "ビ", romaji: "bi", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぶ", katakana: "ブ", romaji: "bu", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "べ", katakana: "ベ", romaji: "be", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぼ", katakana: "ボ", romaji: "bo", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぱ", katakana: "パ", romaji: "pa", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぴ", katakana: "ピ", romaji: "pi", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぷ", katakana: "プ", romaji: "pu", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぺ", katakana: "ペ", romaji: "pe", row: "voiced", rowName: "浊音/半浊" },
  { hiragana: "ぽ", katakana: "ポ", romaji: "po", row: "voiced", rowName: "浊音/半浊" },

  // 拗音 (Contracted)
  { hiragana: "きゃ", katakana: "キャ", romaji: "kya", row: "contracted", rowName: "拗音" },
  { hiragana: "きゅ", katakana: "キュ", romaji: "kyu", row: "contracted", rowName: "拗音" },
  { hiragana: "きょ", katakana: "キョ", romaji: "kyo", row: "contracted", rowName: "拗音" },
  { hiragana: "しゃ", katakana: "シャ", romaji: "sha", row: "contracted", rowName: "拗音" },
  { hiragana: "しゅ", katakana: "シュ", romaji: "shu", row: "contracted", rowName: "拗音" },
  { hiragana: "しょ", katakana: "ショ", romaji: "sho", row: "contracted", rowName: "拗音" },
  { hiragana: "ちゃ", katakana: "チャ", romaji: "cha", row: "contracted", rowName: "拗音" },
  { hiragana: "ちゅ", katakana: "チュ", romaji: "chu", row: "contracted", rowName: "拗音" },
  { hiragana: "ちょ", katakana: "チョ", romaji: "cho", row: "contracted", rowName: "拗音" },
  { hiragana: "にゃ", katakana: "ニャ", romaji: "nya", row: "contracted", rowName: "拗音" },
  { hiragana: "にゅ", katakana: "ニュ", romaji: "nyu", row: "contracted", rowName: "拗音" },
  { hiragana: "にょ", katakana: "ニョ", romaji: "nyo", row: "contracted", rowName: "拗音" },
  { hiragana: "ひゃ", katakana: "ヒゃ", romaji: "hya", row: "contracted", rowName: "拗音" }, // Correct katakana for ひゃ is ヒャ
  { hiragana: "ひゃ", katakana: "ヒャ", romaji: "hya", row: "contracted", rowName: "拗音" },
  { hiragana: "ひゅ", katakana: "ヒュ", romaji: "hyu", row: "contracted", rowName: "拗音" },
  { hiragana: "ひょ", katakana: "ヒョ", romaji: "hyo", row: "contracted", rowName: "拗音" },
  { hiragana: "みゃ", katakana: "ミャ", romaji: "mya", row: "contracted", rowName: "拗音" },
  { hiragana: "みゅ", katakana: "ミュ", romaji: "myu", row: "contracted", rowName: "拗音" },
  { hiragana: "みょ", katakana: "ミョ", romaji: "myo", row: "contracted", rowName: "拗音" },
  { hiragana: "りゃ", katakana: "リャ", romaji: "rya", row: "contracted", rowName: "拗音" },
  { hiragana: "りゅ", katakana: "リュ", romaji: "ryu", row: "contracted", rowName: "拗音" },
  { hiragana: "りょ", katakana: "リョ", romaji: "ryo", row: "contracted", rowName: "拗音" },
];

const ROW_GROUPS = [
  { id: "all_gojuon", label: "整套五十音 (基本)" },
  { id: "a", label: "あ行 (a, i, u, e, o)" },
  { id: "ka", label: "か行 (ka, ki, ku, ke, ko)" },
  { id: "sa", label: "さ行 (sa, shi, su, se, so)" },
  { id: "ta", label: "た行 (ta, chi, tsu, te, to)" },
  { id: "na", label: "な行 (na, ni, nu, ne, no)" },
  { id: "ha", label: "は行 (ha, hi, fu, he, ho)" },
  { id: "ma", label: "ま行 (ma, mi, mu, me, mo)" },
  { id: "ya", label: "や行 (ya, yu, yo)" },
  { id: "ra", label: "ら行 (ra, ri, ru, re, r0)" },
  { id: "wa", label: "わ行 (wa, wo, n)" },
  { id: "voiced", label: "浊音/半浊 (ga, za, ba, pa...)" },
  { id: "contracted", label: "拗音 (kya, sha, cha...)" },
];

interface KanaTrainingPageProps {
  onGoBack: () => void;
  narrativeStyle: NarrativeStyle;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
}

export const KanaTrainingPage: React.FC<KanaTrainingPageProps> = ({
  onGoBack,
  narrativeStyle,
  coins,
  setCoins,
}) => {
  // Config selection states
  const [kanaType, setKanaType] = useState<"hiragana" | "katakana" | "both">("hiragana");
  const [selectedRows, setSelectedRows] = useState<string[]>(["a"]); // default starts with 'a' row
  const [sessionLength, setSessionLength] = useState<number>(15); // practice pool size (10, 15, 25, 40, all)
  const [showHelper, setShowHelper] = useState<boolean>(true); // show romaji key helper

  // Playback/Engine states
  const [gameState, setGameState] = useState<"lobby" | "playing" | "summary">("lobby");
  const [activePool, setActivePool] = useState<KanaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<KanaItem | null>(null);
  const [currentType, setCurrentType] = useState<"hiragana" | "katakana">("hiragana");

  // Keyboard typing engine
  const [typedValue, setTypedValue] = useState<string>("");
  const [isShaking, setIsShaking] = useState<boolean>(false);
  
  // Scoring / metrics
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Derive filtered items from selected rows
  const fullAvailablePool = React.useMemo(() => {
    let pool: KanaItem[] = [];
    if (selectedRows.includes("all_gojuon")) {
      // Include all rows EXCEPT voiced & contracted
      pool = KANA_DATASET.filter(k => k.row !== "voiced" && k.row !== "contracted");
    } else {
      pool = KANA_DATASET.filter(k => selectedRows.includes(k.row));
    }
    return pool;
  }, [selectedRows]);

  // Handle row selection toggles
  const handleToggleRow = (rowId: string) => {
    if (rowId === "all_gojuon") {
      if (selectedRows.includes("all_gojuon")) {
        setSelectedRows(["a"]); // fallback to default
      } else {
        setSelectedRows(["all_gojuon"]);
      }
    } else {
      // Clear all_gojuon if standard row selected
      let updated = selectedRows.filter(r => r !== "all_gojuon");
      if (updated.includes(rowId)) {
        if (updated.length > 1) {
          updated = updated.filter(r => r !== rowId);
        }
      } else {
        updated.push(rowId);
      }
      setSelectedRows(updated);
    }
  };

  const handleSelectPreset = (preset: "basic" | "voiced" | "all") => {
    if (preset === "basic") {
      setSelectedRows(["all_gojuon"]);
    } else if (preset === "voiced") {
      setSelectedRows(["voiced"]);
    } else {
      setSelectedRows(["all_gojuon", "voiced", "contracted"]);
    }
  };

  // Start the actual spelling round
  const handleStartPractice = () => {
    if (fullAvailablePool.length === 0) return;

    // Draw random selection of items matching session length
    const shuffled = [...fullAvailablePool].sort(() => Math.random() - 0.5);
    const selectedCount = Math.min(sessionLength, shuffled.length);
    const chosenItems = shuffled.slice(0, selectedCount);

    setActivePool(chosenItems);
    setCurrentIndex(0);
    setCorrectCount(0);
    setErrorCount(0);
    setCombo(0);
    setMaxCombo(0);
    setTypedValue("");
    
    // Choose starting item
    const first = chosenItems[0];
    setCurrentItem(first);
    
    // Determine its display type
    if (kanaType === "both") {
      setCurrentType(Math.random() > 0.5 ? "hiragana" : "katakana");
    } else {
      setCurrentType(kanaType);
    }

    setGameState("playing");
    setStartTime(Date.now());

    // Promptly speak its kana sound!
    setTimeout(() => {
      const activeKana = kanaType === "katakana" ? first.katakana : first.hiragana;
      audioSynth.speakJapanese(activeKana);
    }, 150);
  };

  // Auto focus input
  useEffect(() => {
    if (gameState === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentIndex]);

  // Handle typing validation
  const processKeyChar = (char: string) => {
    if (!currentItem) return;

    const lowerChar = char.toLowerCase();
    const potentialRomaji = typedValue + lowerChar;

    const isMatchExact = (currentItem.romaji === potentialRomaji) || 
      (currentItem.alternatives?.includes(potentialRomaji));

    // Check if it matches a prefix of romaji
    const isPrefixOfMain = currentItem.romaji.startsWith(potentialRomaji);
    const isPrefixOfAlts = currentItem.alternatives?.some(alt => alt.startsWith(potentialRomaji));

    if (isMatchExact) {
      // Correct Match Completed!
      setCorrectCount(prev => prev + 1);
      setCombo(prev => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setTypedValue("");

      // Visual success burst feedback
      playKeyTone(true);

      // Advance to next or wrap up
      const nextIdx = currentIndex + 1;
      if (nextIdx < activePool.length) {
        setCurrentIndex(nextIdx);
        const nextItem = activePool[nextIdx];
        setCurrentItem(nextItem);
        
        // Randomize type if "both"
        if (kanaType === "both") {
          setCurrentType(Math.random() > 0.5 ? "hiragana" : "katakana");
        } else {
          setCurrentType(kanaType);
        }

        // Voice pronunciation immediately
        setTimeout(() => {
          const currentText = currentType === "katakana" ? nextItem.katakana : nextItem.hiragana;
          audioSynth.speakJapanese(currentText);
        }, 120);
      } else {
        // Round Finished!
        setElapsedTimeMs(Date.now() - startTime);
        setGameState("summary");

        // Reward coins for diligence
        const baseReward = 15;
        const comboBonus = Math.floor(maxCombo * 0.5);
        const earnedCoins = baseReward + comboBonus;
        setCoins(prev => prev + earnedCoins);
      }
    } else if (isPrefixOfMain || isPrefixOfAlts) {
      // Intermediate typing step
      setTypedValue(potentialRomaji);
      playKeyTone(false);
    } else {
      // ERROR! Clear buffer, shake screen, add error counts
      setIsShaking(true);
      setErrorCount(prev => prev + 1);
      setCombo(0);
      setTypedValue("");
      setTimeout(() => setIsShaking(false), 300);
      
      // Voice guidance to remind them
      const currentText = currentType === "katakana" ? currentItem.katakana : currentItem.hiragana;
      audioSynth.speakJapanese(currentText);
    }
  };

  // Audio tone synth
  const playKeyTone = (isCorrectWord: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (isCorrectWord) {
        // High-pitched crystal bell sound
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        // Mechanical tactile wooden tick sound
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (_) {}
  };

  // Keyboard layout map for rendering dynamic interactive on-screen keyboard
  const KEYBOARD_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"]
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 md:px-0">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-stone-800 bg-white hover:bg-stone-50 text-stone-800 font-bold transition-all text-xs cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回主页</span>
        </button>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-mono font-bold text-amber-900">
            和币: <span className="font-serif font-black">{coins}</span> 🪙
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === "lobby" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 rounded-2xl border-2 border-stone-800 bg-[#faf8f4] space-y-6 shadow-sm"
          >
            {/* Intro */}
            <div className="text-center space-y-2 py-2 border-b border-stone-200/85">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-mono tracking-wider uppercase">
                <Keyboard className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>KANA WORKOUT MATRIX</span>
              </div>
              <h2 className="text-3xl font-serif font-black text-stone-900">
                五十音精进熟化训练室
              </h2>
              <p className="text-xs text-stone-500 max-w-lg mx-auto">
                跳过词组束缚，进行纯正的单字五十音字形与发音肌肉记忆打字强化。通过精细化筛选行、切换平/片假名，迅速击破生疏死角！
              </p>
            </div>

            {/* Quick config options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option Left: Types & Row filters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-stone-500 tracking-wider block uppercase">
                    1. 假名体系类型 SELECT KANA FAMILY
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "hiragana", label: "平假名 (あ)", desc: "Hiragana" },
                      { id: "katakana", label: "片假名 (ア)", desc: "Katakana" },
                      { id: "both", label: "两者混合 (あ/ア)", desc: "Mixed Mode" }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setKanaType(type.id as any)}
                        className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          kanaType === type.id
                            ? "border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-sm"
                            : "border-stone-300 bg-white hover:border-stone-400 text-stone-700"
                        }`}
                      >
                        <div className="text-sm font-serif font-black">{type.label}</div>
                        <div className="text-[9px] font-mono text-stone-400 mt-0.5">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-stone-500 tracking-wider block uppercase">
                      2. 筛选特定音行 FILTER BY ROWS
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectPreset("basic")}
                        className="text-[10px] font-mono text-amber-700 hover:underline font-bold bg-amber-500/10 px-2 py-0.5 rounded"
                      >
                        基本五十音
                      </button>
                      <button
                        onClick={() => handleSelectPreset("voiced")}
                        className="text-[10px] font-mono text-amber-700 hover:underline font-bold bg-amber-500/10 px-2 py-0.5 rounded"
                      >
                        浊音/半浊
                      </button>
                      <button
                        onClick={() => handleSelectPreset("all")}
                        className="text-[10px] font-mono text-amber-700 hover:underline font-bold bg-amber-500/10 px-2 py-0.5 rounded"
                      >
                        全选
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1.5 border border-stone-200 rounded-lg bg-white">
                    {ROW_GROUPS.map(row => {
                      const isSelected = selectedRows.includes(row.id);
                      return (
                        <button
                          key={row.id}
                          onClick={() => handleToggleRow(row.id)}
                          className={`p-2 rounded-lg border text-left transition-all text-xs flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-stone-900 border-stone-900 text-white font-black"
                              : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
                          }`}
                        >
                          <span className="truncate">{row.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-stone-400 leading-tight">
                    当前勾选行合集池，包含 <b className="text-stone-700 font-mono">{fullAvailablePool.length}</b> 个独特假名音素。
                  </p>
                </div>
              </div>

              {/* Option Right: Session Length & Guides */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-stone-500 tracking-wider block uppercase">
                    3. 本轮单词训练量 SESSION ROUND SIZE
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[10, 15, 25, 40, 60].map(size => (
                      <button
                        key={size}
                        onClick={() => setSessionLength(size)}
                        className={`p-2.5 rounded-lg border-2 text-center transition-all text-sm cursor-pointer ${
                          sessionLength === size
                            ? "border-amber-600 bg-amber-50 text-amber-900 font-bold"
                            : "border-stone-300 bg-white hover:border-stone-400 text-stone-600 font-mono"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-stone-250 bg-white space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-850 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-stone-600" />
                      <span>发音键位视觉辅助</span>
                    </span>
                    <button
                      onClick={() => setShowHelper(p => !p)}
                      className="px-2 py-1 rounded bg-stone-100 border border-stone-300 hover:bg-stone-200 text-[10px] font-bold text-stone-700 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {showHelper ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{showHelper ? "显示提示" : "隐藏提示"}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    开启后，卡面上方会显示灰色的罗马音对照提示（例如 <b>「し」</b> 提示 <b>「shi」</b>）。关闭提示能够强迫记忆，非常适合中高级选手。
                  </p>
                </div>

                {/* Big Start trigger */}
                <button
                  onClick={handleStartPractice}
                  disabled={fullAvailablePool.length === 0}
                  className={`w-full py-4 rounded-xl font-serif font-black text-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    fullAvailablePool.length > 0
                      ? "bg-amber-500 text-stone-950 border-2 border-stone-800 hover:bg-amber-400 active:scale-[0.99]"
                      : "bg-stone-200 text-stone-400 border border-stone-350 cursor-not-allowed"
                  }`}
                >
                  <Play className="w-5 h-5 fill-stone-950 text-stone-950" />
                  <span>开启假名拼读精进 ({Math.min(sessionLength, fullAvailablePool.length)} 题)</span>
                </button>
              </div>

            </div>

            {/* Micro grid list of active selected cards for review */}
            {fullAvailablePool.length > 0 && (
              <div className="space-y-2 border-t border-stone-200/80 pt-4">
                <span className="text-xs font-mono font-bold text-stone-500 tracking-wider block uppercase">
                  🔍 当前待练习字元总览 CARDS IN THE ACTIVE WORKOUT POOL ({fullAvailablePool.length})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-white border border-stone-200 rounded-lg">
                  {fullAvailablePool.map((k, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded border border-stone-200/70 bg-stone-50 text-xs flex items-center gap-1.5 select-none"
                    >
                      <span className="font-serif font-black text-stone-850">
                        {kanaType === "katakana" ? k.katakana : k.hiragana}
                      </span>
                      <span className="font-mono text-[9px] text-stone-400">{k.romaji}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {gameState === "playing" && currentItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={`p-6 rounded-2xl border-2 border-stone-800 bg-[#fbfaf7] space-y-6 shadow-md relative overflow-hidden ${
              isShaking ? "animate-[shake_0.35s_ease-in-out_infinite]" : ""
            }`}
          >
            {/* Ambient retro styling decoration lines */}
            <div className="absolute top-2 left-2 text-[9px] font-mono text-stone-400 select-none">
              TYPE_LAB_KANA_WORKOUT // SEQ_{currentIndex + 1}_OF_{activePool.length}
            </div>

            {/* Top Stat Ribbon */}
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="text-xs font-mono text-stone-500">
                  进度: <span className="text-stone-900 font-bold font-serif">{currentIndex + 1}</span> / {activePool.length}
                </div>
                <div className="w-24 bg-stone-100 border border-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / activePool.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Combo Banner */}
              {combo > 0 && (
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                  <span className="text-xs font-mono font-black text-rose-700">
                    {combo} COMBO
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-stone-500">
                  错音: <span className="text-red-600 font-bold">{errorCount}</span>
                </span>
                <button
                  onClick={() => {
                    const activeText = currentType === "katakana" ? currentItem.katakana : currentItem.hiragana;
                    audioSynth.speakJapanese(activeText);
                  }}
                  className="p-1.5 rounded-full bg-stone-100 border border-stone-250 hover:bg-stone-200 transition-all text-stone-700 cursor-pointer shadow-sm active:scale-95"
                  title="Speak"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Giant Centered Kana Presentation Card */}
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div 
                className="w-56 h-64 rounded-2xl border-2 border-stone-800 bg-[#fcfbfa] shadow-md flex flex-col items-center justify-between p-4 relative overflow-hidden"
                style={{
                  boxShadow: combo > 4 ? "0 4px 15px rgba(245,158,11,0.18)" : "0 3px 8px rgba(0,0,0,0.05)"
                }}
              >
                {/* Vintage stamp inner dash line */}
                <div className="absolute inset-2 border border-dashed border-stone-200 rounded-xl pointer-events-none" />

                {/* Sub corner brackets */}
                <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-stone-300" />
                <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-stone-300" />
                <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-stone-300" />
                <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-stone-300" />

                {/* Rarity/row sign */}
                <div className="text-[10px] font-mono font-bold text-stone-400 tracking-wider">
                  {currentItem.rowName}  ・  {currentType === "hiragana" ? "平假名" : "片假名"}
                </div>

                {/* Giant Brush Stroke Character */}
                <motion.div
                  key={currentItem.romaji + currentType}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="text-8xl md:text-9xl font-black text-stone-900 font-serif leading-none select-none select-none text-center h-28 flex items-center justify-center"
                  style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                >
                  {currentType === "katakana" ? currentItem.katakana : currentItem.hiragana}
                </motion.div>

                {/* Key Helper */}
                <div className="h-6 flex items-center justify-center">
                  {showHelper ? (
                    <div className="text-sm font-mono font-bold text-stone-400 bg-stone-100/80 px-2 py-0.5 rounded border border-stone-200/50">
                      罗马音: <span className="text-stone-700 underline font-black">{currentItem.romaji}</span>
                      {currentItem.alternatives && (
                        <span className="text-[10px] text-stone-400 font-normal"> (或 {currentItem.alternatives.join(", ")})</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-stone-350">
                      提示已关闭（专注拼写）
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic typing visual display block */}
              <div className="space-y-2 text-center w-full max-w-sm">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black block">
                  指尖罗马音录入 IN-FLIGHT ROMAJI BUFFER
                </span>
                
                {/* Interactive letters display row */}
                <div className="flex justify-center items-center gap-1.5 h-12">
                  {currentItem.romaji.split("").map((letter, idx) => {
                    const isTyped = idx < typedValue.length;
                    const isActive = idx === typedValue.length;
                    return (
                      <div
                        key={idx}
                        className={`w-9 h-11 rounded-lg border-2 flex items-center justify-center font-mono text-lg font-black transition-all ${
                          isTyped
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : isActive
                            ? "border-stone-850 bg-stone-100 text-stone-900 animate-pulse scale-105 shadow-sm"
                            : "border-stone-200 bg-white text-stone-300"
                        }`}
                      >
                        {isTyped ? typedValue[idx] : isActive ? "_" : letter}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Virtual On-Screen Typing Helper Keyboard */}
            <div className="border-t border-stone-200/80 pt-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 font-bold px-1">
                <span>VIRTUAL WORKBENCH KEYBOARD</span>
                <span>支持直接点击或敲击物理键盘输入</span>
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                {KEYBOARD_ROWS.map((rowKeys, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1.5">
                    {rowKeys.map(charKey => {
                      // Check if key is highlighted in current word romaji
                      const isNeeded = currentItem.romaji.includes(charKey) || 
                        currentItem.alternatives?.some(alt => alt.includes(charKey));
                      
                      return (
                        <button
                          key={charKey}
                          onClick={() => {
                            processKeyChar(charKey);
                            // Maintain input focus after click
                            setTimeout(() => inputRef.current?.focus(), 10);
                          }}
                          className={`w-9 h-10 sm:w-10 sm:h-11 rounded-lg border-2 text-xs sm:text-sm font-mono font-bold flex items-center justify-center transition-all uppercase cursor-pointer select-none active:scale-90 ${
                            isNeeded
                              ? "border-amber-600 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black ring-1 ring-amber-300"
                              : "border-stone-250 bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-700"
                          }`}
                        >
                          {charKey}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Invisible native typing listener input */}
            <input
              ref={inputRef}
              type="text"
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val.length > 0) {
                  processKeyChar(val[val.length - 1]);
                }
                e.target.value = "";
              }}
              className="opacity-0 fixed top-0 left-0 w-0 h-0 pointer-events-none"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {/* Safety trigger helper overlay to keep focus */}
            <div 
              onClick={() => inputRef.current?.focus()}
              className="py-1 text-center text-[10px] font-mono text-amber-700/60 cursor-pointer hover:underline animate-pulse select-none bg-amber-500/5 rounded border border-amber-500/10"
            >
              打字无反应？点击此处重新聚焦键盘录入
            </div>

          </motion.div>
        )}

        {gameState === "summary" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 rounded-2xl border-2 border-stone-800 bg-[#FAF8F4] text-center space-y-6 shadow-lg relative overflow-hidden"
          >
            {/* Ambient gold leaf foil sheen decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 via-yellow-400 via-amber-200 to-amber-500" />

            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/35 flex items-center justify-center text-amber-600">
                <Award className="w-9 h-9 animate-[bounce_2s_infinite]" />
              </div>
              <h2 className="text-3xl font-serif font-black text-stone-900">
                一轮熟读收功！
              </h2>
              <p className="text-xs text-stone-500">
                恭喜完成精细假名发音拼写磨砺，肌肉记忆在飞快沉淀。
              </p>
            </div>

            {/* Performance Stats Board */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              
              <div className="p-3 bg-white rounded-xl border border-stone-300/80 shadow-sm">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">拼写熟数 SIZE</span>
                <span className="text-2xl font-serif font-black text-stone-850 mt-1 block">
                  {correctCount} <span className="text-xs text-stone-400 font-sans">个</span>
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-300/80 shadow-sm">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">准确率 ACCURACY</span>
                <span className="text-2xl font-serif font-black text-stone-850 mt-1 block">
                  {correctCount + errorCount > 0 
                    ? Math.round((correctCount / (correctCount + errorCount)) * 100) 
                    : 100}%
                </span>
                <span className="text-[8.5px] font-mono text-stone-400 block mt-0.5">
                  失误: {errorCount} 次
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-300/80 shadow-sm">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">巅峰连击 MAX COMBO</span>
                <span className="text-2xl font-serif font-black text-rose-600 mt-1 block">
                  {maxCombo} <span className="text-xs text-rose-400 font-sans">连</span>
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-300/80 shadow-sm">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">平均耗时 SECS/KANA</span>
                <span className="text-2xl font-serif font-black text-stone-850 mt-1 block">
                  {correctCount > 0 ? ((elapsedTimeMs / 1000) / correctCount).toFixed(1) : 0} <span className="text-xs text-stone-400 font-sans">秒</span>
                </span>
                <span className="text-[8.5px] font-mono text-stone-400 block mt-0.5">
                  总用时: {(elapsedTimeMs / 1000).toFixed(1)} 秒
                </span>
              </div>

            </div>

            {/* Prize Rewards Banner */}
            <div className="max-w-md mx-auto p-4 rounded-xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 flex items-center justify-between">
              <div className="text-left space-y-0.5">
                <span className="text-[9px] font-mono font-black text-amber-800 uppercase tracking-wide">Rewards Earned</span>
                <h4 className="text-sm font-bold font-serif text-amber-950">修禅岁币与成果收益</h4>
                <p className="text-[11px] text-stone-500">
                  基础熟化奖赏 <b>+15</b> 🪙 与巅峰连击加成 <b>+{Math.floor(maxCombo * 0.5)}</b> 🪙
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-serif font-black text-amber-800 animate-pulse">
                  +{15 + Math.floor(maxCombo * 0.5)} 🪙
                </span>
              </div>
            </div>

            {/* Action Triggers */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                onClick={handleStartPractice}
                className="px-6 py-3 rounded-xl border-2 border-stone-800 bg-amber-500 text-stone-950 font-serif font-black text-sm hover:bg-amber-400 transition-all cursor-pointer shadow active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>再来一轮熟练</span>
              </button>
              <button
                onClick={() => setGameState("lobby")}
                className="px-6 py-3 rounded-xl border-2 border-stone-800 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm transition-all cursor-pointer shadow active:scale-95 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>配置并重新开始</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
