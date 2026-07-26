import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../Context/AxiosInstance";
import { PlusCircle, Check, AlertCircle } from "lucide-react";

function AddCustomFoodModal({ isOpen, onClose, onFoodAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "Generic",
    category: "General",
    subCategory: "",
    unitType: "100 g",
    servingSize: 100,
    notes: "",
    // Macronutrients
    calories: "",
    protein: "",
    carbohydrates: "",
    fat: "",
    fiber: "",
    sugar: "",
    addedSugar: "",
    // Vitamins
    vitaminA: "",
    vitaminB1: "",
    vitaminB2: "",
    vitaminB3: "",
    vitaminB5: "",
    vitaminB6: "",
    vitaminB7: "",
    vitaminB9: "",
    vitaminB12: "",
    vitaminC: "",
    vitaminD: "",
    vitaminE: "",
    vitaminK: "",
    // Minerals
    iron: "",
    zinc: "",
    copper: "",
    manganese: "",
    selenium: "",
    iodine: "",
    // Fatty Acids
    saturatedFat: "",
    monounsaturatedFat: "",
    polyunsaturatedFat: "",
    omega3: "",
    omega6: "",
    transFat: "",
    // Others
    cholesterol: "",
    glycemicIndex: "",
    glycemicLoad: "",
    water: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Food name is required!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = {
        ...formData,
        servingSize: Number(formData.servingSize) || 100,
        calories: Number(formData.calories) || 0,
        protein: Number(formData.protein) || 0,
        carbohydrates: Number(formData.carbohydrates) || 0,
        fat: Number(formData.fat) || 0,
        fiber: Number(formData.fiber) || 0,
        sugar: Number(formData.sugar) || 0,
        addedSugar: Number(formData.addedSugar) || 0,
      };

      await axiosInstance.post("/v1/dashboard/habit/food/database", payload);

      if (onFoodAdded) onFoodAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create custom food item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-18 pb-6 px-3 sm:px-6 overflow-hidden">
      <div className="bg-base-200 rounded-3xl max-w-3xl w-full h-[580px] sm:h-[620px] max-h-[calc(100vh-80px)] border border-base-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-base-300/80 border-b border-base-300 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <PlusCircle className="text-secondary" size={22} /> Add Custom Food Item
          </h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto min-h-0">
          {error && (
            <div className="alert alert-error mb-4 text-sm py-2 px-3 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Food Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Home Cooked Chicken Curry"
                  className="input input-sm input-bordered w-full bg-base-100"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Brand / Source</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Homemade, Brand X"
                  className="input input-sm input-bordered w-full bg-base-100"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Category</label>
                <select
                  name="category"
                  className="select select-sm select-bordered w-full bg-base-100"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="General">General</option>
                  <option value="Grains">Grains</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat & Poultry">Meat & Poultry</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Processed Foods">Processed Foods</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Unit Type</label>
                <input
                  type="text"
                  name="unitType"
                  placeholder="100 g, 1 Piece, 1 Cup"
                  className="input input-sm input-bordered w-full bg-base-100"
                  value={formData.unitType}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Serving Size</label>
                <input
                  type="number"
                  name="servingSize"
                  placeholder="100"
                  className="input input-sm input-bordered w-full bg-base-100"
                  value={formData.servingSize}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Macronutrients */}
            <div className="bg-base-100 p-4 rounded-xl border border-base-300 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                Macronutrients (Optional - per serving)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    name="calories"
                    placeholder="0"
                    className="input input-sm input-bordered w-full"
                    value={formData.calories}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="protein"
                    placeholder="0"
                    className="input input-sm input-bordered w-full"
                    value={formData.protein}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="carbohydrates"
                    placeholder="0"
                    className="input input-sm input-bordered w-full"
                    value={formData.carbohydrates}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="fat"
                    placeholder="0"
                    className="input input-sm input-bordered w-full"
                    value={formData.fat}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="text-xs block mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="fiber"
                    placeholder="0"
                    className="input input-sm input-bordered w-full"
                    value={formData.fiber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1">Sugar (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="sugar"
                    placeholder="0"
                    className="input input-sm input-bordered w-full"
                    value={formData.sugar}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs block mb-1">Added Sugar (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="addedSugar"
                    placeholder="0"
                    className="input input-sm input-bordered w-full"
                    value={formData.addedSugar}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Collapsible: Vitamins */}
            <details className="bg-base-100 rounded-xl border border-base-300 group">
              <summary className="p-3 font-semibold text-xs cursor-pointer flex justify-between items-center text-primary uppercase tracking-wider">
                <span>💊 Vitamins (Optional)</span>
                <span className="text-xs text-base-content/50 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-3 border-t border-base-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { name: "vitaminA", label: "Vit A (mcg)", ph: "e.g. 900" },
                  { name: "vitaminB1", label: "Vit B1 (mg)", ph: "e.g. 1.2" },
                  { name: "vitaminB2", label: "Vit B2 (mg)", ph: "e.g. 1.3" },
                  { name: "vitaminB3", label: "Vit B3 (mg)", ph: "e.g. 16" },
                  { name: "vitaminB5", label: "Vit B5 (mg)", ph: "e.g. 5" },
                  { name: "vitaminB6", label: "Vit B6 (mg)", ph: "e.g. 1.7" },
                  { name: "vitaminB7", label: "Vit B7 (mcg)", ph: "e.g. 30" },
                  { name: "vitaminB9", label: "Vit B9 (mcg)", ph: "e.g. 400" },
                  { name: "vitaminB12", label: "Vit B12 (mcg)", ph: "e.g. 2.4" },
                  { name: "vitaminC", label: "Vit C (mg)", ph: "e.g. 90" },
                  { name: "vitaminD", label: "Vit D (IU)", ph: "e.g. 600" },
                  { name: "vitaminE", label: "Vit E (mg)", ph: "e.g. 15" },
                  { name: "vitaminK", label: "Vit K (mcg)", ph: "e.g. 120" },
                ].map((v) => (
                  <div key={v.name}>
                    <label className="block mb-1 font-medium">{v.label}</label>
                    <input
                      type="text"
                      name={v.name}
                      placeholder={v.ph}
                      className="input input-xs input-bordered w-full"
                      value={formData[v.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </details>

            {/* Collapsible: Trace Minerals */}
            <details className="bg-base-100 rounded-xl border border-base-300 group">
              <summary className="p-3 font-semibold text-xs cursor-pointer flex justify-between items-center text-primary uppercase tracking-wider">
                <span>🪨 Trace Minerals (Optional)</span>
                <span className="text-xs text-base-content/50 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-3 border-t border-base-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { name: "iron", label: "Iron (mg)", ph: "e.g. 18" },
                  { name: "zinc", label: "Zinc (mg)", ph: "e.g. 11" },
                  { name: "copper", label: "Copper (mg)", ph: "e.g. 0.9" },
                  { name: "manganese", label: "Manganese (mg)", ph: "e.g. 2.3" },
                  { name: "selenium", label: "Selenium (mcg)", ph: "e.g. 55" },
                  { name: "iodine", label: "Iodine (mcg)", ph: "e.g. 150" },
                ].map((m) => (
                  <div key={m.name}>
                    <label className="block mb-1 font-medium">{m.label}</label>
                    <input
                      type="text"
                      name={m.name}
                      placeholder={m.ph}
                      className="input input-xs input-bordered w-full"
                      value={formData[m.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </details>

            {/* Collapsible: Fatty Acids & Lipids */}
            <details className="bg-base-100 rounded-xl border border-base-300 group">
              <summary className="p-3 font-semibold text-xs cursor-pointer flex justify-between items-center text-primary uppercase tracking-wider">
                <span>🥑 Fatty Acids & Lipids (Optional)</span>
                <span className="text-xs text-base-content/50 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-3 border-t border-base-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { name: "saturatedFat", label: "Saturated Fat (g)", ph: "e.g. 5" },
                  { name: "monounsaturatedFat", label: "Monounsaturated (g)", ph: "e.g. 10" },
                  { name: "polyunsaturatedFat", label: "Polyunsaturated (g)", ph: "e.g. 4" },
                  { name: "omega3", label: "Omega-3 (g)", ph: "e.g. 1.6" },
                  { name: "omega6", label: "Omega-6 (g)", ph: "e.g. 17" },
                  { name: "transFat", label: "Trans Fat (g)", ph: "e.g. 0" },
                ].map((fa) => (
                  <div key={fa.name}>
                    <label className="block mb-1 font-medium">{fa.label}</label>
                    <input
                      type="text"
                      name={fa.name}
                      placeholder={fa.ph}
                      className="input input-xs input-bordered w-full"
                      value={formData[fa.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </details>

            {/* Collapsible: Others, GI/GL & Water */}
            <details className="bg-base-100 rounded-xl border border-base-300 group">
              <summary className="p-3 font-semibold text-xs cursor-pointer flex justify-between items-center text-primary uppercase tracking-wider">
                <span>💧 Others, GI/GL & Water (Optional)</span>
                <span className="text-xs text-base-content/50 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="p-3 border-t border-base-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { name: "cholesterol", label: "Cholesterol (mg)", ph: "e.g. 50" },
                  { name: "water", label: "Water (g/ml)", ph: "e.g. 100" },
                  { name: "glycemicIndex", label: "Glycemic Index (GI)", ph: "e.g. 55" },
                  { name: "glycemicLoad", label: "Glycemic Load (GL)", ph: "e.g. 10" },
                ].map((o) => (
                  <div key={o.name}>
                    <label className="block mb-1 font-medium">{o.label}</label>
                    <input
                      type="text"
                      name={o.name}
                      placeholder={o.ph}
                      className="input input-xs input-bordered w-full"
                      value={formData[o.name]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </details>

            <div className="modal-action border-t border-base-300 pt-3">
              <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-sm btn-secondary gap-1" disabled={loading}>
                {loading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <>
                    <Check size={16} /> Save to Database
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCustomFoodModal;
