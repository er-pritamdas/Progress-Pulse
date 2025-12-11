import { useState, useEffect } from "react";
import { Moon, Star } from "lucide-react";
import { motion } from "framer-motion";

function SleepDurationOrb({ habitData, sleepMax, totalEntries }) {
    const [rawValue, setRawValue] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [totalSleepMax, setTotalSleepMax] = useState(0);

    useEffect(() => {
        if (!Array.isArray(habitData)) return;

        let totalSleep = 0;
        for (const { sleep } of habitData) {
            totalSleep += Number(sleep) || 0;
        }

        const totalDays = habitData.length || 1;
        const total_SleepMax = (Number(sleepMax) || 1) * totalDays;
        const sleepPercent = Math.min(100, Math.round((totalSleep / total_SleepMax) * 100));

        setRawValue(Number(totalSleep).toFixed(1));
        setPercentage(sleepPercent);
        setTotalSleepMax(total_SleepMax);

    }, [habitData, sleepMax, totalEntries]);

    return (
        <div className="flex flex-col items-center p-6 w-full">

            {/* Dream Orb Container */}
            <div className="relative w-56 h-56 rounded-full shadow-[0_0_50px_rgba(139,92,246,0.3)] border-4 border-base-200/20 overflow-hidden bg-[#1a103c]">

                {/* Background Stars (Static decoration) */}
                <div className="absolute inset-0 opacity-50">
                    <Star size={8} className="absolute top-8 left-10 text-white animate-pulse" fill="white" />
                    <Star size={6} className="absolute top-16 right-12 text-violet-200 animate-pulse delay-75" fill="currentColor" />
                    <Star size={4} className="absolute bottom-12 left-20 text-indigo-300 animate-pulse delay-150" fill="currentColor" />
                    <Star size={5} className="absolute top-6 right-24 text-white animate-pulse delay-300" />
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
                            <path fill="#8b5cf6" fillOpacity="0.8" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                        <svg className="w-1/2 h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                            <path fill="#8b5cf6" fillOpacity="0.8" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                    </motion.div>

                    {/* Fill Body */}
                    <div className="w-full h-full bg-gradient-to-t from-violet-900 via-violet-600 to-violet-500 opacity-80"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 drop-shadow-md">
                    <Moon className={`mb-2 transition-all duration-700 ${percentage > 50 ? 'text-white fill-white' : 'text-violet-200'}`} size={32} />
                    <span className={`text-4xl font-bold ${percentage > 50 ? 'text-white' : 'text-violet-100'}`}>
                        {percentage}%
                    </span>
                    <span className={`text-xs uppercase tracking-widest mt-1 ${percentage > 50 ? 'text-white/80' : 'text-violet-300'}`}>
                        Recharged
                    </span>
                </div>

            </div>

            {/* Stats */}
            <div className="text-center mt-6 text-gray-300">
                <p className="text-xl font-medium text-white">{rawValue}h <span className="text-sm text-gray-400 font-normal">Slept</span></p>
                <p className="text-sm opacity-60">
                    Target: {totalSleepMax.toFixed(1)}h
                </p>
            </div>
        </div>
    );
}

export default SleepDurationOrb;
