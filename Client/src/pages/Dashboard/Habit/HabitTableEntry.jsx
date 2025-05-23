import React, { useState, useEffect } from "react";
import AddHabitPopUp from "../../../components/Dashboard/Habit/AddHabitPopUp";
import Trash from "../../../utils/Icons/Trash";
import Pencil from "../../../utils/Icons/Pencil";
import Save from "../../../utils/Icons/Save";
import Cancel from "../../../utils/Icons/Cancel";
import ErrorAlert from "../../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../../utils/Alerts/SuccessAlert";
import axiosInstance from "../../../Context/AxiosInstance";
import { useLoading } from "../../../Context/LoadingContext";
import DeleteHabitPopUp from "../../../components/Dashboard/Habit/DeleteHabitPopUp";
import Refresh from "../../../utils/Icons/Refresh";
import { TitleChanger } from "../../../utils/TitleChanger";
import { useSelector } from "react-redux";
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
  const ITEMS_PER_PAGE = 7;
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
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  // -------------------------------------------------------------------- Functions ---------------------------------------------------------------

  const currentYear = new Date().getFullYear();

  // 🔹 Generate raw date strings for Jan 1 and Dec 31
  const firstDateRaw = `${currentYear}-01-01`;
  const lastDateRaw = `${currentYear}-12-31`;

  // 🔹 Set in state
  const [fromDate, setFromDate] = useState(firstDateRaw);
  const [toDate, setToDate] = useState(lastDateRaw);

  const resetFilters = () => {
    setFromDate(firstDateRaw);
    setToDate(lastDateRaw);
    // Optionally re-fetch or show all data
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
          limit: ITEMS_PER_PAGE,
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
      setTotalPages(1)
      setCurrentPage(1)
      setTimeout(() => setShowErrorAlert(false), 4000);
    } finally {
      // only compute totalPages if we got a response
      if (response?.data?.data?.totalEntries != null) {
        setTotalPages(
          Math.ceil(response.data.data.totalEntries / ITEMS_PER_PAGE)
        );
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits(currentPage);
  }, []); // re-run when currentPage changes

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
    if (percentage === 100) return "progress-success"; // ✅ Full
    if (percentage >= 70) return "progress-info"; // 🟡 Almost there
    if (percentage >= 30) return "progress-warning"; // 🟠 Midway
    return "progress-error"; // 🔴 Low
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
    const filled = fields.filter(
      (key) => item[key] && item[key].toString().trim() !== "0"
    );
    const progressPercentage = Math.round(
      (filled.length / fields.length) * 100
    );
    item["progress"] = progressPercentage;
    return progressPercentage;
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
      setalertSuccessMessage(`Entry For ${itemToDelete} Deleted`);
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
    setEditingItem({ ...item });
  };

  // Save Data Function
  const handleSave = async () => {
    const originalItem = data.find((item) => item.date === editingItem.date);
    console.log(originalItem);

    if (JSON.stringify(originalItem) === JSON.stringify(editingItem)) {
      setalertSuccessMessage("Already up to date!");
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
      setalertSuccessMessage(response.data.message);
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
      setalertSuccessMessage(response.data.message);
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

      {/* Heading and Add Button */}
      <div className="flex justify-between mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Habit Tracker Table Entry</h1>

        {/* <div className="flex items-center gap-2">
          <div className="badge badge-sm badge-warning">Below Min</div>
          <div className="badge badge-sm badge-success">Within Range</div>
          <div className="badge badge-sm badge-error">Above Max</div>
        </div> */}

        <div className="join join-vertical lg:join-horizontal">
          <button
            className="btn btn-primary join-item"
            onClick={handleAddEntryClick}
          >
            + Add Entry
          </button>
          <button
            className="btn btn-soft join-item"
            onClick={() => {
              // if (!data || data.length === 0) return;
              fetchHabits(currentPage);
              setalertSuccessMessage("Refreshed!");
              setShowSuccessAlert(true);
              setTimeout(() => setShowSuccessAlert(false), 4000);
            }}
          >
            <Refresh /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto scroll-hidden">
        <table className="bg-base-300 table table-fixed   w-full">
          {/* Headings */}
          <thead>
            <tr>
              <th colSpan="10" className="py-3 px-4 bg-base-200">
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

                  {/* Right: From/To Date Pickers */}
                  <div className="flex items-center gap-4 ml-auto">
                    {/* FROM DATE PICKER */}
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
                          onchange={(e) =>
                            setFromDate(e.target.value)
                          }
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
                    -

                    {/* TO DATE PICKER */}
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
                          onchange={(e) =>
                            setToDate(e.target.value)
                          }
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
                      <button className=" join-item btn btn-soft btn-sm btn-success" onClick={fetchHabits}>
                        Filter
                      </button>
                      <button className="join-item btn btn-sm btn-soft" onClick={resetFilters}>
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
                  Burned [Kcal]
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <Droplet className="w-4 h-4" />
                  Water [L]
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <BedDouble className="w-4 h-4" />
                  Sleep [Hrs]
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Read [Hrs]
                </div>
              </th>
              <th className="w-[80px] text-center border border-base-100">
                <div className="flex items-center justify-center gap-1">
                  <Utensils className="w-4 h-4" />
                  Intake [Kcal]
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
                  <MoreHorizontal className="w-4 h-4" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="10" className="h-[60vh] text-center align-middle bg-base-100">
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
                  <tr key={item.date} className="text-center">
                    <td className="text-sm">{formatDate(item.date)}</td>
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
                    <td>
                      <input
                        type="text"
                        pattern="^[B_]{1}[S_]{1}[F_]{1}$"
                        title="Only B, S, F or _ in respective positions. Example: BSF, B_F, _SF"
                        onKeyDown={handleKeyDown}
                        name="selfcare"
                        className="btn btn-sm w-full max-w-[80px] hover:cursor-text bg-base-100"
                        value={editingItem.selfcare}
                        onChange={handleChange}
                      />
                    </td>
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
                    <td>
                      <progress
                        className={`progress w-20 ${getProgressColorClass(
                          calculateProgress(editingItem)
                        )}`}
                        value={calculateProgress(editingItem)}
                        max="100"
                      ></progress>
                    </td>
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
                  <tr key={item.date} className="text-center">
                    <td className="border border-base-100 text-sm">
                      {formatDate(item.date)}
                    </td>

                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "burned",
                        item.burned || 0,
                        settings
                      )}`}
                    >
                      {item.burned || 0} Kcal
                    </td>

                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "water",
                        item.water || 0,
                        settings
                      )}`}
                    >
                      {item.water || 0} Ltr
                    </td>

                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "sleep",
                        item.sleep || 0,
                        settings
                      )}`}
                    >
                      {item.sleep || 0} Hrs
                    </td>

                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "read",
                        item.read || 0,
                        settings
                      )}`}
                    >
                      {item.read || 0} Hrs
                    </td>

                    <td
                      className={`text-sm border border-base-100 truncate ${getColorClass(
                        "intake",
                        item.intake || 0,
                        settings
                      )}`}
                    >
                      {item.intake || 0} Kcal
                    </td>

                    <td className="text-sm border border-base-100 truncate">
                      {item.selfcare || "---"}
                    </td>

                    <td className="text-sm border border-base-100 truncate">
                      {item.mood || "---"}
                    </td>

                    <td>
                      <progress
                        className={`progress w-20 ${getProgressColorClass(
                          calculateProgress(item)
                        )}`}
                        value={calculateProgress(item)}
                        max="100"
                      ></progress>
                    </td>

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
      <div className="mt-4 flex justify-end gap-2">
        {/* Previous Button */}
        <button
          className="btn btn-soft btn-secondary btn-sm"
          onClick={() => {
            const prevPageNumber = Math.max(currentPage - 1, 1);
            setCurrentPage(prevPageNumber);
            fetchHabits(prevPageNumber);
          }}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <span className="flex items-center px-2">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Button */}
        <button
          className="btn btn-soft btn-secondary btn-sm"
          onClick={() => {
            const nextPageNumber = Math.min(currentPage + 1, totalPages);
            setCurrentPage(nextPageNumber);
            fetchHabits(nextPageNumber);
          }}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <AddHabitPopUp
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
        progress={calculateProgress}
        progresscolor={getProgressColorClass}
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
