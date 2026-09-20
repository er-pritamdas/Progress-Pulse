import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TitleChanger } from "../../../utils/TitleChanger";
import { updateHabitSettings, fetchHabitSettings, fetchPhysicalLogs, addPhysicalLog, deletePhysicalLog } from "../../../services/redux/slice/habitSlice";
import { Calculator, Play, UserCheck, Plus, History, Trash2, Info, Activity, PieChart, TrendingDown, TrendingUp, Scale, Flame } from "lucide-react";
import ReactApexChart from "react-apexcharts";
import ErrorAlert from "../../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../../utils/Alerts/SuccessAlert";
import MacroMicroCalculator from "../../../components/Dashboard/Habit/MacroMicroCalculator";

function HabitLogging() {
    TitleChanger("Progress Pulse | Habit Profile");
    const dispatch = useDispatch();

    // Redux State
    const {
        age: reduxAge,
        gender: reduxGender,
        weight: reduxWeight,
        height: reduxHeight,
        activityLevel: reduxActivityLevel,
        maintenanceCalories: reduxMaintenanceCalories,
        bmr: reduxBmr,
        bmi: reduxBmi,
        physicalLogs,
        settings // Needed to preserve other settings when updating
    } = useSelector((state) => state.habit);

    // Local State
    const [age, setAge] = useState(reduxAge || 0);
    const [gender, setGender] = useState(reduxGender || "male");
    const [weight, setWeight] = useState(reduxWeight || 0);
    const [height, setHeight] = useState(reduxHeight || 0);
    const [activityLevel, setActivityLevel] = useState(reduxActivityLevel || "light");
    const [maintenanceCalories, setMaintenanceCalories] = useState(reduxMaintenanceCalories || 0);
    const [bmr, setBmr] = useState(reduxBmr || 0);
    const [bmi, setBmi] = useState(reduxBmi || 0);

    // Mobile Phone View State
    const [mobileTab, setMobileTab] = useState("calculator"); // "calculator" | "macros" | "logs"
    const [mobileGoalType, setMobileGoalType] = useState("loss"); // "loss" | "gain"
    const [mobileStatsView, setMobileStatsView] = useState("bmr"); // "bmr" | "bmi"
    const [mobileChartMetric, setMobileChartMetric] = useState("weight"); // "weight" | "height" | "bmi"

    // Logging State
    const [logWeight, setLogWeight] = useState("");
    const [logHeight, setLogHeight] = useState("");
    const [isMobileAddLogOpen, setIsMobileAddLogOpen] = useState(false);

    // Alerts
    const [pageLoading, setPageLoading] = useState(true);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertErrorMessage, setAlertErrorMessage] = useState("");
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [alertSuccessMessage, setalertSuccessMessage] = useState("");

    const activityLabels = {
        light: "Light: exercise 1-3 times/week",
        moderate: "Moderate: exercise 4-5 times/week",
        active: "Active: daily exercise 5-6 times/week",
        very_active: "Very Active: intense exercise 6-7 times/week",
    };

    useEffect(() => {
        setAge(reduxAge || 0);
        setGender(reduxGender || "male");
        setWeight(reduxWeight || 0);
        setHeight(reduxHeight || 0);
        setActivityLevel(reduxActivityLevel || "light");
        setMaintenanceCalories(reduxMaintenanceCalories || 0);
        setBmr(reduxBmr || 0);
        setBmi(reduxBmi || 0);
    }, [reduxAge, reduxGender, reduxWeight, reduxHeight, reduxActivityLevel, reduxMaintenanceCalories, reduxBmr, reduxBmi]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setPageLoading(true);
                await Promise.allSettled([
                    dispatch(fetchHabitSettings()).unwrap(),
                    dispatch(fetchPhysicalLogs()).unwrap(),
                ]);
            } catch (err) {
                console.error("Error loading habit profile data:", err);
            } finally {
                setPageLoading(false);
            }
        };
        fetchInitialData();
    }, [dispatch]);



    const calculateCalories = () => {
        let calculatedBmr = 0;
        if (gender === "male") {
            calculatedBmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            calculatedBmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        setBmr(Math.round(calculatedBmr));

        const multipliers = {
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            very_active: 1.9,
        };

        const calories = Math.round(calculatedBmr * (multipliers[activityLevel] || 1.2));
        setMaintenanceCalories(calories);

        let bmiValue = 0;
        if (weight && height) {
            bmiValue = weight / ((height / 100) * (height / 100));
        }
        setBmi(parseFloat(bmiValue.toFixed(1)));

        // Save to Redux/Backend
        const localState = {
            settings: settings, // Preserve existing settings
            age,
            gender,
            weight,
            height,
            activityLevel,
            maintenanceCalories: calories,
            bmr: Math.round(calculatedBmr),
            bmi: parseFloat(bmiValue.toFixed(1))
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
        setBmi(0);
    };

    const handleAddLog = () => {
        if (!logWeight || !logHeight) {
            setAlertErrorMessage("Please enter both Weight and Height");
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 3000);
            return;
        }

        const bmiValue = Number(logWeight) / ((Number(logHeight) / 100) * (Number(logHeight) / 100));
        const logData = {
            weight: Number(logWeight),
            height: Number(logHeight),
            bmi: parseFloat(bmiValue.toFixed(1))
        };

        dispatch(addPhysicalLog(logData)).unwrap()
            .then(() => {
                setalertSuccessMessage("Log Added Successfully");
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 3000);
                setLogWeight("");
                setLogHeight("");
            })
            .catch((err) => {
                setAlertErrorMessage(err || "Failed to add log");
                setShowErrorAlert(true);
                setTimeout(() => setShowErrorAlert(false), 3000);
            });
    };

    const handleDeleteLog = (logId) => {
        if (window.confirm("Are you sure you want to delete this log?")) {
            dispatch(deletePhysicalLog(logId)).unwrap()
                .then(() => {
                    setalertSuccessMessage("Log Deleted Successfully");
                    setShowSuccessAlert(true);
                    setTimeout(() => setShowSuccessAlert(false), 3000);
                })
                .catch((err) => {
                    setAlertErrorMessage(err || "Failed to delete log");
                    setShowErrorAlert(true);
                    setTimeout(() => setShowErrorAlert(false), 3000);
                });
        }
    };

    // Prepare Chart Data
    const chartData = (physicalLogs || []).map(log => ({
        x: new Date(log.date).getTime(),
        weight: log.weight,
        height: log.height,
        bmi: log.bmi
    }));

    const weightSeries = [{ name: "Weight", data: chartData.map(d => [d.x, d.weight]) }];
    const heightSeries = [{ name: "Height", data: chartData.map(d => [d.x, d.height]) }];
    const bmiSeries = [{ name: "BMI", data: chartData.map(d => [d.x, d.bmi]) }];

    const commonChartOptions = {
        chart: {
            type: 'line',
            height: 160,
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: "15px",
                fontWeight: "400",
                colors: ["#ffffffcc"],
            },
            offsetY: 0,
            background: {
                enabled: false,
                foreColor: "#ffffffff",
                padding: 2,
                borderRadius: 3,
                opacity: 0.4,
                color: "#000000ff",
            },
        },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            type: 'datetime',
            labels: {
                style: { colors: "#FFFFFF" },
                rotate: -45,
            },
            axisBorder: { color: "#888" },
            axisTicks: { color: "#888" },
            title: {
                text: "Days",
                style: { color: "#FFFFFF" },
            },
        },
        yaxis: [
            {
                title: {
                    text: "Calories",
                    style: { color: "#FFFFFF" },
                },
                labels: { style: { colors: "#FFFFFF" } },
            },
        ],
        tooltip: {
            x: { format: 'dd MMM yyyy' },
            theme: "dark",
            shared: true,
            intersect: false,
            fillSeriesColor: false,
            marker: { show: true },
            style: { fontSize: "10px" },
        },
        grid: { borderColor: '#3f3f3f42' }
    };

    const getBmiCategory = (val) => {
        if (!val || val <= 0) return { label: "Unknown", badge: "badge-ghost", text: "text-base-content/60" };
        if (val < 18.5) return { label: "Underweight", badge: "badge-info", text: "text-info" };
        if (val < 25) return { label: "Normal", badge: "badge-success", text: "text-success" };
        if (val < 30) return { label: "Overweight", badge: "badge-warning", text: "text-warning" };
        return { label: "Obese", badge: "badge-error", text: "text-error" };
    };

    const calorieTiers = mobileGoalType === "loss" ? [
        { label: "Maintain Weight", rate: "Zero change", cals: maintenanceCalories, percent: "100%", badge: "badge-success", color: "text-success", bg: "bg-success/10 border-success/30" },
        { label: "Mild Weight Loss", rate: "0.25 kg / week", cals: Math.round((maintenanceCalories || 0) * 0.89), percent: "89%", badge: "badge-warning", color: "text-warning", bg: "bg-warning/10 border-warning/30" },
        { label: "Weight Loss", rate: "0.5 kg / week", cals: Math.round((maintenanceCalories || 0) * 0.78), percent: "78%", badge: "badge-error", color: "text-error", bg: "bg-error/10 border-error/30" },
        { label: "Extreme Weight Loss", rate: "1.0 kg / week", cals: Math.round((maintenanceCalories || 0) * 0.56), percent: "56%", badge: "badge-secondary", color: "text-secondary", bg: "bg-secondary/10 border-secondary/30" },
    ] : [
        { label: "Maintain Weight", rate: "Zero change", cals: maintenanceCalories, percent: "100%", badge: "badge-success", color: "text-success", bg: "bg-success/10 border-success/30" },
        { label: "Mild Weight Gain", rate: "0.25 kg / week", cals: Math.round((maintenanceCalories || 0) * 1.11), percent: "111%", badge: "badge-warning", color: "text-warning", bg: "bg-warning/10 border-warning/30" },
        { label: "Weight Gain", rate: "0.5 kg / week", cals: Math.round((maintenanceCalories || 0) * 1.22), percent: "122%", badge: "badge-error", color: "text-error", bg: "bg-error/10 border-error/30" },
        { label: "Extreme Weight Gain", rate: "1.0 kg / week", cals: Math.round((maintenanceCalories || 0) * 1.44), percent: "144%", badge: "badge-secondary", color: "text-secondary", bg: "bg-secondary/10 border-secondary/30" },
    ];

    return (
        <div className="p-0 md:p-4 w-full">
            {showErrorAlert && <div className="px-2 pt-2 md:px-0 md:pt-0"><ErrorAlert message={alertErrorMessage} top={20} /></div>}
            {showSuccessAlert && <div className="px-2 pt-2 md:px-0 md:pt-0"><SuccessAlert message={alertSuccessMessage} top={20} /></div>}

            <h1 className="text-2xl font-bold hidden md:flex items-center gap-2 mb-6">
                <UserCheck size={26} />
                Habit Profile
            </h1>

            {pageLoading ? (
                <div className="h-96 flex items-center justify-center bg-base-300 rounded-xl p-12 shadow-md">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : (
                <>
                {/* ── Desktop View (hidden md:block) — 100% UNTOUCHED ── */}
                <div className="hidden md:block space-y-8">
                <div className="bg-base-300 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calculator size={22} /> Physical Settings & Calculator
                </h2>

                <div className="card bg-base-200 p-6 shadow-md mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Inputs */}
                        <div className="space-y-4 mt-10">
                            <label className="floating-label w-full">
                                <input
                                    type="number"
                                    placeholder="Age"
                                    className="input input-md w-full"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
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
                                    onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
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
                                    onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                                <span>Weight (kg)</span>
                            </label>

                            {/* Activity Level */}
                            <div className="flex items-center gap-4">
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

                            <div className="flex gap-2 mt-4 ml-28">
                                <button className="btn btn-success" onClick={calculateCalories}>
                                    Calculate <Play size={16} fill="currentColor" />
                                </button>
                                <button className="btn btn-neutral" onClick={clearPhysicalSettings}>
                                    Clear
                                </button>
                            </div>
                        </div>


                        <div className="tabs tabs-border">

                            {/* TAB 1 — BMR */}
                            <input
                                type="radio"
                                name="stats_tabs"
                                className="tab"
                                aria-label="BMR"
                                defaultChecked
                            />
                            <div className="tab-content mt-15">
                                {/* BMR Content */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className="radial-progress text-primary/80"
                                        style={{
                                            "--value": 100,
                                            "--size": "10rem",
                                            "--thickness": "0.8rem",
                                        }}
                                        role="progressbar"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-bold">{bmr || 0}</span>
                                            <div className="flex items-center gap-1 opacity-70">
                                                <span className="text-sm">BMR</span>
                                                <button
                                                    className="btn btn-ghost btn-xs btn-circle h-5 w-5 min-h-0"
                                                    onClick={() =>
                                                        document
                                                            .getElementById("bmr_info_modal")
                                                            .showModal()
                                                    }
                                                >
                                                    <Info size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TAB 2 — BMI */}
                            <input
                                type="radio"
                                name="stats_tabs"
                                className="tab"
                                aria-label="BMI"
                            />
                            {/* BMI Content */}
                            <div className="tab-content mt-15">
                                {/* BMI Content */}
                                <div className="flex flex-col items-center w-full">
                                    <h3 className="text-lg font-semibold mb-4">BMI Meter</h3>

                                    <div className="w-full max-w-xs relative mb-6">
                                        {/* SCALE BAR */}
                                        <div className="h-4 w-full rounded-full flex overflow-hidden">
                                            <div className="h-full bg-info w-[46.25%]"></div>
                                            <div className="h-full bg-success w-[16.25%]"></div>
                                            <div className="h-full bg-warning w-[12.5%]"></div>
                                            <div className="h-full bg-error flex-1"></div>
                                        </div>

                                        {/* MARKER */}
                                        <div
                                            className="absolute top-0 w-2 h-6 bg-black -mt-1 transition-all duration-500 ease-out"
                                            style={{
                                                left: `${Math.min(
                                                    Math.max((bmi / 40) * 100, 0),
                                                    100
                                                )}%`,
                                                transform: "translateX(-50%)",
                                            }}
                                        ></div>

                                        {/* LABELS */}
                                        <div className="flex justify-between text-xs text-base-content mt-2 font-mono relative h-4">
                                            <span className="absolute left-0 -translate-x-1/2">0</span>
                                            <span className="absolute left-[46.25%] -translate-x-1/2">
                                                18.5
                                            </span>
                                            <span className="absolute left-[62.5%] -translate-x-1/2">
                                                25
                                            </span>
                                            <span className="absolute left-[75%] -translate-x-1/2">
                                                30
                                            </span>
                                            <span className="absolute right-0 translate-x-1/2">40</span>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <span className="text-2xl font-bold">{bmi}</span>
                                        <p
                                            className={`text-sm font-medium ${bmi < 18.5
                                                ? "text-info"
                                                : bmi < 25
                                                    ? "text-success"
                                                    : bmi < 30
                                                        ? "text-warning"
                                                        : "text-error"
                                                }`}
                                        >
                                            {bmi < 18.5
                                                ? "Underweight"
                                                : bmi < 25
                                                    ? "Normal"
                                                    : bmi < 30
                                                        ? "Overweight"
                                                        : "Obese"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Results Display (Right) */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="tabs tabs-border w-full">
                                {/* Weight Loss Tab */}
                                <input type="radio" name="weight_tabs" className="tab" aria-label="Weight Loss" defaultChecked />
                                <div className="tab-content mt-5">
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

                                {/* Weight Gain Tab */}
                                <input type="radio" name="weight_tabs" className="tab" aria-label="Weight Gain" />
                                <div className="tab-content mt-5">
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

                                        {/* Mild Weight Gain */}
                                        <div className="flex bg-base-100 rounded-lg overflow-hidden border border-base-300">
                                            <div className="flex-1 p-2 flex flex-col items-center justify-center bg-base-100 border-r border-base-300">
                                                <span className="text-lg font-medium">Mild weight gain</span>
                                                <span className="text-sm text-gray-500">0.25 kg/week</span>
                                            </div>
                                            <div className="w-40 p-2 bg-warning flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold text-warning-content">{Math.round((maintenanceCalories || 0) * 1.11).toLocaleString()}</span>
                                                <span className="text-xs text-warning-content/70">111% Calories/day</span>
                                            </div>
                                        </div>

                                        {/* Weight Gain */}
                                        <div className="flex bg-base-100 rounded-lg overflow-hidden border border-base-300">
                                            <div className="flex-1 p-2 flex flex-col items-center justify-center bg-base-100 border-r border-base-300">
                                                <span className="text-lg font-medium">Weight gain</span>
                                                <span className="text-sm text-gray-500">0.5 kg/week</span>
                                            </div>
                                            <div className="w-40 p-2 bg-error flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold text-error-content">{Math.round((maintenanceCalories || 0) * 1.22).toLocaleString()}</span>
                                                <span className="text-xs text-error-content/70">122% Calories/day</span>
                                            </div>
                                        </div>

                                        {/* Extreme Weight Gain */}
                                        <div className="flex bg-base-100 rounded-lg overflow-hidden border border-base-300">
                                            <div className="flex-1 p-2 flex flex-col items-center justify-center bg-base-100 border-r border-base-300">
                                                <span className="text-lg font-medium">Extreme weight gain</span>
                                                <span className="text-sm text-gray-500">1 kg/week</span>
                                            </div>
                                            <div className="w-40 p-2 bg-secondary flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold text-secondary-content">{Math.round((maintenanceCalories || 0) * 1.44).toLocaleString()}</span>
                                                <span className="text-xs text-secondary-content/70">144% Calories/day</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Macro & Micro Nutrient Calculator */}
                <MacroMicroCalculator
                    maintenanceCalories={maintenanceCalories}
                    age={age}
                    gender={gender}
                />
            </div>

            {/* Physical Logs Section */}
            <div className="bg-base-300 rounded-xl p-6 shadow-md mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <History size={22} /> Physical Logs & History
                </h2>

                <div className="card bg-base-200 p-6 shadow-md mb-8">
                    {/* Inputs */}
                    <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
                        <label className="floating-label w-full md:w-1/3">
                            <input
                                type="number"
                                placeholder="Weight"
                                className="input input-md w-full"
                                value={logWeight}
                                onChange={(e) => setLogWeight(e.target.value)}
                            />
                            <span>Weight (kg)</span>
                        </label>
                        <label className="floating-label w-full md:w-1/3">
                            <input
                                type="number"
                                placeholder="Height"
                                className="input input-md w-full"
                                value={logHeight}
                                onChange={(e) => setLogHeight(e.target.value)}
                            />
                            <span>Height (cm)</span>
                        </label>
                        <button className="btn btn-primary w-full md:w-auto" onClick={handleAddLog}>
                            <Plus size={18} /> Add Log
                        </button>
                    </div>

                    {/* History Lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Weight History */}
                        <div className="bg-base-100 rounded-lg p-4 h-64 overflow-y-auto border border-base-300">
                            <h3 className="font-semibold mb-2 sticky top-0 bg-base-100 pb-2 border-b border-base-200">Weight History</h3>
                            <table className="table table-xs w-full">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Weight (kg)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(physicalLogs || []).slice().reverse().map((log, index) => (
                                        <tr key={index}>
                                            <td>{new Date(log.date).toLocaleDateString()}</td>
                                            <td>{log.weight}</td>
                                            <td>
                                                <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDeleteLog(log._id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Height History */}
                        <div className="bg-base-100 rounded-lg p-4 h-64 overflow-y-auto border border-base-300">
                            <h3 className="font-semibold mb-2 sticky top-0 bg-base-100 pb-2 border-b border-base-200">Height History</h3>
                            <table className="table table-xs w-full">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Height (cm)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(physicalLogs || []).slice().reverse().map((log, index) => (
                                        <tr key={index}>
                                            <td>{new Date(log.date).toLocaleDateString()}</td>
                                            <td>{log.height}</td>
                                            <td>
                                                <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDeleteLog(log._id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Synchronized Charts */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                            <h4 className="text-sm font-medium mb-2 text-center">Weight Progression</h4>
                            <ReactApexChart
                                options={{ ...commonChartOptions, chart: { ...commonChartOptions.chart, id: 'weight-chart', group: 'physical-stats' }, colors: ['#3b82f6'] }}
                                series={weightSeries}
                                type="line"
                                height={300}
                            />
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                            <h4 className="text-sm font-medium mb-2 text-center">Height Progression</h4>
                            <ReactApexChart
                                options={{ ...commonChartOptions, chart: { ...commonChartOptions.chart, id: 'height-chart', group: 'physical-stats' }, colors: ['#10b981'] }}
                                series={heightSeries}
                                type="line"
                                height={300}
                            />
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                            <h4 className="text-sm font-medium mb-2 text-center">BMI Progression</h4>
                            <ReactApexChart
                                options={{ ...commonChartOptions, chart: { ...commonChartOptions.chart, id: 'bmi-chart', group: 'physical-stats' }, colors: ['#f59e0b'] }}
                                series={bmiSeries}
                                type="line"
                                height={300}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* ── End Desktop View ── */}
            </div>

            {/* ── Phone View (block md:hidden) — Full Width Mobile Optimized Experience ── */}
            <div className="block md:hidden space-y-3 pb-24 w-full">
                {/* Sticky Module Navigation Tabs */}
                <div className="sticky top-0 z-30 bg-base-100/95 backdrop-blur-md px-2 py-1.5 border-b border-base-300/80 mb-1 w-full">
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-base-200/80 rounded-2xl border border-base-300/60 shadow-xs w-full">
                        <button
                            type="button"
                            onClick={() => setMobileTab("calculator")}
                            className={`btn btn-xs h-9 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                mobileTab === "calculator"
                                    ? "btn-primary shadow-xs"
                                    : "btn-ghost text-base-content/70 hover:text-base-content"
                            }`}
                        >
                            <Calculator size={13} />
                            <span className="text-[11px]">BMR/BMI</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab("macros")}
                            className={`btn btn-xs h-9 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                mobileTab === "macros"
                                    ? "btn-primary shadow-xs"
                                    : "btn-ghost text-base-content/70 hover:text-base-content"
                            }`}
                        >
                            <PieChart size={13} />
                            <span className="text-[11px]">Macros/Micros</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab("logs")}
                            className={`btn btn-xs h-9 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                mobileTab === "logs"
                                    ? "btn-primary shadow-xs"
                                    : "btn-ghost text-base-content/70 hover:text-base-content"
                            }`}
                        >
                            <History size={13} />
                            <span className="text-[11px]">Logs</span>
                        </button>
                    </div>
                </div>

                {/* TAB 1: CALCULATOR & BMR/BMI */}
                {mobileTab === "calculator" && (
                    <div className="space-y-3 px-2 w-full">
                        {/* Physical Stats Input Card */}
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-xs space-y-3.5">
                            <div className="flex items-center justify-between border-b border-base-content/[0.06] pb-2.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <Calculator size={14} /> Physical Parameters
                                </span>
                                <span className="text-[11px] text-base-content/50 font-medium">BMR & BMI Input</span>
                            </div>

                            {/* Age & Gender */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider mb-1 block">
                                        Age (years)
                                    </label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="120"
                                        placeholder="Age"
                                        className="input input-sm w-full bg-base-200/50 border border-base-content/10 rounded-xl text-sm font-semibold"
                                        value={age || ""}
                                        onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider mb-1 block">
                                        Gender
                                    </label>
                                    <div className="join w-full grid grid-cols-2 border border-base-content/10 rounded-xl overflow-hidden bg-base-200/40">
                                        <button
                                            type="button"
                                            onClick={() => setGender("male")}
                                            className={`join-item btn btn-xs h-8 text-xs font-bold transition-all ${
                                                gender === "male"
                                                    ? "btn-primary shadow-xs"
                                                    : "btn-ghost text-base-content/70 hover:text-base-content"
                                            }`}
                                        >
                                            ♂ Male
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setGender("female")}
                                            className={`join-item btn btn-xs h-8 text-xs font-bold transition-all ${
                                                gender === "female"
                                                    ? "btn-primary shadow-xs"
                                                    : "btn-ghost text-base-content/70 hover:text-base-content"
                                            }`}
                                        >
                                            ♀ Female
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Height & Weight */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider mb-1 block">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 175"
                                        className="input input-sm w-full bg-base-200/50 border border-base-content/10 rounded-xl text-sm font-semibold"
                                        value={height || ""}
                                        onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider mb-1 block">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 70"
                                        className="input input-sm w-full bg-base-200/50 border border-base-content/10 rounded-xl text-sm font-semibold"
                                        value={weight || ""}
                                        onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Activity Level */}
                            <div>
                                <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider mb-1 block">
                                    Activity Level
                                </label>
                                <select
                                    className="select select-sm w-full bg-base-200/50 border border-base-content/10 rounded-xl text-xs font-medium"
                                    value={activityLevel}
                                    onChange={(e) => setActivityLevel(e.target.value)}
                                >
                                    {Object.entries(activityLabels).map(([val, label]) => (
                                        <option key={val} value={val} className="bg-base-100 text-base-content">
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={calculateCalories}
                                    className="btn btn-sm btn-primary flex-1 rounded-xl font-bold gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <Play size={14} fill="currentColor" /> Calculate & Save
                                </button>
                                <button
                                    type="button"
                                    onClick={clearPhysicalSettings}
                                    className="btn btn-sm btn-ghost bg-base-200/40 border border-base-content/10 rounded-xl text-xs px-3 text-base-content/70 hover:text-base-content cursor-pointer"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* BMR & BMI Metrics Segmented Card */}
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-xs space-y-3">
                            {/* Switcher */}
                            <div className="flex items-center justify-between border-b border-base-content/[0.06] pb-2">
                                <div className="join bg-base-200/60 p-0.5 rounded-xl border border-base-content/10">
                                    <button
                                        type="button"
                                        onClick={() => setMobileStatsView("bmr")}
                                        className={`join-item btn btn-xs rounded-lg font-bold transition-all ${
                                            mobileStatsView === "bmr"
                                                ? "btn-primary text-primary-content shadow-xs"
                                                : "btn-ghost text-base-content/60 hover:text-base-content"
                                        }`}
                                    >
                                        BMR Rate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMobileStatsView("bmi")}
                                        className={`join-item btn btn-xs rounded-lg font-bold transition-all ${
                                            mobileStatsView === "bmi"
                                                ? "btn-primary text-primary-content shadow-xs"
                                                : "btn-ghost text-base-content/60 hover:text-base-content"
                                        }`}
                                    >
                                        BMI Meter
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => document.getElementById("bmr_info_modal")?.showModal()}
                                    className="btn btn-ghost btn-xs btn-circle text-primary"
                                    title="View Formula Information"
                                >
                                    <Info size={16} />
                                </button>
                            </div>

                            {/* BMR View */}
                            {mobileStatsView === "bmr" && (
                                <div className="flex flex-col items-center justify-center py-3">
                                    <div
                                        className="radial-progress text-primary shadow-xs bg-base-200/40 rounded-full"
                                        style={{
                                            "--value": 100,
                                            "--size": "8rem",
                                            "--thickness": "0.65rem",
                                        }}
                                        role="progressbar"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-2xl font-black font-mono tracking-tight text-base-content">
                                                {(bmr || 0).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                                kcal / day
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 text-center">
                                        <span className="text-xs font-bold text-base-content">Basal Metabolic Rate</span>
                                        <p className="text-[11px] text-base-content/60 max-w-xs mt-0.5">
                                            Base energy your body consumes daily while at rest.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* BMI View */}
                            {mobileStatsView === "bmi" && (
                                <div className="flex flex-col items-center py-2 space-y-3">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-3xl font-black font-mono text-base-content">{bmi || 0}</span>
                                            {(() => {
                                                const cat = getBmiCategory(bmi);
                                                return (
                                                    <span className={`badge ${cat.badge} badge-sm font-bold`}>
                                                        {cat.label}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        <span className="text-[11px] text-base-content/60 font-medium">Body Mass Index</span>
                                    </div>

                                    {/* Mobile Scale Bar */}
                                    <div className="w-full px-2">
                                        <div className="relative h-3 w-full rounded-full flex overflow-hidden shadow-inner border border-base-content/10">
                                            <div className="h-full bg-info w-[46.25%]" title="Underweight (<18.5)"></div>
                                            <div className="h-full bg-success w-[16.25%]" title="Normal (18.5-24.9)"></div>
                                            <div className="h-full bg-warning w-[12.5%]" title="Overweight (25-29.9)"></div>
                                            <div className="h-full bg-error flex-1" title="Obese (>=30)"></div>

                                            {/* Marker */}
                                            <div
                                                className="absolute top-0 w-1.5 h-4 bg-base-content border border-base-100 shadow-md -mt-0.5 rounded-full transition-all duration-300"
                                                style={{
                                                    left: `${Math.min(Math.max(((bmi || 0) / 40) * 100, 0), 100)}%`,
                                                    transform: "translateX(-50%)",
                                                }}
                                            />
                                        </div>

                                        {/* Scale Milestones */}
                                        <div className="flex justify-between text-[10px] text-base-content/60 font-mono mt-1 px-1">
                                            <span>0</span>
                                            <span>18.5</span>
                                            <span>25</span>
                                            <span>30</span>
                                            <span>40+</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Calorie Targets (Weight Loss / Gain Tiers) */}
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-base-content/[0.06] pb-2.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <Flame size={14} /> Calorie Target Goals
                                </span>

                                {/* Loss vs Gain Switcher */}
                                <div className="join bg-base-200/60 p-0.5 rounded-xl border border-base-content/10">
                                    <button
                                        type="button"
                                        onClick={() => setMobileGoalType("loss")}
                                        className={`join-item btn btn-xs rounded-lg font-bold transition-all ${
                                            mobileGoalType === "loss"
                                                ? "btn-primary text-primary-content shadow-xs"
                                                : "btn-ghost text-base-content/60 hover:text-base-content"
                                        }`}
                                    >
                                        Loss
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMobileGoalType("gain")}
                                        className={`join-item btn btn-xs rounded-lg font-bold transition-all ${
                                            mobileGoalType === "gain"
                                                ? "btn-primary text-primary-content shadow-xs"
                                                : "btn-ghost text-base-content/60 hover:text-base-content"
                                        }`}
                                    >
                                        Gain
                                    </button>
                                </div>
                            </div>

                            {/* Tiers List */}
                            <div className="space-y-2">
                                {calorieTiers.map((tier, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-2.5 rounded-xl border border-base-content/10 transition-all ${tier.bg}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-base-content">{tier.label}</span>
                                            <span className="text-[10px] font-medium text-base-content/60">{tier.rate}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-sm font-black font-mono ${tier.color}`}>
                                                {(tier.cals || 0).toLocaleString()} <span className="text-[10px] font-bold">kcal</span>
                                            </span>
                                            <span className="text-[10px] font-bold text-base-content/60">{tier.percent} / day</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: MACROS & MICROS */}
                {mobileTab === "macros" && (
                    <div className="space-y-3 px-2 w-full">
                        <MacroMicroCalculator
                            maintenanceCalories={maintenanceCalories}
                            age={age}
                            gender={gender}
                        />
                    </div>
                )}

                {/* TAB 3: PHYSICAL LOGS & CHARTS */}
                {mobileTab === "logs" && (
                    <div className="space-y-3 px-2 w-full">
                        {/* Top Action Bar with Icon to Open Log Entry Popup */}
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <History size={16} />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-base-content uppercase tracking-wider block">
                                        Physical Logs
                                    </span>
                                    <span className="text-[10px] text-base-content/50 font-medium">
                                        {physicalLogs?.length || 0} measurements recorded
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsMobileAddLogOpen(true)}
                                className="btn btn-sm btn-primary rounded-xl font-bold gap-1.5 shadow-sm cursor-pointer"
                                title="Add New Measurement"
                            >
                                <Plus size={15} />
                                <span className="text-xs">Add Log</span>
                            </button>
                        </div>

                        {/* Progression Chart with Metric Selector */}
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-base-content/[0.06] pb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <TrendingUp size={14} /> Progression Charts
                                </span>

                                {/* Metric Switcher */}
                                <div className="join bg-base-200/60 p-0.5 rounded-xl border border-base-content/10">
                                    <button
                                        type="button"
                                        onClick={() => setMobileChartMetric("weight")}
                                        className={`join-item btn btn-xs rounded-lg font-bold transition-all ${
                                            mobileChartMetric === "weight"
                                                ? "btn-primary text-primary-content shadow-xs"
                                                : "btn-ghost text-base-content/60 hover:text-base-content"
                                        }`}
                                    >
                                        Weight
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMobileChartMetric("height")}
                                        className={`join-item btn btn-xs rounded-lg font-bold transition-all ${
                                            mobileChartMetric === "height"
                                                ? "btn-primary text-primary-content shadow-xs"
                                                : "btn-ghost text-base-content/60 hover:text-base-content"
                                        }`}
                                    >
                                        Height
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMobileChartMetric("bmi")}
                                        className={`join-item btn btn-xs rounded-lg font-bold transition-all ${
                                            mobileChartMetric === "bmi"
                                                ? "btn-primary text-primary-content shadow-xs"
                                                : "btn-ghost text-base-content/60 hover:text-base-content"
                                        }`}
                                    >
                                        BMI
                                    </button>
                                </div>
                            </div>

                            {/* Selected Chart */}
                            {physicalLogs && physicalLogs.length > 0 ? (
                                <div className="py-1">
                                    <ReactApexChart
                                        options={{
                                            ...commonChartOptions,
                                            chart: { ...commonChartOptions.chart, height: 220 },
                                            colors: [
                                                mobileChartMetric === "weight"
                                                    ? "#3b82f6"
                                                    : mobileChartMetric === "height"
                                                    ? "#10b981"
                                                    : "#f59e0b",
                                            ],
                                        }}
                                        series={
                                            mobileChartMetric === "weight"
                                                ? weightSeries
                                                : mobileChartMetric === "height"
                                                ? heightSeries
                                                : bmiSeries
                                        }
                                        type="line"
                                        height={220}
                                    />
                                </div>
                            ) : (
                                <div className="py-8 text-center text-xs text-base-content/50">
                                    No physical logs recorded yet. Tap "Add Log" above to record your first measurement!
                                </div>
                            )}
                        </div>

                        {/* History Table */}
                        <div className="bg-base-100 border border-base-content/10 rounded-2xl p-4 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between border-b border-base-content/[0.06] pb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <History size={14} /> Measurement History
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-base-content/50">
                                        {physicalLogs?.length || 0} Entries
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileAddLogOpen(true)}
                                        className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10"
                                        title="Add New Measurement"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto no-scrollbar">
                                {physicalLogs && physicalLogs.length > 0 ? (
                                    <table className="table table-xs w-full">
                                        <thead>
                                            <tr className="text-base-content/60 border-b border-base-content/10">
                                                <th>Date</th>
                                                <th>Weight</th>
                                                <th>Height</th>
                                                <th>BMI</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(physicalLogs || [])
                                                .slice()
                                                .reverse()
                                                .map((log, index) => (
                                                    <tr key={index} className="hover:bg-base-200/40 border-b border-base-content/[0.05]">
                                                        <td className="font-medium text-[11px]">
                                                            {new Date(log.date).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </td>
                                                        <td className="font-bold font-mono text-[11px]">
                                                            {log.weight} kg
                                                        </td>
                                                        <td className="font-mono text-[11px]">
                                                            {log.height} cm
                                                        </td>
                                                        <td>
                                                            <span className="badge badge-ghost badge-xs font-mono font-bold">
                                                                {log.bmi}
                                                            </span>
                                                        </td>
                                                        <td className="text-right">
                                                            <button
                                                                type="button"
                                                                className="btn btn-ghost btn-xs text-error p-1 h-auto min-h-0 cursor-pointer"
                                                                onClick={() => handleDeleteLog(log._id)}
                                                                title="Delete Entry"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="py-6 text-center text-xs text-base-content/50">
                                        No logs recorded yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Popup for Adding Log Entry (Phone View - Centered in Middle, Zero-Layout-Shift) */}
                        {isMobileAddLogOpen && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                                <div
                                    className="fixed inset-0"
                                    onClick={() => setIsMobileAddLogOpen(false)}
                                    aria-hidden="true"
                                />
                                <div className="relative z-10 bg-base-100 border border-base-content/10 p-5 rounded-2xl shadow-2xl space-y-4 max-w-sm w-full mx-auto">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between border-b border-base-content/[0.06] pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <Plus size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-base-content">Log New Measurement</h3>
                                                <span className="text-[10px] text-base-content/60 font-medium">Record weight & height for today</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsMobileAddLogOpen(false)}
                                            className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Modal Inputs */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider mb-1 block">
                                                Weight (kg)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="e.g. 70.5"
                                                className="input input-sm w-full bg-base-200/50 border border-base-content/10 rounded-xl text-sm font-semibold text-base-content"
                                                value={logWeight}
                                                onChange={(e) => setLogWeight(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider mb-1 block">
                                                Height (cm)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                placeholder="e.g. 175"
                                                className="input input-sm w-full bg-base-200/50 border border-base-content/10 rounded-xl text-sm font-semibold text-base-content"
                                                value={logHeight}
                                                onChange={(e) => setLogHeight(e.target.value)}
                                            />
                                        </div>

                                        {/* Estimated BMI Preview */}
                                        {logWeight && logHeight && Number(logHeight) > 0 && (
                                            <div className="flex items-center justify-between p-2.5 bg-base-200/40 border border-base-content/10 rounded-xl">
                                                <span className="text-xs font-bold text-base-content/70">Estimated BMI:</span>
                                                <span className="text-sm font-black font-mono text-primary">
                                                    {(Number(logWeight) / ((Number(logHeight) / 100) ** 2)).toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Modal Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsMobileAddLogOpen(false)}
                                            className="btn btn-sm btn-ghost border border-base-content/10 flex-1 rounded-xl text-xs font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!logWeight || !logHeight) {
                                                    setAlertErrorMessage("Please enter both Weight and Height");
                                                    setShowErrorAlert(true);
                                                    setTimeout(() => setShowErrorAlert(false), 3000);
                                                    return;
                                                }
                                                handleAddLog();
                                                setIsMobileAddLogOpen(false);
                                            }}
                                            className="btn btn-sm btn-primary flex-1 rounded-xl font-bold gap-1.5 shadow-sm cursor-pointer"
                                        >
                                            <Plus size={14} /> Save Log Entry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            </>
            )}


            {/* BMR Info Modal */}
            <dialog id="bmr_info_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Info size={20} /> Basal Metabolic Rate (BMR)
                    </h3>
                    <p className="py-4">
                        BMR is the number of calories your body needs to accomplish its most basic (basal) life-sustaining functions.
                    </p>

                    <div className="bg-base-200 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-sm mb-2">Mifflin-St Jeor Equation</h4>
                        <ul className="text-xs space-y-2 font-mono">
                            <li><span className="font-bold">Men:</span> (10 × weight) + (6.25 × height) - (5 × age) + 5</li>
                            <li><span className="font-bold">Women:</span> (10 × weight) + (6.25 × height) - (5 × age) - 161</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Activity Multipliers</h4>
                        <div className="overflow-x-auto">
                            <table className="table table-xs">
                                <thead>
                                    <tr>
                                        <th>Level</th>
                                        <th>Multiplier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>Sedentary</td><td>1.2</td></tr>
                                    <tr><td>Light</td><td>1.375</td></tr>
                                    <tr><td>Moderate</td><td>1.55</td></tr>
                                    <tr><td>Active</td><td>1.725</td></tr>
                                    <tr><td>Very Active</td><td>1.9</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div >
    );
}

export default HabitLogging;
