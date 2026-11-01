import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Swords,
  Sparkles,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  Trophy,
  Flame,
  ArrowLeft,
  Shield,
  Heart,
  Zap,
  Clock,
  Crown,
  MessageCircle,
  Send,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Award,
  Play
} from "lucide-react";
import { audioSynth } from "../utils/audio";
import { ColoredSyllableWord } from "./ColoredSyllableWord";
import { getSyllableColor, mapWordSegmentsToSyllables } from "../utils/syllableColorHelper";
import { TracingKana } from "./TracingKana";
import { getDictionary, DictionaryItem } from "../data/dictionary";
import { getAllSpanishWords } from "../data/spanishData";

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  currentWordIndex: number;
  currentSegmentIndex: number;
  romajiProgress?: string;
  combo: number;
  maxCombo: number;
  finished: boolean;
  finishTime?: number;
  accuracy: number;
  wpm: number;
  connected: boolean;
}

export interface MultiplayerRoom {
  id: string;
  name: string;
  mode: "duel" | "coop";
  language: "ja" | "en" | "es";
  status: "waiting" | "countdown" | "playing" | "finished";
  countdown: number;
  wordCount: number;
  words: DictionaryItem[];
  players: MultiplayerPlayer[];
  startTime?: number;
  endTime?: number;
  reactions: Array<{ id: string; sender: string; emoji: string; text: string; time: number }>;
  coopTotalScore: number;
}

const AVATAR_OPTIONS = [
  { id: "fox", icon: "🦊", label: "福狸酱", color: "from-amber-500 to-orange-600" },
  { id: "cat", icon: "🐱", label: "招财喵", color: "from-rose-400 to-pink-500" },
  { id: "daruma", icon: "🏮", label: "达摩翁", color: "from-red-500 to-rose-700" },
  { id: "shiba", icon: "🐕", label: "柴犬君", color: "from-yellow-500 to-amber-600" },
  { id: "koi", icon: "🎏", label: "锦鲤仙", color: "from-cyan-500 to-blue-600" },
  { id: "rabbit", icon: "🐰", label: "月见兔", color: "from-purple-400 to-indigo-500" },
];

const QUICK_TAUNTS = [
  { emoji: "🔥", text: "追上你了！" },
  { emoji: "⚡", text: "别松懈哦！" },
  { emoji: "👏", text: "好快的手速！" },
  { emoji: "🥺", text: "等等我呀！" },
  { emoji: "🦊", text: "福狸在看你呢！" },
  { emoji: "🎉", text: "完美连击！" },
];

interface MultiplayerPageProps {
  onBack: () => void;
  coins?: number;
  setCoins?: React.Dispatch<React.SetStateAction<number>>;
  initialRoomCode?: string;
}

export const MultiplayerPage: React.FC<MultiplayerPageProps> = ({
  onBack,
  coins = 300,
  setCoins,
  initialRoomCode = "",
}) => {
  // Local Player Profile
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem("katakata_mp_name") || `修习生_${Math.floor(Math.random() * 900 + 100)}`;
    } catch {
      return "修习生";
    }
  });

  const [playerAvatar, setPlayerAvatar] = useState<string>(() => {
    try {
      return localStorage.getItem("katakata_mp_avatar") || "fox";
    } catch {
      return "fox";
    }
  });

  const playerId = useMemo(() => {
    try {
      let saved = sessionStorage.getItem("katakata_mp_pid");
      if (!saved) {
        saved = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        sessionStorage.setItem("katakata_mp_pid", saved);
      }
      return saved;
    } catch {
      return `p_${Date.now()}`;
    }
  }, []);

  // Lobby Input States
  const [inputRoomCode, setInputRoomCode] = useState<string>(initialRoomCode);
  const [selectedMode, setSelectedMode] = useState<"duel" | "coop">("duel");
  const [selectedLang, setSelectedLang] = useState<"ja" | "en" | "es">("ja");
  const [selectedWordCount, setSelectedWordCount] = useState<number>(6);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"create" | "join" | "browse">("create");
  const [publicRooms, setPublicRooms] = useState<Array<{ id: string; name: string; mode: string; language: string; playerCount: number; wordCount: number }>>([]);
  const [isRefreshingRooms, setIsRefreshingRooms] = useState<boolean>(false);

  // Connection & Room Live State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);

  // Active Typing State during game
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [romajiProgress, setRomajiProgress] = useState<string>("");
  const [wordCorrect, setWordCorrect] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [keystrokeCount, setKeystrokeCount] = useState<number>(0);
  const [correctKeyCount, setCorrectKeyCount] = useState<number>(0);
  const [wordStartTime, setWordStartTime] = useState<number>(Date.now());
  const [isTypingShaking, setIsTypingShaking] = useState<boolean>(false);
  const [rewardAwarded, setRewardAwarded] = useState<boolean>(false);

  // Floating reaction toast queue
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: string; sender: string; emoji: string; text: string }>>([]);

  // Syllable Harmony Ensemble Live Event
  interface HarmonyEventPayload {
    player1Id: string;
    player1Name: string;
    player2Id: string;
    player2Name: string;
    syllable1: string;
    syllable2: string;
    coopBonus: number;
    timeDiffMs: number;
  }
  const [harmonyEvent, setHarmonyEvent] = useState<HarmonyEventPayload | null>(null);

  // Fetch Public Rooms
  const fetchPublicRooms = async () => {
    setIsRefreshingRooms(true);
    try {
      const res = await fetch("/api/multiplayer/rooms");
      if (res.ok) {
        const data = await res.json();
        setPublicRooms(data);
      }
    } catch (_) {}
    setIsRefreshingRooms(false);
  };

  useEffect(() => {
    fetchPublicRooms();
    const interval = setInterval(fetchPublicRooms, 6000);
    return () => clearInterval(interval);
  }, []);

  // Save profile changes
  const handleSaveName = (val: string) => {
    setPlayerName(val);
    try { localStorage.setItem("katakata_mp_name", val); } catch (_) {}
  };

  const handleSelectAvatar = (id: string) => {
    setPlayerAvatar(id);
    try { localStorage.setItem("katakata_mp_avatar", id); } catch (_) {}
    audioSynth.playCardSlide();
  };

  // Connect & Join WebSocket
  const connectAndJoin = (targetRoomId: string, isHostCreating: boolean = false) => {
    setErrorMsg("");
    const rid = targetRoomId.trim().toUpperCase();
    if (!rid) {
      setErrorMsg("请输入或生成 4~8 位房间代码");
      return;
    }

    if (wsRef.current) {
      try { wsRef.current.close(); } catch (_) {}
    }

    // Determine protocol and url
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const protocol = isHttps ? "wss:" : "ws:";
    const host = typeof window !== "undefined" ? window.location.host : "localhost:3000";
    const wsUrl = `${protocol}//${host}/ws/multiplayer`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);

      // Generate seed words for new room based on chosen language
      let wordsToUse: DictionaryItem[] = [];
      if (isHostCreating) {
        if (selectedLang === "ja") {
          const dict = getDictionary(false, false);
          wordsToUse = [...dict].sort(() => Math.random() - 0.5).slice(0, selectedWordCount);
        } else if (selectedLang === "en") {
          const dict = getDictionary(true, false);
          wordsToUse = [...dict].sort(() => Math.random() - 0.5).slice(0, selectedWordCount);
        } else {
          // Spanish
          const esList = getAllSpanishWords();
          wordsToUse = esList.sort(() => Math.random() - 0.5).slice(0, selectedWordCount).map((w) => ({
            id: w.id,
            kanji: w.word,
            kanaStr: w.word,
            category: "culture" as any,
            categoryName: "西班牙语",
            meaning: w.meaning,
            rarity: "SR" as any,
            rarityName: "珍藏",
            glowColor: "rgba(245, 158, 11, 0.3)",
            borderColor: "border-amber-300",
            bgGradient: "from-amber-50 to-orange-100",
            segments: w.word.split("").map((ch) => ({
              kana: ch,
              romaji: [ch.toLowerCase()],
              displayRomaji: ch,
            })),
          }));
        }
      }

      ws.send(JSON.stringify({
        type: "join_room",
        payload: {
          roomId: rid,
          roomName: `${playerName}的和风茶寮`,
          playerId,
          playerName,
          playerAvatar,
          mode: selectedMode,
          language: selectedLang,
          wordCount: selectedWordCount,
          words: wordsToUse,
        },
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, payload } = msg;

        if (type === "joined_room" || type === "room_updated") {
          setRoom(payload.room || payload);
          if (payload.room?.status === "waiting" || payload.status === "waiting") {
            // Reset local typing state
            setCurrentWordIndex(0);
            setCurrentSegmentIndex(0);
            setRomajiProgress("");
            setWordCorrect(false);
            setRewardAwarded(false);
          }
        }

        else if (type === "countdown_tick") {
          setRoom((prev) => prev ? { ...prev, countdown: payload.count } : null);
          audioSynth.playTypewriterBell();
        }

        else if (type === "game_started") {
          setRoom(payload.room);
          setCurrentWordIndex(0);
          setCurrentSegmentIndex(0);
          setRomajiProgress("");
          setWordCorrect(false);
          setCombo(0);
          setMaxCombo(0);
          setKeystrokeCount(0);
          setCorrectKeyCount(0);
          setWordStartTime(Date.now());
          setRewardAwarded(false);
          audioSynth.playCarriageReturn();
        }

        else if (type === "player_progress") {
          setRoom((prev) => {
            if (!prev) return null;
            const updated = prev.players.map((p) => {
              if (p.id === payload.playerId) {
                return {
                  ...p,
                  currentWordIndex: payload.wordIndex,
                  currentSegmentIndex: payload.segmentIndex,
                  romajiProgress: payload.romajiProgress,
                  combo: payload.combo,
                };
              }
              return p;
            });
            return { ...prev, players: updated };
          });
        }

        else if (type === "player_scored") {
          setRoom(payload.room);
          if (payload.isGameOver) {
            audioSynth.playTimeCompleted();
          }
        }

        else if (type === "reaction_received") {
          setFloatingReactions((prev) => [...prev.slice(-4), payload]);
          setTimeout(() => {
            setFloatingReactions((prev) => prev.filter((r) => r.id !== payload.id));
          }, 3500);
          audioSynth.playCardSlide();
        }

        else if (type === "harmony_syllable") {
          // Both players completed a syllable in close synchrony!
          // Play unique crisp ensemble audio cue
          audioSynth.playHarmonyEnsemble();
          setHarmonyEvent(payload);
          if (payload.room) {
            setRoom(payload.room);
          }
          setTimeout(() => {
            setHarmonyEvent((cur) => (cur === payload ? null : cur));
          }, 2500);
        }
      } catch (e) {
        console.error("WS message error", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setErrorMsg("连线遭遇波动，请确认网络畅通");
      setIsConnected(false);
    };
  };

  // If initial room code is provided in URL, auto-join
  useEffect(() => {
    if (initialRoomCode && !room) {
      connectAndJoin(initialRoomCode, false);
    }
  }, [initialRoomCode]);

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        try { wsRef.current.close(); } catch (_) {}
      }
    };
  }, []);

  // Send ready status
  const handleToggleReady = () => {
    if (!wsRef.current || !room) return;
    const me = room.players.find((p) => p.id === playerId);
    const nextReady = !me?.isReady;
    wsRef.current.send(JSON.stringify({
      type: "toggle_ready",
      payload: {
        roomId: room.id,
        playerId,
        isReady: nextReady,
      },
    }));
    audioSynth.playCardSlide();
  };

  // Host starts the match
  const handleStartGame = () => {
    if (!wsRef.current || !room) return;
    wsRef.current.send(JSON.stringify({
      type: "start_game",
      payload: { roomId: room.id },
    }));
    audioSynth.playCarriageReturn();
  };

  // Send Taunt / Cheer
  const handleSendReaction = (taunt: { emoji: string; text: string }) => {
    if (!wsRef.current || !room) return;
    wsRef.current.send(JSON.stringify({
      type: "send_reaction",
      payload: {
        roomId: room.id,
        playerId,
        emoji: taunt.emoji,
        text: taunt.text,
      },
    }));
    audioSynth.playCardSlide();
  };

  // Rematch
  const handleRematch = () => {
    if (!wsRef.current || !room) return;
    wsRef.current.send(JSON.stringify({
      type: "rematch",
      payload: { roomId: room.id },
    }));
    audioSynth.playCardSlide();
  };

  // Leave room
  const handleLeaveRoom = () => {
    if (wsRef.current && room) {
      try {
        wsRef.current.send(JSON.stringify({
          type: "leave_room",
          payload: { roomId: room.id, playerId },
        }));
        wsRef.current.close();
      } catch (_) {}
    }
    setRoom(null);
    setIsConnected(false);
    audioSynth.playCardSlide();
  };

  // Copy Room Invite Link
  const handleCopyInviteLink = () => {
    const url = `${window.location.origin}/?room=${room?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    audioSynth.playCardSlide();
  };

  // Typing engine during active match
  const currentItem = room?.words?.[currentWordIndex];

  // Distribute victory rewards when match completes
  useEffect(() => {
    if (room?.status === "finished" && !rewardAwarded && setCoins) {
      const myRank = [...room.players].sort((a, b) => b.score - a.score).findIndex((p) => p.id === playerId);
      const isWinner = myRank === 0;
      const coinBonus = isWinner ? 120 : 60;
      setCoins((prev) => prev + coinBonus);
      setRewardAwarded(true);
      try {
        const saved = localStorage.getItem("fifty_sound_coins");
        const currentNum = saved ? Number(saved) : 300;
        localStorage.setItem("fifty_sound_coins", String(currentNum + coinBonus));
      } catch (_) {}
    }
  }, [room?.status, rewardAwarded]);

  // Handle keystrokes
  useEffect(() => {
    if (room?.status !== "playing" || !currentItem || wordCorrect) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (!/^[a-z0-9\s\-_.'’]$/.test(key)) return;

      setKeystrokeCount((prev) => prev + 1);

      const targetSegment = currentItem.segments[currentSegmentIndex];
      if (!targetSegment) return;

      const expectedRomajis = targetSegment.romaji.map((r) => r.toLowerCase());
      const testPrefix = romajiProgress + key;

      // Check if testPrefix matches the beginning of any acceptable romaji
      const isPrefixMatch = expectedRomajis.some((r) => r.startsWith(testPrefix));
      const isExactMatch = expectedRomajis.some((r) => r === testPrefix);

      if (isExactMatch) {
        setCorrectKeyCount((prev) => prev + 1);
        audioSynth.playTyping({ volume: 1.0, isCompletion: true });
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        setMaxCombo((m) => Math.max(m, nextCombo));

        // Advance segment
        if (currentSegmentIndex + 1 < currentItem.segments.length) {
          const nextSegIdx = currentSegmentIndex + 1;
          setCurrentSegmentIndex(nextSegIdx);
          setRomajiProgress("");

          // Broadcast syllable completion & progress for synchronous harmony
          if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify({
              type: "syllable_completed",
              payload: {
                roomId: room.id,
                playerId,
                wordIndex: currentWordIndex,
                segmentIndex: currentSegmentIndex,
                syllable: targetSegment.kana || targetSegment.displayRomaji || targetSegment.romaji[0],
              },
            }));
            wsRef.current.send(JSON.stringify({
              type: "typing_progress",
              payload: {
                roomId: room.id,
                playerId,
                wordIndex: currentWordIndex,
                segmentIndex: nextSegIdx,
                romajiProgress: "",
                combo: nextCombo,
              },
            }));
          }
        } else {
          // Word completed!
          setWordCorrect(true);
          const timeTaken = Date.now() - wordStartTime;
          const accuracy = Math.round((correctKeyCount / Math.max(1, keystrokeCount)) * 100);

          if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify({
              type: "syllable_completed",
              payload: {
                roomId: room.id,
                playerId,
                wordIndex: currentWordIndex,
                segmentIndex: currentSegmentIndex,
                syllable: targetSegment.kana || targetSegment.displayRomaji || targetSegment.romaji[0],
              },
            }));
            wsRef.current.send(JSON.stringify({
              type: "word_completed",
              payload: {
                roomId: room.id,
                playerId,
                wordIndex: currentWordIndex,
                accuracy,
                timeTakenMs: timeTaken,
                combo: nextCombo,
              },
            }));
          }

          // Advance to next word after brief celebratory flash
          setTimeout(() => {
            if (currentWordIndex + 1 < room.words.length) {
              setCurrentWordIndex((prev) => prev + 1);
              setCurrentSegmentIndex(0);
              setRomajiProgress("");
              setWordCorrect(false);
              setWordStartTime(Date.now());
              audioSynth.playCarriageReturn();
            }
          }, 450);
        }
      } else if (isPrefixMatch) {
        setCorrectKeyCount((prev) => prev + 1);
        setRomajiProgress(testPrefix);
        audioSynth.playTyping({ volume: 0.9, isCompletion: false });

        if (wsRef.current && isConnected) {
          wsRef.current.send(JSON.stringify({
            type: "typing_progress",
            payload: {
              roomId: room.id,
              playerId,
              wordIndex: currentWordIndex,
              segmentIndex: currentSegmentIndex,
              romajiProgress: testPrefix,
              combo,
            },
          }));
        }
      } else {
        // Miss / Error
        audioSynth.playError();
        setCombo(0);
        setIsTypingShaking(true);
        setTimeout(() => setIsTypingShaking(false), 300);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [room?.status, currentItem, currentSegmentIndex, romajiProgress, wordCorrect, combo, correctKeyCount, keystrokeCount, currentWordIndex, isConnected]);

  // Determine Opponent Player for HUD
  const myPlayer = room?.players.find((p) => p.id === playerId);
  const otherPlayers = room?.players.filter((p) => p.id !== playerId) || [];
  const opponent = otherPlayers[0];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-16 font-sans relative select-none">
      {/* Crystalline Harmony Ensemble Banner (双人和鸣·音节同步合奏) */}
      <AnimatePresence>
        {harmonyEvent && (
          <motion.div
            key={`harmony_${harmonyEvent.timeDiffMs}_${harmonyEvent.syllable1}_${harmonyEvent.player1Name}`}
            initial={{ opacity: 0, y: -25, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: [0.95, 1.05, 1] }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed top-12 sm:top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-11/12 max-w-md"
          >
            <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white px-4 sm:px-6 py-2.5 rounded-full shadow-2xl border-2 border-amber-300 flex items-center justify-between gap-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-spin" style={{ animationDuration: "2.5s" }}>✨</span>
                <div>
                  <div className="flex items-center gap-1.5 font-serif font-black text-xs sm:text-sm tracking-wide">
                    <span>🎵 同心和鸣 · 双方音节同步合奏！</span>
                    <span className="bg-white/25 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                      +{harmonyEvent.coopBonus} 协力分
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-amber-100 font-sans">
                    {harmonyEvent.player1Name}「{harmonyEvent.syllable1}」＆ {harmonyEvent.player2Name}「{harmonyEvent.syllable2}」默契合奏 ({harmonyEvent.timeDiffMs}ms)
                  </div>
                </div>
              </div>
              <span className="text-xl">🎶</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Interactive Reactions Layer */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col gap-2 items-center">
        <AnimatePresence>
          {floatingReactions.map((rx) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.85 }}
              transition={{ duration: 0.35 }}
              className="px-4 py-2 rounded-2xl bg-stone-950/90 text-stone-100 border border-amber-400 shadow-xl backdrop-blur-md flex items-center gap-2 text-sm font-bold"
            >
              <span className="text-xl animate-bounce">{rx.emoji}</span>
              <span className="text-amber-300 font-mono text-xs">{rx.sender}:</span>
              <span>{rx.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 space-y-4">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <button
            onClick={() => {
              if (room) {
                handleLeaveRoom();
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-stone-500" />
            <span>{room ? "退出茶室房间" : "返回主页面"}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold font-serif flex items-center gap-1">
              <span>⛩️</span>
              <span>好友共修・实时连线</span>
            </span>

            {room && (
              <button
                onClick={handleCopyInviteLink}
                className="px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                title="复制房间专属链接，发送给朋友一键秒进"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-amber-700" />}
                <span>{copiedLink ? "链接已复制！" : `邀请码: ${room.id}`}</span>
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: LOBBY & MATCHMAKING SCREEN (When not in an active room) */}
        {!room && (
          <div className="space-y-6 pt-2">
            {/* Hero Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 border-2 border-amber-500/40 shadow-xl text-center space-y-3 relative overflow-hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-2xl font-serif shadow-inner">
                ⚔️
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wider text-amber-300">
                双人连线・和风极速对决庵
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed font-serif">
                与挚友同屏实时拼写比拼！支持<b>日语五十音、英语高频词、西班牙语经典词汇</b>。既可两两竞速争锋，亦可同心协力和鸣冲刺高分！
              </p>

              {/* Player Profile Setup Strip */}
              <div className="pt-2 max-w-md mx-auto bg-stone-950/60 p-3 rounded-2xl border border-stone-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-300 font-serif">你的昵称:</span>
                  <input
                    type="text"
                    value={playerName}
                    maxLength={12}
                    onChange={(e) => handleSaveName(e.target.value)}
                    className="flex-1 bg-stone-800 border border-stone-600 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold outline-none focus:border-amber-400"
                    placeholder="输入你在对决中的称谓"
                  />
                </div>

                {/* Avatar Picker */}
                <div>
                  <div className="text-[10px] text-stone-400 font-mono mb-1 text-left">选择你的灵兽替身:</div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => handleSelectAvatar(av.id)}
                        className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          playerAvatar === av.id
                            ? "bg-amber-500/30 border-amber-400 scale-105 shadow-sm"
                            : "bg-stone-800/60 border-stone-700 hover:bg-stone-700/60 opacity-70"
                        }`}
                      >
                        <span className="text-lg">{av.icon}</span>
                        <span className="text-[8px] font-mono mt-0.5 text-stone-300 leading-none">{av.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold text-center animate-shake">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Lobby Action Tabs */}
            <div className="flex border-b border-stone-200">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold font-serif flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
                  activeTab === "create"
                    ? "border-rose-500 text-rose-600 bg-white"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <span>⛩️</span>
                <span>创建专属对决房</span>
              </button>

              <button
                onClick={() => setActiveTab("join")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold font-serif flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
                  activeTab === "join"
                    ? "border-rose-500 text-rose-600 bg-white"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <span>🔑</span>
                <span>输入房间暗号直连</span>
              </button>

              <button
                onClick={() => { setActiveTab("browse"); fetchPublicRooms(); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold font-serif flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
                  activeTab === "browse"
                    ? "border-rose-500 text-rose-600 bg-white"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <span>🍵</span>
                <span>公共茶舍大厅</span>
              </button>
            </div>

            {/* TAB 1: CREATE ROOM */}
            {activeTab === "create" && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 font-serif block">1. 连线规则模态</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMode("duel")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedMode === "duel"
                          ? "border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-200"
                          : "border-stone-200 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-sm font-serif font-black text-rose-600">
                        <span>⚔️ 双人极速竞速 (Duel)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-sans mt-1">
                        实时跑道竞速，先敲打完成全部词条者摘得桂冠！
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMode("coop")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedMode === "coop"
                          ? "border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-200"
                          : "border-stone-200 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-serif font-black text-amber-700">
                          🤝 同心协力和鸣 (Co-op)
                        </span>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded-full">
                          专属合奏音
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-sans mt-1">
                        合并累计连击与分数，双方同步完成音节时触发清脆“合奏”天籁共鸣！
                      </p>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          audioSynth.playHarmonyEnsemble();
                        }}
                        className="mt-2 text-[10px] font-serif font-bold text-amber-800 bg-amber-100/90 hover:bg-amber-200 border border-amber-300/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="点击试听双人同步完成音节时的合奏音效"
                      >
                        <span>🎵 试听双人和鸣合奏音</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Language Deck Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 font-serif block">2. 练习语种词库</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedLang("ja")}
                      className={`py-2 px-3 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedLang === "ja"
                          ? "border-red-500 bg-red-50 text-red-900 shadow-xs"
                          : "border-stone-200 hover:bg-stone-50 text-stone-600"
                      }`}
                    >
                      <span>🇯🇵</span>
                      <span>日语五十音名家</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLang("en")}
                      className={`py-2 px-3 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedLang === "en"
                          ? "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-xs"
                          : "border-stone-200 hover:bg-stone-50 text-stone-600"
                      }`}
                    >
                      <span>🇬🇧</span>
                      <span>英语核心名篇</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedLang("es")}
                      className={`py-2 px-3 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedLang === "es"
                          ? "border-amber-500 bg-amber-50 text-amber-900 shadow-xs"
                          : "border-stone-200 hover:bg-stone-50 text-stone-600"
                      }`}
                    >
                      <span>🇪🇸</span>
                      <span>西班牙语日常</span>
                    </button>
                  </div>
                </div>

                {/* Word Count Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 font-serif block">3. 局内词条数量</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { count: 5, label: "5 词 · 短程疾速赛" },
                      { count: 8, label: "8 词 · 标准修行" },
                      { count: 12, label: "12 词 · 极限耐力战" },
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setSelectedWordCount(item.count)}
                        className={`py-2 px-3 rounded-xl border text-xs font-serif transition-all cursor-pointer text-center ${
                          selectedWordCount === item.count
                            ? "border-stone-900 bg-stone-900 text-stone-50 font-bold shadow-xs"
                            : "border-stone-200 hover:bg-stone-50 text-stone-600"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create & Open Room Button */}
                <button
                  type="button"
                  onClick={() => {
                    const generatedId = `ROOM_${Math.floor(Math.random() * 9000 + 1000)}`;
                    connectAndJoin(generatedId, true);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-serif font-black text-sm tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>立即启幕茶室并等待好友连线 ＞</span>
                </button>
              </div>
            )}

            {/* TAB 2: JOIN BY ROOM CODE */}
            {activeTab === "join" && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 max-w-lg mx-auto text-center">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-stone-900">输入好友分享的房间暗号</h3>
                  <p className="text-xs text-stone-500 font-sans">
                    输入朋友发给你的 4~8 位房间代码，即可直达同一个修行考场！
                  </p>
                </div>

                <div className="flex items-center gap-2 max-w-xs mx-auto">
                  <input
                    type="text"
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                    placeholder="如 ROOM_1234"
                    className="flex-1 text-center font-mono font-black text-lg py-2.5 px-3 rounded-xl border-2 border-stone-300 focus:border-rose-500 outline-none uppercase text-stone-900 bg-stone-50 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => connectAndJoin(inputRoomCode, false)}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    加入对决
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PUBLIC ROOMS LIST */}
            {activeTab === "browse" && (
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-serif font-bold text-stone-700">正在等待切磋的公开茶室</span>
                  <button
                    onClick={fetchPublicRooms}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingRooms ? "animate-spin" : ""}`} />
                    <span>刷新</span>
                  </button>
                </div>

                {publicRooms.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400 font-serif space-y-1">
                    <div>🍵 暂无公开等待中的房间</div>
                    <div className="text-[11px] text-stone-400">切换到“创建房间”，成为第一位擂主吧！</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {publicRooms.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl border border-stone-200 hover:border-amber-300 bg-stone-50 hover:bg-amber-50/40 transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <div className="font-serif font-bold text-xs text-stone-900 truncate">{r.name}</div>
                          <div className="text-[10px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                            <span>{r.mode === "duel" ? "⚔️ 极速竞速" : "🤝 协力和鸣"}</span>
                            <span>・</span>
                            <span>{r.language === "ja" ? "🇯🇵 日语" : r.language === "en" ? "🇬🇧 英语" : "🇪🇸 西语"}</span>
                            <span>・</span>
                            <span>{r.wordCount}词</span>
                          </div>
                        </div>

                        <button
                          onClick={() => connectAndJoin(r.id, false)}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-bold font-serif transition-all cursor-pointer shrink-0 ml-2"
                        >
                          入席切磋
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: IN-ROOM WAITING LOUNGE */}
        {room && room.status === "waiting" && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-6">
            {/* Room Info Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-stone-200 text-center sm:text-left">
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="font-serif font-black text-xl text-stone-900">{room.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                    {room.mode === "duel" ? "⚔️ 极速对决" : "🤝 协力和鸣"}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  房间暗号: <strong className="text-rose-600 font-black">{room.id}</strong> (共 {room.words.length} 词)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyInviteLink}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-serif flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? "邀请链接已复制" : "复制邀请链接"}</span>
                </button>
              </div>
            </div>

            {/* Cooperative Harmony Feature Ribbon */}
            <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl">🎵</span>
                <div className="text-xs">
                  <span className="font-serif font-black text-amber-900 block sm:inline mr-1.5">
                    双人连线・音节天籁合奏机制
                  </span>
                  <span className="text-stone-600 font-sans text-[11px]">
                    对决中当双方在 1.8 秒内先后击对一个音节，将鸣响清脆的“合奏”乐音并收获协力加分！
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => audioSynth.playHarmonyEnsemble()}
                className="shrink-0 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-serif font-black text-[11px] transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                title="试听双人和鸣合奏音效"
              >
                <span>试听合奏音效</span>
                <span>🎶</span>
              </button>
            </div>

            {/* Players Roster Grid */}
            <div className="space-y-2">
              <span className="text-xs font-serif font-bold text-stone-600">已入席修习生 ({room.players.length} / 4):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.players.map((p) => {
                  const av = AVATAR_OPTIONS.find((a) => a.id === p.avatar) || AVATAR_OPTIONS[0];
                  const isMe = p.id === playerId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        isMe
                          ? "border-amber-400 bg-amber-50/60 shadow-xs"
                          : "border-stone-200 bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-xl shadow-xs border border-stone-300">
                          {av.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1 font-bold text-sm text-stone-900">
                            <span>{p.name}</span>
                            {p.isHost && (
                              <span title="房主">
                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                              </span>
                            )}
                            {isMe && <span className="text-[10px] font-mono text-amber-700">(你)</span>}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {p.isHost ? "庵主主持" : "修习契约者"}
                          </div>
                        </div>
                      </div>

                      <div>
                        {p.isReady ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>已就绪</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-stone-200 text-stone-600 text-xs font-medium border border-stone-300">
                            静坐沉吟中
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Waiting Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleToggleReady}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-serif font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                  myPlayer?.isReady
                    ? "bg-stone-200 hover:bg-stone-300 text-stone-700"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{myPlayer?.isReady ? "取消准备" : "已做好对决准备！"}</span>
              </button>

              {myPlayer?.isHost && (
                <button
                  onClick={handleStartGame}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-serif font-black text-xs tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>敲锣启幕对决 (Start Match) ＞</span>
                </button>
              )}
            </div>

            {!myPlayer?.isHost && (
              <p className="text-center text-xs text-stone-400 font-serif">
                待房主擂台敲锣后，游戏将统一进入 3 秒倒数！
              </p>
            )}
          </div>
        )}

        {/* VIEW 3: 3-SECOND DRAMATIC COUNTDOWN */}
        {room && room.status === "countdown" && (
          <div className="py-20 text-center space-y-4">
            <motion.div
              key={room.countdown}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-7xl sm:text-9xl font-black font-serif text-rose-600 drop-shadow-[0_0_25px_rgba(225,29,72,0.4)]"
            >
              {room.countdown}
            </motion.div>
            <div className="text-stone-700 font-serif font-bold text-sm tracking-widest animate-pulse">
              各就各位・全神贯注
            </div>
          </div>
        )}

        {/* VIEW 4: LIVE MULTIPLAYER IN-GAME ARENA */}
        {room && room.status === "playing" && currentItem && (
          <div className="space-y-4">
            {/* RACE TRACK HUD (神道竞技跑道) */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-600 pb-1 border-b border-stone-100">
                <span className="flex items-center gap-1">
                  <span>⛩️</span>
                  <span>{room.mode === "duel" ? "神道速度竞逐" : "协力和鸣同修"}</span>
                </span>
                <span className="text-amber-700 font-serif">
                  目标: {room.words.length} 词条
                </span>
              </div>

              {/* Race Track Lines */}
              <div className="space-y-2.5">
                {room.players.map((p) => {
                  const av = AVATAR_OPTIONS.find((a) => a.id === p.avatar) || AVATAR_OPTIONS[0];
                  const isMe = p.id === playerId;
                  const progressPct = Math.min(100, Math.round((p.currentWordIndex / room.words.length) * 100));

                  return (
                    <div key={p.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-sans font-bold">
                        <span className={`flex items-center gap-1 ${isMe ? "text-rose-600" : "text-stone-700"}`}>
                          <span>{av.icon}</span>
                          <span>{p.name} {isMe && "(你)"}</span>
                          {p.combo > 2 && (
                            <span className="text-[10px] font-mono text-amber-600 font-black">
                              🔥{p.combo}
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-stone-500 text-[10px]">
                          {p.currentWordIndex} / {room.words.length} 词 ({progressPct}%)
                        </span>
                      </div>

                      {/* Track progress bar */}
                      <div className="w-full h-3 rounded-full bg-stone-100 border border-stone-300 relative overflow-hidden">
                        <motion.div
                          animate={{ width: `${progressPct}%` }}
                          transition={{ type: "spring", damping: 18 }}
                          className={`h-full rounded-full ${
                            isMe
                              ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-xs"
                              : "bg-gradient-to-r from-stone-400 to-indigo-500"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reactions Bar */}
              <div className="pt-1 flex items-center justify-between border-t border-stone-100 gap-1 overflow-x-auto whitespace-nowrap">
                <span className="text-[10px] font-serif font-bold text-stone-400 shrink-0 mr-1">快捷互动:</span>
                <div className="flex items-center gap-1">
                  {QUICK_TAUNTS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendReaction(t)}
                      className="px-2 py-0.5 rounded-full bg-stone-100 hover:bg-amber-100 border border-stone-200 text-stone-800 text-[10px] font-bold transition-all cursor-pointer active:scale-90"
                    >
                      <span>{t.emoji}</span>
                      <span className="ml-0.5">{t.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MAIN TYPING CONSOLE */}
            <div className={`p-4 sm:p-6 bg-stone-50 rounded-3xl border-2 transition-all shadow-md text-center space-y-4 ${
              harmonyEvent
                ? "border-amber-400 ring-4 ring-amber-400/80 shadow-amber-400/30 bg-amber-50/50"
                : isTypingShaking
                ? "animate-shake border-rose-500 bg-rose-50/30"
                : "border-stone-800"
            }`}>
              {/* Category & Pronounce */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] text-amber-800 font-mono tracking-wider font-bold uppercase bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  第 {currentWordIndex + 1} / {room.words.length} 词条
                </span>
                <button
                  type="button"
                  onClick={() => {
                    audioSynth.speakFullWord(currentItem.kanaStr || currentItem.kanji, undefined, currentItem.kanji, undefined, room.language);
                  }}
                  className="p-1 rounded-full text-stone-500 hover:text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                  title="朗读当前词发音"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Word Display with Syllable/Mora Color */}
              <div className="space-y-1">
                <ColoredSyllableWord
                  word={currentItem.kanji}
                  lang={room.language}
                  kanaStr={currentItem.kanaStr}
                  isEnglishMode={room.language !== "ja"}
                  showDots={true}
                  className="text-3xl sm:text-5xl font-black font-serif text-stone-900 tracking-wide justify-center"
                />

                <div className="text-xs text-stone-600 font-serif max-w-md mx-auto line-clamp-2 pt-1">
                  {currentItem.meaning}
                </div>
              </div>

              {/* TracingKana / Letter Input Slots */}
              {(() => {
                const segmentMap = mapWordSegmentsToSyllables(currentItem.kanji, currentItem.segments.length, room.language);

                return (
                  <div className="flex items-center justify-center py-2 flex-wrap gap-2.5 sm:gap-3.5 max-w-full">
                    {currentItem.segments.map((segment, idx) => {
                      const isCorrectSegment = wordCorrect || idx < currentSegmentIndex;
                      const isActiveSegment = !wordCorrect && idx === currentSegmentIndex;
                      const currentProgress = isActiveSegment ? romajiProgress : "";
                      const syllableInfo = segmentMap[idx];

                      return (
                        <TracingKana
                          key={idx}
                          kana={segment.kana}
                          displayRomaji={segment.displayRomaji}
                          romajiProgress={currentProgress}
                          isCorrect={isCorrectSegment}
                          active={isActiveSegment}
                          isEnglishMode={room.language !== "ja"}
                          syllableColor={syllableInfo?.color}
                        />
                      );
                    })}
                  </div>
                );
              })()}

              {/* Expected Romaji prompt below */}
              <div className="text-[11px] font-mono text-stone-500 select-none">
                当前拼写预期: [ {currentItem.segments[currentSegmentIndex]?.romaji?.[0] || ""} ]
              </div>

              {/* Combo Meter */}
              {combo > 0 && (
                <div className="flex items-center justify-center gap-1 text-xs font-mono font-black text-amber-600">
                  <Flame className="w-4 h-4 text-orange-500 fill-current animate-bounce" />
                  <span>{combo} COMBO 连击达成！</span>
                </div>
              )}
            </div>

            {/* OPPONENT LIVE MINI-HUD */}
            {opponent && (
              <div className="p-3 bg-white/90 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {AVATAR_OPTIONS.find((a) => a.id === opponent.avatar)?.icon || "🦊"}
                  </span>
                  <div>
                    <span className="font-bold text-stone-800">{opponent.name}</span>
                    <span className="text-stone-400 font-mono text-[10px] ml-1.5">
                      正在拼写第 {opponent.currentWordIndex + 1} 词
                    </span>
                  </div>
                </div>

                <div className="font-mono text-stone-500 text-xs">
                  {opponent.combo > 2 && <span className="text-amber-600 font-bold mr-2">🔥 {opponent.combo}</span>}
                  <span>积分: <b>{opponent.score}</b></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: VICTORY & RESULTS PODIUM */}
        {room && room.status === "finished" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-400 shadow-xl text-center space-y-6"
          >
            {/* Trophy Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center text-stone-950 shadow-lg border-2 border-amber-500">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
                {room.mode === "duel" ? "对决告捷・分晓胜负" : "同心和鸣・圆满通关"}
              </h2>
              <p className="text-xs font-mono text-stone-500">
                SESSION BATTLE CONCLUDED · CONGRATULATIONS
              </p>
            </div>

            {/* Scoreboard Rankings */}
            <div className="space-y-2.5 max-w-lg mx-auto">
              {[...room.players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => {
                  const av = AVATAR_OPTIONS.find((a) => a.id === p.avatar) || AVATAR_OPTIONS[0];
                  const isMe = p.id === playerId;
                  const isWinner = idx === 0;

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        isWinner
                          ? "border-amber-400 bg-amber-50/80 shadow-xs"
                          : "border-stone-200 bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-serif font-black text-xs ${
                          isWinner ? "bg-amber-500 text-stone-950" : "bg-stone-300 text-stone-700"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-xl">{av.icon}</span>
                        <div className="text-left">
                          <div className="font-bold text-xs sm:text-sm text-stone-900">
                            {p.name} {isMe && "(你)"}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            最高连击: {p.maxCombo} · 准确率: {p.accuracy}%
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base sm:text-lg font-black font-mono text-amber-700">
                          {p.score} 分
                        </div>
                        {isWinner && (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded">
                            🏆 优胜者
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Coins Bonus Notice */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 text-xs font-serif font-bold inline-flex items-center gap-2">
              <span>🪙</span>
              <span>
                切磋结课奖励：已将 <b>+{[...room.players].sort((a,b)=>b.score-a.score)[0]?.id === playerId ? 120 : 60} 和币</b> 计入您的岁币行囊！
              </span>
            </div>

            {/* Post Match Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRematch}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-serif font-black text-xs tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>再战一局 (Rematch)</span>
              </button>

              <button
                onClick={handleLeaveRoom}
                className="px-5 py-3 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-serif font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                返回大厅
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
