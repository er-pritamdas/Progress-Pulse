import React, { useState, useEffect, useMemo } from "react";
import { useBlocker } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { TitleChanger } from "../../../utils/TitleChanger";
import ErrorAlert from "../../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../../utils/Alerts/SuccessAlert";
import { setFieldRange, setSelfcareHabits, setMoodList, toggleSubscribeToNewsletter, toggleEmailNotification, toggleDarkMode, toggleStreakReminders } from "../../../services/redux/slice/habitSlice";
import { Flame, Droplet, Moon, BookOpen, Utensils, Smile, UserCheck, X, Info, Download, SaveAll, ListRestart, Play, Calculator, Target } from "lucide-react";
import { useLoading } from "../../../Context/LoadingContext";
import { fetchHabitSettings, updateHabitSettings, resetHabitSettings } from "../../../services/redux/slice/habitSlice";
import store from "../../../services/redux/store/store";

function HabitSettings() {
  TitleChanger("Progress Pulse | Habit Settings");

  const { setLoading } = useLoading();

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
    bmr: reduxBmr
  } = useSelector((state) => state.habit);

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
    setLoading(true);
    // Step 1: Update local Redux state
    dispatch(
      setFieldRange({
        field,
        min: Number(ranges[field].min),
        max: Number(ranges[field].max),
      })
    );
    // setLoading(false);
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
    } finally {
      setLoading(false);
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
    } finally {
      setLoading(false);
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
    excelDownload: {
      title: "Download Excel Template",
      description: "Download a sample Excel format to manually track or backup your data offline.",
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

  const handleExcelDownload = () => {
    const blob = new Blob(
      ["Habit,Date,Value\nWater,2025-01-01,2L\nBurned,2025-01-01,300kcal"],
      { type: "text/csv" }
    );
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "habit_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setalertSuccessMessage("Excel format downloaded");
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 4000);
  };


  useEffect(() => {
    console.log("Running First useEffect")
    const fetchSettings = async () => {
      try {
        setLoading(true);
        await dispatch(fetchHabitSettings()).unwrap();
      } catch (err) {
        setAlertErrorMessage("Failed to load settings");
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 4000);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

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








  return (
    <div className="p-1">

      {/* Alert Popup */}
      {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={20} />}
      {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} top={20} />}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-base-200 rounded-xl p-6 w-[90%] max-w-md relative">
            <button className="absolute top-2 right-2" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-2">{modalContent.title}</h3>
            <p className="text-base">{modalContent.description}</p>
          </div>
        </div>
      )}

      {/* Unsaved Changes Blocker Modal */}
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-xl p-6 w-[90%] max-w-md shadow-2xl border border-warning">
            <h3 className="text-xl font-bold mb-2 text-warning flex items-center gap-2">
              <Info size={24} /> Unsaved Changes
            </h3>
            <p className="text-base mb-6">
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-neutral"
                onClick={() => blocker.reset()}
              >
                Stay
              </button>
              <button
                className="btn btn-error"
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
            <button className="btn btn-info join-item" onClick={UpdateSettings}>
              <SaveAll size={17} />
              Save
            </button>
            <button className="btn btn-soft join-item" onClick={ResetSettings}>
              <ListRestart size={17} />
              Reset to Default
            </button>
          </div>
        </div>
      </div>


      {/* Settings Container */}
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

        {/* Selfcare and Mood + Side Settings Container */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left 70% Content */}
          <div className="lg:w-[60%] w-full">
            {/* Selfcare Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <UserCheck size={22} /> Selfcare Habits
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
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Smile size={22} /> Mood Tracking
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

          {/* Preferences Panel - Right Side (35%) */}
          <div className="lg:w-[35%] w-full bg-base-200 rounded-xl p-6 shadow-md h-fit">
            <h2 className="text-xl font-bold mb-5">Your Pulse Preferences</h2>

            {/* Preferences */}
            {[
              { key: "subscribeToNewsletter", label: "Subscribe to Newsletter", toggleClass: "toggle-info" },
              { key: "emailNotification", label: "Email Notifications", toggleClass: "toggle-success" },
              { key: "darkMode", label: "Dark Mode", toggleClass: "toggle-warning" },
              { key: "streakReminders", label: "Streak Reminders", toggleClass: "toggle-error" },
            ].map(({ key, label, toggleClass }) => (
              <div
                key={key}
                className="flex items-center justify-between py-3 border-b border-base-300"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-base">{label}</p>
                    <button onClick={() => openModal(key)}>
                      <Info size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-muted">
                    {preferenceInfo[key].description.slice(0, 36)}...
                  </p>
                </div>
                <input key={key} type="checkbox" className={`toggle ${toggleClass}`} onChange={() => toggle(key)}
                  checked={isChecked(key)} />
              </div>
            ))}

            {/* Download Excel */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-base">Download Excel Format</p>
                  <button onClick={() => openModal("excelDownload")}>
                    <Info size={16} />
                  </button>
                </div>
                <p className="text-sm text-muted">
                  Get a CSV to track your habits manually.
                </p>
              </div>
              <button className="btn btn-sm btn-primary" onClick={handleExcelDownload}>
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HabitSettings;
