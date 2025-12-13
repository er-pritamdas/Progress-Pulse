import React from 'react';
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
    return (
        <div className="mb-12 animate-fade-in-up">
            {/* Read Analysis Heading */}
            <div className="py-3 text-2xl text-primary font-semibold divider mb-12">
                Read Analysis
            </div>
            {/* Read Overview Section */}
            <section>
                <div className="grid grid-cols-12 gap-4 mb-8">
                    {/* Read Duration Glass */}
                    <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
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
                                <div className="tab-content border-base-300 bg-base-100 p-10">
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

                    {/* Effective Vs Actual */}
                    <div className="col-span-6 row-span-1 bg-base-100 rounded-2xl shadow-md p-4">
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


            {/* Read Chart Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4"></h2>
                <div className="bg-base-100 rounded-2xl shadow-md p-6">
                    <div className="tabs tabs-border">
                        <input
                            type="radio"
                            name="ReadCharts"
                            className="tab"
                            aria-label="Read Heatmap"
                            defaultChecked
                        />
                        <div className="tab-content border-base-300 bg-base-100 p-10">
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
                        <div className="tab-content border-base-300 bg-base-100 p-10">
                            <DeficitVsSurplusReadMixedStackChart
                                habitData={habitData}
                                readMin={readMin}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReadAnalysis;
