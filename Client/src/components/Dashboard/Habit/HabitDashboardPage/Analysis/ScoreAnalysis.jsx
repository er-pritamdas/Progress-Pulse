import React, { useMemo } from "react";
import { Award, Trophy, Target, Activity, Flame } from "lucide-react";
import dayjs from "dayjs";
import ScoreCalendar from "./ScoreCalendar";

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
      <div className="py-3 text-2xl text-warning font-semibold divider mb-8 flex items-center gap-2">
        <Trophy size={26} className="text-warning" />
        Score & Progress Analytics 🏆
      </div>

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

      {/* Score Calendar Section */}
      <section className="mt-6">
        <ScoreCalendar habitData={habitData} year={year} />
      </section>
    </div>
  );
};

export default ScoreAnalysis;
