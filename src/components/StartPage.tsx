import React, { useState } from "react";
import { motion } from "motion/react";
import { BookOpen, Sparkles, Trophy, Settings, HelpCircle, Flame, Keyboard, BarChart2, Calendar, Award, Clock, ArrowRight, RotateCw, Play, BookOpenCheck, Activity, Plus, FileText, Trash2, CheckCircle, AlertCircle, Upload, Gamepad2 } from "lucide-react";
import { DICTIONARY, DictionaryItem, getDictionary } from "../data/dictionary";
import { getReviewSummary, getDueCardIds } from "../utils/srs";
import { uiTranslate, LANG_MAPPING } from "../utils/lang";
import { NarrativeStyle, nTrans } from "../utils/narrative";
import { toHanNumerals } from "../App";

interface StartPageProps {
  onStartTraining: (items: DictionaryItem[], durationMs: number) => void;
  onGoToLibrary: () => void;
  onGoToSpellRush: () => void;
  onGoToMemoryMatch: () => void;
  onGoToKanaTraining: (type?: "hiragana" | "katakana" | "both") => void;
  collectedIds: string[];
  practiceTimes: Record<string, number>;
  practiceMode: "typing" | "handwriting";
  setPracticeMode: (mode: "typing" | "handwriting") => void;
  isEnglishMode?: boolean;
  isKatakanaMode?: boolean;
  narrativeStyle: NarrativeStyle;
}

export const StartPage: React.FC<StartPageProps> = ({
  onStartTraining,
  onGoToLibrary,
  onGoToSpellRush,
  onGoToMemoryMatch,
  onGoToKanaTraining,
  collectedIds,
  practiceTimes = {},
  practiceMode,
  setPracticeMode,
  isEnglishMode = false,
  isKatakanaMode = false,
  narrativeStyle,
}) => {
  const [customCards, setCustomCards] = useState<DictionaryItem[]>([]);

  const activeDict = React.useMemo(() => {
    return getDictionary(isEnglishMode, isKatakanaMode);
  }, [isEnglishMode, isKatakanaMode]);

  const srsSummary = React.useMemo(() => {
    return getReviewSummary(collectedIds);
  }, [collectedIds]);

  const dueCardIds = React.useMemo(() => {
    return getDueCardIds(collectedIds);
  }, [collectedIds]);

  // Read historic session logs and XP points for dynamic dashboards
  const sessionLogs = React.useMemo(() => {
    try {
      const stored = localStorage.getItem("fifty_sound_session_log");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const xp = React.useMemo(() => {
    try {
      return Number(localStorage.getItem("fifty_sound_xp") || "0");
    } catch {
      return 0;
    }
  }, []);

  const currentLevel = Math.floor(xp / 250) + 1;
  const currentLevelProgress = xp % 250;
  const progressPercent = Math.min(100, Math.round((currentLevelProgress / 250) * 100));

  // Strongly-typed practice stats calculation
  const practiceValues = Object.values(practiceTimes) as number[];
  const totalRounds = practiceValues.reduce((accum, val) => accum + Number(val || 0), 0);

  // Config states
  const [showAdvancedPanel, setShowAdvancedPanel] = useState<boolean>(false);
  const [sessionLimit, setSessionLimit] = useState<number>(3); // How many items they want to practice or unlock 
  const [durationMinutes, setDurationMinutes] = useState<number>(3); // Customizable minutes: 1, 3, 5, 10, or custom
  const [customMinutesText, setCustomMinutesText] = useState<string>("");
  const [showCustomTime, setShowCustomTime] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [customCardCount, setCustomCardCount] = useState<number>(3);
  const [customTimerMinutes, setCustomTimerMinutes] = useState<number>(3);

  // Custom Document Parser States
  const [docText, setDocText] = useState<string>("");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string>("");
  const [parseSuccess, setParseSuccess] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Manual Add Form States
  const [manualKanji, setManualKanji] = useState<string>("");
  const [manualKana, setManualKana] = useState<string>("");
  const [manualMeaning, setManualMeaning] = useState<string>("");

  // Kana syllable splitting algorithm for manual addition
  const splitKanaIntoSyllables = (kana: string) => {
    const syllables: { kana: string; romaji: string[]; displayRomaji: string }[] = [];
    const KANA_MAP: Record<string, string> = {
      "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
      "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
      "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
      "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
      "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
      "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
      "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
      "や": "ya", "ゆ": "yu", "よ": "yo",
      "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
      "わ": "wa", "を": "wo", "ん": "n",
      "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
      "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
      "だ": "da", "ぢ": "ji", "づ": "zu", "de": "de", "ど": "do",
      "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
      "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
      "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
      "しゃ": "sha", "しゅ": "shu", "しょ": "sho",
      "ちゃ": "cha", "ちゅ": "chu", "ちょ": "cho",
      "にゃ": "nya", "niゅ": "nyu", "にょ": "nyo",
      "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
      "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
      "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
      "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
      "じゃ": "ja", "じゅ": "ju", "じょ": "jo",
      "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
      "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo",
      "っ": "t", "ー": "-", " ": " "
    };

    let i = 0;
    const cleanKana = kana.trim();
    while (i < cleanKana.length) {
      const char = cleanKana[i];
      const nextChar = cleanKana[i + 1] || "";
      
      if (["ゃ", "ゅ", "ょ"].includes(nextChar)) {
        const combined = char + nextChar;
        const rom = KANA_MAP[combined] || (KANA_MAP[char] ? KANA_MAP[char] + nextChar : combined);
        syllables.push({
          kana: combined,
          romaji: [rom],
          displayRomaji: rom
        });
        i += 2;
      } else {
        const rom = KANA_MAP[char] || char;
        syllables.push({
          kana: char,
          romaji: [rom],
          displayRomaji: rom
        });
        i += 1;
      }
    }
    return syllables;
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/plain" || file.name.endsWith(".txt"))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocText(event.target.result as string);
          setParseSuccess(isEnglishMode ? "Document loaded successfully from file!" : "成功从文件加载文稿！");
          setParseError("");
        }
      };
      reader.readAsText(file);
    } else {
      setParseError(isEnglishMode ? "Only plain text (.txt) files are supported." : "仅支持纯文本 (.txt) 文件类型。");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDocText(event.target.result as string);
          setParseSuccess(isEnglishMode ? "Document loaded successfully!" : "文件读取成功！");
          setParseError("");
        }
      };
      reader.readAsText(file);
    }
  };

  // call the /api/parse-document route
  const handleAiParse = async () => {
    if (!docText.trim()) {
      setParseError(isEnglishMode ? "Please enter or upload some text first." : "请先输入或拖入需要解析的文本内容。");
      return;
    }
    setIsParsing(true);
    setParseError("");
    setParseSuccess("");
    try {
      const res = await fetch("/api/parse-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: docText, isEnglish: isEnglishMode })
      });
      const data = await res.json();
      if (res.ok && data.success && data.items) {
        if (setCustomCards) {
          setCustomCards((prev) => {
            // merge and filter duplicates
            const existingIds = prev.map((c) => c.id);
            const newItems = data.items.filter((item: any) => !existingIds.includes(item.id));
            return [...prev, ...newItems];
          });
        }
        setParseSuccess(isEnglishMode 
          ? `Successfully parsed and added ${data.items.length} vocab cards with AI!` 
          : `AI 成功分析并生成了 ${data.items.length} 张词汇熟化卡牌！已自动存入下方列表。`
        );
        setDocText("");
      } else {
        setParseError(data.error || (isEnglishMode ? "AI parsing failed. Please try again." : "AI 解析失败，请重试。"));
      }
    } catch (err: any) {
      setParseError(err.message || (isEnglishMode ? "Network error during parsing." : "请求解析时发生网络错误。"));
    } finally {
      setIsParsing(false);
    }
  };

  // Direct Full-Text spelling mode (without AI card generation)
  const handleDirectFullTextSpelling = () => {
    if (!docText.trim()) {
      setParseError(isEnglishMode ? "Please enter or upload some text first." : "请先输入或拖入需要解析的文本内容。");
      return;
    }
    setParseError("");
    setParseSuccess("");

    // Split text into lines, filter out empty lines, trim them
    const lines = docText
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      setParseError(isEnglishMode ? "No readable text found." : "未发现可读文本。");
      return;
    }

    const newItems: DictionaryItem[] = lines.map((line, index) => {
      const uniqueId = "custom-fulltext-" + Date.now() + "-" + index + "-" + Math.random().toString(36).substr(2, 5);
      
      // Clean punctuation for typing safety, but keep original for display.
      const cleanLineForTyping = line
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'，。？！、；：（）“”‘’【】「」]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      let generatedSegments: { kana: string; romaji: string[]; displayRomaji: string }[] = [];
      
      if (isEnglishMode) {
        // Character by character for English, preserving case/space
        generatedSegments = cleanLineForTyping.split("").map((char) => ({
          kana: char,
          romaji: [char.toLowerCase()],
          displayRomaji: char
        }));
      } else {
        // split kana into syllables for Japanese
        generatedSegments = splitKanaIntoSyllables(cleanLineForTyping);
      }

      // If segments is empty, fallback to a space
      if (generatedSegments.length === 0) {
        generatedSegments = [{ kana: " ", romaji: [" "], displayRomaji: " " }];
      }

      return {
        id: uniqueId,
        kanji: line, // Original line containing punctuation for beautiful rendering
        kanaStr: cleanLineForTyping, // Phonetic typing characters
        category: "custom" as const,
        categoryName: isEnglishMode ? "Full Text Spelling" : "全文拼写",
        meaning: isEnglishMode 
          ? `Line ${index + 1} of custom document` 
          : `自定义文稿第 ${index + 1} 行`,
        rarity: "SR" as const,
        rarityName: isEnglishMode ? "Special" : "珍贵",
        glowColor: "rgba(245,158,11,0.15)",
        borderColor: "border-amber-400/60",
        bgGradient: "from-amber-500/10 to-stone-900/40",
        segments: generatedSegments
      };
    });

    if (setCustomCards) {
      setCustomCards((prev) => {
        const existingIds = prev.map((c) => c.id);
        const filteredNewItems = newItems.filter((item) => !existingIds.includes(item.id));
        return [...prev, ...filteredNewItems];
      });
    }

    setParseSuccess(isEnglishMode 
      ? `Successfully loaded ${newItems.length} lines for Full-Text Typing!` 
      : `已成功加载 ${newItems.length} 行文本，开启全文直接拼写打字模式！`
    );
    setDocText("");
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualKanji.trim() || !manualMeaning.trim()) {
      setParseError(isEnglishMode ? "Word and Meaning are required." : "原词和释义是必填项！");
      return;
    }

    const cleanKanji = manualKanji.trim();
    const cleanKana = isEnglishMode ? cleanKanji.toLowerCase() : (manualKana.trim() || cleanKanji);
    const cleanMeaning = manualMeaning.trim();
    const uniqueId = "custom-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);

    // generate segments
    let generatedSegments = [];
    if (isEnglishMode) {
      generatedSegments = cleanKanji.split("").map((char) => ({
        kana: char,
        romaji: [char.toLowerCase()],
        displayRomaji: char
      }));
    } else {
      generatedSegments = splitKanaIntoSyllables(cleanKana);
    }

    if (generatedSegments.length === 0) {
      setParseError(isEnglishMode ? "Failed to parse characters." : "无法正确解析假名音节，请检查输入。");
      return;
    }

    const newItem: DictionaryItem = {
      id: uniqueId,
      kanji: cleanKanji,
      kanaStr: cleanKana,
      category: "custom",
      categoryName: "自定义/我的文稿",
      meaning: cleanMeaning,
      rarity: "SR",
      rarityName: isEnglishMode ? "Elite (SR)" : "卓越 (SR)",
      glowColor: "rgba(245, 158, 11, 0.25)",
      borderColor: "border-amber-400",
      bgGradient: "from-amber-50 to-orange-100",
      segments: generatedSegments
    };

    if (setCustomCards) {
      setCustomCards((prev) => [...prev, newItem]);
    }

    setParseSuccess(isEnglishMode ? "Word added successfully!" : "手动添加自定义卡牌成功！");
    setParseError("");
    setManualKanji("");
    setManualKana("");
    setManualMeaning("");
  };

  const [activeTab, setActiveTab ] = useState<"intro" | "rules">("intro");

  // Filter dictionary based on unlocked status or category
  const filteredDict = activeDict.filter((item) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "locked") return !collectedIds.includes(item.id) && item.category !== "custom";
    if (selectedCategory === "unlocked") return collectedIds.includes(item.id) || item.category === "custom";
    return item.category === selectedCategory;
  });

  // Automatically keep CARD selections synchronized with sessionLimit with randomized additions
  React.useEffect(() => {
    setSelectedCardIds((prev) => {
      const poolIds = filteredDict.map(item => item.id);
      
      // Filter visible on current pool list
      let currentValid = prev.filter(id => poolIds.includes(id));
      
      if (currentValid.length > sessionLimit) {
        return currentValid.slice(0, sessionLimit);
      }
      
      if (currentValid.length < sessionLimit) {
        const needed = sessionLimit - currentValid.length;
        const remaining = poolIds.filter(id => !currentValid.includes(id));
        // Shuffle remaining to ensure selections feel truly randomized and fresh
        const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
        const extra = shuffledRemaining.slice(0, needed);
        return [...currentValid, ...extra];
      }
      
      return currentValid;
    });
  }, [sessionLimit, selectedCategory]);

  const handleRandomizeSelection = () => {
    if (filteredDict.length === 0) return;
    const shuffled = [...filteredDict].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(sessionLimit, shuffled.length)).map(item => item.id);
    setSelectedCardIds(selected);
  };

  const handleToggleCheckbox = (id: string) => {
    setSelectedCardIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one checked
        return prev.filter((x) => x !== id);
      } else {
        if (prev.length >= sessionLimit) {
          // CAP at limit and rotate (FIFO)
          return [...prev.slice(1), id];
        }
        return [...prev, id];
      }
    });
  };

  const handleStartGroupTraining = () => {
    const selectedItems = selectedCardIds
      .map((id) => activeDict.find((item) => item.id === id))
      .filter((it): it is DictionaryItem => !!it);

    if (selectedItems.length === 0) return;

    let finalMinutes = durationMinutes;
    if (showCustomTime) {
      const parsed = parseInt(customMinutesText, 10);
      if (!isNaN(parsed) && parsed > 0) {
        finalMinutes = parsed;
      } else {
        // Fallback to elegant default of 3 minutes
        finalMinutes = 3;
      }
    }
    onStartTraining(selectedItems, finalMinutes * 60 * 1000);
  };

  // Pick a target card to lock-in for training
  const handleSelectCardForTraining = (item: DictionaryItem) => {
    let finalMinutes = durationMinutes;
    if (showCustomTime) {
      const parsed = parseInt(customMinutesText, 10);
      if (!isNaN(parsed) && parsed > 0) {
        finalMinutes = parsed;
      } else {
        // Fallback to elegant default of 3 minutes
        finalMinutes = 3;
      }
    }
    onStartTraining([item], finalMinutes * 60 * 1000);
  };

  const handleRandomDraw = () => {
    // Pick from locked first to encourage collecting, or any if all are collected
    const lockedList = activeDict.filter(item => !collectedIds.includes(item.id));
    const targetPool = lockedList.length > 0 ? lockedList : activeDict;
    const randomIndex = Math.floor(Math.random() * targetPool.length);
    handleSelectCardForTraining(targetPool[randomIndex]);
  };

  const currentProgressPercent = Math.min(
    100,
    Math.round((collectedIds.length / activeDict.length) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 px-2 md:px-0 relative">
      {/* Delicate woodblock corner borders */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-stone-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-stone-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-stone-400 pointer-events-none" />
      
      {/* 1. Main Hero Landing Section (pixel perfect representation of the image) */}
      <div className="relative pt-6 pb-6 overflow-hidden select-none min-h-[310px] md:min-h-[330px] flex flex-col justify-between">
        <svg style={{ position: "absolute", top: "30px", left: 0, width: "100%", height: "320px", pointerEvents: "none", zIndex: 0 }} viewBox="0 0 1400 320" preserveAspectRatio="none" aria-hidden="true">
          <path d="M -60 105 C 300 105, 560 40, 800 90 C 1000 120, 1180 130, 1470 110" fill="none" stroke="#C4482A" strokeWidth="13" strokeLinecap="round"/>
        </svg>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative" style={{ zIndex: 1 }}>
          {/* Left Column: Stacked Calligraphy logo and Start Controls */}
          <div className="md:col-span-7 space-y-6 md:space-y-8">
            {/* The Stacked カタ文字 with shifted overlap */}
            <div className="relative pl-4">
              <h1 className="text-7xl md:text-[5.5rem] font-serif font-bold text-stone-900 leading-none tracking-wider select-none" style={{ textShadow: "4px 4px 0px #f2ede0, -4px -4px 0px #f2ede0, 4px -4px 0px #f2ede0, -4px 4px 0px #f2ede0, 0px 4px 0px #f2ede0, 4px 0px 0px #f2ede0, 0px -4px 0px #f2ede0, -4px 0px 0px #f2ede0" }}>
                カタ
              </h1>
              <h1 className="text-7xl md:text-[5.5rem] font-serif font-bold text-[#C4482A] leading-none tracking-wider select-none pl-14 md:pl-16 -mt-8 md:-mt-10" style={{ textShadow: "4px 4px 0px #f2ede0, -4px -4px 0px #f2ede0, 4px -4px 0px #f2ede0, -4px 4px 0px #f2ede0, 0px 4px 0px #f2ede0, 4px 0px 0px #f2ede0, 0px -4px 0px #f2ede0, -4px 0px 0px #f2ede0" }}>
                カタ
              </h1>
            </div>

            {/* Tagline/Subtitle for mobile only */}
            <div className="md:hidden mt-4 pl-4 flex items-center gap-3 select-none">
              <span className="px-2 py-0.5 bg-[#C4482A] text-[#F3EFE3] text-[10px] font-serif rounded rotate-[-2deg] shadow-xs shrink-0">
                秘藏
              </span>
              <span className="font-serif text-xs tracking-widest text-stone-850 leading-relaxed">
                {isEnglishMode ? "和风洋词熟化 · 英文打字图鉴" : "五十音集卡练习 · 打字图鉴"}
              </span>
            </div>

            {/* Daily Practice Start Button & Custom Settings */}
            <div className="flex flex-col gap-4 pl-4 pt-6 md:pt-8 z-20 relative">
              <div className="flex items-center gap-5 flex-wrap">
                <button
                  onClick={() => {
                    const shuffled = [...activeDict].sort(() => Math.random() - 0.5);
                    const selected = shuffled.slice(0, Math.min(customCardCount, shuffled.length));
                    onStartTraining(selected, customTimerMinutes * 60 * 1000);
                  }}
                  className="px-6 py-3.5 bg-stone-900 text-[#F3EFE3] hover:bg-[#A33B22] active:scale-98 transition-all font-serif font-bold text-sm tracking-widest rounded-sm shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>开始今日练习</span>
                </button>

                {dueCardIds.length > 0 ? (
                  <button
                    onClick={() => {
                      const data = getDictionary(isEnglishMode, isKatakanaMode);
                      const dueCards = data.filter(item => dueCardIds.includes(item.id));
                      onStartTraining(dueCards, customTimerMinutes * 60 * 1000);
                    }}
                    className="text-xs font-serif font-bold text-[#C4482A] hover:text-red-700 tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>待复习</span>
                    <span className="mx-1">{toHanNumerals(dueCardIds.length)}</span>
                    <span>张</span>
                  </button>
                ) : (
                  <span className="text-xs font-serif text-stone-400 tracking-wider">
                    （无待复习卡牌）
                  </span>
                )}
              </div>

              {/* Minimalistic Selectors for card count and timer */}
              <div className="flex items-center gap-6 text-xs font-serif text-stone-750 flex-wrap mt-1">
                {/* Custom Card Count selector */}
                <div className="flex items-center gap-2">
                  <span className="text-stone-500">练习张数</span>
                  <div className="flex items-center border border-stone-400/80 bg-[#f2ede0]/40 rounded-sm overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setCustomCardCount(prev => Math.max(1, prev - 1))}
                      className="px-2 py-1 bg-stone-100 hover:bg-[#A33B22]/10 transition-colors border-r border-stone-300 font-bold cursor-pointer select-none"
                    >
                      －
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customCardCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 3;
                        setCustomCardCount(Math.min(100, Math.max(1, val)));
                      }}
                      className="w-10 text-center bg-transparent focus:outline-none font-bold text-stone-800"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomCardCount(prev => Math.min(100, prev + 1))}
                      className="px-2 py-1 bg-stone-100 hover:bg-[#A33B22]/10 transition-colors border-l border-stone-300 font-bold cursor-pointer select-none"
                    >
                      ＋
                    </button>
                  </div>
                  <span className="text-stone-400">张</span>
                </div>

                {/* Custom Timer Selector (1-30 mins) */}
                <div className="flex items-center gap-2">
                  <span className="text-stone-500">定时功能</span>
                  <div className="flex items-center border border-stone-400/80 bg-[#f2ede0]/40 rounded-sm overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setCustomTimerMinutes(prev => Math.max(1, prev - 1))}
                      className="px-2 py-1 bg-stone-100 hover:bg-[#A33B22]/10 transition-colors border-r border-stone-300 font-bold cursor-pointer select-none"
                    >
                      －
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={customTimerMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 3;
                        setCustomTimerMinutes(Math.min(30, Math.max(1, val)));
                      }}
                      className="w-10 text-center bg-transparent focus:outline-none font-bold text-stone-800"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomTimerMinutes(prev => Math.min(30, prev + 1))}
                      className="px-2 py-1 bg-stone-100 hover:bg-[#A33B22]/10 transition-colors border-l border-stone-300 font-bold cursor-pointer select-none"
                    >
                      ＋
                    </button>
                  </div>
                  <span className="text-stone-400">分钟</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Double Ornament Circle & Vertical texts */}
          <div className="hidden md:flex md:col-span-5 items-center justify-center relative min-h-[220px]">
            {/* Large Concentric circles removed as requested to keep the layout minimal and premium */}

            {/* Double columns vertical text running right-to-left replaced with single div */}
            <div style={{ writingMode: "vertical-rl", height: "220px", fontFamily: "'Yu Mincho','Hiragino Mincho ProN',serif", fontSize: "14px", letterSpacing: "0.35em", lineHeight: 1.9, color: "#221E18" }} className="relative z-10 select-none">
              {isEnglishMode ? "和风洋词熟化・英文打字图鉴" : "五十音集卡练习・打字图鉴"}
            </div>

            {/* Stamp Box '秘藏' */}
            <div style={{ width: "44px", height: "44px", background: "#C4482A", color: "#F3EFE3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Yu Mincho','Hiragino Mincho ProN',serif", fontSize: "15px", writingMode: "vertical-rl", letterSpacing: "0.15em", transform: "rotate(-3deg)", borderRadius: "3px" }} className="absolute top-6 right-6 z-20 select-none shadow-sm">秘藏</div>
          </div>
        </div>
      </div>

      {/* 2. Three Interactive Activity Tracks */}
      <div className="border-t border-stone-300 pt-6 select-none relative">
        {/* Giant transparent Kanji watermark in left background */}
        <div className="absolute -left-6 -bottom-16 text-[18rem] md:text-[22rem] font-serif text-stone-900/[0.03] leading-none pointer-events-none select-none z-0">
          力
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Track 1: 风雅学宫 (Handwriting/typing single character exercise) */}
          <div 
            className="group p-4 border border-stone-300/40 hover:border-stone-300 rounded transition-all duration-300 relative select-none bg-stone-50/30"
          >
            <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-300/40 mb-3 font-serif">
              <span className="text-[#C4482A] font-black text-sm">壹</span>
              <span className="text-stone-500 font-bold">熟记</span>
            </div>
            <h3 className="font-serif font-black text-stone-900 text-lg tracking-wider">
              风雅学宫
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-2 tracking-wide leading-relaxed">
              五十音单字高频练习，巩固地基
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => onGoToKanaTraining("hiragana")}
                className="py-1.5 px-2 rounded border border-stone-300 hover:border-[#C4482A] hover:bg-[#C4482A] hover:text-white transition-all text-[11px] font-serif font-bold text-stone-700 bg-white shadow-xs cursor-pointer text-center"
              >
                平假名熟化
              </button>
              <button
                onClick={() => onGoToKanaTraining("katakana")}
                className="py-1.5 px-2 rounded border border-stone-300 hover:border-amber-600 hover:bg-amber-600 hover:text-white transition-all text-[11px] font-serif font-bold text-stone-700 bg-white shadow-xs cursor-pointer text-center"
              >
                片假名训练区
              </button>
            </div>
          </div>

          {/* Track 2: 时钟疾驰 (Speed run romanization race) */}
          <div 
            onClick={onGoToSpellRush}
            className="group cursor-pointer hover:bg-stone-200/20 p-4 border border-transparent hover:border-stone-300 rounded transition-all duration-300 relative select-none"
          >
            <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-300/40 mb-3 font-serif">
              <span className="text-[#C4482A] font-black text-sm">贰</span>
              <span className="text-stone-500 font-bold">竞速</span>
            </div>
            <h3 className="font-serif font-black text-stone-900 text-lg tracking-wider group-hover:text-[#C4482A] transition-colors">
              时钟疾驰
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-2 tracking-wide leading-relaxed">
              六十秒罗马音限时竞速
            </p>
          </div>

          {/* Track 3: 风雅和歌 (Classic card pair memory match game) */}
          <div 
            onClick={onGoToMemoryMatch}
            className="group cursor-pointer hover:bg-stone-200/20 p-4 border border-transparent hover:border-stone-300 rounded transition-all duration-300 relative select-none"
          >
            <div className="flex justify-between items-center text-xs pb-2 border-b border-stone-300/40 mb-3 font-serif">
              <span className="text-[#C4482A] font-black text-sm">叁</span>
              <span className="text-stone-500 font-bold">对碰</span>
            </div>
            <h3 className="font-serif font-black text-stone-900 text-lg tracking-wider group-hover:text-[#C4482A] transition-colors">
              风雅和歌
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-2 tracking-wide leading-relaxed">
              经典翻牌记忆配对
            </p>
          </div>
        </div>
      </div>

      {/* 3. Footer Stats Section */}
      <div className="border-t border-stone-300 pt-4 flex items-center justify-between select-none relative pb-6 text-stone-700 font-serif text-xs z-10">
        <div className="flex items-center gap-2 w-full">
          <span className="shrink-0">图鉴</span>
          <div className="h-[1px] bg-stone-300 flex-grow" />
          <div className="font-serif text-sm px-4 shrink-0 select-none">
            {toHanNumerals(collectedIds.length)} / {toHanNumerals(activeDict.length)}
          </div>
          <div className="h-[1px] bg-stone-300 flex-grow" />
          <div className="flex items-center gap-2 shrink-0 select-none">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
            </svg>
            <span>连续</span>
            <span className="font-black text-[#C4482A]">{toHanNumerals(totalRounds > 0 ? Math.min(7, Math.max(1, Math.floor(totalRounds / 2))) : 0)}</span>
            <span>日</span>
          </div>
        </div>
      </div>

      {/* 4. Advanced Custom Scholar's Panel (Collapsible to keep the landing area absolute pristine) */}
      <div className="border-t border-dashed border-stone-300 pt-6">
        <button
          onClick={() => setShowAdvancedPanel(prev => !prev)}
          className="w-full py-3 px-4 border border-stone-300 hover:border-stone-800 transition-all text-xs font-serif font-bold text-stone-700 hover:text-stone-950 flex items-center justify-between bg-white/40 rounded shadow-sm cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span>🛠️</span>
            <span>{showAdvancedPanel ? "收起学者高级自定义中心 / Collapse Advanced Config" : "展开学者高级自定义中心 / Open Advanced Config"}</span>
          </div>
          <span>{showAdvancedPanel ? "▲" : "▼"}</span>
        </button>

        {showAdvancedPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="space-y-8 mt-6"
          >
            {/* COMPREHENSIVE PRACTICE DASHBOARD & DAILY REVISION ENGINE ("练习仪表盘" & "每日回顾") */}
            <div className="p-6 rounded-2xl border-2 border-stone-800 bg-[#f9f7f4] space-y-6 shadow-sm select-none relative overflow-hidden">
        {/* Abstract background ink painting watermark */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.02] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-stone-900">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300/60 pb-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black text-amber-800 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Ledger & Revision Station
            </span>
            <h2 className="text-xl font-black text-stone-900 font-serif flex items-center gap-1.5">
              <BarChart2 className="w-5 h-5 text-amber-600" />
              <span>{isEnglishMode ? "英文拼写数据仪 & 每日回顾温故" : "练习数据仪表盘 & 每日回顾温故"}</span>
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-mono text-left sm:text-right">
            {isEnglishMode ? "当前单词熟力值" : "当前熟力值"} : <span className="text-amber-800 font-bold">{totalRounds}</span> {isEnglishMode ? "圈拼写大熟化" : "圈大熟化"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Dashboard Left Column: Stats & Category Mastery */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-4 rounded-xl border border-stone-300/80 bg-white shadow-inner grid grid-cols-3 gap-3">
              {/* Level progressive badge */}
              <div className="text-center border-r border-stone-200 pr-1 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-stone-400 block">{isEnglishMode ? "SPELLING LEVEL" : "拼写修炼等级"}</span>
                <div className="my-1 flex flex-col items-center justify-center">
                  <Award className="w-7 h-7 text-amber-600 animate-pulse" />
                  <span className="text-xs font-serif font-black text-stone-800 mt-1 block leading-tight">
                    {isEnglishMode ? "Level" : "修炼"} {currentLevel}
                  </span>
                  <span className="text-[9px] font-mono text-stone-500 scale-95 leading-tight">
                    {(() => {
                      if (isEnglishMode) {
                        if (totalRounds < 3) return "Novice";
                        if (totalRounds < 10) return "Apprentice";
                        if (totalRounds < 25) return "Expert";
                        if (totalRounds < 50) return "Master";
                        return "Grandmaster";
                      } else {
                        if (totalRounds < 3) return "无极新星";
                        if (totalRounds < 10) return "略通笔墨";
                        if (totalRounds < 25) return "精进笔法";
                        if (totalRounds < 50) return "翰墨风骨";
                        return "笔圣至尊";
                      }
                    })()}
                  </span>
                </div>
                {/* Micro Level-up Progress Meter */}
                <div className="w-full space-y-0.5 px-1 pb-1">
                  <div className="flex justify-between text-[7.5px] text-stone-400 font-mono scale-95 leading-none">
                    <span>{xp % 250}/250 XP</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden border border-stone-200/50">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Unlocked cards percent */}
              <div className="text-center border-r border-stone-200 px-1 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-stone-400 block">{uiTranslate("收集比例", isEnglishMode, "收集比例")}</span>
                <span className="text-2xl font-black text-stone-900 font-serif block my-1">
                  {Math.round((collectedIds.length / activeDict.length) * 100)}%
                </span>
                <span className="text-[8px] font-mono text-stone-400 block scale-90">
                  {collectedIds.length} / {activeDict.length} 张
                </span>
              </div>

              {/* estimated keystrokes */}
              <div className="text-center pl-1 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-stone-400 block">{uiTranslate("指尖压键数", isEnglishMode, "指尖压键数")}</span>
                <span className="text-2xl font-black text-amber-800 font-serif block my-1 animate-pulse">
                  {Object.entries(practiceTimes).reduce((accum: number, [cardId, rounds]) => {
                    const item = activeDict.find(x => x.id === cardId);
                    const cost = item ? item.segments.length : 3;
                    const roundsNum = Number(rounds || 0);
                    return accum + (roundsNum * cost * 3); // Average keystrokes per session rounds due to error reset overhead
                  }, 0)}+
                </span>
                <span className="text-[8px] font-mono text-stone-400 block scale-90">{isEnglishMode ? "打字手感热度" : "估计打字功力"}</span>
              </div>
            </div>

            {/* Category visual progress meters */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono text-stone-450 uppercase tracking-widest font-bold block">
                类别拼写全熟化比例 Breakdown
              </span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "name", name: isEnglishMode ? "西式人名" : "人名册", color: "bg-slate-450", border: "border-slate-350" },
                  { id: "nature", name: isEnglishMode ? "自然与动物" : "自然物", color: "bg-pink-400", border: "border-pink-300" },
                  { id: "culture", name: isEnglishMode ? "物品与概念" : "民俗祭", color: "bg-purple-500", border: "border-purple-300" },
                  { id: "food", name: isEnglishMode ? "西餐美味" : "和美味", color: "bg-rose-450", border: "border-rose-450" },
                ].map(cat => {
                  const catItems = activeDict.filter(x => x.category === cat.id);
                  const catUnlocked = catItems.filter(x => collectedIds.includes(x.id));
                  const percent = catItems.length > 0 ? Math.round((catUnlocked.length / catItems.length) * 100) : 0;
                  return (
                    <div key={cat.id} className="p-2.5 rounded-lg bg-white border border-stone-250 shadow-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-stone-700">{cat.name}</span>
                        <span className="text-[10px] font-mono text-stone-450 font-bold">{catUnlocked.length}/{catItems.length}</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Typing Speed & Accuracy Line-Chart (Velocity Trends) */}
            <div className="p-4 rounded-xl border border-stone-250 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-stone-450 uppercase tracking-widest font-bold block">
                  {isEnglishMode ? "🔥 Typing Velocity & Accuracy Trends" : "🔥 指尖速度与准确率演变趋势"}
                </span>
                {sessionLogs.length > 0 && (
                  <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    KPM Line Chart
                  </span>
                )}
              </div>

              {sessionLogs.length === 0 ? (
                <div className="h-28 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-lg bg-stone-50 text-center p-3 text-stone-405 space-y-1">
                  <Activity className="w-5 h-5 text-stone-300 animate-pulse" />
                  <span className="text-xs font-serif font-black text-stone-600">指尖蓄势待发...</span>
                  <span className="text-[10px] font-mono leading-tight max-w-xs text-stone-450">
                    {isEnglishMode ? "Complete at least one spelling session to unlock high-fidelity performance metrics!" : "开始进行一次拼写练习，即可在此处激活高精度的KPM速率演变曲线图！"}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Performance Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-left bg-stone-50 p-2 rounded-lg border border-stone-150">
                    <div>
                      <span className="text-[9px] font-mono text-stone-400 block">{isEnglishMode ? "AVERAGE SPEED" : "平均打字速率"}</span>
                      <span className="text-sm font-black text-stone-800 font-mono">
                        {Math.round(sessionLogs.reduce((acc: number, curr: any) => acc + curr.kpm, 0) / sessionLogs.length)} <span className="text-[10px] font-normal text-stone-500">KPM</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-stone-400 block">{isEnglishMode ? "AVG ACCURACY" : "平均拼写正确率"}</span>
                      <span className="text-sm font-black text-stone-800 font-mono">
                        {Math.round(sessionLogs.reduce((acc: number, curr: any) => acc + curr.accuracy, 0) / sessionLogs.length)}%
                      </span>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative w-full h-24">
                    {(() => {
                      const maxKpm = Math.max(...sessionLogs.map((l: any) => l.kpm), 100);
                      const width = 400;
                      const height = 90;
                      
                      // Map coordinates
                      const points = sessionLogs.map((log: any, index: number) => {
                        const x = sessionLogs.length > 1 ? (index / (sessionLogs.length - 1)) * (width - 40) + 20 : width / 2;
                        const y = height - ((log.kpm / maxKpm) * (height - 30)) - 10;
                        return { x, y, kpm: log.kpm, date: log.date };
                      });

                      const pathD = points.length > 1
                        ? `M ${points.map(p => `${p.x} ${p.y}`).join(" L ")}`
                        : "";

                      return (
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                          {/* Grid Lines */}
                          <line x1="10" y1={height - 10} x2={width - 10} y2={height - 10} stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="10" y1="10" x2={width - 10} y2="10" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3 3" />

                          {/* Line Path */}
                          {points.length > 1 && (
                            <>
                              {/* Filled Area Gradient */}
                              <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              <path
                                d={`${pathD} L ${points[points.length - 1].x} ${height - 10} L ${points[0].x} ${height - 10} Z`}
                                fill="url(#chartGrad)"
                              />
                              {/* Line */}
                              <path
                                d={pathD}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </>
                          )}

                          {/* Data points */}
                          {points.map((pt, i) => (
                            <g key={i} className="group">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="4"
                                fill="#ffffff"
                                stroke="#d97706"
                                strokeWidth="2"
                                className="transition-all duration-150 hover:r-6 cursor-pointer"
                              />
                              {/* Text tooltip on hover */}
                              <text
                                x={pt.x}
                                y={pt.y - 10}
                                textAnchor="middle"
                                className="text-[8px] font-mono font-bold fill-amber-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-white px-1"
                              >
                                {pt.kpm}
                              </text>
                              {/* Date labels */}
                              {i % Math.max(1, Math.floor(points.length / 4)) === 0 && (
                                <text
                                  x={pt.x}
                                  y={height + 2}
                                  textAnchor="middle"
                                  className="text-[7px] font-mono fill-stone-400"
                                >
                                  {pt.date}
                                </text>
                              )}
                            </g>
                          ))}
                        </svg>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Right Column: "每日回顾 (Daily Review)" suggestion module */}
          <div className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-300/60 pt-4 md:pt-0 md:pl-6 space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-rose-700 font-black uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-600 animate-spin-slow" />
                <span>{isEnglishMode ? "Spaced Repetition System" : "间隔复习系统 (SRS)"}</span>
              </span>
              <h3 className="text-sm font-black font-serif text-stone-800">
                {isEnglishMode ? "今日待温故卡牌" : "今日待温故卡牌 Daily Review"}
              </h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                {srsSummary.dueCount > 0 
                  ? (isEnglishMode 
                      ? "The following cards are due for review today according to the forgetting curve:" 
                      : `以下 ${srsSummary.dueCount} 张卡牌已到达科学复习区间，温故而知新，可以为师矣：`)
                  : srsSummary.nextDueInDays !== null
                    ? (isEnglishMode
                        ? `Awesome! Next review will be ready in ${srsSummary.nextDueInDays} days.`
                        : `所有卡牌都已温习完毕！下一批卡牌将在 ${srsSummary.nextDueInDays} 天后到达复习点。`)
                    : (isEnglishMode
                        ? "Unlock more cards to activate the Spaced Repetition Engine."
                        : "尚未收集卡牌，暂无复习日程。快去练习以解锁你的专属卡牌吧！")}
              </p>
            </div>

            {(() => {
              const dueIds = getDueCardIds(collectedIds);
              const dueCards = activeDict.filter(item => dueIds.includes(item.id));
              const displayCards = dueCards.slice(0, 3);

              if (displayCards.length === 0) {
                // If no cards are due, let's show general low-practice recommendations
                const unlockedItems = activeDict.filter(item => collectedIds.includes(item.id));
                const sortedUnlocked = [...unlockedItems].sort((a, b) => (practiceTimes[a.id] || 0) - (practiceTimes[b.id] || 0));
                const recommendedCards = sortedUnlocked.slice(0, 3);

                if (recommendedCards.length === 0) {
                  return (
                    <div className="flex-1 p-4 rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center text-center space-y-1.5 bg-white">
                      <BookOpenCheck className="w-7 h-7 text-stone-350" />
                      <p className="text-[11px] font-bold text-stone-600">{isEnglishMode ? "No Review Cards" : "暂无待复习卡牌"}</p>
                      <p className="text-[10px] text-stone-400 max-w-xs">
                        {isEnglishMode 
                          ? "Spike your spelling sessions downward to unlock beautiful classical collectible cards!" 
                          : "目前你还没有收集到任何卡牌。在下方词库列表点击【拼写熟化】一轮，即可开启每日温顾智能引擎！"}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      {recommendedCards.map(item => (
                        <div key={item.id} className="p-1.5 px-2.5 rounded-lg bg-white border border-stone-250 flex items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-black text-stone-900 text-sm">
                              {item.kanji}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {isEnglishMode ? "" : `(${item.kanaStr})`}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-amber-800 bg-amber-500/10 px-1.5 rounded font-black border border-amber-500/20">
                            {isEnglishMode ? `Practiced ${practiceTimes[item.id] || 0} rounds` : `已练 ${practiceTimes[item.id] || 0} 轮`}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      disabled
                      className="w-full py-2.5 rounded-sm border border-stone-200 bg-stone-50 text-stone-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>
                        {srsSummary.nextDueInDays !== null 
                          ? (isEnglishMode ? `Next Review in ${srsSummary.nextDueInDays} days` : `${srsSummary.nextDueInDays} 天后复习`)
                          : (isEnglishMode ? "No Due Cards" : "明日待复习")}
                      </span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    {displayCards.map(item => (
                      <div key={item.id} className="p-1.5 px-2.5 rounded-lg bg-white border border-stone-250 flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-black text-[#C4482A] text-sm">
                            {item.kanji}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {isEnglishMode ? "" : `(${item.kanaStr})`}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-[#C4482A] bg-red-500/10 px-1.5 rounded font-black border border-red-500/20">
                          {isEnglishMode ? "DUE NOW" : "今日待复习"}
                        </span>
                      </div>
                    ))}
                    {dueCards.length > 3 && (
                      <div className="text-[10px] text-stone-400 text-right pr-1">
                        {isEnglishMode ? `And ${dueCards.length - 3} more...` : `以及其他 ${dueCards.length - 3} 张...`}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      // Begin targeted training immediately with due cards
                      onStartTraining(dueCards, 3 * 60 * 1000);
                    }}
                    className="w-full py-2.5 rounded-sm bg-[#C4482A] border border-[#C4482A] hover:bg-red-800 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isEnglishMode ? `Review Now (${dueCards.length} cards) ＞` : `今日复习 (${dueCards.length}) ＞`}</span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* 7-Day practice streak matrix simulation */}
        <div className="pt-3 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-stone-450" />
            <span className="font-serif font-bold text-stone-750">{isEnglishMode ? "7-Day Streak & Core Progress Ledger:" : "七日功勋印社（假名打卡大连契）:"}</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
            {(isEnglishMode ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["月", "火", "水", "木", "金", "土", "日"]).map((day, idx) => {
              // Simulate day highlights based on user practicing active rounds
              const isActive = totalRounds > 0 && (idx === 0 || idx === 1 || (totalRounds >= 4 && idx === 2) || (totalRounds >= 10 && idx === 4) || (totalRounds >= 20 && idx === 6));
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-stone-400 select-all">{day}</span>
                  <div 
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                      isActive 
                        ? "bg-amber-500/20 border-amber-500 text-amber-900 font-black animate-pulse shadow-md" 
                        : "bg-white border-stone-250 text-stone-350"
                    }`}
                    title={isActive ? "Completed" : "Pending"}
                  >
                    {isActive ? "印" : "默"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main training config panel */}
      <div className="p-6 md:p-8 rounded-2xl border-2 border-stone-800 bg-stone-50 shadow-md space-y-6">
        <div>
          <h2 className="text-2xl font-black text-stone-950 font-serif flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-amber-600" />
            {isEnglishMode ? "第一步：设定本次训练拼写时长" : "第一步：设定本次循环的时长"}
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-1">THE TRAINING TIME ENGINE CONFIGURATION</p>
        </div>

        {/* Customized training period picker - Full implementation of User requested customizable training duration */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 3, 5, 10].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setDurationMinutes(mins);
                setShowCustomTime(false);
              }}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-mono font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                durationMinutes === mins && !showCustomTime
                  ? "border-stone-900 bg-stone-900 text-stone-50 shadow-inner"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:bg-stone-100"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{mins} 分钟</span>
            </button>
          ))}
          <button
            onClick={() => setShowCustomTime(true)}
            className={`py-3 px-4 rounded-xl border-2 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              showCustomTime
                ? "border-amber-600 bg-amber-50 text-amber-900"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:bg-stone-100"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{isEnglishMode ? "其它自定义时长" : "其它自定义"}</span>
          </button>
        </div>

        {/* Custom time text field */}
        {showCustomTime && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center gap-3 overflow-hidden"
          >
            <div className="text-xs text-amber-800 font-medium">
              {isEnglishMode ? "Please enter your custom timer duration (minutes):" : "请输入您的自定义计时长度（分钟）:"}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutesText}
                onChange={(e) => setCustomMinutesText(e.target.value)}
                placeholder={isEnglishMode ? "e.g. 8" : "例如: 8"}
                className="w-24 px-3 py-1.5 rounded border border-stone-300 bg-white font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs text-stone-600 font-sans">{isEnglishMode ? "min" : "分钟"}</span>
            </div>
            <div className="text-[11px] text-amber-700 italic">
              {isEnglishMode ? "（连续高强度拼写大脑会形成神经记忆，建议设定 3 至 10 分钟）" : "（训练将在极短时间内产生肌肉习惯，建议设定 3 至 10 分钟）"}
            </div>
          </motion.div>
        )}

        <hr className="border-stone-300" />

        {/* Practice Mode Toggle Block */}
        <div>
          <h2 className="text-2xl font-black text-stone-950 font-serif flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-amber-600" />
            {isEnglishMode ? "第二步：选择英文练习交互模式" : "第二步：选择练习模式"}
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-1">SELECT PREFERRED INTERACTION SYSTEM MODE</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setPracticeMode("typing")}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer flex items-start gap-3 ${
              practiceMode === "typing"
                ? "border-stone-900 bg-stone-900 text-stone-50 shadow-md"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:bg-stone-55"
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${practiceMode === "typing" ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-600"}`}>
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">{isEnglishMode ? "字母打字练习模式" : "打字练习模式"}</div>
              <p className={`text-[11px] mt-1 leading-normal ${practiceMode === "typing" ? "text-stone-300" : "text-stone-500"}`}>
                {isEnglishMode 
                  ? "敲击键盘物理键位或屏幕虚拟输入。以连续英文字母进行高速拼写验证，在规定时间内强化手脑协调拼写直觉。" 
                  : "敲击键盘物理键位或虚拟输入。以罗马音（Romaji）进行高速拼写验证，在规定循环内牢固肌肉敲击神经直觉。"}
              </p>
            </div>
          </button>

          <button
            onClick={() => setPracticeMode("handwriting")}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer flex items-start gap-3 ${
              practiceMode === "handwriting"
                ? "border-stone-900 bg-stone-900 text-stone-50 shadow-md"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:bg-stone-50"
            }`}
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${practiceMode === "handwriting" ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-600"}`}>
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">{isEnglishMode ? "手写字母临摹模式" : "手写描红模式"}</div>
              <p className={`text-[11px] mt-1 leading-normal ${practiceMode === "handwriting" ? "text-stone-300" : "text-stone-500"}`}>
                {isEnglishMode 
                  ? "在格内进行指尖或触控手写英文字母临摹。AI 智能审查字母笔锋契合度与溢出率，快速掌握字母的标准正规书写。" 
                  : "在格内进行指尖或手写笔划描红临摹。AI 智能审查笔锋契合度与溢出率，契合物理触觉，快速掌握假名风骨结构。"}
              </p>
            </div>
          </button>
        </div>

        <hr className="border-stone-300" />

        {/* Select Card deck section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-stone-950 font-serif flex items-center gap-2">
                <Sparkles className="w-5.5 h-5.5 text-amber-600" />
                {isEnglishMode ? "第三步：选择目标英文词汇组合进行熟化" : "第三步：选择目标人名 / 词汇组合进行熟化"}
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-1">CHOOSE TARGET CARDS ACCORDING TO DEEPEST TYPING ENZYME LIMIT</p>
            </div>
            <button
              onClick={handleRandomDraw}
              className="px-4 py-2 rounded-xl bg-orange-600 text-stone-50 hover:bg-orange-700 font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isEnglishMode ? "随机抽取单词" : "随机大密抽卡"}</span>
            </button>
          </div>

          {/* Dictionary Filtering Controls */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4 border-b border-stone-200 pb-3">
            {[
              { id: "all", label: "全部词库" },
              { id: "locked", label: "尚未解锁" },
              { id: "unlocked", label: "已经收集" },
              { id: "name", label: isEnglishMode ? "西式人名" : "日本常见人名" },
              { id: "nature", label: isEnglishMode ? "自然与动物" : "四季自然" },
              { id: "culture", label: isEnglishMode ? "物品与概念" : "民俗祭典" },
              { id: "food", label: isEnglishMode ? "西餐美味" : "和食美味" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1 px-3 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-stone-900 text-stone-50"
                    : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Custom Document & Parsing Workspace */}
          {selectedCategory === "custom" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-stone-50 border border-stone-200 rounded-2xl shadow-sm space-y-6 text-left"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <span>{isEnglishMode ? "My Custom Document Workspace" : "我的自定义学习文稿 & 词库工作台"}</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {isEnglishMode 
                      ? "Directly paste texts, drag-and-drop .txt files, or add manually. We use Gemini AI to smartly parse vocabulary!" 
                      : "可直接粘贴文章、拖入.txt文件或手动录入。系统使用 Gemini AI 进行智能分词和音节标注，可用于练习您喜欢的日语歌词、新闻或台词！"}
                  </p>
                </div>
              </div>

              {/* Status / Errors Feedback Banner */}
              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
              {parseSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{parseSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side: AI smart parse */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
                    {isEnglishMode ? "Option A: Paste Document / Drop File" : "方式一：AI 智能解析整篇文稿/歌词"}
                  </label>
                  
                  {/* File drop zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                      isDragging 
                        ? "border-amber-500 bg-amber-50" 
                        : "border-stone-300 hover:border-stone-400 bg-stone-100/50"
                    }`}
                  >
                    <Upload className="w-6 h-6 text-stone-400 mb-2" />
                    <p className="text-xs text-stone-600 font-medium text-center">
                      {isEnglishMode 
                        ? "Drag and drop your .txt file here, or " 
                        : "拖拽您的 .txt 文本文件至此，或者"}
                      <label className="text-amber-600 hover:text-amber-700 underline cursor-pointer font-bold ml-1">
                        {isEnglishMode ? "Browse" : "浏览文件"}
                        <input
                          type="file"
                          accept=".txt"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1 font-mono">UTF-8 TXT ONLY</p>
                  </div>

                  <div className="relative">
                    <textarea
                      value={docText}
                      onChange={(e) => setDocText(e.target.value)}
                      placeholder={isEnglishMode 
                        ? "Or paste your custom text paragraphs here..." 
                        : "或者在此处粘贴您的自定义日语文章、歌词、经典名句段落..."}
                      className="w-full h-32 px-3.5 py-3 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-stone-800 placeholder-stone-400 bg-white"
                    />
                    {docText && (
                      <button
                        onClick={() => setDocText("")}
                        className="absolute bottom-3 right-3 text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-600 px-2 py-1 rounded cursor-pointer"
                      >
                        {isEnglishMode ? "Clear" : "清空输入"}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={handleDirectFullTextSpelling}
                      disabled={isParsing || !docText.trim()}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                        docText.trim()
                          ? "bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md ring-2 ring-amber-300/40" 
                          : "bg-stone-200 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      <Keyboard className="w-4 h-4 text-stone-800" />
                      <span>{isEnglishMode ? "⚡ Direct Full-Text Spelling Mode (Recommended)" : "⚡ 开启全文直接拼写打字模式 (推荐，零延迟)"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAiParse}
                      disabled={isParsing || !docText.trim()}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                        isParsing 
                          ? "bg-stone-300 text-stone-500 cursor-not-allowed" 
                          : docText.trim()
                            ? "bg-stone-900 hover:bg-stone-800 text-stone-100 shadow-sm border border-stone-800" 
                            : "bg-stone-200 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      {isParsing ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin text-stone-500" />
                          <span>{isEnglishMode ? "AI Parsing with Gemini..." : "Gemini AI 正在智能切分并注音..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span>{isEnglishMode ? "AI Vocab Card Extraction" : "Gemini AI 词义切分与卡牌提取 ＞"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right side: Manual Add */}
                <form onSubmit={handleManualAdd} className="space-y-3 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
                      {isEnglishMode ? "Option B: Manual Vocabulary Quick-Add" : "方式二：手动快速添加词条"}
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1 text-left">{isEnglishMode ? "Word (Kanji)" : "原词（中文或汉字）"}</label>
                        <input
                          type="text"
                          required
                          value={manualKanji}
                          onChange={(e) => setManualKanji(e.target.value)}
                          placeholder={isEnglishMode ? "e.g., Apple" : "例如：先生、樱花"}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-stone-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 mb-1 text-left">{isEnglishMode ? "Kana (Pronunciation)" : "全平假名注音"}</label>
                        <input
                          type="text"
                          required={!isEnglishMode}
                          value={manualKana}
                          onChange={(e) => setManualKana(e.target.value)}
                          placeholder={isEnglishMode ? "Auto-derived" : "例如：せんせい、さくら"}
                          disabled={isEnglishMode}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-stone-800 bg-white disabled:bg-stone-100 disabled:text-stone-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1 text-left">{isEnglishMode ? "Chinese Meaning" : "中文简明释义"}</label>
                      <input
                        type="text"
                        required
                        value={manualMeaning}
                        onChange={(e) => setManualMeaning(e.target.value)}
                        placeholder={isEnglishMode ? "e.g., 苹果" : "例如：老师、日本国花"}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-stone-800 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 mt-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>{isEnglishMode ? "Add to Custom Deck" : "手动添加到自定义学习库"}</span>
                  </button>
                </form>
              </div>

              {/* Custom dictionary info status */}
              <div className="pt-3 border-t border-dashed border-stone-200 flex flex-wrap items-center justify-between text-[11px] text-stone-500 font-mono">
                <div>{isEnglishMode ? "Local Storage Cache:" : "本地数据缓存状态:"} <span className="text-amber-600 font-bold">{customCards.length}</span> {isEnglishMode ? "cards" : "条自定义词组"}</div>
                {customCards.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(isEnglishMode ? "Are you sure you want to clear ALL custom cards?" : "您确定要清空所有自定义词组卡牌吗？该操作不可逆。")) {
                        if (setCustomCards) setCustomCards([]);
                        setSelectedCardIds([]);
                        setParseSuccess(isEnglishMode ? "All custom cards cleared." : "已成功清空所有自定义卡牌。");
                      }
                    }}
                    className="text-stone-400 hover:text-red-500 underline cursor-pointer"
                  >
                    {isEnglishMode ? "Clear All Custom Cards" : "清空自定义库"}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Active selection combination bar */}
          {selectedCardIds.length > 0 && (
            <div className="mt-4 p-4 bg-amber-500 text-stone-950 rounded-2xl border border-amber-600 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md select-none">
              <div className="space-y-0.5 text-left">
                <div className="text-[10px] font-mono font-black text-amber-950 tracking-wider">
                  已激活的联合训练词单 ({selectedCardIds.length}/{sessionLimit})
                </div>
                <div className="text-sm font-bold">
                  已在下方勾选{" "}
                  <span className="bg-stone-900 font-mono font-black text-rose-50 px-2 py-0.5 rounded text-xs select-all">
                    {selectedCardIds.length}
                  </span>{" "}
                  {isEnglishMode ? "个英文词汇：" : "位人名词条："}
                  <span className="ml-1 font-serif font-black underline decoration-stone-900 decoration-wavy underline-offset-4">
                    {selectedCardIds
                      .map((id) => {
                        const item = activeDict.find((it) => it.id === id);
                        return item?.kanji || "";
                      })
                      .filter(Boolean)
                      .join("、")}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleRandomizeSelection}
                  className="w-full sm:w-auto px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  title={isEnglishMode ? "Randomly select another set of cards" : "随机换一批训练卡片"}
                >
                  <span>🎲 {isEnglishMode ? "Shuffle" : "换一批"}</span>
                </button>
                <button
                  onClick={handleStartGroupTraining}
                  className="flex-1 sm:flex-initial px-5 py-3 bg-vermilion hover:bg-vermilion/90 text-ink font-black text-sm uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm font-serif"
                >
                  <Sparkles className="w-4 h-4 text-ink" />
                  <span>{isEnglishMode ? `开启 ${selectedCardIds.length} 词连环拼写熟化 ＞` : `开启 ${selectedCardIds.length} 字连环拼音熟化 ＞`}</span>
                </button>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 max-h-[380px] overflow-y-auto pr-1">
            {filteredDict.map((item) => {
              const isUnlocked = collectedIds.includes(item.id) || item.category === "custom";
              const isChecked = selectedCardIds.includes(item.id);
              
              // Custom luxurious background styles depending on rarity & unlocked state
              let cardBgClass = "bg-white";
              let cardBorderClass = "border-stone-200";
              
              if (isUnlocked) {
                if (item.rarity === "SSR") {
                  cardBgClass = "bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100";
                  cardBorderClass = "border-amber-400";
                } else if (item.rarity === "SR") {
                  cardBgClass = "bg-gradient-to-br from-orange-50 via-stone-50 to-amber-50";
                  cardBorderClass = "border-orange-300";
                } else if (item.rarity === "R") {
                  cardBgClass = "bg-gradient-to-br from-sky-50 via-white to-indigo-50";
                  cardBorderClass = "border-sky-300";
                } else {
                  cardBgClass = "bg-gradient-to-b from-stone-50 to-stone-100";
                  cardBorderClass = "border-stone-300";
                }
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleCheckbox(item.id)}
                  className={`p-4 rounded-xl border-2 flex flex-col justify-between transition-all duration-200 group relative overflow-hidden cursor-pointer ${cardBgClass} ${cardBorderClass} ${
                    isChecked ? "ring-2 ring-amber-500 border-amber-500 bg-amber-100/20 shadow-md scale-[1.01]" : "hover:border-amber-400"
                  } ${
                    !isUnlocked ? "opacity-75 bg-stone-100/50" : "shadow-sm"
                  }`}
                  style={{
                    boxShadow: isUnlocked && isChecked ? `0 6px 14px ${item.glowColor}` : ""
                  }}
                >
                  {/* Elegant inner dashed frame to make it feel like an ancient classical voucher paper */}
                  <div className="absolute inset-1.5 border border-dashed border-stone-900/10 rounded-lg pointer-events-none" />

                  {/* Japanese woodblock corner frame brackets */}
                  <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 border-t border-l border-stone-800/40 pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 border-t border-r border-stone-800/40 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 border-b border-l border-stone-800/40 pointer-events-none" />
                  <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 border-b border-r border-stone-800/40 pointer-events-none" />

                  {/* Circular visual checkbox at top left */}
                  <div className="absolute top-3.5 left-3.5 z-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleCheckbox(item.id);
                      }}
                      className="w-4.5 h-4.5 accent-amber-600 rounded cursor-pointer border-stone-300 text-amber-600 hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    {item.category === "custom" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (setCustomCards) {
                            setCustomCards((prev) => prev.filter((it) => it.id !== item.id));
                            setSelectedCardIds((prev) => prev.filter((id) => id !== item.id));
                          }
                        }}
                        className="p-1 rounded bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-600 transition-colors cursor-pointer border border-stone-200"
                        title={isEnglishMode ? "Delete custom card" : "删除自定义卡牌"}
                      >
                        <Trash2 className="w-3 h-3 animate-pulse" />
                      </button>
                    )}
                    <span 
                      className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded tracking-wider border"
                      style={{
                        backgroundColor: item.rarity === "SSR" ? "#fee2e2" : item.rarity === "SR" ? "#ffedd5" : item.rarity === "R" ? "#e0f2fe" : "#f1f5f9",
                        color: item.rarity === "SSR" ? "#b91c1c" : item.rarity === "SR" ? "#c2410c" : item.rarity === "R" ? "#0369a1" : "#475569",
                        borderColor: item.rarity === "SSR" ? "#fca5a5" : item.rarity === "SR" ? "#fdbb2d" : "#bae6fd"
                      }}
                    >
                      {item.rarity}
                    </span>
                    {isUnlocked ? (
                      <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                        ★ 已收集
                      </span>
                    ) : (
                      <span className="text-[9px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded font-mono">
                        🔒 待解卡
                      </span>
                    )}
                  </div>

                  {/* Red Traditional Calligraphy HANKO seal stamp overlay */}
                  {isUnlocked && (
                    <div className="absolute bottom-14 right-4 pointer-events-none select-none opacity-20 transform rotate-12 group-hover:scale-105 transition-transform">
                      <div className={`w-9 h-9 rounded-full border-2 border-solid flex items-center justify-center font-serif text-[10px] font-black ${
                        item.rarity === "SSR" ? "border-red-600 text-red-600" : "border-amber-700 text-amber-700"
                      }`}>
                        {item.rarity === "SSR" ? "神珍" : item.rarity === "SR" ? "极品" : "珍藏"}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 pl-6 pt-2">
                    <div className="text-[10px] font-mono text-stone-400 font-bold tracking-widest select-none uppercase">
                      {item.categoryName}
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span 
                        className="text-2xl font-black text-stone-900 font-serif"
                        style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                      >
                        {item.kanji}
                      </span>
                      <span className="text-xs text-stone-400 font-mono font-bold">
                        {isEnglishMode ? "" : `(${item.kanaStr})`}
                      </span>
                    </div>
                    <p className="text-stone-500 text-[11px] leading-relaxed line-clamp-3 pt-1 font-sans">
                      {item.meaning}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-stone-200 flex items-center justify-between pl-6 z-10">
                    <div className="text-[10px] font-mono text-stone-450 font-bold bg-stone-100 px-2 py-0.5 rounded">
                      字条:{item.segments.map(s => s.kana).join("・")}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCardForTraining(item);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 group-hover:bg-amber-500 text-[11px] font-bold text-stone-100 group-hover:text-stone-950 transition-colors duration-200 shadow-sm"
                    >
                      拼写熟化 ＞
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rules / Tutorial tabs */}
      <div className="bg-stone-100/60 rounded-xl border border-stone-200 p-4">
        <div className="flex border-b border-stone-300 pb-2 mb-2">
          <button
            onClick={() => setActiveTab("intro")}
            className={`px-3 py-1 text-xs font-bold font-mono transition-all border-b-2 -mb-[10px] ${
              activeTab === "intro" ? "border-amber-600 text-stone-900" : "border-transparent text-stone-400"
            }`}
          >
            🥋 玩法底层机制 LOGIC
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3 py-1 text-xs font-bold font-mono transition-all border-b-2 -mb-[10px] ${
              activeTab === "rules" ? "border-amber-600 text-stone-900" : "border-transparent text-stone-400"
            }`}
          >
            📚 输入容差规范 INPUT RULE
          </button>
        </div>

        <div className="text-stone-600 text-xs leading-relaxed pt-2">
          {activeTab === "intro" ? (
            isEnglishMode ? (
              <ul className="list-disc pl-4 space-y-1">
                <li>本系统拒绝廉价的多选题，采用<span className="font-bold text-stone-900">“不记忆不罢休”</span>的拼写训练。</li>
                <li>开启训练后，你将陷入固定的倒计时循环，你需要在规定时间内将单词不断拼出！</li>
                <li>拼完一轮将自动重新开始。在紧促循环中，拼写将从大脑有意识的辨析，彻底融入手指打字的肌肉记忆。</li>
                <li>计时结束时，只要你完成了足额拼写，即可翻开本词对应的永久版收集卡片！</li>
              </ul>
            ) : (
              <ul className="list-disc pl-4 space-y-1">
                <li>本系统拒绝廉价的多选题或速配游戏，采用<span className="font-bold text-stone-900">“不记忆不罢休”</span>的定点拼写训练。</li>
                <li>开启训练后，你将陷入固定的倒计时循环，你需要在规定时间内将本词不断拼出！</li>
                <li>拼完一轮将自动归零重新开始。在紧促循环中，拼写将从大脑有意识的辨析，彻底融入手指打字的指尖肌肉直觉记忆。</li>
                <li>计时结束时，只要你完成了足额拼写，即可翻开本词对应的永久限量版集包卡片！</li>
              </ul>
            )
          ) : (
            isEnglishMode ? (
              <ul className="list-disc pl-4 space-y-1">
                <li>逐字母匹配英文单词对应的正确拼写字母（例如：输入 “C-h-a-r-l-o-t-t-e” 拼写 “Charlotte”）。</li>
                <li>任何一个字母敲击错误，由于机制限制，该单词需要<span className="font-bold text-red-600">重头开始拼写</span>，这有益于逼迫你对拼写形成绝对准确、流畅的正向反射！</li>
              </ul>
            ) : (
              <ul className="list-disc pl-4 space-y-1">
                <li>逐假名匹配对应的罗马音（例如：“さ[sa]”、“と[to]”、“う[u]”）。</li>
                <li>系统支持多种日本官方通用罗马音输入容差：输入 <span className="font-bold text-stone-800">“shi” / “si”</span> 均可代表 <span className="font-bold text-rose-600">し</span>，部分由于打字习惯细微差异（例如：“じ”输入 <span className="font-bold text-stone-800">“ji” / “zi”</span> ，“ふ”输入 <span className="font-bold text-stone-800">“fu” / “hu”</span>）均有完美匹配支持，杜绝严苛规则带来的拼音卡顿！</li>
                <li>任何一个字母敲击错误，由于机制限制，该单词需要<span className="font-bold text-red-600">重头开始拼写</span>，这有益于逼迫你对模糊的五十音形成绝对准确的正向条件反射！</li>
              </ul>
            )
          )}
        </div>
      </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
