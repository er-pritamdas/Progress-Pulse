import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Smile, Frown, Meh, Angry, BatteryLow, Coffee, PartyPopper, AlertCircle, Zap } from "lucide-react";

/**
 * MoodMonthCalendar
 *
 * Phone-only monthly calendar view for Mood Analysis.
 * Shows tabs for All moods + each individual mood.
 * Each day square is colored with the mood color when a mood was recorded.
 */

// Semantic mood color lookup (returns a tailwind-safe hex)
const getSemanticMoodColor = (moodName) => {
  if (!moodName || moodName === "All") return "#374151";
  const lower = moodName.toLowerCase();
  if (lower.includes("good") || lower.includes("happy")) return "#10B981";
  if (lower.includes("amazing") || lower.includes("great")) return "#3B82F6";
  if (lower.includes("average") || lower.includes("okay") || lower.includes("neutral")) return "#FBBF24";
  if (lower.includes("bad") || lower.includes("sad")) return "#EF4444";
  if (lower.includes("depressed")) return "#7F1D1D";
  if (lower.includes("productive")) return "#8B5CF6";
  if (lower.includes("excited")) return "#EC4899";
  if (lower.includes("tired") || lower.includes("exhausted")) return "#9CA3AF";
  if (lower.includes("relaxed") || lower.includes("calm")) return "#06B6D4";
  if (lower.includes("stressed") || lower.includes("anxious")) return "#F59E0B";
  return "#6B7280";
};

// Helper for contrast text color given a hex
const getTextColor = (hex) => {
  if (!hex) return "#ffffff";
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
};

// Helper icon for mood
const getMoodIcon = (moodName, size = 12) => {
  if (moodName === "All") return <Zap size={size} />;
  if (!moodName) return <Zap size={size} />;
  const lower = moodName.toLowerCase();
  if (lower.includes("happy") || lower.includes("good")) return <Smile size={size} />;
  if (lower.includes("sad") || lower.includes("bad")) return <Frown size={size} />;
  if (lower.includes("average") || lower.includes("okay") || lower.includes("neutral")) return <Meh size={size} />;
  if (lower.includes("angry")) return <Angry size={size} />;
  if (lower.includes("tired") || lower.includes("exhausted")) return <BatteryLow size={size} />;
  if (lower.includes("relaxed") || lower.includes("calm")) return <Coffee size={size} />;
  if (lower.includes("excited") || lower.includes("amazing")) return <PartyPopper size={size} />;
  if (lower.includes("stressed") || lower.includes("anxious")) return <AlertCircle size={size} />;
  return <Zap size={size} />;
};

const MoodMonthCalendar = ({ habitData = [], moodList = [], moodColors = {} }) => {
  const tabs = ["All", ...moodList.filter(Boolean)];

  const [selectedMood, setSelectedMood] = useState("All");

  // Sync if moodList changes
  useEffect(() => {
    if (selectedMood !== "All" && !moodList.includes(selectedMood)) {
      setSelectedMood("All");
    }
  }, [moodList]);

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

  // Fast map: YYYY-MM-DD -> mood string
  const entryMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(habitData)) return map;
    habitData.forEach((entry) => {
      if (entry?.date && entry.mood && entry.mood !== "---") {
        map.set(dayjs(entry.date).format("YYYY-MM-DD"), entry.mood);
      }
    });
    return map;
  }, [habitData]);

  // Monthly stats for selected mood
  const monthStats = useMemo(() => {
    const daysInMonth = currentMonth.daysInMonth();
    let recorded = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = currentMonth.date(day).format("YYYY-MM-DD");
      const mood = entryMap.get(dateStr);
      if (mood) {
        if (selectedMood === "All" || mood === selectedMood) recorded++;
      }
    }
    return { recorded, totalDays: daysInMonth };
  }, [currentMonth, entryMap, selectedMood]);

  // Navigation
  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const goToToday = () => setCurrentMonth(dayjs().startOf("month"));

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf("month").day();
  const paddingSlots = Array.from({ length: startDayOfWeek });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Resolved color for selected mood tab
  const selectedColor =
    selectedMood === "All"
      ? "#6366f1" // indigo for "All"
      : moodColors[selectedMood] || getSemanticMoodColor(selectedMood);

  const selectedTextColor = getTextColor(selectedColor);

  if (moodList.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-base-content/50 text-sm">
        No moods configured.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Mood Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((mood) => {
          const isActive = selectedMood === mood;
          const color =
            mood === "All"
              ? "#6366f1"
              : moodColors[mood] || getSemanticMoodColor(mood);
          const textCol = getTextColor(color);

          return (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              style={
                isActive
                  ? { borderColor: color, color: color }
                  : {}
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 border ${
                isActive
                  ? "bg-base-200 shadow-sm"
                  : "bg-base-100 text-base-content/50 border-base-300/40 hover:border-base-300"
              }`}
            >
              <span>{getMoodIcon(mood, 12)}</span>
              <span>{mood}</span>
              {isActive && (
                <span
                  className="text-[10px] font-bold px-1 py-0.5 rounded-md"
                  style={{ backgroundColor: color + "33", color: color }}
                >
                  {monthStats.recorded}
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
              backgroundColor: selectedColor + "22",
              borderColor: selectedColor + "60",
              color: selectedColor,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedColor }}
            />
            <span>
              {monthStats.recorded} / {monthStats.totalDays} days
            </span>
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
            const dayObj = currentMonth.date(day);
            const dateStr = dayObj.format("YYYY-MM-DD");
            const mood = entryMap.get(dateStr);
            const isMatch = mood && (selectedMood === "All" || mood === selectedMood);
            const isToday = dateStr === dayjs().format("YYYY-MM-DD");
            const isFuture = dayObj.isAfter(dayjs(), "day");

            const moodColor = isMatch
              ? moodColors[mood] || getSemanticMoodColor(mood)
              : null;
            const moodText = moodColor ? getTextColor(moodColor) : null;

            return (
              <div
                key={dateStr}
                title={`${dateStr}${mood ? ` — ${mood}` : ""}`}
                className={`w-full aspect-square flex flex-col justify-between p-1 rounded-xl border transition-all relative overflow-hidden ${
                  isFuture
                    ? "opacity-20 bg-base-200/20 border-base-300/20 cursor-not-allowed"
                    : "bg-base-200/40 border-base-300/50"
                } ${isToday ? "ring-2 ring-primary/60" : ""}`}
              >
                {/* Full fill when mood matches */}
                {isMatch && moodColor && (
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{ backgroundColor: moodColor + "40" }}
                  />
                )}

                {/* Day number */}
                <div className="flex items-center justify-between w-full leading-none z-10">
                  <span
                    className={`text-[11px] font-bold leading-none ${
                      isToday ? "text-primary font-black" : "text-base-content/85"
                    }`}
                    style={isMatch && moodColor ? { color: moodColor } : {}}
                  >
                    {day}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  )}
                </div>

                {/* Bottom: mood emoji / dash */}
                <div className="flex items-center justify-center w-full leading-none z-10 mt-auto">
                  {isMatch ? (
                    <span
                      className="text-[9px] font-extrabold leading-none"
                      style={{ color: moodColor }}
                    >
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
          <span>No mood</span>
        </div>
        {selectedMood === "All"
          ? moodList.slice(0, 4).map((mood) => {
              const c = moodColors[mood] || getSemanticMoodColor(mood);
              return (
                <div key={mood} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: c }} />
                  <span>{mood}</span>
                </div>
              );
            })
          : (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-xs"
                style={{ backgroundColor: selectedColor }}
              />
              <span>{selectedMood} recorded</span>
            </div>
          )}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default MoodMonthCalendar;
