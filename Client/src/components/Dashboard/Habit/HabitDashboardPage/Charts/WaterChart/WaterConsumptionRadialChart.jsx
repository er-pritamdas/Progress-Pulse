import { useState, useEffect } from "react";
import { Droplet } from "lucide-react";
import { motion } from "framer-motion";

function WaterConsumptionHex({ habitData, waterMax, totalEntries }) {
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

  // Bubble configuration
  const bubbles = Array.from({ length: 8 });

  return (
    <div className="flex flex-col items-center p-6 w-full">

      {/* Hydro Hexagon Container */}
      <div className="relative w-64 h-64 flex items-center justify-center">

        {/* Outer Hexagon Border (Decorative) */}
        <div
          className="absolute inset-0 bg-base-200/30"
          style={{
            clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)"
          }}
        ></div>

        {/* Inner Active Hexagon */}
        <div
          className="relative w-full h-full overflow-hidden bg-cyan-950/30 backdrop-blur-sm shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          style={{
            clipPath: "polygon(50% 2%, 93% 26%, 93% 74%, 50% 98%, 7% 74%, 7% 26%)"
          }}
        >

          {/* Liquid Fill */}
          <div
            className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out z-10"
            style={{ height: `${percentage}%` }}
          >
            <div className="w-full h-full bg-gradient-to-t from-cyan-600 to-cyan-400 opacity-90 relative">
              {/* Wave Top */}
              <motion.div
                className="absolute -top-3 left-0 w-[200%] h-6 flex"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 5 }}
              >
                <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="#22d3ee" fillOpacity="0.9" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,170.7C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
                <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <path fill="#22d3ee" fillOpacity="0.9" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,170.7C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Rising Bubbles */}
          {bubbles.map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-cyan-200/40 rounded-full z-20"
              style={{
                width: Math.random() * 8 + 4 + "px",
                height: Math.random() * 8 + 4 + "px",
                left: Math.random() * 100 + "%",
                bottom: "-20px"
              }}
              animate={{
                y: -300,
                opacity: [0, 1, 0],
                x: Math.random() * 20 - 10
              }}
              transition={{
                repeat: Infinity,
                duration: Math.random() * 4 + 3,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            />
          ))}

          {/* Overlay Grid Pattern */}
          <div className="absolute inset-0 z-20 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>


          {/* Content Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 drop-shadow-md">
            <Droplet className={`mb-2 transition-all duration-700 ${percentage > 50 ? 'text-white fill-white' : 'text-cyan-400'}`} size={32} />
            <span className={`text-4xl font-bold font-mono ${percentage > 50 ? 'text-white' : 'text-cyan-100'}`}>
              {percentage}%
            </span>
            <span className={`text-[10px] uppercase tracking-[0.2em] mt-1 ${percentage > 50 ? 'text-white/80' : 'text-cyan-300'}`}>
              Hydration
            </span>
          </div>
        </div>

      </div>

      {/* Stats */}
      <div className="text-center mt-4 text-cyan-100/80">
        <p className="text-xl font-medium text-cyan-50">{rawValue} L <span className="text-sm font-normal opacity-70">Consumed</span></p>
        <p className="text-sm opacity-60">
          Target: {totalConsumedMax.toFixed(2)} L
        </p>
      </div>
    </div>
  );
}

export default WaterConsumptionHex;
