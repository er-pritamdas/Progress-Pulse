import React, { useState, useEffect } from "react";
import { Activity, Droplet, Zap, Info, Minus, Plus, PieChart } from "lucide-react";

const DonutChart = ({ ratios, customCalories, setCustomCalories }) => {
  const size = 250;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Data for segments
  const segments = [
    { name: "Protein", value: ratios.protein, color: "#3b82f6" }, // Blue
    { name: "Carbs", value: ratios.carbs, color: "#10b981" },   // Green
    { name: "Fats", value: ratios.fats, color: "#f59e0b" }      // Amber
  ];

  let accumulatedPercent = 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="#1f2937" // gray-800
          strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {segments.map((seg, idx) => {
          const percent = seg.value / 100;
          const dashArray = circumference;
          const dashOffset = circumference * (1 - percent);
          const rotation = accumulatedPercent * 360;
          accumulatedPercent += percent;

          return (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transformOrigin: "center",
                transform: `rotate(${rotation}deg)`,
                transition: "stroke-dashoffset 0.5s ease-in-out"
              }}
            />
          );
        })}
      </svg>
      {/* Center Input */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-sm opacity-70 mb-1">Calories</span>
        <input
          type="number"
          className="input input-ghost text-3xl font-bold w-32 text-center p-0 h-auto focus:bg-transparent focus:text-primary"
          value={customCalories}
          onChange={(e) => setCustomCalories(Number(e.target.value))}
        />
      </div>
    </div>
  );
};

const MacroMicroCalculator = ({ maintenanceCalories, age, gender }) => {
  // --- Macros State ---
  // Default Ratios: 30% Protein, 40% Carbs, 30% Fats
  const [ratios, setRatios] = useState({ protein: 30, carbs: 40, fats: 30 });
  const [grams, setGrams] = useState({ protein: 0, carbs: 0, fats: 0 });
  const [customCalories, setCustomCalories] = useState(maintenanceCalories || 0);

  // --- Micros State ---
  const [micros, setMicros] = useState({});

  // --- Constants ---
  const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fats: 9 };
  const RECOMMENDED_RANGES = {
    protein: "10-35%",
    carbs: "45-65%",
    fats: "20-35%"
  };

  // --- Effects ---

  // 1. Sync customCalories with maintenanceCalories prop
  useEffect(() => {
    if (maintenanceCalories) {
      setCustomCalories(maintenanceCalories);
    }
  }, [maintenanceCalories]);

  // 2. Calculate Macros when customCalories or ratios change
  useEffect(() => {
    const caloriesToUse = customCalories || 0;

    if (!caloriesToUse) {
      setGrams({ protein: 0, carbs: 0, fats: 0 });
      return;
    }

    const proteinCals = caloriesToUse * (ratios.protein / 100);
    const carbsCals = caloriesToUse * (ratios.carbs / 100);
    const fatsCals = caloriesToUse * (ratios.fats / 100);

    setGrams({
      protein: Math.round(proteinCals / CALORIES_PER_GRAM.protein),
      carbs: Math.round(carbsCals / CALORIES_PER_GRAM.carbs),
      fats: Math.round(fatsCals / CALORIES_PER_GRAM.fats),
    });
  }, [customCalories, ratios]);

  // 3. Calculate Micros based on Age and Gender
  useEffect(() => {
    // Simplified DRI (Dietary Reference Intakes) Logic
    const isMale = gender === "male";

    const newMicros = {
      vitamins: [
        { name: "Vitamin A", value: isMale ? "900 mcg" : "700 mcg", icon: "🥕" },
        { name: "Vitamin B1 (Thiamine)", value: isMale ? "1.2 mg" : "1.1 mg", icon: "🌾" },
        { name: "Vitamin B2 (Riboflavin)", value: isMale ? "1.3 mg" : "1.1 mg", icon: "🥛" },
        { name: "Vitamin B3 (Niacin)", value: isMale ? "16 mg" : "14 mg", icon: "🥜" },
        { name: "Vitamin B5 (Pantothenic Acid)", value: "5 mg", icon: "🥑" },
        { name: "Vitamin B6 (Pyridoxine)", value: age > 50 ? (isMale ? "1.7 mg" : "1.5 mg") : "1.3 mg", icon: "🍌" },
        { name: "Vitamin B7 (Biotin)", value: "30 mcg", icon: "🌰" },
        { name: "Vitamin B9 (Folate)", value: "400 mcg", icon: "🥬" },
        { name: "Vitamin B12", value: "2.4 mcg", icon: "🥩" },
        { name: "Vitamin C", value: isMale ? "90 mg" : "75 mg", icon: "🍊" },
        { name: "Vitamin D", value: "15-20 mcg", icon: "☀️" },
        { name: "Vitamin E", value: "15 mg", icon: "🌻" },
        { name: "Vitamin K", value: isMale ? "120 mcg" : "90 mcg", icon: "🥦" },
      ],
      minerals: [
        { name: "Calcium", value: "1000 mg", icon: "🥛" },
        { name: "Iron", value: isMale ? "8 mg" : (age > 50 ? "8 mg" : "18 mg"), icon: "🍖" },
        { name: "Magnesium", value: isMale ? "400-420 mg" : "310-320 mg", icon: "🍫" },
        { name: "Zinc", value: isMale ? "11 mg" : "8 mg", icon: "🦪" },
        { name: "Potassium", value: "3400 mg", icon: "🍌" },
        { name: "Sodium", value: "1500-2300 mg", icon: "🧂" },
        { name: "Phosphorus", value: "700 mg", icon: "🦴" },
      ],
      essentialFats: [
        { name: "Omega-3", value: isMale ? "1.6 g" : "1.1 g", icon: "🐟" },
        { name: "Omega-6", value: isMale ? "17 g" : "12 g", icon: "🥜" },
      ]
    };
    setMicros(newMicros);
  }, [age, gender]);

  // --- Handlers ---
  const handleRatioChange = (type, value) => {
    let newValue = Number(value);
    if (newValue < 0) newValue = 0;
    if (newValue > 100) newValue = 100;

    setRatios((prev) => {
      return { ...prev, [type]: newValue };
    });
  };

  const adjustRatio = (type, delta) => {
    handleRatioChange(type, ratios[type] + delta);
  };

  const totalRatio = ratios.protein + ratios.carbs + ratios.fats;
  const isRatioValid = totalRatio === 100;

  // --- Calories per Macro Calculation ---
  const proteinCalories = Math.round((customCalories || 0) * (ratios.protein / 100));
  const carbsCalories = Math.round((customCalories || 0) * (ratios.carbs / 100));
  const fatsCalories = Math.round((customCalories || 0) * (ratios.fats / 100));

  // --- Modal State ---
  const [selectedMicro, setSelectedMicro] = useState(null);

  const openMicroModal = (microName) => {
    setSelectedMicro(MICRO_DETAILS[microName] || null);
    if (MICRO_DETAILS[microName]) {
      document.getElementById("micro_info_modal").showModal();
    }
  };

  return (
    <div className="bg-base-300 rounded-xl p-6 shadow-md mt-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Activity size={22} /> Macro & Micro Nutrient Calculator
      </h2>

      {!maintenanceCalories ? (
        <div className="alert alert-info">
          <Info size={20} />
          <span>Please calculate your calories in the section above first.</span>
        </div>
      ) : (
        <div className="tabs tabs-border w-full mt-4">
          {/* Tab 1: Recommended Micros */}
          <input type="radio" name="macro_tabs" className="tab" aria-label="Micros" />
          <div className="tab-content border-base-300 bg-base-100 p-4 rounded-b-xl">

            {/* --- MICROS --- */}
            <div className="card bg-base-200 p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap size={18} /> Recommended Micros & Essential Nutrients
              </h3>
              <p className="text-xs opacity-60 mb-6">
                Based on Age: <span className="font-bold">{age}</span>, Gender: <span className="font-bold capitalize">{gender}</span>. (General DRI guidelines)
              </p>

              <div className="space-y-8">
                {/* 1. Vitamins */}
                <div>
                  <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2 border-b border-base-300 pb-2">
                    <Droplet size={14} /> Vitamins
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {micros.vitamins?.map((m, idx) => (
                      <div key={idx} className="bg-base-100 p-3 rounded-lg border border-base-300 flex flex-col items-center text-center hover:border-primary transition-colors hover:shadow-sm group relative">
                        <button
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs btn-circle"
                          onClick={() => openMicroModal(m.name)}
                        >
                          <Info size={14} className="text-primary" />
                        </button>
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{m.icon}</span>
                        <span className="text-xs font-bold mb-1">{m.name}</span>
                        <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-full">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Minerals (Electrolytes) */}
                <div>
                  <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2 border-b border-base-300 pb-2">
                    <Activity size={14} /> Minerals (Electrolytes)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {micros.minerals?.map((m, idx) => (
                      <div key={idx} className="bg-base-100 p-3 rounded-lg border border-base-300 flex flex-col items-center text-center hover:border-secondary transition-colors hover:shadow-sm group relative">
                        <button
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs btn-circle"
                          onClick={() => openMicroModal(m.name)}
                        >
                          <Info size={14} className="text-secondary" />
                        </button>
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{m.icon}</span>
                        <span className="text-xs font-bold mb-1">{m.name}</span>
                        <span className="text-xs text-secondary font-mono bg-secondary/10 px-2 py-0.5 rounded-full">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Essential Fatty Acids */}
                <div>
                  <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2 border-b border-base-300 pb-2">
                    <Zap size={14} /> Essential Fatty Acids
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {micros.essentialFats?.map((m, idx) => (
                      <div key={idx} className="bg-base-100 p-3 rounded-lg border border-base-300 flex flex-col items-center text-center hover:border-warning transition-colors hover:shadow-sm group relative">
                        <button
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs btn-circle"
                          onClick={() => openMicroModal(m.name)}
                        >
                          <Info size={14} className="text-warning" />
                        </button>
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{m.icon}</span>
                        <span className="text-xs font-bold mb-1">{m.name}</span>
                        <span className="text-xs text-warning font-mono bg-warning/10 px-2 py-0.5 rounded-full">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab 2: Macro Calculator */}
          <input type="radio" name="macro_tabs" className="tab" aria-label="Macro" defaultChecked />
          <div className="tab-content border-base-300 bg-base-100 p-4 rounded-b-xl">

            {/* --- MACROS --- */}
            <div className="card bg-base-200 p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart size={18} /> Macro Breakdown
              </h3>

              <div className="flex flex-col lg:flex-row items-center gap-12">

                {/* Sliders & Inputs (Left) */}
                <div className="flex-1 w-full space-y-6">

                  {/* Protein */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-info font-bold flex items-center gap-2">
                        Protein <span className="badge badge-xs badge-soft badge-info">Recommend: {RECOMMENDED_RANGES.protein}</span>
                      </span>
                      <span className="opacity-70 font-mono">{grams.protein}g ({proteinCalories} kcal)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="btn btn-xs btn-circle btn-soft" onClick={() => adjustRatio("protein", -1)}><Minus size={14} /></button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ratios.protein}
                        onChange={(e) => handleRatioChange("protein", e.target.value)}
                        className="range range-xs range-info flex-1"
                      />
                      <button className="btn btn-xs btn-circle btn-soft" onClick={() => adjustRatio("protein", 1)}><Plus size={14} /></button>
                      <span className="text-sm font-bold w-10 text-right">{ratios.protein}%</span>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-success font-bold flex items-center gap-2">
                        Carbs <span className="badge badge-xs badge-soft badge-success">Recommend: {RECOMMENDED_RANGES.carbs}</span>
                      </span>
                      <span className="opacity-70 font-mono">{grams.carbs}g ({carbsCalories} kcal)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="btn btn-xs btn-circle btn-soft" onClick={() => adjustRatio("carbs", -1)}><Minus size={14} /></button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ratios.carbs}
                        onChange={(e) => handleRatioChange("carbs", e.target.value)}
                        className="range range-xs range-success flex-1"
                      />
                      <button className="btn btn-xs btn-circle btn-soft" onClick={() => adjustRatio("carbs", 1)}><Plus size={14} /></button>
                      <span className="text-sm font-bold w-10 text-right">{ratios.carbs}%</span>
                    </div>
                  </div>

                  {/* Fats */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-warning font-bold flex items-center gap-2">
                        Fats <span className="badge badge-xs badge-soft badge-warning">Recommend: {RECOMMENDED_RANGES.fats}</span>
                      </span>
                      <span className="opacity-70 font-mono">{grams.fats}g ({fatsCalories} kcal)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="btn btn-xs btn-circle btn-soft" onClick={() => adjustRatio("fats", -1)}><Minus size={14} /></button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ratios.fats}
                        onChange={(e) => handleRatioChange("fats", e.target.value)}
                        className="range range-xs range-warning flex-1"
                      />
                      <button className="btn btn-xs btn-circle btn-soft" onClick={() => adjustRatio("fats", 1)}><Plus size={14} /></button>
                      <span className="text-sm font-bold w-10 text-right">{ratios.fats}%</span>
                    </div>
                  </div>

                  {/* Total Validation */}
                  <div className={`text-sm text-center font-medium p-2 rounded-lg ${isRatioValid ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                    Total Ratio: {totalRatio}% {isRatioValid ? "✅" : "⚠️ (Must be 100%)"}
                  </div>
                </div>

                {/* Chart (Right) */}
                <div className="flex-shrink-0">
                  <DonutChart ratios={ratios} customCalories={customCalories} setCustomCalories={setCustomCalories} />
                </div>
              </div>

              {/* Calculation Explanation */}
              <div className="collapse collapse-arrow bg-base-100 mt-6 border border-base-300">
                <input type="checkbox" />
                <div className="collapse-title text-sm font-medium flex items-center gap-2">
                  <Info size={16} /> How is this calculated?
                </div>
                <div className="collapse-content space-y-4">
                  <p className="text-xs opacity-60">
                    We use standard nutritional values where <strong>1g Protein/Carb = 4 kcal</strong> and <strong>1g Fat = 9 kcal</strong>.
                  </p>

                  {/* Calories Coming From Each Macro Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-base-200/70 rounded-xl border border-base-300 text-center">
                    <div className="bg-info/10 border border-info/20 p-3 rounded-lg flex flex-col items-center">
                      <span className="text-xs text-info font-bold uppercase tracking-wider mb-1">Protein Calories</span>
                      <span className="text-xl font-extrabold text-info font-mono">{proteinCalories} kcal</span>
                      <span className="text-[11px] opacity-70 mt-0.5">{ratios.protein}% of total calories</span>
                    </div>
                    <div className="bg-success/10 border border-success/20 p-3 rounded-lg flex flex-col items-center">
                      <span className="text-xs text-success font-bold uppercase tracking-wider mb-1">Carbs Calories</span>
                      <span className="text-xl font-extrabold text-success font-mono">{carbsCalories} kcal</span>
                      <span className="text-[11px] opacity-70 mt-0.5">{ratios.carbs}% of total calories</span>
                    </div>
                    <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex flex-col items-center">
                      <span className="text-xs text-warning font-bold uppercase tracking-wider mb-1">Fats Calories</span>
                      <span className="text-xl font-extrabold text-warning font-mono">{fatsCalories} kcal</span>
                      <span className="text-[11px] opacity-70 mt-0.5">{ratios.fats}% of total calories</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Protein Calc */}
                    <div className="bg-info/10 border border-info/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Zap size={40} /></div>
                      <h4 className="text-xs font-bold text-info uppercase mb-2">Protein Formula</h4>
                      <div className="text-xs font-mono space-y-1.5">
                        <div className="flex justify-between">
                          <span className="opacity-60">Total Cals:</span>
                          <span>{customCalories} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.protein}%</span>
                        </div>
                        <div className="flex justify-between font-bold text-info border-t border-info/20 pt-1">
                          <span>Macro Cals:</span>
                          <span>{proteinCalories} kcal</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          1. Cals = {customCalories} × {ratios.protein}% = {proteinCalories} kcal
                        </div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          2. Grams = {proteinCalories} ÷ 4 kcal/g
                        </div>
                        <div className="text-center text-base font-bold text-info mt-1">
                          = {grams.protein}g ({proteinCalories} kcal)
                        </div>
                      </div>
                    </div>

                    {/* Carbs Calc */}
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Activity size={40} /></div>
                      <h4 className="text-xs font-bold text-success uppercase mb-2">Carbs Formula</h4>
                      <div className="text-xs font-mono space-y-1.5">
                        <div className="flex justify-between">
                          <span className="opacity-60">Total Cals:</span>
                          <span>{customCalories} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.carbs}%</span>
                        </div>
                        <div className="flex justify-between font-bold text-success border-t border-success/20 pt-1">
                          <span>Macro Cals:</span>
                          <span>{carbsCalories} kcal</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          1. Cals = {customCalories} × {ratios.carbs}% = {carbsCalories} kcal
                        </div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          2. Grams = {carbsCalories} ÷ 4 kcal/g
                        </div>
                        <div className="text-center text-base font-bold text-success mt-1">
                          = {grams.carbs}g ({carbsCalories} kcal)
                        </div>
                      </div>
                    </div>

                    {/* Fats Calc */}
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Droplet size={40} /></div>
                      <h4 className="text-xs font-bold text-warning uppercase mb-2">Fats Formula</h4>
                      <div className="text-xs font-mono space-y-1.5">
                        <div className="flex justify-between">
                          <span className="opacity-60">Total Cals:</span>
                          <span>{customCalories} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.fats}%</span>
                        </div>
                        <div className="flex justify-between font-bold text-warning border-t border-warning/20 pt-1">
                          <span>Macro Cals:</span>
                          <span>{fatsCalories} kcal</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          1. Cals = {customCalories} × {ratios.fats}% = {fatsCalories} kcal
                        </div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          2. Grams = {fatsCalories} ÷ 9 kcal/g
                        </div>
                        <div className="text-center text-base font-bold text-warning mt-1">
                          = {grams.fats}g ({fatsCalories} kcal)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Micro Info Modal --- */}
      <dialog id="micro_info_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          {selectedMicro && (
            <>
              <h3 className="font-bold text-xl flex items-center gap-2 mb-4">
                <Info className="text-primary" /> {selectedMicro.name || "Nutrient Info"}
              </h3>

              <div className="mb-6">
                <p className="opacity-80 text-sm whitespace-pre-wrap">{selectedMicro.description}</p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-bold uppercase opacity-60 mb-2 border-b border-base-300 pb-1">Top Sources</h4>
                <div className="overflow-x-auto bg-base-200/50 rounded-lg">
                  <table className="table table-xs w-full">
                    <thead>
                      <tr>
                        <th>Source</th>
                        <th className="text-right">Amount (approx)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMicro.sources.map((source, idx) => (
                        <tr key={idx} className="hover:bg-base-200">
                          <td className="font-medium">{source.name}</td>
                          <td className="text-right font-mono opacity-80">{source.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase opacity-60 mb-2 border-b border-base-300 pb-1">Key Benefits</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedMicro.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm opacity-80">{benefit}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Close</button>
                </form>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

const MICRO_DETAILS = {
  "Vitamin A": {
    name: "Vitamin A",
    description: "Crucial for healthy vision, immune system function, and cell growth. It exists in two forms: preformed vitamin A (retinol) and provitamin A carotenoids (like beta-carotene).",
    sources: [
      { name: "Beef Liver (cooked)", amount: "7,000 mcg" },
      { name: "Sweet Potato (baked)", amount: "1,400 mcg" },
      { name: "Carrots (cooked)", amount: "1,300 mcg" },
      { name: "Spinach", amount: "570 mcg" },
      { name: "Cantaloupe", amount: "270 mcg" }
    ],
    benefits: ["Maintains healthy vision (especially in low light)", "Supports immune system health", "Promotes healthy skin and cell growth"]
  },
  "Vitamin B1 (Thiamine)": {
    name: "Vitamin B1 (Thiamine)",
    description: "Enables the body to use carbohydrates as energy. Essential for glucose metabolism and plays a key role in nerve, muscle, and heart function.",
    sources: [
      { name: "Enriched Rice & Whole Grains", amount: "1.2 mg" },
      { name: "Pork Chops", amount: "0.9 mg" },
      { name: "Sunflower Seeds", amount: "0.4 mg" },
      { name: "Black Beans", amount: "0.4 mg" },
      { name: "Macadamia Nuts", amount: "0.3 mg" }
    ],
    benefits: ["Helps convert food into cellular energy", "Supports healthy nervous system function", "Crucial for muscle contraction and cardiac health"]
  },
  "Vitamin B2 (Riboflavin)": {
    name: "Vitamin B2 (Riboflavin)",
    description: "Helps break down proteins, fats, and carbohydrates. It plays a vital role in maintaining the body's energy supply and cell growth.",
    sources: [
      { name: "Beef Liver", amount: "2.9 mg" },
      { name: "Eggs", amount: "0.5 mg" },
      { name: "Milk & Yogurt", amount: "0.4 mg" },
      { name: "Lean Pork", amount: "0.3 mg" },
      { name: "Spinach", amount: "0.2 mg" }
    ],
    benefits: ["Supports cellular energy production", "Promotes healthy skin and vision", "Acts as a cellular antioxidant"]
  },
  "Vitamin B3 (Niacin)": {
    name: "Vitamin B3 (Niacin)",
    description: "Helps convert food into energy and supports digestive health, skin function, and nervous system operations. Also helps manage cholesterol levels.",
    sources: [
      { name: "Chicken Breast", amount: "14.8 mg" },
      { name: "Tuna (canned)", amount: "11.3 mg" },
      { name: "Beef", amount: "7.5 mg" },
      { name: "Peanuts", amount: "3.8 mg" },
      { name: "Brown Rice", amount: "2.5 mg" }
    ],
    benefits: ["Improves cholesterol profile (lowers LDL, raises HDL)", "Supports brain function and skin health", "Enhances DNA repair and cellular energy"]
  },
  "Vitamin B5 (Pantothenic Acid)": {
    name: "Vitamin B5 (Pantothenic Acid)",
    description: "Essential for making blood cells and converting food (fats and carbohydrates) into usable energy.",
    sources: [
      { name: "Shiitake Mushrooms", amount: "3.6 mg" },
      { name: "Avocado", amount: "2.0 mg" },
      { name: "Sunflower Seeds", amount: "2.0 mg" },
      { name: "Chicken Breast", amount: "1.5 mg" },
      { name: "Egg Yolk", amount: "0.8 mg" }
    ],
    benefits: ["Crucial for red blood cell synthesis", "Promotes healthy digestive tract", "Helps produce stress and sex-related hormones"]
  },
  "Vitamin B6 (Pyridoxine)": {
    name: "Vitamin B6 (Pyridoxine)",
    description: "Important for normal brain development and for keeping the nervous system and immune system healthy.",
    sources: [
      { name: "Chickpeas (canned)", amount: "1.1 mg" },
      { name: "Yellowfin Tuna", amount: "0.9 mg" },
      { name: "Beef Liver", amount: "0.9 mg" },
      { name: "Chicken Breast", amount: "0.5 mg" },
      { name: "Banana", amount: "0.4 mg" }
    ],
    benefits: ["Promotes neurotransmitter production (serotonin & dopamine)", "Supports immune function", "Aids in hemoglobin synthesis"]
  },
  "Vitamin B7 (Biotin)": {
    name: "Vitamin B7 (Biotin)",
    description: "Plays a key role in metabolic function and is well known for supporting hair, skin, and nail strength.",
    sources: [
      { name: "Beef Liver", amount: "30.8 mcg" },
      { name: "Whole Egg", amount: "10 mcg" },
      { name: "Salmon", amount: "5 mcg" },
      { name: "Pork Chop", amount: "4.5 mcg" },
      { name: "Sweet Potato", amount: "2.4 mcg" }
    ],
    benefits: ["Strengthens hair, skin, and brittle nails", "Essential for carbohydrate, fat, and protein metabolism", "Supports healthy fetal development"]
  },
  "Vitamin B9 (Folate)": {
    name: "Vitamin B9 (Folate)",
    description: "Crucial for proper brain function and plays an important role in mental and emotional health. Essential during pregnancy to prevent birth defects.",
    sources: [
      { name: "Beef Liver", amount: "215 mcg" },
      { name: "Spinach (cooked)", amount: "131 mcg" },
      { name: "Black-Eyed Peas", amount: "105 mcg" },
      { name: "Asparagus", amount: "89 mcg" },
      { name: "Avocado", amount: "60 mcg" }
    ],
    benefits: ["Prevents neural tube defects during pregnancy", "Essential for DNA synthesis and repair", "Supports red blood cell maturation"]
  },
  "Vitamin B12": {
    name: "Vitamin B12",
    description: "Keeps the body's nerve and blood cells healthy and helps make DNA. It also helps prevent megaloblastic anemia.",
    sources: [
      { name: "Clams (cooked)", amount: "84 mcg" },
      { name: "Beef Liver", amount: "70 mcg" },
      { name: "Trout", amount: "5.4 mcg" },
      { name: "Salmon", amount: "4.8 mcg" },
      { name: "Nutritional Yeast", amount: "Variable" }
    ],
    benefits: ["Supports proper nerve function", "Essential for red blood cell formation", "Boosts energy levels"]
  },
  "Vitamin C": {
    name: "Vitamin C",
    description: "A powerful antioxidant that protects cells from damage. It is vital for collagen production, iron absorption, and immune function.",
    sources: [
      { name: "Guava", amount: "377 mg" },
      { name: "Red Bell Pepper", amount: "150 mg" },
      { name: "Kiwi", amount: "93 mg" },
      { name: "Orange", amount: "70 mg" },
      { name: "Strawberries", amount: "60 mg" }
    ],
    benefits: ["Boosts immune system", "Promotes healthy skin and wound healing", "Improves absorption of iron from plant foods"]
  },
  "Vitamin D": {
    name: "Vitamin D",
    description: "Unique because your body can make it when exposed to sunlight. It promotes calcium absorption and is essential for bone growth and remodeling.",
    sources: [
      { name: "Sunlight Exposure", amount: "Variable" },
      { name: "Salmon (cooked)", amount: "15 mcg" },
      { name: "Tuna", amount: "6 mcg" },
      { name: "Fortified Milk", amount: "3 mcg" },
      { name: "Egg Yolk", amount: "1 mcg" }
    ],
    benefits: ["Strengthens bones and teeth", "Supports immune, brain, and nervous system health", "Regulates insulin levels"]
  },
  "Vitamin E": {
    name: "Vitamin E",
    description: "An antioxidant that protects body tissue from damage caused by free radicals. Key for strong immunity and healthy skin.",
    sources: [
      { name: "Wheat Germ Oil", amount: "20 mg" },
      { name: "Sunflower Seeds", amount: "10 mg" },
      { name: "Almonds", amount: "7 mg" },
      { name: "Avocado", amount: "4 mg" },
      { name: "Spinach", amount: "2 mg" }
    ],
    benefits: ["Protects cells from damage", "Supports immune function", "Promotes skin health"]
  },
  "Vitamin K": {
    name: "Vitamin K",
    description: "Essential for the blood clotting process (without it, you would bleed out from a small cut) and for building strong bones.",
    sources: [
      { name: "Kale (cooked)", amount: "544 mcg" },
      { name: "Spinach (cooked)", amount: "494 mcg" },
      { name: "Collard Greens", amount: "386 mcg" },
      { name: "Brussels Sprouts", amount: "109 mcg" },
      { name: "Broccoli", amount: "110 mcg" }
    ],
    benefits: ["Vital for blood clotting", "Supports bone health and density", "Helps prevent heart disease"]
  },
  "Calcium": {
    name: "Calcium",
    description: "The most abundant mineral in the body. primarily found in bones and teeth. Also critical for heart, muscle, and nerve function.",
    sources: [
      { name: "Yogurt (plain)", amount: "415 mg" },
      { name: "Cheese (Mozzarella)", amount: "333 mg" },
      { name: "Sardines (canned)", amount: "325 mg" },
      { name: "Milk", amount: "300 mg" },
      { name: "Tofu (calcium-set)", amount: "253 mg" }
    ],
    benefits: ["Builds and maintains strong bones", "Enables muscle contraction", "Essential for heart functioning"]
  },
  "Iron": {
    name: "Iron",
    description: "A major component of hemoglobin, a protein in red blood cells that carries oxygen from your lungs to all parts of the body.",
    sources: [
      { name: "Oysters", amount: "8 mg" },
      { name: "White Beans", amount: "8 mg" },
      { name: "Beef Liver", amount: "5 mg" },
      { name: "Lentils", amount: "3 mg" },
      { name: "Spinach", amount: "3 mg" }
    ],
    benefits: ["Transports oxygen throughout the body", "Supports energy metabolism", "Essential for brain development"]
  },
  "Magnesium": {
    name: "Magnesium",
    description: "An essential electrolyte involved in over 300 biochemical reactions in the body, including muscle contraction and nerve transmission.",
    sources: [
      { name: "Pumpkin Seeds", amount: "156 mg" },
      { name: "Chia Seeds", amount: "111 mg" },
      { name: "Almonds", amount: "80 mg" },
      { name: "Spinach (cooked)", amount: "78 mg" },
      { name: "Dark Chocolate", amount: "64 mg" }
    ],
    benefits: ["Supports muscle and nerve function", "Regulates blood pressure and fluid balance", "Supports immune system health"]
  },
  "Zinc": {
    name: "Zinc",
    description: "Needed for the body's defensive (immune) system to work properly. It plays a role in cell division, cell growth, wound healing, and carbohydrate metabolism.",
    sources: [
      { name: "Oysters", amount: "74 mg" },
      { name: "Beef", amount: "7 mg" },
      { name: "Crab", amount: "6.5 mg" },
      { name: "Pumpkin Seeds", amount: "2 mg" },
      { name: "Chickpeas", amount: "1.3 mg" }
    ],
    benefits: ["Boosts immune system", "Accelerates wound healing", "Supports proper sense of taste and smell"]
  },
  "Potassium": {
    name: "Potassium",
    description: "A major electrolyte that counteracts sodium to maintain healthy blood pressure, fluid balance, and muscle contractions.",
    sources: [
      { name: "Dried Apricots", amount: "1,101 mg" },
      { name: "Lentils", amount: "731 mg" },
      { name: "Potato (baked)", amount: "610 mg" },
      { name: "Banana", amount: "422 mg" },
      { name: "Avocado", amount: "364 mg" }
    ],
    benefits: ["Regulates fluid balance & hydration", "Helps control blood pressure", "Prevents muscle cramps and fatigue"]
  },
  "Sodium": {
    name: "Sodium",
    description: "A vital electrolyte essential for maintaining fluid balance, nerve transmission, and proper muscle function.",
    sources: [
      { name: "Table Salt (1 tsp)", amount: "2,300 mg" },
      { name: "Pickles", amount: "800 mg" },
      { name: "Soy Sauce (1 tbsp)", amount: "1,000 mg" },
      { name: "Cheese (Feta)", amount: "320 mg" },
      { name: "Celery", amount: "50 mg" }
    ],
    benefits: ["Maintains cellular hydration & blood volume", "Essential for conducting nerve impulses", "Facilitates muscle contraction and relaxation"]
  },
  "Phosphorus": {
    name: "Phosphorus",
    description: "Works closely with calcium to build strong bones and teeth, and plays a key role in energy storage (ATP synthesis).",
    sources: [
      { name: "Salmon", amount: "315 mg" },
      { name: "Turkey Breast", amount: "217 mg" },
      { name: "Pumpkin Seeds", amount: "330 mg" },
      { name: "Milk", amount: "220 mg" },
      { name: "Quinoa", amount: "140 mg" }
    ],
    benefits: ["Builds and preserves bone structure and teeth", "Critical for ATP (cellular energy) production", "Filters waste and repairs cells and tissues"]
  },
  "Omega-3": {
    name: "Omega-3 Fatty Acids",
    description: "Essential polyunsaturated fatty acids (ALA, EPA, DHA) that reduce inflammation and support heart, brain, and joint health.",
    sources: [
      { name: "Wild Salmon (3 oz)", amount: "1.8 g" },
      { name: "Flaxseeds (1 tbsp)", amount: "2.4 g" },
      { name: "Chia Seeds (1 tbsp)", amount: "2.5 g" },
      { name: "Walnuts (1 oz)", amount: "2.5 g" },
      { name: "Mackerel", amount: "2.0 g" }
    ],
    benefits: ["Lowers systemic inflammation", "Promotes cardiovascular and brain health", "Supports eye and joint wellness"]
  },
  "Omega-6": {
    name: "Omega-6 Fatty Acids",
    description: "Essential fatty acids (primarily Linoleic Acid) required for normal growth, skin health, and brain functioning.",
    sources: [
      { name: "Sunflower Seeds (1 oz)", amount: "9.3 g" },
      { name: "Walnuts (1 oz)", amount: "10.8 g" },
      { name: "Sesame Oil (1 tbsp)", amount: "5.6 g" },
      { name: "Peanut Butter (2 tbsp)", amount: "4.4 g" },
      { name: "Pine Nuts (1 oz)", amount: "9.4 g" }
    ],
    benefits: ["Supports healthy hair and skin barrier", "Helps regulate cellular metabolism", "Supports skeletal and bone health"]
  }
};

export default MacroMicroCalculator;
