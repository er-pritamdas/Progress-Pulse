import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Dumbbell, BookOpen, Flower2, Footprints, Droplets, Moon, PenLine, Sparkles, Zap } from "lucide-react";

/**
 * SelfCareMonthCalendar
 *
 * Phone-only monthly calendar view for Self Care Analysis.
 * Shows tabs for each self-care habit.
 * Each day square is filled (colored) when the habit was performed that day.
 */

// Color palette for activities (cycles if more than palette length)
const ACTIVITY_COLORS = [
  { bg: "bg-emerald-500/30", dot: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/60", hex: "#34d399" },
  { bg: "bg-sky-500/30",     dot: "bg-sky-500",     text: "text-sky-500",     border: "border-sky-500/60",     hex: "#38bdf8" },
  { bg: "bg-violet-500/30",  dot: "bg-violet-500",  text: "text-violet-500",  border: "border-violet-500/60",  hex: "#a78bfa" },
  { bg: "bg-amber-500/30",   dot: "bg-amber-500",   text: "text-amber-500",   border: "border-amber-500/60",   hex: "#fbbf24" },
  { bg: "bg-rose-500/30",    dot: "bg-rose-500",    text: "text-rose-500",    border: "border-rose-500/60",    hex: "#fb7185" },
  { bg: "bg-pink-500/30",    dot: "bg-pink-500",    text: "text-pink-500",    border: "border-pink-500/60",    hex: "#f472b6" },
  { bg: "bg-teal-500/30",    dot: "bg-teal-500",    text: "text-teal-500",    border: "border-teal-500/60",    hex: "#2dd4bf" },
  { bg: "bg-orange-500/30",  dot: "bg-orange-500",  text: "text-orange-500",  border: "border-orange-500/60",  hex: "#fb923c" },
  { bg: "bg-indigo-500/30",  dot: "bg-indigo-500",  text: "text-indigo-500",  border: "border-indigo-500/60",  hex: "#818cf8" },
  { bg: "bg-lime-500/30",    dot: "bg-lime-500",    text: "text-lime-500",    border: "border-lime-500/60",    hex: "#a3e635" },
];

// Helper to get icon for habit
const getHabitIcon = (habitName, size = 14) => {
  if (!habitName) return <Zap size={size} />;
  const lower = habitName.toLowerCase();
  if (lower.includes("workout") || lower.includes("gym") || lower.includes("exercise")) return <Dumbbell size={size} />;
  if (lower.includes("read") || lower.includes("book")) return <BookOpen size={size} />;
  if (lower.includes("meditat") || lower.includes("yoga")) return <Flower2 size={size} />;
  if (lower.includes("run") || lower.includes("jog") || lower.includes("walk")) return <Footprints size={size} />;
  if (lower.includes("water") || lower.includes("drink")) return <Droplets size={size} />;
  if (lower.includes("sleep") || lower.includes("nap")) return <Moon size={size} />;
  if (lower.includes("journal") || lower.includes("writ")) return <PenLine size={size} />;
  if (lower.includes("skin") || lower.includes("face")) return <Sparkles size={size} />;
  return <Zap size={size} />;
};

// Check if an activity was logged in a given entry
const isActivityInEntry = (entry, activity, selfCareList) => {
  if (!entry?.selfcare) return false;
  const index = selfCareList.indexOf(activity);
  if (index !== -1 && index < entry.selfcare.length) {
    return entry.selfcare[index] === activity[0].toUpperCase();
  }
  return false;
};

const SelfCareMonthCalendar = ({ habitData = [], selfCareList = [] }) => {
  const activeList = selfCareList.filter(Boolean);

  // Selected activity tab (default: first activity)
  const [selectedActivity, setSelectedActivity] = useState(() => activeList[0] || "");

  // Sync selected activity if list changes
  useEffect(() => {
    if (activeList.length > 0 && !activeList.includes(selectedActivity)) {
      setSelectedActivity(activeList[0]);
    }
  }, [selfCareList]);

  // Latest logged date or today
  const latestLoggedDate = useMemo(() => {
    if (Array.isArray(habitData) && habitData.length > 0 && habitData[0]?.date) {
      return dayjs(habitData[0].date);
    }
    return dayjs();
  }, [habitData]);

  // Current viewed month
  const [currentMonth, setCurrentMonth] = useState(() => latestLoggedDate.startOf("month"));

  useEffect(() => {
    if (Array.isArray(habitData) && habitData.length > 0 && habitData[0]?.date) {
      setCurrentMonth(dayjs(habitData[0].date).startOf("month"));
    }
  }, [habitData]);

  // Fast map of entries by 'YYYY-MM-DD'
  const entryMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(habitData)) return map;
    habitData.forEach((entry) => {
      if (entry?.date) {
        map.set(dayjs(entry.date).format("YYYY-MM-DD"), entry);
      }
    });
    return map;
  }, [habitData]);

  // Activity -> color palette index mapping (stable)
  const activityColorMap = useMemo(() => {
    const map = {};
    activeList.forEach((act, i) => {
      map[act] = ACTIVITY_COLORS[i % ACTIVITY_COLORS.length];
    });
    return map;
  }, [selfCareList]);

  // Monthly stats for selected activity
  const monthStats = useMemo(() => {
    const daysInMonth = currentMonth.daysInMonth();
    let performedDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
      const entry = entryMap.get(dateStr);
      if (entry && isActivityInEntry(entry, selectedActivity, activeList)) {
        performedDays++;
      }
    }
    return { performedDays, totalDays: daysInMonth };
  }, [currentMonth, entryMap, selectedActivity, activeList]);

  // Navigation
  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToToday = () => setCurrentMonth(dayjs().startOf("month"));

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day();
  const paddingSlots = Array.from({ length: startDayOfWeek });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const color = activityColorMap[selectedActivity] || ACTIVITY_COLORS[0];

  if (activeList.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-base-content/50 text-sm">
        No self-care habits configured.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Activity Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {activeList.map((activity, i) => {
          const c = activityColorMap[activity] || ACTIVITY_COLORS[0];
          const isActive = selectedActivity === activity;
          return (
            <button
              key={activity}
              onClick={() => setSelectedActivity(activity)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border ${
                isActive
                  ? `bg-base-200 ${c.text} ${c.border} shadow-sm`
                  : "bg-base-100 text-base-content/50 border-base-300/40 hover:border-base-300"
              }`}
            >
              <span className={`${isActive ? c.text : "text-base-content/40"}`}>
                {getHabitIcon(activity, 12)}
              </span>
              <span>{activity}</span>
              {isActive && (
                <span className={`text-[10px] font-bold px-1 py-0.5 rounded-md ${c.bg} ${c.text}`}>
                  {monthStats.performedDays}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Month Navigation Header */}
      <div className="flex flex-col gap-2 pb-2 border-b border-base-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Navigation buttons */}
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
          <div className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border font-medium ${color.bg} ${color.border} ${color.text}`}>
            <span className={`w-2 h-2 rounded-full ${color.dot}`} />
            <span>{monthStats.performedDays} / {monthStats.totalDays} days</span>
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
          {/* Padding slots */}
          {paddingSlots.map((_, idx) => (
            <div key={`pad-${idx}`} className="w-full aspect-square pointer-events-none" />
          ))}

          {/* Actual days */}
          {daysArray.map((day) => {
            const dayObj = currentMonth.date(day);
            const dateStr = dayObj.format("YYYY-MM-DD");
            const entry = entryMap.get(dateStr);
            const isPerformed = entry
              ? isActivityInEntry(entry, selectedActivity, activeList)
              : false;
            const isToday = dateStr === dayjs().format("YYYY-MM-DD");
            const isFuture = dayObj.isAfter(dayjs(), "day");

            return (
              <div
                key={dateStr}
                title={`${dateStr}${isPerformed ? ` — ${selectedActivity} ✓` : ""}`}
                className={`w-full aspect-square flex flex-col justify-between p-1 rounded-xl border transition-all relative overflow-hidden ${
                  isFuture
                    ? "opacity-20 bg-base-200/20 border-base-300/20 cursor-not-allowed"
                    : "bg-base-200/40 border-base-300/50"
                } ${
                  isToday
                    ? "ring-2 ring-primary/60"
                    : ""
                }`}
              >
                {/* Partial fill: bottom-up bar when performed */}
                {isPerformed && !isFuture && (
                  <div
                    className={`absolute bottom-0 inset-x-0 transition-all duration-300 ${color.bg} rounded-t-xs`}
                    style={{ height: "100%" }}
                  />
                )}

                {/* Day number */}
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

                {/* Bottom: checkmark or dash */}
                <div className="flex items-center justify-center w-full leading-none z-10 mt-auto">
                  {isPerformed ? (
                    <span className={`text-[9px] font-extrabold leading-none ${color.text}`}>
                      ✓
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
      <div className="flex items-center justify-center gap-3 text-[10px] text-base-content/70 flex-wrap pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-xs bg-base-200 border border-base-300" />
          <span>Not Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-xs ${color.dot}`} />
          <span>{selectedActivity} Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default SelfCareMonthCalendar;
