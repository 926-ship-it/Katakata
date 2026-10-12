import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Zap, Target, TrendingUp, Award, Calendar, BarChart2 } from "lucide-react";
import { SessionLogEntry, getSessionLogs, MAX_SESSION_LOGS } from "../utils/sessionLogs";

interface SessionTrendChartProps {
  logs?: SessionLogEntry[];
  compact?: boolean;
  isEnglishMode?: boolean;
  className?: string;
}

export const SessionTrendChart: React.FC<SessionTrendChartProps> = ({
  logs: initialLogs,
  compact = false,
  isEnglishMode = false,
  className = "",
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<SessionLogEntry[]>(() => initialLogs || getSessionLogs());
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeMetric, setActiveMetric] = useState<"all" | "kpm" | "accuracy">("all");

  // Keep in sync with custom events or external changes
  useEffect(() => {
    if (initialLogs) {
      setData(initialLogs.slice(-MAX_SESSION_LOGS));
      return;
    }

    const updateFromStorage = () => {
      setData(getSessionLogs());
    };

    updateFromStorage();
    window.addEventListener("fifty_sound_session_log_updated", updateFromStorage);
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener("fifty_sound_session_log_updated", updateFromStorage);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, [initialLogs]);

  // Derived growth trajectory stats
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { avgKpm: 0, avgAcc: 0, maxKpm: 0, growthPct: 0, count: 0 };
    }
    const totalKpm = data.reduce((sum, item) => sum + item.kpm, 0);
    const totalAcc = data.reduce((sum, item) => sum + item.accuracy, 0);
    const maxKpm = Math.max(...data.map((d) => d.kpm), 0);
    const avgKpm = Math.round(totalKpm / data.length);
    const avgAcc = Math.round(totalAcc / data.length);

    // Calculate growth trajectory between initial sessions and latest sessions
    let growthPct = 0;
    if (data.length >= 2) {
      const firstKpm = data[0].kpm || 1;
      const lastKpm = data[data.length - 1].kpm || 0;
      growthPct = Math.round(((lastKpm - firstKpm) / Math.max(10, firstKpm)) * 100);
    }

    return { avgKpm, avgAcc, maxKpm, growthPct, count: data.length };
  }, [data]);

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing

    // Dimensions
    const baseWidth = compact ? 520 : 640;
    const baseHeight = compact ? 200 : 250;
    const margin = {
      top: 24,
      right: compact ? 38 : 46,
      bottom: compact ? 30 : 36,
      left: compact ? 38 : 46,
    };
    const width = baseWidth - margin.left - margin.right;
    const height = baseHeight - margin.top - margin.bottom;

    svg
      .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Definitions: Gradients and glow filters
    const defs = svg.append("defs");

    // Speed gradient (warm amber)
    const kpmGradient = defs
      .append("linearGradient")
      .attr("id", "trend-kpm-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    kpmGradient.append("stop").attr("offset", "0%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.35);
    kpmGradient.append("stop").attr("offset", "100%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0.0);

    // Accuracy gradient (emerald)
    const accGradient = defs
      .append("linearGradient")
      .attr("id", "trend-acc-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    accGradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981").attr("stop-opacity", 0.28);
    accGradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981").attr("stop-opacity", 0.0);

    // Drop shadow filter for points
    const filter = defs.append("filter").attr("id", "point-glow").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    filter.append("feDropShadow").attr("dx", "0").attr("dy", "2").attr("stdDeviation", "2.5").attr("flood-opacity", "0.25");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale: 0 to data.length - 1
    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(1, data.length - 1)])
      .range([0, width]);

    // Y Scale for Speed (KPM): Left axis
    const maxKpmVal = Math.max(...data.map((d) => d.kpm), 60);
    const yScaleKpm = d3
      .scaleLinear()
      .domain([0, Math.ceil((maxKpmVal * 1.15) / 10) * 10])
      .range([height, 0]);

    // Y Scale for Accuracy (%): Right axis (dynamic floor so changes are visible)
    const minAccVal = Math.min(...data.map((d) => d.accuracy), 80);
    const accFloor = Math.max(0, Math.floor((minAccVal - 10) / 10) * 10);
    const yScaleAcc = d3
      .scaleLinear()
      .domain([accFloor, 100])
      .range([height, 0]);

    // Horizontal Grid Lines
    const yAxisGrid = d3
      .axisLeft(yScaleKpm)
      .ticks(4)
      .tickSize(-width)
      .tickFormat(() => "");

    g.append("g")
      .attr("class", "grid-lines")
      .call(yAxisGrid)
      .selectAll("line")
      .attr("stroke", "#e7e5e4") // stone-200
      .attr("stroke-dasharray", "3 4")
      .attr("stroke-opacity", 0.7);

    g.select(".grid-lines").select(".domain").remove();

    // D3 Line & Area Generators with smooth cubic monotone interpolation
    const showKpm = activeMetric === "all" || activeMetric === "kpm";
    const showAcc = activeMetric === "all" || activeMetric === "accuracy";

    if (data.length > 1) {
      // 1. KPM Area & Smooth Line
      if (showKpm) {
        const kpmArea = d3
          .area<SessionLogEntry>()
          .x((_, i) => xScale(i))
          .y0(height)
          .y1((d) => yScaleKpm(d.kpm))
          .curve(d3.curveMonotoneX);

        const kpmLine = d3
          .line<SessionLogEntry>()
          .x((_, i) => xScale(i))
          .y((d) => yScaleKpm(d.kpm))
          .curve(d3.curveMonotoneX);

        // Render filled area
        g.append("path")
          .datum(data)
          .attr("fill", "url(#trend-kpm-grad)")
          .attr("d", kpmArea);

        // Render smooth curve line
        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#f59e0b") // amber-500
          .attr("stroke-width", compact ? 2.5 : 3)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .attr("d", kpmLine);
      }

      // 2. Accuracy Area & Smooth Line
      if (showAcc) {
        const accArea = d3
          .area<SessionLogEntry>()
          .x((_, i) => xScale(i))
          .y0(height)
          .y1((d) => yScaleAcc(d.accuracy))
          .curve(d3.curveMonotoneX);

        const accLine = d3
          .line<SessionLogEntry>()
          .x((_, i) => xScale(i))
          .y((d) => yScaleAcc(d.accuracy))
          .curve(d3.curveMonotoneX);

        // Render filled area
        g.append("path")
          .datum(data)
          .attr("fill", "url(#trend-acc-grad)")
          .attr("d", accArea);

        // Render smooth curve line
        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#10b981") // emerald-500
          .attr("stroke-width", compact ? 2.5 : 3)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .attr("stroke-dasharray", showKpm ? "5 2" : "none") // subtle dash when overlapping for clarity
          .attr("d", accLine);
      }
    }

    // Axes
    // Left Y Axis (KPM)
    if (showKpm) {
      const yAxisLeft = d3
        .axisLeft(yScaleKpm)
        .ticks(4)
        .tickFormat((d) => `${d}`);

      const leftAxisG = g.append("g").attr("class", "axis-kpm").call(yAxisLeft);
      leftAxisG.select(".domain").attr("stroke", "#d6d3d1");
      leftAxisG.selectAll("text").attr("fill", "#b45309").attr("font-size", compact ? "9px" : "10px").attr("font-family", "ui-monospace, monospace").attr("font-weight", "bold");
      
      // Axis label
      g.append("text")
        .attr("x", -6)
        .attr("y", -10)
        .attr("text-anchor", "start")
        .attr("fill", "#d97706")
        .attr("font-size", "9px")
        .attr("font-family", "ui-monospace, monospace")
        .attr("font-weight", "bold")
        .text("KPM ⚡");
    }

    // Right Y Axis (Accuracy %)
    if (showAcc) {
      const yAxisRight = d3
        .axisRight(yScaleAcc)
        .ticks(4)
        .tickFormat((d) => `${d}%`);

      const rightAxisG = g.append("g").attr("class", "axis-acc").attr("transform", `translate(${width},0)`).call(yAxisRight);
      rightAxisG.select(".domain").attr("stroke", "#d6d3d1");
      rightAxisG.selectAll("text").attr("fill", "#047857").attr("font-size", compact ? "9px" : "10px").attr("font-family", "ui-monospace, monospace").attr("font-weight", "bold");

      // Axis label
      g.append("text")
        .attr("x", width + 6)
        .attr("y", -10)
        .attr("text-anchor", "end")
        .attr("fill", "#059669")
        .attr("font-size", "9px")
        .attr("font-family", "ui-monospace, monospace")
        .attr("font-weight", "bold")
        .text("🎯 正确率");
    }

    // X Axis (Sessions label)
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(data.length, 6))
      .tickFormat((_, i) => {
        const itemIdx = Math.round((i / Math.max(1, data.length - 1)) * (data.length - 1));
        const item = data[itemIdx];
        if (!item) return `#${itemIdx + 1}`;
        // Show compact session tag or date
        return `#${itemIdx + 1}`;
      });

    const xAxisG = g.append("g").attr("class", "axis-x").attr("transform", `translate(0,${height})`).call(xAxis);
    xAxisG.select(".domain").attr("stroke", "#d6d3d1");
    xAxisG.selectAll("text").attr("fill", "#78716c").attr("font-size", compact ? "9px" : "10px").attr("font-family", "ui-monospace, monospace");

    // X Axis Label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + (compact ? 24 : 28))
      .attr("text-anchor", "middle")
      .attr("fill", "#a8a29e")
      .attr("font-size", "9px")
      .attr("font-family", "ui-monospace, monospace")
      .text(isEnglishMode ? "Sessions (Past 15 runs)" : `练习记录 (最近 ${data.length} 次次序)`);

    // Data points circles
    const pointsGroup = g.append("g").attr("class", "data-points");

    data.forEach((d, i) => {
      const cx = data.length > 1 ? xScale(i) : width / 2;

      // KPM circle
      if (showKpm) {
        const cyKpm = yScaleKpm(d.kpm);
        const isHovered = hoveredIdx === i;

        pointsGroup
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cyKpm)
          .attr("r", isHovered ? 6 : (compact ? 3.5 : 4))
          .attr("fill", isHovered ? "#d97706" : "#f59e0b")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", isHovered ? 2.5 : 1.5)
          .attr("filter", "url(#point-glow)")
          .style("transition", "all 0.15s ease");
      }

      // Accuracy circle
      if (showAcc) {
        const cyAcc = yScaleAcc(d.accuracy);
        const isHovered = hoveredIdx === i;

        pointsGroup
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cyAcc)
          .attr("r", isHovered ? 5.5 : (compact ? 3.5 : 4))
          .attr("fill", isHovered ? "#047857" : "#10b981")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", isHovered ? 2.5 : 1.5)
          .attr("filter", "url(#point-glow)")
          .style("transition", "all 0.15s ease");
      }
    });

    // Crosshair line when hovered
    if (hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < data.length) {
      const hx = data.length > 1 ? xScale(hoveredIdx) : width / 2;
      g.append("line")
        .attr("x1", hx)
        .attr("y1", 0)
        .attr("x2", hx)
        .attr("y2", height)
        .attr("stroke", "#78716c")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", "3 3")
        .attr("pointer-events", "none");
    }

    // Interactive Invisible Overlay for Mouse/Touch Tracking
    const overlay = g
      .append("rect")
      .attr("class", "hover-overlay")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair");

    overlay
      .on("mousemove touchmove", (event) => {
        const [mx] = d3.pointer(event);
        if (data.length <= 1) {
          setHoveredIdx(0);
          return;
        }
        const domainX = xScale.invert(mx);
        const nearestIdx = Math.max(0, Math.min(data.length - 1, Math.round(domainX)));
        setHoveredIdx(nearestIdx);
      })
      .on("mouseleave touchend", () => {
        setHoveredIdx(null);
      });
  }, [data, activeMetric, compact, hoveredIdx, isEnglishMode]);

  // Selected session details for tooltip or card
  const activeSession = hoveredIdx !== null && data[hoveredIdx] ? data[hoveredIdx] : (data.length > 0 ? data[data.length - 1] : null);
  const activeSessionIdx = hoveredIdx !== null ? hoveredIdx : data.length - 1;

  if (data.length === 0) {
    return (
      <div className={`p-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 text-center space-y-2 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold font-serif text-stone-800">
          {isEnglishMode ? "No practice history yet" : "暂无历史练习轨迹记录"}
        </h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          {isEnglishMode
            ? "Complete a spelling practice session to plot your smooth speed and accuracy growth curve powered by D3.js!"
            : "完成本次限时打字或背诵练习后，系统将使用 D3.js 自动生成过去 15 次练习的平滑准确率与速率成长轨迹折线图！"}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-stone-200/90 bg-white/95 backdrop-blur-xs p-4 sm:p-5 shadow-xs space-y-3 ${className}`}>
      {/* Top Header & Metrics Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-serif flex items-center gap-1.5">
              <span>{isEnglishMode ? "15-Session Growth Trajectory" : "过去 15 次练习成长轨迹"}</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/50">
                D3.js 平滑折线
              </span>
            </h4>
            <p className="text-[10px] font-mono text-stone-400">
              SMOOTH VELOCITY & ACCURACY INTERPOLATION CURVES ({data.length}/15 SESSIONS)
            </p>
          </div>
        </div>

        {/* Metric Mode Filter Tabs */}
        <div className="flex items-center gap-1 bg-stone-100/80 p-0.5 rounded-xl border border-stone-200/60 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveMetric("all")}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
              activeMetric === "all"
                ? "bg-white text-stone-900 shadow-xs font-bold"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {isEnglishMode ? "All" : "双轴对照"}
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("kpm")}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeMetric === "kpm"
                ? "bg-amber-500 text-stone-950 shadow-xs font-bold"
                : "text-amber-800 hover:text-amber-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
            <span>KPM 速度</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("accuracy")}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeMetric === "accuracy"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-emerald-800 hover:text-emerald-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>正确率</span>
          </button>
        </div>
      </div>

      {/* Aggregate Performance Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5">
          <div className="flex items-center gap-1 text-[10px] text-amber-800 font-mono">
            <Zap className="w-3 h-3 text-amber-600" />
            <span>{isEnglishMode ? "AVG SPEED" : "均速 (KPM)"}</span>
          </div>
          <div className="text-base font-black text-amber-950 font-mono mt-0.5">
            {stats.avgKpm} <span className="text-[10px] font-normal text-amber-700">键/分</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5">
          <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-mono">
            <Target className="w-3 h-3 text-emerald-600" />
            <span>{isEnglishMode ? "AVG ACCURACY" : "平均正确率"}</span>
          </div>
          <div className="text-base font-black text-emerald-950 font-mono mt-0.5">
            {stats.avgAcc}%
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200/70 rounded-xl p-2.5">
          <div className="flex items-center gap-1 text-[10px] text-stone-600 font-mono">
            <Award className="w-3 h-3 text-stone-500" />
            <span>{isEnglishMode ? "PEAK SPEED" : "峰值极速"}</span>
          </div>
          <div className="text-base font-black text-stone-900 font-mono mt-0.5">
            {stats.maxKpm} <span className="text-[10px] font-normal text-stone-500">KPM</span>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200/70 rounded-xl p-2.5">
          <div className="flex items-center gap-1 text-[10px] text-stone-600 font-mono">
            <BarChart2 className="w-3 h-3 text-stone-500" />
            <span>{isEnglishMode ? "VELOCITY GAIN" : "速度演进幅度"}</span>
          </div>
          <div className={`text-base font-black font-mono mt-0.5 ${stats.growthPct >= 0 ? "text-emerald-700" : "text-stone-700"}`}>
            {stats.growthPct >= 0 ? `+${stats.growthPct}%` : `${stats.growthPct}%`}
            <span className="text-[10px] font-normal text-stone-500 ml-1">
              {stats.growthPct >= 0 ? "成长" : "波动"}
            </span>
          </div>
        </div>
      </div>

      {/* D3 Chart Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          className="w-full h-auto overflow-visible touch-none block"
          style={{ minHeight: compact ? "170px" : "210px" }}
        />
      </div>

      {/* Floating or Footer Session Detail Inspector Card */}
      {activeSession && (
        <div className="p-3 bg-stone-50/90 border border-stone-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold text-stone-800">
              {hoveredIdx !== null ? `悬停检视：第 ${activeSessionIdx + 1} 次练习` : `最新结算：第 ${activeSessionIdx + 1} 次练习`}
            </span>
            <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {activeSession.date}
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono font-bold">
            <span className="text-amber-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>速度: {activeSession.kpm} KPM</span>
            </span>
            <span className="text-emerald-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>准确率: {activeSession.accuracy}%</span>
            </span>
            {activeSession.xpGained !== undefined && activeSession.xpGained > 0 && (
              <span className="text-stone-600 text-[11px]">
                +{activeSession.xpGained} XP
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend & Hint */}
      <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-1 border-t border-stone-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 rounded-full bg-amber-500 inline-block" />
            <span>速度折线 (Amber / KPM)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-1 rounded-full bg-emerald-500 inline-block" />
            <span>准确率折线 (Emerald / %)</span>
          </div>
        </div>
        <span>🖱️ 悬停或触控节点查看各轮次详情</span>
      </div>
    </div>
  );
};
