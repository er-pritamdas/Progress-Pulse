import React, { useMemo } from 'react';
import ReactApexChart from "react-apexcharts";
import { Heart, CheckCircle2, Calendar } from "lucide-react";
import dayjs from "dayjs";

const SelfCareAnalysis = ({
    habitData,
    selfCareList = [],
    fromDate,
    toDate
}) => {

    const totalDaysInRange = useMemo(() => {
        if (!fromDate || !toDate) return 0;
        return dayjs(toDate).diff(dayjs(fromDate), 'day') + 1;
    }, [fromDate, toDate]);

    const { activityCounts, totalActivities } = useMemo(() => {
        if (!habitData || habitData.length === 0 || !selfCareList.length) {
            return { activityCounts: {}, totalActivities: 0 };
        }

        const counts = {};
        selfCareList.forEach(item => counts[item] = 0);
        let total = 0;

        habitData.forEach(entry => {
            const selfcareStr = entry.selfcare;
            if (selfcareStr && typeof selfcareStr === 'string') {
                for (let i = 0; i < selfCareList.length; i++) {
                    const habitName = selfCareList[i];
                    // Check if index exists in string and matches first char
                    if (i < selfcareStr.length) {
                        const char = selfcareStr[i];
                        if (char === habitName[0].toUpperCase()) {
                            counts[habitName] = (counts[habitName] || 0) + 1;
                            total++;
                        }
                    }
                }
            }
        });

        return { activityCounts: counts, totalActivities: total };
    }, [habitData, selfCareList]);


    // Bar Chart Configuration
    const chartSeries = [{
        name: 'Frequency',
        data: Object.values(activityCounts)
    }];
    
    const chartCategories = Object.keys(activityCounts);

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
        },
        xaxis: {
            categories: chartCategories,
            max: totalDaysInRange > 0 ? totalDaysInRange : undefined, // Limit axis to selected days
            tickAmount: Math.min(totalDaysInRange, 5), // Ensure decent tick spacing
            title: {
                text: 'Days Performed'
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

    // Helper to get emoji for habit
    const getHabitEmoji = (habitName) => {
        const lower = habitName.toLowerCase();
        if (lower.includes('workout') || lower.includes('gym') || lower.includes('exercise')) return '🏋️';
        if (lower.includes('read') || lower.includes('book')) return '📖';
        if (lower.includes('meditat')) return '🧘';
        if (lower.includes('yoga')) return '🧘‍♀️';
        if (lower.includes('run') || lower.includes('jog')) return '🏃';
        if (lower.includes('walk')) return '🚶';
        if (lower.includes('water') || lower.includes('drink')) return '💧';
        if (lower.includes('sleep') || lower.includes('nap')) return '😴';
        if (lower.includes('journal') || lower.includes('writ')) return '✍️';
        if (lower.includes('skin') || lower.includes('face')) return '✨';
        return '⚡'; // Default
    };

    return (
        <div className="mb-12 animate-fade-in-up">
            <div className="py-3 text-2xl text-primary font-semibold divider mb-8">
                Self Care Analysis 💆‍♂️
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Summary / Stats Section */}
                <div className="space-y-6 order-2 md:order-1">
                    <div className="grid grid-cols-2 gap-4">
                         {/* Total Activities Card */}
                        <div className="bg-base-100 rounded-2xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs opacity-70">Total Activities ✨</p>
                                    <p className="text-2xl font-bold mt-1 text-secondary">{totalActivities}</p>
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
                                    <p className="text-xs opacity-70">Total Days 📅</p>
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
                        <h4 className="text-sm font-semibold mb-4 opacity-70">Activity Breakdown 📋</h4>
                        <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(activityCounts)
                                .sort(([, a], [, b]) => b - a)
                                .map(([activity, count]) => (
                                    <div key={activity} className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Heart size={14} className="text-secondary opacity-70"/>
                                            <span className="font-medium">{getHabitEmoji(activity)} {activity}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-secondary">{count} <span className="text-xs opacity-50 font-normal">/ {totalDaysInRange}</span></span>
                                        </div>
                                    </div>
                                ))
                            }
                             {Object.keys(activityCounts).length === 0 && (
                                <p className="text-sm text-center opacity-50 py-2">No self care habits configured</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-base-100 rounded-2xl shadow-md p-6 flex flex-col items-center justify-center order-1 md:order-2">
                     <h3 className="text-lg font-semibold mb-4 w-full text-left flex items-center gap-2">
                         <Heart size={20}/> Frequency Chart (vs Total Days)
                    </h3>
                    {totalActivities > 0 ? (
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
                            No activity data available for this period
                        </div>
                    )}
                </div>

            </section>
        </div>
    );
};

export default SelfCareAnalysis;
