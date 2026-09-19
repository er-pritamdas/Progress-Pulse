import React from 'react';
import dayjs from 'dayjs';
import WaterConsumptionHex from "../Charts/WaterChart/WaterConsumptionRadialChart";
import WaterScoreBoard from "../WaterScoreBoard";
import WaterHeatMap from "../Charts/WaterChart/WaterHeatMap";
import DeficitVsSurplusLitreMixedStackChart from "../Charts/WaterChart/DeficitVsSurplusLitreMixedStackChart";

const WaterAnalysis = ({
    habitData,
    waterMax,
    waterMin,
    basalMetabolicRate,
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
            {/* Water Analysis Heading */}
            <div className="py-3 text-xl md:text-2xl text-primary font-semibold divider mb-6 md:mb-12">
                Water Analysis
            </div>

            {/* Water Overview Section - Desktop View (100% Original) */}
            <section className="hidden md:block">
                <div className="grid grid-cols-12 gap-4 mb-8">
                    {/* Water Consumption Animated Chart */}
                    <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            Water Consumption
                        </h3>
                        <div className="p-2 sm:p-6 md:p-10">
                            <div className="h-72 flex items-center justify-center text-gray-500">
                                {
                                    <WaterConsumptionHex
                                        habitData={habitData}
                                        waterMax={waterMax}
                                        totalEntries={totalEntries}
                                    /> ||
                                    "Coming Soon"}
                            </div>
                        </div>
                    </div>

                    {/* Water Score Board */}
                    <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            💯 Water Score Board
                        </h3>
                        <div className="h-101 flex items-center justify-center text-gray-500">
                            <WaterScoreBoard
                                habitData={habitData}
                                waterMax={waterMax}
                                waterMin={waterMin}
                                basalMetabolicRate={basalMetabolicRate}
                                fromDate={fromDate}
                                toDate={toDate}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Water Overview Section - Phone View */}
            <section className="block md:hidden mb-4 space-y-4">
                {/* 1. Animated Graph Card (Single clean heading) */}
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <h3 className="text-base font-bold mb-2">
                        Water Consumption
                    </h3>
                    <div className="flex items-center justify-center py-2">
                        <WaterConsumptionHex
                            habitData={habitData}
                            waterMax={waterMax}
                            totalEntries={totalEntries}
                        />
                    </div>
                </div>

                {/* 2. Water Score Board Card (Subtitle with gap) */}
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <div className="mb-3">
                        <h3 className="text-base font-bold">
                            💯 Water Score Board
                        </h3>
                        {dateSubtitle && (
                            <p className="text-xs text-base-content/60 font-medium mt-1 mb-2.5">
                                {dateSubtitle}
                            </p>
                        )}
                    </div>
                    <div>
                        <WaterScoreBoard
                            habitData={habitData}
                            waterMax={waterMax}
                            waterMin={waterMin}
                            basalMetabolicRate={basalMetabolicRate}
                            fromDate={fromDate}
                            toDate={toDate}
                        />
                    </div>
                </div>
            </section>


            {/* Water Chart Section - Desktop View (100% Original with tabs) */}
            <section className="hidden md:block">
                <h2 className="text-xl font-semibold mb-4"></h2>
                <div className="bg-base-100 rounded-2xl shadow-md p-4 md:p-6">
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="WaterConsumption_Desktop"
                            className="tab"
                            aria-label="Water Heatmap"
                            defaultChecked
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-6 md:p-10">
                            <WaterHeatMap
                                habitData={habitData}
                                waterMax={waterMax}
                                waterMin={waterMin}
                            />
                        </div>

                        <input
                            type="radio"
                            name="WaterConsumption_Desktop"
                            className="tab"
                            aria-label="Deficit / Surplus (Liters)"
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-6 md:p-10">
                            <DeficitVsSurplusLitreMixedStackChart
                                habitData={habitData}
                                waterMax={waterMax}
                                waterMin={waterMin}
                                basalMetabolicRate={basalMetabolicRate}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Water Chart Section - Phone View (Only Calendar Month View, Deficit/Surplus removed) */}
            <section className="block md:hidden">
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <WaterHeatMap
                        habitData={habitData}
                        waterMax={waterMax}
                        waterMin={waterMin}
                    />
                </div>
            </section>
        </div>
    );
};

export default WaterAnalysis;
