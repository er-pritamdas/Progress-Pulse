// Import Statements
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import dayjs from 'dayjs';

const WaterHeatMap = ({ habitData, waterMin, waterMax }) => {

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

      const waterLiters = parseFloat(entry.water ?? "0");
      dataByMonth[monthIndex].data[day - 1].y = isNaN(waterLiters) ? 0 : waterLiters;

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
        radius: 2,
        shadeIntensity: 1,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            { from: 0, to: 1, color: "#142434", name: "No Value" },     // 0 to 0 
            { from: 1, to: waterMin, color: "#a7e9df", name: "Below Min" }, //  1 to 1 (min=2)
            { from: waterMin, to: waterMax + 1, color: "#29c0ad", name: "Within Range" },   // 2 to 4 (max=4+1)
            { from: waterMax + 1, to: Infinity, color: "#25a899", name: "Above Max" }  // 5 to infinity
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
      text: 'Water',
      align: 'center',
      style: { color: '#fff' }
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
export default WaterHeatMap;
