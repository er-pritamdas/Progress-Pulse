import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import Chart from "react-apexcharts";
import axiosInstance from "../../../Context/AxiosInstance";
import apiCache from "../../../utils/apiCache";
import { TitleChanger } from "../../../utils/TitleChanger";
import PortfolioSettingsModal, {
  calculateExactAge,
} from "../../../components/Dashboard/Investment/PortfolioSettingsModal";
import InteractivePortfolioGauge from "../../../components/Dashboard/Investment/InteractivePortfolioGauge";
import CompanyLogo from "../../../components/Dashboard/Investment/CompanyLogo";
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
  ChevronDown,
  Check,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowDownRight,
  Zap,
  Building2,
  Wallet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
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
    linkText: "Expenses",
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

export const calcMfAvailableUnits = (fund) => {
  if (!fund) return 0;
  const txns = fund.transactions || [];
  if (txns.length === 0) {
    return Number(fund.units) || Number(fund.activeUnits) || 0;
  }
  let totalUnits = 0;
  let totalUnitsWithdrawn = 0;
  txns.forEach((t) => {
    const tl = (t?.type || "").toLowerCase();
    const act =
      t.actualAmt !== undefined && t.actualAmt !== null
        ? Number(t.actualAmt)
        : Math.max(0, (t.amtDeposit ?? (t.amtDeposit ? t.amtDeposit - (t.er || 0) : t.amount)) ?? 0);
    const n = Number(t.nav ?? 0);
    const u = parseFloat(t.units) || (n > 0 ? act / n : 0);
    if (tl.includes("withdr") || tl.includes("redemp") || tl.includes("swp")) {
      totalUnitsWithdrawn += u;
    } else {
      totalUnits += u;
    }
  });
  return Math.max(0, parseFloat((totalUnits - totalUnitsWithdrawn).toFixed(4)));
};

export const calcMfHoldingValue = (fund) => {
  if (!fund) return 0;
  const activeUnits = calcMfAvailableUnits(fund);
  if (activeUnits <= 0.0001) return 0;

  const txns = fund.transactions || [];
  if (txns.length === 0) {
    return Number(fund.amount) || Number(fund.totalInvestment) || 0;
  }
  let totalUnits = 0;
  let totalDeposit = 0;
  txns.forEach((t) => {
    const tl = (t?.type || "").toLowerCase();
    const act =
      t.actualAmt !== undefined && t.actualAmt !== null
        ? Number(t.actualAmt)
        : Math.max(0, (t.amtDeposit ?? (t.amtDeposit ? t.amtDeposit - (t.er || 0) : t.amount)) ?? 0);
    const n = Number(t.nav ?? 0);
    const u = parseFloat(t.units) || (n > 0 ? act / n : 0);
    if (!tl.includes("withdr") && !tl.includes("redemp") && !tl.includes("swp")) {
      totalUnits += u;
      totalDeposit += act;
    }
  });
  const avgNav = totalUnits > 0 ? totalDeposit / totalUnits : 0;
  return avgNav > 0 ? activeUnits * avgNav : 0;
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

  // Projection Mode State (View estimated portfolio valuations on target date)
  const [projectionMode, setProjectionMode] = useState(() => {
    return localStorage.getItem("pulse_portfolio_projection_mode") === "true";
  });

  // Whole Portfolio Projection Target Date (persisted custom selection)
  const [wholePortfolioTargetDate, setWholePortfolioTargetDate] = useState(() => {
    return localStorage.getItem("pulse_portfolio_whole_target_date") || "";
  });

  // Portfolio Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [upperLimit, setUpperLimit] = useState(() => {
    const saved = localStorage.getItem("pulse_portfolio_upper_limit");
    return saved ? Number(saved) : 5000000; // Default ₹50 Lakhs
  });

  const [dob, setDob] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user_profile") || "{}");
      if (parsed.dateOfBirth) return parsed.dateOfBirth;
    } catch (e) {}
    return localStorage.getItem("pulse_portfolio_dob") || "";
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

  // URL Query Params and Planner Goals
  const [searchParams, setSearchParams] = useSearchParams();

  const [plannerGoals, setPlannerGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_investment_planner_goals");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((g) => g.id !== "goal-wedding-default" && g.id !== "goal-house-default");
        }
      }
    } catch (e) {
      console.error("Failed to load planner goals in portfolio:", e);
    }
    return [];
  });

  // Selected Planner Filter: "all" or goal.id
  const [selectedPlannerId, setSelectedPlannerId] = useState(() => {
    return searchParams.get("planner") || "all";
  });

  useEffect(() => {
    const fromUrl = searchParams.get("planner");
    if (fromUrl && fromUrl !== selectedPlannerId) {
      setSelectedPlannerId(fromUrl);
    }
  }, [searchParams]);


  // Sync latest planner goals from DB or localStorage whenever window gets focus
  useEffect(() => {
    const handleSyncGoals = async () => {
      try {
        const res = await axiosInstance.get("/v1/dashboard/investment/plans");
        const list = res.data?.data;
        if (Array.isArray(list)) {
          setPlannerGoals(list);
          localStorage.setItem("pulse_investment_planner_goals", JSON.stringify(list));
          return;
        }
      } catch (err) {
        // Fallback to local storage if offline
      }

      try {
        const saved = localStorage.getItem("pulse_investment_planner_goals");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPlannerGoals(parsed.filter((g) => g.id !== "goal-wedding-default" && g.id !== "goal-house-default"));
          }
        }
      } catch (e) {}
    };

    window.addEventListener("focus", handleSyncGoals);
    window.addEventListener("investment-data-reset", handleSyncGoals);
    window.addEventListener("all-data-reset", handleSyncGoals);
    return () => {
      window.removeEventListener("focus", handleSyncGoals);
      window.removeEventListener("investment-data-reset", handleSyncGoals);
      window.removeEventListener("all-data-reset", handleSyncGoals);
    };
  }, []);

  const activePlanner = useMemo(() => {
    if (selectedPlannerId === "all") return null;
    return (
      plannerGoals.find(
        (g) => g.id === selectedPlannerId || g._id === selectedPlannerId
      ) || null
    );
  }, [plannerGoals, selectedPlannerId]);

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
        plansRes,
        profileRes,
      ] = await Promise.allSettled([
        axiosInstance.get("/v1/dashboard/expense/get-all-data"),
        axiosInstance.get("/v1/dashboard/investment/stocks"),
        axiosInstance.get("/v1/dashboard/investment/fd"),
        axiosInstance.get("/v1/dashboard/investment/rd"),
        axiosInstance.get("/v1/dashboard/investment/mf"),
        axiosInstance.get("/v1/dashboard/investment/salary"),
        axiosInstance.get("/v1/dashboard/investment/pf/withdrawals"),
        axiosInstance.get("/v1/dashboard/investment/plans"),
        axiosInstance.get("/v1/dashboard/profile"),
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

      // 5. Mutual Funds - Filter out any funds with 0 available units from Portfolio
      if (mfRes.status === "fulfilled") {
        const payload = mfRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        const activeFunds = list.filter((f) => calcMfAvailableUnits(f) > 0.0001);
        setMfData(activeFunds);
      }

      // 6. Salary & PF Withdrawals
      if (salaryRes.status === "fulfilled") {
        const payload = salaryRes.value?.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setSalaryData(list);
      }
      if (pfWithdrawalsRes.status === "fulfilled") {
        const payload = pfWithdrawalsRes.value?.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setPfWithdrawals(list);
      }

      // 7. Investment Planner Goals
      if (plansRes.status === "fulfilled") {
        const payload = plansRes.value?.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setPlannerGoals(list);
      }

      // 8. Registered User Profile (DOB and info from Profile Settings)
      if (profileRes.status === "fulfilled") {
        const u = profileRes.value?.data?.data;
        if (u) {
          if (u.dateOfBirth) {
            setDob(u.dateOfBirth);
            localStorage.setItem("pulse_portfolio_dob", u.dateOfBirth);
          }
          try {
            const existing = JSON.parse(localStorage.getItem("user_profile") || "{}");
            const merged = { ...existing, ...u };
            localStorage.setItem("user_profile", JSON.stringify(merged));
            if (u.profilePic) localStorage.setItem("profilePic", u.profilePic);
            if (u.fullName) localStorage.setItem("fullName", u.fullName);
            if (u.username) localStorage.setItem("username", u.username);
          } catch (e) {}
        }
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

  // Handle Save Settings from Modal (Upper Limit & Milestones)
  const handleSaveSettings = async ({ upperLimit: newLimit, milestones: newMilestones }) => {
    setUpperLimit(newLimit);
    setMilestones(newMilestones);

    localStorage.setItem("pulse_portfolio_upper_limit", String(newLimit));
    localStorage.setItem("pulse_portfolio_milestones", JSON.stringify(newMilestones));
  };

  // Computations
  const userAge = useMemo(() => calculateExactAge(dob), [dob]);
  const currentMonthFormatted = useMemo(() => dayjs().format("MMMM YYYY"), []);
  const currentMonthFormattedShort = useMemo(() => dayjs().format("MMM YYYY"), []);
  const currentFullDate = useMemo(() => dayjs().format("dddd, D MMMM YYYY"), []);

  // Whole portfolio default target date: furthest valid future date among planner goals, or 3 years from today
  const wholePortfolioDefaultTarget = useMemo(() => {
    const validFutureDates = (plannerGoals || [])
      .map((g) => g.targetDate)
      .filter((d) => Boolean(d) && dayjs(d).isValid() && dayjs(d).isAfter(dayjs().startOf("month")))
      .sort((a, b) => dayjs(b).diff(dayjs(a)));
    if (validFutureDates.length > 0) return validFutureDates[0];
    const anyValidDates = (plannerGoals || [])
      .map((g) => g.targetDate)
      .filter((d) => Boolean(d) && dayjs(d).isValid())
      .sort((a, b) => dayjs(b).diff(dayjs(a)));
    if (anyValidDates.length > 0) return anyValidDates[0];
    return dayjs().add(3, "year").date(1).format("YYYY-MM-DD");
  }, [plannerGoals]);

  const effectiveTargetDate = useMemo(() => {
    if (activePlanner) {
      return activePlanner.targetDate || "";
    }
    return wholePortfolioTargetDate || wholePortfolioDefaultTarget;
  }, [activePlanner, wholePortfolioTargetDate, wholePortfolioDefaultTarget]);

  // Target Date object and span in years & months
  const targetDateObj = useMemo(() => {
    if (activePlanner) {
      if (!activePlanner.targetDate) return null;
      const d = dayjs(activePlanner.targetDate);
      return d.isValid() ? d : null;
    }
    // Whole portfolio: when projectionMode is ON, targetDateObj is active
    if (projectionMode) {
      const d = dayjs(effectiveTargetDate);
      return d.isValid() ? d : null;
    }
    return null;
  }, [activePlanner, projectionMode, effectiveTargetDate]);

  const targetMonthFormatted = useMemo(() => {
    if (!targetDateObj) return "";
    return targetDateObj.format("MMMM YYYY");
  }, [targetDateObj]);

  const targetMonthFormattedShort = useMemo(() => {
    if (!targetDateObj) return "";
    return targetDateObj.format("MMM YYYY");
  }, [targetDateObj]);

  const planSpanInfo = useMemo(() => {
    if (!targetDateObj) return null;
    const start = dayjs().startOf("month");
    const target = targetDateObj.startOf("month");
    const diffMonths = target.diff(start, "month");
    const isPast = diffMonths < 0;
    const isCurrent = diffMonths === 0;
    const absDiff = Math.abs(diffMonths);
    const years = Math.floor(absDiff / 12);
    const months = absDiff % 12;

    const parts = [];
    const partsShort = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? "Year" : "Years"}`);
      partsShort.push(`${years}y`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? "Month" : "Months"}`);
      partsShort.push(`${months}m`);
    }

    let full = parts.length > 0 ? parts.join(" ") : "0 Months";
    let short = partsShort.length > 0 ? partsShort.join(" ") : "0m";

    if (isCurrent) {
      full = "Due this month";
      short = "This month";
    } else if (isPast) {
      full = `${full} ago`;
      short = `${short} ago`;
    }

    return {
      years,
      months,
      totalMonths: diffMonths,
      isPast,
      isCurrent,
      full,
      short,
    };
  }, [targetDateObj]);

  const userAgeOnTarget = useMemo(() => {
    if (!dob || !targetDateObj) return null;
    const birthDate = dayjs(dob);
    if (!birthDate.isValid() || targetDateObj.isBefore(birthDate)) return null;

    let years = targetDateObj.year() - birthDate.year();
    let months = targetDateObj.month() - birthDate.month();
    let days = targetDateObj.date() - birthDate.date();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = targetDateObj.subtract(1, "month").daysInMonth();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
  }, [dob, targetDateObj]);

  // 1. Current Bank Balance (Bank, Wallet, Cash sources; exclude Cards and Loans)
  const bankMetrics = useMemo(() => {
    let validSources = (bankSources || []).filter((s) => {
      const type = (s.type || "").toLowerCase();
      return type !== "card" && type !== "credit card" && type !== "loan";
    });

    if (activePlanner) {
      const bankIds = new Set(activePlanner.selectedBanks || activePlanner.allocatedBanks || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "bank") return;
          if ((bankSources || []).some((b) => String(b.id || b._id) === k)) {
            bankIds.add(k);
          }
        });
      }
      validSources = validSources.filter((s) => bankIds.has(String(s.id || s._id)));
    }

    const items = validSources.map((s) => {
      const sId = String(s.id || s._id);
      const rawBal = Number(s.currentBalance !== undefined ? s.currentBalance : s.balance) || 0;
      let allocatedAmount = rawBal;
      let allocatedPercent = 100;

      if (activePlanner) {
        if (activePlanner.allocations && activePlanner.allocations[sId]) {
          const alloc = activePlanner.allocations[sId];
          allocatedPercent = Number(alloc.percent) || 0;
          allocatedAmount = (rawBal * allocatedPercent) / 100;
        } else if (activePlanner.selectedBanks || activePlanner.allocatedBanks) {
          allocatedAmount = rawBal;
          allocatedPercent = 100;
        } else {
          allocatedAmount = 0;
          allocatedPercent = 0;
        }
      }

      return {
        ...s,
        allocatedAmount: Math.max(0, allocatedAmount),
        allocatedPercent,
      };
    });

    const total = items.reduce((sum, s) => sum + s.allocatedAmount, 0);
    return {
      total: Math.round(total * 100) / 100,
      count: items.length,
      primarySource: items[0]?.name || (activePlanner ? "No Plan Bank" : "Primary Account"),
      items,
    };
  }, [bankSources, activePlanner]);

  // 2. Current Demat Amount (Quantity Left * Share Price)
  const dematMetrics = useMemo(() => {
    let list = stocksData || [];
    if (activePlanner) {
      const stockIds = new Set(activePlanner.selectedStocks || activePlanner.allocatedStocks || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "stock") return;
          if ((stocksData || []).some((s) => String(s.id || s._id) === k)) {
            stockIds.add(k);
          }
        });
      }
      list = list.filter((s) => stockIds.has(String(s.id || s._id)));
    }

    let totalVal = 0;
    let totalShares = 0;
    let holdingsCount = 0;

    const items = list.map((s) => {
      const sId = String(s.id || s._id);
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
      const fullVal = q * p;

      let allocatedAmount = fullVal;
      let allocatedShares = q;
      let allocatedPercent = 100;

      if (activePlanner) {
        if (activePlanner.allocations && activePlanner.allocations[sId]) {
          const alloc = activePlanner.allocations[sId];
          allocatedPercent = Number(alloc.percent) || 0;
          allocatedShares = alloc.shares !== undefined ? Number(alloc.shares) : Math.round((q * allocatedPercent) / 100);
          allocatedAmount = (fullVal * allocatedPercent) / 100;
        } else if (activePlanner.selectedStocks || activePlanner.allocatedStocks) {
          allocatedAmount = fullVal;
          allocatedShares = q;
          allocatedPercent = 100;
        } else {
          allocatedAmount = 0;
          allocatedShares = 0;
          allocatedPercent = 0;
        }
      }

      if (allocatedAmount > 0 || (activePlanner && activePlanner.allocations && activePlanner.allocations[sId])) {
        totalVal += allocatedAmount;
        totalShares += allocatedShares;
        holdingsCount++;
      }

      return {
        ...s,
        allocatedAmount,
        allocatedShares,
        allocatedPercent,
      };
    });

    return {
      total: Math.round(totalVal * 100) / 100,
      holdingsCount,
      totalShares,
      items,
    };
  }, [stocksData, activePlanner]);

  // 3. Current FD Amount
  const fdMetrics = useMemo(() => {
    let list = (fdData || []).filter(
      (fd) => !fd.isWithdrawn && fd.status !== "Withdrawn" && fd.status !== "Closed"
    );
    if (activePlanner) {
      const fdIds = new Set(activePlanner.selectedFds || activePlanner.allocatedFds || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "fd") return;
          if ((fdData || []).some((fd) => String(fd.id || fd._id) === k)) {
            fdIds.add(k);
          }
        });
      }
      list = list.filter((fd) => fdIds.has(String(fd.id || fd._id)));
    }

    let totalPrincipal = 0;
    let totalMaturity = 0;

    const items = list.map((fd) => {
      const fdId = String(fd.id || fd._id);
      const principal = Number(fd.amount) || 0;
      const maturity = Number(fd.maturityAmount) || principal;

      let allocatedAmount = principal;
      let allocatedPercent = 100;

      if (activePlanner) {
        if (activePlanner.allocations && activePlanner.allocations[fdId]) {
          const alloc = activePlanner.allocations[fdId];
          allocatedPercent = Number(alloc.percent) || 0;
          allocatedAmount = (principal * allocatedPercent) / 100;
        } else if (activePlanner.selectedFds || activePlanner.allocatedFds) {
          allocatedAmount = principal;
          allocatedPercent = 100;
        } else {
          allocatedAmount = 0;
          allocatedPercent = 0;
        }
      }

      totalPrincipal += allocatedAmount;
      totalMaturity += (maturity * allocatedPercent) / 100;

      return {
        ...fd,
        allocatedAmount,
        allocatedPercent,
      };
    });

    return {
      total: Math.round(totalPrincipal * 100) / 100,
      maturityTotal: Math.round(totalMaturity * 100) / 100,
      count: items.length,
      items,
    };
  }, [fdData, activePlanner]);

  // 4. Current RD Amount
  const rdMetrics = useMemo(() => {
    let list = (rdData || []).filter(
      (rd) => !rd.isWithdrawn && rd.status !== "Withdrawn" && rd.status !== "Closed"
    );
    if (activePlanner) {
      const rdIds = new Set(activePlanner.selectedRds || activePlanner.allocatedRds || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "rd") return;
          if ((rdData || []).some((rd) => String(rd.id || rd._id) === k)) {
            rdIds.add(k);
          }
        });
      }
      list = list.filter((rd) => rdIds.has(String(rd.id || rd._id)));
    }

    let totalDeposited = 0;

    const items = list.map((rd) => {
      const rdId = String(rd.id || rd._id);
      const txns = rd.transactions || [];
      const txnSum = txns.reduce(
        (acc, t) => acc + (Number(t.amtDeposit) || Number(t.amount) || 0),
        0
      );
      const currentDeposited = txnSum > 0 ? txnSum : (Number(rd.amount) || Number(rd.monthlyAmount) || 0);

      let allocatedAmount = currentDeposited;
      let allocatedPercent = 100;

      if (activePlanner) {
        if (activePlanner.allocations && activePlanner.allocations[rdId]) {
          const alloc = activePlanner.allocations[rdId];
          allocatedPercent = Number(alloc.percent) || 0;
          allocatedAmount = (currentDeposited * allocatedPercent) / 100;
        } else if (activePlanner.selectedRds || activePlanner.allocatedRds) {
          allocatedAmount = currentDeposited;
          allocatedPercent = 100;
        } else {
          allocatedAmount = 0;
          allocatedPercent = 0;
        }
      }

      totalDeposited += allocatedAmount;

      return {
        ...rd,
        allocatedAmount,
        allocatedPercent,
      };
    });

    return {
      total: Math.round(totalDeposited * 100) / 100,
      count: items.length,
      items,
    };
  }, [rdData, activePlanner]);

  // 5. Current MF Amount - Exclude funds with 0 available units from Portfolio
  const mfMetrics = useMemo(() => {
    let list = (mfData || []).filter((fund) => calcMfAvailableUnits(fund) > 0.0001);

    if (activePlanner) {
      const mfIds = new Set(activePlanner.selectedMfs || activePlanner.allocatedMfs || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "mf") return;
          if ((mfData || []).some((m) => String(m.id || m._id) === k)) {
            mfIds.add(k);
          }
        });
      }
      list = list.filter((f) => mfIds.has(String(f.id || f._id)));
    }

    let totalInvested = 0;

    const items = list.map((fund) => {
      const fundId = String(fund.id || fund._id);
      const holdingVal = calcMfHoldingValue(fund);

      let allocatedAmount = holdingVal;
      let allocatedPercent = 100;

      if (activePlanner) {
        if (activePlanner.allocations && activePlanner.allocations[fundId]) {
          const alloc = activePlanner.allocations[fundId];
          allocatedPercent = Number(alloc.percent) || 0;
          allocatedAmount = (holdingVal * allocatedPercent) / 100;
        } else if (activePlanner.selectedMfs || activePlanner.allocatedMfs) {
          allocatedAmount = holdingVal;
          allocatedPercent = 100;
        } else {
          allocatedAmount = 0;
          allocatedPercent = 0;
        }
      }

      totalInvested += allocatedAmount;

      return {
        ...fund,
        allocatedAmount,
        allocatedPercent,
      };
    });

    return {
      total: Math.round(totalInvested * 100) / 100,
      count: items.length,
      items,
    };
  }, [mfData, activePlanner]);

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
    const fullBalance = Math.max(0, totalContributed - totalWithdrawn);

    if (activePlanner) {
      let isIncluded = false;
      let pfPct = 0;
      let allocatedBal = 0;

      if (activePlanner.allocations && activePlanner.allocations["source-pf-balance"]) {
        const alloc = activePlanner.allocations["source-pf-balance"];
        pfPct = Number(alloc.percent) || 0;
        isIncluded = pfPct > 0;
        allocatedBal = (fullBalance * pfPct) / 100;
      } else {
        isIncluded = activePlanner.includePf !== undefined ? activePlanner.includePf : (activePlanner.pfAllocation?.enabled ?? false);
        pfPct = isIncluded ? (Number(activePlanner.pfAllocatedPercent) || Number(activePlanner.pfAllocation?.percentage) || 50) : 0;
        allocatedBal = isIncluded ? (fullBalance * pfPct) / 100 : 0;
      }
      return {
        total: Math.round(allocatedBal * 100) / 100,
        fullBalance,
        isIncluded,
        allocatedPct: pfPct,
        monthsCount: (salaryData || []).length,
        withdrawalsCount: (pfWithdrawals || []).length,
      };
    }

    return {
      total: Math.round(fullBalance * 100) / 100,
      fullBalance,
      isIncluded: true,
      allocatedPct: 100,
      monthsCount: (salaryData || []).length,
      withdrawalsCount: (pfWithdrawals || []).length,
    };
  }, [salaryData, pfWithdrawals, activePlanner]);

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

  // Monthly PF calculation from salaryData
  const monthlyPfContribution = useMemo(() => {
    const latestSalary = (salaryData || [])[0];
    if (!latestSalary) return 0;
    const er = Number(latestSalary.erPf) || Number(latestSalary.pfEmployer) || 0;
    const ee =
      latestSalary.eePf !== undefined && latestSalary.eePf !== null && latestSalary.eePf !== ""
        ? Number(latestSalary.eePf) || 0
        : Number(latestSalary.pfEmployee) || er;
    return Math.max(0, er + ee);
  }, [salaryData]);

  // Projected valuations on Target Date across all 6 asset classes
  const projectedMetrics = useMemo(() => {
    if (!targetDateObj) {
      return {
        bankTotal: bankMetrics.total,
        dematTotal: dematMetrics.total,
        fdTotal: fdMetrics.total,
        rdTotal: rdMetrics.total,
        mfTotal: mfMetrics.total,
        pfTotal: pfMetrics.total,
        totalWorth,
        monthlyGrowthTotal: 0,
        spanMonths: 0,
      };
    }

    const spanMonths = Math.max(
      0,
      targetDateObj.startOf("month").diff(dayjs().startOf("month"), "month")
    );

    // 1. Bank Projection
    let bankAdditions = 0;
    if (activePlanner) {
      const bankIds = new Set(activePlanner.selectedBanks || activePlanner.allocatedBanks || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "bank") return;
          if ((bankSources || []).some((b) => String(b.id || b._id) === k)) bankIds.add(k);
        });
      }
      if (activePlanner.projections) {
        Object.keys(activePlanner.projections).forEach((k) => {
          if ((bankSources || []).some((b) => String(b.id || b._id) === k)) bankIds.add(k);
        });
      }
      bankIds.forEach((bankId) => {
        const proj = activePlanner.projections?.[bankId];
        const isActive = proj?.active !== undefined ? Boolean(proj.active) : false;
        const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner.allocations?.[bankId]?.monthlyAmount ?? 0);
        if (isActive && monthlyAmt > 0) {
          bankAdditions += spanMonths * monthlyAmt;
        }
      });
    } else {
      (plannerGoals || []).forEach((goal) => {
        const goalSpan = goal.targetDate
          ? Math.max(0, dayjs(goal.targetDate).startOf("month").diff(dayjs().startOf("month"), "month"))
          : spanMonths;
        const usedSpan = Math.min(spanMonths, goalSpan > 0 ? goalSpan : spanMonths);
        const projections = goal.projections || {};
        Object.keys(projections).forEach((srcId) => {
          const p = projections[srcId];
          const alloc = goal.allocations?.[srcId];
          const isBank =
            alloc?.sourceType === "bank" ||
            (goal.selectedBanks || []).includes(srcId) ||
            (bankSources || []).some((b) => String(b.id || b._id) === srcId);
          if (isBank && p?.active && Number(p?.monthlyAmount) > 0) {
            bankAdditions += usedSpan * Number(p.monthlyAmount);
          }
        });
      });
    }
    const projectedBankTotal = Math.round((bankMetrics.total + bankAdditions) * 100) / 100;

    // 2. Demat / Stocks Projection
    let stockAdditions = 0;
    if (activePlanner) {
      const stockIds = new Set(activePlanner.selectedStocks || activePlanner.allocatedStocks || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "stock") return;
          if ((stocksData || []).some((s) => String(s.id || s._id) === k)) stockIds.add(k);
        });
      }
      if (activePlanner.projections) {
        Object.keys(activePlanner.projections).forEach((k) => {
          if ((stocksData || []).some((s) => String(s.id || s._id) === k)) stockIds.add(k);
        });
      }
      stockIds.forEach((stockId) => {
        const proj = activePlanner.projections?.[stockId];
        const isActive = proj?.active !== undefined ? Boolean(proj.active) : false;
        const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner.allocations?.[stockId]?.monthlyAmount ?? 0);
        if (isActive && monthlyAmt > 0) {
          stockAdditions += spanMonths * monthlyAmt;
        }
      });
    } else {
      (plannerGoals || []).forEach((goal) => {
        const goalSpan = goal.targetDate
          ? Math.max(0, dayjs(goal.targetDate).startOf("month").diff(dayjs().startOf("month"), "month"))
          : spanMonths;
        const usedSpan = Math.min(spanMonths, goalSpan > 0 ? goalSpan : spanMonths);
        const projections = goal.projections || {};
        Object.keys(projections).forEach((srcId) => {
          const p = projections[srcId];
          const alloc = goal.allocations?.[srcId];
          const isStock =
            alloc?.sourceType === "stock" ||
            (goal.selectedStocks || []).includes(srcId) ||
            (stocksData || []).some((s) => String(s.id || s._id) === srcId);
          if (isStock && p?.active && Number(p?.monthlyAmount) > 0) {
            stockAdditions += usedSpan * Number(p.monthlyAmount);
          }
        });
      });
    }
    const projectedDematTotal = Math.round((dematMetrics.total + stockAdditions) * 100) / 100;

    // 3. Fixed Deposits Projection
    let projectedFdTotalVal = 0;
    let fdAdditions = 0;
    if (activePlanner) {
      const fdIds = new Set(activePlanner.selectedFds || activePlanner.allocatedFds || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "fd") return;
          if ((fdData || []).some((fd) => String(fd.id || fd._id) === k)) fdIds.add(k);
        });
      }
      if (activePlanner.projections) {
        Object.keys(activePlanner.projections).forEach((k) => {
          if ((fdData || []).some((fd) => String(fd.id || fd._id) === k)) fdIds.add(k);
        });
      }
      fdIds.forEach((fdId) => {
        const proj = activePlanner.projections?.[fdId];
        const isActive = proj?.active !== undefined ? Boolean(proj.active) : false;
        const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner.allocations?.[fdId]?.monthlyAmount ?? 0);
        if (isActive && monthlyAmt > 0) {
          fdAdditions += spanMonths * monthlyAmt;
        }
      });
      projectedFdTotalVal = fdMetrics.total + fdAdditions;
    } else {
      let fdList = (fdData || []).filter(
        (fd) => !fd.isWithdrawn && fd.status !== "Withdrawn" && fd.status !== "Closed"
      );
      fdList.forEach((fd) => {
        const principal = Number(fd.amount) || 0;
        const maturity = Number(fd.maturityAmount) || principal;
        const rate = Number(fd.interestRate) || 0;
        const maturityDate = fd.maturityDate ? dayjs(fd.maturityDate) : null;

        let fdTargetVal = maturity;
        if (maturityDate && maturityDate.isValid() && targetDateObj.isBefore(maturityDate)) {
          const monthsToTarget = Math.max(0, targetDateObj.diff(dayjs(fd.startDate || fd.depositDate || fd.createdAt || dayjs()), "month"));
          if (monthsToTarget > 0 && rate > 0) {
            fdTargetVal = Math.min(maturity, principal * Math.pow(1 + rate / 400, 4 * (monthsToTarget / 12)));
          } else {
            fdTargetVal = principal;
          }
        }
        projectedFdTotalVal += fdTargetVal;
      });
    }
    const projectedFdTotal = Math.round(projectedFdTotalVal * 100) / 100;

    // 4. Recurring Deposits Projection
    let projectedRdTotalVal = 0;
    let rdAdditions = 0;
    if (activePlanner) {
      const rdIds = new Set(activePlanner.selectedRds || activePlanner.allocatedRds || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "rd") return;
          if ((rdData || []).some((rd) => String(rd.id || rd._id) === k)) rdIds.add(k);
        });
      }
      if (activePlanner.projections) {
        Object.keys(activePlanner.projections).forEach((k) => {
          if ((rdData || []).some((rd) => String(rd.id || rd._id) === k)) rdIds.add(k);
        });
      }
      rdIds.forEach((rdId) => {
        const proj = activePlanner.projections?.[rdId];
        const isActive = proj?.active !== undefined ? Boolean(proj.active) : false;
        const rd = (rdData || []).find((r) => String(r.id || r._id) === rdId);
        const defaultMonthly = Number(rd?.amount) || Number(rd?.monthlyAmount) || 0;
        const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner.allocations?.[rdId]?.monthlyAmount ?? defaultMonthly);
        if (isActive && monthlyAmt > 0) {
          rdAdditions += spanMonths * monthlyAmt;
        }
      });
      projectedRdTotalVal = rdMetrics.total + rdAdditions;
    } else {
      let rdList = (rdData || []).filter(
        (rd) => !rd.isWithdrawn && rd.status !== "Withdrawn" && rd.status !== "Closed"
      );
      rdList.forEach((rd) => {
        const txns = rd.transactions || [];
        const txnSum = txns.reduce(
          (acc, t) => acc + (Number(t.amtDeposit) || Number(t.amount) || 0),
          0
        );
        const currentDeposited = txnSum > 0 ? txnSum : Number(rd.amount) || Number(rd.monthlyAmount) || 0;
        const maturity = Number(rd.maturityAmount) || currentDeposited;
        const monthly = Number(rd.amount) || Number(rd.monthlyAmount) || 0;
        const tenure = Number(rd.tenureMonths) || 12;

        const monthsDepositedSoFar = monthly > 0 ? Math.floor(currentDeposited / monthly) : 0;
        const remainingMonthsInTenure = Math.max(0, tenure - monthsDepositedSoFar);
        const monthsToAdd = Math.min(spanMonths, remainingMonthsInTenure);
        if (spanMonths >= remainingMonthsInTenure && remainingMonthsInTenure > 0) {
          projectedRdTotalVal += maturity;
        } else {
          projectedRdTotalVal += currentDeposited + monthsToAdd * monthly;
        }
      });
    }
    const projectedRdTotal = Math.round(projectedRdTotalVal * 100) / 100;

    // 5. Mutual Funds Projection
    let mfAdditions = 0;
    if (activePlanner) {
      const mfIds = new Set(activePlanner.selectedMfs || activePlanner.allocatedMfs || []);
      if (activePlanner.allocations) {
        Object.keys(activePlanner.allocations).forEach((k) => {
          if (activePlanner.allocations[k]?.sourceType && activePlanner.allocations[k].sourceType !== "mf") return;
          if ((mfData || []).some((m) => String(m.id || m._id) === k)) mfIds.add(k);
        });
      }
      if (activePlanner.projections) {
        Object.keys(activePlanner.projections).forEach((k) => {
          if ((mfData || []).some((m) => String(m.id || m._id) === k)) mfIds.add(k);
        });
      }
      mfIds.forEach((mfId) => {
        const proj = activePlanner.projections?.[mfId];
        const isActive = proj?.active !== undefined ? Boolean(proj.active) : false;
        const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner.allocations?.[mfId]?.monthlyAmount ?? 0);
        if (isActive && monthlyAmt > 0) {
          mfAdditions += spanMonths * monthlyAmt;
        }
      });
    } else {
      (plannerGoals || []).forEach((goal) => {
        const goalSpan = goal.targetDate
          ? Math.max(0, dayjs(goal.targetDate).startOf("month").diff(dayjs().startOf("month"), "month"))
          : spanMonths;
        const usedSpan = Math.min(spanMonths, goalSpan > 0 ? goalSpan : spanMonths);
        const projections = goal.projections || {};
        Object.keys(projections).forEach((srcId) => {
          const p = projections[srcId];
          const alloc = goal.allocations?.[srcId];
          const isMf =
            alloc?.sourceType === "mf" ||
            (goal.selectedMfs || []).includes(srcId) ||
            (mfData || []).some((m) => String(m.id || m._id) === srcId);
          if (isMf && p?.active && Number(p?.monthlyAmount) > 0) {
            mfAdditions += usedSpan * Number(p.monthlyAmount);
          }
        });
      });
    }
    const projectedMfTotal = Math.round((mfMetrics.total + mfAdditions) * 100) / 100;

    // 6. Provident Fund (EPF) Projection
    let projectedPfTotal = 0;
    if (activePlanner) {
      if (pfMetrics.isIncluded) {
        const pfProj = activePlanner.projections?.["source-pf-balance"];
        const futurePfAdditions = pfProj?.active && Number(pfProj.monthlyAmount) > 0
          ? spanMonths * Number(pfProj.monthlyAmount)
          : (spanMonths * monthlyPfContribution * pfMetrics.allocatedPct) / 100;
        projectedPfTotal = Math.round((pfMetrics.total + futurePfAdditions) * 100) / 100;
      } else {
        projectedPfTotal = 0;
      }
    } else {
      const futurePfAdditions = spanMonths * monthlyPfContribution;
      projectedPfTotal = Math.round((pfMetrics.fullBalance + futurePfAdditions) * 100) / 100;
    }

    const projectedTotalWorth =
      projectedBankTotal +
      projectedDematTotal +
      projectedFdTotal +
      projectedRdTotal +
      projectedMfTotal +
      projectedPfTotal;

    const monthlyGrowthTotal =
      (bankAdditions + stockAdditions + fdAdditions + rdAdditions + mfAdditions + (spanMonths > 0 ? (projectedPfTotal - pfMetrics.total) : 0)) /
      (spanMonths || 1);

    return {
      bankTotal: projectedBankTotal,
      dematTotal: projectedDematTotal,
      fdTotal: projectedFdTotal,
      rdTotal: projectedRdTotal,
      mfTotal: projectedMfTotal,
      pfTotal: projectedPfTotal,
      totalWorth: Math.round(projectedTotalWorth * 100) / 100,
      monthlyGrowthTotal: Math.round(monthlyGrowthTotal),
      spanMonths,
    };
  }, [
    targetDateObj,
    activePlanner,
    plannerGoals,
    bankMetrics.total,
    dematMetrics.total,
    fdMetrics.total,
    rdMetrics.total,
    mfMetrics.total,
    pfMetrics,
    totalWorth,
    monthlyPfContribution,
    fdData,
    rdData,
    bankSources,
    stocksData,
    mfData,
  ]);

  const toggleProjectionMode = (val) => {
    const next = typeof val === "boolean" ? val : !projectionMode;
    setProjectionMode(next);
    localStorage.setItem("pulse_portfolio_projection_mode", String(next));
  };

  // Active Valuations across cards & graphs
  const displayBankValuation = projectionMode ? projectedMetrics.bankTotal : bankMetrics.total;
  const displayDematValuation = projectionMode ? projectedMetrics.dematTotal : dematMetrics.total;
  const displayFdValuation = projectionMode ? projectedMetrics.fdTotal : fdMetrics.total;
  const displayRdValuation = projectionMode ? projectedMetrics.rdTotal : rdMetrics.total;
  const displayMfValuation = projectionMode ? projectedMetrics.mfTotal : mfMetrics.total;
  const displayPfValuation = projectionMode ? projectedMetrics.pfTotal : pfMetrics.total;
  const displayTotalWorth = projectionMode ? projectedMetrics.totalWorth : totalWorth;

  const targetSpanMonths = projectedMetrics.spanMonths || 0;

  const currentInterDateFormatted = projectionMode ? (targetMonthFormatted || currentMonthFormatted) : currentMonthFormatted;

  const displayUserAge = projectionMode ? (userAgeOnTarget || userAge) : userAge;

  // Dynamic Upper Limit & Milestones (Adapts to Active Planner)
  const activeUpperLimit = useMemo(() => {
    if (activePlanner && Number(activePlanner.targetAmount) > 0) {
      return Number(activePlanner.targetAmount);
    }
    return upperLimit;
  }, [activePlanner, upperLimit]);

  const activeMilestones = useMemo(() => {
    if (activePlanner && Number(activePlanner.targetAmount) > 0) {
      const target = Number(activePlanner.targetAmount);
      return [
        { id: "p1", label: "25% Quarter Mark", amount: target * 0.25 },
        { id: "p2", label: "50% Halfway Goal", amount: target * 0.5 },
        { id: "p3", label: "75% Three-Quarter Goal", amount: target * 0.75 },
        { id: "p4", label: `100% Target (${formatCurrencyCompact(target)})`, amount: target },
      ];
    }
    return milestones;
  }, [activePlanner, milestones]);

  // Achievement Percentage & Remaining to Goal (uses displayTotalWorth)
  const achievementPercent = useMemo(() => {
    if (!activeUpperLimit || activeUpperLimit <= 0) return 0;
    const raw = (displayTotalWorth / activeUpperLimit) * 100;
    return Math.min(100, Math.round(raw * 10) / 10);
  }, [displayTotalWorth, activeUpperLimit]);

  const remainingToGoal = useMemo(() => {
    return Math.max(0, activeUpperLimit - displayTotalWorth);
  }, [activeUpperLimit, displayTotalWorth]);

  // Percentage shares for each asset class (uses display valuations)
  const assetShares = useMemo(() => {
    if (displayTotalWorth <= 0) {
      return { bank: 0, demat: 0, fd: 0, rd: 0, mf: 0, pf: 0 };
    }
    return {
      bank: ((displayBankValuation / displayTotalWorth) * 100).toFixed(1),
      demat: ((displayDematValuation / displayTotalWorth) * 100).toFixed(1),
      fd: ((displayFdValuation / displayTotalWorth) * 100).toFixed(1),
      rd: ((displayRdValuation / displayTotalWorth) * 100).toFixed(1),
      mf: ((displayMfValuation / displayTotalWorth) * 100).toFixed(1),
      pf: ((displayPfValuation / displayTotalWorth) * 100).toFixed(1),
    };
  }, [
    displayTotalWorth,
    displayBankValuation,
    displayDematValuation,
    displayFdValuation,
    displayRdValuation,
    displayMfValuation,
    displayPfValuation,
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
                return hideNumbers ? "••••••" : formatCurrencyCompact(displayTotalWorth);
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
      labels: [projectionMode ? "Projected Portfolio Worth" : "Current Portfolio Worth"],
    };
  }, [displayTotalWorth, hideNumbers, projectionMode]);

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
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val) => `${val}%`,
        },
      },
      grid: {
        show: false,
      },
      legend: {
        show: false,
      },
      colors: [
        ASSET_THEMES.bank.color,
        ASSET_THEMES.demat.color,
        ASSET_THEMES.fd.color,
        ASSET_THEMES.rd.color,
        ASSET_THEMES.mf.color,
        ASSET_THEMES.pf.color,
      ],
    };
  }, []);

  const horizontalStackedSeries = useMemo(() => {
    // If portfolio is empty, give equal 1 to avoid chart error
    const isZero = displayTotalWorth === 0;
    return [
      { name: "Bank Balance", data: [isZero ? 1 : displayBankValuation] },
      { name: "Demat Holdings", data: [isZero ? 1 : displayDematValuation] },
      { name: "Fixed Deposits (FD)", data: [isZero ? 1 : displayFdValuation] },
      { name: "Recurring Deposits (RD)", data: [isZero ? 1 : displayRdValuation] },
      { name: "Mutual Funds (MF)", data: [isZero ? 1 : displayMfValuation] },
      { name: "Provident Fund (PF)", data: [isZero ? 1 : displayPfValuation] },
    ];
  }, [
    displayTotalWorth,
    displayBankValuation,
    displayDematValuation,
    displayFdValuation,
    displayRdValuation,
    displayMfValuation,
    displayPfValuation,
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
        valuation: displayBankValuation,
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
        valuation: displayDematValuation,
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
        valuation: displayFdValuation,
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
        valuation: displayRdValuation,
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
        valuation: displayMfValuation,
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
        valuation: displayPfValuation,
        share: Number(assetShares.pf) || 0,
        count: pfMetrics.monthsCount,
        countLabel: `${pfMetrics.monthsCount} Mos`,
        link: ASSET_THEMES.pf.link,
        linkText: "Ledger",
      },
    ];
  }, [
    displayBankValuation,
    displayDematValuation,
    displayFdValuation,
    displayRdValuation,
    displayMfValuation,
    displayPfValuation,
    bankMetrics.count,
    dematMetrics.holdingsCount,
    fdMetrics.count,
    rdMetrics.count,
    mfMetrics.count,
    pfMetrics.monthsCount,
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
      <div className="sticky top-[-17px] z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 -mx-4 px-4 py-2.5 mt-[-16px]">
        <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto px-2 md:px-4">
          {/* Left: Page Title & Breadcrumb subtext */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20 shadow-xs shrink-0">
              <Layers size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-base-content">
                  Portfolio
                </h1>
                <span className="badge badge-xs sm:badge-sm font-bold bg-base-200 text-base-content/70 max-w-[130px] sm:max-w-[220px] truncate">
                  {activePlanner ? `${activePlanner.icon || "🎯"} ${activePlanner.title}` : "Total Wealth Tracker"}
                </span>
              </div>
              <p className="text-[11px] text-base-content/50 font-medium truncate max-w-[180px] sm:max-w-[260px] leading-tight">
                {activePlanner
                  ? `${achievementPercent}% of ${formatCurrencyCompact(activeUpperLimit)} target`
                  : "Consolidated net worth across all assets"}
              </p>
            </div>
          </div>

          {/* Center: Planner Selector Dropdown (Themed DaisyUI Dropdown) */}
          <div className="dropdown dropdown-bottom shrink-0">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-2.5 bg-base-200/90 hover:bg-base-200 px-3.5 py-1.5 rounded-2xl border border-base-300 hover:border-primary/40 shadow-xs transition-all cursor-pointer group select-none"
              title="Switch Portfolio View"
            >
              <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <Target size={13} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-base-content/45 leading-none mb-0.5">
                  Portfolio View
                </span>
                <span className="font-bold text-xs text-base-content flex items-center gap-1.5 leading-tight">
                  <span className="truncate max-w-[140px] sm:max-w-[190px]">
                    {selectedPlannerId === "all"
                      ? "🌐 Whole Portfolio"
                      : `${activePlanner?.icon || "🎯"} ${activePlanner?.title || "Goal Plan"}`}
                  </span>
                </span>
              </div>
              <ChevronDown
                size={14}
                className="text-base-content/50 group-hover:text-primary transition-transform duration-200 group-hover:translate-y-0.5 shrink-0 ml-0.5"
              />
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-72 sm:w-80 z-[100] mt-2 border border-base-300/70 space-y-1"
            >
              <li className="menu-title text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 px-3 py-1">
                Select Portfolio View
              </li>

              {/* Option 1: Whole Portfolio */}
              <li>
                <button
                  type="button"
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-xs transition-all ${
                    selectedPlannerId === "all"
                      ? "bg-primary text-primary-content font-bold shadow-xs"
                      : "hover:bg-base-200 text-base-content"
                  }`}
                  onClick={() => {
                    setSelectedPlannerId("all");
                    setSearchParams({});
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">🌐</span>
                    <div className="text-left min-w-0 truncate">
                      <div className="font-bold leading-tight truncate">Whole Portfolio</div>
                      <div className={`text-[10px] ${selectedPlannerId === "all" ? "text-primary-content/80" : "text-base-content/50"}`}>
                        Consolidated net worth across all 6 asset classes
                      </div>
                    </div>
                  </div>
                  {selectedPlannerId === "all" && <Check size={14} className="shrink-0 ml-1" />}
                </button>
              </li>

              {plannerGoals.length > 0 && (
                <div className="divider my-1 text-[10px] uppercase tracking-wider text-base-content/30 font-bold">
                  Goals & Plans ({plannerGoals.length})
                </div>
              )}

              {/* Goal Plans */}
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                {plannerGoals.map((g) => {
                  const isSelected = selectedPlannerId === g.id;
                  return (
                    <li key={g.id}>
                      <button
                        type="button"
                        className={`flex items-center justify-between py-2.5 px-3 rounded-xl text-xs transition-all ${
                          isSelected
                            ? "bg-primary text-primary-content font-bold shadow-xs"
                            : "hover:bg-base-200 text-base-content"
                        }`}
                        onClick={() => {
                          setSelectedPlannerId(g.id);
                          setSearchParams({ planner: g.id });
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0">{g.icon || "🎯"}</span>
                          <div className="text-left min-w-0 truncate">
                            <div className="font-bold leading-tight truncate">{g.title}</div>
                            <div className={`text-[10px] font-mono ${isSelected ? "text-primary-content/80" : "text-base-content/50"}`}>
                              Target: {formatCurrencyCompact(g.targetAmount)}
                              {g.targetDate ? ` • ${dayjs(g.targetDate).format("MMM YYYY")}` : ""}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="shrink-0 ml-1" />}
                      </button>
                    </li>
                  );
                })}
              </div>

              {/* Dropdown Footer with link to planner */}
              <div className="pt-2 mt-1 border-t border-base-300/60">
                <Link
                  to="/dashboard/investment/planner"
                  className="flex items-center justify-between py-2 px-3 rounded-xl text-xs text-primary hover:bg-primary/10 font-bold transition-all"
                  onClick={() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal size={13} /> Open Investment Planner
                  </span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </ul>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto flex-nowrap">
            {/* Projection Toggle Switch */}
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-xl border select-none ${
                projectionMode
                  ? "bg-primary/10 border-primary/40 text-primary shadow-xs"
                  : "bg-base-200 hover:bg-base-300/80 border-base-300/60 text-base-content/70"
              }`}
              title={
                projectionMode
                  ? `Projection Mode ON: Displaying portfolio valuations on target date (${targetMonthFormattedShort || "Target Date"}).`
                  : "Turn on Projection to view estimated portfolio data on the target date"
              }
            >
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Sparkles
                  size={13}
                  className={`shrink-0 ${
                    projectionMode ? "text-primary" : "opacity-60"
                  }`}
                />
                <span className="text-xs font-bold whitespace-nowrap">
                  Projection
                </span>
                <input
                  type="checkbox"
                  checked={projectionMode}
                  onChange={(e) => toggleProjectionMode(e.target.checked)}
                  className="toggle toggle-primary toggle-xs ml-0.5 shrink-0"
                />
              </label>
            </div>

            {/* Privacy Mask Toggle */}
            <button
              type="button"
              onClick={toggleHideNumbers}
              className={`btn btn-xs rounded-xl font-bold gap-1 border border-base-300/60 transition-all shrink-0 ${
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
              className="btn btn-xs btn-primary gap-1 rounded-xl font-bold shadow-xs shrink-0"
              title="Configure Portfolio Upper Limit & Milestones"
            >
              <SlidersHorizontal size={13} />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Real-time Refresh Button */}
            <button
              type="button"
              onClick={() => {
                apiCache.invalidate("/investment");
                fetchAllPortfolioData();
              }}
              disabled={loading}
              className="btn btn-circle btn-xs bg-base-200/70 hover:bg-base-200 border border-base-300/50 shrink-0"
              title="Refresh Portfolio Data"
            >
              <RefreshCw size={12} className={loading ? "text-primary" : "opacity-70"} />
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
                  <h3 className="text-base font-extrabold tracking-tight text-base-content flex items-center gap-2">
                    <span>Asset Class Breakdown</span>
                    {projectionMode && (
                      <span className="badge badge-sm font-bold bg-primary/10 text-primary border-primary/20">
                        Target Date Projection
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-base-content/50">
                    {projectionMode
                      ? `Projected wealth distribution across all wealth categories on ${targetMonthFormatted}`
                      : "Individual portfolio cards for each wealth category"}
                  </p>
                </div>
                <span className="badge badge-sm font-mono font-bold bg-base-200">
                  6 Asset Classes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. BANK BALANCE CARD */}
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl border border-base-content/8 dark:border-base-content/8 relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none text-emerald-500/[0.06] dark:text-emerald-400/[0.07]">
                    <Landmark className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content flex items-center gap-1.5">
                          <span>Bank Balance</span>
                          {projectionMode && (
                            <span className="badge badge-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">
                              Projected
                            </span>
                          )}
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
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(displayBankValuation)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        {projectionMode ? (
                          <span>
                            {targetMonthFormattedShort ? `Target: ${targetMonthFormattedShort}` : "Projected"} • {bankMetrics.count} accounts
                          </span>
                        ) : (
                          <span>{bankMetrics.count} bank/wallet accounts</span>
                        )}
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.bank)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-content/8 dark:border-base-content/8 flex items-center justify-between text-xs">
                      <span className="text-base-content/50 text-[11px]">
                        Liquid Reserves
                      </span>
                      <Link
                        to={ASSET_THEMES.bank.link}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Accounts</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. DEMAT / STOCKS AMOUNT CARD */}
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl border border-base-content/8 dark:border-base-content/8 relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none text-blue-500/[0.06] dark:text-blue-400/[0.07]">
                    <TrendingUp className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content flex items-center gap-1.5">
                          <span>Demat Amount</span>
                          {projectionMode && (
                            <span className="badge badge-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border-none">
                              Projected
                            </span>
                          )}
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
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(displayDematValuation)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        {projectionMode ? (
                          <span>{dematMetrics.holdingsCount} stocks • Valuation on {targetMonthFormattedShort}</span>
                        ) : (
                          <>
                            <span>{dematMetrics.holdingsCount} stocks holding</span>
                            <span>•</span>
                            <span>{dematMetrics.totalShares} total shares</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.demat)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-content/8 dark:border-base-content/8 flex items-center justify-between text-xs">
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
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl border border-base-content/8 dark:border-base-content/8 relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none text-amber-500/[0.06] dark:text-amber-400/[0.07]">
                    <ShieldCheck className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content flex items-center gap-1.5">
                          <span>Fixed Deposits (FD)</span>
                          {projectionMode && (
                            <span className="badge badge-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none">
                              Projected
                            </span>
                          )}
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
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(displayFdValuation)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        {projectionMode ? (
                          <span>{fdMetrics.count} deposits • Compounded / Maturity on {targetMonthFormattedShort}</span>
                        ) : (
                          <>
                            <span>{fdMetrics.count} active deposits</span>
                            <span>•</span>
                            <span>Maturity: {hideNumbers ? "••••" : formatCurrencyCompact(fdMetrics.maturityTotal)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.fd)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-content/8 dark:border-base-content/8 flex items-center justify-between text-xs">
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
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl border border-base-content/8 dark:border-base-content/8 relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none text-orange-500/[0.06] dark:text-orange-400/[0.07]">
                    <PiggyBank className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content flex items-center gap-1.5">
                          <span>Recurring Deposits (RD)</span>
                          {projectionMode && (
                            <span className="badge badge-xs font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border-none">
                              Projected
                            </span>
                          )}
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
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(displayRdValuation)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        {projectionMode ? (
                          <span>{rdMetrics.count} schemes • Projected on {targetMonthFormattedShort}</span>
                        ) : (
                          <span>{rdMetrics.count} active recurring schemes</span>
                        )}
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.rd)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-content/8 dark:border-base-content/8 flex items-center justify-between text-xs">
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
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl border border-base-content/8 dark:border-base-content/8 relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none text-purple-500/[0.06] dark:text-purple-400/[0.07]">
                    <PieChart className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content flex items-center gap-1.5">
                          <span>Mutual Funds (MF)</span>
                          {projectionMode && (
                            <span className="badge badge-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border-none">
                              Projected
                            </span>
                          )}
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
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(displayMfValuation)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        {projectionMode ? (
                          <span>{mfMetrics.count} schemes • Corpus + SIPs on {targetMonthFormattedShort}</span>
                        ) : (
                          <span>{mfMetrics.count} active folios / schemes</span>
                        )}
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.mf)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-content/8 dark:border-base-content/8 flex items-center justify-between text-xs">
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
                <div className="card bg-base-200 shadow-md p-5 rounded-3xl border border-base-content/8 dark:border-base-content/8 relative overflow-hidden group hover:shadow-xl">
                  {/* Light Background Watermark Icon */}
                  <div className="absolute -right-3 top-0 bottom-0 flex items-center pointer-events-none text-teal-500/[0.06] dark:text-teal-400/[0.07]">
                    <Percent className="h-[115%] w-auto aspect-square" strokeWidth={1.2} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm sm:text-base text-base-content flex items-center gap-1.5">
                          <span>Provident Fund (PF)</span>
                          {projectionMode && (
                            <span className="badge badge-xs font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border-none">
                              Projected
                            </span>
                          )}
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
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(displayPfValuation)}`}
                      </div>
                      <div className="text-xs text-base-content/60 flex items-center gap-1.5">
                        {projectionMode ? (
                          <span>{pfMetrics.count} accounts • Compound Yield on {targetMonthFormattedShort}</span>
                        ) : (
                          <span>{pfMetrics.count} PF accounts active</span>
                        )}
                      </div>
                    </div>

                    {/* Proportion bar */}
                    <div className="w-full bg-base-100 rounded-full h-1.5 mb-4 overflow-hidden border border-base-300/40">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, assetShares.pf)}%` }}
                      />
                    </div>

                    <div className="pt-3 border-t border-base-content/8 dark:border-base-content/8 flex items-center justify-between text-xs">
                      <span className="text-base-content/50 text-[11px]">
                        Retirement Corpus
                      </span>
                      <Link
                        to={ASSET_THEMES.pf.link}
                        className="text-primary font-bold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Accounts</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* 2. TARGET TIMELINE & INVESTOR HORIZON (CURRENT/TARGET & AGE) */}
            {/* ============================================================ */}
            <div className="card bg-base-200 shadow-md p-5 sm:p-6 rounded-3xl border border-base-300/80 relative overflow-hidden">
              {/* Decorative Watermark */}
              <div className="absolute -right-6 -bottom-6 flex items-center pointer-events-none text-primary/[0.03] dark:text-primary/[0.04]">
                <Clock className="w-52 h-52" strokeWidth={1} />
              </div>

              <div className="relative z-10 space-y-4">
                {/* Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-500/20 shadow-xs shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-base-content flex items-center gap-2">
                        <span>{activePlanner ? `${activePlanner.title} • Timeline & Investor Age` : "Portfolio Timeline & Investor Age"}</span>
                        {activePlanner ? (
                          <span className="badge badge-xs sm:badge-sm font-bold bg-primary/10 text-primary border-primary/20">
                            Active Life Goal
                          </span>
                        ) : projectionMode ? (
                          <span className="badge badge-xs sm:badge-sm font-bold bg-secondary/15 text-secondary border-secondary/20">
                            🔮 Whole Portfolio Projection
                          </span>
                        ) : null}
                      </h3>
                      <p className="text-xs text-base-content/60">
                        {activePlanner
                          ? `Time horizon progression and investor age projections for this goal`
                          : projectionMode
                          ? `Time horizon progression and investor age projections across your consolidated portfolio on ${targetMonthFormatted}`
                          : `Current date marker and investor age profile across your consolidated portfolio`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="btn btn-xs btn-ghost border border-base-300 gap-1.5 text-xs text-base-content/70 hover:text-primary hover:bg-base-100 rounded-xl transition-all shadow-2xs"
                      title="Open Portfolio & Goal Settings"
                    >
                      <SlidersHorizontal size={12} />
                      <span>Settings</span>
                    </button>
                    <Link
                      to="/dashboard/investment/planner"
                      className="btn btn-xs btn-primary gap-1.5 text-xs font-bold rounded-xl shadow-xs"
                      title="Open Life Goals & Financial Planner"
                    >
                      <span>Planner</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>

                {/* Section Content */}
                {targetDateObj ? (
                  /* Case A: Active Goal (or Whole Portfolio in Projection Mode) with Target Date */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Left: Current Month -> Target Month Timeline (lg:col-span-7) */}
                    <div className="lg:col-span-7 bg-base-100/90 rounded-2xl p-4 sm:p-5 border border-base-300/70 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50">
                          {activePlanner ? "Goal Horizon Timeline" : "Portfolio Projection Timeline"}
                        </span>
                        <span className="badge badge-sm font-mono font-bold bg-primary/10 text-primary border-primary/20">
                          {planSpanInfo?.full || `${dayjs(targetDateObj).diff(dayjs(), "month")} Months`}
                        </span>
                      </div>

                      {/* Timeline Representation */}
                      <div className="flex items-center justify-between gap-2 sm:gap-4 py-1">
                        {/* Start / Current Month Node */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
                            <Calendar size={18} />
                          </div>
                          <div className="flex flex-col text-left leading-tight">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-base-content/45">
                              Current Month
                            </span>
                            <span className="font-extrabold text-sm sm:text-base text-base-content font-mono whitespace-nowrap">
                              {currentMonthFormatted}
                            </span>
                            <span className="text-[10px] text-base-content/50 font-medium">
                              {currentFullDate}
                            </span>
                          </div>
                        </div>

                        {/* Connecting Line with Span Info */}
                        <div
                          className="flex-1 flex flex-col items-center justify-center px-2 min-w-[70px] cursor-pointer group select-none"
                          onClick={() => toggleProjectionMode(!projectionMode)}
                          title={projectionMode ? "Projection active. Click to view Present values." : "Click to view Projected values."}
                        >
                          <span className="text-[11px] font-mono font-extrabold text-primary mb-1 whitespace-nowrap flex items-center gap-1 group-hover:underline">
                            <span>{planSpanInfo?.short || planSpanInfo?.full}</span>
                          </span>
                          <div className="w-full relative flex items-center">
                            <div className="w-full h-1.5 bg-primary/20 rounded-full" />
                            <div
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full shadow-xs"
                              style={{ width: `${projectionMode ? 100 : 0}%` }}
                            />
                            <div
                              className="w-3 h-3 rounded-full bg-primary border-2 border-base-100 absolute -translate-x-1/2 shadow-xs"
                              style={{ left: `${projectionMode ? 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-base-content/40 mt-1 group-hover:text-primary transition-colors">
                            {projectionMode ? "Projected View" : "Present View"}
                          </span>
                        </div>

                        {/* Target Month Node */}
                        <div
                          className="flex items-center gap-3 shrink-0 text-right"
                        >
                          <div className="flex flex-col text-right leading-tight">
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-secondary/80 flex items-center justify-end gap-1">
                              <span>Target Month</span>
                            </span>
                            <span className="font-extrabold text-sm sm:text-base text-secondary font-mono whitespace-nowrap">
                              {targetMonthFormatted}
                            </span>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-base-content/50 font-medium">
                              <span>Target Date</span>
                              {!activePlanner && (
                                <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                                  <label
                                    tabIndex={0}
                                    role="button"
                                    className="btn btn-ghost px-1 py-0 h-auto min-h-0 text-[10px] text-primary hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                                    title="Change Whole Portfolio Target Horizon"
                                  >
                                    <span>(Change)</span>
                                    <ChevronDown size={10} />
                                  </label>
                                  <ul
                                    tabIndex={0}
                                    className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-2xl w-64 z-[90] border border-base-300 text-xs space-y-1 mt-1 text-left"
                                  >
                                    <li className="menu-title text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-2">
                                      Select Goal Horizon
                                    </li>
                                    {plannerGoals
                                      .filter((g) => g.targetDate && dayjs(g.targetDate).isValid())
                                      .map((g) => (
                                        <li key={g.id}>
                                          <button
                                            type="button"
                                            className={`flex items-center justify-between py-2 px-2.5 rounded-xl ${
                                              effectiveTargetDate === g.targetDate ? "bg-primary text-primary-content font-bold" : "hover:bg-base-200"
                                            }`}
                                            onClick={() => {
                                              setWholePortfolioTargetDate(g.targetDate);
                                              localStorage.setItem("pulse_portfolio_whole_target_date", g.targetDate);
                                              if (!projectionMode) toggleProjectionMode(true);
                                              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                                            }}
                                          >
                                            <span className="truncate">{g.icon || "🎯"} {g.title}</span>
                                            <span className="font-mono text-[10px] opacity-80 shrink-0">
                                              {dayjs(g.targetDate).format("MMM YYYY")}
                                            </span>
                                          </button>
                                        </li>
                                      ))}
                                    <div className="divider my-0.5 text-[10px] uppercase font-bold text-base-content/30">Presets</div>
                                    {[1, 2, 3, 5, 10].map((years) => {
                                      const presetDate = dayjs().add(years, "year").date(1).format("YYYY-MM-DD");
                                      return (
                                        <li key={years}>
                                          <button
                                            type="button"
                                            className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl ${
                                              effectiveTargetDate === presetDate ? "bg-primary text-primary-content font-bold" : "hover:bg-base-200"
                                            }`}
                                            onClick={() => {
                                              setWholePortfolioTargetDate(presetDate);
                                              localStorage.setItem("pulse_portfolio_whole_target_date", presetDate);
                                              if (!projectionMode) toggleProjectionMode(true);
                                              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                                            }}
                                          >
                                            <span>+{years} {years === 1 ? "Year" : "Years"}</span>
                                            <span className="font-mono text-[10px] opacity-80 shrink-0">
                                              {dayjs(presetDate).format("MMM YYYY")}
                                            </span>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/20 shadow-xs">
                            <Target size={18} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Investor Age & Target Age Cards (lg:col-span-5) */}
                    <div className="lg:col-span-5 bg-base-100/90 rounded-2xl p-4 sm:p-5 border border-base-300/70 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs mb-2.5">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/50">
                          Investor Age Progression
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsSettingsOpen(true)}
                          className="text-[11px] text-primary hover:underline font-bold"
                        >
                          View Details
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Current Age Box */}
                        <div className="bg-base-200/60 p-3 rounded-xl border border-base-300/40 flex flex-col justify-center">
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-base-content/45 mb-1 flex items-center justify-between">
                            <span>Current Age</span>
                          </span>
                          <div className="font-mono font-black text-sm sm:text-base text-base-content leading-tight">
                            {`${userAge.years}y ${userAge.months}m`}
                          </div>
                          <span className="text-[10px] text-base-content/50 mt-0.5">
                            {`${userAge.days} days`}
                          </span>
                        </div>

                        {/* Target Age Box */}
                        <div className="bg-amber-500/10 dark:bg-amber-500/15 p-3 rounded-xl border border-amber-500/30 flex flex-col justify-center">
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                            Age on Target
                          </span>
                          <div className="font-mono font-black text-sm sm:text-base text-amber-600 dark:text-amber-400 leading-tight">
                            {userAgeOnTarget ? `${userAgeOnTarget.years}y ${userAgeOnTarget.months}m` : "—"}
                          </div>
                          <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                            at {targetMonthFormattedShort}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePlanner && !targetDateObj ? (
                  /* Case B: Active Goal without Target Date */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8 bg-base-100/90 rounded-2xl p-4 sm:p-5 border border-base-300/70 shadow-xs flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0 border border-warning/20">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-base-content">
                            Target Date Not Configured
                          </h4>
                          <p className="text-xs text-base-content/60">
                            Set a target month for <strong>{activePlanner.title}</strong> in the planner to view timeline span & age on target.
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/dashboard/investment/planner"
                        className="btn btn-sm btn-warning font-bold rounded-xl shrink-0 gap-1.5"
                      >
                        <Calendar size={14} />
                        Set Target Date
                      </Link>
                    </div>

                    <div className="md:col-span-4 bg-base-100/90 rounded-2xl p-4 sm:p-5 border border-base-300/70 shadow-xs flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-base-content/45 mb-1">
                        Current Investor Age
                      </span>
                      <div className="font-mono font-black text-base text-base-content">
                        {userAge.years} Years, {userAge.months} Months
                      </div>
                      <span className="text-[10px] text-base-content/50 mt-0.5">
                        {userAge.days} Days • {currentMonthFormatted}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Case C: Whole Portfolio (All Planners) */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Left: Current Date Marker (md:col-span-6) */}
                    <div className="md:col-span-6 bg-base-100/90 rounded-2xl p-4 sm:p-5 border border-base-300/70 shadow-xs flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
                        <Calendar size={22} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-base-content/45">
                          Current Timeline Marker
                        </span>
                        <div className="font-mono font-black text-lg text-base-content truncate">
                          {currentMonthFormatted}
                        </div>
                        <div className="text-xs text-base-content/60 font-medium truncate">
                          {currentFullDate}
                        </div>
                      </div>
                    </div>

                    {/* Right: User Age Profile Card (md:col-span-6) */}
                    <div className="md:col-span-6 bg-base-100/90 rounded-2xl p-4 sm:p-5 border border-base-300/70 shadow-xs flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
                          <Clock size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-extrabold tracking-wider text-base-content/45">
                            Current Investor Age
                          </span>
                          <div className="font-mono font-black text-lg text-base-content truncate">
                            {userAge.years} Years, {userAge.months} Months
                          </div>
                          <div className="text-xs text-base-content/60 font-medium truncate">
                            {userAge.days} Days • Synchronized from Profile Settings
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSettingsOpen(true)}
                        className="btn btn-xs btn-outline btn-primary gap-1 font-bold rounded-xl shrink-0"
                        title="View Portfolio & Goal Settings"
                      >
                        <SlidersHorizontal size={12} />
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* 3. ALLOCATION STACK (LEFT) & BIG INTERACTIVE GAUGE (RIGHT)   */}
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
                        <h2 className="text-base font-extrabold tracking-tight text-base-content flex items-center gap-2">
                          <span>Horizontal 100% Stacked Asset Allocation</span>
                        </h2>
                        <p className="text-xs text-base-content/50">
                          Consolidated distribution across all 6 asset classes
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-base-content/60">
                      {projectionMode ? "Projected Total: " : "Total: "}
                      <span>
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(displayTotalWorth)}`}
                      </span>
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
                      {hideNumbers ? "••••••" : formatCurrencyCompact(displayBankValuation)}
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
                      {hideNumbers ? "••••••" : formatCurrencyCompact(displayDematValuation)}
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
                      {hideNumbers ? "••••••" : formatCurrencyCompact(displayFdValuation)}
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
                      {hideNumbers ? "••••••" : formatCurrencyCompact(displayRdValuation)}
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
                      {hideNumbers ? "••••••" : formatCurrencyCompact(displayMfValuation)}
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
                      {hideNumbers ? "••••••" : formatCurrencyCompact(displayPfValuation)}
                    </div>
                    <span className="text-[10px] text-base-content/50 font-bold">
                      {assetShares.pf}% share
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Big Interactive Semi-Circle Gauge Card (6 cols) */}
              <div className="lg:col-span-6 rounded-3xl">
                <InteractivePortfolioGauge
                  totalWorth={displayTotalWorth}
                  upperLimit={activeUpperLimit}
                  milestones={activeMilestones}
                  hideNumbers={hideNumbers}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            </div>

            {/* ============================================================ */}
            {/* 3. CONSOLIDATED PORTFOLIO SUMMARY TABLE (SORTABLE)           */}
            {/* ============================================================ */}
            <div className="card bg-base-200 shadow-md rounded-3xl border border-base-content/8 dark:border-base-content/8 overflow-hidden">
              <div className="p-5 border-b border-base-content/8 dark:border-base-content/8 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TableProperties size={18} className="text-primary" />
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight text-base-content flex items-center gap-2">
                      <span>Consolidated Portfolio Ledger</span>
                      {projectionMode && (
                        <span className="badge badge-sm font-bold bg-primary/10 text-primary border-primary/20">
                          Projected ({targetMonthFormattedShort})
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-base-content/50">
                      {projectionMode
                        ? `Valuations projected to ${targetMonthFormatted} (${targetSpanMonths} months)`
                        : "Click any column header to sort in ascending or descending order"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-sm font-mono font-bold bg-base-100">
                    Sorted by: {tableSortColumn} ({tableSortDirection.toUpperCase()})
                  </span>
                  <span className="text-xs text-base-content/50 hidden sm:inline">
                    Current Month: <span className="font-bold text-base-content">{currentMonthFormatted}</span>
                    {targetDateObj && (
                      <>
                        <span className="mx-1.5 text-base-content/30">•</span>
                        Target Month: <span className="font-bold text-secondary">{targetMonthFormatted}</span>
                        <span className="ml-1 text-[11px] font-mono font-bold text-primary">({planSpanInfo?.full})</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto bg-base-100">
                <table className="table table-sm w-full text-xs">
                  <thead className="bg-base-200 text-base-content/70 select-none border-b border-base-content/8 dark:border-base-content/8">
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
                        title={projectionMode ? "Sort by Projected Valuation" : "Sort by Current Valuation"}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>
                            {projectionMode && targetMonthFormattedShort
                              ? `Projected Valuation (${targetMonthFormattedShort}) (₹)`
                              : "Current Valuation (₹)"}
                          </span>
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
                      <tr key={row.key} className="hover:bg-base-200/40 border-b border-base-content/6 dark:border-base-content/6 transition-colors">
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
                  <tfoot className="bg-base-200/90 font-extrabold text-base-content border-t border-base-content/8 dark:border-base-content/8">
                    <tr>
                      <th className="py-3 px-4">
                        {projectionMode ? "Consolidated Projected Net Worth" : "Consolidated Net Worth"}
                      </th>
                      <th className="py-3 px-4 text-base-content/50">All 6 Assets</th>
                      <th className="py-3 px-4 text-right font-mono text-sm text-primary">
                        {hideNumbers ? "••••••" : `₹${formatCurrency2Dec(displayTotalWorth)}`}
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

            {/* Dedicated Allocated Assets in Plan Section */}
            {activePlanner && displayTotalWorth > 0 && (
              <div className="card bg-base-200 shadow-md rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-base-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Target size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-base-content">
                          Assigned Assets in {activePlanner.title}
                        </h3>
                        {targetDateObj && (
                          <span className="badge badge-sm font-mono font-bold bg-secondary/10 text-secondary border-secondary/20">
                            Target: {targetMonthFormatted} ({planSpanInfo?.full})
                          </span>
                        )}
                        {projectionMode && (
                          <span className="badge badge-sm font-bold bg-primary/10 text-primary border-primary/20">
                            Projected Values
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-base-content/50">
                        {projectionMode
                          ? `Projected asset valuations on ${targetMonthFormatted} including planned monthly SIPs & systematic contributions`
                          : "Detailed breakdown of all sources earmarked for this life plan"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/dashboard/investment/planner"
                    className="btn btn-sm btn-ghost border border-base-300 rounded-xl font-bold text-xs gap-1.5"
                  >
                    <span>Manage in Planner</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Bank Accounts */}
                  {bankMetrics.items?.map((b) => {
                    const baseBal = Number(b.allocatedAmount !== undefined ? b.allocatedAmount : (b.currentBalance !== undefined ? b.currentBalance : b.balance)) || 0;
                    const bId = String(b.id || b._id);
                    const proj = activePlanner?.projections?.[bId];
                    const isProjActive = proj?.active !== undefined ? Boolean(proj.active) : false;
                    const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner?.allocations?.[bId]?.monthlyAmount ?? 0);
                    const addVal = projectionMode && isProjActive && monthlyAmt > 0 ? targetSpanMonths * monthlyAmt : 0;
                    const val = baseBal + addVal;

                    return (
                      <div
                        key={b.id || b._id}
                        className="bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <CompanyLogo name={b.name} size="w-8 h-8" type="bank" />
                          <div className="overflow-hidden">
                            <span className="font-extrabold text-xs text-base-content truncate block">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-base-content/50 font-semibold truncate block">
                              {projectionMode && isProjActive && monthlyAmt > 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  +₹{monthlyAmt.toLocaleString("en-IN")}/mo savings
                                </span>
                              ) : (
                                b.allocatedPercent !== undefined && b.allocatedPercent < 100
                                  ? `${b.allocatedPercent}% allocated • ${b.type || "Bank Account"}`
                                  : (b.type || "Bank Account")
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                            {hideNumbers ? "••••••" : formatCurrencyCompact(val)}
                          </span>
                          <span className="badge badge-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">
                            Bank
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Stocks */}
                  {dematMetrics.items?.map((s) => {
                    const q = Number(s.allocatedShares !== undefined ? s.allocatedShares : (s.qLeft !== undefined ? s.qLeft : s.bQty)) || 0;
                    const p = Number(s.bShare || s.bFShare || s.sharePrice || 0);
                    const baseVal = Number(s.allocatedAmount !== undefined ? s.allocatedAmount : q * p) || 0;
                    const sId = String(s.id || s._id);
                    const proj = activePlanner?.projections?.[sId];
                    const isProjActive = proj?.active !== undefined ? Boolean(proj.active) : false;
                    const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner?.allocations?.[sId]?.monthlyAmount ?? 0);
                    const addVal = projectionMode && isProjActive && monthlyAmt > 0 ? targetSpanMonths * monthlyAmt : 0;
                    const val = baseVal + addVal;

                    return (
                      <div
                        key={s.id || s._id}
                        className="bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <CompanyLogo name={s.name} size="w-8 h-8" type="stock" />
                          <div className="overflow-hidden">
                            <span className="font-extrabold text-xs text-base-content truncate block">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-base-content/50 font-semibold truncate block">
                              {projectionMode && isProjActive && monthlyAmt > 0 ? (
                                <span className="text-blue-600 dark:text-blue-400 font-bold">
                                  {q} Shares • +₹{monthlyAmt.toLocaleString("en-IN")}/mo
                                </span>
                              ) : (
                                s.allocatedPercent !== undefined && s.allocatedPercent < 100
                                  ? `${s.allocatedPercent}% allocated (${q} Shares @ ₹${p.toLocaleString("en-IN")})`
                                  : `${q} Shares @ ₹${p.toLocaleString("en-IN")}`
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                            {hideNumbers ? "••••••" : formatCurrencyCompact(val)}
                          </span>
                          <span className="badge badge-xs bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold">
                            Stock
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Mutual Funds */}
                  {mfMetrics.items
                    ?.filter((fund) => calcMfAvailableUnits(fund) > 0.0001)
                    .map((fund) => {
                      const activeUnits = calcMfAvailableUnits(fund);
                      const baseVal = Number(fund.allocatedAmount !== undefined ? fund.allocatedAmount : calcMfHoldingValue(fund)) || 0;
                      const fundId = String(fund.id || fund._id);
                      const proj = activePlanner?.projections?.[fundId];
                      const isProjActive = proj?.active !== undefined ? Boolean(proj.active) : false;
                      const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner?.allocations?.[fundId]?.monthlyAmount ?? 0);
                      const addVal = projectionMode && isProjActive && monthlyAmt > 0 ? targetSpanMonths * monthlyAmt : 0;
                      const val = baseVal + addVal;

                      return (
                        <div
                          key={fund.id || fund._id}
                          className="bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-xs flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <CompanyLogo name={fund.amc} size="w-8 h-8" type="mf" />
                            <div className="overflow-hidden">
                              <span className="font-extrabold text-xs text-base-content truncate block">
                                {fund.schemeName || fund.amc}
                              </span>
                              <span className="text-[10px] text-base-content/50 font-semibold truncate block">
                                {projectionMode && isProjActive && monthlyAmt > 0 ? (
                                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                                    {activeUnits.toFixed(2)} Units • +₹{monthlyAmt.toLocaleString("en-IN")}/mo SIP
                                  </span>
                                ) : (
                                  fund.allocatedPercent !== undefined && fund.allocatedPercent < 100
                                    ? `${fund.allocatedPercent}% allocated • ${fund.amc}`
                                    : `${activeUnits.toFixed(2)} Units • ${fund.amc}`
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <span className="text-xs font-black text-purple-600 dark:text-purple-400 block">
                              {hideNumbers ? "••••••" : formatCurrencyCompact(val)}
                            </span>
                            <span className="badge badge-xs bg-purple-500/10 text-purple-500 border-purple-500/20 font-bold">
                              MF
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {/* Fixed Deposits */}
                  {fdMetrics.items?.map((fd) => {
                    const principal = Number(fd.allocatedAmount !== undefined ? fd.allocatedAmount : fd.amount) || 0;
                    const fdId = String(fd.id || fd._id);
                    const proj = activePlanner?.projections?.[fdId];
                    const isProjActive = proj?.active !== undefined ? Boolean(proj.active) : false;
                    const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner?.allocations?.[fdId]?.monthlyAmount ?? 0);
                    const addVal = projectionMode && isProjActive && monthlyAmt > 0 ? targetSpanMonths * monthlyAmt : 0;
                    const val = principal + addVal;

                    return (
                      <div
                        key={fd.id || fd._id}
                        className="bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <CompanyLogo name={fd.bankName} size="w-8 h-8" type="bank" />
                          <div className="overflow-hidden">
                            <span className="font-extrabold text-xs text-base-content truncate block">
                              {fd.bankName} FD
                            </span>
                            <span className="text-[10px] text-base-content/50 font-semibold truncate block">
                              {projectionMode ? (
                                isProjActive && monthlyAmt > 0 ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                                    +₹{monthlyAmt.toLocaleString("en-IN")}/mo • Projected on {targetMonthFormattedShort}
                                  </span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                                    {fd.interestRate}% • Projected on {targetMonthFormattedShort}
                                  </span>
                                )
                              ) : (
                                fd.allocatedPercent !== undefined && fd.allocatedPercent < 100
                                  ? `${fd.allocatedPercent}% allocated (${fd.interestRate}%)`
                                  : `${fd.interestRate}% • Maturity: ${formatCurrencyCompact(fd.maturityAmount)}`
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                            {hideNumbers ? "••••••" : formatCurrencyCompact(val)}
                          </span>
                          <span className="badge badge-xs bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold">
                            FD
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Recurring Deposits */}
                  {rdMetrics.items?.map((rd) => {
                    const txns = rd.transactions || [];
                    const txnSum = txns.reduce(
                      (acc, t) => acc + (Number(t.amtDeposit) || Number(t.amount) || 0),
                      0
                    );
                    const currentDeposited = Number(rd.allocatedAmount !== undefined ? rd.allocatedAmount : (txnSum > 0 ? txnSum : (Number(rd.amount) || Number(rd.monthlyAmount) || 0))) || 0;
                    const rdId = String(rd.id || rd._id);
                    const proj = activePlanner?.projections?.[rdId];
                    const isProjActive = proj?.active !== undefined ? Boolean(proj.active) : false;
                    const defaultMonthly = Number(rd.amount) || Number(rd.monthlyAmount) || 0;
                    const monthlyAmt = Number(proj?.monthlyAmount ?? activePlanner?.allocations?.[rdId]?.monthlyAmount ?? defaultMonthly);
                    const addVal = projectionMode && isProjActive && monthlyAmt > 0 ? targetSpanMonths * monthlyAmt : 0;
                    const val = currentDeposited + addVal;

                    return (
                      <div
                        key={rd.id || rd._id}
                        className="bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <CompanyLogo name={rd.bankName} size="w-8 h-8" type="bank" />
                          <div className="overflow-hidden">
                            <span className="font-extrabold text-xs text-base-content truncate block">
                              {rd.bankName} RD
                            </span>
                            <span className="text-[10px] text-base-content/50 font-semibold truncate block">
                              {projectionMode ? (
                                isProjActive && monthlyAmt > 0 ? (
                                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                                    +₹{monthlyAmt.toLocaleString("en-IN")}/mo • Projected on {targetMonthFormattedShort}
                                  </span>
                                ) : (
                                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                                    {rd.interestRate}% • Projected on {targetMonthFormattedShort}
                                  </span>
                                )
                              ) : (
                                rd.allocatedPercent !== undefined && rd.allocatedPercent < 100
                                  ? `${rd.allocatedPercent}% allocated (${rd.interestRate}%)`
                                  : `${rd.interestRate}% • ${rd.tenureMonths || 0}m`
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <span className="text-xs font-black text-orange-600 dark:text-orange-400 block">
                            {hideNumbers ? "••••••" : formatCurrencyCompact(val)}
                          </span>
                          <span className="badge badge-xs bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold">
                            RD
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Provident Fund */}
                  {pfMetrics.isIncluded && (displayPfValuation > 0 || pfMetrics.total > 0) && (
                    <div className="bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center font-bold text-xs">
                          PF
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-extrabold text-xs text-base-content truncate block">
                            Provident Fund (EPF)
                          </span>
                          <span className="text-[10px] text-base-content/50 font-semibold truncate block">
                            {projectionMode ? (
                              activePlanner?.projections?.["source-pf-balance"]?.active && Number(activePlanner.projections["source-pf-balance"].monthlyAmount) > 0 ? (
                                <span className="text-teal-600 dark:text-teal-400 font-bold">
                                  {pfMetrics.allocatedPct}% • +₹{Number(activePlanner.projections["source-pf-balance"].monthlyAmount).toLocaleString("en-IN")}/mo EPF
                                </span>
                              ) : monthlyPfContribution > 0 ? (
                                <span className="text-teal-600 dark:text-teal-400 font-bold">
                                  {pfMetrics.allocatedPct}% • +₹{Math.round((monthlyPfContribution * pfMetrics.allocatedPct) / 100).toLocaleString("en-IN")}/mo EPF
                                </span>
                              ) : (
                                `${pfMetrics.allocatedPct}% allocated`
                              )
                            ) : (
                              `${pfMetrics.allocatedPct}% of available balance`
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="text-xs font-black text-teal-600 dark:text-teal-400 block">
                          {hideNumbers ? "••••••" : formatCurrencyCompact(displayPfValuation)}
                        </span>
                        <span className="badge badge-xs bg-teal-500/10 text-teal-500 border-teal-500/20 font-bold">
                          EPF
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
