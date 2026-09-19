import React from 'react';
import dayjs from 'dayjs';
import SleepDurationRadialChart from "../Charts/SleepChart/SleepDurationRadialChart";
import SleepScoreBoard from "../SleepScoreBoard";
import SleepHeatMap from "../Charts/SleepChart/SleepHeatMap";
import DeficitVsSurplusHoursMixedStackChart from "../Charts/SleepChart/DeficitVsSurplusHoursMixedStackChart";

const SleepAnalysis = ({
    habitData,
    sleepMax,
    sleepMin,
    totalEntries,
    fromDate,
    toDate
}) => {
    const lastLoggedDate = habitData && habitData.length > 0 ? habitData[0]?.date : null;
    const firstLoggedDate = habitData && habitData.length > 0 ? habitData[habitData.length - 1]?.date : null;
    const dateSubtitle = (firstLoggedDate && lastLoggedDate)
        ? `From ${dayjs(firstLoggedDate).format('DD MMM YYYY')} to ${dayjs(lastLoggedDate).format('DD MMM YYYY')}`
        : null;

    return (
        <div className="mb-12 animate-fade-in-up">
            {/* Sleep Analysis Heading */}
            <div className="py-3 text-xl md:text-2xl text-primary font-semibold divider mb-6 md:mb-12">
                Sleep Analysis
            </div>

            {/* Sleep Overview Section - Desktop View (100% Original) */}
            <section className="hidden md:block">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                    {/* Sleep Duration Glass */}
                    <div className="col-span-1 lg:col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-3 sm:p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            Sleep Duration
                        </h3>
                        <div>
                            <div className="tabs tabs-border">
                                {/* Tab1 : Sleep Duration */}
                                <input
                                    type="radio"
                                    name="SleepDurationRadialChart"
                                    className="tab"
                                    aria-label="Sleep Duration"
                                    defaultChecked
                                />
                                <div className="tab-content border-base-300 bg-base-100 p-2 sm:p-6 md:p-10">
                                    <div className="h-72 flex items-center justify-center text-gray-500">
                                        {
                                            <SleepDurationRadialChart
                                                habitData={habitData}
                                                sleepMax={sleepMax}
                                                totalEntries={totalEntries}
                                            /> ||
                                            "Coming Soon"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Effective Vs Actual */}
                    <div className="col-span-1 lg:col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-3 sm:p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            💯 Sleep Score Board
                        </h3>
                        <div className="h-101 flex items-center justify-center text-gray-500">
                            <SleepScoreBoard
                                habitData={habitData}
                                sleepMax={sleepMax}
                                sleepMin={sleepMin}
                                fromDate={fromDate}
                                toDate={toDate}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Sleep Overview Section - Phone View */}
            <section className="block md:hidden mb-4 space-y-4">
                {/* 1. Animated Orb Card (Single clean heading) */}
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <h3 className="text-base font-bold mb-2">
                        Sleep Duration
                    </h3>
                    <div className="flex items-center justify-center py-2">
                        <SleepDurationRadialChart
                            habitData={habitData}
                            sleepMax={sleepMax}
                            totalEntries={totalEntries}
                        />
                    </div>
                </div>

                {/* 2. Sleep Score Board Card (Subtitle with gap) */}
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <div className="mb-3">
                        <h3 className="text-base font-bold">
                            💯 Sleep Score Board
                        </h3>
                        {dateSubtitle && (
                            <p className="text-xs text-base-content/60 font-medium mt-1 mb-2.5">
                                {dateSubtitle}
                            </p>
                        )}
                    </div>
                    <div>
                        <SleepScoreBoard
                            habitData={habitData}
                            sleepMax={sleepMax}
                            sleepMin={sleepMin}
                            fromDate={fromDate}
                            toDate={toDate}
                        />
                    </div>
                </div>
            </section>


            {/* Sleep Chart Section - Desktop View (100% Original with tabs) */}
            <section className="hidden md:block">
                <h2 className="text-xl font-semibold mb-4"></h2>
                <div className="bg-base-100 rounded-2xl shadow-md p-3 sm:p-4 md:p-6">
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="SleepCharts"
                            className="tab"
                            aria-label="Sleep Heatmap"
                            defaultChecked
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-2 sm:p-6 md:p-10">
                            <SleepHeatMap
                                habitData={habitData}
                                sleepMax={sleepMax}
                                sleepMin={sleepMin}
                            />
                        </div>

                        <input
                            type="radio"
                            name="SleepCharts"
                            className="tab"
                            aria-label="Deficit / Surplus (Hrs)"
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-2 sm:p-6 md:p-10">
                            <DeficitVsSurplusHoursMixedStackChart
                                habitData={habitData}
                                sleepMin={sleepMin}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Sleep Chart Section - Phone View (Only Calendar Month View) */}
            <section className="block md:hidden">
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <SleepHeatMap
                        habitData={habitData}
                        sleepMax={sleepMax}
                        sleepMin={sleepMin}
                    />
                </div>
            </section>
        </div>
    );
};

export default SleepAnalysis;

