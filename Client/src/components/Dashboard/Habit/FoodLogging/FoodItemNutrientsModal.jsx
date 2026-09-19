import React, { useState, useEffect } from "react";
import { X, Utensils, Sparkles, Flame, Dumbbell, Wheat, PieChart, Info } from "lucide-react";
import { NUTRIENT_CATEGORIES } from "./DailyNutrientsModal";
import NutrientWikiModal from "./NutrientWikiModal";

const formatServingCalc = (item) => {
  if (!item) return "";
  const foodObj = item.foodId || item;
  const servingSize = Number(item.servingSize || foodObj.servingSize) || 1;
  const servings = Number(item.servings) || 1;
  const fmtNum = (num) => (Math.round(num * 100) / 100).toString();
  const rawUnit = (item.unitType || foodObj.unitType || "g").trim();

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

function FoodItemNutrientsModal({ isOpen, onClose, foodItem }) {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedWikiNutrient, setSelectedWikiNutrient] = useState(null);

  useEffect(() => {
    if (isOpen && foodItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, foodItem]);

  if (!isOpen || !foodItem) return null;

  const foodObj = foodItem.foodId || foodItem;
  const servings = Number(foodItem.servings) || 1;
  const totalWeight = (foodItem.servingSize || foodObj.servingSize || 100) * servings;
  const unit = foodItem.unitType || foodObj.unitType || "g";

  const getNutrientVal = (n) => {
    let rawVal = foodItem[n.id];
    if (rawVal === undefined || rawVal === null) {
      rawVal = foodObj ? foodObj[n.id] : 0;
    }

    if (n.id === "netCarbs") {
      const carbsRaw = foodItem.carbohydrates !== undefined ? foodItem.carbohydrates : (foodObj?.carbohydrates || 0);
      const fiberRaw = foodItem.fiber !== undefined ? foodItem.fiber : (foodObj?.fiber || 0);
      const carbs = (typeof carbsRaw === "number" ? carbsRaw : parseFloat(String(carbsRaw).replace(/[^0-9.]/g, "")) || 0) * servings;
      const fiber = (typeof fiberRaw === "number" ? fiberRaw : parseFloat(String(fiberRaw).replace(/[^0-9.]/g, "")) || 0) * servings;
      return Math.max(0, parseFloat((carbs - fiber).toFixed(1)));
    }

    const num = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) {
      const scaled = num * servings;
      if (n.id === "calories" || n.id === "water") {
        return Math.round(scaled);
      }
      return parseFloat(scaled.toFixed(1));
    }

    return rawVal || "0";
  };

  const categoriesToDisplay =
    activeTab === "All"
      ? Object.keys(NUTRIENT_CATEGORIES)
      : [activeTab];

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-base-200 rounded-3xl max-w-2xl w-full max-h-[90vh] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with small, well-proportioned heading & zero overlap */}
        <div className="px-4 sm:px-5 py-3 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 bg-secondary/15 text-secondary rounded-xl shrink-0">
              <Utensils size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-base-content truncate max-w-[200px] sm:max-w-[360px]" title={foodItem.foodName || foodObj.name}>
                  {foodItem.foodName || foodObj.name}
                </h2>
                <span className="badge badge-primary badge-xs font-bold shrink-0">
                  {servings} Serving{servings !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-[11px] text-base-content/70 truncate mt-0.5" title={`${formatServingCalc(foodItem)} • ${foodObj.brand || "Generic"}`}>
                Portion: <span className="font-bold text-primary">{formatServingCalc(foodItem)}</span> • {foodObj.brand || "Generic"}
              </p>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost shrink-0 text-base-content/70 hover:text-base-content" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto min-h-0">
          {/* Key Macros Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-base-100 p-3 rounded-2xl border border-base-300 shadow-2xs text-center">
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-error uppercase flex items-center justify-center gap-1">
                <Flame size={12} /> Calories
              </div>
              <div className="text-base sm:text-lg font-black truncate">{getNutrientVal({ id: "calories" })} kcal</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-info uppercase flex items-center justify-center gap-1">
                <Dumbbell size={12} /> Protein
              </div>
              <div className="text-base sm:text-lg font-black truncate">{getNutrientVal({ id: "protein" })} g</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-warning uppercase flex items-center justify-center gap-1">
                <Wheat size={12} /> Carbs
              </div>
              <div className="text-base sm:text-lg font-black truncate">{getNutrientVal({ id: "carbohydrates" })} g</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold text-success uppercase flex items-center justify-center gap-1">
                <PieChart size={12} /> Fat
              </div>
              <div className="text-base sm:text-lg font-black truncate">{getNutrientVal({ id: "fat" })} g</div>
            </div>
          </div>

          {/* Category Tabs (No wrapping, no scrollbar, horizontally scrollable) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-hidden select-none shrink-0">
            {["All", ...Object.keys(NUTRIENT_CATEGORIES)].map((tab) => (
              <button
                key={tab}
                className={`btn btn-xs rounded-xl font-bold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === tab
                    ? "btn-primary shadow-xs"
                    : "btn-ghost bg-base-100 hover:bg-base-300/60 border border-base-300 text-base-content/70"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Macronutrients" ? "Macros" : tab}
              </button>
            ))}
          </div>

          {/* Categorized Nutrient Breakdown */}
          <div className="space-y-4">
            {categoriesToDisplay.map((category) => {
              const nutrients = NUTRIENT_CATEGORIES[category] || [];
              const categoryTitle = category === "Macronutrients" ? "Macros" : category;
              return (
                <div key={category} className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-base-300/60 pb-1">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles size={13} /> {categoryTitle}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
                    {nutrients.map((n) => {
                      const Icon = n.icon;
                      const val = getNutrientVal(n);
                      return (
                        <div
                          key={n.id}
                          className="bg-base-100 p-2.5 sm:p-3 rounded-2xl border border-base-300 shadow-2xs flex flex-col justify-between min-w-0"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1" title={n.label}>
                              <Icon size={13} className={`${n.color} shrink-0`} />
                              <span className="text-xs font-bold text-base-content/85 truncate">
                                {n.label}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs p-1 text-info hover:bg-info/10 rounded-lg transition-all shrink-0 h-6 w-6 min-h-0"
                              title={`Learn more about ${n.label}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWikiNutrient(n);
                              }}
                            >
                              <Info size={13} />
                            </button>
                          </div>
                          <div className="flex items-baseline gap-1 mt-auto min-w-0">
                            <span className="text-base sm:text-lg font-black tracking-tight text-base-content truncate">
                              {val}
                            </span>
                            <span className="text-[10px] font-semibold text-base-content/50 shrink-0">
                              {n.unit}
                            </span>
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

        {/* Footer */}
        <div className="p-4 bg-base-300/80 border-t border-base-300 flex justify-end shrink-0">
          <button className="btn btn-sm btn-neutral rounded-xl px-5" onClick={onClose}>
            Close Details
          </button>
        </div>
      </div>

      <NutrientWikiModal
        isOpen={!!selectedWikiNutrient}
        onClose={() => setSelectedWikiNutrient(null)}
        nutrient={selectedWikiNutrient}
      />
    </div>
  );
}

export default FoodItemNutrientsModal;
