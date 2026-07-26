import React, { useState, useEffect } from "react";
import { X, Utensils, Sparkles, Flame, Dumbbell, Wheat, PieChart, Info } from "lucide-react";
import { NUTRIENT_CATEGORIES } from "./DailyNutrientsModal";
import NutrientWikiModal from "./NutrientWikiModal";

const formatServingCalc = (item) => {
  if (!item) return "";
  const servingSize = Number(item.servingSize) || 1;
  const servings = Number(item.servings) || 1;
  const total = servingSize * servings;
  const fmtNum = (num) => (Math.round(num * 100) / 100).toString();

  const rawUnit = (item.unitType || "g").trim();

  const match = rawUnit.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    const unitNum = parseFloat(match[1]);
    const unitText = match[2].trim();
    if (unitText) {
      const space = unitText.length > 2 ? " " : "";
      const baseLabel = `${fmtNum(unitNum)}${space}${unitText}`;
      const totalLabel = `${fmtNum(total)}${space}${unitText}`;
      return `${baseLabel} * ${fmtNum(servings)} = ${totalLabel}`;
    }
    const baseLabel = `${fmtNum(unitNum)}`;
    const totalLabel = `${fmtNum(total)}`;
    return `${baseLabel} * ${fmtNum(servings)} = ${totalLabel}`;
  }

  const space = rawUnit.length > 2 ? " " : "";
  const baseLabel = `${fmtNum(servingSize)}${space}${rawUnit}`;
  const totalLabel = `${fmtNum(total)}${space}${rawUnit}`;
  return `${baseLabel} * ${fmtNum(servings)} = ${totalLabel}`;
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
  const servings = foodItem.servings || 1;
  const totalWeight = (foodItem.servingSize || foodObj.servingSize || 100) * servings;
  const unit = foodItem.unitType || foodObj.unitType || "g";

  const getNutrientVal = (n) => {
    let rawVal = foodItem[n.id];
    if (rawVal === undefined || rawVal === null) {
      rawVal = foodObj ? foodObj[n.id] : 0;
    }

    if (n.id === "netCarbs") {
      const carbs = foodItem.carbohydrates !== undefined ? foodItem.carbohydrates : (foodObj?.carbohydrates || 0);
      const fiber = foodItem.fiber !== undefined ? foodItem.fiber : (foodObj?.fiber || 0);
      return Math.max(0, parseFloat((carbs - fiber).toFixed(1)));
    }

    if (n.id === "calories" || n.id === "water") {
      if (typeof rawVal === "number") return Math.round(rawVal);
      const num = parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));
      return !isNaN(num) ? Math.round(num * servings) : "0";
    }

    if (typeof rawVal === "number") {
      return parseFloat(rawVal.toFixed(1));
    }

    const num = parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) {
      return parseFloat((num * servings).toFixed(1));
    }

    return rawVal || "0";
  };

  const categoriesToDisplay =
    activeTab === "All"
      ? Object.keys(NUTRIENT_CATEGORIES)
      : [activeTab];

  return (
    <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-18 pb-6 px-3 sm:px-6 overflow-hidden">
      <div className="bg-base-200 rounded-3xl max-w-3xl w-full h-[580px] sm:h-[620px] max-h-[calc(100vh-80px)] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/20 text-secondary rounded-2xl">
              <Utensils size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {foodItem.foodName || foodObj.name}
              </h2>
              <p className="text-xs text-base-content/70">
                Logged Portion: <span className="font-bold text-primary">{formatServingCalc(foodItem)}</span> • {foodObj.brand || "Generic"}
              </p>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
          {/* Key Macros Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-base-100 p-4 rounded-2xl border border-base-300 shadow-sm text-center">
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-error uppercase flex items-center justify-center gap-1">
                <Flame size={14} /> Calories
              </div>
              <div className="text-xl font-extrabold">{getNutrientVal({ id: "calories" })} kcal</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-info uppercase flex items-center justify-center gap-1">
                <Dumbbell size={14} /> Protein
              </div>
              <div className="text-xl font-extrabold">{getNutrientVal({ id: "protein" })} g</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-warning uppercase flex items-center justify-center gap-1">
                <Wheat size={14} /> Carbs
              </div>
              <div className="text-xl font-extrabold">{getNutrientVal({ id: "carbohydrates" })} g</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-success uppercase flex items-center justify-center gap-1">
                <PieChart size={14} /> Fat
              </div>
              <div className="text-xl font-extrabold">{getNutrientVal({ id: "fat" })} g</div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["All", "Macronutrients", "Vitamins", "Trace Minerals", "Fatty Acids", "Others"].map((tab) => (
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

          {/* Categorized Nutrient Breakdown */}
          <div className="space-y-6">
            {categoriesToDisplay.map((category) => {
              const nutrients = NUTRIENT_CATEGORIES[category] || [];
              return (
                <div key={category} className="space-y-3">
                  <div className="flex justify-between items-center border-b border-base-300 pb-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                      <Sparkles size={14} /> {category}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {nutrients.map((n) => {
                      const Icon = n.icon;
                      const val = getNutrientVal(n);
                      return (
                        <div
                          key={n.id}
                          className="bg-base-100 p-3.5 rounded-2xl border border-base-300 shadow-sm flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-base-content/80 truncate flex items-center gap-1.5">
                              <Icon size={14} className={n.color} />
                              {n.label}
                            </span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs p-1 text-info hover:bg-info/10 rounded-lg transition-all"
                              title={`Learn more about ${n.label}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWikiNutrient(n);
                              }}
                            >
                              <Info size={14} />
                            </button>
                          </div>
                          <div className="flex items-baseline gap-1 my-1">
                            <span className="text-lg font-extrabold tracking-tight">
                              {val}
                            </span>
                            <span className="text-xs font-semibold text-base-content/60">
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
