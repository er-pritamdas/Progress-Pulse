import React, { useMemo } from 'react';
import ReactApexChart from "react-apexcharts";
import { Smile, Calendar, Frown, Meh, Angry, BatteryLow, Coffee, PartyPopper, AlertCircle, Zap, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";
import MoodCalendar from "./MoodCalendar";

const MoodAnalysis = ({
    habitData,
    moodList = [],
    fromDate,
    toDate
}) => {

    const totalDaysInRange = useMemo(() => {
        if (!fromDate || !toDate) return 0;
        return dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;
    }, [fromDate, toDate]);

    const { moodCounts, totalMoods } = useMemo(() => {
        if (!habitData || habitData.length === 0) return { moodCounts: {}, totalMoods: 0 };

        const counts = {};
        let total = 0;

        // Initialize counts with 0 for all configured moods
        moodList.forEach(m => counts[m] = 0);

        habitData.forEach(entry => {
            if (entry.mood && entry.mood !== "---") {
                const moodKey = moodList.find(m => m === entry.mood) || entry.mood;
                counts[moodKey] = (counts[moodKey] || 0) + 1;
                total++;
            }
        });

        return { moodCounts: counts, totalMoods: total };
    }, [habitData, moodList]);


    // Bar Chart Configuration (Matched SelfCare)
    const chartSeries = [{
        name: 'Frequency',
        data: Object.values(moodCounts)
    }];
    
    const chartCategories = Object.keys(moodCounts);

    const chartOptions = {
        chart: {
            type: 'bar',
            background: 'transparent',
            toolbar: { show: false },
            foreColor: '#9ca3af',
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                distributed: true, // Different colors for bars
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#000000']
            }
        },
        xaxis: {
            categories: chartCategories,
            min: 0,
            max: totalDaysInRange > 0 ? totalDaysInRange : undefined, // Limit axis to selected days
            tickAmount: Math.min(totalDaysInRange, 5), // Ensure decent tick spacing
            title: {
                text: 'Days Recorded'
            }
        },
        colors: [
            "#34D399", "#60A5FA", "#F87171", "#A78BFA", "#FBBF24",
            "#F472B6", "#A2D729", "#22D3EE", "#FB923C", "#E879F9"
        ],
        theme: {
            mode: 'dark',
        },
        grid: {
            borderColor: '#374151',
            strokeDashArray: 4,
        }
    };

    // Helper to get icon for mood
    const getMoodIcon = (moodName) => {
        if (!moodName) return <Zap size={18} className="text-secondary" />;
        const lower = moodName.toLowerCase();
        const iconProps = { size: 18, className: "text-secondary" };

        if (lower.includes('happy') || lower.includes('good')) return <Smile {...iconProps} className="text-success" />;
        if (lower.includes('sad') || lower.includes('bad')) return <Frown {...iconProps} className="text-error" />;
        if (lower.includes('average') || lower.includes('okay') || lower.includes('neutral')) return <Meh {...iconProps} className="text-warning" />;
        if (lower.includes('angry')) return <Angry {...iconProps} className="text-error" />;
        if (lower.includes('tired') || lower.includes('exhausted')) return <BatteryLow {...iconProps} className="text-gray-400" />;
        if (lower.includes('relaxed') || lower.includes('calm')) return <Coffee {...iconProps} className="text-info" />;
        if (lower.includes('excited') || lower.includes('amazing')) return <PartyPopper {...iconProps} className="text-secondary" />;
        if (lower.includes('stressed') || lower.includes('anxious')) return <AlertCircle {...iconProps} className="text-warning" />;
        
        return <Zap {...iconProps} />; // Default
    };

    return (
        <div className="mb-12 animate-fade-in-up">
            <div className="py-3 text-2xl text-primary font-semibold divider mb-8">
                Mood Analysis 🎭
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Summary / Stats Section (Left) */}
                <div className="space-y-6 order-2 md:order-1">
                    <div className="grid grid-cols-2 gap-4">
                         {/* Total Moods Card */}
                        <div className="bg-base-100 rounded-2xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold opacity-70">Total Moods ✨</p>
                                    <p className="text-2xl font-bold mt-1 text-secondary">{totalMoods}</p>
                                </div>
                                <div className="p-2 bg-secondary/10 rounded-full text-secondary">
                                    <CheckCircle2 size={20} />
                                </div>
                            </div>
                        </div>

                         {/* Total Days Card */}
                         <div className="bg-base-100 rounded-2xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold opacity-70">Total Days 📅</p>
                                    <p className="text-2xl font-bold mt-1 text-accent">{totalDaysInRange}</p>
                                </div>
                                <div className="p-2 bg-accent/10 rounded-full text-accent">
                                    <Calendar size={20} />
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Breakdown Card */}
                    <div className="bg-base-100 rounded-2xl shadow-md p-6">
                        <h4 className="text-lg font-semibold mb-4 opacity-70">Mood Breakdown 📋</h4>
                        <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(moodCounts)
                                .sort(([, a], [, b]) => b - a)
                                .map(([mood, count]) => (
                                    <div key={mood} className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium flex items-center gap-2">{getMoodIcon(mood)} {mood}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-secondary">{count} <span className="text-xs opacity-50 font-normal">/ {totalDaysInRange}</span></span>
                                        </div>
                                    </div>
                                ))
                            }
                             {Object.keys(moodCounts).length === 0 && (
                                <p className="text-sm text-center opacity-50 py-2">No moods configured or logged</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart Section (Right) */}
                <div className="bg-base-100 rounded-2xl shadow-md p-6 flex flex-col items-center justify-center order-1 md:order-2">
                     <h3 className="text-lg font-semibold mb-4 w-full text-left flex items-center gap-2">
                         <Smile size={20}/> Frequency Chart (vs Total Days)
                    </h3>
                    {totalMoods > 0 ? (
                        <div className="w-full h-80">
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="bar"
                                height="100%"
                            />
                        </div>
                    ) : (
                         <div className="h-64 flex items-center justify-center text-gray-500">
                            No mood data available for this period
                        </div>
                    )}
                </div>

            </section>
            
            {/* Mood Calendar Section */}
            <section className="mt-8">
                 <MoodCalendar 
                    habitData={habitData} 
                    moodList={moodList}
                    year={fromDate ? dayjs(fromDate).year() : dayjs().year()}
                 />
            </section>
        </div>
    );
};

export default MoodAnalysis;
