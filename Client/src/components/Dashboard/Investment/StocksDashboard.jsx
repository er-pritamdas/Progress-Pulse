import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  TableProperties,
  Layers,
  Coins,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Building2,
  Sparkles,
  Filter,
  CheckCircle2,
  Wallet,
  Landmark,
  PiggyBank,
  Percent,
  ChevronDown,
  ExternalLink,
  ChevronUp,
  ChevronsUpDown,
  Zap,
  PackageCheck
} from "lucide-react";
import { Link } from "react-router-dom";

// Vibrant Palette for Apex Pie Charts
const PIE_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#ef4444", // Rose/Red
  "#84cc16", // Lime
  "#a855f7", // Fuchsia
  "#0284c7", // Sky
  "#eab308", // Yellow
];

const CAP_COLORS = {
  Large: "#10b981", // Emerald
  Mid: "#6366f1",   // Indigo
  Small: "#f59e0b", // Amber
};

const formatCurrency2Dec = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCurrencyCompact = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)} K`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

export default function StocksDashboard({
  stocksData = [],
  loading = false,
  fromYear,
  fromMonth,
  toYear,
  toMonth,
  activeSubView = "demat",
  onSubViewChange,
}) {
  // Derive subView directly from activeSubView prop or fallback to internal state
  const [internalSubView, setInternalSubView] = useState(() => {
    return activeSubView || localStorage.getItem("pulse_inv_dash_stock_view") || "demat";
  });

  const subView = activeSubView || internalSubView;

  const handleSwitchSubView = (newView) => {
    setInternalSubView(newView);
    localStorage.setItem("pulse_inv_dash_stock_view", newView);
    if (onSubViewChange) onSubViewChange(newView);
  };

  // Sync internal subView if external activeSubView changes
  React.useEffect(() => {
    if (activeSubView && activeSubView !== internalSubView) {
      setInternalSubView(activeSubView);
    }
  }, [activeSubView]);

  // Main Tab Navigation: "table" | "chart" (defaults to "table")
  const [activeMainTab, setActiveMainTab] = useState(() => {
    return localStorage.getItem("pulse_stocks_dash_tab") || "table";
  });

  const handleTabChange = (tab) => {
    setActiveMainTab(tab);
    localStorage.setItem("pulse_stocks_dash_tab", tab);
  };

  // Metric for Pie Chart tab: "capital" | "quantity"
  const [pieMetric, setPieMetric] = useState("capital");

  // Search filter specifically for the stack of names
  const [stackSearchQuery, setStackSearchQuery] = useState("");

  // Chart type: "donut" | "pie"
  const [chartType, setChartType] = useState("donut");

  // Chart aggregation dimension: "stock" (per stock) | "cap" (by Market Cap)
  const [chartDimension, setChartDimension] = useState("stock");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCap, setSelectedCap] = useState("all"); // "all" | "Large" | "Mid" | "Small"

  // Table Sorting
  const [sortField, setSortField] = useState("default");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // 1. Separate stocks into 3 categories according to business rules:
  // A. Demat Holdings: Any stock which has some quantity held (qLeft > 0)
  const allDematStocks = useMemo(() => {
    return (stocksData || []).filter((s) => Number(s.qLeft) > 0);
  }, [stocksData]);

  // B. Delivery Analysis: Stocks whose period bought and sold > 1 day and all quantity is 0 (qLeft <= 0)
  const allDeliveryStocks = useMemo(() => {
    return (stocksData || []).filter((s) => {
      const isIntradayTerm = (s.term || "").toLowerCase() === "intraday";
      if (isIntradayTerm) return false;
      const qLeft = Number(s.qLeft) || 0;
      const period = Number(s.period) || (s.sDate && s.sDate !== "-" && s.bDate ? dayjs(s.sDate).diff(dayjs(s.bDate), "day") : 0);
      return qLeft <= 0 && period > 1;
    });
  }, [stocksData]);

  // C. Intraday Analysis: Intraday trades (term === "Intraday" or same-day exit period <= 1 and sold)
  const allIntradayStocks = useMemo(() => {
    return (stocksData || []).filter((s) => {
      const isIntradayTerm = (s.term || "").toLowerCase() === "intraday";
      if (isIntradayTerm) return true;
      const qLeft = Number(s.qLeft) || 0;
      const period = Number(s.period) || (s.sDate && s.sDate !== "-" && s.bDate ? dayjs(s.sDate).diff(dayjs(s.bDate), "day") : 0);
      return qLeft <= 0 && s.sDate && s.sDate !== "-" && period <= 1;
    });
  }, [stocksData]);

  // Determine current active pool based on selected subView
  const currentPool = useMemo(() => {
    if (subView === "delivery") return allDeliveryStocks;
    if (subView === "intraday") return allIntradayStocks;
    return allDematStocks; // default "demat"
  }, [subView, allDematStocks, allDeliveryStocks, allIntradayStocks]);

  // Filter current pool by search and cap
  const filteredStocks = useMemo(() => {
    return currentPool.filter((stock) => {
      // Market Cap filter
      if (selectedCap !== "all" && stock.cap !== selectedCap) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (stock.name || "").toLowerCase().includes(q);
        const matchesCap = (stock.cap || "").toLowerCase().includes(q);
        const matchesExchange = (stock.exchange || "").toLowerCase().includes(q);
        const matchesPlatform = (stock.platform || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCap && !matchesExchange && !matchesPlatform) {
          return false;
        }
      }

      return true;
    });
  }, [currentPool, selectedCap, searchQuery, subView]);

  // Sorted Stocks for Table
  const sortedStocks = useMemo(() => {
    if (sortField === "default") return filteredStocks;
    return [...filteredStocks].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Computed values for custom fields
      if (sortField === "bShare") {
        valA = Number(a.bShare) || Number(a.bFShare) || 0;
        valB = Number(b.bShare) || Number(b.bFShare) || 0;
      } else if (sortField === "periodFromToday") {
        valA = a.bDate ? dayjs().diff(dayjs(a.bDate), "day") : 0;
        valB = b.bDate ? dayjs().diff(dayjs(b.bDate), "day") : 0;
      } else if (sortField === "holdingCapital") {
        const qtyA = subView === "demat" ? (Number(a.qLeft) || 0) : (Number(a.sQty) || Number(a.bQty) || 0);
        const qtyB = subView === "demat" ? (Number(b.qLeft) || 0) : (Number(b.sQty) || Number(b.bQty) || 0);
        const priceA = Number(a.bShare) || Number(a.bFShare) || 0;
        const priceB = Number(b.bShare) || Number(b.bFShare) || 0;
        valA = qtyA * priceA;
        valB = qtyB * priceB;
      }

      if (typeof valA === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDirection === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
  }, [filteredStocks, sortField, sortDirection, subView]);

  // --------------------------------------------------------------------------
  // KPI Aggregations
  // --------------------------------------------------------------------------
  const kpiData = useMemo(() => {
    let totalInvestedCapital = 0;
    let totalQuantity = 0;
    let totalRealizedGain = 0;
    let profitableCount = 0;
    let lossCount = 0;
    let totalHoldingDays = 0;

    filteredStocks.forEach((s) => {
      const q = subView === "demat" ? Number(s.qLeft) || 0 : Number(s.sQty) || Number(s.bQty) || 0;
      const bPrice = Number(s.bShare) || Number(s.bFShare) || 0;
      const cap = q * bPrice;

      totalInvestedCapital += cap;
      totalQuantity += q;
      totalRealizedGain += Number(s.gainRs) || 0;

      if ((Number(s.gainRs) || 0) > 0) profitableCount++;
      else if ((Number(s.gainRs) || 0) < 0) lossCount++;

      if (subView === "demat") {
        const days = s.bDate ? dayjs().diff(dayjs(s.bDate), "day") : 0;
        totalHoldingDays += isNaN(days) ? 0 : Math.max(0, days);
      } else {
        totalHoldingDays += Number(s.period) || 0;
      }
    });

    const count = filteredStocks.length;
    const avgHoldingDays = count > 0 ? Math.round(totalHoldingDays / count) : 0;
    const winRate = count > 0 ? ((profitableCount / count) * 100).toFixed(1) : "0.0";
    const gainPctOverall = totalInvestedCapital > 0 ? ((totalRealizedGain / totalInvestedCapital) * 100).toFixed(2) : "0.00";

    // Cap Distribution
    const capDistribution = { Large: 0, Mid: 0, Small: 0 };
    filteredStocks.forEach((s) => {
      const c = s.cap || "Large";
      if (capDistribution[c] !== undefined) {
        capDistribution[c]++;
      }
    });

    return {
      count,
      totalInvestedCapital,
      totalQuantity,
      totalRealizedGain,
      gainPctOverall,
      profitableCount,
      lossCount,
      winRate,
      avgHoldingDays,
      capDistribution,
    };
  }, [filteredStocks, subView]);

  // --------------------------------------------------------------------------
  // Unified Data for Pie Chart & Stack of Names (Driven by pieMetric)
  // --------------------------------------------------------------------------
  const unifiedChartData = useMemo(() => {
    const isCapital = pieMetric === "capital";

    if (chartDimension === "cap") {
      // Group by Market Cap (Large, Mid, Small)
      const capMap = { Large: 0, Mid: 0, Small: 0 };
      filteredStocks.forEach((s) => {
        const q = subView === "demat" ? Number(s.qLeft) || 0 : Number(s.sQty) || Number(s.bQty) || 0;
        const bPrice = Number(s.bShare) || Number(s.bFShare) || 0;
        const val = isCapital ? q * bPrice : q;
        const c = s.cap || "Large";
        if (capMap[c] !== undefined) capMap[c] += val;
        else capMap[c] = val;
      });

      const totalVal = Object.values(capMap).reduce((a, b) => a + b, 0);
      const items = Object.entries(capMap)
        .map(([k, v]) => {
          const numVal = isCapital ? Math.round(Number(v || 0) * 100) / 100 : Math.round(Number(v || 0));
          return {
            name: `${k} Cap`,
            cap: k,
            value: numVal,
            pct: totalVal > 0 ? ((numVal / totalVal) * 100).toFixed(1) : "0.0",
            color: CAP_COLORS[k] || "#3b82f6",
          };
        })
        .filter((item) => item.value > 0);

      const series = items.map((i) => i.value);
      const labels = items.map((i) => i.name);
      const colors = items.map((i) => i.color);

      return { items, series, labels, colors, totalVal, isCapital };
    }

    // Group by Stock Name
    const stockMap = {};
    const stockCapMap = {};
    filteredStocks.forEach((s) => {
      const q = subView === "demat" ? Number(s.qLeft) || 0 : Number(s.sQty) || Number(s.bQty) || 0;
      const bPrice = Number(s.bShare) || Number(s.bFShare) || 0;
      const val = isCapital ? q * bPrice : q;
      const name = s.name || "Unknown";
      stockMap[name] = (stockMap[name] || 0) + val;
      if (!stockCapMap[name]) {
        stockCapMap[name] = s.cap || "Large";
      }
    });

    const totalVal = Object.values(stockMap).reduce((a, b) => a + b, 0);
    const sortedEntries = Object.entries(stockMap)
      .filter((e) => Number(e[1]) > 0)
      .sort((a, b) => b[1] - a[1]);

    const items = sortedEntries.map(([name, val], idx) => {
      const numVal = isCapital ? Math.round(Number(val || 0) * 100) / 100 : Math.round(Number(val || 0));
      return {
        name,
        cap: stockCapMap[name] || "Large",
        value: numVal,
        pct: totalVal > 0 ? ((numVal / totalVal) * 100).toFixed(1) : "0.0",
        color: PIE_COLORS[idx % PIE_COLORS.length],
      };
    });

    const series = items.map((i) => i.value);
    const labels = items.map((i) => i.name);
    const colors = items.map((i) => i.color);

    return { items, series, labels, colors, totalVal, isCapital };
  }, [filteredStocks, chartDimension, pieMetric, subView]);

  // Filtered items for the stack of names (supports local stack search)
  const displayedStackItems = useMemo(() => {
    if (!stackSearchQuery.trim()) return unifiedChartData.items;
    const q = stackSearchQuery.toLowerCase();
    return unifiedChartData.items.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [unifiedChartData.items, stackSearchQuery]);

  // --------------------------------------------------------------------------
  // ApexCharts Config Options Builder for Unified Pie Chart
  // --------------------------------------------------------------------------
  const chartOptions = useMemo(() => {
    const isCurrency = unifiedChartData.isCapital;
    const chartTitle = isCurrency ? "Capital" : "Quantity";

    return {
      chart: {
        id: `apex-stocks-pie-${subView}-${pieMetric}-${chartDimension}-${chartType}`,
        type: chartType,
        background: "transparent",
        fontFamily: "inherit",
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
        animations: {
          enabled: true,
          speed: 450,
          dynamicAnimation: { enabled: true, speed: 300 },
        },
      },
      labels: unifiedChartData.labels,
      colors: unifiedChartData.colors,
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "13px",
                fontWeight: 700,
                color: "#94a3b8",
              },
              value: {
                show: true,
                fontSize: "18px",
                fontWeight: 800,
                fontFamily: "monospace",
                color: "currentColor",
                formatter: (val) => {
                  return isCurrency ? formatCurrencyCompact(val) : `${Number(val).toLocaleString()} u`;
                },
              },
              total: {
                show: true,
                label: isCurrency ? "Total Capital" : "Total Qty",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                formatter: (w) => {
                  const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  return isCurrency ? formatCurrencyCompact(sum) : `${sum.toLocaleString()} u`;
                },
              },
            },
          },
        },
      },
      stroke: {
        show: true,
        colors: ["transparent"],
        width: 2,
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => (val >= 3 ? `${val.toFixed(1)}%` : ""),
        style: {
          fontSize: "11px",
          fontWeight: 700,
          colors: ["#ffffff"],
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          opacity: 0.6,
        },
      },
      legend: {
        show: false, // The right side acts as the full interactive Stack of Names!
      },
      tooltip: {
        custom: function ({ seriesIndex, w }) {
          const label = w.globals.labels[seriesIndex] || "Stock";
          const val = w.globals.series[seriesIndex] || 0;
          const total = w.globals.series.reduce((a, b) => a + b, 0);
          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";
          const formattedVal = isCurrency
            ? `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `${val.toLocaleString()} Shares`;

          return `
            <div style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px) saturate(180%); -webkit-backdrop-filter: blur(16px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.20); padding: 12px 16px; border-radius: 16px; box-shadow: 0 20px 30px -8px rgba(0, 0, 0, 0.5); font-family: inherit; color: #f8fafc; min-width: 200px;">
              <div style="font-weight: 800; font-size: 13px; margin-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); padding-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #ffffff;">${label}</span>
                <span style="font-size: 10px; font-weight: 700; background: rgba(59, 130, 246, 0.25); color: #60a5fa; padding: 2px 6px; border-radius: 6px;">${chartTitle}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 12px;">
                <span style="opacity: 0.75; color: #cbd5e1;">${isCurrency ? "Total Capital:" : "Quantity:"}</span>
                <span style="font-family: monospace; font-weight: 800; color: #38bdf8;">${formattedVal}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 12px; margin-top: 4px;">
                <span style="opacity: 0.75; color: #cbd5e1;">Share:</span>
                <span style="font-weight: 800; color: #34d399;">${pct}%</span>
              </div>
            </div>
          `;
        },
      },
    };
  }, [unifiedChartData, chartType, subView, pieMetric, chartDimension]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* -------------------------------------------------------------------- */}
      {/* 1. Sub-Dashboard Switcher Tabs & Global Search Bar */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-base-100 p-4 rounded-3xl shadow-sm border border-base-200/80">
        {/* Left: 3 Sub-Dashboard Pills (User Requested: Demat, Delivery, Intraday) */}
        <div className="flex items-center gap-1.5 p-1 bg-base-200/80 rounded-2xl border border-base-300/60 overflow-x-auto w-full md:w-auto [scrollbar-width:none]">
          <button
            onClick={() => handleSwitchSubView("demat")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              subView === "demat"
                ? "bg-primary text-primary-content shadow-sm scale-102"
                : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
            }`}
          >
            <Landmark size={14} className="text-blue-400 shrink-0" />
            <span>Stocks In Demat</span>
            <span
              className={`badge badge-xs font-mono font-bold ${
                subView === "demat" ? "bg-primary-content/20 text-primary-content" : "badge-ghost"
              }`}
            >
              {allDematStocks.length}
            </span>
          </button>

          <button
            onClick={() => handleSwitchSubView("delivery")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              subView === "delivery"
                ? "bg-primary text-primary-content shadow-sm scale-102"
                : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
            }`}
          >
            <PackageCheck size={14} className="text-emerald-400 shrink-0" />
            <span>Delivery Analysis</span>
            <span
              className={`badge badge-xs font-mono font-bold ${
                subView === "delivery" ? "bg-primary-content/20 text-primary-content" : "badge-ghost"
              }`}
            >
              {allDeliveryStocks.length}
            </span>
          </button>

          <button
            onClick={() => handleSwitchSubView("intraday")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              subView === "intraday"
                ? "bg-primary text-primary-content shadow-sm scale-102"
                : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
            }`}
          >
            <Zap size={14} className="text-amber-400 shrink-0" />
            <span>Intraday Analysis</span>
            <span
              className={`badge badge-xs font-mono font-bold ${
                subView === "intraday" ? "bg-primary-content/20 text-primary-content" : "badge-ghost"
              }`}
            >
              {allIntradayStocks.length}
            </span>
          </button>
        </div>

        {/* Right Controls: Market Cap Filter, Search & View Modes */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
          {/* Cap Filter */}
          <div className="flex items-center gap-1 bg-base-200/70 p-1 rounded-xl border border-base-300/50 text-xs font-medium">
            <span className="text-[10px] font-bold uppercase opacity-50 px-1">Size:</span>
            {["all", "Large", "Mid", "Small"].map((cap) => (
              <button
                key={`cap-${cap}`}
                onClick={() => setSelectedCap(cap)}
                className={`btn btn-xs rounded-lg px-2.5 font-bold capitalize transition-all ${
                  selectedCap === cap ? "btn-primary shadow-2xs" : "btn-ghost text-base-content/70"
                }`}
              >
                {cap === "all" ? "All Sizes" : cap}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[140px] max-w-[220px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="Search stock..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-xs input-bordered w-full pl-7 text-xs font-semibold rounded-xl focus:input-primary h-7.5"
            />
          </div>

          {/* Main Tab Switcher: Table vs Pie Chart (with Tab Names) */}
          <div className="flex items-center gap-1 bg-base-200/90 p-1 rounded-2xl border border-base-300 shadow-2xs">
            <button
              onClick={() => handleTabChange("table")}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === "table"
                  ? "bg-primary text-primary-content shadow-sm scale-102"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
              }`}
            >
              <TableProperties size={14} />
              <span>Table</span>
              <span
                className={`badge badge-xs font-mono font-bold ${
                  activeMainTab === "table" ? "bg-primary-content/25 text-primary-content" : "badge-ghost opacity-60"
                }`}
              >
                {sortedStocks.length}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("chart")}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === "chart"
                  ? "bg-primary text-primary-content shadow-sm scale-102"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
              }`}
            >
              <PieChart size={14} />
              <span>Pie Chart</span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. KPI Summary Cards Row */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Capital / Investment */}
        <div className="card bg-base-100 shadow-md border border-base-200/80 p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              {subView === "demat" ? "Total Demat Capital" : "Capital Deployed"}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              ₹{formatCurrency2Dec(kpiData.totalInvestedCapital)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
              <span className="badge badge-xs badge-info font-bold text-[10px]">
                {kpiData.count} {kpiData.count === 1 ? "Stock" : "Stocks"}
              </span>
              <span>
                {subView === "demat" ? "Holding In Demat" : "Total Traded Volume"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Quantity Left / Traded */}
        <div className="card bg-base-100 shadow-md border border-base-200/80 p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              {subView === "demat" ? "Quantity Left (Holding)" : "Total Quantity Traded"}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {kpiData.totalQuantity.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
              <span className="badge badge-xs badge-primary font-bold text-[10px]">
                {subView === "demat" ? "Remaining Shares" : "Total Shares Sold"}
              </span>
              <span>Across {kpiData.count} items</span>
            </div>
          </div>
        </div>

        {/* Card 3: Period / Duration Metric */}
        <div className="card bg-base-100 shadow-md border border-base-200/80 p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              {subView === "demat" ? "Avg Period From Today" : "Avg Holding Period"}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {kpiData.avgHoldingDays} <span className="text-sm font-bold opacity-80">Days</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
              <span className="badge badge-xs badge-warning font-bold text-[10px]">
                {subView === "demat" ? "Days Since Buy" : "Holding Duration"}
              </span>
              <span>{subView === "demat" ? "Holdings Tenure" : "> 1 Day Delivery"}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Realized Gain or Cap Split */}
        {subView === "demat" ? (
          <div className="card bg-base-100 shadow-md border border-base-200/80 p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Market Cap Allocation
              </span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PieChart size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl lg:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span>{kpiData.capDistribution.Large}L</span>
                <span className="text-base-content/30">•</span>
                <span className="text-indigo-500">{kpiData.capDistribution.Mid}M</span>
                <span className="text-base-content/30">•</span>
                <span className="text-amber-500">{kpiData.capDistribution.Small}S</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                <span className="badge badge-xs badge-success font-bold text-[10px]">
                  Large / Mid / Small
                </span>
                <span>Diversification</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-md border border-base-200/80 p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Net Realized P&L
              </span>
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                  kpiData.totalRealizedGain >= 0
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}
              >
                {kpiData.totalRealizedGain >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-2xl lg:text-3xl font-black font-mono ${
                  kpiData.totalRealizedGain >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {kpiData.totalRealizedGain >= 0 ? "+" : ""}₹{formatCurrency2Dec(kpiData.totalRealizedGain)}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
                <span
                  className={`badge badge-xs font-bold text-[10px] ${
                    kpiData.totalRealizedGain >= 0 ? "badge-success" : "badge-error"
                  }`}
                >
                  {kpiData.totalRealizedGain >= 0 ? "+" : ""}{kpiData.gainPctOverall}%
                </span>
                <span>Realized Return</span>
              </div>
            </div>
          </div>
        )}

        {/* Card 5: Trade Win Rate / Demat Status */}
        <div className="card bg-base-100 shadow-md border border-base-200/80 p-5 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              {subView === "demat" ? "Demat Portfolio Status" : "Trade Win Ratio"}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black font-mono text-teal-600 dark:text-teal-400">
              {subView === "demat" ? "100% Active" : `${kpiData.winRate}%`}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-base-content/60 font-medium">
              <span className="badge badge-xs badge-secondary font-bold text-[10px]">
                {subView === "demat" ? "In Demat Hold" : `${kpiData.profitableCount}W / ${kpiData.lossCount}L`}
              </span>
              <span>{subView === "demat" ? "Ready to Trade" : "Profitable Trades"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. TAB 2: Interactive Pie Chart (Left Side: Pie Chart, Right Side: Stack of Names, Dropdown: Total Capital / Total Qty) */}
      {/* -------------------------------------------------------------------- */}
      {activeMainTab === "chart" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Row with Title, Metric Dropdown, Dimension & Donut/Pie Controls */}
          <div className="card bg-base-100 p-5 rounded-3xl shadow-sm border border-base-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <PieChart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-base-content flex items-center gap-2">
                    <span>
                      {subView === "demat"
                        ? "Demat Visual Distribution"
                        : subView === "delivery"
                        ? "Delivery Trades Distribution"
                        : "Intraday Trades Distribution"}
                    </span>
                    <span className="badge badge-sm badge-outline font-mono font-bold text-[10px]">
                      {pieMetric === "capital" ? "Total Capital" : "Total Qty"}
                    </span>
                  </h3>
                  <p className="text-xs text-base-content/60 mt-0.5">
                    Interactive pie visualizer on the left with a stacked breakdown of positions on the right.
                  </p>
                </div>
              </div>
            </div>

            {/* Metric Dropdown (User Requested!) & Controls */}
            <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
              {/* Metric Dropdown: Total Capital vs Total Qty */}
              <div className="flex items-center gap-2 bg-base-200/80 px-3 py-1.5 rounded-2xl border border-base-300">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                  <Filter size={12} /> Metric:
                </span>
                <select
                  value={pieMetric}
                  onChange={(e) => setPieMetric(e.target.value)}
                  className="select select-xs font-black bg-base-100 rounded-xl border-base-300 focus:outline-none focus:border-primary text-xs cursor-pointer"
                >
                  <option value="capital">Total Capital</option>
                  <option value="quantity">Total Qty</option>
                </select>
              </div>

              {/* Dimension Toggle: By Stock vs By Market Cap */}
              <div className="join border border-base-300 rounded-xl p-0.5 bg-base-200/60 text-xs">
                <button
                  onClick={() => setChartDimension("stock")}
                  className={`join-item btn btn-xs rounded-lg font-bold ${
                    chartDimension === "stock" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"
                  }`}
                >
                  By Stock
                </button>
                <button
                  onClick={() => setChartDimension("cap")}
                  className={`join-item btn btn-xs rounded-lg font-bold ${
                    chartDimension === "cap" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"
                  }`}
                >
                  By Size
                </button>
              </div>

              {/* Donut vs Pie */}
              <div className="join border border-base-300 rounded-xl p-0.5 bg-base-200/60 text-xs">
                <button
                  onClick={() => setChartType("donut")}
                  className={`join-item btn btn-xs rounded-lg font-bold ${
                    chartType === "donut" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"
                  }`}
                >
                  Donut
                </button>
                <button
                  onClick={() => setChartType("pie")}
                  className={`join-item btn btn-xs rounded-lg font-bold ${
                    chartType === "pie" ? "btn-primary shadow-2xs" : "btn-ghost opacity-70"
                  }`}
                >
                  Pie
                </button>
              </div>
            </div>
          </div>

          {/* 2-Column Grid: Left Side = Pie Chart, Right Side = Stack of Names */}
          {filteredStocks.length === 0 ? (
            <div className="card bg-base-100 p-12 text-center text-sm opacity-50 italic rounded-3xl border border-base-200/80">
              No stock trade records found matching the current sub-dashboard filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT SIDE: Pie Chart */}
              <div className="lg:col-span-7 card bg-base-100 p-6 rounded-3xl shadow-xl border border-base-200/80 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-base-200/80 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs"></div>
                    <span className="font-extrabold text-sm text-base-content">
                      {pieMetric === "capital"
                        ? subView === "demat"
                          ? "Capital Invested in Demat"
                          : "Capital Deployed Distribution"
                        : subView === "demat"
                        ? "Quantity Left (Shares in Demat)"
                        : "Quantity / Volume Traded"}
                    </span>
                  </div>
                  <span className="badge badge-sm badge-info font-mono font-bold">
                    {pieMetric === "capital"
                      ? `Total: ₹${formatCurrencyCompact(unifiedChartData.totalVal)}`
                      : `Total: ${unifiedChartData.totalVal.toLocaleString()} Shares`}
                  </span>
                </div>

                <div className="w-full h-[380px] flex items-center justify-center [&_.apexcharts-canvas]:!mx-auto">
                  {unifiedChartData.series.length > 0 ? (
                    <Chart
                      key={`pie-chart-${subView}-${pieMetric}-${chartDimension}-${chartType}-${unifiedChartData.labels.join(",")}-${unifiedChartData.series.join(",")}`}
                      options={chartOptions}
                      series={unifiedChartData.series}
                      type={chartType}
                      height={370}
                      width="100%"
                    />
                  ) : (
                    <div className="text-xs opacity-50 italic">No data available for the selected filters</div>
                  )}
                </div>

                <div className="text-center text-[11px] opacity-60 pt-2 border-t border-base-200/60 font-medium">
                  {chartDimension === "stock"
                    ? `Visual breakdown of ${unifiedChartData.labels.length} distinct stocks`
                    : "Visual breakdown grouped by Large, Mid, and Small Cap allocations"}
                </div>
              </div>

              {/* RIGHT SIDE: Stack of Names */}
              <div className="lg:col-span-5 card bg-base-100 p-6 rounded-3xl shadow-xl border border-base-200/80 flex flex-col justify-between">
                <div>
                  {/* Stack Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-base-200/80 mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="text-primary w-4.5 h-4.5" />
                      <h4 className="font-black text-sm text-base-content tracking-tight">
                        {chartDimension === "stock" ? "Stack of Names" : "Market Cap Stack"}
                      </h4>
                      <span className="badge badge-sm badge-primary font-bold">
                        {unifiedChartData.items.length}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-primary">
                        {unifiedChartData.isCapital
                          ? `₹${formatCurrency2Dec(unifiedChartData.totalVal)}`
                          : `${unifiedChartData.totalVal.toLocaleString()} Shares`}
                      </span>
                    </div>
                  </div>

                  {/* Filter inside stack if more than 5 stocks */}
                  {unifiedChartData.items.length > 5 && (
                    <div className="relative mb-3">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        type="text"
                        placeholder="Search names in stack..."
                        value={stackSearchQuery}
                        onChange={(e) => setStackSearchQuery(e.target.value)}
                        className="input input-xs input-bordered w-full pl-7 text-xs rounded-xl focus:input-primary"
                      />
                    </div>
                  )}

                  {/* Scrollable Stack List */}
                  <div className="overflow-y-auto max-h-[350px] space-y-2 pr-1.5 [scrollbar-width:thin]">
                    {displayedStackItems.length === 0 ? (
                      <div className="p-8 text-center text-xs opacity-50 italic">
                        No matches found in stack.
                      </div>
                    ) : (
                      displayedStackItems.map((item, idx) => (
                        <div
                          key={`${item.name}-${idx}`}
                          className="p-3 rounded-2xl bg-base-200/40 hover:bg-base-200/80 border border-base-300/40 hover:border-primary/40 hover:shadow-xs transition-all group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {/* Left: Rank, Color Swatch, Name, Cap Badge */}
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[10.5px] font-bold text-base-content/40 w-4 text-center shrink-0">
                                #{idx + 1}
                              </span>
                              <span
                                className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-2 ring-base-100"
                                style={{ backgroundColor: item.color }}
                              />
                              <span
                                className="font-extrabold text-xs truncate max-w-[130px] sm:max-w-[160px] text-base-content group-hover:text-primary transition-colors"
                                title={item.name}
                              >
                                {item.name}
                              </span>
                              {item.cap && chartDimension === "stock" && (
                                <span
                                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 ${
                                    item.cap === "Large"
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                      : item.cap === "Mid"
                                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  }`}
                                >
                                  {item.cap}
                                </span>
                              )}
                            </div>

                            {/* Right: Metric Value & Percentage */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-extrabold text-xs text-base-content/90">
                                {unifiedChartData.isCapital
                                  ? `₹${formatCurrency2Dec(item.value)}`
                                  : `${item.value.toLocaleString()} u`}
                              </span>
                              <span className="badge badge-sm badge-neutral font-mono font-black text-[10px] min-w-[48px] justify-center">
                                {item.pct}%
                              </span>
                            </div>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full bg-base-300/60 h-1.5 rounded-full overflow-hidden mt-2">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(1, Number(item.pct)))}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stack Footer */}
                <div className="pt-3 mt-2 border-t border-base-200/60 flex items-center justify-between text-[11px] font-medium opacity-60">
                  <span>
                    Showing {displayedStackItems.length} of {unifiedChartData.items.length} positions
                  </span>
                  <span className="font-mono font-bold">100.0% Total</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. TAB 1: Detailed Stock Data Table (User Requested: Keep Only Table) */}
      {/* -------------------------------------------------------------------- */}
      {activeMainTab === "table" && (
        <div className="card bg-base-100 shadow-xl border border-base-200/80 rounded-3xl overflow-hidden space-y-4 p-6">
          {/* Table Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TableProperties className="text-primary w-5 h-5" />
                <h3 className="text-lg font-black tracking-tight">
                  {subView === "demat"
                    ? "Demat Stock Holdings Ledger"
                    : subView === "delivery"
                    ? "Delivery Trades Completed Ledger"
                    : "Intraday Orders Ledger"}
                </h3>
                <span className="badge badge-sm badge-primary font-bold">
                  {sortedStocks.length} Records
                </span>
              </div>
              <p className="text-xs text-base-content/60 mt-0.5">
                {subView === "demat"
                  ? "Showing all active stocks with positive remaining quantity in Demat."
                  : subView === "delivery"
                  ? "Showing fully exited positions where holding duration was greater than 1 day."
                  : "Showing same-day intraday trading orders."}
              </p>
            </div>

            {/* Table Entry Direct Link */}
            <Link
              to="/dashboard/investment/table-entry?tab=stocks"
              className="btn btn-sm btn-outline btn-primary rounded-xl font-bold gap-1.5"
            >
              <ExternalLink size={13} />
              <span>Manage in Table Entry</span>
            </Link>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-base-300/60 max-h-[580px] [scrollbar-width:thin]">
            <table className="table table-zebra table-sm w-full text-xs">
              <thead className="bg-base-200/80 text-base-content/70 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="font-extrabold uppercase text-[10px] w-12 text-center">#</th>

                  {/* Stock Name */}
                  <th
                    className="font-extrabold uppercase text-[10px] cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Stock Name</span>
                      {sortField === "name" ? (
                        sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Size / Market Cap */}
                  <th
                    className="font-extrabold uppercase text-[10px] cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort("cap")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Size (Cap)</span>
                      {sortField === "cap" ? (
                        sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Buy Date */}
                  <th
                    className="font-extrabold uppercase text-[10px] cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort("bDate")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Buy Date</span>
                      {sortField === "bDate" ? (
                        sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Period (Period From Today for Demat / Holding Period for Delivery) */}
                  <th
                    className="font-extrabold uppercase text-[10px] cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort(subView === "demat" ? "periodFromToday" : "period")}
                  >
                    <div className="flex items-center gap-1">
                      <span>{subView === "demat" ? "Period From Today" : "Holding Period"}</span>
                      {sortField === (subView === "demat" ? "periodFromToday" : "period") ? (
                        sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Quantity Left (or Traded Quantity) */}
                  <th
                    className="font-extrabold uppercase text-[10px] text-right cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort(subView === "demat" ? "qLeft" : "bQty")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{subView === "demat" ? "Quantity Left" : "Quantity Traded"}</span>
                      {sortField === (subView === "demat" ? "qLeft" : "bQty") ? (
                        sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Share Price */}
                  <th
                    className="font-extrabold uppercase text-[10px] text-right cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort("bShare")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Share Price</span>
                      {sortField === "bShare" ? (
                        sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Total Capital Invested */}
                  <th
                    className="font-extrabold uppercase text-[10px] text-right cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => handleSort("holdingCapital")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Total Capital</span>
                      {sortField === "holdingCapital" ? (
                        sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={11} className="opacity-40" />
                      )}
                    </div>
                  </th>

                  {/* Sell Date / Realized Gain for Delivery & Intraday */}
                  {subView !== "demat" && (
                    <>
                      <th className="font-extrabold uppercase text-[10px] text-right">
                        Final Sold Price
                      </th>
                      <th
                        className="font-extrabold uppercase text-[10px] text-right cursor-pointer select-none hover:text-primary transition-colors"
                        onClick={() => handleSort("gainRs")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Realized P&L</span>
                          {sortField === "gainRs" ? (
                            sortDirection === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                          ) : (
                            <ChevronsUpDown size={11} className="opacity-40" />
                          )}
                        </div>
                      </th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {sortedStocks.length === 0 ? (
                  <tr>
                    <td colSpan={subView === "demat" ? 8 : 10} className="text-center py-12 text-sm opacity-50 italic">
                      No records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  sortedStocks.map((stock, idx) => {
                    const qLeft = Number(stock.qLeft) || 0;
                    const qTraded = Number(stock.sQty) || Number(stock.bQty) || 0;
                    const bFShare = Number(stock.bFShare) || Number(stock.bShare) || 0;
                    const bShare = Number(stock.bShare) || bFShare;
                    const holdingCapital = subView === "demat" ? (qLeft * bShare) : (qTraded * bShare);

                    // Days from today calculation
                    const buyDateObj = stock.bDate ? dayjs(stock.bDate) : null;
                    const daysFromToday = buyDateObj ? dayjs().diff(buyDateObj, "day") : 0;
                    const periodFromTodayText = buyDateObj
                      ? daysFromToday >= 0
                        ? `${daysFromToday}d`
                        : "0d"
                      : "-";

                    const gainRs = Number(stock.gainRs) || 0;
                    const gainPct = Number(stock.gainPct) || 0;
                    const isProfit = gainRs >= 0;

                    return (
                      <tr key={stock.id || stock._id || idx} className="hover:bg-base-200/50 transition-colors">
                        {/* # */}
                        <td className="text-center font-mono font-bold text-base-content/40">{idx + 1}</td>

                        {/* Stock Name */}
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-base-content tracking-tight">
                              {stock.name}
                            </span>
                            {stock.exchange && (
                              <span className="badge badge-xs badge-ghost font-mono opacity-60 scale-90">
                                {stock.exchange}
                              </span>
                            )}
                            {stock.platform && (
                              <span className="badge badge-xs bg-base-200 font-medium text-[9px] opacity-70">
                                {stock.platform}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Size / Market Cap */}
                        <td>
                          <span
                            className={`badge badge-xs font-bold text-[10px] ${
                              stock.cap === "Large"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : stock.cap === "Mid"
                                ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {stock.cap || "Large"}
                          </span>
                        </td>

                        {/* Buy Date */}
                        <td className="font-medium text-base-content/80 whitespace-nowrap">
                          {stock.bDate ? dayjs(stock.bDate).format("DD MMM YYYY") : "-"}
                        </td>

                        {/* Period From Today / Holding Period */}
                        <td>
                          {subView === "demat" ? (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="font-mono font-bold text-blue-500">
                                {periodFromTodayText}
                              </span>
                              <span className="text-[10px] opacity-50">
                                ({daysFromToday > 365 ? `${(daysFromToday / 365).toFixed(1)}y` : `${Math.round(daysFromToday / 30)}m`})
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono font-bold text-amber-500">
                              {stock.period || 0} Days
                            </span>
                          )}
                        </td>

                        {/* Quantity Left / Traded */}
                        <td className="text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {subView === "demat" ? qLeft.toLocaleString() : qTraded.toLocaleString()}
                        </td>

                        {/* Share Price */}
                        <td className="text-right font-mono font-bold text-base-content/90">
                          ₹{formatCurrency2Dec(bShare)}
                        </td>

                        {/* Total Capital */}
                        <td className="text-right font-mono font-extrabold text-blue-600 dark:text-blue-400">
                          ₹{formatCurrency2Dec(holdingCapital)}
                        </td>

                        {/* Delivery & Intraday Realization Columns */}
                        {subView !== "demat" && (
                          <>
                            <td className="text-right font-mono font-bold text-base-content/80">
                              ₹{formatCurrency2Dec(stock.sFShare || 0)}
                            </td>
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <span
                                  className={`font-mono font-black ${
                                    isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                  }`}
                                >
                                  {isProfit ? "+" : ""}₹{formatCurrency2Dec(gainRs)}
                                </span>
                                <span
                                  className={`badge badge-xs font-bold text-[9.5px] ${
                                    isProfit ? "badge-success" : "badge-error"
                                  }`}
                                >
                                  {isProfit ? "+" : ""}{gainPct.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Summary Footer Row */}
              {sortedStocks.length > 0 && (
                <tfoot className="bg-base-200/90 font-extrabold border-t-2 border-base-300">
                  <tr>
                    <td colSpan={2} className="text-left font-black uppercase text-[10.5px]">
                      Totals ({sortedStocks.length} Stocks)
                    </td>
                    <td></td>
                    <td></td>
                    <td className="font-mono text-amber-500">
                      {subView === "demat" ? `Avg: ${kpiData.avgHoldingDays}d` : `Avg: ${kpiData.avgHoldingDays}d`}
                    </td>
                    <td className="text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      {kpiData.totalQuantity.toLocaleString()}
                    </td>
                    <td></td>
                    <td className="text-right font-mono font-black text-blue-600 dark:text-blue-400">
                      ₹{formatCurrency2Dec(kpiData.totalInvestedCapital)}
                    </td>
                    {subView !== "demat" && (
                      <>
                        <td></td>
                        <td className="text-right font-mono font-black">
                          <span
                            className={
                              kpiData.totalRealizedGain >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }
                          >
                            {kpiData.totalRealizedGain >= 0 ? "+" : ""}₹{formatCurrency2Dec(kpiData.totalRealizedGain)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
