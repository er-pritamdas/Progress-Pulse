import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import {
  Landmark,
  PiggyBank,
  Coins,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Percent,
  ArrowUpRight,
  Search,
  Building2,
  Filter,
  TableProperties,
  PieChart,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
  Plus,
  Info,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  Zap,
  ArrowDownRight,
  AlertCircle
} from "lucide-react";
import { calculateFdMaturity } from "./AddFixedDepositModal";
import FixedDepositInfoModal from "./FixedDepositInfoModal";
import AddFixedDepositModal from "./AddFixedDepositModal";
import WithdrawFdModal from "./WithdrawFdModal";
import axiosInstance from "../../../Context/AxiosInstance";

// Palette for visual pie & donut charts
const CHART_COLORS = [
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#ef4444", // Rose
  "#84cc16", // Lime
  "#a855f7", // Fuchsia
];

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

export default function FixedDepositDashboard({
  fdData = [],
  loading = false,
  onRefresh,
}) {
  // Main view tab: "table" | "chart"
  const [activeMainTab, setActiveMainTab] = useState(() => {
    return localStorage.getItem("pulse_fd_dash_tab") || "table";
  });

  const handleTabChange = (tab) => {
    setActiveMainTab(tab);
    localStorage.setItem("pulse_fd_dash_tab", tab);
  };

  // Sub-view filter by status: "all" | "active" | "matured" | "withdrawn"
  const [statusFilter, setStatusFilter] = useState("all");

  // Bank dropdown filter: "all" | bankName
  const [bankFilter, setBankFilter] = useState("all");

  // Global search input
  const [searchQuery, setSearchQuery] = useState("");

  // Privacy mask toggle
  const [hideNumbers, setHideNumbers] = useState(() => {
    return localStorage.getItem("pulse_fd_hide_numbers") === "true";
  });

  const toggleHideNumbers = () => {
    setHideNumbers((prev) => {
      const next = !prev;
      localStorage.setItem("pulse_fd_hide_numbers", String(next));
      return next;
    });
  };

  // Table Sorting state
  const [sortField, setSortField] = useState("maturityDate");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Analytics Chart metric & options
  // Options: "principal" | "maturity" | "interest" | "rates" | "status"
  const [chartMetric, setChartMetric] = useState("principal");
  const [chartType, setChartType] = useState("donut"); // "donut" | "pie"
  const [bankStackSearch, setBankStackSearch] = useState("");

  // Modals state
  const [selectedInfoFd, setSelectedInfoFd] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const [editingFd, setEditingFd] = useState(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);

  const [withdrawingFd, setWithdrawingFd] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // --------------------------------------------------------------------------
  // Process & Enrich all Raw FDs
  // --------------------------------------------------------------------------
  const enrichedFds = useMemo(() => {
    const today = dayjs();

    return (fdData || []).map((fd, idx) => {
      const principal = Number(
        fd.amount !== undefined && fd.amount !== null && fd.amount !== ""
          ? fd.amount
          : (fd.transactions?.[0]?.amtDeposit || fd.transactions?.[0]?.amount || 0)
      );

      const interestRate = Number(fd.interestRate) || 0;
      const tenureYears = fd.tenureYears ?? (fd.tenureUnit === "Years" ? fd.tenureValue : 0);
      const tenureMonths = fd.tenureMonths ?? (fd.tenureUnit === "Months" ? fd.tenureValue : 0);
      const tenureDays = fd.tenureDays ?? (fd.tenureUnit === "Days" ? fd.tenureValue : 0);

      const calculations = calculateFdMaturity({
        principal,
        interestRate,
        tenureYears,
        tenureMonths,
        tenureDays,
        startDate: fd.startDate,
        compoundingFrequency: fd.compoundingFrequency || "Quarterly",
      });

      const start = dayjs(fd.startDate);
      const maturity = dayjs(fd.maturityDate || calculations.maturityDate);

      const totalDays = Math.max(1, maturity.diff(start, "day"));
      const daysPassed = Math.max(0, today.diff(start, "day"));
      const daysRemaining = Math.max(0, maturity.diff(today, "day"));
      const progressPercent = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
      const isMatured = today.isAfter(maturity) || daysRemaining === 0;
      const isWithdrawn = !!fd.isWithdrawn;

      const maturityAmount = Number(
        fd.maturityAmount || calculations.maturityAmount || principal
      );
      const expectedInterest = Math.max(0, maturityAmount - principal);

      let statusCategory = "active";
      let statusLabel = "Active Deposit";
      let statusBadgeClass = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";

      if (isWithdrawn) {
        statusCategory = "withdrawn";
        statusLabel = "Withdrawn";
        statusBadgeClass = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      } else if (isMatured) {
        statusCategory = "matured";
        statusLabel = "Matured";
        statusBadgeClass = "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      }

      return {
        ...fd,
        id: fd.id || fd._id?.toString() || `fd-${idx}`,
        principal,
        interestRate,
        tenureText: fd.tenureText || `${fd.tenureValue || 1} ${fd.tenureUnit || "Years"}`,
        startDateStr: fd.startDate,
        maturityDateStr: fd.maturityDate || calculations.maturityDate,
        maturityAmount,
        expectedInterest,
        totalDays,
        daysPassed,
        daysRemaining,
        progressPercent,
        isMatured,
        isWithdrawn,
        statusCategory,
        statusLabel,
        statusBadgeClass,
      };
    });
  }, [fdData]);

  // Unique list of banks
  const availableBanks = useMemo(() => {
    return Array.from(new Set(enrichedFds.map((f) => f.bankName).filter(Boolean))).sort();
  }, [enrichedFds]);

  // --------------------------------------------------------------------------
  // Filtered FDs (by Status, Bank, and Search)
  // --------------------------------------------------------------------------
  const filteredFds = useMemo(() => {
    return enrichedFds.filter((f) => {
      // Status Filter
      if (statusFilter !== "all" && f.statusCategory !== statusFilter) {
        return false;
      }
      // Bank Filter
      if (bankFilter !== "all" && f.bankName !== bankFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBank = (f.bankName || "").toLowerCase().includes(q);
        const matchScheme = (f.schemeName || "").toLowerCase().includes(q);
        const matchNumber = (f.fdNumber || "").toLowerCase().includes(q);
        if (!matchBank && !matchScheme && !matchNumber) return false;
      }
      return true;
    });
  }, [enrichedFds, statusFilter, bankFilter, searchQuery]);

  // --------------------------------------------------------------------------
  // Sorted FDs
  // --------------------------------------------------------------------------
  const sortedFds = useMemo(() => {
    const list = [...filteredFds];
    list.sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case "bankName":
          valA = (a.bankName || "").toLowerCase();
          valB = (b.bankName || "").toLowerCase();
          return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case "principal":
          valA = a.principal;
          valB = b.principal;
          break;
        case "interestRate":
          valA = a.interestRate;
          valB = b.interestRate;
          break;
        case "maturityDate":
          valA = dayjs(a.maturityDateStr).valueOf() || 0;
          valB = dayjs(b.maturityDateStr).valueOf() || 0;
          break;
        case "maturityAmount":
          valA = a.maturityAmount;
          valB = b.maturityAmount;
          break;
        case "expectedInterest":
          valA = a.expectedInterest;
          valB = b.expectedInterest;
          break;
        case "progressPercent":
          valA = a.progressPercent;
          valB = b.progressPercent;
          break;
        default:
          valA = dayjs(a.maturityDateStr).valueOf() || 0;
          valB = dayjs(b.maturityDateStr).valueOf() || 0;
      }

      if (sortDirection === "asc") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
    return list;
  }, [filteredFds, sortField, sortDirection]);

  // --------------------------------------------------------------------------
  // Top Level KPIs / Summary Metrics
  // --------------------------------------------------------------------------
  const kpis = useMemo(() => {
    const activeList = enrichedFds.filter((f) => !f.isWithdrawn);
    const withdrawnList = enrichedFds.filter((f) => f.isWithdrawn);

    const activePrincipal = activeList.reduce((sum, f) => sum + f.principal, 0);
    const activeMaturity = activeList.reduce((sum, f) => sum + f.maturityAmount, 0);
    const activeInterest = Math.max(0, activeMaturity - activePrincipal);

    // Weighted Average Interest Rate
    let weightedRate = 0;
    if (activePrincipal > 0) {
      const sumProduct = activeList.reduce((sum, f) => sum + f.principal * f.interestRate, 0);
      weightedRate = sumProduct / activePrincipal;
    } else if (activeList.length > 0) {
      weightedRate = activeList.reduce((sum, f) => sum + f.interestRate, 0) / activeList.length;
    }

    // Realized Payout from Withdrawn/Matured Deposits
    const realizedPayout = withdrawnList.reduce((sum, f) => {
      const payout = Number(f.totalPayout || f.realizedPrincipal || f.maturityAmount || f.principal);
      return sum + payout;
    }, 0);

    const realizedGain = withdrawnList.reduce((sum, f) => {
      return sum + Number(f.realizedGain || f.realizedInterest || 0);
    }, 0);

    const activeCount = enrichedFds.filter((f) => f.statusCategory === "active").length;
    const maturedCount = enrichedFds.filter((f) => f.statusCategory === "matured").length;
    const withdrawnCount = enrichedFds.filter((f) => f.statusCategory === "withdrawn").length;

    const returnPct = activePrincipal > 0 ? (activeInterest / activePrincipal) * 100 : 0;

    return {
      activePrincipal,
      activeMaturity,
      activeInterest,
      weightedRate,
      realizedPayout,
      realizedGain,
      returnPct,
      totalCount: enrichedFds.length,
      activeCount,
      maturedCount,
      withdrawnCount,
    };
  }, [enrichedFds]);

  // --------------------------------------------------------------------------
  // Table Summary Totals for currently filtered rows
  // --------------------------------------------------------------------------
  const tableTotals = useMemo(() => {
    const totalPrincipal = sortedFds.reduce((sum, f) => sum + f.principal, 0);
    const totalMaturity = sortedFds.reduce((sum, f) => sum + f.maturityAmount, 0);
    const totalInterest = Math.max(0, totalMaturity - totalPrincipal);

    let avgRate = 0;
    if (totalPrincipal > 0) {
      const sumProd = sortedFds.reduce((sum, f) => sum + f.principal * f.interestRate, 0);
      avgRate = sumProd / totalPrincipal;
    } else if (sortedFds.length > 0) {
      avgRate = sortedFds.reduce((sum, f) => sum + f.interestRate, 0) / sortedFds.length;
    }

    return { totalPrincipal, totalMaturity, totalInterest, avgRate };
  }, [sortedFds]);

  // --------------------------------------------------------------------------
  // Analytics & Visual Chart Computations
  // --------------------------------------------------------------------------
  const bankAnalytics = useMemo(() => {
    const map = {};
    enrichedFds.forEach((f) => {
      const b = f.bankName || "Other";
      if (!map[b]) {
        map[b] = {
          bankName: b,
          count: 0,
          activeCount: 0,
          principal: 0,
          maturityAmount: 0,
          expectedInterest: 0,
          sumRatePrincipal: 0,
        };
      }
      map[b].count += 1;
      if (!f.isWithdrawn) {
        map[b].activeCount += 1;
        map[b].principal += f.principal;
        map[b].maturityAmount += f.maturityAmount;
        map[b].expectedInterest += f.expectedInterest;
        map[b].sumRatePrincipal += f.principal * f.interestRate;
      }
    });

    const totalPortfolioPrincipal = Object.values(map).reduce((sum, b) => sum + b.principal, 0);

    const list = Object.values(map).map((b) => {
      const avgRate = b.principal > 0 ? b.sumRatePrincipal / b.principal : 0;
      const pct = totalPortfolioPrincipal > 0 ? (b.principal / totalPortfolioPrincipal) * 100 : 0;
      return {
        ...b,
        avgRate,
        pct: Number(pct.toFixed(1)),
      };
    });

    list.sort((a, b) => b.principal - a.principal);
    return list;
  }, [enrichedFds]);

  // Filtered Stack of Banks (searchable)
  const displayedBankStack = useMemo(() => {
    if (!bankStackSearch.trim()) return bankAnalytics;
    const q = bankStackSearch.toLowerCase();
    return bankAnalytics.filter((b) => b.bankName.toLowerCase().includes(q));
  }, [bankAnalytics, bankStackSearch]);

  // Chart Data based on selected chartMetric
  const chartData = useMemo(() => {
    if (chartMetric === "status") {
      const series = [kpis.activeCount, kpis.maturedCount, kpis.withdrawnCount];
      const labels = ["Active Deposits", "Matured", "Withdrawn"];
      const colors = ["#10b981", "#3b82f6", "#f59e0b"];
      const total = series.reduce((a, b) => a + b, 0);
      return { series, labels, colors, total, isCurrency: false, unit: "Deposits" };
    }

    if (chartMetric === "rates") {
      // Bar chart comparing rates per bank
      const labels = bankAnalytics.map((b) => b.bankName);
      const series = [{ name: "Avg Rate (% p.a.)", data: bankAnalytics.map((b) => Number(b.avgRate.toFixed(2))) }];
      const colors = ["#f59e0b"];
      return { series, labels, colors, isBar: true };
    }

    // Default: Group by Bank (principal, maturity, or interest)
    const labels = bankAnalytics.map((b) => b.bankName);
    let series = [];
    let total = 0;

    if (chartMetric === "maturity") {
      series = bankAnalytics.map((b) => Math.round(b.maturityAmount));
      total = series.reduce((a, b) => a + b, 0);
    } else if (chartMetric === "interest") {
      series = bankAnalytics.map((b) => Math.round(b.expectedInterest));
      total = series.reduce((a, b) => a + b, 0);
    } else {
      // "principal"
      series = bankAnalytics.map((b) => Math.round(b.principal));
      total = series.reduce((a, b) => a + b, 0);
    }

    const colors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
    return { series, labels, colors, total, isCurrency: true, isBar: false };
  }, [chartMetric, bankAnalytics, kpis]);

  // ApexChart Options
  const chartOptions = useMemo(() => {
    if (chartData.isBar) {
      return {
        chart: {
          type: "bar",
          background: "transparent",
          toolbar: { show: false },
          fontFamily: "inherit",
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            columnWidth: "45%",
            distributed: true,
            dataLabels: { position: "top" },
          },
        },
        colors: CHART_COLORS,
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val}%`,
          offsetY: -20,
          style: { fontSize: "12px", fontWeight: 700, colors: ["#94a3b8"] },
        },
        xaxis: {
          categories: chartData.labels,
          labels: { style: { fontSize: "11px", fontWeight: 600 } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            formatter: (val) => `${val}%`,
            style: { fontSize: "11px" },
          },
        },
        grid: {
          borderColor: "rgba(148, 163, 184, 0.15)",
          strokeDashArray: 4,
        },
        legend: { show: false },
        tooltip: {
          theme: "dark",
          y: { formatter: (val) => `${val}% p.a.` },
        },
      };
    }

    return {
      chart: {
        type: chartType,
        background: "transparent",
        fontFamily: "inherit",
        toolbar: { show: false },
        animations: { enabled: true, speed: 400 },
      },
      labels: chartData.labels,
      colors: chartData.colors,
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: { show: true, fontSize: "13px", fontWeight: 700, color: "#94a3b8" },
              value: {
                show: true,
                fontSize: "18px",
                fontWeight: 800,
                fontFamily: "monospace",
                color: "currentColor",
                formatter: (val) =>
                  chartData.isCurrency ? formatCurrencyCompact(val) : `${val} ${chartData.unit || ""}`,
              },
              total: {
                show: true,
                label:
                  chartMetric === "maturity"
                    ? "Total Maturity"
                    : chartMetric === "interest"
                    ? "Total Interest"
                    : chartMetric === "status"
                    ? "Total FDs"
                    : "Total Principal",
                fontSize: "11px",
                fontWeight: 700,
                color: "#64748b",
                formatter: () =>
                  chartData.isCurrency ? formatCurrencyCompact(chartData.total) : `${chartData.total}`,
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      stroke: { colors: ["rgba(0,0,0,0.1)"], width: 1.5 },
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "12px",
        fontWeight: 600,
        markers: { radius: 6 },
        itemMargin: { horizontal: 8, vertical: 4 },
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val) =>
            chartData.isCurrency ? `₹${formatCurrency2Dec(val)}` : `${val} ${chartData.unit || ""}`,
        },
      },
    };
  }, [chartData, chartMetric, chartType]);

  // --------------------------------------------------------------------------
  // Save / Action Handlers
  // --------------------------------------------------------------------------
  const handleSaveFixedDeposit = async (fdPayload) => {
    const editId = editingFd?.id || editingFd?._id;
    try {
      if (editId) {
        await axiosInstance.put(`/v1/dashboard/investment/fd/${editId}`, fdPayload);
      } else {
        await axiosInstance.post("/v1/dashboard/investment/fd", fdPayload);
      }
      setIsAddEditModalOpen(false);
      setEditingFd(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to save fixed deposit:", error);
      alert("Failed to save Fixed Deposit: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveSettlement = async (settlementPayload) => {
    const fdId = settlementPayload.id || settlementPayload._id || withdrawingFd?.id || withdrawingFd?._id;
    if (!fdId) return;
    try {
      await axiosInstance.put(`/v1/dashboard/investment/fd/${fdId}`, settlementPayload);
      setIsWithdrawModalOpen(false);
      setWithdrawingFd(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to save settlement:", error);
      alert("Failed to record settlement: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteFd = async (fdId) => {
    if (!window.confirm("Are you sure you want to permanently delete this Fixed Deposit?")) return;
    try {
      await axiosInstance.delete(`/v1/dashboard/investment/fd/${fdId}`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to delete fixed deposit:", error);
      alert("Failed to delete Fixed Deposit: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------------- */}
      {/* Top Header & Sub-Navigation Bar */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-base-100 rounded-3xl p-4 sm:p-5 border border-base-300 dark:border-base-content/15 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Status Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              statusFilter === "all"
                ? "bg-primary text-primary-content border-primary shadow-sm"
                : "bg-base-200/70 hover:bg-base-200 border-base-300 text-base-content/70"
            }`}
          >
            <span>All Deposits</span>
            <span className="badge badge-xs bg-base-100 text-base-content font-mono px-1.5">
              {kpis.totalCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              statusFilter === "active"
                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Active</span>
            <span className="badge badge-xs bg-base-100 text-emerald-600 font-mono px-1.5">
              {kpis.activeCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("matured")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              statusFilter === "matured"
                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                : "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Matured</span>
            <span className="badge badge-xs bg-base-100 text-blue-600 font-mono px-1.5">
              {kpis.maturedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("withdrawn")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              statusFilter === "withdrawn"
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Withdrawn</span>
            <span className="badge badge-xs bg-base-100 text-amber-600 font-mono px-1.5">
              {kpis.withdrawnCount}
            </span>
          </button>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          {/* Main Tab Toggle: Table vs Analytics */}
          <div className="bg-base-200/80 p-1 rounded-2xl border border-base-300/60 flex items-center">
            <button
              onClick={() => handleTabChange("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeMainTab === "table"
                  ? "bg-base-100 text-primary shadow-xs"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>

            <button
              onClick={() => handleTabChange("chart")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeMainTab === "chart"
                  ? "bg-base-100 text-primary shadow-xs"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Analytics & Charts</span>
            </button>
          </div>

          {/* Privacy Eye Button */}
          <button
            onClick={toggleHideNumbers}
            className="btn btn-ghost btn-sm rounded-xl border border-base-300 text-base-content/70 hover:text-base-content"
            title={hideNumbers ? "Show Numbers" : "Hide Numbers (Privacy Mode)"}
          >
            {hideNumbers ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* New FD Button */}
          <button
            onClick={() => {
              setEditingFd(null);
              setIsAddEditModalOpen(true);
            }}
            className="btn btn-primary btn-sm rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FD</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Top Metric KPI Cards */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Active Principal Deposited */}
        <div className="bg-base-100 rounded-3xl p-5 border border-base-300 dark:border-base-content/15 shadow-xs flex flex-col justify-between group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Active Principal
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-base-content">
              {hideNumbers ? "••••••••" : `₹${formatCurrency2Dec(kpis.activePrincipal)}`}
            </div>
            <p className="text-[11px] text-base-content/60 font-medium mt-1 flex items-center gap-1">
              <span>Across {kpis.activeCount} active deposit{kpis.activeCount !== 1 ? "s" : ""}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Estimated Maturity Amount */}
        <div className="bg-base-100 rounded-3xl p-5 border border-base-300 dark:border-base-content/15 shadow-xs flex flex-col justify-between group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Maturity Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {hideNumbers ? "••••••••" : `₹${formatCurrency2Dec(kpis.activeMaturity)}`}
            </div>
            <p className="text-[11px] text-base-content/60 font-medium mt-1">
              Expected at full maturity
            </p>
          </div>
        </div>

        {/* Card 3: Expected Interest / Accrued Gain */}
        <div className="bg-base-100 rounded-3xl p-5 border border-base-300 dark:border-base-content/15 shadow-xs flex flex-col justify-between group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Expected Interest
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400">
              {hideNumbers ? "••••••••" : `+₹${formatCurrency2Dec(kpis.activeInterest)}`}
            </div>
            <p className="text-[11px] text-base-content/60 font-medium mt-1 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                +{kpis.returnPct.toFixed(2)}%
              </span>
              <span>projected growth</span>
            </p>
          </div>
        </div>

        {/* Card 4: Weighted Average Rate */}
        <div className="bg-base-100 rounded-3xl p-5 border border-base-300 dark:border-base-content/15 shadow-xs flex flex-col justify-between group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Avg Interest Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
              {kpis.weightedRate.toFixed(2)}%
            </div>
            <p className="text-[11px] text-base-content/60 font-medium mt-1">
              Weighted p.a. return rate
            </p>
          </div>
        </div>

        {/* Card 5: Realized Payout (Withdrawn) */}
        <div className="bg-base-100 rounded-3xl p-5 border border-base-300 dark:border-base-content/15 shadow-xs flex flex-col justify-between group hover:border-teal-500/40 transition-all">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-base-content/60 uppercase tracking-wider">
              Realized Payout
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono tracking-tight text-teal-600 dark:text-teal-400">
              {hideNumbers ? "••••••••" : `₹${formatCurrency2Dec(kpis.realizedPayout)}`}
            </div>
            <p className="text-[11px] text-base-content/60 font-medium mt-1">
              From {kpis.withdrawnCount} settled deposit{kpis.withdrawnCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TAB 1: TABLE VIEW */}
      {/* -------------------------------------------------------------------- */}
      {activeMainTab === "table" && (
        <div className="bg-base-100 rounded-3xl border border-base-300 dark:border-base-content/15 shadow-xs overflow-hidden flex flex-col">
          
          {/* Table Control Bar: Search & Bank Selector */}
          <div className="p-4 border-b border-base-300 dark:border-base-content/15 bg-base-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Search Bank, Scheme, FD #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm w-full pl-9 rounded-xl bg-base-200/60 border-base-300 text-xs font-medium focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Bank Filter & Action */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="select select-sm rounded-xl bg-base-200/60 border-base-300 text-xs font-medium focus:outline-none focus:border-primary"
              >
                <option value="all">All Banks ({availableBanks.length})</option>
                {availableBanks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <Link
                to="/dashboard/investment/table-entry"
                className="btn btn-ghost btn-sm rounded-xl text-xs font-semibold text-primary hover:bg-primary/10 gap-1 border border-primary/20"
                title="Go to Table Entry to manage deposits"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table Entry</span>
              </Link>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto w-full">
            <table className="table table-sm w-full text-left">
              <thead className="bg-base-200/50 text-[11px] font-bold text-base-content/60 uppercase tracking-wider border-b border-base-300">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-base-content select-none"
                    onClick={() => handleSort("bankName")}
                  >
                    <div className="flex items-center gap-1">
                      <span># & Bank Name</span>
                      {sortField === "bankName" ? (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  <th className="py-3 px-4">Scheme / FD #</th>

                  <th className="py-3 px-4">Status</th>

                  <th
                    className="py-3 px-4 cursor-pointer hover:text-base-content select-none"
                    onClick={() => handleSort("principal")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Principal</span>
                      {sortField === "principal" ? (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  <th
                    className="py-3 px-4 cursor-pointer hover:text-base-content select-none"
                    onClick={() => handleSort("interestRate")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Rate (% p.a.)</span>
                      {sortField === "interestRate" ? (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  <th className="py-3 px-4">Tenure</th>

                  <th
                    className="py-3 px-4 cursor-pointer hover:text-base-content select-none"
                    onClick={() => handleSort("maturityDate")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Maturity Date</span>
                      {sortField === "maturityDate" ? (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  <th
                    className="py-3 px-4 cursor-pointer hover:text-base-content select-none min-w-[140px]"
                    onClick={() => handleSort("progressPercent")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Tenure Progress</span>
                      {sortField === "progressPercent" ? (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  <th
                    className="py-3 px-4 cursor-pointer hover:text-base-content select-none"
                    onClick={() => handleSort("maturityAmount")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Maturity Amt</span>
                      {sortField === "maturityAmount" ? (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  <th
                    className="py-3 px-4 cursor-pointer hover:text-base-content select-none"
                    onClick={() => handleSort("expectedInterest")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Expected Gain</span>
                      {sortField === "expectedInterest" ? (
                        sortDirection === "asc" ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                      ) : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>

                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-base-200 text-xs">
                {sortedFds.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-12 text-base-content/60">
                      <Landmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-semibold text-sm">No Fixed Deposits found matching your criteria.</p>
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          setBankFilter("all");
                          setSearchQuery("");
                        }}
                        className="btn btn-ghost btn-xs text-primary mt-2"
                      >
                        Clear Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  sortedFds.map((fd, idx) => (
                    <tr
                      key={fd.id}
                      className="hover:bg-base-200/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedInfoFd(fd);
                        setIsInfoModalOpen(true);
                      }}
                    >
                      {/* Bank Name */}
                      <td className="py-3.5 px-4 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono opacity-50 bg-base-200 px-1.5 py-0.5 rounded border border-base-300 shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-base-content group-hover:text-primary transition-colors font-black">
                            {fd.bankName}
                          </span>
                        </div>
                      </td>

                      {/* Scheme / Number */}
                      <td className="py-3.5 px-4 font-medium text-base-content/80">
                        <div className="truncate max-w-[150px]" title={fd.schemeName || fd.fdNumber}>
                          {fd.schemeName || fd.fdNumber || "Regular FD"}
                        </div>
                        {fd.fdNumber && fd.schemeName && (
                          <div className="text-[10px] text-base-content/50 font-mono truncate max-w-[150px]">
                            {fd.fdNumber}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shrink-0 inline-block ${fd.statusBadgeClass}`}>
                          {fd.statusLabel}
                        </span>
                      </td>

                      {/* Principal */}
                      <td className="py-3.5 px-4 font-mono font-bold text-base-content">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(fd.principal)}`}
                      </td>

                      {/* Interest Rate */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {fd.interestRate.toFixed(2)}%
                      </td>

                      {/* Tenure */}
                      <td className="py-3.5 px-4 text-base-content/70 font-medium">
                        {fd.tenureText}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="font-semibold text-base-content">
                          {dayjs(fd.maturityDateStr).format("DD MMM YYYY")}
                        </div>
                        <div className="text-[10px] text-base-content/50">
                          Started: {dayjs(fd.startDateStr).format("DD MMM YYYY")}
                        </div>
                      </td>

                      {/* Tenure Progress Bar */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="font-bold text-primary">{fd.progressPercent}%</span>
                          <span className="text-base-content/50">
                            {fd.isMatured ? "Matured" : `${fd.daysRemaining}d left`}
                          </span>
                        </div>
                        <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              fd.isWithdrawn
                                ? "bg-amber-500"
                                : fd.isMatured
                                ? "bg-blue-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${fd.progressPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Maturity Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(fd.maturityAmount)}`}
                      </td>

                      {/* Expected Gain */}
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {hideNumbers ? "••••••" : `+₹${formatCurrency2Dec(fd.expectedInterest)}`}
                      </td>

                      {/* Action Icons */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedInfoFd(fd);
                              setIsInfoModalOpen(true);
                            }}
                            className="btn btn-ghost btn-xs p-1 rounded-lg hover:bg-base-200 text-base-content/70 hover:text-primary"
                            title="View Full Deposit Details"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setEditingFd(fd);
                              setIsAddEditModalOpen(true);
                            }}
                            className="btn btn-ghost btn-xs p-1 rounded-lg hover:bg-base-200 text-base-content/70 hover:text-primary"
                            title="Edit Deposit Parameters"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {!fd.isWithdrawn && (
                            <button
                              onClick={() => {
                                setWithdrawingFd(fd);
                                setIsWithdrawModalOpen(true);
                              }}
                              className="btn btn-ghost btn-xs p-1 rounded-lg hover:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              title="Withdraw / Settle Deposit"
                            >
                              <Coins className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteFd(fd.id)}
                            className="btn btn-ghost btn-xs p-1 rounded-lg hover:bg-rose-500/15 text-rose-500 hover:text-rose-600"
                            title="Delete Deposit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Table Footer Totals */}
              {sortedFds.length > 0 && (
                <tfoot className="bg-base-200/70 border-t border-base-300 font-bold text-xs">
                  <tr>
                    <td colSpan="3" className="py-3 px-4 text-base-content uppercase tracking-wider">
                      Portfolio Totals ({sortedFds.length} Deposits)
                    </td>
                    <td className="py-3 px-4 font-mono text-base-content">
                      {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(tableTotals.totalPrincipal)}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400">
                      {tableTotals.avgRate.toFixed(2)}% avg
                    </td>
                    <td colSpan="3"></td>
                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                      {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(tableTotals.totalMaturity)}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-purple-600 dark:text-purple-400">
                      {hideNumbers ? "••••••" : `+₹${formatCurrency2Dec(tableTotals.totalInterest)}`}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* TAB 2: ANALYTICS & CHARTS VIEW */}
      {/* -------------------------------------------------------------------- */}
      {activeMainTab === "chart" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive ApexChart (7 Cols) */}
          <div className="lg:col-span-7 bg-base-100 rounded-3xl border border-base-300 dark:border-base-content/15 p-5 shadow-xs flex flex-col justify-between">
            
            {/* Chart Top Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-base-300/60 pb-4">
              <div>
                <h3 className="font-black text-base text-base-content">
                  Fixed Deposit Allocation
                </h3>
                <p className="text-xs text-base-content/60 font-medium">
                  Visual distribution & interest benchmarking across portfolios
                </p>
              </div>

              {/* Metric Selector Dropdown */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value)}
                  className="select select-sm rounded-xl bg-base-200/80 border-base-300 text-xs font-bold focus:outline-none focus:border-primary"
                >
                  <option value="principal">Principal by Bank</option>
                  <option value="maturity">Maturity Value by Bank</option>
                  <option value="interest">Expected Interest by Bank</option>
                  <option value="rates">Interest Rate Comparison</option>
                  <option value="status">Deposit Status Breakdown</option>
                </select>

                {/* Donut vs Pie Toggle (for non-bar charts) */}
                {!chartData.isBar && (
                  <div className="bg-base-200 p-1 rounded-xl flex items-center border border-base-300">
                    <button
                      onClick={() => setChartType("donut")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        chartType === "donut"
                          ? "bg-base-100 text-primary shadow-xs"
                          : "text-base-content/60 hover:text-base-content"
                      }`}
                    >
                      Donut
                    </button>
                    <button
                      onClick={() => setChartType("pie")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        chartType === "pie"
                          ? "bg-base-100 text-primary shadow-xs"
                          : "text-base-content/60 hover:text-base-content"
                      }`}
                    >
                      Pie
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ApexChart Render */}
            <div className="py-6 flex items-center justify-center min-h-[380px]">
              {bankAnalytics.length === 0 ? (
                <div className="text-center text-base-content/50 py-12">
                  <PieChart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-sm">No Fixed Deposit records to visualize.</p>
                </div>
              ) : (
                <div className="w-full max-w-[480px]">
                  <Chart
                    options={chartOptions}
                    series={chartData.series}
                    type={chartData.isBar ? "bar" : chartType}
                    height={360}
                  />
                </div>
              )}
            </div>

            {/* Bottom Summary Bar */}
            <div className="border-t border-base-300/60 pt-4 flex items-center justify-between text-xs text-base-content/60 font-medium">
              <span>Total Capital Represented:</span>
              <span className="font-mono font-bold text-base-content text-sm">
                {hideNumbers ? "••••••••" : `₹${formatCurrency2Dec(kpis.activePrincipal)}`}
              </span>
            </div>
          </div>

          {/* Right Column: Stack of Bank Breakdown Cards (5 Cols) */}
          <div className="lg:col-span-5 bg-base-100 rounded-3xl border border-base-300 dark:border-base-content/15 p-5 shadow-xs flex flex-col justify-between">
            
            {/* Header with Search */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <h3 className="font-black text-base text-base-content">
                    Banks Breakdown
                  </h3>
                </div>
                <span className="badge badge-sm font-mono font-bold bg-base-200">
                  {bankAnalytics.length} Banks
                </span>
              </div>

              {/* Local Search for Banks */}
              <div className="relative mb-4">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Filter bank stack..."
                  value={bankStackSearch}
                  onChange={(e) => setBankStackSearch(e.target.value)}
                  className="input input-sm w-full pl-8 rounded-xl bg-base-200/60 border-base-300 text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              {/* Stack List */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {displayedBankStack.length === 0 ? (
                  <div className="text-center py-8 text-base-content/50 text-xs">
                    No bank matches "{bankStackSearch}"
                  </div>
                ) : (
                  displayedBankStack.map((bank, idx) => {
                    const color = CHART_COLORS[idx % CHART_COLORS.length];
                    return (
                      <div
                        key={bank.bankName}
                        onClick={() => {
                          setBankFilter(bank.bankName);
                          setActiveMainTab("table");
                        }}
                        className="bg-base-200/50 hover:bg-base-200 p-3.5 rounded-2xl border border-base-300/60 hover:border-primary/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <h4 className="font-bold text-xs text-base-content truncate group-hover:text-primary transition-colors">
                              {bank.bankName}
                            </h4>
                          </div>
                          <span className="font-mono text-xs font-bold text-base-content shrink-0">
                            {hideNumbers ? "••••••" : `₹${formatCurrencyCompact(bank.principal)}`}
                          </span>
                        </div>

                        {/* Progress Bar & Percent Share */}
                        <div className="mt-2.5">
                          <div className="w-full bg-base-300/60 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${bank.pct}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>

                        {/* Sub Metrics: Share %, Rate, Deposit Count */}
                        <div className="flex items-center justify-between text-[11px] font-mono mt-2 text-base-content/60">
                          <span>{bank.pct}% of portfolio</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {bank.avgRate.toFixed(2)}% avg
                          </span>
                          <span>{bank.count} deposit{bank.count !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Stack Footer Tip */}
            <div className="mt-4 pt-3 border-t border-base-300/60 text-[11px] text-base-content/50 text-center">
              💡 Tip: Click any bank card to filter its deposits in the Table View
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODALS */}
      {/* -------------------------------------------------------------------- */}
      {/* Info Details Modal */}
      <FixedDepositInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setSelectedInfoFd(null);
        }}
        fd={selectedInfoFd}
      />

      {/* Add / Edit FD Modal */}
      <AddFixedDepositModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingFd(null);
        }}
        onSave={handleSaveFixedDeposit}
        editingFd={editingFd}
      />

      {/* Withdraw / Settlement Modal */}
      <WithdrawFdModal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setWithdrawingFd(null);
        }}
        onSaveSettlement={handleSaveSettlement}
        fd={withdrawingFd}
      />
    </div>
  );
}
