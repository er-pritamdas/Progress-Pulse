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

function DailyNutrientsModal({ isOpen, onClose, selectedDate, data, calorieTarget }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedWikiNutrient, setSelectedWikiNutrient] = useState(null);
  const [contributorNutrient, setContributorNutrient] = useState(null);

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

    allLogs.forEach((log) => {
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
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-base-200 rounded-3xl max-w-7xl w-full sm:w-[95vw] min-h-[550px] max-h-[calc(100vh-100px)] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 -mt-6 sm:-mt-10">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 text-primary rounded-2xl">
              <BarChart3 size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Complete Daily Nutrient Report & Habit Profile Limits
              </h2>
              <p className="text-xs text-base-content/70">
                Nutrient breakdown for <span className="font-semibold text-primary">{selectedDate}</span> ({allLogs.length} food items logged)
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Macro Calorie Distribution & Target Progress Bar */}
          <div className="bg-base-100 p-5 rounded-2xl border border-base-300 shadow-sm space-y-3">
            <div className="flex flex-wrap justify-between items-center text-xs font-bold text-base-content/80 gap-2">
              <span className="uppercase tracking-wider flex items-center gap-1.5 text-primary">
                <Activity size={15} /> Daily Calorie & Macro Target Progress
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs">
                  Energy: <span className="text-primary font-bold">{nutrientTotals.calories || 0}</span> / {calorieMin} – {calorieMax} kcal
                </span>
                <button
                  className="btn btn-xs btn-outline btn-primary gap-1 rounded-lg"
                  onClick={() => {
                    onClose();
                    navigate("/dashboard/habit/logging");
                  }}
                  title="Edit Macro Percentages in Habit Profile"
                >
                  <Settings size={12} /> Edit Ratios in Habit Profile
                </button>
              </div>
            </div>

            <div className="h-4 w-full bg-base-300 rounded-full flex overflow-hidden">
              <div
                style={{ width: `${proteinPct}%` }}
                className="bg-info h-full transition-all"
                title={`Protein: ${proteinPct}%`}
              ></div>
              <div
                style={{ width: `${carbsPct}%` }}
                className="bg-warning h-full transition-all"
                title={`Carbs: ${carbsPct}%`}
              ></div>
              <div
                style={{ width: `${fatPct}%` }}
                className="bg-success h-full transition-all"
                title={`Fat: ${fatPct}%`}
              ></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-info/10 border border-info/20 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 rounded-full bg-info shrink-0"></span>
                  <span>Protein ({macroRatios.protein}%)</span>
                </div>
                <span className="font-bold font-mono text-info text-[11px]">
                  {nutrientTotals.protein || 0}g ({proteinMinGrams}g–{proteinMaxGrams}g)
                </span>
              </div>

              <div className="bg-warning/10 border border-warning/20 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 rounded-full bg-warning shrink-0"></span>
                  <span>Carbs ({macroRatios.carbs}%)</span>
                </div>
                <span className="font-bold font-mono text-warning text-[11px]">
                  {nutrientTotals.carbohydrates || 0}g ({carbsMinGrams}g–{carbsMaxGrams}g)
                </span>
              </div>

              <div className="bg-success/10 border border-success/20 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 rounded-full bg-success shrink-0"></span>
                  <span>Fat ({macroRatios.fats}%)</span>
                </div>
                <span className="font-bold font-mono text-success text-[11px]">
                  {nutrientTotals.fat || 0}g ({fatMinGrams}g–{fatMaxGrams}g)
                </span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["All", ...Object.keys(NUTRIENT_CATEGORIES)].map((tab) => (
              <button
                key={tab}
                className={`btn btn-xs sm:btn-sm rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "btn-primary shadow-md"
                    : "btn-ghost border border-base-300 text-base-content/70"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Categorized Nutrient Sections */}
          <div className="space-y-6">
            {categoriesToDisplay.map((category) => {
              const nutrients = NUTRIENT_CATEGORIES[category] || [];
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-base-300 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                      <Sparkles size={16} /> {category}
                    </h3>
                    <span className="text-xs text-base-content/60 font-semibold">
                      {nutrients.length} metrics
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
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
                          className="bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-base-content/80 truncate flex items-center gap-1.5">
                              <Icon size={14} className={n.color} />
                              {n.label}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs p-1 text-primary hover:bg-primary/10 rounded-lg transition-all"
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
                                className="btn btn-ghost btn-xs p-1 text-info hover:bg-info/10 rounded-lg transition-all"
                                title={`Learn more about ${n.label}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWikiNutrient(n);
                                }}
                              >
                                <Info size={13} />
                              </button>
                              {hasTarget && (
                                <span
                                  className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${colorStyle.badge}`}
                                  title={`${pct}% of habit profile target`}
                                >
                                  {pct}%
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="my-1.5">
                            <div className="flex items-baseline flex-wrap gap-1">
                              <span className="text-xl font-extrabold tracking-tight">
                                {val}
                              </span>
                              {hasTarget ? (
                                <span className="text-xs font-semibold text-base-content/50">
                                  / {targetVal} {n.unit}
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-base-content/50">
                                  {n.unit}
                                </span>
                              )}
                            </div>
                          </div>

                          {hasTarget && (
                            <div className="w-full bg-base-300/80 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${colorStyle.bg}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Per-Meal Category Summary Matrix Table */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-secondary flex items-center gap-2 border-b border-base-300 pb-2">
              <Utensils size={16} /> Nutrients Matrix By Meal
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100">
              <table className="table table-sm w-full text-xs">
                <thead>
                  <tr className="bg-base-300/60 text-base-content font-bold">
                    <th>Meal Category</th>
                    <th className="text-right">Logged</th>
                    <th className="text-right">Calories</th>
                    <th className="text-right">Protein</th>
                    <th className="text-right">Carbs</th>
                    <th className="text-right">Fat</th>
                    <th className="text-right">Fiber</th>
                    <th className="text-right">Sugar</th>
                  </tr>
                </thead>
                <tbody>
                  {["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].map((meal) => {
                    const mealItems = meals[meal] || [];
                    const calories = mealItems.reduce((s, item) => s + (item.calories || 0), 0);
                    const protein = parseFloat(mealItems.reduce((s, item) => s + (item.protein || 0), 0).toFixed(1));
                    const carbs = parseFloat(mealItems.reduce((s, item) => s + (item.carbohydrates || 0), 0).toFixed(1));
                    const fat = parseFloat(mealItems.reduce((s, item) => s + (item.fat || 0), 0).toFixed(1));
                    const fiber = parseFloat(mealItems.reduce((s, item) => s + (item.fiber || 0), 0).toFixed(1));
                    const sugar = parseFloat(mealItems.reduce((s, item) => s + (item.sugar || 0), 0).toFixed(1));

                    return (
                      <tr key={meal} className="hover:bg-base-200/50">
                        <td className="font-bold">{meal}</td>
                        <td className="text-right">{mealItems.length} items</td>
                        <td className="text-right font-bold text-primary">{calories} kcal</td>
                        <td className="text-right text-info font-semibold">{protein}g</td>
                        <td className="text-right text-warning font-semibold">{carbs}g</td>
                        <td className="text-right text-success font-semibold">{fat}g</td>
                        <td className="text-right font-medium">{fiber}g</td>
                        <td className="text-right font-medium">{sugar}g</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
        allLogs={allLogs}
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
    <div className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-base-200 rounded-3xl max-w-md w-full max-h-[80vh] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 -mt-6 sm:-mt-10">
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
