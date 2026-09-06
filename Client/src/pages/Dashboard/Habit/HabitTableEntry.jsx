// Import Statements
import { useState, useEffect } from "react";
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
import { useLoading } from "../../../Context/LoadingContext";
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
  RefreshCw,
  Filter,
} from "lucide-react";

import FoodLoggingTab from "../../../components/Dashboard/Habit/FoodLogging/FoodLoggingTab.jsx";

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

  // variables
  const [itemToDelete, setItemToDelete] = useState(null);
  const { setLoading } = useLoading();
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
        const requiredLength = settings.selfcare ? settings.selfcare.length : 0;
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
        const requiredLength = settings.selfcare ? settings.selfcare.length : 0;
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

  const fetchHabits = async (page = currentPage) => {
    setLoading(true);

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
      setLoading(false);
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
    const originalItem = data.find((item) => item.date === editingItem.date);
    if (JSON.stringify(originalItem) === JSON.stringify(editingItem)) {
      setAlertSuccessMessage("Already up to date!");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
      setEditingItem(null);
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.put(
        "/v1/dashboard/habit/table-entry",
        { ...editingItem }
      );
      console.log(response.data.message);
      setAlertSuccessMessage(response.data.message);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || "Failed To Save Entry!";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      fetchHabits(currentPage);
      setLoading(false);
      setEditingItem(null);
    }
    // setData((prev) =>
    //   prev.map((item) => (item.date === editingItem.date ? editingItem : item))
    // );
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
    // Check if the date already exists
    try {
      setLoading(true);
      const dateExists = data.some((entry) => entry.date === newItem.date);

      if (dateExists) {
        setAlertErrorMessage("Entry for this date already exists!");
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 4000);
        return;
      }
      const sortedNewData = [...data, newItem].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const response = await axiosInstance.post(
        "/v1/dashboard/habit/table-entry",
        { ...newItem, currentPage }
      );
      setData(sortedNewData);
      setAlertSuccessMessage(response.data.message);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || "Failed To Add Entry!";
      setAlertErrorMessage(errorMessage);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      fetchHabits(currentPage);
      setLoading(false);
    }
  };

  // Open Entry Popup
  const handleAddEntryClick = () => {
    setIsModalOpen(true);
  };

  // -------------------------------------------------------- Habit Table HTML Data -----------------------------------------------------------
  return (
    <div className="p-1">
      {/* // Alerts Messages */}
      {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={20} />}
      {showSuccessAlert && (
        <SuccessAlert message={alertSuccessMessage} top={20} />
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-base-300 mb-4 px-2">
        <button
          className={`flex items-center gap-2 py-3 px-5 font-bold text-sm border-b-2 transition-all ${
            activeMainTab === "habit"
              ? "border-primary text-primary bg-primary/5 rounded-t-lg"
              : "border-transparent text-base-content/60 hover:text-base-content"
          }`}
          onClick={() => setActiveMainTab("habit")}
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
          onClick={() => setActiveMainTab("food")}
        >
          <Utensils size={18} />
          Food Logging
        </button>
      </div>

      {activeMainTab === "food" ? (
        <FoodLoggingTab />
      ) : (
        <>
          {/* Headings */}
          <div className="sticky top-[-20px] z-30 bg-base-300 h-[60px] flex items-center px-4">
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

          {/* Table */}
          <div>
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
              {renderColumnHeader("intake", "Intake", "Kcal", (
                <button
                  type="button"
                  onClick={handleSyncAllIntake}
                  disabled={isSyncingIntake}
                  className="p-1 hover:bg-base-200/80 rounded-full transition-all text-base-content/70 hover:text-primary active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center ml-0.5"
                  title="Sync with Food Logging"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingIntake ? "animate-spin text-primary" : ""}`} />
                </button>
              ))}
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

      {/* Pagination */}
      <div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          fetchHabits={fetchHabits}
        />
      </div>

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
        </>
      )}
    </div>
  );
}

export default HabitTableEntry;
