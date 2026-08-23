import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Table,
  X,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Sparkles,
  Check,
  RotateCcw,
  Search,
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
  Info,
  CalendarDays,
  Clock,
  Layers,
  ArrowUpDown,
  Hash,
  BarChart3,
  Target,
  ChevronLeft,
  Columns,
} from "lucide-react";
import NutrientWikiModal from "../FoodLogging/NutrientWikiModal";

export const NUTRIENT_TABLE_CATEGORIES = {
  Macronutrients: [
    { id: "calories", label: "Calories", unit: "kcal", color: "text-error", colorHex: "#ef4444", icon: Flame, isMacro: true },
    { id: "protein", label: "Protein", unit: "g", color: "text-info", colorHex: "#3b82f6", icon: Dumbbell, isMacro: true },
    { id: "carbohydrates", label: "Carbs", fullLabel: "Carbohydrates", unit: "g", color: "text-warning", colorHex: "#f59e0b", icon: Wheat, isMacro: true },
    { id: "netCarbs", label: "Net Carbs", unit: "g", color: "text-amber-500", colorHex: "#d97706", icon: Activity, isMacro: false },
    { id: "fat", label: "Fat", unit: "g", color: "text-success", colorHex: "#10b981", icon: PieChart, isMacro: true },
    { id: "fiber", label: "Fiber", unit: "g", color: "text-emerald-500", colorHex: "#059669", icon: Apple, isMacro: false },
    { id: "sugar", label: "Sugar", unit: "g", color: "text-rose-400", colorHex: "#fb7185", icon: Sparkles, isMacro: false },
    { id: "addedSugar", label: "Added Sugar", unit: "g", color: "text-red-400", colorHex: "#f87171", icon: ShieldAlert, isMacro: false },
  ],
  Vitamins: [
    { id: "vitaminA", label: "Vit A", fullLabel: "Vitamin A", unit: "mcg", color: "text-amber-400", colorHex: "#fbbf24", icon: Zap },
    { id: "vitaminB1", label: "Vit B1", fullLabel: "Vitamin B1 (Thiamine)", unit: "mg", color: "text-blue-400", colorHex: "#60a5fa", icon: Zap },
    { id: "vitaminB2", label: "Vit B2", fullLabel: "Vitamin B2 (Riboflavin)", unit: "mg", color: "text-cyan-400", colorHex: "#22d3ee", icon: Zap },
    { id: "vitaminB3", label: "Vit B3", fullLabel: "Vitamin B3 (Niacin)", unit: "mg", color: "text-indigo-400", colorHex: "#818cf8", icon: Zap },
    { id: "vitaminB5", label: "Vit B5", fullLabel: "Vitamin B5 (Pantothenic Acid)", unit: "mg", color: "text-sky-400", colorHex: "#38bdf8", icon: Zap },
    { id: "vitaminB6", label: "Vit B6", fullLabel: "Vitamin B6 (Pyridoxine)", unit: "mg", color: "text-violet-400", colorHex: "#a78bfa", icon: Zap },
    { id: "vitaminB7", label: "Vit B7", fullLabel: "Vitamin B7 (Biotin)", unit: "mcg", color: "text-purple-400", colorHex: "#c084fc", icon: Zap },
    { id: "vitaminB9", label: "Vit B9", fullLabel: "Vitamin B9 (Folate)", unit: "mcg", color: "text-fuchsia-400", colorHex: "#e879f9", icon: Zap },
    { id: "vitaminB12", label: "Vit B12", fullLabel: "Vitamin B12 (Cobalamin)", unit: "mcg", color: "text-pink-400", colorHex: "#f472b6", icon: Zap },
    { id: "vitaminC", label: "Vit C", fullLabel: "Vitamin C", unit: "mg", color: "text-orange-400", colorHex: "#fb923c", icon: Zap },
    { id: "vitaminD", label: "Vit D", fullLabel: "Vitamin D", unit: "IU", color: "text-yellow-400", colorHex: "#facc15", icon: Zap },
    { id: "vitaminE", label: "Vit E", fullLabel: "Vitamin E", unit: "mg", color: "text-lime-400", colorHex: "#a3e635", icon: Zap },
    { id: "vitaminK", label: "Vit K", fullLabel: "Vitamin K", unit: "mcg", color: "text-green-400", colorHex: "#4ade80", icon: Zap },
  ],
  Minerals: [
    { id: "calcium", label: "Calcium", unit: "mg", color: "text-sky-400", colorHex: "#38bdf8", icon: Activity },
    { id: "magnesium", label: "Magnesium", unit: "mg", color: "text-indigo-400", colorHex: "#818cf8", icon: Activity },
    { id: "phosphorus", label: "Phosphorus", unit: "mg", color: "text-purple-400", colorHex: "#c084fc", icon: Activity },
    { id: "potassium", label: "Potassium", unit: "mg", color: "text-emerald-400", colorHex: "#34d399", icon: Activity },
    { id: "sodium", label: "Sodium", unit: "mg", color: "text-amber-500", colorHex: "#f59e0b", icon: Activity },
    { id: "iron", label: "Iron", unit: "mg", color: "text-amber-600", colorHex: "#d97706", icon: Activity },
    { id: "zinc", label: "Zinc", unit: "mg", color: "text-slate-400", colorHex: "#94a3b8", icon: Activity },
    { id: "copper", label: "Copper", unit: "mg", color: "text-orange-600", colorHex: "#ea580c", icon: Activity },
    { id: "manganese", label: "Manganese", unit: "mg", color: "text-stone-400", colorHex: "#a8a29e", icon: Activity },
    { id: "selenium", label: "Selenium", unit: "mcg", color: "text-teal-400", colorHex: "#2dd4bf", icon: Activity },
    { id: "iodine", label: "Iodine", unit: "mcg", color: "text-blue-500", colorHex: "#3b82f6", icon: Activity },
  ],
  "Fatty Acids": [
    { id: "saturatedFat", label: "Saturated", fullLabel: "Saturated Fat", unit: "g", color: "text-red-300", colorHex: "#fca5a5", icon: HeartPulse },
    { id: "monounsaturatedFat", label: "Monounsat.", fullLabel: "Monounsaturated Fat", unit: "g", color: "text-green-300", colorHex: "#86efac", icon: HeartPulse },
    { id: "polyunsaturatedFat", label: "Polyunsat.", fullLabel: "Polyunsaturated Fat", unit: "g", color: "text-emerald-300", colorHex: "#6ee7b7", icon: HeartPulse },
    { id: "omega3", label: "Omega-3", unit: "g", color: "text-cyan-300", colorHex: "#67e8f9", icon: HeartPulse },
    { id: "omega6", label: "Omega-6", unit: "g", color: "text-teal-300", colorHex: "#5eead4", icon: HeartPulse },
    { id: "transFat", label: "Trans Fat", unit: "g", color: "text-rose-500", colorHex: "#f43f5e", icon: ShieldAlert },
  ],
  Others: [
    { id: "cholesterol", label: "Cholesterol", unit: "mg", color: "text-rose-300", colorHex: "#fda4af", icon: HeartPulse },
    { id: "glycemicIndex", label: "Glycemic Idx", fullLabel: "Glycemic Index", unit: "", color: "text-purple-300", colorHex: "#d8b4fe", icon: Activity },
    { id: "glycemicLoad", label: "Glycemic Load", unit: "", color: "text-violet-300", colorHex: "#c4b5fd", icon: Activity },
    { id: "water", label: "Water", unit: "ml", color: "text-sky-400", colorHex: "#38bdf8", icon: Droplets },
  ],
};

const ALL_NUTRIENTS_FLAT = Object.values(NUTRIENT_TABLE_CATEGORIES).flat();

function TableCategoryTagBar({
  category,
  categoryNutrients,
  activeSelected,
  toggleColumn,
  selectAllColumns,
  deselectAllColumns,
}) {
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
          className="btn btn-xs btn-outline rounded-lg text-[10px] font-bold gap-1 shrink-0 whitespace-nowrap"
          onClick={() => selectAllColumns()}
          title="Show all columns in this category"
        >
          <Check size={12} /> All
        </button>
        <button
          type="button"
          className="btn btn-xs btn-ghost border border-base-300 rounded-lg text-[10px] font-bold gap-1 shrink-0 whitespace-nowrap mr-1 text-base-content/70"
          onClick={() => deselectAllColumns()}
          title="Reset / Single column"
        >
          <RotateCcw size={12} /> Reset
        </button>

        {categoryNutrients.map((n) => {
          const isSelected = activeSelected.includes(n.id);
          const Icon = n.icon || Activity;
          return (
            <button
              key={n.id}
              type="button"
              className={`btn btn-xs rounded-xl font-bold transition-all gap-1 text-[11px] shrink-0 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "btn-primary text-primary-content shadow-xs"
                  : "btn-ghost border border-base-300 text-base-content/60 hover:text-base-content"
              }`}
              onClick={() => toggleColumn(n.id)}
              title={isSelected ? `Hide ${n.label} column` : `Show ${n.label} column`}
            >
              <Icon size={12} className={isSelected ? "text-primary-content" : n.color} />
              <span>{n.label}</span>
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

export default function NutrientTableModal({
  isOpen,
  onClose,
  initialCategory = "Macronutrients",
  dateRangeList = [],
  foodLogs = [],
  habitData = [],
  targetsConfig = {},
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory || "Macronutrients");
  const [searchQuery, setSearchQuery] = useState("");
  const [hideEmptyDays, setHideEmptyDays] = useState(false);
  const [collapsedMonths, setCollapsedMonths] = useState(new Set());
  const [summaryMode, setSummaryMode] = useState("average"); // "average" or "total"
  const [viewFormat, setViewFormat] = useState(() => {
    try {
      return localStorage.getItem("nutrient_table_view_format") || "numbers";
    } catch (e) {
      return "numbers";
    }
  }); // "numbers" or "bars"
  const [selectedWikiNutrient, setSelectedWikiNutrient] = useState(null);

  // Selected columns map per category
  const [selectedColumnsMap, setSelectedColumnsMap] = useState(() => {
    try {
      const saved = localStorage.getItem("selected_nutrient_table_columns_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed reading selected_nutrient_table_columns_v2", e);
    }
    const initial = { All: ALL_NUTRIENTS_FLAT.map((n) => n.id) };
    Object.entries(NUTRIENT_TABLE_CATEGORIES).forEach(([cat, list]) => {
      initial[cat] = list.map((n) => n.id);
    });
    return initial;
  });

  // Save selected columns map to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("selected_nutrient_table_columns_v2", JSON.stringify(selectedColumnsMap));
    } catch (e) {
      console.error("Failed saving selected_nutrient_table_columns_v2", e);
    }
  }, [selectedColumnsMap]);

  const handleViewFormatChange = (format) => {
    setViewFormat(format);
    try {
      localStorage.setItem("nutrient_table_view_format", format);
    } catch (e) {}
  };

  // Sync category when opening with a new initialCategory
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !selectedWikiNutrient) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, selectedWikiNutrient, onClose]);

  // Helper to normalize date string to YYYY-MM-DD
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

  // Group food logs by normalized date
  const logsByDate = useMemo(() => {
    const map = {};
    foodLogs.forEach((log) => {
      const rawDate = normalizeDateKey(log.date);
      if (rawDate) {
        if (!map[rawDate]) map[rawDate] = [];
        map[rawDate].push(log);
      }
    });
    return map;
  }, [foodLogs]);

  // Map habitData entries by date
  const habitDataByDate = useMemo(() => {
    const map = {};
    if (Array.isArray(habitData)) {
      habitData.forEach((item) => {
        const cleanDate = normalizeDateKey(item.date);
        if (cleanDate) {
          map[cleanDate] = item;
        }
      });
    }
    return map;
  }, [habitData]);

  // Helper to extract numerical nutrient value from log or foodObj
  const extractNutrientValue = (log, nutrientId) => {
    if (!log) return 0;
    const servings = Number(log.servings) || 1;
    const foodObj = typeof log.foodId === "object" && log.foodId !== null ? log.foodId : null;

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

  // Matrix of daily nutrient values: { [dateStr]: { [nutrientId]: number, hasLog: boolean } }
  const dailyNutrientMatrix = useMemo(() => {
    const matrix = {};

    dateRangeList.forEach(({ date }) => {
      matrix[date] = { hasLog: false };
      const logsOnDate = logsByDate[date] || [];

      ALL_NUTRIENTS_FLAT.forEach((nutr) => {
        let dailySum = 0;

        if (logsOnDate.length > 0) {
          logsOnDate.forEach((log) => {
            if (nutr.id === "netCarbs") {
              const carbs = extractNutrientValue(log, "carbohydrates");
              const fiber = extractNutrientValue(log, "fiber");
              dailySum += Math.max(0, carbs - fiber);
            } else if (nutr.id === "glycemicIndex" || nutr.id === "glycemicLoad") {
              const val = extractNutrientValue(log, nutr.id);
              if (val > dailySum) dailySum = val;
            } else {
              dailySum += extractNutrientValue(log, nutr.id);
            }
          });
        }

        const habitEntry = habitDataByDate[date];
        if (dailySum === 0 && habitEntry) {
          if (nutr.id === "calories" && habitEntry.intake) {
            dailySum = Number(habitEntry.intake) || 0;
          } else if (nutr.id === "water" && habitEntry.water) {
            const waterVal = Number(habitEntry.water) || 0;
            dailySum = waterVal < 50 ? waterVal * 1000 : waterVal;
          }
        }

        const formattedVal =
          nutr.id === "calories" || nutr.id === "water"
            ? Math.round(dailySum)
            : parseFloat(dailySum.toFixed(1));

        matrix[date][nutr.id] = formattedVal;

        if (
          logsOnDate.length > 0 ||
          Boolean(habitEntry && (Number(habitEntry.intake) > 0 || Number(habitEntry.water) > 0)) ||
          dailySum > 0
        ) {
          matrix[date].hasLog = true;
        }
      });
    });

    return matrix;
  }, [dateRangeList, logsByDate, habitDataByDate]);

  // All available nutrients for current active category
  const categoryAvailableNutrients = useMemo(() => {
    if (activeCategory === "All") {
      return ALL_NUTRIENTS_FLAT;
    }
    return NUTRIENT_TABLE_CATEGORIES[activeCategory] || NUTRIENT_TABLE_CATEGORIES["Macronutrients"];
  }, [activeCategory]);

  // Active selected column IDs for current category
  const activeSelectedColumnIds = useMemo(() => {
    const list = selectedColumnsMap[activeCategory];
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    return categoryAvailableNutrients.map((n) => n.id);
  }, [selectedColumnsMap, activeCategory, categoryAvailableNutrients]);

  // Active columns to render in table (filtered by user selection)
  const activeColumns = useMemo(() => {
    const list = categoryAvailableNutrients.filter((n) => activeSelectedColumnIds.includes(n.id));
    return list.length > 0 ? list : categoryAvailableNutrients;
  }, [categoryAvailableNutrients, activeSelectedColumnIds]);

  // Toggle single column
  const toggleColumn = (nutrientId) => {
    setSelectedColumnsMap((prev) => {
      const currentList = prev[activeCategory] || categoryAvailableNutrients.map((n) => n.id);
      let updated;
      if (currentList.includes(nutrientId)) {
        if (currentList.length <= 1) {
          return prev; // Keep at least 1 column
        }
        updated = currentList.filter((id) => id !== nutrientId);
      } else {
        updated = [...currentList, nutrientId];
      }
      return { ...prev, [activeCategory]: updated };
    });
  };

  // Select all columns
  const selectAllColumns = () => {
    const allIds = categoryAvailableNutrients.map((n) => n.id);
    setSelectedColumnsMap((prev) => ({ ...prev, [activeCategory]: allIds }));
  };

  // Deselect / Reset to only first nutrient
  const deselectAllColumns = () => {
    const firstId = categoryAvailableNutrients[0]?.id ? [categoryAvailableNutrients[0].id] : [];
    setSelectedColumnsMap((prev) => ({ ...prev, [activeCategory]: firstId }));
  };

  // Maximum recorded value per nutrient column for proportional scaling in Bar View
  const columnMaxValues = useMemo(() => {
    const maxMap = {};
    activeColumns.forEach((col) => {
      let max = 0;
      dateRangeList.forEach(({ date }) => {
        const v = dailyNutrientMatrix[date]?.[col.id] || 0;
        if (v > max) max = v;
      });
      maxMap[col.id] = max > 0 ? max : 100;
    });
    return maxMap;
  }, [activeColumns, dateRangeList, dailyNutrientMatrix]);

  const todayISO = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Group dates into months (YYYY-MM) with all metadata
  const monthGroups = useMemo(() => {
    const groups = {};

    dateRangeList.forEach((dateObj) => {
      const [y, m, d] = dateObj.date.split("-").map(Number);
      const dateInstance = new Date(y, m - 1, d);
      const monthKey = `${y}-${String(m).padStart(2, "0")}`;
      const monthLabel = dateInstance.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      const dayName = dateInstance.toLocaleDateString("en-US", { weekday: "short" });
      const isWeekend = dateInstance.getDay() === 0 || dateInstance.getDay() === 6;
      const isToday = dateObj.date === todayISO;

      const dateValues = dailyNutrientMatrix[dateObj.date] || {};
      const hasLog = Boolean(dateValues.hasLog);

      if (!groups[monthKey]) {
        groups[monthKey] = {
          key: monthKey,
          label: monthLabel,
          year: y,
          monthNumber: m,
          days: [],
        };
      }

      groups[monthKey].days.push({
        ...dateObj,
        dayNumber: d,
        dayName,
        isWeekend,
        isToday,
        hasLog,
        values: dateValues,
      });
    });

    return Object.values(groups);
  }, [dateRangeList, dailyNutrientMatrix, todayISO]);

  // Filtered month groups based on Search Query and hideEmptyDays
  const filteredMonthGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return monthGroups
      .map((mGroup) => {
        const filteredDays = mGroup.days.filter((day) => {
          if (hideEmptyDays && !day.hasLog) return false;

          if (!q) return true;
          const matchDate = day.date.toLowerCase().includes(q);
          const matchDayName = day.dayName.toLowerCase().includes(q);
          const matchFullDate = (day.fullDateStr || "").toLowerCase().includes(q);
          const matchMonthLabel = mGroup.label.toLowerCase().includes(q);

          return matchDate || matchDayName || matchFullDate || matchMonthLabel;
        });

        return {
          ...mGroup,
          days: filteredDays,
        };
      })
      .filter((mGroup) => mGroup.days.length > 0);
  }, [monthGroups, searchQuery, hideEmptyDays]);

  // Toggle month collapse state
  const toggleMonth = (monthKey) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  };

  const expandAllMonths = () => setCollapsedMonths(new Set());
  const collapseAllMonths = () => {
    setCollapsedMonths(new Set(monthGroups.map((m) => m.key)));
  };

  // Helper to compute stats for a set of days across active columns
  const computeStatsForDays = (days) => {
    const stats = {};
    const loggedDays = days.filter((d) => d.hasLog);
    const count = loggedDays.length || 1;

    activeColumns.forEach((col) => {
      let sum = 0;
      days.forEach((d) => {
        const val = d.values?.[col.id] || 0;
        sum += val;
      });

      const avg = sum / count;
      stats[col.id] = {
        total: col.id === "calories" || col.id === "water" ? Math.round(sum) : parseFloat(sum.toFixed(1)),
        average: col.id === "calories" || col.id === "water" ? Math.round(avg) : parseFloat(avg.toFixed(1)),
      };
    });

    return { stats, totalDays: days.length, loggedDays: loggedDays.length };
  };

  // Grand overall stats across all visible days
  const grandStats = useMemo(() => {
    const allVisibleDays = filteredMonthGroups.flatMap((m) => m.days);
    return computeStatsForDays(allVisibleDays);
  }, [filteredMonthGroups, activeColumns]);

  // Export current table view to CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Day", "Month", "Has Log", ...activeColumns.map((c) => `${c.fullLabel || c.label} (${c.unit || "unit"})`)];

    const rows = [];
    filteredMonthGroups.forEach((mGroup) => {
      mGroup.days.forEach((day) => {
        const row = [
          day.date,
          day.dayName,
          mGroup.label,
          day.hasLog ? "Yes" : "No",
          ...activeColumns.map((c) => day.values?.[c.id] ?? 0),
        ];
        rows.push(row.map((cell) => `"${cell}"`).join(","));
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nutrients_${activeCategory.toLowerCase().replace(/\s+/g, "_")}_table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const totalFilteredDays = filteredMonthGroups.reduce((acc, m) => acc + m.days.length, 0);

  const modalContent = (
    <div
      className="fixed inset-0 w-screen h-screen z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[1720px] h-[95vh] max-h-[940px] flex flex-col bg-base-100/95 backdrop-blur-md rounded-3xl border border-base-300/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* TOP FLOATING HEADER: Title, Category Switcher & Actions           */}
        {/* ================================================================= */}
        <div className="p-3.5 sm:px-6 sm:py-4 border-b border-base-300/80 bg-base-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
          {/* Left: Icon, Title & Date Range badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-black shadow-xs shrink-0">
              <Table size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-base-content tracking-tight">
                  Nutrients Table View
                </h3>
                <span className="badge badge-primary badge-sm font-bold shadow-2xs">
                  {activeCategory}
                </span>
                <span className="text-[11px] font-mono font-bold text-base-content/60 bg-base-200 px-2 py-0.5 rounded-lg border border-base-300/40">
                  {totalFilteredDays} Days • {grandStats.loggedDays} Logged
                </span>
              </div>
              <p className="text-xs text-base-content/60 font-medium truncate">
                Dates and days grouped by month with daily totals & averages.
              </p>
            </div>
          </div>

          {/* Right: Sub-Dashboard Category Tabs, Search, Export & Close */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
            {/* Category Switcher Tabs */}
            <div className="join bg-base-200 p-1 rounded-2xl border border-base-300/60 shadow-xs overflow-x-auto max-w-full [scrollbar-width:none]">
              {Object.keys(NUTRIENT_TABLE_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`join-item btn btn-xs rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat
                      ? "btn-primary text-primary-content shadow-xs"
                      : "btn-ghost text-base-content/60 hover:text-base-content"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveCategory("All")}
                className={`join-item btn btn-xs rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === "All"
                    ? "btn-primary text-primary-content shadow-xs"
                    : "btn-ghost text-base-content/60 hover:text-base-content"
                }`}
                title="Show all 42 nutrients columns"
              >
                <Sparkles size={12} className="mr-1 inline text-warning" />
                All Nutrients
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="btn btn-xs rounded-xl font-bold gap-1 border border-base-300 text-base-content/70 hover:text-base-content hover:bg-base-200 transition-all cursor-pointer"
                title="Export current table to CSV"
              >
                <Download size={13} />
                <span className="hidden sm:inline">CSV</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                title="Close (ESC)"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECONDARY TOOLBAR: Search, Filter Days, Summary Toggle & Expand   */}
        {/* ================================================================= */}
        <div className="px-4 sm:px-6 py-2.5 bg-base-200/50 border-b border-base-300/60 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Left: Search input */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Search dates, days of week (e.g. Mon, Aug, 15)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-xs pl-8 pr-7 w-full rounded-xl bg-base-100 border-base-300 text-xs font-semibold focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Hide Empty Days Toggle + Summary Mode + Expand/Collapse Months */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Hide Empty Days Checkbox Pill */}
            <button
              type="button"
              onClick={() => setHideEmptyDays(!hideEmptyDays)}
              className={`btn btn-xs rounded-xl font-bold gap-1.5 transition-all cursor-pointer border ${
                hideEmptyDays
                  ? "btn-secondary text-white shadow-2xs"
                  : "btn-ghost border-base-300/70 text-base-content/70 hover:bg-base-200"
              }`}
            >
              <Filter size={12} />
              <span>{hideEmptyDays ? "Showing Logged Days" : "Hide Empty Days"}</span>
            </button>

            {/* View Format Toggle (Numbers vs Bars) */}
            <div className="join bg-base-100 p-0.5 rounded-xl border border-base-300 shadow-2xs">
              <button
                type="button"
                onClick={() => handleViewFormatChange("numbers")}
                className={`join-item btn btn-xs rounded-lg font-bold text-[11px] gap-1 transition-all cursor-pointer ${
                  viewFormat === "numbers"
                    ? "btn-primary text-primary-content shadow-xs"
                    : "btn-ghost text-base-content/60 hover:text-base-content"
                }`}
                title="Numbers View"
              >
                <Hash size={12} />
                <span>Numbers</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewFormatChange("bars")}
                className={`join-item btn btn-xs rounded-lg font-bold text-[11px] gap-1 transition-all cursor-pointer ${
                  viewFormat === "bars"
                    ? "btn-primary text-primary-content shadow-xs"
                    : "btn-ghost text-base-content/60 hover:text-base-content"
                }`}
                title="Bar View (Horizontal mini bars towards right)"
              >
                <BarChart3 size={12} />
                <span>Bars</span>
              </button>
            </div>

            {/* Summary Mode Toggle (Average vs Total) */}
            <div className="join bg-base-100 p-0.5 rounded-xl border border-base-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setSummaryMode("average")}
                className={`join-item btn btn-xs rounded-lg font-bold text-[11px] transition-all ${
                  summaryMode === "average"
                    ? "btn-primary text-primary-content shadow-xs"
                    : "btn-ghost text-base-content/60"
                }`}
                title="Show Daily Averages in summaries"
              >
                Avg / Day
              </button>
              <button
                type="button"
                onClick={() => setSummaryMode("total")}
                className={`join-item btn btn-xs rounded-lg font-bold text-[11px] transition-all ${
                  summaryMode === "total"
                    ? "btn-primary text-primary-content shadow-xs"
                    : "btn-ghost text-base-content/60"
                }`}
                title="Show Sum Totals in summaries"
              >
                Totals
              </button>
            </div>

            {/* Month Expand / Collapse Controls */}
            <div className="flex items-center gap-1 text-[11px] text-base-content/60 font-semibold border-l border-base-300 pl-2">
              <button
                type="button"
                onClick={expandAllMonths}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAllMonths}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* COLUMN SELECTOR BAR: Quick Nutrient Tag Chips & Active Columns    */}
        {/* ================================================================= */}
        <div className="px-4 sm:px-6 py-2 bg-base-200/40 border-b border-base-300/60 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-base-content/70 shrink-0">
            <Columns size={13} className="text-primary" />
            <span className="hidden sm:inline">Columns:</span>
            <span className="badge badge-primary badge-outline badge-xs font-mono font-black text-[10px]">
              {activeColumns.length}/{categoryAvailableNutrients.length}
            </span>
          </div>

          <TableCategoryTagBar
            category={activeCategory}
            categoryNutrients={categoryAvailableNutrients}
            activeSelected={activeSelectedColumnIds}
            toggleColumn={toggleColumn}
            selectAllColumns={selectAllColumns}
            deselectAllColumns={deselectAllColumns}
          />
        </div>

        {/* ================================================================= */}
        {/* MAIN TABLE CONTAINER: Sticky Top Headers & Sticky First Column    */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-auto [scrollbar-width:thin] bg-base-100 min-h-0 relative">
          <table className="table table-xs w-full border-collapse text-left select-text">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 z-40 bg-base-200 border-b border-base-300 shadow-xs">
              {/* Row 1: Date & Day + Nutrient Names & Units */}
              <tr className="border-b border-base-300/60">
                {/* Column 0: Sticky Date & Day Header (Intersection Cell) */}
                <th className="sticky top-0 left-0 z-50 bg-base-200 border-r border-base-300 w-48 sm:w-56 min-w-[190px] py-2.5 px-3.5 font-black text-xs text-base-content uppercase tracking-wider shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-primary" />
                    <span>Date & Day</span>
                  </div>
                </th>

                {/* Nutrient Columns Headers */}
                {activeColumns.map((col) => {
                  const Icon = col.icon || Activity;

                  return (
                    <th
                      key={col.id}
                      onClick={() => setSelectedWikiNutrient(col)}
                      className={`sticky top-0 z-40 bg-base-200 py-2.5 px-3 ${
                        viewFormat === "bars" ? "min-w-[140px] sm:min-w-[160px]" : "min-w-[120px] max-w-[170px]"
                      } text-right font-extrabold text-xs text-base-content cursor-pointer hover:bg-base-300/70 transition-colors group`}
                      title={`Click to open ${col.fullLabel || col.label} Wiki & Target Details`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Icon size={13} className={col.color || "text-primary"} />
                        <span className="truncate group-hover:text-primary transition-colors font-black">
                          {col.label}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono font-medium text-base-content/50 text-right mt-0.5">
                        {col.unit ? `(${col.unit})` : "—"}
                      </div>
                    </th>
                  );
                })}
              </tr>

              {/* Row 2: Dedicated Target Limits Sub-header Row */}
              <tr className="bg-base-200/95 border-b border-base-300 text-xs">
                {/* Column 0: Sticky Limits Label */}
                <th className="sticky left-0 z-50 bg-base-200 border-r border-base-300 py-1.5 px-3.5 text-[11px] font-black text-primary uppercase tracking-wider shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <Target size={13} className="text-primary" />
                    <span>Daily Limits</span>
                  </div>
                </th>

                {/* Nutrient Target Limit Badges */}
                {activeColumns.map((col) => {
                  const target = targetsConfig[col.id];
                  const hasTarget = target && (target.max > 0 || target.min > 0);

                  let limitText = "—";
                  if (hasTarget) {
                    if (target.min > 0 && target.max > 0) {
                      limitText = `${target.min} - ${target.max}`;
                    } else if (target.max > 0) {
                      limitText = `≤ ${target.max}`;
                    } else if (target.min > 0) {
                      limitText = `≥ ${target.min}`;
                    }
                  }

                  return (
                    <th
                      key={`limit-${col.id}`}
                      className="py-1.5 px-3 text-right font-mono text-[11px] font-bold text-base-content/70 bg-base-200"
                    >
                      {hasTarget ? (
                        <span
                          className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 inline-block text-[10px] font-black font-mono shadow-2xs"
                          title={`Daily Target Limit: ${limitText} ${col.unit}`}
                        >
                          {limitText}
                        </span>
                      ) : (
                        <span className="text-base-content/25 font-normal">—</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body with Grouped Months */}
            <tbody className="divide-y divide-base-200/70 text-xs">
              {filteredMonthGroups.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeColumns.length + 1}
                    className="p-12 text-center text-base-content/50 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <Layers size={32} className="text-base-content/30" />
                      <p className="font-bold text-sm text-base-content/80">No matching dates found</p>
                      <p className="text-xs">
                        Try adjusting your search query or unchecking "Hide Empty Days".
                      </p>
                      {hideEmptyDays && (
                        <button
                          type="button"
                          onClick={() => setHideEmptyDays(false)}
                          className="btn btn-xs btn-primary rounded-xl mt-2 font-bold"
                        >
                          Show All Dates
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMonthGroups.map((mGroup) => {
                  const isCollapsed = collapsedMonths.has(mGroup.key);
                  const monthStats = computeStatsForDays(mGroup.days);

                  return (
                    <React.Fragment key={mGroup.key}>
                      {/* --------------------------------------------------- */}
                      {/* MONTH GROUP HEADER ROW (Clean Group Banner)          */}
                      {/* --------------------------------------------------- */}
                      <tr className="bg-base-200/90 border-y-2 border-base-300 font-black text-xs">
                        {/* Month Title & Toggle in Sticky Left Column (Horizontal stickiness only) */}
                        <td
                          className="sticky left-0 z-20 bg-base-200 border-r border-base-300 py-3 px-3.5 shadow-xs cursor-pointer hover:bg-base-300 transition-colors"
                          onClick={() => toggleMonth(mGroup.key)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1 rounded-lg bg-base-100 text-primary shadow-2xs border border-base-300/40">
                                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                              </div>
                              <span className="font-extrabold text-xs text-base-content tracking-tight truncate">
                                {mGroup.label}
                              </span>
                            </div>
                            <span className="badge badge-primary badge-outline badge-xs font-mono font-extrabold text-[10px] shrink-0">
                              {mGroup.days.length}d
                            </span>
                          </div>
                        </td>

                        {/* Month Subtotals / Daily Averages across all nutrient columns */}
                        {activeColumns.map((col) => {
                          const colStat = monthStats.stats[col.id] || { total: 0, average: 0 };
                          const statVal = summaryMode === "total" ? colStat.total : colStat.average;
                          const target = targetsConfig[col.id];
                          const hasTarget = target && target.max > 0;
                          const maxRef = hasTarget ? target.max : (columnMaxValues[col.id] || 100);
                          const percent = maxRef > 0 ? (statVal / maxRef) * 100 : 0;
                          const barWidth = Math.min(100, Math.max(statVal > 0 ? 4 : 0, percent));

                          return (
                            <td
                              key={col.id}
                              className="py-3 px-3 text-right font-mono font-black text-xs text-base-content/85 bg-base-200/90"
                            >
                              {viewFormat === "bars" ? (
                                <div className="flex flex-col gap-1 w-full min-w-[95px] max-w-[150px] ml-auto">
                                  <div className="flex items-center justify-between gap-1 text-[11px] leading-none">
                                    <span className="text-[9px] font-sans font-semibold text-base-content/40 uppercase tracking-wider">
                                      {summaryMode === "total" ? "sum" : "avg"}
                                    </span>
                                    <span className={statVal > 0 ? "text-primary font-black" : "text-base-content/40 font-medium"}>
                                      {statVal > 0 ? statVal.toLocaleString() : "—"}
                                    </span>
                                  </div>
                                  <div className="w-full bg-base-300 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary transition-all duration-300"
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className={statVal > 0 ? "text-primary font-black" : "text-base-content/40 font-medium"}>
                                    {statVal > 0 ? statVal.toLocaleString() : "—"}
                                  </span>
                                  <span className="text-[9px] font-sans font-semibold text-base-content/45 uppercase tracking-wider">
                                    {summaryMode === "total" ? "mo. sum" : "mo. avg"}
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* --------------------------------------------------- */}
                      {/* INDIVIDUAL DAY ROWS FOR THIS MONTH                  */}
                      {/* --------------------------------------------------- */}
                      {!isCollapsed &&
                        mGroup.days.map((day) => {
                          return (
                            <tr
                              key={day.date}
                              className={`hover:bg-base-200/50 transition-colors ${
                                day.isToday
                                  ? "bg-primary/8 font-bold"
                                  : day.isWeekend
                                  ? "bg-base-200/20"
                                  : ""
                              }`}
                            >
                              {/* Sticky Left Date & Day cell */}
                              <td
                                className={`sticky left-0 z-20 border-r border-base-200 py-2 px-3.5 shadow-2xs ${
                                  day.isToday
                                    ? "bg-primary/10"
                                    : "bg-base-100"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {/* Status Dot (Logged vs Empty) */}
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        day.hasLog ? "bg-success shadow-xs shadow-success/40" : "bg-base-content/20"
                                      }`}
                                      title={day.hasLog ? "Nutrients logged for this day" : "No food logged"}
                                    />

                                    {/* Full Formatted Date */}
                                    <span className="font-mono font-bold text-xs text-base-content truncate">
                                      {day.date}
                                    </span>
                                  </div>

                                  {/* Day of Week Badge */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    {day.isToday && (
                                      <span className="badge badge-primary badge-2xs font-extrabold text-[9px]">
                                        Today
                                      </span>
                                    )}
                                    <span
                                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                        day.isWeekend
                                          ? "bg-warning/15 text-warning"
                                          : "bg-base-200 text-base-content/70"
                                      }`}
                                    >
                                      {day.dayName}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Nutrient Data Cells */}
                              {activeColumns.map((col) => {
                                const val = day.values?.[col.id] || 0;
                                const target = targetsConfig[col.id];
                                const hasTarget = target && target.max > 0;
                                const isMet = hasTarget && val >= (target.min || 0) && val <= target.max;
                                const isExceeded = hasTarget && val > target.max;
                                const isBelowMin = hasTarget && target.min > 0 && val < target.min;

                                // Proportional percentage for mini progress bar
                                const maxRef = hasTarget ? target.max : (columnMaxValues[col.id] || 100);
                                const percent = maxRef > 0 ? (val / maxRef) * 100 : 0;
                                const barWidth = Math.min(100, Math.max(val > 0 ? 4 : 0, percent));

                                let numberColorClass = "text-base-content/30 font-medium";
                                let barBgClass = "bg-primary";
                                if (val > 0) {
                                  if (hasTarget) {
                                    if (isMet) {
                                      numberColorClass = "text-success font-extrabold";
                                      barBgClass = "bg-success";
                                    } else if (isExceeded) {
                                      numberColorClass = "text-warning font-extrabold";
                                      barBgClass = "bg-warning";
                                    } else if (isBelowMin) {
                                      numberColorClass = "text-info font-extrabold";
                                      barBgClass = "bg-info";
                                    } else {
                                      numberColorClass = col.color ? `${col.color} font-extrabold` : "text-base-content font-extrabold";
                                      barBgClass = col.colorHex ? "" : "bg-primary";
                                    }
                                  } else {
                                    numberColorClass = col.color ? `${col.color} font-extrabold` : "text-base-content font-extrabold";
                                    barBgClass = col.colorHex ? "" : "bg-primary";
                                  }
                                }

                                return (
                                  <td
                                    key={col.id}
                                    className={`py-2 px-3 text-right font-mono text-xs ${numberColorClass}`}
                                    title={
                                      val > 0 && hasTarget
                                        ? `Target: ${target.min ? `${target.min}-` : "≤"}${target.max} ${col.unit}${
                                            isMet ? " (Target Met)" : isExceeded ? " (Exceeded Max)" : isBelowMin ? " (Below Min)" : ""
                                          }`
                                        : undefined
                                    }
                                  >
                                    {viewFormat === "bars" ? (
                                      <div className="flex flex-col gap-1 w-full min-w-[95px] max-w-[150px] ml-auto">
                                        <div className="flex items-center justify-between gap-1 text-[11px] leading-none">
                                          <span className="text-[9px] font-sans font-semibold text-base-content/40">
                                            {val > 0 && hasTarget ? `${Math.round(percent)}%` : ""}
                                          </span>
                                          <span className={numberColorClass}>
                                            {val > 0 ? val.toLocaleString() : "—"}
                                          </span>
                                        </div>
                                        <div className="w-full bg-base-300/60 rounded-full h-1.5 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all duration-300 ${barBgClass}`}
                                            style={{
                                              width: `${barWidth}%`,
                                              ...(barBgClass === "" && col.colorHex ? { backgroundColor: col.colorHex } : {}),
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ) : val > 0 ? (
                                      <span>{val.toLocaleString()}</span>
                                    ) : (
                                      <span className="text-base-content/25 font-normal">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* ============================================================= */}
            {/* STICKY FOOTER ROW: Overall Summary Averages & Totals          */}
            {/* ============================================================= */}
            {filteredMonthGroups.length > 0 && (
              <tfoot className="sticky bottom-0 z-40 bg-base-200 border-t-2 border-base-300 shadow-md">
                <tr className="font-black text-xs text-base-content">
                  {/* Bottom Left Intersection Cell */}
                  <th className="sticky bottom-0 left-0 z-50 bg-base-200 border-r border-base-300 py-3 px-3.5 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-secondary" />
                        <span>Overall Range Summary</span>
                      </div>
                      <span className="badge badge-secondary badge-xs font-mono font-bold">
                        {summaryMode === "total" ? "Grand Total" : "Daily Average"}
                      </span>
                    </div>
                  </th>

                  {/* Summary Metric per Nutrient Column */}
                  {activeColumns.map((col) => {
                    const colStat = grandStats.stats[col.id] || { total: 0, average: 0 };
                    const statVal = summaryMode === "total" ? colStat.total : colStat.average;
                    const target = targetsConfig[col.id];
                    const hasTarget = target && target.max > 0;
                    const maxRef = hasTarget ? target.max : (columnMaxValues[col.id] || 100);
                    const percent = maxRef > 0 ? (statVal / maxRef) * 100 : 0;
                    const barWidth = Math.min(100, Math.max(statVal > 0 ? 4 : 0, percent));

                    return (
                      <th key={col.id} className="py-3 px-3 text-right font-mono font-black text-xs text-base-content">
                        {viewFormat === "bars" ? (
                          <div className="flex flex-col gap-1 w-full min-w-[95px] max-w-[150px] ml-auto">
                            <div className="flex items-center justify-between gap-1 text-[11px] leading-none">
                              <span className="text-[9px] font-sans font-semibold text-base-content/50">
                                {col.unit}
                              </span>
                              <span className="text-secondary font-black">
                                {statVal > 0 ? statVal.toLocaleString() : "—"}
                              </span>
                            </div>
                            <div className="w-full bg-base-300 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-secondary transition-all duration-300"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-secondary">
                              {statVal > 0 ? statVal.toLocaleString() : "—"}
                            </span>
                            <span className="text-[9px] font-sans font-medium text-base-content/50">
                              {col.unit}
                            </span>
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* ================================================================= */}
        {/* BOTTOM MODAL ACTION BAR: Shortcuts & Close                        */}
        {/* ================================================================= */}
        <div className="p-3 sm:px-6 sm:py-3 border-t border-base-300/80 bg-base-100 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-3 text-base-content/60 font-medium">
            <span className="hidden sm:inline">
              Click any column header to view nutrient wiki & daily targets.
            </span>
            <span className="font-mono text-xs">
              Showing <strong className="text-base-content font-bold">{totalFilteredDays}</strong> days across{" "}
              <strong className="text-base-content font-bold">{filteredMonthGroups.length}</strong> month groups.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 rounded-xl px-4 font-bold text-xs shrink-0 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Nutrient Wiki Popup inside Table Modal */}
      {selectedWikiNutrient && (
        <NutrientWikiModal
          isOpen={!!selectedWikiNutrient}
          onClose={() => setSelectedWikiNutrient(null)}
          nutrient={selectedWikiNutrient}
        />
      )}
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
}
