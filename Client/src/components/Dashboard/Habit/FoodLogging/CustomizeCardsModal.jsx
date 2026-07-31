import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, Check, RefreshCw, Sparkles } from "lucide-react";
import { NUTRIENT_CATEGORIES } from "./DailyNutrientsModal";

function CustomizeCardsModal({ isOpen, onClose, visibleCards, toggleCardVisibility, setVisibleCards }) {
  const [activeCategory, setActiveCategory] = useState("All");

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

  const categories = ["All", ...Object.keys(NUTRIENT_CATEGORIES)];

  const handleResetDefaults = () => {
    const defaultCards = ["calories", "protein", "carbohydrates", "fat"];
    setVisibleCards(defaultCards);
    localStorage.setItem("food_tracker_visible_cards", JSON.stringify(defaultCards));
  };

  const handleSelectAllCategory = (catName) => {
    const idsInCat = catName === "All"
      ? Object.values(NUTRIENT_CATEGORIES).flat().map((n) => n.id)
      : NUTRIENT_CATEGORIES[catName]?.map((n) => n.id) || [];

    const newCards = Array.from(new Set([...visibleCards, ...idsInCat]));
    setVisibleCards(newCards);
    localStorage.setItem("food_tracker_visible_cards", JSON.stringify(newCards));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-base-200 rounded-3xl max-w-3xl w-full h-[82vh] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 text-primary rounded-2xl">
              <SlidersHorizontal size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Customize Overview Cards</h2>
              <p className="text-xs text-base-content/70">
                Choose which nutrient cards to pin to your daily overview (<span className="font-bold text-primary">{visibleCards.length}</span> selected).
              </p>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
          {/* Quick Action Toolbar */}
          <div className="flex justify-between items-center flex-wrap gap-2 bg-base-100 p-3 rounded-2xl border border-base-300 text-xs">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-xs btn-ghost border border-base-300 rounded-lg gap-1"
                onClick={handleResetDefaults}
              >
                <RefreshCw size={12} /> Reset Defaults
              </button>
              {activeCategory !== "All" && (
                <button
                  className="btn btn-xs btn-outline btn-primary rounded-lg gap-1"
                  onClick={() => handleSelectAllCategory(activeCategory)}
                >
                  <Check size={12} /> Select All {activeCategory}
                </button>
              )}
            </div>
            <span className="text-base-content/60 font-medium">
              Changes are saved automatically
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-xs sm:btn-sm rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? "btn-primary shadow-md"
                    : "btn-ghost border border-base-300 text-base-content/70"
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Nutrient Selection Grid */}
          <div className="space-y-6">
            {Object.entries(NUTRIENT_CATEGORIES)
              .filter(([catName]) => activeCategory === "All" || activeCategory === catName)
              .map(([catName, nutList]) => (
                <div key={catName} className="space-y-3">
                  <div className="flex justify-between items-center border-b border-base-300 pb-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                      <Sparkles size={14} /> {catName}
                    </h3>
                    <button
                      className="text-[11px] text-primary hover:underline font-semibold"
                      onClick={() => handleSelectAllCategory(catName)}
                    >
                      Select all in {catName}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nutList.map((n) => {
                      const Icon = n.icon;
                      const isSelected = visibleCards.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          onClick={() => toggleCardVisibility(n.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-sm"
                              : "bg-base-100 border-base-300 hover:border-base-400 opacity-80"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-base-200`}>
                              <Icon size={18} className={n.color} />
                            </div>
                            <div>
                              <div className="font-bold text-xs">{n.label}</div>
                              <div className="text-[10px] text-base-content/60 font-medium">
                                Unit: {n.unit || "N/A"}
                              </div>
                            </div>
                          </div>

                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary rounded-md"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div onClick
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-base-300/80 border-t border-base-300 flex justify-end shrink-0">
          <button className="btn btn-sm btn-primary rounded-xl px-6 gap-1" onClick={onClose}>
            <Check size={16} /> Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomizeCardsModal;
