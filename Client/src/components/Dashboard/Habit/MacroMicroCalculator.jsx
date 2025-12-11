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
        { name: "Vitamin C", value: isMale ? "90 mg" : "75 mg", icon: "🍊" },
        { name: "Vitamin D", value: "15-20 mcg", icon: "☀️" },
        { name: "Vitamin E", value: "15 mg", icon: "🥑" },
        { name: "Vitamin K", value: isMale ? "120 mcg" : "90 mcg", icon: "🥬" },
        { name: "Vitamin B12", value: "2.4 mcg", icon: "🥩" },
      ],
      minerals: [
        { name: "Calcium", value: "1000 mg", icon: "🥛" },
        { name: "Iron", value: isMale ? "8 mg" : (age > 50 ? "8 mg" : "18 mg"), icon: "🍖" },
        { name: "Magnesium", value: isMale ? "400-420 mg" : "310-320 mg", icon: "🍫" },
        { name: "Zinc", value: isMale ? "11 mg" : "8 mg", icon: "🦪" },
        { name: "Potassium", value: "3400 mg", icon: "🍌" },
      ],
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
                <Zap size={18} /> Recommended Micros
              </h3>
              <p className="text-xs opacity-60 mb-6">
                Based on Age: <span className="font-bold">{age}</span>, Gender: <span className="font-bold capitalize">{gender}</span>. (General DRI guidelines)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vitamins */}
                <div>
                  <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2 border-b border-base-300 pb-2">
                    <Droplet size={14} /> Vitamins
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

                {/* Minerals */}
                <div>
                  <h4 className="text-sm font-bold uppercase opacity-70 mb-3 flex items-center gap-2 border-b border-base-300 pb-2">
                    <Activity size={14} /> Minerals
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      <span className="opacity-70 font-mono">{grams.protein}g</span>
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
                      <span className="opacity-70 font-mono">{grams.carbs}g</span>
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
                      <span className="opacity-70 font-mono">{grams.fats}g</span>
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
                <div className="collapse-content">
                  <p className="text-xs opacity-60 mb-4">
                    We use standard nutritional values where <strong>1g Protein/Carb = 4 kcal</strong> and <strong>1g Fat = 9 kcal</strong>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Protein Calc */}
                    <div className="bg-info/10 border border-info/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Zap size={40} /></div>
                      <h4 className="text-xs font-bold text-info uppercase mb-2">Protein Formula</h4>
                      <div className="text-xs font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="opacity-60">Total Cals:</span>
                          <span>{customCalories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.protein}%</span>
                        </div>
                        <div className="divider my-0"></div>
                        <div className="text-center font-bold bg-base-100/50 rounded py-1">
                          ({customCalories} × {ratios.protein}%) ÷ 4
                        </div>
                        <div className="text-center text-lg font-bold text-info mt-1">
                          = {grams.protein}g
                        </div>
                      </div>
                    </div>

                    {/* Carbs Calc */}
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Activity size={40} /></div>
                      <h4 className="text-xs font-bold text-success uppercase mb-2">Carbs Formula</h4>
                      <div className="text-xs font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="opacity-60">Total Cals:</span>
                          <span>{customCalories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.carbs}%</span>
                        </div>
                        <div className="divider my-0"></div>
                        <div className="text-center font-bold bg-base-100/50 rounded py-1">
                          ({customCalories} × {ratios.carbs}%) ÷ 4
                        </div>
                        <div className="text-center text-lg font-bold text-success mt-1">
                          = {grams.carbs}g
                        </div>
                      </div>
                    </div>

                    {/* Fats Calc */}
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Droplet size={40} /></div>
                      <h4 className="text-xs font-bold text-warning uppercase mb-2">Fats Formula</h4>
                      <div className="text-xs font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="opacity-60">Total Cals:</span>
                          <span>{customCalories}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Ratio:</span>
                          <span>{ratios.fats}%</span>
                        </div>
                        <div className="divider my-0"></div>
                        <div className="text-center font-bold bg-base-100/50 rounded py-1">
                          ({customCalories} × {ratios.fats}%) ÷ 9
                        </div>
                        <div className="text-center text-lg font-bold text-warning mt-1">
                          = {grams.fats}g
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
    description: "Involved in more than 300 enzyme systems that regulate diverse biochemical reactions in the body, including protein synthesis and muscle function.",
    sources: [
      { name: "Pumpkin Seeds", amount: "156 mg" },
      { name: "Chia Seeds", amount: "111 mg" },
      { name: "Almonds", amount: "80 mg" },
      { name: "Spinach (cooked)", amount: "78 mg" },
      { name: "Dark Chocolate", amount: "64 mg" }
    ],
    benefits: ["Supports muscle and nerve function", "Regulates blood pressure", "Supports immune system"]
  },
  "Zinc": {
    name: "Zinc",
    description: "Needed for the body's defensive (immune) system to work properly. It plays a role in cell division, cell growth, wound healing, and the breakdown of carbohydrates.",
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
    description: "An electrolyte that counteracts the effects of sodium, helping to maintain consistent blood pressure. Important for heart and kidney function.",
    sources: [
      { name: "Dried Apricots", amount: "1,101 mg" },
      { name: "Lentils", amount: "731 mg" },
      { name: "Potato (baked)", amount: "610 mg" },
      { name: "Banana", amount: "422 mg" },
      { name: "Avocado", amount: "364 mg" }
    ],
    benefits: ["Regulates fluid balance", "Helps control blood pressure", "Prevents muscle cramps"]
  }
};

export default MacroMicroCalculator;
