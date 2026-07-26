import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../../../../Context/AxiosInstance";
import { Search, Plus, Utensils, Check, Sparkles, AlertCircle, Info, History, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
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
    const space = unitText.length > 0 ? " " : "";
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

  const [sourceTab, setSourceTab] = useState("database"); // "database" | "history"
  const [historyDate, setHistoryDate] = useState(() => getYesterdayDateStr(selectedDate));
  const [yesterdayLogs, setYesterdayLogs] = useState([]);
  const [yesterdayLoading, setYesterdayLoading] = useState(false);

  const yesterdayDate = getYesterdayDateStr(selectedDate);

  const scrollCategories = (direction) => {
    if (categoryListRef.current) {
      const amount = direction === "left" ? -160 : 160;
      categoryListRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      const normalizedInitial = initialMeal
        ? initialMeal.charAt(0).toUpperCase() + initialMeal.slice(1).toLowerCase()
        : "Breakfast";
      setMealType(["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].includes(normalizedInitial) ? normalizedInitial : "Breakfast");
      setSelectedFood(null);
      setServings(1);
      setSearchQuery("");
      setSelectedCategory("All");
      setError("");
      setSourceTab("database");
      setHistoryDate(getYesterdayDateStr(selectedDate));
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
      <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-20 pb-6 px-3 sm:px-6 overflow-hidden">
        <div className="bg-base-200 rounded-3xl max-w-4xl w-full h-[580px] sm:h-[620px] max-h-[calc(100vh-100px)] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Utensils className="text-primary" size={22} /> Log Food ({selectedDate})
            </h3>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 sm:p-6 flex-1 min-h-0 flex flex-col overflow-hidden">
            {error && (
              <div className="alert alert-error mb-4 text-sm py-2 px-3 flex items-center gap-2 shrink-0">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 h-full">
              {/* Left Column: Search & Food Selector (7 cols) */}
              <div className="md:col-span-7 flex flex-col gap-3 h-full min-h-0">
                {/* Source Selection Tabs */}
                <div className="grid grid-cols-2 gap-2 bg-base-300 p-1 rounded-xl">
                  <button
                    type="button"
                    className={`btn btn-xs sm:btn-sm rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
                      sourceTab === "database"
                        ? "btn-primary shadow-md"
                        : "btn-ghost text-base-content/70"
                    }`}
                    onClick={() => setSourceTab("database")}
                  >
                    <Search size={14} />
                    <span>Food Database</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-xs sm:btn-sm rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
                      sourceTab === "history"
                        ? "btn-primary shadow-md"
                        : "btn-ghost text-base-content/70"
                    }`}
                    onClick={() => setSourceTab("history")}
                  >
                    <History size={14} />
                    <span>Logged History</span>
                  </button>
                </div>

                {sourceTab === "database" ? (
                  <>
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search food database (e.g. Rice, Egg, Oats)..."
                        className="input input-bordered w-full pl-10 pr-4 input-md bg-base-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-3.5 text-base-content/50" size={18} />
                    </div>

                    {/* Category Pills with Side Navigation Arrows */}
                    <div className="relative flex items-center gap-1 bg-base-100 p-1 rounded-xl border border-base-300">
                      <button
                        type="button"
                        className="btn btn-xs btn-circle btn-ghost shrink-0 text-base-content/70 hover:bg-base-200"
                        onClick={() => scrollCategories("left")}
                        title="Scroll Left"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      <div
                        ref={categoryListRef}
                        className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5 text-xs"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            className={`btn btn-xs rounded-full whitespace-nowrap font-medium transition-all ${
                              selectedCategory === cat
                                ? "btn-primary shadow-sm scale-105"
                                : "btn-ghost hover:bg-base-200 text-base-content/80"
                            }`}
                            onClick={() => setSelectedCategory(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="btn btn-xs btn-circle btn-ghost shrink-0 text-base-content/70 hover:bg-base-200"
                        onClick={() => scrollCategories("right")}
                        title="Scroll Right"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Food List */}
                    <div className="flex-1 min-h-0 overflow-y-auto bg-base-100 rounded-xl p-2 border border-base-300 space-y-1.5">
                      {loading ? (
                        <div className="flex justify-center items-center h-full text-sm opacity-60">
                          <span className="loading loading-spinner loading-md mr-2"></span> Searching foods...
                        </div>
                      ) : foods.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <p className="text-sm opacity-70">No foods found for "{searchQuery}"</p>
                          <button
                            className="btn btn-sm btn-outline btn-primary mt-3 gap-1"
                            onClick={() => {
                              onClose();
                              onOpenCustomFoodModal();
                            }}
                          >
                            <Plus size={16} /> Add Custom Food Item
                          </button>
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
                                  <span>{food.servingSize} {food.unitType}</span>
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
                      ) : (
                        yesterdayLogs.map((yLog) => {
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
                                  <span>{yLog.servings || 1} serving(s) ({yLog.servingSize * yLog.servings} {yLog.unitType})</span>
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
                        })
                      )}
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

              {/* Right Column: Logging Details (5 cols) */}
              <div className="md:col-span-5 bg-base-100 rounded-xl p-4 border border-base-300 flex flex-col justify-between h-full min-h-0 overflow-y-auto">
                {selectedFood ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Selected Food
                      </span>
                      <div className="flex justify-between items-center mt-0.5">
                        <h4 className="font-bold text-lg leading-tight">{selectedFood.name}</h4>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-info hover:bg-info/10 p-1 flex items-center gap-1"
                          title="View Full Nutrition Details"
                          onClick={() => setDetailFoodItem(selectedFood)}
                        >
                          <Info size={16} />
                          <span className="text-xs">Details</span>
                        </button>
                      </div>
                      <p className="text-xs text-base-content/70 mt-1">
                        Base Serving: {selectedFood.servingSize} {selectedFood.unitType}
                      </p>
                    </div>

                    {/* Meal Type Selection */}
                    <div>
                      <label className="text-xs font-medium block mb-1">Meal Category</label>
                      <select
                        className="select select-sm select-bordered w-full"
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

                    {/* Servings & Total Quantity Section */}
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-base-content/80">
                            Number of Servings
                          </label>
                          <span className="text-[11px] font-semibold text-base-content/60">
                            Base: {selectedFood.servingSize} {selectedFood.unitType}
                          </span>
                        </div>
                        <input
                          type="number"
                          step="0.25"
                          min="0.1"
                          className="input input-sm input-bordered w-full font-bold focus:outline-none"
                          value={servings}
                          onChange={(e) => setServings(e.target.value)}
                        />
                      </div>

                      {/* Prominent Live Total Quantity Badge */}
                      <div className="bg-primary/10 border border-primary/30 p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <Utensils size={14} /> Total Quantity:
                        </span>
                        <span className="text-sm font-black font-mono text-primary">
                          {calculateTotalQuantityLabel(selectedFood, servings)}
                        </span>
                      </div>
                    </div>

                    {/* Calculated Macros Preview */}
                    <div className="bg-base-200/60 p-3 rounded-lg space-y-1.5 text-xs">
                      <div className="font-semibold text-xs text-base-content/80 mb-1 border-b border-base-300 pb-1">
                        Calculated Nutrition:
                      </div>
                      <div className="flex justify-between font-bold text-sm text-primary">
                        <span>Calories:</span>
                        <span>{Math.round(selectedFood.calories * Number(servings))} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span>{(selectedFood.protein * Number(servings)).toFixed(1)} g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbs:</span>
                        <span>{(selectedFood.carbohydrates * Number(servings)).toFixed(1)} g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat:</span>
                        <span>{(selectedFood.fat * Number(servings)).toFixed(1)} g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fiber:</span>
                        <span>{(selectedFood.fiber * Number(servings)).toFixed(1)} g</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 text-base-content/50">
                    <Utensils size={36} className="mb-2 opacity-40" />
                    <p className="text-sm">Select a food from the list on the left to configure logging.</p>
                  </div>
                )}

                <div className="pt-4 border-t border-base-200 flex gap-2">
                  <button className="btn btn-sm btn-ghost flex-1" onClick={onClose}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-primary flex-1 gap-1"
                    disabled={!selectedFood || logLoading}
                    onClick={handleLogFood}
                  >
                    {logLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>
                        <Check size={16} /> Add to Log
                      </>
                    )}
                  </button>
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
