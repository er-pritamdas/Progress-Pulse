import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * CalorieMonthCalendar
 *
 * Monthly calendar view for Calorie Analysis on Phone View.
 * Every date box is a perfect square filled like a graph bar.
 * Supports:
 * - Dual Bars (Consumed & Burned pillars side-by-side)
 * - Intake (Full square filled like a graph bar with Consumed calories)
 * - Burned (Full square filled like a graph bar with Burned calories)
 * - Effective (Full square filled like a graph bar with intake - offset - burned)
 */
const CalorieMonthCalendar = ({
  habitData = [],
  ConsumedCalorieMax = 2500,
  ConsumedCalorieMin = 1800,
  BurnedCalorieMax = 600,
  BurnedCalorieMin = 200,
  basalMetabolicRate = 0,
}) => {
  // Safe goal boundaries and daily offset (BMR)
  const maxConsumed = ConsumedCalorieMax > 0 ? ConsumedCalorieMax : 2500;
  const minConsumed = ConsumedCalorieMin > 0 ? ConsumedCalorieMin : 1800;
  const maxBurned = BurnedCalorieMax > 0 ? BurnedCalorieMax : 600;
  const dailyOffset = Number(basalMetabolicRate) || 0;

  // View Mode: 'effective' (default) | 'dual' | 'consumed' | 'burned'
  const [viewMode, setViewMode] = useState("effective");

  // Latest logged date or today
  const latestLoggedDate = useMemo(() => {
    if (Array.isArray(habitData) && habitData.length > 0 && habitData[0]?.date) {
      return dayjs(habitData[0].date);
    }
    return dayjs();
  }, [habitData]);

  // Current viewed month
  const [currentMonth, setCurrentMonth] = useState(() => latestLoggedDate.startOf("month"));

  // Keep month synchronized when habitData updates
  useEffect(() => {
    if (Array.isArray(habitData) && habitData.length > 0 && habitData[0]?.date) {
      setCurrentMonth(dayjs(habitData[0].date).startOf("month"));
    }
  }, [habitData]);

  // Currently selected date
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

  // Month navigation handlers
  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToToday = () => {
    const now = dayjs().startOf("month");
    setCurrentMonth(now);
    setSelectedDate(dayjs().format("YYYY-MM-DD"));
  };

  // Monthly stats calculations
  const monthStats = useMemo(() => {
    const daysInMonth = currentMonth.daysInMonth();
    let totalConsumed = 0;
    let totalBurned = 0;
    let totalEffective = 0;
    let loggedDays = 0;
    let inGoalDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
      const entry = entryMap.get(dateStr);
      if (entry) {
        const intake = Number(entry.intake) || 0;
        const burned = Number(entry.burned) || 0;
        if (intake > 0 || burned > 0) {
          totalConsumed += intake;
          totalBurned += burned;
          // Effective = intake - offset - burned
          const eff = intake - dailyOffset - burned;
          totalEffective += eff;
          loggedDays++;
          if (intake >= minConsumed && intake <= maxConsumed) {
            inGoalDays++;
          }
        }
      }
    }

    const hitRate = loggedDays > 0 ? Math.round((inGoalDays / loggedDays) * 100) : 0;
    return {
      totalConsumed,
      totalBurned,
      totalEffective,
      loggedDays,
      hitRate,
    };
  }, [currentMonth, entryMap, minConsumed, maxConsumed, dailyOffset]);

  // Calendar Day Generation
  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day(); // 0 (Sun) - 6 (Sat)
  const paddingSlots = Array.from({ length: startDayOfWeek });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="w-full space-y-3">
      {/* 1. Header: Month Navigation + Mode Switcher */}
      <div className="flex flex-col gap-2.5 pb-2 border-b border-base-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Navigation buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="btn btn-xs sm:btn-sm btn-circle btn-ghost border border-base-300 hover:bg-base-200"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <h3 className="font-extrabold text-sm sm:text-base min-w-[125px] text-center">
              {currentMonth.format("MMMM YYYY")}
            </h3>

            <button
              onClick={nextMonth}
              className="btn btn-xs sm:btn-sm btn-circle btn-ghost border border-base-300 hover:bg-base-200"
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

          {/* Mode Switcher (Bars, Intake, Burned, Effective) */}
          <div className="join border border-base-300 rounded-lg p-0.5 bg-base-200/60">
            <button
              onClick={() => setViewMode("dual")}
              className={`btn btn-xs border-0 px-2 rounded-md ${
                viewMode === "dual"
                  ? "btn-primary text-primary-content font-bold shadow-xs"
                  : "btn-ghost text-base-content/70 font-medium"
              }`}
            >
              Bars
            </button>
            <button
              onClick={() => setViewMode("consumed")}
              className={`btn btn-xs border-0 px-2 rounded-md ${
                viewMode === "consumed"
                  ? "btn-primary text-primary-content font-bold shadow-xs"
                  : "btn-ghost text-base-content/70 font-medium"
              }`}
            >
              Intake
            </button>
            <button
              onClick={() => setViewMode("burned")}
              className={`btn btn-xs border-0 px-2 rounded-md ${
                viewMode === "burned"
                  ? "btn-primary text-primary-content font-bold shadow-xs"
                  : "btn-ghost text-base-content/70 font-medium"
              }`}
            >
              Burned
            </button>
            <button
              onClick={() => setViewMode("effective")}
              className={`btn btn-xs border-0 px-2 rounded-md ${
                viewMode === "effective"
                  ? "btn-primary text-primary-content font-bold shadow-xs"
                  : "btn-ghost text-base-content/70 font-medium"
              }`}
            >
              Effective
            </button>
          </div>
        </div>

        {/* Month Summary Pills */}
        <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
          <div className="bg-base-200/80 px-2 py-0.5 rounded-lg border border-base-300/60 font-medium">
            <span className="text-base-content/60">Intake: </span>
            <span className="font-bold text-base-content">
              {monthStats.totalConsumed >= 1000
                ? `${(monthStats.totalConsumed / 1000).toFixed(1)}k`
                : monthStats.totalConsumed}
            </span>
          </div>

          <div className="bg-base-200/80 px-2 py-0.5 rounded-lg border border-base-300/60 font-medium">
            <span className="text-base-content/60">Burned: </span>
            <span className="font-bold text-rose-400">
              {monthStats.totalBurned >= 1000
                ? `${(monthStats.totalBurned / 1000).toFixed(1)}k`
                : monthStats.totalBurned}
            </span>
          </div>

          <div className="bg-base-200/80 px-2 py-0.5 rounded-lg border border-base-300/60 font-medium">
            <span className="text-base-content/60">Effective: </span>
            <span
              className={`font-bold ${
                monthStats.totalEffective < 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {monthStats.totalEffective > 0 ? `+` : ``}
              {Math.abs(monthStats.totalEffective) >= 1000
                ? `${(monthStats.totalEffective / 1000).toFixed(1)}k`
                : monthStats.totalEffective}
            </span>
          </div>

          <div className="bg-base-200/80 px-2 py-0.5 rounded-lg border border-base-300/60 font-medium">
            <span className="text-base-content/60">Hit: </span>
            <span className="font-bold text-emerald-400">{monthStats.hitRate}%</span>
          </div>
        </div>
      </div>

      {/* 2. Calendar Grid */}
      <div className="w-full">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
            <span
              key={d}
              className={`text-[11px] font-bold uppercase tracking-wider py-0.5 ${
                i === 0 || i === 6 ? "text-base-content/40" : "text-base-content/60"
              }`}
            >
              <span>{d[0]}</span>
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
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
            const intake = entry ? Number(entry.intake) || 0 : 0;
            const burned = entry ? Number(entry.burned) || 0 : 0;
            // Effective = intake - offset - burned
            const effective = intake - dailyOffset - burned;
            const hasData = intake > 0 || burned > 0;
            const isToday = dateStr === dayjs().format("YYYY-MM-DD");
            const isFuture = dayObj.isAfter(dayjs(), "day");
            const isSelected = selectedDate === dateStr;

            // Height percentages
            const intakePct = Math.min(100, Math.max(10, Math.round((intake / maxConsumed) * 100)));
            const burnedPct = Math.min(100, Math.max(10, Math.round((burned / maxBurned) * 100)));
            const maxEffectiveRef = 800;
            const effectivePct = Math.min(
              100,
              Math.max(12, Math.round((Math.abs(effective) / maxEffectiveRef) * 100))
            );

            // Color status based on mode:
            // In Intake: Till Offset is yellow, offset to 2000 is green, and >2000 is red
            const intakeUpperLimit = ConsumedCalorieMax > 0 ? ConsumedCalorieMax : 2000;
            const offsetThreshold = dailyOffset > 0 ? dailyOffset : minConsumed || 1500;

            let intakeBarColor = "bg-amber-400";
            let intakeFillBg = "bg-amber-400/30 rounded-t-xs";
            if (intake > offsetThreshold && intake <= intakeUpperLimit) {
              intakeBarColor = "bg-emerald-500";
              intakeFillBg = "bg-emerald-500/30 rounded-t-xs";
            } else if (intake > intakeUpperLimit) {
              intakeBarColor = "bg-red-500";
              intakeFillBg = "bg-red-500/30 rounded-t-xs";
            }

            // Effective color status: Deficit (< 0) is Red, Surplus (>= 0) is Green (no level line border)
            let effectiveFillBg = "bg-red-500/30 rounded-t-xs";
            if (effective >= 0) {
              effectiveFillBg = "bg-emerald-500/30 rounded-t-xs";
            }

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                disabled={isFuture}
                className={`w-full aspect-square flex flex-col justify-between p-1 rounded-xl border transition-all text-left relative overflow-hidden group ${
                  isFuture
                    ? "opacity-25 bg-base-200/20 border-base-300/20 cursor-not-allowed"
                    : "cursor-pointer bg-base-200/40 border-base-300/50"
                } ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100 shadow-md z-10"
                    : isToday
                    ? "ring-2 ring-primary/60"
                    : "hover:border-primary/50"
                }`}
              >
                {/* Partial Height Fill (no border on the level line) */}
                {viewMode === "consumed" && intake > 0 && (
                  <div
                    className={`absolute bottom-0 inset-x-0 transition-all duration-300 ${intakeFillBg}`}
                    style={{ height: `${intakePct}%` }}
                  />
                )}
                {viewMode === "burned" && burned > 0 && (
                  <div
                    className="absolute bottom-0 inset-x-0 transition-all duration-300 bg-rose-500/30 rounded-t-xs"
                    style={{ height: `${burnedPct}%` }}
                  />
                )}
                {viewMode === "effective" && hasData && (
                  <div
                    className={`absolute bottom-0 inset-x-0 transition-all duration-300 ${effectiveFillBg}`}
                    style={{ height: `${effectivePct}%` }}
                  />
                )}
                {/* Top Row: Day Number & Today indicator */}
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

                {/* Center: Graph Bars Area (Active in 'dual' mode) */}
                {viewMode === "dual" && (
                  <div className="flex-1 flex items-end justify-center gap-1 w-full my-0.5 z-10">
                    {/* Consumed Bar Pillar */}
                    <div
                      className="w-2.5 sm:w-3 h-full max-h-[22px] bg-base-300/40 rounded-t-xs relative flex items-end overflow-hidden"
                      title={`Intake: ${intake} kcal`}
                    >
                      {intake > 0 && (
                        <div
                          className={`w-full rounded-t-xs transition-all duration-300 ${intakeBarColor}`}
                          style={{ height: `${intakePct}%` }}
                        />
                      )}
                    </div>

                    {/* Burned Bar Pillar */}
                    <div
                      className="w-2.5 sm:w-3 h-full max-h-[22px] bg-base-300/40 rounded-t-xs relative flex items-end overflow-hidden"
                      title={`Burned: ${burned} kcal`}
                    >
                      {burned > 0 && (
                        <div
                          className="w-full bg-rose-500 rounded-t-xs transition-all duration-300"
                          style={{ height: `${burnedPct}%` }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Row: Calorie Value */}
                <div className="flex items-center justify-center w-full leading-none z-10 mt-auto">
                  {viewMode === "burned" ? (
                    burned > 0 ? (
                      <span className="text-[9px] font-extrabold truncate leading-none text-rose-400">
                        {burned >= 1000 ? `${(burned / 1000).toFixed(1)}k` : burned}
                      </span>
                    ) : (
                      <span className="text-[9px] text-base-content/30 font-medium leading-none">—</span>
                    )
                  ) : viewMode === "effective" ? (
                    hasData ? (
                      <span className="text-[9px] font-extrabold truncate leading-none">
                        {effective > 0 ? `+` : ``}
                        {Math.abs(effective) >= 1000
                          ? `${(effective / 1000).toFixed(1)}k`
                          : effective}
                      </span>
                    ) : (
                      <span className="text-[9px] text-base-content/30 font-medium leading-none">—</span>
                    )
                  ) : viewMode === "consumed" ? (
                    intake > 0 ? (
                      <span className="text-[9px] font-extrabold truncate leading-none">
                        {intake >= 1000 ? `${(intake / 1000).toFixed(1)}k` : intake}
                      </span>
                    ) : (
                      <span className="text-[9px] text-base-content/30 font-medium leading-none">—</span>
                    )
                  ) : hasData ? (
                    <span className="text-[9px] font-extrabold truncate leading-none text-base-content/90">
                      {intake >= 1000
                        ? `${(intake / 1000).toFixed(1)}k`
                        : intake > 0
                        ? intake
                        : `${burned}b`}
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

      {/* 3. Legend */}
      {viewMode === "effective" ? (
        <div className="flex items-center justify-center gap-2.5 sm:gap-5 text-[10px] sm:text-[11px] text-base-content/70 flex-wrap pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-base-200 border border-base-300"></div>
            <span>Unlogged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-red-500 border border-red-400"></div>
            <span>Deficit (&lt; 0 kcal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-400"></div>
            <span>Surplus (≥ 0 kcal)</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2.5 sm:gap-5 text-[10px] sm:text-[11px] text-base-content/70 flex-wrap pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-base-200 border border-base-300"></div>
            <span>Unlogged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-amber-400 border border-amber-300"></div>
            <span>Till Offset (&le;{Math.round(dailyOffset || minConsumed)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500 border border-emerald-400"></div>
            <span>Offset to {ConsumedCalorieMax > 0 ? ConsumedCalorieMax : 2000}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-red-500 border border-red-400"></div>
            <span>&gt; {ConsumedCalorieMax > 0 ? ConsumedCalorieMax : 2000}</span>
          </div>
          {viewMode === "dual" && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-xs bg-rose-500 border border-rose-400"></div>
              <span>Burned</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalorieMonthCalendar;
