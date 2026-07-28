import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setHabitFilters, resetHabitFilters } from "../../../services/redux/slice/habitSlice";
import HabitDateQuickSelect from "../../../components/Dashboard/Habit/HabitDateQuickSelect.jsx";
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

import { Flame, Droplet, Moon, BookOpen, Smile, Heart, Book, ChevronDown, ChevronUp, Trophy, Apple } from "lucide-react";
import MoodAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/MoodAnalysis.jsx";
import SelfCareAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/SelfCareAnalysis.jsx";
import JournalAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/JournalAnalysis.jsx";
import ScoreAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/ScoreAnalysis.jsx";
import NutrientAnalysis from "../../../components/Dashboard/Habit/HabitDashboardPage/Analysis/NutrientAnalysis.jsx";

function HabitDashboard() {
  TitleChanger("Progress Pulse | Habit Dashboard");

  const dispatch = useDispatch();
  const { fromDate, toDate } = useSelector((state) => state.habit.filters);

  const { setLoading } = useLoading();
  const [habitData, setHabitData] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0)
  const [activeTab, setActiveTab] = useState('calorie');
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);

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
    { id: "calorie", label: "Calorie", icon: Flame, color: "text-error" },
    { id: "water", label: "Water", icon: Droplet, color: "text-info" },
    { id: "sleep", label: "Sleep", icon: Moon, color: "text-accent" },
    { id: "read", label: "Read", icon: BookOpen, color: "text-warning" },
    { id: "selfcare", label: "Self Care", icon: Heart, color: "text-secondary" },
    { id: "mood", label: "Mood", icon: Smile, color: "text-accent" },
    { id: "scores", label: "Scores", icon: Trophy, color: "text-amber-400" },
    { id: "journal", label: "Journal", icon: Book, color: "text-info" },
    { id: "nutrients", label: "Nutrients", icon: Apple, color: "text-success" },
  ];

  const activeTabObj = DASHBOARD_TABS.find((t) => t.id === activeTab) || DASHBOARD_TABS[0];
  const ActiveIcon = activeTabObj.icon;

  // Format Date Function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = String(date.getFullYear()).slice(2);
    return `${day}-${month}-${year}`;
  };

  const resetFilters = () => {
    dispatch(resetHabitFilters());
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
      setMoodList(res.data.data.settings.mood || []);
      setSelfCareList(res.data.data.settings.selfcare || []);
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
      if (err.response && (err.response.status === 404 || err.response.status === 400)) {
        setHabitData([]);
        setTotalEntries(0);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchHabitSettings();
  }, []);



  return (
    <>
      {/* Sticky Heading */}
      <div className="sticky top-[-20px] z-30 bg-opacity-90 backdrop-blur-md shadow-sm border-b border-base-300/30">
        {/* Top Row: Heading and Filter Controls */}
        <div className="flex items-center justify-between p-3 flex-wrap gap-3">
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
              <div tabIndex={0} role="button" className="input text-xs w-25">
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
              <div tabIndex={0} role="button" className="input text-xs w-25">
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


      <div className="w-full h-full overflow-y-auto overflow-x-hidden p-6 bg-base-200">
      {activeTab === 'nutrients' ? (
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
            <section className="mb-12">
            <div 
                className="flex items-center justify-between cursor-pointer mb-4 hover:bg-base-300/50 p-2 rounded-lg transition-colors"
                onClick={() => setIsOverviewOpen(!isOverviewOpen)}
            >
                <h2 className="text-xl font-semibold flex items-center gap-2">Overview</h2>
                <button className="btn btn-sm btn-ghost btn-circle">
                    {isOverviewOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>
            
            {isOverviewOpen && (
                <div className="grid grid-cols-15 gap-3 mb-8 animate-fade-in-down">
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

            {activeTab === 'journal' && (
            <JournalAnalysis
              habitData={habitData}
              moodList={moodList}
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
    </>
  );
}

export default HabitDashboard;
