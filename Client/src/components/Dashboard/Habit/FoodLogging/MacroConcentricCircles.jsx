import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wheat,
  Dumbbell,
  PieChart as PieIcon,
  Apple,
  Sparkles,
  Zap,
  Activity,
  Droplets,
  HeartPulse,
  ShieldAlert,
  Flame,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Check,
  Info,
  Settings,
  X,
} from "lucide-react";
import { NUTRIENT_CATEGORIES } from "./DailyNutrientsModal";

export const CATEGORY_OPTIONS = [
  { id: "Macronutrients", label: "Macronutrients (Macros)", shortLabel: "Macros", icon: "🍽️" },
  { id: "Vitamins", label: "Vitamins", shortLabel: "Vitamins", icon: "⚡" },
  { id: "Minerals", label: "Minerals", shortLabel: "Minerals", icon: "🪨" },
  { id: "Fatty Acids", label: "Fatty Acids", shortLabel: "Fatty Acids", icon: "🥑" },
  { id: "Others", label: "Others", shortLabel: "Others", icon: "💧" },
];

/**
 * Default 4 selected nutrients for each category
 */
const DEFAULT_SELECTED_BY_CATEGORY = {
  Macronutrients: ["carbohydrates", "protein", "fat", "fiber"],
  Vitamins: ["vitaminD", "vitaminC", "vitaminB12", "vitaminA"],
  Minerals: ["calcium", "iron", "potassium", "magnesium"],
  "Fatty Acids": ["saturatedFat", "monounsaturatedFat", "polyunsaturatedFat", "omega3"],
  Others: ["cholesterol", "water", "glycemicIndex", "glycemicLoad"],
};

/**
 * 4 Concentric Ring Configurations (Outer to Inner)
 * Matching the exact concentric circles visualization from Habit Logging
 */
const RING_CONFIGS = [
  {
    r: 44,
    c: 2 * Math.PI * 44, // ≈ 276.46
    color: "#f59e0b",
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500",
    ringLabel: "Ring 1",
  },
  {
    r: 37,
    c: 2 * Math.PI * 37, // ≈ 232.48
    color: "#0ea5e9",
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500",
    ringLabel: "Ring 2",
  },
  {
    r: 30,
    c: 2 * Math.PI * 30, // ≈ 188.50
    color: "#10b981",
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500",
    ringLabel: "Ring 3",
  },
  {
    r: 23,
    c: 2 * Math.PI * 23, // ≈ 144.51
    color: "#8b5cf6",
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500",
    ringLabel: "Ring 4",
  },
];

/**
 * Helper to calculate consumed total for any nutrient id
 */
export const calculateNutrientTotal = (data, nutrientId, fallbackProps = {}) => {
  if (!data && !fallbackProps) return 0;

  // Check fallback direct props if data isn't provided
  if (nutrientId === "carbohydrates" || nutrientId === "carbs") {
    if (fallbackProps.carbs !== undefined) return Number(fallbackProps.carbs) || 0;
  }
  if (nutrientId === "protein") {
    if (fallbackProps.protein !== undefined) return Number(fallbackProps.protein) || 0;
  }
  if (nutrientId === "fat" || nutrientId === "fats") {
    if (fallbackProps.fat !== undefined) return Number(fallbackProps.fat) || 0;
  }
  if (nutrientId === "fiber") {
    if (fallbackProps.fiber !== undefined) return Number(fallbackProps.fiber) || 0;
  }
  if (nutrientId === "calories") {
    if (fallbackProps.calories !== undefined) return Number(fallbackProps.calories) || 0;
  }

  const summary = data?.summary || {};

  // Check summary fast-path
  if (nutrientId === "calories" && summary.totalCalories !== undefined) {
    return Math.round(Number(summary.totalCalories) || 0);
  }
  if (nutrientId === "protein" && summary.totalProtein !== undefined) {
    return Math.round((Number(summary.totalProtein) || 0) * 10) / 10;
  }
  if (
    (nutrientId === "carbohydrates" || nutrientId === "carbs") &&
    summary.totalCarbs !== undefined
  ) {
    return Math.round((Number(summary.totalCarbs) || 0) * 10) / 10;
  }
  if (
    (nutrientId === "fat" || nutrientId === "fats") &&
    summary.totalFat !== undefined
  ) {
    return Math.round((Number(summary.totalFat) || 0) * 10) / 10;
  }
  if (nutrientId === "fiber" && summary.totalFiber !== undefined) {
    return Math.round((Number(summary.totalFiber) || 0) * 10) / 10;
  }
  if (nutrientId === "sugar" && summary.totalSugar !== undefined) {
    return Math.round((Number(summary.totalSugar) || 0) * 10) / 10;
  }

  // Iterate all logged items
  const allLogs =
    data?.logs && data.logs.length > 0
      ? data.logs
      : Object.values(data?.meals || {}).flat();

  let total = 0;

  allLogs.forEach((log) => {
    if (!log) return;
    const servings = Number(log.servings) || 1;
    const foodObj = log.foodId || log;

    if (nutrientId === "netCarbs") {
      const c =
        log.carbohydrates !== undefined
          ? log.carbohydrates
          : foodObj?.carbohydrates || 0;
      const f = log.fiber !== undefined ? log.fiber : foodObj?.fiber || 0;
      total += Math.max(0, (Number(c) || 0) - (Number(f) || 0));
    } else if (nutrientId === "glycemicIndex" || nutrientId === "glycemicLoad") {
      const rawVal =
        log[nutrientId] !== undefined ? log[nutrientId] : foodObj?.[nutrientId];
      const num = parseFloat(String(rawVal || 0).replace(/[^0-9.]/g, ""));
      if (!isNaN(num) && num > total) total = num;
    } else {
      const isFromLog = log[nutrientId] !== undefined;
      const rawVal = isFromLog ? log[nutrientId] : foodObj?.[nutrientId];
      if (
        rawVal === undefined ||
        rawVal === null ||
        rawVal === "" ||
        rawVal === "N/A"
      ) {
        return;
      }

      if (typeof rawVal === "number") {
        total += isFromLog ? rawVal : rawVal * servings;
      } else {
        const num = parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) {
          total += isFromLog ? num : num * servings;
        }
      }
    }
  });

  if (nutrientId === "calories" || nutrientId === "water") {
    return Math.round(total);
  }
  return Math.round(total * 10) / 10;
};

/**
 * Helper to get recommended target for any nutrient
 */
export const getNutrientTarget = (
  nutrientId,
  userTargets = {},
  habitState = {},
  fallbackProps = {}
) => {
  // Check direct fallback props
  if (
    (nutrientId === "carbohydrates" || nutrientId === "carbs") &&
    fallbackProps.carbsTarget
  ) {
    return Number(fallbackProps.carbsTarget) || 250;
  }
  if (nutrientId === "protein" && fallbackProps.proteinTarget) {
    return Number(fallbackProps.proteinTarget) || 150;
  }
  if ((nutrientId === "fat" || nutrientId === "fats") && fallbackProps.fatTarget) {
    return Number(fallbackProps.fatTarget) || 70;
  }
  if (nutrientId === "fiber" && fallbackProps.fiberTarget) {
    return Number(fallbackProps.fiberTarget) || 30;
  }

  // Check userTargets map
  if (userTargets && userTargets[nutrientId] !== undefined) {
    const val = userTargets[nutrientId];
    if (typeof val === "object" && val !== null) {
      return Number(val.max || val.min || 100);
    }
    return Number(val) || 100;
  }

  const gender = habitState.gender || "male";
  const age = habitState.age || 21;
  const isMale = gender === "male";
  const maintenanceCalories = habitState.maintenanceCalories || 2000;
  const calorieMax =
    habitState.settings?.intake?.max ||
    Math.round(maintenanceCalories * 1.1) ||
    2500;

  // Read saved macro ratios from localStorage if available
  let macroRatios = { protein: 30, carbs: 40, fats: 30 };
  try {
    const saved = localStorage.getItem("macro_ratios");
    if (saved) macroRatios = JSON.parse(saved);
  } catch (e) {}

  if (nutrientId === "calories") return calorieMax;
  if (nutrientId === "protein") return Math.round((calorieMax * (macroRatios.protein / 100)) / 4) || 150;
  if (nutrientId === "carbohydrates" || nutrientId === "carbs" || nutrientId === "netCarbs") {
    return Math.round((calorieMax * (macroRatios.carbs / 100)) / 4) || 250;
  }
  if (nutrientId === "fat" || nutrientId === "fats") {
    return Math.round((calorieMax * (macroRatios.fats / 100)) / 9) || 70;
  }
  if (nutrientId === "fiber") return isMale ? 38 : 25;
  if (nutrientId === "sugar" || nutrientId === "addedSugar") return isMale ? 36 : 25;

  // Vitamins
  if (nutrientId === "vitaminA") return isMale ? 900 : 700;
  if (nutrientId === "vitaminB1") return isMale ? 1.2 : 1.1;
  if (nutrientId === "vitaminB2") return isMale ? 1.3 : 1.1;
  if (nutrientId === "vitaminB3") return isMale ? 16 : 14;
  if (nutrientId === "vitaminB5") return 5;
  if (nutrientId === "vitaminB6") return age > 50 ? (isMale ? 1.7 : 1.5) : 1.3;
  if (nutrientId === "vitaminB7") return 30;
  if (nutrientId === "vitaminB9") return 400;
  if (nutrientId === "vitaminB12") return 2.4;
  if (nutrientId === "vitaminC") return isMale ? 90 : 75;
  if (nutrientId === "vitaminD") return 600;
  if (nutrientId === "vitaminE") return 15;
  if (nutrientId === "vitaminK") return isMale ? 120 : 90;

  // Minerals
  if (nutrientId === "calcium") return 1000;
  if (nutrientId === "magnesium") return isMale ? 420 : 320;
  if (nutrientId === "phosphorus") return 700;
  if (nutrientId === "potassium") return isMale ? 3400 : 2600;
  if (nutrientId === "sodium") return 2300;
  if (nutrientId === "iron") return isMale ? 8 : age > 50 ? 8 : 18;
  if (nutrientId === "zinc") return isMale ? 11 : 8;
  if (nutrientId === "copper") return 0.9;
  if (nutrientId === "manganese") return isMale ? 2.3 : 1.8;
  if (nutrientId === "selenium") return 55;
  if (nutrientId === "iodine") return 150;

  // Fatty Acids
  if (nutrientId === "saturatedFat") return 20;
  if (nutrientId === "monounsaturatedFat") return 25;
  if (nutrientId === "polyunsaturatedFat") return 20;
  if (nutrientId === "omega3") return isMale ? 1.6 : 1.1;
  if (nutrientId === "omega6") return isMale ? 17 : 12;
  if (nutrientId === "transFat") return 2;

  // Others
  if (nutrientId === "cholesterol") return 300;
  if (nutrientId === "glycemicIndex") return 55;
  if (nutrientId === "glycemicLoad") return 100;
  if (nutrientId === "water") {
    const minWater = habitState.settings?.water?.min;
    return minWater ? minWater * 1000 : isMale ? 3700 : 2700;
  }

  return 100;
};

/**
 * MacroConcentricCircles
 * Visualizes 4 chosen nutrients as concentric rings for any category:
 * - Macronutrients (Carbs, Protein, Fat, Fiber, etc.)
 * - Vitamins
 * - Minerals
 * - Fatty Acids
 * - Others
 * 
 * Lets the user choose exactly 4 nutrients per category with a modal popup.
 */
export default function MacroConcentricCircles({
  data = {},
  targets = {},
  calorieMax = 2500,
  calorieMin = 1800,
  habitState = {},
  carbs,
  carbsTarget,
  protein,
  proteinTarget,
  fat,
  fatTarget,
  fiber,
  fiberTarget,
  calories,
  className = "",
}) {
  const navigate = useNavigate();

  // Category dropdown state
  const [activeCategory, setActiveCategory] = useState(() => {
    try {
      const saved = localStorage.getItem("food_concentric_active_cat");
      if (saved && NUTRIENT_CATEGORIES[saved]) return saved;
    } catch (e) {}
    return "Macronutrients";
  });

  // User-selected 4 nutrients per category (persisted in localStorage)
  const [selectedByCategory, setSelectedByCategory] = useState(() => {
    try {
      const saved = localStorage.getItem("food_concentric_nutrients_by_cat");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SELECTED_BY_CATEGORY, ...parsed };
      }
    } catch (e) {}
    return DEFAULT_SELECTED_BY_CATEGORY;
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  // Save active category changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("food_concentric_active_cat", activeCategory);
    } catch (e) {}
  }, [activeCategory]);

  // Current category's selected 4 nutrients (strictly capped at 4)
  const currentSelected = useMemo(() => {
    const list =
      selectedByCategory[activeCategory] ||
      DEFAULT_SELECTED_BY_CATEGORY[activeCategory] ||
      [];
    return list.slice(0, 4);
  }, [selectedByCategory, activeCategory]);

  // Available nutrients in this active category
  const availableNutrients = useMemo(() => {
    return NUTRIENT_CATEGORIES[activeCategory] || [];
  }, [activeCategory]);

  // Toggle or swap nutrient selection (max 4)
  const handleToggleNutrient = (nutrientId) => {
    setSelectedByCategory((prev) => {
      const curList =
        prev[activeCategory] || DEFAULT_SELECTED_BY_CATEGORY[activeCategory] || [];
      const exists = curList.includes(nutrientId);
      let nextList;

      if (exists) {
        // Only allow unselecting if there are more than 1 item
        if (curList.length > 1) {
          nextList = curList.filter((id) => id !== nutrientId);
        } else {
          nextList = curList;
        }
      } else {
        if (curList.length < 4) {
          nextList = [...curList, nutrientId];
        } else {
          // Exactly 4 are already selected: replace the 4th item (Ring 4)
          nextList = [...curList.slice(0, 3), nutrientId];
        }
      }

      const updated = { ...prev, [activeCategory]: nextList };
      try {
        localStorage.setItem(
          "food_concentric_nutrients_by_cat",
          JSON.stringify(updated)
        );
      } catch (e) {}
      return updated;
    });
  };

  // Reset category selection back to default 4
  const handleResetCategoryDefaults = () => {
    const defaultList = DEFAULT_SELECTED_BY_CATEGORY[activeCategory] || [];
    setSelectedByCategory((prev) => {
      const updated = { ...prev, [activeCategory]: defaultList };
      try {
        localStorage.setItem(
          "food_concentric_nutrients_by_cat",
          JSON.stringify(updated)
        );
      } catch (e) {}
      return updated;
    });
  };

  // Fallback props for direct callers
  const fallbackProps = {
    carbs,
    carbsTarget,
    protein,
    proteinTarget,
    fat,
    fatTarget,
    fiber,
    fiberTarget,
    calories,
  };

  // Build the 4 display items for the concentric rings
  const ringsData = useMemo(() => {
    return currentSelected.map((nutrientId, index) => {
      const ringConfig = RING_CONFIGS[index] || RING_CONFIGS[RING_CONFIGS.length - 1];
      const meta = availableNutrients.find((n) => n.id === nutrientId) || {
        id: nutrientId,
        label: nutrientId.charAt(0).toUpperCase() + nutrientId.slice(1),
        unit: "g",
        icon: Activity,
      };

      const val = calculateNutrientTotal(data, nutrientId, fallbackProps);
      const target = getNutrientTarget(nutrientId, targets, habitState, fallbackProps);
      const pct = Math.max(0, Math.round((val / Math.max(1, target)) * 100));

      // Calculate stroke dash offset for SVG
      const cappedPct = Math.min(100, pct);
      const strokeDashoffset = ringConfig.c - (cappedPct / 100) * ringConfig.c;

      return {
        ...ringConfig,
        nutrientId,
        label: meta.label,
        unit: meta.unit || "",
        icon: meta.icon || Activity,
        val,
        target,
        pct,
        strokeDashoffset,
      };
    });
  }, [
    currentSelected,
    availableNutrients,
    data,
    targets,
    habitState,
    carbs,
    carbsTarget,
    protein,
    proteinTarget,
    fat,
    fatTarget,
    fiber,
    fiberTarget,
    calories,
  ]);

  // Active hovered nutrient
  const activeHoverItem =
    hoveredIndex !== null ? ringsData[hoveredIndex] : null;

  // Calorie count to display in the center when not hovered
  const centerCalories =
    calories !== undefined
      ? calories
      : data?.summary?.totalCalories || 0;

  const currentCategoryOption =
    CATEGORY_OPTIONS.find((c) => c.id === activeCategory) || CATEGORY_OPTIONS[0];

  return (
    <div className={`space-y-3 select-none ${className}`}>
      {/* Category Dropdown Header & Choose 4 Action + Edit Macro Ratios Icon */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-base-200/60">
        {/* Themed Category Dropdown on the Top */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
            className="btn btn-xs rounded-xl font-bold bg-base-200/90 hover:bg-base-200 border border-base-300/80 text-base-content flex items-center gap-1.5 shadow-2xs transition-all h-7.5 px-2.5"
            title="Switch nutrient category"
          >
            <span className="text-xs select-none leading-none">{currentCategoryOption.icon}</span>
            <span className="text-xs font-black tracking-tight">{currentCategoryOption.label}</span>
            <ChevronDown
              size={13}
              className={`text-base-content/60 transition-transform duration-200 ${
                isCategoryDropdownOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>

          {/* Floating Themed Menu - Comes ON TOP with z-50 and website theme */}
          {isCategoryDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-60 bg-base-100 rounded-2xl border border-base-300 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-base-content/50 border-b border-base-200 mb-1">
                Nutrient Category
              </div>
              <div className="space-y-0.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setHoveredIndex(null);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors text-left ${
                        isSelected
                          ? "bg-primary text-primary-content shadow-xs"
                          : "hover:bg-base-200/80 text-base-content/90"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm select-none">{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </div>
                      {isSelected && <Check size={14} className="stroke-[3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right side: Choose 4 button + Edit Macro Ratios Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="btn btn-xs rounded-xl font-bold bg-base-200/80 hover:bg-base-200 border border-base-300/80 text-base-content/80 text-[11px] gap-1 h-7.5 px-2.5"
            title="Choose 4 nutrients for this category"
          >
            <SlidersHorizontal size={12} />
            <span>Choose 4 ({currentSelected.length}/4)</span>
          </button>

          {/* Edit Macro Ratios icon right after Choose */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/habit/logging")}
            className="btn btn-xs btn-circle btn-ghost border border-base-300/80 text-primary hover:bg-primary/10 shadow-2xs shrink-0 h-7.5 w-7.5"
            title="Edit Macro Ratios in Habit Profile"
          >
            <Settings size={13} />
          </button>
        </div>
      </div>

      {/* Modal Popup for Choosing 4 Nutrients (Not a separate section in the same window) */}
      {isPickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsPickerOpen(false)}
        >
          <div
            className="bg-base-100 w-full max-w-md rounded-3xl p-5 shadow-2xl border border-base-300 space-y-4 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-base-200 pb-3">
              <div>
                <h3 className="font-black text-sm sm:text-base text-base-content flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-primary" />
                  <span>Choose 4 Nutrients</span>
                </h3>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Pick exactly 4 <span className="font-bold text-primary">{activeCategory}</span> for the concentric rings ({currentSelected.length}/4 selected).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Nutrient Chips Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-base-content/70">
                  Available in {activeCategory}:
                </span>
                <button
                  type="button"
                  onClick={handleResetCategoryDefaults}
                  className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableNutrients.map((nutrient) => {
                  const selectedIndex = currentSelected.indexOf(nutrient.id);
                  const isSelected = selectedIndex !== -1;
                  const ringConfig = isSelected ? RING_CONFIGS[selectedIndex] : null;

                  return (
                    <button
                      key={nutrient.id}
                      type="button"
                      onClick={() => handleToggleNutrient(nutrient.id)}
                      className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-base-200 border-2 shadow-xs"
                          : "bg-base-200/40 hover:bg-base-200/70 border border-base-300/80 text-base-content/80"
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: ringConfig?.color,
                            }
                          : {}
                      }
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: isSelected ? ringConfig?.color : "currentColor",
                            opacity: isSelected ? 1 : 0.2,
                          }}
                        />
                        <span className="truncate font-bold">{nutrient.label}</span>
                      </div>
                      {isSelected ? (
                        <span
                          className="badge badge-xs font-black px-1.5 py-2 shrink-0 text-white"
                          style={{ backgroundColor: ringConfig?.color }}
                        >
                          R{selectedIndex + 1}
                        </span>
                      ) : (
                        <span className="text-[10px] text-base-content/40 font-mono shrink-0">
                          {nutrient.unit}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 bg-base-200/50 rounded-xl text-[11px] text-base-content/60 space-y-1">
                <div className="font-semibold text-base-content/80">How it works:</div>
                <div>• Exactly 4 nutrients map to Ring 1 (Outer), 2, 3, and 4 (Inner).</div>
                <div>• Tap a selected nutrient to remove it, or tap any other nutrient to swap.</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-base-200 pt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-base-content/60">
                {currentSelected.length}/4 selected
              </span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="btn btn-sm btn-primary px-5 rounded-xl font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concentric Circles & 4-Nutrient Breakdown Container */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-3.5 sm:p-4 bg-base-200/40 rounded-2xl border border-base-300/70">
        {/* Concentric Circles SVG Graphic - Sized up bigger as requested */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-xs"
          >
            <g transform="rotate(-90 50 50)">
              {ringsData.map((ring, idx) => {
                const isHovered = hoveredIndex === idx;
                const isOtherHovered =
                  hoveredIndex !== null && hoveredIndex !== idx;

                return (
                  <React.Fragment key={ring.nutrientId || idx}>
                    {/* Ring Track Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={ring.r}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      opacity={isOtherHovered ? "0.06" : "0.14"}
                      className="transition-opacity duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() =>
                        setHoveredIndex(hoveredIndex === idx ? null : idx)
                      }
                    />

                    {/* Ring Active Progress Circle */}
                    {ring.pct > 0 && (
                      <circle
                        cx="50"
                        cy="50"
                        r={ring.r}
                        fill="none"
                        stroke={ring.color}
                        strokeWidth={isHovered ? "4.5" : "3.5"}
                        strokeDasharray={ring.c}
                        strokeDashoffset={ring.strokeDashoffset}
                        strokeLinecap="round"
                        opacity={isOtherHovered ? "0.3" : "1"}
                        style={{
                          filter: isHovered
                            ? `drop-shadow(0 0 4px ${ring.color})`
                            : "none",
                        }}
                        className="transition-all duration-500 ease-out cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() =>
                          setHoveredIndex(hoveredIndex === idx ? null : idx)
                        }
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </g>

            {/* Center Text (Interactive or Total Calories) */}
            {activeHoverItem ? (
              <>
                <text
                  x="50"
                  y="45"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="900"
                  fill={activeHoverItem.color}
                  className="select-none tracking-tight transition-all duration-200"
                >
                  {activeHoverItem.val}
                  <tspan fontSize="7.5" fontWeight="700">
                    {activeHoverItem.unit}
                  </tspan>
                </text>
                <text
                  x="50"
                  y="57"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="800"
                  fill="currentColor"
                  opacity="0.75"
                  className="select-none uppercase tracking-wider"
                >
                  {activeHoverItem.label.length > 8
                    ? activeHoverItem.label.slice(0, 8) + "…"
                    : activeHoverItem.label}
                </text>
                <text
                  x="50"
                  y="67"
                  textAnchor="middle"
                  fontSize="7.5"
                  fontWeight="800"
                  fill={activeHoverItem.color}
                  className="select-none"
                >
                  {activeHoverItem.pct}%
                </text>
              </>
            ) : (
              <>
                <text
                  x="50"
                  y="48"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="900"
                  fill="currentColor"
                  className="select-none tracking-tight"
                >
                  {centerCalories}
                </text>
                <text
                  x="50"
                  y="61"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="800"
                  fill="currentColor"
                  opacity="0.6"
                  className="select-none uppercase tracking-wider"
                >
                  kcal
                </text>
              </>
            )}
          </svg>
        </div>

        {/* 4 Nutrient Detail Breakdown Rows */}
        <div className="flex-1 w-full space-y-1.5 min-w-0">
          {ringsData.map((item, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.nutrientId || idx}
                className={`rounded-xl px-2.5 py-1.5 transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? "bg-base-100 shadow-xs ring-1 ring-base-300"
                    : "hover:bg-base-100/60"
                }`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() =>
                  setHoveredIndex(hoveredIndex === idx ? null : idx)
                }
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 font-bold">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className={`text-[11px] font-bold truncate ${item.colorClass}`}
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 font-semibold text-right">
                    <span className="text-xs font-black text-base-content">
                      {item.val}
                      <span className="text-[10px] font-medium opacity-70 ml-0.5">
                        {item.unit}
                      </span>
                    </span>
                    <span className="text-[10px] text-base-content/50">
                      / {item.target}
                      {item.unit}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold ml-1 ${item.colorClass}`}
                    >
                      {item.pct}%
                    </span>
                  </div>
                </div>

                {/* Progress Line */}
                <div className="w-full bg-base-300/50 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, item.pct)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
