import { useState, useEffect } from "react";
import { TitleChanger } from "../../../utils/TitleChanger";
import WaterHeatMap from "../../../components/Dashboard/Habit/HabitDashboardPage/Charts/WaterChart/WaterHeatMap";
import LongestStreakCard from "../../../components/Dashboard/Habit/HabitDashboardPage/LongestStreakCard";
import GoalProgressCard from "../../../components/Dashboard/Habit/HabitDashboardPage/GoalProgressCard";
import HabitScoreCard from "../../../components/Dashboard/Habit/HabitDashboardPage/HabitScoreCard";
import HabitSummaryCard from "../../../components/Dashboard/Habit/HabitDashboardPage/HabitSummaryCard";
import { useLoading } from "../../../Context/LoadingContext";
import axiosInstance from "../../../Context/AxiosInstance";
import BurnedVsConsumedCalorieRadialChart from "../../../components/Dashboard/Habit/HabitDashboardPage/Charts/CalorieChart/BurnedVsConsumedCalorieRadialChart";
import CalorieBurnedRadialChart from "../../../components/Dashboard/Habit/HabitDashboardPage/Charts/CalorieChart/CalorieBurnedRadialChart";
import CalorieConsumedRadialChart from "../../../components/Dashboard/Habit/HabitDashboardPage/Charts/CalorieChart/CalorieConsumedRadialChart";
import EffectiveMixedStackChart from "../../../components/Dashboard/Habit/HabitDashboardPage/Charts/CalorieChart/EffectiveMixedStackChart";
import DeficitVsSurplusMixedStackChart from "../../../components/Dashboard/Habit/HabitDashboardPage/Charts/CalorieChart/DeficitVsSurplusMixedStackChart";
import CurrentStreakCard from "../../../components/Dashboard/Habit/HabitDashboardPage/CurrentStreakCard";
import CalorieScoreBoard from "../../../components/Dashboard/Habit/HabitDashboardPage/CalorieScoreBoard";
import WaterConsumptionRadialChart from "../../../components/Dashboard/Habit/HabitDashboardPage/Charts/WaterChart/WaterConsumptionRadialChart";

function HabitDashboard() {
  TitleChanger("Progress Pulse | Habit Dashboard");

  const { setLoading } = useLoading();
  const [habitData, setHabitData] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0)
  const [waterMin, setWaterMin] = useState(0);
  const [waterMax, setWaterMax] = useState(100);
  const [ConsumedCalorieMax, setConsumedCalorieMax] = useState(0);
  const [ConsumedCalorieMin, setConsumedCalorieMin] = useState(0);
  const [BurnedCalorieMax, setBurnedCalorieMax] = useState(0);
  const [BurnedCalorieMin, setBurnedCalorieMin] = useState(0);
  const [basalMetabolicRate, setbasalMetabolicRate] = useState(0);


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
                fromDate={fromDate}
                toDate={toDate}
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

        {/* Calorie Dashboard */}
        <div className="mb-12">
          {/* Calorie Heading */}
          <div className="py-3 text-2xl text-primary font-semibold divider mb-12">
            Calorie Analysis
          </div>
          {/* Calorie Overview Section */}
          <section>
            <div className="grid grid-cols-12 gap-4 mb-8">
              {/* Consumed Vs Burned Chart */}
              <div className="col-span-5 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Consumed Vs Burned
                </h3>
                <div>
                  <div className="tabs tabs-border">
                    {/* Tab1 : Consumed */}
                    <input
                      type="radio"
                      name="ConsumedVsBurned_Calories"
                      className="tab"
                      aria-label="Consumed"
                    />
                    <div className="tab-content border-base-300 bg-base-100 p-10">
                      <div className="h-72 flex items-center justify-center text-gray-500">
                        {
                          <CalorieConsumedRadialChart
                            key={JSON.stringify(habitData)}
                            habitData={habitData}
                            ConsumedCalorieMax={ConsumedCalorieMax}
                            totalEntries={totalEntries}
                          /> ||
                          "Coming Soon"}
                      </div>
                    </div>
                    {/* Tab2 : Burned */}
                    <input
                      type="radio"
                      name="ConsumedVsBurned_Calories"
                      className="tab"
                      aria-label="Burned"
                    />
                    <div className="tab-content border-base-300 bg-base-100 p-10">
                      <div className="h-72 flex items-center justify-center text-gray-500">
                        {<CalorieBurnedRadialChart
                          key={JSON.stringify(habitData)}
                          habitData={habitData}
                          BurnedCalorieMax={BurnedCalorieMax}
                          totalEntries={totalEntries}
                        /> ||
                          "Coming Soon"}
                      </div>
                    </div>
                    {/* Tab3 : Consumed Vs Burned */}
                    <input
                      type="radio"
                      name="ConsumedVsBurned_Calories"
                      className="tab"
                      aria-label="Consumed Vs Burned"
                      defaultChecked
                    />
                    <div className="tab-content border-base-300 bg-base-100 p-10">
                      <div className="h-72 flex items-center justify-center text-gray-500">
                        {(
                          <BurnedVsConsumedCalorieRadialChart
                            key={JSON.stringify(habitData)}
                            habitData={habitData}
                            ConsumedCalorieMax={ConsumedCalorieMax}
                            BurnedCalorieMax={BurnedCalorieMax}
                            totalEntries={totalEntries}
                          />
                        ) || "Coming Soon"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Effective Vs Actual */}
              <div className="col-span-7 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                <h3 className="text-lg font-semibold mb-2">
                  💯 Calorie Score Board
                </h3>
                <div className="h-101 flex items-center justify-center text-gray-500">
                  <CalorieScoreBoard
                    habitData={habitData}
                    ConsumedCalorieMax={ConsumedCalorieMax}
                    ConsumedCalorieMin={ConsumedCalorieMin}
                    BurnedCalorieMax={BurnedCalorieMax}
                    BurnedCalorieMin={BurnedCalorieMin}
                    basalMetabolicRate={basalMetabolicRate}
                    fromDate={fromDate}
                    toDate={toDate}
                  />
                </div>
              </div>
            </div>
          </section>
          {/* Calorie Chart Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4"></h2>
            <div className="bg-base-100 rounded-2xl shadow-md p-6">
              <div className="tabs tabs-border">
                <input
                  type="radio"
                  name="CalorieVisualization"
                  className="tab"
                  aria-label="Consumed Vs Burned"
                  defaultChecked
                />
                <div className="tab-content border-base-300 bg-base-100 p-10">
                  <EffectiveMixedStackChart
                    habitData={habitData}
                    ConsumedCalorieMax={ConsumedCalorieMax}
                  />
                </div>

                <input
                  type="radio"
                  name="CalorieVisualization"
                  className="tab"
                  aria-label="Deficit / Surplus"
                />
                <div className="tab-content border-base-300 bg-base-100 p-10">
                  <DeficitVsSurplusMixedStackChart
                    habitData={habitData}
                    ConsumedCalorieMax={ConsumedCalorieMax}
                    bmr={basalMetabolicRate}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mb-12">
          {/* Water Analysis Heading */}
          <div className="py-3 text-2xl text-primary font-semibold divider mb-12">
            Water Analysis
          </div>
          {/* Water Overview Section */}
          <section>
            <div className="grid grid-cols-12 gap-4 mb-8">
              {/* Consumed Vs Burned Chart */}
              <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                <h3 className="text-lg font-semibold mb-2">
                  Water Consumption
                </h3>
                <div>
                  <div className="tabs tabs-border">
                    {/* Tab1 : Water Consumed */}
                    <input
                      type="radio"
                      name="WaterConsumption"
                      className="tab"
                      aria-label="Water Consumed"
                    />
                    <div className="tab-content border-base-300 bg-base-100 p-10">
                      <div className="h-72 flex items-center justify-center text-gray-500">
                        {
                          <WaterConsumptionRadialChart
                            key={JSON.stringify(habitData)}
                            habitData={habitData}
                            waterMax={waterMax}
                          /> ||
                          "Coming Soon"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Effective Vs Actual */}
              <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                <h3 className="text-lg font-semibold mb-2">
                  💯 Calorie Score Board
                </h3>
                <div className="h-101 flex items-center justify-center text-gray-500">
                  <CalorieScoreBoard
                    habitData={habitData}
                    ConsumedCalorieMax={ConsumedCalorieMax}
                    ConsumedCalorieMin={ConsumedCalorieMin}
                    BurnedCalorieMax={BurnedCalorieMax}
                    BurnedCalorieMin={BurnedCalorieMin}
                    basalMetabolicRate={basalMetabolicRate}
                    fromDate={fromDate}
                    toDate={toDate}
                  />
                </div>
              </div>
            </div>
          </section>

        </div>
        {/* Log Section */}
        {/* <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">📋 Habit Logs</h2>
          <div className="bg-base-100 rounded-2xl shadow-md p-4 min-h-[300px]">
            <div className="h-full flex items-center justify-center text-gray-500">
              Table or logs coming soon
            </div>
          </div>
        </section> */}
      </div>
    </>
  );
}

export default HabitDashboard;
