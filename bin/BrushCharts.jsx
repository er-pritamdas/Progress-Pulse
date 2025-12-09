import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";


const BrushChart = ({ sortedData }) => {
  const brushOptions = {
    chart: {
      id: "brushChart",
      type: "area",
      height: 120,
      brush: {
        target: "mainChart",   // sync to main chart
        enabled: true,
      },
      selection: {
        enabled: true,
        xaxis: {
          min: 0,
          max: 7,   // show first 7 days initially
        },
      },
      background: "transparent",
      toolbar: { show: false },
    },

    colors: ["#00BFFF55"],

    stroke: { curve: "smooth" },

    xaxis: {
      categories: sortedData.map((e) =>
        new Date(e.date).toLocaleDateString("en-GB", { day: "numeric" })
      ),
      labels: { style: { colors: "#aaa" } },
    },

    yaxis: { labels: { show: false } },

    grid: {
      borderColor: "#333",
      strokeDashArray: 3,
    },
  };

  const brushSeries = [
    {
      name: "Intake Overview",
      data: sortedData.map((e) => parseInt(e.intake || 0)),
    },
  ];

  return (
    <Chart options={brushOptions} series={brushSeries} type="area" height={120} />
  );
};





const EffectiveMixedStackChart = ({ habitData, ConsumedCalorieMax }) => {
  const [series, setSeries] = useState([]);
  const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    const effectiveCalories = [];
    const burnedCalories = [];
    const intake = [];
    const limitLine = [];

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
      { name: "Effective Calories", type: "bar", data: effectiveCalories },
      { name: "Burned Calories", type: "bar", data: burnedCalories },
      { name: "Intake", type: "line", data: intake },
      { name: "Limit", type: "line", data: limitLine },
    ]);
  }, [habitData, ConsumedCalorieMax]);

  const options = {
    chart: {
      id: "mainChart",    // <-- added for brush sync
      type: "line",
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
      width: [0, 0, 1, 1],
      curve: "smooth",
      dashArray: [0, 0, 0, 5],
    },

    colors: ["#008a5ca4", "#008a5c34", "#005494b0", "#fd00269c"],

    plotOptions: {
      bar: {
        columnWidth: "80%",
        dataLabels: { position: "top" },
        distributed: false,
      },
    },

    dataLabels: {
      enabled: true,
      enabledOnSeries: [0, 1, 2],
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

    markers: {
      size: 4,
      strokeColor: "#292d37",
      strokeWidth: 1,
      hover: { size: 6 },
    },

    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "right",
      labels: { colors: "#FFFFFF" },
      markers: {
        fillColors: ["#008a5ca4", "#008a5c34", "#005494b0", "#fd00269c"],
      },
      itemMargin: { horizontal: 10, vertical: 5 },
    },

    xaxis: {
      categories: sortedData.map((e) =>
        new Date(e.date).toLocaleDateString("en-GB", {
          day: "numeric",
        })
      ),
      labels: { style: { colors: "#FFFFFF" }, rotate: -45 },
      axisBorder: { color: "#888" },
      axisTicks: { color: "#888" },
      title: { text: "Days", style: { color: "#FFFFFF" } },
    },

    yaxis: [
      {
        title: { text: "Calories", style: { color: "#FFFFFF" } },
        labels: { style: { colors: "#FFFFFF" } },
      },
    ],

    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      fillSeriesColor: false,
      marker: { show: true },
      style: { fontSize: "13px" },
      y: { formatter: (val) => `${val} Kcal` },
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

  return (
    <div>
      <Chart options={options} series={series} type="line" height={520} />

      {/* Brush Chart */}
      <BrushChart sortedData={sortedData} />
    </div>
  );
};

export default EffectiveMixedStackChart;
