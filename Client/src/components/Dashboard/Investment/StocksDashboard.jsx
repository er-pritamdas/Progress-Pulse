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
  PiggyBank,
  Percent,
  ChevronDown,
  ExternalLink,
  ChevronUp,
  ChevronsUpDown,
  X,
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
  // External props from top sticky bar
  selectedCap: externalCap,
  onCapChange,
  searchQuery: externalSearch,
  onSearchChange,
  activeMainTab: externalMainTab,
  onMainTabChange,
  hideNumbers = false,
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
  const [internalMainTab, setInternalMainTab] = useState(() => {
    return localStorage.getItem("pulse_stocks_dash_tab") || "table";
  });
  const activeMainTab = externalMainTab !== undefined ? externalMainTab : internalMainTab;

  const handleTabChange = (tab) => {
    if (onMainTabChange) onMainTabChange(tab);
    setInternalMainTab(tab);
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
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearch !== undefined ? externalSearch : internalSearchQuery;
  const setSearchQuery = (q) => {
    if (onSearchChange) onSearchChange(q);
    setInternalSearchQuery(q);
  };

  const [internalSelectedCap, setInternalSelectedCap] = useState("all"); // "all" | "Large" | "Mid" | "Small"
  const selectedCap = externalCap !== undefined ? externalCap : internalSelectedCap;
  const setSelectedCap = (cap) => {
    if (onCapChange) onCapChange(cap);
    setInternalSelectedCap(cap);
  };

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
      fill: {
        type: "solid",
        opacity: 0.8,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["#1e293b"],
      },
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
      {/* 1. KPI Summary Cards Row - Desktop (hidden on mobile) */}
      {/* -------------------------------------------------------------------- */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Card 1: Total Capital / Investment */}
        <div className="col-span-2 lg:col-span-1 card bg-base-200 shadow-md p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
          {/* Light Background Watermark Icon */}
          <div className="absolute -right-3 -bottom-3 text-blue-500/10 dark:text-blue-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
            <Wallet className="w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.5} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-base-content/60">
                {subView === "demat" ? "Total Demat Capital" : "Capital Deployed"}
              </span>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-blue-600 dark:text-blue-400 truncate">
                {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(kpiData.totalInvestedCapital)}`}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-base-content/60 font-medium truncate">
                <span className="badge badge-xs badge-info font-bold text-[9px] sm:text-[10px]">
                  {kpiData.count} {kpiData.count === 1 ? "Stock" : "Stocks"}
                </span>
                <span>
                  {subView === "demat" ? "Holding In Demat" : "Total Traded"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Quantity Left / Traded */}
        <div className="card bg-base-200 shadow-md p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
          {/* Light Background Watermark Icon */}
          <div className="absolute -right-3 -bottom-3 text-indigo-500/10 dark:text-indigo-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
            <Layers className="w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.5} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-base-content/60">
                {subView === "demat" ? "Quantity Left" : "Quantity Traded"}
              </span>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400 truncate">
                {hideNumbers ? "••••••" : kpiData.totalQuantity.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-base-content/60 font-medium truncate">
                <span className="badge badge-xs badge-primary font-bold text-[9px] sm:text-[10px]">
                  {subView === "demat" ? "Remaining" : "Sold"}
                </span>
                <span>Across {kpiData.count} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Period / Duration Metric */}
        <div className="card bg-base-200 shadow-md p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
          {/* Light Background Watermark Icon */}
          <div className="absolute -right-3 -bottom-3 text-amber-500/10 dark:text-amber-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
            <Clock className="w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.5} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-base-content/60">
                {subView === "demat" ? "Avg Holding Period" : "Holding Period"}
              </span>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 truncate">
                {kpiData.avgHoldingDays} <span className="text-xs sm:text-sm font-bold opacity-80">Days</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-base-content/60 font-medium truncate">
                <span className="badge badge-xs badge-warning font-bold text-[9px] sm:text-[10px]">
                  {subView === "demat" ? "Days Since Buy" : "Duration"}
                </span>
                <span>Tenure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Realized Gain or Cap Split */}
        {subView === "demat" ? (
          <div className="card bg-base-200 shadow-md p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
            {/* Light Background Watermark Icon */}
            <div className="absolute -right-3 -bottom-3 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
              <PieChart className="w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-base-content/60">
                  Cap Allocation
                </span>
              </div>
              <div className="mt-2 sm:mt-3">
                <div className="text-lg sm:text-xl lg:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 sm:gap-2 truncate">
                  <span>{kpiData.capDistribution.Large}L</span>
                  <span className="text-base-content/30">•</span>
                  <span className="text-indigo-500">{kpiData.capDistribution.Mid}M</span>
                  <span className="text-base-content/30">•</span>
                  <span className="text-amber-500">{kpiData.capDistribution.Small}S</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-base-content/60 font-medium truncate">
                  <span className="badge badge-xs badge-success font-bold text-[9px] sm:text-[10px]">
                    L / M / S
                  </span>
                  <span>Cap Split</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card bg-base-200 shadow-md p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
            {/* Light Background Watermark Icon */}
            <div className={`absolute -right-3 -bottom-3 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 ${
              kpiData.totalRealizedGain >= 0 ? "text-emerald-500/10 dark:text-emerald-400/10" : "text-rose-500/10 dark:text-rose-400/10"
            }`}>
              {kpiData.totalRealizedGain >= 0 ? <TrendingUp className="w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.5} /> : <TrendingDown className="w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.5} />}
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-base-content/60">
                  Net Realized P&L
                </span>
              </div>
              <div className="mt-2 sm:mt-3">
                <div
                  className={`text-xl sm:text-2xl lg:text-3xl font-black font-mono truncate ${
                    kpiData.totalRealizedGain >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {hideNumbers ? "••••••" : `${kpiData.totalRealizedGain >= 0 ? "+" : ""}₹${formatCurrency2Dec(kpiData.totalRealizedGain)}`}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-base-content/60 font-medium truncate">
                  <span
                    className={`badge badge-xs font-bold text-[9px] sm:text-[10px] ${
                      kpiData.totalRealizedGain >= 0 ? "badge-success" : "badge-error"
                    }`}
                  >
                    {kpiData.totalRealizedGain >= 0 ? "+" : ""}{kpiData.gainPctOverall}%
                  </span>
                  <span>Return</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card 5: Trade Win Rate / Demat Status */}
        <div className="card bg-base-200 shadow-md p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
          {/* Light Background Watermark Icon */}
          <div className="absolute -right-3 -bottom-3 text-teal-500/10 dark:text-teal-400/10 pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
            <Sparkles className="w-14 h-14 sm:w-20 sm:h-20" strokeWidth={1.5} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-base-content/60">
                {subView === "demat" ? "Demat Status" : "Win Ratio"}
              </span>
            </div>
            <div className="mt-2 sm:mt-3">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-teal-600 dark:text-teal-400 truncate">
                {subView === "demat" ? "100% Active" : `${kpiData.winRate}%`}
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-base-content/60 font-medium truncate">
                <span className="badge badge-xs badge-secondary font-bold text-[9px] sm:text-[10px]">
                  {subView === "demat" ? "In Demat" : `${kpiData.profitableCount}W / ${kpiData.lossCount}L`}
                </span>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. TAB 2: Interactive Pie Chart (Left Side: Pie Chart, Right Side: Stack of Names, Dropdown: Total Capital / Total Qty) */}
      {/* -------------------------------------------------------------------- */}
      {activeMainTab === "chart" && (
        <div className="hidden md:block space-y-6 animate-in fade-in duration-300">
          {/* Header Row with Title, Metric Dropdown, Dimension & Donut/Pie Controls */}
          <div className="card bg-base-200 p-5 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
              <div className="flex items-center gap-2 bg-base-100 px-3 py-1.5 rounded-2xl border border-base-300">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                  <Filter size={12} /> Metric:
                </span>
                <select
                  value={pieMetric}
                  onChange={(e) => setPieMetric(e.target.value)}
                  className="select select-xs font-black bg-base-200/60 rounded-xl border-base-300 focus:outline-none focus:border-primary text-xs cursor-pointer"
                >
                  <option value="capital">Total Capital</option>
                  <option value="quantity">Total Qty</option>
                </select>
              </div>

              {/* Dimension Toggle: By Stock vs By Market Cap */}
              <div className="join border border-base-300 rounded-xl p-0.5 bg-base-100 text-xs">
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
              <div className="join border border-base-300 rounded-xl p-0.5 bg-base-100 text-xs">
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
            <div className="card bg-base-200 p-12 text-center text-sm opacity-50 italic rounded-3xl">
              No stock trade records found matching the current sub-dashboard filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* LEFT SIDE: Pie Chart */}
              <div className="lg:col-span-7 card bg-base-200 p-6 rounded-3xl shadow-md flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-2">
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
                      ? `Total: ${formatCurrencyCompact(unifiedChartData.totalVal)}`
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

                <div className="text-center text-[11px] opacity-60 pt-2 border-t border-base-300 font-medium">
                  {chartDimension === "stock"
                    ? `Visual breakdown of ${unifiedChartData.labels.length} distinct stocks`
                    : "Visual breakdown grouped by Large, Mid, and Small Cap allocations"}
                </div>
              </div>

              {/* RIGHT SIDE: Stack of Names */}
              <div className="lg:col-span-5 card bg-base-200 p-6 rounded-3xl shadow-md flex flex-col justify-between">
                <div>
                  {/* Stack Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-base-300 mb-3">
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
                        className="input input-xs input-bordered w-full pl-7 text-xs rounded-xl focus:input-primary bg-base-100"
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
                          className="p-3 rounded-2xl bg-base-100 hover:bg-base-100/80 border border-base-300 hover:border-primary/40 hover:shadow-xs transition-all group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {/* Left: Rank, Color Swatch, Name, Cap Badge */}
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[10.5px] font-bold text-base-content/40 w-4 text-center shrink-0">
                                #{idx + 1}
                              </span>
                              <span
                                className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-2 ring-base-200"
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

                            {/* Right: Quantity / Capital Value & Percentage */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-extrabold text-xs text-base-content/90">
                                {unifiedChartData.isCapital
                                  ? `₹${formatCurrency2Dec(item.value)}`
                                  : `${item.value.toLocaleString()} shs`}
                              </span>
                              <span className="badge badge-sm badge-neutral font-mono font-black text-[10px] min-w-[48px] justify-center">
                                {item.pct}%
                              </span>
                            </div>
                          </div>

                          {/* Visual Progress Bar */}
                          <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden mt-2">
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
                <div className="pt-3 mt-2 border-t border-base-300 flex items-center justify-between text-[11px] font-medium opacity-60">
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
        <div className="hidden md:block card bg-base-200 shadow-md rounded-3xl overflow-hidden space-y-4 p-6">
          {/* Table Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-base-300 pb-4">
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
          <div className="overflow-x-auto rounded-2xl border border-base-300 max-h-[580px] [scrollbar-width:thin] bg-base-100">
            <table className="table table-zebra table-sm w-full text-xs">
              <thead className="bg-base-200 text-base-content/70 sticky top-0 z-10 backdrop-blur-md">
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

      {/* ==================================================================== */}
      {/* 5. PHONE VIEW ONLY (block md:hidden) */}
      {/* ==================================================================== */}
      <div className="block md:hidden space-y-2.5">
        {/* 1. Phone View Compact KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-2">
          {/* Card 1: Total Capital (Span 2 cols) */}
          <div className="col-span-2 card bg-base-200/90 dark:bg-base-800/80 shadow-2xs border border-base-300/60 p-2.5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
                <Wallet size={12} className="text-blue-500" />
                {subView === "demat" ? "Total Demat Capital" : "Capital Deployed"}
              </span>
              <span className="badge badge-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9.5px]">
                {kpiData.count} {kpiData.count === 1 ? "Stock" : "Stocks"}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <div className="text-base sm:text-lg font-black font-mono tracking-tight text-blue-600 dark:text-blue-400 whitespace-nowrap truncate">
                {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(kpiData.totalInvestedCapital)}`}
              </div>
              <span className="text-[10px] text-base-content/60 font-medium whitespace-nowrap shrink-0">
                {subView === "demat" ? "Holding In Demat" : "Total Traded"}
              </span>
            </div>
          </div>

          {/* Card 2: Quantity */}
          <div className="card bg-base-200/90 dark:bg-base-800/80 shadow-2xs border border-base-300/60 p-2.5 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
              <Layers size={12} className="text-indigo-500" />
              {subView === "demat" ? "Quantity Left" : "Quantity Traded"}
            </span>
            <div className="mt-1">
              <div className="text-sm font-black font-mono tracking-tight text-indigo-600 dark:text-indigo-400 whitespace-nowrap truncate">
                {hideNumbers ? "••••••" : kpiData.totalQuantity.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-base-content/60 font-medium whitespace-nowrap truncate">
                <span className="badge badge-xs badge-primary font-bold text-[8.5px]">
                  {subView === "demat" ? "Left" : "Sold"}
                </span>
                <span>Across {kpiData.count} items</span>
              </div>
            </div>
          </div>

          {/* Card 3: Avg Holding Days */}
          <div className="card bg-base-200/90 dark:bg-base-800/80 shadow-2xs border border-base-300/60 p-2.5 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
              <Clock size={12} className="text-amber-500" />
              {subView === "demat" ? "Avg Holding" : "Holding Period"}
            </span>
            <div className="mt-1">
              <div className="text-sm font-black font-mono tracking-tight text-amber-600 dark:text-amber-400 whitespace-nowrap truncate">
                {kpiData.avgHoldingDays} <span className="text-[10px] font-bold opacity-80">Days</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-base-content/60 font-medium whitespace-nowrap truncate">
                <span className="badge badge-xs badge-warning font-bold text-[8.5px]">Tenure</span>
                <span>Days since buy</span>
              </div>
            </div>
          </div>

          {/* Card 4: Cap Allocation or Realized P&L */}
          <div className="card bg-base-200/90 dark:bg-base-800/80 shadow-2xs border border-base-300/60 p-2.5 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
              {subView === "demat" ? <PieChart size={12} className="text-emerald-500" /> : <TrendingUp size={12} className="text-emerald-500" />}
              {subView === "demat" ? "Cap Split" : "Net Realized P&L"}
            </span>
            <div className="mt-1">
              {subView === "demat" ? (
                <>
                  <div className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 whitespace-nowrap truncate">
                    <span>{kpiData.capDistribution.Large}L</span>
                    <span className="text-base-content/30">•</span>
                    <span className="text-indigo-500">{kpiData.capDistribution.Mid}M</span>
                    <span className="text-base-content/30">•</span>
                    <span className="text-amber-500">{kpiData.capDistribution.Small}S</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-base-content/60 font-medium whitespace-nowrap truncate">
                    <span className="badge badge-xs badge-success font-bold text-[8.5px]">L/M/S</span>
                    <span>Cap distribution</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-sm font-black font-mono tracking-tight whitespace-nowrap truncate ${
                    kpiData.totalRealizedGain >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {hideNumbers ? "••••••" : `${kpiData.totalRealizedGain >= 0 ? "+" : ""}₹${formatCurrency2Dec(kpiData.totalRealizedGain)}`}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-base-content/60 font-medium whitespace-nowrap truncate">
                    <span className={`badge badge-xs font-bold text-[8.5px] ${
                      kpiData.totalRealizedGain >= 0 ? "badge-success" : "badge-error"
                    }`}>
                      {kpiData.totalRealizedGain >= 0 ? "+" : ""}{kpiData.gainPctOverall}%
                    </span>
                    <span>Return</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 5: Demat Status or Win Rate */}
          <div className="card bg-base-200/90 dark:bg-base-800/80 shadow-2xs border border-base-300/60 p-2.5 rounded-2xl relative overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1">
              <Sparkles size={12} className="text-teal-500" />
              {subView === "demat" ? "Demat Status" : "Win Ratio"}
            </span>
            <div className="mt-1">
              <div className="text-sm font-black font-mono tracking-tight text-teal-600 dark:text-teal-400 whitespace-nowrap truncate">
                {subView === "demat" ? "100% Active" : `${kpiData.winRate}%`}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-base-content/60 font-medium whitespace-nowrap truncate">
                <span className="badge badge-xs badge-secondary font-bold text-[8.5px]">
                  {subView === "demat" ? "In Demat" : `${kpiData.profitableCount}W / ${kpiData.lossCount}L`}
                </span>
                <span>Active status</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Single line header with one line subtitle below it */}
        <div className="space-y-0.5 pt-1">
          <h2 className="text-sm font-extrabold flex items-center gap-1.5 whitespace-nowrap truncate text-base-content">
            <TrendingUp size={16} className="text-blue-500 shrink-0" />
            <span className="truncate">
              {subView === "demat"
                ? "Demat Stock Holdings"
                : subView === "delivery"
                ? "Delivery Completed Trades"
                : "Intraday Orders Ledger"}
            </span>
            <span className="badge badge-xs font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
              {sortedStocks.length}
            </span>
          </h2>
          <p className="text-[10px] text-base-content/60 whitespace-nowrap truncate">
            {subView === "demat"
              ? "Active stock holdings with remaining quantity in Demat ledger"
              : subView === "delivery"
              ? "Closed delivery positions held greater than 1 day with realized returns"
              : "Same-day intraday positions, execution prices, and net P&L"}
          </p>
        </div>

        {/* 3. Sticky Filters (Sub-view, View Toggle, Size Dropdown) - All in One Line */}
        <div className="sticky top-[108px] z-30 bg-base-100/95 dark:bg-base-900/95 backdrop-blur-md -mx-3 px-3 py-1.5 border-y border-base-300/70 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
            {/* Sub-view toggle (Demat / Delivery / Intraday) */}
            <div className="flex items-center gap-0.5 bg-base-200/90 dark:bg-base-800/90 p-0.5 rounded-xl border border-base-300/80 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => handleSwitchSubView("demat")}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subView === "demat"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                Demat
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSubView("delivery")}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subView === "delivery"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                Delivery
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSubView("intraday")}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  subView === "intraday"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                Intraday
              </button>
            </div>

            {/* View toggle (Table / Chart) */}
            <div className="flex items-center gap-0.5 bg-base-200/90 dark:bg-base-800/90 p-0.5 rounded-xl border border-base-300/80 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange("table")}
                className={`p-0.5 px-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  activeMainTab === "table"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
                title="Table View"
              >
                <TableProperties size={11} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("chart")}
                className={`p-0.5 px-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  activeMainTab === "chart"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
                title="Chart View"
              >
                <PieChart size={11} />
                <span>Chart</span>
              </button>
            </div>

            {/* Size Dropdown */}
            <div className="flex-1 min-w-[76px] flex items-center gap-1 bg-base-200/90 dark:bg-base-800/90 px-1.5 py-0.5 rounded-xl border border-base-300/80 shadow-2xs shrink-0">
              <Filter size={10} className="text-primary shrink-0" />
              <select
                className="select select-ghost select-xs p-0 h-6 min-h-0 text-[10px] font-bold w-full focus:outline-none bg-transparent truncate cursor-pointer text-base-content"
                value={selectedCap}
                onChange={(e) => setSelectedCap(e.target.value)}
              >
                <option value="all">All ({currentPool.length})</option>
                <option value="Large">Large ({currentPool.filter((s) => s.cap === "Large").length})</option>
                <option value="Mid">Mid ({currentPool.filter((s) => s.cap === "Mid").length})</option>
                <option value="Small">Small ({currentPool.filter((s) => s.cap === "Small").length})</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Phone View Content: Table View OR Chart View */}
        {activeMainTab === "table" ? (
          <div className="space-y-3 pt-1">
            {/* Stock Cards List */}
            {sortedStocks.length > 0 ? (
              <div className="space-y-2">
                {sortedStocks.map((stock, idx) => {
                  const qty = subView === "demat" ? (Number(stock.qLeft) || 0) : (Number(stock.bQty) || 0);
                  const price = Number(stock.bShare) || Number(stock.bFShare) || 0;
                  const capital = qty * price;
                  const periodDays = subView === "demat"
                    ? (stock.bDate ? dayjs().diff(dayjs(stock.bDate), "day") : 0)
                    : (Number(stock.period) || (stock.sDate && stock.sDate !== "-" && stock.bDate ? dayjs(stock.sDate).diff(dayjs(stock.bDate), "day") : 0));
                  const gainRs = Number(stock.gainRs) || 0;
                  const gainPct = Number(stock.gainPct) || 0;

                  return (
                    <div
                      key={`phone-stock-${stock._id || stock.id || idx}`}
                      className="bg-base-200/70 dark:bg-base-800/60 border border-base-300/60 rounded-2xl p-2.5 space-y-1.5 shadow-2xs"
                    >
                      {/* Row 1: Stock Name, Cap Badge, and Capital Value */}
                      <div className="flex items-center justify-between text-xs font-bold gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[10px] font-bold text-base-content/40 shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-base-content font-extrabold text-xs truncate">
                            {stock.name}
                          </span>
                          {stock.cap && (
                            <span
                              className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0 ${
                                stock.cap === "Large"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : stock.cap === "Mid"
                                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {stock.cap}
                            </span>
                          )}
                        </div>
                        <div className="font-mono font-black text-xs text-base-content shrink-0 whitespace-nowrap">
                          {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(capital)}`}
                        </div>
                      </div>

                      {/* Row 2: Qty, Share Price, Period, and Realized P&L */}
                      <div className="flex items-center justify-between text-[10.5px] font-mono pt-0.5 border-t border-base-300/40 text-base-content/70">
                        <div className="flex items-center gap-1.5">
                          <span>
                            <span className="opacity-50 font-sans">Qty:</span>{" "}
                            <strong className="text-base-content">{qty}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            <span className="opacity-50 font-sans">@</span> ₹
                            <strong className="text-base-content">{price.toFixed(1)}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {periodDays}d
                          </span>
                          {subView !== "demat" && (
                            <span
                              className={`font-black ${
                                gainRs >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {gainRs >= 0 ? "+" : ""}{hideNumbers ? "•••" : formatCurrencyCompact(gainRs)} ({gainPct}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Row 3: Platform / Exchange & Dates */}
                      <div className="flex items-center justify-between text-[9.5px] text-base-content/50 pt-0.5">
                        <div className="flex items-center gap-1">
                          {stock.exchange && (
                            <span className="bg-base-300/60 px-1 py-0.2 rounded font-bold uppercase text-[8.5px]">
                              {stock.exchange}
                            </span>
                          )}
                          {stock.platform && (
                            <span className="truncate max-w-[80px]">
                              {stock.platform}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 font-mono text-[9px]">
                          {stock.bDate && <span>Buy: {dayjs(stock.bDate).format("DD MMM 'YY")}</span>}
                          {stock.sDate && stock.sDate !== "-" && (
                            <span>• Sell: {dayjs(stock.sDate).format("DD MMM 'YY")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs opacity-50 italic bg-base-200/50 rounded-2xl border border-base-300/60">
                No stocks match the selected criteria.
              </div>
            )}

            {/* Horizontal Scrollable Full Ledger Table for Deep Mobile Inspection */}
            <div className="pt-2">
              <div className="flex items-center justify-between pb-1.5 px-0.5">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1">
                  <TableProperties size={11} className="text-primary" /> Full Ledger Table
                </span>
                <Link
                  to="/dashboard/investment/table-entry?tab=stocks"
                  className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                >
                  <ExternalLink size={10} /> Manage Entries
                </Link>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-base-300 max-h-[400px] [scrollbar-width:thin] bg-base-100 shadow-2xs">
                <table className="table table-zebra table-xs w-full text-[11px]">
                  <thead className="bg-base-200 text-base-content/70 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="font-extrabold uppercase text-[9px] w-8 text-center">#</th>
                      <th
                        className="font-extrabold uppercase text-[9px] cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        Stock Name
                      </th>
                      <th
                        className="font-extrabold uppercase text-[9px] cursor-pointer"
                        onClick={() => handleSort("cap")}
                      >
                        Size
                      </th>
                      <th
                        className="font-extrabold uppercase text-[9px] text-right cursor-pointer"
                        onClick={() => handleSort(subView === "demat" ? "qLeft" : "bQty")}
                      >
                        {subView === "demat" ? "Qty Left" : "Qty"}
                      </th>
                      <th
                        className="font-extrabold uppercase text-[9px] text-right cursor-pointer"
                        onClick={() => handleSort("bShare")}
                      >
                        Price
                      </th>
                      <th
                        className="font-extrabold uppercase text-[9px] text-right cursor-pointer"
                        onClick={() => handleSort("holdingCapital")}
                      >
                        Capital
                      </th>
                      {subView !== "demat" && (
                        <th
                          className="font-extrabold uppercase text-[9px] text-right cursor-pointer"
                          onClick={() => handleSort("gainRs")}
                        >
                          P&L
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStocks.map((stock, idx) => {
                      const qty = subView === "demat" ? (Number(stock.qLeft) || 0) : (Number(stock.bQty) || 0);
                      const price = Number(stock.bShare) || Number(stock.bFShare) || 0;
                      const capital = qty * price;
                      const gainRs = Number(stock.gainRs) || 0;

                      return (
                        <tr key={`phone-tbl-${stock._id || stock.id || idx}`} className="hover">
                          <td className="font-mono text-[9px] opacity-40 text-center">{idx + 1}</td>
                          <td className="font-bold truncate max-w-[110px]">{stock.name}</td>
                          <td>
                            {stock.cap && (
                              <span
                                className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                                  stock.cap === "Large"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : stock.cap === "Mid"
                                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {stock.cap}
                              </span>
                            )}
                          </td>
                          <td className="font-mono font-bold text-right">{qty}</td>
                          <td className="font-mono text-right">₹{price.toFixed(1)}</td>
                          <td className="font-mono font-black text-right">
                            {hideNumbers ? "••••" : `₹${formatCurrency2Dec(capital)}`}
                          </td>
                          {subView !== "demat" && (
                            <td className="font-mono font-black text-right">
                              <span className={gainRs >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                {gainRs >= 0 ? "+" : ""}{hideNumbers ? "••" : formatCurrencyCompact(gainRs)}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Chart View for Phone */
          <div className="space-y-3 pt-1">
            {/* Donut/Pie Chart Card */}
            <div className="bg-base-200/70 dark:bg-base-800/60 border border-base-300/60 rounded-2xl p-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-300/40 text-xs font-bold">
                <span className="text-base-content flex items-center gap-1.5">
                  <PieChart size={14} className="text-blue-500" />
                  {chartDimension === "stock" ? "Distribution by Stock" : "Distribution by Cap Size"}
                </span>
                <span className="badge badge-xs font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[9.5px]">
                  {pieMetric === "capital" ? "Capital" : "Quantity"}
                </span>
              </div>

              {/* Chart Sub-Controls (Metric, Group, and Chart Type) */}
              <div className="flex items-center justify-between gap-1 text-[10px] overflow-x-auto no-scrollbar pb-2">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-base-content/50 font-bold uppercase text-[9px]">Metric:</span>
                  <div className="join p-0.5 bg-base-100 dark:bg-base-900 rounded-lg border border-base-300/60 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPieMetric("capital")}
                      className={`join-item px-1.5 py-0.5 font-bold rounded-md transition-all cursor-pointer ${
                        pieMetric === "capital" ? "bg-primary text-primary-content text-[9.5px] shadow-xs" : "text-base-content/60 text-[9.5px]"
                      }`}
                    >
                      Capital
                    </button>
                    <button
                      type="button"
                      onClick={() => setPieMetric("quantity")}
                      className={`join-item px-1.5 py-0.5 font-bold rounded-md transition-all cursor-pointer ${
                        pieMetric === "quantity" ? "bg-primary text-primary-content text-[9.5px] shadow-xs" : "text-base-content/60 text-[9.5px]"
                      }`}
                    >
                      Qty
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-base-content/50 font-bold uppercase text-[9px]">Group:</span>
                  <div className="join p-0.5 bg-base-100 dark:bg-base-900 rounded-lg border border-base-300/60 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setChartDimension("stock")}
                      className={`join-item px-1.5 py-0.5 font-bold rounded-md transition-all cursor-pointer ${
                        chartDimension === "stock" ? "bg-primary text-primary-content text-[9.5px] shadow-xs" : "text-base-content/60 text-[9.5px]"
                      }`}
                    >
                      Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartDimension("cap")}
                      className={`join-item px-1.5 py-0.5 font-bold rounded-md transition-all cursor-pointer ${
                        chartDimension === "cap" ? "bg-primary text-primary-content text-[9.5px] shadow-xs" : "text-base-content/60 text-[9.5px]"
                      }`}
                    >
                      Size
                    </button>
                  </div>
                </div>

                <div className="join p-0.5 bg-base-100 dark:bg-base-900 rounded-lg border border-base-300/60 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setChartType("donut")}
                    className={`join-item px-1.5 py-0.5 font-bold rounded-md transition-all cursor-pointer ${
                      chartType === "donut" ? "bg-primary text-primary-content text-[9.5px] shadow-xs" : "text-base-content/60 text-[9.5px]"
                    }`}
                  >
                    Donut
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType("pie")}
                    className={`join-item px-1.5 py-0.5 font-bold rounded-md transition-all cursor-pointer ${
                      chartType === "pie" ? "bg-primary text-primary-content text-[9.5px] shadow-xs" : "text-base-content/60 text-[9.5px]"
                    }`}
                  >
                    Pie
                  </button>
                </div>
              </div>

              <div className="w-full h-[280px] flex items-center justify-center [&_.apexcharts-canvas]:!mx-auto">
                {unifiedChartData.series.length > 0 ? (
                  <Chart
                    key={`phone-chart-${subView}-${pieMetric}-${chartDimension}-${chartType}-${unifiedChartData.labels.join(",")}-${unifiedChartData.series.join(",")}`}
                    options={chartOptions}
                    series={unifiedChartData.series}
                    type={chartType}
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <div className="p-8 text-center text-xs opacity-50 italic">
                    No chart data available for the selected filters.
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown in Normal Document Flow (No nested scrollbar) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-2 px-0.5">
                <h4 className="text-xs font-black tracking-tight text-base-content flex items-center gap-1.5">
                  <span>Price Breakdown</span>
                  <span className="badge badge-xs badge-neutral font-mono font-bold">
                    {unifiedChartData.items.length}
                  </span>
                </h4>
                {/* Search names in breakdown */}
                {unifiedChartData.items.length > 5 && (
                  <div className="relative min-w-[120px] max-w-[160px]">
                    <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={stackSearchQuery}
                      onChange={(e) => setStackSearchQuery(e.target.value)}
                      className="input input-xs input-bordered w-full pl-5 pr-4 text-[10.5px] rounded-lg focus:input-primary bg-base-100 dark:bg-base-800 h-6"
                    />
                    {stackSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStackSearchQuery("")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                      >
                        <X size={9} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Breakdown items in normal flow (NO max-h, NO overflow-y-auto, NO extra scrollbar!) */}
              <div className="space-y-1.5">
                {displayedStackItems.length === 0 ? (
                  <div className="p-4 text-center text-xs opacity-50 italic bg-base-200/50 rounded-2xl border border-base-300/60">
                    No matches found in breakdown.
                  </div>
                ) : (
                  displayedStackItems.map((item, idx) => (
                    <div
                      key={`phone-stack-${item.name}-${idx}`}
                      className="p-2.5 rounded-xl bg-base-200/80 dark:bg-base-800/80 border border-base-300/70 space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[9px] text-base-content/40 font-bold shrink-0">
                            #{idx + 1}
                          </span>
                          <span
                            className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-extrabold text-[11px] truncate text-base-content" title={item.name}>
                            {item.name}
                          </span>
                          {item.cap && chartDimension === "stock" && (
                            <span
                              className={`text-[8px] font-black uppercase px-1 py-0.2 rounded shrink-0 ${
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono font-bold text-[10.5px] text-base-content">
                            {hideNumbers
                              ? "••••"
                              : unifiedChartData.isCapital
                              ? `₹${formatCurrency2Dec(item.value)}`
                              : `${item.value.toLocaleString()} shs`}
                          </span>
                          <span className="badge badge-xs badge-neutral font-mono font-black text-[9px]">
                            {item.pct}%
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-base-300/70 dark:bg-base-700/60 h-1 rounded-full overflow-hidden">
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
          </div>
        )}
      </div>
    </div>
  );
}
