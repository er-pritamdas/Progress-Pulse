import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router-dom";
import {
  Target,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  SlidersHorizontal,
  Check,
  CheckCheck,
  Info,
  ExternalLink,
  Layers,
  TrendingUp,
  PieChart,
  Landmark,
  PiggyBank,
  ShieldCheck,
  X,
  Search,
  Coins,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Percent,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  Home,
  User,
} from "lucide-react";
import { TitleChanger } from "../../../utils/TitleChanger";
import CompanyLogo from "../../../components/Dashboard/Investment/CompanyLogo";
import AllocateSourceModal from "../../../components/Dashboard/Investment/AllocateSourceModal";
import axiosInstance from "../../../Context/AxiosInstance";

// ----------------------------------------------------------------------
// Currency Formatting Helpers
// ----------------------------------------------------------------------
const formatINR = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatINRCompact = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  return `₹${num.toLocaleString("en-IN")}`;
};

// ----------------------------------------------------------------------
// Relative Date Distance Calculator (Shows how far target date is from today)
// ----------------------------------------------------------------------
const getRelativeDateInfo = (targetDateStr) => {
  if (!targetDateStr) return null;
  const target = dayjs(targetDateStr).startOf("day");
  const today = dayjs().startOf("day");
  const diffDays = target.diff(today, "day");

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      text: `${absDays} ${absDays === 1 ? "day" : "days"} ago`,
      subtext: "This date has already passed",
      isPast: true,
      diffDays,
    };
  }
  if (diffDays === 0) {
    return {
      text: "Today",
      subtext: "Goal milestone is due today",
      isPast: false,
      isToday: true,
      diffDays: 0,
    };
  }
  if (diffDays === 1) {
    return {
      text: "Tomorrow",
      subtext: "1 day from today",
      isPast: false,
      diffDays: 1,
    };
  }

  const years = Math.floor(diffDays / 365);
  const remainingDays = diffDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (days > 0 && years === 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);

  const timeString = parts.length > 0 ? parts.join(", ") : `${diffDays} days`;

  return {
    text: `${timeString} away`,
    subtext: `${diffDays.toLocaleString("en-IN")} days from today (${dayjs(targetDateStr).format("DD MMM YYYY")})`,
    isPast: false,
    diffDays,
  };
};

export const calculateAgeOnDate = (dobString, targetDateString) => {
  if (!dobString || !targetDateString) return null;
  const birthDate = dayjs(dobString);
  const targetDate = dayjs(targetDateString);
  if (!birthDate.isValid() || !targetDate.isValid() || targetDate.isBefore(birthDate)) {
    return null;
  }

  let years = targetDate.year() - birthDate.year();
  let months = targetDate.month() - birthDate.month();
  let days = targetDate.date() - birthDate.date();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = targetDate.subtract(1, "month").daysInMonth();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
  };
};

// ----------------------------------------------------------------------
// Goal Preset Categories & Life Recommendations
// ----------------------------------------------------------------------
const GOAL_PRESETS = [
  { id: "wedding", name: "Wedding", icon: "💍", defaultAmount: 2500000, defaultYears: 2, desc: "Ceremony, jewelry & celebration" },
  { id: "house", name: "Dream Home Down Payment", icon: "🏡", defaultAmount: 5000000, defaultYears: 5, desc: "Home purchase & registration" },
  { id: "car", name: "New Vehicle / Car", icon: "🚗", defaultAmount: 1500000, defaultYears: 3, desc: "Car down payment or full purchase" },
  { id: "travel", name: "Vacation / World Tour", icon: "✈️", defaultAmount: 500000, defaultYears: 1, desc: "Dream trip or family holiday" },
  { id: "education", name: "Higher Education", icon: "🎓", defaultAmount: 2500000, defaultYears: 3, desc: "Tuition, exams & masters" },
  { id: "child", name: "Child Future Fund", icon: "👶", defaultAmount: 3000000, defaultYears: 8, desc: "Child education & milestones" },
  { id: "emergency", name: "Emergency Safety Fund", icon: "🛡️", defaultAmount: 1000000, defaultYears: 1, desc: "6-12 months expenses buffer" },
  { id: "retirement", name: "Retirement Corpus", icon: "🏖️", defaultAmount: 10000000, defaultYears: 15, desc: "Financial freedom & early retirement" },
  { id: "business", name: "Business / Startup", icon: "💼", defaultAmount: 2500000, defaultYears: 3, desc: "Seed capital & venture launch" },
  { id: "renovation", name: "Home Renovation", icon: "🔨", defaultAmount: 1000000, defaultYears: 2, desc: "Interior design & home upgrades" },
  { id: "custom", name: "Custom Life Goal", icon: "🎯", defaultAmount: 2000000, defaultYears: 2, desc: "Create your own unique life plan" },
];

export default function InvSettings() {
  TitleChanger("Investment Planner | Progress Pulse");
  const navigate = useNavigate();

  // ----------------------------------------------------------------------
  // Raw Data States from APIs across all 6 asset categories
  // ----------------------------------------------------------------------
  const [bankSources, setBankSources] = useState([]);
  const [stocksData, setStocksData] = useState([]);
  const [mfData, setMfData] = useState([]);
  const [fdData, setFdData] = useState([]);
  const [rdData, setRdData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [pfWithdrawals, setPfWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------------------
  // Goals / Plans Management States (Starts completely empty)
  // ----------------------------------------------------------------------
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("pulse_investment_planner_goals");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (g) => g.id !== "goal-wedding-default" && g.id !== "goal-house-default"
          );
        }
      }
    } catch (e) {
      console.error("Failed to load planner goals:", e);
    }
    return [];
  });

  // Persist goals to localStorage
  useEffect(() => {
    localStorage.setItem("pulse_investment_planner_goals", JSON.stringify(goals));
  }, [goals]);

  // Collapse / Expand state for planners (like FoodLoggingTab)
  const [collapsedPlans, setCollapsedPlans] = useState({});

  const togglePlanCollapse = (planId) => {
    setCollapsedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const areAllPlansCollapsed = useMemo(() => {
    if (goals.length === 0) return false;
    return goals.every((g) => !!collapsedPlans[g.id]);
  }, [goals, collapsedPlans]);

  const toggleAllPlansCollapse = () => {
    if (areAllPlansCollapsed) {
      setCollapsedPlans({});
    } else {
      const next = {};
      goals.forEach((g) => {
        next[g.id] = true;
      });
      setCollapsedPlans(next);
    }
  };

  // ----------------------------------------------------------------------
  // Modals States
  // ----------------------------------------------------------------------
  // 1. Allocate Source Modal (The 3-panel popup window)
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [activePlanForModal, setActivePlanForModal] = useState(null);
  const [sourceToEditInModal, setSourceToEditInModal] = useState(null);

  // 2. Goal Creation / Editing Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    icon: "🎯",
    category: "custom",
    targetAmount: 2000000,
    targetDate: dayjs().add(2, "year").format("YYYY-MM-DD"),
    notes: "",
  });

  // 3. Clear Plan Sources Confirmation Modal
  const [planToClear, setPlanToClear] = useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // 4. Delete Plan Confirmation Modal
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 5. Total Earmarked Breakdown by Source Type Modal
  const [isEarmarkedModalOpen, setIsEarmarkedModalOpen] = useState(false);

  // 6. Unallocated Assets Breakdown by Source Type Modal
  const [isUnallocatedModalOpen, setIsUnallocatedModalOpen] = useState(false);

  // Relative Date Info for currently edited date
  const modalDateInfo = useMemo(() => {
    return getRelativeDateInfo(goalForm.targetDate);
  }, [goalForm.targetDate]);

  // User Date of Birth (stored in localStorage, default to 1998-05-15)
  const [userDob, setUserDob] = useState(() => {
    return localStorage.getItem("pulse_portfolio_dob") || "1998-05-15";
  });
  const [isEditingDob, setIsEditingDob] = useState(false);

  const handleUpdateDob = (newDob) => {
    setUserDob(newDob);
    localStorage.setItem("pulse_portfolio_dob", newDob);
  };

  // User Age on the selected target date
  const userAgeOnTargetDate = useMemo(() => {
    return calculateAgeOnDate(userDob, goalForm.targetDate);
  }, [userDob, goalForm.targetDate]);

  // Separate Dropdown States for Day, Month, Year
  const selectedDateParts = useMemo(() => {
    const valid = dayjs(goalForm.targetDate).isValid();
    const d = valid ? dayjs(goalForm.targetDate) : dayjs().add(2, "year");
    return {
      year: d.year(),
      month: d.month() + 1, // 1 to 12
      day: d.date(), // 1 to 31
    };
  }, [goalForm.targetDate]);

  const maxDaysInMonth = useMemo(() => {
    const valid = dayjs(goalForm.targetDate).isValid();
    const d = valid ? dayjs(goalForm.targetDate) : dayjs().add(2, "year");
    return d.daysInMonth() || 31;
  }, [goalForm.targetDate]);

  const handleDatePartChange = (part, value) => {
    const valid = dayjs(goalForm.targetDate).isValid();
    const current = valid ? dayjs(goalForm.targetDate) : dayjs().add(2, "year");
    let y = current.year();
    let m = current.month(); // 0 to 11
    let d = current.date();

    if (part === "year") y = parseInt(value, 10);
    if (part === "month") m = parseInt(value, 10) - 1;
    if (part === "day") d = parseInt(value, 10);

    const maxDays = dayjs(new Date(y, m, 1)).daysInMonth();
    const safeDay = Math.min(d, maxDays);
    const newDateStr = dayjs(new Date(y, m, safeDay)).format("YYYY-MM-DD");

    setGoalForm((prev) => ({
      ...prev,
      targetDate: newDateStr,
    }));
  };

  // ----------------------------------------------------------------------
  // Fetch All Investment Assets Across All 6 Categories (Matching Portfolio)
  // ----------------------------------------------------------------------
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        expenseRes,
        stocksRes,
        mfRes,
        fdRes,
        rdRes,
        salaryRes,
        pfWithRes,
      ] = await Promise.allSettled([
        axiosInstance.get("/v1/dashboard/expense/get-all-data"),
        axiosInstance.get("/v1/dashboard/investment/stocks"),
        axiosInstance.get("/v1/dashboard/investment/mf"),
        axiosInstance.get("/v1/dashboard/investment/fd"),
        axiosInstance.get("/v1/dashboard/investment/rd"),
        axiosInstance.get("/v1/dashboard/investment/salary"),
        axiosInstance.get("/v1/dashboard/investment/pf/withdrawals"),
      ]);

      const parseList = (res) => {
        if (!res || res.status !== "fulfilled") return [];
        const val = res.value?.data;
        if (Array.isArray(val?.data)) return val.data;
        if (Array.isArray(val)) return val;
        return [];
      };

      // 1. Bank Sources from Expense
      if (expenseRes.status === "fulfilled") {
        const payload = expenseRes.value?.data;
        const rawSources =
          payload?.data?.sources ||
          payload?.sources ||
          (Array.isArray(payload?.data) ? payload.data : []);
        setBankSources(Array.isArray(rawSources) ? rawSources : []);
      }

      setStocksData(parseList(stocksRes));
      setMfData(parseList(mfRes));
      setFdData(parseList(fdRes));
      setRdData(parseList(rdRes));
      setSalaryData(parseList(salaryRes));
      setPfWithdrawals(parseList(pfWithRes));
    } catch (err) {
      console.error("Error loading planner assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ----------------------------------------------------------------------
  // 1. Bank Accounts (Liquid Savings - Identical to Portfolio Calculation)
  // ----------------------------------------------------------------------
  const bankAccounts = useMemo(() => {
    const validSources = (bankSources || []).filter((s) => {
      const type = (s.type || "").toLowerCase();
      return type !== "card" && type !== "credit card" && type !== "loan";
    });

    return validSources
      .map((s, idx) => {
        const id = String(s.id || s._id || `bank-${s.name}-${idx}`);
        const bal = Number(s.currentBalance !== undefined ? s.currentBalance : s.balance) || 0;
        const holdingValue = Math.max(0, bal);
        return {
          ...s,
          id,
          sourceType: "bank",
          displayName: `${s.name || "Bank Account"} (${s.accountType || "Savings"})`,
          bankName: s.name || "Bank",
          holdingValue: Math.round(holdingValue * 100) / 100,
          balance: Math.round(holdingValue * 100) / 100,
          accountType: s.accountType || "Savings",
        };
      })
      .filter((b) => b.holdingValue > 0);
  }, [bankSources]);

  // ----------------------------------------------------------------------
  // 2. Held Stocks (Identical to Portfolio Calculation)
  // ----------------------------------------------------------------------
  const heldStocks = useMemo(() => {
    return (stocksData || [])
      .map((s, idx) => {
        const holdingQty = Number(
          s.qLeft !== undefined
            ? s.qLeft
            : s.quantityLeft !== undefined
            ? s.quantityLeft
            : s.bQty
        ) || 0;
        const buyPrice = Number(
          s.bShare || s.bFShare || s.sharePrice || s.finalBoughtPrice || 0
        );
        const holdingValue = holdingQty * buyPrice;
        const id = String(s.id || s._id || `stock-${s.name}-${idx}`);
        return {
          ...s,
          id,
          sourceType: "stock",
          displayName: s.name || s.stockName || "Stock",
          holdingQty,
          buyPrice,
          holdingValue: Math.round(holdingValue * 100) / 100,
          platform: s.platform || "Demat",
          cap: s.cap || "Large",
        };
      })
      .filter((s) => s.holdingQty > 0 && s.holdingValue > 0);
  }, [stocksData]);

  // ----------------------------------------------------------------------
  // 3. Mutual Funds (Holding Value - Only Funds with Available Units > 0)
  // ----------------------------------------------------------------------
  const holdingMutualFunds = useMemo(() => {
    return (mfData || [])
      .map((fund, idx) => {
        const txns = fund.transactions || [];
        let totalUnits = 0;
        let totalUnitsWithdrawn = 0;
        let totalInvested = 0;

        txns.forEach((t) => {
          const tl = (t?.type || "").toLowerCase();
          const act =
            t.actualAmt !== undefined && t.actualAmt !== null
              ? Number(t.actualAmt)
              : Math.max(0, (t.amtDeposit ?? (t.amtDeposit ? t.amtDeposit - (t.er || 0) : t.amount)) ?? 0);
          const navVal = Number(t.nav ?? 0);
          const u = parseFloat(t.units) || (navVal > 0 ? act / navVal : 0);

          if (tl.includes("withdr") || tl.includes("redemp") || tl.includes("swp")) {
            totalUnitsWithdrawn += u;
          } else {
            totalUnits += u;
            totalInvested += act;
          }
        });

        // Net Available Units
        const availableUnits =
          txns.length > 0
            ? Math.max(0, parseFloat((totalUnits - totalUnitsWithdrawn).toFixed(4)))
            : Number(fund.units) || Number(fund.activeUnits) || 0;

        const avgNav = totalUnits > 0 ? totalInvested / totalUnits : 0;
        const fundVal =
          availableUnits > 0.0001
            ? avgNav > 0
              ? availableUnits * avgNav
              : Number(fund.amount) || Number(fund.totalInvestment) || 0
            : 0;

        const id = String(fund.id || fund._id || `mf-${fund.schemeName}-${idx}`);
        return {
          ...fund,
          id,
          sourceType: "mf",
          displayName: fund.schemeName || fund.amc || "Mutual Fund",
          amc: fund.amc || "AMC",
          category: fund.category || "Equity",
          subCategory: fund.subCategory || "",
          availableUnits,
          activeUnits: availableUnits,
          holdingValue: Math.round(fundVal * 100) / 100,
        };
      })
      // Only show mutual funds with active holding units > 0
      .filter((f) => f.availableUnits > 0.0001 && f.holdingValue > 0);
  }, [mfData]);

  // ----------------------------------------------------------------------
  // 4. Fixed Deposits (Active FDs - Identical to Portfolio Calculation)
  // ----------------------------------------------------------------------
  const activeFixedDeposits = useMemo(() => {
    return (fdData || [])
      .filter((fd) => !fd.isWithdrawn && fd.status !== "Withdrawn" && fd.status !== "Closed")
      .map((fd, idx) => {
        const id = String(fd.id || fd._id || `fd-${fd.bankName}-${idx}`);
        const principal = Number(fd.amount) || 0;
        return {
          ...fd,
          id,
          sourceType: "fd",
          displayName: `${fd.bankName || "Bank"} Fixed Deposit`,
          bankName: fd.bankName || "Bank",
          holdingValue: Math.round(principal * 100) / 100,
          principal,
          maturityAmount: Number(fd.maturityAmount) || principal,
          interestRate: Number(fd.interestRate) || 0,
          fdNumber: fd.fdNumber || fd.accountNumber || "",
        };
      })
      .filter((fd) => fd.holdingValue > 0);
  }, [fdData]);

  // ----------------------------------------------------------------------
  // 5. Recurring Deposits (Active RDs - Identical to Portfolio Calculation)
  // ----------------------------------------------------------------------
  const activeRecurringDeposits = useMemo(() => {
    return (rdData || [])
      .filter((rd) => !rd.isWithdrawn && rd.status !== "Withdrawn" && rd.status !== "Closed")
      .map((rd, idx) => {
        const id = String(rd.id || rd._id || `rd-${rd.bankName}-${idx}`);
        const txns = rd.transactions || [];
        const txnSum = txns.reduce(
          (acc, t) => acc + (Number(t.amtDeposit) || Number(t.amount) || 0),
          0
        );
        const principal = txnSum > 0 ? txnSum : Number(rd.amount) || Number(rd.monthlyAmount) || 0;
        return {
          ...rd,
          id,
          sourceType: "rd",
          displayName: `${rd.bankName || "Bank"} Recurring Deposit`,
          bankName: rd.bankName || "Bank",
          monthlyAmount: Number(rd.amount) || Number(rd.monthlyAmount) || 0,
          holdingValue: Math.round(principal * 100) / 100,
          principal,
          maturityAmount: Number(rd.maturityAmount) || principal,
          interestRate: Number(rd.interestRate) || 0,
          tenureMonths: rd.tenureMonths || 0,
        };
      })
      .filter((rd) => rd.holdingValue > 0);
  }, [rdData]);

  // ----------------------------------------------------------------------
  // 6. Provident Fund (EPF / PF Net Balance - Identical to Portfolio)
  // ----------------------------------------------------------------------
  const pfSource = useMemo(() => {
    const totalContributed = (salaryData || []).reduce((acc, s) => {
      const er = Number(s.erPf) || Number(s.pfEmployer) || 0;
      const ee =
        s.eePf !== undefined && s.eePf !== null && s.eePf !== ""
          ? Number(s.eePf) || 0
          : Number(s.pfEmployee) || er;
      return acc + er + ee;
    }, 0);
    const totalWithdrawn = (pfWithdrawals || []).reduce(
      (acc, w) => acc + (Number(w.amount) || 0),
      0
    );
    const balance = Math.max(0, totalContributed - totalWithdrawn);
    return {
      id: "source-pf-balance",
      sourceType: "pf",
      displayName: "Employees' Provident Fund (EPF / PF)",
      holdingValue: Math.round(balance * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      monthsCount: (salaryData || []).length,
      withdrawalsCount: (pfWithdrawals || []).length,
    };
  }, [salaryData, pfWithdrawals]);

  // ----------------------------------------------------------------------
  // Master Consolidated List of ALL Available Sources (All 6 Asset Classes)
  // ----------------------------------------------------------------------
  const allAvailableSources = useMemo(() => {
    const list = [
      ...bankAccounts,
      ...heldStocks,
      ...holdingMutualFunds,
      ...activeFixedDeposits,
      ...activeRecurringDeposits,
    ];
    if (pfSource.balance > 0) {
      list.push(pfSource);
    }
    return list;
  }, [bankAccounts, heldStocks, holdingMutualFunds, activeFixedDeposits, activeRecurringDeposits, pfSource]);

  // Map of all sources for fast lookup
  const sourcesMap = useMemo(() => {
    const map = {};
    allAvailableSources.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [allAvailableSources]);

  // ----------------------------------------------------------------------
  // Calculate Allotted Sources for a Specific Goal
  // ----------------------------------------------------------------------
  const getAllottedSourcesForGoal = (goal) => {
    if (!goal) return [];
    const list = [];
    const allocations = goal.allocations || {};

    // 1. Process from fine-grained allocations object
    Object.keys(allocations).forEach((srcId) => {
      const alloc = allocations[srcId];
      const matched = sourcesMap[srcId];
      if (matched) {
        const totalVal = Number(matched.holdingValue) || 0;
        const pct = Number(alloc.percent) || 0;
        const amt = alloc.amount !== undefined ? Number(alloc.amount) : (totalVal * pct) / 100;
        list.push({
          ...matched,
          allocatedPercent: pct,
          allocatedAmount: amt,
          allocatedShares: alloc.shares,
        });
      }
    });

    // 2. Backward compatibility fallback for legacy selectedBanks
    (goal.selectedBanks || goal.allocatedBanks || []).forEach((bankId) => {
      if (!list.some((item) => item.id === bankId)) {
        const b = sourcesMap[bankId];
        if (b) {
          list.push({
            ...b,
            allocatedPercent: 100,
            allocatedAmount: b.holdingValue,
          });
        }
      }
    });

    // 3. Fallback for legacy selectedStocks
    (goal.selectedStocks || goal.allocatedStocks || []).forEach((stockId) => {
      if (!list.some((item) => item.id === stockId)) {
        const s = sourcesMap[stockId];
        if (s) {
          list.push({
            ...s,
            allocatedPercent: 100,
            allocatedAmount: s.holdingValue,
            allocatedShares: s.holdingQty,
          });
        }
      }
    });

    // 4. Fallback for legacy selectedMfs
    (goal.selectedMfs || goal.allocatedMfs || []).forEach((mfId) => {
      if (!list.some((item) => item.id === mfId)) {
        const m = sourcesMap[mfId];
        if (m) {
          list.push({
            ...m,
            allocatedPercent: 100,
            allocatedAmount: m.holdingValue,
          });
        }
      }
    });

    // 5. Fallback for legacy selectedFds
    (goal.selectedFds || goal.allocatedFds || []).forEach((fdId) => {
      if (!list.some((item) => item.id === fdId)) {
        const fd = sourcesMap[fdId];
        if (fd) {
          list.push({
            ...fd,
            allocatedPercent: 100,
            allocatedAmount: fd.holdingValue,
          });
        }
      }
    });

    // 6. Fallback for legacy selectedRds
    (goal.selectedRds || goal.allocatedRds || []).forEach((rdId) => {
      if (!list.some((item) => item.id === rdId)) {
        const rd = sourcesMap[rdId];
        if (rd) {
          list.push({
            ...rd,
            allocatedPercent: 100,
            allocatedAmount: rd.holdingValue,
          });
        }
      }
    });

    // 7. Fallback for legacy PF
    if (goal.includePf && !list.some((item) => item.id === pfSource.id)) {
      const pfPct = Number(goal.pfAllocatedPercent) || 50;
      const pfAmt = (pfSource.balance * pfPct) / 100;
      list.push({
        ...pfSource,
        allocatedPercent: pfPct,
        allocatedAmount: pfAmt,
      });
    }

    return list;
  };

  // ----------------------------------------------------------------------
  // Compute Remaining Unallocated Stats across ALL Goals for any source
  // ----------------------------------------------------------------------
  const getSourceUnallocatedStats = (sourceItem) => {
    if (!sourceItem) return { totalVal: 0, totalAllotted: 0, remainingAmt: 0, remainingPct: 0 };
    const totalVal = Number(sourceItem.holdingValue) || 0;
    let totalAllotted = 0;

    goals.forEach((g) => {
      if (g.allocations?.[sourceItem.id]) {
        totalAllotted += Number(g.allocations[sourceItem.id].amount) || 0;
      } else {
        if (sourceItem.sourceType === "bank" && (g.selectedBanks || []).includes(sourceItem.id)) {
          totalAllotted += totalVal;
        } else if (sourceItem.sourceType === "stock" && (g.selectedStocks || []).includes(sourceItem.id)) {
          totalAllotted += totalVal;
        } else if (sourceItem.sourceType === "mf" && (g.selectedMfs || []).includes(sourceItem.id)) {
          totalAllotted += totalVal;
        } else if (sourceItem.sourceType === "fd" && (g.selectedFds || []).includes(sourceItem.id)) {
          totalAllotted += totalVal;
        } else if (sourceItem.sourceType === "rd" && (g.selectedRds || []).includes(sourceItem.id)) {
          totalAllotted += totalVal;
        } else if (sourceItem.sourceType === "pf" && g.includePf) {
          totalAllotted += (totalVal * (Number(g.pfAllocatedPercent) || 50)) / 100;
        }
      }
    });

    const remainingAmt = Math.max(0, totalVal - totalAllotted);
    const remainingPct = totalVal > 0 ? Math.round((remainingAmt / totalVal) * 100) : 0;

    return {
      totalVal,
      totalAllotted,
      remainingAmt,
      remainingPct,
    };
  };

  // ----------------------------------------------------------------------
  // Helper: Calculate Metrics for Any Given Goal
  // ----------------------------------------------------------------------
  const calculateGoalMetrics = (goal) => {
    const items = getAllottedSourcesForGoal(goal);
    const totalAllocated = items.reduce((sum, item) => sum + (Number(item.allocatedAmount) || 0), 0);
    const target = Number(goal.targetAmount) || 1;
    const percentFunded = Math.min(100, Math.round((totalAllocated / target) * 100));
    const shortfall = Math.max(0, target - totalAllocated);
    const surplus = Math.max(0, totalAllocated - target);

    return {
      items,
      totalAllocated,
      target,
      percentFunded,
      shortfall,
      surplus,
      itemCount: items.length,
    };
  };

  // ----------------------------------------------------------------------
  // Top-Level Consolidated Metrics (100% Matching Portfolio Total Worth)
  // ----------------------------------------------------------------------
  const topMetrics = useMemo(() => {
    let totalTarget = 0;
    let totalEarmarked = 0;
    let totalAllottedItems = 0;

    goals.forEach((g) => {
      totalTarget += Number(g.targetAmount) || 0;
      const metrics = calculateGoalMetrics(g);
      totalEarmarked += metrics.totalAllocated;
      totalAllottedItems += metrics.itemCount;
    });

    const totalHoldingsWealth = allAvailableSources.reduce(
      (sum, s) => sum + (Number(s.holdingValue) || 0),
      0
    );

    const overallFunded = totalTarget > 0 ? Math.min(100, Math.round((totalEarmarked / totalTarget) * 100)) : 0;
    const totalUnallocatedWealth = Math.max(0, totalHoldingsWealth - totalEarmarked);

    return {
      totalTarget,
      totalEarmarked,
      overallFunded,
      totalHoldingsWealth,
      totalUnallocatedWealth,
      totalAllottedItems,
      totalPlansCount: goals.length,
    };
  }, [goals, allAvailableSources, sourcesMap]);

  // ----------------------------------------------------------------------
  // Per-Planner Table Sorting State & Sorting Helpers
  // ----------------------------------------------------------------------
  const [plannerSorts, setPlannerSorts] = useState({});

  const handlePlannerSort = (goalId, column) => {
    setPlannerSorts((prev) => {
      const current = prev[goalId];
      if (current?.column === column) {
        return {
          ...prev,
          [goalId]: {
            column,
            direction: current.direction === "asc" ? "desc" : "asc",
          },
        };
      }
      const defaultDesc = ["holdingValue", "allotment", "allocatedAmount", "remainingAmt"].includes(column);
      return {
        ...prev,
        [goalId]: {
          column,
          direction: defaultDesc ? "desc" : "asc",
        },
      };
    });
  };

  const getSortedPlannerItems = (items, goalId) => {
    if (!items || items.length === 0) return [];
    const sort = plannerSorts[goalId];
    if (!sort || !sort.column) return items;

    return [...items].sort((a, b) => {
      let valA, valB;
      switch (sort.column) {
        case "name":
          valA = (a.displayName || a.name || "").toLowerCase();
          valB = (b.displayName || b.name || "").toLowerCase();
          return sort.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);

        case "type":
          valA = (a.sourceType || "").toLowerCase();
          valB = (b.sourceType || "").toLowerCase();
          return sort.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);

        case "holdingValue":
          valA = Number(a.holdingValue) || 0;
          valB = Number(b.holdingValue) || 0;
          return sort.direction === "asc" ? valA - valB : valB - valA;

        case "allotment":
          valA = Number(a.allocatedPercent) || 0;
          valB = Number(b.allocatedPercent) || 0;
          return sort.direction === "asc" ? valA - valB : valB - valA;

        case "allocatedAmount":
          valA = Number(a.allocatedAmount) || 0;
          valB = Number(b.allocatedAmount) || 0;
          return sort.direction === "asc" ? valA - valB : valB - valA;

        case "remainingAmt": {
          const statsA = getSourceUnallocatedStats(a);
          const statsB = getSourceUnallocatedStats(b);
          valA = Number(statsA.remainingAmt) || 0;
          valB = Number(statsB.remainingAmt) || 0;
          return sort.direction === "asc" ? valA - valB : valB - valA;
        }

        default:
          return 0;
      }
    });
  };

  // ----------------------------------------------------------------------
  // Compute Breakdown for All 6 Source Types (Count & Accumulated Money)
  // Always returns all 6 types: if zero, count is 0 and amount is 0
  // ----------------------------------------------------------------------
  const getGoalSourceTypeStats = (items) => {
    const types = [
      { id: "bank", label: "Bank", count: 0, amount: 0, icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      { id: "stock", label: "Stocks", count: 0, amount: 0, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      { id: "mf", label: "Mutual Funds", count: 0, amount: 0, icon: PieChart, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
      { id: "fd", label: "Fixed Deposit", count: 0, amount: 0, icon: PiggyBank, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      { id: "rd", label: "Recurring Deposit", count: 0, amount: 0, icon: RotateCcw, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
      { id: "pf", label: "Provident Fund", count: 0, amount: 0, icon: ShieldCheck, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    ];

    (items || []).forEach((it) => {
      const target = types.find((t) => t.id === it.sourceType);
      if (target) {
        target.count += 1;
        target.amount += Number(it.allocatedAmount) || 0;
      }
    });

    return types;
  };

  // Overall Source Types stats across all goals for the top section
  const overallSourceTypeStats = useMemo(() => {
    const types = [
      { id: "bank", label: "Bank", count: 0, amount: 0, icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      { id: "stock", label: "Stocks", count: 0, amount: 0, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      { id: "mf", label: "Mutual Funds", count: 0, amount: 0, icon: PieChart, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
      { id: "fd", label: "Fixed Deposit", count: 0, amount: 0, icon: PiggyBank, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      { id: "rd", label: "Recurring Deposit", count: 0, amount: 0, icon: RotateCcw, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
      { id: "pf", label: "Provident Fund", count: 0, amount: 0, icon: ShieldCheck, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    ];

    const uniqueIds = {
      bank: new Set(),
      stock: new Set(),
      mf: new Set(),
      fd: new Set(),
      rd: new Set(),
      pf: new Set(),
    };

    goals.forEach((g) => {
      const items = getAllottedSourcesForGoal(g);
      items.forEach((it) => {
        const target = types.find((t) => t.id === it.sourceType);
        if (target && uniqueIds[it.sourceType]) {
          uniqueIds[it.sourceType].add(it.id);
          target.amount += Number(it.allocatedAmount) || 0;
        }
      });
    });

    types.forEach((t) => {
      t.count = uniqueIds[t.id]?.size || 0;
    });

    return types;
  }, [goals, allAvailableSources, sourcesMap]);

  // Overall Unallocated Source Types stats across all holdings
  const overallUnallocatedSourceTypeStats = useMemo(() => {
    const types = [
      { id: "bank", label: "Bank", count: 0, amount: 0, icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      { id: "stock", label: "Stocks", count: 0, amount: 0, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      { id: "mf", label: "Mutual Funds", count: 0, amount: 0, icon: PieChart, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
      { id: "fd", label: "Fixed Deposit", count: 0, amount: 0, icon: PiggyBank, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      { id: "rd", label: "Recurring Deposit", count: 0, amount: 0, icon: RotateCcw, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
      { id: "pf", label: "Provident Fund", count: 0, amount: 0, icon: ShieldCheck, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    ];

    allAvailableSources.forEach((s) => {
      const target = types.find((t) => t.id === s.sourceType);
      if (target) {
        const stats = getSourceUnallocatedStats(s);
        if (stats.remainingAmt > 0) {
          target.count += 1;
          target.amount += stats.remainingAmt;
        }
      }
    });

    return types;
  }, [allAvailableSources, goals]);

  // ----------------------------------------------------------------------
  // Allocation Modifiers (Save & Remove from 3-Panel Modal)
  // ----------------------------------------------------------------------
  const handleSaveAllocation = (planId, selectedSource, { percent, amount, shares }) => {
    setGoals((prevGoals) =>
      prevGoals.map((g) => {
        if (g.id !== planId) return g;

        const newAllocations = {
          ...(g.allocations || {}),
          [selectedSource.id]: {
            id: selectedSource.id,
            sourceType: selectedSource.sourceType,
            name: selectedSource.displayName || selectedSource.name,
            percent: Number(percent) || 0,
            amount: Number(amount) || 0,
            shares: shares !== undefined ? Number(shares) : undefined,
          },
        };

        const updated = { ...g, allocations: newAllocations };

        // Maintain backward compatibility arrays for InvTableView.jsx
        if (selectedSource.sourceType === "bank") {
          const set = new Set(g.selectedBanks || g.allocatedBanks || []);
          set.add(selectedSource.id);
          updated.selectedBanks = Array.from(set);
          updated.allocatedBanks = Array.from(set);
        } else if (selectedSource.sourceType === "stock") {
          const set = new Set(g.selectedStocks || g.allocatedStocks || []);
          set.add(selectedSource.id);
          updated.selectedStocks = Array.from(set);
          updated.allocatedStocks = Array.from(set);
        } else if (selectedSource.sourceType === "mf") {
          const set = new Set(g.selectedMfs || g.allocatedMfs || []);
          set.add(selectedSource.id);
          updated.selectedMfs = Array.from(set);
          updated.allocatedMfs = Array.from(set);
        } else if (selectedSource.sourceType === "fd") {
          const set = new Set(g.selectedFds || g.allocatedFds || []);
          set.add(selectedSource.id);
          updated.selectedFds = Array.from(set);
          updated.allocatedFds = Array.from(set);
        } else if (selectedSource.sourceType === "rd") {
          const set = new Set(g.selectedRds || g.allocatedRds || []);
          set.add(selectedSource.id);
          updated.selectedRds = Array.from(set);
          updated.allocatedRds = Array.from(set);
        } else if (selectedSource.sourceType === "pf") {
          updated.includePf = true;
          updated.pfAllocatedPercent = Number(percent) || 50;
          updated.pfAllocation = { enabled: true, percentage: Number(percent) || 50 };
        }

        return updated;
      })
    );
  };

  const handleRemoveAllocation = (planId, sourceId, sourceType) => {
    setGoals((prevGoals) =>
      prevGoals.map((g) => {
        if (g.id !== planId) return g;

        const newAllocations = { ...(g.allocations || {}) };
        delete newAllocations[sourceId];

        const updated = { ...g, allocations: newAllocations };
        if (sourceType === "bank") {
          updated.selectedBanks = (g.selectedBanks || []).filter((id) => id !== sourceId);
          updated.allocatedBanks = (g.allocatedBanks || []).filter((id) => id !== sourceId);
        } else if (sourceType === "stock") {
          updated.selectedStocks = (g.selectedStocks || []).filter((id) => id !== sourceId);
          updated.allocatedStocks = (g.allocatedStocks || []).filter((id) => id !== sourceId);
        } else if (sourceType === "mf") {
          updated.selectedMfs = (g.selectedMfs || []).filter((id) => id !== sourceId);
          updated.allocatedMfs = (g.allocatedMfs || []).filter((id) => id !== sourceId);
        } else if (sourceType === "fd") {
          updated.selectedFds = (g.selectedFds || []).filter((id) => id !== sourceId);
          updated.allocatedFds = (g.allocatedFds || []).filter((id) => id !== sourceId);
        } else if (sourceType === "rd") {
          updated.selectedRds = (g.selectedRds || []).filter((id) => id !== sourceId);
          updated.allocatedRds = (g.allocatedRds || []).filter((id) => id !== sourceId);
        } else if (sourceType === "pf") {
          updated.includePf = false;
          updated.pfAllocatedPercent = 0;
          updated.pfAllocation = { enabled: false, percentage: 0 };
        }

        return updated;
      })
    );
  };

  // Quick percent increment / decrement (like servings in FoodLoggingTab)
  const handleQuickAdjustPercent = (planId, item, delta) => {
    const currentPct = Number(item.allocatedPercent) || 100;
    const newPct = Math.max(5, Math.min(100, Math.round((currentPct + delta) / 5) * 5));
    const totalVal = Number(item.holdingValue) || 0;
    const newAmt = (totalVal * newPct) / 100;
    const newShares =
      item.sourceType === "stock"
        ? Math.max(1, Math.round((item.holdingQty || 1) * (newPct / 100)))
        : undefined;

    handleSaveAllocation(planId, item, {
      percent: newPct,
      amount: newAmt,
      shares: newShares,
    });
  };

  // Open 3-Panel Allocate Modal for a specific Plan
  const openAllocateModal = (plan, preselectedSource = null) => {
    setActivePlanForModal(plan);
    setSourceToEditInModal(preselectedSource);
    setIsAllocateModalOpen(true);
  };

  // ----------------------------------------------------------------------
  // Goal CRUD Handlers
  // ----------------------------------------------------------------------
  const openCreateGoalModal = (preset = null) => {
    setEditingGoal(null);
    const p = preset || GOAL_PRESETS[0];
    setGoalForm({
      title: p?.id === "custom" ? "" : (p?.name || ""),
      icon: p?.icon || "💍",
      category: p?.id || "wedding",
      targetAmount: p?.defaultAmount || 2500000,
      targetDate: p?.defaultYears
        ? dayjs().add(p.defaultYears, "year").format("YYYY-MM-DD")
        : dayjs().add(2, "year").format("YYYY-MM-DD"),
      notes: "",
    });
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title || "",
      icon: goal.icon || "🎯",
      category: goal.category || "custom",
      targetAmount: goal.targetAmount !== undefined ? goal.targetAmount : 2000000,
      targetDate: goal.targetDate || dayjs().add(2, "year").format("YYYY-MM-DD"),
      notes: goal.notes || "",
    });
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;

    const parsedTarget = Math.max(0, Number(goalForm.targetAmount) || 0);

    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id
            ? {
                ...g,
                ...goalForm,
                targetAmount: parsedTarget,
              }
            : g
        )
      );
    } else {
      const newGoal = {
        id: `goal-${Date.now()}`,
        ...goalForm,
        targetAmount: parsedTarget,
        allocations: {},
        selectedBanks: [],
        selectedStocks: [],
        selectedMfs: [],
        selectedFds: [],
        selectedRds: [],
        includePf: false,
        pfAllocatedPercent: 0,
        createdAt: dayjs().format("YYYY-MM-DD"),
      };
      setGoals((prev) => [...prev, newGoal]);
    }
    setIsGoalModalOpen(false);
  };

  const confirmClearPlan = () => {
    if (!planToClear) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== planToClear.id) return g;
        return {
          ...g,
          allocations: {},
          selectedBanks: [],
          selectedStocks: [],
          selectedMfs: [],
          selectedFds: [],
          selectedRds: [],
          includePf: false,
          pfAllocatedPercent: 0,
        };
      })
    );
    setIsClearModalOpen(false);
    setPlanToClear(null);
  };

  const confirmDeletePlan = () => {
    if (!planToDelete) return;
    setGoals((prev) => prev.filter((g) => g.id !== planToDelete.id));
    setIsDeleteModalOpen(false);
    setPlanToDelete(null);
  };

  return (
    <div className="w-full space-y-6 pb-28 select-none">
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP STICKY HEADER BAR                                             */}
      {/* -------------------------------------------------------------------- */}
      <div className="sticky top-[-17px] z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 -mx-4 px-4 py-3 mt-[-16px]">
        <div className="flex items-center justify-between flex-wrap gap-4 max-w-[1680px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs border border-primary/20">
              <Target size={22} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-base-content">
                  Investment Planner
                </h1>
                <span className="badge badge-sm font-bold bg-primary/10 text-primary border-primary/20">
                  Goal-Based Allocation
                </span>
              </div>
              <p className="text-xs text-base-content/60 font-medium hidden sm:block">
                Organize and earmark your liquid savings, holding stocks, mutual funds, FDs, RDs, and PF across your life milestones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* View In Portfolio Dashboard Button */}
            <Link
              to="/dashboard/investment/portfolio"
              className="btn btn-sm btn-ghost border border-base-300/80 hover:bg-base-200 rounded-xl gap-1.5 font-bold text-xs"
              title="Open the full portfolio analytics dashboard"
            >
              <span>Portfolio Dashboard</span>
              <ExternalLink size={13} className="text-primary" />
            </Link>

            {/* Refresh Data */}
            <button
              type="button"
              onClick={fetchAllData}
              disabled={loading}
              className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border border-base-300/50"
              title="Refresh all investment sources"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-primary" : "opacity-70"} />
            </button>

            {/* Create New Plan Button */}
            <button
              type="button"
              onClick={openCreateGoalModal}
              className="btn btn-sm btn-primary rounded-xl font-bold gap-1.5 shadow-sm"
            >
              <Plus size={15} />
              <span>Create Goal / Planner</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 w-full max-w-[1680px] mx-auto space-y-6">
        {/* ------------------------------------------------------------------ */}
        {/* 2. TOP SUMMARY METRICS CARDS (Inspired by Daily Nutrients Cards)    */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Target Capital */}
          <div className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={16} className="text-primary" /> Total Target Capital
              </span>
              <span className="badge badge-sm badge-ghost font-mono opacity-70">
                {topMetrics.totalPlansCount} Goals
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span className="text-3xl font-extrabold text-primary">
                {formatINRCompact(topMetrics.totalTarget)}
              </span>
              <span className="text-xs font-medium text-base-content/60">
                {formatINR(topMetrics.totalTarget)}
              </span>
            </div>
            <p className="text-xs text-base-content/60 mt-2">
              Sum of targets across all active life goals
            </p>
          </div>

          {/* Card 2: Total Earmarked Wealth (Clickable to open Breakdown Popup) */}
          <div
            onClick={() => setIsEarmarkedModalOpen(true)}
            className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500/60 hover:shadow-md transition-all group select-none relative overflow-hidden"
            title="Click to view Total Earmarked breakdown by source type"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5 group-hover:text-emerald-500 transition-colors">
                <Coins size={16} className="text-emerald-500" /> Total Earmarked
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-500 font-mono">
                  {topMetrics.overallFunded}% Funded
                </span>
                <span className="badge badge-xs p-1 font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all" title="View Breakdown">
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span className="text-3xl font-extrabold text-emerald-500">
                {formatINRCompact(topMetrics.totalEarmarked)}
              </span>
              <span className="text-xs font-medium text-base-content/60">
                / {formatINRCompact(topMetrics.totalTarget)}
              </span>
            </div>
            <div className="w-full bg-base-100 rounded-full h-2 mt-2 overflow-hidden border border-base-300">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${topMetrics.overallFunded}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Unallocated Assets (Clickable to open Breakdown Popup) */}
          <div
            onClick={() => setIsUnallocatedModalOpen(true)}
            className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-500/60 hover:shadow-md transition-all group select-none relative overflow-hidden"
            title="Click to view Unallocated Assets breakdown by source type"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5 group-hover:text-amber-500 transition-colors">
                <Sparkles size={16} className="text-amber-500" /> Unallocated Assets
              </span>
              <div className="flex items-center gap-1.5">
                <span className="badge badge-sm badge-neutral font-mono">
                  {topMetrics.totalHoldingsWealth > 0
                    ? `${Math.round((topMetrics.totalUnallocatedWealth / topMetrics.totalHoldingsWealth) * 100)}% Free`
                    : "100% Free"}
                </span>
                <span className="badge badge-xs p-1 font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all" title="View Breakdown">
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span className="text-3xl font-extrabold text-amber-500">
                {formatINRCompact(topMetrics.totalUnallocatedWealth)}
              </span>
              <span className="text-xs font-medium text-base-content/60">
                of {formatINRCompact(topMetrics.totalHoldingsWealth)} Total Worth
              </span>
            </div>
            <div className="w-full bg-base-100 rounded-full h-2 mt-2 overflow-hidden border border-base-300">
              <div
                className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                style={{
                  width: `${
                    topMetrics.totalHoldingsWealth > 0
                      ? (topMetrics.totalUnallocatedWealth / topMetrics.totalHoldingsWealth) * 100
                      : 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Card 4: Total Wealth Coverage Across All 6 Asset Classes */}
          <div className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={16} className="text-purple-500" /> Total Net Worth
              </span>
              <span className="badge badge-sm badge-ghost font-mono opacity-70">
                {allAvailableSources.length} Holdings
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span className="text-3xl font-extrabold text-purple-500">
                {formatINRCompact(topMetrics.totalHoldingsWealth)}
              </span>
              <span className="text-xs font-medium text-base-content/60 font-mono">
                {formatINR(topMetrics.totalHoldingsWealth)}
              </span>
            </div>
            <p className="text-[11px] text-base-content/60 mt-2 truncate">
              {bankAccounts.length} Bank • {heldStocks.length} Stocks • {holdingMutualFunds.length} MF • {activeFixedDeposits.length + activeRecurringDeposits.length} FD/RD • {pfSource.balance > 0 ? "1 EPF" : ""}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 3. PLANNER SECTIONS (Replicating Meal Category Breakdown Sections)  */}
        {/* ------------------------------------------------------------------ */}
        <div className="space-y-4">
          {/* Section Toolbar */}
          <div className="flex flex-wrap justify-between items-center bg-base-200/80 px-4 py-3 rounded-2xl border border-base-300 shadow-xs gap-2">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <h2 className="font-bold text-sm sm:text-base text-base-content">
                Life Goals & Financial Planners
              </h2>
              <span className="badge badge-sm badge-neutral font-semibold">
                {goals.length} {goals.length === 1 ? "Plan" : "Plans"}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {goals.length > 0 && (
                <button
                  type="button"
                  className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-xl transition-all shadow-xs"
                  onClick={toggleAllPlansCollapse}
                  title={areAllPlansCollapsed ? "Expand all planners" : "Collapse all planners"}
                >
                  {areAllPlansCollapsed ? (
                    <>
                      <ChevronDown size={14} />
                      <span>Expand All Plans</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp size={14} />
                      <span>Collapse All Plans</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                className="btn btn-xs sm:btn-sm btn-primary btn-soft gap-1.5 text-xs rounded-xl"
                onClick={openCreateGoalModal}
              >
                <Plus size={14} />
                <span>New Plan</span>
              </button>
            </div>
          </div>

          {/* If No Goals: Clean Empty State */}
          {goals.length === 0 ? (
            <div className="card bg-base-200/80 border border-base-300 p-8 sm:p-12 text-center rounded-3xl space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20 shadow-xs">
                <Target size={32} />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-extrabold text-lg sm:text-xl text-base-content">
                  No Financial Goals Created Yet
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60 leading-relaxed">
                  Create your first goal (e.g. Wedding, Dream Home, Higher Education, Retirement, Vacation, or New Vehicle) and start allotting your bank savings, stocks, mutual funds, FDs, RDs, and PF.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={openCreateGoalModal}
                  className="btn btn-primary rounded-xl font-bold gap-2 shadow-sm"
                >
                  <Plus size={16} />
                  <span>Create Your First Goal / Planner</span>
                </button>
              </div>

              {/* Quick Inspiration Presets */}
              <div className="pt-4 border-t border-base-300/80 max-w-xl mx-auto">
                <span className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider block mb-2.5">
                  Or quick-start with a popular life goal
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {GOAL_PRESETS.filter((p) => p.id !== "custom").map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setEditingGoal(null);
                        setGoalForm({
                          title: preset.name,
                          icon: preset.icon,
                          category: preset.id,
                          targetAmount: preset.defaultAmount,
                          targetDate: dayjs().add(2, "year").format("YYYY-MM-DD"),
                          notes: "",
                        });
                        setIsGoalModalOpen(true);
                      }}
                      className="btn btn-xs btn-ghost bg-base-100 hover:bg-base-300 border border-base-300 rounded-xl gap-1.5 text-xs font-semibold"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Goal / Planner Cards List */
            goals.map((goal) => {
              const metrics = calculateGoalMetrics(goal);
              const isCollapsed = !!collapsedPlans[goal.id];
              const hasItems = metrics.items.length > 0;
              const dateInfo = getRelativeDateInfo(goal.targetDate);

              return (
                <div
                  key={goal.id}
                  className="bg-base-200 rounded-2xl border border-base-300 shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* ------------------------------------------------------------ */}
                  {/* Planner Header (Clickable to Expand / Collapse)              */}
                  {/* ------------------------------------------------------------ */}
                  <div
                    className={`p-4 bg-base-300/60 flex flex-wrap justify-between items-center cursor-pointer select-none hover:bg-base-300/90 transition-colors gap-3 ${
                      !isCollapsed ? "border-b border-base-300" : ""
                    }`}
                    onClick={() => togglePlanCollapse(goal.id)}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap flex-1 min-w-0">
                      {/* Collapse/Expand Toggle Chevron */}
                      <button
                        type="button"
                        className="btn btn-xs btn-circle btn-ghost text-primary hover:bg-base-100 p-0 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlanCollapse(goal.id);
                        }}
                        title={isCollapsed ? "Expand Planner" : "Collapse Planner"}
                      >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {/* Goal Icon */}
                      <div className="w-8 h-8 rounded-xl bg-base-100 flex items-center justify-center text-lg border border-base-300/70 shadow-xs shrink-0">
                        {goal.icon || "🎯"}
                      </div>

                      {/* Goal Title */}
                      <div className="min-w-0 mr-1">
                        <h3 className="font-extrabold text-sm sm:text-base text-base-content truncate">
                          {goal.title}
                        </h3>
                        {goal.notes && (
                          <p className="text-[10.5px] text-base-content/60 truncate max-w-[180px] sm:max-w-xs">
                            {goal.notes}
                          </p>
                        )}
                      </div>

                      {/* Funding Metrics (High Contrast, Crystal-Clear Percentage) */}
                      <div className="flex items-center gap-2 bg-base-100 px-3 py-1.5 rounded-xl border border-base-300 shadow-2xs">
                        <div className="flex items-baseline gap-1 font-mono">
                          <span className="font-extrabold text-xs text-base-content">
                            {formatINR(metrics.totalAllocated)}
                          </span>
                          <span className="text-base-content/50 text-[10.5px]">
                            / {formatINRCompact(goal.targetAmount)}
                          </span>
                        </div>

                        {/* Distinct, High-Contrast Percentage Badge */}
                        <span
                          className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg shadow-xs tracking-tight ${
                            metrics.percentFunded >= 100
                              ? "bg-emerald-600 text-white"
                              : metrics.percentFunded >= 50
                              ? "bg-primary text-primary-content"
                              : "bg-amber-400 text-slate-950 font-black"
                          }`}
                        >
                          {metrics.percentFunded}%
                        </span>
                      </div>

                      {/* Target Date in DD MMM YYYY Format */}
                      {goal.targetDate && (
                        <div
                          className="badge badge-ghost badge-sm text-[11px] font-mono py-2.5 px-2.5 gap-1.5 items-center border border-base-300/70 bg-base-100/80 shadow-2xs shrink-0"
                          title={dateInfo?.subtext || ""}
                        >
                          <Calendar size={12} className="text-primary shrink-0" />
                          <span className="font-semibold text-base-content/85">
                            {dayjs(goal.targetDate).format("DD MMM YYYY")}
                          </span>
                          {dateInfo && (
                            <span className={`font-bold text-[10px] ml-0.5 ${dateInfo.isPast ? "text-error" : "text-primary"}`}>
                              ({dateInfo.text})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Total Sources */}
                      <div className="badge badge-neutral badge-sm font-semibold text-xs font-mono py-2.5 px-2.5 gap-1.5 items-center shadow-2xs shrink-0">
                        <Layers size={11} className="opacity-70 shrink-0" />
                        <span>
                          {metrics.itemCount} {metrics.itemCount === 1 ? "Source" : "Sources"}
                        </span>
                      </div>
                    </div>

                    {/* Header Action Controls */}
                    <div
                      className="flex items-center gap-2 shrink-0 ml-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Clear all sources button */}
                      {hasItems && (
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost text-error hover:bg-error/10 border border-error/20 gap-1 text-xs font-semibold"
                          title="Clear all allocated sources from this planner"
                          onClick={() => {
                            setPlanToClear(goal);
                            setIsClearModalOpen(true);
                          }}
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">Clear</span>
                        </button>
                      )}

                      {/* Edit Plan Details */}
                      <button
                        type="button"
                        className="btn btn-xs btn-neutral btn-ghost border border-base-300 gap-1 text-xs"
                        title="Edit Goal Name, Target Amount, and Date"
                        onClick={() => openEditGoalModal(goal)}
                      >
                        <Edit3 size={13} className="text-primary" />
                        <span className="hidden sm:inline">Edit Goal</span>
                      </button>

                      {/* Delete Plan (Allowed down to empty!) */}
                      <button
                        type="button"
                        className="btn btn-xs btn-ghost text-error hover:bg-error/10 p-1.5"
                        title="Delete this planner"
                        onClick={() => {
                          setPlanToDelete(goal);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* View in Portfolio Link */}
                      <Link
                        to={`/dashboard/investment/portfolio?planner=${goal.id}`}
                        className="btn btn-xs btn-ghost border border-base-300 gap-1 text-xs text-primary hover:bg-primary/10"
                        title="View this plan in Portfolio Dashboard"
                      >
                        <ExternalLink size={13} />
                        <span className="hidden md:inline">Portfolio</span>
                      </Link>

                      {/* ADD SOURCES BUTTON (Opens the 3-panel popup window) */}
                      <button
                        type="button"
                        className="btn btn-xs sm:btn-sm btn-primary gap-1 shadow-sm font-bold"
                        onClick={() => openAllocateModal(goal)}
                      >
                        <Plus size={14} />
                        <span>Add Sources</span>
                      </button>
                    </div>
                  </div>

                  {/* ------------------------------------------------------------ */}
                  {/* Planner Body (When Expanded) - Progress Bar Removed from Body */}
                  {/* ------------------------------------------------------------ */}
                  {!isCollapsed && (
                    <div className="p-4 space-y-4 animate-in fade-in duration-200">
                      {/* Earmarked Breakdown by Source Type (All 6 Types: Bank, Stocks, MF, FD, RD, EPF - if 0 shows 0) */}
                      <div className="bg-base-100/80 p-3.5 rounded-2xl border border-base-300/80 space-y-2.5">
                        <div className="flex items-center justify-between px-0.5">
                          <div className="flex items-center gap-2">
                            <Layers size={13} className="text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                              Allocated Sources Breakdown
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="font-extrabold text-primary">
                              {formatINR(metrics.totalAllocated)}
                            </span>
                            <span className="text-base-content/40">•</span>
                            <span className="text-base-content/60 font-semibold">
                              {metrics.itemCount} {metrics.itemCount === 1 ? "Source" : "Sources"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                          {getGoalSourceTypeStats(metrics.items).map((st) => (
                            <div
                              key={st.label}
                              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                                st.count > 0
                                  ? `${st.bg} ${st.border} shadow-2xs`
                                  : "bg-base-200/30 border-base-300/40 opacity-55"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider truncate flex items-center gap-1 ${st.color}`}>
                                  <st.icon size={12} className="shrink-0" />
                                  <span>{st.label}</span>
                                </span>
                                <span
                                  className={`badge badge-xs font-mono font-bold ${
                                    st.count > 0 ? "badge-primary badge-soft text-primary" : "badge-ghost opacity-60"
                                  }`}
                                >
                                  {st.count}
                                </span>
                              </div>
                              <div className="mt-1.5">
                                <div className="font-mono font-black text-xs text-base-content truncate">
                                  {formatINRCompact(st.amount)}
                                </div>
                                <div className="text-[9.5px] text-base-content/50 font-mono truncate mt-0.5">
                                  {formatINR(st.amount)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sources Table or Empty State */}
                      {!hasItems ? (
                        <div className="py-8 px-4 text-center border-2 border-dashed border-base-300 rounded-2xl bg-base-100/40 space-y-3">
                          <Coins size={36} className="text-base-content/30 mx-auto" />
                          <div>
                            <p className="font-bold text-sm text-base-content">
                              No investment sources allotted to {goal.title} yet
                            </p>
                            <p className="text-xs text-base-content/60 max-w-md mx-auto mt-1">
                              Click <strong>&quot;+ Add Sources&quot;</strong> to popup the 3-panel allocation window and allocate bank savings, stocks, mutual funds, FDs, RDs, or PF.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary rounded-xl font-bold gap-1.5 shadow-sm"
                            onClick={() => openAllocateModal(goal)}
                          >
                            <Plus size={15} />
                            <span>Add Sources to {goal.title}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
                          {(() => {
                            const sortedItems = getSortedPlannerItems(metrics.items, goal.id);
                            const currentSort = plannerSorts[goal.id];

                            const renderHeaderCell = (colKey, label, align = "left") => {
                              const isActive = currentSort?.column === colKey;
                              const direction = currentSort?.direction;
                              const alignClasses =
                                align === "right"
                                  ? "text-right justify-end"
                                  : align === "center"
                                  ? "text-center justify-center"
                                  : "text-left justify-start";

                              return (
                                <th
                                  onClick={() => handlePlannerSort(goal.id, colKey)}
                                  className={`py-3 cursor-pointer select-none transition-colors group hover:bg-base-300/60 ${
                                    isActive
                                      ? "text-primary font-black bg-primary/10"
                                      : "text-base-content/70 hover:text-base-content"
                                  }`}
                                  title={`Sort by ${label} (${
                                    isActive ? (direction === "asc" ? "Click for Descending" : "Click for Ascending") : "Click to sort"
                                  })`}
                                >
                                  <div className={`flex items-center gap-1.5 ${alignClasses}`}>
                                    <span className="font-extrabold text-xs">{label}</span>
                                    <span className="shrink-0 flex items-center">
                                      {isActive ? (
                                        direction === "asc" ? (
                                          <ArrowUp size={13} className="text-primary font-bold animate-in zoom-in-75 duration-150" />
                                        ) : (
                                          <ArrowDown size={13} className="text-primary font-bold animate-in zoom-in-75 duration-150" />
                                        )
                                      ) : (
                                        <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                                      )}
                                    </span>
                                  </div>
                                </th>
                              );
                            };

                            return (
                              <table className="table table-sm w-full">
                                <thead>
                                  <tr className="text-xs text-base-content/60 border-b border-base-300 bg-base-200/50">
                                    {renderHeaderCell("name", "Source / Asset", "left")}
                                    {renderHeaderCell("type", "Type", "center")}
                                    {renderHeaderCell("holdingValue", "Total Valuation", "right")}
                                    {renderHeaderCell("allotment", "Allotment (% / Qty)", "center")}
                                    {renderHeaderCell("allocatedAmount", "Earmarked to Plan", "right")}
                                    {renderHeaderCell("remainingAmt", "Unallotted Left", "right")}
                                    <th className="text-center py-3">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-base-200">
                                  {sortedItems.map((item) => {
                                const unallocated = getSourceUnallocatedStats(item);

                                // Color badge based on sourceType
                                const typeBadge =
                                  item.sourceType === "bank"
                                    ? { label: "Bank Account", color: "badge-success" }
                                    : item.sourceType === "stock"
                                    ? { label: "Stock", color: "badge-info" }
                                    : item.sourceType === "mf"
                                    ? { label: "Mutual Fund", color: "badge-secondary" }
                                    : item.sourceType === "fd"
                                    ? { label: "FD", color: "badge-warning" }
                                    : item.sourceType === "rd"
                                    ? { label: "RD", color: "badge-warning" }
                                    : { label: "EPF", color: "badge-accent" };

                                return (
                                  <tr key={item.id} className="hover:bg-base-200/50 transition-colors">
                                    {/* Source Name & Logo */}
                                    <td className="py-2.5 max-w-[260px]">
                                      <div className="flex items-center gap-3">
                                        <CompanyLogo
                                          name={item.displayName || item.name}
                                          type={item.sourceType === "bank" ? "bank" : item.sourceType}
                                          size="w-8 h-8"
                                          className="shrink-0"
                                        />
                                        <div className="min-w-0">
                                          <div
                                            className="font-bold text-sm truncate text-base-content"
                                            title={item.displayName || item.name}
                                          >
                                            {item.displayName || item.name}
                                          </div>
                                          <div className="text-[11px] text-base-content/60 truncate flex items-center gap-1.5">
                                            {item.sourceType === "bank" && (
                                              <span>{item.accountType ? `${item.accountType} Account` : "Liquid Savings"}</span>
                                            )}
                                            {item.sourceType === "stock" && (
                                              <span>{item.holdingQty} shares @ {formatINR(item.buyPrice)}</span>
                                            )}
                                            {item.sourceType === "mf" && (
                                              <span>{item.amc || "AMC"} • {item.category || "Equity"}</span>
                                            )}
                                            {item.sourceType === "fd" && (
                                              <span>{item.interestRate ? `${item.interestRate}% p.a.` : "Active FD"}</span>
                                            )}
                                            {item.sourceType === "rd" && (
                                              <span>{item.monthlyAmount ? `${formatINR(item.monthlyAmount)}/mo` : "Active RD"}</span>
                                            )}
                                            {item.sourceType === "pf" && (
                                              <span>{item.monthsCount ? `${item.monthsCount} payroll months` : "EPF Corpus"}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Type Badge */}
                                    <td className="text-center whitespace-nowrap py-2.5">
                                      <span className={`badge badge-sm font-bold ${typeBadge.color}`}>
                                        {typeBadge.label}
                                      </span>
                                    </td>

                                    {/* Total Holding Value */}
                                    <td className="text-right font-mono text-xs whitespace-nowrap py-2.5 text-base-content/80">
                                      {formatINR(item.holdingValue)}
                                    </td>

                                    {/* Interactive Step Buttons for Allotment (Like Servings in Food Logging) */}
                                    <td className="text-center whitespace-nowrap py-2.5">
                                      <div className="inline-flex items-center join join-horizontal border border-base-300 rounded-lg overflow-hidden shadow-2xs">
                                        <button
                                          type="button"
                                          className="join-item btn btn-xs btn-ghost px-2 font-bold hover:bg-base-200"
                                          title="Decrease allocation by 5%"
                                          onClick={() => handleQuickAdjustPercent(goal.id, item, -5)}
                                        >
                                          -
                                        </button>
                                        <span
                                          className="join-item px-2.5 py-0.5 text-xs font-mono font-bold bg-base-200/50 cursor-pointer flex items-center gap-1"
                                          title="Click to edit fine-grained allotment"
                                          onClick={() => openAllocateModal(goal, item)}
                                        >
                                          <span>{item.allocatedPercent}%</span>
                                          {item.sourceType === "stock" && item.allocatedShares !== undefined && (
                                            <span className="text-[10px] text-base-content/50">
                                              ({item.allocatedShares} sh)
                                            </span>
                                          )}
                                        </span>
                                        <button
                                          type="button"
                                          className="join-item btn btn-xs btn-ghost px-2 font-bold hover:bg-base-200"
                                          title="Increase allocation by 5%"
                                          onClick={() => handleQuickAdjustPercent(goal.id, item, 5)}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </td>

                                    {/* Earmarked Amount */}
                                    <td className="text-right whitespace-nowrap py-2.5">
                                      <span className="font-bold text-primary font-mono text-sm">
                                        {formatINR(item.allocatedAmount)}
                                      </span>
                                    </td>

                                    {/* Unallocated Remaining Left */}
                                    <td className="text-right font-mono text-xs whitespace-nowrap py-2.5">
                                      <div className="text-base-content/70">
                                        {formatINR(unallocated.remainingAmt)}
                                      </div>
                                      <div className="text-[10px] text-base-content/50">
                                        ({unallocated.remainingPct}% free)
                                      </div>
                                    </td>

                                    {/* Row Actions */}
                                    <td className="text-center whitespace-nowrap py-2.5">
                                      <div className="flex items-center justify-center gap-1">
                                        {/* Edit Allotment (Opens 3-panel popup window preselecting this item) */}
                                        <button
                                          type="button"
                                          className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 p-1.5"
                                          title="Fine Tune allotment"
                                          onClick={() => openAllocateModal(goal, item)}
                                        >
                                          <SlidersHorizontal size={14} />
                                        </button>

                                        {/* Remove from Plan */}
                                        <button
                                          type="button"
                                          className="btn btn-ghost btn-xs text-error hover:bg-error/10 p-1.5"
                                          title={`Remove ${item.displayName || item.name} from ${goal.title}`}
                                          onClick={() => handleRemoveAllocation(goal.id, item.id, item.sourceType)}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>

                            {/* Table Footer Summary (Exact replica of Food Logging total row) */}
                            <tfoot className="border-t-2 border-primary/30 bg-base-200/80">
                              <tr className="text-xs">
                                <td className="text-left py-3">
                                  <span className="badge badge-primary badge-sm font-black tracking-wider uppercase px-2 py-1 shadow-xs">
                                    TOTAL ({goal.title})
                                  </span>
                                </td>
                                <td className="text-center font-bold text-xs text-base-content/70 py-3">
                                  <span className="badge badge-ghost badge-xs font-semibold">
                                    {metrics.itemCount} {metrics.itemCount === 1 ? "source" : "sources"}
                                  </span>
                                </td>
                                <td className="text-right font-mono text-xs font-semibold py-3 text-base-content/70">
                                  {formatINR(metrics.items.reduce((s, it) => s + (it.holdingValue || 0), 0))}
                                </td>
                                <td className="text-center font-mono font-bold text-xs py-3 text-base-content/70">
                                  {metrics.percentFunded}% Goal Target
                                </td>
                                <td className="text-right whitespace-nowrap py-3 font-black text-primary text-sm font-mono tracking-tight">
                                  {formatINR(metrics.totalAllocated)}
                                </td>
                                <td className="text-right font-mono text-xs font-semibold py-3" colSpan={2}>
                                  {metrics.shortfall > 0 ? (
                                    <span className="text-error font-bold">
                                      Need {formatINR(metrics.shortfall)} more
                                    </span>
                                  ) : (
                                    <span className="text-success font-bold">
                                      Target Fully Funded 🎉
                                    </span>
                                  )}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        );
                      })()}
                    </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. THE 3-PANEL ALLOCATION MODAL (Pop-up window as in Food Logging)   */}
      {/* -------------------------------------------------------------------- */}
      {isAllocateModalOpen && activePlanForModal && (
        <AllocateSourceModal
          isOpen={isAllocateModalOpen}
          onClose={() => {
            setIsAllocateModalOpen(false);
            setActivePlanForModal(null);
            setSourceToEditInModal(null);
          }}
          activePlan={activePlanForModal}
          goals={goals}
          bankAccounts={bankAccounts}
          heldStocks={heldStocks}
          holdingMutualFunds={holdingMutualFunds}
          activeFixedDeposits={activeFixedDeposits}
          activeRecurringDeposits={activeRecurringDeposits}
          pfSource={pfSource}
          initialSelectedSource={sourceToEditInModal}
          onSaveAllocation={handleSaveAllocation}
          onRemoveAllocation={handleRemoveAllocation}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 5. CREATE / EDIT GOAL MODAL                                          */}
      {/* -------------------------------------------------------------------- */}
      {/* -------------------------------------------------------------------- */}
      {/* 5. CREATE / EDIT GOAL MODAL (Dual Popup: Recommendations on Left)    */}
      {/* -------------------------------------------------------------------- */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-x-auto">
          <div className="flex items-stretch justify-center gap-3 sm:gap-4 max-w-4xl w-full h-[660px] max-h-[94vh]">
            {/* ================================================================ */}
            {/* LEFT POPUP: RECOMMENDATIONS & LIFE GOAL TEMPLATES                */}
            {/* ================================================================ */}
            <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl w-60 sm:w-72 flex flex-col overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-4 border-b border-base-300 flex items-center justify-between shrink-0 bg-base-200/50">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-base-content">
                    Recommendations
                  </h4>
                </div>
                <span className="badge badge-xs font-bold font-mono bg-primary/10 text-primary">
                  {GOAL_PRESETS.length} Ideas
                </span>
              </div>

              {/* Recommendations List */}
              <div className="p-2 flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                {GOAL_PRESETS.map((preset) => {
                  const isSelected = goalForm.category === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setGoalForm((prev) => ({
                          ...prev,
                          category: preset.id,
                          icon: preset.icon,
                          title: preset.id === "custom" ? (prev.title || "Custom Goal") : preset.name,
                          targetAmount: preset.defaultAmount,
                          targetDate: preset.defaultYears
                            ? dayjs().add(preset.defaultYears, "year").format("YYYY-MM-DD")
                            : prev.targetDate,
                        }));
                      }}
                      className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer border ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs ring-1 ring-primary/20"
                          : "bg-base-200/40 hover:bg-base-200 border-base-300/40 text-base-content/80 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate min-w-0">
                        <span className="text-xl shrink-0">{preset.icon}</span>
                        <div className="truncate text-left min-w-0">
                          <div className="truncate text-xs font-bold leading-tight">{preset.name}</div>
                          <div className="text-[10px] text-base-content/50 font-mono mt-0.5">
                            {formatINRCompact(preset.defaultAmount)}
                            {preset.defaultYears ? ` • ${preset.defaultYears}y target` : ""}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-primary shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================================================================ */}
            {/* RIGHT POPUP: GOAL DETAILS FORM & 3 DATE DROPDOWNS                */}
            {/* ================================================================ */}
            <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl flex-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 min-w-0 max-w-xl">
              {/* Header */}
              <div className="px-5 py-4 border-b border-base-300 flex items-center justify-between shrink-0 bg-base-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0">
                    {goalForm.icon || "🎯"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-base-content leading-tight">
                      {editingGoal ? "Edit Financial Goal" : "Create New Goal"}
                    </h3>
                    <p className="text-[11px] text-base-content/50 mt-0.5">
                      {editingGoal ? "Update your target amount, date, or plan details" : "Define your target, timeline, and financial vision"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveGoal} className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col">
                <div className="p-5 space-y-5 flex-1">

                  {/* ── Section 1: Goal Identity ── */}
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 mb-2.5">
                      Goal Identity
                    </p>
                    <div className="grid grid-cols-5 gap-2.5">
                      <div className="col-span-1">
                        <label className="text-xs font-semibold text-base-content/60 block mb-1.5">Icon</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={goalForm.icon}
                          onChange={(e) => setGoalForm({ ...goalForm, icon: e.target.value })}
                          className="input input-bordered input-sm h-10 w-full text-center text-xl rounded-xl"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-xs font-semibold text-base-content/60 block mb-1.5">
                          Goal Name / Planner Title <span className="text-error">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Wedding 2027, Dream Home Down Payment"
                          value={goalForm.title}
                          onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                          className="input input-bordered input-sm h-10 w-full rounded-xl text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-base-200" />

                  {/* ── Section 2: Target Capital ── */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-base-content/40">
                        Target Capital
                      </p>
                      {Number(goalForm.targetAmount) > 0 && (
                        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                          {formatINR(goalForm.targetAmount)}
                          <span className="text-base-content/50 ml-1 font-medium">({formatINRCompact(goalForm.targetAmount)})</span>
                        </span>
                      )}
                    </div>
                    <div className="relative mb-2.5">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-base-content/40 font-mono">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="Enter amount, e.g. 2500000"
                        value={goalForm.targetAmount === 0 ? "" : goalForm.targetAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGoalForm((prev) => ({
                            ...prev,
                            targetAmount: val === "" ? "" : val,
                          }));
                        }}
                        className="input input-bordered input-sm h-10 w-full pl-8 rounded-xl font-mono text-base font-bold bg-base-100"
                      />
                    </div>
                    {/* Quick amount shortcuts */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider shrink-0">Quick:</span>
                      {[500000, 1000000, 2000000, 2500000, 5000000, 10000000].map((amt) => {
                        const isSelected = Number(goalForm.targetAmount) === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setGoalForm((prev) => ({ ...prev, targetAmount: amt }))}
                            className={`px-2 py-1 font-mono text-[10px] rounded-lg transition-all shrink-0 cursor-pointer border font-semibold ${
                              isSelected
                                ? "bg-primary/20 border-primary text-primary shadow-xs"
                                : "bg-base-200/60 hover:bg-primary/10 border-base-300 text-base-content/60 hover:text-primary hover:border-primary/40"
                            }`}
                          >
                            {formatINRCompact(amt)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-base-200" />

                  {/* ── Section 3: Target Date ── */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 flex items-center gap-1.5">
                        <Calendar size={11} className="text-primary" /> Target Date
                      </p>
                      {modalDateInfo && (
                        <span
                          className={`badge badge-sm font-bold font-mono text-[10px] ${
                            modalDateInfo.isPast
                              ? "badge-error text-white"
                              : modalDateInfo.isToday
                              ? "badge-warning"
                              : "badge-primary badge-soft text-primary"
                          }`}
                        >
                          {modalDateInfo.text}
                        </span>
                      )}
                    </div>

                    {/* 3 Date Dropdowns */}
                    <div className="grid grid-cols-3 gap-2 mb-2.5">
                      <div>
                        <span className="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider block mb-1">Day</span>
                        <select
                          value={selectedDateParts.day}
                          onChange={(e) => handleDatePartChange("day", e.target.value)}
                          className="select select-bordered select-sm w-full rounded-xl font-mono text-xs font-bold bg-base-100"
                        >
                          {Array.from({ length: maxDaysInMonth }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider block mb-1">Month</span>
                        <select
                          value={selectedDateParts.month}
                          onChange={(e) => handleDatePartChange("month", e.target.value)}
                          className="select select-bordered select-sm w-full rounded-xl text-xs font-bold bg-base-100"
                        >
                          {[
                            { v: 1, label: "01 — Jan" }, { v: 2, label: "02 — Feb" }, { v: 3, label: "03 — Mar" },
                            { v: 4, label: "04 — Apr" }, { v: 5, label: "05 — May" }, { v: 6, label: "06 — Jun" },
                            { v: 7, label: "07 — Jul" }, { v: 8, label: "08 — Aug" }, { v: 9, label: "09 — Sep" },
                            { v: 10, label: "10 — Oct" }, { v: 11, label: "11 — Nov" }, { v: 12, label: "12 — Dec" },
                          ].map((m) => (
                            <option key={m.v} value={m.v}>{m.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider block mb-1">Year</span>
                        <select
                          value={selectedDateParts.year}
                          onChange={(e) => handleDatePartChange("year", e.target.value)}
                          className="select select-bordered select-sm w-full rounded-xl font-mono text-xs font-bold bg-base-100"
                        >
                          {Array.from({ length: 35 }, (_, i) => dayjs().year() + i).map((yr) => (
                            <option key={yr} value={yr}>{yr}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Horizon */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider shrink-0">Horizon:</span>
                      {[
                        { label: "+1 Yr", years: 1 }, { label: "+2 Yrs", years: 2 },
                        { label: "+3 Yrs", years: 3 }, { label: "+5 Yrs", years: 5 },
                        { label: "+10 Yrs", years: 10 },
                      ].map((h) => (
                        <button
                          key={h.years}
                          type="button"
                          onClick={() => {
                            const newD = dayjs().add(h.years, "year").format("YYYY-MM-DD");
                            setGoalForm((prev) => ({ ...prev, targetDate: newD }));
                          }}
                          className="px-2 py-1 font-mono text-[10px] rounded-lg border border-base-300 bg-base-200/60 hover:bg-primary/10 hover:text-primary hover:border-primary/40 font-semibold transition-all shrink-0 cursor-pointer"
                        >
                          {h.label}
                        </button>
                      ))}
                    </div>

                    {/* Age on Target Date Card */}
                    <div className="rounded-2xl bg-base-200/60 border border-base-300 overflow-hidden">
                      <div className="flex items-center justify-between px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <User size={13} />
                          </div>
                          <div>
                            <div className="text-[10px] font-semibold text-base-content/50 leading-tight">Your age on target date</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {userAgeOnTargetDate ? (
                                <span className="font-mono font-black text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                                  {userAgeOnTargetDate.years} Yrs{userAgeOnTargetDate.months > 0 ? `, ${userAgeOnTargetDate.months} Mos` : ""}
                                </span>
                              ) : (
                                <span className="text-xs text-base-content/40 font-mono">—</span>
                              )}
                              {modalDateInfo && !modalDateInfo.isPast && (
                                <span className="badge badge-xs badge-ghost font-mono font-bold border border-base-300/80 text-[9px]">
                                  <Clock size={8} className="mr-0.5 text-primary" /> {modalDateInfo.text}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[9px] text-base-content/40 font-medium">DOB</div>
                          <div className="text-[10px] font-mono font-bold text-base-content/60">{dayjs(userDob).format("DD MMM YYYY")}</div>
                          <button
                            type="button"
                            onClick={() => setIsEditingDob(!isEditingDob)}
                            className="text-[9px] text-primary hover:underline font-bold leading-tight"
                          >
                            {isEditingDob ? "Close" : "Change"}
                          </button>
                        </div>
                      </div>
                      {isEditingDob && (
                        <div className="px-3.5 pb-2.5 border-t border-base-300/60 pt-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-base-content/60">Your Birth Date:</span>
                          <input
                            type="date"
                            max={dayjs().format("YYYY-MM-DD")}
                            value={userDob}
                            onChange={(e) => handleUpdateDob(e.target.value)}
                            className="input input-xs input-bordered rounded-lg font-mono"
                          />
                        </div>
                      )}
                      {modalDateInfo?.isPast && (
                        <div className="px-3.5 pb-2 border-t border-error/20 pt-1.5 flex items-center gap-1 text-[10.5px] text-error font-semibold">
                          <span>⚠️ Target date is in the past — please pick a future date.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-base-200" />

                  {/* ── Section 4: Notes ── */}
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-base-content/40 mb-2.5">
                      Notes & Vision <span className="normal-case text-base-content/30 font-normal">(optional)</span>
                    </p>
                    <textarea
                      rows={2}
                      placeholder="e.g. Venue, jewelry, catering, decorations, and travel…"
                      value={goalForm.notes}
                      onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                      className="textarea textarea-bordered textarea-sm w-full rounded-xl text-xs h-14 min-h-[52px] max-h-[60px] resize-none"
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-5 py-3.5 border-t border-base-300 bg-base-200/40 flex items-center justify-between gap-2 shrink-0">
                  <p className="text-[10px] text-base-content/40 font-medium hidden sm:block">
                    {editingGoal ? "Changes will update this goal immediately." : "You can allocate sources after creating the goal."}
                  </p>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsGoalModalOpen(false)}
                      className="btn btn-sm btn-ghost rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary rounded-xl font-bold gap-1.5 shadow-sm px-5"
                    >
                      <Check size={14} />
                      <span>{editingGoal ? "Update Goal" : "Create Goal"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 6. CLEAR PLAN CONFIRMATION MODAL                                     */}
      {/* -------------------------------------------------------------------- */}
      {isClearModalOpen && planToClear && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto">
              <RotateCcw size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-base-content">
                Clear All Sources from {planToClear.title}?
              </h3>
              <p className="text-xs text-base-content/60">
                This will unassign all bank savings, stocks, mutual funds, FDs, RDs, and PF from this goal. The investments themselves will remain safely in your portfolio.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsClearModalOpen(false);
                  setPlanToClear(null);
                }}
                className="btn btn-sm btn-ghost border border-base-300 rounded-xl font-bold flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearPlan}
                className="btn btn-sm btn-error rounded-xl font-bold flex-1 text-white shadow-sm"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 7. DELETE PLAN CONFIRMATION MODAL                                    */}
      {/* -------------------------------------------------------------------- */}
      {isDeleteModalOpen && planToDelete && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-base-content">
                Delete {planToDelete.title}?
              </h3>
              <p className="text-xs text-base-content/60">
                Are you sure you want to delete this financial goal? All associated allocations will be removed.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPlanToDelete(null);
                }}
                className="btn btn-sm btn-ghost border border-base-300 rounded-xl font-bold flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlan}
                className="btn btn-sm btn-error rounded-xl font-bold flex-1 text-white shadow-sm"
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 8. TOTAL EARMARKED BREAKDOWN BY SOURCE TYPE MODAL                   */}
      {/* -------------------------------------------------------------------- */}
      {isEarmarkedModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                  <Coins size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-base-content leading-tight">
                    Total Earmarked Breakdown by Source Type
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Accumulated capital and source counts across all your financial goals
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEarmarkedModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={16} />
              </button>
            </div>

            {/* Overview Metric Banner */}
            <div className="bg-base-200/70 p-4 rounded-2xl border border-base-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1.5 flex-1 w-full">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-base-content/70">
                    Overall Funded Progress
                  </span>
                  <span className="font-mono text-emerald-500 text-sm">
                    {topMetrics.overallFunded}% ({formatINRCompact(topMetrics.totalEarmarked)} / {formatINRCompact(topMetrics.totalTarget)})
                  </span>
                </div>
                <div className="w-full bg-base-100 rounded-full h-2.5 overflow-hidden border border-base-300">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${topMetrics.overallFunded}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                  Total Active Allocations
                </span>
                <span className="font-mono font-extrabold text-base text-primary">
                  {topMetrics.totalAllottedItems} Assets
                </span>
              </div>
            </div>

            {/* 6 Source Types Grid (Showing all 6, if 0 shows 0) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-base-content/70 px-1">
                <span>Asset Categories Breakdown</span>
                <span className="font-mono text-[11px] text-base-content/50 font-normal">
                  All 6 Asset Classes
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {overallSourceTypeStats.map((st) => (
                  <div
                    key={st.label}
                    className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                      st.count > 0
                        ? `${st.bg} ${st.border} shadow-xs`
                        : "bg-base-200/30 border-base-300/40 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-extrabold uppercase tracking-wider truncate flex items-center gap-1.5 ${st.color}`}>
                        <st.icon size={14} className="shrink-0" />
                        <span>{st.label}</span>
                      </span>
                      <span
                        className={`badge badge-xs font-mono font-bold ${
                          st.count > 0 ? "badge-primary badge-soft text-primary" : "badge-ghost opacity-60"
                        }`}
                      >
                        {st.count} {st.count === 1 ? "source" : "sources"}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="font-mono font-black text-sm sm:text-base text-base-content truncate">
                        {formatINRCompact(st.amount)}
                      </div>
                      <div className="text-[10.5px] text-base-content/50 font-mono truncate mt-0.5">
                        {formatINR(st.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-base-300 flex items-center justify-between">
              <span className="text-xs text-base-content/50">
                Click any goal below to adjust individual asset allotments
              </span>
              <button
                type="button"
                onClick={() => setIsEarmarkedModalOpen(false)}
                className="btn btn-sm btn-primary rounded-xl font-bold px-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 9. UNALLOCATED ASSETS BREAKDOWN BY SOURCE TYPE MODAL                 */}
      {/* -------------------------------------------------------------------- */}
      {isUnallocatedModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-3xl border border-base-300 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-base-content leading-tight">
                    Unallocated Assets Breakdown by Source Type
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Available uncommitted capital across all 6 asset classes ready for goal planning
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUnallocatedModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={16} />
              </button>
            </div>

            {/* Overview Metric Banner */}
            <div className="bg-base-200/70 p-4 rounded-2xl border border-base-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1.5 flex-1 w-full">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-base-content/70">
                    Free Portfolio Capital
                  </span>
                  <span className="font-mono text-amber-500 text-sm">
                    {topMetrics.totalHoldingsWealth > 0
                      ? `${Math.round((topMetrics.totalUnallocatedWealth / topMetrics.totalHoldingsWealth) * 100)}%`
                      : "100%"} Free ({formatINRCompact(topMetrics.totalUnallocatedWealth)} of {formatINRCompact(topMetrics.totalHoldingsWealth)})
                  </span>
                </div>
                <div className="w-full bg-base-100 rounded-full h-2.5 overflow-hidden border border-base-300">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                    style={{
                      width: `${
                        topMetrics.totalHoldingsWealth > 0
                          ? (topMetrics.totalUnallocatedWealth / topMetrics.totalHoldingsWealth) * 100
                          : 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-base-content/50 block">
                  Unallocated Sources
                </span>
                <span className="font-mono font-extrabold text-base text-amber-500">
                  {overallUnallocatedSourceTypeStats.reduce((sum, t) => sum + t.count, 0)} Assets
                </span>
              </div>
            </div>

            {/* 6 Source Types Grid (Showing all 6, if 0 shows 0) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-base-content/70 px-1">
                <span>Asset Categories Breakdown</span>
                <span className="font-mono text-[11px] text-base-content/50 font-normal">
                  All 6 Asset Classes
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {overallUnallocatedSourceTypeStats.map((st) => (
                  <div
                    key={st.label}
                    className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                      st.count > 0
                        ? `${st.bg} ${st.border} shadow-xs`
                        : "bg-base-200/30 border-base-300/40 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-extrabold uppercase tracking-wider truncate flex items-center gap-1.5 ${st.color}`}>
                        <st.icon size={14} className="shrink-0" />
                        <span>{st.label}</span>
                      </span>
                      <span
                        className={`badge badge-xs font-mono font-bold ${
                          st.count > 0 ? "badge-warning badge-soft text-amber-600 dark:text-amber-400" : "badge-ghost opacity-60"
                        }`}
                      >
                        {st.count} {st.count === 1 ? "source" : "sources"}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="font-mono font-black text-sm sm:text-base text-base-content truncate">
                        {formatINRCompact(st.amount)}
                      </div>
                      <div className="text-[10.5px] text-base-content/50 font-mono truncate mt-0.5">
                        {formatINR(st.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-base-300 flex items-center justify-between">
              <span className="text-xs text-base-content/50">
                Allocate unassigned capital to your goals from the planner sections below
              </span>
              <button
                type="button"
                onClick={() => setIsUnallocatedModalOpen(false)}
                className="btn btn-sm btn-primary rounded-xl font-bold px-5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
