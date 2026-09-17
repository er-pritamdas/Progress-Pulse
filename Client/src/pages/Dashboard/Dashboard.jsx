import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { fetchHabitSettings } from "../../services/redux/slice/habitSlice.js";
import { TitleChanger } from "../../utils/TitleChanger.jsx";
import axiosInstance from "../../Context/AxiosInstance.jsx";
import {
  Quote,
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
  ArrowUpRight,
  LayoutGrid,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LogFoodModal from "../../components/Dashboard/Habit/FoodLogging/LogFoodModal.jsx";
import AddCustomFoodModal from "../../components/Dashboard/Habit/FoodLogging/AddCustomFoodModal.jsx";

const Dashboard = () => {
  TitleChanger("Progress Pulse | Dashboard");
  const dispatch = useDispatch();
  const user = localStorage.getItem("username");
  const navigate = useNavigate();
  const habitState = useSelector((state) => state.habit || {});
  const settings = habitState.settings || {};

  // State - Habit
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [todayHabits, setTodayHabits] = useState(null);
  const [loadingHabits, setLoadingHabits] = useState(true);

  // State - Food
  const [todayFoodData, setTodayFoodData] = useState({
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
  const [loadingFood, setLoadingFood] = useState(true);
  const [isLogFoodModalOpen, setIsLogFoodModalOpen] = useState(false);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [selectedMealForModal, setSelectedMealForModal] = useState("Breakfast");

  // State - Expense Pulse
  const [expenseData, setExpenseData] = useState({
    todaySpend: 0,
    monthSpend: 0,
    monthlySalary: 0,
    recentTransactions: [],
  });
  const [loadingExpense, setLoadingExpense] = useState(true);

  // State - Investment Pulse
  const [investmentData, setInvestmentData] = useState({
    totalInvested: 0,
    stocksCount: 0,
    mfCount: 0,
    fdCount: 0,
  });
  const [loadingInvestment, setLoadingInvestment] = useState(true);

  // Quotes Database
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Your future is found in your daily routine.", author: "John C. Maxwell" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
  ];

  const getTodayDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // 0. Fetch user settings
    dispatch(fetchHabitSettings());

    // 1. Set Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // 2. Set Random Quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);

    // 3. Fetch Today's Habit Data
    fetchTodayData();

    // 4. Fetch Today's Food Data
    fetchTodayFoodData();

    // 5. Fetch Today's Expense Pulse
    fetchExpenseData();

    // 6. Fetch Today's Investment Pulse
    fetchInvestmentData();
  }, []);

  const fetchExpenseData = async () => {
    try {
      setLoadingExpense(true);
      const currentMonth = dayjs().format("YYYY-MM");
      const todayStr = getTodayDateStr();

      const res = await axiosInstance.get("/v1/dashboard/expense/get-all-data", {
        params: { month: currentMonth },
      });

      if (res.data?.data) {
        const { transactions = [], salary = 0 } = res.data.data;
        const debits = transactions.filter((t) => t.type === "Debit");
        const monthSpend = debits.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const todayDebits = debits.filter((t) => {
          if (!t.date) return false;
          return t.date.slice(0, 10) === todayStr;
        });
        const todaySpend = todayDebits.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        const recent = [...debits].reverse().slice(0, 3);

        setExpenseData({
          todaySpend,
          monthSpend,
          monthlySalary: Number(salary) || 0,
          recentTransactions: recent,
        });
      }
    } catch (error) {
      console.error("Error fetching expense summary on dashboard:", error);
    } finally {
      setLoadingExpense(false);
    }
  };

  const fetchInvestmentData = async () => {
    try {
      setLoadingInvestment(true);
      const [stocksRes, mfRes, fdRes] = await Promise.allSettled([
        axiosInstance.get("/v1/dashboard/investment/stocks"),
        axiosInstance.get("/v1/dashboard/investment/mf"),
        axiosInstance.get("/v1/dashboard/investment/fd"),
      ]);

      let totalInvested = 0;
      let stocksCount = 0;
      let mfCount = 0;
      let fdCount = 0;

      if (stocksRes.status === "fulfilled" && Array.isArray(stocksRes.value?.data?.data)) {
        const stocks = stocksRes.value.data.data;
        stocksCount = stocks.length;
        stocks.forEach((s) => {
          const qty = Number(s.quantity) || 0;
          const price = Number(s.bPrice || s.buyPrice || s.currentPrice) || 0;
          totalInvested += qty * price;
        });
      }

      if (mfRes.status === "fulfilled" && Array.isArray(mfRes.value?.data?.data)) {
        const mfs = mfRes.value.data.data;
        mfCount = mfs.length;
        mfs.forEach((m) => {
          const invested = Number(m.totalInvestment || m.currentValue || 0);
          totalInvested += invested;
        });
      }

      if (fdRes.status === "fulfilled" && Array.isArray(fdRes.value?.data?.data)) {
        const fds = fdRes.value.data.data;
        fdCount = fds.length;
        fds.forEach((f) => {
          const principal = Number(f.principalAmount || f.amount || 0);
          totalInvested += principal;
        });
      }

      setInvestmentData({
        totalInvested: Math.round(totalInvested),
        stocksCount,
        mfCount,
        fdCount,
      });
    } catch (error) {
      console.error("Error fetching investment summary on dashboard:", error);
    } finally {
      setLoadingInvestment(false);
    }
  };

  const fetchTodayData = async () => {
    try {
      setLoadingHabits(true);
      const dateString = getTodayDateStr();

      const res = await axiosInstance.get("/v1/dashboard/habit/table-entry", {
        params: {
          startDate: dateString,
          endDate: dateString,
        },
      });

      const entries = res.data.data.formattedEntries;
      if (entries && entries.length > 0) {
        setTodayHabits(entries[0]);
      } else {
        setTodayHabits(null);
      }
    } catch (error) {
      console.error("Error fetching today's habits:", error);
    } finally {
      setLoadingHabits(false);
    }
  };

  const fetchTodayFoodData = async () => {
    try {
      setLoadingFood(true);
      const dateString = getTodayDateStr();
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: dateString },
      });
      if (res.data?.data) {
        setTodayFoodData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching today's food logs:", error);
    } finally {
      setLoadingFood(false);
    }
  };

  const openLogFoodModal = (mealType = "Breakfast") => {
    setSelectedMealForModal(mealType);
    setIsLogFoodModalOpen(true);
  };

  // Safe Checks & Data Parsing for Habit
  const burned = todayHabits?.burned || 0;
  const intake = todayHabits?.intake || 0;
  const water = todayHabits?.water || 0;
  const sleep = todayHabits?.sleep || 0;
  const read = todayHabits?.read || 0;
  const mood = todayHabits?.mood || "—";
  const progress = todayHabits?.progress || 0;
  const score = todayHabits?.score || 0;

  const selfCareRaw = todayHabits?.selfcare || "";
  const selfCareCount = selfCareRaw.replace(/_/g, "").length;

  const settingsIntake = settings?.intake;
  const maintenanceCalories = habitState.maintenanceCalories || 2000;
  const calorieMin =
    settingsIntake?.min ||
    (maintenanceCalories ? Math.round(maintenanceCalories * 0.9) : 1500);
  const calorieMax =
    settingsIntake?.max ||
    (maintenanceCalories ? Math.round(maintenanceCalories * 1.1) : 2500);

  const getMacroRatios = () => {
    try {
      const saved = localStorage.getItem("macro_ratios");
      return saved ? JSON.parse(saved) : { protein: 30, carbs: 40, fats: 30 };
    } catch (e) {
      return { protein: 30, carbs: 40, fats: 30 };
    }
  };

  const macroRatios = getMacroRatios();

  const proteinMin = settings?.protein?.min || Math.round((calorieMin * (macroRatios.protein / 100)) / 4);
  const proteinMax = settings?.protein?.max || settings?.proteinTarget || Math.round((calorieMax * (macroRatios.protein / 100)) / 4);

  const carbsMin = settings?.carbs?.min || Math.round((calorieMin * (macroRatios.carbs / 100)) / 4);
  const carbsMax = settings?.carbs?.max || settings?.carbsTarget || Math.round((calorieMax * (macroRatios.carbs / 100)) / 4);

  const fatMin = settings?.fat?.min || Math.round((calorieMin * (macroRatios.fats / 100)) / 9);
  const fatMax = settings?.fat?.max || settings?.fatTarget || Math.round((calorieMax * (macroRatios.fats / 100)) / 9);

  const loggedCalories = todayFoodData?.summary?.totalCalories || 0;
  const caloriePercent = Math.min(100, Math.round((loggedCalories / calorieMax) * 100));

  const loggedProtein = todayFoodData?.summary?.totalProtein || 0;
  const proteinPercent = Math.min(100, Math.round((loggedProtein / proteinMax) * 100));

  const loggedCarbs = todayFoodData?.summary?.totalCarbs || 0;
  const carbsPercent = Math.min(100, Math.round((loggedCarbs / carbsMax) * 100));

  const loggedFat = todayFoodData?.summary?.totalFat || 0;
  const fatPercent = Math.min(100, Math.round((loggedFat / fatMax) * 100));

  // Daily Pulse Composite Score Calculation
  const habitScore = progress || 0;
  const budgetSafePercent =
    expenseData.monthlySalary > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((expenseData.monthlySalary - expenseData.monthSpend) /
                expenseData.monthlySalary) *
                100
            )
          )
        )
      : expenseData.monthSpend > 0
      ? 75
      : 100;

  const overallPulseScore = Math.round(
    habitScore * 0.55 + budgetSafePercent * 0.45
  );

  const totalHoldingsCount =
    (investmentData.stocksCount || 0) +
    (investmentData.mfCount || 0) +
    (investmentData.fdCount || 0);

  return (
    <div className="min-h-screen bg-base-100 font-sans selection:bg-primary/30 selection:text-primary pb-20">

      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 pt-4 sm:pt-8 md:pt-12 space-y-6 sm:space-y-10 md:space-y-12">

        {/* 1. Hero Header Section */}
        <header className="flex flex-col items-center text-center space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in-down">
          {/* Date Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-base-200/50 border border-base-content/5 backdrop-blur-md shadow-sm">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-base-content/60 tracking-wide">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Greeting */}
          <div className="space-y-2 sm:space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-base-content leading-tight">
              {greeting}, <br className="sm:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x">
                {user}
              </span>
              <span className="text-primary">.</span>
            </h1>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto px-2"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-base-content/50">
                <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 rotate-180 shrink-0" />
                <p className="text-xs sm:text-base md:text-lg font-serif italic text-base-content/70">
                  {quote.text}
                </p>
                <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-50 shrink-0" />
              </div>
            </motion.div>
          </div>
        </header>

        {/* 2. Daily Pulse Executive Dashboard */}
        <section className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Executive Hero Pulse Score Banner */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-base-100/90 to-secondary/10 backdrop-blur-xl border border-primary/20 shadow-xl"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
                {/* Left: Score Ring + Motivational message */}
                <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto">
                  <div className="relative shrink-0 flex items-center justify-center">
                    <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="34"
                        className="stroke-base-content/10"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="34"
                        className="stroke-primary transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - overallPulseScore / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl font-black text-base-content">{overallPulseScore}%</span>
                      <span className="text-[9px] uppercase font-bold text-base-content/50 tracking-wider">Pulse</span>
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                      <Sparkles size={12} />
                      <span>Daily Pulse Overview</span>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-base-content truncate">
                      {overallPulseScore >= 70
                        ? "Thriving Rhythm!"
                        : overallPulseScore >= 40
                        ? "Building Momentum"
                        : "Ready for a Fresh Start"}
                    </h3>
                    <p className="text-xs sm:text-sm text-base-content/60 line-clamp-2">
                      Habits {habitScore}% complete • Budget safe ratio {budgetSafePercent}% • {totalHoldingsCount} tracked assets
                    </p>
                  </div>
                </div>

                {/* Right: Quick Action Triggers */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => openLogFoodModal("Breakfast")}
                    className="btn btn-sm btn-primary rounded-xl gap-1.5 shadow-md hover:scale-105 transition-transform"
                  >
                    <Plus size={15} /> Log Meal
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/expense/transaction')}
                    className="btn btn-sm btn-outline btn-primary rounded-xl gap-1.5 hover:scale-105 transition-transform"
                  >
                    <CreditCard size={15} /> Add Expense
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/habit/table-entry')}
                    className="btn btn-sm btn-ghost bg-base-200/60 rounded-xl gap-1.5 hover:bg-base-200"
                  >
                    <Table size={15} /> Habits Table
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/investment/stocks')}
                    className="btn btn-sm btn-ghost bg-base-200/60 rounded-xl gap-1.5 hover:bg-base-200"
                  >
                    <TrendingUp size={15} /> Portfolio
                  </button>
                </div>
              </div>
            </motion.div>

            {/* The Three Pillars Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Pillar 1: Health & Habits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-emerald-500/10 via-base-100/80 to-base-200/50 backdrop-blur-xl border border-emerald-500/20 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30">
                        <Heart size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-base-content">Health & Habits</h3>
                        <p className="text-[11px] text-base-content/50">Daily physical vitals</p>
                      </div>
                    </div>
                    <span className="badge badge-sm font-bold bg-emerald-500/20 text-emerald-500 border-none">
                      {progress}% Done
                    </span>
                  </div>

                  {/* Nutrition Progress */}
                  <div className="space-y-2 mb-4 p-3 rounded-2xl bg-base-200/40 border border-base-content/5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-semibold text-base-content/70">Calories</span>
                      <span className="font-bold font-mono text-emerald-500">
                        {loggedCalories} <span className="text-[10px] text-base-content/40">/ {calorieMax} kcal</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-base-content/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${caloriePercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-base-content/60 pt-1 font-medium">
                      <span>P: {loggedProtein}g</span>
                      <span>C: {loggedCarbs}g</span>
                      <span>F: {loggedFat}g</span>
                    </div>
                  </div>

                  {/* Vitals Summary Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-base-200/30 border border-base-content/5">
                      <Droplet size={14} className="mx-auto text-cyan-500 mb-1" />
                      <div className="font-bold text-base-content">{water} L</div>
                      <div className="text-[9px] text-base-content/40 uppercase">Water</div>
                    </div>
                    <div className="p-2 rounded-xl bg-base-200/30 border border-base-content/5">
                      <Moon size={14} className="mx-auto text-indigo-500 mb-1" />
                      <div className="font-bold text-base-content">{sleep} h</div>
                      <div className="text-[9px] text-base-content/40 uppercase">Sleep</div>
                    </div>
                    <div className="p-2 rounded-xl bg-base-200/30 border border-base-content/5">
                      <Flame size={14} className="mx-auto text-orange-500 mb-1" />
                      <div className="font-bold text-base-content">{burned}</div>
                      <div className="text-[9px] text-base-content/40 uppercase">Burned</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-base-content/5">
                  <button
                    onClick={() => openLogFoodModal("Breakfast")}
                    className="btn btn-xs sm:btn-sm btn-ghost bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-xl flex-1 font-bold text-xs"
                  >
                    + Log Meal
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/habit/table-entry')}
                    className="btn btn-xs sm:btn-sm btn-ghost hover:bg-base-200 rounded-xl text-base-content/70 text-xs gap-1"
                  >
                    Habit Table <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>

              {/* Pillar 2: Expenses & Budget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-indigo-500/10 via-base-100/80 to-base-200/50 backdrop-blur-xl border border-indigo-500/20 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-500 ring-1 ring-indigo-500/30">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-base-content">Expenses & Budget</h3>
                        <p className="text-[11px] text-base-content/50">Cashflow tracking</p>
                      </div>
                    </div>
                    <span className="badge badge-sm font-bold bg-indigo-500/20 text-indigo-500 border-none">
                      ₹{expenseData.todaySpend.toLocaleString('en-IN')} Today
                    </span>
                  </div>

                  {/* Monthly Spend Metric */}
                  <div className="space-y-2 mb-4 p-3 rounded-2xl bg-base-200/40 border border-base-content/5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-base-content/70">Month Debits</span>
                      <span className="text-base sm:text-lg font-extrabold text-indigo-500">
                        ₹{expenseData.monthSpend.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {expenseData.monthlySalary > 0 ? (
                      <>
                        <div className="w-full h-2 bg-base-content/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((expenseData.monthSpend / expenseData.monthlySalary) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-base-content/60 font-medium">
                          <span>Salary: ₹{expenseData.monthlySalary.toLocaleString('en-IN')}</span>
                          <span>Safe: {budgetSafePercent}%</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] text-base-content/50 italic">
                        Configure monthly income in Expense settings
                      </p>
                    )}
                  </div>

                  {/* Recent Transactions List */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-1">
                      Recent Outflows
                    </div>
                    {expenseData.recentTransactions.length > 0 ? (
                      expenseData.recentTransactions.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center px-2.5 py-1 rounded-xl bg-base-200/30 text-xs">
                          <span className="truncate max-w-[120px] font-medium text-base-content/80">
                            {t.title || t.category || "Expense"}
                          </span>
                          <span className="font-mono font-bold text-error text-[11px]">
                            -₹{Number(t.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-2 text-[11px] text-base-content/40 italic">
                        No transactions recorded this month
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-base-content/5">
                  <button
                    onClick={() => navigate('/dashboard/expense/transaction')}
                    className="btn btn-xs sm:btn-sm btn-ghost bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 rounded-xl flex-1 font-bold text-xs"
                  >
                    + Add Expense
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/expense/dashboard')}
                    className="btn btn-xs sm:btn-sm btn-ghost hover:bg-base-200 rounded-xl text-base-content/70 text-xs gap-1"
                  >
                    Budget <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>

              {/* Pillar 3: Investments & Growth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-amber-500/10 via-base-100/80 to-base-200/50 backdrop-blur-xl border border-amber-500/20 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-base-content">Investments</h3>
                        <p className="text-[11px] text-base-content/50">Portfolio growth</p>
                      </div>
                    </div>
                    <span className="badge badge-sm font-bold bg-amber-500/20 text-amber-500 border-none">
                      {totalHoldingsCount} Assets
                    </span>
                  </div>

                  {/* Portfolio Value Metric */}
                  <div className="space-y-1.5 mb-4 p-3 rounded-2xl bg-base-200/40 border border-base-content/5">
                    <span className="text-xs font-semibold text-base-content/70">Total Capital Tracked</span>
                    <div className="text-xl sm:text-2xl font-black text-amber-500">
                      ₹{investmentData.totalInvested.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-base-content/50">Across Stocks, Mutual Funds & FDs</p>
                  </div>

                  {/* Asset Allocation Counts */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-base-200/30 border border-base-content/5">
                      <div className="font-bold text-base-content">{investmentData.stocksCount}</div>
                      <div className="text-[9px] text-base-content/50 uppercase">Stocks</div>
                    </div>
                    <div className="p-2 rounded-xl bg-base-200/30 border border-base-content/5">
                      <div className="font-bold text-base-content">{investmentData.mfCount}</div>
                      <div className="text-[9px] text-base-content/50 uppercase">Funds</div>
                    </div>
                    <div className="p-2 rounded-xl bg-base-200/30 border border-base-content/5">
                      <div className="font-bold text-base-content">{investmentData.fdCount}</div>
                      <div className="text-[9px] text-base-content/50 uppercase">FDs</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-base-content/5">
                  <button
                    onClick={() => navigate('/dashboard/investment/stocks')}
                    className="btn btn-xs sm:btn-sm btn-ghost bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-xl flex-1 font-bold text-xs"
                  >
                    View Stocks
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/investment/mf')}
                    className="btn btn-xs sm:btn-sm btn-ghost hover:bg-base-200 rounded-xl text-base-content/70 text-xs gap-1"
                  >
                    Funds <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Quick Trackers Direct Access */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-4 sm:p-6 rounded-3xl bg-base-100/60 backdrop-blur-xl border border-base-content/10 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={18} className="text-primary" />
                  <span className="font-bold text-sm sm:text-base text-base-content">Explore Your Trackers</span>
                </div>
                <span className="text-xs text-base-content/50">Direct module navigation</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('/dashboard/habit/table-entry')}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/40 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-base-content/5 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                      <Heart size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-base-content group-hover:text-emerald-500 transition-colors">Habit Tracker</div>
                      <div className="text-[11px] text-base-content/50">Table Entry & Analytics</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-base-content/40 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/dashboard/expense/dashboard')}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/40 hover:bg-indigo-500/10 hover:border-indigo-500/20 border border-base-content/5 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-base-content group-hover:text-indigo-500 transition-colors">Expense Tracker</div>
                      <div className="text-[11px] text-base-content/50">Budget & Outflows</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-base-content/40 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/dashboard/investment/stocks')}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-base-200/40 hover:bg-amber-500/10 hover:border-amber-500/20 border border-base-content/5 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-base-content group-hover:text-amber-500 transition-colors">Investment Tracker</div>
                      <div className="text-[11px] text-base-content/50">Stocks, Funds & FDs</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-base-content/40 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>
              </div>
            </motion.div>
          </section>
        </div>

        {/* Modals for Food Logging on Home */}
        <LogFoodModal
          isOpen={isLogFoodModalOpen}
          onClose={() => setIsLogFoodModalOpen(false)}
          selectedDate={getTodayDateStr()}
          initialMeal={selectedMealForModal}
          onFoodLogged={() => {
            fetchTodayFoodData();
            fetchTodayData();
          }}
          onOpenCustomFoodModal={() => setIsCustomFoodModalOpen(true)}
        />

        <AddCustomFoodModal
          isOpen={isCustomFoodModalOpen}
          onClose={() => setIsCustomFoodModalOpen(false)}
          onFoodAdded={() => {
            fetchTodayFoodData();
            fetchTodayData();
          }}
        />
      </div>
    );
  };

  export default Dashboard;