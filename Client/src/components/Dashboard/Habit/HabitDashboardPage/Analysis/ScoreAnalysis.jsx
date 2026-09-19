import React, { useMemo } from "react";
import { Award, Trophy, Target, Activity, Flame } from "lucide-react";
import dayjs from "dayjs";
import ScoreCalendar from "./ScoreCalendar";
import ScoreMonthCalendar from "./ScoreMonthCalendar";

const ScoreAnalysis = ({ habitData = [], fromDate, toDate }) => {
  // Compute analytics metrics
  const analytics = useMemo(() => {
    if (!habitData || habitData.length === 0) {
      return {
        avgScore: 0,
        avgProgress: 0,
        perfectDays: 0,
        consistentDays: 0,
      };
    }

    let totalScore = 0;
    let totalProgress = 0;
    let perfectDays = 0;
    let consistentDays = 0;

    habitData.forEach((entry) => {
      const score = Number(entry.score) || 0;
      const progress = Number(entry.progress) || 0;

      totalScore += score;
      totalProgress += progress;

      if (score >= 7 || progress >= 100) perfectDays++;
      if (progress >= 75 || score >= 5.25) consistentDays++;
    });

    const count = habitData.length;
    return {
      avgScore: (totalScore / count).toFixed(1),
      avgProgress: Math.round(totalProgress / count),
      perfectDays,
      consistentDays,
    };
  }, [habitData]);

  const year = fromDate ? dayjs(fromDate).year() : dayjs().year();

  return (
    <div className="mb-12 animate-fade-in-up">
      {/* Section Header */}
      <div className="py-3 text-xl md:text-2xl text-warning font-semibold divider mb-6 md:mb-8 flex items-center gap-2">
        <Trophy size={24} className="text-warning" />
        Score &amp; Progress Analytics 🏆
      </div>

      {/* ── Desktop View (100% Original) ── */}
      <div className="hidden md:block">
        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Average Score */}
          <div className="bg-base-100 rounded-2xl shadow-md p-5 border border-base-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-base-content/70">Avg Habit Score</span>
              <Award className="text-warning" size={22} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-warning">{analytics.avgScore}</span>
              <span className="text-sm text-base-content/60">/ 7</span>
            </div>
            <p className="text-xs text-base-content/60 mt-1">Average daily score target met</p>
          </div>

          {/* Average Progress */}
          <div className="bg-base-100 rounded-2xl shadow-md p-5 border border-base-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-base-content/70">Avg Progress</span>
              <Target className="text-success" size={22} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-success">{analytics.avgProgress}%</span>
            </div>
            <p className="text-xs text-base-content/60 mt-1">Overall daily completion percentage</p>
          </div>

          {/* Perfect Days */}
          <div className="bg-base-100 rounded-2xl shadow-md p-5 border border-base-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-base-content/70">Perfect Score Days</span>
              <Flame className="text-error" size={22} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-error">{analytics.perfectDays}</span>
              <span className="text-sm text-base-content/60">days</span>
            </div>
            <p className="text-xs text-base-content/60 mt-1">Days with 100% completion</p>
          </div>

          {/* Consistency Days */}
          <div className="bg-base-100 rounded-2xl shadow-md p-5 border border-base-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-base-content/70">Consistent Days</span>
              <Activity className="text-info" size={22} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-info">{analytics.consistentDays}</span>
              <span className="text-sm text-base-content/60">/ {habitData.length} days</span>
            </div>
            <p className="text-xs text-base-content/60 mt-1">Days marked as Consistent (≥75%)</p>
          </div>
        </div>

        {/* Score Year Calendar (Desktop) */}
        <section className="mt-6">
          <ScoreCalendar habitData={habitData} year={year} />
        </section>
      </div>

      {/* ── Phone View (< md) ── */}
      <div className="block md:hidden space-y-4">

        {/* 2×2 Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Avg Habit Score */}
          <div className="bg-base-100 rounded-2xl shadow-sm p-4 border border-base-300/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-base-content/60">Avg Score</span>
              <Award className="text-warning" size={18} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-warning">{analytics.avgScore}</span>
              <span className="text-xs text-base-content/50">/ 7</span>
            </div>
            <p className="text-[10px] text-base-content/50 mt-1">Daily score avg</p>
          </div>

          {/* Avg Progress */}
          <div className="bg-base-100 rounded-2xl shadow-sm p-4 border border-base-300/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-base-content/60">Avg Progress</span>
              <Target className="text-success" size={18} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-success">{analytics.avgProgress}%</span>
            </div>
            <p className="text-[10px] text-base-content/50 mt-1">Daily completion</p>
          </div>

          {/* Perfect Score Days */}
          <div className="bg-base-100 rounded-2xl shadow-sm p-4 border border-base-300/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-base-content/60">Perfect Days</span>
              <Flame className="text-error" size={18} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-error">{analytics.perfectDays}</span>
              <span className="text-xs text-base-content/50">days</span>
            </div>
            <p className="text-[10px] text-base-content/50 mt-1">100% completion</p>
          </div>

          {/* Consistent Days */}
          <div className="bg-base-100 rounded-2xl shadow-sm p-4 border border-base-300/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-base-content/60">Consistent</span>
              <Activity className="text-info" size={18} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-info">{analytics.consistentDays}</span>
              <span className="text-xs text-base-content/50">/ {habitData.length}</span>
            </div>
            <p className="text-[10px] text-base-content/50 mt-1">≥75% days</p>
          </div>
        </div>

        {/* Score Month Calendar (Self-Care style, no Score Levels sidebar) */}
        <div className="bg-base-100 rounded-2xl shadow-sm p-3">
          <ScoreMonthCalendar habitData={habitData} />
        </div>
      </div>
    </div>
  );
};

export default ScoreAnalysis;

