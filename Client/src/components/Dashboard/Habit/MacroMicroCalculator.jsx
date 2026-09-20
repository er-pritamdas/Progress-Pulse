import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Activity, Droplet, Zap, Info, Minus, Plus, PieChart, ExternalLink, Settings, HeartPulse, Sparkles } from "lucide-react";

const DonutChart = ({ ratios, calorieMin, calorieMax, size = 250, strokeWidth = 20 }) => {
  const navigate = useNavigate();
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
      {/* Center Non-Editable Content displaying selected Settings Min and Max */}
      <div className="absolute flex flex-col items-center justify-center text-center px-4">
        <span className="text-[10px] font-bold text-base-content/60 uppercase tracking-wider mb-0.5">
          Intake Target
        </span>
        <div
          className="text-base sm:text-lg font-extrabold text-primary font-mono leading-tight hover:underline cursor-pointer"
          onClick={() => navigate("/dashboard/habit/logging")}
          title="Click to edit Min & Max calories in Habit Profile"
        >
          {calorieMin} – {calorieMax}
        </div>
        <span className="text-[10px] font-semibold text-base-content/70">kcal / day</span>
        <button
          className="btn btn-[10px] btn-xs btn-ghost text-primary p-0 h-auto min-h-0 mt-1 hover:underline flex items-center gap-1 cursor-pointer font-bold"
          onClick={() => navigate("/dashboard/habit/logging")}
          title="Go to Habit Profile to edit min/max calories"
        >
          <span>Edit in Settings</span>
          <ExternalLink size={9} />
        </button>
      </div>
    </div>
  );
};

const MacroMicroCalculator = ({ maintenanceCalories, age, gender }) => {
  const navigate = useNavigate();
  // --- Redux Habit Settings Intake Min & Max ---
  const habitSettings = useSelector((state) => state.habit?.settings);

  const calorieMin = habitSettings?.intake?.min || (maintenanceCalories ? Math.round(maintenanceCalories * 0.9) : 1500);
  const calorieMax = habitSettings?.intake?.max || (maintenanceCalories ? Math.round(maintenanceCalories * 1.1) : 2500);

  // --- Macros State ---
  // Default Ratios: 30% Protein, 40% Carbs, 30% Fats
  const [ratios, setRatios] = useState(() => {
    try {
      const saved = localStorage.getItem("macro_ratios");
      return saved ? JSON.parse(saved) : { protein: 30, carbs: 40, fats: 30 };
    } catch (e) {
      return { protein: 30, carbs: 40, fats: 30 };
    }
  });

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

  // Save ratios to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem("macro_ratios", JSON.stringify(ratios));
    } catch (e) {
      console.error("Failed to save macro_ratios to localStorage", e);
    }
  }, [ratios]);

  // --- Macro Min and Max Calculations ---
  // Protein (4 kcal/g)
  const proteinMinCals = Math.round(calorieMin * (ratios.protein / 100));
  const proteinMaxCals = Math.round(calorieMax * (ratios.protein / 100));
  const proteinMinGrams = Math.round(proteinMinCals / 4);
  const proteinMaxGrams = Math.round(proteinMaxCals / 4);

  // Carbs (4 kcal/g)
  const carbsMinCals = Math.round(calorieMin * (ratios.carbs / 100));
  const carbsMaxCals = Math.round(calorieMax * (ratios.carbs / 100));
  const carbsMinGrams = Math.round(carbsMinCals / 4);
  const carbsMaxGrams = Math.round(carbsMaxCals / 4);

  // Fats (9 kcal/g)
  const fatsMinCals = Math.round(calorieMin * (ratios.fats / 100));
  const fatsMaxCals = Math.round(calorieMax * (ratios.fats / 100));
  const fatsMinGrams = Math.round(fatsMinCals / 9);
  const fatsMaxGrams = Math.round(fatsMaxCals / 9);

  // 3. Calculate Micros based on Age and Gender
  useEffect(() => {
    // Simplified DRI (Dietary Reference Intakes) Logic
    const isMale = gender === "male";

    const newMicros = {
      vitamins: [
        { name: "Vitamin A", value: isMale ? "900 mcg" : "700 mcg", icon: "🥕" },
        { name: "Vitamin B1", value: isMale ? "1.2 mg" : "1.1 mg", icon: "🌾" },
        { name: "Vitamin B2", value: isMale ? "1.3 mg" : "1.1 mg", icon: "🥛" },
        { name: "Vitamin B3", value: isMale ? "16 mg" : "14 mg", icon: "🥜" },
        { name: "Vitamin B5", value: "5 mg", icon: "🥑" },
        { name: "Vitamin B6", value: age > 50 ? (isMale ? "1.7 mg" : "1.5 mg") : "1.3 mg", icon: "🍌" },
        { name: "Vitamin B7", value: "30 mcg", icon: "🌰" },
        { name: "Vitamin B9", value: "400 mcg", icon: "🥬" },
        { name: "Vitamin B12", value: "2.4 mcg", icon: "🥩" },
        { name: "Vitamin C", value: isMale ? "90 mg" : "75 mg", icon: "🍊" },
        { name: "Vitamin D", value: age > 70 ? "20 mcg" : "15 mcg", icon: "☀️" },
        { name: "Vitamin E", value: "15 mg", icon: "🌻" },
        { name: "Vitamin K", value: isMale ? "120 mcg" : "90 mcg", icon: "🥦" },
      ],
      minerals: [
        { name: "Calcium", value: age > 50 ? (isMale && age <= 70 ? "1000 mg" : "1200 mg") : "1000 mg", icon: "🥛" },
        { name: "Magnesium", value: isMale ? "400-420 mg" : "310-320 mg", icon: "🍫" },
        { name: "Phosphorus", value: "700 mg", icon: "🦴" },
        { name: "Potassium", value: isMale ? "3400 mg" : "2600 mg", icon: "🍌" },
        { name: "Sodium", value: "< 2300 mg", icon: "🧂" },
        { name: "Iron", value: isMale ? "8 mg" : (age > 50 ? "8 mg" : "18 mg"), icon: "🍖" },
        { name: "Zinc", value: isMale ? "11 mg" : "8 mg", icon: "🦪" },
        { name: "Copper", value: "900 mcg", icon: "🍄" },
        { name: "Manganese", value: isMale ? "2.3 mg" : "1.8 mg", icon: "🌾" },
        { name: "Selenium", value: "55 mcg", icon: "🌰" },
        { name: "Iodine", value: "150 mcg", icon: "🌊" },
      ],
      fattyAcids: [
        { name: "Saturated Fat", value: "< 10% cals", icon: "🧈" },
        { name: "Monounsaturated", value: "15-20% cals", icon: "🫒" },
        { name: "Polyunsaturated", value: "5-10% cals", icon: "🌻" },
        { name: "Omega-3", value: isMale ? "1.6 g" : "1.1 g", icon: "🐟" },
        { name: "Omega-6", value: isMale ? "17 g" : "12 g", icon: "🥜" },
        { name: "Trans Fat", value: "< 1% (0g)", icon: "🚫" },
      ],
      others: [
        { name: "Cholesterol", value: "< 300 mg", icon: "🍳" },
        { name: "Glycemic Index", value: "< 55 (Low)", icon: "📊" },
        { name: "Glycemic Load", value: "< 10 (Low)", icon: "📈" },
        { name: "Water", value: isMale ? "3.7 L" : "2.7 L", icon: "💧" },
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

  // --- Mobile Single Horizontal Progress Bar Handlers ---
  const horizontalBarRef = useRef(null);
  const [activeDragHandle, setActiveDragHandle] = useState(null);

  const handlePointerDown = (handleIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDragHandle(handleIndex);

    const targetEl = e.currentTarget;
    if (targetEl && targetEl.setPointerCapture) {
      try {
        targetEl.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    const onPointerMove = (moveEvent) => {
      if (!horizontalBarRef.current) return;
      const rect = horizontalBarRef.current.getBoundingClientRect();
      const rawX = moveEvent.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, Math.round((rawX / rect.width) * 100)));

      setRatios((prev) => {
        const currentP = Number(prev.protein) || 30;
        const currentC = Number(prev.carbs) || 40;
        const currentF = Number(prev.fats) || 30;
        const b2 = Math.min(95, Math.max(currentP + 5, currentP + currentC));

        if (handleIndex === 1) {
          const newP = Math.max(5, Math.min(b2 - 5, pct));
          const newC = b2 - newP;
          const newF = 100 - (newP + newC);
          return { protein: newP, carbs: newC, fats: newF };
        } else {
          const b1 = Math.max(5, Math.min(90, currentP));
          const newB2 = Math.max(b1 + 5, Math.min(95, pct));
          const newC = newB2 - b1;
          const newF = 100 - newB2;
          return { protein: b1, carbs: newC, fats: newF };
        }
      });
    };

    const onPointerUp = (upEvent) => {
      setActiveDragHandle(null);
      if (targetEl && targetEl.releasePointerCapture) {
        try {
          targetEl.releasePointerCapture(upEvent.pointerId);
        } catch (err) {}
      }
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const adjustMacroPhone = (macro, delta) => {
    setRatios((prev) => {
      let p = Number(prev.protein) || 30;
      let c = Number(prev.carbs) || 40;
      let f = Number(prev.fats) || 30;

      if (macro === "protein") {
        const targetP = Math.max(5, Math.min(80, p + delta));
        const diff = targetP - p;
        if (diff > 0) {
          if (c - diff >= 5) c -= diff;
          else {
            const rem = diff - (c - 5);
            c = 5;
            f = Math.max(5, f - rem);
          }
        } else {
          c -= diff;
        }
        p = targetP;
      } else if (macro === "carbs") {
        const targetC = Math.max(5, Math.min(80, c + delta));
        const diff = targetC - c;
        if (diff > 0) {
          if (f - diff >= 5) f -= diff;
          else {
            const rem = diff - (f - 5);
            f = 5;
            p = Math.max(5, p - rem);
          }
        } else {
          f -= diff;
        }
        c = targetC;
      } else if (macro === "fats") {
        const targetF = Math.max(5, Math.min(80, f + delta));
        const diff = targetF - f;
        if (diff > 0) {
          if (c - diff >= 5) c -= diff;
          else {
            const rem = diff - (c - 5);
            c = 5;
            p = Math.max(5, p - rem);
          }
        } else {
          c -= diff;
        }
        f = targetF;
      }

      const total = p + c + f;
      if (total !== 100) {
        c += (100 - total);
      }
      return { protein: p, carbs: c, fats: f };
    });
  };

  const totalRatio = ratios.protein + ratios.carbs + ratios.fats;
  const isRatioValid = totalRatio === 100;

  // --- Modal State ---
  const [selectedMicro, setSelectedMicro] = useState(null);

  const openMicroModal = (microName) => {
    const detail = MICRO_DETAILS[microName] || {
      name: microName,
      description: `${microName} is an essential nutrient supporting overall health, vitality, and metabolic function.`,
      sources: [{ name: "Whole Foods & Balanced Nutrition", amount: "Variable" }],
      benefits: ["Supports general physiological metabolism", "Promotes daily wellness and cellular function"]
    };
    setSelectedMicro(detail);
  };

  const closeMicroModal = () => {
    setSelectedMicro(null);
  };

  // Close on Escape key press without any layout shift
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedMicro) {
        setSelectedMicro(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMicro]);

  return (
    <div className="bg-transparent md:bg-base-300 rounded-xl p-0 md:p-6 shadow-none md:shadow-md mt-0 md:mt-8 w-full">
      <h2 className="text-xl font-bold mb-6 hidden md:flex items-center gap-2">
        <Activity size={22} /> Macro & Micro Nutrient Calculator
      </h2>

      {!maintenanceCalories ? (
        <div className="alert alert-info">
          <Info size={20} />
          <span>Please calculate your calories in the section above first.</span>
        </div>
      ) : (
        <>
          {/* ── Desktop View (hidden md:block) — UNTOUCHED ── */}
          <div className="hidden md:block">
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

                {/* 2. Minerals */}
                <div>
                  <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2 border-b border-base-300 pb-2">
                    <Activity size={14} className="text-secondary" /> Minerals
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

                {/* 3. Fatty Acids */}
                <div>
                  <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2 border-b border-base-300 pb-2">
                    <HeartPulse size={14} className="text-warning" /> Fatty Acids
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {micros.fattyAcids?.map((m, idx) => (
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

                {/* 4. Others */}
                <div>
                  <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2 border-b border-base-300 pb-2">
                    <Sparkles size={14} className="text-accent" /> Others
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {micros.others?.map((m, idx) => (
                      <div key={idx} className="bg-base-100 p-3 rounded-lg border border-base-300 flex flex-col items-center text-center hover:border-accent transition-colors hover:shadow-sm group relative">
                        <button
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs btn-circle"
                          onClick={() => openMicroModal(m.name)}
                        >
                          <Info size={14} className="text-accent" />
                        </button>
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{m.icon}</span>
                        <span className="text-xs font-bold mb-1">{m.name}</span>
                        <span className="text-xs text-accent font-mono bg-accent/10 px-2 py-0.5 rounded-full">{m.value}</span>
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
                      <span className="opacity-80 font-mono text-xs font-semibold text-info">
                        {proteinMinGrams}g – {proteinMaxGrams}g ({proteinMinCals} – {proteinMaxCals} kcal)
                      </span>
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
                      <span className="opacity-80 font-mono text-xs font-semibold text-success">
                        {carbsMinGrams}g – {carbsMaxGrams}g ({carbsMinCals} – {carbsMaxCals} kcal)
                      </span>
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
                      <span className="opacity-80 font-mono text-xs font-semibold text-warning">
                        {fatsMinGrams}g – {fatsMaxGrams}g ({fatsMinCals} – {fatsMaxCals} kcal)
                      </span>
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
                  <DonutChart ratios={ratios} calorieMin={calorieMin} calorieMax={calorieMax} />
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
                    We use standard nutritional values where <strong>1g Protein/Carb = 4 kcal</strong> and <strong>1g Fat = 9 kcal</strong> based on your selected Settings intake range (<strong>{calorieMin} – {calorieMax} kcal</strong>).
                  </p>

                  {/* Calories Coming From Each Macro Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-base-200/70 rounded-xl border border-base-300 text-center">
                    <div className="bg-info/10 border border-info/20 p-3 rounded-lg flex flex-col items-center">
                      <span className="text-xs text-info font-bold uppercase tracking-wider mb-1">Protein Calories</span>
                      <span className="text-lg font-extrabold text-info font-mono">{proteinMinCals} – {proteinMaxCals} kcal</span>
                      <span className="text-[11px] opacity-70 mt-0.5">{ratios.protein}% of target range</span>
                    </div>
                    <div className="bg-success/10 border border-success/20 p-3 rounded-lg flex flex-col items-center">
                      <span className="text-xs text-success font-bold uppercase tracking-wider mb-1">Carbs Calories</span>
                      <span className="text-lg font-extrabold text-success font-mono">{carbsMinCals} – {carbsMaxCals} kcal</span>
                      <span className="text-[11px] opacity-70 mt-0.5">{ratios.carbs}% of target range</span>
                    </div>
                    <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex flex-col items-center">
                      <span className="text-xs text-warning font-bold uppercase tracking-wider mb-1">Fats Calories</span>
                      <span className="text-lg font-extrabold text-warning font-mono">{fatsMinCals} – {fatsMaxCals} kcal</span>
                      <span className="text-[11px] opacity-70 mt-0.5">{ratios.fats}% of target range</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Protein Calc */}
                    <div className="bg-info/10 border border-info/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Zap size={40} /></div>
                      <h4 className="text-xs font-bold text-info uppercase mb-2">Protein Formula</h4>
                      <div className="text-xs font-mono space-y-1.5">
                        <div className="flex justify-between">
                          <span className="opacity-60">Intake Range:</span>
                          <span>{calorieMin} – {calorieMax} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.protein}%</span>
                        </div>
                        <div className="flex justify-between font-bold text-info border-t border-info/20 pt-1">
                          <span>Macro Cals:</span>
                          <span>{proteinMinCals} – {proteinMaxCals} kcal</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          1. Cals = ({calorieMin} – {calorieMax}) × {ratios.protein}%
                        </div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          2. Grams = Cals ÷ 4 kcal/g
                        </div>
                        <div className="text-center text-sm sm:text-base font-bold text-info mt-1">
                          = {proteinMinGrams}g – {proteinMaxGrams}g
                        </div>
                      </div>
                    </div>

                    {/* Carbs Calc */}
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Activity size={40} /></div>
                      <h4 className="text-xs font-bold text-success uppercase mb-2">Carbs Formula</h4>
                      <div className="text-xs font-mono space-y-1.5">
                        <div className="flex justify-between">
                          <span className="opacity-60">Intake Range:</span>
                          <span>{calorieMin} – {calorieMax} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.carbs}%</span>
                        </div>
                        <div className="flex justify-between font-bold text-success border-t border-success/20 pt-1">
                          <span>Macro Cals:</span>
                          <span>{carbsMinCals} – {carbsMaxCals} kcal</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          1. Cals = ({calorieMin} – {calorieMax}) × {ratios.carbs}%
                        </div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          2. Grams = Cals ÷ 4 kcal/g
                        </div>
                        <div className="text-center text-sm sm:text-base font-bold text-success mt-1">
                          = {carbsMinGrams}g – {carbsMaxGrams}g
                        </div>
                      </div>
                    </div>

                    {/* Fats Calc */}
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Droplet size={40} /></div>
                      <h4 className="text-xs font-bold text-warning uppercase mb-2">Fats Formula</h4>
                      <div className="text-xs font-mono space-y-1.5">
                        <div className="flex justify-between">
                          <span className="opacity-60">Intake Range:</span>
                          <span>{calorieMin} – {calorieMax} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.fats}%</span>
                        </div>
                        <div className="flex justify-between font-bold text-warning border-t border-warning/20 pt-1">
                          <span>Macro Cals:</span>
                          <span>{fatsMinCals} – {fatsMaxCals} kcal</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          1. Cals = ({calorieMin} – {calorieMax}) × {ratios.fats}%
                        </div>
                        <div className="text-center font-medium bg-base-100/60 rounded py-1 text-[11px]">
                          2. Grams = Cals ÷ 9 kcal/g
                        </div>
                        <div className="text-center text-sm sm:text-base font-bold text-warning mt-1">
                          = {fatsMinGrams}g – {fatsMaxGrams}g
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          {/* End Desktop View */}
          </div>

          {/* ── Phone View (block md:hidden) — Separate Macros & Micros, No Tabs ── */}
          <div className="block md:hidden space-y-4 mt-0 w-full">
            {/* ═══ SECTION 1: MACRO TARGETS & SINGLE HORIZONTAL INTERACTIVE PROGRESS BAR ═══ */}
            <div className="bg-base-100 rounded-2xl p-3.5 border border-base-content/10 shadow-xs space-y-3.5 w-full">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-base-200/80 pb-2">
                <div className="min-w-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <PieChart size={14} /> Macro Breakdown
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-base-content/70 font-medium">
                      Target: <strong className="font-mono text-base-content">{calorieMin} – {calorieMax}</strong> kcal/day
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/habit/settings")}
                      className="btn btn-ghost btn-xs p-1 h-5 min-h-0 text-primary hover:bg-primary/10 rounded cursor-pointer flex items-center gap-0.5"
                      title="Edit Intake Target in Settings"
                    >
                      <Settings size={11} className="transition-transform hover:rotate-45" />
                    </button>
                  </div>
                </div>

                <span className={`badge badge-xs py-1.5 px-2 font-bold ${isRatioValid ? 'badge-success' : 'badge-error'}`}>
                  {totalRatio}% {isRatioValid ? "✓ Balanced" : "⚠️ Needs 100%"}
                </span>
              </div>

              {/* ── Single Horizontal Interactive Progress Bar (Above Breakdown Cards) ── */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-base-content/60 font-semibold px-0.5">
                  <span>Ratio Distribution</span>
                  <span className="text-[10px] font-semibold text-primary flex items-center gap-1">
                    <span>↔ Drag handles to adjust</span>
                  </span>
                </div>

                <div
                  ref={horizontalBarRef}
                  className="relative w-full h-9 bg-base-300/80 rounded-xl overflow-visible border border-base-content/10 shadow-inner flex flex-row touch-none select-none"
                >
                  {/* Protein Segment (Left) */}
                  <div
                    style={{ width: `${ratios.protein}%` }}
                    className="h-full bg-info text-info-content flex items-center justify-center transition-all duration-75 overflow-hidden rounded-l-xl shrink-0"
                  >
                    {ratios.protein >= 10 && (
                      <div className="flex items-center gap-1 leading-none pointer-events-none px-1">
                        <span className="text-[10px] font-black uppercase tracking-tight">P</span>
                        <span className="text-[9px] font-mono font-bold">{ratios.protein}%</span>
                      </div>
                    )}
                  </div>

                  {/* Divider Handle 1 (Between Protein and Carbs) */}
                  <div
                    style={{ left: `${ratios.protein}%` }}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-col-resize touch-none px-2 py-1 h-11 flex items-center justify-center select-none"
                    onPointerDown={(e) => handlePointerDown(1, e)}
                    title="Drag to change Protein & Carbs ratio"
                  >
                    <div
                      className={`bg-base-100 border-2 ${
                        activeDragHandle === 1 ? "scale-110 border-primary ring-2 ring-primary/40" : "border-info"
                      } text-info shadow-md rounded-full px-1.5 py-0.5 flex items-center justify-center gap-0.5 transition-transform`}
                    >
                      <span className="text-[9px] font-black font-mono leading-none">↔</span>
                    </div>
                  </div>

                  {/* Carbs Segment (Middle) */}
                  <div
                    style={{ width: `${ratios.carbs}%` }}
                    className="h-full bg-success text-success-content flex items-center justify-center transition-all duration-75 overflow-hidden shrink-0"
                  >
                    {ratios.carbs >= 10 && (
                      <div className="flex items-center gap-1 leading-none pointer-events-none px-1">
                        <span className="text-[10px] font-black uppercase tracking-tight">C</span>
                        <span className="text-[9px] font-mono font-bold">{ratios.carbs}%</span>
                      </div>
                    )}
                  </div>

                  {/* Divider Handle 2 (Between Carbs and Fats) */}
                  <div
                    style={{ left: `${ratios.protein + ratios.carbs}%` }}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-col-resize touch-none px-2 py-1 h-11 flex items-center justify-center select-none"
                    onPointerDown={(e) => handlePointerDown(2, e)}
                    title="Drag to change Carbs & Fats ratio"
                  >
                    <div
                      className={`bg-base-100 border-2 ${
                        activeDragHandle === 2 ? "scale-110 border-primary ring-2 ring-primary/40" : "border-warning"
                      } text-warning shadow-md rounded-full px-1.5 py-0.5 flex items-center justify-center gap-0.5 transition-transform`}
                    >
                      <span className="text-[9px] font-black font-mono leading-none">↔</span>
                    </div>
                  </div>

                  {/* Fats Segment (Right) */}
                  <div
                    style={{ width: `${ratios.fats}%` }}
                    className="h-full bg-warning text-warning-content flex items-center justify-center transition-all duration-75 overflow-hidden rounded-r-xl shrink-0"
                  >
                    {ratios.fats >= 10 && (
                      <div className="flex items-center gap-1 leading-none pointer-events-none px-1">
                        <span className="text-[10px] font-black uppercase tracking-tight">F</span>
                        <span className="text-[9px] font-mono font-bold">{ratios.fats}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Breakdown Cards (Full Width Stack Below Horizontal Bar) ── */}
              <div className="space-y-2 pt-1 w-full">
                {/* 1. Protein Card */}
                <div className="bg-info/10 border border-info/25 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs w-full">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-info shrink-0"></span>
                      <span className="text-[11px] font-bold text-info uppercase tracking-wider">Protein</span>
                      <span className="text-[10px] font-medium font-mono text-info bg-base-100/90 px-1.5 py-0.5 rounded border border-info/20 shadow-2xs">
                        {ratios.protein}%
                      </span>
                    </div>
                    <span className="text-[8.5px] font-medium bg-info/20 text-info px-1.5 py-0.5 rounded shrink-0">
                      DRI: {RECOMMENDED_RANGES.protein}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-base-100/70 px-2 py-1 rounded-lg border border-info/15">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] font-medium font-mono text-base-content">
                        {proteinMinGrams}g – {proteinMaxGrams}g
                      </span>
                      <span className="text-[9px] font-normal font-mono text-info/90">
                        ({proteinMinCals} – {proteinMaxCals} kcal)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs p-0 h-5 w-5 min-h-0 text-info hover:bg-info/20 cursor-pointer rounded border border-info/30"
                        onClick={() => adjustMacroPhone("protein", -1)}
                        title="Decrease Protein"
                      >
                        <Minus size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs p-0 h-5 w-5 min-h-0 text-info hover:bg-info/20 cursor-pointer rounded border border-info/30"
                        onClick={() => adjustMacroPhone("protein", 1)}
                        title="Increase Protein"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Carbs Card */}
                <div className="bg-success/10 border border-success/25 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs w-full">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-success shrink-0"></span>
                      <span className="text-[11px] font-bold text-success uppercase tracking-wider">Carbs</span>
                      <span className="text-[10px] font-medium font-mono text-success bg-base-100/90 px-1.5 py-0.5 rounded border border-success/20 shadow-2xs">
                        {ratios.carbs}%
                      </span>
                    </div>
                    <span className="text-[8.5px] font-medium bg-success/20 text-success px-1.5 py-0.5 rounded shrink-0">
                      DRI: {RECOMMENDED_RANGES.carbs}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-base-100/70 px-2 py-1 rounded-lg border border-success/15">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] font-medium font-mono text-base-content">
                        {carbsMinGrams}g – {carbsMaxGrams}g
                      </span>
                      <span className="text-[9px] font-normal font-mono text-success/90">
                        ({carbsMinCals} – {carbsMaxCals} kcal)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs p-0 h-5 w-5 min-h-0 text-success hover:bg-success/20 cursor-pointer rounded border border-success/30"
                        onClick={() => adjustMacroPhone("carbs", -1)}
                        title="Decrease Carbs"
                      >
                        <Minus size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs p-0 h-5 w-5 min-h-0 text-success hover:bg-success/20 cursor-pointer rounded border border-success/30"
                        onClick={() => adjustMacroPhone("carbs", 1)}
                        title="Increase Carbs"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Fats Card */}
                <div className="bg-warning/10 border border-warning/25 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs w-full">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-warning shrink-0"></span>
                      <span className="text-[11px] font-bold text-warning uppercase tracking-wider">Fats</span>
                      <span className="text-[10px] font-medium font-mono text-warning bg-base-100/90 px-1.5 py-0.5 rounded border border-warning/20 shadow-2xs">
                        {ratios.fats}%
                      </span>
                    </div>
                    <span className="text-[8.5px] font-medium bg-warning/20 text-warning px-1.5 py-0.5 rounded shrink-0">
                      DRI: {RECOMMENDED_RANGES.fats}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-base-100/70 px-2 py-1 rounded-lg border border-warning/15">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[11px] font-medium font-mono text-base-content">
                        {fatsMinGrams}g – {fatsMaxGrams}g
                      </span>
                      <span className="text-[9px] font-normal font-mono text-warning/90">
                        ({fatsMinCals} – {fatsMaxCals} kcal)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs p-0 h-5 w-5 min-h-0 text-warning hover:bg-warning/20 cursor-pointer rounded border border-warning/30"
                        onClick={() => adjustMacroPhone("fats", -1)}
                        title="Decrease Fats"
                      >
                        <Minus size={11} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs p-0 h-5 w-5 min-h-0 text-warning hover:bg-warning/20 cursor-pointer rounded border border-warning/30"
                        onClick={() => adjustMacroPhone("fats", 1)}
                        title="Increase Fats"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ SECTION 2: SEPARATE MICROS (NO TABS) ═══ */}
            <div className="bg-base-100 rounded-2xl p-4 border border-base-content/10 shadow-xs space-y-4">
              <div className="border-b border-base-200/80 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Zap size={15} /> Recommended Micros & Nutrients
                </h3>
                <p className="text-[10px] text-base-content/60 font-medium mt-0.5">
                  Based on Age: {age}, Gender: <span className="capitalize">{gender}</span> (DRI guidelines)
                </p>
              </div>

              {/* 1. Vitamins */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-info flex items-center gap-1.5 border-b border-base-200 pb-1">
                  <Droplet size={13} /> Vitamins
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {micros.vitamins?.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-base-200/60 p-2.5 rounded-xl border border-base-content/10 flex flex-col items-center text-center relative"
                    >
                      <button
                        type="button"
                        className="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle text-info p-0.5 h-7 w-7 min-h-0 cursor-pointer z-10 hover:bg-info/15"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openMicroModal(m.name);
                        }}
                        title={`View ${m.name} details`}
                      >
                        <Info size={14} />
                      </button>
                      <span className="text-xl mb-1">{m.icon}</span>
                      <span className="text-[11px] font-bold text-base-content truncate w-full px-1">{m.name}</span>
                      <span className="text-[10px] text-info font-bold font-mono bg-info/10 px-2 py-0.5 rounded-md mt-1">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Minerals */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 border-b border-base-200 pb-1">
                  <Activity size={13} /> Minerals
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {micros.minerals?.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-base-200/60 p-2.5 rounded-xl border border-base-content/10 flex flex-col items-center text-center relative"
                    >
                      <button
                        type="button"
                        className="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle text-secondary p-0.5 h-7 w-7 min-h-0 cursor-pointer z-10 hover:bg-secondary/15"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openMicroModal(m.name);
                        }}
                        title={`View ${m.name} details`}
                      >
                        <Info size={14} />
                      </button>
                      <span className="text-xl mb-1">{m.icon}</span>
                      <span className="text-[11px] font-bold text-base-content truncate w-full px-1">{m.name}</span>
                      <span className="text-[10px] text-secondary font-bold font-mono bg-secondary/10 px-2 py-0.5 rounded-md mt-1">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Fatty Acids */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-1.5 border-b border-base-200 pb-1">
                  <HeartPulse size={13} /> Fatty Acids
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {micros.fattyAcids?.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-base-200/60 p-2.5 rounded-xl border border-base-content/10 flex flex-col items-center text-center relative"
                    >
                      <button
                        type="button"
                        className="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle text-warning p-0.5 h-7 w-7 min-h-0 cursor-pointer z-10 hover:bg-warning/15"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openMicroModal(m.name);
                        }}
                        title={`View ${m.name} details`}
                      >
                        <Info size={14} />
                      </button>
                      <span className="text-xl mb-1">{m.icon}</span>
                      <span className="text-[11px] font-bold text-base-content truncate w-full px-1">{m.name}</span>
                      <span className="text-[10px] text-warning font-bold font-mono bg-warning/10 px-2 py-0.5 rounded-md mt-1">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Others */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5 border-b border-base-200 pb-1">
                  <Sparkles size={13} /> Others
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {micros.others?.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-base-200/60 p-2.5 rounded-xl border border-base-content/10 flex flex-col items-center text-center relative"
                    >
                      <button
                        type="button"
                        className="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle text-accent p-0.5 h-7 w-7 min-h-0 cursor-pointer z-10 hover:bg-accent/15"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openMicroModal(m.name);
                        }}
                        title={`View ${m.name} details`}
                      >
                        <Info size={14} />
                      </button>
                      <span className="text-xl mb-1">{m.icon}</span>
                      <span className="text-[11px] font-bold text-base-content truncate w-full px-1">{m.name}</span>
                      <span className="text-[10px] text-accent font-bold font-mono bg-accent/10 px-2 py-0.5 rounded-md mt-1">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Micro Info Modal (Zero-Layout-Shift Overlay) --- */}
      {selectedMicro && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0"
            onClick={closeMicroModal}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <div className="relative z-10 bg-base-100 border border-base-content/10 shadow-2xl rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-base-content/10">
              <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2 text-base-content">
                <Info className="text-primary shrink-0" size={20} /> {selectedMicro.name || "Nutrient Info"}
              </h3>
              <button
                type="button"
                onClick={closeMicroModal}
                className="btn btn-xs btn-circle btn-ghost text-base-content/60 hover:text-base-content"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs sm:text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap">{selectedMicro.description}</p>
            </div>

            {selectedMicro.sources && selectedMicro.sources.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70 mb-2 border-b border-base-content/10 pb-1">Top Sources</h4>
                <div className="overflow-x-auto bg-base-200/60 border border-base-content/5 rounded-xl">
                  <table className="table table-xs w-full">
                    <thead>
                      <tr className="border-b border-base-content/10 text-base-content/60">
                        <th>Source</th>
                        <th className="text-right">Amount (approx)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMicro.sources.map((source, idx) => (
                        <tr key={idx} className="hover:bg-base-300/40 border-b border-base-content/5 last:border-none">
                          <td className="font-medium text-xs text-base-content">{source.name}</td>
                          <td className="text-right font-mono text-xs text-base-content/80">{source.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedMicro.benefits && selectedMicro.benefits.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70 mb-2 border-b border-base-content/10 pb-1">Key Benefits</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedMicro.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-base-content/80">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-base-content/10 flex justify-end">
              <button type="button" className="btn btn-sm btn-primary rounded-xl px-5 cursor-pointer" onClick={closeMicroModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
  "Vitamin B1": {
    name: "Vitamin B1",
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
  "Vitamin B2": {
    name: "Vitamin B2",
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
  "Vitamin B3": {
    name: "Vitamin B3",
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
  "Vitamin B5": {
    name: "Vitamin B5",
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
  "Vitamin B6": {
    name: "Vitamin B6",
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
  "Vitamin B7": {
    name: "Vitamin B7",
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
  "Vitamin B9": {
    name: "Vitamin B9",
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
  },
  "Copper": {
    name: "Copper",
    description: "An essential trace mineral that works with iron to build red blood cells, sustain blood vessel flexibility, and maintain nervous and immune system health.",
    sources: [
      { name: "Beef Liver (cooked, 3 oz)", amount: "12.4 mg" },
      { name: "Oysters (cooked, 3 oz)", amount: "4.8 mg" },
      { name: "Shiitake Mushrooms (1 cup)", amount: "1.3 mg" },
      { name: "Cashews (1 oz)", amount: "0.6 mg" },
      { name: "Dark Chocolate (70%+, 1 oz)", amount: "0.5 mg" }
    ],
    benefits: ["Works with iron to build functional red blood cells", "Supports heart, blood vessel, and nerve signaling", "Essential enzymatic cofactor for collagen and antioxidant defense"]
  },
  "Manganese": {
    name: "Manganese",
    description: "A vital trace mineral involved in amino acid, cholesterol, glucose, and carbohydrate metabolism. Also crucial for bone formation and connective tissue synthesis.",
    sources: [
      { name: "Mussels (cooked, 3 oz)", amount: "5.8 mg" },
      { name: "Brown Rice (1 cup cooked)", amount: "2.1 mg" },
      { name: "Chickpeas (1 cup cooked)", amount: "1.7 mg" },
      { name: "Spinach (1 cup cooked)", amount: "1.7 mg" },
      { name: "Pineapple (1 cup chunks)", amount: "1.5 mg" }
    ],
    benefits: ["Essential for bone formation and cartilage repair", "Antioxidant protection as manganese superoxide dismutase", "Aids glucose metabolism and blood sugar regulation"]
  },
  "Selenium": {
    name: "Selenium",
    description: "A potent antioxidant trace mineral that shields cells from free radical damage, supports thyroid hormone metabolism, and promotes strong DNA reproduction.",
    sources: [
      { name: "Brazil Nuts (1 nut)", amount: "68–91 mcg" },
      { name: "Yellowfin Tuna (3 oz)", amount: "92 mcg" },
      { name: "Halibut (3 oz)", amount: "47 mcg" },
      { name: "Sardines (canned, 3 oz)", amount: "45 mcg" },
      { name: "Egg (1 large)", amount: "15 mcg" }
    ],
    benefits: ["Crucial for thyroid hormone synthesis and regulation", "Protects against cellular oxidative damage", "Strengthens immune response and antibody defense"]
  },
  "Iodine": {
    name: "Iodine",
    description: "An indispensable trace mineral required by the thyroid gland to produce thyroxine (T4) and triiodothyronine (T3), controlling metabolism and cellular growth.",
    sources: [
      { name: "Seaweed / Kelp (1 g)", amount: "150–2,000 mcg" },
      { name: "Cod (3 oz)", amount: "99 mcg" },
      { name: "Iodized Table Salt (1/4 tsp)", amount: "71 mcg" },
      { name: "Greek Yogurt (1 cup)", amount: "75 mcg" },
      { name: "Whole Milk (1 cup)", amount: "56 mcg" }
    ],
    benefits: ["Regulates basal metabolic rate and body temperature", "Essential for healthy thyroid hormone synthesis", "Supports cognitive function and neural development"]
  },
  "Saturated Fat": {
    name: "Saturated Fat",
    description: "Fat molecules with single chemical bonds between carbons. Naturally present in meat and dairy; dietary guidelines recommend moderating intake to protect cardiovascular health.",
    sources: [
      { name: "Coconut Oil (1 tbsp)", amount: "12 g" },
      { name: "Butter (1 tbsp)", amount: "7 g" },
      { name: "Cheddar Cheese (1 oz)", amount: "6 g" },
      { name: "Beef Ribeye (3 oz)", amount: "5 g" },
      { name: "Palm Oil (1 tbsp)", amount: "6.7 g" }
    ],
    benefits: ["Supplies dense cellular energy and hormone precursors", "Assists absorption of fat-soluble vitamins (A, D, E, K)", "Target guideline: Keep under 10% of total daily caloric intake"]
  },
  "Monounsaturated": {
    name: "Monounsaturated Fatty Acids (MUFAs)",
    description: "Heart-healthy fats containing one unsaturated carbon bond. Renowned as a key pillar of Mediterranean longevity diets for improving cholesterol and cardiovascular resilience.",
    sources: [
      { name: "Extra Virgin Olive Oil (1 tbsp)", amount: "9.8 g" },
      { name: "Avocado (medium)", amount: "15 g" },
      { name: "Almonds (1 oz)", amount: "9 g" },
      { name: "Peanuts (1 oz)", amount: "7 g" },
      { name: "Canola Oil (1 tbsp)", amount: "8.2 g" }
    ],
    benefits: ["Helps lower LDL cholesterol while preserving HDL", "Improves cellular insulin sensitivity and blood glucose balance", "Helps reduce chronic vascular inflammation"]
  },
  "Polyunsaturated": {
    name: "Polyunsaturated Fatty Acids (PUFAs)",
    description: "Essential fatty acids containing multiple double bonds that the body cannot manufacture on its own, encompassing crucial Omega-3 and Omega-6 lipid chains.",
    sources: [
      { name: "Walnuts (1 oz)", amount: "13.4 g" },
      { name: "Sunflower Seeds (1 oz)", amount: "9.3 g" },
      { name: "Flaxseed Oil (1 tbsp)", amount: "8.9 g" },
      { name: "Wild Salmon (3 oz)", amount: "3.8 g" },
      { name: "Soybeans (1/2 cup)", amount: "3.5 g" }
    ],
    benefits: ["Lowers blood triglycerides and arterial plaque risks", "Enhances neural membrane fluidity and eye retina health", "Supplies precursor molecules for anti-inflammatory prostaglandins"]
  },
  "Trans Fat": {
    name: "Trans Fatty Acids",
    description: "Unsaturated fats altered industrially by partial hydrogenation. Significantly elevates LDL (bad) cholesterol and drops HDL (good) cholesterol; intake should be kept as close to 0g as possible.",
    sources: [
      { name: "Partially Hydrogenated Oils", amount: "Variable" },
      { name: "Commercial Fried Fast Foods", amount: "Variable" },
      { name: "Commercial Frostings & Shortenings", amount: "Variable" },
      { name: "Processed Pastries & Crackers", amount: "Variable" },
      { name: "Dairy / Ruminant Meat (trace natural)", amount: "< 0.5 g" }
    ],
    benefits: ["Intake guideline: Restrict to under 1% of calories (ideally 0g)", "Avoiding trans fats reduces heart disease risk significantly", "Always check ingredient labels for partially hydrogenated fats"]
  },
  "Cholesterol": {
    name: "Dietary Cholesterol",
    description: "A structural sterol lipid molecule essential for synthesizing cell membranes, bile acids for fat breakdown, and vital steroid hormones including testosterone and estrogen.",
    sources: [
      { name: "Egg Yolk (1 large)", amount: "186 mg" },
      { name: "Beef Liver (3 oz)", amount: "275 mg" },
      { name: "Shrimp (3 oz)", amount: "166 mg" },
      { name: "Chicken Breast (3 oz)", amount: "73 mg" },
      { name: "Butter (1 tbsp)", amount: "31 mg" }
    ],
    benefits: ["Precursor for steroid hormones and Vitamin D synthesis", "Required for bile acid creation to digest dietary fats", "Maintains cell membrane integrity and fluid stability"]
  },
  "Glycemic Index": {
    name: "Glycemic Index (GI)",
    description: "A metric quantifying how rapidly carbohydrates in a food break down into glucose and raise blood sugar levels compared to pure glucose benchmarked at 100.",
    sources: [
      { name: "Low GI (< 55)", amount: "Lentils, Oats, Apples, Berries, Non-starchy Veggies" },
      { name: "Medium GI (56–69)", amount: "Brown Rice, Bananas, Sweet Corn" },
      { name: "High GI (70+)", amount: "White Bread, Pretzels, Soda, Watermelon" },
      { name: "Pure Glucose Reference", amount: "100 GI Benchmark" },
      { name: "Leafy Greens", amount: "< 15 GI" }
    ],
    benefits: ["Prevents sharp insulin spikes and subsequent energy crashes", "Promotes sustained mental alertness and prolonged satiety", "Supports metabolic health and reduces risk of insulin resistance"]
  },
  "Glycemic Load": {
    name: "Glycemic Load (GL)",
    description: "A comprehensive metric combining both the speed of carbohydrate absorption (GI) and the total grams of carbs per standard serving: GL = (GI × Net Carbs) / 100.",
    sources: [
      { name: "Low GL (< 10)", amount: "Carrots, Apples, Chickpeas, Berries" },
      { name: "Medium GL (11–19)", amount: "Brown Rice, Oatmeal, Whole Wheat Pasta" },
      { name: "High GL (20+)", amount: "White Rice, Russet Baked Potato, Candy" },
      { name: "Watermelon (High GI, Low GL)", amount: "5 GL (Serving is 92% water)" },
      { name: "Strawberries (1 cup)", amount: "3–4 GL" }
    ],
    benefits: ["Reflects real-world meal blood sugar impact accurately", "Takes portion size and water/fiber density into account", "Practical tool for athletic nutrition, diabetes care, and body recomposition"]
  },
  "Water": {
    name: "Water & Hydration",
    description: "The primary chemical constituent of the human body, accounting for ~60% of total mass. Indispensable for cellular respiration, thermoregulation, and detoxification.",
    sources: [
      { name: "Pure Drinking Water", amount: "100% Hydration" },
      { name: "Cucumbers & Celery", amount: "95–96% Water" },
      { name: "Watermelon & Strawberries", amount: "91–92% Water" },
      { name: "Citrus Fruits & Apples", amount: "86–88% Water" },
      { name: "Herbal Teas & Broths", amount: "99% Water" }
    ],
    benefits: ["Flushes metabolic byproducts via renal filtration", "Regulates internal core temperature through perspiration", "Lubricates synovial joints and protects spinal cord and brain tissues"]
  }
};

export default MacroMicroCalculator;
