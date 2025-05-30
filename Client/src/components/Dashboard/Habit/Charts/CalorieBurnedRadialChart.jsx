import Chart from "react-apexcharts";

function CalorieBurnedRadialChart() {
  const rawValue = 600;
  const maxValue = 1000;
  const percentage = Math.round((rawValue / maxValue) * 100);

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
          size: "70%", // ✅ Increase size from default ~60% to 70% for a larger radius
          background: "transparent",
        },
        track: {
          background: "#1f2937", // Tailwind gray-800
          strokeWidth: "97%",
        },
        dataLabels: {
          name: {
            show: true,
            color: "#d1d5db",
            fontSize: "14px",
          },
          value: {
            color: "#ffffff",
            show: true,
            fontSize: "20px",
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: {
        formatter: function () {
          return `${rawValue} kcal`;
        },
        title: {
          formatter: () => "Calories Burned",
        },
      },
    },
    colors: ["#3abcf7"], // Tailwind blue-300
    labels: ["Calories Burned"],
  };

  return (
    <div className="w-full bg-gray-900 rounded-xl shadow p-4">
      <Chart options={options} series={[percentage]} type="radialBar" height={450} />
    </div>
  );
}

export default CalorieBurnedRadialChart;
