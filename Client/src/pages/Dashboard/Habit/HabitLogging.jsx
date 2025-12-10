import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { TitleChanger } from "../../../utils/TitleChanger";
import { updateHabitSettings, fetchPhysicalLogs, addPhysicalLog, deletePhysicalLog } from "../../../services/redux/slice/habitSlice";
import { useLoading } from "../../../Context/LoadingContext";
import { Calculator, Play, UserCheck, Plus, History, Trash2, Info } from "lucide-react";
import ReactApexChart from "react-apexcharts";
import ErrorAlert from "../../../utils/Alerts/ErrorAlert";
import SuccessAlert from "../../../utils/Alerts/SuccessAlert";

function HabitLogging() {
    TitleChanger("Progress Pulse | Habit Logging");
    const { setLoading } = useLoading();
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

    // Logging State
    const [logWeight, setLogWeight] = useState("");
    const [logHeight, setLogHeight] = useState("");

    // Alerts
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
        dispatch(fetchPhysicalLogs());
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

        setLoading(true);
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
            })
            .finally(() => {
                setLoading(false);
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

        setLoading(true);
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
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteLog = (logId) => {
        if (window.confirm("Are you sure you want to delete this log?")) {
            setLoading(true);
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
                })
                .finally(() => {
                    setLoading(false);
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
            zoom: { enabled: true }
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




    return (
        <div className="p-4">
            {showErrorAlert && <ErrorAlert message={alertErrorMessage} top={20} />}
            {showSuccessAlert && <SuccessAlert message={alertSuccessMessage} top={20} />}

            <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <UserCheck size={26} />
                Habit Logging
            </h1>

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
