import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Sparkles, Calendar, RotateCw, ArrowLeft, Lightbulb, Hourglass, HelpCircle, Activity, Volume2, PenTool, Download, Upload, MessageSquare, Send, Bot, User, Trash2 } from "lucide-react";
import { DICTIONARY, DictionaryItem, getDictionary } from "../data/dictionary";
import { audioSynth } from "../utils/audio";
import { CalligraphyCanvas } from "./CalligraphyCanvas";
import { CardIllustration } from "./CardIllustration";
import { uiTranslate, LANG_MAPPING } from "../utils/lang";

interface CardLibraryPageProps {
  collectedIds: string[];
  practiceTimes: Record<string, number>; // Maps cardId to total completed practice rounds
  onGoBack: () => void;
  onImportData: (unlockedCards: string[], ptTimes: Record<string, number>, settings?: any) => void;
  isEnglishMode?: boolean;
  customCards?: DictionaryItem[];
  setCustomCards?: React.Dispatch<React.SetStateAction<DictionaryItem[]>>;
}

export const CardLibraryPage: React.FC<CardLibraryPageProps> = ({
  collectedIds,
  practiceTimes,
  onGoBack,
  onImportData,
  isEnglishMode = false,
  customCards = [],
  setCustomCards,
}) => {
  const activeDict = React.useMemo(() => {
    return [...getDictionary(isEnglishMode), ...customCards];
  }, [isEnglishMode, customCards]);
  const [selectedCard, setSelectedCard] = useState<DictionaryItem | null>(null);
  const [aiStory, setAiStory] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeDetailTab, setActiveDetailTab] = useState<"story" | "drawing" | "chat">("story");

  // Persistent Card Live Chat History State
  const [chatHistories, setChatHistories] = useState<Record<string, { role: "user" | "model"; content: string }[]>>(() => {
    try {
      const stored = localStorage.getItem("fifty_sound_chat_histories");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [chatInput, setChatInput] = useState<string>("");
  const [loadingChat, setLoadingChat] = useState<boolean>(false);

  // Triggered dynamically when user switches to chat tab
  const getInitialChatGreeting = async (card: DictionaryItem) => {
    const cardId = card.id;
    if (chatHistories[cardId] && chatHistories[cardId].length > 0) return;

    setLoadingChat(true);
    try {
      const res = await fetch("/api/card-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: card.kanji,
          meaning: card.meaning,
          isEnglish: isEnglishMode,
          messages: [
            { role: "user", content: isEnglishMode ? "Hello! Wake up and introduce yourself!" : "你好！请唤醒你的卡牌灵魂并作个自我介绍吧！" }
          ]
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        const initialMsgs = [
          { role: "model" as const, content: data.reply }
        ];
        const nextHist = { ...chatHistories, [cardId]: initialMsgs };
        setChatHistories(nextHist);
        localStorage.setItem("fifty_sound_chat_histories", JSON.stringify(nextHist));
      } else {
        const fallback = isEnglishMode 
          ? `Hello there! I am the card soul of "${card.kanji}". Thank you for bringing me to life through your perfect spelling! How can I help you explore my culture today? 🔮`
          : `你好呀！我是“${card.kanji}”的卡牌之魂。感谢你用指尖完美的敲击将我唤醒！今天想和我聊点什么呢？ 🔮`;
        const initialMsgs = [{ role: "model" as const, content: fallback }];
        const nextHist = { ...chatHistories, [cardId]: initialMsgs };
        setChatHistories(nextHist);
        localStorage.setItem("fifty_sound_chat_histories", JSON.stringify(nextHist));
      }
    } catch (err) {
      console.error(err);
      const fallback = isEnglishMode 
        ? `Hello there! I am the card soul of "${card.kanji}". Thank you for bringing me to life through your perfect spelling! How can I help you explore my culture today? 🔮`
        : `你好呀！我是“${card.kanji}”的卡牌之魂。感谢你用指尖完美的敲击将我唤醒！今天想和我聊点什么呢？ 🔮`;
      const initialMsgs = [{ role: "model" as const, content: fallback }];
      const nextHist = { ...chatHistories, [cardId]: initialMsgs };
      setChatHistories(nextHist);
      localStorage.setItem("fifty_sound_chat_histories", JSON.stringify(nextHist));
    } finally {
      setLoadingChat(false);
    }
  };

  // Trigger initial chat greeting on-demand
  React.useEffect(() => {
    if (activeDetailTab === "chat" && selectedCard) {
      getInitialChatGreeting(selectedCard);
    }
  }, [activeDetailTab, selectedCard]);

  const handleSendChatMessage = async () => {
    if (!selectedCard || !chatInput.trim() || loadingChat) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    audioSynth.playTyping();

    const cardId = selectedCard.id;
    const currentHistory = chatHistories[cardId] || [];
    const updatedHistoryWithUser = [
      ...currentHistory,
      { role: "user" as const, content: userMsg }
    ];

    const nextHistUser = { ...chatHistories, [cardId]: updatedHistoryWithUser };
    setChatHistories(nextHistUser);
    localStorage.setItem("fifty_sound_chat_histories", JSON.stringify(nextHistUser));

    setLoadingChat(true);

    try {
      const res = await fetch("/api/card-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedCard.kanji,
          meaning: selectedCard.meaning,
          isEnglish: isEnglishMode,
          messages: updatedHistoryWithUser
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const finalHistory = [
          ...updatedHistoryWithUser,
          { role: "model" as const, content: data.reply }
        ];
        const nextHistModel = { ...chatHistories, [cardId]: finalHistory };
        setChatHistories(nextHistModel);
        localStorage.setItem("fifty_sound_chat_histories", JSON.stringify(nextHistModel));
        audioSynth.playTypewriterBell();
      } else {
        const finalHistory = [
          ...updatedHistoryWithUser,
          { role: "model" as const, content: data.error || (isEnglishMode ? "My soul is floating away... Please try talking to me again." : "我的卡牌灵魂有些飘忽，没能听清你的话语。请再说一次吧！") }
        ];
        const nextHistModel = { ...chatHistories, [cardId]: finalHistory };
        setChatHistories(nextHistModel);
        localStorage.setItem("fifty_sound_chat_histories", JSON.stringify(nextHistModel));
        audioSynth.playError();
      }
    } catch (err) {
      console.error(err);
      const finalHistory = [
        ...updatedHistoryWithUser,
        { role: "model" as const, content: isEnglishMode ? "Failed to connect to the cosmos... Try again." : "无法连接到宇宙奥秘，请稍后重试。" }
      ];
      const nextHistModel = { ...chatHistories, [cardId]: finalHistory };
      setChatHistories(nextHistModel);
      localStorage.setItem("fifty_sound_chat_histories", JSON.stringify(nextHistModel));
      audioSynth.playError();
    } finally {
      setLoadingChat(false);
    }
  };

  const handleClearChatHistory = (cardId: string) => {
    const nextHist = { ...chatHistories };
    delete nextHist[cardId];
    setChatHistories(nextHist);
    localStorage.setItem("fifty_sound_chat_histories", JSON.stringify(nextHist));
    audioSynth.playCarriageReturn();
  };

  const [customNotification, setCustomNotification] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{ text: string; onConfirm: () => void } | null>(null);

  const [isStorageAvailable] = useState<boolean>(() => {
    try {
      const testKey = "__test_key__";
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    if (!isStorageAvailable) {
      setCustomNotification({
        type: "error",
        text: isEnglishMode ? "⚠️ Local storage is restricted by your browser. Export backup is unavailable." : "⚠️ 当前浏览器限制了本地存储，导出存档功能不可用。"
      });
      return;
    }
    try {
      const keys = [
        "fifty_sound_unlocked_cards",
        "fifty_sound_practice_times",
        "fifty_sound_muted",
        "fifty_sound_bgm",
        "fifty_sound_voice_type",
        "fifty_sound_show_mascot"
      ];
      
      const backupData: Record<string, string | null> = {};
      keys.forEach(key => {
        backupData[key] = localStorage.getItem(key);
      });

      const backupPayload = {
        app: "katakata",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        payload: backupData
      };

      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const link = document.createElement("a");
      link.href = url;
      link.download = `katakata-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      audioSynth.playCarriageReturn();
      setCustomNotification({
        type: "success",
        text: isEnglishMode ? "🎉 Backup exported successfully! Keep this file safe." : "🎉 存档成功导出！请妥善保存该 JSON 备份文件。"
      });
    } catch (error) {
      console.error("Export save error", error);
      setCustomNotification({
        type: "error",
        text: isEnglishMode ? "😰 Export failed. Please check browser privacy/storage constraints." : "😰 导出存档失败，请检查浏览器限制设置。"
      });
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStorageAvailable) {
      setCustomNotification({
        type: "error",
        text: isEnglishMode ? "⚠️ Local storage is restricted. Import is unavailable." : "⚠️ 当前浏览器限制了本地存储，导入存档功能不可用。"
      });
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dataStr = event.target?.result as string;
        const parsed = JSON.parse(dataStr);
        
        if (parsed.app !== "katakata" || !parsed.payload) {
          throw new Error(isEnglishMode ? "Incorrect backup format: Unable to identify a valid Katakata save file." : "格式不正确：未能识别有效的 Katakata 存档。");
        }

        const performImport = () => {
          try {
            const payload = parsed.payload;
            
            const keysToWrite = Object.keys(payload);
            keysToWrite.forEach(key => {
              const val = payload[key];
              if (val !== null && val !== undefined) {
                localStorage.setItem(key, val);
              }
            });

            const unlockedListRaw = payload["fifty_sound_unlocked_cards"];
            const practiceTimesRaw = payload["fifty_sound_practice_times"];
            
            const unlockedCards = unlockedListRaw ? JSON.parse(unlockedListRaw) : [];
            const ptTimes = practiceTimesRaw ? JSON.parse(practiceTimesRaw) : {};
            
            const settings = {
              muted: payload["fifty_sound_muted"] === "true",
              bgm: payload["fifty_sound_bgm"] === "true",
              voiceType: payload["fifty_sound_voice_type"] || "female",
              showMascot: payload["fifty_sound_show_mascot"] !== "false"
            };

            onImportData(unlockedCards, ptTimes, settings);

            audioSynth.playFanfare();
            setCustomNotification({
              type: "success",
              text: isEnglishMode ? "🎉 Backup imported successfully! Your unlocked decks and milestones have synced." : "🎉 存档导入成功！您的练习卡库、记录和音像效果已完全同步加载。"
            });
          } catch (importErr: any) {
            console.error(importErr);
            setCustomNotification({
              type: "error",
              text: isEnglishMode ? `❌ Import failed: ${importErr?.message || "Invalid payload contents"}` : `❌ 导入失败: ${importErr?.message || "内容不正确"}`
            });
          }
        };

        setCustomConfirm({
          text: isEnglishMode ? "💡 Importing will overwrite all current progress. Do you wish to continue?" : "💡 导入将覆盖当前所有数据，是否继续？",
          onConfirm: performImport
        });

      } catch (err: any) {
        console.error(err);
        setCustomNotification({
          type: "error",
          text: isEnglishMode ? `❌ Import failed: ${err?.message || "JSON corrupt or invalid"}` : `❌ 导入失败: ${err?.message || "JSON 损坏或不合规"}`
        });
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Fetch or trigger Gemini AI Name story teller API
  const handleFetchAiStory = async (item: DictionaryItem) => {
    setLoadingAi(true);
    setAiStory("");
    
    try {
      const res = await fetch("/api/card-origin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: item.kanji,
          kana: item.kanaStr,
          romaji: item.segments.map(s => s.displayRomaji).join(""),
          meaning: item.meaning,
          isEnglish: isEnglishMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.story) {
        setAiStory(data.story);
      } else {
        setAiStory(data.error || (isEnglishMode ? "Failed to get core cultural description. Please try again later." : "获取民俗文化简介失败，外部网络未响应，请稍后再试。"));
      }
    } catch (err: any) {
      console.error(err);
      setAiStory(isEnglishMode ? "Failed to connect to server. Please try again later." : "连接服务器时出错，请稍后重试。");
    } finally {
      setLoadingAi(false);
    }
  };

  // Categories select tabs filter calculation
  const filteredCollection = activeDict.filter(item => {
    // Category filter logic
    if (categoryFilter === "all") return true;
    if (categoryFilter === "unlocked" || categoryFilter === "collected") return collectedIds.includes(item.id) || item.category === "custom";
    if (categoryFilter === "locked") return !collectedIds.includes(item.id) && item.category !== "custom";
    return item.category === categoryFilter;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-2 md:px-0">
      {/* Top Navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={onGoBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 bg-white hover:bg-stone-50 hover:text-stone-900 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回首页</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-stone-500 font-mono">COLLECTION RATIO</span>
          <p className="text-xs font-bold font-mono text-stone-750">
            已收集 : {collectedIds.length} / {activeDict.length} 张 (
            {Math.round((collectedIds.length / activeDict.length) * 100)}%)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h1 
          className="text-3xl font-black text-stone-900 font-serif flex items-center gap-2"
          style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
        >
          <BookOpen className="w-7 h-7 text-amber-700" />
          <span>{isEnglishMode ? "Katakata 英语单词大收藏馆" : "Katakata「カタカタ」五十音闪卡藏馆"}</span>
        </h1>
        <p className="text-xs text-stone-500 font-mono uppercase tracking-wider">
          {isEnglishMode ? "THE ENGLISH NOUNS AND WESTERN NAMES COLLECTIVE TYPING STUDY ROOM" : "THE JAPANESE NOMINAL CARD BINDER LIBRARY & REVISION ROOM"}
        </p>
      </div>

      {/* Save Export/Import Panel Box styled with typewriter and monospace aesthetics */}
      <div className="bg-[#f5f3ef] border-2 border-stone-800/10 rounded-2xl p-4 space-y-3.5 shadow-sm relative overflow-hidden">
        {/* Typewriter details */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-stone-200/50 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <h3 className="font-mono font-bold text-stone-800 text-xs tracking-wide">
                KATAKATA SYSTEM ARCHIVE HUB 【打字集卡机存档中心】
              </h3>
            </div>
            <p className="text-[12px] text-stone-550 leading-relaxed font-sans max-w-xl">
              💡 <span className="font-semibold text-stone-700">说明：</span>卡牌与练习记录均保存在当前浏览器本地。若清除浏览器缓存数据可能会导致丢失，建议您定期导出 JSON 格式备份文件。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono">
            {/* Real input type file hidden */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportBackup} 
              accept=".json" 
              className="hidden" 
            />

            <button
              onClick={() => {
                audioSynth.playCardSlide();
                handleExportBackup();
              }}
              disabled={!isStorageAvailable}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isStorageAvailable 
                  ? "bg-white border-stone-300 text-stone-600 hover:bg-stone-50 hover:text-stone-900 active:scale-95"
                  : "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-50"
              }`}
              title="导出当前集卡进度与统计到本地文件"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>导出存档</span>
            </button>

            <button
              onClick={() => {
                audioSynth.playCardSlide();
                fileInputRef.current?.click();
              }}
              disabled={!isStorageAvailable}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                isStorageAvailable
                  ? "bg-stone-900 border-transparent text-stone-50 hover:bg-stone-800 hover:text-white active:scale-95"
                  : "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-50"
              }`}
              title="选择一份历史 Katakata JSON 存档进行恢复"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>导入存档</span>
            </button>
          </div>
        </div>

        {/* Local Storage Restricted Warning Banner */}
        {!isStorageAvailable && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs font-sans flex items-center gap-2 animate-bounce">
            <span className="text-sm">⚠️</span>
            <span>{isEnglishMode ? "Browser local storage is limited. Save functions are disabled." : "当前浏览器限制了本地存储，存档功能不可用。请确认您未开启极限无痕/隐私保护或禁用了本地 LocalStorage 功能。"}</span>
          </div>
        )}
      </div>

      {/* Categories select tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-3">
        {[
          { id: "all", label: "全部图鉴" },
          { id: "collected", label: "已收集闪卡" },
          { id: "locked", label: "未解锁图纸" },
          { id: "name", label: isEnglishMode ? "西式人名" : "日本人名" },
          { id: "nature", label: isEnglishMode ? "自然与动物" : "自然风物" },
          { id: "culture", label: isEnglishMode ? "物品与概念" : "民俗文化" },
          { id: "food", label: isEnglishMode ? "西餐美味" : "日本美味" },
          { id: "custom", label: isEnglishMode ? "Custom Docs" : "自定义词组" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`py-1 px-3 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              categoryFilter === tab.id
                ? "bg-amber-800 text-stone-50"
                : "bg-stone-200 text-stone-600 hover:bg-stone-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collection Binder Array */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredCollection.map((item) => {
          const isCollected = collectedIds.includes(item.id) || item.category === "custom";
          const practiceRounds = practiceTimes[item.id] || 0;

          // Custom exquisite visual styling depending on rarity & collected states
          let cardBgClass = "bg-[#fcfbf9]/90 border-stone-250";
          if (isCollected) {
            if (item.rarity === "SSR") {
              cardBgClass = "bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 border-amber-400";
            } else if (item.rarity === "SR") {
              cardBgClass = "bg-gradient-to-br from-orange-50 via-stone-50 to-amber-50 border-orange-300";
            } else if (item.rarity === "R") {
              cardBgClass = "bg-gradient-to-br from-sky-50 via-white to-blue-50 border-sky-300";
            } else {
              cardBgClass = "bg-gradient-to-b from-stone-50 to-stone-100 border-stone-300";
            }
          }

          return (
            <motion.div
              whileHover={{ y: isCollected ? -5 : 0, scale: isCollected ? 1.02 : 1 }}
              key={item.id}
              onClick={() => {
                if (isCollected) {
                  setSelectedCard(item);
                  setAiStory(""); // reset AI field
                  setActiveDetailTab("story");
                  audioSynth.speakJapanese(item.kanaStr);
                }
              }}
              className={`p-4 rounded-xl border-2 flex flex-col justify-between h-56 transition-all relative overflow-hidden select-none ${
                isCollected ? "cursor-pointer shadow-sm" : "bg-stone-100/50 border-stone-200 opacity-60"
              } ${cardBgClass}`}
              style={{
                boxShadow: isCollected ? `0 4px 14px ${item.glowColor}` : "none",
              }}
            >
              {/* Antique voucher dashed inner sub-border */}
              <div className="absolute inset-1.5 border border-dashed border-stone-800/10 rounded-lg pointer-events-none" />

              {/* Japanese corner bracket markers */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-stone-850/30 pointer-events-none" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-stone-850/30 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-stone-850/30 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-stone-850/30 pointer-events-none" />

              {/* Card top badge */}
              <div className="flex items-center justify-between z-10">
                <span 
                  className="text-[9px] font-mono font-black border px-1 rounded-sm tracking-widest scale-90"
                  style={{
                    backgroundColor: item.rarity === "SSR" ? "#fee2e2" : item.rarity === "SR" ? "#ffedd5" : item.rarity === "R" ? "#e0f2fe" : "#f1f5f9",
                    color: item.rarity === "SSR" ? "#b91c1c" : item.rarity === "SR" ? "#c2410c" : item.rarity === "R" ? "#0284c7" : "#475569",
                    borderColor: item.rarity === "SSR" ? "#fed7aa" : item.rarity === "SR" ? "#fed7aa" : "#bae6fd"
                  }}
                >
                  {item.rarity}
                </span>
                {isCollected ? (
                  <span className="text-[8px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-black border border-emerald-200">
                    ★ 已收藏
                  </span>
                ) : (
                  <span className="text-[8px] bg-stone-200/80 text-stone-500 px-1.5 rounded font-bold">
                    🔒 未解锁
                  </span>
                )}
              </div>

              {/* Red calligraphic seal stamp overlay */}
              {isCollected && (
                <div className="absolute bottom-11 right-3 pointer-events-none select-none opacity-25 transform rotate-12">
                  <div className={`w-8 h-8 rounded-full border-2 border-solid flex items-center justify-center font-serif text-[9px] font-bold ${
                    item.rarity === "SSR" ? "border-red-600 text-red-600" : "border-amber-700 text-amber-700"
                  }`}>
                    {item.rarity === "SSR" ? "神珍" : item.rarity === "SR" ? "极品" : "珍藏"}
                  </div>
                </div>
              )}

              {/* Central text layout */}
              <div className="text-center py-2 space-y-1.5 z-10 flex flex-col items-center justify-center">
                {/* Embedded Card Illustration */}
                <div className="mb-1">
                  <CardIllustration
                    id={item.id}
                    category={item.category}
                    className={`w-12 h-12 transition-all ${isCollected ? "opacity-95 contrast-110" : "opacity-20 grayscale pointer-events-none"}`}
                  />
                </div>

                {isCollected ? (
                  <>
                    <h3 
                      className="text-2xl font-extrabold text-stone-950 font-serif drop-shadow-sm select-none tracking-wide"
                      style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                    >
                      {item.kanji}
                    </h3>
                    <p className="text-[10px] font-mono text-stone-500 font-bold italic">
                      {isEnglishMode ? "" : `(${item.kanaStr})`}
                    </p>
                  </>
                ) : (
                  <>
                    <span 
                      className="text-lg font-serif text-stone-350 font-bold select-none tracking-wider block"
                      style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                    >
                      {item.segments.map(s => s.kana).join("")}
                    </span>
                    <p className="text-[9px] font-mono text-stone-400">
                      未解锁隐藏词条
                    </p>
                  </>
                )}
              </div>

              {/* Footer: Rarity & Practice Count statistics */}
              <div className="pt-2 border-t border-dashed border-stone-800/10 flex items-center justify-between z-10">
                <span className="text-[9px] font-mono text-stone-450 font-bold">
                  {uiTranslate(item.categoryName, isEnglishMode, item.categoryName)}
                </span>
                {isCollected && (
                  <span className="text-[9px] font-mono text-stone-500 flex items-center gap-0.5 font-bold">
                    <RotateCw className="w-2.5 h-2.5 text-stone-400" />
                    {practiceRounds}轮温故
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {emptyStatePlaceholder()}

      {/* Floating Modal detailed view / AI Storyteller with Card Flip style layout */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-xl w-full bg-stone-50 rounded-2xl border-2 border-stone-800 p-6 md:p-8 space-y-6 relative shadow-2xl my-8 text-stone-900"
            >
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
                title={isEnglishMode ? "Close" : "关闭"}
              >
                ✕
              </button>

              {/* Inside detail header: beautiful premium styling card view on top */}
              <div 
                className={`p-6 rounded-xl border-2 bg-gradient-to-br ${selectedCard.bgGradient} ${selectedCard.borderColor} text-center space-y-3 relative overflow-hidden`}
                style={{ boxShadow: `0 4px 15px ${selectedCard.glowColor}` }}
              >
                <span className="absolute top-2 left-3 text-[10px] font-mono text-stone-500 font-bold">
                  {selectedCard.rarityName}  ・  #{selectedCard.id.toUpperCase()}
                </span>

                <div className="flex justify-center pt-2">
                  <div className="p-3 bg-white/70 backdrop-blur-sm border border-stone-200/50 rounded-2xl shadow-sm">
                    <CardIllustration
                      id={selectedCard.id}
                      category={selectedCard.category}
                      className="w-16 h-16"
                    />
                  </div>
                </div>
                
                <h2 
                  className="text-4xl font-black text-stone-950 font-serif"
                  style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                >
                  {selectedCard.kanji}
                </h2>
                
                <div className="flex justify-center gap-3">
                  <span className="text-sm font-mono text-stone-600">
                    {isEnglishMode ? "英文单词: " : "假名: "}<b>{isEnglishMode ? selectedCard.kanji : selectedCard.kanaStr}</b>
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="text-sm font-mono text-stone-600">
                    {isEnglishMode ? "字母拼写: " : "罗马音: "}<b>{selectedCard.segments.map(s => s.displayRomaji).join("")}</b>
                  </span>
                </div>

                <div className="flex justify-center pt-0.5">
                  <button
                    onClick={() => audioSynth.speakJapanese(selectedCard.kanaStr)}
                    className="px-3 py-1 rounded-full bg-stone-900/10 hover:bg-stone-900/20 text-stone-850 transition-all text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm animate-pulse"
                  >
                    <Volume2 className="w-3 h-3 text-stone-700" />
                    <span>{isEnglishMode ? "听原声朗读" : "原声播音"}</span>
                  </button>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  {selectedCard.segments.map((s, idx) => (
                    <div key={idx} className="bg-stone-900/5 px-2 py-1 rounded text-xs">
                      <span className="font-serif font-black pr-1">{s.text || s.kana}</span>
                      <span className="font-mono text-[9px] text-stone-500">{s.displayRomaji}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-stone-200">
                <button
                  onClick={() => setActiveDetailTab("story")}
                  className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all ${
                    activeDetailTab === "story"
                      ? "border-amber-500 text-stone-950 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  🔮 文化历史释义
                </button>
                <button
                  onClick={() => {
                    setActiveDetailTab("drawing");
                  }}
                  className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1 ${
                    activeDetailTab === "drawing"
                      ? "border-amber-500 text-stone-950 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>手写描红临摹</span>
                </button>
                <button
                  onClick={() => {
                    setActiveDetailTab("chat");
                  }}
                  className={`flex-1 pb-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1 ${
                    activeDetailTab === "chat"
                      ? "border-amber-500 text-stone-950 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                  <span>💬 角色宿命私聊</span>
                </button>
              </div>

              {activeDetailTab === "story" && (
                <>
                  {/* Explanatory metadata */}
                  <div className="space-y-2 bg-white p-4 rounded-xl border border-stone-200">
                    <div className="text-xs text-stone-400 font-mono">STANDARD LEXICON MEANING</div>
                    <p className="text-xs leading-relaxed text-stone-600 font-sans">
                      {selectedCard.meaning}
                    </p>
                    <div className="pt-2 border-t border-stone-100 flex justify-between text-[11px] font-mono text-stone-500">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-amber-600" />
                        累积熟练轮次: <b>{practiceTimes[selectedCard.id] || 0} 轮</b>
                      </span>
                      <span>类别: {selectedCard.categoryName}</span>
                    </div>
                  </div>

                  {/* Gemini AI Storyteller Block! Highly engaging, interactive point */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-mono font-bold text-stone-800">GEMINI AI 文化起源大百科</span>
                      </div>
                      {!aiStory && !loadingAi && (
                        <button
                          onClick={() => handleFetchAiStory(selectedCard)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-stone-50 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm animate-bounce"
                        >
                          🔮 探索文化轶事故事
                        </button>
                      )}
                    </div>

                    {loadingAi && (
                      <div className="p-5 bg-stone-100 border border-dashed border-stone-300 rounded-xl space-y-2 flex flex-col items-center justify-center text-center">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 rounded-full border-2 border-amber-600 border-t-transparent"
                          />
                        </div>
                        <span className="text-xs font-mono text-stone-500 animate-pulse">
                          {isEnglishMode 
                            ? "Gemini 正在根据本词汇检索历史背景与文化起源，请稍候..." 
                            : "Gemini 正在根据本姓氏检索历史编年志与民俗起源，请稍候..."}
                        </span>
                      </div>
                    )}

                    {aiStory && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-inner relative"
                      >
                        {/* Retro callout design */}
                        <div className="absolute top-2 right-3 text-[10px] font-mono text-rose-400 font-bold">
                          GEMINI DECODING
                        </div>
                        <p className="text-xs leading-relaxed text-stone-800 whitespace-pre-wrap font-sans">
                          {aiStory}
                        </p>
                        <div className="mt-3 pt-2 border-t border-rose-100/50 flex justify-between items-center">
                          <span className="text-[10px] text-rose-500 font-mono italic">
                            ★ 由 Google Gemini 3.5 AI 倾情提供
                          </span>
                          <button
                            onClick={() => handleFetchAiStory(selectedCard)}
                            className="text-[10px] text-stone-500 hover:text-stone-800 font-mono font-bold underline"
                          >
                            重新解释 ↻
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              )}

              {activeDetailTab === "drawing" && (
                <div className="space-y-4 animate-fadeIn">
                  <CalligraphyCanvas segments={selectedCard.segments} />
                </div>
              )}

              {activeDetailTab === "chat" && (
                <div className="space-y-3 flex flex-col h-[350px] bg-stone-50 border border-stone-200 rounded-xl p-3 relative overflow-hidden animate-fadeIn select-text">
                  {/* Header/Controls inside chat panel */}
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 bg-stone-50 z-10 select-none">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span className="text-[11px] font-mono font-bold text-stone-600 uppercase">
                        {isEnglishMode ? "Card Spirit Chat Link" : "卡牌元魂私教联结"}
                      </span>
                    </div>
                    {(chatHistories[selectedCard.id] || []).length > 0 && (
                      <button
                        onClick={() => handleClearChatHistory(selectedCard.id)}
                        className="text-[10px] text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-all font-mono font-bold cursor-pointer hover:underline"
                        title={isEnglishMode ? "Clear chat memory" : "清除对话记忆"}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isEnglishMode ? "Clear" : "洗脑清空"}</span>
                      </button>
                    )}
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pb-2 scroll-smooth">
                    {(() => {
                      const messages = chatHistories[selectedCard.id] || [];
                      
                      if (messages.length === 0 && loadingChat) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center space-y-2 text-center text-stone-400 select-none">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 rounded-full border border-stone-400 border-t-transparent"
                            />
                            <span className="text-xs font-mono">{isEnglishMode ? "Waking up the Card's Soul..." : "正在唤醒卡牌之魂..."}</span>
                          </div>
                        );
                      }

                      return (
                        <>
                          {messages.map((msg, idx) => {
                            const isUser = msg.role === "user";
                            return (
                              <div
                                key={idx}
                                className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                              >
                                {!isUser && (
                                  <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                                    <Bot className="w-3.5 h-3.5 text-amber-600" />
                                  </div>
                                )}
                                <div
                                  className={`p-2.5 max-w-[82%] text-xs leading-relaxed rounded-2xl ${
                                    isUser
                                      ? "bg-stone-900 text-stone-50 rounded-tr-none shadow-sm font-sans"
                                      : "bg-white border border-stone-250 text-stone-850 rounded-tl-none shadow-xs font-sans"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                {isUser && (
                                  <div className="w-6 h-6 rounded-lg bg-stone-900/10 border border-stone-900/20 flex items-center justify-center shrink-0">
                                    <User className="w-3.5 h-3.5 text-stone-700" />
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {loadingChat && messages.length > 0 && (
                            <div className="flex items-start gap-2 justify-start">
                              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                                <Bot className="w-3.5 h-3.5 text-amber-600" />
                              </div>
                              <div className="bg-white border border-stone-250 p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Input Form Area */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="flex gap-1.5 border-t border-stone-200 pt-2 bg-stone-50 z-10 select-none"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        isEnglishMode
                          ? "Type to chat with this card..."
                          : "用中文输入你想和它说的话..."
                      }
                      disabled={loadingChat || !selectedCard}
                      className="flex-1 px-3 py-2 rounded-lg text-xs bg-white border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loadingChat || !chatInput.trim() || !selectedCard}
                      className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-200 text-stone-950 disabled:text-stone-400 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  合上相册
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styled Overlay Toast / Alert Notifications */}
      <AnimatePresence>
        {customNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
            onClick={() => setCustomNotification(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-md w-full bg-white border-2 border-stone-800 rounded-2xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 text-center">
                <div className="text-3xl">
                  {customNotification.type === "success" ? "🎉" : customNotification.type === "error" ? "⚠️" : "💡"}
                </div>
                <p className="text-stone-800 text-sm font-sans leading-relaxed">
                  {customNotification.text}
                </p>
                <button
                  onClick={() => setCustomNotification(null)}
                  className="px-6 py-2 bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-bold rounded-lg cursor-pointer"
                >
                  知道了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styled Confirm Dialog overlay */}
      <AnimatePresence>
        {customConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-md w-full bg-white border-2 border-amber-600 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">❓</div>
                <p className="text-stone-800 text-sm font-semibold font-sans leading-relaxed">
                  {customConfirm.text}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCustomConfirm(null)}
                  className="px-5 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    customConfirm.onConfirm();
                    setCustomConfirm(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  确认导入
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function emptyStatePlaceholder() {
    if (filteredCollection.length !== 0) return null;
    return (
      <div className="p-8 text-center border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50 text-stone-400 font-serif">
        <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-2" />
        <p className="text-sm">
          {isEnglishMode ? "暂无符合当前过滤条件的英语词汇闪卡。" : "暂无符合当前过滤条件的名人闪卡。"}
        </p>
        <p className="text-xs text-stone-400 mt-1 font-sans">
          {isEnglishMode ? "开启拼写训练来解锁属于你的英语单词大图鉴吧！" : "开启拼写训练来解锁属于你的五十音大图鉴吧！"}
        </p>
      </div>
    );
  }
};
