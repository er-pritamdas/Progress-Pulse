import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { fetchHabitSettings } from "../../services/redux/slice/habitSlice.js";
import { TitleChanger } from "../../utils/TitleChanger.jsx";
import axiosInstance from "../../Context/AxiosInstance.jsx";
import {
  Calendar,
  Sparkles,
  Plus,
  CreditCard,
  Table,
  TrendingUp,
  Heart,
  Wallet,
  Droplet,
  Moon,
  Flame,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sunrise,
  Sun,
  Utensils,
  BookOpen,
  Check,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Receipt,
  Tag,
  Folder,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Pencil,
  X,
  ArrowUp,
  ArrowDown,
  Layers,
  PieChart,
  Landmark,
  PiggyBank,
  Percent,
  BarChart3,
  Target,
  User,
  Lock,
  Settings,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fetchDashboardData } from "../../services/redux/slice/ExpenseSlice.js";
import LogFoodModal from "../../components/Dashboard/Habit/FoodLogging/LogFoodModal.jsx";
import AddCustomFoodModal from "../../components/Dashboard/Habit/FoodLogging/AddCustomFoodModal.jsx";
import AddTransactionModal from "../../components/Expense/AddTransactionModal.jsx";

// Inspiring Daily Focus Quotes
const DAILY_QUOTES = [
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { quote: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { quote: "Focus on progress, not perfection.", author: "Bill Phillips" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Energy flows where attention goes.", author: "Tony Robbins" },
];

const DEFAULT_CARD_ORDER = [
  "momentum",
  "launchpad",
  "habits",
  "expense",
  "investment",
  "shortcuts",
];

const CARD_METADATA = {
  momentum: {
    name: "Weekly Momentum Strip",
    desc: "7-Day Mon-Sun progress strip with date traversal",
    icon: Calendar,
  },
  launchpad: {
    name: "Time-of-Day Launchpad",
    desc: "Morning Fuel & Kickoff meal status and nutrition macro goals",
    icon: Utensils,
  },
  habits: {
    name: "Habits Checklist & Vitals",
    desc: "Compact habit dropdown and logging buttons for water, sleep, calories, reading",
    icon: Heart,
  },
  expense: {
    name: "Expenses & Budget",
    desc: "Planned, Total Spent, Actual Remaining, and selected date transactions",
    icon: Wallet,
  },
  investment: {
    name: "Net Worth",
    desc: "Consolidated Net Worth, Stocks held, active MFs, FDs & RDs",
    icon: TrendingUp,
  },
  shortcuts: {
    name: "Quick Launchpad Grid",
    desc: "1-Click access shortcuts to all modules",
    icon: Zap,
  },
};

// Mutual Fund Units & Value Helpers (matches InvTableView logic)
const calcMfAvailableUnits = (fund) => {
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

const calcMfHoldingValue = (fund) => {
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

const Dashboard = () => {
  TitleChanger("Progress Pulse | Daily Hub");
  const dispatch = useDispatch();
  const user = localStorage.getItem("username") || "Pritam";
  const navigate = useNavigate();

  // Habit Redux State
  const habitState = useSelector((state) => state.habit || {});
  const settings = habitState.settings || {};

  // Date Traversal State (Defaults to Today)
  const todayStr = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const isSelectedDateToday = selectedDate === todayStr;

  // Time & Greeting
  const [greeting, setGreeting] = useState("Good Day");

  // Selected Day Habit Data
  const [selectedDayHabits, setSelectedDayHabits] = useState(null);
  const [loadingHabits, setLoadingHabits] = useState(false);

  // Selected Day Food Data
  const [selectedDayFoodData, setSelectedDayFoodData] = useState({
    meals: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [], Other: [] },
    summary: {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalSugar: 0,
    },
  });
  const [loadingFood, setLoadingFood] = useState(false);

  // Redux Expense State
  const expenseRedux = useSelector((state) => state.expense || {});
  const {
    categories = [],
    sources = [],
    transactions = [],
    salary = 0,
    currentMonth: reduxMonth,
  } = expenseRedux;
  const [loadingExpense, setLoadingExpense] = useState(false);

  // Investment Pulse & Net Worth State
  const [investmentData, setInvestmentData] = useState({
    stocksVal: 0,
    stocksCount: 0,
    mfVal: 0,
    mfCount: 0,
    fdVal: 0,
    fdCount: 0,
    rdVal: 0,
    rdCount: 0,
    pfVal: 0,
    totalInvested: 0,
  });
  const [loadingInvestment, setLoadingInvestment] = useState(false);

  // Modals
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isLogFoodModalOpen, setIsLogFoodModalOpen] = useState(false);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [selectedMealForModal, setSelectedMealForModal] = useState("Breakfast");
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [isHabitDropdownOpen, setIsHabitDropdownOpen] = useState(false);
  const [launchpadTab, setLaunchpadTab] = useState("all");
  const [expandedTrackers, setExpandedTrackers] = useState({});

  // Privacy Eye Masking (persisted in localStorage)
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

  // Custom Vital Entry Modal
  const [vitalEditModal, setVitalEditModal] = useState({
    isOpen: false,
    key: "",
    title: "",
    unit: "",
    val: "",
  });

  // User Customizable Card Order (persisted in localStorage)
  const [cardOrder, setCardOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("dashboard_card_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((id) => DEFAULT_CARD_ORDER.includes(id));
          DEFAULT_CARD_ORDER.forEach((id) => {
            if (!valid.includes(id)) valid.push(id);
          });
          return valid;
        }
      }
    } catch (e) {}
    return DEFAULT_CARD_ORDER;
  });

  // Inspiring Quote of the Day
  const todayQuote = useMemo(() => {
    const dayIndex = Math.abs(dayjs(selectedDate).date()) % DAILY_QUOTES.length;
    return DAILY_QUOTES[dayIndex] || DAILY_QUOTES[0];
  }, [selectedDate]);

  // Initial Data Fetching on Mount
  useEffect(() => {
    dispatch(fetchHabitSettings());

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    fetchDashboardDataGlobal();
    fetchInvestmentData();
  }, []);

  // Fetch Habit & Food data whenever selectedDate changes
  useEffect(() => {
    fetchHabitDataForDate(selectedDate);
    fetchFoodDataForDate(selectedDate);

    // If selected date is in a different month, ensure month's expense data is loaded
    const targetMonth = dayjs(selectedDate).format("YYYY-MM");
    if (targetMonth !== reduxMonth) {
      dispatch(fetchDashboardData(targetMonth));
    }
  }, [selectedDate]);

  const fetchDashboardDataGlobal = async () => {
    try {
      setLoadingExpense(true);
      const targetMonth = dayjs().format("YYYY-MM");
      await dispatch(fetchDashboardData(targetMonth)).unwrap();
    } catch (error) {
      console.error("Error fetching expense data on dashboard:", error);
    } finally {
      setLoadingExpense(false);
    }
  };

  const fetchHabitDataForDate = async (dateStr) => {
    try {
      setLoadingHabits(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/table-entry", {
        params: {
          startDate: dateStr,
          endDate: dateStr,
        },
      });

      const entries = res.data.data?.formattedEntries;
      if (entries && entries.length > 0) {
        setSelectedDayHabits(entries[0]);
      } else {
        setSelectedDayHabits(null);
      }
    } catch (error) {
      console.error("Error fetching habit data for date:", error);
    } finally {
      setLoadingHabits(false);
    }
  };

  const fetchFoodDataForDate = async (dateStr) => {
    try {
      setLoadingFood(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: dateStr },
      });
      if (res.data?.data) {
        setSelectedDayFoodData(res.data.data);
      } else {
        setSelectedDayFoodData({
          meals: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [], Other: [] },
          summary: {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            totalFiber: 0,
            totalSugar: 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching food log for date:", error);
    } finally {
      setLoadingFood(false);
    }
  };

  const fetchInvestmentData = async () => {
    try {
      setLoadingInvestment(true);
      const [stocksRes, mfRes, fdRes, rdRes, salaryRes, pfWithRes] = await Promise.allSettled([
        axiosInstance.get("/v1/dashboard/investment/stocks"),
        axiosInstance.get("/v1/dashboard/investment/mf"),
        axiosInstance.get("/v1/dashboard/investment/fd"),
        axiosInstance.get("/v1/dashboard/investment/rd"),
        axiosInstance.get("/v1/dashboard/investment/salary"),
        axiosInstance.get("/v1/dashboard/investment/pf/withdrawals"),
      ]);

      // 1. Stocks: calculate count of stocks held (quantity > 0) & valuation
      let stocksCount = 0;
      let stocksVal = 0;
      if (stocksRes.status === "fulfilled") {
        const payload = stocksRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        list.forEach((s) => {
          const q = Number(
            s.qLeft !== undefined
              ? s.qLeft
              : s.quantityLeft !== undefined
              ? s.quantityLeft
              : s.bQty !== undefined
              ? s.bQty
              : s.quantity !== undefined
              ? s.quantity
              : 0
          ) || 0;
          const p = Number(
            s.bShare ||
            s.bFShare ||
            s.sharePrice ||
            s.finalBoughtPrice ||
            s.bPrice ||
            s.buyPrice ||
            s.currentPrice ||
            0
          );
          if (q > 0) {
            stocksCount++;
            stocksVal += q * p;
          }
        });
      }

      // 2. Mutual Funds: active MFs (units > 0) & holding valuation
      let mfCount = 0;
      let mfVal = 0;
      if (mfRes.status === "fulfilled") {
        const payload = mfRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        const activeFunds = list.filter((f) => calcMfAvailableUnits(f) > 0.0001);
        mfCount = activeFunds.length;
        mfVal = activeFunds.reduce((sum, f) => sum + calcMfHoldingValue(f), 0);
      }

      // 3. Fixed Deposits: active FDs & principal amount
      let fdCount = 0;
      let fdVal = 0;
      if (fdRes.status === "fulfilled") {
        const payload = fdRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        const activeFds = list.filter(
          (fd) => !fd.isWithdrawn && fd.status !== "Withdrawn" && fd.status !== "Closed"
        );
        fdCount = activeFds.length;
        fdVal = activeFds.reduce(
          (sum, f) => sum + (Number(f.amount) || Number(f.investedAmount) || 0),
          0
        );
      }

      // 4. Recurring Deposits: active RDs & deposited amount
      let rdCount = 0;
      let rdVal = 0;
      if (rdRes.status === "fulfilled") {
        const payload = rdRes.value?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        const activeRds = list.filter(
          (rd) => !rd.isWithdrawn && rd.status !== "Withdrawn" && rd.status !== "Closed"
        );
        rdCount = activeRds.length;
        rdVal = activeRds.reduce((sum, rd) => {
          const txns = rd.transactions || [];
          const txnSum = txns.reduce(
            (acc, t) => acc + (Number(t.amtDeposit) || Number(t.amount) || 0),
            0
          );
          return sum + (txnSum > 0 ? txnSum : (Number(rd.amount) || Number(rd.monthlyAmount) || 0));
        }, 0);
      }

      // 5. Provident Fund (EPF): salary contributions minus withdrawals
      let pfVal = 0;
      let salaryList = [];
      let pfWithdrawals = [];
      if (salaryRes.status === "fulfilled") {
        salaryList = Array.isArray(salaryRes.value?.data?.data) ? salaryRes.value.data.data : [];
      }
      if (pfWithRes.status === "fulfilled") {
        pfWithdrawals = Array.isArray(pfWithRes.value?.data?.data) ? pfWithRes.value.data.data : [];
      }
      const totalContributed = salaryList.reduce((acc, s) => {
        const er = Number(s.erPf) || Number(s.pfEmployer) || 0;
        const ee =
          s.eePf !== undefined && s.eePf !== null && s.eePf !== ""
            ? Number(s.eePf) || 0
            : Number(s.pfEmployee) || er;
        return acc + er + ee;
      }, 0);
      const totalWithdrawn = pfWithdrawals.reduce(
        (acc, w) => acc + (Number(w.amount) || 0),
        0
      );
      pfVal = Math.max(0, totalContributed - totalWithdrawn);

      const totalInvested = stocksVal + mfVal + fdVal + rdVal;

      setInvestmentData({
        stocksVal: Math.round(stocksVal * 100) / 100,
        stocksCount,
        mfVal: Math.round(mfVal * 100) / 100,
        mfCount,
        fdVal: Math.round(fdVal * 100) / 100,
        fdCount,
        rdVal: Math.round(rdVal * 100) / 100,
        rdCount,
        pfVal: Math.round(pfVal * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100,
      });
    } catch (error) {
      console.error("Error fetching investment summary on dashboard:", error);
    } finally {
      setLoadingInvestment(false);
    }
  };

  const handleRefreshAll = () => {
    fetchHabitDataForDate(selectedDate);
    fetchFoodDataForDate(selectedDate);
    fetchDashboardDataGlobal();
    fetchInvestmentData();
  };

  // Helper resolvers for accounts & categories
  const getSourceName = (src) => {
    if (!src) return "";
    if (typeof src === "object") return src.name || "";
    const found = (sources || []).find((s) => String(s._id) === String(src));
    return found?.name || "";
  };

  const getCategoryName = (cat) => {
    if (!cat) return "";
    if (typeof cat === "object") return cat.name || "";
    const found = (categories || []).find((c) => String(c._id) === String(cat));
    return found?.name || "";
  };

  const getSubCategoryName = (cat, subId) => {
    if (!subId) return "";
    if (typeof subId === "object") return subId.name || "";
    if (typeof cat === "object" && cat?.subCategories) {
      const foundSub = cat.subCategories.find((s) => String(s._id) === String(subId));
      if (foundSub) return foundSub.name;
    }
    for (const c of categories || []) {
      const foundSub = (c.subCategories || []).find((s) => String(s._id) === String(subId));
      if (foundSub) return foundSub.name;
    }
    return "";
  };

  // 7-Day Current Week Calculation (Mon to Sun) with Traversal
  const currentWeekDays = useMemo(() => {
    const today = dayjs();
    const dayOfWeek = today.day(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startMonday = today.add(diffToMonday, "day");

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = startMonday.add(i, "day");
      const dateStr = d.format("YYYY-MM-DD");
      const isToday = d.isSame(today, "day");
      const isPast = d.isBefore(today, "day");
      const isSelected = dateStr === selectedDate;
      days.push({
        dateStr,
        dayName: d.format("ddd"),
        dayNum: d.format("D"),
        isToday,
        isPast,
        isSelected,
      });
    }
    return days;
  }, [selectedDate]);

  // Time-of-day contextual info
  const timeContext = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        badge: "Morning Fuel & Kickoff",
        icon: Sunrise,
        targetMeal: "Breakfast",
        actionText: "+ Log Breakfast",
      };
    } else if (hour < 17) {
      return {
        badge: "Midday Sprint & Momentum",
        icon: Sun,
        targetMeal: "Lunch",
        actionText: "+ Log Lunch",
      };
    } else {
      return {
        badge: "Evening Wind-Down & Review",
        icon: Moon,
        targetMeal: "Dinner",
        actionText: "+ Log Dinner",
      };
    }
  }, []);

  const openLogFoodModal = (mealType = "Breakfast") => {
    setSelectedMealForModal(mealType);
    setIsLogFoodModalOpen(true);
  };

  // Safe checks & data parsing for Habit
  const water = Number(selectedDayHabits?.water || 0);
  const sleep = Number(selectedDayHabits?.sleep || 0);
  const burned = Number(selectedDayHabits?.burned || 0);
  const read = Number(selectedDayHabits?.read || 0);

  const maintenanceCalories = habitState.maintenanceCalories || 2000;
  const calorieMax = settings?.intake?.max || (maintenanceCalories ? Math.round(maintenanceCalories * 1.1) : 2500);

  const macroRatios = { protein: 30, carbs: 40, fats: 30 };
  const proteinMax = settings?.protein?.max || settings?.proteinTarget || Math.round((calorieMax * (macroRatios.protein / 100)) / 4);
  const carbsMax = settings?.carbs?.max || settings?.carbsTarget || Math.round((calorieMax * (macroRatios.carbs / 100)) / 4);
  const fatMax = settings?.fat?.max || settings?.fatTarget || Math.round((calorieMax * (macroRatios.fats / 100)) / 9);

  const loggedCalories = selectedDayFoodData?.summary?.totalCalories || 0;
  const caloriePercent = Math.min(100, Math.round((loggedCalories / (calorieMax || 1)) * 100));

  const loggedProtein = selectedDayFoodData?.summary?.totalProtein || 0;
  const loggedCarbs = selectedDayFoodData?.summary?.totalCarbs || 0;
  const loggedFat = selectedDayFoodData?.summary?.totalFat || 0;

  // Active self-care habits list
  const activeHabitsList = useMemo(() => {
    if (settings?.selfcare && Array.isArray(settings.selfcare) && settings.selfcare.length > 0) {
      return settings.selfcare;
    }
    return ["Workout", "Meditation", "Reading", "Hydration", "Healthy Meals", "Adequate Sleep"];
  }, [settings]);

  const rawSelfcare = String(selectedDayHabits?.selfcare || "");
  const totalHabits = activeHabitsList.length;
  const doneHabitsCount = activeHabitsList.filter((h, idx) => rawSelfcare[idx] === (h[0] || "H").toUpperCase()).length;
  const habitCompletionPct = totalHabits > 0 ? Math.round((doneHabitsCount / totalHabits) * 100) : 0;

  // Generic Habit Table Update (preserves all other fields)
  const saveHabitUpdate = async (patch) => {
    const current = selectedDayHabits || {};
    const payload = {
      date: selectedDate,
      burned: patch.burned !== undefined ? patch.burned : (Number(current.burned) || 0),
      water: patch.water !== undefined ? patch.water : (Number(current.water) || 0),
      sleep: patch.sleep !== undefined ? patch.sleep : (Number(current.sleep) || 0),
      read: patch.read !== undefined ? patch.read : (Number(current.read) || 0),
      intake: patch.intake !== undefined ? patch.intake : (Number(current.intake) || 0),
      selfcare: patch.selfcare !== undefined ? patch.selfcare : (current.selfcare || ""),
      progress: patch.progress !== undefined ? patch.progress : (Number(current.progress) || 0),
      score: patch.score !== undefined ? patch.score : (Number(current.score) || 0),
      mood: patch.mood !== undefined ? patch.mood : (current.mood || ""),
    };
    await axiosInstance.put("/v1/dashboard/habit/table-entry", payload);
  };

  // 1-Click Interactive Habit Toggle
  const handleToggleHabit = async (habitName, index) => {
    const total = activeHabitsList.length;
    const currentStr = String(selectedDayHabits?.selfcare || "_".repeat(total));
    const targetChar = (habitName[0] || "H").toUpperCase();
    const isCurrentlyChecked = currentStr[index] === targetChar;
    const updatedChar = isCurrentlyChecked ? "_" : targetChar;
    const newSelfcareStr = currentStr.substring(0, index) + updatedChar + currentStr.substring(index + 1);

    const newDoneCount = activeHabitsList.filter((h, idx) => newSelfcareStr[idx] === (h[0] || "H").toUpperCase()).length;
    const newProgress = total > 0 ? Math.round((newDoneCount / total) * 100) : 0;

    setSelectedDayHabits((prev) => ({
      ...(prev || {}),
      selfcare: newSelfcareStr,
      progress: newProgress,
    }));

    try {
      await saveHabitUpdate({
        selfcare: newSelfcareStr,
        progress: newProgress,
      });
    } catch (err) {
      console.error("Error saving habit toggle:", err);
      fetchHabitDataForDate(selectedDate);
    }
  };

  const handleCheckAllHabits = async () => {
    const total = activeHabitsList.length;
    const allDone = doneHabitsCount === total;
    let newSelfcareStr = "";
    if (allDone) {
      newSelfcareStr = "_".repeat(total);
    } else {
      newSelfcareStr = activeHabitsList.map((h) => (h[0] || "H").toUpperCase()).join("");
    }
    const newDoneCount = allDone ? 0 : total;
    const newProgress = allDone ? 0 : 100;

    setSelectedDayHabits((prev) => ({
      ...(prev || {}),
      selfcare: newSelfcareStr,
      progress: newProgress,
    }));

    try {
      await saveHabitUpdate({
        selfcare: newSelfcareStr,
        progress: newProgress,
      });
    } catch (err) {
      console.error("Error toggling all habits:", err);
      fetchHabitDataForDate(selectedDate);
    }
  };

  // Quick Vitals Handlers
  const handleQuickAddWater = () => {
    const current = Number(selectedDayHabits?.water || 0);
    const updated = Math.round((current + 0.25) * 100) / 100;
    setSelectedDayHabits((prev) => ({ ...(prev || {}), water: updated }));
    saveHabitUpdate({ water: updated }).catch(() => fetchHabitDataForDate(selectedDate));
  };

  const handleQuickAddSleep = () => {
    const current = Number(selectedDayHabits?.sleep || 0);
    const updated = Math.round((current + 1) * 10) / 10;
    setSelectedDayHabits((prev) => ({ ...(prev || {}), sleep: updated }));
    saveHabitUpdate({ sleep: updated }).catch(() => fetchHabitDataForDate(selectedDate));
  };

  const handleQuickAddBurned = () => {
    const current = Number(selectedDayHabits?.burned || 0);
    const updated = current + 100;
    setSelectedDayHabits((prev) => ({ ...(prev || {}), burned: updated }));
    saveHabitUpdate({ burned: updated }).catch(() => fetchHabitDataForDate(selectedDate));
  };

  const handleQuickAddRead = () => {
    const current = Number(selectedDayHabits?.read || 0);
    const updated = Math.round((current + 0.5) * 10) / 10;
    setSelectedDayHabits((prev) => ({ ...(prev || {}), read: updated }));
    saveHabitUpdate({ read: updated }).catch(() => fetchHabitDataForDate(selectedDate));
  };

  const openCustomVitalModal = (key, title, unit, currentVal) => {
    setVitalEditModal({
      isOpen: true,
      key,
      title,
      unit,
      val: currentVal !== undefined && currentVal !== null ? String(currentVal) : "0",
    });
  };

  const handleSaveCustomVital = async () => {
    const key = vitalEditModal.key;
    const num = Number(vitalEditModal.val) || 0;
    setSelectedDayHabits((prev) => ({ ...(prev || {}), [key]: num }));
    setVitalEditModal((prev) => ({ ...prev, isOpen: false }));
    try {
      await saveHabitUpdate({ [key]: num });
    } catch (err) {
      console.error(`Error saving custom ${key}:`, err);
      fetchHabitDataForDate(selectedDate);
    }
  };

  const getHabitEmoji = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("water") || lower.includes("drink")) return "💧";
    if (lower.includes("read") || lower.includes("book")) return "📚";
    if (lower.includes("sleep") || lower.includes("rest")) return "😴";
    if (lower.includes("meditat") || lower.includes("mind") || lower.includes("yoga")) return "🧘";
    if (lower.includes("work") || lower.includes("gym") || lower.includes("fit") || lower.includes("run")) return "🏋️";
    if (lower.includes("walk") || lower.includes("step")) return "🚶";
    if (lower.includes("food") || lower.includes("diet") || lower.includes("eat")) return "🥗";
    if (lower.includes("code") || lower.includes("study")) return "💻";
    if (lower.includes("journal") || lower.includes("write")) return "✍️";
    return "✨";
  };

  // Card Reordering Logic
  const moveCard = (index, direction) => {
    const newOrder = [...cardOrder];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setCardOrder(newOrder);
    try {
      localStorage.setItem("dashboard_card_order", JSON.stringify(newOrder));
    } catch (e) {}
  };

  const resetCardOrder = () => {
    setCardOrder(DEFAULT_CARD_ORDER);
    try {
      localStorage.setItem("dashboard_card_order", JSON.stringify(DEFAULT_CARD_ORDER));
    } catch (e) {}
  };

  // Bank Liquid Balance Metrics
  const bankMetrics = useMemo(() => {
    const validSources = (sources || []).filter((s) => {
      const type = (s.type || "").toLowerCase();
      return type !== "card" && type !== "credit card" && type !== "loan";
    });
    const total = validSources.reduce(
      (sum, s) => sum + (Number(s.currentBalance !== undefined ? s.currentBalance : s.balance) || 0),
      0
    );
    return {
      total: Math.round(total * 100) / 100,
      count: validSources.length,
    };
  }, [sources]);

  // Consolidated Net Worth across all 6 asset classes (Stocks, MFs, FDs, RDs, Bank, PF)
  const netWorth = useMemo(() => {
    return (
      (investmentData.stocksVal || 0) +
      (investmentData.mfVal || 0) +
      (investmentData.fdVal || 0) +
      (investmentData.rdVal || 0) +
      (investmentData.pfVal || 0) +
      (bankMetrics.total || 0)
    );
  }, [investmentData, bankMetrics.total]);

  // Total Holdings across invested instruments
  const totalHoldingsCount =
    (investmentData.stocksCount || 0) +
    (investmentData.mfCount || 0) +
    (investmentData.fdCount || 0) +
    (investmentData.rdCount || 0);

  // Month for Table-view expense calculation
  const currentMonth = reduxMonth || dayjs(selectedDate).format("YYYY-MM");

  // 1. PLANNED BUDGET (from Table View HeaderSection)
  const monthCategories = useMemo(() => {
    return (categories || []).filter((c) => !c.month || c.month === currentMonth);
  }, [categories, currentMonth]);

  const plannedBudget = useMemo(() => {
    return monthCategories.reduce(
      (acc, cat) =>
        acc +
        (cat.subCategories || []).reduce(
          (subAcc, sub) => subAcc + (Number(sub.budget) || 0),
          0
        ),
      0
    );
  }, [monthCategories]);

  // 2. TOTAL SPENT (from Table View HeaderSection: Debits with valid Category)
  const totalSpent = useMemo(() => {
    return (transactions || [])
      .filter((t) => t.type === "Debit" && Boolean(t.categoryId?._id || t.categoryId))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  // 3. ACTUAL REMAINING (from Table View HeaderSection: salary - totalSpent)
  const actualRemaining = useMemo(() => {
    const sal = Number(salary) || 0;
    if (sal > 0) return sal - totalSpent;
    return plannedBudget - totalSpent;
  }, [salary, totalSpent, plannedBudget]);

  // Utilized %
  const utilizedPct = useMemo(() => {
    if (plannedBudget > 0) {
      return Math.min(100, Math.round((totalSpent / plannedBudget) * 100));
    }
    if (Number(salary) > 0) {
      return Math.min(100, Math.round((totalSpent / Number(salary)) * 100));
    }
    return 0;
  }, [totalSpent, plannedBudget, salary]);

  // 4. SELECTED DATE'S TRANSACTIONS (can be transfer, credit, debit, or anything)
  const selectedDateTransactions = useMemo(() => {
    return (transactions || [])
      .filter((t) => {
        if (!t.date) return false;
        return dayjs(t.date).format("YYYY-MM-DD") === selectedDate;
      })
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (a._id && b._id) {
          return String(b._id).localeCompare(String(a._id));
        }
        return 0;
      });
  }, [transactions, selectedDate]);

  const selectedDateTotals = useMemo(() => {
    let debitSum = 0;
    let creditSum = 0;
    let transferSum = 0;
    selectedDateTransactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === "Debit") debitSum += amt;
      else if (t.type === "Credit") creditSum += amt;
      else if (t.type === "Transfer") transferSum += amt;
    });
    return { debitSum, creditSum, transferSum };
  }, [selectedDateTransactions]);

  const TimeIcon = timeContext.icon;

  // =========================================================================
  // CARD RENDERERS (Modular & Reorderable)
  // =========================================================================

  // 1. Weekly Momentum Strip (Mon - Sun)
  const renderMomentumCard = () => (
    <section
      key="momentum"
      className="bg-base-100 rounded-3xl border border-base-content/10 dark:border-white/10 p-3.5 sm:p-5 shadow-xs space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Calendar size={14} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Weekly Momentum
          </span>
          {!isSelectedDateToday && (
            <span className="badge badge-xs font-bold bg-primary/15 text-primary border-none">
              Viewing {dayjs(selectedDate).format("MMM D")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-base-content/60">
          <span>{isSelectedDateToday ? "Today:" : `${dayjs(selectedDate).format("ddd")}:`}</span>
          <span className="text-primary font-black">
            {hideNumbers ? "••/•• Habits" : `${doneHabitsCount}/${totalHabits} Habits (${habitCompletionPct}%)`}
          </span>
          <span>•</span>
          <span className="text-emerald-500 font-black">
            {hideNumbers ? "•••• kcal" : `${loggedCalories} kcal`}
          </span>
          {!isSelectedDateToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 font-bold ml-1 rounded-lg"
              title="Return to today"
            >
              Today ↺
            </button>
          )}
        </div>
      </div>

      {/* 7-Day Interactive Pills Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {currentWeekDays.map((day) => {
          const isSelected = day.isSelected;
          const isToday = day.isToday;

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => setSelectedDate(day.dateStr)}
              className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-1 rounded-2xl transition-all cursor-pointer text-center select-none ${
                isSelected
                  ? "bg-primary text-primary-content font-bold shadow-md ring-2 ring-primary/40 ring-offset-2 ring-offset-base-100 scale-[1.02]"
                  : isToday
                  ? "bg-primary/15 text-primary border border-primary/40 font-bold hover:bg-primary/20"
                  : day.isPast
                  ? "bg-base-200/50 text-base-content/80 border border-base-content/5 hover:bg-base-200"
                  : "bg-base-100 text-base-content/40 border border-base-content/5 hover:bg-base-200/30"
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wider font-extrabold ${
                  isSelected ? "text-primary-content/80" : "opacity-60"
                }`}
              >
                {day.dayName}
              </span>
              <span className={`text-sm sm:text-base font-black my-0.5 ${isSelected ? "text-primary-content" : ""}`}>
                {day.dayNum}
              </span>
              <div className="mt-0.5">
                {isSelected ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-content" />
                ) : isToday ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                ) : day.isPast ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-base-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );

  // 2. Contextual "What's Next" Launchpad (NO GRADIENT, solid clean bg-base-100 with thin border)
  const renderLaunchpadCard = () => (
    <section
      key="launchpad"
      className="rounded-3xl p-4 sm:p-6 bg-base-100 border border-base-content/10 dark:border-white/10 shadow-xs space-y-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-black">
            <TimeIcon size={13} />
            <span>{timeContext.badge}</span>
            {!isSelectedDateToday && (
              <span className="text-[10px] opacity-70">({dayjs(selectedDate).format("MMM D")})</span>
            )}
          </div>
          <p className="text-xs text-base-content/50">
            Log fuel and review nutrition macros to keep your daily pulse active.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openLogFoodModal(timeContext.targetMeal)}
            className="btn btn-sm btn-primary rounded-xl gap-1.5 font-black text-xs cursor-pointer shadow-xs"
          >
            <Plus size={14} /> {timeContext.actionText}
          </button>
        </div>
      </div>

      {/* Quick Meal Status Tracker Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-base-content/10">
        {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => {
          const mealItems = selectedDayFoodData?.meals?.[meal] || [];
          const isLogged = mealItems.length > 0;
          const mealCals = mealItems.reduce((acc, curr) => acc + (Number(curr.calories) || 0), 0);

          return (
            <button
              key={meal}
              onClick={() => openLogFoodModal(meal)}
              className={`p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isLogged
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                  : "bg-base-200/40 border-base-content/5 hover:bg-base-200/70 text-base-content/70"
              }`}
            >
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                  {meal}
                </div>
                <div className="text-xs font-black truncate">
                  {isLogged ? (hideNumbers ? "•••• kcal" : `${mealCals} kcal`) : "Pending"}
                </div>
              </div>
              {isLogged ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : (
                <Plus size={14} className="opacity-40 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Nutrition Progress Strip */}
      <div className="p-3.5 rounded-2xl bg-base-200/30 border border-base-content/10 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-base-content/70">Calories Consumed</span>
          <span className="font-mono text-primary font-black">
            {hideNumbers ? "••••" : loggedCalories}{" "}
            <span className="text-[10px] text-base-content/40">
              / {hideNumbers ? "•••• kcal" : `${calorieMax} kcal (${caloriePercent}%)`}
            </span>
          </span>
        </div>
        <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${caloriePercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-base-content/60 font-semibold font-mono">
          <span>
            Protein:{" "}
            <strong className="text-base-content">
              {hideNumbers ? "•••" : `${loggedProtein}g`}
            </strong>
            /{hideNumbers ? "•••" : `${proteinMax}g`}
          </span>
          <span>
            Carbs:{" "}
            <strong className="text-base-content">
              {hideNumbers ? "•••" : `${loggedCarbs}g`}
            </strong>
            /{hideNumbers ? "•••" : `${carbsMax}g`}
          </span>
          <span>
            Fat:{" "}
            <strong className="text-base-content">
              {hideNumbers ? "•••" : `${loggedFat}g`}
            </strong>
            /{hideNumbers ? "•••" : `${fatMax}g`}
          </span>
        </div>
      </div>
    </section>
  );

  // 3. Habits Checklist & Vitals (Dropdown for habits + quick-log buttons for all 4 vitals)
  const renderHabitsCard = () => (
    <section
      key="habits"
      className="bg-base-100 rounded-3xl border border-base-content/10 dark:border-white/10 p-4 sm:p-6 shadow-xs space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-content/10">
        <div>
          <div className="flex items-center gap-2">
            <Heart size={17} className="text-emerald-500" />
            <h3 className="font-extrabold text-base sm:text-lg text-base-content">
              Habits Checklist & Vitals
            </h3>
          </div>
          <p className="text-xs text-base-content/50 mt-0.5">
            Track daily habits via dropdown and log vital metrics with 1-click buttons.
          </p>
        </div>

        {/* Completion Indicator */}
        <div className="flex items-center gap-2">
          <span className="badge badge-sm font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">
            {hideNumbers ? "•• of •• Done" : `${doneHabitsCount} of ${totalHabits} Done (${habitCompletionPct}%)`}
          </span>
        </div>
      </div>

      {/* Habit Dropdown Selector (Compact & Clean instead of big grid) */}
      <div className="space-y-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsHabitDropdownOpen(!isHabitDropdownOpen)}
            className="w-full p-3.5 rounded-2xl bg-base-200/40 hover:bg-base-200/70 border border-base-content/10 flex items-center justify-between text-left transition-all cursor-pointer font-bold select-none"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={17} />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-base-content truncate">
                  Today's Habit Checklist {hideNumbers ? "(••/•• Completed)" : `(${doneHabitsCount}/${totalHabits} Completed)`}
                </div>
                <div className="text-[10px] text-base-content/50 font-medium">
                  Click to open dropdown and check off habits
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="badge badge-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">
                {hideNumbers ? "••%" : `${habitCompletionPct}%`}
              </span>
              <ChevronDown
                size={16}
                className={`text-base-content/50 transition-transform duration-200 ${
                  isHabitDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {/* Collapsible Dropdown Content */}
          <AnimatePresence>
            {isHabitDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-2 p-3 bg-base-100 rounded-2xl border border-base-content/10 shadow-lg space-y-2.5 z-20"
              >
                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-base-content/60">
                  <span>Toggle Habits for {dayjs(selectedDate).format("MMM D, YYYY")}</span>
                  <button
                    type="button"
                    onClick={handleCheckAllHabits}
                    className="text-primary hover:underline text-[11px] font-extrabold cursor-pointer"
                  >
                    {doneHabitsCount === totalHabits ? "Uncheck All" : "Check All"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                  {activeHabitsList.map((habitName, idx) => {
                    const targetChar = (habitName[0] || "H").toUpperCase();
                    const isChecked = rawSelfcare[idx] === targetChar;
                    const emoji = getHabitEmoji(habitName);

                    return (
                      <button
                        key={`${habitName}-${idx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHabit(habitName, idx);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
                          isChecked
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold"
                            : "bg-base-200/40 hover:bg-base-200 border-base-content/5 text-base-content/80 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{emoji}</span>
                          <span className="text-xs truncate">{habitName}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-base-content/30 bg-base-100"
                          }`}
                        >
                          {isChecked && <Check size={10} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compact Habit Badges Preview */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
          {activeHabitsList.map((habitName, idx) => {
            const targetChar = (habitName[0] || "H").toUpperCase();
            const isChecked = rawSelfcare[idx] === targetChar;
            const emoji = getHabitEmoji(habitName);

            return (
              <span
                key={`preview-${idx}`}
                onClick={() => handleToggleHabit(habitName, idx)}
                className={`cursor-pointer px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1 shrink-0 ${
                  isChecked
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "bg-base-200/40 border-base-content/5 text-base-content/50 hover:border-base-content/20"
                }`}
              >
                <span>{emoji}</span>
                <span>{habitName}</span>
                {isChecked && <Check size={10} strokeWidth={2.5} />}
              </span>
            );
          })}
        </div>
      </div>

      {/* Vitals Strip with Direct Action Buttons for All 4: Water, Sleep, Burned, Reading */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-base-content/10">
        {/* 1. Water Intake */}
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-base-content/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">
              <Droplet size={12} /> Water Intake
            </div>
            <button
              type="button"
              onClick={() => openCustomVitalModal("water", "Water Intake", "L", water)}
              className="opacity-50 hover:opacity-100 text-[10px] p-0.5"
              title="Edit water intake"
            >
              <Pencil size={11} />
            </button>
          </div>
          <div className="text-base sm:text-lg font-black text-base-content font-mono">
            {hideNumbers ? "••• L" : `${water} L`}
          </div>
          <button
            type="button"
            onClick={handleQuickAddWater}
            className="btn btn-xs bg-cyan-500 hover:bg-cyan-600 text-white border-none rounded-xl text-[10px] font-bold w-full"
            title="Add 250ml (0.25L)"
          >
            +250ml
          </button>
        </div>

        {/* 2. Sleep Log */}
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-base-content/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
              <Moon size={12} /> Sleep Log
            </div>
            <button
              type="button"
              onClick={() => openCustomVitalModal("sleep", "Sleep Log", "hrs", sleep)}
              className="opacity-50 hover:opacity-100 text-[10px] p-0.5"
              title="Edit sleep duration"
            >
              <Pencil size={11} />
            </button>
          </div>
          <div className="text-base sm:text-lg font-black text-base-content font-mono">
            {hideNumbers ? "••• hrs" : (sleep > 0 ? `${sleep} hrs` : "0 hrs")}
          </div>
          <button
            type="button"
            onClick={handleQuickAddSleep}
            className="btn btn-xs bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl text-[10px] font-bold w-full"
            title="Add 1 hour"
          >
            +1 hr
          </button>
        </div>

        {/* 3. Calories Burned */}
        <div className="p-3 rounded-2xl bg-orange-500/10 border border-base-content/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">
              <Flame size={12} /> Active Burned
            </div>
            <button
              type="button"
              onClick={() => openCustomVitalModal("burned", "Calories Burned", "kcal", burned)}
              className="opacity-50 hover:opacity-100 text-[10px] p-0.5"
              title="Edit burned calories"
            >
              <Pencil size={11} />
            </button>
          </div>
          <div className="text-base sm:text-lg font-black text-base-content font-mono">
            {hideNumbers ? "•••• kcal" : (burned > 0 ? `${burned} kcal` : "0 kcal")}
          </div>
          <button
            type="button"
            onClick={handleQuickAddBurned}
            className="btn btn-xs bg-orange-500 hover:bg-orange-600 text-white border-none rounded-xl text-[10px] font-bold w-full"
            title="Add 100 kcal"
          >
            +100 kcal
          </button>
        </div>

        {/* 4. Reading Duration */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-base-content/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              <BookOpen size={12} /> Reading
            </div>
            <button
              type="button"
              onClick={() => openCustomVitalModal("read", "Reading Time", "hrs", read)}
              className="opacity-50 hover:opacity-100 text-[10px] p-0.5"
              title="Edit reading time"
            >
              <Pencil size={11} />
            </button>
          </div>
          <div className="text-base sm:text-lg font-black text-base-content font-mono">
            {hideNumbers ? "••• hrs" : (read > 0 ? `${read} hrs` : "0 hrs")}
          </div>
          <button
            type="button"
            onClick={handleQuickAddRead}
            className="btn btn-xs bg-amber-500 hover:bg-amber-600 text-white border-none rounded-xl text-[10px] font-bold w-full"
            title="Add 30 minutes (0.5 hrs)"
          >
            +30 min
          </button>
        </div>
      </div>
    </section>
  );

  // 4. Expenses & Budget Card (Table View Metrics + Today's / Selected Date's Transactions)
  const renderExpenseCard = () => (
    <div
      key="expense"
      className="rounded-3xl p-4 sm:p-6 bg-base-100 border border-base-content/10 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4"
    >
      <div className="space-y-4">
        {/* Card Header with Quick Add Button */}
        <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-base-content flex items-center gap-1.5">
                Expenses & Budget
              </h3>
              <p className="text-[11px] text-base-content/50">
                {dayjs(currentMonth).format("MMMM YYYY")} • Table View Pulse
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="btn btn-xs sm:btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            title="Add new transaction"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Pie / Donut Chart Representation of Salary: Used vs Remaining */}
        {(() => {
          const totalSal = Number(salary) || 0;
          const baseCap = totalSal > 0 ? totalSal : (plannedBudget > 0 ? plannedBudget : 0);
          const usedAmt = totalSpent;
          const remAmt = Math.max(0, baseCap - usedAmt);

          // Donut circumference for r = 58: C = 2 * PI * 58 ≈ 364.42
          const C = 2 * Math.PI * 58;
          const usedRatio = baseCap > 0 ? Math.min(1, Math.max(0, usedAmt / baseCap)) : 0;
          const usedStroke = (usedRatio * C).toFixed(2);

          const usedSharePct = baseCap > 0 ? Math.min(100, Math.round((usedAmt / baseCap) * 100)) : 0;
          const remSharePct = Math.max(0, 100 - usedSharePct);

          return (
            <div className="p-4 sm:p-5 rounded-2xl bg-base-200/30 border border-base-content/10 flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-6">
              {/* Donut Chart with Total Salary in Middle */}
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 144 144">
                  {/* Background Track Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-base-content/5"
                    strokeWidth="14"
                  />
                  {/* Remaining Slice (Same color as Used with 50% opacity) */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    fill="transparent"
                    stroke="#6366f1"
                    strokeOpacity="0.45"
                    strokeWidth="14"
                    strokeDasharray={`${C} ${C}`}
                    className="transition-all duration-700 ease-out"
                  />
                  {/* Used Slice (100% Opacity) */}
                  {usedRatio > 0 && (
                    <circle
                      cx="72"
                      cy="72"
                      r="58"
                      fill="transparent"
                      stroke="#6366f1"
                      strokeWidth="14"
                      strokeDasharray={`${usedStroke} ${C}`}
                      strokeLinecap={usedRatio >= 0.99 ? "butt" : "round"}
                      className="transition-all duration-700 ease-out"
                    />
                  )}
                </svg>

                {/* Center of the Pie Chart: Total Salary */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none select-none">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-base-content/50">
                    Total Salary
                  </span>
                  <span className="text-base sm:text-xl font-black font-mono text-base-content tracking-tight mt-0.5">
                    {hideNumbers ? "••••••" : `₹${totalSal.toLocaleString("en-IN")}`}
                  </span>
                  <span className="text-[9.5px] font-bold font-mono text-base-content/40 mt-0.5">
                    {hideNumbers ? "••% Spent" : (baseCap > 0 ? `${usedSharePct}% Spent` : "Monthly")}
                  </span>
                </div>
              </div>

              {/* Legend & Breakdown: Used and Remaining */}
              <div className="w-full sm:w-auto flex-1 max-w-xs space-y-2.5">
                {/* 1. Used Slice Breakdown */}
                <div className="p-3 rounded-2xl bg-base-100 border border-base-content/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-[#6366f1] shrink-0 shadow-xs" />
                    <div>
                      <div className="text-xs font-bold text-base-content">Used</div>
                      <div className="text-[10px] text-base-content/50">Total Spent</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-black font-mono text-base-content">
                      {hideNumbers ? "••••••" : `₹${usedAmt.toLocaleString("en-IN")}`}
                    </div>
                    <div className="text-[10px] font-bold text-[#6366f1] font-mono">
                      {hideNumbers ? "••%" : `${usedSharePct}%`}
                    </div>
                  </div>
                </div>

                {/* 2. Remaining Slice Breakdown (Same color with 50% opacity) */}
                <div className="p-3 rounded-2xl bg-base-100 border border-base-content/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-[#6366f1]/50 shrink-0 border border-[#6366f1]/40" />
                    <div>
                      <div className="text-xs font-bold text-base-content">Remaining</div>
                      <div className="text-[10px] text-base-content/50">Available Balance</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-black font-mono text-base-content">
                      {hideNumbers
                        ? "••••••"
                        : actualRemaining < 0
                        ? `-₹${Math.abs(actualRemaining).toLocaleString("en-IN")}`
                        : `₹${remAmt.toLocaleString("en-IN")}`}
                    </div>
                    <div className="text-[10px] font-bold text-base-content/50 font-mono">
                      {hideNumbers ? "••%" : `${remSharePct}%`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Selected Date's Transactions Feed (Debit, Credit, Transfer or anything) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60">
                {isSelectedDateToday
                  ? "Today's Transactions"
                  : `Transactions for ${dayjs(selectedDate).format("MMM D")}`}
              </span>
              <span className="badge badge-xs font-mono font-bold bg-base-200 text-base-content/70 border-none">
                {hideNumbers ? "••" : selectedDateTransactions.length}
              </span>
            </div>

            {selectedDateTransactions.length > 0 && (
              <div className="text-[10px] font-mono font-bold text-base-content/50 flex items-center gap-1.5">
                {selectedDateTotals.debitSum > 0 && (
                  <span className="text-rose-500">
                    {hideNumbers ? "-••••" : `-₹${selectedDateTotals.debitSum.toLocaleString("en-IN")}`}
                  </span>
                )}
                {selectedDateTotals.creditSum > 0 && (
                  <span className="text-emerald-500">
                    {hideNumbers ? "+••••" : `+₹${selectedDateTotals.creditSum.toLocaleString("en-IN")}`}
                  </span>
                )}
                {selectedDateTotals.transferSum > 0 && (
                  <span className="text-sky-500">
                    {hideNumbers ? "⇄ ••••" : `⇄ ₹${selectedDateTotals.transferSum.toLocaleString("en-IN")}`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* List or Empty State */}
          {selectedDateTransactions.length > 0 ? (
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {selectedDateTransactions.map((t, idx) => {
                const isCredit = t.type === "Credit";
                const isTransfer = t.type === "Transfer";
                const isDebit = t.type === "Debit";
                const isDebitMoney = isDebit && (!t.categoryId || t.isDebitMoney);
                const isExpense = isDebit && Boolean(t.categoryId?._id || t.categoryId);

                const amt = Number(t.amount || 0);

                let subtitle = "";
                if (isTransfer) {
                  const fromName = getSourceName(t.sourceId) || "Bank";
                  const toName = getSourceName(t.targetSourceId) || "Target";
                  subtitle = `${fromName} → ${toName}`;
                } else if (isExpense) {
                  const catName = getCategoryName(t.categoryId) || "Expense";
                  const subName = getSubCategoryName(t.categoryId, t.subCategoryId);
                  const srcName = getSourceName(t.sourceId);
                  subtitle = `${catName}${subName ? ` • ${subName}` : ""}${srcName ? ` (${srcName})` : ""}`;
                } else if (isDebitMoney) {
                  const srcName = getSourceName(t.sourceId);
                  subtitle = `Debit Money • ${srcName || "Cash/Bank"}`;
                } else if (isCredit) {
                  const srcName = getSourceName(t.sourceId);
                  subtitle = `Credited to ${srcName || "Account"}`;
                } else {
                  subtitle = getSourceName(t.sourceId) || "";
                }

                return (
                  <div
                    key={t._id || idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-base-200/40 hover:bg-base-200/70 border border-base-content/10 transition-all text-xs"
                  >
                    {/* Left: Icon + Description + Context */}
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          isCredit
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : isTransfer
                            ? "bg-sky-500/15 text-sky-600 dark:text-sky-400"
                            : isDebitMoney
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft size={13} />
                        ) : isTransfer ? (
                          <ArrowRightLeft size={13} />
                        ) : isDebitMoney ? (
                          <ArrowUpRight size={13} />
                        ) : (
                          <CreditCard size={13} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-base-content truncate flex items-center gap-1.5">
                          <span className="truncate">
                            {t.description || (isTransfer ? "Account Transfer" : "Transaction")}
                          </span>
                          {t.isReimbursable && (
                            <span className="badge badge-[9px] badge-outline badge-info px-1 py-0 text-[8.5px] shrink-0 font-bold">
                              Reimbursable
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-base-content/50 truncate font-medium">
                          {subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Right: Type Badge & Amount */}
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span
                        className={`font-mono font-black text-xs sm:text-sm ${
                          isCredit
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isTransfer
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {hideNumbers
                          ? "••••"
                          : isCredit
                          ? `+₹${amt.toLocaleString("en-IN")}`
                          : isTransfer
                          ? `⇄ ₹${amt.toLocaleString("en-IN")}`
                          : `-₹${amt.toLocaleString("en-IN")}`}
                      </span>
                      <span
                        className={`text-[8.5px] font-bold uppercase tracking-wider ${
                          isCredit
                            ? "text-emerald-500/80"
                            : isTransfer
                            ? "text-sky-500/80"
                            : isDebitMoney
                            ? "text-rose-500/80"
                            : "text-rose-500/80"
                        }`}
                      >
                        {isCredit ? "Credit" : isTransfer ? "Transfer" : isDebitMoney ? "Debit Money" : "Expense"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-base-200/30 border border-dashed border-base-content/20 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center mx-auto text-base-content/40">
                <Receipt size={15} />
              </div>
              <div>
                <div className="text-xs font-bold text-base-content/80">
                  No transactions recorded {isSelectedDateToday ? "today" : `for ${dayjs(selectedDate).format("MMM D")}`}
                </div>
                <p className="text-[10px] text-base-content/50">
                  Expenses, debit money, credits, and transfers will appear here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExpenseModalOpen(true)}
                className="btn btn-xs btn-primary rounded-xl font-bold gap-1 cursor-pointer"
              >
                <Plus size={12} /> Log Transaction
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-base-content/10">
        <button
          type="button"
          onClick={() => setIsAddExpenseModalOpen(true)}
          className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex-1 font-bold text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus size={14} /> Quick Add Transaction
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard/expense/table-view")}
          className="btn btn-sm btn-ghost hover:bg-base-200 rounded-xl text-base-content/70 text-xs gap-1 font-semibold"
        >
          Expense Table <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );

  // 5. Investment Portfolio & Net Worth Snapshot
  const renderInvestmentCard = () => {
    const totalInvestedCapital =
      (investmentData.stocksVal || 0) +
      (investmentData.mfVal || 0) +
      (investmentData.fdVal || 0) +
      (investmentData.rdVal || 0);

    const assetCategories = [
      {
        id: "stocks",
        label: "Stocks Held",
        count: investmentData.stocksCount,
        countUnit: investmentData.stocksCount === 1 ? "Stock" : "Stocks",
        value: investmentData.stocksVal,
        color: "text-blue-500",
        badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        icon: TrendingUp,
        subLabel: "Equities Portfolio",
        path: "/dashboard/investment/table-entry?tab=stocks",
      },
      {
        id: "mf",
        label: "Active MFs",
        count: investmentData.mfCount,
        countUnit: investmentData.mfCount === 1 ? "Fund" : "Funds",
        value: investmentData.mfVal,
        color: "text-purple-500",
        badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        icon: PieChart,
        subLabel: "SIP & Lumpsum Portfolios",
        path: "/dashboard/investment/table-entry?tab=mf",
      },
      {
        id: "fd",
        label: "Total FDs",
        count: investmentData.fdCount,
        countUnit: investmentData.fdCount === 1 ? "FD" : "FDs",
        value: investmentData.fdVal,
        color: "text-emerald-500",
        badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: Landmark,
        subLabel: "Fixed Term Deposits",
        path: "/dashboard/investment/table-entry?tab=fd",
      },
      {
        id: "rd",
        label: "Total RDs",
        count: investmentData.rdCount,
        countUnit: investmentData.rdCount === 1 ? "RD" : "RDs",
        value: investmentData.rdVal,
        color: "text-amber-500",
        badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        icon: PiggyBank,
        subLabel: "Recurring Monthly Deposits",
        path: "/dashboard/investment/table-entry?tab=rd",
      },
    ];

    return (
      <div
        key="investment"
        className="rounded-3xl p-4 sm:p-6 bg-base-100 border border-base-content/10 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-4"
      >
        <div className="space-y-4">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
                  <span>Net Worth</span>
                </h3>
                <p className="text-[11px] text-base-content/50">
                  Consolidated Wealth Pulse across 6 Asset Classes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard/investment/table-view")}
                className="btn btn-xs btn-ghost hover:bg-base-200 rounded-xl text-base-content/70 font-semibold gap-1"
                title="View Full Portfolio"
              >
                <Table size={12} />
                <span className="hidden sm:inline">Portfolio</span>
              </button>
            </div>
          </div>

          {/* Consolidated Net Worth Hero */}
          <div className="p-4 sm:p-5 rounded-2xl bg-base-200/30 border border-base-content/10 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-base-content/50">
                  Consolidated Net Worth
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-500 font-mono tracking-tight mt-0.5">
                  {hideNumbers ? "••••••" : `₹${netWorth.toLocaleString("en-IN")}`}
                </div>
                <div className="text-[10px] sm:text-xs text-base-content/50 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>Invested Capital:</span>
                  <span className="font-mono font-bold text-base-content/70">
                    {hideNumbers ? "••••••" : `₹${totalInvestedCapital.toLocaleString("en-IN")}`}
                  </span>
                  <span>•</span>
                  <span>Liquid & PF:</span>
                  <span className="font-mono font-bold text-base-content/70">
                    {hideNumbers ? "••••••" : `₹${((bankMetrics.total || 0) + (investmentData.pfVal || 0)).toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              {/* Action Pill to Portfolio Table */}
              <div className="flex items-center gap-2 text-right self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/investment/table-view")}
                  className="btn btn-xs sm:btn-sm bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border-none rounded-xl font-bold gap-1 cursor-pointer"
                >
                  <span>Detailed Analytics</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Visual Net Worth Distribution Bar */}
            {netWorth > 0 && (
              <div className="mt-3.5 pt-3 border-t border-base-content/10">
                <div className="h-2 w-full rounded-full bg-base-300 overflow-hidden flex">
                  {investmentData.stocksVal > 0 && (
                    <div
                      style={{ width: `${(investmentData.stocksVal / netWorth) * 100}%` }}
                      className="bg-blue-500 h-full"
                      title={hideNumbers ? "Stocks" : `Stocks: ₹${investmentData.stocksVal.toLocaleString("en-IN")}`}
                    />
                  )}
                  {investmentData.mfVal > 0 && (
                    <div
                      style={{ width: `${(investmentData.mfVal / netWorth) * 100}%` }}
                      className="bg-purple-500 h-full"
                      title={hideNumbers ? "MF" : `MF: ₹${investmentData.mfVal.toLocaleString("en-IN")}`}
                    />
                  )}
                  {investmentData.fdVal > 0 && (
                    <div
                      style={{ width: `${(investmentData.fdVal / netWorth) * 100}%` }}
                      className="bg-emerald-500 h-full"
                      title={hideNumbers ? "FD" : `FD: ₹${investmentData.fdVal.toLocaleString("en-IN")}`}
                    />
                  )}
                  {investmentData.rdVal > 0 && (
                    <div
                      style={{ width: `${(investmentData.rdVal / netWorth) * 100}%` }}
                      className="bg-amber-500 h-full"
                      title={hideNumbers ? "RD" : `RD: ₹${investmentData.rdVal.toLocaleString("en-IN")}`}
                    />
                  )}
                  {(bankMetrics.total || 0) > 0 && (
                    <div
                      style={{ width: `${(bankMetrics.total / netWorth) * 100}%` }}
                      className="bg-cyan-500 h-full"
                      title={hideNumbers ? "Bank" : `Bank: ₹${bankMetrics.total.toLocaleString("en-IN")}`}
                    />
                  )}
                  {investmentData.pfVal > 0 && (
                    <div
                      style={{ width: `${(investmentData.pfVal / netWorth) * 100}%` }}
                      className="bg-teal-500 h-full"
                      title={hideNumbers ? "PF" : `PF: ₹${investmentData.pfVal.toLocaleString("en-IN")}`}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4 Core Asset Cards: Stocks Held, Active MFs, Total FDs, Total RDs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {assetCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => navigate(cat.path)}
                  className="p-3 sm:p-3.5 rounded-2xl bg-base-200/30 hover:bg-base-200/60 border border-base-content/10 transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${cat.badgeBg}`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-xs font-bold text-base-content group-hover:text-primary transition-colors">
                        {cat.label}
                      </span>
                    </div>
                    <ArrowUpRight
                      size={13}
                      className="text-base-content/30 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>

                  <div className="mt-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg sm:text-xl font-black font-mono text-base-content">
                        {hideNumbers ? "••" : cat.count}
                      </span>
                      <span className="text-[10px] font-semibold text-base-content/50">
                        {cat.countUnit}
                      </span>
                    </div>
                    <div className="text-xs font-bold font-mono text-base-content/70 mt-0.5">
                      {hideNumbers ? "••••••" : `₹${cat.value.toLocaleString("en-IN")}`}
                    </div>
                    <div className="text-[9.5px] text-base-content/40 font-medium truncate mt-0.5">
                      {cat.subLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Liquid Bank & Provident Fund (PF) Breakdown Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Bank Balances */}
            <div
              onClick={() => navigate("/dashboard/expense/table-view")}
              className="p-3 rounded-2xl bg-base-100 border border-base-content/10 flex items-center justify-between cursor-pointer hover:bg-base-200/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Wallet size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-base-content">Bank & Liquid Cash</div>
                  <div className="text-[10px] text-base-content/50">
                    {hideNumbers ? "••" : bankMetrics.count} Tracked Payment {bankMetrics.count === 1 ? "Source" : "Sources"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-black font-mono text-base-content">
                  {hideNumbers ? "••••••" : `₹${bankMetrics.total.toLocaleString("en-IN")}`}
                </div>
                <div className="text-[9.5px] text-cyan-500 font-bold uppercase tracking-wider">
                  Liquid
                </div>
              </div>
            </div>

            {/* Provident Fund (PF) */}
            <div
              onClick={() => navigate("/dashboard/investment/table-entry?tab=pf")}
              className="p-3 rounded-2xl bg-base-100 border border-base-content/10 flex items-center justify-between cursor-pointer hover:bg-base-200/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Percent size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-base-content">Provident Fund (EPF)</div>
                  <div className="text-[10px] text-base-content/50">
                    Employer + Employee Contributions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-black font-mono text-base-content">
                  {hideNumbers ? "••••••" : `₹${investmentData.pfVal.toLocaleString("en-IN")}`}
                </div>
                <div className="text-[9.5px] text-teal-500 font-bold uppercase tracking-wider">
                  Retirement
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-base-content/10">
          <button
            type="button"
            onClick={() => navigate("/dashboard/investment/table-view")}
            className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex-1 font-bold text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
          >
            <Table size={14} /> Full Portfolio Ledger
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/investment/table-entry?tab=stocks")}
            className="btn btn-sm btn-ghost hover:bg-base-200 rounded-xl text-base-content/70 text-xs gap-1 font-semibold"
          >
            Manage Trades <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );
  };

  // 6. Quick Shortcuts Launchpad (All Trackers & Sub-Sections)
  const renderShortcutsCard = () => {
    const TRACKER_MODULES = [
      {
        id: "habit",
        name: "Habit Tracker",
        category: "Daily Habits & Vitals",
        color: "rose",
        badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        icon: Heart,
        mainPath: "/dashboard/habit",
        sections: [
          {
            title: "Daily Habit Logging",
            desc: "Streaks, scores, hydration, sleep & mood",
            icon: Table,
            path: "/dashboard/habit/table-entry",
          },
          {
            title: "Habit Analytics",
            desc: "Visual trends, heatmaps & completion rates",
            icon: BarChart3,
            path: "/dashboard/habit/dashboard",
          },
          {
            title: "Habit Profile",
            desc: "Active habits registry & streak review",
            icon: Heart,
            path: "/dashboard/habit/logging",
          },
          {
            title: "Targets & Settings",
            desc: "Macro targets, maintenance calories & habits",
            icon: Settings,
            path: "/dashboard/habit/settings",
          },
          {
            title: "Quick Meal Log",
            desc: "Instant calorie & macro food logging popup",
            icon: Utensils,
            action: () => openLogFoodModal("Breakfast"),
          },
        ],
      },
      {
        id: "expense",
        name: "Expense & Budget Tracker",
        category: "Financial Outlays & Cash Flow",
        color: "indigo",
        badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        icon: Wallet,
        mainPath: "/dashboard/expense",
        sections: [
          {
            title: "Expense Ledger",
            desc: "Detailed debit, credit & transfer records",
            icon: Receipt,
            path: "/dashboard/expense/table-entry",
          },
          {
            title: "Budget Planning",
            desc: "Monthly category limits & utilization table",
            icon: Table,
            path: "/dashboard/expense/table-view",
          },
          {
            title: "Expense Analytics",
            desc: "Category breakdown & monthly burn charts",
            icon: BarChart3,
            path: "/dashboard/expense/dashboard",
          },
          {
            title: "Accounts & Sources",
            desc: "Bank accounts, credit cards & cash wallets",
            icon: Building2,
            path: "/dashboard/expense/settings",
          },
          {
            title: "Quick Add Transaction",
            desc: "Instant debit, credit or transfer popup",
            icon: Plus,
            action: () => setIsAddExpenseModalOpen(true),
          },
        ],
      },
      {
        id: "investment",
        name: "Investment & Wealth Tracker",
        category: "Equities, SIPs & Wealth Assets",
        color: "amber",
        badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        icon: TrendingUp,
        mainPath: "/dashboard/investment",
        sections: [
          {
            title: "Stocks Ledger",
            desc: "Equities portfolio, trade lots & holdings",
            icon: TrendingUp,
            path: "/dashboard/investment/table-entry?tab=stocks",
          },
          {
            title: "Mutual Funds (MF)",
            desc: "Active SIPs, unit holdings & NAV history",
            icon: PieChart,
            path: "/dashboard/investment/table-entry?tab=mf",
          },
          {
            title: "Fixed Deposits (FD)",
            desc: "Bank term deposits, interest & maturity",
            icon: Landmark,
            path: "/dashboard/investment/table-entry?tab=fd",
          },
          {
            title: "Recurring Deposits (RD)",
            desc: "Monthly recurring savings & accrued value",
            icon: PiggyBank,
            path: "/dashboard/investment/table-entry?tab=rd",
          },
          {
            title: "Provident Fund (EPF)",
            desc: "Employer & Employee PF retirement balance",
            icon: Percent,
            path: "/dashboard/investment/table-entry?tab=pf",
          },
          {
            title: "Portfolio Net Worth",
            desc: "Consolidated portfolio across all 6 asset classes",
            icon: Table,
            path: "/dashboard/investment/table-view",
          },
          {
            title: "Investment Analytics",
            desc: "Asset allocation charts & portfolio metrics",
            icon: BarChart3,
            path: "/dashboard/investment/dashboard",
          },
          {
            title: "Wealth Goals Planner",
            desc: "Target milestones & future wealth projections",
            icon: Target,
            path: "/dashboard/investment/planner",
          },
        ],
      },
      {
        id: "settings",
        name: "System & Profile Settings",
        category: "Preferences & Account Security",
        color: "slate",
        badgeBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
        icon: Settings,
        mainPath: "/dashboard/settings",
        sections: [
          {
            title: "User Profile",
            desc: "Date of birth, avatar & personal info",
            icon: User,
            path: "/dashboard/settings/profile",
          },
          {
            title: "Preferences",
            desc: "Display, themes & notification controls",
            icon: SlidersHorizontal,
            path: "/dashboard/settings/preferences",
          },
          {
            title: "Security & Passwords",
            desc: "Credential updates & account protection",
            icon: Lock,
            path: "/dashboard/settings/security",
          },
        ],
      },
    ];

    const totalSubsectionsCount = TRACKER_MODULES.reduce((sum, m) => sum + m.sections.length, 0);

    const filteredModules =
      launchpadTab === "all"
        ? TRACKER_MODULES
        : TRACKER_MODULES.filter((m) => m.id === launchpadTab);

    const toggleTracker = (id) => {
      setExpandedTrackers((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    const areAllExpanded =
      filteredModules.length > 0 && filteredModules.every((m) => Boolean(expandedTrackers[m.id]));

    const toggleAllTrackers = () => {
      if (areAllExpanded) {
        setExpandedTrackers({});
      } else {
        const allOpen = {};
        TRACKER_MODULES.forEach((m) => {
          allOpen[m.id] = true;
        });
        setExpandedTrackers(allOpen);
      }
    };

    return (
      <section
        key="shortcuts"
        className="bg-base-100 rounded-3xl border border-base-content/10 dark:border-white/10 p-4 sm:p-6 shadow-xs space-y-4"
      >
        {/* Top Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-content/10">
          <div>
            <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
              <span>Quick Launchpad</span>
              <span className="badge badge-xs font-mono font-bold bg-primary/10 text-primary border-none">
                {totalSubsectionsCount} Sections
              </span>
            </h3>
            <p className="text-xs text-base-content/50">
              Direct shortcuts to all trackers and their respective sub-sections
            </p>
          </div>

          {/* Module Filter Pills & Expand/Collapse Toggle */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={toggleAllTrackers}
              className="btn btn-xs btn-ghost border border-base-content/10 hover:bg-base-200 rounded-xl font-bold text-xs gap-1 cursor-pointer text-base-content/70"
              title={areAllExpanded ? "Collapse all sub-sections" : "Expand all sub-sections"}
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${areAllExpanded ? "rotate-180" : ""}`}
              />
              <span>{areAllExpanded ? "Collapse All" : "Expand All"}</span>
            </button>

            <button
              type="button"
              onClick={() => setLaunchpadTab("all")}
              className={`btn btn-xs rounded-xl font-bold cursor-pointer transition-all ${
                launchpadTab === "all"
                  ? "btn-primary shadow-xs"
                  : "btn-ghost border border-base-content/10 text-base-content/70 hover:bg-base-200"
              }`}
            >
              All ({totalSubsectionsCount})
            </button>
            {TRACKER_MODULES.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setLaunchpadTab(m.id)}
                className={`btn btn-xs rounded-xl font-bold cursor-pointer transition-all ${
                  launchpadTab === m.id
                    ? "btn-primary shadow-xs"
                    : "btn-ghost border border-base-content/10 text-base-content/70 hover:bg-base-200"
                }`}
              >
                {m.name.split(" ")[0]} ({m.sections.length})
              </button>
            ))}
          </div>
        </div>

        {/* Trackers Accordion List (Collapsed by Default) */}
        <div className="space-y-3">
          {filteredModules.map((mod) => {
            const ModIcon = mod.icon;
            const isExpanded = Boolean(expandedTrackers[mod.id]);

            return (
              <div
                key={mod.id}
                className="rounded-2xl bg-base-200/30 border border-base-content/10 dark:border-white/10 transition-all overflow-hidden"
              >
                {/* Tracker Module Header (Click anywhere on header to toggle collapse) */}
                <div
                  onClick={() => toggleTracker(mod.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-base-200/60 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${mod.badgeBg} shrink-0`}>
                      <ModIcon size={16} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-base-content flex items-center gap-2 flex-wrap">
                        <span>{mod.name}</span>
                        <span className="text-[10px] font-normal text-base-content/50 hidden sm:inline">
                          • {mod.category}
                        </span>
                        <span className="badge badge-xs font-mono font-bold bg-base-300/80 text-base-content/60 border-none">
                          {mod.sections.length} Sub-options
                        </span>
                      </h4>
                      <p className="text-[10.5px] text-base-content/50 sm:hidden">{mod.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(mod.mainPath);
                      }}
                      className="btn btn-xs btn-ghost hover:bg-base-200 rounded-xl text-xs font-semibold text-base-content/70 gap-1 cursor-pointer hidden sm:flex"
                      title={`Open ${mod.name}`}
                    >
                      <span>Open Tracker</span>
                      <ArrowRight size={12} />
                    </button>

                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        isExpanded
                          ? "bg-primary/15 text-primary rotate-180"
                          : "bg-base-200 text-base-content/60 hover:bg-base-300"
                      }`}
                      title={isExpanded ? "Collapse sub-options" : "Expand sub-options"}
                    >
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Collapsible Sub-sections Grid */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-3.5 sm:p-4 pt-0 border-t border-base-content/10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3">
                          {mod.sections.map((sub) => {
                            const SubIcon = sub.icon;
                            return (
                              <button
                                type="button"
                                key={sub.title}
                                onClick={() => {
                                  if (sub.action) sub.action();
                                  else navigate(sub.path);
                                }}
                                className="p-3 rounded-xl bg-base-100 hover:bg-base-200/70 border border-base-content/10 transition-all text-left flex items-start gap-2.5 group cursor-pointer shadow-2xs hover:shadow-xs"
                              >
                                <div
                                  className={`p-2 rounded-lg ${mod.badgeBg} shrink-0 group-hover:scale-105 transition-transform`}
                                >
                                  <SubIcon size={15} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-xs text-base-content group-hover:text-primary transition-colors truncate">
                                      {sub.title}
                                    </span>
                                    <ArrowUpRight
                                      size={12}
                                      className="text-base-content/30 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
                                    />
                                  </div>
                                  <p className="text-[10px] text-base-content/50 mt-0.5 line-clamp-1">
                                    {sub.desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans selection:bg-primary/30 selection:text-primary pb-20">
      {/* Background Subtle Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-secondary/15 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER (Date in middle -> Greeting -> Quote)                       */}
        {/* ========================================================================= */}
        <header className="pb-3 border-b border-base-content/10">
          {/* Centered Date -> Greeting -> Quote */}
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-1 sm:space-y-1.5">
            {/* 1. Date in the middle */}
            <div className="text-xs sm:text-sm text-base-content/50 font-medium flex items-center justify-center gap-1.5">
              <Calendar size={13} className="text-primary/70 shrink-0" />
              <span>{dayjs(selectedDate).format("dddd, MMMM D, YYYY")}</span>
              {!isSelectedDateToday && (
                <span className="ml-1 badge badge-xs font-bold bg-primary/15 text-primary border-none">
                  Viewing Past Date
                </span>
              )}
            </div>

            {/* 2. Good morning user in next line */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-base-content tracking-tight">
              {greeting}, <span className="text-primary">{user}</span>.
            </h1>

            {/* 3. Quote in next line */}
            <p className="text-xs sm:text-sm text-base-content/60 font-medium italic flex items-center justify-center gap-1.5 flex-wrap px-2">
              <span>"{todayQuote.quote}"</span>
              <span className="text-base-content/40 not-italic font-semibold">— {todayQuote.author}</span>
            </p>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. REORDER & REFRESH CONTROLS (After header, just above the week)         */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            {!isSelectedDateToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="btn btn-xs sm:btn-sm btn-primary rounded-xl font-bold gap-1 cursor-pointer shadow-xs"
              >
                <RotateCcw size={12} /> Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReorderModalOpen(true)}
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-content/10 hover:bg-base-200 rounded-xl font-bold text-xs gap-1.5 cursor-pointer text-base-content/70 shadow-2xs"
              title="Reorder dashboard cards"
            >
              <SlidersHorizontal size={13} />
              <span>Reorder</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshAll}
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-content/10 hover:bg-base-200 rounded-xl font-bold text-xs gap-1.5 cursor-pointer text-base-content/70 shadow-2xs"
              title="Refresh all metrics"
            >
              <RotateCcw size={13} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={toggleHideNumbers}
              className={`btn btn-xs sm:btn-sm rounded-xl font-bold text-xs gap-1.5 cursor-pointer shadow-2xs transition-all ${
                hideNumbers
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                  : "btn-ghost border border-base-content/10 hover:bg-base-200 text-base-content/70"
              }`}
              title={hideNumbers ? "Show numbers" : "Hide numbers (Privacy Mode)"}
            >
              {hideNumbers ? <EyeOff size={13} /> : <Eye size={13} />}
              <span className="hidden sm:inline">{hideNumbers ? "Show" : "Hide"}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DYNAMICALLY ORDERED DASHBOARD CARDS                                    */}
        {/* ========================================================================= */}
        <div className="space-y-4 sm:space-y-5">
          {cardOrder.map((cardId) => {
            switch (cardId) {
              case "momentum":
                return renderMomentumCard();
              case "launchpad":
                return renderLaunchpadCard();
              case "habits":
                return renderHabitsCard();
              case "expense":
                return renderExpenseCard();
              case "investment":
                return renderInvestmentCard();
              case "shortcuts":
                return renderShortcutsCard();
              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALS                                                                 */}
      {/* ========================================================================= */}

      {/* Reorder Cards Modal */}
      <AnimatePresence>
        {isReorderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-base-100 rounded-3xl border border-base-content/10 shadow-2xl w-full max-w-md p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-base-content/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
                    <SlidersHorizontal size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-base-content">
                      Reorder Dashboard Cards
                    </h3>
                    <p className="text-[10px] text-base-content/50">
                      Arrange cards to suit your personal daily focus
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="btn btn-sm btn-ghost btn-circle text-base-content/50 hover:text-base-content"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Cards List with Up/Down buttons */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {cardOrder.map((cardId, idx) => {
                  const meta = CARD_METADATA[cardId] || { name: cardId, desc: "", icon: Layers };
                  const CardIcon = meta.icon;

                  return (
                    <div
                      key={cardId}
                      className="p-3 rounded-2xl bg-base-200/40 border border-base-content/10 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-base-100 border border-base-content/10 text-primary shrink-0">
                          <CardIcon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-base-content truncate">
                            {idx + 1}. {meta.name}
                          </div>
                          <div className="text-[10px] text-base-content/50 truncate">
                            {meta.desc}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveCard(idx, -1)}
                          className={`btn btn-xs btn-ghost btn-square rounded-lg ${
                            idx === 0 ? "opacity-30 pointer-events-none" : "hover:bg-base-300"
                          }`}
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === cardOrder.length - 1}
                          onClick={() => moveCard(idx, 1)}
                          className={`btn btn-xs btn-ghost btn-square rounded-lg ${
                            idx === cardOrder.length - 1
                              ? "opacity-30 pointer-events-none"
                              : "hover:bg-base-300"
                          }`}
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-base-content/10">
                <button
                  type="button"
                  onClick={resetCardOrder}
                  className="btn btn-sm btn-ghost text-xs text-base-content/60 hover:text-base-content rounded-xl"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={() => setIsReorderModalOpen(false)}
                  className="btn btn-sm btn-primary rounded-xl font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Vital Edit Modal */}
      <AnimatePresence>
        {vitalEditModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-base-100 rounded-3xl border border-base-content/10 shadow-2xl w-full max-w-xs p-5 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-base-content/10">
                <h3 className="font-bold text-sm text-base-content">
                  Edit {vitalEditModal.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setVitalEditModal((prev) => ({ ...prev, isOpen: false }))}
                  className="btn btn-xs btn-ghost btn-circle text-base-content/50"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-base-content/60">
                  Value ({vitalEditModal.unit}) for {dayjs(selectedDate).format("MMM D")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={vitalEditModal.val}
                    onChange={(e) =>
                      setVitalEditModal((prev) => ({ ...prev, val: e.target.value }))
                    }
                    className="input input-bordered w-full font-mono font-bold text-base rounded-2xl pr-12 focus:border-primary"
                    placeholder="0"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-base-content/50">
                    {vitalEditModal.unit}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVitalEditModal((prev) => ({ ...prev, isOpen: false }))}
                  className="btn btn-sm btn-ghost rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomVital}
                  className="btn btn-sm btn-primary rounded-xl text-xs font-bold"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone Expense Modal with initialDate set to selectedDate */}
      <AddTransactionModal
        isOpen={isAddExpenseModalOpen}
        initialDate={selectedDate}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          dispatch(fetchDashboardData(dayjs(selectedDate).format("YYYY-MM")));
        }}
      />

      {/* Food Log Modal with selectedDate */}
      <LogFoodModal
        isOpen={isLogFoodModalOpen}
        onClose={() => setIsLogFoodModalOpen(false)}
        selectedDate={selectedDate}
        initialMeal={selectedMealForModal}
        onFoodLogged={() => {
          fetchFoodDataForDate(selectedDate);
          fetchHabitDataForDate(selectedDate);
        }}
        onOpenCustomFoodModal={() => setIsCustomFoodModalOpen(true)}
      />

      <AddCustomFoodModal
        isOpen={isCustomFoodModalOpen}
        onClose={() => setIsCustomFoodModalOpen(false)}
        onFoodAdded={() => {
          fetchFoodDataForDate(selectedDate);
          fetchHabitDataForDate(selectedDate);
        }}
      />
    </div>
  );
};

export default Dashboard;