import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setHabitFilters, resetHabitFilters, setHabitYearAndMonth } from "../../../services/redux/slice/habitSlice";
import HabitDateQuickSelect from "../../../components/Dashboard/Habit/HabitDateQuickSelect.jsx";
import { TitleChanger } from "../../../utils/TitleChanger";
import LongestStreakCard from "../../../components/Dashboard/Habit/HabitDashboardPage/LongestStreakCard";
import GoalProgressCard from "../../../components/Dashboard/Habit/HabitDashboardPage/GoalProgressCard";
import HabitScoreCard from "../../../components/Dashboard/Habit/HabitDashboardPage/HabitScoreCard";
import HabitSummaryCard from "../../../components/Dashboard/Habit/HabitDashboardPage/HabitSummaryCard";
import CurrentStreakCard from "../../../components/Dashboard/Habit/HabitDashboardPage/CurrentStreakCard";
import axiosInstance from "../../../Context/AxiosInstance";

// Analysis Components
import CalorieAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/CalorieAnalysis";
import WaterAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/WaterAnalysis";
import SleepAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/SleepAnalysis";
import ReadAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/ReadAnalysis";

import { Flame, Droplet, Moon, BookOpen, Smile, Heart, Book, ChevronDown, ChevronUp, Trophy, Apple, Calendar, Filter, X } from "lucide-react";
import MoodAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/MoodAnalysis.jsx";
import SelfCareAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/SelfCareAnalysis.jsx";
import ScoreAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/ScoreAnalysis.jsx";
import NutrientAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/NutrientAnalysis.jsx";

function HabitDashboard() {
  TitleChanger("Progress Pulse | Habit Dashboard");

  const dispatch = useDispatch();
  const { fromDate, toDate } = useSelector((state) => state.habit.filters);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [habitData, setHabitData] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0)
  const [activeTab, setActiveTab] = useState('calorie');
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mobileCalendarView, setMobileCalendarView] = useState("from"); // "from" | "to" | null

  const [nutrientCategory, setNutrientCategory] = useState("Macronutrients");
  const [waterMin, setWaterMin] = useState(0);
  const [waterMax, setWaterMax] = useState(100);
  const [sleepMin, setSleepMin] = useState(0);
  const [sleepMax, setSleepMax] = useState(0);
  const [readMin, setReadMin] = useState(0);
  const [readMax, setReadMax] = useState(0);
  const [ConsumedCalorieMax, setConsumedCalorieMax] = useState(0);
  const [ConsumedCalorieMin, setConsumedCalorieMin] = useState(0);
  const [BurnedCalorieMax, setBurnedCalorieMax] = useState(0);
  const [BurnedCalorieMin, setBurnedCalorieMin] = useState(0);
  const [basalMetabolicRate, setbasalMetabolicRate] = useState(0);
  const [moodList, setMoodList] = useState([]);
  const [selfCareList, setSelfCareList] = useState([]);

  const DASHBOARD_TABS = [
    {
      id: "calorie",
      label: "Calorie",
      icon: Flame,
      color: "text-red-500",
      activeBorder: "border-red-500/50 dark:border-red-500/40",
      activeBg: "bg-red-500/[0.05] dark:bg-red-500/[0.08]",
      activeDot: "bg-red-500",
      badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400",
    },
    {
      id: "water",
      label: "Water",
      icon: Droplet,
      color: "text-sky-500",
      activeBorder: "border-sky-500/50 dark:border-sky-500/40",
      activeBg: "bg-sky-500/[0.05] dark:bg-sky-500/[0.08]",
      activeDot: "bg-sky-500",
      badgeClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    },
    {
      id: "sleep",
      label: "Sleep",
      icon: Moon,
      color: "text-indigo-500",
      activeBorder: "border-indigo-500/50 dark:border-indigo-500/40",
      activeBg: "bg-indigo-500/[0.05] dark:bg-indigo-500/[0.08]",
      activeDot: "bg-indigo-500",
      badgeClass: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    },
    {
      id: "read",
      label: "Read",
      icon: BookOpen,
      color: "text-amber-500",
      activeBorder: "border-amber-500/50 dark:border-amber-500/40",
      activeBg: "bg-amber-500/[0.05] dark:bg-amber-500/[0.08]",
      activeDot: "bg-amber-500",
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      id: "selfcare",
      label: "Self Care",
      icon: Heart,
      color: "text-rose-500",
      activeBorder: "border-rose-500/50 dark:border-rose-500/40",
      activeBg: "bg-rose-500/[0.05] dark:bg-rose-500/[0.08]",
      activeDot: "bg-rose-500",
      badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    },
    {
      id: "mood",
      label: "Mood",
      icon: Smile,
      color: "text-purple-500",
      activeBorder: "border-purple-500/50 dark:border-purple-500/40",
      activeBg: "bg-purple-500/[0.05] dark:bg-purple-500/[0.08]",
      activeDot: "bg-purple-500",
      badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    },
    {
      id: "scores",
      label: "Scores",
      icon: Trophy,
      color: "text-yellow-500",
      activeBorder: "border-yellow-500/50 dark:border-yellow-500/40",
      activeBg: "bg-yellow-500/[0.05] dark:bg-yellow-500/[0.08]",
      activeDot: "bg-yellow-500",
      badgeClass: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    },
    {
      id: "nutrients",
      label: "Nutrients",
      icon: Apple,
      color: "text-emerald-500",
      activeBorder: "border-emerald-500/50 dark:border-emerald-500/40",
      activeBg: "bg-emerald-500/[0.05] dark:bg-emerald-500/[0.08]",
      activeDot: "bg-emerald-500",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
  ];

  const activeTabObj = DASHBOARD_TABS.find((t) => t.id === activeTab) || DASHBOARD_TABS[0];
  const ActiveIcon = activeTabObj.icon;

  // Format Date Function (DD-MMM-YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const resetFilters = () => {
    dispatch(resetHabitFilters());
  };

  const now = new Date();
  const currentSystemYear = now.getFullYear();

  const getYearAndMonth = () => {
    if (!fromDate || !toDate) return { year: currentSystemYear, month: "all" };

    const fromParts = fromDate.split("-").map(Number);
    const toParts = toDate.split("-").map(Number);

    if (fromParts.length !== 3 || toParts.length !== 3) {
      return { year: currentSystemYear, month: "all" };
    }

    const [fromYear, fromMonthNum, fromDay] = fromParts;
    const [toYear, toMonthNum, toDay] = toParts;

    const fromMonth = fromMonthNum - 1;
    const toMonth = toMonthNum - 1;

    const lastDayOfToMonth = new Date(toYear, toMonth + 1, 0).getDate();

    if (fromYear === toYear) {
      if (fromMonth === 0 && fromDay === 1 && toMonth === 11 && toDay === 31) {
        return { year: fromYear, month: "all" };
      }
      if (fromMonth === toMonth && fromDay === 1 && toDay === lastDayOfToMonth) {
        return { year: fromYear, month: fromMonth };
      }
    }
    return { year: fromYear || currentSystemYear, month: "custom" };
  };

  const { year: activeYear, month: activeMonth } = getYearAndMonth();
  const years = Array.from({ length: 11 }, (_, i) => currentSystemYear - 5 + i);

  const months = [
    { label: "Whole Year", value: "all" },
    { label: "January", value: 0 },
    { label: "February", value: 1 },
    { label: "March", value: 2 },
    { label: "April", value: 3 },
    { label: "May", value: 4 },
    { label: "June", value: 5 },
    { label: "July", value: 6 },
    { label: "August", value: 7 },
    { label: "September", value: 8 },
    { label: "October", value: 9 },
    { label: "November", value: 10 },
    { label: "December", value: 11 },
  ];

  const fetchHabitSettings = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/habit/settings");
      setWaterMin(res.data.data.settings.water.min);
      setWaterMax(res.data.data.settings.water.max);
      setSleepMin(res.data.data.settings.sleep.min);
      setSleepMax(res.data.data.settings.sleep.max);
      setReadMin(res.data.data.settings.read?.min || 0);
      setReadMax(res.data.data.settings.read?.max || 24);
      setConsumedCalorieMax(res.data.data.settings.intake.max);
      setConsumedCalorieMin(res.data.data.settings.intake.min);
      setBurnedCalorieMax(res.data.data.settings.burned.max);
      setBurnedCalorieMin(res.data.data.settings.burned.min);
      setbasalMetabolicRate(res.data.data.bmr);
      setMoodList(res.data.data.settings.mood || []);
      setSelfCareList(res.data.data.settings.selfcare || []);
    } catch (err) {
      console.error("Error fetching heatmap Settings data:", err);
    }
  };

  const fetchData = async () => {
    try {
      setDashboardLoading(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/table-entry", {
        params: {
          startDate: fromDate,
          endDate: toDate,
        },
      });
      setHabitData(res.data.data.formattedEntries);
      setTotalEntries(res.data.data.totalEntries);
    } catch (err) {
      console.error("Error fetching heatmap data:", err);
      if (err.response && (err.response.status === 404 || err.response.status === 400)) {
        setHabitData([]);
        setTotalEntries(0);
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchHabitSettings();
  }, []);



  return (
    <div className="w-full pb-20">
      {/* Sticky Heading - Desktop View (Hidden on Phone) */}
      <div className="hidden md:block sticky top-0 z-40 bg-base-100/95 backdrop-blur-md shadow-md border-b border-base-300/40 px-4 py-2">
        {/* Top Row: Heading and Filter Controls */}
        <div className="flex items-center justify-between p-3 flex-wrap gap-3 max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="dropdown dropdown-bottom">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost text-lg font-bold p-0 min-h-0 h-auto hover:bg-base-200/70 px-2.5 py-1 rounded-xl flex items-center gap-2 transition-all border border-base-300/40 shadow-xs"
              >
                <ActiveIcon className={`${activeTabObj.color} w-5 h-5`} />
                <span>{activeTabObj.label}</span>
                <ChevronDown className="w-4 h-4 opacity-60 ml-0.5" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-56 z-[100] mt-2 border border-base-300/50"
              >
                <li className="menu-title text-xs font-bold text-base-content/50 uppercase tracking-wider px-3 py-1">
                  Select Dashboard
                </li>
                {DASHBOARD_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <li key={tab.id}>
                      <button
                        className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all font-medium ${
                          isActive
                            ? "bg-primary text-primary-content font-bold shadow-md"
                            : "hover:bg-base-200"
                        }`}
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                        }}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-primary-content" : tab.color}`} />
                        <span>{tab.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <span className="text-lg font-bold text-base-content/80">Dashboard</span>

            {activeTab === "nutrients" && (
              <div className="flex items-center gap-1.5">
                <span className="text-base font-medium text-base-content/60 px-0.5">for</span>
                <div className="dropdown dropdown-bottom">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost text-lg font-bold p-0 min-h-0 h-auto hover:bg-base-200/70 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all border border-primary/30 shadow-xs text-primary"
                  >
                    <span>{nutrientCategory}</span>
                    <ChevronDown className="w-4 h-4 opacity-60 ml-0.5" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow-2xl bg-base-100/95 backdrop-blur-md rounded-2xl w-52 z-[100] mt-2 border border-base-300/50"
                  >
                    <li className="menu-title text-xs font-bold text-base-content/50 uppercase tracking-wider px-3 py-1">
                      Nutrient Category
                    </li>
                    {["Macronutrients", "Vitamins", "Minerals", "Fatty Acids", "Others"].map((cat) => (
                      <li key={cat}>
                        <button
                          className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all font-medium ${
                            nutrientCategory === cat
                              ? "bg-primary text-primary-content font-bold shadow-md"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => {
                            setNutrientCategory(cat);
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                          }}
                        >
                          <span>{cat}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Select (Year & Month) + From/To Date Pickers */}
          <div className="flex items-center gap-4 ml-auto flex-wrap">
            {/* Quick Year and Month Select */}
            <HabitDateQuickSelect />

            {/* FROM DATE PICKER */}
            <div className="dropdown dropdown-end floating-label">
              <div tabIndex={0} role="button" className="input text-xs w-[125px] flex items-center justify-center font-medium">
                {formatDate(fromDate) || "-- / --- / --"}
              </div>
              <span>From Date</span>
              <div className="dropdown-content z-[999] bg-base-100 rounded-box shadow-sm p-2">
                <calendar-date
                  class="cally"
                  onchange={(e) => dispatch(setHabitFilters({ fromDate: e.target.value }))}
                >
                  <svg
                    aria-label="Previous"
                    className="fill-current size-4"
                    slot="previous"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                  </svg>
                  <svg
                    aria-label="Next"
                    className="fill-current size-4"
                    slot="next"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                  </svg>
                  <calendar-month></calendar-month>
                </calendar-date>
              </div>
            </div>
            {/* TO DATE PICKER */}
            <div className="dropdown dropdown-end floating-label">
              <div tabIndex={0} role="button" className="input text-xs w-[125px] flex items-center justify-center font-medium">
                {formatDate(toDate) || "-- / --- / --"}
              </div>
              <span>To Date</span>
              <div className="dropdown-content z-[999] bg-base-100 rounded-box shadow-sm p-2">
                <calendar-date
                  class="cally"
                  onchange={(e) => dispatch(setHabitFilters({ toDate: e.target.value }))}
                >
                  <svg
                    aria-label="Previous"
                    className="fill-current size-4"
                    slot="previous"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                  </svg>
                  <svg
                    aria-label="Next"
                    className="fill-current size-4"
                    slot="next"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                  </svg>
                  <calendar-month></calendar-month>
                </calendar-date>
              </div>
            </div>
            {/* BUTTONS */}
            <div className="join">
              <button
                className=" join-item btn btn-soft btn-sm btn-success"
                onClick={fetchData}
              >
                Filter
              </button>
              <button
                className="join-item btn btn-sm btn-soft"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Header - Mobile Phone View (Hidden on Desktop) */}
      <div className="block md:hidden sticky top-0 z-40 bg-base-100/95 dark:bg-base-900/95 backdrop-blur-md border-b border-base-300 px-3 py-2 shadow-xs space-y-2">
        {/* Row 1: Active Category Badge + Compact Date Filter Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-base-200 border border-base-300/60 shadow-xs">
            <ActiveIcon className={`${activeTabObj.color} w-4 h-4 shrink-0`} />
            <span className="font-bold text-xs tracking-tight text-base-content">{activeTabObj.label}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="btn btn-xs h-7 px-2.5 rounded-xl font-medium bg-base-200 hover:bg-base-300 border border-base-300/80 shadow-xs flex items-center gap-1.5 text-xs text-base-content cursor-pointer"
            title="Filter by Date"
          >
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[140px] font-semibold text-[11px]">
              {fromDate && toDate ? `${formatDate(fromDate)} - ${formatDate(toDate)}` : "Select Date"}
            </span>
            <Filter className="w-3 h-3 opacity-60 shrink-0" />
          </button>
        </div>

        {/* Row 2: Horizontal Scrollable Category Boxes with Watermark Background Icon (Phone View Only) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group relative shrink-0 min-w-[100px] max-w-[130px] h-14 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between p-2.5 text-left select-none overflow-hidden ${
                  isActive
                    ? `border ${tab.activeBorder} ${tab.activeBg} shadow-2xs scale-[1.01]`
                    : "border border-base-content/8 hover:border-base-content/15 bg-base-100/50 dark:bg-base-200/25 hover:bg-base-200/50 shadow-2xs"
                }`}
              >
                {/* Enlarged Watermark Background Icon */}
                <div className="absolute -right-2 -bottom-2.5 pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                  <Icon
                    size={52}
                    strokeWidth={1.5}
                    className={`transition-all duration-200 ${
                      isActive
                        ? `${tab.color} opacity-20 dark:opacity-25`
                        : "text-base-content opacity-10 dark:opacity-12 group-hover:opacity-16"
                    }`}
                  />
                </div>

                {/* Top: Status indicator & Category Badge */}
                <div className="flex items-center justify-between z-10">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isActive
                        ? `${tab.activeDot} ring-2 ring-current/20 scale-110`
                        : "bg-base-content/30"
                    }`}
                  />
                  {isActive && (
                    <span className={`badge badge-2xs text-[9px] font-black tracking-tight px-1 py-0.5 rounded-md border-0 ${tab.badgeClass}`}>
                      Active
                    </span>
                  )}
                </div>

                {/* Bottom: Label */}
                <div className="z-10 leading-none">
                  <span
                    className={`text-xs font-black tracking-tight block truncate transition-colors ${
                      isActive ? tab.color : "text-base-content/85 group-hover:text-base-content"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Date Filter Modal Popup (Phone View Only - Desktop View Untouched) */}
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="bg-base-100 rounded-t-3xl sm:rounded-2xl border border-base-300 shadow-2xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-base-300 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-base-content leading-tight">Filter Date Range</h3>
                  <p className="text-[11px] text-base-content/60 font-medium">Quick select or pick custom dates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:text-base-content cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Select Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider block">
                Quick Select (Year & Month)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-base-content/70 mb-1 block">Year</label>
                  <select
                    className="select select-sm w-full bg-base-200 border border-base-300 rounded-xl text-xs font-semibold text-base-content focus:border-primary focus:outline-none cursor-pointer"
                    value={activeYear}
                    onChange={(e) => {
                      const selectedYear = Number(e.target.value);
                      const targetMonth = activeMonth === "custom" ? "all" : activeMonth;
                      dispatch(setHabitYearAndMonth({ year: selectedYear, month: targetMonth }));
                    }}
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-base-100 text-base-content">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-base-content/70 mb-1 block">Month</label>
                  <select
                    className="select select-sm w-full bg-base-200 border border-base-300 rounded-xl text-xs font-semibold text-base-content focus:border-primary focus:outline-none cursor-pointer"
                    value={activeMonth}
                    onChange={(e) => {
                      const val = e.target.value === "all" ? "all" : Number(e.target.value);
                      dispatch(setHabitYearAndMonth({ year: activeYear, month: val }));
                    }}
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value} className="bg-base-100 text-base-content">
                        {m.label}
                      </option>
                    ))}
                    {activeMonth === "custom" && (
                      <option value="custom" disabled className="bg-base-100 text-base-content">
                        Custom Range
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Date Range Section with Theme-Matched Calendars */}
            <div className="space-y-2.5 pt-2 border-t border-base-300/60">
              <span className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider block">
                Custom Range (Theme Calendar)
              </span>

              {/* Date Selection Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMobileCalendarView(mobileCalendarView === "from" ? null : "from")}
                  className={`flex flex-col p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    mobileCalendarView === "from"
                      ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                      : "bg-base-200/70 hover:bg-base-200 border-base-300"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60">From Date</span>
                  <span className="text-xs font-bold text-base-content mt-0.5 truncate">
                    {fromDate ? formatDate(fromDate) : "Select date"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileCalendarView(mobileCalendarView === "to" ? null : "to")}
                  className={`flex flex-col p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    mobileCalendarView === "to"
                      ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                      : "bg-base-200/70 hover:bg-base-200 border-base-300"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/60">To Date</span>
                  <span className="text-xs font-bold text-base-content mt-0.5 truncate">
                    {toDate ? formatDate(toDate) : "Select date"}
                  </span>
                </button>
              </div>

              {/* Interactive Theme-Matched Calendar */}
              {mobileCalendarView && (
                <div className="flex flex-col items-center justify-center p-3 bg-base-200/60 rounded-2xl border border-base-300 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between w-full mb-2 px-1">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {mobileCalendarView === "from" ? "Pick Start Date" : "Pick End Date"}
                    </span>
                    <span className="text-[11px] font-semibold text-base-content/70">
                      {mobileCalendarView === "from"
                        ? (fromDate ? formatDate(fromDate) : "None")
                        : (toDate ? formatDate(toDate) : "None")}
                    </span>
                  </div>

                  {mobileCalendarView === "from" ? (
                    <calendar-date
                      class="cally"
                      value={fromDate || undefined}
                      onchange={(e) => {
                        if (e.target.value) {
                          dispatch(setHabitFilters({ fromDate: e.target.value }));
                          if (!toDate || toDate < e.target.value) {
                            dispatch(setHabitFilters({ fromDate: e.target.value, toDate: e.target.value }));
                          }
                        }
                      }}
                    >
                      <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                      </svg>
                      <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                      </svg>
                      <calendar-month></calendar-month>
                    </calendar-date>
                  ) : (
                    <calendar-date
                      class="cally"
                      value={toDate || undefined}
                      min={fromDate || undefined}
                      onchange={(e) => {
                        if (e.target.value) {
                          dispatch(setHabitFilters({ toDate: e.target.value }));
                        }
                      }}
                    >
                      <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                      </svg>
                      <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                      </svg>
                      <calendar-month></calendar-month>
                    </calendar-date>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-base-300">
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setMobileCalendarView("from");
                }}
                className="btn btn-sm btn-ghost border border-base-300 rounded-xl px-4 cursor-pointer text-xs"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  fetchData();
                  setIsMobileFilterOpen(false);
                }}
                className="btn btn-sm btn-primary rounded-xl px-6 font-bold shadow-sm cursor-pointer text-xs"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-2 sm:px-4 md:px-6 w-full max-w-[1600px] mx-auto space-y-3.5 sm:space-y-4 md:space-y-6 mt-4">
      {dashboardLoading ? (
        <div className="h-[60vh] flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : activeTab === 'nutrients' ? (
        <NutrientAnalysis
          habitData={habitData}
          fromDate={fromDate}
          toDate={toDate}
          activeCategoryTab={nutrientCategory}
          setActiveCategoryTab={setNutrientCategory}
        />
      ) : habitData.length > 0 ? (
        <>
            {/* Overview Section */}
            <section className="mb-8 md:mb-12">
            <div 
                className="flex items-center justify-between cursor-pointer mb-3 md:mb-4 hover:bg-base-300/50 p-2 rounded-lg transition-colors"
                onClick={() => setIsOverviewOpen(!isOverviewOpen)}
            >
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">Overview</h2>
                <button className="btn btn-sm btn-ghost btn-circle">
                    {isOverviewOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>
            
            {isOverviewOpen && (
                <div className="grid grid-cols-2 md:grid-cols-15 gap-2.5 sm:gap-3 mb-6 md:mb-8 animate-fade-in-down">
                    <div className="col-span-1 md:col-span-3 bg-base-100 rounded-2xl shadow-sm md:shadow-lg p-3 sm:p-4 md:p-6 border border-base-300/60 md:border-transparent">
                    <HabitSummaryCard
                        habitData={habitData}
                    />
                    </div>
                    <div className="col-span-1 md:col-span-3 bg-base-100 rounded-2xl shadow-sm md:shadow-lg p-3 sm:p-4 md:p-6 border border-base-300/60 md:border-transparent">
                    <CurrentStreakCard
                        habitData={habitData}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                    </div>
                    <div className="col-span-1 md:col-span-3 bg-base-100 rounded-2xl shadow-sm md:shadow-lg p-3 sm:p-4 md:p-6 border border-base-300/60 md:border-transparent">
                    <LongestStreakCard
                        habitData={habitData}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                    </div>
                    <div className="col-span-1 md:col-span-3 bg-base-100 rounded-2xl shadow-sm md:shadow-lg p-3 sm:p-4 md:p-6 border border-base-300/60 md:border-transparent">
                    <GoalProgressCard
                        habitData={habitData}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                    </div>
                    <div className="hidden md:block md:col-span-3 bg-base-100 rounded-2xl shadow-lg p-6">
                    <HabitScoreCard
                        habitData={habitData}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                    </div>
                </div>
            )}
            </section>

            {/* 🔹 ANALYSIS TABS */}


            {/* 🔹 DYNAMIC CONTENT RENDER */}
            <div className="min-h-[500px]">
            {activeTab === 'calorie' && (
                <CalorieAnalysis
                habitData={habitData}
                ConsumedCalorieMax={ConsumedCalorieMax}
                ConsumedCalorieMin={ConsumedCalorieMin}
                BurnedCalorieMax={BurnedCalorieMax}
                BurnedCalorieMin={BurnedCalorieMin}
                basalMetabolicRate={basalMetabolicRate}
                totalEntries={totalEntries}
                fromDate={fromDate}
                toDate={toDate}
                />
            )}

            {activeTab === 'water' && (
                <WaterAnalysis
                habitData={habitData}
                waterMax={waterMax}
                waterMin={waterMin}
                basalMetabolicRate={basalMetabolicRate}
                totalEntries={totalEntries}
                fromDate={fromDate}
                toDate={toDate}
                />
            )}

            {activeTab === 'sleep' && (
                <SleepAnalysis
                habitData={habitData}
                sleepMax={sleepMax}
                sleepMin={sleepMin}
                totalEntries={totalEntries}
                fromDate={fromDate}
                toDate={toDate}
                />
            )}

            {activeTab === 'read' && (
                <ReadAnalysis
                habitData={habitData}
                readMax={readMax}
                readMin={readMin}
                totalEntries={totalEntries}
                fromDate={fromDate}
                toDate={toDate}
                />
            )}

            {activeTab === 'selfcare' && (
                <SelfCareAnalysis
                habitData={habitData}
                selfCareList={selfCareList}
                fromDate={fromDate}
                toDate={toDate}
                />
            )}

            {activeTab === 'mood' && (
                <MoodAnalysis
                habitData={habitData}
                moodList={moodList}
                fromDate={fromDate}
                toDate={toDate}
                />
            )}

            {activeTab === 'scores' && (
              <ScoreAnalysis
                habitData={habitData}
                fromDate={fromDate}
                toDate={toDate}
              />
            )}
            </div>
        </>
      ) : (
          <div className="h-[60vh] flex flex-col items-center justify-center opacity-50">
                <Book className="w-16 h-16 mb-4 text-base-content/30" />
                <h3 className="text-xl font-semibold">No Data Found</h3>
                <p className="text-sm mt-2">Try selecting a different date range or log new habits.</p>
          </div>
      )}
      </div>
    </div>
  );
}

export default HabitDashboard;
