import React, { useState, useMemo } from "react";
import {
  Target,
  SlidersHorizontal,
  CheckCircle2,
  Trophy,
  Sparkles,
} from "lucide-react";

const formatCurrencyCompact = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const lk = num / 100000;
    return `₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(2)} L`;
  }
  if (num >= 1000) {
    const k = num / 1000;
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)} K`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

const formatCurrency2Dec = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function InteractivePortfolioGauge({
  totalWorth = 0,
  upperLimit = 5000000,
  milestones = [],
  hideNumbers = false,
  onOpenSettings,
}) {
  const [hoveredMilestone, setHoveredMilestone] = useState(null);
  const [isPointerHovered, setIsPointerHovered] = useState(false);

  // SVG Geometry Dimensions
  const svgWidth = 480;
  const svgHeight = 270;
  const cx = 240;
  const cy = 220;
  const r = 165;
  const strokeWidth = 24;

  // Total Arc Length for semi-circle: π * r
  const arcTotalLength = Math.PI * r;

  // Fraction of total goal achieved (0 to 1+)
  const progressFraction = useMemo(() => {
    if (!upperLimit || upperLimit <= 0) return 0;
    return Math.max(0, totalWorth / upperLimit);
  }, [totalWorth, upperLimit]);

  const clampedFraction = Math.min(1, progressFraction);
  const achievementPercent = Math.min(100, Math.round(progressFraction * 1000) / 10);
  const remainingToGoal = Math.max(0, upperLimit - totalWorth);

  // Current pointer angle & coordinates on arc
  const currentAngle = Math.PI * (1 - clampedFraction);
  const pointerX = cx + r * Math.cos(currentAngle);
  const pointerY = cy - r * Math.sin(currentAngle);

  // Perpendicular tick notch coordinates for pointer
  const ptrInnerR = r - strokeWidth / 2 - 2;
  const ptrOuterR = r + strokeWidth / 2 + 4;
  const ptrTickInnerX = cx + ptrInnerR * Math.cos(currentAngle);
  const ptrTickInnerY = cy - ptrInnerR * Math.sin(currentAngle);
  const ptrTickOuterX = cx + ptrOuterR * Math.cos(currentAngle);
  const ptrTickOuterY = cy - ptrOuterR * Math.sin(currentAngle);

  // Sorted Milestones with calculated angles and coordinates
  const processedMilestones = useMemo(() => {
    if (!milestones || milestones.length === 0) return [];
    const sorted = [...milestones].sort((a, b) => (a.amount || 0) - (b.amount || 0));

    return sorted.map((m, idx) => {
      const amount = Number(m.amount) || 0;
      const mFraction = upperLimit > 0 ? Math.min(1, Math.max(0, amount / upperLimit)) : 0;
      const mAngle = Math.PI * (1 - mFraction);

      // Coordinates on the arc track
      const pinX = cx + r * Math.cos(mAngle);
      const pinY = cy - r * Math.sin(mAngle);

      // Coordinates for tick notch crossing the arc
      const innerTickR = r - strokeWidth / 2 - 3;
      const outerTickR = r + strokeWidth / 2 + 5;
      const tickInnerX = cx + innerTickR * Math.cos(mAngle);
      const tickInnerY = cy - innerTickR * Math.sin(mAngle);
      const tickOuterX = cx + outerTickR * Math.cos(mAngle);
      const tickOuterY = cy - outerTickR * Math.sin(mAngle);

      // Label coordinate outside the track
      const labelR = r + strokeWidth / 2 + 17;
      const labelX = cx + labelR * Math.cos(mAngle);
      const labelY = cy - labelR * Math.sin(mAngle);

      const isAchieved = totalWorth >= amount;
      const isNextTarget = !isAchieved && (idx === 0 || totalWorth >= sorted[idx - 1]?.amount);
      const pctOfGoal = Math.round(mFraction * 100);

      return {
        ...m,
        amount,
        pctOfGoal,
        mAngle,
        pinX,
        pinY,
        tickInnerX,
        tickInnerY,
        tickOuterX,
        tickOuterY,
        labelX,
        labelY,
        isAchieved,
        isNextTarget,
      };
    });
  }, [milestones, upperLimit, totalWorth, r, strokeWidth, cx, cy]);

  return (
    <div className="card bg-base-100 shadow-xl border border-base-200/80 rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20 shadow-xs">
            <Target size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-base-content">
                Portfolio Net Worth Gauge
              </h2>
              {achievementPercent >= 100 && (
                <span className="badge badge-xs badge-success gap-1 font-bold">
                  <Trophy size={10} /> 100%
                </span>
              )}
            </div>
            <p className="text-xs text-base-content/50">
              Target progress from ₹0 to {formatCurrencyCompact(upperLimit)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-sm font-bold bg-primary/10 text-primary border-primary/20 font-mono">
            {achievementPercent}%
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content hover:bg-base-200"
            title="Adjust Upper Limit & Milestones"
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>
      </div>

      {/* Interactive Inspection Bar (Dedicated static slot, zero motion) */}
      <div className="h-8 flex items-center justify-center">
        {hoveredMilestone ? (
          <div className="bg-base-200/90 dark:bg-base-300/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-base-300/60 shadow-xs flex items-center gap-2 text-xs pointer-events-none">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredMilestone.isAchieved
                  ? "bg-emerald-500"
                  : hoveredMilestone.isNextTarget
                  ? "bg-primary"
                  : "bg-base-content/40"
              }`}
            />
            <span className="font-bold text-base-content">{hoveredMilestone.label}:</span>
            <span className="font-mono font-bold text-primary">
              {formatCurrencyCompact(hoveredMilestone.amount)} ({hoveredMilestone.pctOfGoal}%)
            </span>
            <span className="text-base-content/40">•</span>
            <span
              className={`font-bold ${
                hoveredMilestone.isAchieved
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-500"
              }`}
            >
              {hoveredMilestone.isAchieved
                ? `Surpassed (+${formatCurrencyCompact(totalWorth - hoveredMilestone.amount)})`
                : `${formatCurrencyCompact(hoveredMilestone.amount - totalWorth)} needed`}
            </span>
          </div>
        ) : isPointerHovered ? (
          <div className="bg-base-200/90 dark:bg-base-300/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-base-300/60 shadow-xs flex items-center gap-2 text-xs pointer-events-none">
            <Sparkles size={13} className="text-amber-400" />
            <span className="font-bold text-base-content">Current Net Worth:</span>
            <span className="font-mono font-bold text-primary">
              {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(totalWorth)}`}
            </span>
            <span className="badge badge-xs badge-primary font-mono">{achievementPercent}%</span>
          </div>
        ) : (
          <div className="text-[11px] text-base-content/40 font-medium flex items-center gap-1.5 pointer-events-none">
            <span>Hover milestone pins or pointer on the gauge to inspect targets</span>
          </div>
        )}
      </div>

      {/* Main SVG Gauge Container with Centered Overlay (Motion-free) */}
      <div className="relative w-full max-w-[460px] mx-auto aspect-[480/270] select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Progress Gradient */}
            <linearGradient id="gaugeTrackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Glowing Drop Shadow Filter */}
            <filter id="gaugeGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.25" />
            </filter>

            {/* Pin Glow Filter */}
            <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* 1. Background Inactive Arc Track */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="currentColor"
            className="text-base-300/40 dark:text-base-300/25"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* 2. Filled Progress Arc (Static, No animation) */}
          {clampedFraction > 0 && (
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="url(#gaugeTrackGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arcTotalLength}`}
              strokeDashoffset={`${arcTotalLength * (1 - clampedFraction)}`}
              filter="url(#gaugeGlowFilter)"
            />
          )}

          {/* 3. Milestone Marks Directly on the Gauge Track */}
          {processedMilestones.map((m, idx) => {
            const isHovered = hoveredMilestone?.id === m.id;
            return (
              <g key={m.id || idx}>
                {/* Perpendicular Tick Notch across track (pointer-events-none) */}
                <line
                  x1={m.tickInnerX}
                  y1={m.tickInnerY}
                  x2={m.tickOuterX}
                  y2={m.tickOuterY}
                  stroke={
                    m.isAchieved
                      ? "#10b981"
                      : m.isNextTarget
                      ? "#3b82f6"
                      : "currentColor"
                  }
                  className={`pointer-events-none ${
                    m.isAchieved || m.isNextTarget ? "" : "text-base-content/40"
                  }`}
                  strokeWidth={isHovered ? "3.5" : "2"}
                  strokeLinecap="round"
                />

                {/* Target Ring for Active Target Milestone (Static, no ping) */}
                {m.isNextTarget && (
                  <circle
                    cx={m.pinX}
                    cy={m.pinY}
                    r="10"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="pointer-events-none"
                  />
                )}

                {/* Milestone Pin Dot on track (Static, no transition) */}
                <circle
                  cx={m.pinX}
                  cy={m.pinY}
                  r={isHovered ? 8 : 6}
                  fill={
                    m.isAchieved
                      ? "#10b981"
                      : m.isNextTarget
                      ? "#3b82f6"
                      : "#64748b"
                  }
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.8}
                  filter={m.isAchieved ? "url(#pinGlow)" : undefined}
                  className="pointer-events-none"
                />

                {/* Inner white pip for achieved */}
                {m.isAchieved && (
                  <circle
                    cx={m.pinX}
                    cy={m.pinY}
                    r="2.2"
                    fill="#ffffff"
                    className="pointer-events-none"
                  />
                )}

                {/* Label Text Outside Arc (Static, no transition or scale) */}
                <text
                  x={m.labelX}
                  y={m.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`font-mono select-none pointer-events-none ${
                    isHovered
                      ? "font-extrabold text-[11px] fill-primary"
                      : m.isAchieved
                      ? "font-bold text-[9.5px] fill-emerald-600 dark:fill-emerald-400"
                      : m.isNextTarget
                      ? "font-bold text-[9.5px] fill-primary"
                      : "font-semibold text-[9px] fill-base-content/50"
                  }`}
                >
                  {formatCurrencyCompact(m.amount)}
                </text>

                {/* Large Invisible Hit Circle (Completely stable, prevents hover jitter) */}
                <circle
                  cx={m.pinX}
                  cy={m.pinY}
                  r="20"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredMilestone(m)}
                  onMouseLeave={() => setHoveredMilestone(null)}
                />
              </g>
            );
          })}

          {/* 4. Current Position Precision Pointer Indicator on Arc */}
          <g>
            {/* Perpendicular tick notch for pointer */}
            <line
              x1={ptrTickInnerX}
              y1={ptrTickInnerY}
              x2={ptrTickOuterX}
              y2={ptrTickOuterY}
              stroke="#3b82f6"
              strokeWidth={isPointerHovered ? "3.5" : "2.5"}
              strokeLinecap="round"
              className="pointer-events-none"
            />

            {/* Static Halo (No pulse) */}
            <circle
              cx={pointerX}
              cy={pointerY}
              r="12"
              fill="#3b82f6"
              opacity="0.2"
              className="pointer-events-none"
            />

            {/* Pointer Orb (Static, no transition) */}
            <circle
              cx={pointerX}
              cy={pointerY}
              r={isPointerHovered ? 9.5 : 8}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2.5"
              filter="url(#gaugeGlowFilter)"
              className="pointer-events-none"
            />
            <circle
              cx={pointerX}
              cy={pointerY}
              r="3"
              fill="#ffffff"
              className="pointer-events-none"
            />

            {/* Large Invisible Hit Circle for Pointer */}
            <circle
              cx={pointerX}
              cy={pointerY}
              r="22"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setIsPointerHovered(true)}
              onMouseLeave={() => setIsPointerHovered(false)}
            />
          </g>

          {/* 5. Range Baseline End Labels */}
          <text
            x={cx - r}
            y={cy + 22}
            textAnchor="middle"
            className="font-mono font-extrabold text-[11px] fill-base-content/60 select-none pointer-events-none"
          >
            ₹0
          </text>
          <text
            x={cx + r}
            y={cy + 22}
            textAnchor="middle"
            className="font-mono font-extrabold text-[11px] fill-emerald-600 dark:fill-emerald-400 select-none pointer-events-none"
          >
            {formatCurrencyCompact(upperLimit)}
          </text>

          {/* 6. Floating In-SVG Popover Tooltip for Hovered Milestone (Static, pointer-events-none) */}
          {hoveredMilestone && (
            <g className="pointer-events-none select-none">
              <rect
                x={Math.max(12, Math.min(svgWidth - 172, hoveredMilestone.pinX - 80))}
                y={Math.max(8, hoveredMilestone.pinY - 48)}
                width="160"
                height="38"
                rx="10"
                className="fill-neutral/95 stroke-neutral-content/25"
                filter="url(#gaugeGlowFilter)"
              />
              <text
                x={Math.max(12, Math.min(svgWidth - 172, hoveredMilestone.pinX - 80)) + 80}
                y={Math.max(8, hoveredMilestone.pinY - 48) + 16}
                textAnchor="middle"
                className="font-bold text-[11px] fill-neutral-content"
              >
                {hoveredMilestone.label} ({hoveredMilestone.pctOfGoal}%)
              </text>
              <text
                x={Math.max(12, Math.min(svgWidth - 172, hoveredMilestone.pinX - 80)) + 80}
                y={Math.max(8, hoveredMilestone.pinY - 48) + 30}
                textAnchor="middle"
                className={`font-mono text-[10px] font-extrabold ${
                  hoveredMilestone.isAchieved ? "fill-emerald-400" : "fill-amber-400"
                }`}
              >
                {hoveredMilestone.isAchieved
                  ? `Surpassed (+${formatCurrencyCompact(totalWorth - hoveredMilestone.amount)})`
                  : `${formatCurrencyCompact(hoveredMilestone.amount - totalWorth)} needed`}
              </text>
            </g>
          )}

          {/* 7. Floating In-SVG Popover Tooltip for Pointer (Static, pointer-events-none) */}
          {isPointerHovered && !hoveredMilestone && (
            <g className="pointer-events-none select-none">
              <rect
                x={Math.max(12, Math.min(svgWidth - 172, pointerX - 80))}
                y={Math.max(8, pointerY - 48)}
                width="160"
                height="38"
                rx="10"
                className="fill-neutral/95 stroke-neutral-content/25"
                filter="url(#gaugeGlowFilter)"
              />
              <text
                x={Math.max(12, Math.min(svgWidth - 172, pointerX - 80)) + 80}
                y={Math.max(8, pointerY - 48) + 16}
                textAnchor="middle"
                className="font-bold text-[11px] fill-neutral-content"
              >
                Current Net Worth ({achievementPercent}%)
              </text>
              <text
                x={Math.max(12, Math.min(svgWidth - 172, pointerX - 80)) + 80}
                y={Math.max(8, pointerY - 48) + 30}
                textAnchor="middle"
                className="font-mono text-[10px] font-extrabold fill-primary"
              >
                {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(totalWorth)}`}
              </text>
            </g>
          )}
        </svg>

        {/* Base Display: Compact Net Worth Number positioned right on the base of the gauge */}
        <div className="absolute top-[72%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none w-[60%] max-w-[240px]">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-base-content/50 leading-tight">
            Consolidated Net Worth
          </span>
          <div className="text-base sm:text-lg md:text-xl font-black font-mono tracking-tight text-primary my-0.5 truncate max-w-full">
            {hideNumbers ? "••••••••" : `₹${formatCurrency2Dec(totalWorth)}`}
          </div>

          <div className="flex items-center gap-1.5 justify-center flex-wrap">
            <span className="badge badge-xs font-bold bg-primary/10 text-primary border-primary/20 font-mono text-[9px] h-4 py-0">
              {achievementPercent}% of Goal
            </span>
            <span className="text-[9px] sm:text-[10px] text-base-content/60 font-semibold font-mono">
              {remainingToGoal <= 0 ? (
                <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                  <CheckCircle2 size={10} /> Surpassed!
                </span>
              ) : (
                <span>{hideNumbers ? "••••" : formatCurrencyCompact(remainingToGoal)} left</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Target KPI Summary Footer */}
      <div className="pt-3 border-t border-base-200/80 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-base-200/50 p-2.5 rounded-2xl border border-base-300/30">
          <span className="text-[10px] uppercase font-bold text-base-content/50 block">
            Current Worth
          </span>
          <span className="font-mono font-extrabold text-xs sm:text-sm text-primary">
            {hideNumbers ? "••••••" : formatCurrencyCompact(totalWorth)}
          </span>
        </div>

        <div className="bg-base-200/50 p-2.5 rounded-2xl border border-base-300/30">
          <span className="text-[10px] uppercase font-bold text-base-content/50 block">
            Target Goal
          </span>
          <span className="font-mono font-extrabold text-xs sm:text-sm text-base-content">
            {formatCurrencyCompact(upperLimit)}
          </span>
        </div>

        <div className="bg-base-200/50 p-2.5 rounded-2xl border border-base-300/30">
          <span className="text-[10px] uppercase font-bold text-base-content/50 block">
            Remaining
          </span>
          <span className="font-mono font-extrabold text-xs sm:text-sm text-amber-500">
            {hideNumbers
              ? "••••••"
              : remainingToGoal <= 0
              ? "Goal Surpassed!"
              : formatCurrencyCompact(remainingToGoal)}
          </span>
        </div>
      </div>
    </div>
  );
}
