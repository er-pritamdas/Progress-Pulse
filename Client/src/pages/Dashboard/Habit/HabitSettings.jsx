import React, { useState, useEffect, useMemo } from "react";
import { useBlocker } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { TitleChanger } from "../../../utils/TitleChanger";
import ErrorAlert from "../../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../../utils/Alerts/SuccessAlert";
import { setFieldRange, setSelfcareHabits, setMoodList, toggleSubscribeToNewsletter, toggleEmailNotification, toggleDarkMode, toggleStreakReminders } from "../../../services/redux/slice/habitSlice";
import { Flame, Droplet, Moon, BookOpen, Utensils, Smile, UserCheck, X, Info, Download, SaveAll, ListRestart, Play, Calculator, Target, Mail, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { fetchHabitSettings, updateHabitSettings, resetHabitSettings } from "../../../services/redux/slice/habitSlice";
import store from "../../../services/redux/store/store";
import axiosInstance from "../../../Context/AxiosInstance";
import ExportFoodLogModal from "../../../components/Dashboard/Habit/FoodLogging/ExportFoodLogModal";
import AddCustomFoodModal from "../../../components/Dashboard/Habit/FoodLogging/AddCustomFoodModal";

function HabitSettings() {
  TitleChanger("Progress Pulse | Habit Settings");

  // redux Variables
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.habit.settings);
  const {
    subscribeToNewsletter,
    emailNotification,
    darkMode,
    streakReminders,
    age: reduxAge,
    gender: reduxGender,
    weight: reduxWeight,
    height: reduxHeight,
    activityLevel: reduxActivityLevel,
    maintenanceCalories: reduxMaintenanceCalories,
    bmr: reduxBmr,
    loading: reduxLoading,
  } = useSelector((state) => state.habit);

  const [pageLoading, setPageLoading] = useState(true);
  const isDataLoading = pageLoading || reduxLoading;

  // Alerts
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertErrorMessage, setAlertErrorMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertSuccessMessage, setalertSuccessMessage] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", description: "" });

  // Icons <-> Setings
  const iconMap = {
    burned: <Flame size={18} />,
    water: <Droplet size={18} />,
    sleep: <Moon size={18} />,
    read: <BookOpen size={18} />,
    intake: <Utensils size={18} />,
  };

  const unitMap = {
    burned: "Kcal",
    water: "Liters",
    sleep: "Hrs",
    read: "Hrs",
    intake: "Kcal",
    selfCare: "Score",
    mood: "Scale",
    progress: "%",
    // Add more units as per your fields
  };

  const activityLabels = {
    light: "Light: exercise 1-3 times/week",
    moderate: "Moderate: exercise 4-5 times/week",
    active: "Active: daily exercise or intense exercise 3-4 times/week",
    very_active: "Very Active: intense exercise 6-7 times/week",
  };


  const [ranges, setRanges] = useState({ ...settings });
  const [selfcareInput, setSelfcareInput] = useState("");
  const [moodInput, setMoodInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(subscribeToNewsletter);
  const [isEmailNotifOn, setIsEmailNotifOn] = useState(emailNotification);
  const [isDarkMode, setIsDarkMode] = useState(darkMode);
  const [isStreakReminderOn, setIsStreakReminderOn] = useState(streakReminders);




  const handleRangeChange = (field, type, value) => {
    setRanges((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: parseFloat(value),
      },
    }));
  };

  const saveRange = async (field) => {
    // Step 1: Update local Redux state
    dispatch(
      setFieldRange({
        field,
        min: Number(ranges[field].min),
        max: Number(ranges[field].max),
      })
    );
    UpdateSettings()
  };

  const UpdateSettings = async () => {
    const localState = {
      settings: { ...ranges },
      subscribeToNewsletter: isSubscribed,
      emailNotification: isEmailNotifOn,
      darkMode: isDarkMode,
      streakReminders: isStreakReminderOn,
      age: reduxAge,
      gender: reduxGender,
      weight: reduxWeight,
      height: reduxHeight,
      activityLevel: reduxActivityLevel,
      maintenanceCalories: reduxMaintenanceCalories,
      bmr: reduxBmr,
    };
    try {
      await dispatch(updateHabitSettings(localState)).unwrap();
      setalertSuccessMessage("Saved");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
    } catch (err) {
      setAlertErrorMessage("Failed to Save Data");
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    }
  }

  const ResetSettings = async () => {
    try {
      await dispatch(resetHabitSettings()).unwrap();
      setalertSuccessMessage("Reset Successfully");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 4000);
    } catch (err) {
      setAlertErrorMessage("Failed to Reset Data");
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 4000);
    }
  }

  const addToArray = (field, value, setter) => {
    if (!value.trim()) return;
    const updatedArray = [...ranges[field], value.trim()];

    setRanges((prev) => ({
      ...prev,
      [field]: updatedArray,
    }));

    setter("");
    // Removed immediate dispatch to allow "unsaved changes" detection
    // setalertSuccessMessage(`Added`); // Optional: maybe don't show success alert for local add?
    // setShowSuccessAlert(true);
    // setTimeout(() => setShowSuccessAlert(false), 4000);
  };

  const removeFromArray = (field, index) => {
    const updatedArray = [...ranges[field]];
    updatedArray.splice(index, 1);

    setRanges((prev) => ({
      ...prev,
      [field]: updatedArray,
    }));

    // Removed immediate dispatch
    // setalertSuccessMessage(`Removed`);
    // setShowSuccessAlert(true);
    // setTimeout(() => setShowSuccessAlert(false), 4000);
  };

  const preferenceInfo = {
    subscribeToNewsletter: {
      title: "Subscribe to Newsletter",
      description: "You’ll receive weekly updates and productivity tips directly to your email inbox.",
    },
    emailNotification: {
      title: "Email Notifications",
      description: "Enable alerts for new activities, habit streaks, or reminders to keep you on track.",
    },
    darkMode: {
      title: "Dark Mode",
      description: "Switches your interface to a darker theme to reduce eye strain and improve battery life.",
    },
    streakReminders: {
      title: "Streak Reminders",
      description: "Daily reminders to help you maintain your habit streaks and stay consistent.",
    },
    exportData: {
      title: "Export Habit Data",
      description: "Send an Excel spreadsheet (.xlsx) to your registered email containing Table Entry, Settings, and Logging sheets.",
    },
    exportFoodData: {
      title: "Export Food Logging Data",
      description: "Send a 3-sheet Excel spreadsheet (.xlsx) to your email featuring Logged Foods with full DB nutrients, Daily Nutrition Stats (Avg, Min, Max, Total), and Meal Category Summaries.",
    },
  };

  const toggle = (key) => {
    if (key == "subscribeToNewsletter") {
      setIsSubscribed(!isSubscribed)
      dispatch(toggleSubscribeToNewsletter())
    }
    if (key == "emailNotification") {
      setIsEmailNotifOn(!isEmailNotifOn)
      dispatch(toggleEmailNotification())
    }
    if (key == "darkMode") {
      setIsDarkMode(!isDarkMode)
      dispatch(toggleDarkMode())
    }
    if (key == "streakReminders") {
      setIsStreakReminderOn(!isStreakReminderOn)
      dispatch(toggleStreakReminders())
    }
  }

  const isChecked = (key) => {
    if (key === "subscribeToNewsletter") {
      return isSubscribed;
    } else if (key === "emailNotification") {
      return isEmailNotifOn;
    } else if (key === "darkMode") {
      return isDarkMode;
    } else if (key === "streakReminders") {
      return isStreakReminderOn;
    } else {
      return false;
    }
  };

  const openModal = (key) => {
    setModalContent(preferenceInfo[key]);
    setShowModal(true);
  };

  const [isExporting, setIsExporting] = useState(false);
  const [isFoodExportModalOpen, setIsFoodExportModalOpen] = useState(false);
  const [isFoodExporting, setIsFoodExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const response = await axiosInstance.post("/v1/dashboard/habit/export");
      const msg = response.data?.message || "Export sent! Please check your registered email inbox.";
      setalertSuccessMessage(msg);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send export email";
      setAlertErrorMessage(errMsg);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Custom Foods State & Handlers
  const [isAddCustomFoodModalOpen, setIsAddCustomFoodModalOpen] = useState(false);
  const [customFoods, setCustomFoods] = useState([]);
  const [customFoodsLoading, setCustomFoodsLoading] = useState(false);
  const [deletingFoodId, setDeletingFoodId] = useState(null);

  const fetchCustomFoods = async () => {
    try {
      setCustomFoodsLoading(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/custom");
      if (res.data?.data) {
        setCustomFoods(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch user custom foods", err);
    } finally {
      setCustomFoodsLoading(false);
    }
  };

  const handleDeleteCustomFood = async (foodId) => {
    try {
      setDeletingFoodId(foodId);
      await axiosInstance.delete(`/v1/dashboard/habit/food/database/${foodId}`);
      setCustomFoods((prev) => prev.filter((f) => f._id !== foodId));
      setalertSuccessMessage("Custom food item deleted successfully");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (err) {
      setAlertErrorMessage(err.response?.data?.message || "Failed to delete custom food");
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
    } finally {
      setDeletingFoodId(null);
    }
  };

  const handleFoodExport = async (fromDate, toDate) => {
    try {
      setIsFoodExporting(true);
      const response = await axiosInstance.post("/v1/dashboard/habit/food/export", {
        startDate: fromDate,
        endDate: toDate,
      });
      const msg = response.data?.message || "Food Logging export email sent! Please check your inbox.";
      setalertSuccessMessage(msg);
      setShowSuccessAlert(true);
      setIsFoodExportModalOpen(false);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to export food logging data";
      setAlertErrorMessage(errMsg);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 5000);
    } finally {
      setIsFoodExporting(false);
    }
  };


  useEffect(() => {
    let isMounted = true;
    const fetchAllSettings = async () => {
      try {
        setPageLoading(true);
        await Promise.allSettled([
          dispatch(fetchHabitSettings()).unwrap(),
          fetchCustomFoods(),
        ]);
      } catch (err) {
        setAlertErrorMessage("Failed to load settings");
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 4000);
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    fetchAllSettings();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    console.log("Running First Setting UseEffect")
    console.log(settings)
    setRanges({ ...settings });
    setIsSubscribed(subscribeToNewsletter)
    setIsEmailNotifOn(emailNotification)
    setIsDarkMode(darkMode)
    setIsStreakReminderOn(streakReminders)



  }, [settings, subscribeToNewsletter, emailNotification, darkMode, streakReminders, reduxAge, reduxGender, reduxWeight, reduxHeight, reduxActivityLevel, reduxMaintenanceCalories, reduxBmr]);

  // Check for unsaved changes
  const isDirty = useMemo(() => {
    if (!settings) return false;

    const isRangesChanged = JSON.stringify(ranges) !== JSON.stringify(settings);
    const isSubscribedChanged = isSubscribed !== subscribeToNewsletter;
    const isEmailNotifOnChanged = isEmailNotifOn !== emailNotification;
    const isDarkModeChanged = isDarkMode !== darkMode;
    const isStreakReminderOnChanged = isStreakReminderOn !== streakReminders;

    return isRangesChanged || isSubscribedChanged || isEmailNotifOnChanged || isDarkModeChanged || isStreakReminderOnChanged;
  }, [ranges, settings, isSubscribed, subscribeToNewsletter, isEmailNotifOn, emailNotification, isDarkMode, darkMode, isStreakReminderOn, streakReminders]);

  // Block internal navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Block browser navigation (refresh/close)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);








  const isModalOrBlockerOpen = showModal || blocker.state === "blocked";

  useEffect(() => {
    if (isModalOrBlockerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOrBlockerOpen]);

  return (
    <div className="p-1">

      {/* Alert Popup */}
      {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={20} />}
      {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} top={20} />}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-base-200 rounded-3xl p-6 w-[90%] max-w-md h-[220px] relative border border-base-300 shadow-2xl flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div>
              <button className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
              <h3 className="text-xl font-semibold mb-2 pr-8">{modalContent.title}</h3>
              <p className="text-base text-base-content/80">{modalContent.description}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button className="btn btn-sm btn-primary rounded-xl px-4" onClick={() => setShowModal(false)}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Blocker Modal */}
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-base-100 rounded-3xl p-6 w-[90%] max-w-md h-[240px] shadow-2xl border border-warning flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-xl font-bold mb-2 text-warning flex items-center gap-2">
                <Info size={24} /> Unsaved Changes
              </h3>
              <p className="text-base text-base-content/80">
                You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                className="btn btn-sm btn-neutral rounded-xl"
                onClick={() => blocker.reset()}
              >
                Stay
              </button>
              <button
                className="btn btn-sm btn-error rounded-xl"
                onClick={() => blocker.proceed()}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Heading */}
      <div className="sticky top-[-17px] z-30 bg-opacity-90 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between p-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck size={26} />
            Habit Settings
          </h1>
          <div className="join join-vertical lg:join-horizontal">
            <button className="btn btn-info join-item" onClick={UpdateSettings} disabled={isDataLoading}>
              <SaveAll size={17} />
              Save
            </button>
            <button className="btn btn-soft join-item" onClick={ResetSettings} disabled={isDataLoading}>
              <ListRestart size={17} />
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* Settings Container */}
      {isDataLoading ? (
        <div className="h-96 flex items-center justify-center py-16 bg-base-300 rounded-xl shadow-md">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="bg-base-300 rounded-xl p-6 shadow-md">



        {/* Range Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Object.keys(iconMap).map((field) => (
            <div key={field} className="card bg-base-200 p-4 shadow-md relative">
              {/* Unit Tag in top-left */}
              <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded badge badge-soft badge-success">
                {unitMap[field] || "-"}
              </div>

              <h2 className="text-lg font-semibold capitalize mb-3 flex items-center gap-2">
                {iconMap[field]} {field}
              </h2>

              <div className="flex items-center gap-2 mb-2">
                <label className="floating-label w-full">
                  <span>Min</span>
                  <input
                    type="number"
                    placeholder="Min"
                    className="input input-bordered w-full"
                    value={ranges[field]?.min}
                    onChange={(e) =>
                      handleRangeChange(field, "min", e.target.value)
                    }
                  />
                </label>

                <span>-</span>

                <label className="floating-label w-full">
                  <span>Max</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="input input-bordered w-full"
                    value={ranges[field]?.max}
                    onChange={(e) =>
                      handleRangeChange(field, "max", e.target.value)
                    }
                  />
                </label>
              </div>

              <button
                className="btn btn-soft btn-info btn-sm w-full"
                onClick={() => saveRange(field)}
              >
                Save
              </button>
            </div>

          ))}
        </div>

        {/* Selfcare and Mood Tracking Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selfcare Section */}
          <div className="bg-base-200 rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <UserCheck size={22} className="text-success" /> Selfcare Habits
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a selfcare habit"
                className="input input-bordered w-full"
                value={selfcareInput}
                onChange={(e) => setSelfcareInput(e.target.value)}
              />
              <button
                className="btn btn-success"
                onClick={() =>
                  addToArray("selfcare", selfcareInput, setSelfcareInput)
                }
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ranges.selfcare?.map((habit, idx) => (
                <div
                  key={idx}
                  className="badge badge-soft badge-success gap-1 text-sm px-3 py-2 flex items-center">
                  <UserCheck size={14} />
                  {habit}
                  <button
                    className="ml-2 cursor-pointer"
                    onClick={() => removeFromArray("selfcare", idx)}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Section */}
          <div className="bg-base-200 rounded-xl p-6 shadow-md">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Smile size={22} className="text-success" /> Mood Tracking
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a mood"
                className="input input-bordered w-full"
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value)}
              />
              <button
                className="btn btn-success"
                onClick={() => addToArray("mood", moodInput, setMoodInput)}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ranges.mood?.map((m, idx) => (
                <div
                  key={idx}
                  className="badge badge-soft badge-success gap-1 text-sm px-3 py-2 flex items-center"
                >
                  <Smile size={14} />
                  {m}
                  <button
                    className="ml-2 cursor-pointer"
                    onClick={() => removeFromArray("mood", idx)}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Foods Section */}
        <div className="bg-base-200 rounded-xl p-6 shadow-md mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Utensils size={22} className="text-secondary" />
                Custom Foods & Recipes
              </h2>
              <p className="text-xs text-base-content/70 mt-0.5">
                Create custom foods, homemade meals, and branded items with detailed nutritional profiles for your food logger.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm rounded-xl gap-2 font-bold shrink-0 shadow-xs"
              onClick={() => setIsAddCustomFoodModalOpen(true)}
            >
              <Plus size={16} />
              Add Custom Food
            </button>
          </div>

          {customFoodsLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-md text-secondary"></span>
            </div>
          ) : customFoods.length === 0 ? (
            <div className="border-2 border-dashed border-base-300 rounded-2xl p-8 text-center bg-base-100/40">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-3">
                <Utensils size={24} />
              </div>
              <h4 className="text-sm font-bold text-base-content mb-1">
                No custom foods added yet
              </h4>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto mb-4">
                Add your favorite recipes, snacks, or protein shakes to quickly log them in your daily food tracker.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-outline btn-sm rounded-xl gap-1.5 font-bold"
                onClick={() => setIsAddCustomFoodModalOpen(true)}
              >
                <Plus size={14} />
                Create Your First Food Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {customFoods.map((food) => (
                <div
                  key={food._id}
                  className="bg-base-100/90 border border-base-300 rounded-2xl p-4 flex flex-col justify-between hover:border-secondary/40 transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-base-content truncate">
                          {food.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="badge badge-xs badge-soft badge-secondary font-semibold">
                            {food.category || "General"}
                          </span>
                          {food.brand && food.brand !== "Generic" && (
                            <span className="text-[11px] text-base-content/60 truncate">
                              • {food.brand}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomFood(food._id)}
                        disabled={deletingFoodId === food._id}
                        className="btn btn-ghost btn-xs btn-circle text-error/70 hover:text-error hover:bg-error/10 shrink-0"
                        title="Delete custom food"
                      >
                        {deletingFoodId === food._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-base-300 text-center">
                      <div className="bg-base-200/70 rounded-lg p-1.5">
                        <p className="text-[10px] text-base-content/60 uppercase font-bold">Cals</p>
                        <p className="text-xs font-black text-secondary">{food.calories || 0}</p>
                      </div>
                      <div className="bg-base-200/70 rounded-lg p-1.5">
                        <p className="text-[10px] text-base-content/60 uppercase font-bold">Prot</p>
                        <p className="text-xs font-black text-info">{food.protein || 0}g</p>
                      </div>
                      <div className="bg-base-200/70 rounded-lg p-1.5">
                        <p className="text-[10px] text-base-content/60 uppercase font-bold">Carb</p>
                        <p className="text-xs font-black text-warning">{food.carbohydrates || 0}g</p>
                      </div>
                      <div className="bg-base-200/70 rounded-lg p-1.5">
                        <p className="text-[10px] text-base-content/60 uppercase font-bold">Fat</p>
                        <p className="text-xs font-black text-error">{food.fat || 0}g</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-base-content/60 border-t border-base-300/50">
                    <span>Serving: {food.servingSize || 100} {food.unitType || "g"}</span>
                    <span className="text-[10px] font-mono opacity-80">Custom</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

      {/* Export Food Log Modal */}
      <ExportFoodLogModal
        isOpen={isFoodExportModalOpen}
        onClose={() => setIsFoodExportModalOpen(false)}
        onExport={handleFoodExport}
        isFoodExporting={isFoodExporting}
      />

      {/* Add Custom Food Modal */}
      <AddCustomFoodModal
        isOpen={isAddCustomFoodModalOpen}
        onClose={() => setIsAddCustomFoodModalOpen(false)}
        onFoodAdded={() => {
          fetchCustomFoods();
          setalertSuccessMessage("Custom food item added successfully!");
          setShowSuccessAlert(true);
          setTimeout(() => setShowSuccessAlert(false), 3000);
        }}
      />
    </div>
  );
}

export default HabitSettings;
