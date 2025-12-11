import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const DeficitVsSurplusLitreMixedStackChart = ({ habitData, waterMin }) => {
  const [series, setSeries] = useState([]);
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    const effectiveWaterIntake = [];


    const sortedEntries = [...habitData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    setSortedData(sortedEntries);

    sortedEntries.forEach((entry) => {
      const WaterIntake = parseInt(entry.water || 0, 10);

      // deficit / surplus calc
      const effective = (WaterIntake - waterMin);

      effectiveWaterIntake.push(effective);

    });

    setSeries([
      {
        name: "Deficit / Surplus",
        type: "bar",
        data: effectiveWaterIntake,
      },
    ]);
  }, [habitData]);

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

    // title: {
    //   text: "Deficit / Surplus Chart",
    //   align: "left",
    //   style: { color: "#FFFFFF" },
    // },

    stroke: {
      width: [0, 2],
      curve: "smooth",
    },

    plotOptions: {
      bar: {
        columnWidth: "80%",
        colors: {
          // 🔥 Color red if negative, blue if positive
          ranges: [
            { from: -99999, to: -1, color: "#aa182e85" }, // RED
            { from: 0, to: 99999, color: "#008f4c91" },   // BLUE
          ],
        },
      },
    },

    dataLabels: {
      enabled: true,
      enabledOnSeries: [0,1],
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
      labels: { style: { colors: "#FFFFFF" } },
      title: {
        text: "Liters",
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
        formatter: (val) => `${val} Litre`,
      },
    },

    grid: {
      borderColor: "#444",
      strokeDashArray: 4,
    },
  };

  return <Chart options={options} series={series} type="line" height={420} />;
};

export default DeficitVsSurplusLitreMixedStackChart;
