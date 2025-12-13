import { useState, useEffect } from "react";
import { TitleChanger } from "../../../utils/TitleChanger";
import LongestStreakCard from "../../../components/Dashboard/Habit/HabitDashboardPage/LongestStreakCard";
import GoalProgressCard from "../../../components/Dashboard/Habit/HabitDashboardPage/GoalProgressCard";
import HabitScoreCard from "../../../components/Dashboard/Habit/HabitDashboardPage/HabitScoreCard";
import HabitSummaryCard from "../../../components/Dashboard/Habit/HabitDashboardPage/HabitSummaryCard";
import CurrentStreakCard from "../../../components/Dashboard/Habit/HabitDashboardPage/CurrentStreakCard";
import { useLoading } from "../../../Context/LoadingContext";
import axiosInstance from "../../../Context/AxiosInstance";

// Analysis Components
import CalorieAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/CalorieAnalysis";
import WaterAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/WaterAnalysis";
import SleepAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/SleepAnalysis";
import ReadAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/ReadAnalysis";

import { Flame, Droplet, Moon, BookOpen } from "lucide-react";

function HabitDashboard() {
  TitleChanger("Progress Pulse | Habit Dashboard");

  const { setLoading } = useLoading();
  const [habitData, setHabitData] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0)
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

  // 🔹 Tab State
  const [activeTab, setActiveTab] = useState("calorie");


  // Format Date Function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = String(date.getFullYear()).slice(2);
    return `${day}-${month}-${year}`;
  };

  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // add 1 because month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const today = new Date();

  const startDate = formatDateLocal(startOfMonth);
  const endDate = formatDateLocal(today);

  // 🔹 Set in state
  const [fromDate, setFromDate] = useState(startDate);
  const [toDate, setToDate] = useState(endDate);

  const resetFilters = () => {
    setFromDate(startDate);
    setToDate(endDate);
    // Optionally re-fetch or show all data
  };


  const fetchHabitSettings = async () => {
    try {
      setLoading(true);
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
      setTimeout(() => setLoading(false), 4000);
    } catch (err) {
      console.error("Error fetching heatmap Settings data:", err);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/table-entry", {
        params: {
          startDate: fromDate,
          endDate: toDate,
        },
      });
      setHabitData(res.data.data.formattedEntries);
      setTotalEntries(res.data.data.totalEntries)
      setLoading(false);
    } catch (err) {
      console.error("Error fetching heatmap data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchHabitSettings();
  }, []);



  return (
    <>
      {/* Sticky Heading */}
      <div className="sticky top-[-20px] z-30 bg-opacity-90 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between p-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {/* <UserCheck size={26} /> */}
            Habit Dashboard
          </h1>

          {/* Center: Analytics Tabs */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="tabs tabs-boxed bg-base-100/50 backdrop-blur-sm shadow-sm p-1 gap-1">
              <a
                className={`tab tab-sm gap-1 transition-all duration-300 ${activeTab === 'calorie' ? 'tab-active btn btn-sm btn-soft btn-primary' : 'btn btn-sm btn-ghost'}`}
                onClick={() => setActiveTab('calorie')}
              >
                <Flame size={14} /> Calorie
              </a>
              <a
                className={`tab tab-sm gap-1 transition-all duration-300 ${activeTab === 'water' ? 'tab-active btn btn-sm btn-soft btn-info' : 'btn btn-sm btn-ghost'}`}
                onClick={() => setActiveTab('water')}
              >
                <Droplet size={14} /> Water
              </a>
              <a
                className={`tab tab-sm gap-1 transition-all duration-300 ${activeTab === 'sleep' ? 'tab-active btn btn-sm btn-soft btn-accent' : 'btn btn-sm btn-ghost'}`}
                onClick={() => setActiveTab('sleep')}
              >
                <Moon size={14} /> Sleep
              </a>
              <a
                className={`tab tab-sm gap-1 transition-all duration-300 ${activeTab === 'read' ? 'tab-active btn btn-sm btn-soft btn-warning' : 'btn btn-sm btn-ghost'}`}
                onClick={() => setActiveTab('read')}
              >
                <BookOpen size={14} /> Read
              </a>
            </div>
          </div>

          {/* Right: From/To Date Pickers */}
          <div className="flex items-center gap-4 ml-auto">
            {/* FROM DATE PICKER */}
            <div className="dropdown dropdown-end floating-label">
              <div tabIndex={0} role="button" className="input text-xs w-25">
                {formatDate(fromDate) || "-- / --- / --"}
              </div>
              <span>From Date</span>
              <div className="dropdown-content z-[999] bg-base-100 rounded-box shadow-sm p-2">
                <calendar-date
                  class="cally"
                  onchange={(e) => setFromDate(e.target.value)}
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
            -{/* TO DATE PICKER */}
            <div className="dropdown dropdown-end floating-label">
              <div tabIndex={0} role="button" className="input text-xs w-25">
                {formatDate(toDate) || "-- / --- / --"}
              </div>
              <span>To Date</span>
              <div className="dropdown-content z-[999] bg-base-100 rounded-box shadow-sm p-2">
                <calendar-date
                  class="cally"
                  onchange={(e) => setToDate(e.target.value)}
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


      <div className="w-full h-full overflow-y-auto overflow-x-hidden p-6 bg-base-200">
        {/* Overview Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-15 gap-3 mb-8">
            <div className="col-span-3 bg-base-100 rounded-2xl shadow-lg p-6">
              <HabitSummaryCard
                habitData={habitData}
              />
            </div>
            <div className="col-span-3 bg-base-100 rounded-2xl shadow-lg p-6">
              <CurrentStreakCard
                habitData={habitData}
                fromDate={fromDate}
                toDate={toDate}
              />
            </div>
            <div className="col-span-3 bg-base-100 rounded-2xl shadow-lg p-6">
              <LongestStreakCard
                habitData={habitData}
                fromDate={fromDate}
                toDate={toDate}
              />
            </div>
            <div className="col-span-3 bg-base-100 rounded-2xl shadow-lg p-6">
              <GoalProgressCard
                habitData={habitData}
                fromDate={fromDate}
                toDate={toDate}
              />
            </div>
            <div className="col-span-3 bg-base-100 rounded-2xl shadow-lg p-6">
              <HabitScoreCard
                habitData={habitData}
                fromDate={fromDate}
                toDate={toDate}
              />
            </div>
          </div>
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
        </div>

      </div>
    </>
  );
}

export default HabitDashboard;
