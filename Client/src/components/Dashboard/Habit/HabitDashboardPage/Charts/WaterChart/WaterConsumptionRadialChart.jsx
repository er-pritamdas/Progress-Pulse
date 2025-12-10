import { useState, useEffect } from "react";

function WaterConsumptionGlass({ habitData, waterMax, totalEntries }) {
  const [rawValue, setRawValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [totalConsumedMax, setTotalConsumedMax] = useState(0);

  useEffect(() => {
    if (!Array.isArray(habitData)) return;

    let consumed = 0;
    for (const { water } of habitData) {
      consumed += Number(water) || 0;
    }

    const totalDays = habitData.length || 1;
    const total_ConsumedMax = (Number(waterMax) || 1) * totalDays;
    const consumedPercent = Math.min(100, Math.round((consumed / total_ConsumedMax) * 100));

    setRawValue(Number(consumed).toFixed(2));
    setPercentage(consumedPercent);
    setTotalConsumedMax(total_ConsumedMax);

  }, [habitData, waterMax, totalEntries]);

  return (
    <div className="flex flex-col items-center p-6 w-full">
      {/* Glass Container */}
      <div className="relative w-40 h-60 border-1 border-blue-300/40 rounded-b-3xl overflow-hidden bg-gray-900/40 backdrop-blur-xl shadow-lg">

        {/* Water Fill */}
        <div
          className="absolute bottom-0 left-0 w-full transition-all duration-700 ease-in-out"
          style={{
            height: `${percentage}%`,
            background: `linear-gradient(to top,
              rgba(0, 57, 128, 0.9),
              rgba(81, 162, 255, 0.8),
              rgba(157, 200, 253, 0.7)
            )`,
          }}
        ></div>

        {/* Percentage Text */}
        <div
          className={`absolute inset-0 flex items-center justify-center text-2xl font-bold drop-shadow-lg ${percentage >= 55 ? "text-black" : "text-white"}`}
        >
          {percentage}%
        </div>

      </div>

      {/* Stats */}
      <div className="text-center mt-4 text-gray-300">
        <p className="text-lg">{rawValue} L consumed</p>
        <p className="text-sm opacity-80">
          out of {totalConsumedMax.toFixed(2)} L
        </p>
        <p className="mt-1 text-sm text-gray-400">
          {totalEntries} Day{totalEntries === 1 ? "" : "s"} of tracking
        </p>
      </div>
    </div>
  );
}

export default WaterConsumptionGlass;
