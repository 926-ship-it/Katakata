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
  onImportData: (unlockedCards: string[], ptTimes: Record<string, number>, settings?: any, importedCoins?: number, importedUpgrades?: any) => void;
  isEnglishMode?: boolean;
  coins?: number;
  setCoins?: React.Dispatch<React.SetStateAction<number>>;
  cardUpgrades?: Record<string, { level: number; exp: number; stars: number }>;
  setCardUpgrades?: React.Dispatch<React.SetStateAction<Record<string, { level: number; exp: number; stars: number }>>>;
}

interface UpgradeParticle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  char: string;
}

export const CardLibraryPage: React.FC<CardLibraryPageProps> = ({
  collectedIds,
  practiceTimes,
  onGoBack,
  onImportData,
  isEnglishMode = false,
  coins = 300,
  setCoins,
  cardUpgrades = {},
  setCardUpgrades,
}) => {
  const activeDict = React.useMemo(() => {
    return getDictionary(isEnglishMode);
  }, [isEnglishMode]);

  // Gamified Tabs: Binder (Collection) and Gacha (Summon Shrine)
  const [libraryTab, setLibraryTab] = useState<"binder" | "gacha">("binder");

  // Gacha Summon States
  const [summonRevealCard, setSummonRevealCard] = useState<DictionaryItem | null>(null);
  const [summonDuplicateInfo, setSummonDuplicateInfo] = useState<string>("");
  const [isSummoning, setIsSummoning] = useState<boolean>(false);

  const [selectedCard, setSelectedCard] = useState<DictionaryItem | null>(null);
  const [aiStory, setAiStory] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeDetailTab, setActiveDetailTab] = useState<"story" | "drawing" | "chat" | "upgrade">("story");

  // Upgrade animation states
  const [particles, setParticles] = useState<UpgradeParticle[]>([]);
  const [isUpgradedClass, setIsUpgradedClass] = useState(false);
  const [isStarredClass, setIsStarredClass] = useState(false);

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

  // --- GAMIFIED UPGRADE & SUMMON HANDLERS ---
  const [upgradeMessage, setUpgradeMessage] = useState<string>("");

  const toHanNumeral = (num: number) => {
    const mapping: Record<number, string> = { 1: "壹", 2: "贰", 3: "叁", 4: "肆", 5: "伍", 0: "零" };
    return mapping[num] || String(num);
  };

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 1: return "初学乍练";
      case 2: return "驾轻就熟";
      case 3: return "融会贯通";
      case 4: return "炉火纯青";
      case 5: return "一代宗师";
      default: return "初学乍练";
    }
  };

  const handleManualLevelUp = (cardId: string) => {
    if (!coins || coins < 30) {
      setUpgradeMessage("❌ 您的和币不足！快去进行拼写练习赚取和币吧。");
      audioSynth.playError();
      setTimeout(() => setUpgradeMessage(""), 3000);
      return;
    }

    if (setCoins && setCardUpgrades && cardUpgrades) {
      setCoins(prev => prev - 30);
      
      // Triple retro coin arpeggio sounds
      audioSynth.playCoin();
      setTimeout(() => audioSynth.playCoin(), 70);
      setTimeout(() => audioSynth.playCoin(), 140);

      const prevUpgrade = cardUpgrades[cardId] || { level: 1, exp: 0, stars: 0 };
      let nextLevel = prevUpgrade.level;
      let nextExp = prevUpgrade.exp + 35;
      if (nextExp >= 100) {
        if (nextLevel < 5) {
          nextLevel += 1;
          nextExp = nextExp - 100;
          setUpgradeMessage(`🎉 恭喜！等级成功淬炼至【等阶·${toHanNumeral(nextLevel)}】！`);
          setTimeout(() => {
            audioSynth.speakJapanese("おめでとう"); // congratulations
            audioSynth.playTypewriterBell(); // typewriter margin bell
          }, 350);
        } else {
          nextLevel = 5;
          nextExp = 100;
          setUpgradeMessage("✨ 卡牌已达最高修炼等阶【等阶·伍】！");
        }
      } else {
        setUpgradeMessage("✨ 注入和币成功，经验值增加了 35 点！");
      }

      setCardUpgrades(prev => ({
        ...prev,
        [cardId]: { level: nextLevel, exp: nextExp, stars: prevUpgrade.stars }
      }));

      // Generate flying coins & sparkles from level-up button (bottom-left) to card face (top-center)
      const newParticles: UpgradeParticle[] = Array.from({ length: 16 }).map((_, idx) => {
        const isSpark = idx % 2 === 0;
        return {
          id: Date.now() + idx,
          startX: 100 + Math.random() * 40 - 20, // Centered on level up button
          startY: 530 + Math.random() * 20 - 10,
          endX: 190 + Math.random() * 80 - 40,   // Flying to card face center
          endY: 180 + Math.random() * 80 - 40,
          delay: idx * 0.03,
          char: isSpark ? "✨" : "🪙",
        };
      });
      setParticles(newParticles);
      setIsUpgradedClass(true);
      setTimeout(() => setIsUpgradedClass(false), 850);

      setTimeout(() => setUpgradeMessage(""), 3000);
    }
  };

  const handleManualStarUp = (cardId: string) => {
    if (!coins || coins < 80) {
      setUpgradeMessage("❌ 您的和币不足！快去进行拼写练习赚取和币吧。");
      audioSynth.playError();
      setTimeout(() => setUpgradeMessage(""), 3000);
      return;
    }

    if (setCoins && setCardUpgrades && cardUpgrades) {
      setCoins(prev => prev - 80);

      // Quad coin arpeggio sounds + typewriter bell
      audioSynth.playCoin();
      setTimeout(() => audioSynth.playCoin(), 65);
      setTimeout(() => audioSynth.playCoin(), 130);
      setTimeout(() => audioSynth.playCoin(), 195);
      setTimeout(() => {
        audioSynth.playTypewriterBell();
        audioSynth.speakJapanese("すごい"); // amazing!
      }, 350);

      const prevUpgrade = cardUpgrades[cardId] || { level: 1, exp: 0, stars: 0 };
      const nextStars = Math.min(5, prevUpgrade.stars + 1);
      
      setCardUpgrades(prev => ({
         ...prev,
        [cardId]: { level: prevUpgrade.level, exp: prevUpgrade.exp, stars: nextStars }
      }));

      // Generate flying coins & stars from star-up button (bottom-right) to card face (top-center)
      const newParticles: UpgradeParticle[] = Array.from({ length: 20 }).map((_, idx) => {
        const isStar = idx % 2 === 0;
        return {
          id: Date.now() + idx,
          startX: 280 + Math.random() * 40 - 20, // Centered on star up button
          startY: 530 + Math.random() * 20 - 10,
          endX: 190 + Math.random() * 80 - 40,   // Flying to card face center
          endY: 180 + Math.random() * 80 - 40,
          delay: idx * 0.03,
          char: isStar ? "⭐" : "🪙",
        };
      });
      setParticles(newParticles);
      setIsStarredClass(true);
      setTimeout(() => setIsStarredClass(false), 850);

      setUpgradeMessage(`⭐ 成功突破！星级晋升至 ${nextStars} 星！`);
      setTimeout(() => setUpgradeMessage(""), 3000);
    }
  };

  const handleGachaSummon = (packType: "beginner" | "culture" | "legendary") => {
    let cost = 60;
    let weights: Record<string, number> = { N: 70, R: 25, SR: 5, SSR: 0 };
    let packName = "和风新手包";

    if (packType === "culture") {
      cost = 120;
      weights = { N: 30, R: 50, SR: 15, SSR: 5 };
      packName = "万叶繁茂包";
    } else if (packType === "legendary") {
      cost = 200;
      weights = { N: 0, R: 60, SR: 30, SSR: 10 };
      packName = "天道神珍包";
    }

    if (!coins || coins < cost) {
      alert(`和币不足！抽取【${packName}】需要 ${cost} 和币，您当前只有 ${coins} 和币。\n快去拼写大厅温故练习赚取和币吧！`);
      audioSynth.playError();
      return;
    }

    setIsSummoning(true);
    setSummonDuplicateInfo("");
    setSummonRevealCard(null);

    // Pick rarity based on weights
    const rand = Math.random() * 100;
    let pickedRarity: "N" | "R" | "SR" | "SSR" = "N";
    if (rand < weights.SSR) {
      pickedRarity = "SSR";
    } else if (rand < weights.SSR + weights.SR) {
      pickedRarity = "SR";
    } else if (rand < weights.SSR + weights.SR + weights.R) {
      pickedRarity = "R";
    } else {
      pickedRarity = "N";
    }

    // Filter dictionary by picked rarity
    let pool = activeDict.filter(c => c.rarity === pickedRarity && c.category !== "custom");
    if (pool.length === 0) {
      pool = activeDict.filter(c => c.category !== "custom");
    }

    const rewardCard = pool[Math.floor(Math.random() * pool.length)];

    setTimeout(() => {
      // Perform deduction
      if (setCoins) {
        setCoins(prev => prev - cost);
      }

      // Check duplicate
      const isAlreadyOwned = collectedIds.includes(rewardCard.id);
      if (isAlreadyOwned) {
        // Upgrade Card EXP instead of unlocking new
        const prevUp = cardUpgrades[rewardCard.id] || { level: 1, exp: 0, stars: 0 };
        let nextExp = prevUp.exp + 50;
        let nextLevel = prevUp.level;
        while (nextExp >= 100 && nextLevel < 5) {
          nextExp -= 100;
          nextLevel += 1;
        }
        if (nextLevel >= 5) {
          nextLevel = 5;
          nextExp = Math.min(100, nextExp);
        }

        if (setCardUpgrades) {
          setCardUpgrades(prev => ({
            ...prev,
            [rewardCard.id]: { level: nextLevel, exp: nextExp, stars: prevUp.stars }
          }));
        }

        // Refund some coins!
        if (setCoins) {
          setCoins(prev => prev + 20);
        }

        setSummonDuplicateInfo("💡 已经收集过该闪卡！自动为您转化为 50 点卡牌 EXP 经验，并额外为您补偿返还 20 枚和币！");
      } else {
        // Unlock new card!
        onImportData([...collectedIds, rewardCard.id], practiceTimes, undefined, coins - cost, cardUpgrades);
      }

      setSummonRevealCard(rewardCard);
      setIsSummoning(false);
      audioSynth.speakJapanese(rewardCard.kanaStr);
    }, 1200); // 1.2s atmospheric summoning pause
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
      <style>{`
        @keyframes shimmersweep {
          0% { transform: translate(-100%, -100%) rotate(45deg); }
          100% { transform: translate(100%, 100%) rotate(45deg); }
        }
        .holo-sheen {
          position: absolute;
          top: 0; left: 0; width: 250%; height: 250%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.35) 50%,
            rgba(255, 255, 255, 0) 70%
          );
          transform: rotate(45deg);
          transition: none;
          pointer-events: none;
          mix-blend-mode: overlay;
          z-index: 5;
        }
        .animate-holo-sheen {
          animation: shimmersweep 3.5s infinite linear;
        }
      `}</style>
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

      {/* ⛩️ Dual Shinto wood-carved tab bar switcher */}
      <div className="flex border-b-2 border-stone-800 select-none">
        <button
          onClick={() => {
            setLibraryTab("binder");
            audioSynth.playCardSlide();
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-black text-center flex items-center justify-center gap-2 cursor-pointer transition-all ${
            libraryTab === "binder"
              ? "bg-stone-900 text-stone-100 font-serif border-t-2 border-l-2 border-r-2 border-stone-800 rounded-t-xl"
              : "text-stone-400 hover:text-stone-700 bg-transparent font-serif"
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>📖 {isEnglishMode ? "PERSONAL CARD BINDER" : "个人闪卡藏馆"}</span>
        </button>
        <button
          onClick={() => {
            setLibraryTab("gacha");
            audioSynth.playCardSlide();
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-black text-center flex items-center justify-center gap-2 cursor-pointer transition-all ${
            libraryTab === "gacha"
              ? "bg-stone-900 text-stone-100 font-serif border-t-2 border-l-2 border-r-2 border-stone-800 rounded-t-xl"
              : "text-stone-400 hover:text-stone-700 bg-transparent font-serif"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>⛩️ {isEnglishMode ? "SHRINE SUMMON GACHA" : "御神殿召唤抽卡"}</span>
        </button>
      </div>

      {libraryTab === "binder" ? (
        <>
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
                  title="导出当前集卡进度与统计到本地 file"
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
              const upgrade = cardUpgrades[item.id] || { level: 1, exp: 0, stars: 0 };

              // Custom exquisite visual styling depending on rarity & collected states
              let cardBgClass = "bg-[#fcfbf9]/90 border-stone-250";
              if (isCollected) {
                if (item.rarity === "SSR") {
                  cardBgClass = "bg-gradient-to-tr from-pink-200 via-purple-200 via-indigo-200 via-emerald-200 via-yellow-100 to-rose-200 border-amber-400 shadow-purple-500/15";
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
                  className={`p-3 sm:p-3.5 rounded-xl border-2 flex flex-col justify-between h-56 transition-all relative overflow-hidden select-none ${
                    isCollected ? "cursor-pointer shadow-sm" : "bg-stone-100/50 border-stone-200 opacity-60"
                  } ${cardBgClass}`}
                  style={{
                    boxShadow: isCollected ? `0 4px 14px ${item.glowColor}` : "none",
                  }}
                >
                  {/* Antique voucher dashed inner sub-border */}
                  <div className="absolute inset-1.5 border border-dashed border-stone-800/10 rounded-lg pointer-events-none" />

                  {/* Holographic Premium Foil Card Sheen Overlay */}
                  {isCollected && (item.rarity === "SSR" || item.rarity === "SR") && (
                    <div className="holo-sheen animate-holo-sheen" />
                  )}

                  {/* Japanese corner bracket markers */}
                  <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-stone-800/30 pointer-events-none" />
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-stone-800/30 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-stone-800/30 pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-stone-800/30 pointer-events-none" />

                  {/* Card top badge */}
                  <div className="flex items-center justify-between z-10">
                    <span 
                      className="text-[9px] font-mono font-black border px-1 rounded-sm tracking-widest scale-90 animate-pulse"
                      style={{
                        backgroundColor: item.rarity === "SSR" ? "#fee2e2" : item.rarity === "SR" ? "#ffedd5" : item.rarity === "R" ? "#e0f2fe" : "#f1f5f9",
                        color: item.rarity === "SSR" ? "#b91c1c" : item.rarity === "SR" ? "#c2410c" : item.rarity === "R" ? "#0284c7" : "#475569",
                        borderColor: item.rarity === "SSR" ? "#fed7aa" : item.rarity === "SR" ? "#fed7aa" : "#bae6fd"
                      }}
                    >
                      {item.rarity}
                    </span>
                    {isCollected ? (
                      <div className="flex flex-col items-end z-10">
                        <span className="text-[8px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-black border border-emerald-200">
                          ★ 已收藏
                        </span>
                        {/* Interactive stars indicator */}
                        <div className="text-[8px] text-amber-500 font-bold mt-0.5 tracking-tighter">
                          {"★".repeat(upgrade.stars) + "☆".repeat(5 - upgrade.stars)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[8px] bg-stone-200/80 text-stone-500 px-1.5 rounded font-bold z-10">
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
                  <div className="text-center py-1 space-y-1.5 z-10 flex flex-col items-center justify-center w-full">
                    {/* Embedded Card Illustration in a beautiful frame */}
                    <div className="p-1 bg-white/75 backdrop-blur-xs rounded-lg border border-stone-200/40 shadow-xs flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12">
                      <CardIllustration
                        id={item.id}
                        category={item.category}
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-all ${isCollected ? "opacity-95 contrast-110" : "opacity-20 grayscale pointer-events-none"}`}
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
                        {/* Upgrade level badge */}
                        <div className="text-[8px] bg-stone-900/5 text-stone-600 px-1.5 py-0.2 rounded-full font-bold scale-90 -mt-1 select-none">
                          等阶·{toHanNumeral(upgrade.level)} · {getLevelTitle(upgrade.level)}
                        </div>
                        <p className="text-[10px] font-mono text-stone-500 font-bold italic leading-none">
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
        </>
      ) : (
        <div className="space-y-6">
          {/* Shrine Introduction Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7c2d12] to-[#451a03] border-2 border-amber-500 shadow-xl text-stone-100 text-center space-y-3 relative overflow-hidden select-none">
            {/* Shinto Shrine torii gate visual icon or styling details */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400 opacity-40 rounded-tl" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400 opacity-40 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400 opacity-40 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400 opacity-40 rounded-br" />

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xl font-serif">
              ⛩️
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-amber-300">五十音神明之启・御神殿召唤</h2>
            <p className="text-xs text-stone-300 max-w-xl mx-auto leading-relaxed font-serif">
              欢迎来到神秘的和歌祈愿神社！在这里，您可以消耗通过在拼写大厅练习温故积攒的【和币】来进行神圣召唤。您将获得全新的高级五十音假名闪卡，或为已有假名充能升级！
            </p>
            <div className="pt-1.5 flex justify-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full text-amber-300 border border-amber-500/20">
                🪙 我的当前和币: <b>{coins} 和币</b>
              </span>
              <span className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full text-emerald-300 border border-emerald-500/20">
                🎴 已解锁卡牌: <b>{collectedIds.length} / {activeDict.length} 张</b>
              </span>
            </div>
          </div>

          {/* Gacha Packs Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            {/* Beginner pack */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-5 rounded-2xl bg-[#fcfbf9] border-2 border-stone-250 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-bl text-[9px] font-mono tracking-wider">
                NOVICE PACK
              </div>
              <div className="space-y-1.5">
                <span className="text-2xl">🌱</span>
                <h3 className="text-base font-black text-stone-900 font-serif">和风新手御守包</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">
                  非常适合新手打牢基础的入门包，能够快速召唤 N 级和 R 级基础假名闪卡。
                </p>
                <div className="text-[9px] bg-stone-100/50 p-2.5 rounded-xl border font-mono text-stone-500 leading-normal space-y-0.5">
                  <div className="font-bold text-stone-700">Rarity Rates (稀有度概率):</div>
                  <div>• 普通 N 级 (Common): 70%</div>
                  <div>• 珍稀 R 级 (Rare): 25%</div>
                  <div>• 极品 SR 级 (Epic): 5%</div>
                  <div>• 神珍 SSR 级 (Legend): 0%</div>
                </div>
              </div>
              <button
                onClick={() => handleGachaSummon("beginner")}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <span>召唤 1 次</span>
                <span className="font-mono text-stone-400 opacity-90">🪙 60 和币</span>
              </button>
            </motion.div>

            {/* Culture/Nature Pack */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-5 rounded-2xl bg-[#fcfbf9] border-2 border-amber-300 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-bl text-[9px] font-mono tracking-wider">
                POPULAR CHOICE
              </div>
              <div className="space-y-1.5">
                <span className="text-2xl">🌸</span>
                <h3 className="text-base font-black text-amber-900 font-serif">万叶繁茂名物包</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">
                  融入了万物自然与传统民俗的高级卡包，极高概率出现珍稀 R 级与 SR 极品闪卡！
                </p>
                <div className="text-[9px] bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-mono text-amber-800/80 leading-normal space-y-0.5">
                  <div className="font-bold text-amber-800">Rarity Rates (稀有度概率):</div>
                  <div>• 普通 N 级 (Common): 30%</div>
                  <div>• 珍稀 R 级 (Rare): 50%</div>
                  <div>• 极品 SR 级 (Epic): 15%</div>
                  <div>• 神珍 SSR 级 (Legend): 5%</div>
                </div>
              </div>
              <button
                onClick={() => handleGachaSummon("culture")}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <span>召唤 1 次</span>
                <span className="font-mono text-amber-200 opacity-90">🪙 120 和币</span>
              </button>
            </motion.div>

            {/* Legendary SSR Pack */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-5 rounded-2xl bg-[#fcfbf9] border-2 border-purple-300 flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-bl text-[9px] font-mono tracking-wider">
                SSR RATE UP!
              </div>
              <div className="space-y-1.5">
                <span className="text-2xl">✨</span>
                <h3 className="text-base font-black text-purple-900 font-serif">天道神珍宿命包</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-sans">
                  直接获得高阶智慧启示！100% 屏蔽普通 N 级卡牌，高达 10% 概率爆出传说级 SSR 闪卡！
                </p>
                <div className="text-[9px] bg-purple-50 p-2.5 rounded-xl border border-purple-200 font-mono text-purple-800/80 leading-normal space-y-0.5">
                  <div className="font-bold text-purple-800">Rarity Rates (稀有度概率):</div>
                  <div>• 普通 N 级 (Common): 0%</div>
                  <div>• 珍稀 R 级 (Rare): 60%</div>
                  <div>• 极品 SR 级 (Epic): 30%</div>
                  <div>• 神珍 SSR 级 (Legend): 10%</div>
                </div>
              </div>
              <button
                onClick={() => handleGachaSummon("legendary")}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <span>召唤 1 次</span>
                <span className="font-mono text-purple-200 opacity-90">🪙 200 和币</span>
              </button>
            </motion.div>
          </div>

          {/* Gacha summoning active overlay */}
          <AnimatePresence>
            {isSummoning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950/90 backdrop-blur-md select-none"
              >
                <div className="space-y-6 text-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"
                  />
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-black text-amber-300 animate-pulse">正在叩问太鼓、祈求神明降临...</h3>
                    <p className="text-xs text-stone-400">五十音神明正在拨弄和歌线，闪卡即将在神社中显现！</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summon Reveal Card Ceremony Popup overlay */}
          <AnimatePresence>
            {summonRevealCard && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950/95 backdrop-blur-md p-4 select-none"
              >
                <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 text-center space-y-6 relative shadow-2xl">
                  {/* Confetti overlay sparkles */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl">🎉✨</div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold uppercase">
                      SUMMON REVEALED • 神社降临结果
                    </span>
                    <h3 className="text-2xl font-serif font-black text-stone-100">恭喜获得神之和卡！</h3>
                  </div>

                  {/* Exquisite Card detail rendering */}
                  <motion.div 
                    initial={{ scale: 0.8, rotate: -3 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className={`p-6 rounded-2xl border-2 mx-auto max-w-xs space-y-4 relative overflow-hidden ${
                      summonRevealCard.rarity === "SSR"
                        ? "bg-gradient-to-tr from-pink-300 via-purple-300 via-indigo-200 via-emerald-200 via-yellow-200 to-rose-200 border-amber-400 text-stone-950 shadow-2xl shadow-purple-500/30"
                        : summonRevealCard.rarity === "SR"
                        ? "bg-gradient-to-br from-orange-50 via-stone-50 to-amber-50 border-orange-300 text-stone-900"
                        : summonRevealCard.rarity === "R"
                        ? "bg-gradient-to-br from-sky-50 via-white to-blue-50 border-sky-300 text-stone-900"
                        : "bg-gradient-to-b from-stone-50 to-stone-100 border-stone-300 text-stone-900"
                    }`}
                  >
                    {/* Holographic Premium Foil Card Sheen Overlay */}
                    {(summonRevealCard.rarity === "SSR" || summonRevealCard.rarity === "SR") && (
                      <div className="holo-sheen animate-holo-sheen" />
                    )}

                    <div className="absolute top-2 left-3 text-[9px] font-mono text-stone-500 font-bold">
                      {summonRevealCard.rarityName}  ・  #{summonRevealCard.id.toUpperCase()}
                    </div>

                    <div className="flex justify-center pt-2">
                      <div className="p-2.5 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-2xl shadow-sm">
                        <CardIllustration id={summonRevealCard.id} category={summonRevealCard.category} className="w-12 h-12" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-3xl font-serif font-black tracking-wide leading-none">{summonRevealCard.kanji}</h4>
                      <p className="text-xs font-mono font-bold text-stone-600">
                        ({summonRevealCard.kanaStr})  •  {summonRevealCard.segments.map(s => s.displayRomaji).join("")}
                      </p>
                    </div>

                    <p className="text-xs text-stone-600 font-sans leading-relaxed px-2 bg-white/40 rounded-xl p-2.5">
                      {summonRevealCard.meaning}
                    </p>
                  </motion.div>

                  {summonDuplicateInfo && (
                    <p className="text-xs text-amber-400 font-mono leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 max-w-xs mx-auto">
                      {summonDuplicateInfo}
                    </p>
                  )}

                  {/* Footer button */}
                  <div className="space-y-2">
                    <button
                      onClick={() => audioSynth.speakJapanese(summonRevealCard.kanaStr)}
                      className="px-4 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>播放朗读语音</span>
                    </button>
                    <div>
                      <button
                        onClick={() => setSummonRevealCard(null)}
                        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs transition-colors cursor-pointer shadow-md w-full max-w-xs mx-auto block"
                      >
                        收进和歌藏馆
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
              className="max-w-md w-full bg-stone-50 rounded-2xl border-2 border-stone-800 p-4 sm:p-6 space-y-4 relative shadow-2xl my-8 text-stone-900"
            >
              {/* Modal-wide Flying Particles Area */}
              <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-2xl">
                <AnimatePresence>
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ x: p.startX, y: p.startY, opacity: 1, scale: 0.5, rotate: 0 }}
                      animate={{
                        x: p.endX,
                        y: p.endY,
                        opacity: [1, 1, 0.9, 0],
                        scale: [0.5, 1.6, 1.3, 0.6],
                        rotate: Math.random() > 0.5 ? 720 : -720,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.95,
                        delay: p.delay,
                        ease: "easeOut",
                      }}
                      className="absolute pointer-events-none text-xl select-none"
                    >
                      {p.char}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors z-20"
                title={isEnglishMode ? "Close" : "关闭"}
              >
                ✕
              </button>

              {/* Inside detail header: beautiful premium styling vertical TCG card view on top */}
              <motion.div 
                animate={
                  isUpgradedClass
                    ? {
                        scale: [1, 1.08, 0.95, 1.04, 1],
                        rotate: [0, -2.5, 2.5, -1.5, 1.5, 0],
                        boxShadow: [
                          `0 6px 20px ${selectedCard.glowColor}`,
                          `0 15px 40px rgba(251, 191, 36, 0.85)`,
                          `0 6px 20px ${selectedCard.glowColor}`
                        ]
                      }
                    : isStarredClass
                    ? {
                        scale: [1, 1.12, 0.92, 1.06, 1],
                        rotate: [0, -4, 4, -2, 2, 0],
                        boxShadow: [
                          `0 6px 20px ${selectedCard.glowColor}`,
                          `0 20px 50px rgba(245, 158, 11, 0.95)`,
                          `0 6px 20px ${selectedCard.glowColor}`
                        ]
                      }
                    : {}
                }
                transition={{ duration: 0.85, ease: "easeOut" }}
                className={`w-[260px] h-[370px] mx-auto p-4 rounded-2xl border-2 flex flex-col justify-between relative overflow-hidden select-none ${
                  selectedCard.rarity === "SSR"
                    ? "bg-gradient-to-tr from-pink-300 via-purple-300 via-indigo-200 via-emerald-200 via-yellow-200 to-rose-200 border-amber-400 text-stone-950 shadow-xl shadow-purple-500/20"
                    : `bg-gradient-to-br ${selectedCard.bgGradient} ${selectedCard.borderColor}`
                }`}
                style={{ boxShadow: `0 6px 20px ${selectedCard.glowColor}` }}
              >
                {/* Holographic Premium Foil Card Sheen Overlay */}
                {(selectedCard.rarity === "SSR" || selectedCard.rarity === "SR") && (
                  <div className="holo-sheen animate-holo-sheen" />
                )}

                {/* Antique voucher dashed inner sub-border */}
                <div className="absolute inset-1.5 border border-dashed border-stone-800/10 rounded-lg pointer-events-none" />

                {/* Japanese corner bracket markers */}
                <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-stone-800/30 pointer-events-none" />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-stone-800/30 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-stone-800/30 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-stone-800/30 pointer-events-none" />

                {/* Card Top Header */}
                <div className="flex items-center justify-between z-10 w-full">
                  <span 
                    className="text-[9px] font-mono font-black border px-1.5 py-0.5 rounded-sm tracking-widest scale-90"
                    style={{
                      backgroundColor: selectedCard.rarity === "SSR" ? "#fee2e2" : selectedCard.rarity === "SR" ? "#ffedd5" : selectedCard.rarity === "R" ? "#e0f2fe" : "#f1f5f9",
                      color: selectedCard.rarity === "SSR" ? "#b91c1c" : selectedCard.rarity === "SR" ? "#c2410c" : selectedCard.rarity === "R" ? "#0284c7" : "#475569",
                      borderColor: selectedCard.rarity === "SSR" ? "#fed7aa" : selectedCard.rarity === "SR" ? "#fed7aa" : "#bae6fd"
                    }}
                  >
                    {selectedCard.rarity}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-amber-500 font-bold tracking-tighter">
                      {"★".repeat(cardUpgrades[selectedCard.id]?.stars || 0) + "☆".repeat(5 - (cardUpgrades[selectedCard.id]?.stars || 0))}
                    </span>
                    <span className="text-[9px] font-mono text-stone-500 font-bold scale-90">
                      #{selectedCard.id.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Illustration and Main Kanji */}
                <div className="space-y-2 z-10 flex flex-col items-center">
                  {/* Beautiful big picture window on card face */}
                  <div className="p-2 bg-gradient-to-b from-white/95 to-white/80 border border-amber-350/30 rounded-2xl shadow-md w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none" />
                    <CardIllustration
                      id={selectedCard.id}
                      category={selectedCard.category}
                      className="w-16 h-16 sm:w-20 sm:h-20 pointer-events-none transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  
                  <div className="space-y-0.5 text-center">
                    <h2 
                      className="text-2xl sm:text-3xl font-black text-stone-950 font-serif leading-none tracking-wide"
                      style={{ fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif' }}
                    >
                      {selectedCard.kanji}
                    </h2>
                    <div className="flex justify-center gap-1 text-[9px] text-stone-650 font-medium">
                      <span>{isEnglishMode ? "单词:" : "假名:"} <b>{isEnglishMode ? selectedCard.kanji : selectedCard.kanaStr}</b></span>
                      <span className="text-stone-300">|</span>
                      <span>{isEnglishMode ? "拼写:" : "罗马音:"} <b>{selectedCard.segments.map(s => s.displayRomaji).join("")}</b></span>
                    </div>
                  </div>
                </div>

                {/* Voice button and breakdown segments at bottom */}
                <div className="space-y-2 z-10 w-full">
                  <div className="flex justify-center">
                    <button
                      onClick={() => audioSynth.speakJapanese(selectedCard.kanaStr)}
                      className="px-3 py-1 rounded-full bg-stone-900/10 hover:bg-stone-900/20 text-stone-800 transition-all text-[9px] font-bold flex items-center gap-1 cursor-pointer shadow-xs animate-pulse"
                    >
                      <Volume2 className="w-3 h-3 text-stone-700" />
                      <span>{isEnglishMode ? "听原声朗读" : "原声播音"}</span>
                    </button>
                  </div>

                  <div className="flex gap-0.5 justify-center flex-wrap scale-95 origin-center">
                    {selectedCard.segments.map((s, idx) => (
                      <div key={idx} className="bg-stone-900/5 px-1.5 py-0.5 rounded text-[9px] flex flex-col items-center min-w-[32px]">
                        <span className="font-serif font-black">{s.text || s.kana}</span>
                        <span className="font-mono text-[7px] text-stone-500 scale-90">{s.displayRomaji}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Tab Selector */}
              <div className="flex border-b border-stone-200">
                <button
                  onClick={() => setActiveDetailTab("story")}
                  className={`flex-1 pb-2 text-[10px] sm:text-xs font-bold text-center border-b-2 transition-all ${
                    activeDetailTab === "story"
                      ? "border-amber-500 text-stone-950 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  🔮 文化释义
                </button>
                <button
                  onClick={() => {
                    setActiveDetailTab("drawing");
                  }}
                  className={`flex-1 pb-2 text-[10px] sm:text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-0.5 ${
                    activeDetailTab === "drawing"
                      ? "border-amber-500 text-stone-950 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  <PenTool className="w-3 h-3 text-rose-500" />
                  <span>描红临摹</span>
                </button>
                <button
                  onClick={() => {
                    setActiveDetailTab("chat");
                  }}
                  className={`flex-1 pb-2 text-[10px] sm:text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-0.5 ${
                    activeDetailTab === "chat"
                      ? "border-amber-500 text-stone-950 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  <MessageSquare className="w-3 h-3 text-sky-500" />
                  <span>💬 私聊</span>
                </button>
                <button
                  onClick={() => {
                    setActiveDetailTab("upgrade");
                  }}
                  className={`flex-1 pb-2 text-[10px] sm:text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-0.5 ${
                    activeDetailTab === "upgrade"
                      ? "border-amber-500 text-stone-950 font-black"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-550 animate-pulse" />
                  <span>⚡ 淬炼</span>
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
                                      : "bg-white border border-stone-250 text-stone-800 rounded-tl-none shadow-xs font-sans"
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

              {activeDetailTab === "upgrade" && (
                <div className="relative space-y-4 bg-white p-4 rounded-xl border border-stone-200 select-none overflow-hidden">
                  <div className="text-center space-y-1">
                    <div className="text-xs text-stone-400 font-mono">CARD CULTIVATION ENGINE</div>
                    <h3 className="font-serif font-black text-stone-800 text-sm">闪卡太鼓淬炼 & 五星升华</h3>
                    <p className="text-[11px] text-stone-500">
                      通过注入在拼写大厅练习温故赚取的【和币】，可以手动对您心爱的闪卡进行经验升级、冲破星级极限！
                    </p>
                  </div>

                  {/* Upgrades current status card */}
                  <motion.div
                    animate={
                      isUpgradedClass
                        ? {
                            scale: [1, 1.04, 0.98, 1],
                            borderColor: ["#e7e5e4", "#fbbf24", "#fbbf24", "#e7e5e4"],
                            backgroundColor: ["#f5f5f4", "#fffbeb", "#f5f5f4"],
                            boxShadow: [
                              "0 0 0 rgba(0,0,0,0)",
                              "0 0 15px rgba(251,191,36,0.5)",
                              "0 0 0 rgba(0,0,0,0)"
                            ]
                          }
                        : isStarredClass
                        ? {
                            scale: [1, 1.06, 0.96, 1.02, 1],
                            borderColor: ["#e7e5e4", "#f59e0b", "#f59e0b", "#e7e5e4"],
                            backgroundColor: ["#f5f5f4", "#fffdf5", "#f5f5f4"],
                            boxShadow: [
                              "0 0 0 rgba(0,0,0,0)",
                              "0 0 20px rgba(245,158,11,0.6)",
                              "0 0 0 rgba(0,0,0,0)"
                            ]
                          }
                        : {}
                    }
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 font-mono text-[11px]"
                  >
                    <div className="flex justify-between items-center text-stone-700">
                      <span>当前修炼状态:</span>
                      <motion.span 
                        animate={isUpgradedClass ? { scale: [1, 1.3, 1], color: ["#b45309", "#d97706", "#b45309"] } : {}}
                        className="font-bold text-amber-700"
                      >
                        等阶·{toHanNumeral(cardUpgrades[selectedCard.id]?.level || 1)} · {getLevelTitle(cardUpgrades[selectedCard.id]?.level || 1)}
                      </motion.span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-stone-500">
                        <span>经验进度:</span>
                        <span>{(cardUpgrades[selectedCard.id]?.exp || 0)} / 100 EXP</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          animate={isUpgradedClass ? { scaleX: [1, 1.1, 1] } : {}}
                          className="bg-amber-500 h-full origin-left transition-all duration-300" 
                          style={{ width: `${cardUpgrades[selectedCard.id]?.exp || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-stone-700 pt-1 border-t border-dashed">
                      <span>星级等阶:</span>
                      <motion.span 
                        animate={isStarredClass ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
                        className="text-amber-500 text-xs tracking-tighter font-bold flex gap-0.5"
                      >
                        {"★".repeat(cardUpgrades[selectedCard.id]?.stars || 0) + "☆".repeat(5 - (cardUpgrades[selectedCard.id]?.stars || 0))}
                      </motion.span>
                    </div>
                  </motion.div>

                  {upgradeMessage && (
                    <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-center text-xs font-mono rounded-lg animate-bounce">
                      {upgradeMessage}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleManualLevelUp(selectedCard.id)}
                      disabled={(cardUpgrades[selectedCard.id]?.level || 1) >= 5 && (cardUpgrades[selectedCard.id]?.exp || 0) >= 100}
                      className="p-2.5 rounded-xl border border-stone-250 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs transition-all active:scale-95 cursor-pointer text-center space-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-amber-600 font-black">⚡ 经验淬炼</div>
                      <div className="text-[9px] text-stone-500 font-mono font-medium">🪙 30 和币 (+35 EXP)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleManualStarUp(selectedCard.id)}
                      disabled={(cardUpgrades[selectedCard.id]?.stars || 0) >= 5}
                      className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-950 font-bold text-xs transition-all active:scale-95 cursor-pointer text-center space-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-amber-700 font-black font-serif">⭐ 境界突破</div>
                      <div className="text-[9px] text-stone-650 font-mono font-medium">🪙 80 和币 (+1 星)</div>
                    </button>
                  </div>

                  <p className="text-[9px] text-stone-450 leading-relaxed text-center font-sans">
                    💡 提示：闪卡满等阶为【等阶·伍】，突破境界可点亮卡牌星级光环，更能温故获得倍率加成！
                  </p>
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
