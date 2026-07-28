import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../Context/AxiosInstance";
import { Edit3, X, Check, Utensils, AlertCircle } from "lucide-react";

const formatFoodPortionLabel = (item) => {
  if (!item) return "";
  const foodObj = item.foodId || item;
  const rawUnit = (item.unitType || foodObj.unitType || "g").trim();
  const servingSize = Number(item.servingSize || foodObj.servingSize);
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

const calculateTotalQuantityLabel = (foodLog, servingsCount) => {
  if (!foodLog) return "";
  const numServings = Number(servingsCount) || 1;
  const foodObj = foodLog.foodId || foodLog;
  const servingSize = Number(foodLog.servingSize || foodObj.servingSize) || 1;
  const rawUnit = (foodLog.unitType || foodObj.unitType || "g").trim();
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

function EditFoodLogModal({ isOpen, onClose, log, onLogUpdated }) {
  const [mealType, setMealType] = useState("Breakfast");
  const [servings, setServings] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && log) {
      let rawMeal = log.mealType || "Breakfast";
      let normalized = rawMeal.charAt(0).toUpperCase() + rawMeal.slice(1).toLowerCase();
      if (normalized === "Others") normalized = "Other";
      setMealType(["Breakfast", "Lunch", "Dinner", "Snacks", "Other"].includes(normalized) ? normalized : "Breakfast");
      setServings(log.servings || 1);
      setError("");
    }
  }, [isOpen, log]);

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

  if (!isOpen || !log) return null;

  const foodObj = log.foodId || {};
  const baseServingSize = log.servingSize || foodObj.servingSize || 100;
  const baseCalories = log.servings ? log.calories / log.servings : (foodObj.calories || 0);
  const baseProtein = log.servings ? log.protein / log.servings : (foodObj.protein || 0);
  const baseCarbs = log.servings ? log.carbohydrates / log.servings : (foodObj.carbohydrates || 0);
  const baseFat = log.servings ? log.fat / log.servings : (foodObj.fat || 0);

  const handleSave = async () => {
    const numServings = Number(servings);
    if (!numServings || numServings <= 0) {
      setError("Please enter a valid serving quantity greater than 0.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axiosInstance.put(`/v1/dashboard/habit/food/log/${log._id}`, {
        mealType,
        servings: numServings,
      });

      if (onLogUpdated) onLogUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update log entry", err);
      setError(err.response?.data?.message || "Failed to update food entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleServingStep = (delta) => {
    const nextVal = parseFloat((Number(servings) + delta).toFixed(2));
    if (nextVal > 0) {
      setServings(nextVal);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="bg-base-200 rounded-3xl max-w-md w-full border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 -mt-6 sm:-mt-10">
        {/* Header */}
        <div className="p-5 bg-base-300/80 border-b border-base-300 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Edit3 className="text-primary" size={20} /> Edit Logged Food
          </h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="alert alert-error text-xs py-2 px-3 flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Food Info */}
          <div className="bg-base-100 p-3.5 rounded-xl border border-base-300 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Utensils size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm leading-tight">{log.foodName || foodObj.name}</h4>
              <p className="text-xs text-base-content/60 mt-0.5">
                Base Portion: {formatFoodPortionLabel(log)}
              </p>
            </div>
          </div>

          {/* Meal Category Dropdown */}
          <div>
            <label className="text-xs font-semibold block mb-1.5 text-base-content/80">
              Shift Meal Category
            </label>
            <select
              className="select select-sm select-bordered w-full font-semibold"
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

          {/* Quantity / Servings Input */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-base-content/80">
                Servings Quantity
              </label>
              <div className="flex gap-2 items-center">
                <div className="join border border-base-300 rounded-lg overflow-hidden flex-1">
                  <button
                    type="button"
                    className="join-item btn btn-sm btn-neutral px-3"
                    onClick={() => handleServingStep(-0.25)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    className="join-item input input-sm text-center font-bold w-full bg-base-100 focus:outline-none"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                  />
                  <button
                    type="button"
                    className="join-item btn btn-sm btn-neutral px-3"
                    onClick={() => handleServingStep(0.25)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Prominent Live Total Quantity Badge */}
            <div className="bg-primary/10 border border-primary/30 p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Utensils size={14} /> Total Quantity:
              </span>
              <span className="text-sm font-black font-mono text-primary">
                {calculateTotalQuantityLabel(log, servings)}
              </span>
            </div>
          </div>

          {/* Calculated Nutrition Live Preview */}
          <div className="bg-base-100 p-3.5 rounded-xl border border-base-300 space-y-1.5 text-xs">
            <div className="font-semibold text-xs text-base-content/70 pb-1 border-b border-base-200">
              Updated Nutrition Summary:
            </div>
            <div className="flex justify-between font-bold text-sm text-primary">
              <span>Calories:</span>
              <span>{Math.round(baseCalories * Number(servings || 0))} kcal</span>
            </div>
            <div className="flex justify-between">
              <span>Protein:</span>
              <span>{(baseProtein * Number(servings || 0)).toFixed(1)} g</span>
            </div>
            <div className="flex justify-between">
              <span>Carbohydrates:</span>
              <span>{(baseCarbs * Number(servings || 0)).toFixed(1)} g</span>
            </div>
            <div className="flex justify-between">
              <span>Fat:</span>
              <span>{(baseFat * Number(servings || 0)).toFixed(1)} g</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-base-300/40 border-t border-base-300 flex justify-end gap-2">
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary gap-1"
            disabled={loading}
            onClick={handleSave}
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>
                <Check size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditFoodLogModal;
