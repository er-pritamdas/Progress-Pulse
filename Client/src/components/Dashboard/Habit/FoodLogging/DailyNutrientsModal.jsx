import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  X,
  Flame,
  Dumbbell,
  Wheat,
  PieChart,
  BarChart3,
  Apple,
  Utensils,
  Sparkles,
  Zap,
  Activity,
  Droplets,
  HeartPulse,
  ShieldAlert,
  Settings,
  ExternalLink,
  Info,
  ListFilter,
} from "lucide-react";
import NutrientWikiModal from "./NutrientWikiModal";

export const NUTRIENT_CATEGORIES = {
  Macronutrients: [
    { id: "calories", label: "Calories", unit: "kcal", color: "text-error", icon: Flame },
    { id: "protein", label: "Protein", unit: "g", color: "text-info", icon: Dumbbell },
    { id: "carbohydrates", label: "Carbohydrates", unit: "g", color: "text-warning", icon: Wheat },
    { id: "netCarbs", label: "Net Carbs", unit: "g", color: "text-amber-500", icon: Activity },
    { id: "fat", label: "Fat", unit: "g", color: "text-success", icon: PieChart },
    { id: "fiber", label: "Fiber", unit: "g", color: "text-emerald-500", icon: Apple },
    { id: "sugar", label: "Sugar", unit: "g", color: "text-rose-400", icon: Sparkles },
    { id: "addedSugar", label: "Added Sugar", unit: "g", color: "text-red-400", icon: ShieldAlert },
  ],
  Vitamins: [
    { id: "vitaminA", label: "Vitamin A", unit: "mcg", color: "text-amber-400", icon: Zap },
    { id: "vitaminB1", label: "Vitamin B1", unit: "mg", color: "text-blue-400", icon: Zap },
    { id: "vitaminB2", label: "Vitamin B2", unit: "mg", color: "text-cyan-400", icon: Zap },
    { id: "vitaminB3", label: "Vitamin B3", unit: "mg", color: "text-indigo-400", icon: Zap },
    { id: "vitaminB5", label: "Vitamin B5", unit: "mg", color: "text-sky-400", icon: Zap },
    { id: "vitaminB6", label: "Vitamin B6", unit: "mg", color: "text-violet-400", icon: Zap },
    { id: "vitaminB7", label: "Vitamin B7", unit: "mcg", color: "text-purple-400", icon: Zap },
    { id: "vitaminB9", label: "Vitamin B9", unit: "mcg", color: "text-fuchsia-400", icon: Zap },
    { id: "vitaminB12", label: "Vitamin B12", unit: "mcg", color: "text-pink-400", icon: Zap },
    { id: "vitaminC", label: "Vitamin C", unit: "mg", color: "text-orange-400", icon: Zap },
    { id: "vitaminD", label: "Vitamin D", unit: "IU", color: "text-yellow-400", icon: Zap },
    { id: "vitaminE", label: "Vitamin E", unit: "mg", color: "text-lime-400", icon: Zap },
    { id: "vitaminK", label: "Vitamin K", unit: "mcg", color: "text-green-400", icon: Zap },
  ],
  Minerals: [
    { id: "calcium", label: "Calcium", unit: "mg", color: "text-sky-400", icon: Activity },
    { id: "magnesium", label: "Magnesium", unit: "mg", color: "text-indigo-400", icon: Activity },
    { id: "phosphorus", label: "Phosphorus", unit: "mg", color: "text-purple-400", icon: Activity },
    { id: "potassium", label: "Potassium", unit: "mg", color: "text-emerald-400", icon: Activity },
    { id: "sodium", label: "Sodium", unit: "mg", color: "text-amber-500", icon: Activity },
    { id: "iron", label: "Iron", unit: "mg", color: "text-amber-600", icon: Activity },
    { id: "zinc", label: "Zinc", unit: "mg", color: "text-slate-400", icon: Activity },
    { id: "copper", label: "Copper", unit: "mg", color: "text-orange-600", icon: Activity },
    { id: "manganese", label: "Manganese", unit: "mg", color: "text-stone-400", icon: Activity },
    { id: "selenium", label: "Selenium", unit: "mcg", color: "text-teal-400", icon: Activity },
    { id: "iodine", label: "Iodine", unit: "mcg", color: "text-blue-500", icon: Activity },
  ],
  "Fatty Acids": [
    { id: "saturatedFat", label: "Saturated Fat", unit: "g", color: "text-red-300", icon: HeartPulse },
    { id: "monounsaturatedFat", label: "Monounsaturated", unit: "g", color: "text-green-300", icon: HeartPulse },
    { id: "polyunsaturatedFat", label: "Polyunsaturated", unit: "g", color: "text-emerald-300", icon: HeartPulse },
    { id: "omega3", label: "Omega-3", unit: "g", color: "text-cyan-300", icon: HeartPulse },
    { id: "omega6", label: "Omega-6", unit: "g", color: "text-teal-300", icon: HeartPulse },
    { id: "transFat", label: "Trans Fat", unit: "g", color: "text-rose-500", icon: ShieldAlert },
  ],
  Others: [
    { id: "cholesterol", label: "Cholesterol", unit: "mg", color: "text-rose-300", icon: HeartPulse },
    { id: "glycemicIndex", label: "Glycemic Index", unit: "", color: "text-purple-300", icon: Activity },
    { id: "glycemicLoad", label: "Glycemic Load", unit: "", color: "text-violet-300", icon: Activity },
    { id: "water", label: "Water", unit: "ml", color: "text-sky-400", icon: Droplets },
  ],
};

const MEAL_ICONS = {
  All: "📊",
  Breakfast: "🍳",
  Lunch: "🥗",
  Dinner: "🍲",
  Snacks: "🍎",
  Other: "☕",
};

function DailyNutrientsModal({
  isOpen,
  onClose,
  selectedDate,
  data,
  calorieTarget,
  initialMeal = "All",
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [activeMeal, setActiveMeal] = useState(initialMeal || "All");
  const [selectedWikiNutrient, setSelectedWikiNutrient] = useState(null);
  const [contributorNutrient, setContributorNutrient] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveMeal(initialMeal || "All");
    }
  }, [isOpen, initialMeal]);

  const habitState = useSelector((state) => state.habit || {});
  const age = habitState.age || 21;
  const gender = habitState.gender || "male";
  const maintenanceCalories = habitState.maintenanceCalories || 2000;
  const habitWaterMin = habitState.settings?.water?.min;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const { summary = {}, meals = {}, logs = [] } = data;

  // Gather all logs across meals
  const allLogs = logs.length
    ? logs
    : Object.entries(meals).flatMap(([meal, items]) =>
        items.map((item) => ({ ...item, mealType: meal }))
      );

  // Active logs based on selected meal filter ("All" or specific meal)
  const activeLogs =
    activeMeal === "All"
      ? allLogs
      : (meals[activeMeal] || []).map((item) => ({ ...item, mealType: activeMeal }));

  // Target Calorie determination (Min & Max from settings)
  const settingsIntake = habitState.settings?.intake;
  const calorieMin =
    settingsIntake?.min ||
    (maintenanceCalories ? Math.round(maintenanceCalories * 0.9) : 1500);
  const calorieMax =
    settingsIntake?.max ||
    (maintenanceCalories ? Math.round(maintenanceCalories * 1.1) : 2500);

  // Read saved macro ratios from localStorage if customized in Habit Profile
  const getMacroRatios = () => {
    try {
      const saved = localStorage.getItem("macro_ratios");
      return saved ? JSON.parse(saved) : { protein: 30, carbs: 40, fats: 30 };
    } catch (e) {
      return { protein: 30, carbs: 40, fats: 30 };
    }
  };

  const macroRatios = getMacroRatios();

  // Calculated Macro Target Gram Ranges (Protein, Carbs = 4 kcal/g, Fat = 9 kcal/g)
  const proteinMinGrams = Math.round((calorieMin * (macroRatios.protein / 100)) / 4);
  const proteinMaxGrams = Math.round((calorieMax * (macroRatios.protein / 100)) / 4);

  const carbsMinGrams = Math.round((calorieMin * (macroRatios.carbs / 100)) / 4);
  const carbsMaxGrams = Math.round((calorieMax * (macroRatios.carbs / 100)) / 4);

  const fatMinGrams = Math.round((calorieMin * (macroRatios.fats / 100)) / 9);
  const fatMaxGrams = Math.round((calorieMax * (macroRatios.fats / 100)) / 9);

  const isMale = gender === "male";

  // Daily Limits / Recommended Targets based on Habit Profile & DRI Guidelines
  const NUTRIENT_TARGETS = {
    // Macronutrients
    calories: calorieMax,
    protein: proteinMaxGrams,
    carbohydrates: carbsMaxGrams,
    netCarbs: carbsMaxGrams,
    fat: fatMaxGrams,
    fiber: isMale ? 38 : 25,
    sugar: isMale ? 36 : 25,
    addedSugar: isMale ? 36 : 25,

    // Vitamins
    vitaminA: isMale ? 900 : 700,
    vitaminB1: isMale ? 1.2 : 1.1,
    vitaminB2: isMale ? 1.3 : 1.1,
    vitaminB3: isMale ? 16 : 14,
    vitaminB5: 5,
    vitaminB6: age > 50 ? (isMale ? 1.7 : 1.5) : 1.3,
    vitaminB7: 30,
    vitaminB9: 400,
    vitaminB12: 2.4,
    vitaminC: isMale ? 90 : 75,
    vitaminD: 600,
    vitaminE: 15,
    vitaminK: isMale ? 120 : 90,

    // Minerals
    calcium: 1000,
    magnesium: isMale ? 420 : 320,
    phosphorus: 700,
    potassium: isMale ? 3400 : 2600,
    sodium: 2300,
    iron: isMale ? 8 : (age > 50 ? 8 : 18),
    zinc: isMale ? 11 : 8,
    copper: 0.9,
    manganese: isMale ? 2.3 : 1.8,
    selenium: 55,
    iodine: 150,

    // Fatty Acids
    saturatedFat: 20,
    monounsaturatedFat: 25,
    polyunsaturatedFat: 20,
    omega3: isMale ? 1.6 : 1.1,
    omega6: isMale ? 17 : 12,
    transFat: 0,

    // Others
    cholesterol: 300,
    glycemicIndex: 55,
    glycemicLoad: 100,
    water: habitWaterMin ? habitWaterMin * 1000 : (isMale ? 3700 : 2700),
  };

  // Percentage color coding:
  // 0% - 25%: Yellow (bg-warning)
  // 25% - 75%: Blue (bg-info)
  // 75% - 100%: Green (bg-success)
  // > 100%: Red (bg-error)
  const getPercentageColorClass = (pct) => {
    if (pct > 100) return { bg: "bg-error", badge: "bg-error/20 text-error" };
    if (pct >= 75) return { bg: "bg-success", badge: "bg-success/20 text-success" };
    if (pct >= 25) return { bg: "bg-info", badge: "bg-info/20 text-info" };
    return { bg: "bg-warning", badge: "bg-warning/20 text-warning" };
  };

  // Calculate totals for all nutrients
  const calculateTotals = () => {
    const totals = {};
    Object.values(NUTRIENT_CATEGORIES).flat().forEach((n) => {
      totals[n.id] = 0;
    });

    activeLogs.forEach((log) => {
      const servings = log.servings || 1;
      const foodObj = log.foodId || log;

      Object.values(NUTRIENT_CATEGORIES).flat().forEach((n) => {
        let rawVal = log[n.id];
        if (rawVal === undefined || rawVal === null) {
          rawVal = foodObj ? foodObj[n.id] : 0;
        }

        if (n.id === "netCarbs") {
          const carbs = log.carbohydrates !== undefined ? log.carbohydrates : (foodObj?.carbohydrates || 0);
          const fiber = log.fiber !== undefined ? log.fiber : (foodObj?.fiber || 0);
          totals[n.id] += Math.max(0, carbs - fiber);
        } else if (n.id === "glycemicIndex" || n.id === "glycemicLoad") {
          const num = parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));
          if (!isNaN(num) && num > totals[n.id]) totals[n.id] = num;
        } else if (["calories", "protein", "carbohydrates", "fat", "fiber", "sugar"].includes(n.id) && log[n.id] !== undefined) {
          totals[n.id] += Number(log[n.id]) || 0;
        } else if (typeof rawVal === "number") {
          totals[n.id] += rawVal * servings;
        } else {
          const num = parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));
          if (!isNaN(num)) totals[n.id] += num * servings;
        }
      });
    });

    // Formatting totals
    Object.keys(totals).forEach((key) => {
      if (key === "calories" || key === "water") {
        totals[key] = Math.round(totals[key]);
      } else {
        totals[key] = parseFloat(totals[key].toFixed(1));
      }
    });

    return totals;
  };

  const nutrientTotals = calculateTotals();

  // Macro Energy Percentages
  const proteinKcal = Math.round((nutrientTotals.protein || 0) * 4);
  const carbsKcal = Math.round((nutrientTotals.carbohydrates || 0) * 4);
  const fatKcal = Math.round((nutrientTotals.fat || 0) * 9);
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fatPct = Math.round((fatKcal / totalMacroKcal) * 100);

  const categoriesToDisplay =
    activeTab === "All"
      ? Object.keys(NUTRIENT_CATEGORIES)
      : [activeTab];

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-base-200 rounded-3xl max-w-4xl w-full h-[700px] max-h-[92vh] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-info/20 text-info rounded-xl shrink-0">
              <Info size={19} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">
                {activeMeal === "All" ? "Daily Nutrients" : `${activeMeal} Nutrients`}
              </h2>
              <p className="text-[11px] text-base-content/70 truncate">
                {activeMeal === "All" ? "Daily" : activeMeal} breakdown for{" "}
                <span className="font-semibold text-primary">{selectedDate}</span> •{" "}
                {activeLogs.length} {activeLogs.length === 1 ? "item" : "items"} logged
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost shrink-0"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Meal Filter Pills (All / Breakfast / Lunch / Dinner / Snacks / Other) */}
        <div className="px-4 sm:px-5 pt-3 pb-1 shrink-0 bg-base-200 border-b border-base-300/40">
          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", "Breakfast", "Lunch", "Dinner", "Snacks", "Other"].map((meal) => {
              const count = meal === "All" ? allLogs.length : (meals[meal]?.length || 0);
              const isActive = activeMeal === meal;
              return (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setActiveMeal(meal)}
                  className={`btn btn-xs rounded-xl font-bold gap-1 transition-all ${
                    isActive
                      ? "btn-primary shadow-xs"
                      : "btn-ghost border border-base-300 text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                  }`}
                >
                  <span className="text-xs select-none">{MEAL_ICONS[meal] || "🍴"}</span>
                  <span>{meal}</span>
                  {count > 0 && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded-md font-mono ${
                        isActive
                          ? "bg-primary-content/25 text-primary-content"
                          : "bg-base-300 text-base-content/70"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body (overflow-x-hidden to strictly prevent any horizontal scrollbar) */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {/* Donut Representation for Daily / Meal Calorie & Macro Target Progress */}
          <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            {/* Donut SVG Graphic */}
            <div className="relative shrink-0 flex items-center justify-center">
              {(() => {
                const donutR = 38;
                const donutCirc = 2 * Math.PI * donutR; // ≈ 238.76
                const pDash = (proteinPct / 100) * donutCirc;
                const cDash = (carbsPct / 100) * donutCirc;
                const fDash = (fatPct / 100) * donutCirc;

                const pOffset = 0;
                const cOffset = -pDash;
                const fOffset = -(pDash + cDash);

                return (
                  <svg viewBox="0 0 100 100" className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-xs shrink-0">
                    <g transform="rotate(-90 50 50)">
                      {/* Background Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r={donutR}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8.5"
                        opacity="0.12"
                      />

                      {/* Protein Arc */}
                      {proteinPct > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r={donutR}
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="8.5"
                          strokeDasharray={`${pDash} ${donutCirc}`}
                          strokeDashoffset={pOffset}
                          className="transition-all duration-500"
                        />
                      )}

                      {/* Carbs Arc */}
                      {carbsPct > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r={donutR}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="8.5"
                          strokeDasharray={`${cDash} ${donutCirc}`}
                          strokeDashoffset={cOffset}
                          className="transition-all duration-500"
                        />
                      )}

                      {/* Fat Arc */}
                      {fatPct > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r={donutR}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="8.5"
                          strokeDasharray={`${fDash} ${donutCirc}`}
                          strokeDashoffset={fOffset}
                          className="transition-all duration-500"
                        />
                      )}
                    </g>

                    {/* Center Text: Calories & Target */}
                    <text
                      x="50"
                      y="46"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="900"
                      fill="currentColor"
                      className="select-none tracking-tight font-mono"
                    >
                      {nutrientTotals.calories || 0}
                    </text>
                    <text
                      x="50"
                      y="58"
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="800"
                      fill="currentColor"
                      opacity="0.6"
                      className="select-none uppercase tracking-wider"
                    >
                      kcal
                    </text>
                    <text
                      x="50"
                      y="68"
                      textAnchor="middle"
                      fontSize="6.5"
                      fontWeight="700"
                      fill="currentColor"
                      opacity="0.45"
                      className="select-none font-mono"
                    >
                      {activeMeal === "All" ? `/ ${calorieMax}` : `${activeMeal}`}
                    </text>
                  </svg>
                );
              })()}
            </div>

            {/* Macro Details beside Donut */}
            <div className="flex-1 w-full space-y-2.5 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <span className="font-black text-base-content uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-primary">
                  <Activity size={14} /> {activeMeal === "All" ? "Daily Energy & Macro Split" : `${activeMeal} Energy & Macro Split`}
                </span>
                <button
                  className="btn btn-xs btn-outline btn-primary gap-1 rounded-lg text-[10.5px] h-6 min-h-0 px-2"
                  onClick={() => {
                    onClose();
                    navigate("/dashboard/habit/logging");
                  }}
                  title="Edit Macro Percentages in Habit Profile"
                >
                  <Settings size={11} /> Edit Ratios
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* Protein */}
                <div className="bg-info/10 border border-info/20 p-2 rounded-xl flex sm:flex-col justify-between items-center sm:items-start gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-info text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-info shrink-0"></span>
                    <span>Protein ({proteinPct}%)</span>
                  </div>
                  <div className="font-mono text-[11px] font-bold text-base-content/90">
                    {nutrientTotals.protein || 0}g{" "}
                    <span className="text-[10px] font-medium text-base-content/50">
                      {activeMeal === "All" ? `/ ${proteinMaxGrams}g` : `(${proteinPct}% energy)`}
                    </span>
                  </div>
                </div>

                {/* Carbs */}
                <div className="bg-warning/10 border border-warning/20 p-2 rounded-xl flex sm:flex-col justify-between items-center sm:items-start gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-warning text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-warning shrink-0"></span>
                    <span>Carbs ({carbsPct}%)</span>
                  </div>
                  <div className="font-mono text-[11px] font-bold text-base-content/90">
                    {nutrientTotals.carbohydrates || 0}g{" "}
                    <span className="text-[10px] font-medium text-base-content/50">
                      {activeMeal === "All" ? `/ ${carbsMaxGrams}g` : `(${carbsPct}% energy)`}
                    </span>
                  </div>
                </div>

                {/* Fat */}
                <div className="bg-success/10 border border-success/20 p-2 rounded-xl flex sm:flex-col justify-between items-center sm:items-start gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-success text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-success shrink-0"></span>
                    <span>Fat ({fatPct}%)</span>
                  </div>
                  <div className="font-mono text-[11px] font-bold text-base-content/90">
                    {nutrientTotals.fat || 0}g{" "}
                    <span className="text-[10px] font-medium text-base-content/50">
                      {activeMeal === "All" ? `/ ${fatMaxGrams}g` : `(${fatPct}% energy)`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact items list when viewing a specific meal */}
          {activeMeal !== "All" && activeLogs.length > 0 && (
            <div className="bg-base-100 p-3 rounded-2xl border border-base-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-base-content/80">
                <span className="flex items-center gap-1.5">
                  <span>{MEAL_ICONS[activeMeal] || "🍴"}</span>
                  <span>Items in {activeMeal}</span>
                </span>
                <span className="badge badge-neutral badge-xs font-mono font-bold">
                  {nutrientTotals.calories || 0} kcal
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                {activeLogs.map((log, idx) => (
                  <div
                    key={log._id || idx}
                    className="p-2 rounded-xl bg-base-200/50 border border-base-300/60 flex items-center justify-between text-xs gap-2"
                  >
                    <span className="font-semibold text-base-content truncate">
                      {log.foodName || log.foodId?.name || "Logged Item"}
                    </span>
                    <span className="font-bold font-mono text-primary shrink-0">
                      {log.calories || 0} kcal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs (flex-wrap without any horizontal scrollbar) */}
          <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
            {["All", ...Object.keys(NUTRIENT_CATEGORIES)].map((tab) => (
              <button
                key={tab}
                className={`btn btn-xs rounded-xl font-bold transition-all ${
                  activeTab === tab
                    ? "btn-primary shadow-xs"
                    : "btn-ghost border border-base-300 text-base-content/70"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Categorized Nutrient Sections with 2-line nutrient rows (no horizontal scroll) */}
          <div className="space-y-4">
            {categoriesToDisplay.map((category) => {
              const nutrients = NUTRIENT_CATEGORIES[category] || [];
              return (
                <div key={category} className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-base-300/70 pb-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles size={14} /> {category}
                    </h3>
                    <span className="text-[11px] text-base-content/60 font-semibold">
                      {nutrients.length} metrics
                    </span>
                  </div>

                  {/* 2-line layout grid for nutrients (1 column on mobile, 2 columns on tablet/desktop) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {nutrients.map((n) => {
                      const Icon = n.icon;
                      const val = nutrientTotals[n.id] || 0;
                      const targetVal = NUTRIENT_TARGETS[n.id];
                      const hasTarget = targetVal !== undefined && targetVal !== null && targetVal > 0;
                      const pct = hasTarget ? Math.round((val / targetVal) * 100) : 0;
                      const colorStyle = getPercentageColorClass(pct);

                      return (
                        <div
                          key={n.id}
                          className="bg-base-100 hover:bg-base-200/50 p-2.5 rounded-xl border border-base-300 shadow-xs space-y-1.5 transition-colors"
                        >
                          {/* Line 1: Nutrient Name with Icon & 3 Action Icons */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Icon size={14} className={`${n.color} shrink-0`} />
                              <span className="font-bold text-xs text-base-content truncate" title={n.label}>
                                {n.label}
                              </span>
                            </div>

                            {/* All Three Action Icons: Contributor Filter, Wiki Info, External Reference */}
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-circle text-primary hover:bg-primary/10"
                                title={`View foods contributing to ${n.label}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContributorNutrient(n);
                                }}
                              >
                                <ListFilter size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs btn-circle text-info hover:bg-info/10"
                                title={`Learn more about ${n.label}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWikiNutrient(n);
                                }}
                              >
                                <Info size={13} />
                              </button>
                              <a
                                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(n.label)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-primary hover:bg-base-300/60"
                                title={`Search ${n.label} on Wikipedia`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={13} />
                              </a>
                            </div>
                          </div>

                          {/* Line 2: Consumed Value, Small Progress Bar, Total & Percentage */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-extrabold text-xs text-base-content font-mono shrink-0">
                              {val} <span className="text-[10px] font-medium text-base-content/60">{n.unit}</span>
                            </span>

                            <div className="flex-1 bg-base-300/80 h-1.5 rounded-full overflow-hidden min-w-[50px]">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${colorStyle.bg}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                              <span className="text-base-content/60 font-semibold">
                                {hasTarget ? `/ ${targetVal} ${n.unit}` : `--`}
                              </span>
                              {hasTarget && (
                                <span
                                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${colorStyle.badge}`}
                                >
                                  {pct}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-base-300/80 border-t border-base-300 flex justify-end shrink-0">
          <button className="btn btn-sm btn-neutral rounded-xl px-5" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>

      <NutrientWikiModal
        isOpen={!!selectedWikiNutrient}
        onClose={() => setSelectedWikiNutrient(null)}
        nutrient={selectedWikiNutrient}
      />

      <NutrientContributorsModal
        isOpen={!!contributorNutrient}
        onClose={() => setContributorNutrient(null)}
        nutrient={contributorNutrient}
        allLogs={activeLogs}
        selectedDate={selectedDate}
        dayTotal={contributorNutrient ? nutrientTotals[contributorNutrient.id] || 0 : 0}
      />
    </div>
  );
}

function NutrientContributorsModal({ isOpen, onClose, nutrient, allLogs, selectedDate, dayTotal }) {
  if (!isOpen || !nutrient) return null;

  const Icon = nutrient.icon || Sparkles;

  const getLogNutrientVal = (log, nutrientId) => {
    const servings = log.servings || 1;
    const foodObj = log.foodId || log;

    let rawVal = log[nutrientId];
    if (rawVal === undefined || rawVal === null) {
      rawVal = foodObj ? foodObj[nutrientId] : 0;
    }

    if (nutrientId === "netCarbs") {
      const carbs = log.carbohydrates !== undefined ? log.carbohydrates : (foodObj?.carbohydrates || 0);
      const fiber = log.fiber !== undefined ? log.fiber : (foodObj?.fiber || 0);
      return Math.max(0, carbs - fiber);
    }

    if (["calories", "protein", "carbohydrates", "fat", "fiber", "sugar"].includes(nutrientId) && log[nutrientId] !== undefined) {
      return Number(log[nutrientId]) || 0;
    }

    if (typeof rawVal === "number") {
      return rawVal * servings;
    }

    const num = parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num * servings;
  };

  const contributors = allLogs
    .map((log) => {
      const foodObj = log.foodId || log;
      const foodName = log.foodName || foodObj.name || "Logged Item";
      const mealType = log.mealType || "Logged";
      const val = getLogNutrientVal(log, nutrient.id);
      const formattedVal = nutrient.id === "calories" || nutrient.id === "water" ? Math.round(val) : parseFloat(val.toFixed(1));
      const pct = dayTotal > 0 ? Math.round((val / dayTotal) * 100) : 0;

      return {
        id: log._id || Math.random(),
        foodName,
        mealType,
        servings: log.servings || 1,
        portionLabel: log.portionLabel || log.servingUnit || "serving",
        val: formattedVal,
        pct,
      };
    })
    .filter((item) => item.val > 0)
    .sort((a, b) => b.val - a.val);

  return (
    <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-200 rounded-3xl max-w-md w-full h-[580px] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl bg-base-100 shadow-xs ${nutrient.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-1.5">
                Food Contributors for {nutrient.label}
              </h3>
              <p className="text-xs text-base-content/70">
                <span className="font-semibold text-primary">{selectedDate}</span> • Day Total: <span className="font-bold text-primary">{dayTotal} {nutrient.unit}</span>
              </p>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5 min-h-0">
          {contributors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Utensils size={36} className="opacity-30 mb-2" />
              <p className="text-sm font-semibold opacity-70">No foods contributed to {nutrient.label} on this date.</p>
            </div>
          ) : (
            contributors.map((item) => (
              <div
                key={item.id}
                className="bg-base-100 p-3 rounded-2xl border border-base-300 shadow-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate flex items-center gap-1.5">
                      <span>{item.foodName}</span>
                      <span className="badge badge-xs badge-outline badge-primary shrink-0">
                        {item.mealType}
                      </span>
                    </div>
                    <div className="text-[11px] text-base-content/60">
                      {item.servings} serving(s) ({item.portionLabel})
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-sm text-primary font-mono">
                      +{item.val} {nutrient.unit}
                    </div>
                    <div className="text-[10px] font-bold text-base-content/60">
                      {item.pct}% of day total
                    </div>
                  </div>
                </div>

                <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(item.pct, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-base-300/80 border-t border-base-300 flex justify-end shrink-0">
          <button className="btn btn-xs sm:btn-sm btn-neutral rounded-xl px-4" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailyNutrientsModal;
