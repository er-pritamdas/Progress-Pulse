import React from 'react';
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
    return (
        <div className="mb-12 animate-fade-in-up">
            {/* Water Analysis Heading */}
            <div className="py-3 text-2xl text-primary font-semibold divider mb-12">
                Water Analysis
            </div>
            {/* Water Overview Section */}
            <section>
                <div className="grid grid-cols-12 gap-4 mb-8">
                    {/* Consumed Vs Burned Chart */}
                    <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            Water Consumption
                        </h3>
                        <div>
                            <div className="tabs tabs-border">
                                {/* Tab1 : Water Consumed */}
                                <input
                                    type="radio"
                                    name="WaterConsumptionRadialChart"
                                    className="tab"
                                    aria-label="Water Consumed"
                                    defaultChecked
                                />
                                <div className="tab-content border-base-300 bg-base-100 p-10">
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
                        </div>
                    </div>

                    {/* Effective Vs Actual */}
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


            {/* Water Chart Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4"></h2>
                <div className="bg-base-100 rounded-2xl shadow-md p-6">
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="WaterConsumption"
                            className="tab"
                            aria-label="Water Consumption"
                            defaultChecked
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-10">
                            <WaterHeatMap
                                habitData={habitData}
                                waterMax={waterMax}
                                waterMin={waterMin}
                            />
                        </div>

                        <input
                            type="radio"
                            name="WaterConsumption"
                            className="tab"
                            aria-label="Deficit / Surplus (Liters)"
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-10">
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
        </div>
    );
};

export default WaterAnalysis;
