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
            description: "The start date of the selected date range for your habit tracking."
        },
        to: {
            title: "To Date",
            description: "The end date of the selected date range for your habit tracking."
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
            description: "Your net calorie balance calculated as: Total Consumed - Total Burned."
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

            {/* Notes */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-500">
                <p className='mb-1'>📅 <strong>From / To</strong>: Automatically picked from habit data (latest to oldest).</p>
                <p className='mb-1'>🔥 <strong>Burned</strong>: Total calories burned via workouts or activities. Compared to your goal for {totalDays} days.</p>
                <p className='mb-1'>🍽️ <strong>Consumed</strong>: Total calories eaten. Compared to your max allowed intake for {totalDays} days.</p>
                <p className='mb-1'>⚖️ <strong>Effective</strong>: Net calories = Consumed - Burned.</p>
                <p className='mb-1'>🎯 <strong>Offset</strong>: Difference from {basalMetabolicRate} kcal reference. Positive = surplus, Negative = deficit.</p>
            </div>
        </div>
    );
};

export default React.memo(CalorieScoreBoard);
