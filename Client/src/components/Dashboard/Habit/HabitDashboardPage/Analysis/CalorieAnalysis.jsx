import React from 'react';
import BurnedVsConsumedCalorieRadialChart from "../Charts/CalorieChart/BurnedVsConsumedCalorieRadialChart";
import CalorieBurnedRadialChart from "../Charts/CalorieChart/CalorieBurnedRadialChart";
import CalorieConsumedRadialChart from "../Charts/CalorieChart/CalorieConsumedRadialChart";
import EffectiveMixedStackChart from "../Charts/CalorieChart/EffectiveMixedStackChart";
import DeficitVsSurplusMixedStackChart from "../Charts/CalorieChart/DeficitVsSurplusMixedStackChart";
import CalorieScoreBoard from "../CalorieScoreBoard";

const CalorieAnalysis = ({
    habitData,
    ConsumedCalorieMax,
    ConsumedCalorieMin,
    BurnedCalorieMax,
    BurnedCalorieMin,
    basalMetabolicRate,
    totalEntries,
    fromDate,
    toDate
}) => {
    return (
        <div className="mb-12 animate-fade-in-up">
            {/* Calorie Heading */}
            <div className="py-3 text-2xl text-primary font-semibold divider mb-12">
                Calorie Analysis
            </div>
            {/* Calorie Overview Section */}
            <section>
                <div className="grid grid-cols-12 gap-4 mb-8">
                    {/* Consumed Vs Burned Chart */}
                    <div className="col-span-5 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            Consumed Vs Burned
                        </h3>
                        <div>
                            <div className="tabs tabs-border">
                                {/* Tab1 : Consumed */}
                                <input
                                    type="radio"
                                    name="ConsumedVsBurned_Calories"
                                    className="tab"
                                    aria-label="Consumed"
                                />
                                <div className="tab-content border-base-300 bg-base-100 p-10">
                                    <div className="h-72 flex items-center justify-center text-gray-500">
                                        {
                                            <CalorieConsumedRadialChart
                                                habitData={habitData}
                                                ConsumedCalorieMax={ConsumedCalorieMax}
                                                totalEntries={totalEntries}
                                            /> ||
                                            "Coming Soon"}
                                    </div>
                                </div>
                                {/* Tab2 : Burned */}
                                <input
                                    type="radio"
                                    name="ConsumedVsBurned_Calories"
                                    className="tab"
                                    aria-label="Burned"
                                />
                                <div className="tab-content border-base-300 bg-base-100 p-10">
                                    <div className="h-72 flex items-center justify-center text-gray-500">
                                        {<CalorieBurnedRadialChart
                                            habitData={habitData}
                                            BurnedCalorieMax={BurnedCalorieMax}
                                            totalEntries={totalEntries}
                                        /> ||
                                            "Coming Soon"}
                                    </div>
                                </div>
                                {/* Tab3 : Consumed Vs Burned */}
                                <input
                                    type="radio"
                                    name="ConsumedVsBurned_Calories"
                                    className="tab"
                                    aria-label="Consumed Vs Burned"
                                    defaultChecked
                                />
                                <div className="tab-content border-base-300 bg-base-100 p-10">
                                    <div className="h-72 flex items-center justify-center text-gray-500">
                                        {(
                                            <BurnedVsConsumedCalorieRadialChart
                                                habitData={habitData}
                                                ConsumedCalorieMax={ConsumedCalorieMax}
                                                BurnedCalorieMax={BurnedCalorieMax}
                                                totalEntries={totalEntries}
                                            />
                                        ) || "Coming Soon"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Effective Vs Actual */}
                    <div className="col-span-7 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            💯 Calorie Score Board
                        </h3>
                        <div className="h-101 flex items-center justify-center text-gray-500">
                            <CalorieScoreBoard
                                habitData={habitData}
                                ConsumedCalorieMax={ConsumedCalorieMax}
                                ConsumedCalorieMin={ConsumedCalorieMin}
                                BurnedCalorieMax={BurnedCalorieMax}
                                BurnedCalorieMin={BurnedCalorieMin}
                                basalMetabolicRate={basalMetabolicRate}
                                fromDate={fromDate}
                                toDate={toDate}
                            />
                        </div>
                    </div>
                </div>
            </section>
            {/* Calorie Chart Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4"></h2>
                <div className="bg-base-100 rounded-2xl shadow-md p-6">
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="CalorieVisualization"
                            className="tab"
                            aria-label="Consumed Vs Burned"
                            defaultChecked
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-10">
                            <EffectiveMixedStackChart
                                habitData={habitData}
                                ConsumedCalorieMax={ConsumedCalorieMax}
                            />
                        </div>

                        <input
                            type="radio"
                            name="CalorieVisualization"
                            className="tab"
                            aria-label="Deficit / Surplus (Kcal)"
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-10">
                            <DeficitVsSurplusMixedStackChart
                                habitData={habitData}
                                ConsumedCalorieMax={ConsumedCalorieMax}
                                bmr={basalMetabolicRate}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CalorieAnalysis;
