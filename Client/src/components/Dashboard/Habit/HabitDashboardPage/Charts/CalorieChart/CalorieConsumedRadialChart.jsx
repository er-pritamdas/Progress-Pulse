import Chart from "react-apexcharts";

function CalorieConsumedRadialChart() {
  const rawValue = 70;
  const maxValue = 100;
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
          size: "70%",
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
      theme: "dark",
      y: {
        formatter: function () {
          return `${rawValue} kcal`;
        },
        title: {
          formatter: () => "Calories Consumed",
        },
      },
    },
    colors: ["#1E3A8A"], // Tailwind blue-900
    labels: ["Calories Consumed"],
  };

  return (
    <div className="w-full bg-gray-900 rounded-xl shadow p-4">
      <Chart options={options} series={[percentage]} type="radialBar" height={450} />
    </div>
  );
}

export default CalorieConsumedRadialChart;
