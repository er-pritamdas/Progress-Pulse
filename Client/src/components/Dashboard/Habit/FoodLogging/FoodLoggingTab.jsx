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
import { fetchHabitSettings } from "../../../../services/redux/slice/habitSlice";
import {
  Utensils,
  Plus,
  PlusCircle,
  Edit3,
  Trash2,
  Calendar,
  Flame,
  Dumbbell,
  Wheat,
  PieChart,
  RefreshCw,
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

function FoodLoggingTab() {
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
    const d = String(date.getDate()).padStart(2, "0");
    const m = date.toLocaleString("default", { month: "short" });
    const y = String(date.getFullYear()).slice(2);
    return `${d}-${m}-${y}`;
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

  const [loading, setLoading] = useState(false);
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
  const [isCardsExpanded, setIsCardsExpanded] = useState(false);

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

  const fetchDailyLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: selectedDate },
      });
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch daily logs", err);
    } finally {
      setLoading(false);
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
      fetchDailyLogs();
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

      fetchDailyLogs();
    } catch (err) {
      console.error("Failed to copy yesterday's meal", err);
      alert("Failed to copy yesterday's food logs.");
    } finally {
      setCopyingMeal(null);
    }
  };

  useEffect(() => {
    fetchDailyLogs();
  }, [selectedDate]);

  const openDeletePopup = (log) => {
    setLogToDelete(log);
    setIsDeletePopupOpen(true);
  };

  const confirmDeleteLog = async () => {
    if (!logToDelete) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/v1/dashboard/habit/food/log/${logToDelete._id}`);
      fetchDailyLogs();
    } catch (err) {
      console.error("Failed to delete log entry", err);
    } finally {
      setLoading(false);
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
      setLoading(true);
      await axiosInstance.put(`/v1/dashboard/habit/food/log/${log._id}`, {
        servings: newServings,
      });
      fetchDailyLogs();
    } catch (err) {
      console.error("Failed to update servings", err);
    } finally {
      setLoading(false);
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

    // Trace Minerals
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
    <div className="space-y-6 pb-12">
      {/* Sticky Top Toolbar */}
      <div className="sticky -top-4 z-40 bg-base-200 -mt-4 -mx-4 px-4 sm:px-6 py-3.5 border-b border-base-300 shadow-md flex flex-wrap justify-between items-center gap-4 transition-all">
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

        <div className="flex items-center gap-3 flex-wrap">
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

            <div className="dropdown dropdown-end floating-label">
              <div
                tabIndex={0}
                role="button"
                className="input text-xs w-28 bg-base-100 flex items-center justify-between cursor-pointer"
              >
                <Calendar size={14} className="text-primary mr-1" />
                <span className="font-medium">{formatDate(selectedDate) || "-- / --- / --"}</span>
              </div>
              <span>Select Date</span>
              <div className="dropdown-content z-[999] bg-base-100 rounded-box shadow-xl p-2 mt-1 border border-base-300">
                <calendar-date
                  class="cally"
                  value={selectedDate}
                  onchange={(e) => setSelectedDate(e.target.value)}
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

            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost border border-base-300 hover:bg-base-300"
              title="Next Day (Tomorrow)"
              onClick={() => changeSelectedDateByDays(1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* All Nutrients Modal Button */}
          <button
            className="btn btn-sm btn-info gap-1"
            onClick={() => setIsNutrientsModalOpen(true)}
          >
            <BarChart3 size={16} /> All Nutrients
          </button>

          <button
            className="btn btn-sm btn-ghost border border-base-300"
            onClick={fetchDailyLogs}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            className="btn btn-sm btn-secondary gap-1"
            onClick={() => setIsCustomModalOpen(true)}
          >
            <PlusCircle size={16} /> Add Custom Food
          </button>

          <button
            className="btn btn-sm btn-primary gap-1"
            onClick={() => openLogModal("Breakfast")}
          >
            <Plus size={16} /> Log Food
          </button>
        </div>
      </div>

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

          // Special case 2: Macro Split Card
          if (cardId === "macroSplit") {
            return (
              <div key="macroSplit" className="bg-base-200 p-5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1">
                    <BarChart3 size={16} className="text-primary" /> Macro Split Ratio
                  </span>
                  <button
                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    onClick={() => navigate("/dashboard/habit/logging")}
                    title="Edit in Habit Profile"
                  >
                    <Settings size={12} /> Edit
                  </button>
                </div>

                {/* Multi-segment Ratio Bar */}
                <div className="h-3 w-full bg-base-100 rounded-full flex overflow-hidden border border-base-300 my-2">
                  <div style={{ width: `${macroRatios.protein}%` }} className="bg-info h-full transition-all" title={`Protein ${macroRatios.protein}%`}></div>
                  <div style={{ width: `${macroRatios.carbs}%` }} className="bg-warning h-full transition-all" title={`Carbs ${macroRatios.carbs}%`}></div>
                  <div style={{ width: `${macroRatios.fats}%` }} className="bg-success h-full transition-all" title={`Fat ${macroRatios.fats}%`}></div>
                </div>

                {/* Target Breakdown Grid */}
                <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold text-center my-1">
                  <div className="bg-info/10 text-info p-1.5 rounded-xl border border-info/20">
                    <span className="block text-[10px] opacity-70 uppercase font-bold">Protein</span>
                    <span>{macroRatios.protein}% ({proteinTargetMin}g–{proteinTargetMax}g)</span>
                  </div>
                  <div className="bg-warning/10 text-warning p-1.5 rounded-xl border border-warning/20">
                    <span className="block text-[10px] opacity-70 uppercase font-bold">Carbs</span>
                    <span>{macroRatios.carbs}% ({carbsTargetMin}g–{carbsTargetMax}g)</span>
                  </div>
                  <div className="bg-success/10 text-success p-1.5 rounded-xl border border-success/20">
                    <span className="block text-[10px] opacity-70 uppercase font-bold">Fats</span>
                    <span>{macroRatios.fats}% ({fatTargetMin}g–{fatTargetMax}g)</span>
                  </div>
                </div>

                <button
                  className="btn btn-xs btn-soft btn-primary mt-2 w-full flex items-center justify-center gap-1 rounded-xl"
                  onClick={() => navigate("/dashboard/habit/logging")}
                >
                  <ExternalLink size={12} /> Edit Ratios in Habit Profile
                </button>
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

      {/* Meal Category Breakdown Sections */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-base-200/80 px-4 py-3 rounded-2xl border border-base-300 shadow-xs">
          <div className="flex items-center gap-2">
            <Utensils size={18} className="text-primary" />
            <h2 className="font-bold text-sm sm:text-base">Logged Food Items</h2>
          </div>
          <button
            className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-xl transition-all shadow-xs"
            onClick={() => setIsCustomizeTableOpen(true)}
          >
            <SlidersHorizontal size={14} />
            <span>Table Columns ({tableNutrients.length}/5)</span>
          </button>
        </div>

        {["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].map((mealType) => {
          const mealLogs = data.meals[mealType] || [];
          const mealCalories = mealLogs.reduce((sum, item) => sum + item.calories, 0);

          return (
            <div
              key={mealType}
              className="bg-base-200 rounded-2xl border border-base-300 shadow-sm overflow-hidden"
            >
              {/* Meal Header */}
              <div className="p-4 bg-base-300/60 flex justify-between items-center border-b border-base-300">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Clock size={16} className="text-primary" /> {mealType}
                  </h3>
                  <span className="badge badge-neutral badge-sm font-semibold">
                    {mealCalories} kcal
                  </span>
                </div>

                <div className="flex items-center gap-2">
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
              <div className="p-4">
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
                              {mealLogs.length} {mealLogs.length === 1 ? "item" : "items"}
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
            </div>
          );
        })}
      </div>

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
          <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-base-200 rounded-3xl max-w-md w-full p-6 border border-base-300 shadow-2xl space-y-4">
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
    </div>
  );
}

export default FoodLoggingTab;
