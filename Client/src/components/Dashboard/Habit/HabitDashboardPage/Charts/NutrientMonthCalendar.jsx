import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * NutrientMonthCalendar
 *
 * Phone-only monthly calendar for a single nutrient category.
 * Tabs = each nutrient in the category.
 * Each day square shows a partial-height fill bar (bottom-up),
 * proportional to daily value vs max target — matching CalorieMonthCalendar style.
 *
 * Props:
 *  - category       {string}   Category name (e.g. "Macronutrients")
 *  - nutrients       {Array}    NUTRIENT_CATEGORIES_CONFIG[category]
 *  - logsByDate      {Object}   { 'YYYY-MM-DD': [foodLog, ...] }
 *  - habitDataByDate {Object}   { 'YYYY-MM-DD': habitEntry }
 *  - targetsConfig   {Object}   TARGETS_CONFIG from NutrientAnalysis
 *  - extractNutrientValue {fn}  helper(log, nutrientId) => number
 */
const NutrientMonthCalendar = ({
  category,
  nutrients = [],
  logsByDate = {},
  habitDataByDate = {},
  targetsConfig = {},
  extractNutrientValue,
}) => {
  const [selectedNutrientId, setSelectedNutrientId] = useState(
    () => nutrients[0]?.id || ""
  );

  // Sync if nutrients list changes
  useEffect(() => {
    if (nutrients.length > 0 && !nutrients.find((n) => n.id === selectedNutrientId)) {
      setSelectedNutrientId(nutrients[0]?.id || "");
    }
  }, [nutrients]);

  // Determine current month from latest logged date
  const latestDate = useMemo(() => {
    const dates = Object.keys(logsByDate).sort().reverse();
    return dates.length > 0 ? dayjs(dates[0]).startOf("month") : dayjs().startOf("month");
  }, [logsByDate]);

  const [currentMonth, setCurrentMonth] = useState(() => latestDate);

  useEffect(() => {
    setCurrentMonth(latestDate);
  }, [latestDate]);

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToToday = () => setCurrentMonth(dayjs().startOf("month"));

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day();
  const paddingSlots = Array.from({ length: startDayOfWeek });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Selected nutrient metadata
  const selectedNutrient = nutrients.find((n) => n.id === selectedNutrientId) || nutrients[0];
  const target = targetsConfig[selectedNutrientId] || { min: 0, max: 0 };
  const maxTarget = target.max || 1;

  // Per-day value for selected nutrient
  const getDayValue = (dateStr) => {
    const logs = logsByDate[dateStr] || [];
    let total = 0;

    if (logs.length > 0) {
      logs.forEach((log) => {
        if (selectedNutrientId === "netCarbs") {
          const carbs = extractNutrientValue ? extractNutrientValue(log, "carbohydrates") : 0;
          const fiber = extractNutrientValue ? extractNutrientValue(log, "fiber") : 0;
          total += Math.max(0, carbs - fiber);
        } else if (selectedNutrientId === "glycemicIndex" || selectedNutrientId === "glycemicLoad") {
          const val = extractNutrientValue ? extractNutrientValue(log, selectedNutrientId) : 0;
          if (val > total) total = val;
        } else {
          total += extractNutrientValue ? extractNutrientValue(log, selectedNutrientId) : 0;
        }
      });
    }

    // Fallback from habitData for calories / water
    if (total === 0) {
      const hEntry = habitDataByDate[dateStr];
      if (hEntry) {
        if (selectedNutrientId === "calories" && hEntry.intake) {
          total = Number(hEntry.intake) || 0;
        } else if (selectedNutrientId === "water" && hEntry.water) {
          const w = Number(hEntry.water) || 0;
          total = w < 50 ? w * 1000 : w;
        }
      }
    }

    return selectedNutrientId === "calories" || selectedNutrientId === "water"
      ? Math.round(total)
      : parseFloat(total.toFixed(1));
  };

  // Monthly summary stats for selected nutrient
  const monthStats = useMemo(() => {
    let totalVal = 0;
    let loggedDays = 0;
    let inGoalDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
      const val = getDayValue(dateStr);
      if (val > 0) {
        totalVal += val;
        loggedDays++;
        if (val <= maxTarget) inGoalDays++;
      }
    }

    const avg = loggedDays > 0 ? parseFloat((totalVal / loggedDays).toFixed(1)) : 0;
    const hitRate = loggedDays > 0 ? Math.round((inGoalDays / loggedDays) * 100) : 0;

    return { totalVal, avg, loggedDays, hitRate };
  }, [currentMonth, selectedNutrientId, logsByDate, habitDataByDate, daysInMonth, maxTarget]);

  // Fill color logic: <50% max = yellow, 50-100% = green, >100% = red
  const getFillColor = (val) => {
    if (val <= 0) return null;
    const pct = val / maxTarget;
    if (pct > 1) return { fill: "bg-red-500/30", label: "text-red-400" };
    if (pct >= 0.5) return { fill: "bg-emerald-500/30", label: "text-emerald-400" };
    return { fill: "bg-amber-400/30", label: "text-amber-400" };
  };

  const formatValue = (val) => {
    if (val <= 0) return null;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    if (val >= 100) return Math.round(val).toString();
    return val.toString();
  };

  if (!selectedNutrient) return null;

  return (
    <div className="w-full space-y-3">
      {/* Nutrient Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {nutrients.map((n) => {
          const Icon = n.icon;
          const isActive = selectedNutrientId === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelectedNutrientId(n.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border ${
                isActive
                  ? "bg-base-200 shadow-sm border-base-400/60"
                  : "bg-base-100 text-base-content/50 border-base-300/40 hover:border-base-300"
              }`}
              style={isActive ? { color: n.colorHex, borderColor: n.colorHex + "80" } : {}}
            >
              <Icon size={12} style={isActive ? { color: n.colorHex } : {}} />
              <span>{n.label}</span>
              {isActive && monthStats.loggedDays > 0 && (
                <span
                  className="text-[10px] font-bold px-1 py-0.5 rounded-md"
                  style={{
                    backgroundColor: n.colorHex + "25",
                    color: n.colorHex,
                  }}
                >
                  {monthStats.loggedDays}d
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Month Nav + Summary */}
      <div className="flex flex-col gap-2 pb-2 border-b border-base-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="btn btn-xs btn-circle btn-ghost border border-base-300 hover:bg-base-200"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="font-extrabold text-sm min-w-[125px] text-center">
              {currentMonth.format("MMMM YYYY")}
            </h3>
            <button
              onClick={nextMonth}
              className="btn btn-xs btn-circle btn-ghost border border-base-300 hover:bg-base-200"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={goToToday}
              className="btn btn-xs btn-ghost border border-base-300 text-[11px] font-semibold rounded-lg ml-0.5 hover:border-primary/50"
            >
              Today
            </button>
          </div>

          {/* Summary Pills */}
          <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
            <div className="bg-base-200/80 px-2 py-0.5 rounded-lg border border-base-300/60 font-medium">
              <span className="text-base-content/60">Avg: </span>
              <span
                className="font-bold"
                style={{ color: selectedNutrient.colorHex }}
              >
                {monthStats.avg} {selectedNutrient.unit}
              </span>
            </div>
            <div className="bg-base-200/80 px-2 py-0.5 rounded-lg border border-base-300/60 font-medium">
              <span className="text-base-content/60">Target: </span>
              <span className="font-bold text-base-content/80">
                {maxTarget} {selectedNutrient.unit}
              </span>
            </div>
            <div className="bg-base-200/80 px-2 py-0.5 rounded-lg border border-base-300/60 font-medium">
              <span className="text-base-content/60">Hit: </span>
              <span className="font-bold text-emerald-400">{monthStats.hitRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span
              key={i}
              className={`text-[11px] font-bold uppercase tracking-wider py-0.5 ${
                i === 0 || i === 6 ? "text-base-content/40" : "text-base-content/60"
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {paddingSlots.map((_, idx) => (
            <div
              key={`pad-${idx}`}
              className="w-full aspect-square pointer-events-none opacity-0"
            />
          ))}

          {daysArray.map((day) => {
            const dayObj = currentMonth.date(day);
            const dateStr = dayObj.format("YYYY-MM-DD");
            const val = getDayValue(dateStr);
            const isToday = dateStr === dayjs().format("YYYY-MM-DD");
            const isFuture = dayObj.isAfter(dayjs(), "day");

            const fillPct = val > 0
              ? Math.min(100, Math.max(8, Math.round((val / maxTarget) * 100)))
              : 0;

            const colors = getFillColor(val);
            const displayVal = formatValue(val);

            return (
              <div
                key={dateStr}
                title={`${dateStr}: ${val > 0 ? `${val} ${selectedNutrient.unit}` : "No data"} (Target: ${maxTarget} ${selectedNutrient.unit})`}
                className={`w-full aspect-square flex flex-col justify-between p-1 rounded-xl border transition-all relative overflow-hidden ${
                  isFuture
                    ? "opacity-20 bg-base-200/20 border-base-300/20 cursor-not-allowed"
                    : "bg-base-200/40 border-base-300/50"
                } ${isToday ? "ring-2 ring-primary/60" : ""}`}
              >
                {/* Partial height fill bar (bottom up) */}
                {val > 0 && colors && (
                  <div
                    className={`absolute bottom-0 inset-x-0 transition-all duration-300 ${colors.fill} rounded-t-xs`}
                    style={{ height: `${fillPct}%` }}
                  />
                )}

                {/* Top row: day number + today dot */}
                <div className="flex items-center justify-between w-full leading-none z-10">
                  <span
                    className={`text-[11px] font-bold leading-none ${
                      isToday ? "text-primary font-black" : "text-base-content/85"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  )}
                </div>

                {/* Bottom row: value */}
                <div className="flex items-center justify-center w-full leading-none z-10 mt-auto">
                  {displayVal ? (
                    <span
                      className={`text-[9px] font-extrabold truncate leading-none ${
                        colors?.label || "text-base-content/70"
                      }`}
                    >
                      {displayVal}
                    </span>
                  ) : (
                    <span className="text-[9px] text-base-content/30 font-medium leading-none">
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2.5 text-[10px] text-base-content/70 flex-wrap pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-xs bg-base-200 border border-base-300" />
          <span>No data</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
          <span>&lt; 50% target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
          <span>50–100% target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-xs bg-red-500" />
          <span>&gt; max target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default NutrientMonthCalendar;
