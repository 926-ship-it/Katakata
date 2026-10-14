import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Clipboard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Volume2,
  Check,
  ChevronRight,
  BookOpen,
  Lock,
  KeyRound,
  ShieldCheck,
  Languages,
  Eye,
  Edit2,
  Highlighter,
  PenTool,
  BookmarkCheck,
  Target,
  Quote,
  Tag
} from "lucide-react";
import { isUploadPasskeyUnlocked, verifyUploadPasskey, lockUploadPasskey } from "../utils/passkeyAuth";
import { audioSynth } from "../utils/audio";
import { DictionaryItem } from "../data/dictionary";
import { SpanishWord, saveBatchCustomSpanishWords } from "../data/spanishData";
import { splitKanaIntoSyllables, splitAlphabeticIntoSegments, saveBatchStoredCustomWords } from "../utils/kanaHelper";
import { getEnglishPhonetic } from "../utils/englishPhonetics";

export interface ExtractedWordItem {
  id: string;
  target: string;
  reading: string;
  partOfSpeech?: string;
  meaning: string;
  markType?: "circle" | "highlight" | "underline" | "handwritten" | "general";
  contextSentence?: string;
  example?: string;
  exampleZh?: string;
  selected: boolean;
}

interface PhotoWordUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: "ja" | "es" | "en" | "auto";
  onImportComplete?: (count: number, lang: "ja" | "es" | "en") => void;
  onNavigateToRecite?: (lang: "ja" | "es" | "en") => void;
  onNavigateToLibrary?: () => void;
}

export const PhotoWordUploadModal: React.FC<PhotoWordUploadModalProps> = ({
  isOpen,
  onClose,
  defaultLanguage = "auto",
  onImportComplete,
  onNavigateToRecite,
  onNavigateToLibrary,
}) => {
  // Passkey Gate state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isUploadPasskeyUnlocked());
  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [passkeyError, setPasskeyError] = useState<string>("");

  // Scan Mode: "marked_only" (Circles & Highlighters) vs "full_page" (Whole page)
  const [scanMode, setScanMode] = useState<"marked_only" | "full_page">("marked_only");
  const [isMarkedModeDetected, setIsMarkedModeDetected] = useState<boolean>(false);
  const [customCategoryName, setCustomCategoryName] = useState<string>("📓 纸质圈词错题本");

  // Upload & Image State
  const [selectedLanguage, setSelectedLanguage] = useState<"ja" | "es" | "en" | "auto">(defaultLanguage);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // OCR Processing State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<"ja" | "es" | "en">("en");
  const [imageDescription, setImageDescription] = useState<string>("");
  const [extractedWords, setExtractedWords] = useState<ExtractedWordItem[]>([]);

  // Success celebration state
  const [isSuccessState, setIsSuccessState] = useState<boolean>(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Hidden inputs
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Passkey listeners
  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(isUploadPasskeyUnlocked());
      setPasskeyInput("");
      setPasskeyError("");
    }
    const handleUnlock = () => setIsUnlocked(true);
    const handleLock = () => setIsUnlocked(false);
    window.addEventListener("katakata_passkey_unlocked", handleUnlock);
    window.addEventListener("katakata_passkey_locked", handleLock);
    return () => {
      window.removeEventListener("katakata_passkey_unlocked", handleUnlock);
      window.removeEventListener("katakata_passkey_locked", handleLock);
    };
  }, [isOpen]);

  // Reset when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLanguage(defaultLanguage);
      setImagePreview(null);
      setImageFile(null);
      setExtractedWords([]);
      setAnalysisError(null);
      setIsSuccessState(false);
      setIsMarkedModeDetected(false);
    }
  }, [isOpen, defaultLanguage]);

  // Support pasting image from clipboard anywhere while modal is open
  useEffect(() => {
    if (!isOpen || !isUnlocked) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageSelected(file);
            audioSynth.playTyping();
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, isUnlocked]);

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyInput.trim()) {
      setPasskeyError("请输入通关卡密");
      audioSynth.playError();
      return;
    }
    const ok = verifyUploadPasskey(passkeyInput);
    if (ok) {
      setIsUnlocked(true);
      setPasskeyError("");
      audioSynth.playCoin();
    } else {
      setPasskeyError("卡密不正确，请重新输入");
      audioSynth.playError();
    }
  };

  const handleImageSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setAnalysisError("请上传有效的图片文件 (JPG, PNG, WebP)");
      audioSynth.playError();
      return;
    }
    setAnalysisError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], "pasted-screenshot.png", { type: imageType });
          handleImageSelected(file);
          audioSynth.playTyping();
          return;
        }
      }
      setAnalysisError("剪贴板中未发现图片，请使用截图快捷键复制后重试。");
      audioSynth.playError();
    } catch (err) {
      setAnalysisError("无法读取剪贴板，请直接按 Ctrl+V / Cmd+V 粘贴图片，或点击拍照/选择文件。");
    }
  };

  // Perform Gemini Multimodal OCR
  const handleStartOcr = async () => {
    if (!imagePreview) {
      setAnalysisError("请先拍照或上传图片。");
      audioSynth.playError();
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    audioSynth.playTyping();

    try {
      const response = await fetch("/api/ocr-extract-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          language: selectedLanguage,
          scanMode: scanMode,
          mimeType: imageFile?.type || "image/jpeg",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "识别图片词汇失败，请确保图片清晰有文字。");
      }

      const detected = (data.detectedLanguage as "ja" | "es" | "en") || (selectedLanguage === "auto" ? "en" : selectedLanguage);
      setDetectedLang(detected);
      setImageDescription(data.imageDescription || "已识别图片中的词汇");
      setIsMarkedModeDetected(Boolean(data.isMarkedModeDetected));

      const items: ExtractedWordItem[] = (data.words || []).map((w: any, idx: number) => ({
        id: `ocr-item-${Date.now()}-${idx}`,
        target: (w.target || "").trim(),
        reading: (w.reading || "").trim(),
        partOfSpeech: w.partOfSpeech || "",
        meaning: (w.meaning || "").trim(),
        markType: w.markType || (scanMode === "marked_only" ? "circle" : "general"),
        contextSentence: (w.contextSentence || "").trim(),
        example: w.example || "",
        exampleZh: w.exampleZh || "",
        selected: true,
      })).filter((w: ExtractedWordItem) => w.target.length > 0);

      if (items.length === 0) {
        setAnalysisError(
          scanMode === "marked_only"
            ? "未在图片中检测到明显的圆圈圈选、荧光笔高光或手写生词标记。请尝试在纸上圈得更明显些，或切换到【整页全篇模式】。"
            : "未能从图片中识别出清晰的学习词汇，请尝试裁剪或换一张更清晰的照片。"
        );
        audioSynth.playError();
      } else {
        setExtractedWords(items);
        audioSynth.playFanfare();
      }
    } catch (err: any) {
      console.error("OCR request failed:", err);
      setAnalysisError(err.message || "拍照识词服务响应异常，请重试。");
      audioSynth.playError();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle selection
  const toggleSelectAll = () => {
    const allSelected = extractedWords.every((w) => w.selected);
    setExtractedWords(extractedWords.map((w) => ({ ...w, selected: !allSelected })));
  };

  const toggleItemSelection = (id: string) => {
    setExtractedWords(
      extractedWords.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const handleUpdateWord = (id: string, field: "target" | "reading" | "meaning", value: string) => {
    setExtractedWords(
      extractedWords.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleDeleteWord = (id: string) => {
    setExtractedWords(extractedWords.filter((w) => w.id !== id));
  };

  // Pronounce word preview
  const handleSpeak = (text: string, lang: "ja" | "es" | "en") => {
    audioSynth.speakFullWord(text, undefined, undefined, undefined, lang);
  };

  // Save selected words into vocabulary library / mistake notebook
  const handleSaveToLibrary = () => {
    const selectedWords = extractedWords.filter((w) => w.selected && w.target.trim().length > 0);
    if (selectedWords.length === 0) {
      setAnalysisError("请至少勾选一个有效生词进行收录。");
      audioSynth.playError();
      return;
    }

    const finalCategory = customCategoryName.trim() || (scanMode === "marked_only" ? "📓 纸质圈词错题本" : "📷 拍照视觉收录");

    if (detectedLang === "es") {
      const newSpanishWords: SpanishWord[] = selectedWords.map((w, idx) => {
        const cleanTarget = w.target.trim();
        const cleanMeaning = w.meaning.trim() || "（待补充释义）";
        return {
          id: `custom-es-ocr-${Date.now()}-${idx}`,
          word: cleanTarget,
          meaning: cleanMeaning,
          partOfSpeech: w.partOfSpeech || "s.m.",
          phonetic: w.reading || "",
          category: "custom",
          categoryName: finalCategory,
          level: "A1",
          isCustom: true,
          exampleEs: w.contextSentence || w.example || cleanTarget,
          exampleZh: w.exampleZh || (w.contextSentence ? "【原卷上下文例句】" : cleanMeaning),
        };
      });

      saveBatchCustomSpanishWords(newSpanishWords);
      audioSynth.playFanfare();
      setSavedCount(newSpanishWords.length);
      setIsSuccessState(true);
      if (onImportComplete) {
        onImportComplete(newSpanishWords.length, "es");
      }
    } else if (detectedLang === "en") {
      const newItems: DictionaryItem[] = selectedWords.map((w, idx) => {
        const cleanTarget = w.target.trim();
        const cleanMeaning = w.meaning.trim() || "（待补充释义）";
        const segments = splitAlphabeticIntoSegments(cleanTarget);
        const ipa = w.reading.trim() || getEnglishPhonetic(cleanTarget);
        return {
          id: `custom-en-ocr-${Date.now()}-${idx}`,
          kanji: cleanTarget,
          kanaStr: cleanTarget,
          category: "custom",
          categoryName: finalCategory,
          meaning: cleanMeaning,
          rarity: "SR",
          rarityName: "圈词错题 (SR)",
          glowColor: "rgba(239, 68, 68, 0.25)",
          borderColor: "border-rose-400",
          bgGradient: "from-rose-50 to-orange-100",
          segments: segments,
          phoneticUs: ipa,
          phoneticUk: getEnglishPhonetic(cleanTarget, "uk"),
        };
      });

      saveBatchStoredCustomWords(newItems);
      audioSynth.playFanfare();
      setSavedCount(newItems.length);
      setIsSuccessState(true);
      if (onImportComplete) {
        onImportComplete(newItems.length, "en");
      }
    } else {
      // Japanese
      const newItems: DictionaryItem[] = selectedWords.map((w, idx) => {
        const cleanTarget = w.target.trim();
        const cleanReading = (w.reading || cleanTarget).trim();
        const cleanMeaning = w.meaning.trim() || "（待补充释义）";
        const segments = splitKanaIntoSyllables(cleanReading);
        return {
          id: `custom-ja-ocr-${Date.now()}-${idx}`,
          kanji: cleanTarget,
          kanaStr: cleanReading,
          category: "custom",
          categoryName: finalCategory,
          meaning: cleanMeaning,
          rarity: "SR",
          rarityName: "圈词错题 (SR)",
          glowColor: "rgba(245, 158, 11, 0.25)",
          borderColor: "border-amber-400",
          bgGradient: "from-amber-50 to-orange-100",
          segments: segments.length > 0 ? segments : splitAlphabeticIntoSegments(cleanReading),
        };
      });

      saveBatchStoredCustomWords(newItems);
      audioSynth.playFanfare();
      setSavedCount(newItems.length);
      setIsSuccessState(true);
      if (onImportComplete) {
        onImportComplete(newItems.length, "ja");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#fcfbf9] border-2 border-stone-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-stone-800 my-auto"
        >
          {/* Header Bar */}
          <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-serif flex items-center gap-2">
                  <span>📷 AI 拍照圈词 · 错题本智能录词</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>错题本专属</span>
                  </span>
                </h2>
                <p className="text-xs text-stone-400 font-sans">
                  对纸质书本/试卷拍照，AI 自动定位荧光笔高光与手画圆圈生词，整理成错题本随时复习
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isUnlocked && (
                <button
                  type="button"
                  onClick={() => lockUploadPasskey()}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                  title="清除当前浏览器卡密授权并重新加锁"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden xs:inline">重新加锁</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isUnlocked ? (
            /* Passkey Gate Protection View */
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-inner">
                <KeyRound className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900 uppercase">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>通关卡密保护通道</span>
                </div>
                <h3 className="text-2xl font-black font-serif text-stone-900">
                  输入通关卡密解锁拍照识词
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  多模态视觉识词、拍照导入课本生词及发音生成通道需凭专属通关卡密开启。
                </p>
              </div>

              <form onSubmit={handlePasskeySubmit} className="w-full max-w-sm space-y-3 pt-2">
                <input
                  type="text"
                  maxLength={16}
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value.toUpperCase());
                    if (passkeyError) setPasskeyError("");
                  }}
                  placeholder="请输入通关卡密"
                  className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-center text-lg font-mono font-black tracking-widest text-stone-950 placeholder:text-stone-400 placeholder:font-normal placeholder:tracking-normal outline-none transition-all shadow-inner"
                />

                {passkeyError && (
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-rose-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{passkeyError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-stone-900 hover:bg-[#C4482A] text-stone-50 font-serif font-black text-xs tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>立即验证通关卡密 ＞</span>
                </button>
              </form>
            </div>
          ) : isSuccessState ? (
            /* Success Celebration View */
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] font-mono font-bold text-emerald-900 uppercase">
                  <span>PHOTO IMPORT SUCCESS</span>
                </div>
                <h3 className="text-2xl font-black font-serif text-stone-900">
                  成功收录 {savedCount} 个生词！
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  已全部保存到专属分类【<span className="font-bold text-amber-800">{customCategoryName}</span>】中，自动生成发音与拼写卡片。
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                {onNavigateToRecite && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToRecite(detectedLang);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-[#C4482A] text-stone-50 font-serif font-black text-xs tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                    <span>🎯 立即开始拼写背诵</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToLibrary) onNavigateToLibrary();
                  }}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-serif font-bold text-xs tracking-wide transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>前往卡牌库查看</span>
                </button>

                <button
                  onClick={() => {
                    setIsSuccessState(false);
                    setImagePreview(null);
                    setImageFile(null);
                    setExtractedWords([]);
                    setIsMarkedModeDetected(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-mono transition-colors cursor-pointer"
                >
                  继续拍下一张
                </button>
              </div>
            </div>
          ) : (
            /* Main Content Area: Photo Input & OCR Inspection */
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* 1. Mode Switcher (Circle/Highlight vs Full Page) */}
              <div className="bg-amber-500/10 border border-amber-300/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-stone-900 font-serif block">
                      选择识别模式：
                    </span>
                    <span className="text-[11px] text-stone-600">
                      {scanMode === "marked_only"
                        ? "🎯 错题本专用：聚焦笔圈 ⭕ 与荧光笔高光 🖍️ 词汇，过滤长句背景"
                        : "📄 全文模式：提取拍摄画面中的全部重要学习生词"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-amber-300/80 shadow-2xs shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setScanMode("marked_only");
                      audioSynth.playCardSlide();
                    }}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      scanMode === "marked_only"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <span>🎯 圈画/高光错词（推荐）</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setScanMode("full_page");
                      audioSynth.playCardSlide();
                    }}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      scanMode === "full_page"
                        ? "bg-stone-900 text-stone-50 shadow-xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    <span>📄 整页全篇提取</span>
                  </button>
                </div>
              </div>

              {/* 2. Language & Deck Category Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3 bg-stone-100/70 border border-stone-200 rounded-xl">
                {/* Language selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700 font-mono uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Languages className="w-3.5 h-3.5 text-amber-600" />
                    目标语种：
                  </span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-stone-300 w-full">
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage("auto")}
                      className={`flex-1 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                        selectedLanguage === "auto"
                          ? "bg-stone-900 text-stone-50 font-bold shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      ✨ 自动
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage("ja")}
                      className={`flex-1 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                        selectedLanguage === "ja"
                          ? "bg-amber-600 text-white font-bold shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      🇯🇵 日语
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage("es")}
                      className={`flex-1 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                        selectedLanguage === "es"
                          ? "bg-amber-600 text-white font-bold shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      🇪🇸 西语
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage("en")}
                      className={`flex-1 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                        selectedLanguage === "en"
                          ? "bg-amber-600 text-white font-bold shadow-2xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      🇬🇧 英语
                    </button>
                  </div>
                </div>

                {/* Category / Deck Tag */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700 font-mono uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    错题分类：
                  </span>
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="分类标签，如：纸质圈词错题本"
                      className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500/20 text-stone-800 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomCategoryName("📓 纸质圈词错题本")}
                      className="px-2 py-1 text-[11px] bg-white hover:bg-stone-200/60 border border-stone-300 rounded text-stone-600 cursor-pointer shrink-0"
                      title="重置为默认错题本"
                    >
                      默认
                    </button>
                  </div>
                </div>
              </div>

              {/* Error feedback */}
              {analysisError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Photo Input / Preview Section */}
              {!imagePreview ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${
                    isDragging
                      ? "border-amber-600 bg-amber-500/10 scale-[0.99]"
                      : "border-stone-300 bg-white/60 hover:border-amber-500 hover:bg-amber-500/5"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 mb-4 shadow-inner">
                    <Camera className="w-8 h-8" />
                  </div>

                  <h3 className="text-base sm:text-lg font-black font-serif text-stone-900 mb-1">
                    拍下手写笔记、课本圈画或试卷错题
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mb-5 leading-relaxed">
                    用荧光笔涂抹、圆珠笔画圈或下划线的单词均可精准提取。手机点击拍照调起相机，或按 <kbd className="px-1.5 py-0.5 bg-stone-200 rounded border border-stone-300 font-mono text-[10px]">Ctrl+V</kbd> 快捷粘贴
                  </p>

                  {/* Hidden inputs */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={cameraInputRef}
                    onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
                    className="hidden"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
                    className="hidden"
                  />

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-[#C4482A] text-stone-50 font-serif font-black text-xs tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>📸 手机拍照取词</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-serif font-bold text-xs tracking-wide transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <Upload className="w-4 h-4 text-stone-600" />
                      <span>从相册/本地选择</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-serif font-bold text-xs tracking-wide transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <Clipboard className="w-4 h-4 text-amber-600" />
                      <span>粘贴剪贴板截图</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Image previewed & Action trigger */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Left: Image Card */}
                    <div className="md:col-span-1 bg-stone-900 rounded-xl overflow-hidden shadow-md border border-stone-700 relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-56 object-contain bg-stone-950/80 p-2"
                      />
                      <div className="p-2.5 bg-stone-900/90 text-stone-300 flex items-center justify-between text-[11px] font-mono border-t border-stone-800">
                        <span className="truncate max-w-[130px]">
                          {imageFile ? imageFile.name : "已捕获照片"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageFile(null);
                              setExtractedWords([]);
                              setIsMarkedModeDetected(false);
                            }}
                            className="text-stone-400 hover:text-rose-400 transition-colors flex items-center gap-0.5 cursor-pointer"
                            title="更换图片"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>重拍</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Info and Start Scan action */}
                    <div className="md:col-span-2 bg-white/70 border border-stone-250 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold">
                            {scanMode === "marked_only"
                              ? "🎯 圈画/高光生词模式"
                              : "📄 全篇提取模式"}
                          </span>
                          <span className="text-xs text-stone-500 font-mono">
                            目标: {customCategoryName}
                          </span>
                        </div>
                        <h4 className="text-base font-black font-serif text-stone-900 mb-1">
                          {scanMode === "marked_only"
                            ? "AI 正在待命：准备提取画圈与高光生词"
                            : "AI 正在待命：准备通篇提取核心生词"}
                        </h4>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {scanMode === "marked_only"
                            ? "系统将重点定位荧光笔（黄/绿/粉/橙/蓝）、手绘画圈及下划线区域，提取生词、国际音标/假名读音、纯正释义与原书上下文，过滤掉整段无标记的背景文本。"
                            : "系统将通篇阅读图片文字，提取其中的核心高频学习词汇并补齐音标及中文释义。"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleStartOcr}
                          disabled={isAnalyzing}
                          className="flex-1 py-3 px-5 rounded-xl bg-stone-900 hover:bg-[#C4482A] text-stone-50 font-serif font-black text-xs sm:text-sm tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                              <span>AI 正在多模态扫描纸面标注...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>{scanMode === "marked_only" ? "开始识别圈画/高光生词 ＞" : "开始全文视觉识词 ＞"}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            setExtractedWords([]);
                            setIsMarkedModeDetected(false);
                          }}
                          className="py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-mono font-bold transition-colors cursor-pointer"
                        >
                          更换照片
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recognition Results List */}
                  {extractedWords.length > 0 && (
                    <div className="mt-5 space-y-4">
                      {/* Summary Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-300/60 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-stone-900">
                            已识别出 {extractedWords.length} 个单词
                          </span>
                          <span className="text-[11px] text-stone-600 font-mono">
                            （{imageDescription} · 语言: {detectedLang.toUpperCase()}）
                          </span>
                          {isMarkedModeDetected && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              🎯 成功定位圈画标记
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="text-xs text-amber-900 hover:text-amber-700 underline font-mono cursor-pointer"
                          >
                            {extractedWords.every((w) => w.selected) ? "全不选" : "全选"}
                          </button>
                          <span className="text-xs text-stone-400">|</span>
                          <span className="text-xs font-bold font-mono text-stone-700">
                            已选中 {extractedWords.filter((w) => w.selected).length} 个
                          </span>
                        </div>
                      </div>

                      {/* Words Grid */}
                      <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                        {extractedWords.map((word) => (
                          <div
                            key={word.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                              word.selected
                                ? "bg-white border-amber-400 shadow-2xs"
                                : "bg-stone-100/60 border-stone-200 opacity-60"
                            }`}
                          >
                            <div className="flex items-start gap-2.5 w-full sm:w-auto flex-1">
                              <input
                                type="checkbox"
                                checked={word.selected}
                                onChange={() => toggleItemSelection(word.id)}
                                className="mt-1 w-4 h-4 accent-amber-600 rounded cursor-pointer shrink-0"
                              />

                              <div className="space-y-1 w-full">
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="text"
                                    value={word.target}
                                    onChange={(e) => handleUpdateWord(word.id, "target", e.target.value)}
                                    className="font-bold text-stone-900 text-sm font-serif bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 rounded outline-none"
                                  />

                                  {word.reading && (
                                    <input
                                      type="text"
                                      value={word.reading}
                                      onChange={(e) => handleUpdateWord(word.id, "reading", e.target.value)}
                                      className="text-xs font-mono text-amber-800 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 rounded outline-none"
                                    />
                                  )}

                                  {word.partOfSpeech && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                                      {word.partOfSpeech}
                                    </span>
                                  )}

                                  {/* Mark type tag */}
                                  {word.markType === "circle" && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-0.5 font-bold">
                                      <span>⭕</span>
                                      <span>画圈圈定</span>
                                    </span>
                                  )}
                                  {word.markType === "highlight" && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5 font-bold">
                                      <span>🖍️</span>
                                      <span>荧光高光</span>
                                    </span>
                                  )}
                                  {word.markType === "underline" && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 border border-purple-300 flex items-center gap-0.5 font-bold">
                                      <span>✍️</span>
                                      <span>下划线</span>
                                    </span>
                                  )}
                                  {word.markType === "handwritten" && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 border border-sky-300 flex items-center gap-0.5 font-bold">
                                      <span>📝</span>
                                      <span>手写笔记</span>
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleSpeak(word.target, detectedLang)}
                                    className="p-1 text-stone-400 hover:text-amber-700 transition-colors cursor-pointer"
                                    title="试听发音"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5 w-full">
                                  <span className="text-[11px] text-stone-400 font-mono shrink-0">释义:</span>
                                  <input
                                    type="text"
                                    value={word.meaning}
                                    onChange={(e) => handleUpdateWord(word.id, "meaning", e.target.value)}
                                    placeholder="输入中文释义"
                                    className="text-xs text-stone-700 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:bg-amber-50/50 px-1 py-0.5 rounded outline-none w-full max-w-md"
                                  />
                                </div>

                                {/* Context quote snippet if detected from paper */}
                                {word.contextSentence && (
                                  <div className="text-[11px] text-stone-600 bg-amber-50/70 border border-amber-200/60 rounded px-2 py-0.5 flex items-start gap-1 font-sans">
                                    <Quote className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                    <span className="line-clamp-1 italic">原卷语境: "{word.contextSentence}"</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteWord(word.id)}
                              className="p-1.5 text-stone-300 hover:text-rose-600 transition-colors cursor-pointer self-end sm:self-center"
                              title="删除此项"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Action */}
                      <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-stone-200">
                        <span className="text-xs font-mono text-stone-600">
                          已选 {extractedWords.filter((w) => w.selected).length} 个词将收录到分类【
                          <span className="font-bold text-amber-800">{customCategoryName}</span>
                          】
                        </span>

                        <button
                          type="button"
                          onClick={handleSaveToLibrary}
                          disabled={extractedWords.filter((w) => w.selected).length === 0}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-[#C4482A] text-stone-50 font-serif font-black text-xs sm:text-sm tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95"
                        >
                          <BookmarkCheck className="w-4 h-4 text-amber-400" />
                          <span>一键收录到错题词库 ＞</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
