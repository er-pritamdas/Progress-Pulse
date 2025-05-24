import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import dayjs from 'dayjs';
import axiosInstance from '../../../../Context/AxiosInstance';

const HeatmapChart = () => {
  const [series, setSeries] = useState([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);


  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const fetchHabitSettings = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/habit/settings")
      const min = res.data.data.settings.water.min
      const max = res.data.data.settings.water.max
      console.log(min)
      console.log(max)
      setMin(min)
      setMax(max)
    } catch (err) {
      console.error('Error fetching heatmap Settings data:', err);
    }
  }

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/v1/dashboard/habit/table-entry?page=1&limit=372")

      const entries = res.data.data.formattedEntries;

      // Initialize empty heatmap data structure
      const dataByMonth = months.map((month) => ({
        name: month,
        data: days.map(day => ({ x: day, y: 0 }))
      }));

      // Fill in values from the API
      entries.forEach(entry => {
        const date = dayjs(entry.date);
        const day = date.date();       // 1–31
        const monthIndex = date.month(); // 0–11

        const waterLiters = parseFloat(entry.water ?? "0");
        dataByMonth[monthIndex].data[day - 1].y = isNaN(waterLiters) ? 0 : waterLiters;

      });

      setSeries(dataByMonth);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchHabitSettings();
  }, []);

  const options = {
    chart: {
      type: 'heatmap',
      toolbar: { show: false },
      height: 588,
    },
    plotOptions: {
      heatmap: {
        radius: 21,
        shadeIntensity: 1,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            { from: 0, to: 1, color: "#142434", name: "No Value" },     // 0 to 0 
            { from: 1, to: min, color: "#a7e9df", name: "Below Min" }, //  1 to 1 (min=2)
            { from: min, to: max + 1, color: "#29c0ad", name: "Within Range" },   // 2 to 4 (max=4+1)
            { from: max + 1, to: Infinity, color: "#25a899", name: "Above Max" }  // 5 to infinity
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

  return (
    <div style={{ width: '100%', overflowX: 'auto' }} className="p-4">
      <Chart options={options} series={series} type="heatmap" height={588} />
    </div>
  );
};

export default HeatmapChart;
