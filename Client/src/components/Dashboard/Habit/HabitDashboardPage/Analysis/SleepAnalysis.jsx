import React from 'react';
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
    return (
        <div className="mb-12 animate-fade-in-up">
            {/* Sleep Analysis Heading */}
            <div className="py-3 text-2xl text-primary font-semibold divider mb-12">
                Sleep Analysis
            </div>
            {/* Sleep Overview Section */}
            <section>
                <div className="grid grid-cols-12 gap-4 mb-8">
                    {/* Sleep Duration Glass */}
                    <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
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
                                <div className="tab-content border-base-300 bg-base-100 p-10">
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
                    <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
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


            {/* Sleep Chart Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4"></h2>
                <div className="bg-base-100 rounded-2xl shadow-md p-6">
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="SleepCharts"
                            className="tab"
                            aria-label="Sleep Heatmap"
                            defaultChecked
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-10">
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
                        <div className="tab-content border-base-300 bg-base-100 p-10">
                            <DeficitVsSurplusHoursMixedStackChart
                                habitData={habitData}
                                sleepMin={sleepMin}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SleepAnalysis;
