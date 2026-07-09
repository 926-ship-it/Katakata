import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Star, Award, Grid, RotateCcw as RotateCcwIcon } from "lucide-react";
import { DictionaryItem, getDictionary } from "../data/dictionary";
import { audioSynth } from "../utils/audio";
import { CardIllustration } from "./CardIllustration";
import { NarrativeStyle, nTrans } from "../utils/narrative";

interface MemoryMatchPageProps {
  collectedIds: string[];
  onGoBack: () => void;
  isEnglishMode?: boolean;
  isKatakanaMode?: boolean;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  narrativeStyle: NarrativeStyle;
}

interface MemoryCard {
  cardId: string; // unique id e.g. "sato-kana" or "sato-romaji"
  itemId: string; // refers to dictionary item id
  type: "kana" | "romaji";
  label: string;
  illustrationId: string;
  category: string;
  isFlipped: boolean;
  isMatched: boolean;
  glowColor: string;
}

interface SakuraPetal {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  scale: number;
  opacity: number;
}

export const MemoryMatchPage: React.FC<MemoryMatchPageProps> = ({
  collectedIds,
  onGoBack,
  isEnglishMode = false,
  isKatakanaMode = false,
  coins,
  setCoins,
  narrativeStyle,
}) => {
  const activeDict = React.useMemo(() => {
    return getDictionary(isEnglishMode, isKatakanaMode);
  }, [isEnglishMode, isKatakanaMode]);

  // Game States
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy"); // easy = 4 pairs (8 cards), hard = 5 pairs (10 cards, never exceeds 5 words)
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [showGameComplete, setShowGameComplete] = useState<boolean>(false);
  const [hasAwardedCoins, setHasAwardedCoins] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(() => audioSynth.getMuted());

  // Petal Particle Exploded States
  const [petals, setPetals] = useState<SakuraPetal[]>([]);

  // Synchronize audio synth mute
  useEffect(() => {
    audioSynth.setMute(muted);
  }, [muted]);

  // Particle loop to update drifting sakura petals
  useEffect(() => {
    if (petals.length === 0) return;

    let active = true;
    const updatePetals = () => {
      if (!active) return;
      setPetals(prev => {
        const next = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.08, // gravity
          rotation: p.rotation + p.vx * 3,
          opacity: Math.max(0, p.opacity - 0.012),
        }));
        // filter out completely invisible ones
        return next.filter(p => p.opacity > 0);
      });
      requestAnimationFrame(updatePetals);
    };

    const frameId = requestAnimationFrame(updatePetals);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, [petals.length]);

  // Trigger cherry blossom explosion
  const triggerSakuraExplosion = (x: number, y: number) => {
    const newPetals: SakuraPetal[] = [];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      newPetals.push({
        id: Date.now() + i + Math.random(),
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5, // slight upward burst
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        opacity: 1,
      });
    }
    setPetals(prev => [...prev, ...newPetals]);
  };

  // Setup / Initialize Game board
  const setupBoard = () => {
    audioSynth.playCarriageReturn();
    
    // Determine card count: easy is 4 pairs (4 words), hard is 5 pairs (5 words, never exceeds 5 words)
    const pairsNeeded = difficulty === "easy" ? 4 : 5;

    // Filter cards already unlocked. Pad with standard cards to guarantee board count.
    const unlocked = activeDict.filter(item => collectedIds.includes(item.id));
    
    // Shuffle helper
    const shuffleArray = <T extends unknown>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    let selectedItems: DictionaryItem[] = [];
    if (unlocked.length >= pairsNeeded) {
      selectedItems = shuffleArray<DictionaryItem>(unlocked).slice(0, pairsNeeded);
    } else {
      // pad with remaining items from the standard dictionary
      const remaining = activeDict.filter(item => !unlocked.some(u => u.id === item.id));
      selectedItems = [
        ...unlocked,
        ...shuffleArray<DictionaryItem>(remaining).slice(0, pairsNeeded - unlocked.length)
      ];
    }

    // Build pair representations (Card A: kana characters, Card B: romaji answer)
    const cardPool: MemoryCard[] = [];
    selectedItems.forEach(item => {
      // Card A: Japanese Character card
      cardPool.push({
        cardId: `${item.id}-kana`,
        itemId: item.id,
        type: "kana",
        label: isEnglishMode ? item.kanji : item.kanaStr,
        illustrationId: item.id,
        category: item.category,
        isFlipped: false,
        isMatched: false,
        glowColor: item.glowColor,
      });

      // Card B: Romaji / English representation card
      const romajiLabel = item.segments.map(s => s.displayRomaji).join("");
      cardPool.push({
        cardId: `${item.id}-romaji`,
        itemId: item.id,
        type: "romaji",
        label: isEnglishMode ? item.meaning : romajiLabel,
        illustrationId: item.id,
        category: item.category,
        isFlipped: false,
        isMatched: false,
        glowColor: item.glowColor,
      });
    });

    // Shuffle final card deck
    setCards(shuffleArray<MemoryCard>(cardPool));
    setSelectedIndices([]);
    setMoves(0);
    setIsChecking(false);
    setShowGameComplete(false);
    setHasAwardedCoins(false);
    setPetals([]);
  };

  useEffect(() => {
    setupBoard();
  }, [difficulty]);

  // Click handler for card flipping
  const handleCardClick = (idx: number, event: React.MouseEvent) => {
    if (isChecking) return;
    
    const clickedCard = cards[idx];
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    // Click sound
    audioSynth.playTyping();

    // Flip card state
    const updatedCards = [...cards];
    updatedCards[idx].isFlipped = true;
    setCards(updatedCards);

    const nextSelection = [...selectedIndices, idx];
    setSelectedIndices(nextSelection);

    if (nextSelection.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);

      const firstIdx = nextSelection[0];
      const secondIdx = nextSelection[1];
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      // Check if correct match
      if (firstCard.itemId === secondCard.itemId && firstCard.type !== secondCard.type) {
        const clickX = event?.clientX ?? window.innerWidth / 2;
        const clickY = event?.clientY ?? window.innerHeight / 2;

        // MATCH DETECTED!
        setTimeout(() => {
          const finalCards = [...updatedCards];
          finalCards[firstIdx].isMatched = true;
          finalCards[secondIdx].isMatched = true;
          setCards(finalCards);
          setSelectedIndices([]);
          setIsChecking(false);

          // Play success ding & speak Kana
          audioSynth.playTypewriterBell();
          
          const targetItem = activeDict.find(d => d.id === firstCard.itemId);
          if (targetItem) {
            audioSynth.speakJapanese(targetItem.kanaStr);
          }

          // Trigger falling cherry blossoms animation centered around the click point
          triggerSakuraExplosion(clickX, clickY);

          // Verify if board is fully solved
          const allSolved = finalCards.every(c => c.isMatched);
          if (allSolved) {
            // Instantly compute and award coins so user doesn't lose rewards
            const isEasy = difficulty === "easy";
            const star3Bound = isEasy ? 6 : 8;
            const star2Bound = isEasy ? 10 : 13;
            let starsCount = 1;
            if (moves <= star3Bound) {
              starsCount = 3;
            } else if (moves <= star2Bound) {
              starsCount = 2;
            }
            const baseCoins = isEasy ? 50 : 130;
            const starsBonus = starsCount === 3 ? 35 : starsCount === 2 ? 15 : 0;
            const totalCoinsEarned = baseCoins + starsBonus;

            setCoins(prev => prev + totalCoinsEarned);
            setHasAwardedCoins(true);

            setTimeout(() => {
              setShowGameComplete(true);
              audioSynth.playFanfare();
            }, 600);
          }
        }, 350);
      } else {
        // MISMATCH! Flip back with a mechanical clack delay
        setTimeout(() => {
          audioSynth.playError();
          const revertCards = [...updatedCards];
          revertCards[firstIdx].isFlipped = false;
          revertCards[secondIdx].isFlipped = false;
          setCards(revertCards);
          setSelectedIndices([]);
          setIsChecking(false);
        }, 1100);
      }
    }
  };

  // --- SCORE & STARS RATINGS EVALUATION ---
  const getRatingInfo = () => {
    const isEasy = difficulty === "easy";
    const star3Bound = isEasy ? 6 : 8;
    const star2Bound = isEasy ? 10 : 13;

    let starsCount = 1;
    if (moves <= star3Bound) {
      starsCount = 3;
    } else if (moves <= star2Bound) {
      starsCount = 2;
    }

    // Coins reward logic
    const baseCoins = isEasy ? 50 : 130;
    const starsBonus = starsCount === 3 ? 35 : starsCount === 2 ? 15 : 0;
    const totalCoinsEarned = baseCoins + starsBonus;

    let titleText = "";
    let descText = "";

    if (narrativeStyle === "mythology") {
      titleText = starsCount === 3 ? "和歌明镜宗师 (Perfect!)" : starsCount === 2 ? "雅致假名学者" : "初心翻牌行者";
      descText = starsCount === 3 
        ? "超凡脱俗的记忆力！你几乎没有出任何差错就完成了完美的假名花札消消乐！"
        : "打得漂亮！你完成了这一场和风记忆配对，对假名的图形与拼音有了更深的连结！";
    } else if (narrativeStyle === "cultural") {
      titleText = starsCount === 3 ? "纸牌风雅宗师 (Perfect!)" : starsCount === 2 ? "格物雅致研习生" : "初见寻牌行者";
      descText = starsCount === 3 
        ? "登峰造极的视觉专注力！在这份极具东方美学的翻牌配对中，你的记忆如流光般精准。"
        : "研习顺利！假名与罗马音相映成辉，你在一次次精巧的配对中感受着音形交融的温润魅力。";
    } else {
      titleText = starsCount === 3 ? "记忆科学专家 (Perfect!)" : starsCount === 2 ? "五十音高级学员" : "拼写记忆初探者";
      descText = starsCount === 3 
        ? "极高的人类认知与瞬时记忆表现！拼写准确率100%，已达成该级别的满分评估。"
        : "表现良好！在多次交互反馈中成功建立起了假名字形和发音方案的牢固神经连结。";
    }

    return {
      stars: starsCount,
      coins: totalCoinsEarned,
      title: titleText,
      desc: descText
    };
  };

  const scoreDetails = getRatingInfo();

  const handleClaimCoins = () => {
    audioSynth.playTypewriterBell();
    onGoBack();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      {/* Visual drift particles container overlay */}
      <div className="fixed inset-0 pointer-events-none select-none z-50 overflow-hidden">
        {petals.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-tr from-pink-300 to-rose-400 border border-pink-200/40 shadow-sm"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.scale * 12}px`,
              height: `${p.scale * 7}px`,
              opacity: p.opacity,
              transform: `rotate(${p.rotation}deg)`,
              borderRadius: "50% 0 50% 50%", // petal shape
            }}
          />
        ))}
      </div>

      {/* Top action layout bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onGoBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 hover:text-stone-950 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-800" />
          <span>{narrativeStyle === "mythology" ? "返回拼写大厅" : narrativeStyle === "cultural" ? "返回练习大厅" : "返回主控制台"}</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Difficulty Pick toggles */}
          <div className="bg-stone-100 border p-0.5 rounded-lg flex items-center text-[10px] font-mono font-bold">
            <button
              onClick={() => setDifficulty("easy")}
              className={`px-3 py-1 rounded-md transition-all ${
                difficulty === "easy" 
                  ? "bg-white text-stone-900 shadow-sm font-black border border-stone-200" 
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              {narrativeStyle === "academic" ? "基础 4对" : "初学 4对 (8张)"}
            </button>
            <button
              onClick={() => setDifficulty("hard")}
              className={`px-3 py-1 rounded-md transition-all ${
                difficulty === "hard" 
                  ? "bg-white text-stone-900 shadow-sm font-black border border-stone-200" 
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              {narrativeStyle === "academic" ? "进阶 5对" : "通晓 5对 (10张)"}
            </button>
          </div>

          <button
            onClick={() => setMuted(!muted)}
            className="p-2 rounded-lg border border-stone-250 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title={muted ? "取消静音" : "静音"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
          </button>

          <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 border px-3 py-1 rounded-full flex items-center gap-1">
            🪙 <b>{coins}</b> {nTrans("coinName", narrativeStyle)}
          </span>
        </div>
      </div>

      {/* Main dashboard Header */}
      <div className="text-center space-y-1 select-none">
        <span className="text-[10px] font-mono tracking-widest text-amber-800 font-bold uppercase block">
          🎴 {narrativeStyle === "mythology" ? "KANA MEMORY MATCH • 和风花札配对消消乐" : narrativeStyle === "cultural" ? "WAKACARDS • 纸牌经典翻牌记忆配对" : "COGNITIVE MEMORY MATCH • 假名字音字形神经元配对"}
        </span>
        <h2 className="text-2xl font-serif font-black text-stone-900">
          {narrativeStyle === "mythology" ? "和风花札：记忆翻牌消消乐" : narrativeStyle === "cultural" ? "风雅和歌：经典翻牌记忆对对碰" : "脑机交互：假名字形字音记忆矩阵"}
        </h2>
        <p className="text-xs text-stone-500 max-w-lg mx-auto">
          {narrativeStyle === "mythology" 
            ? "点击翻开纸牌，找出假名/汉字（如：あ）与其相匹配的拼写/含义（如：a）。配对成功卡牌将化作粉嫩花瓣消散！消耗最少的步数挑战三星大圆满，赢取翻倍和币赏赐！"
            : narrativeStyle === "cultural"
            ? "翻转精美的和式纸牌，使假名与相对应的拼写配对。成功时卡牌会化作落樱消散，消耗更少的步数来获得最高评价与岁币成果吧！"
            : "通过点击矩阵块翻开并配对假名及其标准罗马音。每一次成功的配对都代表记忆回路的巩固。尝试用最少的尝试次数完成，获取积分和三层星级评估！"}
        </p>
      </div>

      {/* --- PLAYING VIEW BOARD --- */}
      {!showGameComplete && (
        <div className="space-y-4">
          {/* Top statistics summary indicator */}
          <div className="flex justify-between items-center bg-stone-50 border p-3.5 rounded-xl font-mono text-xs text-stone-500 max-w-sm mx-auto shadow-inner select-none">
            <span className="flex items-center gap-1 font-serif text-stone-750 font-bold">
              <Grid className="w-4 h-4 text-amber-600" />
              {narrativeStyle === "academic" ? "评测模式" : "当前难度"}: {difficulty === "easy" ? (narrativeStyle === "academic" ? "基础 (4对)" : "初学 (4对)") : (narrativeStyle === "academic" ? "进阶 (5对)" : "通晓 (5对)")}
            </span>
            <span>
              已完成步数: <b className="text-stone-900 font-black">{moves}</b> 步
            </span>
          </div>

          {/* Cards Grid canvas */}
          <div 
            className={`grid gap-3.5 max-w-3xl mx-auto select-none ${
              difficulty === "easy" 
                ? "grid-cols-4" 
                : "grid-cols-4 sm:grid-cols-5"
            }`}
          >
            {cards.map((card, idx) => {
              const showContent = card.isFlipped || card.isMatched;

              return (
                <div 
                  key={card.cardId}
                  className="relative aspect-[3/4.2] w-full cursor-pointer perspective-1000 group"
                  onClick={(e) => handleCardClick(idx, e)}
                >
                  <div 
                    className="absolute inset-0 w-full h-full rounded-2xl shadow transition-all duration-300 preserve-3d"
                    style={{
                      transform: showContent ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}
                  >
                    {/* CARD BACK: Elegant crimson gold Shinto Hanafuda style */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-rose-950 to-[#5a1215] border-3 border-amber-500 p-2.5 flex flex-col justify-between items-center text-center backface-hidden overflow-hidden">
                      {/* Stylized Sun gold outline */}
                      <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-double border-amber-500/20 animate-pulse" />
                      
                      {/* Top Japanese watermark stamp */}
                      <span className="text-[8px] font-serif font-black text-amber-500/50 leading-tight">🎴</span>

                      {/* Floral Crest central motif */}
                      <div className="w-8 h-8 rounded-full border border-dashed border-amber-500/40 flex items-center justify-center text-amber-500/60 font-serif font-bold text-[10px]">
                        和
                      </div>

                      <div className="text-[7px] font-mono tracking-widest text-amber-500/40 uppercase">HANAFUDA</div>
                    </div>

                    {/* CARD FRONT: Clean white info visual card */}
                    <div 
                      className={`absolute inset-0 w-full h-full rounded-2xl bg-white border-2 p-3 flex flex-col justify-between items-center text-center backface-hidden rotateY-180 transition-opacity duration-300 ${
                        card.isMatched ? "opacity-35 border-stone-200" : "border-stone-800 shadow"
                      }`}
                    >
                      {/* Top metadata tag */}
                      <div className="w-full flex justify-between items-center text-[8px] font-mono text-stone-400">
                        <span>{card.type === "kana" ? "🌸 假名" : "📖 释义"}</span>
                        <span>#{card.illustrationId.toUpperCase()}</span>
                      </div>

                      {/* Central word illustrations or text */}
                      <div className="flex flex-col items-center justify-center space-y-2 flex-1 min-w-0 w-full">
                        {card.type === "kana" ? (
                          <>
                            <div className="scale-90 opacity-85">
                              <CardIllustration id={card.itemId} category={card.category} className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-serif font-black text-stone-900 truncate max-w-full leading-tight">
                              {card.label}
                            </h4>
                          </>
                        ) : (
                          <div className="w-full text-center space-y-1">
                            <span className="text-[8px] font-mono text-stone-400 uppercase tracking-wider">ROMAJI REWRITE</span>
                            <p className="text-[11px] font-mono font-black text-amber-900 bg-amber-500/10 py-1.5 px-2 rounded-lg border border-amber-500/20 break-words leading-tight">
                              {card.label}
                            </p>
                          </div>
                        )}
                      </div>

                      <span className="text-[8px] font-mono text-stone-400 leading-none">
                        {card.isMatched ? "✓ MATCHED" : "UNLOCKED"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 text-center">
            <button
              onClick={setupBoard}
              className="px-4 py-2 rounded-xl border border-stone-350 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>重新洗牌棋盘</span>
            </button>
          </div>
        </div>
      )}

      {/* --- GAME COMPLETE SUMMARY MODAL --- */}
      {showGameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto p-8 rounded-2xl border-2 border-stone-800 bg-[#f9f7f4] text-center space-y-6 shadow-xl select-none"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30 text-2xl font-serif">
            🎴
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 font-bold uppercase block">
              {narrativeStyle === "mythology" ? "PUZZLE SOLVED • 和风消消乐通关" : narrativeStyle === "cultural" ? "CARDS COMPLETED • 纸牌配对圆满" : "TEST COMPLETED • 记忆测试通关"}
            </span>
            <h2 className="text-2xl font-serif font-black text-stone-900">
              {narrativeStyle === "mythology" ? "和歌纸牌记忆归位！" : narrativeStyle === "cultural" ? "风雅和歌纸牌完美重合！" : "假名记忆匹配评估通过！"}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {narrativeStyle === "mythology" 
                ? "所有的假名与罗马音均已配对完毕！你凭借卓越的记忆力，拨开了遮蔽日晷的神社樱云。"
                : narrativeStyle === "cultural"
                ? "字音与字形在时光中优雅契合。您凭借过人的视觉记忆，谱写出了完美的音律组合！"
                : "恭喜！您已成功完成了全部假名字形与其罗马音标拼写的双向映射认知训练。"}
            </p>
          </div>

          {/* Stars and Rating container */}
          <div className="p-5 rounded-2xl bg-white border border-stone-250 space-y-3 shadow-inner">
            <div className="flex justify-center items-center gap-1.5 text-amber-500 text-xl font-bold">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${i < scoreDetails.stars ? "fill-amber-500 text-amber-500 animate-bounce" : "text-stone-200"}`}
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-black text-stone-800 text-sm">{scoreDetails.title}</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed max-w-xs mx-auto">
                {scoreDetails.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-dashed flex justify-between items-center text-xs font-mono text-stone-600">
              <span>完成总步数:</span>
              <span className="font-bold text-stone-900">{moves} 步</span>
            </div>
          </div>

          {/* Coins Reward */}
          <div className="p-4 rounded-xl border border-amber-250 bg-amber-50/70 max-w-sm mx-auto text-center space-y-1.5">
            <div className="text-xs text-amber-950 font-serif font-black flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>{nTrans("rewardSourceCoins", narrativeStyle)}：</span>
            </div>
            <div className="text-2xl font-mono font-black text-amber-900">
              🪙 +{scoreDetails.coins} {nTrans("coinName", narrativeStyle)}
            </div>
            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 inline-block">
              ✓ 已实时存入您的钱包
            </div>
            {scoreDetails.stars === 3 && (
              <p className="text-[9px] text-amber-800 font-sans mt-1">
                ⭐ {nTrans("perfectBonus", narrativeStyle)}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={setupBoard}
              className="flex-1 py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-black text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>再次挑战</span>
            </button>

            <button
              onClick={handleClaimCoins}
              className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-black text-xs transition-colors cursor-pointer shadow flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{narrativeStyle === "mythology" ? "收下和币并离开" : narrativeStyle === "cultural" ? "完成练习并返回" : "结束评测并返回"}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
