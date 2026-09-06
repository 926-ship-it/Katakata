import React, { useRef, useState, useEffect } from "react";
import { Sparkles, Trash2, Eye, PenTool, Volume2, HelpCircle, ArrowRight, ShieldCheck, Award } from "lucide-react";
import { audioSynth } from "../utils/audio";

interface DictionarySegment {
  kana: string;
  displayRomaji: string;
  romaji: string[];
}

interface CalligraphyCanvasProps {
  segments: DictionarySegment[];
  onPassChange?: (passed: boolean) => void;
}

// Self-contained Sub-Component for each individual Syllable Canvas Cell
interface SyllableCanvasCellProps {
  kana: string;
  displayRomaji: string;
  brushColor: string;
  brushSize: number;
  showOutline: boolean;
  clearTrigger: number;
  onVerified: (score: number) => void;
  verifiedScore: number | null;
  stampTrigger: number | null;
}

const SyllableCanvasCell: React.FC<SyllableCanvasCellProps> = ({
  kana,
  displayRomaji,
  brushColor,
  brushSize,
  showOutline,
  clearTrigger,
  onVerified,
  verifiedScore,
  stampTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize and scale canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;

    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  useEffect(() => {
    initCanvas();
  }, [kana]);

  // Handle color or size modifications
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  // Decoupled clear trigger
  useEffect(() => {
    if (clearTrigger > 0) {
      initCanvas();
    }
  }, [clearTrigger]);

  // Compute pointer positioning coordinates relative to canvas
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    e.preventDefault();
    const pos = getPointerPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
  };

  const handleSpeak = () => {
    audioSynth.speakJapanese(kana);
  };

  // Perform core template analysis for check math
  const calculateAccuracy = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      onVerified(-1);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onVerified(0);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Create an offline comparison container
    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const octx = offscreen.getContext("2d");
    if (!octx) {
      onVerified(45);
      return;
    }

    // Fill white backdrop inside offline context
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, w, h);

    // Render the perfect reference target text in solid black
    octx.fillStyle = "#000000";
    const fontSize = Math.floor(h * 0.58); // elegant scale
    octx.font = `bold ${fontSize}px "Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif`;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillText(kana, w / 2, h / 2);

    // Pull pixel data blocks
    const templateImg = octx.getImageData(0, 0, w, h);
    const userImg = ctx.getImageData(0, 0, w, h);

    let targetBlackPixels = 0;
    let targetHits = 0;
    let outOfBoundsFails = 0;
    let userTotalColored = 0;

    // Iterate through sampled coordinates
    for (let i = 0; i < templateImg.data.length; i += 16) {
      const isTemplateAlpha = templateImg.data[i] < 120; // is black character body
      const isUserAlpha = userImg.data[i + 3] > 40; // user has drawn

      if (isTemplateAlpha) {
        targetBlackPixels++;
        if (isUserAlpha) {
          targetHits++;
        }
      } else {
        if (isUserAlpha) {
          outOfBoundsFails++;
        }
      }

      if (isUserAlpha) {
        userTotalColored++;
      }
    }

    if (userTotalColored < 5) {
      onVerified(-1); // did not draw enough
      return;
    }

    const hitRate = targetBlackPixels > 0 ? targetHits / targetBlackPixels : 0;
    const oobRatio = targetBlackPixels > 0 ? outOfBoundsFails / (w * h / 5) : 0;

    // Score based on matching template hits minus penalty for coloring outside lines
    let score = Math.round((hitRate * 1.35 - oobRatio * 1.6) * 100);
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    onVerified(score);
  };

  // Run validation whenever stampTrigger call is prompted
  useEffect(() => {
    if (stampTrigger !== null) {
      calculateAccuracy();
    }
  }, [stampTrigger]);

  return (
    <div className="flex flex-col items-center space-y-2 bg-white p-3 rounded-xl border border-stone-200 min-w-[170px] select-none hover:shadow-sm transition-shadow">
      {/* Small title header */}
      <div className="flex items-center justify-between w-full pb-1 border-b border-stone-100">
        <span className="text-[10px] font-mono text-stone-400 font-bold tracking-wider">{displayRomaji.toUpperCase()}</span>
        <button
          onClick={handleSpeak}
          className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          title="发音"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-600" />
        </button>
      </div>

      {/* Grid Canvas Frame with custom traditional calligraphy underlay crosshairs */}
      <div className="relative w-36 h-36 border border-stone-300 rounded-lg bg-stone-50 overflow-hidden cursor-crosshair touch-none">
        
        {/* Dash Crosshairs */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-stone-700" />
          <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-stone-700" />
          <div className="absolute inset-0 border border-double border-stone-600" />
        </div>

        {/* Gray silhouette stencil template underlay */}
        {showOutline && (
          <div
            className="absolute inset-0 flex items-center justify-center text-stone-200 pointer-events-none select-none text-8xl font-serif"
            style={{
              fontFamily: '"Yu Mincho", "MS Mincho", "Hiragino Mincho ProN", serif',
            }}
          >
            {kana}
          </div>
        )}

        {/* Dynamic Draw Canvas Component */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="absolute inset-0 w-full h-full z-10 touch-none block"
          style={{ touchAction: "none" }}
        />

        {/* Stamp overlays for score stamp/seal authenticity feedback */}
        {verifiedScore !== null && (
          <div className="absolute bottom-2 right-2 z-20 pointer-events-none select-none rotate-12">
            {verifiedScore === -1 ? (
              <span className="px-1.5 py-0.5 rounded border border-yellow-500 bg-yellow-50/90 text-yellow-700 font-mono text-[9px] font-black uppercase">
                待临摹 ✍️
              </span>
            ) : verifiedScore >= 50 ? (
              <div className="border-2 border-double border-rose-600 rounded-full w-9 h-9 flex flex-col items-center justify-center bg-rose-50/90 text-rose-600 font-serif leading-none">
                <span className="text-[8px] font-bold">合格</span>
                <span className="text-[9px] font-mono font-black">{verifiedScore}%</span>
              </div>
            ) : (
              <div className="border-2 border-double border-stone-400 rounded-full w-9 h-9 flex flex-col items-center justify-center bg-stone-50/90 text-stone-500 font-serif leading-none">
                <span className="text-[7px] font-bold leading-tight">未合格</span>
                <span className="text-[9px] font-mono leading-none">{verifiedScore}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-[11px] font-serif font-black text-stone-700">{kana} ({displayRomaji})</div>
    </div>
  );
};

export const CalligraphyCanvas: React.FC<CalligraphyCanvasProps> = ({ segments, onPassChange }) => {
  const [brushColor, setBrushColor] = useState("#b91c1c"); // Crimson cinnabar red (朱砂/描红)
  const [brushSize, setBrushSize] = useState(6);
  const [showOutline, setShowOutline] = useState(true);
  const [clearTrigger, setClearTrigger] = useState(0);

  // Verification pipeline states
  const [stampTrigger, setStampTrigger] = useState<number | null>(null);
  const [verifiedScores, setVerifiedScores] = useState<Record<number, number>>({});
  const [globalVerdict, setGlobalVerdict] = useState<"none" | "pass" | "attempted">("none");

  // Keep tracking when segments changes
  useEffect(() => {
    handleClearAll();
  }, [segments]);

  const handleClearAll = () => {
    setClearTrigger((prev) => prev + 1);
    setStampTrigger(null);
    setVerifiedScores({});
    setGlobalVerdict("none");
    if (onPassChange) onPassChange(false);
  };

  const handleTriggerVerification = () => {
    // Setting stampTrigger forces child cells to analyze canvases and report scores
    setVerifiedScores({});
    setStampTrigger(Date.now());
  };

  const handleCellVerified = (idx: number, score: number) => {
    setVerifiedScores((prev) => {
      const next = { ...prev, [idx]: score };

      // Once all segments are answered, evaluate final aggregated stamp
      if (Object.keys(next).length === segments.length) {
        const scoresArr = Object.values(next) as number[];
        const hasUndrawn = scoresArr.some((s) => s === -1);
        const allPass = !hasUndrawn && scoresArr.every((s) => s >= 50);

        if (hasUndrawn) {
          setGlobalVerdict("attempted");
          if (onPassChange) onPassChange(false);
          audioSynth.playCharacterResolved();
        } else if (allPass) {
          setGlobalVerdict("pass");
          if (onPassChange) onPassChange(true);
          audioSynth.playFanfare();
          audioSynth.speakFullWord(segments.map((s) => s.kana).join(""));
        } else {
          setGlobalVerdict("attempted");
          if (onPassChange) onPassChange(false);
          audioSynth.playError();
        }
      }
      return next;
    });
  };

  const getSyllablesListText = () => segments.map((s) => s.kana).join(" ");

  return (
    <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 space-y-4">
      {/* Top action details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <PenTool className="w-4 h-4 text-rose-500 animate-pulse" />
            <h4 className="text-xs font-mono font-black text-stone-800">
              CALLIGRAPHY SCROLL FOR MULTI-SYLLABLES (假名连笔多字临摹帖)
            </h4>
          </div>
          <p className="text-[10px] text-stone-400">所有假名在横向滚轴中并排排列进行描红练习，可以移动画布翻阅书写。</p>
        </div>

        <button
          onClick={() => audioSynth.speakJapanese(segments.map((s) => s.kana).join(""))}
          className="self-start sm:self-auto py-1 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-900 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-700" />
          <span>读出完整名字</span>
        </button>
      </div>

      {/* Horizontal scrolling Calligraphy Roll (横轴假名书法卷) */}
      <div className="relative w-full">
        {/* Soft elegant gradient side vignettes */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-stone-100 to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-stone-100 to-transparent pointer-events-none z-20" />

        <div className="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 px-2 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
          {segments.map((segment, idx) => (
            <SyllableCanvasCell
              key={`${idx}-${segment.kana}`}
              kana={segment.kana}
              displayRomaji={segment.displayRomaji}
              brushColor={brushColor}
              brushSize={brushSize}
              showOutline={showOutline}
              clearTrigger={clearTrigger}
              onVerified={(score) => handleCellVerified(idx, score)}
              verifiedScore={verifiedScores[idx] ?? null}
              stampTrigger={stampTrigger}
            />
          ))}
        </div>
      </div>

      {/* Controls Bar for Brush and Stamps */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/60 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Brush Color & Thickness */}
          <div className="space-y-3">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">
                Brush Pigments Ink (篆刻朱印泥)
              </span>
              <div className="flex items-center gap-3">
                {[
                  { hex: "#b91c1c", name: "朱砂红" },
                  { hex: "#1c1917", name: "玄铁黑" },
                  { hex: "#0369a1", name: "天澄青" },
                  { hex: "#15803d", name: "翡翠绿" },
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setBrushColor(color.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform duration-100 flex items-center justify-center ${
                      brushColor === color.hex ? "scale-110 border-stone-900 shadow-md" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono font-bold text-stone-400">
                <span>Stroke Size (提捺笔重粗细)</span>
                <span>{brushSize}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-stone-700 h-1 bg-stone-100 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Verification Stamps panel */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-stone-400 block">
                INTELLIGENT CALLIGRAPHY SEAL REVIEW (AI 书法印谱审查)
              </span>
              <p className="text-[11px] text-stone-500 leading-normal">
                用指尖或手写笔在每个框内描红，AI 将自动分析每一格的笔迹覆盖比重和溢出偏差，并输出判定印鉴。
              </p>
            </div>

            {globalVerdict === "pass" && (
              <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-serif font-black flex items-center gap-1">
                <Award className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>恭喜！印鉴审查一致通过。笔锋契合，假名还原非常优美！</span>
              </div>
            )}

            {globalVerdict === "attempted" && (
              <div className="mt-2.5 p-2 bg-yellow-50/70 border border-yellow-200 rounded-lg text-yellow-800 text-[11px] flex flex-col gap-1">
                <span className="font-bold">⚠️ 书法审查未通过：</span>
                <span className="text-[10px] text-stone-500 font-sans">
                  请确保每个音节格子都有落笔。吻合度需要达到 <b>50%</b> 以上，且没有随意涂乱溢出。
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Global Action items */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-100 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOutline(!showOutline)}
              className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                showOutline
                  ? "bg-stone-200 text-stone-800 border-stone-300"
                  : "bg-white text-stone-400 border-stone-200"
              }`}
            >
              <span>{showOutline ? "隐藏描底" : "显示描底"}</span>
            </button>

            <button
              onClick={handleClearAll}
              className="py-1.5 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>整幅重叠清盘</span>
            </button>
          </div>

          <button
            onClick={handleTriggerVerification}
            className="px-4 py-2 bg-stone-900 hover:bg-amber-600 hover:text-stone-950 text-stone-50 text-xs font-black rounded-lg shadow flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>✍️ 开始自主验证书写字形</span>
          </button>
        </div>
      </div>
    </div>
  );
};
