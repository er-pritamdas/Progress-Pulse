import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import axiosInstance from "../../../Context/AxiosInstance";
import { TitleChanger } from "../../../utils/TitleChanger";
import PortfolioSettingsModal, {
  calculateExactAge,
} from "../../../components/Dashboard/Investment/PortfolioSettingsModal";
import InteractivePortfolioGauge from "../../../components/Dashboard/Investment/InteractivePortfolioGauge";
import {
  Landmark,
  TrendingUp,
  ShieldCheck,
  PiggyBank,
  PieChart,
  Percent,
  Calendar,
  Clock,
  Target,
  SlidersHorizontal,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  TableProperties,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowDownRight,
  Zap,
  Building2,
  Wallet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

const ASSET_THEMES = {
  bank: {
    label: "Bank Balance",
    category: "Liquid Cash",
    color: "#10b981",
    bgLight: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    barColor: "bg-emerald-500",
    icon: Landmark,
    link: "/dashboard/expense/table-entry",
    linkText: "Expense Table Entry",
  },
  demat: {
    label: "Demat Holdings",
    category: "Equities & Stocks",
    color: "#3b82f6",
    bgLight: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    barColor: "bg-blue-500",
    icon: TrendingUp,
    link: "/dashboard/investment/table-entry?tab=stocks",
    linkText: "Stocks Table Entry",
  },
  fd: {
    label: "Fixed Deposits (FD)",
    category: "Term Deposits",
    color: "#f59e0b",
    bgLight: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    barColor: "bg-amber-500",
    icon: ShieldCheck,
    link: "/dashboard/investment/table-entry?tab=fd",
    linkText: "FD Table Entry",
  },
  rd: {
    label: "Recurring Deposits (RD)",
    category: "Systematic Savings",
    color: "#f97316",
    bgLight: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    barColor: "bg-orange-500",
    icon: PiggyBank,
    link: "/dashboard/investment/table-entry?tab=rd",
    linkText: "RD Table Entry",
  },
  mf: {
    label: "Mutual Funds (MF)",
    category: "SIP Portfolios",
    color: "#8b5cf6",
    bgLight: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    barColor: "bg-purple-500",
    icon: PieChart,
    link: "/dashboard/investment/table-entry?tab=mf",
    linkText: "MF Table Entry",
  },
  pf: {
    label: "Provident Fund (PF)",
    category: "Retirement EPF",
    color: "#14b8a6",
    bgLight: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    barColor: "bg-teal-500",
    icon: Percent,
    link: "/dashboard/investment/table-entry?tab=pf",
    linkText: "PF Table Entry",
  },
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

export default function InvTableView() {
  TitleChanger("Portfolio | Progress Pulse");

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Privacy Eye Masking
  const [hideNumbers, setHideNumbers] = useState(() => {
    return localStorage.getItem("pulse_portfolio_hide_numbers") === "true";
  });

  const toggleHideNumbers = () => {
    setHideNumbers((prev) => {
      const next = !prev;
      localStorage.setItem("pulse_portfolio_hide_numbers", String(next));
      return next;
    });
  };

  // Portfolio Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [upperLimit, setUpperLimit] = useState(() => {
    const saved = localStorage.getItem("pulse_portfolio_upper_limit");
    return saved ? Number(saved) : 5000000; // Default ₹50 Lakhs
  });

  const [dob, setDob] = useState(() => {
    return localStorage.getItem("pulse_portfolio_dob") || "1998-05-15";
  });

  const [milestones, setMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_portfolio_milestones");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    // Default 4 milestones (25%, 50%, 75%, 100%)
    return [
      { id: "m1", label: "25% Milestone", amount: 1250000 },
      { id: "m2", label: "50% Halfway Mark", amount: 2500000 },
      { id: "m3", label: "75% Three-Quarter Goal", amount: 3750000 },
      { id: "m4", label: "100% Target Portfolio", amount: 5000000 },
    ];
  });

  // Raw Data from APIs
  const [bankSources, setBankSources] = useState([]);
  const [stocksData, setStocksData] = useState([]);
  const [fdData, setFdData] = useState([]);
  const [rdData, setRdData] = useState([]);
  const [mfData, setMfData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [pfWithdrawals, setPfWithdrawals] = useState([]);

  // Fetch all asset data across Pulse in parallel
  const fetchAllPortfolioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        expenseRes,
        stocksRes,
        fdRes,
        rdRes,
        mfRes,
        salaryRes,
        pfWithdrawalsRes,
      ] = await Promise.allSettled([
        axiosInstance.get("/v1/dashboard/expense/get-all-data"),
        axiosInstance.get("/v1/dashboard/investment/stocks"),
        axiosInstance.get("/v1/dashboard/investment/fd"),
        axiosInstance.get("/v1/dashboard/investment/rd"),
        axiosInstance.get("/v1/dashboard/investment/mf"),
        axiosInstance.get("/v1/dashboard/investment/salary"),
        axiosInstance.get("/v1/dashboard/investment/pf/withdrawals"),
      ]);

      // 1. Bank Sources from Expense
      if (expenseRes.status === "fulfilled") {
        const payload = expenseRes.value?.data;
        const rawSources =
          payload?.data?.sources ||
          payload?.sources ||
          (Array.isArray(payload?.data) ? payload.data : []);
        setBankSources(Array.isArray(rawSources) ? rawSources : []);
      }

      // 2. Stocks
      if (stocksRes.status === "fulfilled") {
        const payload = stocksRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setStocksData(list);
      }

      // 3. Fixed Deposits
      if (fdRes.status === "fulfilled") {
        const payload = fdRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setFdData(list);
      }

      // 4. Recurring Deposits
      if (rdRes.status === "fulfilled") {
        const payload = rdRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setRdData(list);
      }

      // 5. Mutual Funds
      if (mfRes.status === "fulfilled") {
        const payload = mfRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setMfData(list);
      }

      // 6. Salary & PF
      if (salaryRes.status === "fulfilled") {
        const payload = salaryRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setSalaryData(list);
      }
      if (pfWithdrawalsRes.status === "fulfilled") {
        const payload = pfWithdrawalsRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setPfWithdrawals(list);
      }
    } catch (err) {
      console.error("Error fetching consolidated portfolio data:", err);
      setError("Failed to synchronize some portfolio assets. Showing available data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPortfolioData();
  }, []);

  // Handle Save Settings from Modal
  const handleSaveSettings = ({ upperLimit: newLimit, milestones: newMilestones, dob: newDob }) => {
    setUpperLimit(newLimit);
    setMilestones(newMilestones);
    setDob(newDob);

    localStorage.setItem("pulse_portfolio_upper_limit", String(newLimit));
    localStorage.setItem("pulse_portfolio_dob", newDob);
    localStorage.setItem("pulse_portfolio_milestones", JSON.stringify(newMilestones));
  };

  // Computations
  const userAge = useMemo(() => calculateExactAge(dob), [dob]);
  const currentMonthFormatted = useMemo(() => dayjs().format("MMMM YYYY"), []);
  const currentFullDate = useMemo(() => dayjs().format("dddd, D MMMM YYYY"), []);

  // 1. Current Bank Balance (Bank, Wallet, Cash sources; exclude Cards and Loans)
  const bankMetrics = useMemo(() => {
    const validSources = (bankSources || []).filter((s) => {
      const type = (s.type || "").toLowerCase();
      return type !== "card" && type !== "credit card" && type !== "loan";
    });
    const total = validSources.reduce((sum, s) => {
      const bal =
        Number(s.currentBalance !== undefined ? s.currentBalance : s.balance) || 0;
      return sum + Math.max(0, bal);
    }, 0);
    return {
      total: Math.round(total * 100) / 100,
      count: validSources.length,
      primarySource: validSources[0]?.name || "Primary Account",
    };
  }, [bankSources]);

  // 2. Current Demat Amount (Quantity Left * Share Price)
  const dematMetrics = useMemo(() => {
    let totalVal = 0;
    let totalShares = 0;
    let holdingsCount = 0;

    (stocksData || []).forEach((s) => {
      const q = Number(
        s.qLeft !== undefined
          ? s.qLeft
          : s.quantityLeft !== undefined
          ? s.quantityLeft
          : s.bQty
      ) || 0;
      const p = Number(
        s.bShare || s.bFShare || s.sharePrice || s.finalBoughtPrice || 0
      );
      if (q > 0) {
        totalVal += q * p;
        totalShares += q;
        holdingsCount++;
      }
    });

    return {
      total: Math.round(totalVal * 100) / 100,
      holdingsCount,
      totalShares,
    };
  }, [stocksData]);

  // 3. Current FD Amount
  const fdMetrics = useMemo(() => {
    const active = (fdData || []).filter(
      (fd) => !fd.isWithdrawn && fd.status !== "Withdrawn" && fd.status !== "Closed"
    );
    const totalPrincipal = active.reduce(
      (sum, fd) => sum + (Number(fd.amount) || 0),
      0
    );
    const totalMaturity = active.reduce(
      (sum, fd) => sum + (Number(fd.maturityAmount) || 0),
      0
    );

    return {
      total: Math.round(totalPrincipal * 100) / 100,
      maturityTotal: Math.round(totalMaturity * 100) / 100,
      count: active.length,
    };
  }, [fdData]);

  // 4. Current RD Amount
  const rdMetrics = useMemo(() => {
    const active = (rdData || []).filter(
      (rd) => !rd.isWithdrawn && rd.status !== "Withdrawn" && rd.status !== "Closed"
    );
    let totalDeposited = 0;

    active.forEach((rd) => {
      const txns = rd.transactions || [];
      const txnSum = txns.reduce(
        (acc, t) => acc + (Number(t.amtDeposit) || Number(t.amount) || 0),
        0
      );
      totalDeposited += txnSum > 0 ? txnSum : (Number(rd.amount) || Number(rd.monthlyAmount) || 0);
    });

    return {
      total: Math.round(totalDeposited * 100) / 100,
      count: active.length,
    };
  }, [rdData]);

  // 5. Current MF Amount
  const mfMetrics = useMemo(() => {
    let totalInvested = 0;

    (mfData || []).forEach((fund) => {
      const txns = fund.transactions || [];
      if (txns.length > 0) {
        const fundSum = txns.reduce((acc, t) => {
          const amt = Number(t.amtDeposit) || Number(t.actualAmt) || Number(t.amount) || 0;
          return (t.type === "Redemption" || t.type === "Withdrawal" || t.type === "SWP")
            ? acc - amt
            : acc + amt;
        }, 0);
        totalInvested += Math.max(0, fundSum);
      } else {
        totalInvested += Number(fund.amount) || Number(fund.totalInvestment) || 0;
      }
    });

    return {
      total: Math.round(totalInvested * 100) / 100,
      count: (mfData || []).length,
    };
  }, [mfData]);

  // 6. Current PF Amount
  const pfMetrics = useMemo(() => {
    const totalContributed = (salaryData || []).reduce((acc, s) => {
      const er = Number(s.erPf) || Number(s.pfEmployer) || 0;
      const ee = s.eePf !== undefined && s.eePf !== null && s.eePf !== ""
        ? Number(s.eePf) || 0
        : (Number(s.pfEmployee) || er);
      return acc + er + ee;
    }, 0);
    const totalWithdrawn = (pfWithdrawals || []).reduce(
      (acc, w) => acc + (Number(w.amount) || 0),
      0
    );
    const balance = Math.max(0, totalContributed - totalWithdrawn);

    return {
      total: Math.round(balance * 100) / 100,
      monthsCount: (salaryData || []).length,
      withdrawalsCount: (pfWithdrawals || []).length,
    };
  }, [salaryData, pfWithdrawals]);

  // Consolidated Total Portfolio Worth
  const totalWorth = useMemo(() => {
    return (
      bankMetrics.total +
      dematMetrics.total +
      fdMetrics.total +
      rdMetrics.total +
      mfMetrics.total +
      pfMetrics.total
    );
  }, [
    bankMetrics.total,
    dematMetrics.total,
    fdMetrics.total,
    rdMetrics.total,
    mfMetrics.total,
    pfMetrics.total,
  ]);

  // Achievement Percentage & Remaining to Goal
  const achievementPercent = useMemo(() => {
    if (!upperLimit || upperLimit <= 0) return 0;
    const raw = (totalWorth / upperLimit) * 100;
    return Math.min(100, Math.round(raw * 10) / 10);
  }, [totalWorth, upperLimit]);

  const remainingToGoal = useMemo(() => {
    return Math.max(0, upperLimit - totalWorth);
  }, [upperLimit, totalWorth]);

  // Percentage shares for each asset class
  const assetShares = useMemo(() => {
    if (totalWorth <= 0) {
      return { bank: 0, demat: 0, fd: 0, rd: 0, mf: 0, pf: 0 };
    }
    return {
      bank: ((bankMetrics.total / totalWorth) * 100).toFixed(1),
      demat: ((dematMetrics.total / totalWorth) * 100).toFixed(1),
      fd: ((fdMetrics.total / totalWorth) * 100).toFixed(1),
      rd: ((rdMetrics.total / totalWorth) * 100).toFixed(1),
      mf: ((mfMetrics.total / totalWorth) * 100).toFixed(1),
      pf: ((pfMetrics.total / totalWorth) * 100).toFixed(1),
    };
  }, [
    totalWorth,
    bankMetrics.total,
    dematMetrics.total,
    fdMetrics.total,
    rdMetrics.total,
    mfMetrics.total,
    pfMetrics.total,
  ]);

  // Semi-Circle Gauge ApexCharts Options
  const gaugeChartOptions = useMemo(() => {
    return {
      chart: {
        type: "radialBar",
        sparkline: true,
        animations: {
          enabled: false,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: {
            size: "68%",
          },
          track: {
            background: "rgba(150, 150, 150, 0.15)",
            strokeWidth: "100%",
            margin: 0,
          },
          dataLabels: {
            name: {
              show: true,
              offsetY: -16,
              color: "currentColor",
              fontSize: "13px",
              fontWeight: 700,
            },
            value: {
              show: true,
              offsetY: -6,
              fontSize: "26px",
              fontWeight: 900,
              color: "currentColor",
              formatter: () => {
                return hideNumbers ? "••••••" : formatCurrencyCompact(totalWorth);
              },
            },
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          shadeIntensity: 0.5,
          gradientToColors: ["#10b981", "#3b82f6"],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      colors: ["#3b82f6"],
      labels: ["Current Portfolio Worth"],
    };
  }, [totalWorth, hideNumbers]);

  // Horizontal 100% Stacked Bar Chart Options
  const horizontalStackedOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        stacked: true,
        stackType: "100%",
        toolbar: { show: false },
        animations: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "52%",
          borderRadius: 6,
        },
      },
      stroke: {
        width: 1.5,
        colors: ["#ffffff15"],
      },
      xaxis: {
        categories: ["Portfolio Allocation"],
        labels: {
          show: true,
          formatter: (val) => `${val}%`,
          style: {
            fontWeight: 700,
            fontSize: "11px",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        show: false,
      },
      grid: {
        borderColor: "rgba(150, 150, 150, 0.1)",
        xaxis: {
          lines: { show: true },
        },
        yaxis: {
          lines: { show: false },
        },
        padding: { top: -10, bottom: -10 },
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val, { seriesIndex }) => {
            const values = [
              bankMetrics.total,
              dematMetrics.total,
              fdMetrics.total,
              rdMetrics.total,
              mfMetrics.total,
              pfMetrics.total,
            ];
            const raw = values[seriesIndex] || 0;
            return hideNumbers
              ? `•••••• (${val.toFixed(1)}%)`
              : `₹${formatCurrency2Dec(raw)} (${val.toFixed(1)}%)`;
          },
        },
      },
      colors: [
        ASSET_THEMES.bank.color,
        ASSET_THEMES.demat.color,
        ASSET_THEMES.fd.color,
        ASSET_THEMES.rd.color,
        ASSET_THEMES.mf.color,
        ASSET_THEMES.pf.color,
      ],
      legend: {
        show: false, // We use our rich custom legend cards below the chart
      },
    };
  }, [
    bankMetrics.total,
    dematMetrics.total,
    fdMetrics.total,
    rdMetrics.total,
    mfMetrics.total,
    pfMetrics.total,
    hideNumbers,
  ]);

  const horizontalStackedSeries = useMemo(() => {
    // If portfolio is empty, give equal 1 to avoid chart error
    const isZero = totalWorth === 0;
    return [
      { name: "Bank Balance", data: [isZero ? 1 : bankMetrics.total] },
      { name: "Demat Holdings", data: [isZero ? 1 : dematMetrics.total] },
      { name: "Fixed Deposits (FD)", data: [isZero ? 1 : fdMetrics.total] },
      { name: "Recurring Deposits (RD)", data: [isZero ? 1 : rdMetrics.total] },
      { name: "Mutual Funds (MF)", data: [isZero ? 1 : mfMetrics.total] },
      { name: "Provident Fund (PF)", data: [isZero ? 1 : pfMetrics.total] },
    ];
  }, [
    totalWorth,
    bankMetrics.total,
    dematMetrics.total,
    fdMetrics.total,
    rdMetrics.total,
    mfMetrics.total,
    pfMetrics.total,
  ]);

  // Table Sorting State
  const [tableSortColumn, setTableSortColumn] = useState("valuation");
  const [tableSortDirection, setTableSortDirection] = useState("desc");

  const handleTableSort = (colKey) => {
    if (tableSortColumn === colKey) {
      setTableSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setTableSortColumn(colKey);
      setTableSortDirection(
        colKey === "assetClass" || colKey === "category" ? "asc" : "desc"
      );
    }
  };

  const ledgerRows = useMemo(() => {
    return [
      {
        key: "bank",
        assetClass: "Bank & Wallets",
        category: "Liquid Cash",
        color: ASSET_THEMES.bank.color,
        valuation: bankMetrics.total,
        share: Number(assetShares.bank) || 0,
        count: bankMetrics.count,
        countLabel: `${bankMetrics.count} Accounts`,
        link: ASSET_THEMES.bank.link,
        linkText: "Manage",
      },
      {
        key: "demat",
        assetClass: "Demat Holdings",
        category: "Equities & Stocks",
        color: ASSET_THEMES.demat.color,
        valuation: dematMetrics.total,
        share: Number(assetShares.demat) || 0,
        count: dematMetrics.holdingsCount,
        countLabel: `${dematMetrics.holdingsCount} Stocks`,
        link: ASSET_THEMES.demat.link,
        linkText: "Trades",
      },
      {
        key: "fd",
        assetClass: "Fixed Deposits (FD)",
        category: "Term Deposits",
        color: ASSET_THEMES.fd.color,
        valuation: fdMetrics.total,
        share: Number(assetShares.fd) || 0,
        count: fdMetrics.count,
        countLabel: `${fdMetrics.count} Deposits`,
        link: ASSET_THEMES.fd.link,
        linkText: "Deposits",
      },
      {
        key: "rd",
        assetClass: "Recurring Deposits (RD)",
        category: "Systematic Savings",
        color: ASSET_THEMES.rd.color,
        valuation: rdMetrics.total,
        share: Number(assetShares.rd) || 0,
        count: rdMetrics.count,
        countLabel: `${rdMetrics.count} Schemes`,
        link: ASSET_THEMES.rd.link,
        linkText: "Installments",
      },
      {
        key: "mf",
        assetClass: "Mutual Funds (MF)",
        category: "SIP Portfolios",
        color: ASSET_THEMES.mf.color,
        valuation: mfMetrics.total,
        share: Number(assetShares.mf) || 0,
        count: mfMetrics.count,
        countLabel: `${mfMetrics.count} Folios`,
        link: ASSET_THEMES.mf.link,
        linkText: "Portfolios",
      },
      {
        key: "pf",
        assetClass: "Provident Fund (PF)",
        category: "EPF Retirement",
        color: ASSET_THEMES.pf.color,
        valuation: pfMetrics.total,
        share: Number(assetShares.pf) || 0,
        count: pfMetrics.monthsCount,
        countLabel: `${pfMetrics.monthsCount} Mos`,
        link: ASSET_THEMES.pf.link,
        linkText: "Ledger",
      },
    ];
  }, [
    bankMetrics,
    dematMetrics,
    fdMetrics,
    rdMetrics,
    mfMetrics,
    pfMetrics,
    assetShares,
  ]);

  const sortedLedgerRows = useMemo(() => {
    return [...ledgerRows].sort((a, b) => {
      let valA = a[tableSortColumn];
      let valB = b[tableSortColumn];

      if (typeof valA === "string") {
        return tableSortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return tableSortDirection === "asc"
        ? (valA || 0) - (valB || 0)
        : (valB || 0) - (valA || 0);
    });
  }, [ledgerRows, tableSortColumn, tableSortDirection]);

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Sticky Glassmorphism Header */}
      <div className="sticky top-[-17px] z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 -mx-4 px-4 py-3 mt-[-16px]">
        <div className="flex items-center justify-between flex-wrap gap-4 max-w-[1600px] mx-auto px-4 md:px-6">
          {/* Left: Page Title & Breadcrumb subtext */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20 shadow-xs">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content">
                  Portfolio
                </h1>
                <span className="badge badge-sm font-bold bg-base-200 text-base-content/70">
                  Total Wealth Tracker
                </span>
              </div>
              <p className="text-xs text-base-content/60 font-medium hidden sm:block">
                Whole consolidated net worth across Bank, Demat, FD, RD, MF & PF
              </p>
            </div>
          </div>

          {/* Right: Current Month, Age Badge, Actions */}
          <div className="flex items-center gap-2.5 flex-wrap ml-auto">
            {/* Current Month Chip */}
            <div className="flex items-center gap-2 bg-base-200/70 px-3 py-1.5 rounded-xl border border-base-300/50 text-xs font-semibold shadow-xs">
              <Calendar size={14} className="text-primary" />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base-content leading-tight">
                  {currentMonthFormatted}
                </span>
                <span className="text-[10px] text-base-content/50 leading-tight">
                  Current Month
                </span>
              </div>
            </div>

            {/* User Age Chip (Click to edit DOB in Settings) */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 bg-base-200/70 hover:bg-base-200 px-3 py-1.5 rounded-xl border border-base-300/50 text-xs font-semibold shadow-xs transition-all group"
              title="Click to change your Date of Birth in Settings"
            >
              <Clock size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base-content leading-tight font-mono">
                  {userAge.years}y {userAge.months}m {userAge.days}d
                </span>
                <span className="text-[10px] text-base-content/50 leading-tight">
                  Age of User
                </span>
              </div>
            </button>

            {/* Privacy Mask Toggle */}
            <button
              type="button"
              onClick={toggleHideNumbers}
              className={`btn btn-xs rounded-xl font-bold gap-1 border border-base-300/60 transition-all ${
                hideNumbers ? "btn-warning" : "bg-base-200 hover:bg-base-300 text-base-content"
              }`}
              title={hideNumbers ? "Show numbers" : "Conceal numbers (Privacy Mode)"}
            >
              {hideNumbers ? <EyeOff size={13} /> : <Eye size={13} />}
              <span className="hidden sm:inline">{hideNumbers ? "Concealed" : "Privacy"}</span>
            </button>

            {/* Dedicated Settings Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="btn btn-xs btn-primary gap-1.5 rounded-xl font-bold shadow-xs"
              title="Configure Portfolio Upper Limit & Milestones"
            >
              <SlidersHorizontal size={13} />
              <span>Goal Settings</span>
            </button>

            {/* Real-time Refresh Button */}
            <button
              type="button"
              onClick={fetchAllPortfolioData}
              disabled={loading}
              className="btn btn-circle btn-xs bg-base-200/70 hover:bg-base-200 border border-base-300/50"
              title="Refresh Portfolio Data"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-primary" : "opacity-70"} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 w-full max-w-[1600px] mx-auto space-y-6">
        {/* Loading Spinner */}
        {loading && (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-xs text-base-content/60 font-semibold">
              Aggregating consolidated portfolio intelligence across all assets...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="alert alert-warning shadow-sm text-xs font-bold rounded-2xl">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            {/* ============================================================ */}
            {/* 1. ASSET CLASS BREAKDOWN (TOP)                               */}
            {/* ============================================================ */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-base-content">
                    Asset Class Breakdown
                  </h3>
                  <p className="text-xs text-base-content/50">
                    Individual portfolio cards for each wealth category
                  </p>
                </div>
                <span className="badge badge-sm font-mono font-bold bg-base-200">
                  6 Asset Classes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. BANK BALANCE CARD */}
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 text-emerald-500/[0.06] dark:text-emerald-400/[0.07]">
                    <Landmark className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content">
                          Bank Balance
                        </h4>
                        <span className="text-[11px] font-semibold text-base-content/50">
                          {ASSET_THEMES.bank.category}
                        </span>
                      </div>
                      <span className="badge badge-sm font-mono font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {assetShares.bank}%
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(bankMetrics.total)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        <span>{bankMetrics.count} bank/wallet accounts</span>
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.bank)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs">
                      <span className="text-base-content/50 text-[11px]">
                        Primary: {bankMetrics.primarySource}
                      </span>
                      <Link
                        to={ASSET_THEMES.bank.link}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Manage</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. DEMAT / STOCKS AMOUNT CARD */}
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 text-blue-500/[0.06] dark:text-blue-400/[0.07]">
                    <TrendingUp className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content">
                          Demat Amount
                        </h4>
                        <span className="text-[11px] font-semibold text-base-content/50">
                          {ASSET_THEMES.demat.category}
                        </span>
                      </div>
                      <span className="badge badge-sm font-mono font-bold bg-blue-500/10 text-blue-600 border-blue-500/20">
                        {assetShares.demat}%
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(dematMetrics.total)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        <span>{dematMetrics.holdingsCount} stocks holding</span>
                        <span>•</span>
                        <span>{dematMetrics.totalShares} total shares</span>
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.demat)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs">
                      <span className="text-base-content/50 text-[11px]">
                        Equity Holdings
                      </span>
                      <Link
                        to={ASSET_THEMES.demat.link}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Trades</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 3. CURRENT FD CARD */}
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 text-amber-500/[0.06] dark:text-amber-400/[0.07]">
                    <ShieldCheck className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content">
                          Fixed Deposits (FD)
                        </h4>
                        <span className="text-[11px] font-semibold text-base-content/50">
                          {ASSET_THEMES.fd.category}
                        </span>
                      </div>
                      <span className="badge badge-sm font-mono font-bold bg-amber-500/10 text-amber-600 border-amber-500/20">
                        {assetShares.fd}%
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(fdMetrics.total)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        <span>{fdMetrics.count} active deposits</span>
                        <span>•</span>
                        <span>Maturity: {hideNumbers ? "••••" : formatCurrencyCompact(fdMetrics.maturityTotal)}</span>
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.fd)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs">
                      <span className="text-base-content/50 text-[11px]">
                        Bank Term Yield
                      </span>
                      <Link
                        to={ASSET_THEMES.fd.link}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Deposits</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 4. CURRENT RD CARD */}
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 text-orange-500/[0.06] dark:text-orange-400/[0.07]">
                    <PiggyBank className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content">
                          Recurring Deposits (RD)
                        </h4>
                        <span className="text-[11px] font-semibold text-base-content/50">
                          {ASSET_THEMES.rd.category}
                        </span>
                      </div>
                      <span className="badge badge-sm font-mono font-bold bg-orange-500/10 text-orange-600 border-orange-500/20">
                        {assetShares.rd}%
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="text-xl sm:text-2xl font-black font-mono text-orange-600 dark:text-orange-400">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(rdMetrics.total)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        <span>{rdMetrics.count} active recurring schemes</span>
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.rd)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs">
                      <span className="text-base-content/50 text-[11px]">
                        Monthly Systematic
                      </span>
                      <Link
                        to={ASSET_THEMES.rd.link}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Installments</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 5. CURRENT MF CARD */}
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 text-purple-500/[0.06] dark:text-purple-400/[0.07]">
                    <PieChart className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content">
                          Mutual Funds (MF)
                        </h4>
                        <span className="text-[11px] font-semibold text-base-content/50">
                          {ASSET_THEMES.mf.category}
                        </span>
                      </div>
                      <span className="badge badge-sm font-mono font-bold bg-purple-500/10 text-purple-600 border-purple-500/20">
                        {assetShares.mf}%
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="text-xl sm:text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(mfMetrics.total)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        <span>{mfMetrics.count} active folios / schemes</span>
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.mf)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs">
                      <span className="text-base-content/50 text-[11px]">
                        SIP & Lumpsum Corpus
                      </span>
                      <Link
                        to={ASSET_THEMES.mf.link}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Portfolios</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 6. CURRENT PF CARD */}
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 text-teal-500/[0.06] dark:text-teal-400/[0.07]">
                    <Percent className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content">
                          Provident Fund (PF)
                        </h4>
                        <span className="text-[11px] font-semibold text-base-content/50">
                          {ASSET_THEMES.pf.category}
                        </span>
                      </div>
                      <span className="badge badge-sm font-mono font-bold bg-teal-500/10 text-teal-600 border-teal-500/20">
                        {assetShares.pf}%
                      </span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="text-xl sm:text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(pfMetrics.total)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        <span>{pfMetrics.monthsCount} monthly contributions</span>
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.pf)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-300 flex items-center justify-between text-xs">
                      <span className="text-base-content/50 text-[11px]">
                        Retirement Safety Corpus
                      </span>
                      <Link
                        to={ASSET_THEMES.pf.link}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Ledger</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* 2. ALLOCATION STACK (LEFT) & BIG INTERACTIVE GAUGE (RIGHT)   */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left: Horizontal 100% Stacked Graph Card (6 cols) */}
              <div className="lg:col-span-6 card bg-base-200 shadow-md rounded-3xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-500/20 shadow-xs">
                        <Layers size={18} />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold tracking-tight text-base-content">
                          Horizontal 100% Stacked Asset Allocation
                        </h2>
                        <p className="text-xs text-base-content/50">
                          Consolidated distribution across all 6 asset classes
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-base-content/60">
                      Total: {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(totalWorth)}`}
                    </span>
                  </div>

                  {/* ApexCharts 100% Horizontal Stacked Bar */}
                  <div className="w-full my-2">
                    <Chart
                      options={horizontalStackedOptions}
                      series={horizontalStackedSeries}
                      type="bar"
                      height={135}
                    />
                  </div>
                </div>

                {/* Custom Legend Chips Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {/* Bank */}
                  <div className="bg-base-100 p-2.5 rounded-2xl border border-base-300 text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-bold text-base-content/70 truncate">Bank Balance</span>
                    </div>
                    <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {hideNumbers ? "••••••" : formatCurrencyCompact(bankMetrics.total)}
                    </div>
                    <span className="text-[10px] text-base-content/50 font-bold">
                      {assetShares.bank}% share
                    </span>
                  </div>

                  {/* Demat */}
                  <div className="bg-base-100 p-2.5 rounded-2xl border border-base-300 text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="font-bold text-base-content/70 truncate">Demat Holdings</span>
                    </div>
                    <div className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                      {hideNumbers ? "••••••" : formatCurrencyCompact(dematMetrics.total)}
                    </div>
                    <span className="text-[10px] text-base-content/50 font-bold">
                      {assetShares.demat}% share
                    </span>
                  </div>

                  {/* FD */}
                  <div className="bg-base-100 p-2.5 rounded-2xl border border-base-300 text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-bold text-base-content/70 truncate">Fixed Deposits</span>
                    </div>
                    <div className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                      {hideNumbers ? "••••••" : formatCurrencyCompact(fdMetrics.total)}
                    </div>
                    <span className="text-[10px] text-base-content/50 font-bold">
                      {assetShares.fd}% share
                    </span>
                  </div>

                  {/* RD */}
                  <div className="bg-base-100 p-2.5 rounded-2xl border border-base-300 text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="font-bold text-base-content/70 truncate">Recurring Deposits</span>
                    </div>
                    <div className="font-mono font-extrabold text-orange-600 dark:text-orange-400 text-sm">
                      {hideNumbers ? "••••••" : formatCurrencyCompact(rdMetrics.total)}
                    </div>
                    <span className="text-[10px] text-base-content/50 font-bold">
                      {assetShares.rd}% share
                    </span>
                  </div>

                  {/* MF */}
                  <div className="bg-base-100 p-2.5 rounded-2xl border border-base-300 text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                      <span className="font-bold text-base-content/70 truncate">Mutual Funds</span>
                    </div>
                    <div className="font-mono font-extrabold text-purple-600 dark:text-purple-400 text-sm">
                      {hideNumbers ? "••••••" : formatCurrencyCompact(mfMetrics.total)}
                    </div>
                    <span className="text-[10px] text-base-content/50 font-bold">
                      {assetShares.mf}% share
                    </span>
                  </div>

                  {/* PF */}
                  <div className="bg-base-100 p-2.5 rounded-2xl border border-base-300 text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
                      <span className="font-bold text-base-content/70 truncate">Provident Fund</span>
                    </div>
                    <div className="font-mono font-extrabold text-teal-600 dark:text-teal-400 text-sm">
                      {hideNumbers ? "••••••" : formatCurrencyCompact(pfMetrics.total)}
                    </div>
                    <span className="text-[10px] text-base-content/50 font-bold">
                      {assetShares.pf}% share
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Big Interactive Semi-Circle Gauge Card (6 cols) */}
              <div className="lg:col-span-6">
                <InteractivePortfolioGauge
                  totalWorth={totalWorth}
                  upperLimit={upperLimit}
                  milestones={milestones}
                  hideNumbers={hideNumbers}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            </div>

            {/* ============================================================ */}
            {/* 3. CONSOLIDATED PORTFOLIO SUMMARY TABLE (SORTABLE)           */}
            {/* ============================================================ */}
            <div className="card bg-base-200 shadow-md rounded-3xl overflow-hidden">
              <div className="p-5 border-b border-base-300 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TableProperties size={18} className="text-primary" />
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight text-base-content">
                      Consolidated Portfolio Ledger
                    </h3>
                    <p className="text-[11px] text-base-content/50">
                      Click any column header to sort in ascending or descending order
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm font-mono font-bold bg-base-100">
                    Sorted by: {tableSortColumn} ({tableSortDirection.toUpperCase()})
                  </span>
                  <span className="text-xs text-base-content/50 hidden sm:inline">
                    Current Month: <span className="font-bold text-base-content">{currentMonthFormatted}</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto bg-base-100">
                <table className="table table-sm w-full text-xs">
                  <thead className="bg-base-200 text-base-content/70 select-none border-b border-base-300">
                    <tr>
                      {/* 1. Asset Class */}
                      <th
                        onClick={() => handleTableSort("assetClass")}
                        className="py-3 px-4 font-bold cursor-pointer transition-colors hover:bg-base-300/60"
                        title="Sort by Asset Class"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Asset Class</span>
                          {tableSortColumn === "assetClass" ? (
                            tableSortDirection === "asc" ? (
                              <ArrowUp size={13} className="text-primary shrink-0" />
                            ) : (
                              <ArrowDown size={13} className="text-primary shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 hover:opacity-75 shrink-0" />
                          )}
                        </div>
                      </th>

                      {/* 2. Category */}
                      <th
                        onClick={() => handleTableSort("category")}
                        className="py-3 px-4 font-bold cursor-pointer transition-colors hover:bg-base-300/60"
                        title="Sort by Category"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Category</span>
                          {tableSortColumn === "category" ? (
                            tableSortDirection === "asc" ? (
                              <ArrowUp size={13} className="text-primary shrink-0" />
                            ) : (
                              <ArrowDown size={13} className="text-primary shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 hover:opacity-75 shrink-0" />
                          )}
                        </div>
                      </th>

                      {/* 3. Valuation */}
                      <th
                        onClick={() => handleTableSort("valuation")}
                        className="py-3 px-4 font-bold cursor-pointer transition-colors hover:bg-base-300/60 text-right"
                        title="Sort by Current Valuation"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Current Valuation (₹)</span>
                          {tableSortColumn === "valuation" ? (
                            tableSortDirection === "asc" ? (
                              <ArrowUp size={13} className="text-primary shrink-0" />
                            ) : (
                              <ArrowDown size={13} className="text-primary shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 hover:opacity-75 shrink-0" />
                          )}
                        </div>
                      </th>

                      {/* 4. Share */}
                      <th
                        onClick={() => handleTableSort("share")}
                        className="py-3 px-4 font-bold cursor-pointer transition-colors hover:bg-base-300/60 text-right"
                        title="Sort by Portfolio Share"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Portfolio Share</span>
                          {tableSortColumn === "share" ? (
                            tableSortDirection === "asc" ? (
                              <ArrowUp size={13} className="text-primary shrink-0" />
                            ) : (
                              <ArrowDown size={13} className="text-primary shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 hover:opacity-75 shrink-0" />
                          )}
                        </div>
                      </th>

                      {/* 5. Count */}
                      <th
                        onClick={() => handleTableSort("count")}
                        className="py-3 px-4 font-bold cursor-pointer transition-colors hover:bg-base-300/60 text-center"
                        title="Sort by Active Instruments"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Active Instruments</span>
                          {tableSortColumn === "count" ? (
                            tableSortDirection === "asc" ? (
                              <ArrowUp size={13} className="text-primary shrink-0" />
                            ) : (
                              <ArrowDown size={13} className="text-primary shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30 hover:opacity-75 shrink-0" />
                          )}
                        </div>
                      </th>

                      {/* 6. Quick Action */}
                      <th className="py-3 px-4 font-bold text-center">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLedgerRows.map((row) => (
                      <tr key={row.key} className="hover:bg-base-200/40 transition-colors">
                        <td className="py-3 px-4 font-bold flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: row.color }}
                          />
                          <span>{row.assetClass}</span>
                        </td>
                        <td className="py-3 px-4 text-base-content/60">{row.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-right" style={{ color: row.color }}>
                          {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(row.valuation)}`}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-right">
                          {row.share}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="badge badge-xs font-bold bg-base-200">
                            {row.countLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            to={row.link}
                            className="btn btn-ghost btn-xs text-primary gap-1 font-bold"
                          >
                            <span>{row.linkText}</span>
                            <ExternalLink size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Totals Footer */}
                  <tfoot className="bg-base-200/90 font-extrabold text-base-content border-t-2 border-base-300">
                    <tr>
                      <th className="py-3 px-4">Consolidated Net Worth</th>
                      <th className="py-3 px-4 text-base-content/50">All 6 Assets</th>
                      <th className="py-3 px-4 text-right font-mono text-sm text-primary">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(totalWorth)}`}
                      </th>
                      <th className="py-3 px-4 text-right font-mono">100.0%</th>
                      <th className="py-3 px-4 text-center text-emerald-600">
                        Goal: {achievementPercent}%
                      </th>
                      <th className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setIsSettingsOpen(true)}
                          className="btn btn-ghost btn-xs font-bold text-primary gap-1"
                        >
                          <SlidersHorizontal size={11} /> Settings
                        </button>
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* 6. DEDICATED PORTFOLIO SETTINGS POPUP MODAL                  */}
      {/* ============================================================ */}
      <PortfolioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        upperLimit={upperLimit}
        milestones={milestones}
        dob={dob}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
