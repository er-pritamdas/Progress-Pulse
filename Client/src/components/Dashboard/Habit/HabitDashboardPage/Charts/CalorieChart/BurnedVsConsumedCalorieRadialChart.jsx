import Chart from "react-apexcharts";

function BurnedVsConsumedCalorieRadialChart() {
  const rawValues = [1000, 150]; // Consumed & Burned
  const maxValues = [1500, 300]; // Consumed & Burned

  const totalKcal = rawValues[0] - rawValues[1]

  // Calculate percentage for radial chart
  const percentageSeries = rawValues.map((val, i) =>
    Math.round((val / maxValues[i]) * 100)
  );

  const options = {
    chart: {
      height: 450,
      type: "radialBar",
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: "60%",
          background: "transparent",
          image: undefined,
          imageWidth: 0,
          imageHeight: 0,
          position: "front",
          dropShadow: {
            enabled: false,
          },
        },
        track: {
          background: "#1f2937", // Tailwind gray-800
          strokeWidth: "97%",
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            color: "#d1d5db", // Tailwind gray-300
            fontSize: "14px",
          },
          value: {
            show: true,
            color: "#ffffff",
            fontSize: "16px",
            offsetY: 8,
          },
          total: {
            show: true,
            label: "Effective",
            color: "#3abcf7",
            fontSize: "18px",
            formatter: function () {
              return `${totalKcal} kcal`;
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (_, opts) {
          const kcal = rawValues[opts.seriesIndex];
          return `${kcal} kcal`;
        },
        title: {
          formatter: (seriesName) => seriesName,
        },
      },
    },
    colors: ["#1E3A8A", "#3abcf7"], // Tailwind blue-900 & blue-300
    labels: ["Calories Consumed", "Calories Burned"],
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }} className="p-4">
      <Chart
        options={options}
        series={percentageSeries}
        type="radialBar"
        height={450}
      />
    </div>
  );
}

export default BurnedVsConsumedCalorieRadialChart;
