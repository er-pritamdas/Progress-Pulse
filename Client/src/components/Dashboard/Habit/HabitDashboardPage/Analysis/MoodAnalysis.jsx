import React, { useMemo } from 'react';
import ReactApexChart from "react-apexcharts";
import { Smile, Calendar } from "lucide-react";
import dayjs from "dayjs";

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
                // Determine the mood key. If exact match exists, good.
                // If not, try to match by case or trimmed. 
                // Since entry uses exact string from dropdown, it should match.
                // But fallback for validity.
                const moodKey = moodList.find(m => m === entry.mood) || entry.mood;
                counts[moodKey] = (counts[moodKey] || 0) + 1;
                total++;
            }
        });

        return { moodCounts: counts, totalMoods: total };
    }, [habitData, moodList]);


    // Pie Chart Configuration
    const chartSeries = Object.values(moodCounts);
    const chartLabels = Object.keys(moodCounts);

    // Color Mapping
    const getMoodColor = (mood) => {
        const lower = mood.toLowerCase();
        if (lower.includes('good') || lower.includes('happy')) return '#10B981'; // Green
        if (lower.includes('amazing') || lower.includes('great')) return '#3B82F6'; // Blue
        if (lower.includes('average') || lower.includes('okay')) return '#FBBF24'; // Yellow
        if (lower.includes('bad') || lower.includes('sad')) return '#EF4444'; // Red
        if (lower.includes('depressed')) return '#7F1D1D'; // Dark Red
        if (lower.includes('productive')) return '#8B5CF6'; // Purple
        if (lower.includes('excited')) return '#EC4899'; // Pink
        return null; // Fallback
    };

    const defaultColors = [
        "#3C91E6", "#342E37", "#A2D729", "#FA824C", "#FEF9C3",
        "#F87171", "#60A5FA", "#34D399", "#A78BFA", "#F472B6"
    ];

    const chartColors = chartLabels.map((label, index) => 
        getMoodColor(label) || defaultColors[index % defaultColors.length]
    );

    const chartOptions = {
        chart: {
            type: 'pie',
            background: 'transparent',
            foreColor: '#9ca3af',
        },
        labels: chartLabels,
        theme: {
            monochrome: {
                enabled: false,
            },
            mode: 'dark', 
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%'
                }
            }
        },
        legend: {
            position: 'bottom',
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val.toFixed(1) + "%"
            }
        },
        colors: chartColors,
        stroke: {
            show: true,
            colors: ['#1f2937'] // base-100 dark
        }
    };

    // Helper to get emoji for mood
    const getMoodEmoji = (moodName) => {
        const lower = moodName.toLowerCase();
        if (lower.includes('amazing')) return '🤩';
        if (lower.includes('good') || lower.includes('happy')) return '🙂';
        if (lower.includes('average') || lower.includes('okay')) return '😐';
        if (lower.includes('sad')) return '😔';
        if (lower.includes('depress')) return '😞';
        if (lower.includes('product')) return '🚀';
        if (lower.includes('excit')) return '😃';
        if (lower.includes('tir')) return '😫';
        if (lower.includes('angry')) return '😡';
        return '🔹'; // Default
    };

    return (
        <div className="mb-12 animate-fade-in-up">
            <div className="py-3 text-2xl text-primary font-semibold divider mb-8">
                Mood Analysis 🎭
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart Section */}
                <div className="bg-base-100 rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold mb-4 w-full text-left flex items-center gap-2">
                         <Smile size={20}/> Mood Distribution 📊
                    </h3>
                    {totalMoods > 0 ? (
                        <div className="w-full h-80">
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="pie"
                                height="100%"
                            />
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No mood data available for this period
                        </div>
                    )}
                </div>

                {/* Summary / Stats Section */}
                <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        {/* Total Entries Card */}
                        <div className="bg-base-100 rounded-2xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs opacity-70">Moods Logged 📝</p>
                                    <p className="text-2xl font-bold mt-1 text-primary">{totalMoods}</p>
                                </div>
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <Smile size={20} />
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


                    {/* Top Mood Card */}
                    <div className="bg-base-100 rounded-2xl shadow-md p-6">
                        <h4 className="text-sm font-semibold mb-4 opacity-70">Frequency Breakdown 📉</h4>
                        <div className="space-y-3">
                            {Object.entries(moodCounts)
                                .sort(([, a], [, b]) => b - a)
                                .map(([mood, count]) => (
                                    <div key={mood} className="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                                        <span className="font-medium">{getMoodEmoji(mood)} {mood}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-accent">{count} <span className="text-xs opacity-50 font-normal">/ {totalDaysInRange}</span></span>
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
            </section>
        </div>
    );
};

export default MoodAnalysis;
