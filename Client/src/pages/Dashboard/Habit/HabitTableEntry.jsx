// Import Statements
import { useState, useEffect } from "react";
import Heading from "../../../components/Dashboard/Habit/HabitTableEntryPage/Heading.jsx";
import Pagination from "../../../components/Dashboard/Habit/HabitTableEntryPage/Pagination.jsx";

import AddHabitPopUp from "../../../components/Dashboard/Habit/HabitTableEntryPage/AddHabitPopUp.jsx";
import Trash from "../../../utils/Icons/Trash";
import Pencil from "../../../utils/Icons/Pencil";
import Save from "../../../utils/Icons/Save";
import Cancel from "../../../utils/Icons/Cancel";
import ErrorAlert from "../../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../../utils/Alerts/SuccessAlert";
import axiosInstance from "../../../Context/AxiosInstance";
import { useLoading } from "../../../Context/LoadingContext";
import DeleteHabitPopUp from "../../../components/Dashboard/Habit/HabitTableEntryPage/DeleteHabitPopUp.jsx";
import Refresh from "../../../utils/Icons/Refresh";
import { TitleChanger } from "../../../utils/TitleChanger";
import { useSelector, useDispatch } from "react-redux";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  CalendarDays,
  Flame,
  Droplet,
  BedDouble,
  BookOpen,
  Utensils,
  Heart,
  Smile,
  BarChart3,
  MoreHorizontal,
  Settings,
  Sparkles,
} from "lucide-react";

function HabitTableEntry() {
  TitleChanger("Progress Pulse | Habit Entry");
  const settings = useSelector((state) => state.habit.settings);

  // Format Date Function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = String(date.getFullYear()).slice(2);
    return `${day}-${month}-${year}`;
  };

  // variables
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemPerPage, setItemPerPage] = useState(7);
  const { setLoading } = useLoading();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [totalPages, setTotalPages] = useState();
  //Error Alert Variables
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  // Success Alert Variables
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setAlertSuccessMessage] = useState("");

  // -------------------------------------------------------------------- Functions ---------------------------------------------------------------

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

  const startDate = formatDateLocal(startOfMonth);
  const endDate = formatDateLocal(endOfMonth);

  const [fromDate, setFromDate] = useState(startDate);
  const [toDate, setToDate] = useState(endDate);

  const resetFilters = () => {
    setFromDate(startDate);
    setToDate(endDate);
    // Optionally re-fetch or show all data
  };

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

  const getScoreColor = (score) => {
    const percentage = (score / 7) * 100;
    if (percentage < 25) return "text-error";
    if (percentage < 50) return "text-warning";
    if (percentage < 75) return "text-info";
    return "text-success";
  };

  const getColorClass = (field, value, settings) => {
    if (!settings[field]) return "text-gray-500"; // fallback
    const { min, max } = settings[field];
    if (value < min) return "text-warning";
    if (value > max) return "text-error";
    return "text-success";
  };

  const fetchHabits = async (currentPage) => {
    setLoading(true);

    // declare response here so it's visible in finally
    let response;

    try {
      response = await axiosInstance.get("/v1/dashboard/habit/table-entry", {
        params: {
          page: currentPage,
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
  }, [itemPerPage]); // re-run when currentPage changes

  // Key Down Function
  useEffect(() => {
    if (editingItem) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingItem]);

  // Progress Color function
  const getProgressColorClass = (percentage) => {
    if (percentage >= 75) return "progress-success"; // 75–100% → consistent → 🟢
    if (percentage >= 50) return "progress-info"; // 50–74% → moderate → 🔵
    if (percentage >= 25) return "progress-warning"; // 25–49% → uncertain → 🟠
    return "progress-error"; // 00–24% → inconsistent → 🔴
  };

  // calculate Progress Function
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

      // Special handling for selfcare
      if (key === "selfcare") {
        // console.log(settings.selfcare.length)
        const requiredLength = settings.selfcare.length;
        const emptySelfcare = "_".repeat(requiredLength);
        return value && value !== emptySelfcare;
      }

      // Regular check for other fields
      return value && value.toString().trim() !== "0";
    });

    const progressPercentage = Math.round(
      (filled.length / fields.length) * 100
    );

    item["score"] = filled.length;
    item["progress"] = progressPercentage;
    return progressPercentage;
  };

  // Calculate Score
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

      // Special handling for selfcare
      if (key === "selfcare") {
        // console.log(settings.selfcare.length)
        const requiredLength = settings.selfcare.length;
        const emptySelfcare = "_".repeat(requiredLength);
        return value && value !== emptySelfcare;
      }

      // Regular check for other fields
      return value && value.toString().trim() !== "0";
    });
    const score = filled.length;
    item["score"] = filled.length;
    return score;
  };

  // Delection Data Function
  const handleDeleteClick = (date) => {
    setItemToDelete(date);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = axiosInstance.delete("/v1/dashboard/habit/table-entry", {
        params: {
          date: itemToDelete,
        },
      });
      setAlertSuccessMessage(`Entry For ${itemToDelete} Deleted`);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
      fetchHabits(currentPage);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch habit data!";
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

      {/* Headings */}
      <div className="sticky top-[-20px] z-30 bg-opacity-90 backdrop-blur-md shadow-sm mb-1 p-2 pt-3">
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
          <thead className="sticky top-10 z-30 bg-opacity-90 backdrop-blur-md shadow-sm mb-1 p-2 pt-3">
            {/* ToolBar */}
            <tr>
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
                      Entries: {itemPerPage}
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
                            onClick={() => setItemPerPage(value)}
                          >
                            {value}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: From/To Date Pickers */}
                  <div className="flex items-center gap-4 ml-auto">
                    {/* From Date Picker */}
                    <div className="dropdown dropdown-end floating-label">
                      <div
                        tabIndex={0}
                        role="button"
                        className="input text-xs w-25"
                      >
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

                    <span>-</span>

                    {/* To Date Picker */}
                    <div className="dropdown dropdown-end floating-label">
                      <div
                        tabIndex={0}
                        role="button"
                        className="input text-xs w-25"
                      >
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
            <tr>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Date
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4" />
                  Burned
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <Droplet className="w-4 h-4" />
                  Water
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <BedDouble className="w-4 h-4" />
                  Sleep
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Read
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <Utensils className="w-4 h-4" />
                  Intake
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4" />
                  Self Care
                </div>
              </th>
              <th className="w-[80px]text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <Smile className="w-4 h-4" />
                  Mood
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  Progress
                </div>
              </th>

              <th className="w-[80px] text-center border border-base-100">
                <div className="flex justify-center items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Score
                </div>
              </th>

              <th className="w-[80px] text-center border border-base-100">
                <div className="flex justify-center items-center justify-center gap-1">
                  <MoreHorizontal className="w-4 h-4" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length === 0 ? (
              // Message Row for empty Data
              <tr>
                <td
                  colSpan="11"
                  className="h-[60vh] text-center align-middle bg-base-200"
                >
                  <div className="flex flex-col justify-center items-center h-full space-y-4">
                    <div className="text-2xl font-semibold">
                      No habit entries found
                    </div>
                    <div className="text-md">
                      Start tracking your progress by adding your first entry.
                    </div>
                    <button
                      className="btn btn-soft btn-primary btn-sm px-6"
                      onClick={handleAddEntryClick}
                    >
                      + Add Entry
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) =>
                editingItem?.date === item.date ? (
                  // ---------- Input Row --------
                  <tr key={item.date} className="text-center">
                    {/* Date */}
                    <td className="text-sm">{formatDate(item.date)}</td>

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
                    <td className="border border-base-100 text-sm">
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
                          className="btn btn-soft btn-circle btn-info btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil />
                        </button>
                        <button
                          className="btn btn-soft btn-circle btn-error btn-sm"
                          onClick={() => handleDeleteClick(item.date)}
                        >
                          <Trash />
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
    </div>
  );
}

export default HabitTableEntry;
