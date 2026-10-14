import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Volume2,
  RotateCw,
  Award,
  CheckCircle2,
  Calendar,
  Flame,
  ChevronRight,
  ExternalLink,
  Keyboard,
  Compass,
  Lightbulb,
  Scroll,
  Smile,
  Zap,
} from "lucide-react";
import { DictionaryItem, hiraganaToKatakana } from "../data/dictionary";
import { splitKanaIntoSyllables } from "../utils/kanaHelper";
import { audioSynth } from "../utils/audio";
import { addDailyProgress, getTodayDateString } from "../utils/dailyGoal";

export interface DailyWordData {
  id: string;
  kanji: string;
  hiragana: string;
  katakana: string;
  romaji: string;
  meaning: string;
  categoryName?: string;
  difficulty?: string;
}

export interface DailyWordAnalysis {
  etymology: string;
  culturalStory: string;
  mnemonicTip: string;
  exampleSentence?: {
    japanese: string;
    kana?: string;
    translation: string;
  };
  funFact?: string;
  challengeTask?: string;
}

interface DailyWordChallengeCardProps {
  onStartTrainingWord: (item: DictionaryItem, kanaMode: "hiragana" | "katakana") => void;
  onGoToKanaTraining: (type: "hiragana" | "katakana") => void;
  candidateWords?: DictionaryItem[];
  onRewardClaimed?: (xpReward: number, coinReward: number) => void;
}

const STORAGE_CACHE_KEY = "katakata_daily_word_cache";
const STORAGE_COMPLETED_KEY = "katakata_daily_word_completed_";

export const DailyWordChallengeCard: React.FC<DailyWordChallengeCardProps> = ({
  onStartTrainingWord,
  onGoToKanaTraining,
  candidateWords = [],
  onRewardClaimed,
}) => {
  const todayStr = getTodayDateString();
  const [dailyWord, setDailyWord] = useState<DailyWordData | null>(null);
  const [analysis, setAnalysis] = useState<DailyWordAnalysis | null>(null);
  const [source, setSource] = useState<"gemini" | "curated" | "fallback">("gemini");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_COMPLETED_KEY}${todayStr}`) === "true";
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<"etymology" | "culturalStory" | "mnemonicTip" | "example" | "funFact">("etymology");
  const [rewardClaimedNotice, setRewardClaimedNotice] = useState<string>("");

  // Load daily word on mount
  useEffect(() => {
    let isMounted = true;

    const loadChallenge = async () => {
      // 1. Try reading cache for today
      try {
        const cachedRaw = localStorage.getItem(STORAGE_CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached && cached.date === todayStr && cached.word && cached.analysis) {
            if (isMounted) {
              setDailyWord(cached.word);
              setAnalysis(cached.analysis);
              setSource(cached.source || "gemini");
              return;
            }
          }
        }
      } catch (_) {}

      // 2. Fetch from Gemini API endpoint
      await fetchDailyChallenge(false);
    };

    loadChallenge();

    return () => {
      isMounted = false;
    };
  }, [todayStr]);

  const fetchDailyChallenge = async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // Pick up to 20 candidate words from current library if available
      const sampleCandidates = candidateWords.slice(0, 20).map((c) => ({
        id: c.id,
        kanji: c.kanji,
        kanaStr: c.kanaStr,
        meaning: c.meaning,
        categoryName: c.categoryName,
      }));

      const res = await fetch("/api/daily-word-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayStr,
          forceRefresh,
          candidates: sampleCandidates,
        }),
      });

      const data = await res.json();
      if (data && data.success && data.word && data.analysis) {
        setDailyWord(data.word);
        setAnalysis(data.analysis);
        setSource(data.source || "gemini");

        // Save to cache
        try {
          localStorage.setItem(
            STORAGE_CACHE_KEY,
            JSON.stringify({
              date: todayStr,
              word: data.word,
              analysis: data.analysis,
              source: data.source,
            })
          );
        } catch (_) {}
      } else {
        throw new Error(data?.error || "未能获取今日挑战数据");
      }
    } catch (err: any) {
      console.error("Failed to load daily challenge:", err);
      setErrorMsg("加载每日挑战失败，请检查网络或点击重新尝试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      audioSynth.playCardSlide();
    } catch (_) {}
    fetchDailyChallenge(true);
  };

  const handlePlayAudio = (textToSpeak?: string) => {
    if (!dailyWord && !textToSpeak) return;
    const target = textToSpeak || dailyWord?.hiragana || dailyWord?.kanji || "";
    setIsPlayingAudio(true);
    try {
      audioSynth.speakJapanese(target);
      setTimeout(() => setIsPlayingAudio(false), 1200);
    } catch (_) {
      setIsPlayingAudio(false);
    }
  };

  const handleClaimReward = () => {
    if (isCompleted) return;
    setIsCompleted(true);
    try {
      localStorage.setItem(`${STORAGE_COMPLETED_KEY}${todayStr}`, "true");
      audioSynth.playFanfare();
      
      // Add XP
      const currentXp = Number(localStorage.getItem("fifty_sound_xp") || "0");
      localStorage.setItem("fifty_sound_xp", String(currentXp + 50));
      window.dispatchEvent(new CustomEvent("katakata_xp_updated", { detail: { xp: currentXp + 50 } }));

      // Add coins
      const currentCoins = Number(localStorage.getItem("fifty_sound_coins") || "100");
      localStorage.setItem("fifty_sound_coins", String(currentCoins + 50));
      window.dispatchEvent(new CustomEvent("katakata_coins_updated", { detail: { coins: currentCoins + 50 } }));

      // Add daily goal progress (+1 word)
      addDailyProgress(1, 1);

      if (onRewardClaimed) {
        onRewardClaimed(50, 50);
      }

      setRewardClaimedNotice("🎉 恭喜完成今日一词挑战！已觉醒言灵，获得 +50 铜钱 & +50 XP");
      setTimeout(() => setRewardClaimedNotice(""), 4500);
    } catch (_) {}
  };

  // Build DictionaryItem for direct training
  const handleStartTypingPractice = (mode: "hiragana" | "katakana") => {
    if (!dailyWord) return;
    try {
      audioSynth.playCardSlide();
    } catch (_) {}

    const targetKana =
      mode === "hiragana"
        ? dailyWord.hiragana || dailyWord.kanji
        : dailyWord.katakana || hiraganaToKatakana(dailyWord.hiragana || dailyWord.kanji);

    const segments = splitKanaIntoSyllables(targetKana);

    const challengeItem: DictionaryItem = {
      id: `daily_${dailyWord.id}_${mode}`,
      kanji: dailyWord.kanji,
      kanaStr: targetKana,
      category: "culture",
      categoryName: dailyWord.categoryName || "每日一词挑战",
      meaning: dailyWord.meaning,
      rarity: "SR",
      rarityName: "每日挑战 (SR)",
      glowColor: mode === "hiragana" ? "rgba(196, 72, 42, 0.3)" : "rgba(217, 119, 6, 0.3)",
      borderColor: mode === "hiragana" ? "border-rose-400" : "border-amber-400",
      bgGradient: mode === "hiragana" ? "from-rose-50 to-orange-100" : "from-amber-50 to-orange-100",
      segments: segments.length > 0 ? segments : [{ kana: targetKana, romaji: [dailyWord.romaji], displayRomaji: dailyWord.romaji }],
    };

    // Auto mark completed when user launches training
    if (!isCompleted) {
      handleClaimReward();
    }

    onStartTrainingWord(challengeItem, mode);
  };

  return (
    <div className="relative border border-stone-300/80 bg-[#FAF7F0] rounded-sm p-5 md:p-7 shadow-xs overflow-hidden transition-all duration-300 hover:border-stone-400 select-none">
      {/* Decorative Traditional Japanese Wabi-Sabi Woodblock Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#C4482A]/70 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#C4482A]/70 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#C4482A]/70 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#C4482A]/70 pointer-events-none" />

      {/* Background Soft Seal Watermark */}
      <div className="absolute -right-6 -bottom-8 text-8xl font-serif text-stone-900/[0.03] select-none pointer-events-none leading-none">
        言霊
      </div>

      {/* 1. Header with Badge & Today's Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/90 relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#C4482A] text-[#F3EFE3] rounded-xs shadow-xs text-xs font-serif font-black tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>每日一词挑战</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-serif text-stone-600 bg-white/80 border border-stone-200 px-2 py-0.5 rounded-xs">
            <Calendar className="w-3 h-3 text-stone-400" />
            <span>{todayStr}</span>
            <span className="text-stone-300 mx-0.5">·</span>
            <span className="text-[#C4482A] font-bold">日替言灵</span>
          </div>

          {source === "gemini" && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-sans text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
              <Zap className="w-2.5 h-2.5 fill-current text-amber-500" />
              <span>Gemini AI 智能考据解读</span>
            </span>
          )}
        </div>

        {/* Right Header Status & Refresh Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-serif font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-xs shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>今日挑战已达成 (+50)</span>
            </span>
          ) : (
            <button
              onClick={handleClaimReward}
              type="button"
              className="flex items-center gap-1 text-xs font-serif text-amber-900 bg-amber-100/80 hover:bg-amber-200/90 border border-amber-300 px-2.5 py-1 rounded-xs transition-colors cursor-pointer shadow-2xs"
              title="点击打卡并领取今日言灵奖励"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>打卡今日挑战</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 hover:text-stone-900 rounded-xs text-xs font-serif transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="利用 Gemini API 重新换一词挑选挑战"
          >
            <RotateCw className={`w-3 h-3 ${isLoading ? "animate-spin text-[#C4482A]" : ""}`} />
            <span>{isLoading ? "解读中..." : "换一词"}</span>
          </button>
        </div>
      </div>

      {/* Reward Notice Toast */}
      {rewardClaimedNotice && (
        <div className="mt-3 px-3 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-serif rounded-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{rewardClaimedNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-serif rounded-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => fetchDailyChallenge(true)}
            className="text-xs font-bold underline hover:text-red-950 cursor-pointer ml-2"
          >
            重试
          </button>
        </div>
      )}

      {/* 2. Main Daily Word Display Card */}
      {dailyWord ? (
        <div className="mt-5 space-y-6 relative z-10">
          <div className="bg-white/95 border border-stone-200/80 rounded-sm p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Word Core Typography & Pronunciation */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {dailyWord.categoryName && (
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-700 border border-stone-300 text-[11px] font-serif rounded-xs">
                    {dailyWord.categoryName}
                  </span>
                )}
                {dailyWord.difficulty && (
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-sans font-bold rounded-xs">
                    {dailyWord.difficulty}
                  </span>
                )}
              </div>

              {/* Kanji & Speaker */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2
                  className="text-3xl sm:text-4xl font-serif font-black text-stone-900 tracking-wider hover:text-[#C4482A] transition-colors cursor-pointer select-text"
                  onClick={() => handlePlayAudio()}
                  title="点击朗读该词汇发音"
                >
                  {dailyWord.kanji}
                </h2>

                <button
                  type="button"
                  onClick={() => handlePlayAudio()}
                  className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                    isPlayingAudio
                      ? "bg-[#C4482A] text-white border-[#C4482A] scale-110"
                      : "bg-stone-50 hover:bg-stone-200/80 text-stone-600 border-stone-300"
                  }`}
                  title="朗读日文发音"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Kana Syllables Chips (Hiragana / Katakana / Romaji) */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-serif">
                <div className="flex items-center gap-1.5 bg-[#FAF7F0] px-2.5 py-1 rounded border border-rose-200">
                  <span className="text-[10px] text-rose-700 font-bold">平</span>
                  <span className="font-bold text-stone-800 text-sm select-text">{dailyWord.hiragana}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#FAF7F0] px-2.5 py-1 rounded border border-amber-200">
                  <span className="text-[10px] text-amber-700 font-bold">片</span>
                  <span className="font-bold text-stone-800 text-sm select-text">{dailyWord.katakana}</span>
                </div>

                <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded border border-stone-200 text-stone-500 font-mono text-[11px]">
                  <span>romaji:</span>
                  <span className="font-semibold text-stone-800 select-text">{dailyWord.romaji}</span>
                </div>
              </div>

              {/* Chinese Definition */}
              <p className="text-xs sm:text-sm font-serif text-stone-700 pt-1 leading-relaxed">
                <span className="text-stone-400 font-normal mr-1">释义：</span>
                <span className="font-semibold text-stone-900">{dailyWord.meaning}</span>
              </p>
            </div>

            {/* Practice Action Buttons Area (As Explicitly Requested) */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 justify-center">
              {/* Button 1: 五十音平假名练习按钮 */}
              <div className="flex items-center border border-rose-300 rounded-sm overflow-hidden shadow-xs bg-rose-50/50 hover:bg-rose-50 transition-colors">
                <button
                  type="button"
                  onClick={() => handleStartTypingPractice("hiragana")}
                  className="flex-1 px-3.5 py-2.5 bg-[#C4482A] hover:bg-[#a63c22] text-white active:scale-98 transition-all font-serif font-bold text-xs tracking-wider flex items-center gap-1.5 cursor-pointer"
                  title="以平假名开启该词的盲打练习挑战"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>五十音平假名练习</span>
                </button>
                <button
                  type="button"
                  onClick={() => onGoToKanaTraining("hiragana")}
                  className="px-2 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border-l border-rose-200 transition-colors text-[11px] font-serif font-bold cursor-pointer"
                  title="跳转至五十音平假名学宫"
                >
                  <span>学宫</span>
                </button>
              </div>

              {/* Button 2: 五十音片假名练习按钮 */}
              <div className="flex items-center border border-amber-300 rounded-sm overflow-hidden shadow-xs bg-amber-50/50 hover:bg-amber-50 transition-colors">
                <button
                  type="button"
                  onClick={() => handleStartTypingPractice("katakana")}
                  className="flex-1 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white active:scale-98 transition-all font-serif font-bold text-xs tracking-wider flex items-center gap-1.5 cursor-pointer"
                  title="以片假名开启该词的击键打卡挑战"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>五十音片假名练习</span>
                </button>
                <button
                  type="button"
                  onClick={() => onGoToKanaTraining("katakana")}
                  className="px-2 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-l border-amber-200 transition-colors text-[11px] font-serif font-bold cursor-pointer"
                  title="跳转至五十音片假名训练区"
                >
                  <span>训练区</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. “词源故事解读” Tabs and Deep Dive Section */}
          {analysis && (
            <div className="border border-stone-200 bg-white/70 rounded-sm p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 font-serif font-bold text-stone-900 text-xs tracking-wider">
                  <BookOpen className="w-4 h-4 text-[#C4482A]" />
                  <span>词源故事与深度解读</span>
                  <span className="text-[11px] text-stone-400 font-normal">（点击标签切换品读）</span>
                </div>

                {/* Sub Tab Buttons */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveTab("etymology")}
                    className={`px-2.5 py-1 text-xs font-serif rounded-xs border transition-all cursor-pointer ${
                      activeTab === "etymology"
                        ? "bg-stone-900 text-[#F3EFE3] border-stone-900 font-bold"
                        : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    📜 词源考据
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("culturalStory")}
                    className={`px-2.5 py-1 text-xs font-serif rounded-xs border transition-all cursor-pointer ${
                      activeTab === "culturalStory"
                        ? "bg-stone-900 text-[#F3EFE3] border-stone-900 font-bold"
                        : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    👘 文化物语
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("mnemonicTip")}
                    className={`px-2.5 py-1 text-xs font-serif rounded-xs border transition-all cursor-pointer ${
                      activeTab === "mnemonicTip"
                        ? "bg-stone-900 text-[#F3EFE3] border-stone-900 font-bold"
                        : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    💡 假名巧思
                  </button>
                  {analysis.exampleSentence && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("example")}
                      className={`px-2.5 py-1 text-xs font-serif rounded-xs border transition-all cursor-pointer ${
                        activeTab === "example"
                          ? "bg-stone-900 text-[#F3EFE3] border-stone-900 font-bold"
                          : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      💬 实用例句
                    </button>
                  )}
                  {analysis.funFact && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("funFact")}
                      className={`px-2.5 py-1 text-xs font-serif rounded-xs border transition-all cursor-pointer ${
                        activeTab === "funFact"
                          ? "bg-stone-900 text-[#F3EFE3] border-stone-900 font-bold"
                          : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      🍵 冷知识
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="pt-1 text-xs sm:text-sm font-serif text-stone-800 leading-relaxed min-h-[75px]">
                {activeTab === "etymology" && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <div className="text-[11px] font-sans font-bold text-[#C4482A] uppercase tracking-wider">
                      Origin & Etymology Flow · 语源流变
                    </div>
                    <p className="text-stone-800 leading-relaxed font-serif select-text">
                      {analysis.etymology}
                    </p>
                  </div>
                )}

                {activeTab === "culturalStory" && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <div className="text-[11px] font-sans font-bold text-amber-800 uppercase tracking-wider">
                      Cultural Lore & Japanese Story · 文化物语
                    </div>
                    <p className="text-stone-800 leading-relaxed font-serif select-text">
                      {analysis.culturalStory}
                    </p>
                  </div>
                )}

                {activeTab === "mnemonicTip" && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <div className="text-[11px] font-sans font-bold text-emerald-800 uppercase tracking-wider">
                      Fifty Sounds Mnemonic Hook · 五十音假名联想记忆
                    </div>
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xs text-stone-850 select-text leading-relaxed">
                      {analysis.mnemonicTip}
                    </div>
                  </div>
                )}

                {activeTab === "example" && analysis.exampleSentence && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="text-[11px] font-sans font-bold text-stone-500 uppercase tracking-wider">
                      Practical Example Sentence · 日汉实用例句
                    </div>
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-serif font-bold text-stone-900 text-sm select-text">
                          {analysis.exampleSentence.japanese}
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(analysis.exampleSentence?.japanese)}
                          className="p-1 hover:bg-stone-200 rounded text-stone-600 cursor-pointer"
                          title="朗读例句"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {analysis.exampleSentence.kana && (
                        <div className="text-xs text-stone-500 font-serif select-text">
                          {analysis.exampleSentence.kana}
                        </div>
                      )}
                      <div className="text-xs text-stone-700 font-serif border-t border-stone-200/70 pt-1 select-text">
                        {analysis.exampleSentence.translation}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "funFact" && analysis.funFact && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <div className="text-[11px] font-sans font-bold text-indigo-800 uppercase tracking-wider">
                      Fascinating Trivia · 趣闻冷知识
                    </div>
                    <div className="p-3 bg-indigo-50/60 border border-indigo-200/70 rounded-xs text-stone-800 select-text leading-relaxed">
                      {analysis.funFact}
                    </div>
                  </div>
                )}
              </div>

              {/* Challenge Task Encouragement */}
              {analysis.challengeTask && (
                <div className="mt-2 pt-2.5 border-t border-stone-200/70 flex items-center gap-2 text-[11px] font-serif text-stone-600">
                  <Flame className="w-3.5 h-3.5 text-[#C4482A] shrink-0" />
                  <span className="select-text">{analysis.challengeTask}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Loading skeleton */
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RotateCw className="w-6 h-6 animate-spin text-[#C4482A]" />
          <p className="text-xs font-serif text-stone-500">
            Gemini 正在翻阅古典语林，精心挑选今日挑战词汇与词源故事...
          </p>
        </div>
      )}
    </div>
  );
};
