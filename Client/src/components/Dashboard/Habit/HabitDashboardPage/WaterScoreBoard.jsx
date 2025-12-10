import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, CalendarCheck2, Droplet, Info, X } from 'lucide-react';

const WaterScoreBoard = ({
    habitData = [],
    waterMax = 0,
    waterMin = 0,
    basalMetabolicRate = 0,
}) => {
    const [activeInfo, setActiveInfo] = useState(null);

    const {
        fromDate,
        toDate,
        consumedSum,
        totalDays
    } = useMemo(() => {
        if (!Array.isArray(habitData) || habitData.length === 0) {
            return {
                fromDate: null,
                toDate: null,
                consumedSum: 0,
                totalDays: 0,
            };
        }

        const consumed = habitData
            .map((entry) => Number(entry.water))
            .filter((val) => !isNaN(val))
            .reduce((sum, val) => sum + val, 0);

        const fromDate = habitData[habitData.length - 1].date;
        const toDate = habitData[0].date;

        const days = dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;

        return {
            fromDate,
            toDate,
            consumedSum: consumed,
            totalDays: days,
        };
    }, [habitData, waterMin, waterMax]);

    const consumedGoal = totalDays * waterMax;
    const consumedMinGoal = totalDays * waterMin;

    const infoData = {
        from: {
            title: "From Date",
            description: "The first day where water intake was logged for the selected period."
        },
        to: {
            title: "To Date",
            description: "The most recent day where water intake was logged for the selected period."
        },
        consumed: {
            title: "Total Water Consumed",
            description: "Total quantity of water you have consumed in the selected period."
        },
        goal: {
            title: "Daily Water Goal",
            description: `Your daily water intake target ranging between ${waterMin}L and ${waterMax}L.`
        }
    };

    const handleInfoClick = (key) => {
        setActiveInfo(infoData[key]);
    };

    const closeInfo = () => setActiveInfo(null);

    return (
        <div className="relative">

            {/* Info Modal */}
            {activeInfo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={closeInfo}
                >
                    <div
                        className="bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full relative border border-base-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeInfo}
                            className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Info className="text-primary" size={24} />
                            {activeInfo.title}
                        </h3>

                        <p className="text-base-content/80 leading-relaxed">
                            {activeInfo.description}
                        </p>
                    </div>
                </div>
            )}

            {/* Water Scoreboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* From Date */}
                <div className="stat shadow relative group">
                    <button
                        onClick={() => handleInfoClick('from')}
                        className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors"
                    >
                        <Info size={16} />
                    </button>
                    <div className="stat-figure text-blue-400">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">From</div>
                    <div className="stat-value">
                        {fromDate ? dayjs(fromDate).format('DD MMM') : 'N/A'}
                    </div>
                    <div className="stat-desc">Start Date</div>
                </div>

                {/* To Date */}
                <div className="stat shadow relative group">
                    <button
                        onClick={() => handleInfoClick('to')}
                        className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors"
                    >
                        <Info size={16} />
                    </button>
                    <div className="stat-figure text-blue-400">
                        <CalendarCheck2 className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">To</div>
                    <div className="stat-value">
                        {toDate ? dayjs(toDate).format('DD MMM') : 'N/A'}
                    </div>
                    <div className="stat-desc">End Date</div>
                </div>

                {/* Total Water Consumed */}
                <div className="stat shadow relative group">
                    <button
                        onClick={() => handleInfoClick('consumed')}
                        className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors"
                    >
                        <Info size={16} />
                    </button>

                    <div className="stat-figure text-sky-500">
                        <Droplet className="h-6 w-6" />
                    </div>

                    <div className="stat-title pr-6">Total Water</div>
                    <div className="stat-value text-sky-500">
                        {consumedSum.toFixed(2)}L
                    </div>

                    <div className="stat-desc">
                        Min: {consumedMinGoal.toFixed(2)}L | Max: {consumedGoal.toFixed(2)}L
                    </div>
                </div>

            </div>

            {/* Scale Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <WaterScale
                    label="Water Intake"
                    value={consumedSum}
                    min={consumedMinGoal}
                    max={consumedGoal}
                    color="bg-sky-500"
                    textColor="text-sky-500"
                    icon={Droplet}
                />
            </div>
        </div>
    );
};

/* SCALE COMPONENT */
const WaterScale = ({ label, value, min, max, color, textColor, icon: Icon }) => {
    const range = max - min;
    let percentage = 0;

    if (range > 0) percentage = ((value - min) / range) * 100;
    else if (value >= max) percentage = 100;

    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
            <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-sm">{label}</span>
                <span className={`font-bold text-lg ${textColor}`}>
                    {value.toFixed(2)}L
                </span>
            </div>

            <div className="relative h-3 bg-base-300 rounded-full w-full mt-2">
                <div
                    className={`absolute top-0 left-0 h-full rounded-full ${color} opacity-20`}
                    style={{ width: '100%' }}
                ></div>

                {/* Marker */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10"
                    style={{ left: `calc(${clampedPercentage}% - 12px)` }}
                >
                    <div className={`bg-base-100 rounded-full p-1 shadow-md border border-base-200 ${textColor}`}>
                        <Icon size={16} fill="currentColor" />
                    </div>
                </div>
            </div>

            <div className="flex justify-between text-xs text-base-content/50 mt-2 font-medium">
                <span>Min: {min.toFixed(2)}L</span>
                <span>Max: {max.toFixed(2)}L</span>
            </div>
        </div>
    );
};

export default React.memo(WaterScoreBoard);
