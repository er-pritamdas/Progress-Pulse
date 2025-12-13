import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, CalendarCheck2, BookOpen, Info, X, Target } from 'lucide-react';

const ReadScoreBoard = ({
    habitData = [],
    readMax = 0,
    readMin = 0,
}) => {
    const [activeInfo, setActiveInfo] = useState(null);

    const {
        fromDate,
        toDate,
        readSum,
        totalDays,
        offset,
    } = useMemo(() => {
        if (!Array.isArray(habitData) || habitData.length === 0) {
            return {
                fromDate: null,
                toDate: null,
                readSum: 0,
                totalDays: 0,
                offset: 0,
            };
        }

        const readTotal = habitData
            .map((entry) => Number(entry.read))
            .filter((val) => !isNaN(val))
            .reduce((sum, val) => sum + val, 0);

        const fromDate = habitData[habitData.length - 1].date;
        const toDate = habitData[0].date;

        const days = dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;
        const offset = readTotal - (days * readMin);

        return {
            fromDate,
            toDate,
            readSum: readTotal,
            totalDays: days,
            offset,
        };
    }, [habitData, readMin, readMax]);

    const readGoal = totalDays * readMax;
    const readMinGoal = totalDays * readMin;

    const infoData = {
        from: {
            title: "From Date",
            description: "The first day where reading was logged for the selected period."
        },
        to: {
            title: "To Date",
            description: "The most recent day where reading was logged for the selected period."
        },
        consumed: {
            title: "Total Read Duration",
            description: "Total hours read in the selected period."
        },
        goal: {
            title: "Daily Read Goal",
            description: `Your daily reading target ranging between ${readMin}h and ${readMax}h.`
        },
        offset: {
            title: "Read Offset",
            description: "The difference between total read duration and the minimum read goal."
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

            {/* Read Scoreboard Grid */}
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

                {/* Total Read */}
                <div className="stat shadow relative group">
                    <button
                        onClick={() => handleInfoClick('consumed')}
                        className="cursor-pointer absolute top-2 right-2 text-base-content hover:text-primary transition-colors"
                    >
                        <Info size={16} />
                    </button>

                    <div className="stat-figure text-amber-500">
                        <BookOpen className="h-6 w-6" />
                    </div>

                    <div className="stat-title pr-6">Total Read</div>
                    <div className="stat-value text-amber-500">
                        {readSum.toFixed(1)}h
                    </div>

                    <div className="stat-desc">
                        Min: {readMinGoal.toFixed(1)}h | Max: {readGoal.toFixed(1)}h
                    </div>
                </div>

                {/* Deficit / Surplus Read */}
                <div
                    className="stat shadow relative group"
                >
                    <button onClick={() => handleInfoClick('offset')} className={`cursor-pointer absolute top-2 right-2 transition-colors ${offset >= 0 ? 'text-emerald-500 hover:text-emerald-500' : 'text-rose-500 hover:text-rose-500'}`}>
                        <Info size={16} />
                    </button>
                    <div className={`stat-figure ${offset >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <Target className="h-6 w-6" />
                    </div>
                    <div className="stat-title pr-6">Offset from {totalDays * readMin}h</div>
                    <div className={`stat-value ${offset >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {offset >= 0 ? '+' : ''}
                        {offset.toFixed(1)} h
                    </div>
                    <div className="stat-desc">{offset >= 0 ? 'In Surplus' : 'In Deficit'}</div>
                </div>

                {/* Scale Section */}
                <div className="col-span-2 stat shadow relative group">
                    <ReadScale
                        label="Read Duration"
                        value={readSum}
                        min={readMinGoal}
                        max={readGoal}
                        color="bg-amber-500"
                        textColor="text-amber-500"
                        icon={BookOpen}
                    />
                </div>

            </div>


        </div>

    );
};

/* SCALE COMPONENT */
const ReadScale = ({ label, value, min, max, color, textColor, icon: Icon }) => {
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
                    {value.toFixed(1)}h
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
                <span>Min: {min.toFixed(1)}h</span>
                <span>Max: {max.toFixed(1)}h</span>
            </div>
        </div>
    );
};

export default React.memo(ReadScoreBoard);
