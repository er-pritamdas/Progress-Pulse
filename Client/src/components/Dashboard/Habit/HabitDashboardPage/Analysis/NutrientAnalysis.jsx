import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../../Context/AxiosInstance";
import { useLoading } from "../../../../../Context/LoadingContext";
import {
  Sparkles,
  SlidersHorizontal,
  Flame,
  Dumbbell,
  Wheat,
  PieChart,
  Apple,
  Zap,
  Activity,
  Droplets,
  HeartPulse,
  ShieldAlert,
  Check,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows,
  LineChart,
  BarChart2,
  Filter,
  TrendingDown,
  Table,
} from "lucide-react";
import NutrientGraphCard from "../Charts/NutrientGraphCard";
import NutrientWikiModal from "../../FoodLogging/NutrientWikiModal";
import NutrientTableModal from "../NutrientTableModal";

export const NUTRIENT_CATEGORIES_CONFIG = {
  Macronutrients: [
    { id: "calories", label: "Calories", unit: "kcal", color: "text-error", colorHex: "#ef4444", icon: Flame, isMacro: true },
    { id: "protein", label: "Protein", unit: "g", color: "text-info", colorHex: "#3b82f6", icon: Dumbbell, isMacro: true },
    { id: "carbohydrates", label: "Carbohydrates", unit: "g", color: "text-warning", colorHex: "#f59e0b", icon: Wheat, isMacro: true },
    { id: "netCarbs", label: "Net Carbs", unit: "g", color: "text-amber-500", colorHex: "#d97706", icon: Activity, isMacro: false },
    { id: "fat", label: "Fat", unit: "g", color: "text-success", colorHex: "#10b981", icon: PieChart, isMacro: true },
    { id: "fiber", label: "Fiber", unit: "g", color: "text-emerald-500", colorHex: "#059669", icon: Apple, isMacro: false },
    { id: "sugar", label: "Sugar", unit: "g", color: "text-rose-400", colorHex: "#fb7185", icon: Sparkles, isMacro: false },
    { id: "addedSugar", label: "Added Sugar", unit: "g", color: "text-red-400", colorHex: "#f87171", icon: ShieldAlert, isMacro: false },
  ],
  Vitamins: [
    { id: "vitaminA", label: "Vitamin A", unit: "mcg", color: "text-amber-400", colorHex: "#fbbf24", icon: Zap, isMacro: false },
    { id: "vitaminB1", label: "Vitamin B1", unit: "mg", color: "text-blue-400", colorHex: "#60a5fa", icon: Zap, isMacro: false },
    { id: "vitaminB2", label: "Vitamin B2", unit: "mg", color: "text-cyan-400", colorHex: "#22d3ee", icon: Zap, isMacro: false },
    { id: "vitaminB3", label: "Vitamin B3", unit: "mg", color: "text-indigo-400", colorHex: "#818cf8", icon: Zap, isMacro: false },
    { id: "vitaminB5", label: "Vitamin B5", unit: "mg", color: "text-sky-400", colorHex: "#38bdf8", icon: Zap, isMacro: false },
    { id: "vitaminB6", label: "Vitamin B6", unit: "mg", color: "text-violet-400", colorHex: "#a78bfa", icon: Zap, isMacro: false },
    { id: "vitaminB7", label: "Vitamin B7", unit: "mcg", color: "text-purple-400", colorHex: "#c084fc", icon: Zap, isMacro: false },
    { id: "vitaminB9", label: "Vitamin B9", unit: "mcg", color: "text-fuchsia-400", colorHex: "#e879f9", icon: Zap, isMacro: false },
    { id: "vitaminB12", label: "Vitamin B12", unit: "mcg", color: "text-pink-400", colorHex: "#f472b6", icon: Zap, isMacro: false },
    { id: "vitaminC", label: "Vitamin C", unit: "mg", color: "text-orange-400", colorHex: "#fb923c", icon: Zap, isMacro: false },
    { id: "vitaminD", label: "Vitamin D", unit: "IU", color: "text-yellow-400", colorHex: "#facc15", icon: Zap, isMacro: false },
    { id: "vitaminE", label: "Vitamin E", unit: "mg", color: "text-lime-400", colorHex: "#a3e635", icon: Zap, isMacro: false },
    { id: "vitaminK", label: "Vitamin K", unit: "mcg", color: "text-green-400", colorHex: "#4ade80", icon: Zap, isMacro: false },
  ],
  Minerals: [
    { id: "calcium", label: "Calcium", unit: "mg", color: "text-sky-400", colorHex: "#38bdf8", icon: Activity, isMacro: false },
    { id: "magnesium", label: "Magnesium", unit: "mg", color: "text-indigo-400", colorHex: "#818cf8", icon: Activity, isMacro: false },
    { id: "phosphorus", label: "Phosphorus", unit: "mg", color: "text-purple-400", colorHex: "#c084fc", icon: Activity, isMacro: false },
    { id: "potassium", label: "Potassium", unit: "mg", color: "text-emerald-400", colorHex: "#34d399", icon: Activity, isMacro: false },
    { id: "sodium", label: "Sodium", unit: "mg", color: "text-amber-500", colorHex: "#f59e0b", icon: Activity, isMacro: false },
    { id: "iron", label: "Iron", unit: "mg", color: "text-amber-600", colorHex: "#d97706", icon: Activity, isMacro: false },
    { id: "zinc", label: "Zinc", unit: "mg", color: "text-slate-400", colorHex: "#94a3b8", icon: Activity, isMacro: false },
    { id: "copper", label: "Copper", unit: "mg", color: "text-orange-600", colorHex: "#ea580c", icon: Activity, isMacro: false },
    { id: "manganese", label: "Manganese", unit: "mg", color: "text-stone-400", colorHex: "#a8a29e", icon: Activity, isMacro: false },
    { id: "selenium", label: "Selenium", unit: "mcg", color: "text-teal-400", colorHex: "#2dd4bf", icon: Activity, isMacro: false },
    { id: "iodine", label: "Iodine", unit: "mcg", color: "text-blue-500", colorHex: "#3b82f6", icon: Activity, isMacro: false },
  ],
  "Fatty Acids": [
    { id: "saturatedFat", label: "Saturated Fat", unit: "g", color: "text-red-300", colorHex: "#fca5a5", icon: HeartPulse, isMacro: false },
    { id: "monounsaturatedFat", label: "Monounsaturated", unit: "g", color: "text-green-300", colorHex: "#86efac", icon: HeartPulse, isMacro: false },
    { id: "polyunsaturatedFat", label: "Polyunsaturated", unit: "g", color: "text-emerald-300", colorHex: "#6ee7b7", icon: HeartPulse, isMacro: false },
    { id: "omega3", label: "Omega-3", unit: "g", color: "text-cyan-300", colorHex: "#67e8f9", icon: HeartPulse, isMacro: false },
    { id: "omega6", label: "Omega-6", unit: "g", color: "text-teal-300", colorHex: "#5eead4", icon: HeartPulse, isMacro: false },
    { id: "transFat", label: "Trans Fat", unit: "g", color: "text-rose-500", colorHex: "#f43f5e", icon: ShieldAlert, isMacro: false },
  ],
  Others: [
    { id: "cholesterol", label: "Cholesterol", unit: "mg", color: "text-rose-300", colorHex: "#fda4af", icon: HeartPulse, isMacro: false },
    { id: "glycemicIndex", label: "Glycemic Index", unit: "", color: "text-purple-300", colorHex: "#d8b4fe", icon: Activity, isMacro: false },
    { id: "glycemicLoad", label: "Glycemic Load", unit: "", color: "text-violet-300", colorHex: "#c4b5fd", icon: Activity, isMacro: false },
    { id: "water", label: "Water", unit: "ml", color: "text-sky-400", colorHex: "#38bdf8", icon: Droplets, isMacro: false },
  ],
};

function CategoryTagBar({ category, categoryNutrients, activeSelected, toggleGraph, selectAllGraphs, deselectAllGraphs }) {
  const scrollContainerRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0 w-full">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="btn btn-xs btn-circle btn-ghost border border-base-300 shrink-0 hover:bg-base-200"
        title="Scroll Left"
      >
        <ChevronLeft size={14} />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap flex-1 py-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          type="button"
          className="btn btn-xs btn-outline rounded-lg text-[10px] font-semibold gap-1 shrink-0 whitespace-nowrap"
          onClick={() => selectAllGraphs(category)}
          title="Show all graphs in this category"
        >
          <Check size={12} /> All
        </button>
        <button
          type="button"
          className="btn btn-xs btn-ghost border border-base-300 rounded-lg text-[10px] font-semibold gap-1 shrink-0 whitespace-nowrap mr-1"
          onClick={() => deselectAllGraphs(category)}
          title="Hide all graphs in this category"
        >
          <RotateCcw size={12} /> Clear
        </button>

        {categoryNutrients.map((n) => {
          const isSelected = activeSelected.includes(n.id);
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              type="button"
              className={`btn btn-xs rounded-xl font-bold transition-all gap-1 text-[11px] shrink-0 whitespace-nowrap ${
                isSelected
                  ? "btn-primary shadow-xs"
                  : "btn-ghost border border-base-300 text-base-content/60"
              }`}
              onClick={() => toggleGraph(category, n.id)}
            >
              <Icon size={12} className={isSelected ? "text-primary-content" : n.color} />
              {n.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        className="btn btn-xs btn-circle btn-ghost border border-base-300 shrink-0 hover:bg-base-200"
        title="Scroll Right"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function NutrientAnalysis({
  habitData = [],
  fromDate,
  toDate,
  activeCategoryTab: externalCategoryTab,
  setActiveCategoryTab: setExternalCategoryTab,
}) {
  const { setLoading } = useLoading();
  const habitState = useSelector((state) => state.habit || {});
  const [internalCategoryTab, setInternalCategoryTab] = useState("Macronutrients");
  const activeCategoryTab = externalCategoryTab || internalCategoryTab;
  const setActiveCategoryTab = setExternalCategoryTab || setInternalCategoryTab;
  const [foodLogs, setFoodLogs] = useState([]);
  const [selectedWikiNutrient, setSelectedWikiNutrient] = useState(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableCategory, setTableCategory] = useState("Macronutrients");

  // Selected graphs per category map: { Macronutrients: ['calories', 'protein', ...], Vitamins: [...] }
  const [selectedGraphs, setSelectedGraphs] = useState(() => {
    try {
      const saved = localStorage.getItem("selected_nutrient_graphs_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading saved graph selections:", e);
    }
    // Default: Show all graphs in all categories
    const initial = {};
    Object.entries(NUTRIENT_CATEGORIES_CONFIG).forEach(([cat, list]) => {
      initial[cat] = list.map((n) => n.id);
    });
    return initial;
  });

  // Card Layout: 'side-by-side' (2 columns) or 'full-width' (1 column full width)
  const [cardLayout, setCardLayout] = useState(() => {
    try {
      const saved = localStorage.getItem("nutrient_card_layout");
      if (saved) return saved;
    } catch (e) {
      console.error("Error reading nutrient_card_layout:", e);
    }
    return "side-by-side";
  });

  // Display Mode: 'with-graph' (Graphs + Metrics) or 'metrics-only' (Metrics Only)
  const [displayMode, setDisplayMode] = useState(() => {
    try {
      const saved = localStorage.getItem("nutrient_card_display_mode");
      if (saved) return saved;
    } catch (e) {
      console.error("Error reading nutrient_card_display_mode:", e);
    }
    return "with-graph";
  });

  // Target Filter: 'all' (Show All Cards) or 'below-max' (Only Show Cards where Avg < Max Target)
  const [targetFilter, setTargetFilter] = useState(() => {
    try {
      const saved = localStorage.getItem("nutrient_card_target_filter");
      if (saved) return saved;
    } catch (e) {
      console.error("Error reading nutrient_card_target_filter:", e);
    }
    return "all";
  });

  // Save selected graphs to localStorage
  useEffect(() => {
    try {
      localStorage.getItem && localStorage.setItem("selected_nutrient_graphs_v2", JSON.stringify(selectedGraphs));
    } catch (e) {
      console.error("Failed to save graph selections", e);
    }
  }, [selectedGraphs]);

  // Save card layout preference
  useEffect(() => {
    try {
      localStorage.setItem("nutrient_card_layout", cardLayout);
    } catch (e) {
      console.error("Failed to save nutrient_card_layout", e);
    }
  }, [cardLayout]);

  // Save display mode preference
  useEffect(() => {
    try {
      localStorage.setItem("nutrient_card_display_mode", displayMode);
    } catch (e) {
      console.error("Failed to save nutrient_card_display_mode", e);
    }
  }, [displayMode]);

  // Save target filter preference
  useEffect(() => {
    try {
      localStorage.setItem("nutrient_card_target_filter", targetFilter);
    } catch (e) {
      console.error("Failed to save nutrient_card_target_filter", e);
    }
  }, [targetFilter]);

  const getTodayISO = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayISO = getTodayISO();
  const effectiveStartDate = fromDate || todayISO;
  const effectiveEndDate = toDate || todayISO;

  // Fetch Date Range Food Logs
  useEffect(() => {
    const fetchRangeLogs = async () => {
      if (!effectiveStartDate || !effectiveEndDate) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get("/v1/dashboard/habit/food/range-logs", {
          params: { startDate: effectiveStartDate, endDate: effectiveEndDate },
        });
        setFoodLogs(res.data?.data?.logs || []);
      } catch (err) {
        console.error("Failed to fetch food logs for date range:", err);
        setFoodLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRangeLogs();
  }, [effectiveStartDate, effectiveEndDate, setLoading]);

  // Generate date list between startStr and endStr (inclusive) using local date components
  const generateDateList = (startStr, endStr) => {
    if (!startStr || !endStr) return [];
    const dates = [];
    const [sY, sM, sD] = startStr.split("-").map(Number);
    const [eY, eM, eD] = endStr.split("-").map(Number);

    if (isNaN(sY) || isNaN(eY)) return [];

    let curr = new Date(sY, sM - 1, sD);
    const end = new Date(eY, eM - 1, eD);

    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, "0");
      const dd = String(curr.getDate()).padStart(2, "0");
      const isoDate = `${yyyy}-${mm}-${dd}`;
      const formattedDate = dd;
      const fullDateStr = curr.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
      dates.push({ date: isoDate, formattedDate, fullDateStr });
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  // Check if foodLogs contains entries with dates later than effectiveEndDate
  let maxDateFound = effectiveEndDate;
  foodLogs.forEach((log) => {
    const cleanD = (log.date || "").split("T")[0].trim();
    if (cleanD && cleanD > maxDateFound) {
      maxDateFound = cleanD;
    }
  });

  const dateRangeList = generateDateList(effectiveStartDate, maxDateFound);

  // Determine Nutrient Target Values (Min & Max)
  const settingsIntake = habitState.settings?.intake;
  const maintenanceCalories = habitState.maintenanceCalories || 2000;
  const calorieMin = settingsIntake?.min || Math.round(maintenanceCalories * 0.9);
  const calorieMax = settingsIntake?.max || Math.round(maintenanceCalories * 1.1);

  const getMacroRatios = () => {
    try {
      const saved = localStorage.getItem("macro_ratios");
      return saved ? JSON.parse(saved) : { protein: 30, carbs: 40, fats: 30 };
    } catch (e) {
      return { protein: 30, carbs: 40, fats: 30 };
    }
  };

  const macroRatios = getMacroRatios();
  const proteinMinGrams = Math.round((calorieMin * (macroRatios.protein / 100)) / 4);
  const proteinMaxGrams = Math.round((calorieMax * (macroRatios.protein / 100)) / 4);

  const carbsMinGrams = Math.round((calorieMin * (macroRatios.carbs / 100)) / 4);
  const carbsMaxGrams = Math.round((calorieMax * (macroRatios.carbs / 100)) / 4);

  const fatMinGrams = Math.round((calorieMin * (macroRatios.fats / 100)) / 9);
  const fatMaxGrams = Math.round((calorieMax * (macroRatios.fats / 100)) / 9);

  const age = habitState.age || 21;
  const gender = habitState.gender || "male";
  const isMale = gender === "male";
  const habitWaterMin = habitState.settings?.water?.min;

  const TARGETS_CONFIG = {
    // Macros (have both Min and Max)
    calories: { min: calorieMin, max: calorieMax },
    protein: { min: proteinMinGrams, max: proteinMaxGrams },
    carbohydrates: { min: carbsMinGrams, max: carbsMaxGrams },
    netCarbs: { min: 0, max: carbsMaxGrams },
    fat: { min: fatMinGrams, max: fatMaxGrams },

    // Other Nutrients
    fiber: { min: 0, max: isMale ? 38 : 25 },
    sugar: { min: 0, max: isMale ? 36 : 25 },
    addedSugar: { min: 0, max: isMale ? 36 : 25 },
    vitaminA: { min: 0, max: isMale ? 900 : 700 },
    vitaminB1: { min: 0, max: isMale ? 1.2 : 1.1 },
    vitaminB2: { min: 0, max: isMale ? 1.3 : 1.1 },
    vitaminB3: { min: 0, max: isMale ? 16 : 14 },
    vitaminB5: { min: 0, max: 5 },
    vitaminB6: { min: 0, max: age > 50 ? (isMale ? 1.7 : 1.5) : 1.3 },
    vitaminB7: { min: 0, max: 30 },
    vitaminB9: { min: 0, max: 400 },
    vitaminB12: { min: 0, max: 2.4 },
    vitaminC: { min: 0, max: isMale ? 90 : 75 },
    vitaminD: { min: 0, max: 600 },
    vitaminE: { min: 0, max: 15 },
    vitaminK: { min: 0, max: isMale ? 120 : 90 },
    calcium: { min: 0, max: 1000 },
    magnesium: { min: 0, max: isMale ? 420 : 320 },
    phosphorus: { min: 0, max: 700 },
    potassium: { min: 0, max: isMale ? 3400 : 2600 },
    sodium: { min: 0, max: 2300 },
    iron: { min: 0, max: isMale ? 8 : age > 50 ? 8 : 18 },
    zinc: { min: 0, max: isMale ? 11 : 8 },
    copper: { min: 0, max: 0.9 },
    manganese: { min: 0, max: isMale ? 2.3 : 1.8 },
    selenium: { min: 0, max: 55 },
    iodine: { min: 0, max: 150 },
    saturatedFat: { min: 0, max: 20 },
    monounsaturatedFat: { min: 0, max: 25 },
    polyunsaturatedFat: { min: 0, max: 20 },
    omega3: { min: 0, max: isMale ? 1.6 : 1.1 },
    omega6: { min: 0, max: isMale ? 17 : 12 },
    transFat: { min: 0, max: 0 },
    cholesterol: { min: 0, max: 300 },
    glycemicIndex: { min: 0, max: 55 },
    glycemicLoad: { min: 0, max: 100 },
    water: { min: 0, max: habitWaterMin ? habitWaterMin * 1000 : isMale ? 3700 : 2700 },
  };

  const normalizeDateKey = (rawDate) => {
    if (!rawDate) return "";
    if (typeof rawDate === "string") {
      const str = rawDate.trim();
      if (str.includes("T")) return str.split("T")[0].trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    }
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Group logs by date
  const logsByDate = {};
  foodLogs.forEach((log) => {
    const rawDate = normalizeDateKey(log.date);
    if (rawDate) {
      if (!logsByDate[rawDate]) logsByDate[rawDate] = [];
      logsByDate[rawDate].push(log);
    }
  });

  // Map habitData entries by date for fallback
  const habitDataByDate = {};
  if (Array.isArray(habitData)) {
    habitData.forEach((item) => {
      const cleanDate = normalizeDateKey(item.date);
      if (cleanDate) {
        habitDataByDate[cleanDate] = item;
      }
    });
  }

  // Robust helper to extract numerical nutrient value from log or foodObj
  const extractNutrientValue = (log, nutrientId) => {
    if (!log) return 0;
    const servings = Number(log.servings) || 1;
    const foodObj = (typeof log.foodId === "object" && log.foodId !== null) ? log.foodId : null;

    const parseNum = (val) => {
      if (val === undefined || val === null || val === "" || val === "N/A") return null;
      if (typeof val === "number") return val;
      const cleaned = String(val).replace(/[^0-9.]/g, "");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    // Direct macro check on log document
    const isDirectMacro = ["calories", "protein", "carbohydrates", "fat", "fiber", "sugar"].includes(nutrientId);
    
    if (isDirectMacro) {
      let valOnLog = parseNum(log[nutrientId]);
      if (nutrientId === "carbohydrates" && valOnLog === null) {
        valOnLog = parseNum(log.carbs);
      }
      if (valOnLog !== null && valOnLog > 0) {
        return valOnLog;
      }
    }

    // Check direct log field for any nutrient
    let directVal = parseNum(log[nutrientId]);
    if (directVal === null && nutrientId === "carbohydrates") {
      directVal = parseNum(log.carbs);
    }
    if (directVal !== null && directVal > 0) {
      return directVal;
    }

    // Fallback to foodObj and multiply by servings
    if (foodObj) {
      let foodRaw = parseNum(foodObj[nutrientId]);
      if (foodRaw === null && nutrientId === "carbohydrates") {
        foodRaw = parseNum(foodObj.carbs);
      }
      if (foodRaw !== null) {
        return foodRaw * servings;
      }
    }

    return 0;
  };

  // Calculate daily intake values for a specific nutrient id across dateRangeList
  const calculateNutrientDailyValues = (nutrientId) => {
    return dateRangeList.map(({ date, formattedDate }) => {
      const logsOnDate = logsByDate[date] || [];
      let dailySum = 0;

      if (logsOnDate.length > 0) {
        logsOnDate.forEach((log) => {
          if (nutrientId === "netCarbs") {
            const carbs = extractNutrientValue(log, "carbohydrates");
            const fiber = extractNutrientValue(log, "fiber");
            dailySum += Math.max(0, carbs - fiber);
          } else if (nutrientId === "glycemicIndex" || nutrientId === "glycemicLoad") {
            const val = extractNutrientValue(log, nutrientId);
            if (val > dailySum) dailySum = val;
          } else {
            dailySum += extractNutrientValue(log, nutrientId);
          }
        });
      }

      const habitEntry = habitDataByDate[date];
      if (dailySum === 0 && habitEntry) {
        if (nutrientId === "calories" && habitEntry.intake) {
          dailySum = Number(habitEntry.intake) || 0;
        } else if (nutrientId === "water" && habitEntry.water) {
          const waterVal = Number(habitEntry.water) || 0;
          dailySum = waterVal < 50 ? waterVal * 1000 : waterVal;
        }
      }

      const hasLog = logsOnDate.length > 0 || Boolean(habitEntry && (Number(habitEntry.intake) > 0 || Number(habitEntry.water) > 0));

      return {
        date,
        formattedDate,
        value: nutrientId === "calories" || nutrientId === "water" ? Math.round(dailySum) : parseFloat(dailySum.toFixed(1)),
        hasLog: hasLog || dailySum > 0,
      };
    });
  };

  // Toggle nutrient graph visibility for a category
  const toggleGraph = (category, nutrientId) => {
    setSelectedGraphs((prev) => {
      const currentList = prev[category] || [];
      const updatedList = currentList.includes(nutrientId)
        ? currentList.filter((id) => id !== nutrientId)
        : [...currentList, nutrientId];
      return { ...prev, [category]: updatedList };
    });
  };

  const selectAllGraphs = (category) => {
    const list = NUTRIENT_CATEGORIES_CONFIG[category].map((n) => n.id);
    setSelectedGraphs((prev) => ({ ...prev, [category]: list }));
  };

  const selectAllGraphsForAllCategories = () => {
    const initial = {};
    Object.entries(NUTRIENT_CATEGORIES_CONFIG).forEach(([cat, list]) => {
      initial[cat] = list.map((n) => n.id);
    });
    setSelectedGraphs(initial);
  };

  const deselectAllGraphs = (category) => {
    setSelectedGraphs((prev) => ({ ...prev, [category]: [] }));
  };

  const categoriesToRender = [activeCategoryTab || "Macronutrients"];

  return (
    <div className="mb-12 animate-fade-in-up space-y-8">
      {/* Render Category Sections */}
      {categoriesToRender.map((category) => {
        const categoryNutrients = NUTRIENT_CATEGORIES_CONFIG[category] || [];
        const activeSelected = selectedGraphs[category] || [];

        // Filter cards by active selections and optional Avg < Max Target condition
        const selectedCategoryNutrients = categoryNutrients.filter((n) => activeSelected.includes(n.id));

        const displayedNutrients = selectedCategoryNutrients.filter((nutrient) => {
          if (targetFilter !== "below-max") return true;
          const targetInfo = TARGETS_CONFIG[nutrient.id] || { min: 0, max: 0 };
          const maxTarget = targetInfo.max || 0;
          if (maxTarget <= 0) return true;

          const dailyValues = calculateNutrientDailyValues(nutrient.id);
          const values = dailyValues.map((d) => d.value || 0);
          const totalConsumed = values.reduce((sum, val) => sum + val, 0);
          const loggedDaysCount = dailyValues.filter((d) => d.hasLog || (d.value || 0) > 0).length;
          const avgValue = loggedDaysCount > 0 ? totalConsumed / loggedDaysCount : 0;

          return avgValue < maxTarget;
        });

        return (
          <section key={category} className="space-y-4">
            {/* Category Control Header */}
            <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                    <SlidersHorizontal size={16} />
                  </span>
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-wider text-base-content flex items-center gap-2">
                      {category} Cards
                    </h3>
                    <span className="text-xs text-base-content/60 font-medium">
                      {displayedNutrients.length} of {categoryNutrients.length} cards visible
                      {targetFilter === "below-max" && " (Filtered: Avg < Max Target)"}
                    </span>
                  </div>
                </div>

                {/* View Mode & Layout Control Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Target Filter (All vs Avg < Max Target) */}
                  <div className="join bg-base-200/80 p-1 rounded-2xl border border-base-300/60 shadow-xs">
                    <button
                      type="button"
                      className={`join-item btn btn-xs rounded-xl font-bold gap-1.5 transition-all ${
                        targetFilter === "all"
                          ? "btn-primary text-primary-content shadow-xs"
                          : "btn-ghost text-base-content/60 hover:text-base-content"
                      }`}
                      onClick={() => setTargetFilter("all")}
                      title="Show All Selected Cards"
                    >
                      <Filter size={13} />
                      <span className="hidden sm:inline">All Cards</span>
                    </button>

                    <button
                      type="button"
                      className={`join-item btn btn-xs rounded-xl font-bold gap-1.5 transition-all ${
                        targetFilter === "below-max"
                          ? "btn-primary text-primary-content shadow-xs"
                          : "btn-ghost text-base-content/60 hover:text-base-content"
                      }`}
                      onClick={() => {
                        setTargetFilter("below-max");
                        selectAllGraphsForAllCategories();
                      }}
                      title="Show only cards where Average is less than Max Target"
                    >
                      <TrendingDown size={13} />
                      <span className="hidden sm:inline">Avg &lt; Max Target</span>
                    </button>
                  </div>

                  {/* Layout Mode (Side by Side vs Full Width) */}
                  <div className="join bg-base-200/80 p-1 rounded-2xl border border-base-300/60 shadow-xs">
                    <button
                      type="button"
                      className={`join-item btn btn-xs rounded-xl font-bold gap-1.5 transition-all ${
                        cardLayout === "side-by-side"
                          ? "btn-primary text-primary-content shadow-xs"
                          : "btn-ghost text-base-content/60 hover:text-base-content"
                      }`}
                      onClick={() => setCardLayout("side-by-side")}
                      title="Side by Side Layout (2 cards per row)"
                    >
                      <LayoutGrid size={13} />
                      <span className="hidden sm:inline">Side by Side</span>
                    </button>

                    <button
                      type="button"
                      className={`join-item btn btn-xs rounded-xl font-bold gap-1.5 transition-all ${
                        cardLayout === "full-width"
                          ? "btn-primary text-primary-content shadow-xs"
                          : "btn-ghost text-base-content/60 hover:text-base-content"
                      }`}
                      onClick={() => setCardLayout("full-width")}
                      title="Full Width Layout (1 card per row)"
                    >
                      <Rows size={13} />
                      <span className="hidden sm:inline">Full Width</span>
                    </button>
                  </div>

                  {/* Display Mode (With Graph vs Metrics Only) */}
                  <div className="join bg-base-200/80 p-1 rounded-2xl border border-base-300/60 shadow-xs">
                    <button
                      type="button"
                      className={`join-item btn btn-xs rounded-xl font-bold gap-1.5 transition-all ${
                        displayMode === "with-graph"
                          ? "btn-primary text-primary-content shadow-xs"
                          : "btn-ghost text-base-content/60 hover:text-base-content"
                      }`}
                      onClick={() => setDisplayMode("with-graph")}
                      title="Show Graphs & Metrics"
                    >
                      <LineChart size={13} />
                      <span className="hidden sm:inline">With Graph</span>
                    </button>

                    <button
                      type="button"
                      className={`join-item btn btn-xs rounded-xl font-bold gap-1.5 transition-all ${
                        displayMode === "metrics-only"
                          ? "btn-primary text-primary-content shadow-xs"
                          : "btn-ghost text-base-content/60 hover:text-base-content"
                      }`}
                      onClick={() => setDisplayMode("metrics-only")}
                      title="Show Metrics Only (Hide Graphs)"
                    >
                      <BarChart2 size={13} />
                      <span className="hidden sm:inline">Metrics Only</span>
                    </button>
                  </div>

                  {/* Sub Dashboard Table View Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setTableCategory(category);
                      setIsTableModalOpen(true);
                    }}
                    className="btn btn-xs h-7 px-2.5 rounded-xl font-extrabold bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-primary-content hover:border-primary shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    title={`Open ${category} Table View (Dates & Days grouped by month)`}
                  >
                    <Table size={13} />
                    <span className="hidden sm:inline">Table View</span>
                  </button>
                </div>
              </div>

              {/* Selector Pills with Left/Right Scroll Arrows */}
              <div className="flex items-center justify-between gap-3 w-full">
                <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider shrink-0 hidden md:inline">
                  Filter Nutrients:
                </span>
                <CategoryTagBar
                  category={category}
                  categoryNutrients={categoryNutrients}
                  activeSelected={activeSelected}
                  toggleGraph={toggleGraph}
                  selectAllGraphs={selectAllGraphs}
                  deselectAllGraphs={deselectAllGraphs}
                />
              </div>
            </div>

            {/* Render Selected Nutrient Cards Grid */}
            {activeSelected.length === 0 ? (
              <div className="bg-base-100 p-8 rounded-2xl border border-dashed border-base-300 text-center space-y-2">
                <p className="text-sm font-semibold text-base-content/60">
                  No graphs selected for <span className="text-primary">{category}</span>.
                </p>
                <button
                  className="btn btn-xs btn-primary rounded-xl px-4"
                  onClick={() => selectAllGraphs(category)}
                >
                  Show All {category} Graphs
                </button>
              </div>
            ) : displayedNutrients.length === 0 ? (
              <div className="bg-base-100 p-8 rounded-2xl border border-dashed border-base-300 text-center space-y-2">
                <p className="text-sm font-semibold text-base-content/60">
                  No nutrient cards in <span className="text-primary">{category}</span> have a daily Average less than their Max Target.
                </p>
                <button
                  className="btn btn-xs btn-ghost border border-base-300 rounded-xl px-4 font-semibold"
                  onClick={() => setTargetFilter("all")}
                >
                  Show All Cards
                </button>
              </div>
            ) : (
              <div
                className={
                  cardLayout === "full-width"
                    ? "grid grid-cols-1 gap-5"
                    : "grid grid-cols-1 lg:grid-cols-2 gap-5"
                }
              >
                {displayedNutrients.map((nutrient) => {
                  const dailyValues = calculateNutrientDailyValues(nutrient.id);
                  const targetInfo = TARGETS_CONFIG[nutrient.id] || { min: 0, max: 0 };
                  const nutrientProps = {
                    ...nutrient,
                    minTarget: targetInfo.min || 0,
                    maxTarget: targetInfo.max || 0,
                  };

                  return (
                    <NutrientGraphCard
                      key={nutrient.id}
                      nutrient={nutrientProps}
                      dailyData={dailyValues}
                      totalDays={dateRangeList.length}
                      showGraph={displayMode === "with-graph"}
                      onOpenWiki={(nutr) => setSelectedWikiNutrient(nutr)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* Nutrient Table Modal Popup (Middle of UI with Month Groups & Sticky Headers) */}
      <NutrientTableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        initialCategory={tableCategory}
        dateRangeList={dateRangeList}
        foodLogs={foodLogs}
        habitData={habitData}
        targetsConfig={TARGETS_CONFIG}
      />

      {/* Nutrient Wiki Modal */}
      <NutrientWikiModal
        isOpen={!!selectedWikiNutrient}
        onClose={() => setSelectedWikiNutrient(null)}
        nutrient={selectedWikiNutrient}
      />
    </div>
  );
}

export default NutrientAnalysis;
