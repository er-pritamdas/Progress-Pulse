import { useState, useEffect } from "react";
import { Droplet } from "lucide-react";
import { motion } from "framer-motion";

function WaterConsumptionRadialChart({ habitData, waterMax, totalEntries }) {
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

      {/* Water Orb Container */}
      <div className="relative w-56 h-56 rounded-full shadow-[0_0_50px_rgba(34,211,238,0.3)] border-4 border-base-200/20 overflow-hidden bg-[#0c2e36]">

        {/* Background Bubbles (Static decoration - replaced stars) */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-8 left-10 w-2 h-2 rounded-full bg-cyan-100/50 animate-pulse" />
          <div className="absolute top-16 right-12 w-1.5 h-1.5 rounded-full bg-cyan-200/50 animate-pulse delay-75" />
          <div className="absolute bottom-12 left-20 w-1 h-1 rounded-full bg-cyan-300/50 animate-pulse delay-150" />
          <div className="absolute top-6 right-24 w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse delay-300" />
        </div>

        {/* Liquid Wave Fill */}
        <div
          className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out z-10"
          style={{ height: `${percentage}%` }}
        >
          {/* The Wave SVG with Motion */}
          <motion.div
            className="absolute -top-4 left-0 w-[200%] h-8 flex"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 6 }}
          >
            <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#06b6d4" fillOpacity="0.8" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="#06b6d4" fillOpacity="0.8" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </motion.div>

          {/* Fill Body */}
          <div className="w-full h-full bg-gradient-to-t from-cyan-900 via-cyan-800 to-cyan-700 opacity-40"></div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 drop-shadow-md">
          <Droplet className={`mb-2 transition-all duration-700 ${percentage > 50 ? 'text-white fill-white' : 'text-cyan-200'}`} size={32} />
          <span className={`text-4xl font-bold ${percentage > 50 ? 'text-white' : 'text-cyan-100'}`}>
            {percentage}%
          </span>
          <span className={`text-xs uppercase tracking-widest mt-1 ${percentage > 50 ? 'text-white/80' : 'text-cyan-300'}`}>
            Hydrated
          </span>
        </div>

      </div>

      {/* Stats */}
      <div className="text-center mt-6 text-gray-300">
        <p className="text-xl font-medium text-white">{rawValue}L <span className="text-sm text-gray-400 font-normal">Drank</span></p>
        <p className="text-sm opacity-60">
          Max Target: {totalConsumedMax.toFixed(2)}L
        </p>
      </div>
    </div>
  );
}

export default WaterConsumptionRadialChart;
