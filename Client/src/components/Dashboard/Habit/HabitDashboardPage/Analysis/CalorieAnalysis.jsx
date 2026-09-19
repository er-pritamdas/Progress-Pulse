import React from 'react';
import dayjs from 'dayjs';
import BurnedVsConsumedCalorieRadialChart from "../Charts/CalorieChart/BurnedVsConsumedCalorieRadialChart";
import CalorieBurnedRadialChart from "../Charts/CalorieChart/CalorieBurnedRadialChart";
import CalorieConsumedRadialChart from "../Charts/CalorieChart/CalorieConsumedRadialChart";
import EffectiveMixedStackChart from "../Charts/CalorieChart/EffectiveMixedStackChart";
import DeficitVsSurplusMixedStackChart from "../Charts/CalorieChart/DeficitVsSurplusMixedStackChart";
import CalorieScoreBoard from "../CalorieScoreBoard";
import CalorieMonthCalendar from "../Charts/CalorieChart/CalorieMonthCalendar";

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
    const lastLoggedDate = habitData && habitData.length > 0 ? habitData[0]?.date : null;
    const firstLoggedDate = habitData && habitData.length > 0 ? habitData[habitData.length - 1]?.date : null;
    const dateSubtitle = (firstLoggedDate && lastLoggedDate)
        ? `From ${dayjs(firstLoggedDate).format('DD MMM YYYY')} to ${dayjs(lastLoggedDate).format('DD MMM YYYY')}`
        : null;

    return (
        <div className="mb-6 md:mb-12 animate-fade-in-up">
            {/* Calorie Heading */}
            <div className="py-1 md:py-3 text-xl md:text-2xl text-primary font-semibold divider mb-3 md:mb-12">
                Calorie Analysis
            </div>

            {/* Calorie Overview Section - Desktop View (100% Original) */}
            <section className="hidden md:block">
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

            {/* Calorie Overview Section - Phone View (Consumed vs Burned removed, compact spacing, date subtitle) */}
            <section className="block md:hidden mb-4">
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <div className="mb-3">
                        <h3 className="text-base font-bold">
                            💯 Calorie Score Board
                        </h3>
                        {dateSubtitle && (
                            <p className="text-xs text-base-content/60 font-medium mt-1 mb-2.5">
                                {dateSubtitle}
                            </p>
                        )}
                    </div>
                    <div>
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
            </section>
            {/* Calorie Chart Section - Desktop View (100% Original with tabs) */}
            <section className="hidden md:block">
                <h2 className="text-xl font-semibold mb-4"></h2>
                <div className="bg-base-100 rounded-2xl shadow-md p-4 md:p-6">
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="CalorieVisualization_Desktop"
                            className="tab"
                            aria-label="Consumed Vs Burned"
                            defaultChecked
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-6 md:p-10">
                            <EffectiveMixedStackChart
                                habitData={habitData}
                                ConsumedCalorieMax={ConsumedCalorieMax}
                            />
                        </div>

                        <input
                            type="radio"
                            name="CalorieVisualization_Desktop"
                            className="tab"
                            aria-label="Deficit / Surplus (Kcal)"
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-6 md:p-10">
                            <DeficitVsSurplusMixedStackChart
                                habitData={habitData}
                                ConsumedCalorieMax={ConsumedCalorieMax}
                                bmr={basalMetabolicRate}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Calorie Chart Section - Phone View (Monthly Calendar with squares filled like graph bars) */}
            <section className="block md:hidden">
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <CalorieMonthCalendar
                        habitData={habitData}
                        ConsumedCalorieMax={ConsumedCalorieMax}
                        ConsumedCalorieMin={ConsumedCalorieMin}
                        BurnedCalorieMax={BurnedCalorieMax}
                        BurnedCalorieMin={BurnedCalorieMin}
                        basalMetabolicRate={basalMetabolicRate}
                    />
                </div>
            </section>
        </div>
    );
};

export default CalorieAnalysis;
