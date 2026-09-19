import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * HabitMonthCalendar
 *
 * Apple Health-style monthly calendar view for habit analysis (Water, Sleep, Read).
 * Fits 100% on mobile screens with zero horizontal scrolling.
 */
const HabitMonthCalendar = ({
  habitData = [],
  habitType = "water", // 'water' | 'sleep' | 'read'
  minTarget = 2,
  maxTarget = 4,
  unit = "L",
  title = "Water Intake Calendar",
}) => {
  // Find the latest logged entry or today
  const latestLoggedDate = useMemo(() => {
    if (Array.isArray(habitData) && habitData.length > 0 && habitData[0]?.date) {
      return dayjs(habitData[0].date);
    }
    return dayjs();
  }, [habitData]);

  // Current viewed month
  const [currentMonth, setCurrentMonth] = useState(() => latestLoggedDate.startOf("month"));

  // When habitData updates or date filter changes, jump to latest logged month
  useEffect(() => {
    if (Array.isArray(habitData) && habitData.length > 0 && habitData[0]?.date) {
      setCurrentMonth(dayjs(habitData[0].date).startOf("month"));
    }
  }, [habitData]);

  // Currently selected date for detailed preview
  const [selectedDate, setSelectedDate] = useState(() => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    const hasToday = habitData.some(
      (e) => dayjs(e.date).format("YYYY-MM-DD") === todayStr
    );
    if (hasToday) return todayStr;
    return habitData[0]?.date ? dayjs(habitData[0].date).format("YYYY-MM-DD") : todayStr;
  });

  // Fast map of entries by 'YYYY-MM-DD'
  const entryMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(habitData)) return map;
    habitData.forEach((entry) => {
      if (entry && entry.date) {
        const key = dayjs(entry.date).format("YYYY-MM-DD");
        map.set(key, entry);
      }
    });
    return map;
  }, [habitData]);

  // Value extractor helper
  const getValue = (entry) => {
    if (!entry) return null;
    if (habitType === "water") {
      const val = parseFloat(entry.water);
      return isNaN(val) ? null : val;
    }
    if (habitType === "sleep") {
      const val = parseFloat(entry.sleep);
      return isNaN(val) ? null : val;
    }
    if (habitType === "read") {
      const val = parseFloat(entry.read);
      return isNaN(val) ? null : val;
    }
    return null;
  };

  // Habit specific branding
  const config = useMemo(() => {
    if (habitType === "water") {
      return {
        themeColor: "text-blue-400",
        optimalBg: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
        aboveBg: "bg-blue-500/25 border-blue-500/60 text-blue-300",
        belowBg: "bg-amber-500/20 border-amber-500/40 text-amber-300",
        emptyBg: "bg-base-200/40 border-base-300/40 text-base-content/40",
        barColor: "bg-blue-500",
        name: "Water",
      };
    }
    if (habitType === "sleep") {
      return {
        themeColor: "text-violet-400",
        optimalBg: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
        aboveBg: "bg-blue-500/25 border-blue-500/60 text-blue-300",
        belowBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
        emptyBg: "bg-base-200/40 border-base-300/40 text-base-content/40",
        barColor: "bg-violet-500",
        name: "Sleep",
      };
    }
    return {
      themeColor: "text-amber-400",
      optimalBg: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
      aboveBg: "bg-blue-500/25 border-blue-500/60 text-blue-300",
      belowBg: "bg-rose-500/20 border-rose-500/40 text-rose-300",
      emptyBg: "bg-base-200/40 border-base-300/40 text-base-content/40",
      barColor: "bg-amber-500",
      name: "Reading",
    };
  }, [habitType]);

  // Monthly stats calculations
  const monthStats = useMemo(() => {
    const daysInMonth = currentMonth.daysInMonth();
    let total = 0;
    let loggedCount = 0;
    let optimalCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
      const entry = entryMap.get(dateStr);
      const val = getValue(entry);
      if (val !== null && val > 0) {
        total += val;
        loggedCount++;
        if (minTarget > 0 && val >= minTarget) {
          optimalCount++;
        }
      }
    }

    const avg = loggedCount > 0 ? total / loggedCount : 0;
    const hitRate = loggedCount > 0 ? Math.round((optimalCount / loggedCount) * 100) : 0;

    return {
      total,
      loggedCount,
      daysInMonth,
      avg,
      hitRate,
    };
  }, [currentMonth, entryMap, minTarget]);

  // Calendar Day Generation
  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day(); // 0 (Sun) - 6 (Sat)
  const paddingSlots = Array.from({ length: startDayOfWeek });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Handlers for month navigation
  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToToday = () => {
    const now = dayjs().startOf("month");
    setCurrentMonth(now);
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Header: Month Navigation + Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-200">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="btn btn-sm btn-circle btn-ghost border border-base-300 hover:bg-base-200"
            title="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>

          <h3 className="font-extrabold text-base sm:text-lg min-w-[150px] text-center">
            {currentMonth.format("MMMM YYYY")}
          </h3>

          <button
            onClick={nextMonth}
            className="btn btn-sm btn-circle btn-ghost border border-base-300 hover:bg-base-200"
            title="Next Month"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={goToToday}
            className="btn btn-xs btn-ghost border border-base-300 text-xs font-semibold rounded-lg ml-1 hover:border-primary/50"
          >
            Today
          </button>
        </div>

        {/* Month Summary Pills */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="bg-base-200/80 px-2.5 py-1 rounded-xl border border-base-300/60 font-medium">
            <span className="text-base-content/60">Total: </span>
            <span className="font-bold text-base-content">
              {monthStats.total.toFixed(1)}
              {unit}
            </span>
          </div>

          <div className="bg-base-200/80 px-2.5 py-1 rounded-xl border border-base-300/60 font-medium">
            <span className="text-base-content/60">Avg: </span>
            <span className="font-bold text-base-content">
              {monthStats.avg.toFixed(1)}
              {unit}/d
            </span>
          </div>

          <div className="bg-base-200/80 px-2.5 py-1 rounded-xl border border-base-300/60 font-medium">
            <span className="text-base-content/60">On-Track: </span>
            <span className="font-bold text-primary">{monthStats.hitRate}%</span>
          </div>
        </div>
      </div>

      {/* 2. Calendar Grid */}
      <div className="w-full">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
            <span
              key={d}
              className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider py-1 ${
                i === 0 || i === 6 ? "text-base-content/40" : "text-base-content/60"
              }`}
            >
              {/* Short name on mobile, 3-letter on desktop */}
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline">{d}</span>
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty padding slots */}
          {paddingSlots.map((_, idx) => (
            <div
              key={`pad-${idx}`}
              className="w-full aspect-square rounded-xl bg-transparent pointer-events-none opacity-0"
            />
          ))}

          {/* Actual days */}
          {daysArray.map((day) => {
            const dayObj = currentMonth.date(day);
            const dateStr = dayObj.format("YYYY-MM-DD");
            const entry = entryMap.get(dateStr);
            const val = getValue(entry);
            const isToday = dateStr === dayjs().format("YYYY-MM-DD");
            const isFuture = dayObj.isAfter(dayjs(), "day");
            const isSelected = selectedDate === dateStr;

            // Determine status color styling
            let statusStyle = config.emptyBg;
            let statusLabel = "Empty";

            if (val !== null && val > 0) {
              if (minTarget > 0 && val < minTarget) {
                statusStyle = config.belowBg;
                statusLabel = "Below Min";
              } else if (maxTarget > 0 && val > maxTarget) {
                statusStyle = config.aboveBg;
                statusLabel = "Above Max";
              } else {
                statusStyle = config.optimalBg;
                statusLabel = "Optimal";
              }
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                disabled={isFuture}
                className={`w-full aspect-square flex flex-col justify-between p-1 sm:p-1.5 rounded-xl border transition-all text-left relative overflow-hidden group ${
                  isFuture ? "opacity-25 bg-base-200/20 border-base-300/20 cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100 shadow-md scale-[1.02] z-10"
                    : isToday
                    ? "ring-2 ring-primary/60"
                    : "hover:border-primary/50 hover:shadow-xs"
                } ${statusStyle}`}
              >
                {/* Top Row: Day Number & Today indicator */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span
                    className={`text-[11px] sm:text-xs font-bold leading-none ${
                      isToday ? "text-primary font-black" : "text-base-content/80"
                    }`}
                  >
                    {day}
                  </span>

                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  )}
                </div>

                {/* Bottom Row: Value or Dash */}
                <div className="flex items-baseline justify-between w-full leading-none mt-auto">
                  {val !== null && val > 0 ? (
                    <span className="text-[10px] sm:text-xs font-extrabold truncate tracking-tight leading-none">
                      {val % 1 === 0 ? val : val.toFixed(1)}
                      <span className="text-[8px] sm:text-[9px] font-normal opacity-70 ml-0.5">{unit}</span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-base-content/30 font-medium leading-none">—</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* 4. Legend */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-6 text-[10px] sm:text-[11px] text-base-content/70 flex-wrap pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-base-200 border border-base-300"></div>
          <span>Unlogged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded border ${config.belowBg}`}></div>
          <span>Below Min (&lt;{minTarget}{unit})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded border ${config.optimalBg}`}></div>
          <span>Within Goal ({minTarget}-{maxTarget}{unit})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded border ${config.aboveBg}`}></div>
          <span>Exceeded Max (&gt;{maxTarget}{unit})</span>
        </div>
      </div>
    </div>
  );
};

export default HabitMonthCalendar;
