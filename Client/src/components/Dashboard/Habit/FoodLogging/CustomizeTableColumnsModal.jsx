import React, { useState, useEffect } from "react";
import { X, Table, Check, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { NUTRIENT_CATEGORIES } from "./DailyNutrientsModal";

function CustomizeTableColumnsModal({ isOpen, onClose, tableNutrients, setTableNutrients }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setErrorMsg("");
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
    const defaultNutrients = ["calories", "protein", "carbohydrates", "fat"];
    setTableNutrients(defaultNutrients);
    localStorage.setItem("food_tracker_table_nutrients", JSON.stringify(defaultNutrients));
    setErrorMsg("");
  };

  const toggleNutrient = (nutId) => {
    if (tableNutrients.includes(nutId)) {
      if (tableNutrients.length <= 1) {
        setErrorMsg("Must keep at least 1 nutrient column in table.");
        return;
      }
      const updated = tableNutrients.filter((id) => id !== nutId);
      setTableNutrients(updated);
      localStorage.setItem("food_tracker_table_nutrients", JSON.stringify(updated));
      setErrorMsg("");
    } else {
      if (tableNutrients.length >= 5) {
        setErrorMsg("Maximum 5 nutrients allowed for meal log table columns.");
        return;
      }
      const updated = [...tableNutrients, nutId];
      setTableNutrients(updated);
      localStorage.setItem("food_tracker_table_nutrients", JSON.stringify(updated));
      setErrorMsg("");
    }
  };

  const isMaxReached = tableNutrients.length >= 5;

  return (
    <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-20 pb-6 px-3 sm:px-6 overflow-hidden">
      <div className="bg-base-200 rounded-3xl max-w-3xl w-full h-[580px] sm:h-[620px] max-h-[calc(100vh-100px)] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 text-primary rounded-2xl">
              <Table size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Customize Logged Food Columns
                <span className={`badge badge-sm font-bold ${isMaxReached ? "badge-warning" : "badge-primary"}`}>
                  {tableNutrients.length}/5 Selected
                </span>
              </h2>
              <p className="text-xs text-base-content/70">
                Choose up to 5 nutrients to show as columns in your Breakfast, Lunch, Dinner tables.
              </p>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
          {errorMsg && (
            <div className="alert alert-warning py-2 px-3 text-xs flex items-center gap-2 rounded-xl">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Action Toolbar */}
          <div className="flex justify-between items-center flex-wrap gap-2 bg-base-100 p-3 rounded-2xl border border-base-300 text-xs">
            <button
              className="btn btn-xs btn-ghost border border-base-300 rounded-lg gap-1"
              onClick={handleResetDefaults}
            >
              <RefreshCw size={12} /> Reset Defaults (Cal, P, C, F)
            </button>
            <span className="text-base-content/60 font-medium">
              Changes apply live to all meal tables
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-xs rounded-xl font-bold transition-all whitespace-nowrap ${
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
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2 border-b border-base-300 pb-1">
                    <Sparkles size={14} /> {catName}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nutList.map((n) => {
                      const Icon = n.icon;
                      const isSelected = tableNutrients.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          onClick={() => toggleNutrient(n.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                            isSelected
                              ? "bg-primary/10 border-primary shadow-sm"
                              : "bg-base-100 border-base-300 hover:border-base-400 opacity-80"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-base-200">
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
                            onChange={() => {}}
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

export default CustomizeTableColumnsModal;
