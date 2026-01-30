// Import Statements
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import dayjs from 'dayjs';

const SleepHeatMap = ({ habitData, sleepMin, sleepMax }) => {

    // Variables
    const [series, setSeries] = useState([]);
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Series
    useEffect(() => {

        // Initialize empty heatmap data structure
        const dataByMonth = months.map((month) => ({
            name: month,
            data: days.map(day => ({ x: day, y: 0 }))
        }));

        // Fill in values from the API
        habitData.forEach(entry => {
            const date = dayjs(entry.date);
            const day = date.date();       // 1–31
            const monthIndex = date.month(); // 0–11

            const sleepHours = parseFloat(entry.sleep ?? "0");
            dataByMonth[monthIndex].data[day - 1].y = isNaN(sleepHours) ? 0 : sleepHours;

        });

        setSeries(dataByMonth);

    }, [habitData])

    // Options
    const options = {
        chart: {
            type: 'heatmap',
            toolbar: { show: true },
            height: 588,
        },
        plotOptions: {
            heatmap: {
                radius: 2, // Slight rounding
                shadeIntensity: 1,
                useFillColorAsStroke: false,
                colorScale: {
                    ranges: [
                        { from: 0, to: 0.1, color: "#1e1b4b", name: "No Data" },     // ~0
                        { from: 0.1, to: sleepMin, color: "#e9d5ff", name: "Below Min" }, // Lightest
                        { from: sleepMin, to: sleepMax + 0.1, color: "#c084fc", name: "Within Range" },   // Medium
                        { from: sleepMax + 0.1, to: 24, color: "#9333ea", name: "Above Max" }  // Darkest
                    ]
                }
            }
        },
        stroke: { show: false },
        dataLabels: {
            enabled: true,
            style: { colors: ['#000'] }
        },
        grid: {
            yaxis: { lines: { show: false } }
        },
        xaxis: {
            type: 'category',
            categories: days,
            labels: { style: { colors: '#fff' } },
            title: { text: "Day of Month", style: { color: '#fff' } }
        },
        yaxis: {
            labels: { style: { colors: '#fff' } },
            title: { text: "Month", style: { color: '#fff' } }
        },
        legend: {
            labels: { colors: '#fff' }
        },
        title: {
            text: 'Sleep Duration (hrs)',
            align: 'center',
            style: { color: '#fff' }
        },
        tooltip: {
            theme: 'dark'
        }
    };

    // ---------- Return JSX ----------
    return (
        <div style={{ width: '100%', overflowX: 'auto' }} className="p-4">
            <Chart options={options} series={series} type="heatmap" height={588} />
        </div>
    );
};

// Exports
export default SleepHeatMap;
