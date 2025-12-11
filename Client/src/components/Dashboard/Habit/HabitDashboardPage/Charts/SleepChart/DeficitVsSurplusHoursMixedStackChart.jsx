import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const DeficitVsSurplusHoursMixedStackChart = ({ habitData, sleepMin }) => {
    const [series, setSeries] = useState([]);
    const [sortedData, setSortedData] = useState([]);

    useEffect(() => {
        const effectiveSleep = [];


        const sortedEntries = [...habitData].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        setSortedData(sortedEntries);

        sortedEntries.forEach((entry) => {
            const sleepDuration = parseFloat(entry.sleep || 0);

            // deficit / surplus calc
            // Baseline is sleepMin. < sleepMin is negative (deficit), > sleepMin is positive (surplus)
            const effective = (sleepDuration - sleepMin);

            effectiveSleep.push(effective);

        });

        setSeries([
            {
                name: "Deficit / Surplus",
                type: "bar",
                data: effectiveSleep,
            },
        ]);
    }, [habitData, sleepMin]);

    const options = {
        chart: {
            type: "bar",
            stacked: true,
            background: "transparent",

            toolbar: {
                show: true,
                tools: {
                    download: false,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
            zoom: { enabled: true },
        },

        stroke: {
            width: [0, 2],
            curve: "smooth",
        },

        plotOptions: {
            bar: {
                columnWidth: "80%",
                colors: {
                    // 🔥 Color red if negative, green/blue if positive
                    ranges: [
                        { from: -99999, to: -0.1, color: "#aa182e85" }, // RED (Deficit)
                        { from: 0, to: 99999, color: "#8b5cf691" },   // VIOLET (Surplus)
                    ],
                },
            },
        },

        dataLabels: {
            enabled: true,
            enabledOnSeries: [0],
            style: {
                fontSize: "10px",
                fontWeight: "400",
                colors: ["#ffffffcc"],
            },
            offsetY: 0,
            background: {
                enabled: false,
                foreColor: "#ffffffff",
                padding: 2,
                borderRadius: 3,
                opacity: 0.4,
                color: "#000000ff",
            },
            formatter: (val) => val.toFixed(1),
        },

        xaxis: {
            categories: sortedData.map((e) =>
                new Date(e.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    //   month: "short",
                })
            ),
            labels: { style: { colors: "#FFFFFF" } },
        },

        yaxis: {
            labels: {
                style: { colors: "#FFFFFF" },
                formatter: (val) => val.toFixed(2),
            },
            title: {
                text: "Hours",
                style: { color: "#FFFFFF" },
            },
        },

        legend: {
            labels: { colors: "#FFFFFF" },
            position: "top",
        },

        tooltip: {
            theme: "dark",
            shared: true,
            intersect: false,
            fillSeriesColor: false,
            marker: { show: false },
            style: { fontSize: "13px" },
            y: {
                formatter: (val) => `${val.toFixed(1)} h`,
            },
        },

        grid: {
            borderColor: "#444",
            strokeDashArray: 4,
        },
    };

    return <Chart options={options} series={series} type="line" height={420} />;
};

export default DeficitVsSurplusHoursMixedStackChart;
