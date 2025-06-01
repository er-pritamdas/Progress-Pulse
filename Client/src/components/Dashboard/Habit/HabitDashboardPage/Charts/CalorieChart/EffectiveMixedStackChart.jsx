import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const EffectiveMixedStackChart = ({ habitData, ConsumedCalorieMax }) => {
  const [series, setSeries] = useState([]);
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    const effectiveCalories = [];
    const burnedCalories = [];
    const intake = [];
    const limitLine = [];

    // Sort by date (optional if already sorted)
    const sortedEntries = [...habitData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setSortedData(sortedEntries);
    sortedEntries.forEach((entry) => {
      const burned = parseInt(entry.burned || 0, 10);
      const intakeVal = parseInt(entry.intake || 0, 10);
      const effective = intakeVal - burned;

      effectiveCalories.push(effective);
      burnedCalories.push(burned);
      intake.push(intakeVal);
      limitLine.push(ConsumedCalorieMax);
    });

    setSeries([
      {
        name: "Effective Calories",
        type: "bar",
        data: effectiveCalories,
      },
      {
        name: "Burned Calories",
        type: "bar",
        data: burnedCalories,
      },
      {
        name: "Intake",
        type: "line",
        data: intake,
      },
      {
        name: "Limit",
        type: "line",
        data: limitLine,
      },
    ]);
  }, [habitData, ConsumedCalorieMax]);

  const options = {
    chart: {
      type: "line",
      stacked: true,
      background: "transparent",
      toolbar: {
        show: true,
        tools: {
          download: true,
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
    title: {
      text: "Weekly Calorie Stats",
      align: "left",
      style: { color: "#FFFFFF" },
    },
    subtitle: {
      text: "Stacked Bars + Line with Limit",
      align: "left",
      style: { color: "#CCCCCC" },
    },
    stroke: {
      width: [0, 0, 3, 2],
      curve: "smooth",
      dashArray: [0, 0, 0, 5],
    },
    colors: ["#00E396", "#FEB019", "#008FFB", "#FF4560"],
    plotOptions: {
      bar: {
        columnWidth: "50%",
        dataLabels: { position: "top" },
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
      style: {
        fontSize: "10px",
        fontWeight: "400",
        colors: ["#fff"],
      },
      offsetY: -4,
      background: {
        enabled: true,
        foreColor: "#fff",
        padding: 2,
        borderRadius: 3,
        opacity: 0.4,
        color: "#000000",
      },
    },
    markers: {
      size: 4,
      strokeColor: "#292d37",
      strokeWidth: 1,
      hover: { size: 6 },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#FFFFFF" },
      markers: {
        fillColors: ["#00E396", "#FEB019", "#008FFB", "#FF4560"],
      },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    xaxis: {
      categories: sortedData.map((e) =>
        new Date(e.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })
      ),
      labels: {
        style: { colors: "#FFFFFF" },
        rotate: -45,
      },
      axisBorder: { color: "#888" },
      axisTicks: { color: "#888" },
      title: {
        text: "Days",
        style: { color: "#FFFFFF" },
      },
    },

    yaxis: [
      {
        title: {
          text: "Calories",
          style: { color: "#FFFFFF" },
        },
        labels: { style: { colors: "#FFFFFF" } },
      },
    ],
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      style: { fontSize: "13px" },
      y: {
        formatter: (val) => `${val} Kcal`,
      },
    },
    grid: {
      show: true,
      borderColor: "#444",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 300 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  return <Chart options={options} series={series} type="line" height={520} />;
};

export default EffectiveMixedStackChart;
