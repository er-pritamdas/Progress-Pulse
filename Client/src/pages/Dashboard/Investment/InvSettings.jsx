import React, { useState, useMemo, useEffect, useRef } from "react";
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

const POPULAR_GOAL_ICONS = [
  "🎯", "💍", "🏡", "🚗", "✈️", "🏖️",
  "👶", "🎓", "🛡️", "💼", "🔨", "🚀",
  "💻", "📈", "💎", "⛵", "🏥", "🚲",
];

const MONTHS = [
  { value: 0, name: "January", short: "Jan" },
  { value: 1, name: "February", short: "Feb" },
  { value: 2, name: "March", short: "Mar" },
  { value: 3, name: "April", short: "Apr" },
  { value: 4, name: "May", short: "May" },
  { value: 5, name: "June", short: "Jun" },
  { value: 6, name: "July", short: "Jul" },
  { value: 7, name: "August", short: "Aug" },
  { value: 8, name: "September", short: "Sep" },
  { value: 9, name: "October", short: "Oct" },
  { value: 10, name: "November", short: "Nov" },
  { value: 11, name: "December", short: "Dec" },
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
  // Goals / Plans Management States (Single source of truth: MongoDB)
  // ----------------------------------------------------------------------
  const [goals, setGoals] = useState([]);

  // Collapse / Expand state for planners (collapsed by default)
  const [expandedPlans, setExpandedPlans] = useState({});

  const togglePlanCollapse = (planId) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const areAllPlansCollapsed = useMemo(() => {
    if (goals.length === 0) return true;
    return goals.every((g) => !expandedPlans[g.id]);
  }, [goals, expandedPlans]);

  const toggleAllPlansCollapse = () => {
    if (areAllPlansCollapsed) {
      const next = {};
      goals.forEach((g) => {
        next[g.id] = true;
      });
      setExpandedPlans(next);
    } else {
      setExpandedPlans({});
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

  // Emoji picker popup state for goal modal
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Relative Date Info for currently edited date
  const modalDateInfo = useMemo(() => {
    return getRelativeDateInfo(goalForm.targetDate);
  }, [goalForm.targetDate]);

  // Target Month & Year dropdown popup states for goal modal
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const monthPickerRef = useRef(null);
  const yearPickerRef = useRef(null);

  // Close month/year popups on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) {
        setIsMonthOpen(false);
      }
      if (yearPickerRef.current && !yearPickerRef.current.contains(e.target)) {
        setIsYearOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const targetDateObj = useMemo(() => {
    return dayjs(goalForm.targetDate).isValid()
      ? dayjs(goalForm.targetDate)
      : dayjs().add(2, "year");
  }, [goalForm.targetDate]);

  const currentMonthIndex = targetDateObj.month();
  const currentYearVal = targetDateObj.year();

  const handleSelectMonth = (monthIndex) => {
    const updated = targetDateObj.month(monthIndex).date(1).format("YYYY-MM-DD");
    setGoalForm((prev) => ({ ...prev, targetDate: updated }));
    setIsMonthOpen(false);
  };

  const handleSelectYear = (yearNum) => {
    const updated = targetDateObj.year(yearNum).date(1).format("YYYY-MM-DD");
    setGoalForm((prev) => ({ ...prev, targetDate: updated }));
    setIsYearOpen(false);
  };

  const availableYears = useMemo(() => {
    const thisYear = dayjs().year();
    const minYear = Math.min(thisYear - 1, currentYearVal);
    const maxYear = Math.max(thisYear + 45, currentYearVal + 10);
    const list = [];
    for (let y = minYear; y <= maxYear; y++) {
      list.push(y);
    }
    return list;
  }, [currentYearVal]);

  // ----------------------------------------------------------------------
  // User Profile Data (DOB & Picture from Registered user profile settings)
  // ----------------------------------------------------------------------
  const [userProfilePic, setUserProfilePic] = useState(() => {
    const directPic = localStorage.getItem("profilePic");
    if (directPic) return directPic;
    try {
      const parsed = JSON.parse(localStorage.getItem("user_profile") || "{}");
      if (parsed.profilePic) return parsed.profilePic;
    } catch (e) {}
    return "";
  });

  const [userDisplayName, setUserDisplayName] = useState(() => {
    let name = localStorage.getItem("fullName") || localStorage.getItem("username");
    if (!name) {
      try {
        const parsed = JSON.parse(localStorage.getItem("user_profile") || "{}");
        name = parsed.fullName || parsed.username;
      } catch (e) {}
    }
    return name || "User";
  });

  const userInitials = useMemo(() => {
    const name = userDisplayName.trim();
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [userDisplayName]);

  // User Date of Birth (fetched from Registered user profile settings / MongoDB)
  const [userDob, setUserDob] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user_profile") || "{}");
      if (parsed.dateOfBirth) return parsed.dateOfBirth;
    } catch (e) {}
    return localStorage.getItem("pulse_portfolio_dob") || "";
  });
  const [isEditingDob, setIsEditingDob] = useState(false);

  const handleUpdateDob = async (newDob) => {
    setUserDob(newDob);
    localStorage.setItem("pulse_portfolio_dob", newDob);
    try {
      const existing = JSON.parse(localStorage.getItem("user_profile") || "{}");
      existing.dateOfBirth = newDob;
      localStorage.setItem("user_profile", JSON.stringify(existing));
    } catch (e) {}

    // Persist to RegisteredUsers in MongoDB
    try {
      await axiosInstance.put("/v1/dashboard/profile", { dateOfBirth: newDob });
    } catch (err) {
      console.error("Failed to update dateOfBirth in profile:", err);
    }
  };

  // User Age on the selected target date
  const userAgeOnTargetDate = useMemo(() => {
    return calculateAgeOnDate(userDob, goalForm.targetDate);
  }, [userDob, goalForm.targetDate]);

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
        plansRes,
        profileRes,
      ] = await Promise.allSettled([
        axiosInstance.get("/v1/dashboard/expense/get-all-data"),
        axiosInstance.get("/v1/dashboard/investment/stocks"),
        axiosInstance.get("/v1/dashboard/investment/mf"),
        axiosInstance.get("/v1/dashboard/investment/fd"),
        axiosInstance.get("/v1/dashboard/investment/rd"),
        axiosInstance.get("/v1/dashboard/investment/salary"),
        axiosInstance.get("/v1/dashboard/investment/pf/withdrawals"),
        axiosInstance.get("/v1/dashboard/investment/plans"),
        axiosInstance.get("/v1/dashboard/profile"),
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

      // 2. Investment Planner Goals from Database
      if (plansRes.status === "fulfilled") {
        const payload = plansRes.value?.data;
        const dbList = Array.isArray(payload?.data) ? payload.data : [];
        if (dbList.length > 0) {
          setGoals(dbList);
          try {
            localStorage.removeItem("pulse_investment_planner_goals");
          } catch (e) {}
        } else {
          // If DB has 0 plans, check if there are legacy local plans to auto-migrate once
          try {
            const saved = localStorage.getItem("pulse_investment_planner_goals");
            const parsed = saved ? JSON.parse(saved) : [];
            const localPlans = Array.isArray(parsed)
              ? parsed.filter((g) => g.id !== "goal-wedding-default" && g.id !== "goal-house-default")
              : [];
            if (localPlans.length > 0) {
              const syncRes = await axiosInstance.post("/v1/dashboard/investment/plans/sync", {
                plans: localPlans,
              });
              const synced = syncRes.data?.data;
              if (Array.isArray(synced) && synced.length > 0) {
                setGoals(synced);
              } else {
                setGoals([]);
              }
              localStorage.removeItem("pulse_investment_planner_goals");
            } else {
              setGoals([]);
            }
          } catch (e) {
            setGoals([]);
          }
        }
      } else {
        console.error("Failed to fetch investment plans from server:", plansRes.reason);
      }

      // 3. Registered User Profile (DOB & Picture from Settings of Profile)
      if (profileRes.status === "fulfilled") {
        const u = profileRes.value?.data?.data;
        if (u) {
          if (u.dateOfBirth) {
            setUserDob(u.dateOfBirth);
            localStorage.setItem("pulse_portfolio_dob", u.dateOfBirth);
          }
          if (u.profilePic) {
            setUserProfilePic(u.profilePic);
            localStorage.setItem("profilePic", u.profilePic);
          }
          const name = u.fullName || u.username || "";
          if (name) {
            setUserDisplayName(name);
          }
          try {
            const existing = JSON.parse(localStorage.getItem("user_profile") || "{}");
            localStorage.setItem(
              "user_profile",
              JSON.stringify({
                ...existing,
                fullName: u.fullName || existing.fullName,
                username: u.username || existing.username,
                email: u.email || existing.email,
                dateOfBirth: u.dateOfBirth || existing.dateOfBirth,
                profilePic: u.profilePic || existing.profilePic,
              })
            );
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("Error loading planner assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const handleReset = () => {
      setGoals([]);
      localStorage.removeItem("pulse_investment_planner_goals");
      fetchAllData();
    };

    window.addEventListener("investment-data-reset", handleReset);
    window.addEventListener("all-data-reset", handleReset);
    return () => {
      window.removeEventListener("investment-data-reset", handleReset);
      window.removeEventListener("all-data-reset", handleReset);
    };
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
      if (g.allocations && sourceItem.id in g.allocations) {
        totalAllotted += Number(g.allocations[sourceItem.id].amount) || 0;
      } else if (
        (!g.allocations || Object.keys(g.allocations).length === 0) &&
        ((sourceItem.sourceType === "bank" && (g.selectedBanks || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "stock" && (g.selectedStocks || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "mf" && (g.selectedMfs || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "fd" && (g.selectedFds || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "rd" && (g.selectedRds || []).includes(sourceItem.id)) ||
          (sourceItem.sourceType === "pf" && g.includePf))
      ) {
        if (sourceItem.sourceType === "pf") {
          totalAllotted += (totalVal * (Number(g.pfAllocatedPercent) || 50)) / 100;
        } else {
          totalAllotted += totalVal;
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

  // ----------------------------------------------------------------------
  // Per-Planner Active Tab State ("sources" vs "projection")
  // ----------------------------------------------------------------------
  const [goalActiveTabs, setGoalActiveTabs] = useState({});

  const getGoalTab = (goalId) => goalActiveTabs[goalId] || "sources";
  const setGoalTab = (goalId, tab) => {
    setGoalActiveTabs((prev) => ({ ...prev, [goalId]: tab }));
  };

  const getGoalSpanMonths = (targetDate) => {
    if (!targetDate) return 0;
    const start = dayjs().startOf("month");
    const target = dayjs(targetDate).startOf("month");
    const diff = target.diff(start, "month");
    return Math.max(0, diff);
  };

  const saveDebounceTimers = useRef({});

  const handleUpdateProjection = (planId, sourceId, updates) => {
    const targetPlan = goals.find((g) => g.id === planId || g._id === planId);
    if (!targetPlan) return;

    const prevProjections = { ...(targetPlan.projections || {}) };
    const currentProj = prevProjections[sourceId] || {};
    const newProj = {
      ...currentProj,
      ...updates,
    };

    const updatedProjections = {
      ...prevProjections,
      [sourceId]: newProj,
    };

    const updatedPlan = {
      ...targetPlan,
      projections: updatedProjections,
    };

    if (updatedPlan.allocations && updatedPlan.allocations[sourceId]) {
      updatedPlan.allocations = {
        ...updatedPlan.allocations,
        [sourceId]: {
          ...updatedPlan.allocations[sourceId],
          active: newProj.active,
          monthlyAmount: newProj.monthlyAmount,
        },
      };
    }

    setGoals((prev) =>
      prev.map((g) => (g.id === planId || g._id === planId ? updatedPlan : g))
    );

    try {
      const saved = localStorage.getItem("pulse_investment_planner_goals");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const newSaved = parsed.map((g) =>
            g.id === planId || g._id === planId ? updatedPlan : g
          );
          localStorage.setItem("pulse_investment_planner_goals", JSON.stringify(newSaved));
        }
      }
    } catch (e) {}

    if (saveDebounceTimers.current[planId]) {
      clearTimeout(saveDebounceTimers.current[planId]);
    }
    saveDebounceTimers.current[planId] = setTimeout(async () => {
      try {
        const dbId = targetPlan._id || targetPlan.id || planId;
        await axiosInstance.put(`/v1/dashboard/investment/plans/${dbId}`, updatedPlan);
      } catch (err) {
        console.error("Failed to save projections to DB:", err);
      }
    }, 400);
  };

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
  const handleSaveAllocation = async (planId, selectedSource, { percent, amount, shares }) => {
    const targetPlan = goals.find((g) => g.id === planId || g._id === planId);
    if (!targetPlan) return;

    const newAllocations = {
      ...(targetPlan.allocations || {}),
      [selectedSource.id]: {
        id: selectedSource.id,
        sourceType: selectedSource.sourceType,
        name: selectedSource.displayName || selectedSource.name,
        percent: Number(percent) || 0,
        amount: Number(amount) || 0,
        shares: shares !== undefined ? Number(shares) : undefined,
      },
    };

    const updatedPlan = {
      ...targetPlan,
      allocations: newAllocations,
    };

    // Maintain backward compatibility arrays for InvTableView.jsx
    if (selectedSource.sourceType === "bank") {
      const set = new Set(targetPlan.selectedBanks || targetPlan.allocatedBanks || []);
      set.add(selectedSource.id);
      updatedPlan.selectedBanks = Array.from(set);
      updatedPlan.allocatedBanks = Array.from(set);
    } else if (selectedSource.sourceType === "stock") {
      const set = new Set(targetPlan.selectedStocks || targetPlan.allocatedStocks || []);
      set.add(selectedSource.id);
      updatedPlan.selectedStocks = Array.from(set);
      updatedPlan.allocatedStocks = Array.from(set);
    } else if (selectedSource.sourceType === "mf") {
      const set = new Set(targetPlan.selectedMfs || targetPlan.allocatedMfs || []);
      set.add(selectedSource.id);
      updatedPlan.selectedMfs = Array.from(set);
      updatedPlan.allocatedMfs = Array.from(set);
    } else if (selectedSource.sourceType === "fd") {
      const set = new Set(targetPlan.selectedFds || targetPlan.allocatedFds || []);
      set.add(selectedSource.id);
      updatedPlan.selectedFds = Array.from(set);
      updatedPlan.allocatedFds = Array.from(set);
    } else if (selectedSource.sourceType === "rd") {
      const set = new Set(targetPlan.selectedRds || targetPlan.allocatedRds || []);
      set.add(selectedSource.id);
      updatedPlan.selectedRds = Array.from(set);
      updatedPlan.allocatedRds = Array.from(set);
    } else if (selectedSource.sourceType === "pf") {
      updatedPlan.includePf = true;
      updatedPlan.pfAllocatedPercent = Number(percent) || 50;
      updatedPlan.pfAllocation = { enabled: true, percentage: Number(percent) || 50 };
    }

    // Optimistic UI update
    setGoals((prev) => prev.map((g) => (g.id === planId || g._id === planId ? updatedPlan : g)));

    // Save directly to DB
    try {
      const dbId = targetPlan._id || targetPlan.id || planId;
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/plans/${dbId}`,
        updatedPlan
      );
      if (res.data?.data) {
        setGoals((prev) =>
          prev.map((g) => (g.id === planId || g._id === planId ? res.data.data : g))
        );
      }
    } catch (err) {
      console.error("Failed to save allocation to DB:", err);
    }
  };

  const handleRemoveAllocation = async (planId, sourceId, sourceType) => {
    const targetPlan = goals.find((g) => g.id === planId || g._id === planId);
    if (!targetPlan) return;

    const newAllocations = { ...(targetPlan.allocations || {}) };
    delete newAllocations[sourceId];
    const newProjections = { ...(targetPlan.projections || {}) };
    delete newProjections[sourceId];

    const updatedPlan = { ...targetPlan, allocations: newAllocations, projections: newProjections };
    if (sourceType === "bank") {
      updatedPlan.selectedBanks = (targetPlan.selectedBanks || []).filter((id) => id !== sourceId);
      updatedPlan.allocatedBanks = (targetPlan.allocatedBanks || []).filter((id) => id !== sourceId);
    } else if (sourceType === "stock") {
      updatedPlan.selectedStocks = (targetPlan.selectedStocks || []).filter((id) => id !== sourceId);
      updatedPlan.allocatedStocks = (targetPlan.allocatedStocks || []).filter((id) => id !== sourceId);
    } else if (sourceType === "mf") {
      updatedPlan.selectedMfs = (targetPlan.selectedMfs || []).filter((id) => id !== sourceId);
      updatedPlan.allocatedMfs = (targetPlan.allocatedMfs || []).filter((id) => id !== sourceId);
    } else if (sourceType === "fd") {
      updatedPlan.selectedFds = (targetPlan.selectedFds || []).filter((id) => id !== sourceId);
      updatedPlan.allocatedFds = (targetPlan.allocatedFds || []).filter((id) => id !== sourceId);
    } else if (sourceType === "rd") {
      updatedPlan.selectedRds = (targetPlan.selectedRds || []).filter((id) => id !== sourceId);
      updatedPlan.allocatedRds = (targetPlan.allocatedRds || []).filter((id) => id !== sourceId);
    } else if (sourceType === "pf") {
      updatedPlan.includePf = false;
      updatedPlan.pfAllocatedPercent = 0;
      updatedPlan.pfAllocation = { enabled: false, percentage: 0 };
    }

    // Optimistic UI update
    setGoals((prev) => prev.map((g) => (g.id === planId || g._id === planId ? updatedPlan : g)));

    // Save directly to DB
    try {
      const dbId = targetPlan._id || targetPlan.id || planId;
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/plans/${dbId}`,
        updatedPlan
      );
      if (res.data?.data) {
        setGoals((prev) =>
          prev.map((g) => (g.id === planId || g._id === planId ? res.data.data : g))
        );
      }
    } catch (err) {
      console.error("Failed to remove allocation from DB:", err);
    }
  };

  // Quick percent increment / decrement (like servings in FoodLoggingTab)
  const handleQuickAdjustPercent = (planId, item, delta) => {
    const currentPct = item.allocatedPercent !== undefined ? Number(item.allocatedPercent) : 100;
    const totalVal = Number(item.holdingValue) || 0;
    const stats = getSourceUnallocatedStats(item);
    const otherGoalsAllotted = Math.max(0, stats.totalAllotted - (Number(item.allocatedAmount) || 0));
    const maxAllowedAmt = Math.max(0, totalVal - otherGoalsAllotted);
    const maxAllowedPct = totalVal > 0 ? Math.round((maxAllowedAmt / totalVal) * 100) : 100;
    const newPct = Math.max(0, Math.min(maxAllowedPct, Math.round((currentPct + delta) / 5) * 5));
    const newAmt = (totalVal * newPct) / 100;
    const newShares =
      item.sourceType === "stock"
        ? Math.round((item.holdingQty || 1) * (newPct / 100))
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
    setShowEmojiPicker(false);
    setIsMonthOpen(false);
    setIsYearOpen(false);
    const isPresetObj =
      preset &&
      typeof preset === "object" &&
      "id" in preset &&
      !("nativeEvent" in preset) &&
      !("_reactName" in preset);
    const p = isPresetObj ? preset : GOAL_PRESETS[0];
    setGoalForm({
      title: p?.id === "custom" ? "" : (p?.name || ""),
      icon: p?.icon || "💍",
      category: p?.id || "wedding",
      targetAmount: p?.defaultAmount || 2500000,
      targetDate: p?.defaultYears
        ? dayjs().add(p.defaultYears, "year").date(1).format("YYYY-MM-DD")
        : dayjs().add(2, "year").date(1).format("YYYY-MM-DD"),
      notes: "",
    });
    setIsGoalModalOpen(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setShowEmojiPicker(false);
    setIsMonthOpen(false);
    setIsYearOpen(false);
    setGoalForm({
      title: goal.title || "",
      icon: goal.icon || "🎯",
      category: goal.category || "custom",
      targetAmount: goal.targetAmount !== undefined ? goal.targetAmount : 2000000,
      targetDate: goal.targetDate
        ? dayjs(goal.targetDate).date(1).format("YYYY-MM-DD")
        : dayjs().add(2, "year").date(1).format("YYYY-MM-DD"),
      notes: goal.notes || "",
    });
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;

    const parsedTarget = Math.max(0, Number(goalForm.targetAmount) || 0);

    if (editingGoal) {
      const dbId = editingGoal._id || editingGoal.id;
      const payload = {
        ...goalForm,
        targetAmount: parsedTarget,
      };

      setGoals((prev) =>
        prev.map((g) =>
          g.id === dbId || g._id === dbId
            ? {
                ...g,
                ...payload,
              }
            : g
        )
      );

      try {
        const res = await axiosInstance.put(
          `/v1/dashboard/investment/plans/${dbId}`,
          payload
        );
        if (res.data?.data) {
          setGoals((prev) =>
            prev.map((g) => (g.id === dbId || g._id === dbId ? res.data.data : g))
          );
        }
      } catch (err) {
        console.error("Failed to update investment plan in DB:", err);
      }
    } else {
      const newGoalPayload = {
        ...goalForm,
        targetAmount: parsedTarget,
        allocations: {},
        selectedBanks: [],
        allocatedBanks: [],
        selectedStocks: [],
        allocatedStocks: [],
        selectedMfs: [],
        allocatedMfs: [],
        selectedFds: [],
        allocatedFds: [],
        selectedRds: [],
        allocatedRds: [],
        includePf: false,
        pfAllocatedPercent: 0,
        pfAllocation: { enabled: false, percentage: 0 },
      };

      try {
        const res = await axiosInstance.post(
          "/v1/dashboard/investment/plans",
          newGoalPayload
        );
        const created = res.data?.data;
        if (created) {
          setGoals((prev) => [...prev, created]);
        }
      } catch (err) {
        console.error("Failed to create investment plan in DB:", err);
      }
    }
    setIsGoalModalOpen(false);
  };

  const confirmClearPlan = async () => {
    if (!planToClear) return;
    const targetId = planToClear._id || planToClear.id;

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== targetId && g._id !== targetId) return g;
        return {
          ...g,
          allocations: {},
          projections: {},
          selectedBanks: [],
          allocatedBanks: [],
          selectedStocks: [],
          allocatedStocks: [],
          selectedMfs: [],
          allocatedMfs: [],
          selectedFds: [],
          allocatedFds: [],
          selectedRds: [],
          allocatedRds: [],
          includePf: false,
          pfAllocatedPercent: 0,
          pfAllocation: { enabled: false, percentage: 0 },
        };
      })
    );
    setIsClearModalOpen(false);
    setPlanToClear(null);

    try {
      const res = await axiosInstance.put(
        `/v1/dashboard/investment/plans/${targetId}/clear`
      );
      if (res.data?.data) {
        setGoals((prev) =>
          prev.map((g) => (g.id === targetId || g._id === targetId ? res.data.data : g))
        );
      }
    } catch (err) {
      console.error("Failed to clear plan allocations in DB:", err);
    }
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    const targetId = planToDelete._id || planToDelete.id;

    setGoals((prev) => prev.filter((g) => g.id !== targetId && g._id !== targetId));
    setIsDeleteModalOpen(false);
    setPlanToDelete(null);

    try {
      await axiosInstance.delete(`/v1/dashboard/investment/plans/${targetId}`);
    } catch (err) {
      console.error("Failed to delete investment plan from DB:", err);
    }
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
              const isCollapsed = !expandedPlans[goal.id];
              const hasItems = metrics.items.length > 0;
              const dateInfo = getRelativeDateInfo(goal.targetDate);

              return (
                <div
                  key={goal.id}
                  className="bg-base-200 rounded-2xl border border-base-300 shadow-sm transition-all duration-200"
                >
                  {/* ------------------------------------------------------------ */}
                  {/* Planner Header (Sticky while sources scroll)                 */}
                  {/* ------------------------------------------------------------ */}
                  <div
                    className={`sticky top-[47px] z-30 p-4 bg-base-300/95 backdrop-blur-md flex flex-wrap justify-between items-center cursor-pointer select-none hover:bg-base-300 transition-colors gap-3 rounded-t-2xl shadow-xs ${
                      isCollapsed ? "rounded-b-2xl" : "border-b border-base-300"
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

                      {/* Target Date in MMM YYYY Format */}
                      {goal.targetDate && (
                        <div
                          className="badge badge-ghost badge-sm text-[11px] font-mono py-2.5 px-2.5 gap-1.5 items-center border border-base-300/70 bg-base-100/80 shadow-2xs shrink-0"
                          title={dateInfo?.subtext || ""}
                        >
                          <Calendar size={12} className="text-primary shrink-0" />
                          <span className="font-semibold text-base-content/85">
                            {dayjs(goal.targetDate).format("MMM YYYY")}
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
                    <div className="p-4 space-y-4 animate-in fade-in duration-200 rounded-b-2xl">
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
                        <div className="space-y-3">
                          {/* Tabs on top of the Table: "Allocated Sources" & "Projection" */}
                          <div className="flex items-center justify-between gap-3 flex-wrap pt-0.5">
                            <div className="inline-flex items-center gap-1.5 p-1 bg-base-200/90 rounded-2xl border border-base-300 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => setGoalTab(goal.id, "sources")}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all select-none ${
                                  getGoalTab(goal.id) === "sources"
                                    ? "bg-primary text-primary-content shadow-xs font-black"
                                    : "text-base-content/70 hover:text-base-content hover:bg-base-100 font-semibold"
                                }`}
                              >
                                <Layers size={13} />
                                <span>Allocated Sources</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-none ${
                                    getGoalTab(goal.id) === "sources"
                                      ? "bg-primary-content/20 text-primary-content"
                                      : "bg-base-300 text-base-content/70"
                                  }`}
                                >
                                  {metrics.itemCount}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setGoalTab(goal.id, "projection")}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all select-none ${
                                  getGoalTab(goal.id) === "projection"
                                    ? "bg-primary text-primary-content shadow-xs font-black"
                                    : "text-base-content/70 hover:text-base-content hover:bg-base-100 font-semibold"
                                }`}
                              >
                                <TrendingUp size={13} />
                                <span>Projection</span>
                                {(() => {
                                  const activeCount = metrics.items.filter((it) => {
                                    const p = goal.projections?.[it.id];
                                    return p?.active !== undefined ? Boolean(p.active) : false;
                                  }).length;
                                  return (
                                    <span
                                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold leading-none ${
                                        getGoalTab(goal.id) === "projection"
                                          ? "bg-primary-content/20 text-primary-content"
                                          : "bg-base-300 text-base-content/70"
                                      }`}
                                    >
                                      {activeCount} active
                                    </span>
                                  );
                                })()}
                              </button>
                            </div>
                          </div>

                          {/* 1. ALLOCATED SOURCES TAB */}
                          {getGoalTab(goal.id) === "sources" && (
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

                          {/* 2. PROJECTION TAB VIEW */}
                          {getGoalTab(goal.id) === "projection" && (
                            <div className="space-y-3">
                              {/* Target Date Notice if not set */}
                              {!goal.targetDate && (
                                <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2 text-warning-content dark:text-warning">
                                    <AlertCircle size={16} className="shrink-0 text-warning" />
                                    <div>
                                      <span className="font-bold">Target Date Required:</span> Set a target month for <strong>{goal.title}</strong> to calculate monthly projections.
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => openEditGoalModal(goal)}
                                    className="btn btn-xs btn-warning font-bold rounded-lg shrink-0 gap-1"
                                  >
                                    <Calendar size={12} />
                                    Set Target Date
                                  </button>
                                </div>
                              )}

                              {/* Projection Table */}
                              <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
                                <table className="table table-sm w-full">
                                  <thead>
                                    <tr className="text-xs text-base-content/60 border-b border-base-300 bg-base-200/50">
                                      <th className="py-3 text-left font-extrabold">Source / Asset</th>
                                      <th className="py-3 text-center font-extrabold">Type</th>
                                      <th className="py-3 text-center font-extrabold" title="Toggle active contribution towards this goal">
                                        Activeness
                                      </th>
                                      <th className="py-3 text-right font-extrabold" title="Monthly amount you plan to put into this source">
                                        Monthly Contribution (₹/mo)
                                      </th>
                                      <th className="py-3 text-center font-extrabold">Duration</th>
                                      <th className="py-3 text-right font-extrabold" title="Projected money on target date = Span in Months * Monthly Amount">
                                        Projected on Target Date
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-base-200">
                                    {metrics.items.map((item) => {
                                      const spanMonths = getGoalSpanMonths(goal.targetDate);
                                      const proj = goal.projections?.[item.id] || {};
                                      const isActive = proj.active !== undefined ? Boolean(proj.active) : false;
                                      const monthlyAmt = proj.monthlyAmount !== undefined ? proj.monthlyAmount : (item.monthlyAmount || 0);
                                      const projectedMoney = isActive ? (spanMonths * (Number(monthlyAmt) || 0)) : 0;

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
                                        <tr
                                          key={item.id}
                                          className={`transition-colors ${
                                            isActive
                                              ? "hover:bg-base-200/50 bg-base-100"
                                              : "hover:bg-base-200/30 opacity-70 bg-base-200/20"
                                          }`}
                                        >
                                          {/* 1. Source / Asset */}
                                          <td className="py-2.5 max-w-[240px]">
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
                                                <div className="text-[11px] text-base-content/50 truncate">
                                                  Earmarked: <span className="font-mono font-semibold">{formatINR(item.allocatedAmount)}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </td>

                                          {/* 2. Type */}
                                          <td className="text-center whitespace-nowrap py-2.5">
                                            <span className={`badge badge-sm font-bold ${typeBadge.color}`}>
                                              {typeBadge.label}
                                            </span>
                                          </td>

                                          {/* 3. Activeness Column */}
                                          <td className="text-center whitespace-nowrap py-2.5">
                                            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                              <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={(e) => {
                                                  const checked = e.target.checked;
                                                  handleUpdateProjection(goal.id, item.id, {
                                                    active: checked,
                                                    monthlyAmount: monthlyAmt,
                                                  });
                                                }}
                                                className="toggle toggle-sm toggle-success"
                                              />
                                              <span
                                                className={`text-xs font-bold transition-colors ${
                                                  isActive
                                                    ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                                                    : "text-base-content/40"
                                                }`}
                                              >
                                                {isActive ? "Active" : "Inactive"}
                                              </span>
                                            </label>
                                          </td>

                                          {/* 4. Monthly Contribution Input */}
                                          <td className="text-right whitespace-nowrap py-2.5">
                                            {isActive ? (
                                              <div className="inline-flex items-center gap-1.5 justify-end">
                                                <span className="text-xs font-bold text-base-content/50 font-mono">₹</span>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  step="500"
                                                  value={monthlyAmt === 0 && !proj.monthlyAmount && proj.monthlyAmount !== 0 ? "" : monthlyAmt}
                                                  placeholder="0"
                                                  onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                                                    handleUpdateProjection(goal.id, item.id, {
                                                      active: true,
                                                      monthlyAmount: val,
                                                    });
                                                  }}
                                                  className="input input-xs sm:input-sm input-bordered w-24 sm:w-32 text-right font-mono font-bold focus:input-primary bg-base-100 shadow-2xs"
                                                />
                                                <span className="text-[10px] text-base-content/50 font-semibold">/mo</span>
                                              </div>
                                            ) : (
                                              <span className="text-xs text-base-content/30 italic font-mono pr-2">
                                                — Paused —
                                              </span>
                                            )}
                                          </td>

                                          {/* 5. Duration (Span in Months) */}
                                          <td className="text-center font-mono text-xs whitespace-nowrap py-2.5 text-base-content/70">
                                            <span className="badge badge-xs font-mono font-bold bg-base-200">
                                              {spanMonths} mos
                                            </span>
                                          </td>

                                          {/* 6. Projected Money on Target Date */}
                                          <td className="text-right whitespace-nowrap py-2.5">
                                            {isActive ? (
                                              <div className="flex flex-col items-end leading-tight">
                                                <span className="font-black text-sm sm:text-base font-mono text-emerald-600 dark:text-emerald-400">
                                                  {formatINR(projectedMoney)}
                                                </span>
                                                {Number(monthlyAmt) > 0 && spanMonths > 0 && (
                                                  <span className="text-[9.5px] text-base-content/50 font-mono">
                                                    {spanMonths} mos × {formatINR(monthlyAmt)}
                                                  </span>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-xs font-mono text-base-content/30">
                                                ₹0.00
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>

                                  {/* Projection Table Footer Summary */}
                                  {(() => {
                                    const spanMonths = getGoalSpanMonths(goal.targetDate);
                                    const totalActive = metrics.items.filter((it) => {
                                      const p = goal.projections?.[it.id];
                                      return p?.active !== undefined ? Boolean(p.active) : false;
                                    }).length;

                                    const totalMonthly = metrics.items.reduce((sum, it) => {
                                      const p = goal.projections?.[it.id];
                                      const active = p?.active !== undefined ? Boolean(p.active) : false;
                                      const amt = p?.monthlyAmount !== undefined ? Number(p.monthlyAmount) : (it.monthlyAmount || 0);
                                      return sum + (active ? amt : 0);
                                    }, 0);

                                    const totalProjected = metrics.items.reduce((sum, it) => {
                                      const p = goal.projections?.[it.id];
                                      const active = p?.active !== undefined ? Boolean(p.active) : false;
                                      const amt = p?.monthlyAmount !== undefined ? Number(p.monthlyAmount) : (it.monthlyAmount || 0);
                                      return sum + (active ? (spanMonths * amt) : 0);
                                    }, 0);

                                    const totalWithEarmarked = (metrics.totalAllocated || 0) + totalProjected;
                                    const targetAmt = Number(goal.targetAmount) || 0;
                                    const projectedFundingPct = targetAmt > 0 ? Math.min(999, Math.round((totalWithEarmarked / targetAmt) * 100)) : 0;

                                    return (
                                      <tfoot className="border-t-2 border-primary/30 bg-base-200/80">
                                        <tr className="text-xs">
                                          <td className="text-left py-3 font-bold">
                                            <span className="badge badge-primary badge-sm font-black uppercase tracking-wider px-2 py-1 shadow-xs">
                                              PROJECTED TOTAL
                                            </span>
                                          </td>
                                          <td className="text-center font-bold text-xs text-base-content/70 py-3">
                                            <span className="badge badge-ghost badge-xs font-semibold">
                                              {totalActive} of {metrics.itemCount} Active
                                            </span>
                                          </td>
                                          <td className="text-center font-bold text-xs text-emerald-600 dark:text-emerald-400 py-3">
                                            {totalActive} Active Sources
                                          </td>
                                          <td className="text-right font-mono font-bold text-xs py-3 text-primary">
                                            {formatINR(totalMonthly)}/mo
                                          </td>
                                          <td className="text-center font-mono text-xs font-semibold py-3 text-base-content/70">
                                            {spanMonths} Mos
                                          </td>
                                          <td className="text-right whitespace-nowrap py-3 font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono tracking-tight">
                                            {formatINR(totalProjected)}
                                          </td>
                                        </tr>
                                        <tr className="text-xs bg-base-300/40 border-t border-base-300/60 font-medium">
                                          <td colSpan={3} className="py-2.5 px-3 text-base-content/70">
                                            <div className="flex items-center gap-2">
                                              <Target size={13} className="text-primary shrink-0" />
                                              <span>Target: <strong className="font-mono text-base-content">{formatINR(targetAmt)}</strong></span>
                                              <span className="text-base-content/30">•</span>
                                              <span>Earmarked: <strong className="font-mono text-primary">{formatINR(metrics.totalAllocated)}</strong></span>
                                            </div>
                                          </td>
                                          <td colSpan={3} className="py-2.5 px-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                              <span>Total at Target (Earmarked + Projected):</span>
                                              <span className="font-mono font-black text-xs sm:text-sm text-primary">
                                                {formatINR(totalWithEarmarked)}
                                              </span>
                                              <span className={`badge badge-sm font-mono font-bold ${
                                                totalWithEarmarked >= targetAmt ? "badge-success text-white" : "badge-warning"
                                              }`}>
                                                {projectedFundingPct}% Funded
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      </tfoot>
                                    );
                                  })()}
                                </table>
                              </div>
                            </div>
                          )}
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
      {isGoalModalOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsGoalModalOpen(false);
              setShowEmojiPicker(false);
              setIsMonthOpen(false);
              setIsYearOpen(false);
            }
          }}
        >
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-3.5 w-full max-w-5xl max-h-[92vh] my-auto">
            {/* 1. SEPARATE TEMPLATES POPUP / PANEL ON THE LEFT (Vertically Stacked List) */}
            <div
              className="hidden md:flex flex-col w-60 lg:w-64 bg-base-100 rounded-3xl border border-base-300 shadow-2xl overflow-hidden shrink-0 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Templates Popup Header */}
              <div className="px-5 py-4 border-b border-base-300/80 bg-base-200/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shadow-xs">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-base-content leading-tight">
                      Goal Templates
                    </h4>
                    <p className="text-[10px] text-base-content/50 font-medium">
                      Select a preset to autofill
                    </p>
                  </div>
                </div>
                <span className="badge badge-xs font-mono font-bold bg-base-300 text-base-content/70">
                  {GOAL_PRESETS.length}
                </span>
              </div>

              {/* Vertically Stacked Templates List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5 bg-base-200/25">
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
                          title:
                            preset.id === "custom"
                              ? (prev.title || "My Goal")
                              : (preset.id === "house" ? "Dream Home" : preset.name),
                          targetAmount: preset.defaultAmount,
                          targetDate: preset.defaultYears
                            ? dayjs().add(preset.defaultYears, "year").format("YYYY-MM-DD")
                            : prev.targetDate,
                        }));
                        setShowEmojiPicker(false);
                      }}
                      className={`w-full p-2.5 rounded-2xl text-left transition-all border flex items-start gap-2.5 group cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-content border-primary shadow-sm font-bold scale-[0.99]"
                          : "bg-base-100 hover:bg-base-200/80 border-base-300/70 text-base-content hover:border-primary/40 shadow-xs"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 border transition-all ${
                          isSelected
                            ? "bg-primary-content/20 border-primary-content/30 text-primary-content"
                            : "bg-base-200/70 border-base-300 group-hover:scale-105"
                        }`}
                      >
                        {preset.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold truncate">
                            {preset.id === "house" ? "Dream Home" : preset.name}
                          </span>
                          {preset.defaultYears && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                                isSelected
                                  ? "bg-primary-content/20 text-primary-content font-bold"
                                  : "text-base-content/50 bg-base-200"
                              }`}
                            >
                              {preset.defaultYears}Y
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] truncate font-mono mt-0.5 ${
                            isSelected ? "text-primary-content/85" : "text-base-content/50"
                          }`}
                        >
                          {preset.desc || formatINRCompact(preset.defaultAmount)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. MAIN CREATE / EDIT GOAL POPUP (RIGHT) */}
            <div
              className="flex-1 bg-base-100 rounded-3xl border border-base-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between shrink-0 bg-base-200/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shadow-xs shrink-0">
                    {goalForm.icon || "🎯"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-base text-base-content leading-tight truncate">
                      {editingGoal ? "Edit Financial Goal" : "Create New Goal"}
                    </h3>
                    <p className="text-xs text-base-content/50 mt-0.5 truncate">
                      {editingGoal
                        ? "Update your target amount, completion date, or notes"
                        : "Define your target capital, timeline, and life vision"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsGoalModalOpen(false);
                    setShowEmojiPicker(false);
                    setIsMonthOpen(false);
                    setIsYearOpen(false);
                  }}
                  className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form & Body */}
              <form onSubmit={handleSaveGoal} className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-3.5">
                  {/* Mobile-only Templates Carousel (md:hidden) */}
                  <div className="md:hidden space-y-1.5 p-3 rounded-2xl bg-base-200/60 border border-base-300/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 flex items-center gap-1">
                        <Sparkles size={11} className="text-primary" /> Goal Templates
                      </span>
                      <span className="text-[9px] text-base-content/40">Tap to autofill</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
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
                                title:
                                  preset.id === "custom"
                                    ? (prev.title || "My Goal")
                                    : (preset.id === "house" ? "Dream Home" : preset.name),
                                targetAmount: preset.defaultAmount,
                                targetDate: preset.defaultYears
                                  ? dayjs().add(preset.defaultYears, "year").format("YYYY-MM-DD")
                                  : prev.targetDate,
                              }));
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border cursor-pointer ${
                              isSelected
                                ? "bg-primary text-primary-content border-primary shadow-xs font-bold"
                                : "bg-base-100 border-base-300 text-base-content/80"
                            }`}
                          >
                            <span>{preset.icon}</span>
                            <span>{preset.id === "house" ? "Home" : preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SECTION 1: GOAL TITLE & CATEGORY / ICON (Darker Card)     */}
                  {/* -------------------------------------------------------- */}
                  <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300/80 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                        <Target size={13} className="text-primary" />
                        <span>Goal Title & Icon</span>
                        <span className="text-error">*</span>
                      </label>
                      <span className="badge badge-xs font-bold bg-base-300/80 text-base-content/70">
                        {goalForm.category ? (
                          GOAL_PRESETS.find((p) => p.id === goalForm.category)?.name || "Custom"
                        ) : "Custom"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 max-w-md">
                      {/* Interactive Emoji Button */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-10 h-10 rounded-xl bg-base-100 hover:bg-base-200 border border-base-300 flex items-center justify-center text-lg transition-all cursor-pointer shadow-xs hover:border-primary/40 active:scale-95"
                          title="Choose icon"
                        >
                          {goalForm.icon || "🎯"}
                        </button>

                        {/* Emoji Dropdown Popover */}
                        {showEmojiPicker && (
                          <div className="absolute top-full left-0 mt-2 z-50 p-3 bg-base-100 rounded-2xl border border-base-300 shadow-xl w-64 animate-in fade-in zoom-in-95 duration-150">
                            <div className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                              <span>Select Goal Icon</span>
                              <button
                                type="button"
                                onClick={() => setShowEmojiPicker(false)}
                                className="text-base-content/40 hover:text-base-content text-xs font-bold"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-6 gap-1.5 mb-2.5">
                              {POPULAR_GOAL_ICONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    setGoalForm((prev) => ({ ...prev, icon: emoji }));
                                    setShowEmojiPicker(false);
                                  }}
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:bg-primary/20 transition-all ${
                                    goalForm.icon === emoji ? "bg-primary/20 ring-1 ring-primary" : "bg-base-200/70"
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5 pt-2 border-t border-base-200">
                              <span className="text-[10px] text-base-content/50 shrink-0">Custom:</span>
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="Emoji"
                                value={goalForm.icon}
                                onChange={(e) => setGoalForm((prev) => ({ ...prev, icon: e.target.value }))}
                                className="input input-xs input-bordered w-full rounded-lg text-center bg-base-100"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Title Input */}
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wedding 2027, Dream Home Down Payment"
                        value={goalForm.title}
                        onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                        className="input input-bordered h-10 flex-1 rounded-xl text-xs sm:text-sm font-semibold bg-base-100 focus:border-primary transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SECTION 2: TARGET CAPITAL (Darker Card)                   */}
                  {/* -------------------------------------------------------- */}
                  <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300/80 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                        <span className="font-mono text-primary font-bold">₹</span>
                        <span>Target Capital</span>
                        <span className="text-error">*</span>
                      </label>
                      {Number(goalForm.targetAmount) > 0 && (
                        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-xl border border-primary/20">
                          {formatINR(goalForm.targetAmount)}
                          <span className="text-base-content/50 ml-1.5 font-medium">
                            ({formatINRCompact(goalForm.targetAmount)})
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="relative max-w-md">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-sm text-base-content/40">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="Enter target amount, e.g. 2500000"
                        value={goalForm.targetAmount === 0 ? "" : goalForm.targetAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGoalForm((prev) => ({
                            ...prev,
                            targetAmount: val === "" ? "" : val,
                          }));
                        }}
                        className="input input-bordered h-10 w-full pl-8 rounded-xl font-mono text-xs sm:text-sm font-bold bg-base-100 focus:border-primary transition-all shadow-2xs"
                      />
                    </div>

                    {/* Quick Amount Shortcuts */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto no-scrollbar pt-0.5">
                      <span className="text-[10px] text-base-content/40 font-bold uppercase tracking-wider shrink-0">Quick:</span>
                      {[500000, 1000000, 2000000, 2500000, 5000000, 10000000].map((amt) => {
                        const isSelected = Number(goalForm.targetAmount) === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setGoalForm((prev) => ({ ...prev, targetAmount: amt }))}
                            className={`px-2 sm:px-2.5 py-0.5 sm:py-1 font-mono text-[10px] sm:text-[11px] rounded-lg transition-all shrink-0 cursor-pointer border font-semibold ${
                              isSelected
                                ? "bg-primary text-primary-content border-primary shadow-xs font-bold"
                                : "bg-base-100 hover:bg-primary/10 border-base-300 text-base-content/70 hover:text-primary hover:border-primary/40"
                            }`}
                          >
                            {formatINRCompact(amt)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SECTION 3: TARGET DATE & HORIZON TIMELINE (Darker Card)   */}
                  {/* -------------------------------------------------------- */}
                  <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300/80 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                        <Calendar size={13} className="text-primary" />
                        <span>Target Date & Timeline</span>
                        <span className="text-error">*</span>
                      </label>
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

                    {/* Month & Year Separate Dropdown Popups */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      {/* Month Dropdown Popup */}
                      <div className="relative" ref={monthPickerRef}>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 block mb-1">
                          Target Month
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMonthOpen(!isMonthOpen);
                            setIsYearOpen(false);
                            setShowEmojiPicker(false);
                          }}
                          className={`h-10 w-full px-3 sm:px-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                            isMonthOpen
                              ? "bg-base-100 border-primary ring-2 ring-primary/20 text-primary"
                              : "bg-base-100 hover:bg-base-200/80 border-base-300 text-base-content hover:border-primary/40"
                          }`}
                          title="Select Target Month"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Calendar size={14} className={isMonthOpen ? "text-primary shrink-0" : "text-base-content/50 shrink-0"} />
                            <span className="truncate">{MONTHS[currentMonthIndex]?.name || "Select Month"}</span>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 shrink-0 text-base-content/50 ${
                              isMonthOpen ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>

                        {/* Month Popup Menu */}
                        {isMonthOpen && (
                          <div className="absolute top-full left-0 mt-2 z-50 bg-base-100 rounded-2xl border border-base-300 shadow-2xl p-2.5 w-64 sm:w-72 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between pb-2 mb-1 border-b border-base-200 px-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50">
                                Select Target Month
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsMonthOpen(false)}
                                className="text-base-content/40 hover:text-base-content text-xs font-bold px-1"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 pt-1">
                              {MONTHS.map((m) => {
                                const isSelected = currentMonthIndex === m.value;
                                return (
                                  <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => handleSelectMonth(m.value)}
                                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                                      isSelected
                                        ? "bg-primary text-primary-content shadow-xs font-black"
                                        : "bg-base-200/60 hover:bg-primary/15 text-base-content hover:text-primary"
                                    }`}
                                  >
                                    <span className="sm:hidden">{m.short}</span>
                                    <span className="hidden sm:inline">{m.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Year Dropdown Popup */}
                      <div className="relative" ref={yearPickerRef}>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50 block mb-1">
                          Target Year
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsYearOpen(!isYearOpen);
                            setIsMonthOpen(false);
                            setShowEmojiPicker(false);
                          }}
                          className={`h-10 w-full px-3 sm:px-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                            isYearOpen
                              ? "bg-base-100 border-primary ring-2 ring-primary/20 text-primary"
                              : "bg-base-100 hover:bg-base-200/80 border-base-300 text-base-content hover:border-primary/40"
                          }`}
                          title="Select Target Year"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock size={14} className={isYearOpen ? "text-primary shrink-0" : "text-base-content/50 shrink-0"} />
                            <span className="font-mono text-xs font-extrabold truncate">{currentYearVal}</span>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 shrink-0 text-base-content/50 ${
                              isYearOpen ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>

                        {/* Year Popup Menu */}
                        {isYearOpen && (
                          <div className="absolute top-full right-0 mt-2 z-50 bg-base-100 rounded-2xl border border-base-300 shadow-2xl p-2.5 w-64 sm:w-72 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between pb-2 mb-1 border-b border-base-200 px-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-base-content/50">
                                Select Target Year
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsYearOpen(false)}
                                className="text-base-content/40 hover:text-base-content text-xs font-bold px-1"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 pt-1 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                              {availableYears.map((y) => {
                                const isSelected = currentYearVal === y;
                                return (
                                  <button
                                    key={y}
                                    type="button"
                                    onClick={() => handleSelectYear(y)}
                                    className={`py-2 px-1 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer text-center ${
                                      isSelected
                                        ? "bg-primary text-primary-content shadow-xs font-black"
                                        : "bg-base-200/60 hover:bg-primary/15 text-base-content hover:text-primary"
                                    }`}
                                  >
                                    {y}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Horizon Buttons */}
                    <div className="flex items-center gap-1 bg-base-100 border border-base-300 rounded-2xl p-1 justify-between shadow-2xs">
                      {[
                        { label: "+1Y", years: 1 },
                        { label: "+2Y", years: 2 },
                        { label: "+3Y", years: 3 },
                        { label: "+5Y", years: 5 },
                        { label: "+10Y", years: 10 },
                      ].map((h) => {
                        const horizonMonth = dayjs().add(h.years, "year").month();
                        const horizonYear = dayjs().add(h.years, "year").year();
                        const isSelected = currentMonthIndex === horizonMonth && currentYearVal === horizonYear;
                        return (
                          <button
                            key={h.years}
                            type="button"
                            onClick={() => {
                              const targetFromHorizon = dayjs().add(h.years, "year").date(1).format("YYYY-MM-DD");
                              setGoalForm((prev) => ({ ...prev, targetDate: targetFromHorizon }));
                            }}
                            className={`flex-1 py-1.5 font-mono text-[11px] rounded-xl font-bold transition-all text-center cursor-pointer ${
                              isSelected
                                ? "bg-primary text-primary-content shadow-xs"
                                : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                            }`}
                          >
                            {h.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Age on Target Date Card */}
                    <div className="rounded-2xl bg-base-100 border border-base-300 p-3 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden shadow-xs">
                          {userProfilePic ? (
                            <img
                              src={userProfilePic}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-primary font-mono">
                              {userInitials || "U"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-semibold text-base-content/50 uppercase tracking-wider">
                            Age on Target Date
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {userAgeOnTargetDate ? (
                              <span className="font-mono font-bold text-xs text-primary">
                                {userAgeOnTargetDate.years} Yrs{userAgeOnTargetDate.months > 0 ? `, ${userAgeOnTargetDate.months} Mos` : ""}
                              </span>
                            ) : (
                              <span className="text-xs text-base-content/40 font-mono">
                                {userDob ? "—" : "Set DOB to calculate age"}
                              </span>
                            )}
                            {modalDateInfo && !modalDateInfo.isPast && (
                              <span className="text-[10px] text-base-content/40 font-mono">
                                • {dayjs(goalForm.targetDate).format("MMMM YYYY")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-base-content/50 font-mono">
                          {userDob && dayjs(userDob).isValid() ? `DOB: ${dayjs(userDob).format("DD MMM YYYY")}` : "DOB: Not set"}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsGoalModalOpen(false);
                            navigate("/dashboard/settings/profile");
                          }}
                          className="text-[10px] text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                          title="Update your Date of Birth in Profile Settings"
                        >
                          <span>{userDob ? "Change in Settings" : "Set in Settings"}</span>
                          <ExternalLink size={9} className="opacity-70" />
                        </button>
                      </div>
                    </div>

                    {modalDateInfo?.isPast && (
                      <div className="px-3 py-2 rounded-xl bg-error/10 border border-error/20 flex items-center gap-1.5 text-xs text-error font-medium">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Target month is in the past. Please select a future month & year.</span>
                      </div>
                    )}
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* SECTION 4: NOTES & VISION (Darker Card)                   */}
                  {/* -------------------------------------------------------- */}
                  <div className="p-4 rounded-2xl bg-base-200/60 border border-base-300/80 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                        <Layers size={13} className="text-primary" />
                        <span>Notes & Vision</span>
                      </label>
                      <span className="text-[10px] text-base-content/40 font-medium">Optional</span>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="e.g. Venue, jewelry, down payment breakdown, vacation wishlist..."
                      value={goalForm.notes}
                      onChange={(e) => setGoalForm({ ...goalForm, notes: e.target.value })}
                      className="textarea textarea-bordered w-full rounded-2xl text-xs bg-base-100 focus:border-primary transition-all resize-none min-h-[58px] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-base-300 bg-base-200/30 flex items-center justify-between gap-2 shrink-0">
                  <p className="text-[11px] text-base-content/45 font-medium hidden sm:block">
                    {editingGoal ? "Changes save directly to your database." : "You can allot savings & investments after creating."}
                  </p>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsGoalModalOpen(false);
                        setShowEmojiPicker(false);
                        setIsMonthOpen(false);
                        setIsYearOpen(false);
                      }}
                      className="btn btn-sm btn-ghost rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary rounded-xl font-bold gap-1.5 px-5 shadow-sm"
                    >
                      <Check size={14} />
                      <span>{editingGoal ? "Save Changes" : "Create Goal"}</span>
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
