import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../Context/AxiosInstance";
import LogFoodModal from "./LogFoodModal";
import AddCustomFoodModal from "./AddCustomFoodModal";
import DailyNutrientsModal, { NUTRIENT_CATEGORIES } from "./DailyNutrientsModal";
import CustomizeCardsModal from "./CustomizeCardsModal";
import CustomizeTableColumnsModal from "./CustomizeTableColumnsModal";
import NutrientWikiModal from "./NutrientWikiModal";
import FoodItemNutrientsModal from "./FoodItemNutrientsModal";
import EditFoodLogModal from "./EditFoodLogModal";
import DeleteFoodLogPopUp from "./DeleteFoodLogPopUp";
import MacroConcentricCircles from "./MacroConcentricCircles";
import { fetchHabitSettings } from "../../../../services/redux/slice/habitSlice";
import {
  X,
  Utensils,
  Plus,
  PlusCircle,
  Edit3,
  Trash2,
  Calendar,
  CalendarDays,
  Flame,
  Dumbbell,
  Wheat,
  PieChart,
  Clock,
  Sparkles,
  SlidersHorizontal,
  BarChart3,
  Activity,
  Apple,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Settings,
  ExternalLink,
  History,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

const formatServingCalc = (log) => {
  if (!log) return "";
  const foodObj = log.foodId || log;
  const servingSize = Number(log.servingSize || foodObj.servingSize) || 1;
  const servings = Number(log.servings) || 1;
  const fmtNum = (num) => (Math.round(num * 100) / 100).toString();
  const rawUnit = (log.unitType || foodObj.unitType || "g").trim();

  const match = rawUnit.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    const unitNum = parseFloat(match[1]);
    const unitText = match[2].trim();
    const totalUnitQty = unitNum * servings;
    const totalGrams = servingSize * servings;
    const space = unitText.length > 0 ? " " : "";

    if (unitText.toLowerCase() === "g" || unitText.toLowerCase() === "ml") {
      if (servings === 1) return `${fmtNum(unitNum)}${space}${unitText}`;
      return `${fmtNum(unitNum)}${space}${unitText} × ${fmtNum(servings)} = ${fmtNum(totalUnitQty)}${space}${unitText}`;
    }

    const baseGramLabel = servingSize && servingSize !== unitNum ? ` (${fmtNum(servingSize)} g)` : "";
    const totalGramLabel = servingSize && servingSize !== unitNum ? ` (${fmtNum(totalGrams)} g)` : "";

    if (servings === 1) {
      return `${fmtNum(unitNum)}${space}${unitText}${baseGramLabel}`;
    }
    return `${fmtNum(unitNum)}${space}${unitText}${baseGramLabel} × ${fmtNum(servings)} = ${fmtNum(totalUnitQty)}${space}${unitText}${totalGramLabel}`;
  }

  const totalGrams = servingSize * servings;
  const space = rawUnit.length > 2 ? " " : "";

  if (servings === 1) {
    return `${fmtNum(servingSize)}${space}${rawUnit}`;
  }
  return `${fmtNum(servingSize)}${space}${rawUnit} × ${fmtNum(servings)} = ${fmtNum(totalGrams)}${space}${rawUnit}`;
};

const NUTRIENT_META_MAP = {
  calories: { label: "Calories", unit: "kcal" },
  protein: { label: "Protein", unit: "g" },
  carbohydrates: { label: "Carbs", unit: "g" },
  carbs: { label: "Carbs", unit: "g" },
  fat: { label: "Fat", unit: "g" },
  fats: { label: "Fat", unit: "g" },
  fiber: { label: "Fiber", unit: "g" },
  sugar: { label: "Sugar", unit: "g" },
  addedSugar: { label: "Added Sugar", unit: "g" },
  netCarbs: { label: "Net Carbs", unit: "g" },
  saturatedFat: { label: "Sat Fat", unit: "g" },
  transFat: { label: "Trans Fat", unit: "g" },
  cholesterol: { label: "Cholest.", unit: "mg" },
  sodium: { label: "Sodium", unit: "mg" },
  potassium: { label: "Potassium", unit: "mg" },
  vitaminA: { label: "Vit A", unit: "mcg" },
  vitaminC: { label: "Vit C", unit: "mg" },
  iron: { label: "Iron", unit: "mg" },
  calcium: { label: "Calcium", unit: "mg" },
};

const getNutrientMeta = (id) => {
  if (NUTRIENT_META_MAP[id]) return NUTRIENT_META_MAP[id];
  for (const cat of Object.values(NUTRIENT_CATEGORIES)) {
    const found = cat.find((item) => item.id === id);
    if (found) return { label: found.label, unit: found.unit };
  }
  const formatted = id.charAt(0).toUpperCase() + id.slice(1);
  return { label: formatted, unit: "" };
};

const getNutrientLogVal = (log, id) => {
  if (!log) return "0";
  if (id === "calories") return `${log.calories || 0} kcal`;
  if (id === "protein") return `${log.protein || 0}g`;
  if (id === "carbs" || id === "carbohydrates") return `${log.carbohydrates !== undefined ? log.carbohydrates : (log.carbs || 0)}g`;
  if (id === "fat" || id === "fats") return `${log.fat || 0}g`;
  if (id === "netCarbs") {
    const net = log.netCarbs !== undefined ? log.netCarbs : Math.max(0, (log.carbohydrates || 0) - (log.fiber || 0));
    return `${net}g`;
  }
  if (id === "fiber") return `${log.fiber || 0}g`;
  if (id === "sugar") return `${log.sugar || 0}g`;

  const meta = getNutrientMeta(id);
  const rawVal = log[id] !== undefined ? log[id] : (log.foodId?.[id] !== undefined ? log.foodId[id] : null);

  if (rawVal === undefined || rawVal === null || rawVal === "" || rawVal === "N/A") {
    return "N/A";
  }

  const servings = Number(log.servings) || 1;

  if (typeof rawVal === "number") {
    const total = Math.round(rawVal * servings * 100) / 100;
    const unitToUse = meta.unit || "";
    const space = unitToUse.length > 2 ? " " : "";
    return `${total}${space}${unitToUse}`;
  }

  const strVal = String(rawVal).trim();
  const prefix = strVal.startsWith("<") ? "<" : "";

  // Strip duplicate concatenated unit labels if any raw values in DB have "mgmg", "gmg", etc.
  const cleanStr = strVal.replace(/mgmg/gi, "mg").replace(/gmg/gi, "mg");

  const numMatch = cleanStr.match(/[-+]?[0-9]*\.?[0-9]+/);
  if (numMatch) {
    const num = parseFloat(numMatch[0]);
    const total = Math.round(num * servings * 100) / 100;
    const unitToUse = meta.unit || cleanStr.replace(/^<|[-+]?[0-9]*\.?[0-9]+\s*/g, "").trim() || "";
    const space = unitToUse.length > 2 ? " " : "";
    return `${prefix}${total}${space}${unitToUse}`;
  }

  return cleanStr;
};

const getMealTotalNutrientVal = (mealLogs, id) => {
  if (!mealLogs || mealLogs.length === 0) return "0";
  const meta = getNutrientMeta(id);

  const sum = mealLogs.reduce((acc, log) => {
    if (id === "calories") return acc + (Number(log.calories) || 0);
    if (id === "protein") return acc + (Number(log.protein) || 0);
    if (id === "carbs" || id === "carbohydrates") {
      const c = log.carbohydrates !== undefined ? log.carbohydrates : (log.carbs || 0);
      return acc + (Number(c) || 0);
    }
    if (id === "fat" || id === "fats") return acc + (Number(log.fat) || 0);
    if (id === "netCarbs") {
      const net = log.netCarbs !== undefined ? log.netCarbs : Math.max(0, (log.carbohydrates || 0) - (log.fiber || 0));
      return acc + (Number(net) || 0);
    }
    if (id === "fiber") return acc + (Number(log.fiber) || 0);
    if (id === "sugar") return acc + (Number(log.sugar) || 0);

    const isFromLog = log[id] !== undefined;
    const rawVal = isFromLog ? log[id] : (log.foodId?.[id] !== undefined ? log.foodId[id] : null);
    if (rawVal === undefined || rawVal === null || rawVal === "" || rawVal === "N/A") return acc;

    const servings = Number(log.servings) || 1;
    if (typeof rawVal === "number") return acc + (isFromLog ? rawVal : rawVal * servings);

    const strVal = String(rawVal).trim();
    const numMatch = strVal.match(/[-+]?[0-9]*\.?[0-9]+/);
    if (numMatch) return acc + parseFloat(numMatch[0]) * (isFromLog ? 1 : servings);

    return acc;
  }, 0);

  const rounded = Math.round(sum * 10) / 10;
  return `${rounded}${meta.unit ? " " + meta.unit : ""}`;
};

function FoodLoggingTab({ onSwitchTab, activeTab = "food" }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const habitState = useSelector((state) => state.habit || {});
  const settingsIntake = useSelector(
    (state) => state.habit?.settings?.intake
  );
  const reduxMaintenanceCalories = useSelector(
    (state) => state.habit?.maintenanceCalories
  );

  useEffect(() => {
    dispatch(fetchHabitSettings());
  }, [dispatch]);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const d = String(date.getDate()).padStart(2, "0");
    const m = date.toLocaleString("default", { month: "short" });
    const y = String(date.getFullYear()).slice(2);
    return `${weekday}, ${d}-${m}-${y}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [data, setData] = useState({
    meals: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [], Other: [] },
    summary: {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalSugar: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isNutrientsModalOpen, setIsNutrientsModalOpen] = useState(false);
  const [isCustomizeCardsOpen, setIsCustomizeCardsOpen] = useState(false);
  const [isCustomizeTableOpen, setIsCustomizeTableOpen] = useState(false);
  const [selectedWikiNutrient, setSelectedWikiNutrient] = useState(null);
  const [selectedFoodItemForModal, setSelectedFoodItemForModal] = useState(null);
  const [activeMealForModal, setActiveMealForModal] = useState("Breakfast");
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);
  const [logToEdit, setLogToEdit] = useState(null);
  const [selectedNutrientsMeal, setSelectedNutrientsMeal] = useState("All");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());

  const MEAL_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Other"];
  const MEAL_ICONS = {
    Breakfast: "🍳",
    Lunch: "🥗",
    Dinner: "🍲",
    Snacks: "🍎",
    Other: "☕",
  };

  const [collapsedMeals, setCollapsedMeals] = useState(() => {
    try {
      const saved = localStorage.getItem("food_tracker_collapsed_meals");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleMealCollapse = (mealType) => {
    setCollapsedMeals((prev) => {
      const updated = { ...prev, [mealType]: !prev[mealType] };
      localStorage.setItem("food_tracker_collapsed_meals", JSON.stringify(updated));
      return updated;
    });
  };

  const areAllMealsCollapsed = MEAL_CATEGORIES.every((m) => collapsedMeals[m]);

  const toggleAllMealsCollapse = () => {
    setCollapsedMeals((prev) => {
      const targetState = !areAllMealsCollapsed;
      const updated = {};
      MEAL_CATEGORIES.forEach((m) => {
        updated[m] = targetState;
      });
      localStorage.setItem("food_tracker_collapsed_meals", JSON.stringify(updated));
      return updated;
    });
  };

  const [tableNutrients, setTableNutrients] = useState(() => {
    try {
      const saved = localStorage.getItem("food_tracker_table_nutrients");
      return saved ? JSON.parse(saved) : ["calories", "protein", "carbohydrates", "fat"];
    } catch (e) {
      return ["calories", "protein", "carbohydrates", "fat"];
    }
  });

  const ALL_CARD_OPTIONS = [
    { id: "calories", label: "Calories", icon: Flame, color: "text-error" },
    { id: "protein", label: "Protein", icon: Dumbbell, color: "text-info" },
    { id: "carbs", label: "Carbs", icon: Wheat, color: "text-warning" },
    { id: "fat", label: "Fats", icon: PieChart, color: "text-success" },
    { id: "fiber", label: "Dietary Fiber", icon: Apple, color: "text-emerald-500" },
    { id: "sugar", label: "Sugar", icon: Sparkles, color: "text-rose-400" },
    { id: "netCarbs", label: "Net Carbs", icon: Activity, color: "text-amber-500" },
    { id: "macroSplit", label: "Macro Split", icon: BarChart3, color: "text-primary" },
  ];

  const [visibleCards, setVisibleCards] = useState(() => {
    try {
      const saved = localStorage.getItem("food_tracker_visible_cards");
      return saved ? JSON.parse(saved) : ["calories", "protein", "carbs", "fat"];
    } catch (e) {
      return ["calories", "protein", "carbs", "fat"];
    }
  });
  const [isCardsExpanded, setIsCardsExpanded] = useState(false);

  const toggleCardVisibility = (cardId) => {
    setVisibleCards((prev) => {
      let updated;
      if (prev.includes(cardId)) {
        if (prev.length <= 1) return prev; // Keep at least 1 card visible
        updated = prev.filter((id) => id !== cardId);
      } else {
        updated = [...prev, cardId];
      }
      localStorage.setItem("food_tracker_visible_cards", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchDailyLogs = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: selectedDate },
      });
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch daily logs", err);
      setError(err.response?.data?.message || "Failed to fetch food logs");
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const [copyingMeal, setCopyingMeal] = useState(null);
  const [mealCategoryToDelete, setMealCategoryToDelete] = useState(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);

  const confirmDeleteMealCategory = async () => {
    if (!mealCategoryToDelete || !selectedDate) return;
    try {
      setDeletingCategoryLoading(true);
      await axiosInstance.delete("/v1/dashboard/habit/food/meal-category", {
        params: { date: selectedDate, mealType: mealCategoryToDelete },
      });
      fetchDailyLogs(false);
    } catch (err) {
      console.error("Failed to clear meal category", err);
    } finally {
      setDeletingCategoryLoading(false);
      setIsDeleteCategoryModalOpen(false);
      setMealCategoryToDelete(null);
    }
  };

  const getPreviousDateStr = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const d = new Date(year, month, day - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const changeSelectedDateByDays = (days) => {
    if (!selectedDate || typeof selectedDate !== "string") return;
    const parts = selectedDate.split("-");
    if (parts.length !== 3) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const d = new Date(year, month, day + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleCopyYesterdayMeal = async (targetMeal) => {
    if (!selectedDate) return;
    const yDate = getPreviousDateStr(selectedDate);

    try {
      setCopyingMeal(targetMeal);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: yDate },
      });
      const yLogs = res.data?.data?.logs || [];
      const mealLogsToCopy = yLogs.filter(
        (l) => l.mealType?.toLowerCase() === targetMeal?.toLowerCase()
      );

      if (mealLogsToCopy.length === 0) {
        alert(`No ${targetMeal} logged yesterday (${yDate}).`);
        return;
      }

      for (const item of mealLogsToCopy) {
        const foodIdToUse = item.foodId?._id || item.foodId;
        await axiosInstance.post("/v1/dashboard/habit/food/log", {
          date: selectedDate,
          mealType: targetMeal,
          foodId: foodIdToUse,
          servings: Number(item.servings || 1),
        });
      }

      fetchDailyLogs(false);
    } catch (err) {
      console.error("Failed to copy yesterday's meal", err);
      alert("Failed to copy yesterday's food logs.");
    } finally {
      setCopyingMeal(null);
    }
  };

  useEffect(() => {
    fetchDailyLogs(true);
  }, [selectedDate]);

  useEffect(() => {
    const handleFoodLogsUpdated = () => {
      fetchDailyLogs(false);
    };
    window.addEventListener("food-logs-updated", handleFoodLogsUpdated);
    return () => {
      window.removeEventListener("food-logs-updated", handleFoodLogsUpdated);
    };
  }, [selectedDate]);

  const openDeletePopup = (log) => {
    setLogToDelete(log);
    setIsDeletePopupOpen(true);
  };

  const confirmDeleteLog = async () => {
    if (!logToDelete) return;
    try {
      await axiosInstance.delete(`/v1/dashboard/habit/food/log/${logToDelete._id}`);
      fetchDailyLogs(false);
    } catch (err) {
      console.error("Failed to delete log entry", err);
    } finally {
      setIsDeletePopupOpen(false);
      setLogToDelete(null);
    }
  };

  const handleUpdateServings = async (log, delta) => {
    const currentServings = log.servings;
    const newServings = parseFloat((currentServings + delta).toFixed(2));
    if (newServings <= 0) {
      openDeletePopup(log);
      return;
    }
    try {
      await axiosInstance.put(`/v1/dashboard/habit/food/log/${log._id}`, {
        servings: newServings,
      });
      fetchDailyLogs(false);
    } catch (err) {
      console.error("Failed to update servings", err);
    }
  };

  const openLogModal = (mealType = "Breakfast") => {
    setActiveMealForModal(mealType);
    setIsLogModalOpen(true);
  };

  const age = habitState.age || 25;
  const gender = habitState.gender || "male";
  const isMale = gender === "male";
  const habitWaterMin = habitState.settings?.water?.min;

  const calorieMin =
    settingsIntake?.min ||
    (reduxMaintenanceCalories ? Math.round(reduxMaintenanceCalories * 0.9) : 1500);
  const calorieMax =
    settingsIntake?.max ||
    (reduxMaintenanceCalories ? Math.round(reduxMaintenanceCalories * 1.1) : 2500);

  const getMacroRatios = () => {
    try {
      const saved = localStorage.getItem("macro_ratios");
      return saved ? JSON.parse(saved) : { protein: 30, carbs: 40, fats: 30 };
    } catch (e) {
      return { protein: 30, carbs: 40, fats: 30 };
    }
  };

  const macroRatios = getMacroRatios();

  const proteinTargetMin = Math.round((calorieMin * (macroRatios.protein / 100)) / 4);
  const proteinTargetMax = Math.round((calorieMax * (macroRatios.protein / 100)) / 4);

  const carbsTargetMin = Math.round((calorieMin * (macroRatios.carbs / 100)) / 4);
  const carbsTargetMax = Math.round((calorieMax * (macroRatios.carbs / 100)) / 4);

  const fatTargetMin = Math.round((calorieMin * (macroRatios.fats / 100)) / 9);
  const fatTargetMax = Math.round((calorieMax * (macroRatios.fats / 100)) / 9);
  const fiberTarget = isMale ? 38 : 25;

  const NUTRIENT_TARGETS = {
    calories: { min: calorieMin, max: calorieMax },
    protein: { min: proteinTargetMin, max: proteinTargetMax },
    carbohydrates: { min: carbsTargetMin, max: carbsTargetMax },
    carbs: { min: carbsTargetMin, max: carbsTargetMax },
    netCarbs: { min: carbsTargetMin, max: carbsTargetMax },
    fat: { min: fatTargetMin, max: fatTargetMax },
    fats: { min: fatTargetMin, max: fatTargetMax },
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

  const caloriePercent = Math.min(
    Math.round((data.summary.totalCalories / calorieMax) * 100),
    100
  );

  return (
    <div className="space-y-4 md:space-y-6 pb-12">
      {/* Mobile / Phone Consolidated Top Sticky Bar (md:hidden) - ZERO gap with navbar */}
      <div className="md:hidden sticky top-0 -mx-2 z-30 bg-base-100 border-b border-base-300 px-3 py-2.5 shadow-xs mb-3">
        {/* Consolidated Tab Switcher on left + Date Navigation & Controls on right */}
        <div className="flex items-center justify-between text-xs gap-1.5">
          {/* Consolidated Mobile Tab Switcher */}
          {onSwitchTab && (
            <div className="flex items-center p-0.5 bg-base-200/90 rounded-xl border border-base-300/80 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => onSwitchTab("habit")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  activeTab === "habit"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/65 hover:text-base-content"
                }`}
              >
                <CalendarDays size={12} className="shrink-0" />
                <span>Habits</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchTab("food")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  activeTab === "food"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "text-base-content/65 hover:text-base-content"
                }`}
              >
                <Utensils size={12} className="shrink-0" />
                <span>Food</span>
              </button>
            </div>
          )}

          {/* Right Controls: Date Dropdown + Prev/Next + Nutrients Icon (NO Today button to avoid screen overflow) */}
          <div className="flex items-center gap-1 shrink-0 min-w-0">

            {/* Center Date Button (Triggers Theme-Matched Calendar Modal) */}
            <button
              type="button"
              onClick={() => {
                const [y, m, d] = (selectedDate || getTodayDate()).split("-").map(Number);
                setCalendarViewDate(new Date(y, m - 1, d || 1));
                setIsCalendarOpen(true);
              }}
              className="px-2 py-1 rounded-xl bg-base-200/80 hover:bg-base-200 border border-base-300/80 flex items-center gap-1 cursor-pointer shadow-2xs shrink-0 select-none active:scale-95"
              title="Open Calendar"
            >
              <Calendar size={11} className="text-primary shrink-0" />
              <span className="font-extrabold text-[11px] truncate max-w-[85px]">
                {formatDate(selectedDate)}
              </span>
              <ChevronDown size={10} className="text-base-content/40 shrink-0" />
            </button>

            {/* Previous Day (<) */}
            <button
              type="button"
              className="btn btn-xs btn-circle btn-ghost h-6 w-6 min-h-0 text-base-content/70 hover:bg-base-200 shrink-0"
              onClick={() => changeSelectedDateByDays(-1)}
              title="Previous Day"
            >
              <ChevronLeft size={13} />
            </button>

            {/* Next Day (>) */}
            <button
              type="button"
              className="btn btn-xs btn-circle btn-ghost h-6 w-6 min-h-0 text-base-content/70 hover:bg-base-200 shrink-0"
              onClick={() => changeSelectedDateByDays(1)}
              title="Next Day"
            >
              <ChevronRight size={13} />
            </button>

            {/* Nutrients Icon Button */}
            <button
              type="button"
              className="btn btn-xs btn-circle btn-ghost h-6 w-6 min-h-0 text-info hover:bg-info/10 shrink-0"
              onClick={() => {
                setSelectedNutrientsMeal("All");
                setIsNutrientsModalOpen(true);
              }}
              title="Daily Nutrients Breakdown"
            >
              <Info size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Top Toolbar (hidden on mobile) */}
      <div className="hidden md:flex sticky top-[46px] z-30 bg-base-200 px-4 sm:px-6 py-3.5 border border-base-300 rounded-2xl shadow-sm flex-wrap justify-between items-center gap-4 transition-all mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/15 text-primary rounded-xl">
            <Utensils size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Food Logging & Daily Tracker</h2>
            <p className="text-xs text-base-content/70">
              Track your daily meals, macros, and maintain your custom food database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Today Button */}
          <button
            type="button"
            className={`btn btn-sm rounded-xl font-bold px-3 transition-all ${
              selectedDate === getTodayDate()
                ? "btn-primary shadow-xs"
                : "btn-ghost border border-base-300 hover:bg-base-300 text-base-content/80"
            }`}
            title="Jump to Today's Food Log"
            onClick={() => setSelectedDate(getTodayDate())}
          >
            Today
          </button>

          {/* Date Selector with Yesterday (<) & Tomorrow (>) Navigation Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost border border-base-300 hover:bg-base-300"
              title="Previous Day (Yesterday)"
              onClick={() => changeSelectedDateByDays(-1)}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                const [y, m, d] = (selectedDate || getTodayDate()).split("-").map(Number);
                setCalendarViewDate(new Date(y, m - 1, d || 1));
                setIsCalendarOpen(true);
              }}
              className="input text-xs w-44 bg-base-100 flex items-center justify-between cursor-pointer px-3 border border-base-300 hover:bg-base-200/50"
              title="Open Calendar"
            >
              <div className="flex items-center min-w-0">
                <Calendar size={14} className="text-primary shrink-0 mr-1.5" />
                <span className="font-medium whitespace-nowrap truncate">{formatDate(selectedDate) || "-- / --- / --"}</span>
              </div>
              <ChevronDown size={12} className="text-base-content/40 shrink-0" />
            </button>

            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost border border-base-300 hover:bg-base-300"
              title="Next Day (Tomorrow)"
              onClick={() => changeSelectedDateByDays(1)}
            >
              <ChevronRight size={16} />
            </button>

            {/* Nutrients Icon Button incorporated with Date */}
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost border border-base-300 hover:bg-base-300 text-info ml-1"
              onClick={() => {
                setSelectedNutrientsMeal("All");
                setIsNutrientsModalOpen(true);
              }}
              title="Daily Nutrients Breakdown"
            >
              <Info size={16} />
            </button>
          </div>
        </div>
      </div>

      {error && !loading && (
        <div className="alert alert-error shadow-lg">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 flex items-center justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
          {/* Phone View: Concentric Circles Nutrient Overview Dashboard (md:hidden) */}
          <div className="md:hidden bg-base-200 border border-base-300 rounded-2xl p-3.5 shadow-sm space-y-3 mb-2">
            <MacroConcentricCircles
              data={data}
              targets={NUTRIENT_TARGETS}
              calorieMax={calorieMax}
              calorieMin={calorieMin}
              habitState={habitState}
              carbs={data.summary.totalCarbs}
              carbsTarget={carbsTargetMax}
              protein={data.summary.totalProtein}
              proteinTarget={proteinTargetMax}
              fat={data.summary.totalFat}
              fatTarget={fatTargetMax}
              fiber={data.summary.totalFiber}
              fiberTarget={fiberTarget}
              calories={data.summary.totalCalories}
            />
          </div>

          {/* Desktop Cards Section (hidden on mobile) */}
          <div className="hidden md:block space-y-4">
            {/* Cards Section Header & Customize/Expand Buttons */}
      {(() => {
        const hasMoreThan8 = visibleCards.length > 8;
        const displayedCards = isCardsExpanded ? visibleCards : visibleCards.slice(0, 8);

        return (
          <>
            <div className="flex justify-between items-center px-1 pt-1">
              <div className="text-xs font-black uppercase tracking-wider text-base-content/80 flex items-center gap-2">
                <span>Daily Nutrition Overview</span>
                <span className="badge badge-sm badge-primary font-bold">{visibleCards.length} Cards</span>
                {hasMoreThan8 && !isCardsExpanded && (
                  <span className="text-[11px] text-base-content/60 font-semibold">(Showing 8)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasMoreThan8 && (
                  <button
                    className="btn btn-sm btn-ghost border border-base-300 gap-1.5 hover:bg-base-300 transition-all rounded-xl shadow-xs"
                    onClick={() => setIsCardsExpanded((prev) => !prev)}
                    title={isCardsExpanded ? "Show fewer cards" : "Show all cards"}
                  >
                    {isCardsExpanded ? (
                      <>
                        <ChevronUp size={16} className="text-primary" />
                        <span>Collapse Cards</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="text-primary" />
                        <span>Expand All ({visibleCards.length})</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  className="btn btn-sm btn-ghost border border-base-300 gap-1.5 hover:bg-base-300 transition-all rounded-xl shadow-xs text-primary"
                  onClick={() => navigate("/dashboard/habit/logging")}
                  title="Configure Macro Ratios in Habit Profile"
                >
                  <PieChart size={14} className="text-info" />
                  <span>Edit Macros (Habit Profile)</span>
                </button>

                <button
                  className="btn btn-sm btn-ghost border border-base-300 gap-1.5 hover:bg-base-300 transition-all rounded-xl shadow-xs text-info"
                  onClick={() => {
                    setSelectedNutrientsMeal("All");
                    setIsNutrientsModalOpen(true);
                  }}
                  title="View All Nutrients Summary"
                >
                  <Info size={15} className="text-info" />
                  <span>All Nutrients</span>
                </button>

                <button
                  className="btn btn-sm btn-ghost border border-base-300 gap-1.5 hover:bg-base-300 transition-all rounded-xl shadow-xs"
                  onClick={() => setIsCustomizeCardsOpen(true)}
                >
                  <SlidersHorizontal size={14} className="text-primary" />
                  <span>Customize Cards</span>
                </button>
              </div>
            </div>

            {/* Dynamic Categorized Daily Nutrition Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedCards.map((cardId) => {
          // Special case 1: Calories Card
          if (cardId === "calories") {
            const calPercent = Math.min(
              Math.round((data.summary.totalCalories / calorieMax) * 100),
              100
            );
            const calRawPercent = Math.round((data.summary.totalCalories / calorieMax) * 100);
            const minPosPercent = Math.min(
              Math.round((calorieMin / calorieMax) * 100),
              100
            );

            return (
              <div key="calories" className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1">
                    <Flame size={16} className="text-error" /> Calories
                  </span>
                  <span className="text-xs text-base-content/60 font-semibold">
                    Min: {calorieMin} | Max: {calorieMax} kcal
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-primary">
                      {data.summary.totalCalories}
                    </span>
                    <span className="text-xs font-medium text-base-content/70">/ {calorieMax} kcal</span>
                  </div>
                  <span className="text-xs font-bold text-primary">{calRawPercent}%</span>
                </div>
                <div>
                  <div className="relative w-full bg-base-100 rounded-full h-2 mt-2 overflow-hidden border border-base-300">
                    <div
                      className={`h-full transition-all duration-500 ${
                        data.summary.totalCalories > calorieMax ? "bg-error" : "bg-primary"
                      }`}
                      style={{ width: `${calPercent}%` }}
                    ></div>
                    {/* Minimum Target Marker Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-warning z-10"
                      style={{ left: `${minPosPercent}%` }}
                      title={`Minimum Target: ${calorieMin} kcal`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-base-content/60 mt-1 font-semibold">
                    <span className="text-warning">Min: {calorieMin} kcal</span>
                    <span>Max: {calorieMax} kcal</span>
                  </div>
                </div>
              </div>
            );
          }

          // Special case 2: Macro Concentric Rings & Split Card
          if (cardId === "macroSplit") {
            return (
              <div key="macroSplit" className="bg-base-200 p-4 sm:p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart size={16} className="text-primary" /> Nutrient Concentric Rings
                  </span>
                  <button
                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    onClick={() => navigate("/dashboard/habit/logging")}
                    title="Edit in Habit Profile"
                  >
                    <Settings size={12} /> Edit
                  </button>
                </div>

                <MacroConcentricCircles
                  data={data}
                  targets={NUTRIENT_TARGETS}
                  calorieMax={calorieMax}
                  calorieMin={calorieMin}
                  habitState={habitState}
                  carbs={data.summary.totalCarbs}
                  carbsTarget={carbsTargetMax}
                  protein={data.summary.totalProtein}
                  proteinTarget={proteinTargetMax}
                  fat={data.summary.totalFat}
                  fatTarget={fatTargetMax}
                  fiber={data.summary.totalFiber}
                  fiberTarget={fiberTarget}
                  calories={data.summary.totalCalories}
                  className="my-1"
                />

                <div className="flex items-center justify-between text-[10px] font-semibold text-base-content/60 pt-2 border-t border-base-300 mt-2">
                  <span>Target: P:{macroRatios.protein}% • C:{macroRatios.carbs}% • F:{macroRatios.fats}%</span>
                  <button
                    type="button"
                    className="text-primary hover:underline font-bold"
                    onClick={() => navigate("/dashboard/habit/logging")}
                  >
                    Configure
                  </button>
                </div>
              </div>
            );
          }

          // Lookup definition from categories
          let nDef = null;
          for (const cat of Object.values(NUTRIENT_CATEGORIES)) {
            const found = cat.find((item) => item.id === cardId);
            if (found) {
              nDef = found;
              break;
            }
          }

          if (!nDef) return null;
          const Icon = nDef.icon;

          // Helper to get nutrient total
          const allLoggedItems = Object.values(data.meals || {}).flat();
          let totalVal = 0;
          allLoggedItems.forEach((log) => {
            const servings = log.servings || 1;
            const foodObj = log.foodId || log;
            const isFromLog = log[cardId] !== undefined;
            let val = isFromLog ? log[cardId] : (foodObj ? foodObj[cardId] : 0);

            if (cardId === "netCarbs") {
              const carbs = log.carbohydrates !== undefined ? log.carbohydrates : (foodObj?.carbohydrates || 0);
              const fiber = log.fiber !== undefined ? log.fiber : (foodObj?.fiber || 0);
              totalVal += Math.max(0, carbs - fiber);
            } else if (cardId === "carbohydrates" || cardId === "carbs") {
              totalVal += log.carbohydrates !== undefined ? log.carbohydrates : (foodObj?.carbohydrates || 0);
            } else if (cardId === "fat") {
              totalVal += log.fat !== undefined ? log.fat : (foodObj?.fat || 0);
            } else if (cardId === "protein") {
              totalVal += log.protein !== undefined ? log.protein : (foodObj?.protein || 0);
            } else if (cardId === "fiber") {
              totalVal += log.fiber !== undefined ? log.fiber : (foodObj?.fiber || 0);
            } else if (cardId === "sugar") {
              totalVal += log.sugar !== undefined ? log.sugar : (foodObj?.sugar || 0);
            } else if (typeof val === "number") {
              totalVal += isFromLog ? val : val * servings;
            } else {
              const num = parseFloat(String(val).replace(/[^0-9.]/g, ""));
              if (!isNaN(num)) totalVal += num * (isFromLog ? 1 : servings);
            }
          });

          const formattedVal = (cardId === "water") ? Math.round(totalVal) : parseFloat(totalVal.toFixed(1));
          const rawTargetObj = NUTRIENT_TARGETS[cardId];
          const hasMinMaxTarget = typeof rawTargetObj === "object" && rawTargetObj !== null && rawTargetObj.min !== undefined;

          if (hasMinMaxTarget) {
            const minVal = rawTargetObj.min;
            const maxVal = rawTargetObj.max;
            const rawPercent = Math.round((formattedVal / maxVal) * 100);
            const percent = Math.min(rawPercent, 100);
            const minPosPercent = Math.min(Math.round((minVal / maxVal) * 100), 100);

            return (
              <div key={cardId} className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1">
                    <Icon size={16} className={nDef.color} /> {nDef.label}
                  </span>
                  <span className="text-xs text-base-content/60 font-semibold">
                    Min: {minVal} | Max: {maxVal} {nDef.unit || ""}
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-1">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-extrabold ${nDef.color}`}>
                      {formattedVal}
                    </span>
                    <span className="text-xs font-medium text-base-content/70">
                      / {maxVal} {nDef.unit || ""}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${nDef.color}`}>
                    {rawPercent}%
                  </span>
                </div>
                <div>
                  <div className="relative w-full bg-base-100 rounded-full h-2 mt-2 overflow-hidden border border-base-300">
                    <div
                      className={`h-full transition-all duration-500 ${
                        formattedVal > maxVal ? "bg-error" : "bg-primary"
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                    {/* Minimum Target Marker Line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-warning z-10"
                      style={{ left: `${minPosPercent}%` }}
                      title={`Minimum Target: ${minVal} ${nDef.unit || ""}`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-base-content/60 mt-1 font-semibold">
                    <span className="text-warning">Min: {minVal} {nDef.unit || ""}</span>
                    <span>Max: {maxVal} {nDef.unit || ""}</span>
                  </div>
                </div>
              </div>
            );
          }

          const targetVal = typeof rawTargetObj === "number" ? rawTargetObj : 0;
          const percent = targetVal > 0 ? Math.min(Math.round((formattedVal / targetVal) * 100), 100) : 0;
          const rawPercent = targetVal > 0 ? Math.round((formattedVal / targetVal) * 100) : 0;

          return (
            <div key={cardId} className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1">
                  <Icon size={16} className={nDef.color} /> {nDef.label}
                </span>
                {targetVal > 0 && (
                  <span className="text-xs text-base-content/60 font-semibold">
                    Target: {targetVal} {nDef.unit || ""}
                  </span>
                )}
              </div>
              <div className="flex items-baseline justify-between my-1">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold ${nDef.color}`}>
                    {formattedVal}
                  </span>
                  {targetVal > 0 ? (
                    <span className="text-xs font-medium text-base-content/70">
                      / {targetVal} {nDef.unit || ""}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-base-content/70">{nDef.unit || ""}</span>
                  )}
                </div>
                {targetVal > 0 && (
                  <span className={`text-xs font-bold ${nDef.color}`}>
                    {rawPercent}%
                  </span>
                )}
              </div>
              {targetVal > 0 ? (
                <div className="w-full bg-base-100 rounded-full h-2 mt-2 overflow-hidden border border-base-300">
                  <div
                    className={`h-full transition-all duration-500 ${
                      rawPercent > 100 ? "bg-error" : "bg-primary"
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              ) : (
                <p className="text-xs text-base-content/60 mt-2 capitalize">
                  Daily total ({nDef.label})
                </p>
              )}
            </div>
          );
            })}
            </div>

            {/* Bottom Expand/Collapse Bar if > 8 Cards */}
            {hasMoreThan8 && (
              <div className="flex justify-center -mt-1 mb-1">
                <button
                  className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-xl transition-all shadow-xs"
                  onClick={() => setIsCardsExpanded((prev) => !prev)}
                >
                  {isCardsExpanded ? (
                    <>
                      <ChevronUp size={16} />
                      <span>Show Less (Top 8 Cards)</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      <span>Expand All {visibleCards.length} Cards</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        );
      })()}
          </div>

      {/* Desktop Meal Category Breakdown Sections (hidden on mobile) */}
      <div className="hidden md:block space-y-4">
        <div className="flex flex-wrap justify-between items-center bg-base-200/80 px-4 py-3 rounded-2xl border border-base-300 shadow-xs gap-2">
          <div className="flex items-center gap-2">
            <Utensils size={18} className="text-primary" />
            <h2 className="font-bold text-sm sm:text-base">Logged Food Items</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-xl transition-all shadow-xs"
              onClick={toggleAllMealsCollapse}
              title={areAllMealsCollapsed ? "Expand all meal categories" : "Collapse all meal categories"}
            >
              {areAllMealsCollapsed ? (
                <>
                  <ChevronDown size={14} />
                  <span>Expand All Categories</span>
                </>
              ) : (
                <>
                  <ChevronUp size={14} />
                  <span>Collapse All Categories</span>
                </>
              )}
            </button>
            <button
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-xl transition-all shadow-xs"
              onClick={() => setIsCustomizeTableOpen(true)}
            >
              <SlidersHorizontal size={14} />
              <span>Table Columns ({tableNutrients.length}/5)</span>
            </button>
          </div>
        </div>

        {MEAL_CATEGORIES.map((mealType) => {
          const mealLogs = data.meals[mealType] || [];
          const mealCalories = mealLogs.reduce((sum, item) => sum + item.calories, 0);
          const isCollapsed = !!collapsedMeals[mealType];

          return (
            <div
              key={mealType}
              className="bg-base-200 rounded-2xl border border-base-300 shadow-sm overflow-hidden transition-all duration-200"
            >
              {/* Meal Header (Clickable to Collapse/Expand) */}
              <div
                className={`p-4 bg-base-300/60 flex justify-between items-center cursor-pointer select-none hover:bg-base-300/90 transition-colors ${
                  !isCollapsed ? "border-b border-base-300" : ""
                }`}
                onClick={() => toggleMealCollapse(mealType)}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    className="btn btn-xs btn-circle btn-ghost text-primary hover:bg-base-100 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMealCollapse(mealType);
                    }}
                    title={isCollapsed ? "Expand Category" : "Collapse Category"}
                  >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <span className="text-xl select-none leading-none">{MEAL_ICONS[mealType] || "🍴"}</span>
                  <h3 className="font-bold text-base text-base-content">
                    {mealType}
                  </h3>
                  <span className="badge badge-neutral badge-sm font-semibold">
                    {mealCalories} kcal
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle text-info hover:bg-info/10 p-0.5"
                    title={`View ${mealType} nutrients`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNutrientsMeal(mealType);
                      setIsNutrientsModalOpen(true);
                    }}
                  >
                    <Info size={15} />
                  </button>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {mealLogs.length > 0 && (
                    <button
                      className="btn btn-xs btn-ghost text-error hover:bg-error/10 border border-error/20 gap-1 text-xs font-semibold"
                      title={`Delete all ${mealType} items at once`}
                      onClick={() => {
                        setMealCategoryToDelete(mealType);
                        setIsDeleteCategoryModalOpen(true);
                      }}
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Clear {mealType}</span>
                    </button>
                  )}

                  <button
                    className="btn btn-xs btn-neutral btn-ghost border border-base-300 gap-1 text-xs"
                    title={`Copy all ${mealType} items from yesterday`}
                    disabled={copyingMeal === mealType}
                    onClick={() => handleCopyYesterdayMeal(mealType)}
                  >
                    {copyingMeal === mealType ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <History size={13} className="text-secondary" />
                    )}
                    <span className="hidden sm:inline">From Yesterday</span>
                  </button>

                  <button
                    className="btn btn-xs btn-primary btn-soft gap-1"
                    onClick={() => openLogModal(mealType)}
                  >
                    <Plus size={14} /> Add Food
                  </button>
                </div>
              </div>

              {/* Meal Logs Table */}
              {!isCollapsed && (
                <div className="p-4 animate-in fade-in duration-200">
                  {mealLogs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-base-content/50 border border-dashed border-base-300 rounded-xl">
                      No foods logged for {mealType} on this date.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full">
                        <thead>
                          <tr className="text-xs text-base-content/60 border-b border-base-300">
                            <th className="text-left">Food Item</th>
                            <th className="text-center">Servings</th>
                            {tableNutrients.slice(0, 5).map((nutId) => (
                              <th key={nutId} className="text-right whitespace-nowrap">
                                {getNutrientMeta(nutId).label}
                              </th>
                            ))}
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mealLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-base-100/50">
                              <td className="truncate max-w-[180px]">
                                <div className="font-semibold text-sm truncate" title={log.foodName}>{log.foodName}</div>
                                <div className="text-[11px] text-base-content/60 truncate">
                                  {formatServingCalc(log)}
                                </div>
                              </td>
                              <td className="text-center whitespace-nowrap">
                                <div className="inline-flex join join-horizontal border border-base-300 rounded-lg overflow-hidden">
                                  <button
                                    className="join-item btn btn-xs btn-ghost px-2"
                                    onClick={() => handleUpdateServings(log, -0.25)}
                                  >
                                    -
                                  </button>
                                  <span className="join-item px-2 py-0.5 text-xs font-bold bg-base-100 flex items-center">
                                    {log.servings}
                                  </span>
                                  <button
                                    className="join-item btn btn-xs btn-ghost px-2"
                                    onClick={() => handleUpdateServings(log, 0.25)}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              {tableNutrients.slice(0, 5).map((nutId) => (
                                <td
                                  key={nutId}
                                  className={`text-right text-xs whitespace-nowrap ${
                                    nutId === "calories" ? "font-bold text-primary text-sm" : "font-medium"
                                  }`}
                                >
                                  {getNutrientLogVal(log, nutId)}
                                </td>
                              ))}
                              <td className="text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    className="btn btn-ghost btn-xs text-info hover:bg-info/10 p-1"
                                    title="View Full Nutrition Details"
                                    onClick={() => setSelectedFoodItemForModal(log)}
                                  >
                                    <Info size={15} />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs text-warning hover:bg-warning/10 p-1"
                                    title="Edit Meal Category or Quantity"
                                    onClick={() => setLogToEdit(log)}
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs text-error hover:bg-error/10 p-1"
                                    title="Delete Item"
                                    onClick={() => openDeletePopup(log)}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-primary/40 bg-base-300/80">
                          <tr className="text-xs">
                            <td className="text-left py-3">
                              <span className="badge badge-primary badge-sm font-black tracking-wider uppercase px-2 py-1 shadow-xs">
                                TOTAL ({mealType})
                              </span>
                            </td>
                            <td className="text-center font-bold text-xs text-base-content/70">
                              <span className="badge badge-ghost badge-xs font-semibold">
                                {mealCalories} kcal
                              </span>
                            </td>
                            {tableNutrients.slice(0, 5).map((nutId) => (
                              <td
                                key={nutId}
                                className={`text-right whitespace-nowrap py-3 ${
                                  nutId === "calories"
                                    ? "font-black text-primary text-sm tracking-tight"
                                    : "font-extrabold text-base-content"
                                }`}
                              >
                                {getMealTotalNutrientVal(mealLogs, nutId)}
                              </td>
                            ))}
                            <td className="text-center text-base-content/40">-</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phone View: Meal Category Breakdown Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {MEAL_CATEGORIES.map((mealType) => {
          const mealLogs = data.meals[mealType] || [];
          const mealCalories = mealLogs.reduce((sum, item) => sum + item.calories, 0);
          const isCollapsed = !!collapsedMeals[mealType];

          return (
            <div
              key={`phone-${mealType}`}
              className="bg-base-200 rounded-2xl border border-base-300 shadow-sm overflow-hidden transition-all"
            >
              {/* Meal Header */}
              <div
                className="p-3 bg-base-300/60 flex items-center justify-between cursor-pointer select-none hover:bg-base-300/80 transition-colors"
                onClick={() => toggleMealCollapse(mealType)}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base select-none leading-none shrink-0">{MEAL_ICONS[mealType] || "🍴"}</span>
                  <h3 className="font-bold text-xs text-base-content truncate">{mealType}</h3>
                  <span className="badge badge-neutral badge-xs font-bold text-[9.5px] shrink-0">
                    {mealCalories} kcal
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle text-info hover:bg-info/10 p-0.5 shrink-0"
                    title={`View ${mealType} nutrients`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNutrientsMeal(mealType);
                      setIsNutrientsModalOpen(true);
                    }}
                  >
                    <Info size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Quick Add Button */}
                  <button
                    type="button"
                    className="btn btn-xs btn-primary btn-soft font-bold gap-0.5 px-2"
                    onClick={() => openLogModal(mealType)}
                  >
                    <Plus size={12} /> Add
                  </button>

                  {/* Smart Copy From Yesterday */}
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost btn-circle text-base-content/60 hover:text-base-content"
                    title={`Copy ${mealType} from yesterday`}
                    disabled={copyingMeal === mealType}
                    onClick={() => handleCopyYesterdayMeal(mealType)}
                  >
                    {copyingMeal === mealType ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <History size={13} />
                    )}
                  </button>

                  {/* Clear Meal if items exist */}
                  {mealLogs.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost btn-circle text-error/70 hover:text-error"
                      title={`Clear ${mealType}`}
                      onClick={() => {
                        setMealCategoryToDelete(mealType);
                        setIsDeleteCategoryModalOpen(true);
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  {/* Collapse / Expand Chevron */}
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost btn-circle text-base-content/50"
                    onClick={() => toggleMealCollapse(mealType)}
                  >
                    {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Meal Body (Items list) */}
              {!isCollapsed && (
                <div className="p-3 space-y-2 border-t border-base-200/70">
                  {mealLogs.length === 0 ? (
                    <div className="py-4 px-3 text-center border border-dashed border-base-300 rounded-xl bg-base-100/60 space-y-2">
                      <p className="text-xs text-base-content/50 font-medium">
                        No {mealType.toLowerCase()} logged for this date.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="btn btn-xs btn-primary btn-soft font-bold gap-1"
                          onClick={() => openLogModal(mealType)}
                        >
                          <Plus size={13} /> Log {mealType}
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost border border-base-300 text-xs font-medium gap-1"
                          disabled={copyingMeal === mealType}
                          onClick={() => handleCopyYesterdayMeal(mealType)}
                        >
                          <History size={12} /> From Yesterday
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {mealLogs.map((log) => (
                          <div
                            key={log._id}
                            className="bg-base-100/90 hover:bg-base-100 border border-base-300/80 rounded-xl p-2.5 space-y-1.5 transition-colors shadow-2xs"
                          >
                            {/* Row 1: Food Title & Calories */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-base-content truncate" title={log.foodName}>
                                  {log.foodName}
                                </div>
                                <div className="text-[10.5px] text-base-content/60 font-medium truncate mt-0.5">
                                  {formatServingCalc(log)}
                                </div>
                              </div>
                              <span className="badge badge-primary badge-sm font-bold shrink-0">
                                {log.calories || 0} kcal
                              </span>
                            </div>

                            {/* Row 2: Macros Chips & Interactive Controls */}
                            <div className="flex items-center justify-between pt-1 border-t border-base-200/70">
                              {/* Macro badges */}
                              <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                                <span className="text-info font-bold">P: {log.protein || 0}g</span>
                                <span className="text-base-content/30">•</span>
                                <span className="text-warning font-bold">C: {log.carbohydrates !== undefined ? log.carbohydrates : (log.carbs || 0)}g</span>
                                <span className="text-base-content/30">•</span>
                                <span className="text-success font-bold">F: {log.fat || 0}g</span>
                              </div>

                              {/* Servings Stepper & Item Actions */}
                              <div className="flex items-center gap-2">
                                {/* Stepper */}
                                <div className="inline-flex join join-horizontal border border-base-300/80 rounded-lg overflow-hidden scale-90 -mr-1">
                                  <button
                                    type="button"
                                    className="join-item btn btn-xs btn-ghost px-1.5 hover:bg-base-200"
                                    onClick={() => handleUpdateServings(log, -0.25)}
                                  >
                                    -
                                  </button>
                                  <span className="join-item px-1.5 py-0.5 text-xs font-bold bg-base-100 flex items-center min-w-[24px] justify-center">
                                    {log.servings}
                                  </span>
                                  <button
                                    type="button"
                                    className="join-item btn btn-xs btn-ghost px-1.5 hover:bg-base-200"
                                    onClick={() => handleUpdateServings(log, 0.25)}
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Actions: Info, Edit, Delete */}
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-info p-1 hover:bg-info/10"
                                    title="Nutrient details"
                                    onClick={() => setSelectedFoodItemForModal(log)}
                                  >
                                    <Info size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-warning p-1 hover:bg-warning/10"
                                    title="Edit item"
                                    onClick={() => setLogToEdit(log)}
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-error p-1 hover:bg-error/10"
                                    title="Delete item"
                                    onClick={() => openDeletePopup(log)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Phone View Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => openLogModal("Breakfast")}
          className="btn btn-circle btn-primary btn-md shadow-2xl flex items-center justify-center border-2 border-primary-content/20 active:scale-95"
          title="Quick Log Food"
        >
          <Plus size={22} />
        </button>
      </div>
    </>
  )}

      {/* Modals */}
      <CustomizeTableColumnsModal
        isOpen={isCustomizeTableOpen}
        onClose={() => setIsCustomizeTableOpen(false)}
        tableNutrients={tableNutrients}
        setTableNutrients={setTableNutrients}
      />
      <FoodItemNutrientsModal
        isOpen={!!selectedFoodItemForModal}
        onClose={() => setSelectedFoodItemForModal(null)}
        foodItem={selectedFoodItemForModal}
      />

      <EditFoodLogModal
        isOpen={!!logToEdit}
        onClose={() => setLogToEdit(null)}
        log={logToEdit}
        onLogUpdated={fetchDailyLogs}
      />

      <CustomizeCardsModal
        isOpen={isCustomizeCardsOpen}
        onClose={() => setIsCustomizeCardsOpen(false)}
        visibleCards={visibleCards}
        toggleCardVisibility={toggleCardVisibility}
        setVisibleCards={setVisibleCards}
      />

      <DailyNutrientsModal
        isOpen={isNutrientsModalOpen}
        onClose={() => setIsNutrientsModalOpen(false)}
        selectedDate={selectedDate}
        data={data}
        calorieTarget={calorieMax}
        initialMeal={selectedNutrientsMeal}
      />

      <LogFoodModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        selectedDate={selectedDate}
        initialMeal={activeMealForModal}
        onFoodLogged={fetchDailyLogs}
        onOpenCustomFoodModal={() => setIsCustomModalOpen(true)}
      />

      <AddCustomFoodModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onFoodAdded={() => {
          fetchDailyLogs();
          setIsLogModalOpen(true);
        }}
      />

      <DeleteFoodLogPopUp
        isOpen={isDeletePopupOpen}
        onClose={() => {
          setIsDeletePopupOpen(false);
          setLogToDelete(null);
        }}
        onConfirm={confirmDeleteLog}
        foodName={logToDelete?.foodName}
      />

      <NutrientWikiModal
        isOpen={!!selectedWikiNutrient}
        onClose={() => setSelectedWikiNutrient(null)}
        nutrient={selectedWikiNutrient}
      />

      {/* Delete Entire Meal Category Confirmation Modal (Double Sure Popup) */}
      {isDeleteCategoryModalOpen && mealCategoryToDelete && (() => {
        const categoryLogs = data.meals[mealCategoryToDelete] || [];
        const categoryCalories = categoryLogs.reduce((sum, item) => sum + item.calories, 0);

        return (
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
            <div className="bg-base-200 rounded-3xl max-w-md w-full h-[280px] p-6 border border-base-300 shadow-2xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center gap-3 text-error">
                <div className="p-3 bg-error/10 rounded-2xl">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg leading-tight">Clear All {mealCategoryToDelete}?</h3>
                  <p className="text-xs text-base-content/60 mt-0.5">Are you double sure about this action?</p>
                </div>
              </div>

              <div className="bg-base-100 p-4 rounded-2xl border border-base-300 text-xs space-y-2">
                <p className="text-base-content/80">
                  This will permanently remove <strong>all {categoryLogs.length} logged item(s)</strong> under{" "}
                  <span className="badge badge-error badge-sm font-bold text-white">{mealCategoryToDelete}</span> for{" "}
                  <strong>{selectedDate}</strong>.
                </p>

                <div className="pt-2 border-t border-base-200 flex justify-between items-center text-xs font-semibold">
                  <span className="text-base-content/60">Total Calories to Clear:</span>
                  <span className="text-error font-bold font-mono text-sm">{categoryCalories} kcal</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  className="btn btn-sm btn-ghost flex-1 font-semibold"
                  disabled={deletingCategoryLoading}
                  onClick={() => {
                    setIsDeleteCategoryModalOpen(false);
                    setMealCategoryToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-error text-white flex-1 font-bold gap-1.5 shadow-sm"
                  disabled={deletingCategoryLoading}
                  onClick={confirmDeleteMealCategory}
                >
                  {deletingCategoryLoading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <>
                      <Trash2 size={16} /> Yes, Delete All {mealCategoryToDelete}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Theme-Matched Calendar Modal (Exact same design and behavior as Habit Date Popup) */}
      {isCalendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="bg-base-100 border border-base-300/80 rounded-3xl p-4 shadow-2xl w-full max-w-[340px] space-y-3.5 transition-all text-base-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                  <Calendar size={16} />
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-base-content">
                    Jump to Date
                  </h3>
                  <p className="text-[10px] text-base-content/60 font-medium">
                    Select any day to view or edit food logs
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-base-content hover:bg-base-200"
                title="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Month & Year Navigation and Days Grid */}
            {(() => {
              const viewYear = calendarViewDate.getFullYear();
              const viewMonth = calendarViewDate.getMonth();
              const monthName = calendarViewDate.toLocaleDateString("en-US", { month: "long" });

              const handlePrevMonth = () => {
                setCalendarViewDate(new Date(viewYear, viewMonth - 1, 1));
              };

              const handleNextMonth = () => {
                setCalendarViewDate(new Date(viewYear, viewMonth + 1, 1));
              };

              // 0=Sun, 1=Mon, ..., 6=Sat
              const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
              const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
              const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

              const formatCellDate = (y, m, d) => {
                const mm = String(m + 1).padStart(2, "0");
                const dd = String(d).padStart(2, "0");
                return `${y}-${mm}-${dd}`;
              };

              const cells = [];

              // Leading days from previous month
              for (let i = firstDayIndex - 1; i >= 0; i--) {
                const dayNum = daysInPrevMonth - i;
                const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
                const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
                cells.push({
                  dayNum,
                  dateStr: formatCellDate(prevY, prevM, dayNum),
                  isCurrentMonth: false,
                });
              }

              // Days of current month
              for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                cells.push({
                  dayNum,
                  dateStr: formatCellDate(viewYear, viewMonth, dayNum),
                  isCurrentMonth: true,
                });
              }

              // Trailing days from next month to fill grid
              const remaining = (7 - (cells.length % 7)) % 7;
              for (let dayNum = 1; dayNum <= remaining; dayNum++) {
                const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
                const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
                cells.push({
                  dayNum,
                  dateStr: formatCellDate(nextY, nextM, dayNum),
                  isCurrentMonth: false,
                });
              }

              const todayStr = getTodayDate();

              return (
                <>
                  {/* Month navigation */}
                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="btn btn-ghost btn-circle btn-xs hover:bg-base-200 text-base-content/80"
                      title="Previous Month"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="text-center">
                      <span className="font-extrabold text-sm text-base-content tracking-tight">
                        {monthName} {viewYear}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="btn btn-ghost btn-circle btn-xs hover:bg-base-200 text-base-content/80"
                      title="Next Month"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Weekdays */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-base-content/40 tracking-wider">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((cell) => {
                      const isSelected = cell.dateStr === selectedDate;
                      const isToday = cell.dateStr === todayStr;

                      return (
                        <button
                          key={cell.dateStr}
                          type="button"
                          onClick={() => {
                            setSelectedDate(cell.dateStr);
                            setIsCalendarOpen(false);
                          }}
                          className={`relative h-10 w-full flex flex-col items-center justify-center rounded-xl text-xs transition-all cursor-pointer select-none active:scale-90 ${
                            isSelected
                              ? "bg-primary text-primary-content font-black shadow-md scale-105"
                              : isToday
                              ? "border-2 border-primary text-primary font-black bg-primary/5 hover:bg-primary/10"
                              : cell.isCurrentMonth
                              ? "text-base-content hover:bg-base-200 hover:text-primary font-semibold"
                              : "text-base-content/30 opacity-40 hover:bg-base-200/50 hover:opacity-100 font-normal"
                          }`}
                        >
                          <span>{cell.dayNum}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-base-200 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const today = getTodayDate();
                        setSelectedDate(today);
                        setCalendarViewDate(new Date());
                        setIsCalendarOpen(false);
                      }}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-xl transition-all active:scale-95 border border-primary/20"
                    >
                      <RotateCcw size={11} /> Today
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="btn btn-ghost btn-xs text-base-content/70 hover:bg-base-200 rounded-xl"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodLoggingTab;
