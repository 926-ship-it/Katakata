import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, KeyRound, CheckCircle2, AlertCircle, X, Sparkles, ShieldCheck } from "lucide-react";
import { verifyUploadPasskey, isUploadPasskeyUnlocked, UPLOAD_PASSKEY } from "../utils/passkeyAuth";
import { audioSynth } from "../utils/audio";

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const PasskeyModal: React.FC<PasskeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "输入通关卡密解锁上传通道",
  subtitle = "自主录入新单词、批量导入文本与自定义词单功能需凭通关卡密开启。",
}) => {
  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasskeyInput("");
      setErrorMsg("");
      setIsSuccess(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = passkeyInput.trim().toUpperCase();

    if (!clean) {
      setErrorMsg("请输入通关卡密");
      audioSynth.playError();
      return;
    }

    const verified = verifyUploadPasskey(clean);

    if (verified) {
      setIsSuccess(true);
      setErrorMsg("");
      audioSynth.playFanfare();
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } else {
      setErrorMsg("卡密不正确，请输入正确的通关卡密");
      audioSynth.playError();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#FBF9F4] rounded-2xl border-2 border-stone-300 shadow-2xl overflow-hidden p-6 text-stone-900"
        >
          {/* Top subtle decorative pattern */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header icon and title */}
          <div className="flex flex-col items-center text-center space-y-2 mt-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-inner">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold text-amber-900 uppercase tracking-widest">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>卡密安全验证 · PASSKEY GATE</span>
            </div>

            <h3 className="text-xl font-black font-serif text-stone-900 tracking-wide">
              {title}
            </h3>

            <p className="text-xs text-stone-600 font-sans leading-relaxed max-w-xs">
              {subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-stone-700 text-left">
                请输入通关卡密：
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={16}
                  value={passkeyInput}
                  onChange={(e) => {
                    setPasskeyInput(e.target.value.toUpperCase());
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="请输入通关卡密"
                  disabled={isSuccess}
                  className="w-full px-4 py-3 bg-white border-2 border-stone-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-center text-lg font-mono font-black tracking-widest text-stone-950 placeholder:text-stone-350 placeholder:font-normal placeholder:tracking-normal outline-none transition-all shadow-inner"
                />
              </div>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-600 pt-1"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>卡密验证成功！正在为您开启通道...</span>
                </motion.div>
              )}
            </div>

            {/* Hint tag */}
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-900/90 leading-relaxed font-sans">
              <div className="font-bold flex items-center gap-1 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>通关通行权限说明</span>
              </div>
              验证通过后，该设备将自动永久激活自主录入与批量导入通道，无需重复输入。
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSuccess || !passkeyInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-[#C4482A] disabled:opacity-50 disabled:cursor-not-allowed text-stone-50 font-serif font-black text-xs tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{isSuccess ? "已通关验证" : "立即验证卡密 ＞"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
