import { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Heading from "../../../components/Dashboard/Habit/HabitTableEntryPage/Heading.jsx";
import Pagination from "../../../components/Dashboard/Habit/HabitTableEntryPage/Pagination.jsx";
import HabitDateQuickSelect from "../../../components/Dashboard/Habit/HabitDateQuickSelect.jsx";

import AddHabitPopUp from "../../../components/Dashboard/Habit/HabitTableEntryPage/AddHabitPopUp.jsx";
import DeleteHabitPopUp from "../../../components/Dashboard/Habit/HabitTableEntryPage/DeleteHabitPopUp.jsx";
import JournalPopUp from "../../../components/Dashboard/Habit/HabitTableEntryPage/JournalPopUp.jsx";
import Trash from "../../../utils/Icons/Trash";
import Pencil from "../../../utils/Icons/Pencil";
import Save from "../../../utils/Icons/Save";
import Cancel from "../../../utils/Icons/Cancel";
import ErrorAlert from "../../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../../utils/Alerts/SuccessAlert";
import axiosInstance from "../../../Context/AxiosInstance";
import Refresh from "../../../utils/Icons/Refresh";
import { TitleChanger } from "../../../utils/TitleChanger";
import { useSelector, useDispatch } from "react-redux";
import { setHabitFilters, resetHabitFilters, fetchHabitSettings } from "../../../services/redux/slice/habitSlice";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  CalendarDays,
  Utensils,
  Settings,
  Book,
  Search,
  Filter,
  Plus,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
} from "lucide-react";

import FoodLoggingTab from "../../../components/Dashboard/Habit/FoodLogging/FoodLoggingTab.jsx";

const getSelfCareEmoji = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("work") || lower.includes("gym") || lower.includes("exercise") || lower.includes("fitness")) return "🏃";
  if (lower.includes("meditat") || lower.includes("mindful") || lower.includes("breath") || lower.includes("yoga")) return "🧘";
  if (lower.includes("water") || lower.includes("hydrat")) return "💧";
  if (lower.includes("read") || lower.includes("book")) return "📖";
  if (lower.includes("walk") || lower.includes("step")) return "🚶";
  if (lower.includes("skin") || lower.includes("shower") || lower.includes("bath")) return "🧖";
  if (lower.includes("journal") || lower.includes("writ") || lower.includes("diary")) return "✍️";
  if (lower.includes("vitamin") || lower.includes("med") || lower.includes("pill") || lower.includes("supplement")) return "💊";
  if (lower.includes("sleep") || lower.includes("rest") || lower.includes("nap")) return "😴";
  if (lower.includes("fruit") || lower.includes("diet") || lower.includes("salad") || lower.includes("eat")) return "🥗";
  return "✨";
};

const getMoodEmoji = (mood = "") => {
  const lower = mood.toLowerCase();
  if (lower.includes("great") || lower.includes("awesome") || lower.includes("fantastic") || lower.includes("amazing")) return "🤩";
  if (lower.includes("good") || lower.includes("happy") || lower.includes("fine")) return "😊";
  if (lower.includes("neutral") || lower.includes("okay") || lower.includes("normal") || lower.includes("average")) return "😐";
  if (lower.includes("sad") || lower.includes("low") || lower.includes("bad") || lower.includes("depress")) return "😔";
  if (lower.includes("stress") || lower.includes("anxious") || lower.includes("rough") || lower.includes("angry") || lower.includes("terrible")) return "😫";
  if (lower.includes("tired") || lower.includes("exhaust")) return "🥱";
  if (lower.includes("calm") || lower.includes("relax")) return "😌";
  if (lower.includes("focus") || lower.includes("product")) return "🎯";
  return "🙂";
};


function HabitTableEntry() {
  TitleChanger("Progress Pulse | Habit Logging");
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialTab = location.state?.tab || searchParams.get("tab") || "habit";
  const [activeMainTab, setActiveMainTab] = useState(initialTab); // "habit" or "food"

  useEffect(() => {
    dispatch(fetchHabitSettings());
  }, [dispatch]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") || location.state?.tab;
    if (tabFromUrl && (tabFromUrl === "habit" || tabFromUrl === "food")) {
      setActiveMainTab(tabFromUrl);
    }
  }, [searchParams, location.state]);

  const settings = useSelector((state) => state.habit.settings);
  const { fromDate, toDate, itemPerPage } = useSelector(
    (state) => state.habit.filters
  );

  // Format Date Function (DDD, DD-MMM-YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return dateString;
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${weekday}, ${day}-${month}-${year}`;
  };

  const getTodayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const shiftDate = (dateStr, days) => {
    if (!dateStr) return getTodayStr();
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDayDisplay = (dateStr) => {
    if (!dateStr) return { full: "", isToday: false };
    const todayStr = getTodayStr();

    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const weekday = dt.toLocaleDateString("en-US", { weekday: "short" });
    const day = String(dt.getDate()).padStart(2, "0");
    const month = dt.toLocaleDateString("en-US", { month: "short" });
    const year = dt.getFullYear();

    return { full: `${weekday}, ${day} ${month} ${year}`, isToday: dateStr === todayStr };
  };

  // Mobile Day View State
  const [selectedMobileDate, setSelectedMobileDate] = useState(() => getTodayStr());
  const [mobileEntry, setMobileEntry] = useState({
    date: getTodayStr(),
    burned: 0,
    water: 0,
    sleep: 0,
    read: 0,
    intake: 0,
    selfcare: "",
    mood: "",
    journal: "",
    _isExisting: false,
  });
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileSaving, setMobileSaving] = useState(false);
  const [mobileHasChanges, setMobileHasChanges] = useState(false);
  const [isFetchingFoodMobile, setIsFetchingFoodMobile] = useState(false);
  const [mobileDaysCache, setMobileDaysCache] = useState({});
  const [extraFutureDays, setExtraFutureDays] = useState(0);
  const daysScrollRef = useRef(null);
  const isInitialScrollDone = useRef(false);
  const mobileDatePickerRef = useRef(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());
  const [isSelfCareExpanded, setIsSelfCareExpanded] = useState(false);

  // variables
  const [itemToDelete, setItemToDelete] = useState(null);
  const [habitLoading, setHabitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  // Journal State
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [currentJournalItem, setCurrentJournalItem] = useState(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [totalPages, setTotalPages] = useState();
  const [isSyncingIntake, setIsSyncingIntake] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    burned: { mode: "all", value: "" },
    water: { mode: "all", value: "" },
    sleep: { mode: "all", value: "" },
    read: { mode: "all", value: "" },
    intake: { mode: "all", value: "" },
    selfcare: [],
    mood: [],
    progress: [],
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  //Error Alert Variables
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  // Success Alert Variables
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setAlertSuccessMessage] = useState("");

  // -------------------------------------------------------------------- Functions ---------------------------------------------------------------

  const getConsistencyLabel = (percentage) => {
    if (percentage <= 25) return "Inconsistent";
    if (percentage <= 50) return "Uncertain";
    if (percentage <= 75) return "Moderate";
    return "Consistent";
  };

  const getConsistencyColor = (percentage) => {
    if (percentage < 25) return "text-error";
    if (percentage < 50) return "text-warning";
    if (percentage < 75) return "text-info";
    return "text-success";
  };

  const getProgressColorClass = (percentage) => {
    if (percentage >= 75) return "progress-success";
    if (percentage >= 50) return "progress-info";
    if (percentage >= 25) return "progress-warning";
    return "progress-error";
  };

  const getScoreColor = (score) => {
    const percentage = (score / 7) * 100;
    if (percentage < 25) return "text-error";
    if (percentage < 50) return "text-warning";
    if (percentage < 75) return "text-info";
    return "text-success";
  };

  const getColorClass = (field, value, settings) => {
    if (!settings[field]) return "text-gray-500";
    const { min, max } = settings[field];
    if (value < min) return "text-warning";
    if (value > max) return "text-error";
    return "text-success";
  };

  const calculateProgress = (item) => {
    if (!item) return 0;
    const fields = [
      "burned",
      "water",
      "sleep",
      "read",
      "intake",
      "selfcare",
      "mood",
    ];

    const filled = fields.filter((key) => {
      const value = item[key];
      if (key === "selfcare") {
        const requiredLength = settings?.selfcare ? settings.selfcare.length : 0;
        const emptySelfcare = "_".repeat(requiredLength);
        return value && value !== emptySelfcare;
      }
      return value && value.toString().trim() !== "0";
    });

    const progressPercentage = Math.round(
      (filled.length / fields.length) * 100
    );

    item["score"] = filled.length;
    item["progress"] = progressPercentage;
    return progressPercentage;
  };

  const calculateScore = (item) => {
    if (!item) return 0;
    const fields = [
      "burned",
      "water",
      "sleep",
      "read",
      "intake",
      "selfcare",
      "mood",
    ];

    const filled = fields.filter((key) => {
      const value = item[key];
      if (key === "selfcare") {
        const requiredLength = settings?.selfcare ? settings.selfcare.length : 0;
        const emptySelfcare = "_".repeat(requiredLength);
        return value && value !== emptySelfcare;
      }
      return value && value.toString().trim() !== "0";
    });
    const score = filled.length;
    item["score"] = filled.length;
    return score;
  };

  const resetFilters = () => {
    dispatch(resetHabitFilters());
    setColumnFilters({
      burned: { mode: "all", value: "" },
      water: { mode: "all", value: "" },
      sleep: { mode: "all", value: "" },
      read: { mode: "all", value: "" },
      intake: { mode: "all", value: "" },
      selfcare: [],
      mood: [],
      progress: [],
    });
  };

  const isRowMatchingColumnFilter = (item, colKey) => {
    if (colKey === "selfcare") {
      const selectedSelfCare = columnFilters.selfcare || [];
      if (selectedSelfCare.length === 0) return true;
      const rawSelfCare = String(item.selfcare || "");
      const allConfiguredHabits = settings.selfcare || [];

      return selectedSelfCare.every((habit) => {
        const index = allConfiguredHabits.indexOf(habit);
        if (index !== -1) {
          const expectedChar = habit[0].toUpperCase();
          return rawSelfCare[index] === expectedChar;
        }
        return rawSelfCare.toUpperCase().includes(habit[0].toUpperCase());
      });
    }

    if (colKey === "mood") {
      const selectedMoods = columnFilters.mood || [];
      if (selectedMoods.length === 0) return true;
      return selectedMoods.includes(item.mood);
    }

    if (colKey === "progress") {
      const selectedProgress = columnFilters.progress || [];
      if (selectedProgress.length === 0) return true;
      const progressPercent = calculateProgress(item);
      const label = getConsistencyLabel(progressPercent);
      return selectedProgress.includes(label);
    }

    const filter = columnFilters[colKey];
    if (!filter || filter.mode === "all") return true;

    const val = Number(item[colKey] || 0);
    const colSettings = settings?.[colKey] || { min: 0, max: 0 };
    const minVal = Number(colSettings.min || 0);
    const maxVal = Number(colSettings.max || 0);

    if (filter.mode === "below_min") {
      return val < minVal;
    }
    if (filter.mode === "within_range") {
      return val >= minVal && val <= maxVal;
    }
    if (filter.mode === "above_max") {
      return val > maxVal;
    }
    if (filter.mode === "gt") {
      const threshold = parseFloat(filter.value);
      return isNaN(threshold) ? true : val > threshold;
    }
    if (filter.mode === "lt") {
      const threshold = parseFloat(filter.value);
      return isNaN(threshold) ? true : val < threshold;
    }
    return true;
  };

  const filteredData = data.filter((item) => {
    return (
      isRowMatchingColumnFilter(item, "burned") &&
      isRowMatchingColumnFilter(item, "water") &&
      isRowMatchingColumnFilter(item, "sleep") &&
      isRowMatchingColumnFilter(item, "read") &&
      isRowMatchingColumnFilter(item, "intake") &&
      isRowMatchingColumnFilter(item, "selfcare") &&
      isRowMatchingColumnFilter(item, "mood") &&
      isRowMatchingColumnFilter(item, "progress")
    );
  });

  const renderMultiSelectHeader = (colKey, label, optionsList) => {
    const selectedOptions = columnFilters[colKey] || [];
    const isFiltered = selectedOptions.length > 0;

    const handleToggleOption = (option) => {
      setColumnFilters((prev) => {
        const current = prev[colKey] || [];
        const updated = current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option];
        return { ...prev, [colKey]: updated };
      });
    };

    const handleSelectAll = () => {
      setColumnFilters((prev) => ({
        ...prev,
        [colKey]: [...optionsList],
      }));
    };

    const handleClearAll = () => {
      setColumnFilters((prev) => ({
        ...prev,
        [colKey]: [],
      }));
    };

    return (
      <th className="px-3 py-2.5 text-center whitespace-nowrap min-w-[130px] relative">
        <div className="flex items-center justify-center gap-1.5 font-bold whitespace-nowrap">
          <span className="whitespace-nowrap">{label}</span>

          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              role="button"
              className={`p-1 rounded-full transition-all flex items-center justify-center ml-0.5 cursor-pointer shrink-0 ${
                isFiltered
                  ? "bg-primary text-primary-content shadow-md scale-105"
                  : "text-base-content/60 hover:text-primary hover:bg-base-200"
              }`}
              title={`Filter ${label}`}
            >
              <Filter className="w-3.5 h-3.5 shrink-0" />
            </button>

            <div
              tabIndex={0}
              className="dropdown-content z-[999] menu p-3 shadow-2xl bg-base-100 rounded-2xl w-56 text-xs border border-base-300 text-left font-normal mt-2"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-200">
                <span className="font-bold text-xs text-base-content flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-primary" /> Filter {label}
                </span>
                {isFiltered && (
                  <span className="badge badge-primary badge-xs">
                    {selectedOptions.length} Selected
                  </span>
                )}
              </div>

              <div className="flex justify-between text-[11px] text-primary px-1 pb-2 mb-1 border-b border-base-200">
                <button
                  type="button"
                  className="hover:underline cursor-pointer"
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="hover:underline text-error cursor-pointer"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {optionsList.map((option) => {
                  const isChecked = selectedOptions.includes(option);
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-1.5 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs checkbox-primary"
                        checked={isChecked}
                        onChange={() => handleToggleOption(option)}
                      />
                      <span className="truncate">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </th>
    );
  };

  const renderColumnHeader = (colKey, label, unit = "", extraAction = null) => {
    const filter = columnFilters[colKey] || { mode: "all", value: "" };
    const isFiltered = filter.mode !== "all";
    const colSettings = settings?.[colKey] || { min: 0, max: 0 };

    return (
      <th className="px-3 py-2.5 text-center whitespace-nowrap min-w-[125px] relative">
        <div className="flex items-center justify-center gap-1.5 font-bold whitespace-nowrap">
          <span className="whitespace-nowrap">{label}</span>
          {extraAction}

          {/* Column Filter Dropdown */}
          <div className="dropdown dropdown-end">
            <button
              type="button"
              tabIndex={0}
              role="button"
              className={`p-1 rounded-full transition-all flex items-center justify-center ml-0.5 cursor-pointer shrink-0 ${
                isFiltered
                  ? "bg-primary text-primary-content shadow-md scale-105"
                  : "text-base-content/60 hover:text-primary hover:bg-base-200"
              }`}
              title={`Filter ${label}`}
            >
              <Filter className="w-3.5 h-3.5 shrink-0" />
            </button>

            <div
              tabIndex={0}
              className="dropdown-content z-[999] menu p-3 shadow-2xl bg-base-100 rounded-2xl w-60 text-xs border border-base-300 text-left font-normal mt-2"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-200">
                <span className="font-bold text-xs text-base-content flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-primary" /> Filter {label}
                </span>
                <span className="text-[10px] bg-base-200 px-2 py-0.5 rounded-full text-base-content/70">
                  Target: {colSettings.min} - {colSettings.max} {unit}
                </span>
              </div>

              <div className="space-y-1">
                {/* 1. All */}
                <label className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-1.5 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name={`filter-${colKey}`}
                    className="radio radio-xs radio-primary"
                    checked={filter.mode === "all"}
                    onChange={() =>
                      setColumnFilters((prev) => ({
                        ...prev,
                        [colKey]: { ...prev[colKey], mode: "all" },
                      }))
                    }
                  />
                  <span>All Entries</span>
                </label>

                {/* 2. Below Min */}
                <label className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-1.5 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name={`filter-${colKey}`}
                    className="radio radio-xs radio-warning"
                    checked={filter.mode === "below_min"}
                    onChange={() =>
                      setColumnFilters((prev) => ({
                        ...prev,
                        [colKey]: { ...prev[colKey], mode: "below_min" },
                      }))
                    }
                  />
                  <span>Below Min (&lt; {colSettings.min})</span>
                </label>

                {/* 3. Within Range */}
                <label className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-1.5 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name={`filter-${colKey}`}
                    className="radio radio-xs radio-success"
                    checked={filter.mode === "within_range"}
                    onChange={() =>
                      setColumnFilters((prev) => ({
                        ...prev,
                        [colKey]: { ...prev[colKey], mode: "within_range" },
                      }))
                    }
                  />
                  <span>Within Range ({colSettings.min} - {colSettings.max})</span>
                </label>

                {/* 4. Above Max */}
                <label className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-1.5 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name={`filter-${colKey}`}
                    className="radio radio-xs radio-error"
                    checked={filter.mode === "above_max"}
                    onChange={() =>
                      setColumnFilters((prev) => ({
                        ...prev,
                        [colKey]: { ...prev[colKey], mode: "above_max" },
                      }))
                    }
                  />
                  <span>Above Max (&gt; {colSettings.max})</span>
                </label>

                {/* 5. > Custom Value */}
                <div className="p-1.5 rounded-lg hover:bg-base-200">
                  <label className="flex items-center gap-2 cursor-pointer mb-1">
                    <input
                      type="radio"
                      name={`filter-${colKey}`}
                      className="radio radio-xs radio-primary"
                      checked={filter.mode === "gt"}
                      onChange={() =>
                        setColumnFilters((prev) => ({
                          ...prev,
                          [colKey]: { ...prev[colKey], mode: "gt" },
                        }))
                      }
                    />
                    <span>&gt; Custom Value</span>
                  </label>
                  {filter.mode === "gt" && (
                    <input
                      type="number"
                      placeholder={`Greater than... (${unit})`}
                      className="input input-xs input-bordered w-full bg-base-100"
                      value={filter.value}
                      onChange={(e) =>
                        setColumnFilters((prev) => ({
                          ...prev,
                          [colKey]: { ...prev[colKey], value: e.target.value },
                        }))
                      }
                    />
                  )}
                </div>

                {/* 6. < Custom Value */}
                <div className="p-1.5 rounded-lg hover:bg-base-200">
                  <label className="flex items-center gap-2 cursor-pointer mb-1">
                    <input
                      type="radio"
                      name={`filter-${colKey}`}
                      className="radio radio-xs radio-primary"
                      checked={filter.mode === "lt"}
                      onChange={() =>
                        setColumnFilters((prev) => ({
                          ...prev,
                          [colKey]: { ...prev[colKey], mode: "lt" },
                        }))
                      }
                    />
                    <span>&lt; Custom Value</span>
                  </label>
                  {filter.mode === "lt" && (
                    <input
                      type="number"
                      placeholder={`Less than... (${unit})`}
                      className="input input-xs input-bordered w-full bg-base-100"
                      value={filter.value}
                      onChange={(e) =>
                        setColumnFilters((prev) => ({
                          ...prev,
                          [colKey]: { ...prev[colKey], value: e.target.value },
                        }))
                      }
                    />
                  )}
                </div>
              </div>

              {isFiltered && (
                <button
                  type="button"
                  className="btn btn-xs btn-soft btn-error mt-2 w-full"
                  onClick={() =>
                    setColumnFilters((prev) => ({
                      ...prev,
                      [colKey]: { mode: "all", value: "" },
                    }))
                  }
                >
                  Reset Column Filter
                </button>
              )}
            </div>
          </div>
        </div>
      </th>
    );
  };

  const fetchHabits = async (page = currentPage, showSpinner = true) => {
    if (showSpinner) setHabitLoading(true);

    // declare response here so it's visible in finally
    let response;

    try {
      response = await axiosInstance.get("/v1/dashboard/habit/table-entry", {
        params: {
          page: page,
          limit: itemPerPage,
          startDate: fromDate,
          endDate: toDate,
        },
      });

      const habits = response.data.data.formattedEntries || [];
      const sortedHabits = habits.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setData(sortedHabits);
    } catch (err) {
      setData([]);
      const errorMessage =
        err.response?.data?.message || "Failed to fetch habit data!";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTotalPages(1);
      setCurrentPage(1);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      // only compute totalPages if we got a response
      if (response?.data?.data?.totalEntries != null) {
        setTotalPages(Math.ceil(response.data.data.totalEntries / itemPerPage));
      }
      if (showSpinner) setHabitLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits(currentPage);
  }, [currentPage, itemPerPage, fromDate, toDate]); // re-run when currentPage changes

  // Key Down Function
  useEffect(() => {
    if (editingItem) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingItem]);

  // Delection Data Function
  const handleDeleteClick = (date) => {
    setItemToDelete(date);
    setIsDeleteModalOpen(true);
  };

  const handleJournalClick = (item) => {
    setCurrentJournalItem(item);
    setIsJournalModalOpen(true);
  };

  const handleJournalSave = async (text, mood) => {
    if (!currentJournalItem) return;

    try {
      const payload = {
        date: currentJournalItem.date,
        burned: currentJournalItem.burned,
        water: currentJournalItem.water,
        sleep: currentJournalItem.sleep,
        read: currentJournalItem.read,
        intake: currentJournalItem.intake,
        selfcare: currentJournalItem.selfcare,
        mood: mood !== undefined ? mood : currentJournalItem.mood,
        journal: text,
        progress: Number(currentJournalItem.progress),
        score: Number(currentJournalItem.score)
      };

      await axiosInstance.put("/v1/dashboard/habit/table-entry", payload);
      setAlertSuccessMessage("Journal saved successfully!");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
      fetchHabits(currentPage);
      setIsJournalModalOpen(false);
      setCurrentJournalItem(null);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "Failed to save journal";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete("/v1/dashboard/habit/table-entry", {
        params: {
          date: itemToDelete,
        },
      });
      setAlertSuccessMessage(`Entry For ${itemToDelete} Deleted`);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
      setEditingItem(null);
      setMobileDaysCache((prev) => {
        const next = { ...prev };
        delete next[itemToDelete];
        return next;
      });
      fetchHabits(currentPage);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete habit entry!";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
    // setData(data.filter((item) => item.date !== itemToDelete));
  };

  // Handle Enter Key function
  const handleKeyDown = (e) => {
    if (editingItem && e.key === "Enter") {
      e.preventDefault(); // Optional: prevents form submission or weird input behaviors
      handleSave();
    }
  };

  // Edit Data Function
  const handleEdit = (item) => {
    // console.log(item)
    setEditingItem({ ...item });
  };

  // Save Data Function
  const handleSave = async () => {
    if (!editingItem) return;
    const originalItem = data.find((item) => item.date === editingItem.date);
    const keys = ["burned", "water", "sleep", "read", "intake", "selfcare", "mood"];
    const hasChanges = !originalItem || keys.some((k) => String(originalItem[k] ?? "") !== String(editingItem[k] ?? ""));
    if (!hasChanges) {
      setAlertSuccessMessage("Already up to date!");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
      setEditingItem(null);
      return;
    }
    try {
      setLoading(true);
      calculateProgress(editingItem);

      const payload = {
        ...editingItem,
        burned: Number(editingItem.burned) || 0,
        water: Number(editingItem.water) || 0,
        sleep: Number(editingItem.sleep) || 0,
        read: Number(editingItem.read) || 0,
        intake: Number(editingItem.intake) || 0,
        progress: Number(editingItem.progress) || 0,
        score: Number(editingItem.score) || 0,
      };

      const response = await axiosInstance.put(
        "/v1/dashboard/habit/table-entry",
        payload
      );
      setAlertSuccessMessage(response.data?.message || `Habit entry for ${editingItem.date} updated successfully`);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
      await fetchHabits(currentPage);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "Failed To Save Entry!";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  // On Change function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleInlineCalculateFood = async () => {
    if (!editingItem?.date) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: editingItem.date },
      });
      const totalCals = res.data?.data?.summary?.totalCalories;
      setEditingItem((prev) => ({
        ...prev,
        intake: totalCals !== undefined && totalCals !== null ? totalCals : 0,
      }));
    } catch (err) {
      console.error("Failed to calculate food calories inline", err);
    } finally {
      setLoading(false);
    }
  };

  // Sync selectedMobileDate with data/backend
  useEffect(() => {
    if (!selectedMobileDate) return;
    const today = getTodayStr();

    // Check if entry exists in data prop
    const found = data.find((item) => item.date === selectedMobileDate);
    if (found) {
      setMobileEntry({
        ...found,
        burned: Number(found.burned) || 0,
        water: Number(found.water) || 0,
        sleep: Number(found.sleep) || 0,
        read: Number(found.read) || 0,
        intake: Number(found.intake) || 0,
        selfcare: found.selfcare || "",
        mood: found.mood || "",
        journal: found.journal || "",
        _isExisting: true,
      });
      setMobileHasChanges(false);
      return;
    }

    // If future date and not marked as existing in cache: keep strictly empty (no network call needed)
    if (selectedMobileDate > today && !mobileDaysCache[selectedMobileDate]?._isExisting) {
      setMobileEntry({
        date: selectedMobileDate,
        burned: 0,
        water: 0,
        sleep: 0,
        read: 0,
        intake: 0,
        selfcare: "",
        mood: "",
        journal: "",
        _isExisting: false,
      });
      setMobileHasChanges(false);
      return;
    }

    let isMounted = true;
    const fetchDay = async () => {
      try {
        setMobileLoading(true);
        const res = await axiosInstance.get("/v1/dashboard/habit/table-entry", {
          params: {
            page: 1,
            startDate: selectedMobileDate,
            endDate: selectedMobileDate,
            limit: 1,
          },
        });
        const entry = res.data?.data?.formattedEntries?.[0];
        if (isMounted) {
          if (entry) {
            setMobileEntry({
              ...entry,
              burned: Number(entry.burned) || 0,
              water: Number(entry.water) || 0,
              sleep: Number(entry.sleep) || 0,
              read: Number(entry.read) || 0,
              intake: Number(entry.intake) || 0,
              selfcare: entry.selfcare || "",
              mood: entry.mood || "",
              journal: entry.journal || "",
              _isExisting: true,
            });
            setMobileDaysCache((prev) => ({
              ...prev,
              [selectedMobileDate]: { ...entry, _isExisting: true },
            }));
          } else {
            // Day has no record: strictly empty, zero prefill!
            setMobileEntry({
              date: selectedMobileDate,
              burned: 0,
              water: 0,
              sleep: 0,
              read: 0,
              intake: 0,
              selfcare: "",
              mood: "",
              journal: "",
              _isExisting: false,
            });
          }
          setMobileHasChanges(false);
        }
      } catch (err) {
        if (isMounted) {
          setMobileEntry({
            date: selectedMobileDate,
            burned: 0,
            water: 0,
            sleep: 0,
            read: 0,
            intake: 0,
            selfcare: "",
            mood: "",
            journal: "",
            _isExisting: false,
          });
          setMobileHasChanges(false);
        }
      } finally {
        if (isMounted) setMobileLoading(false);
      }
    };
    fetchDay();
    return () => {
      isMounted = false;
    };
  }, [selectedMobileDate, data]);

  const handleMobileFieldChange = (field, value) => {
    setMobileEntry((prev) => ({
      ...prev,
      [field]: value,
    }));
    setMobileHasChanges(true);
  };

  const handleMobileFetchFoodIntake = async () => {
    if (!selectedMobileDate) return;
    try {
      setIsFetchingFoodMobile(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: selectedMobileDate },
      });
      const totalCals = res.data?.data?.summary?.totalCalories;
      const cals = totalCals !== undefined && totalCals !== null ? totalCals : 0;
      handleMobileFieldChange("intake", cals);
      setAlertSuccessMessage(`Fetched ${cals} kcal from Food Logging!`);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (err) {
      console.error("Failed to fetch food log", err);
      setAlertErrorMessage("No food logs found for this date");
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setIsFetchingFoodMobile(false);
    }
  };

  const handleSaveMobileEntry = async (entryToSave = mobileEntry) => {
    if (!entryToSave?.date) return;
    try {
      setMobileSaving(true);
      const progress = calculateProgress(entryToSave);
      const score = calculateScore(entryToSave);

      const payload = {
        date: entryToSave.date,
        burned: Number(entryToSave.burned) || 0,
        water: Number(entryToSave.water) || 0,
        sleep: Number(entryToSave.sleep) || 0,
        read: Number(entryToSave.read) || 0,
        intake: Number(entryToSave.intake) || 0,
        selfcare: entryToSave.selfcare || "",
        mood: entryToSave.mood || "",
        journal: entryToSave.journal || "",
        progress: Number(progress) || 0,
        score: Number(score) || 0,
      };

      if (entryToSave._isExisting) {
        await axiosInstance.put("/v1/dashboard/habit/table-entry", payload);
        setAlertSuccessMessage(`Habit entry for ${entryToSave.date} updated!`);
      } else {
        await axiosInstance.post("/v1/dashboard/habit/table-entry", payload);
        setAlertSuccessMessage(`Habit entry for ${entryToSave.date} saved!`);
        setMobileEntry((prev) => ({ ...prev, _isExisting: true }));
      }

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      setMobileHasChanges(false);
      setMobileDaysCache((prev) => ({
        ...prev,
        [entryToSave.date]: { ...payload, _isExisting: true },
      }));
      fetchHabits(currentPage, false);
    } catch (err) {
      console.error("Save mobile habit error:", err);
      if (!entryToSave._isExisting && err?.response?.data?.message?.includes("already")) {
        try {
          await axiosInstance.put("/v1/dashboard/habit/table-entry", {
            ...entryToSave,
            burned: Number(entryToSave.burned) || 0,
            water: Number(entryToSave.water) || 0,
            sleep: Number(entryToSave.sleep) || 0,
            read: Number(entryToSave.read) || 0,
            intake: Number(entryToSave.intake) || 0,
            progress: calculateProgress(entryToSave),
            score: calculateScore(entryToSave),
          });
          setMobileEntry((prev) => ({ ...prev, _isExisting: true }));
          setAlertSuccessMessage(`Habit entry for ${entryToSave.date} updated!`);
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
          setMobileHasChanges(false);
          setMobileDaysCache((prev) => ({
            ...prev,
            [entryToSave.date]: { ...entryToSave, _isExisting: true },
          }));
          fetchHabits(currentPage, false);
          return;
        } catch (e2) {}
      }
      const msg = err?.response?.data?.message || "Failed to save habit entry";
      setAlertErrorMessage(msg);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      setMobileSaving(false);
    }
  };

  const mobileHasChangesRef = useRef(mobileHasChanges);
  const mobileEntryRef = useRef(mobileEntry);

  useEffect(() => {
    mobileHasChangesRef.current = mobileHasChanges;
    mobileEntryRef.current = mobileEntry;
  }, [mobileHasChanges, mobileEntry]);

  useEffect(() => {
    return () => {
      if (mobileHasChangesRef.current) {
        handleSaveMobileEntry(mobileEntryRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleFoodLogsUpdated = () => {
      fetchHabits(currentPage, false);
    };
    window.addEventListener("food-logs-updated", handleFoodLogsUpdated);
    return () => {
      window.removeEventListener("food-logs-updated", handleFoodLogsUpdated);
    };
  }, [currentPage]);

  const handleMainTabChange = (targetTab) => {
    if (targetTab === activeMainTab) return;
    if (activeMainTab === "habit" && mobileHasChanges) {
      handleSaveMobileEntry(mobileEntry);
    }
    setActiveMainTab(targetTab);
  };

  const handleDateShift = (delta) => {
    const nextDate = shiftDate(selectedMobileDate, delta);
    handleSelectDay(nextDate);
  };

  const handleSelectDay = (targetDate) => {
    if (!targetDate || targetDate === selectedMobileDate) return;
    if (mobileHasChanges) {
      const snapshot = { ...mobileEntry };
      handleSaveMobileEntry(snapshot).catch((err) => {
        console.error("Auto-save on date change error:", err);
      });
    }

    const today = getTodayStr();
    if (targetDate > today) {
      const [ty, tm, td] = today.split("-").map(Number);
      const [ny, nm, nd] = targetDate.split("-").map(Number);
      const diffDays = Math.round((new Date(ny, nm - 1, nd) - new Date(ty, tm - 1, td)) / (1000 * 60 * 60 * 24));
      if (diffDays > extraFutureDays) {
        setExtraFutureDays(diffDays);
      }
    }

    // Check if targetDate already exists in data or cache
    const existingInData = data.find((item) => item.date === targetDate);
    const existingInCache = mobileDaysCache[targetDate];
    const source = existingInData || existingInCache;

    if (source && (source._isExisting || source.burned !== undefined || source.water !== undefined)) {
      setMobileEntry({
        ...source,
        date: targetDate,
        burned: Number(source.burned) || 0,
        water: Number(source.water) || 0,
        sleep: Number(source.sleep) || 0,
        read: Number(source.read) || 0,
        intake: Number(source.intake) || 0,
        selfcare: source.selfcare || "",
        mood: source.mood || "",
        journal: source.journal || "",
        _isExisting: true,
      });
    } else {
      // Empty slate for new / future date - ZERO prefill!
      setMobileEntry({
        date: targetDate,
        burned: 0,
        water: 0,
        sleep: 0,
        read: 0,
        intake: 0,
        selfcare: "",
        mood: "",
        journal: "",
        _isExisting: false,
      });
    }
    setMobileHasChanges(false);
    setSelectedMobileDate(targetDate);
  };

  const handleOpenMobileDatePicker = (e) => {
    e?.stopPropagation?.();
    if (mobileDatePickerRef.current) {
      try {
        if (typeof mobileDatePickerRef.current.showPicker === "function") {
          mobileDatePickerRef.current.showPicker();
          return;
        }
      } catch (err) {
        // Fallback for older browsers
      }
      mobileDatePickerRef.current.focus();
    }
  };

  // Auto-scroll selected day into view in horizontal strip
  useEffect(() => {
    if (habitLoading || !daysScrollRef.current || !selectedMobileDate) return;
    const today = getTodayStr();

    const doScroll = () => {
      const container = daysScrollRef.current;
      if (!container) return;

      if (selectedMobileDate === today) {
        // Position Today in 3rd spot (Today - 2 at start, Today - 1 second, Today third, Add Day fourth)
        const twoDaysAgo = shiftDate(today, -2);
        const elTwoAgo = container.querySelector(`[data-date="${twoDaysAgo}"]`);
        if (elTwoAgo) {
          const containerLeft = container.getBoundingClientRect().left;
          const targetLeft = elTwoAgo.getBoundingClientRect().left;
          const offsetDiff = targetLeft - containerLeft;
          container.scrollLeft += (offsetDiff - 6);
          return;
        }

        const elToday = container.querySelector(`[data-date="${today}"]`);
        if (elToday) {
          elToday.scrollIntoView({ inline: "center", block: "nearest" });
          return;
        }
      }

      // If other date selected, center that date
      const el = container.querySelector(`[data-date="${selectedMobileDate}"]`);
      if (el) {
        el.scrollIntoView({
          behavior: isInitialScrollDone.current ? "smooth" : "auto",
          inline: "center",
          block: "nearest",
        });
      }
    };

    // Execute immediately and across ticks to guarantee exact alignment after loading completes
    doScroll();
    const rafId = requestAnimationFrame(doScroll);
    const t1 = setTimeout(doScroll, 80);
    const t2 = setTimeout(doScroll, 250);

    isInitialScrollDone.current = true;

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [selectedMobileDate, extraFutureDays, habitLoading]);

  // Sync data into mobileDaysCache
  useEffect(() => {
    if (data && data.length > 0) {
      setMobileDaysCache((prev) => {
        const next = { ...prev };
        data.forEach((item) => {
          if (item?.date) next[item.date] = item;
        });
        return next;
      });
    }
  }, [data]);

  // Fetch recent habit entries for horizontal strip concentric rings (1 month history)
  useEffect(() => {
    const today = getTodayStr();
    const startDate = shiftDate(today, -35);
    const endDate = shiftDate(today, 10);
    axiosInstance
      .get("/v1/dashboard/habit/table-entry", {
        params: { page: 1, startDate, endDate, limit: 50 },
      })
      .then((res) => {
        const entries = res.data?.data?.formattedEntries || [];
        if (entries.length > 0) {
          setMobileDaysCache((prev) => {
            const next = { ...prev };
            entries.forEach((e) => {
              if (e?.date) next[e.date] = e;
            });
            return next;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Keep mobileDaysCache updated with current mobileEntry edits in real time
  useEffect(() => {
    if (!selectedMobileDate || !mobileEntry || mobileEntry.date !== selectedMobileDate) return;
    if (!mobileHasChanges && !mobileEntry._isExisting) return;
    setMobileDaysCache((prev) => ({
      ...prev,
      [selectedMobileDate]: {
        ...(prev[selectedMobileDate] || {}),
        ...mobileEntry,
      },
    }));
  }, [mobileEntry, selectedMobileDate, mobileHasChanges]);

  // Generate days list: up to 1 Month (30 days) of scrollable past history, plus future days
  const mobileDaysList = (() => {
    const today = getTodayStr();
    const dateSet = new Set();

    let pastDaysLimit = 30; // 1 full month of past days
    if (selectedMobileDate && selectedMobileDate < today) {
      const [ty, tm, td] = today.split("-").map(Number);
      const [sy, sm, sd] = selectedMobileDate.split("-").map(Number);
      const diffPast = Math.round((new Date(ty, tm - 1, td) - new Date(sy, sm - 1, sd)) / (1000 * 60 * 60 * 24));
      if (diffPast > pastDaysLimit) {
        pastDaysLimit = Math.min(120, diffPast + 2);
      }
    }

    for (let i = -pastDaysLimit; i <= extraFutureDays; i++) {
      dateSet.add(shiftDate(today, i));
    }

    if (selectedMobileDate) {
      dateSet.add(selectedMobileDate);
      for (let offset = -2; offset <= 2; offset++) {
        dateSet.add(shiftDate(selectedMobileDate, offset));
      }
    }

    if (data && data.length > 0) {
      data.forEach((item) => {
        if (item?.date) dateSet.add(item.date);
      });
    }

    const list = Array.from(dateSet);
    list.sort();
    return list;
  })();

  const handleAddFutureDay = () => {
    const today = getTodayStr();
    const latestDate = mobileDaysList.length > 0 ? mobileDaysList[mobileDaysList.length - 1] : today;
    const nextDate = shiftDate(latestDate, 1);
    const [ty, tm, td] = today.split("-").map(Number);
    const [ny, nm, nd] = nextDate.split("-").map(Number);
    const diffDays = Math.max(1, Math.round((new Date(ny, nm - 1, nd) - new Date(ty, tm - 1, td)) / (1000 * 60 * 60 * 24)));
    setExtraFutureDays((prev) => Math.max(prev + 1, diffDays));
    handleSelectDay(nextDate);
  };

  const handleSyncAllIntake = async () => {
    try {
      setIsSyncingIntake(true);
      setLoading(true);
      const res = await axiosInstance.post("/v1/dashboard/habit/table-entry/sync-intake", {
        startDate: fromDate || null,
        endDate: toDate || null,
      });

      const syncedCount = res.data?.data?.syncedCount || 0;
      setAlertSuccessMessage(`Successfully synced intake for ${syncedCount} ${syncedCount === 1 ? "date" : "dates"} with food logging!`);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
      await fetchHabits(currentPage);
    } catch (err) {
      console.error("Failed to sync intake with food logging", err);
      const errorMessage = err.response?.data?.message || "Failed to sync intake with food logging!";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      setIsSyncingIntake(false);
      setLoading(false);
    }
  };

  // Add Data Function
  const handleAdd = async (newItem) => {
    try {
      setLoading(true);
      const dateExists = data.some((entry) => entry.date === newItem.date);

      if (dateExists) {
        setAlertErrorMessage("Entry for this date already exists!");
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 4000);
        return;
      }

      calculateProgress(newItem);

      const payload = {
        ...newItem,
        burned: Number(newItem.burned) || 0,
        water: Number(newItem.water) || 0,
        sleep: Number(newItem.sleep) || 0,
        read: Number(newItem.read) || 0,
        intake: Number(newItem.intake) || 0,
        progress: Number(newItem.progress) || 0,
        score: Number(newItem.score) || 0,
        currentPage,
      };

      const response = await axiosInstance.post(
        "/v1/dashboard/habit/table-entry",
        payload
      );
      setAlertSuccessMessage(response.data?.message || "Habit Logged Successfully");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
      await fetchHabits(currentPage);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "Failed To Add Entry!";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Open Entry Popup
  const handleAddEntryClick = () => {
    setIsModalOpen(true);
  };

  // -------------------------------------------------------- Habit Table HTML Data -----------------------------------------------------------
  return (
    <div className="p-1 pb-24 md:pb-6">
      {/* // Alerts Messages */}
      {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={20} />}
      {showSuccessAlert && (
        <SuccessAlert message={alertSuccessMessage} top={20} />
      )}

      {/* Mobile Top Tabs Switcher (Habits vs Food Logging on Phone) */}
      <div className="flex md:hidden items-center justify-between p-1 bg-base-200/80 backdrop-blur-md rounded-2xl border border-base-300/80 mb-3 shadow-2xs">
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 font-bold text-xs rounded-xl transition-all ${
            activeMainTab === "habit"
              ? "bg-primary text-primary-content shadow-sm scale-[1.01]"
              : "text-base-content/70 hover:text-base-content"
          }`}
          onClick={() => handleMainTabChange("habit")}
        >
          <CalendarDays size={15} />
          <span>Habits</span>
        </button>
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 font-bold text-xs rounded-xl transition-all ${
            activeMainTab === "food"
              ? "bg-primary text-primary-content shadow-sm scale-[1.01]"
              : "text-base-content/70 hover:text-base-content"
          }`}
          onClick={() => handleMainTabChange("food")}
        >
          <Utensils size={15} />
          <span>Food Logging</span>
        </button>
      </div>

      {/* Main Tabs Navigation (Desktop only) */}
      <div className="hidden md:flex border-b border-base-300 mb-4 px-2">
        <button
          className={`flex items-center gap-2 py-3 px-5 font-bold text-sm border-b-2 transition-all ${
            activeMainTab === "habit"
              ? "border-primary text-primary bg-primary/5 rounded-t-lg"
              : "border-transparent text-base-content/60 hover:text-base-content"
          }`}
          onClick={() => handleMainTabChange("habit")}
        >
          <CalendarDays size={18} />
          Habit Logging
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-5 font-bold text-sm border-b-2 transition-all ${
            activeMainTab === "food"
              ? "border-primary text-primary bg-primary/5 rounded-t-lg"
              : "border-transparent text-base-content/60 hover:text-base-content"
          }`}
          onClick={() => handleMainTabChange("food")}
        >
          <Utensils size={18} />
          Food Logging
        </button>
      </div>

      {activeMainTab === "food" ? (
        <FoodLoggingTab />
      ) : (
        <>
          {/* Headings (Desktop only) */}
          <div className="hidden md:flex sticky top-[-20px] z-30 bg-base-300 h-[60px] items-center px-4">
            <Heading
              handleAddEntryClick={handleAddEntryClick}
              currentPage={currentPage}
              fetchHabits={fetchHabits}
              setShowErrorAlert={setShowErrorAlert}
              setAlertErrorMessage={setAlertErrorMessage}
              setShowSuccessAlert={setShowSuccessAlert}
              setAlertSuccessMessage={setAlertSuccessMessage}
            />
          </div>


          {habitLoading ? (
            <div className="h-96 flex items-center justify-center py-16 bg-base-300 rounded-xl shadow-md mt-2">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="bg-base-300 table table-fixed table-md">
          <thead className="sticky top-[40px] z-30 bg-base-300 [&_th]:bg-base-300">
            {/* ToolBar */}
            <tr className="border-b-0 border-none">
              <th colSpan="11" className="py-3 px-4">
                <div className="flex justify-between items-center flex-wrap gap-4 text-sm font-normal">
                  {/* Left: Badges */}
                  <div className="flex items-center gap-3">
                    <div className="badge badge-sm badge-soft badge-warning flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Below Min
                    </div>
                    <div className="badge badge-sm badge-soft badge-success flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Within Range
                    </div>
                    <div className="badge badge-sm badge-soft badge-error flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Above Max
                    </div>
                  </div>

                  {/* Entries Limit Dropdown*/}
                  <div className="dropdown dropdown-center">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-sm btn-soft text-xs"
                    >
                      Max Entries: {itemPerPage}
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[999] menu p-2 shadow-md bg-base-100 rounded-box w-20 text-xs"
                    >
                      {[7, 14, 21, 28, 31].map((value) => (
                        <li key={value}>
                          <a
                            className={`justify-center ${itemPerPage === value ? "active" : ""
                              }`}
                            onClick={() => dispatch(setHabitFilters({ itemPerPage: value }))}
                          >
                            {value}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: Quick Select (Year & Month) + From/To Date Pickers */}
                  <div className="flex items-center gap-4 ml-auto flex-wrap">
                    {/* Quick Year and Month Select */}
                    <HabitDateQuickSelect />

                    {/* From Date Picker */}
                    <div className="dropdown dropdown-end floating-label">
                      <div
                        tabIndex={0}
                        role="button"
                        className="input text-xs w-[145px] flex items-center justify-center font-medium"
                      >
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

                    <span>-</span>

                    {/* To Date Picker */}
                    <div className="dropdown dropdown-end floating-label">
                      <div
                        tabIndex={0}
                        role="button"
                        className="input text-xs w-[145px] flex items-center justify-center font-medium"
                      >
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

                    {/* Filter reset Buttons*/}
                    <div className="join">
                      <button
                        className=" join-item btn btn-soft btn-sm btn-success"
                        onClick={() => {
                          fetchHabits(currentPage);
                        }}
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
              </th>
            </tr>

            {/* Heading Row */}
            <tr className="border-t-0">
              <th className="px-3 py-2.5 text-center whitespace-nowrap min-w-[155px]">
                <div className="flex items-center justify-center gap-1.5 font-bold whitespace-nowrap">
                  <span className="whitespace-nowrap">Date</span>
                </div>
              </th>
              {renderColumnHeader("burned", "Burned", "Kcal")}
              {renderColumnHeader("water", "Water", "Ltr")}
              {renderColumnHeader("sleep", "Sleep", "Hrs")}
              {renderColumnHeader("read", "Read", "Hrs")}
              {renderColumnHeader("intake", "Intake", "Kcal")}
              {renderMultiSelectHeader("selfcare", "Self Care", settings.selfcare || [])}
              {renderMultiSelectHeader("mood", "Mood", settings.mood || [])}
              {renderMultiSelectHeader("progress", "Progress", ["Inconsistent", "Uncertain", "Moderate", "Consistent"])}

              <th className="px-3 py-2.5 text-center whitespace-nowrap min-w-[95px]">
                <div className="flex justify-center items-center gap-1.5 font-bold whitespace-nowrap">
                  <span className="whitespace-nowrap">Score</span>
                </div>
              </th>

              <th className="px-3 py-2.5 text-center whitespace-nowrap min-w-[95px]">
                <div className="flex justify-center items-center gap-1.5 font-bold whitespace-nowrap">
                  <span className="whitespace-nowrap">Actions</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredData.length === 0 ? (
              // Message Row for empty Data
              <tr>
                <td
                  colSpan="11"
                  className="h-[60vh] text-center align-middle bg-base-200"
                >
                  <div className="flex flex-col justify-center items-center h-full space-y-4">
                    <div className="text-2xl font-semibold">
                      No habit entries match the current filter
                    </div>
                    <div className="text-md">
                      Try adjusting or resetting your column filters to see more entries.
                    </div>
                    <button
                      className="btn btn-soft btn-primary btn-sm px-6"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((item) =>
                editingItem?.date === item.date ? (
                  // ---------- Input Row --------
                  <tr key={item.date} className="text-center">
                    {/* Date */}
                    <td className="text-sm whitespace-nowrap">{formatDate(item.date)}</td>

                    {/* Burned */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10000"
                        onKeyDown={handleKeyDown}
                        name="burned"
                        className="btn btn-sm w-full max-w-[80px] hover:cursor-text bg-base-100"
                        value={editingItem.burned}
                        onChange={handleChange}
                      />
                    </td>

                    {/* Water */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        onKeyDown={handleKeyDown}
                        name="water"
                        className="btn btn-sm w-full max-w-[80px] hover:cursor-text bg-base-100"
                        value={editingItem.water}
                        onChange={handleChange}
                      />
                    </td>

                    {/* Sleep */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        onKeyDown={handleKeyDown}
                        name="sleep"
                        className="btn btn-sm w-full max-w-[80px] hover:cursor-text bg-base-100"
                        value={editingItem.sleep}
                        onChange={handleChange}
                      />
                    </td>

                    {/* Read */}
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        onKeyDown={handleKeyDown}
                        name="read"
                        className="btn btn-sm w-full max-w-[80px] hover:cursor-text bg-base-100"
                        value={editingItem.read}
                        onChange={handleChange}
                      />
                    </td>

                    {/* Intake */}
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100000"
                          onKeyDown={handleKeyDown}
                          name="intake"
                          className="btn btn-sm w-full max-w-[80px] hover:cursor-text bg-base-100"
                          value={editingItem.intake}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost btn-circle text-primary"
                          onClick={handleInlineCalculateFood}
                          title="Calculate from Food Logging for this date"
                        >
                          <Utensils size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Self Care */}
                    <td>
                      <div className="dropdown dropdown-bottom dropdown-center">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-sm m-1 w-[100px] text-center"
                        >
                          {editingItem.selfcare ||
                            "_".repeat(settings.selfcare.length || 3)}
                        </div>

                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-200 rounded-box z-[1] w-48 p-2 shadow"
                        >
                          {settings.selfcare && settings.selfcare.length > 0 ? (
                            [...settings.selfcare].map((habit, index) => {
                              const currentValue =
                                editingItem.selfcare ||
                                "_".repeat(settings.selfcare.length);

                              const isChecked =
                                currentValue[index] === habit[0].toUpperCase();

                              return (
                                <li key={habit}>
                                  <label className="label cursor-pointer justify-start gap-2">
                                    <input
                                      type="checkbox"
                                      className="checkbox checkbox-sm"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const updated = currentValue
                                          .padEnd(settings.selfcare.length, "_")
                                          .split("")
                                          .map((char, i) =>
                                            i === index
                                              ? e.target.checked
                                                ? habit[0].toUpperCase()
                                                : "_"
                                              : char
                                          )
                                          .join("");

                                        handleChange({
                                          target: {
                                            name: "selfcare",
                                            value: updated,
                                          },
                                        });
                                      }}
                                    />
                                    <span className="label-text">{habit}</span>
                                  </label>
                                </li>
                              );
                            })
                          ) : (
                            <li className="text-sm text-center text-gray-400 px-2 py-1 flex flex-col items-center gap-1">
                              No Self Care Habits has been set, Please click the
                              setting button to set the Self Care Habits
                              <a
                                href="/settings"
                                className="text-primary hover:text-primary-focus"
                              >
                                <Settings className="w-5 h-5" />
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>

                    {/* Mood */}
                    <td>
                      <div className="dropdown dropdown-bottom dropdown-center">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-sm m-1 w-[100px] text-center"
                        >
                          {editingItem.mood || "Select ⬇️"}
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-200 rounded-box z-[1] w-30 p-2 shadow-sm"
                        >
                          {[...settings.mood].map((mood) => (
                            <li key={mood}>
                              <a
                                onClick={() =>
                                  handleChange({
                                    target: { name: "mood", value: mood },
                                  })
                                }
                                className={
                                  editingItem.mood === mood
                                    ? "font-bold text-primary"
                                    : ""
                                }
                              >
                                {mood}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>

                    {/* Progress */}
                    <td>
                      <td className="flex flex-col items-center justify-center gap-2 py-2">
                        <span
                          className={`text-xs ${getConsistencyColor(
                            calculateProgress(editingItem)
                          )}`}
                        >
                          {getConsistencyLabel(calculateProgress(editingItem))}
                        </span>
                        <progress
                          className={`progress w-20 ${getProgressColorClass(
                            calculateProgress(editingItem)
                          )}`}
                          value={calculateProgress(editingItem)}
                          max="100"
                        ></progress>
                      </td>
                    </td>

                    {/* Score */}
                    <td>
                      <div
                        className="tooltip tooltip-right"
                        data-tip="Daily Score out of 7"
                      >
                        <span
                          className={`badge badge-lg ${getScoreColor(
                            calculateScore(editingItem)
                          )}`}
                        >
                          {calculateScore(editingItem)} / 7
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-center w-[120px]">
                      <div className="flex justify-center gap-2">
                        <button
                          className="btn btn-soft btn-circle btn-success btn-sm"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          <Save />
                        </button>
                        <button
                          className="btn btn-soft btn-circle btn-warning btn-sm"
                          onClick={() => setEditingItem(null)}
                        >
                          <Cancel />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // ---------- Normal Row ----------
                  <tr key={item.date} className="text-center">
                    {/* Date */}
                    <td className="border border-base-100 text-sm whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>

                    {/* Burned */}
                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "burned",
                        item.burned || 0,
                        settings
                      )}`}
                    >
                      {item.burned || 0} Kcal
                    </td>

                    {/* Water */}
                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "water",
                        item.water || 0,
                        settings
                      )}`}
                    >
                      {item.water || 0} Ltr
                    </td>

                    {/* Sleep */}
                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "sleep",
                        item.sleep || 0,
                        settings
                      )}`}
                    >
                      {item.sleep || 0} Hrs
                    </td>

                    {/* Read */}
                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "read",
                        item.read || 0,
                        settings
                      )}`}
                    >
                      {item.read || 0} Hrs
                    </td>

                    {/* Intake */}
                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "intake",
                        item.intake || 0,
                        settings
                      )}`}
                    >
                      {item.intake || 0} Kcal
                    </td>

                    {/* SelfCare */}
                    <td className="text-sm border border-base-100 truncate">
                      {item.selfcare || "_".repeat(settings.selfcare.length)}
                    </td>

                    {/* Mood */}
                    <td className="text-sm border border-base-100 truncate">
                      {item.mood || "---"}
                    </td>

                    {/* Progress Bar */}
                    <td className="flex flex-col items-center justify-center gap-2 py-2">
                      <span
                        className={`text-xs ${getConsistencyColor(
                          calculateProgress(item)
                        )}`}
                      >
                        {getConsistencyLabel(calculateProgress(item))}
                      </span>
                      <progress
                        className={`progress w-20 ${getProgressColorClass(
                          calculateProgress(item)
                        )}`}
                        value={calculateProgress(item)}
                        max="100"
                      ></progress>
                    </td>

                    {/* Score */}
                    <td>
                      <div
                        className="tooltip tooltip-right"
                        data-tip="Daily Score out of 7"
                      >
                        <span
                          className={`badge badge-lg ${getScoreColor(
                            calculateScore(item)
                          )}`}
                        >
                          {calculateScore(item)} / 7
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-center w-[120px]">
                      <div className="flex justify-center gap-2">
                        <button
                          className={`btn btn-circle btn-sm ${item.journal && item.journal.trim().length > 0 ? "btn-primary" : "btn-ghost text-base-content/30"}`}
                          onClick={() => handleJournalClick(item)}
                          title={item.journal ? "View/Edit Journal" : "Add Journal"}
                        >
                          <Book size={16} />
                        </button>
                        <button
                          className="btn btn-soft btn-circle btn-info btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-soft btn-circle btn-error btn-sm"
                          onClick={() => handleDeleteClick(item.date)}
                        >
                          <Trash size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Day-by-Day View (md:hidden) */}
      <div className="md:hidden space-y-3 mt-1 pb-6">
        {/* Mobile Concentric Rings Day Navigator Header (Horizontal Scrollable) */}
        {(() => {
          const dayMeta = formatDayDisplay(selectedMobileDate);
          const score = calculateScore(mobileEntry);
          const progress = calculateProgress(mobileEntry);
          const todayStr = getTodayStr();

          return (
            <div className="sticky top-[-16px] z-30 bg-base-100/95 backdrop-blur-xl border border-base-300/80 rounded-2xl p-2.5 shadow-sm mb-3 space-y-2">
              {/* Top row: Date first, then button to scroll back to today, and arrow marks */}
              <div className="flex items-center justify-between px-1 text-xs">
                {/* Date first */}
                <button
                  type="button"
                  onClick={() => {
                    const [y, m, d] = (selectedMobileDate || getTodayStr()).split("-").map(Number);
                    setCalendarViewDate(new Date(y, m - 1, d || 1));
                    setIsCalendarOpen(true);
                  }}
                  className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-base-200/80 hover:bg-base-200 border border-base-300/80 cursor-pointer transition-all active:scale-95 group shadow-2xs select-none"
                  title="Open Calendar"
                >
                  <Calendar size={13} className="text-primary shrink-0" />
                  <span className="font-extrabold text-base-content text-xs tracking-tight">
                    {dayMeta.full}
                  </span>
                  <ChevronDown size={11} className="text-base-content/40 group-hover:text-primary transition-colors shrink-0" />
                </button>

                {/* Button to scroll back to today and arrow marks */}
                <div className="flex items-center gap-1">
                  {!dayMeta.isToday && (
                    <button
                      type="button"
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full cursor-pointer transition-all active:scale-95 border border-primary/20"
                      onClick={() => handleSelectDay(todayStr)}
                      title="Scroll back to Today"
                    >
                      <RotateCcw size={10} /> Today
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-ghost btn-circle btn-xs text-base-content/70 hover:bg-base-200"
                    onClick={() => handleDateShift(-1)}
                    title="Previous Day"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-circle btn-xs text-base-content/70 hover:bg-base-200"
                    onClick={() => handleDateShift(1)}
                    title="Next Day"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Rings Legend Bar */}
              <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-base-200/50 text-[10px] font-semibold text-base-content/70 border border-base-content/5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500 inline-block shrink-0 shadow-2xs" />
                  <span>Burned</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0 shadow-2xs" />
                  <span>Intake</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block shrink-0 shadow-2xs" />
                  <span>Water</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 inline-block shrink-0 shadow-2xs" />
                  <span>Sleep</span>
                </span>
              </div>

              {/* Horizontal Scrollable Strip of Days */}
              <div
                ref={daysScrollRef}
                className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scroll-smooth scroll-hidden select-none"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {mobileDaysList.map((dStr) => {
                  const isSelected = dStr === selectedMobileDate;
                  const isToday = dStr === todayStr;
                  const entry = dStr === selectedMobileDate ? mobileEntry : (mobileDaysCache[dStr] || {});

                  // Goals from settings
                  const burnedGoal = settings?.burned?.min || 500;
                  const intakeGoal = settings?.intake?.min || 2000;
                  const waterGoal = settings?.water?.min || 3;
                  const sleepGoal = settings?.sleep?.min || 7;

                  // Values
                  const burnedVal = Number(entry.burned) || 0;
                  const intakeVal = Number(entry.intake) || 0;
                  const waterVal = Number(entry.water) || 0;
                  const sleepVal = Number(entry.sleep) || 0;

                  // Percentages (0 to 100)
                  const pctBurned = Math.min(100, Math.max(0, Math.round((burnedVal / burnedGoal) * 100)));
                  const pctIntake = Math.min(100, Math.max(0, Math.round((intakeVal / intakeGoal) * 100)));
                  const pctWater = Math.min(100, Math.max(0, Math.round((waterVal / waterGoal) * 100)));
                  const pctSleep = Math.min(100, Math.max(0, Math.round((sleepVal / sleepGoal) * 100)));

                  // Date breakdown (Day, Date, Month - no year)
                  const [y, m, d] = dStr.split("-").map(Number);
                  const dt = new Date(y, m - 1, d);
                  const dayName = dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                  const dateNum = dt.getDate();
                  const monthName = dt.toLocaleDateString("en-US", { month: "short" });

                  // Circumferences for 92x92 viewBox:
                  // r1=41 (Burned) -> 257.61
                  // r2=35 (Intake) -> 219.91
                  // r3=29 (Water)  -> 182.21
                  // r4=23 (Sleep)  -> 144.51
                  const c1 = 257.61;
                  const c2 = 219.91;
                  const c3 = 182.21;
                  const c4 = 144.51;

                  const off1 = c1 - (pctBurned / 100) * c1;
                  const off2 = c2 - (pctIntake / 100) * c2;
                  const off3 = c3 - (pctWater / 100) * c3;
                  const off4 = c4 - (pctSleep / 100) * c4;

                  return (
                    <div
                      key={dStr}
                      data-date={dStr}
                      onClick={() => handleSelectDay(dStr)}
                      className={`shrink-0 flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? "bg-base-200 border-2 border-primary shadow-md scale-105"
                          : "bg-base-100 hover:bg-base-200/50 border border-base-300/70 opacity-80 hover:opacity-100"
                      }`}
                      style={{ width: "80px" }}
                    >
                      {/* Concentric Circles SVG (4 Rings + Day Date Month in middle) */}
                      <svg viewBox="0 0 92 92" className="w-[70px] h-[70px] my-0.5 pointer-events-none">
                        <g transform="rotate(-90 46 46)">
                          {/* Ring 1 (Upper/Outer): Calories Burned (#f97316) */}
                          <circle cx="46" cy="46" r="41" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.12" />
                          {pctBurned > 0 && (
                            <circle
                              cx="46"
                              cy="46"
                              r="41"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="3"
                              strokeDasharray={c1}
                              strokeDashoffset={off1}
                              strokeLinecap="round"
                              className="transition-all duration-500 ease-out"
                            />
                          )}

                          {/* Ring 2: Calorie Intake (#10b981) */}
                          <circle cx="46" cy="46" r="35" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.12" />
                          {pctIntake > 0 && (
                            <circle
                              cx="46"
                              cy="46"
                              r="35"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeDasharray={c2}
                              strokeDashoffset={off2}
                              strokeLinecap="round"
                              className="transition-all duration-500 ease-out"
                            />
                          )}

                          {/* Ring 3: Water Intake (#06b6d4) */}
                          <circle cx="46" cy="46" r="29" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.12" />
                          {pctWater > 0 && (
                            <circle
                              cx="46"
                              cy="46"
                              r="29"
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="3"
                              strokeDasharray={c3}
                              strokeDashoffset={off3}
                              strokeLinecap="round"
                              className="transition-all duration-500 ease-out"
                            />
                          )}

                          {/* Ring 4 (Inner): Sleep Duration (#8b5cf6) */}
                          <circle cx="46" cy="46" r="23" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.12" />
                          {pctSleep > 0 && (
                            <circle
                              cx="46"
                              cy="46"
                              r="23"
                              fill="none"
                              stroke="#8b5cf6"
                              strokeWidth="3"
                              strokeDasharray={c4}
                              strokeDashoffset={off4}
                              strokeLinecap="round"
                              className="transition-all duration-500 ease-out"
                            />
                          )}
                        </g>

                        {/* Middle text: Day, Date, Month (No year) */}
                        <text
                          x="46"
                          y="38"
                          textAnchor="middle"
                          className="fill-base-content/60 font-bold"
                          fontSize="7.5"
                          letterSpacing="0.04em"
                        >
                          {dayName}
                        </text>
                        <text
                          x="46"
                          y="50"
                          textAnchor="middle"
                          className={`font-black ${isSelected ? "fill-primary" : "fill-base-content"}`}
                          fontSize="13"
                        >
                          {dateNum}
                        </text>
                        <text
                          x="46"
                          y="60"
                          textAnchor="middle"
                          className="fill-base-content/60 font-semibold"
                          fontSize="7.5"
                        >
                          {monthName}
                        </text>
                      </svg>

                      {/* Bottom Status / Score */}
                      <div className="text-[10px] font-bold truncate text-center pointer-events-none">
                        {entry?.score !== undefined && entry?.score !== null && String(entry?.score) !== "" ? (
                          <span className={getScoreColor(Number(entry.score))}>
                            ★ {entry.score}/7
                          </span>
                        ) : (
                          <span className="text-base-content/30 text-[9px] font-normal">--</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* "+" Button at the end of the list to add future dates */}
                <button
                  type="button"
                  onClick={handleAddFutureDay}
                  title="Add next future date"
                  className="shrink-0 flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 bg-base-100/60 text-primary transition-all cursor-pointer active:scale-95 group shadow-2xs"
                  style={{ width: "80px", height: "114px" }}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-content transition-all shadow-2xs">
                    <Plus size={18} className="stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-center mt-2 group-hover:text-primary transition-colors">
                    Add Day
                  </span>
                  <span className="text-[8px] font-bold text-base-content/50 text-center">
                    + Future
                  </span>
                </button>
              </div>
            </div>
          );
        })()}

        {mobileLoading ? (
          <div className="h-64 flex items-center justify-center bg-base-200/50 rounded-2xl border border-base-300">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* 1. Calorie Intake (Visual Semi-Circle Energy Arc) */}
            {(() => {
              const intakeVal = Number(mobileEntry.intake) || 0;
              const intakeTarget = settings?.intake?.max || 2500;
              const intakePct = Math.min(100, Math.max(0, (intakeVal / (intakeTarget || 1)) * 100));
              const arcLen = 213.63;
              const strokeOffset = arcLen - (intakePct / 100) * arcLen;

              return (
                <div className="bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍽️</span>
                      <div>
                        <h4 className="text-xs font-bold text-base-content">Calorie Intake</h4>
                        <span className="text-[10px] text-base-content/60 font-medium">
                          Goal: {settings?.intake?.min || 0} - {intakeTarget} kcal
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge badge-xs font-bold ${
                        intakeVal === 0 && !mobileEntry._isExisting
                          ? "badge-ghost text-base-content/50"
                          : getColorClass("intake", intakeVal, settings)
                      }`}
                    >
                      {intakeVal === 0 && !mobileEntry._isExisting
                        ? "Not Logged"
                        : intakeVal < (settings?.intake?.min || 0)
                        ? "Below Min"
                        : intakeVal > intakeTarget
                        ? "Above Max"
                        : "Optimal"}
                    </span>
                  </div>

                  {/* Visual Semi-Circle Energy Gauge (Enlarged Arc + Well-Proportioned Number) */}
                  <div className="flex flex-col items-center justify-center pt-1 pb-0 relative">
                    <svg viewBox="0 0 180 102" className="w-56 max-w-full overflow-visible">
                      <defs>
                        <linearGradient id="intakeSemiGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                      {/* Background Track */}
                      <path
                        d="M 22 88 A 68 68 0 0 1 158 88"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="9.5"
                        strokeLinecap="round"
                        className="text-base-300/70 dark:text-base-content/10"
                      />
                      {/* Progress Arc */}
                      <path
                        d="M 22 88 A 68 68 0 0 1 158 88"
                        fill="none"
                        stroke="url(#intakeSemiGrad)"
                        strokeWidth="9.5"
                        strokeLinecap="round"
                        strokeDasharray={arcLen}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-300 ease-out"
                      />
                      {/* Center Value (Shortened & Proportioned) */}
                      <text
                        x="90"
                        y="68"
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="900"
                        className="fill-current tracking-tight text-base-content font-mono"
                      >
                        {intakeVal}
                      </text>
                      <text
                        x="90"
                        y="80"
                        textAnchor="middle"
                        fontSize="7.5"
                        fontWeight="700"
                        letterSpacing="0.05em"
                        className="fill-emerald-500 uppercase"
                      >
                        kcal consumed
                      </text>
                      {/* Left/Right labels */}
                      <text x="22" y="98" textAnchor="middle" fontSize="7.5" fontWeight="600" className="fill-base-content/40">
                        0
                      </text>
                      <text x="158" y="98" textAnchor="middle" fontSize="7.5" fontWeight="600" className="fill-base-content/40">
                        {intakeTarget}
                      </text>
                    </svg>
                  </div>

                  {/* Input & "From Food" Auto-Fetch Icon */}
                  <div className="pt-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          max="100000"
                          className="input input-sm input-bordered w-full font-bold text-base bg-base-200/50 pr-12"
                          value={mobileEntry.intake === 0 && !mobileHasChanges ? "" : mobileEntry.intake}
                          placeholder="0"
                          onChange={(e) => handleMobileFieldChange("intake", e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-base-content/50 pointer-events-none">
                          kcal
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-circle btn-soft btn-primary shrink-0 transition-transform active:scale-95 shadow-2xs"
                        onClick={handleMobileFetchFoodIntake}
                        disabled={isFetchingFoodMobile}
                        title="Fetch & sync calories from Food Logging for this date"
                        aria-label="Sync from Food Logging"
                      >
                        <Utensils size={15} className={isFetchingFoodMobile ? "animate-spin text-primary" : "text-primary"} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. Water Intake (Visual Filling Glass with Fixed Position & Clear Markings) */}
            {(() => {
              const waterVal = Number(mobileEntry.water) || 0;
              const targetWater = settings?.water?.max || 3.0;
              const waterPct = Math.min(100, Math.max(0, (waterVal / (targetWater || 1)) * 100));

              // Fixed glass geometry in viewBox 0 0 100 135:
              const fillHeight = (waterPct / 100) * 100;
              const waterY = 118 - fillHeight;
              const widthAtY = 44 + (fillHeight / 100) * 16;

              const mark100 = targetWater % 1 === 0 ? `${targetWater}L` : `${targetWater.toFixed(1)}L`;
              const mark75 = `${(targetWater * 0.75).toFixed(1)}L`;
              const mark50 = `${(targetWater * 0.5).toFixed(1)}L`;
              const mark25 = `${(targetWater * 0.25).toFixed(1)}L`;

              return (
                <div className="bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💧</span>
                      <div>
                        <h4 className="text-xs font-bold text-base-content">Water Intake</h4>
                        <span className="text-[10px] text-base-content/60 font-medium">
                          Goal: {settings?.water?.min || 0} - {targetWater} Ltr
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge badge-xs font-bold ${
                        waterVal === 0 && !mobileEntry._isExisting
                          ? "badge-ghost text-base-content/50"
                          : getColorClass("water", waterVal, settings)
                      }`}
                    >
                      {waterVal === 0 && !mobileEntry._isExisting
                        ? "Not Logged"
                        : waterVal < (settings?.water?.min || 0)
                        ? "Below Min"
                        : waterVal > targetWater
                        ? "Above Max"
                        : "Optimal"}
                    </span>
                  </div>

                  {/* Visual Filling Glass (Rock-Solid Fixed Layout, will never shift or move) */}
                  <div className="grid grid-cols-[100px_1fr] items-center gap-3 py-1">
                    {/* Left Column: Fixed Width Glass Container (100px wide, perfectly fixed) */}
                    <div className="w-[100px] h-[135px] shrink-0 flex items-center justify-center select-none">
                      <svg viewBox="0 0 100 135" className="w-full h-full overflow-visible drop-shadow-sm pointer-events-none">
                        <defs>
                          <clipPath id="glassInteriorClip">
                            <polygon points="20,18 80,18 72,118 28,118" />
                          </clipPath>
                          <linearGradient id="waterFlowGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="60%" stopColor="#0284c7" />
                            <stop offset="100%" stopColor="#0369a1" />
                          </linearGradient>
                        </defs>

                        {/* Empty Glass Inner Background */}
                        <polygon
                          points="20,18 80,18 72,118 28,118"
                          fill="currentColor"
                          className="text-base-200/60 dark:text-base-content/5"
                        />

                        {/* Animated Rising Water Liquid */}
                        {waterPct > 0 && (
                          <g clipPath="url(#glassInteriorClip)">
                            <rect
                              x="15"
                              y={waterY}
                              width="70"
                              height="115"
                              fill="url(#waterFlowGrad2)"
                              className="transition-all duration-500 ease-out"
                            />
                            {/* Water Surface Ellipse */}
                            <ellipse
                              cx="50"
                              cy={waterY}
                              rx={widthAtY / 2}
                              ry="3"
                              fill="#7dd3fc"
                              opacity="0.9"
                              className="transition-all duration-500 ease-out"
                            />
                            {/* Subtle bubble accents */}
                            <circle cx="42" cy={Math.min(110, waterY + 25)} r="1.5" fill="#ffffff" opacity="0.6" />
                            <circle cx="58" cy={Math.min(112, waterY + 45)} r="2" fill="#ffffff" opacity="0.5" />
                          </g>
                        )}

                        {/* Glass Physical Body Outline */}
                        <polygon
                          points="20,18 80,18 72,118 28,118"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinejoin="round"
                          className="text-base-content/35"
                        />
                        {/* Top Rim Ellipse */}
                        <ellipse
                          cx="50"
                          cy="18"
                          rx="30"
                          ry="4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-base-content/35"
                        />
                        {/* Glass Base Thickness */}
                        <line x1="28" y1="118" x2="72" y2="118" stroke="currentColor" strokeWidth="4" className="text-base-content/40" />

                        {/* Clear Measurement Graduation Markings on Glass (TICK LINES & LABELS) */}
                        <g className="font-mono text-[7px] font-black select-none pointer-events-none">
                          {/* 100% Mark */}
                          <line x1="60" y1="20" x2="76" y2="20" stroke="currentColor" strokeWidth="1.8" className="text-base-content/70" />
                          <text x="57" y="22.5" textAnchor="end" fill="currentColor" className="fill-base-content/80 font-bold">
                            {mark100}
                          </text>

                          {/* 75% Mark */}
                          <line x1="62" y1="44.5" x2="74" y2="44.5" stroke="currentColor" strokeWidth="1.5" className="text-base-content/60" />
                          <text x="59" y="47" textAnchor="end" fill="currentColor" className="fill-base-content/70">
                            {mark75}
                          </text>

                          {/* 50% Mark */}
                          <line x1="64" y1="69" x2="73" y2="69" stroke="currentColor" strokeWidth="1.5" className="text-base-content/60" />
                          <text x="61" y="71.5" textAnchor="end" fill="currentColor" className="fill-base-content/70">
                            {mark50}
                          </text>

                          {/* 25% Mark */}
                          <line x1="66" y1="93.5" x2="72" y2="93.5" stroke="currentColor" strokeWidth="1.5" className="text-base-content/60" />
                          <text x="63" y="96" textAnchor="end" fill="currentColor" className="fill-base-content/70">
                            {mark25}
                          </text>
                        </g>
                      </svg>
                    </div>

                    {/* Right Column: Statistics & Goal Readout (Isolated, cannot move or shift the glass!) */}
                    <div className="min-w-0 space-y-1.5 pl-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-base-content tracking-tight">
                          {waterVal}
                        </span>
                        <span className="text-xs font-bold text-base-content/60">
                          / {targetWater} Ltr
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-base-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${waterPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                          {Math.round(waterPct)}%
                        </span>
                      </div>

                      <p className="text-[11px] text-base-content/70 font-medium truncate">
                        {waterPct >= 100
                          ? "Hydration Goal Achieved! 🎉"
                          : `${Math.max(0, Math.round((targetWater - waterVal) * 10) / 10)} Ltr remaining`}
                      </p>
                    </div>
                  </div>

                  {/* Input & Quick Steppers */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          className="input input-sm input-bordered w-full font-bold text-base bg-base-200/50 pr-10"
                          value={mobileEntry.water === 0 && !mobileHasChanges ? "" : mobileEntry.water}
                          placeholder="0.0"
                          onChange={(e) => handleMobileFieldChange("water", e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-base-content/50 pointer-events-none">
                          Ltr
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-xs btn-soft text-[11px] font-semibold text-sky-600 dark:text-sky-400"
                          onClick={() => handleMobileFieldChange("water", Math.round(((Number(mobileEntry.water) || 0) + 0.25) * 100) / 100)}
                        >
                          +0.25L 🥛
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-soft text-[11px] font-semibold text-sky-600 dark:text-sky-400"
                          onClick={() => handleMobileFieldChange("water", Math.round(((Number(mobileEntry.water) || 0) + 0.5) * 100) / 100)}
                        >
                          +0.5L 🍶
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. Calories Burned (Enlarged Arc + Well-Proportioned Number) */}
            {(() => {
              const burnedVal = Number(mobileEntry.burned) || 0;
              const burnedTarget = settings?.burned?.max || 500;
              const burnedPct = Math.min(100, Math.max(0, (burnedVal / (burnedTarget || 1)) * 100));
              const arcLen = 213.63;
              const strokeOffset = arcLen - (burnedPct / 100) * arcLen;

              return (
                <div className="bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔥</span>
                      <div>
                        <h4 className="text-xs font-bold text-base-content">Calories Burned</h4>
                        <span className="text-[10px] text-base-content/60 font-medium">
                          Goal: {settings?.burned?.min || 0} - {burnedTarget} kcal
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge badge-xs font-bold ${
                        burnedVal === 0 && !mobileEntry._isExisting
                          ? "badge-ghost text-base-content/50"
                          : getColorClass("burned", burnedVal, settings)
                      }`}
                    >
                      {burnedVal === 0 && !mobileEntry._isExisting
                        ? "Not Logged"
                        : burnedVal < (settings?.burned?.min || 0)
                        ? "Below Min"
                        : burnedVal > burnedTarget
                        ? "Above Max"
                        : "Optimal"}
                    </span>
                  </div>

                  {/* Visual Semi-Circle Gauge (Enlarged Arc + Well-Proportioned Number) */}
                  <div className="flex flex-col items-center justify-center pt-1 pb-0 relative">
                    <svg viewBox="0 0 180 102" className="w-56 max-w-full overflow-visible">
                      <defs>
                        <linearGradient id="burnedSemiGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                      {/* Background Track */}
                      <path
                        d="M 22 88 A 68 68 0 0 1 158 88"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="9.5"
                        strokeLinecap="round"
                        className="text-base-300/70 dark:text-base-content/10"
                      />
                      {/* Progress Arc */}
                      <path
                        d="M 22 88 A 68 68 0 0 1 158 88"
                        fill="none"
                        stroke="url(#burnedSemiGrad)"
                        strokeWidth="9.5"
                        strokeLinecap="round"
                        strokeDasharray={arcLen}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-300 ease-out"
                      />
                      {/* Center Value (Shortened & Proportioned) */}
                      <text
                        x="90"
                        y="68"
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="900"
                        className="fill-current tracking-tight text-base-content font-mono"
                      >
                        {burnedVal}
                      </text>
                      <text
                        x="90"
                        y="80"
                        textAnchor="middle"
                        fontSize="7.5"
                        fontWeight="700"
                        letterSpacing="0.05em"
                        className="fill-orange-500 uppercase"
                      >
                        kcal burned
                      </text>
                      {/* Left/Right labels */}
                      <text x="22" y="98" textAnchor="middle" fontSize="7.5" fontWeight="600" className="fill-base-content/40">
                        0
                      </text>
                      <text x="158" y="98" textAnchor="middle" fontSize="7.5" fontWeight="600" className="fill-base-content/40">
                        {burnedTarget}
                      </text>
                    </svg>
                  </div>

                  {/* Input & Quick Steppers */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="10000"
                        className="input input-sm input-bordered w-full font-bold text-base bg-base-200/50 pr-12"
                        value={mobileEntry.burned === 0 && !mobileHasChanges ? "" : mobileEntry.burned}
                        placeholder="0"
                        onChange={(e) => handleMobileFieldChange("burned", e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-base-content/50 pointer-events-none">
                        kcal
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("burned", Math.max(0, (Number(mobileEntry.burned) || 0) - 50))}
                      >
                        -50
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("burned", (Number(mobileEntry.burned) || 0) + 50)}
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("burned", (Number(mobileEntry.burned) || 0) + 100)}
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 4. Sleep Duration (Interactive Animated Celestial Illustration) */}
            {(() => {
              const sleepVal = Number(mobileEntry.sleep) || 0;
              const sleepTarget = settings?.sleep?.max || 8;
              const rawSleepPct = (sleepVal / (sleepTarget || 1)) * 100;
              const sleepPct = Math.min(100, Math.max(0, rawSleepPct));
              const sleepPctDisplay = sleepVal > 0 ? (Number.isInteger(sleepPct) ? sleepPct : sleepPct.toFixed(2)) : 0;

              let sleepQuality = "No sleep logged";
              if (sleepVal > 0 && sleepVal < 6) sleepQuality = "Short Sleep";
              else if (sleepVal >= 6 && sleepVal < 7) sleepQuality = "Light Rest";
              else if (sleepVal >= 7 && sleepVal <= 9) sleepQuality = "Restful & Optimal";
              else if (sleepVal > 9) sleepQuality = "Deep Recovery";

              // Moon geometry: height is 90px (from y=16 to y=106)
              const moonClipH = (sleepPct / 100) * 94;
              const moonClipY = 108 - moonClipH;

              return (
                <div className="bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  {/* Header (No emoji icon) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-base-content">Sleep Duration</h4>
                      <span className="text-[10px] text-base-content/60 font-medium">
                        Goal: {settings?.sleep?.min || 0} - {sleepTarget} hrs
                      </span>
                    </div>
                    <span
                      className={`badge badge-xs font-bold ${
                        sleepVal === 0 && !mobileEntry._isExisting
                          ? "badge-ghost text-base-content/50"
                          : getColorClass("sleep", sleepVal, settings)
                      }`}
                    >
                      {sleepVal === 0 && !mobileEntry._isExisting
                        ? "Not Logged"
                        : sleepVal < (settings?.sleep?.min || 0)
                        ? "Below Min"
                        : sleepVal > sleepTarget
                        ? "Above Max"
                        : "Optimal"}
                    </span>
                  </div>

                  {/* Animated Celestial Illustration: Floating Moon & Twinkling Stars */}
                  <div className="flex flex-col items-center justify-center pt-1 pb-0 relative">
                    <svg viewBox="0 0 190 120" className="w-56 h-36 overflow-visible select-none pointer-events-none">
                      <defs>
                        <linearGradient id="moonWhiteGrad" x1="0" y1="0" x2="0.8" y2="1">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="60%" stopColor="#f8fafc" />
                          <stop offset="100%" stopColor="#e2e8f0" />
                        </linearGradient>
                        <linearGradient id="starYellowGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                        <linearGradient id="shootingStarGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
                          <stop offset="80%" stopColor="#fde047" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                        </linearGradient>
                        <clipPath id="moonFillClip">
                          <rect
                            x="15"
                            y={moonClipY}
                            width="160"
                            height={moonClipH}
                            className="transition-all duration-700 ease-out"
                          />
                        </clipPath>
                      </defs>

                      <style>{`
                        @keyframes sleepMoonFloat {
                          0%, 100% { transform: translateY(0px); }
                          50% { transform: translateY(-4px); }
                        }
                        @keyframes starTwinkle1 {
                          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; }
                          50% { transform: scale(1.3) rotate(25deg); opacity: 1; filter: drop-shadow(0 0 6px #facc15); }
                        }
                        @keyframes starTwinkle2 {
                          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
                          50% { transform: scale(1.25) rotate(-20deg); opacity: 1; filter: drop-shadow(0 0 5px #facc15); }
                        }
                        @keyframes starTwinkle3 {
                          0%, 100% { transform: scale(1); opacity: 0.75; }
                          50% { transform: scale(1.28); opacity: 1; filter: drop-shadow(0 0 5px #facc15); }
                        }
                      `}</style>

                      {/* 1. Base Unfilled Night Outlines (Matches DaisyUI theme tokens seamlessly) */}
                      <g className="text-base-content/25">
                        {/* Crescent Moon Outline */}
                        <path
                          d="M 76 18 A 43 43 0 1 0 76 104 C 98 84 98 38 76 18 Z"
                          fill="currentColor"
                          fillOpacity="0.04"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />
                        {/* Soft Night Cloud under the Moon */}
                        <path
                          d="M 44 98 C 55 92 68 94 78 98 C 90 91 106 92 116 98 C 126 95 138 97 146 100"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.3"
                        />
                        {/* Star 1 Base (Diamond, top right) */}
                        <path
                          d="M 134 18 L 137.5 27.5 L 147 30 L 137.5 32.5 L 134 42 L 130.5 32.5 L 121 30 L 130.5 27.5 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        {/* Star 2 Base (Medium, mid right) */}
                        <path
                          d="M 152 56 L 154.5 63 L 162 65 L 154.5 67 L 152 74 L 149.5 67 L 142 65 L 149.5 63 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        {/* Star 3 Base (Lower right) */}
                        <path
                          d="M 126 84 L 128 89.5 L 134 91 L 128 92.5 L 126 98 L 124 92.5 L 118 91 L 124 89.5 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        {/* Star 4 Base (Upper left) */}
                        <path
                          d="M 32 20 L 33.5 24.5 L 38 26 L 33.5 27.5 L 32 32 L 30.5 27.5 L 26 26 L 30.5 24.5 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        {/* Star 5 Base (Lower left) */}
                        <path
                          d="M 24 82 L 25 85.5 L 29 86.5 L 25 87.5 L 24 91 L 23 87.5 L 19 86.5 L 23 85.5 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </g>

                      {/* 2. Floating Animated Moon (Filled with glowing gold as progress increases) */}
                      <g style={{ animation: "sleepMoonFloat 4s ease-in-out infinite" }}>
                        {sleepPct > 0 && (
                          <g clipPath="url(#moonFillClip)">
                            {/* Lit Crescent Moon (Pure glowing white moonlight) */}
                            <path
                              d="M 76 18 A 43 43 0 1 0 76 104 C 98 84 98 38 76 18 Z"
                              fill="url(#moonWhiteGrad)"
                              stroke="#ffffff"
                              strokeWidth="2.5"
                              strokeLinejoin="round"
                              style={{ filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.7))" }}
                            />
                            {/* Moon Serene Sleeping Eyelid & Smile */}
                            <path
                              d="M 52 56 Q 57 60 62 56"
                              fill="none"
                              stroke="#475569"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              opacity="0.85"
                            />
                            <line x1="57" y1="59" x2="57" y2="62" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                            {/* Rosy Dream Cheek */}
                            <circle cx="57" cy="66" r="4" fill="#fb7185" opacity="0.4" />
                            {/* Soft Silver Lunar Crater accents */}
                            <circle cx="44" cy="40" r="3" fill="#cbd5e1" opacity="0.5" />
                            <circle cx="48" cy="80" r="4.5" fill="#cbd5e1" opacity="0.45" />
                            <circle cx="36" cy="65" r="2.5" fill="#cbd5e1" opacity="0.45" />
                            {/* Shimmering waterline across the moon at progress threshold */}
                            {sleepPct < 100 && (
                              <line
                                x1="28"
                                y1={moonClipY}
                                x2="98"
                                y2={moonClipY}
                                stroke="#ffffff"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                style={{ filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.9))" }}
                              />
                            )}
                          </g>
                        )}

                        {/* Sleeping "Z z" Dream Bubbles when sleep > 0 */}
                        {sleepVal > 0 && (
                          <g className="fill-amber-400 font-bold select-none opacity-85">
                            <text x="68" y="32" fontSize="9" fontWeight="900" style={{ animation: "sleepMoonFloat 3s ease-in-out infinite 0.2s" }}>z</text>
                            <text x="75" y="24" fontSize="12" fontWeight="900" style={{ animation: "sleepMoonFloat 3s ease-in-out infinite 0.5s" }}>Z</text>
                          </g>
                        )}
                      </g>

                      {/* 3. Interactive Animated Stars - Light up & Twinkle as Progress increases */}
                      {/* Star 4 (Upper left) - Wakes up at >= 15% */}
                      {sleepPct >= 15 && (
                        <g style={{ transformOrigin: "32px 26px", animation: "starTwinkle3 2.6s ease-in-out infinite 0.2s" }}>
                          <path
                            d="M 32 20 L 33.5 24.5 L 38 26 L 33.5 27.5 L 32 32 L 30.5 27.5 L 26 26 L 30.5 24.5 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1"
                          />
                        </g>
                      )}

                      {/* Star 1 (Major Diamond, top right) - Wakes up at >= 25% */}
                      {sleepPct >= 25 && (
                        <g style={{ transformOrigin: "134px 30px", animation: "starTwinkle1 2.2s ease-in-out infinite" }}>
                          <path
                            d="M 134 18 L 137.5 27.5 L 147 30 L 137.5 32.5 L 134 42 L 130.5 32.5 L 121 30 L 130.5 27.5 Z"
                            fill="url(#starYellowGrad)"
                            stroke="#facc15"
                            strokeWidth="1.5"
                          />
                          <circle cx="134" cy="30" r="1.5" fill="#ffffff" />
                        </g>
                      )}

                      {/* Star 2 (Medium Star, mid right) - Wakes up at >= 50% */}
                      {sleepPct >= 50 && (
                        <g style={{ transformOrigin: "152px 65px", animation: "starTwinkle2 1.9s ease-in-out infinite 0.4s" }}>
                          <path
                            d="M 152 56 L 154.5 63 L 162 65 L 154.5 67 L 152 74 L 149.5 67 L 142 65 L 149.5 63 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1.5"
                          />
                        </g>
                      )}

                      {/* Star 3 (Cozy Star, lower right) - Wakes up at >= 75% */}
                      {sleepPct >= 75 && (
                        <g style={{ transformOrigin: "126px 91px", animation: "starTwinkle3 2.4s ease-in-out infinite 0.8s" }}>
                          <path
                            d="M 126 84 L 128 89.5 L 134 91 L 128 92.5 L 126 98 L 124 92.5 L 118 91 L 124 89.5 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1.2"
                          />
                        </g>
                      )}

                      {/* Star 5 (Lower left) - Wakes up at >= 85% */}
                      {sleepPct >= 85 && (
                        <g style={{ transformOrigin: "24px 86.5px", animation: "starTwinkle1 2.5s ease-in-out infinite 0.5s" }}>
                          <path
                            d="M 24 82 L 25 85.5 L 29 86.5 L 25 87.5 L 24 91 L 23 87.5 L 19 86.5 L 23 85.5 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1"
                          />
                        </g>
                      )}

                      {/* 100% Goal Reached: Shooting Star streak across the night sky */}
                      {sleepPct >= 100 && (
                        <g>
                          <line
                            x1="112"
                            y1="13"
                            x2="168"
                            y2="25"
                            stroke="url(#shootingStarGrad)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            style={{ filter: "drop-shadow(0 0 6px #facc15)" }}
                          />
                          <circle cx="168" cy="25" r="2.5" fill="#ffffff" style={{ filter: "drop-shadow(0 0 4px #facc15)" }} />
                        </g>
                      )}
                    </svg>

                    {/* Sleep Duration Value & Progress readout (percentage only till two decimal points) */}
                    <div className="text-center mt-1 space-y-0.5">
                      <div className="text-2xl font-black text-base-content tracking-tight">
                        {sleepVal} <span className="text-xs font-semibold text-base-content/60">hrs</span>
                      </div>
                      <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                        {sleepQuality} • {sleepPctDisplay}% of {sleepTarget}h goal
                      </div>
                    </div>
                  </div>

                  {/* Input & Quick Steppers */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        className="input input-sm input-bordered w-full font-bold text-base bg-base-200/50 pr-10"
                        value={mobileEntry.sleep === 0 && !mobileHasChanges ? "" : mobileEntry.sleep}
                        placeholder="0.0"
                        onChange={(e) => handleMobileFieldChange("sleep", e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-base-content/50 pointer-events-none">
                        hrs
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("sleep", Math.max(0, Math.round(((Number(mobileEntry.sleep) || 0) - 0.5) * 10) / 10))}
                      >
                        -0.5h
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("sleep", Math.round(((Number(mobileEntry.sleep) || 0) + 0.5) * 10) / 10)}
                      >
                        +0.5h
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("sleep", Math.round(((Number(mobileEntry.sleep) || 0) + 1) * 10) / 10)}
                      >
                        +1h
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 5. Reading Time (Smooth Animated Classic Hourglass: Top sand is remaining time to read, bottom sand is studied time, matching Sleep Duration) */}
            {(() => {
              const readVal = Number(mobileEntry.read) || 0;
              const readTarget = settings?.read?.max || 1.0;
              const rawReadPct = (readVal / (readTarget || 1)) * 100;
              const progressPct = Math.min(100, Math.max(0, rawReadPct));
              const remainingPct = Math.max(0, 100 - progressPct);
              const readPctDisplay = readVal > 0 ? (Number.isInteger(rawReadPct) ? rawReadPct : rawReadPct.toFixed(2)) : 0;

              let readStatus = "No reading logged";
              if (readVal === 0) readStatus = "No reading logged";
              else if (progressPct < 25) readStatus = "Reading Started";
              else if (progressPct < 50) readStatus = "Building Focus";
              else if (progressPct < 75) readStatus = "Deep Reading";
              else if (progressPct < 100) readStatus = "Almost Complete";
              else readStatus = "Goal Mastered 🎉";

              // Top sand drains down as remainingPct decreases: Y ranges from 20 (full) to 60 (empty)
              // Chamber height is 40px
              const topSandY = 60 - (remainingPct / 100) * 40;
              const topSandH = 60 - topSandY;

              // Bottom sand rises up as progressPct increases: Y ranges from 100 (empty) to 60 (full)
              // Chamber height is 40px
              const bottomSandH = (progressPct / 100) * 40;
              const bottomSandY = 100 - bottomSandH;

              // Dynamic cone/mound at the bottom beneath the stream
              const isFlowing = readVal > 0 && progressPct < 100;
              const moundPeakY = Math.max(62, bottomSandY - 3.5);
              const moundW = Math.min(16, 5 + (progressPct / 100) * 11);

              return (
                <div className="bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  {/* Header (No emoji icon) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-base-content">Reading Time</h4>
                      <span className="text-[10px] text-base-content/60 font-medium">
                        Goal: {settings?.read?.min || 0} - {readTarget} hrs
                      </span>
                    </div>
                    <span
                      className={`badge badge-xs font-bold ${
                        readVal === 0 && !mobileEntry._isExisting
                          ? "badge-ghost text-base-content/50"
                          : progressPct >= 100
                          ? "badge-success text-success-content"
                          : readVal < (settings?.read?.min || 0)
                          ? "badge-warning"
                          : readVal > readTarget
                          ? "badge-info"
                          : getColorClass("read", readVal, settings)
                      }`}
                    >
                      {readVal === 0 && !mobileEntry._isExisting
                        ? "Not Logged"
                        : progressPct >= 100
                        ? "Goal Mastered 🎉"
                        : readVal < (settings?.read?.min || 0)
                        ? "Below Min"
                        : "In Progress"}
                    </span>
                  </div>

                  {/* Animated Classic Hourglass Illustration (Matches Sleep Duration size, proportions and theme) */}
                  <div className="flex flex-col items-center justify-center pt-1 pb-0 relative">
                    <svg viewBox="0 0 190 120" className="w-56 h-36 overflow-visible select-none pointer-events-none">
                      <defs>
                        {/* Radiant Blue Sand Gradient */}
                        <linearGradient id="sandBlueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#bae6fd" />
                          <stop offset="35%" stopColor="#38bdf8" />
                          <stop offset="75%" stopColor="#0284c7" />
                          <stop offset="100%" stopColor="#0369a1" />
                        </linearGradient>

                        {/* Sand Trickle Flow Gradient (Blue) */}
                        <linearGradient id="sandStreamGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e0f2fe" />
                          <stop offset="50%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#0284c7" />
                        </linearGradient>

                        {/* Twinkling Star Yellow Gradient */}
                        <linearGradient id="readStarYellowGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>

                        {/* Upper Bulb Glass Mask */}
                        <clipPath id="upperGlassClip">
                          <path d="M 72 20 C 65 36, 88 54, 92 60 L 98 60 C 102 54, 125 36, 118 20 Z" />
                        </clipPath>

                        {/* Lower Bulb Glass Mask */}
                        <clipPath id="lowerGlassClip">
                          <path d="M 92 60 C 88 66, 65 84, 72 100 L 118 100 C 125 84, 102 66, 98 60 Z" />
                        </clipPath>
                      </defs>

                      <style>{`
                        @keyframes hourglassFloat {
                          0%, 100% { transform: translateY(0px); }
                          50% { transform: translateY(-3px); }
                        }
                        @keyframes sandStreamFlow {
                          0% { stroke-dashoffset: 0; }
                          100% { stroke-dashoffset: -12; }
                        }
                        @keyframes sandStreamPulse {
                          0%, 100% { opacity: 0.95; }
                          50% { opacity: 0.75; }
                        }
                        @keyframes sandParticleBounce1 {
                          0%, 100% { transform: translateY(0px) scale(0.8); opacity: 0.9; }
                          50% { transform: translateY(-3px) scale(1.1); opacity: 1; }
                        }
                        @keyframes sandParticleBounce2 {
                          0%, 100% { transform: translateY(0px) scale(0.7); opacity: 0.8; }
                          50% { transform: translateY(-4px) scale(1.2); opacity: 1; }
                        }
                        @keyframes readGoalCrownGlow {
                          0%, 100% { filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.45)); transform: scale(1); }
                          50% { filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.9)); transform: scale(1.05); }
                        }
                      `}</style>

                      {/* 1. Base Unfilled Outlines (Matches DaisyUI theme tokens seamlessly) */}
                      <g className="text-base-content/25">
                        {/* Top Stand Plate */}
                        <rect x="60" y="14" width="70" height="6" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
                        {/* Bottom Stand Plate */}
                        <rect x="60" y="100" width="70" height="6" rx="3" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
                        {/* Left & Right Support Pillars */}
                        <line x1="65" y1="20" x2="65" y2="100" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />
                        <line x1="125" y1="20" x2="125" y2="100" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />

                        {/* Symmetrical Hourglass Glass Body */}
                        <path
                          d="M 72 20 C 65 36, 88 54, 92 60 C 88 66, 65 84, 72 100 L 118 100 C 125 84, 102 66, 98 60 C 102 54, 125 36, 118 20 Z"
                          fill="currentColor"
                          fillOpacity="0.04"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                        />

                        {/* Star 1 Base (Upper left) */}
                        <path
                          d="M 38 22 L 40.5 27.5 L 46 30 L 40.5 32.5 L 38 38 L 35.5 32.5 L 30 30 L 35.5 27.5 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        {/* Star 2 Base (Upper right) */}
                        <path
                          d="M 152 19 L 154.8 25.2 L 161 28 L 154.8 30.8 L 152 37 L 149.2 30.8 L 143 28 L 149.2 25.2 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        {/* Star 3 Base (Mid right) */}
                        <path
                          d="M 158 55 L 160.2 59.8 L 165 62 L 160.2 64.2 L 158 69 L 155.8 64.2 L 151 62 L 155.8 59.8 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        {/* Star 4 Base (Lower left) */}
                        <path
                          d="M 34 80 L 36 84 L 40 86 L 36 88 L 34 92 L 32 88 L 28 86 L 32 84 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        {/* Star 5 Base (Lower right) */}
                        <path
                          d="M 148 86 L 150 90 L 154 92 L 150 94 L 148 98 L 146 94 L 142 92 L 146 90 Z"
                          fill="currentColor"
                          fillOpacity="0.06"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </g>

                      {/* 2. Floating Animated Hourglass & Sand Simulation */}
                      <g style={{ animation: "hourglassFloat 4s ease-in-out infinite" }}>
                        {/* Stand accents */}
                        <rect x="68" y="15.5" width="54" height="1" rx="0.5" fill="#ffffff" opacity="0.35" />
                        <rect x="68" y="101.5" width="54" height="1" rx="0.5" fill="#ffffff" opacity="0.35" />

                        {/* Top Bulb Sand (Remaining Reading Time: Drains Downward as Progress Increases) */}
                        {remainingPct > 0 && (
                          <g clipPath="url(#upperGlassClip)">
                            {/* Sand Liquid Body */}
                            <rect
                              x="58"
                              y={topSandY}
                              width="74"
                              height={topSandH}
                              fill="url(#sandBlueGrad)"
                              className="transition-all duration-700 ease-out"
                            />
                            {/* Fine Sand Texture Particles inside upper sand */}
                            <circle cx="86" cy={Math.min(56, topSandY + 10)} r="0.9" fill="#ffffff" opacity="0.45" />
                            <circle cx="102" cy={Math.min(56, topSandY + 14)} r="0.9" fill="#075985" opacity="0.3" />
                            <circle cx="94" cy={Math.min(58, topSandY + 20)} r="0.8" fill="#ffffff" opacity="0.4" />

                            {/* Sand Surface Funnel (Dips inward toward the center neck when draining) */}
                            <path
                              d={`M 66 ${topSandY} Q 95 ${Math.min(59, topSandY + (isFlowing ? 3 : 1))} 124 ${topSandY} L 124 ${topSandY + 2} L 66 ${topSandY + 2} Z`}
                              fill="#0284c7"
                              opacity="0.6"
                              className="transition-all duration-700 ease-out"
                            />
                          </g>
                        )}

                        {/* Bottom Bulb Sand (Time Studied: Rises Upward as Progress Increases) */}
                        {progressPct > 0 && (
                          <g clipPath="url(#lowerGlassClip)">
                            {/* Accumulated Sand Body in Lower Bulb */}
                            <rect
                              x="58"
                              y={bottomSandY}
                              width="74"
                              height={bottomSandH + 2}
                              fill="url(#sandBlueGrad)"
                              className="transition-all duration-700 ease-out"
                            />
                            {/* Fine Sand Texture Particles inside lower sand */}
                            <circle cx="88" cy={Math.min(94, bottomSandY + 10)} r="0.9" fill="#ffffff" opacity="0.4" />
                            <circle cx="104" cy={Math.min(96, bottomSandY + 14)} r="0.9" fill="#075985" opacity="0.25" />
                            <circle cx="95" cy={Math.min(95, bottomSandY + 22)} r="0.8" fill="#ffffff" opacity="0.45" />

                            {/* Sand Mound Peak directly under the stream */}
                            {progressPct < 100 && (
                              <path
                                d={`M ${95 - moundW} ${bottomSandY + 1} Q 95 ${moundPeakY} ${95 + moundW} ${bottomSandY + 1} Z`}
                                fill="#7dd3fc"
                                className="transition-all duration-700 ease-out"
                              />
                            )}
                          </g>
                        )}

                        {/* Falling Sand Stream & Droplets (Flows whenever study time is logged and not 100% full) */}
                        {isFlowing && (
                          <g>
                            {/* Golden/Blue Stream */}
                            <line
                              x1="95"
                              y1="59"
                              x2="95"
                              y2={bottomSandY}
                              stroke="url(#sandStreamGrad)"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              style={{ animation: "sandStreamPulse 0.6s linear infinite" }}
                            />
                            {/* Inner Shimmering Flow Dash */}
                            <line
                              x1="95"
                              y1="59"
                              x2="95"
                              y2={bottomSandY}
                              stroke="#ffffff"
                              strokeWidth="0.9"
                              strokeDasharray="3 2"
                              opacity="0.9"
                              style={{ animation: "sandStreamFlow 0.3s linear infinite" }}
                            />

                            {/* Bouncing Sand Grains at Landing Point */}
                            <g>
                              <circle
                                cx="93"
                                cy={bottomSandY - 1}
                                r="1"
                                fill="#bae6fd"
                                style={{ animation: "sandParticleBounce1 0.65s ease-out infinite" }}
                              />
                              <circle
                                cx="97"
                                cy={bottomSandY - 1.5}
                                r="1.2"
                                fill="#38bdf8"
                                style={{ animation: "sandParticleBounce2 0.8s ease-out infinite 0.15s" }}
                              />
                            </g>
                          </g>
                        )}

                        {/* Outer Glass Outline */}
                        <path
                          d="M 72 20 C 65 36, 88 54, 92 60 C 88 66, 65 84, 72 100 L 118 100 C 125 84, 102 66, 98 60 C 102 54, 125 36, 118 20 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinejoin="round"
                          className="text-base-content/35"
                        />

                        {/* Specular Glass Highlights */}
                        <path
                          d="M 72 26 C 68 36, 78 48, 86 54"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          opacity="0.4"
                        />
                        <path
                          d="M 86 66 C 78 72, 68 84, 72 94"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          opacity="0.4"
                        />
                        <path
                          d="M 118 26 C 122 36, 112 48, 104 54"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1"
                          strokeLinecap="round"
                          opacity="0.2"
                        />
                      </g>

                      {/* 3. Interactive Animated Stars - Light up & Twinkle as Progress increases (Matches Sleep Duration) */}
                      {/* Star 1 (Upper left) - Wakes up at >= 15% */}
                      {progressPct >= 15 && (
                        <g style={{ transformOrigin: "38px 30px", animation: "starTwinkle3 2.6s ease-in-out infinite 0.2s" }}>
                          <path
                            d="M 38 22 L 40.5 27.5 L 46 30 L 40.5 32.5 L 38 38 L 35.5 32.5 L 30 30 L 35.5 27.5 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1"
                          />
                        </g>
                      )}

                      {/* Star 2 (Major Diamond, upper right) - Wakes up at >= 25% */}
                      {progressPct >= 25 && (
                        <g style={{ transformOrigin: "152px 28px", animation: "starTwinkle1 2.2s ease-in-out infinite" }}>
                          <path
                            d="M 152 19 L 154.8 25.2 L 161 28 L 154.8 30.8 L 152 37 L 149.2 30.8 L 143 28 L 149.2 25.2 Z"
                            fill="url(#readStarYellowGrad)"
                            stroke="#facc15"
                            strokeWidth="1.5"
                          />
                          <circle cx="152" cy="28" r="1.5" fill="#ffffff" />
                        </g>
                      )}

                      {/* Star 3 (Mid right) - Wakes up at >= 50% */}
                      {progressPct >= 50 && (
                        <g style={{ transformOrigin: "158px 62px", animation: "starTwinkle2 1.9s ease-in-out infinite 0.4s" }}>
                          <path
                            d="M 158 55 L 160.2 59.8 L 165 62 L 160.2 64.2 L 158 69 L 155.8 64.2 L 151 62 L 155.8 59.8 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1.2"
                          />
                        </g>
                      )}

                      {/* Star 4 (Lower left) - Wakes up at >= 75% */}
                      {progressPct >= 75 && (
                        <g style={{ transformOrigin: "34px 86px", animation: "starTwinkle3 2.4s ease-in-out infinite 0.8s" }}>
                          <path
                            d="M 34 80 L 36 84 L 40 86 L 36 88 L 34 92 L 32 88 L 28 86 L 32 84 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1"
                          />
                        </g>
                      )}

                      {/* Star 5 (Lower right) - Wakes up at >= 85% */}
                      {progressPct >= 85 && (
                        <g style={{ transformOrigin: "148px 92px", animation: "starTwinkle1 2.5s ease-in-out infinite 0.5s" }}>
                          <path
                            d="M 148 86 L 150 90 L 154 92 L 150 94 L 148 98 L 146 94 L 142 92 L 146 90 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1.2"
                          />
                        </g>
                      )}

                      {/* 100% Goal Mastered: Victory Golden Star above top plate & Sparkles */}
                      {progressPct >= 100 && (
                        <g style={{ transformOrigin: "95px 10px", animation: "readGoalCrownGlow 3s ease-in-out infinite" }}>
                          <path
                            d="M 95 2 L 97 6.5 L 102 7.5 L 98 11 L 99.5 16 L 95 13 L 90.5 16 L 92 11 L 88 7.5 L 93 6.5 Z"
                            fill="#facc15"
                            stroke="#fde047"
                            strokeWidth="1"
                            style={{ filter: "drop-shadow(0 0 6px #facc15)" }}
                          />
                          <circle cx="70" cy="80" r="1.5" fill="#fde047" />
                          <circle cx="120" cy="80" r="1.5" fill="#fde047" />
                          <circle cx="95" cy="88" r="1.8" fill="#ffffff" opacity="0.8" />
                        </g>
                      )}
                    </svg>

                    {/* Reading Value & Progress readout (Matches Sleep Duration exact typography & format) */}
                    <div className="text-center mt-1 space-y-0.5">
                      <div className="text-2xl font-black text-base-content tracking-tight">
                        {readVal} <span className="text-xs font-semibold text-base-content/60">hrs</span>
                      </div>
                      <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">
                        {readStatus} • {readPctDisplay}% of {readTarget}h goal
                      </div>
                    </div>
                  </div>

                  {/* Input & Quick Steppers */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.25"
                        className="input input-sm input-bordered w-full font-bold text-base bg-base-200/50 pr-10"
                        value={mobileEntry.read === 0 && !mobileHasChanges ? "" : mobileEntry.read}
                        placeholder="0.0"
                        onChange={(e) => handleMobileFieldChange("read", e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-base-content/50 pointer-events-none">
                        hrs
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("read", Math.max(0, Math.round(((Number(mobileEntry.read) || 0) - 0.25) * 100) / 100))}
                      >
                        -15m
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("read", Math.round(((Number(mobileEntry.read) || 0) + 0.25) * 100) / 100)}
                      >
                        +15m
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("read", Math.round(((Number(mobileEntry.read) || 0) + 0.5) * 100) / 100)}
                      >
                        +30m
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-soft"
                        onClick={() => handleMobileFieldChange("read", Math.round(((Number(mobileEntry.read) || 0) + 1.0) * 100) / 100)}
                      >
                        +1h
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 6. Self Care Habits (Structured 2-Column Grid + Expand Arrow if >10) */}
            {settings?.selfcare && settings.selfcare.length > 0 && (() => {
              const raw = String(mobileEntry.selfcare || "");
              const total = settings.selfcare.length;
              const doneCount = settings.selfcare.filter((h, idx) => raw[idx] === h[0].toUpperCase()).length;
              const completionPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

              const visibleHabits = isSelfCareExpanded
                ? settings.selfcare
                : settings.selfcare.slice(0, 10);

              return (
                <div className="bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🧘</span>
                      <div>
                        <h4 className="text-xs font-bold text-base-content">Self Care Habits</h4>
                        <span className="text-[10px] text-base-content/60 font-medium">
                          Tap each activity to mark done
                        </span>
                      </div>
                    </div>
                    <span className={`badge badge-xs font-bold ${doneCount === total ? "badge-success text-success-content" : "badge-primary"}`}>
                      {doneCount} / {total} done
                    </span>
                  </div>

                  {/* Visual Completion Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-base-content/70">
                      <span>Daily Progress</span>
                      <span>{completionPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-base-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Structured Habits Grid (2 equal columns) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {visibleHabits.map((habit) => {
                      const index = settings.selfcare.indexOf(habit);
                      const currentValue = mobileEntry.selfcare || "_".repeat(total);
                      const isChecked = currentValue[index] === habit[0].toUpperCase();
                      const emoji = getSelfCareEmoji(habit);

                      return (
                        <button
                          key={habit}
                          type="button"
                          className={`p-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between gap-1.5 cursor-pointer select-none active:scale-95 text-left ${
                            isChecked
                              ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-xs font-bold"
                              : "bg-base-200/70 border-base-300 text-base-content/80 hover:bg-base-200"
                          }`}
                          onClick={() => {
                            const updated = currentValue
                              .padEnd(total, "_")
                              .split("")
                              .map((char, i) =>
                                i === index
                                  ? !isChecked
                                    ? habit[0].toUpperCase()
                                    : "_"
                                  : char
                              )
                              .join("");
                            handleMobileFieldChange("selfcare", updated);
                          }}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            <span className="text-sm shrink-0 select-none">{emoji}</span>
                            <span className="truncate text-[11px] font-bold">{habit}</span>
                          </div>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                            isChecked ? "bg-emerald-500 text-white font-black shadow-xs" : "border border-base-content/30 text-transparent"
                          }`}>
                            ✓
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Expand / Collapse Button if more than 10 habits */}
                  {settings.selfcare.length > 10 && (
                    <button
                      type="button"
                      onClick={() => setIsSelfCareExpanded(!isSelfCareExpanded)}
                      className="w-full py-2 px-3 rounded-xl bg-base-200/60 hover:bg-base-200 text-xs font-bold text-primary flex items-center justify-center gap-1.5 border border-base-300/80 transition-all active:scale-98 cursor-pointer mt-1"
                    >
                      <span>
                        {isSelfCareExpanded
                          ? "Show Less Habits"
                          : `Show More (${settings.selfcare.length - 10} more)`}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isSelfCareExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
              );
            })()}

            {/* 7. Daily Mood (Expressive Mood Cards) */}
            {settings?.mood && settings.mood.length > 0 && (
              <div className="bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-2xs space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">😊</span>
                    <div>
                      <h4 className="text-xs font-bold text-base-content">Daily Mood</h4>
                      <span className="text-[10px] text-base-content/60 font-medium">
                        How was your day?
                      </span>
                    </div>
                  </div>
                  {mobileEntry.mood && (
                    <span className="badge badge-accent badge-xs font-bold">
                      {mobileEntry.mood}
                    </span>
                  )}
                </div>

                {/* Expressive Mood Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {settings.mood.map((m) => {
                    const isSelected = (mobileEntry.mood || "").toLowerCase() === m.toLowerCase();
                    const emoji = getMoodEmoji(m);

                    return (
                      <button
                        key={m}
                        type="button"
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                          isSelected
                            ? "bg-accent/15 border-accent text-accent font-bold ring-2 ring-accent/30 shadow-xs scale-105"
                            : "bg-base-200/70 border-base-300 text-base-content/75 hover:bg-base-200"
                        }`}
                        onClick={() => {
                          handleMobileFieldChange("mood", isSelected ? "" : m);
                        }}
                      >
                        <span className="text-2xl select-none">{emoji}</span>
                        <span className="truncate max-w-full text-[11px]">{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. Daily Journal (Reflections Notebook Card - Bigger in vertical) */}
            {(() => {
              const journalText = mobileEntry.journal || "";
              const wordCount = journalText.trim() ? journalText.trim().split(/\s+/).length : 0;
              const charCount = journalText.length;

              return (
                <div className="bg-base-100 border border-base-300/80 rounded-2xl p-4 shadow-2xs space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✍️</span>
                      <div>
                        <h4 className="text-xs font-bold text-base-content">Daily Journal</h4>
                        <span className="text-[10px] text-base-content/60 font-medium">
                          Thoughts, wins & reflections
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost text-primary gap-1 font-semibold"
                      onClick={() => handleJournalClick(mobileEntry)}
                    >
                      <Book size={12} /> Full Editor
                    </button>
                  </div>

                  {/* Styled Note Box - Bigger in vertical */}
                  <div className="space-y-1.5">
                    <textarea
                      rows={6}
                      className="textarea textarea-bordered w-full min-h-[150px] text-xs bg-base-200/50 resize-y font-medium placeholder:text-base-content/40 focus:bg-base-100 transition-colors leading-relaxed"
                      placeholder="Write your daily wins, thoughts, or reflections here..."
                      value={journalText}
                      onChange={(e) => handleMobileFieldChange("journal", e.target.value)}
                    />
                    <div className="flex items-center justify-between text-[10px] text-base-content/50 font-medium px-1">
                      <span>📝 {wordCount} {wordCount === 1 ? "word" : "words"}</span>
                      <span>{charCount} characters</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Mobile Bottom Save & Actions Bar */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                className={`btn btn-primary w-full shadow-lg font-bold flex items-center justify-center gap-2 ${
                  mobileSaving ? "loading" : ""
                }`}
                onClick={() => handleSaveMobileEntry(mobileEntry)}
                disabled={mobileSaving}
              >
                <Save size={16} />
                <span>{mobileSaving ? "Saving..." : mobileHasChanges ? "Save Changes" : "Save Day Entry"}</span>
              </button>

              {mobileEntry._isExisting && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-error w-full gap-1.5 font-semibold"
                  onClick={() => handleDeleteClick(selectedMobileDate)}
                >
                  <Trash size={14} /> Delete Entry for this Day
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Desktop Pagination (hidden on mobile) */}
      <div className="hidden md:block">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          fetchHabits={fetchHabits}
        />
      </div>
    </>
  )}



      {/* Add Habit Popup */}
      <AddHabitPopUp
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
        progress={calculateProgress}
        progresscolor={getProgressColorClass}
        settings={settings}
      />

      <DeleteHabitPopUp
        isDeletePopupOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Journal Popup */}
      <JournalPopUp
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        initialData={currentJournalItem?.journal}
        initialMood={currentJournalItem?.mood}
        date={currentJournalItem?.date}
        onSave={handleJournalSave}
        moodList={settings?.mood}
      />

      {/* Theme-Matched Calendar Modal */}
      {isCalendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="bg-base-100 border border-base-300/80 rounded-3xl p-4 shadow-2xl w-full max-w-[340px] space-y-3.5 transition-all text-base-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                  <Calendar size={16} />
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-base-content">
                    Jump to Date
                  </h3>
                  <p className="text-[10px] text-base-content/60 font-medium">
                    Select any day to view or edit habits
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-base-content hover:bg-base-200"
                title="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Month & Year Navigation and Days Grid */}
            {(() => {
              const viewYear = calendarViewDate.getFullYear();
              const viewMonth = calendarViewDate.getMonth();
              const monthName = calendarViewDate.toLocaleDateString("en-US", { month: "long" });

              const handlePrevMonth = () => {
                setCalendarViewDate(new Date(viewYear, viewMonth - 1, 1));
              };

              const handleNextMonth = () => {
                setCalendarViewDate(new Date(viewYear, viewMonth + 1, 1));
              };

              // 0=Sun, 1=Mon, ..., 6=Sat
              const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
              const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
              const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

              const formatCellDate = (y, m, d) => {
                const mm = String(m + 1).padStart(2, "0");
                const dd = String(d).padStart(2, "0");
                return `${y}-${mm}-${dd}`;
              };

              const cells = [];

              // Leading days from previous month
              for (let i = firstDayIndex - 1; i >= 0; i--) {
                const dayNum = daysInPrevMonth - i;
                const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
                const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
                cells.push({
                  dayNum,
                  dateStr: formatCellDate(prevY, prevM, dayNum),
                  isCurrentMonth: false,
                });
              }

              // Days of current month
              for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                cells.push({
                  dayNum,
                  dateStr: formatCellDate(viewYear, viewMonth, dayNum),
                  isCurrentMonth: true,
                });
              }

              // Trailing days from next month to fill grid
              const remaining = (7 - (cells.length % 7)) % 7;
              for (let dayNum = 1; dayNum <= remaining; dayNum++) {
                const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
                const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
                cells.push({
                  dayNum,
                  dateStr: formatCellDate(nextY, nextM, dayNum),
                  isCurrentMonth: false,
                });
              }

              const todayStr = getTodayStr();

              return (
                <>
                  {/* Month navigation */}
                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="btn btn-ghost btn-circle btn-xs hover:bg-base-200 text-base-content/80"
                      title="Previous Month"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="text-center">
                      <span className="font-extrabold text-sm text-base-content tracking-tight">
                        {monthName} {viewYear}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="btn btn-ghost btn-circle btn-xs hover:bg-base-200 text-base-content/80"
                      title="Next Month"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Weekdays */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-base-content/40 tracking-wider">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((cell) => {
                      const isSelected = cell.dateStr === selectedMobileDate;
                      const isToday = cell.dateStr === todayStr;
                      const hasLoggedData = Boolean(
                        mobileDaysCache[cell.dateStr]?._isExisting ||
                        data.some((item) => item.date === cell.dateStr)
                      );

                      return (
                        <button
                          key={cell.dateStr}
                          type="button"
                          onClick={() => {
                            handleSelectDay(cell.dateStr);
                            setIsCalendarOpen(false);
                          }}
                          className={`relative h-10 w-full flex flex-col items-center justify-center rounded-xl text-xs transition-all cursor-pointer select-none active:scale-90 ${
                            isSelected
                              ? "bg-primary text-primary-content font-black shadow-md scale-105"
                              : isToday
                              ? "border-2 border-primary text-primary font-black bg-primary/5 hover:bg-primary/10"
                              : cell.isCurrentMonth
                              ? "text-base-content hover:bg-base-200 hover:text-primary font-semibold"
                              : "text-base-content/30 opacity-40 hover:bg-base-200/50 hover:opacity-100 font-normal"
                          }`}
                        >
                          <span>{cell.dayNum}</span>
                          {hasLoggedData && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                                isSelected ? "bg-primary-content" : "bg-emerald-500"
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-base-200 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const today = getTodayStr();
                        handleSelectDay(today);
                        setCalendarViewDate(new Date());
                        setIsCalendarOpen(false);
                      }}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-xl transition-all active:scale-95 border border-primary/20"
                    >
                      <RotateCcw size={11} /> Today
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="btn btn-ghost btn-xs text-base-content/70 hover:bg-base-200 rounded-xl"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default HabitTableEntry;
