import React from "react";
import Chart from "react-apexcharts";

const EffectiveMixedStackChart = () => {
  const options = {
    chart: {
      type: "line", // Mixed chart base type
      stacked: true, // Enable stacking for bar series
      background: "transparent",
      toolbar: {
        show: true, // Show export/download tools
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
      zoom: {
        enabled: true,
      },
    },

    title: {
      text: "Weekly Calorie Stats",
      align: "left",
      style: {
        color: "#FFFFFF",
      },
    },

    subtitle: {
      text: "Stacked Bars + Line with Limit",
      align: "left",
      style: {
        color: "#CCCCCC",
      },
    },

    stroke: {
      width: [0, 0, 3, 2], // Bar = 0, Line = 3px, Limit Line = 2px
      curve: "smooth", // 'smooth' or 'straight'
      dashArray: [0, 0, 0, 5], // Make 'Limit' line dashed
    },

    colors: ["#00E396", "#FEB019", "#008FFB", "#FF4560"], // Customize as needed

    plotOptions: {
      bar: {
        columnWidth: "50%",
        dataLabels: {
          position: "top", // 'top', 'center', 'bottom'
        },
        // borderRadius: 5, // Rounded bars
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
        foreColor: "#fff", // Text color
        padding: 2,
        borderRadius: 3,
        opacity: 0.4,
        // 👇 Set background color here
        color: "#000000", // dark grey, or use your theme color
      },
      dropShadow: {
        enabled: false,
      },
      formatter: function (val, { seriesIndex }) {
        return val >= 1000 ? (val / 1000).toFixed(1) + "K" : val;
      },
    },

    markers: {
      size: 4,
      strokeColor: "#292d37",
      strokeWidth: 1,
      hover: {
        size: 6,
      },
    },

    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#FFFFFF",
      },
      markers: {
        fillColors: ["#00E396", "#FEB019", "#008FFB", "#FF4560"],
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },

    xaxis: {
      categories: Array.from({ length: 31 }, (_, i) => (i + 1).toString()),
      labels: {
        style: {
          colors: "#FFFFFF",
        },
        rotate: -45,
      },
      axisBorder: {
        color: "#888",
      },
      axisTicks: {
        color: "#888",
      },
      title: {
        text: "Days of the Week",
        style: {
          color: "#FFFFFF",
        },
      },
    },

    yaxis: [
      {
        title: {
          text: "Calories",
          style: {
            color: "#FFFFFF",
          },
        },
        labels: {
          style: {
            colors: "#FFFFFF",
          },
        },
      },
    ],

    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      x: {
        format: "dddd",
      },
      style: {
        fontSize: "13px",
      },
      y: {
        formatter: (val) => `${val} Kcal`,
      },
    },

    grid: {
      show: true,
      borderColor: "#444",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },

    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Effective Calories",
      type: "bar",
      data: [
        1400, 2100, 2500, 1000, 1100, 1500, 1700, 1300, 2000, 2200, 1600, 1400,
        1700, 1400, 1400, 2000, 1650, 1300, 1400, 1400, 1800, 1600, 2200, 1400,
        1800, 2000, 1900, 1900, 2000, 1900, 2000,
      ],
    },
    {
      name: "Burned Calories",
      type: "bar",
      data: [
        0, 400, 500, 500, 375, 100, 100, 500, 180, 300, 100, 300, 100, 100, 600,
        100, 165, 100, 100, 400, 300, 100, 300, 390, 200, 100, 100, 100, 200,
        300, 300,
      ],
    },
    {
      name: "Intake",
      type: "line",
      data: [
        2100, 2500, 3000, 1400, 1600, 1500, 1800, 2000, 2000, 2500, 2500, 1700,
        1500, 1500, 2000, 2000, 1300, 1500, 1500, 1600, 2500, 2500, 1800, 1800,
        2000, 1900, 2000, 2000, 1500, 2000, 3000,
      ],
    },
    {
      name: "Limit",
      type: "line",
      data: Array(31).fill(2000),
    },
  ];

  return <Chart options={options} series={series} type="line" height={520} />;
};

export default EffectiveMixedStackChart;
