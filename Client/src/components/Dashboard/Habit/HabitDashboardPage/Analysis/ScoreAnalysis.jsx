import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { Award, Trophy, Target, Activity, Flame, CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

const ScoreAnalysis = ({ habitData = [], fromDate, toDate }) => {
  // Compute analytics data
  const analytics = useMemo(() => {
    if (!habitData || habitData.length === 0) {
      return {
        avgScore: 0,
        avgProgress: 0,
        perfectDays: 0,
        scoreStatusCounts: { consistent: 0, moderate: 0, uncertain: 0, inconsistent: 0 },
        progressStatusCounts: { consistent: 0, moderate: 0, uncertain: 0, inconsistent: 0 },
        chartData: [],
      };
    }

    const sorted = [...habitData].sort((a, b) => new Date(a.date) - new Date(b.date));

    let totalScore = 0;
    let totalProgress = 0;
    let perfectDays = 0;

    const scoreStatusCounts = { consistent: 0, moderate: 0, uncertain: 0, inconsistent: 0 };
    const progressStatusCounts = { consistent: 0, moderate: 0, uncertain: 0, inconsistent: 0 };

    sorted.forEach((entry) => {
      const score = Number(entry.score) || 0;
      const progress = Number(entry.progress) || 0;

      totalScore += score;
      totalProgress += progress;
      if (score >= 7 || progress >= 100) perfectDays++;

      // Score status breakdown (Score out of 7: >=5.25 Consistent, >=3.5 Moderate, >=1.75 Uncertain, <1.75 Inconsistent)
      if (score >= 5.25) scoreStatusCounts.consistent++;
      else if (score >= 3.5) scoreStatusCounts.moderate++;
      else if (score >= 1.75) scoreStatusCounts.uncertain++;
      else scoreStatusCounts.inconsistent++;

      // Progress status breakdown (%: >=75 Consistent, >=50 Moderate, >=25 Uncertain, <25 Inconsistent)
      if (progress >= 75) progressStatusCounts.consistent++;
      else if (progress >= 50) progressStatusCounts.moderate++;
      else if (progress >= 25) progressStatusCounts.uncertain++;
      else progressStatusCounts.inconsistent++;
    });

    const count = sorted.length;
    return {
      avgScore: (totalScore / count).toFixed(1),
      avgProgress: Math.round(totalProgress / count),
      perfectDays,
      scoreStatusCounts,
      progressStatusCounts,
      chartData: sorted,
    };
  }, [habitData]);

  // Categories (dates)
  const categories = analytics.chartData.map((e) =>
    new Date(e.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })
  );

  // 🎯 Chart 1: Habit Score Area Chart Config (0 - 7)
  const scoreChartOptions = {
    chart: {
      type: "area",
      background: "transparent",
      toolbar: { show: true },
      zoom: { enabled: true },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      hover: { size: 7 },
    },
    colors: ["#EAB308"], // Yellow / Gold
    xaxis: {
      categories,
      labels: { style: { colors: "#9CA3AF" } },
    },
    yaxis: {
      title: { text: "Habit Score (0 - 7)", style: { color: "#EAB308" } },
      min: 0,
      max: 7,
      labels: { style: { colors: "#EAB308" } },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => `${val} / 7` },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 4,
    },
    annotations: {
      yaxis: [
        {
          y: 5.25,
          borderColor: "#10B981",
          strokeDashArray: 4,
          label: {
            borderColor: "#10B981",
            style: { color: "#FFFFFF", background: "#10B981", fontSize: "11px", fontWeight: "bold" },
            text: `Consistent (≥5.25) - ${analytics.scoreStatusCounts.consistent} days`,
          },
        },
        {
          y: 3.5,
          borderColor: "#3B82F6",
          strokeDashArray: 4,
          label: {
            borderColor: "#3B82F6",
            style: { color: "#FFFFFF", background: "#3B82F6", fontSize: "11px", fontWeight: "bold" },
            text: `Moderate (≥3.5) - ${analytics.scoreStatusCounts.moderate} days`,
          },
        },
        {
          y: 1.75,
          borderColor: "#F59E0B",
          strokeDashArray: 4,
          label: {
            borderColor: "#F59E0B",
            style: { color: "#FFFFFF", background: "#F59E0B", fontSize: "11px", fontWeight: "bold" },
            text: `Uncertain (≥1.75) - ${analytics.scoreStatusCounts.uncertain} days`,
          },
        },
      ],
    },
  };

  const scoreChartSeries = [
    {
      name: "Habit Score",
      data: analytics.chartData.map((e) => Number(e.score) || 0),
    },
  ];

  // 🎯 Chart 2: Progress Percentage Area Chart Config (0 - 100%)
  const progressChartOptions = {
    chart: {
      type: "area",
      background: "transparent",
      toolbar: { show: true },
      zoom: { enabled: true },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      hover: { size: 7 },
    },
    colors: ["#10B981"], // Emerald Green
    xaxis: {
      categories,
      labels: { style: { colors: "#9CA3AF" } },
    },
    yaxis: {
      title: { text: "Progress (%)", style: { color: "#10B981" } },
      min: 0,
      max: 100,
      labels: { style: { colors: "#10B981" } },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (val) => `${val}%` },
    },
    grid: {
      borderColor: "#374151",
      strokeDashArray: 4,
    },
    annotations: {
      yaxis: [
        {
          y: 75,
          borderColor: "#10B981",
          strokeDashArray: 4,
          label: {
            borderColor: "#10B981",
            style: { color: "#FFFFFF", background: "#10B981", fontSize: "11px", fontWeight: "bold" },
            text: `Consistent (≥75%) - ${analytics.progressStatusCounts.consistent} days`,
          },
        },
        {
          y: 50,
          borderColor: "#3B82F6",
          strokeDashArray: 4,
          label: {
            borderColor: "#3B82F6",
            style: { color: "#FFFFFF", background: "#3B82F6", fontSize: "11px", fontWeight: "bold" },
            text: `Moderate (≥50%) - ${analytics.progressStatusCounts.moderate} days`,
          },
        },
        {
          y: 25,
          borderColor: "#F59E0B",
          strokeDashArray: 4,
          label: {
            borderColor: "#F59E0B",
            style: { color: "#FFFFFF", background: "#F59E0B", fontSize: "11px", fontWeight: "bold" },
            text: `Uncertain (≥25%) - ${analytics.progressStatusCounts.uncertain} days`,
          },
        },
      ],
    },
  };

  const progressChartSeries = [
    {
      name: "Progress %",
      data: analytics.chartData.map((e) => Number(e.progress) || 0),
    },
  ];

  return (
    <div className="mb-12 animate-fade-in-up">
      {/* Section Divider */}
      <div className="py-3 text-2xl text-warning font-semibold divider mb-8 flex items-center gap-2">
        <Trophy size={26} className="text-warning" />
        Score & Progress Analysis
      </div>

      {/* Overview Cards */}
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
          <p className="text-xs text-base-content/60 mt-1">Average habits target met daily</p>
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
          <p className="text-xs text-base-content/60 mt-1">Overall completion percentage</p>
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

        {/* Top Status */}
        <div className="bg-base-100 rounded-2xl shadow-md p-5 border border-base-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-base-content/70">Consistency Days</span>
            <Activity className="text-info" size={22} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-info">
              {analytics.progressStatusCounts.consistent}
            </span>
            <span className="text-sm text-base-content/60">/ {habitData.length} days</span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">Days marked as Consistent (≥75%)</p>
        </div>
      </div>

      {/* 📊 STACKED GRAPH 1: Daily Habit Score Trend */}
      <div className="w-full bg-base-100 rounded-2xl shadow-md p-6 border border-base-300 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award size={20} className="text-warning" />
            Daily Habit Score Trend (0 - 7)
          </h3>
          {/* Level Days Counters for Score */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="badge badge-success gap-1 text-slate-950 font-bold p-2.5">
              <CheckCircle size={13} /> Consistent: {analytics.scoreStatusCounts.consistent} days
            </span>
            <span className="badge badge-info gap-1 text-slate-950 font-bold p-2.5">
              <Clock size={13} /> Moderate: {analytics.scoreStatusCounts.moderate} days
            </span>
            <span className="badge badge-warning gap-1 text-slate-950 font-bold p-2.5">
              <AlertCircle size={13} /> Uncertain: {analytics.scoreStatusCounts.uncertain} days
            </span>
            <span className="badge badge-error gap-1 text-white font-bold p-2.5">
              <XCircle size={13} /> Inconsistent: {analytics.scoreStatusCounts.inconsistent} days
            </span>
          </div>
        </div>
        <Chart options={scoreChartOptions} series={scoreChartSeries} type="area" height={320} />
      </div>

      {/* 📊 STACKED GRAPH 2: Daily Progress Percentage Trend */}
      <div className="w-full bg-base-100 rounded-2xl shadow-md p-6 border border-base-300 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target size={20} className="text-success" />
            Daily Progress Percentage Trend (0 - 100%)
          </h3>
          {/* Level Days Counters for Progress */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="badge badge-success gap-1 text-slate-950 font-bold p-2.5">
              <CheckCircle size={13} /> Consistent (≥75%): {analytics.progressStatusCounts.consistent} days
            </span>
            <span className="badge badge-info gap-1 text-slate-950 font-bold p-2.5">
              <Clock size={13} /> Moderate (50-74%): {analytics.progressStatusCounts.moderate} days
            </span>
            <span className="badge badge-warning gap-1 text-slate-950 font-bold p-2.5">
              <AlertCircle size={13} /> Uncertain (25-49%): {analytics.progressStatusCounts.uncertain} days
            </span>
            <span className="badge badge-error gap-1 text-white font-bold p-2.5">
              <XCircle size={13} /> Inconsistent (&lt;25%): {analytics.progressStatusCounts.inconsistent} days
            </span>
          </div>
        </div>
        <Chart options={progressChartOptions} series={progressChartSeries} type="area" height={320} />
      </div>
    </div>
  );
};

export default ScoreAnalysis;
