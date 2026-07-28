import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../Context/AxiosInstance";
import { Search, Plus, Utensils, Check, Sparkles, AlertCircle, Info, History, RotateCcw, ChevronLeft, ChevronRight, Trash2, ShoppingBag, CheckCheck, Edit3 } from "lucide-react";
import FoodItemNutrientsModal from "./FoodItemNutrientsModal";

const getYesterdayDateStr = (dateStr) => {
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

const formatFoodPortionLabel = (food) => {
  if (!food) return "";
  const rawUnit = (food.unitType || "g").trim();
  const servingSize = Number(food.servingSize);
  const match = rawUnit.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

  if (match) {
    const unitNum = parseFloat(match[1]);
    const unitText = match[2].trim();
    if (unitText.toLowerCase() === "g" || unitText.toLowerCase() === "ml") {
      return `${unitNum} ${unitText}`;
    }
    if (servingSize && servingSize !== unitNum) {
      return `${rawUnit} (${servingSize} g)`;
    }
    return rawUnit;
  }

  return `${servingSize} ${rawUnit}`;
};

const calculateTotalQuantityLabel = (food, servingsCount) => {
  if (!food) return "";
  const numServings = Number(servingsCount) || 1;
  const servingSize = Number(food.servingSize) || 1;
  const rawUnit = (food.unitType || "g").trim();
  const fmtNum = (num) => (Math.round(num * 100) / 100).toString();

  const match = rawUnit.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    const unitNum = parseFloat(match[1]);
    const unitText = match[2].trim();
    const totalQtyNum = unitNum * numServings;
    const totalGrams = servingSize * numServings;
    const space = unitText.length > 0 ? " " : "";

    if (unitText.toLowerCase() === "g" || unitText.toLowerCase() === "ml") {
      return `${fmtNum(totalQtyNum)}${space}${unitText}`;
    }

    if (servingSize && servingSize !== unitNum) {
      return `${fmtNum(totalQtyNum)}${space}${unitText} (${fmtNum(totalGrams)} g)`;
    }

    return `${fmtNum(totalQtyNum)}${space}${unitText}`;
  }

  const totalQtyNum = servingSize * numServings;
  const space = rawUnit.length > 2 ? " " : "";
  return `${fmtNum(totalQtyNum)}${space}${rawUnit}`;
};

function LogFoodModal({ isOpen, onClose, selectedDate, initialMeal = "Breakfast", onFoodLogged, onOpenCustomFoodModal }) {
  const categoryListRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailFoodItem, setDetailFoodItem] = useState(null);
  const [mealType, setMealType] = useState(initialMeal);
  const [servings, setServings] = useState(1);
  const [logLoading, setLogLoading] = useState(false);
  const [error, setError] = useState("");

  const [stagedItems, setStagedItems] = useState([]);

  const [sourceTab, setSourceTab] = useState("database"); // "database" | "history"
  const [historyDate, setHistoryDate] = useState(() => getYesterdayDateStr(selectedDate));
  const [yesterdayLogs, setYesterdayLogs] = useState([]);
  const [yesterdayLoading, setYesterdayLoading] = useState(false);
  const [historyMealFilter, setHistoryMealFilter] = useState("All");

  const yesterdayDate = getYesterdayDateStr(selectedDate);

  const scrollCategories = (direction) => {
    if (categoryListRef.current) {
      const amount = direction === "left" ? -160 : 160;
      categoryListRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      let normalizedInitial = initialMeal
        ? initialMeal.charAt(0).toUpperCase() + initialMeal.slice(1).toLowerCase()
        : "Breakfast";
      if (normalizedInitial === "Others") normalizedInitial = "Other";
      setMealType(["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].includes(normalizedInitial) ? normalizedInitial : "Breakfast");
      setSelectedFood(null);
      setServings(1);
      setSearchQuery("");
      setSelectedCategory("All");
      setError("");
      setStagedItems([]);
      setSourceTab("database");
      setHistoryDate(getYesterdayDateStr(selectedDate));
      setHistoryMealFilter("All");
    }
  }, [isOpen, initialMeal, selectedDate]);

  useEffect(() => {
    if (isOpen && sourceTab === "database") {
      fetchFoods();
    } else if (isOpen && sourceTab === "history") {
      fetchHistoryLogs(historyDate);
    }
  }, [isOpen, searchQuery, selectedCategory, sourceTab, historyDate]);

  const changeHistoryDateByDays = (days) => {
    if (!historyDate || typeof historyDate !== "string") return;
    const parts = historyDate.split("-");
    if (parts.length !== 3) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const d = new Date(year, month, day + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setHistoryDate(`${yyyy}-${mm}-${dd}`);
  };

  const fetchHistoryLogs = async (targetDate = historyDate) => {
    if (!targetDate) return;
    try {
      setYesterdayLoading(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/log", {
        params: { date: targetDate },
      });
      if (res.data?.data?.logs) {
        setYesterdayLogs(res.data.data.logs);
      } else {
        setYesterdayLogs([]);
      }
    } catch (err) {
      console.error("Failed to fetch history food logs", err);
      setYesterdayLogs([]);
    } finally {
      setYesterdayLoading(false);
    }
  };

  const handleSelectYesterdayItem = (yLog) => {
    const foodObj = yLog.foodId || {
      _id: yLog._id,
      name: yLog.foodName,
      brand: yLog.brand || "Generic",
      unitType: yLog.unitType || "g",
      servingSize: yLog.servingSize || 100,
      calories: yLog.servings ? Math.round(yLog.calories / yLog.servings) : yLog.calories,
      protein: yLog.servings ? parseFloat((yLog.protein / yLog.servings).toFixed(1)) : yLog.protein,
      carbohydrates: yLog.servings ? parseFloat((yLog.carbohydrates / yLog.servings).toFixed(1)) : yLog.carbohydrates,
      fat: yLog.servings ? parseFloat((yLog.fat / yLog.servings).toFixed(1)) : yLog.fat,
    };

    setSelectedFood(foodObj);
    setServings(yLog.servings || 1);
    if (yLog.mealType) {
      setMealType(yLog.mealType);
    }
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/v1/dashboard/habit/food/database", {
        params: {
          search: searchQuery,
          category: selectedCategory,
          limit: 40,
        },
      });
      if (res.data?.data) {
        setFoods(res.data.data.foods || []);
        setCategories(["All", ...(res.data.data.categories || [])]);
      }
    } catch (err) {
      console.error("Failed to fetch foods", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQueue = () => {
    if (!selectedFood) return;
    const numServings = Number(servings) || 1;
    const newItem = {
      id: Date.now() + Math.random(),
      food: selectedFood,
      mealType,
      servings: numServings,
      calories: Math.round((selectedFood.calories || 0) * numServings),
      protein: parseFloat(((selectedFood.protein || 0) * numServings).toFixed(1)),
      carbohydrates: parseFloat(((selectedFood.carbohydrates || 0) * numServings).toFixed(1)),
      fat: parseFloat(((selectedFood.fat || 0) * numServings).toFixed(1)),
    };
    setStagedItems((prev) => [...prev, newItem]);
    setSelectedFood(null);
    setServings(1);
  };

  const handleRemoveFromQueue = (id) => {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateQueueMealType = (id, newMealType) => {
    setStagedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, mealType: newMealType } : item))
    );
  };

  const handleUpdateQueueServings = (id, delta) => {
    setStagedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newServings = Math.max(0.1, parseFloat((item.servings + delta).toFixed(2)));
        const calories = Math.round((item.food.calories || 0) * newServings);
        return {
          ...item,
          servings: newServings,
          calories,
          protein: parseFloat(((item.food.protein || 0) * newServings).toFixed(1)),
          carbohydrates: parseFloat(((item.food.carbohydrates || 0) * newServings).toFixed(1)),
          fat: parseFloat(((item.food.fat || 0) * newServings).toFixed(1)),
        };
      })
    );
  };

  const handleEditQueueItem = (item) => {
    setSelectedFood(item.food);
    setMealType(item.mealType);
    setServings(item.servings);
    setStagedItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleLogAllStaged = async () => {
    if (stagedItems.length === 0) return;
    try {
      setLogLoading(true);
      setError("");
      const itemsPayload = stagedItems.map((item) => ({
        date: selectedDate,
        mealType: item.mealType,
        foodId: item.food._id,
        servings: item.servings,
      }));

      await axiosInstance.post("/v1/dashboard/habit/food/log", { items: itemsPayload });
      setStagedItems([]);
      if (onFoodLogged) onFoodLogged();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log queued food items.");
    } finally {
      setLogLoading(false);
    }
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;
    try {
      setLogLoading(true);
      setError("");
      await axiosInstance.post("/v1/dashboard/habit/food/log", {
        date: selectedDate,
        mealType,
        foodId: selectedFood._id,
        servings: Number(servings),
      });

      if (onFoodLogged) onFoodLogged();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log food item.");
    } finally {
      setLogLoading(false);
    }
  };

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

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="bg-base-200 rounded-3xl max-w-5xl w-full h-[580px] max-h-[calc(100vh-100px)] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 -mt-6 sm:-mt-10">
          {/* Header */}
          <div className="p-4 border-b border-base-300 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-extrabold text-xl flex items-center gap-2">
                <Utensils size={22} className="text-primary" /> Log Food
              </h3>
              <p className="text-xs text-base-content/70">
                Search food database or pick from history to log into your daily intake.
              </p>
            </div>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
            {error && (
              <div className="alert alert-error text-xs py-2 px-3 mb-3 flex items-center gap-2 shrink-0">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
              {/* Left Column: Search, Filter & List (6 cols) */}
              <div className="md:col-span-6 flex flex-col gap-3 h-full min-h-0 overflow-hidden">
                {/* Source Selection Tabs: Database vs Logged History */}
                <div className="tabs tabs-boxed bg-base-100 p-1 rounded-xl border border-base-300 shrink-0">
                  <button
                    className={`tab tab-sm flex-1 font-bold text-xs gap-1.5 transition-all ${
                      sourceTab === "database" ? "tab-active bg-primary text-primary-content shadow-xs" : ""
                    }`}
                    onClick={() => setSourceTab("database")}
                  >
                    <Search size={14} /> Food Database
                  </button>
                  <button
                    className={`tab tab-sm flex-1 font-bold text-xs gap-1.5 transition-all ${
                      sourceTab === "history" ? "tab-active bg-primary text-primary-content shadow-xs" : ""
                    }`}
                    onClick={() => setSourceTab("history")}
                  >
                    <History size={14} /> Logged History
                  </button>
                </div>

                {sourceTab === "database" ? (
                  <>
                    {/* Search Bar */}
                    <div className="relative shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full pl-9"
                        placeholder="Search food by name, brand, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Category Scroll Container */}
                    <div className="relative shrink-0 flex items-center group">
                      <button
                        type="button"
                        className="absolute left-0 z-10 btn btn-xs btn-circle btn-neutral shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => scrollCategories("left")}
                        title="Scroll Left"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      <div
                        ref={categoryListRef}
                        className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full px-1"
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            className={`btn btn-xs rounded-lg whitespace-nowrap border-none transition-all ${
                              selectedCategory === cat ? "btn-primary shadow-xs font-bold" : "btn-ghost bg-base-100 opacity-70"
                            }`}
                            onClick={() => setSelectedCategory(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="absolute right-0 z-10 btn btn-xs btn-circle btn-neutral shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => scrollCategories("right")}
                        title="Scroll Right"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Food Items List */}
                    <div className="flex-1 min-h-0 overflow-y-auto bg-base-100 rounded-xl p-2 border border-base-300 space-y-1.5">
                      {loading ? (
                        <div className="flex justify-center items-center h-full text-sm opacity-60">
                          <span className="loading loading-spinner loading-md mr-2"></span> Loading foods...
                        </div>
                      ) : foods.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <Utensils size={32} className="opacity-40 mb-2" />
                          <p className="text-sm opacity-70">No food items found.</p>
                        </div>
                      ) : (
                        foods.map((food) => {
                          const isSelected = selectedFood?._id === food._id;
                          return (
                            <div
                              key={food._id}
                              onClick={() => setSelectedFood(food)}
                              className={`p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center border ${
                                isSelected
                                  ? "bg-primary/10 border-primary shadow-sm"
                                  : "bg-base-200/50 hover:bg-base-200 border-transparent"
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-sm flex items-center gap-1.5">
                                  {food.name}
                                  {food.isCustom && (
                                    <span className="badge badge-xs badge-secondary">Custom</span>
                                  )}
                                </div>
                                <div className="text-xs text-base-content/70 flex items-center gap-2 mt-0.5">
                                  <span>{food.brand || "Generic"}</span>
                                  <span>•</span>
                                  <span>{formatFoodPortionLabel(food)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="font-bold text-sm text-primary">{food.calories} kcal</div>
                                  <div className="text-[11px] text-base-content/60">
                                    P:{food.protein}g | C:{food.carbohydrates}g | F:{food.fat}g
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs text-info hover:bg-info/10 p-1 rounded-md"
                                  title="View Full Nutrition Details"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDetailFoodItem(food);
                                  }}
                                >
                                  <Info size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  /* Logged History List */
                  <div className="flex flex-col gap-2 flex-1 min-h-0">
                    <div className="text-xs text-base-content/70 flex justify-between items-center bg-base-100 p-2 rounded-xl border border-base-300 shrink-0 gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-base-content/80 flex items-center gap-1">
                          <History size={13} className="text-primary" /> Logged On:
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            className="btn btn-xs btn-circle btn-ghost border border-base-300"
                            title="Previous History Date"
                            onClick={() => changeHistoryDateByDays(-1)}
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <input
                            type="date"
                            className="input input-xs input-bordered font-bold text-xs bg-base-200 cursor-pointer px-1.5"
                            value={historyDate}
                            onChange={(e) => setHistoryDate(e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-xs btn-circle btn-ghost border border-base-300"
                            title="Next History Date"
                            onClick={() => changeHistoryDateByDays(1)}
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {historyDate !== yesterdayDate && (
                          <button
                            type="button"
                            className="btn btn-xs btn-ghost text-xs text-secondary underline hover:bg-secondary/10 px-1.5"
                            title="Reset to Yesterday"
                            onClick={() => setHistoryDate(yesterdayDate)}
                          >
                            Yesterday
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost gap-1 text-primary"
                          onClick={() => fetchHistoryLogs(historyDate)}
                        >
                          <RotateCcw size={12} /> Refresh
                        </button>
                      </div>
                    </div>

                    {/* History Meal Tags Filter Bar */}
                    {!yesterdayLoading && yesterdayLogs.length > 0 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 px-1">
                        {["All", "Breakfast", "Lunch", "Dinner", "Snacks", "Other"].map((tag) => {
                          const count = tag === "All"
                            ? yesterdayLogs.length
                            : yesterdayLogs.filter(l => (l.mealType || "").trim().toLowerCase() === tag.toLowerCase()).length;

                          if (tag !== "All" && count === 0) return null;

                          const isActive = historyMealFilter.toLowerCase() === tag.toLowerCase();

                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setHistoryMealFilter(tag)}
                              className={`btn btn-xs rounded-lg whitespace-nowrap border-none transition-all flex items-center gap-1 ${
                                isActive
                                  ? "btn-primary text-primary-content shadow-xs font-bold"
                                  : "btn-ghost bg-base-100 opacity-80 border border-base-300 text-base-content"
                              }`}
                            >
                              <span>{tag}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black leading-none ${
                                  isActive
                                    ? "bg-primary-content/25 text-primary-content"
                                    : "bg-base-300 text-base-content/70"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex-1 min-h-0 overflow-y-auto bg-base-100 rounded-xl p-2 border border-base-300 space-y-1.5">
                      {yesterdayLoading ? (
                        <div className="flex justify-center items-center h-full text-sm opacity-60">
                          <span className="loading loading-spinner loading-md mr-2"></span> Loading foods for {historyDate}...
                        </div>
                      ) : yesterdayLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <History size={32} className="opacity-40 mb-2" />
                          <p className="text-sm opacity-70">No foods logged on {historyDate}.</p>
                        </div>
                      ) : (() => {
                        const filteredYesterdayLogs = yesterdayLogs.filter((log) => {
                          if (historyMealFilter === "All") return true;
                          return (log.mealType || "").trim().toLowerCase() === historyMealFilter.toLowerCase();
                        });

                        if (filteredYesterdayLogs.length === 0) {
                          return (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                              <Utensils size={32} className="opacity-40 mb-2" />
                              <p className="text-sm opacity-70">No {historyMealFilter} items logged on {historyDate}.</p>
                            </div>
                          );
                        }

                        return filteredYesterdayLogs.map((yLog) => {
                          const foodObj = yLog.foodId || yLog;
                          const isSelected = selectedFood?._id === (foodObj._id || yLog._id);
                          return (
                            <div
                              key={yLog._id}
                              onClick={() => handleSelectYesterdayItem(yLog)}
                              className={`p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center border ${
                                isSelected
                                  ? "bg-primary/10 border-primary shadow-sm"
                                  : "bg-base-200/50 hover:bg-base-200 border-transparent"
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-sm flex items-center gap-1.5">
                                  <span>{yLog.foodName || foodObj.name}</span>
                                  {yLog.mealType && (
                                    <span className="badge badge-xs badge-outline badge-primary">
                                      {yLog.mealType}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-base-content/70 flex items-center gap-2 mt-0.5">
                                  <span>{yLog.servings || 1} serving(s) ({formatFoodPortionLabel(yLog)})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="font-bold text-sm text-primary">{yLog.calories} kcal</div>
                                  <div className="text-[11px] text-base-content/60">
                                    P:{yLog.protein}g | C:{yLog.carbohydrates}g | F:{yLog.fat}g
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                <div className="text-center pt-1 shrink-0">
                  <button
                    className="btn btn-xs btn-ghost text-primary hover:underline gap-1"
                    onClick={() => {
                      onClose();
                      onOpenCustomFoodModal();
                    }}
                  >
                    <Sparkles size={14} /> Can't find food? Add custom food to Database
                  </button>
                </div>
              </div>

              {/* Right Column: Logging Details & Batch Queue (6 cols) */}
              <div className="md:col-span-6 bg-base-100 rounded-xl p-4 border border-base-300 flex flex-col justify-between h-full min-h-0 overflow-y-auto">
                <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
                  {selectedFood ? (
                    <>
                      <div className="space-y-3 bg-base-200/50 p-3 rounded-xl border border-base-300">
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          Selected Food
                        </span>
                        <div className="flex justify-between items-center mt-0.5">
                          <h4 className="font-bold text-base leading-tight">{selectedFood.name}</h4>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-info hover:bg-info/10 p-1 flex items-center gap-1"
                            title="View Full Nutrition Details"
                            onClick={() => setDetailFoodItem({ ...selectedFood, servings: Number(servings) || 1 })}
                          >
                            <Info size={14} />
                            <span className="text-[11px]">Details</span>
                          </button>
                        </div>
                        <p className="text-xs text-base-content/70 mt-0.5">
                          Base Serving: {formatFoodPortionLabel(selectedFood)}
                        </p>
                      </div>

                      {/* Meal Category & Servings */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold block mb-1 text-base-content/80">Meal Category</label>
                          <select
                            className="select select-xs select-bordered w-full font-semibold"
                            value={mealType}
                            onChange={(e) => setMealType(e.target.value)}
                          >
                            <option value="Breakfast">Breakfast</option>
                            <option value="Lunch">Lunch</option>
                            <option value="Dinner">Dinner</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold block mb-1 text-base-content/80">Servings</label>
                          <input
                            type="number"
                            step="0.25"
                            min="0.1"
                            className="input input-xs input-bordered w-full font-bold focus:outline-none"
                            value={servings}
                            onChange={(e) => setServings(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Live Total Quantity Badge */}
                      <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg flex items-center justify-between text-xs">
                        <span className="font-bold text-primary flex items-center gap-1">
                          <Utensils size={12} /> Total Quantity:
                        </span>
                        <span className="font-black text-primary font-mono">
                          {calculateTotalQuantityLabel(selectedFood, servings)}
                        </span>
                      </div>

                      {/* Action Buttons for selected food */}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline btn-primary flex-1 gap-1 font-bold"
                          onClick={handleAddToQueue}
                        >
                          <Plus size={13} /> Add to Queue
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-primary flex-1 gap-1 font-bold"
                          disabled={logLoading}
                          onClick={handleLogFood}
                        >
                          <Check size={13} /> Log Item Now
                        </button>
                      </div>
                    </div>

                      {/* Scaled Nutrition & Macros Card (Displayed when a food is selected) */}
                      <div className="bg-base-200/60 p-3.5 rounded-xl border border-base-300 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-base-content/80 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-primary" /> Scaled Nutrition ({servings} serving{Number(servings) !== 1 ? 's' : ''})
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-info gap-1 p-0.5 hover:bg-info/10"
                          onClick={() => setDetailFoodItem({ ...selectedFood, servings: Number(servings) || 1 })}
                        >
                          <Info size={13} />
                          <span className="text-[11px]">All 37 Nutrients</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-base-100 p-2 rounded-lg border border-base-300">
                          <div className="text-[10px] text-info font-bold uppercase tracking-wider">Protein</div>
                          <div className="font-black text-sm text-info mt-0.5 font-mono">
                            {((selectedFood.protein || 0) * (Number(servings) || 1)).toFixed(1)}g
                          </div>
                        </div>

                        <div className="bg-base-100 p-2 rounded-lg border border-base-300">
                          <div className="text-[10px] text-warning font-bold uppercase tracking-wider">Carbs</div>
                          <div className="font-black text-sm text-warning mt-0.5 font-mono">
                            {((selectedFood.carbohydrates || 0) * (Number(servings) || 1)).toFixed(1)}g
                          </div>
                        </div>

                        <div className="bg-base-100 p-2 rounded-lg border border-base-300">
                          <div className="text-[10px] text-success font-bold uppercase tracking-wider">Fats</div>
                          <div className="font-black text-sm text-success mt-0.5 font-mono">
                            {((selectedFood.fat || 0) * (Number(servings) || 1)).toFixed(1)}g
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1.5 border-t border-base-300/50">
                        <div className="bg-base-100/60 p-1.5 rounded-lg border border-base-300/60">
                          <span className="text-base-content/60">Calories: </span>
                          <span className="font-extrabold text-primary">{Math.round((selectedFood.calories || 0) * (Number(servings) || 1))} kcal</span>
                        </div>
                        <div className="bg-base-100/60 p-1.5 rounded-lg border border-base-300/60">
                          <span className="text-base-content/60">Fiber: </span>
                          <span className="font-extrabold text-emerald-500">{((selectedFood.fiber || 0) * (Number(servings) || 1)).toFixed(1)}g</span>
                        </div>
                        <div className="bg-base-100/60 p-1.5 rounded-lg border border-base-300/60">
                          <span className="text-base-content/60">Sugar: </span>
                          <span className="font-extrabold text-rose-400">{((selectedFood.sugar || 0) * (Number(servings) || 1)).toFixed(1)}g</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Displayed when no food is currently selected in the upper panel */}
                    {stagedItems.length > 0 ? (
                      <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                        <div className="flex justify-between items-center px-1 shrink-0">
                          <span className="font-bold text-xs flex items-center gap-1.5 text-base-content/90">
                            <ShoppingBag size={14} className="text-secondary" /> Queued Foods ({stagedItems.length})
                          </span>
                          <span className="badge badge-sm badge-secondary font-bold">
                            Total: {stagedItems.reduce((acc, item) => acc + item.calories, 0)} kcal
                          </span>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                          {stagedItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-xl bg-base-200 border border-base-300 space-y-1.5 text-xs shadow-xs"
                            >
                              <div className="flex justify-between items-center gap-2">
                                <div className="font-semibold text-sm truncate flex items-center gap-1.5 min-w-0">
                                  <span className="truncate" title={item.food.name}>{item.food.name}</span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* Info Button: View full nutrient breakdown */}
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-info p-1 hover:bg-info/10 rounded-md"
                                    title="View Full Nutrition Details"
                                    onClick={() => setDetailFoodItem(item.food)}
                                  >
                                    <Info size={13} />
                                  </button>

                                  {/* Inline Meal Category Selector */}
                                  <select
                                    className="select select-xs select-bordered font-semibold bg-base-100 text-[11px] py-0 px-1.5 h-6 rounded-lg"
                                    value={item.mealType}
                                    onChange={(e) => handleUpdateQueueMealType(item.id, e.target.value)}
                                  >
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Other">Other</option>
                                  </select>

                                  {/* Edit Button: Reloads into main editor */}
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-info p-1 hover:bg-info/10 rounded-md"
                                    title="Edit item in main panel"
                                    onClick={() => handleEditQueueItem(item)}
                                  >
                                    <Edit3 size={13} />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-error p-1 hover:bg-error/10 rounded-md"
                                    title="Remove from Queue"
                                    onClick={() => handleRemoveFromQueue(item.id)}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>

                              {/* Servings Tweak & Live Macro calculation */}
                              <div className="flex justify-between items-center text-[11px] pt-0.5 border-t border-base-300/50">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-base-content/70 font-medium">Servings:</span>
                                  <div className="inline-flex join join-horizontal border border-base-300 rounded-md overflow-hidden bg-base-100">
                                    <button
                                      type="button"
                                      className="join-item btn btn-xs btn-ghost px-1.5 h-5 min-h-0 text-xs font-bold"
                                      onClick={() => handleUpdateQueueServings(item.id, -0.25)}
                                    >
                                      -
                                    </button>
                                    <span className="join-item px-1.5 font-extrabold text-xs flex items-center bg-base-100">
                                      {item.servings}
                                    </span>
                                    <button
                                      type="button"
                                      className="join-item btn btn-xs btn-ghost px-1.5 h-5 min-h-0 text-xs font-bold"
                                      onClick={() => handleUpdateQueueServings(item.id, 0.25)}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="font-bold text-primary font-mono text-[11px] whitespace-nowrap shrink-0">
                                  {calculateTotalQuantityLabel(item.food, item.servings)} ({item.calories} kcal)
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4 text-base-content/50">
                        <Utensils size={36} className="mb-2 opacity-40" />
                        <p className="text-xs">Select a food from the left list to configure, inspect macros, or add to your batch queue.</p>
                      </div>
                    )}
                  </>
                )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-base-200 flex gap-2 shrink-0">
                  <button className="btn btn-sm btn-ghost flex-1" onClick={onClose}>
                    Cancel
                  </button>
                  {stagedItems.length > 0 ? (
                    <button
                      className="btn btn-sm btn-success text-white flex-1 gap-1.5 font-bold"
                      disabled={logLoading}
                      onClick={handleLogAllStaged}
                    >
                      {logLoading ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <CheckCheck size={16} /> Log All ({stagedItems.length}) Items
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary flex-1 gap-1 font-bold"
                      disabled={!selectedFood || logLoading}
                      onClick={handleLogFood}
                    >
                      {logLoading ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <>
                          <Check size={16} /> Log Food
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrients Details Sub-Modal */}
      <FoodItemNutrientsModal
        isOpen={!!detailFoodItem}
        onClose={() => setDetailFoodItem(null)}
        foodItem={detailFoodItem}
      />
    </>
  );
}

export default LogFoodModal;
