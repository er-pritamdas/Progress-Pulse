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

  // Physical Settings State
  const [age, setAge] = useState(reduxAge);
  const [gender, setGender] = useState(reduxGender);
  const [weight, setWeight] = useState(reduxWeight);
  const [height, setHeight] = useState(reduxHeight);
  const [activityLevel, setActivityLevel] = useState(reduxActivityLevel);
  const [maintenanceCalories, setMaintenanceCalories] = useState(reduxMaintenanceCalories);
  const [bmr, setBmr] = useState(reduxBmr);


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
      age,
      gender,
      weight,
      height,
      activityLevel,
      maintenanceCalories,
      bmr,
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

    // Sync Physical Settings
    setAge(reduxAge || 18);
    setGender(reduxGender || "male");
    setWeight(reduxWeight || 80);
    setHeight(reduxHeight || 180);
    setActivityLevel(reduxActivityLevel || "light");
    setMaintenanceCalories(reduxMaintenanceCalories || 0);
    setBmr(reduxBmr || 0);

  }, [settings, subscribeToNewsletter, emailNotification, darkMode, streakReminders, reduxAge, reduxGender, reduxWeight, reduxHeight, reduxActivityLevel, reduxMaintenanceCalories, reduxBmr]);

  // Check for unsaved changes
  const isDirty = useMemo(() => {
    if (!settings) return false;

    const isRangesChanged = JSON.stringify(ranges) !== JSON.stringify(settings);
    const isSubscribedChanged = isSubscribed !== subscribeToNewsletter;
    const isEmailNotifOnChanged = isEmailNotifOn !== emailNotification;
    const isDarkModeChanged = isDarkMode !== darkMode;
    const isStreakReminderOnChanged = isStreakReminderOn !== streakReminders;

    const isAgeChanged = age !== (reduxAge || 18);
    const isGenderChanged = gender !== (reduxGender || "male");
    const isWeightChanged = weight !== (reduxWeight || 80);
    const isHeightChanged = height !== (reduxHeight || 180);
    const isActivityLevelChanged = activityLevel !== (reduxActivityLevel || "light");
    // maintenanceCalories is derived, so we don't strictly check it, but if inputs change it implies change.
    // However, if user calculated but didn't save, it's dirty.
    const isMaintenanceCaloriesChanged = maintenanceCalories !== (reduxMaintenanceCalories || 0);
    const isBmrChanged = bmr !== (reduxBmr || 0);

    return isRangesChanged || isSubscribedChanged || isEmailNotifOnChanged || isDarkModeChanged || isStreakReminderOnChanged ||
      isAgeChanged || isGenderChanged || isWeightChanged || isHeightChanged || isActivityLevelChanged || isMaintenanceCaloriesChanged || isBmrChanged;
  }, [ranges, settings, isSubscribed, subscribeToNewsletter, isEmailNotifOn, emailNotification, isDarkMode, darkMode, isStreakReminderOn, streakReminders,
    age, reduxAge, gender, reduxGender, weight, reduxWeight, height, reduxHeight, activityLevel, reduxActivityLevel, maintenanceCalories, reduxMaintenanceCalories, bmr, reduxBmr]);

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

  const calculateCalories = () => {
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    setBmr(Math.round(bmr));

    const multipliers = {
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const calories = Math.round(bmr * (multipliers[activityLevel] || 1.2));
    setMaintenanceCalories(calories);

    // Auto-save after calculation
    // We need to call UpdateSettings but it uses current state which might not be updated yet if we just set it.
    // So we pass the calculated value directly or use a separate effect. 
    // Ideally, we update the local state and then save.

    // Construct the payload directly to ensure latest values are used
    const localState = {
      settings: { ...ranges },
      subscribeToNewsletter: isSubscribed,
      emailNotification: isEmailNotifOn,
      darkMode: isDarkMode,
      streakReminders: isStreakReminderOn,
      age,
      gender,
      weight,
      height,
      activityLevel,
      maintenanceCalories: calories,
      bmr: Math.round(bmr)
    };

    dispatch(updateHabitSettings(localState)).unwrap()
      .then(() => {
        setalertSuccessMessage("Calculated & Saved");
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 4000);
      })
      .catch(() => {
        setAlertErrorMessage("Failed to Save Calculation");
        setShowErrorAlert(true);
        setTimeout(() => setShowErrorAlert(false), 4000);
      });
  };

  const clearPhysicalSettings = () => {
    setAge(0);
    setGender("male");
    setWeight(0);
    setHeight(0);
    setActivityLevel("light");
    setMaintenanceCalories(0);
    setBmr(0);
  };






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

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calculator size={22} /> Physical Settings & Calculator
        </h2>
        {/* Physical Settings Section */}
        <div className="card bg-base-200 p-6 shadow-md mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Inputs */}
            <div className="space-y-4">
              {/* Age */}
              <label className="floating-label w-full">
                <input
                  type="number"
                  placeholder="Age"
                  className="input input-md w-full"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
                <span>Age (15-80)</span>
              </label>

              {/* Gender */}
              <div className="flex items-center gap-4">
                <label className="w-24 font-medium">Gender</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      className="radio radio-primary"
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      className="radio radio-primary"
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              {/* Height */}
              <label className="floating-label w-full">
                <input
                  type="number"
                  placeholder="Height"
                  className="input input-md w-full"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
                <span>Height (cm)</span>
              </label>

              {/* Weight */}
              <label className="floating-label w-full">
                <input
                  type="number"
                  placeholder="Weight"
                  className="input input-md w-full"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
                <span>Weight (kg)</span>
              </label>

              {/* Activity Level */}
              <div className="flex items-center gap-4">
                {/* <label className="w-24 font-medium">Activity</label> */}
                <div className="dropdown w-full">
                  <div tabIndex={0} role="button" className="btn m-1 w-full justify-between font-normal bg-base-100 border-base-300">
                    {activityLabels[activityLevel] || "Select Activity"}
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow-sm">
                    {Object.entries(activityLabels).map(([value, label]) => (
                      <li key={value}>
                        <a onClick={() => {
                          setActivityLevel(value);
                          const elem = document.activeElement;
                          if (elem) elem.blur();
                        }}>
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-4 ml-28">
                <button className="btn btn-success" onClick={calculateCalories}>
                  Calculate <Play size={16} fill="currentColor" />
                </button>
                <button className="btn btn-neutral" onClick={clearPhysicalSettings}>
                  Clear
                </button>
              </div>
            </div>

            {/* Column 2: BMR Display (Center) */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="radial-progress text-primary" style={{ "--value": 100, "--size": "12rem", "--thickness": "1rem" }} role="progressbar">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold">{bmr || 0}</span>
                  <span className="text-sm opacity-70">BMR</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Basal Metabolic Rate</h3>
                <p className="text-sm text-base-content/70 max-w-xs">
                  Calories your body burns at rest.
                </p>
              </div>
            </div>

            {/* Column 3: Results Display (Right) */}
            <div className="flex flex-col gap-2">
              {/* Maintain Weight */}
              <div className="flex bg-base-100 rounded-lg overflow-hidden border border-base-300">
                <div className="flex-1 p-4 flex items-center justify-center bg-base-100 border-r border-base-300">
                  <span className="text-lg font-medium">Maintain weight</span>
                </div>
                <div className="w-40 p-2 bg-success flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-success-content">{(maintenanceCalories || 0).toLocaleString()}</span>
                  <span className="text-xs text-success-content/70">100% Calories/day</span>
                </div>
              </div>

              {/* Mild Weight Loss */}
              <div className="flex bg-base-100 rounded-lg overflow-hidden border border-base-300">
                <div className="flex-1 p-2 flex flex-col items-center justify-center bg-base-100 border-r border-base-300">
                  <span className="text-lg font-medium">Mild weight loss</span>
                  <span className="text-sm text-gray-500">0.25 kg/week</span>
                </div>
                <div className="w-40 p-2 bg-warning flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-warning-content">{Math.round((maintenanceCalories || 0) * 0.89).toLocaleString()}</span>
                  <span className="text-xs text-warning-content/70">89% Calories/day</span>
                </div>
              </div>

              {/* Weight Loss */}
              <div className="flex bg-base-100 rounded-lg overflow-hidden border border-base-300">
                <div className="flex-1 p-2 flex flex-col items-center justify-center bg-base-100 border-r border-base-300">
                  <span className="text-lg font-medium">Weight loss</span>
                  <span className="text-sm text-gray-500">0.5 kg/week</span>
                </div>
                <div className="w-40 p-2 bg-error flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-error-content">{Math.round((maintenanceCalories || 0) * 0.78).toLocaleString()}</span>
                  <span className="text-xs text-error-content/70">78% Calories/day</span>
                </div>
              </div>

              {/* Extreme Weight Loss */}
              <div className="flex bg-base-100 rounded-lg overflow-hidden border border-base-300">
                <div className="flex-1 p-2 flex flex-col items-center justify-center bg-base-100 border-r border-base-300">
                  <span className="text-lg font-medium">Extreme weight loss</span>
                  <span className="text-sm text-gray-500">1 kg/week</span>
                </div>
                <div className="w-40 p-2 bg-secondary flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-secondary-content">{Math.round((maintenanceCalories || 0) * 0.56).toLocaleString()}</span>
                  <span className="text-xs text-secondary-content/70">56% Calories/day</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
