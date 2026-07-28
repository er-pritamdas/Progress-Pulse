import React from "react";
import Chart from "react-apexcharts";
import { Info, Sparkles, Calendar, Activity, TrendingUp, Target } from "lucide-react";

function NutrientGraphCard({ nutrient, dailyData = [], totalDays = 1, onOpenWiki, showGraph = true }) {
  const Icon = nutrient.icon || Sparkles;

  // Calculate statistics
  const values = dailyData.map((d) => d.value || 0);
  const totalConsumed = values.reduce((sum, val) => sum + val, 0);
  const formattedTotal =
    nutrient.id === "calories" || nutrient.id === "water"
      ? Math.round(totalConsumed).toLocaleString()
      : parseFloat(totalConsumed.toFixed(1)).toLocaleString();

  // Count days where food/intake was actually logged
  const loggedDaysCount = dailyData.filter((d) => d.hasLog || (d.value || 0) > 0).length;

  // Daily average calculated based on logged days (or 0 if no days logged)
  const avgValue = loggedDaysCount > 0 ? totalConsumed / loggedDaysCount : 0;
  const formattedAvg =
    nutrient.id === "calories" || nutrient.id === "water"
      ? Math.round(avgValue).toLocaleString()
      : parseFloat(avgValue.toFixed(1)).toLocaleString();

  const maxTarget = nutrient.maxTarget || 0;
  const minTarget = nutrient.minTarget || 0;

  // Progress vs Max Target (based on daily average vs max target)
  const progressPct = maxTarget > 0 ? Math.min(100, Math.round((avgValue / maxTarget) * 100)) : 0;

  // Progress Bar color status
  const getProgressColor = () => {
    if (minTarget > 0 && avgValue < minTarget) return "bg-warning";
    if (maxTarget > 0 && avgValue > maxTarget) return "bg-error";
    return "bg-success";
  };

  // ApexChart Configuration
  const categories = dailyData.map((d) => d.formattedDate || d.date);

  const series = [
    {
      name: `${nutrient.label} Intake`,
      type: "area",
      data: values,
    },
  ];

  const strokeWidths = [3];
  const dashArrays = [0];
  const seriesColors = [nutrient.colorHex || "#6366f1"];

  if (avgValue > 0) {
    series.push({
      name: "Daily Average",
      type: "line",
      data: dailyData.map(() =>
        nutrient.id === "calories" || nutrient.id === "water"
          ? Math.round(avgValue)
          : parseFloat(avgValue.toFixed(1))
      ),
    });
    strokeWidths.push(2);
    dashArrays.push(3);
    seriesColors.push("#a855f7"); // Soft Purple for Daily Average Line
  }

  if (maxTarget > 0) {
    series.push({
      name: "Max Target",
      type: "line",
      data: dailyData.map(() => maxTarget),
    });
    strokeWidths.push(2);
    dashArrays.push(5);
    seriesColors.push("#f87171"); // Soft Red
  }

  if (minTarget > 0) {
    series.push({
      name: "Min Target",
      type: "line",
      data: dailyData.map(() => minTarget),
    });
    strokeWidths.push(2);
    dashArrays.push(4);
    seriesColors.push("#38bdf8"); // Soft Cyan
  }

  const chartOptions = {
    chart: {
      type: "line",
      height: 280,
      background: "transparent",
      toolbar: {
        show: false,
      },
      zoom: { enabled: false },
    },
    stroke: {
      width: strokeWidths,
      curve: "smooth",
      dashArray: dashArrays,
    },
    fill: {
      type: series.map((s) => (s.type === "area" ? "gradient" : "solid")),
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 0.5,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    colors: seriesColors,
    markers: {
      size: series.map((s, idx) => (idx === 0 ? 5 : 0)),
      strokeColors: "#1e293b",
      strokeWidth: 2,
      hover: { size: 7 },
    },
    xaxis: {
      categories,
      labels: {
        style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 500 },
        rotate: -30,
      },
      axisBorder: { color: "#475569" },
      axisTicks: { color: "#475569" },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 500 },
        formatter: (val) =>
          nutrient.id === "calories" || nutrient.id === "water"
            ? `${Math.round(val)}`
            : `${parseFloat(val.toFixed(1))}`,
      },
      title: {
        text: nutrient.unit ? `${nutrient.label} (${nutrient.unit})` : nutrient.label,
        style: { color: "#cbd5e1", fontSize: "11px", fontWeight: 600 },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#cbd5e1" },
      fontSize: "12px",
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `${val} ${nutrient.unit}`,
      },
    },
    grid: {
      show: true,
      borderColor: "#334155",
      strokeDashArray: 3,
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 230 },
        },
      },
    ],
  };

  return (
    <div className="bg-base-100 rounded-3xl border border-base-300 shadow-md p-5 flex flex-col justify-between hover:border-primary/40 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl bg-base-200 border border-base-300 ${nutrient.color || "text-primary"}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-base-content">{nutrient.label}</h3>
              {nutrient.isMacro && (
                <span className="badge badge-xs badge-primary font-semibold">Macro</span>
              )}
            </div>
            <p className="text-xs text-base-content/60 font-medium">
              Daily Target: {maxTarget > 0 ? `${maxTarget} ${nutrient.unit}` : "N/A"}
              {minTarget > 0 && ` (Min: ${minTarget} ${nutrient.unit})`}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-circle btn-sm text-info hover:bg-info/10"
          title={`Learn more about ${nutrient.label}`}
          onClick={() => onOpenWiki(nutrient)}
        >
          <Info size={18} />
        </button>
      </div>

      {/* Summary Panels */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 ${showGraph ? "mb-4" : "mb-0"}`}>
        {/* Total Consumed Panel */}
        <div className="bg-base-200/70 p-3 rounded-2xl border border-base-300/60 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-base-content/60 flex items-center gap-1">
            <Activity size={13} className="text-primary" /> Total Consumed
          </div>
          <div className="mt-1">
            <span className="text-lg font-extrabold text-base-content tracking-tight">
              {formattedTotal}
            </span>
            <span className="text-xs font-semibold text-base-content/60 ml-1">
              {nutrient.unit}
            </span>
          </div>
        </div>

        {/* Days Logged Panel */}
        <div className="bg-base-200/70 p-3 rounded-2xl border border-base-300/60 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-base-content/60 flex items-center gap-1">
            <Calendar size={13} className="text-info" /> Days Logged
          </div>
          <div className="mt-1">
            <span className="text-lg font-extrabold text-base-content tracking-tight">
              {loggedDaysCount}/{totalDays}
            </span>
            <span className="text-xs font-semibold text-base-content/60 ml-1">Days</span>
          </div>
        </div>

        {/* Average Panel */}
        <div className="bg-base-200/70 p-3 rounded-2xl border border-base-300/60 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-base-content/60 flex items-center gap-1">
            <TrendingUp size={13} className="text-accent" /> Daily Average
          </div>
          <div className="mt-1">
            <span className="text-lg font-extrabold text-base-content tracking-tight">
              {formattedAvg}
            </span>
            <span className="text-xs font-semibold text-base-content/60 ml-1">
              {nutrient.unit}/d
            </span>
          </div>
        </div>

        {/* Consumed vs Max Progress Panel */}
        <div className="bg-base-200/70 p-3 rounded-2xl border border-base-300/60 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-base-content/60 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Target size={13} className="text-warning" /> Avg vs Max
            </span>
            {maxTarget > 0 && (
              <span className="font-bold text-[10px] text-base-content/80">
                {progressPct}%
              </span>
            )}
          </div>

          <div className="mt-1 space-y-1">
            {maxTarget > 0 ? (
              <>
                <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${getProgressColor()}`}
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-base-content/60 font-medium truncate">
                  {formattedAvg} / {maxTarget} {nutrient.unit}
                </div>
              </>
            ) : (
              <span className="text-xs font-semibold text-base-content/50">No Limit</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {showGraph && (
        <div className="w-full pt-1">
          <Chart options={chartOptions} series={series} type="line" height={260} />
        </div>
      )}
    </div>
  );
}

export default NutrientGraphCard;
