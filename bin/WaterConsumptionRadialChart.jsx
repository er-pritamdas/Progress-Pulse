import Chart from "react-apexcharts";
import { useState, useEffect } from "react";

function WaterConsumptionRadialChart({ habitData, waterMax, totalEntries }) {
  const [rawValue, setRawValue] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [totalConsumedMax, setTotalConsumedMax] = useState(0);

  useEffect(() => {
    if (!Array.isArray(habitData)) return;

    let consumed = 0;
    for (const { water } of habitData) {
      consumed += Number(water) || 0;
    }

    const totalDays = habitData.length || 1;
    const total_ConsumedMax = (Number(waterMax) || 1) * totalDays;
    const consumedPercent = Math.min(100, Math.round((consumed / total_ConsumedMax) * 100));

    setRawValue(Number(consumed).toFixed(2));
    setPercentage(consumedPercent);
    setTotalConsumedMax(total_ConsumedMax);

  }, [habitData, waterMax, totalEntries]);

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
          dropShadow: { enabled: false },
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
            formatter: () => `${percentage}% of ${totalConsumedMax} L`,
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      y: {
        formatter: () => `${rawValue} L`,
        title: {
          formatter: () => "Water Consumed",
        },
      },
    },
    colors: ["#1E3A8A"], // Tailwind blue-900
    labels: [`${totalEntries} Day${totalEntries === 1 ? "" : "s"} of Consumption`],
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }} className="p-4">
      <Chart options={options} series={[percentage]} type="radialBar" height={450} key={percentage} />
    </div>
  );
}

export default WaterConsumptionRadialChart;
