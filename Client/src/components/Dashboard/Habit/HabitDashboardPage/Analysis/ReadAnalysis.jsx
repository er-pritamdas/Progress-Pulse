import React from 'react';
import dayjs from 'dayjs';
import ReadDurationRadialChart from "../Charts/ReadChart/ReadDurationRadialChart";
import ReadScoreBoard from "../ReadScoreBoard";
import ReadHeatMap from "../Charts/ReadChart/ReadHeatMap";
import DeficitVsSurplusReadMixedStackChart from "../Charts/ReadChart/DeficitVsSurplusReadMixedStackChart";

const ReadAnalysis = ({
    habitData,
    readMax,
    readMin,
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
            {/* Read Analysis Heading */}
            <div className="py-3 text-xl md:text-2xl text-primary font-semibold divider mb-6 md:mb-12">
                Read Analysis
            </div>

            {/* Read Overview Section - Desktop View (100% Original) */}
            <section className="hidden md:block">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                    {/* Read Duration Glass */}
                    <div className="col-span-1 lg:col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-3 sm:p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            Read Duration
                        </h3>
                        <div>
                            <div className="tabs tabs-border">
                                {/* Tab1 : Read Duration */}
                                <input
                                    type="radio"
                                    name="ReadDurationRadialChart"
                                    className="tab"
                                    aria-label="Read Duration"
                                    defaultChecked
                                />
                                <div className="tab-content border-base-300 bg-base-100 p-2 sm:p-6 md:p-10">
                                    <div className="h-72 flex items-center justify-center text-gray-500">
                                        {
                                            <ReadDurationRadialChart
                                                habitData={habitData}
                                                readMax={readMax}
                                                totalEntries={totalEntries}
                                            /> ||
                                            "Coming Soon"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Read Score Board */}
                    <div className="col-span-1 lg:col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-3 sm:p-4">
                        <h3 className="text-lg font-semibold mb-2">
                            💯 Read Score Board
                        </h3>
                        <div className="h-101 flex items-center justify-center text-gray-500">
                            <ReadScoreBoard
                                habitData={habitData}
                                readMax={readMax}
                                readMin={readMin}
                                fromDate={fromDate}
                                toDate={toDate}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Read Overview Section - Phone View */}
            <section className="block md:hidden mb-4 space-y-4">
                {/* 1. Animated Orb Card (Single clean heading) */}
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <h3 className="text-base font-bold mb-2">
                        Read Duration
                    </h3>
                    <div className="flex items-center justify-center py-2">
                        <ReadDurationRadialChart
                            habitData={habitData}
                            readMax={readMax}
                            totalEntries={totalEntries}
                        />
                    </div>
                </div>

                {/* 2. Read Score Board Card (Subtitle with gap) */}
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <div className="mb-3">
                        <h3 className="text-base font-bold">
                            💯 Read Score Board
                        </h3>
                        {dateSubtitle && (
                            <p className="text-xs text-base-content/60 font-medium mt-1 mb-2.5">
                                {dateSubtitle}
                            </p>
                        )}
                    </div>
                    <div>
                        <ReadScoreBoard
                            habitData={habitData}
                            readMax={readMax}
                            readMin={readMin}
                            fromDate={fromDate}
                            toDate={toDate}
                        />
                    </div>
                </div>
            </section>


            {/* Read Chart Section - Desktop View (100% Original with tabs) */}
            <section className="hidden md:block">
                <h2 className="text-xl font-semibold mb-4"></h2>
                <div className="bg-base-100 rounded-2xl shadow-md p-3 sm:p-4 md:p-6">
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="ReadCharts"
                            className="tab"
                            aria-label="Read Heatmap"
                            defaultChecked
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-2 sm:p-6 md:p-10">
                            <ReadHeatMap
                                habitData={habitData}
                                readMax={readMax}
                                readMin={readMin}
                            />
                        </div>

                        <input
                            type="radio"
                            name="ReadCharts"
                            className="tab"
                            aria-label="Deficit / Surplus (Hrs)"
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-2 sm:p-6 md:p-10">
                            <DeficitVsSurplusReadMixedStackChart
                                habitData={habitData}
                                readMin={readMin}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Read Chart Section - Phone View (Only Calendar Month View) */}
            <section className="block md:hidden">
                <div className="bg-base-100 rounded-2xl shadow-sm p-3">
                    <ReadHeatMap
                        habitData={habitData}
                        readMax={readMax}
                        readMin={readMin}
                    />
                </div>
            </section>
        </div>
    );
};

export default ReadAnalysis;

