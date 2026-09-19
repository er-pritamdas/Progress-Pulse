import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Zap, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

/**
 * ScoreMonthCalendar
 *
 * Phone-only monthly calendar view for Score Analysis.
 * Tabs: All | Consistent | Moderate | Uncertain | Inconsistent
 * Each day square is filled with the status color when the score was recorded.
 */

const STATUS_MAP = {
  All:          { label: "All Days",              color: "#6366f1", textColor: "#ffffff", icon: Zap },
  Consistent:   { label: "Consistent (≥75%)",    color: "#10B981", textColor: "#ffffff", icon: CheckCircle },
  Moderate:     { label: "Moderate (50–74%)",    color: "#3B82F6", textColor: "#ffffff", icon: Clock },
  Uncertain:    { label: "Uncertain (25–49%)",   color: "#F59E0B", textColor: "#000000", icon: AlertCircle },
  Inconsistent: { label: "Inconsistent (<25%)",  color: "#EF4444", textColor: "#ffffff", icon: XCircle },
};

const STATUS_KEYS = ["All", "Consistent", "Moderate", "Uncertain", "Inconsistent"];

const getStatusForEntry = (entry) => {
  if (!entry) return null;
  const progress = Number(entry.progress) || 0;
  const score = Number(entry.score) || 0;
  if (progress >= 75 || score >= 5.25) return "Consistent";
  if (progress >= 50 || score >= 3.5)  return "Moderate";
  if (progress >= 25 || score >= 1.75) return "Uncertain";
  return "Inconsistent";
};

const ScoreMonthCalendar = ({ habitData = [] }) => {
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Latest logged date or today
  const latestLoggedDate = useMemo(() => {
    if (Array.isArray(habitData) && habitData.length > 0 && habitData[0]?.date) {
      return dayjs(habitData[0].date);
    }
    return dayjs();
  }, [habitData]);

  const [currentMonth, setCurrentMonth] = useState(() => latestLoggedDate.startOf("month"));

  useEffect(() => {
    if (Array.isArray(habitData) && habitData.length > 0 && habitData[0]?.date) {
      setCurrentMonth(dayjs(habitData[0].date).startOf("month"));
    }
  }, [habitData]);

  // Fast map: YYYY-MM-DD -> { ...entry, status }
  const entryMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(habitData)) return map;
    habitData.forEach((entry) => {
      if (entry?.date) {
        const status = getStatusForEntry(entry);
        if (status) map.set(dayjs(entry.date).format("YYYY-MM-DD"), { ...entry, status });
      }
    });
    return map;
  }, [habitData]);

  // Status counts for the whole dataset
  const statusCounts = useMemo(() => {
    const counts = { Consistent: 0, Moderate: 0, Uncertain: 0, Inconsistent: 0 };
    entryMap.forEach((val) => {
      if (counts[val.status] !== undefined) counts[val.status]++;
    });
    return { ...counts, All: entryMap.size };
  }, [entryMap]);

  // Monthly stats for selected status
  const monthStats = useMemo(() => {
    const daysInMonth = currentMonth.daysInMonth();
    let recorded = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
      const entry = entryMap.get(dateStr);
      if (entry && (selectedStatus === "All" || entry.status === selectedStatus)) {
        recorded++;
      }
    }
    return { recorded, totalDays: daysInMonth };
  }, [currentMonth, entryMap, selectedStatus]);

  // Navigation
  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToToday  = () => setCurrentMonth(dayjs().startOf("month"));

  const daysInMonth   = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day();
  const paddingSlots  = Array.from({ length: startDayOfWeek });
  const daysArray     = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const activeStatus  = STATUS_MAP[selectedStatus] || STATUS_MAP.All;

  return (
    <div className="w-full space-y-3">

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_KEYS.map((key) => {
          const s = STATUS_MAP[key];
          const IconComp = s.icon;
          const isActive = selectedStatus === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedStatus(key)}
              style={isActive ? { borderColor: s.color, color: s.color } : {}}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border ${
                isActive
                  ? "bg-base-200 shadow-sm"
                  : "bg-base-100 text-base-content/50 border-base-300/40 hover:border-base-300"
              }`}
            >
              <IconComp size={12} />
              <span>{key}</span>
              {isActive && (
                <span
                  className="text-[10px] font-bold px-1 py-0.5 rounded-md"
                  style={{ backgroundColor: s.color + "33", color: s.color }}
                >
                  {statusCounts[key] || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Month Navigation Header */}
      <div className="flex flex-col gap-2 pb-2 border-b border-base-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
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

          {/* Stats pill */}
          <div
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border font-medium"
            style={{
              backgroundColor: activeStatus.color + "22",
              borderColor: activeStatus.color + "60",
              color: activeStatus.color,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeStatus.color }} />
            <span>{monthStats.recorded} / {monthStats.totalDays} days</span>
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
            <div key={`pad-${idx}`} className="w-full aspect-square pointer-events-none" />
          ))}

          {daysArray.map((day) => {
            const dayObj  = currentMonth.date(day);
            const dateStr = dayObj.format("YYYY-MM-DD");
            const entry   = entryMap.get(dateStr);
            const isMatch = entry && (selectedStatus === "All" || entry.status === selectedStatus);
            const isToday  = dateStr === dayjs().format("YYYY-MM-DD");
            const isFuture = dayObj.isAfter(dayjs(), "day");

            const statusInfo = isMatch ? STATUS_MAP[entry.status] : null;

            return (
              <div
                key={dateStr}
                title={
                  isMatch
                    ? `${dateStr} — Score ${entry.score ?? "--"}/7 (${entry.progress ?? 0}%) · ${entry.status}`
                    : dateStr
                }
                className={`w-full aspect-square flex flex-col justify-between p-1 rounded-xl border transition-all relative overflow-hidden ${
                  isFuture
                    ? "opacity-20 bg-base-200/20 border-base-300/20 cursor-not-allowed"
                    : "bg-base-200/40 border-base-300/50"
                } ${isToday ? "ring-2 ring-primary/60" : ""}`}
              >
                {/* Background fill */}
                {isMatch && statusInfo && (
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{ backgroundColor: statusInfo.color + "40" }}
                  />
                )}

                {/* Day number */}
                <div className="flex items-center justify-between w-full leading-none z-10">
                  <span
                    className={`text-[11px] font-bold leading-none ${
                      isToday ? "text-primary font-black" : "text-base-content/85"
                    }`}
                    style={isMatch && statusInfo ? { color: statusInfo.color } : {}}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  )}
                </div>

                {/* Bottom: score or dash */}
                <div className="flex items-center justify-center w-full leading-none z-10 mt-auto">
                  {isMatch && entry ? (
                    <span
                      className="text-[9px] font-extrabold leading-none"
                      style={{ color: statusInfo?.color }}
                    >
                      {entry.score ?? "✓"}
                    </span>
                  ) : (
                    <span className="text-[9px] text-base-content/30 font-medium leading-none">—</span>
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
        {(selectedStatus === "All" ? ["Consistent", "Moderate", "Uncertain", "Inconsistent"] : [selectedStatus]).map((key) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: STATUS_MAP[key].color }} />
            <span>{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreMonthCalendar;
