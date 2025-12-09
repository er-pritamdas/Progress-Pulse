import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, CalendarCheck2, Flame, Utensils, Scale, Target, Info, X } from 'lucide-react';

const CalorieScoreBoard = ({
    habitData = [],
    ConsumedCalorieMax = 0,
    ConsumedCalorieMin = 0,
    BurnedCalorieMax = 0,
    BurnedCalorieMin = 0,
    basalMetabolicRate = 0,
}) => {
    const [activeInfo, setActiveInfo] = useState(null);

    const {
        fromDate,
        toDate,
        consumedSum,
        burnedSum,
        effective,
        offset,
        totalDays
    } = useMemo(() => {
        if (!Array.isArray(habitData) || habitData.length === 0) {
            return {
                fromDate: null,
                toDate: null,
                consumedSum: 0,
                burnedSum: 0,
                effective: 0,
                offset: 0,
                totalDays: 0,
            };
        }

        const consumed = habitData
            .map((entry) => Number(entry.intake))
            .filter((val) => !isNaN(val))
            .reduce((sum, val) => sum + val, 0);

        const burned = habitData
            .map((entry) => Number(entry.burned))
            .filter((val) => !isNaN(val))
            .reduce((sum, val) => sum + val, 0);

        const fromDate = habitData[habitData.length - 1].date;
        const toDate = habitData[0].date;
        const days = dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;

        const effective = consumed - burned;
        const offset = effective - (basalMetabolicRate * days);

        return {
            fromDate,
            toDate,
            consumedSum: consumed,
            burnedSum: burned,
            effective,
            offset,
            totalDays: days,
        };
    }, [habitData, ConsumedCalorieMax, ConsumedCalorieMin, BurnedCalorieMax, BurnedCalorieMin, basalMetabolicRate]);

    const consumedGoal = totalDays * ConsumedCalorieMax;
    const consumedMinGoal = totalDays * ConsumedCalorieMin;
    const burnedGoal = totalDays * BurnedCalorieMax;
    const burnedMinGoal = totalDays * BurnedCalorieMin;

    const infoData = {
        from: {
            title: "From Date",
            description: "The First logged Habit Date of the selected date range for your habit tracking."
        },
        to: {
            title: "To Date",
            description: "The Last logged Habit Date of the selected date range for your habit tracking."
        },
        burned: {
            title: "Total Burned",
            description: "The total number of calories you have burned through exercise and activity during the selected period."
        },
        consumed: {
            title: "Total Consumed",
            description: "The total number of calories you have consumed from food and drink during the selected period."
        },
        effective: {
            title: "Effective Calories",
            description: "Your net calorie balance calculated as: (Total Consumed - Total Burned)."
        },
        offset: {
            title: "Offset",
            description: `The difference between your Effective calories and your basal metabolic rate (${basalMetabolicRate} kcal/day) over the selected period. Positive means surplus, negative means deficit.`
        }
    };

    const handleInfoClick = (key) => {
        setActiveInfo(infoData[key]);
    };

    const closeInfo = () => {
        setActiveInfo(null);
    };

    return (
        <div className="relative">
            {/* Info Modal */}
            {activeInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeInfo}>
                    <div className="bg-base-100 rounded-2xl shadow-2xl p-6 max-w-md w-full relative border border-base-300" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeInfo} className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Row 1 */}
                <div className="stat shadow relative group">
                    <button onClick={() => handleInfoClick('from')} className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors">
                        <Info size={16} />
                    </button>
                    <div className="stat-figure text-secondary">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">From</div>
                    <div className="stat-value">{fromDate ? dayjs(fromDate).format('DD MMM') : 'N/A'}</div>
                    <div className="stat-desc">Start Date</div>
                </div>

                <div className="stat shadow relative group">
                    <button onClick={() => handleInfoClick('to')} className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors">
                        <Info size={16} />
                    </button>
                    <div className="stat-figure text-secondary">
                        <CalendarCheck2 className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">To</div>
                    <div className="stat-value">{toDate ? dayjs(toDate).format('DD MMM') : 'N/A'}</div>
                    <div className="stat-desc">End Date</div>
                </div>

                <div className="stat shadow relative group">
                    <button onClick={() => handleInfoClick('burned')} className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors">
                        <Info size={16} />
                    </button>
                    <div className="stat-figure text-red-500">
                        <Flame className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">Total Burned</div>
                    <div className="stat-value text-red-500">{burnedSum}</div>
                    <div className="stat-desc">Min: {burnedMinGoal} | Max: {burnedGoal}</div>
                </div>

                {/* Row 2 */}
                <div className="stat shadow relative group">
                    <button onClick={() => handleInfoClick('consumed')} className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors">
                        <Info size={16} />
                    </button>
                    <div className="stat-figure text-green-500">
                        <Utensils className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">Total Consumed</div>
                    <div className="stat-value text-green-500">{consumedSum}</div>
                    <div className="stat-desc">Min: {consumedMinGoal} | Max: {consumedGoal}</div>
                </div>

                <div className="stat shadow relative group">
                    <button onClick={() => handleInfoClick('effective')} className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors">
                        <Info size={16} />
                    </button>
                    <div className="stat-figure text-blue-500">
                        <Scale className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">Effective</div>
                    <div className="stat-value text-blue-500">{effective}</div>
                    <div className="stat-desc">Consumed - Burned</div>
                </div>

                <div
                    className={`stat shadow rounded-lg relative group ${offset >= 0 ? 'border border-emerald-500' : 'border border-rose-500'
                        }`}
                >
                    <button onClick={() => handleInfoClick('offset')} className={`cursor-pointer absolute top-2 right-2 transition-colors ${offset >= 0 ? 'text-emerald-500 hover:text-emerald-500' : 'text-rose-500 hover:text-rose-500'}`}>
                        <Info size={16} />
                    </button>
                    <div className={`stat-figure ${offset >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <Target className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">Offset from {basalMetabolicRate}</div>
                    <div className={`stat-value ${offset >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {offset >= 0 ? '+' : ''}
                        {offset}
                    </div>
                    <div className="stat-desc">{offset >= 0 ? 'In Surplus' : 'In Deficit'}</div>
                </div>

            </div>

            {/* Scales Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <CalorieScale
                    label="Total Consumed"
                    value={consumedSum}
                    min={consumedMinGoal}
                    max={consumedGoal}
                    color="bg-green-500"
                    textColor="text-green-500"
                    icon={Utensils}
                />
                <CalorieScale
                    label="Total Burned"
                    value={burnedSum}
                    min={burnedMinGoal}
                    max={burnedGoal}
                    color="bg-red-500"
                    textColor="text-red-500"
                    icon={Flame}
                />

            </div>
        </div>
    );
};

const CalorieScale = ({ label, value, min, max, color, textColor, icon: Icon }) => {
    const range = max - min;
    let percentage = 0;

    if (range > 0) {
        percentage = ((value - min) / range) * 100;
    } else if (value >= max) {
        percentage = 100;
    }

    // Clamp percentage between 0 and 100 for visual consistency
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    return (
        <div className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{label}</span>
                </div>
                <span className={`font-bold text-lg ${textColor}`}>
                    {value.toLocaleString()} <span className="text-xs text-base-content/60 font-normal">kcal</span>
                </span>
            </div>

            <div className="relative h-3 bg-base-300 rounded-full w-full mt-2">
                {/* Progress Bar Background (Range) */}
                <div
                    className={`absolute top-0 left-0 h-full rounded-full ${color} opacity-20`}
                    style={{ width: '100%' }}
                ></div>

                {/* Sliding Marker */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-10`}
                    style={{ left: `calc(${clampedPercentage}% - 12px)` }}
                >
                    <div className={`bg-base-100 rounded-full p-1 shadow-md border border-base-200 ${textColor}`}>
                        <Icon size={16} fill="currentColor" />
                    </div>

                    {/* Tooltip on Hover (Optional, but nice) */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-base-300 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-base-200 shadow-sm">
                        {value}
                    </div>
                </div>
            </div>

            <div className="flex justify-between text-xs text-base-content/50 mt-2 font-medium">
                <span>Min: {min.toLocaleString()}</span>
                <span>Max: {max.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default React.memo(CalorieScoreBoard);
