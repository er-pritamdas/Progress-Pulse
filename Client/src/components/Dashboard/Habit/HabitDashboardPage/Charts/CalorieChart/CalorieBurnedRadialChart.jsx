import Chart from "react-apexcharts";
import { useState, useEffect } from "react";

function CalorieBurnedRadialChart({ habitData, BurnedCalorieMax }) {
  const [rawValue, setRawValue] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!Array.isArray(habitData)) return;

    let burned = 0;
    for (const { burned: burnedVal } of habitData) {
      burned += Number(burnedVal) || 0;
    }

    const totalDays = habitData.length || 1;
    const totalBurnedMax = (Number(BurnedCalorieMax) || 1) * totalDays;
    const burnedPercent = Math.min(100, Math.round((burned / totalBurnedMax) * 100));
    console.log("Burned Percent", burnedPercent);
    console.log("Burned", burned);
    console.log("Total Burned Max", totalBurnedMax);
    console.log("Total Days", totalDays);

    setRawValue(burned);
    setPercentage(burnedPercent);
  }, [habitData, BurnedCalorieMax]);

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
          background: "#1f2937",
          strokeWidth: "97%",
        },
        dataLabels: {
          name: {
            show: true,
            color: "#d1d5db",
            fontSize: "14px",
          },
          value: {
            show: true,
            color: "#ffffff",
            fontSize: "20px",
            formatter: () => `${percentage}%`,
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      y: {
        formatter: () => `${rawValue} kcal`,
        title: {
          formatter: () => "Calories Burned",
        },
      },
    },
    colors: ["#3abcf7"], // Tailwind blue-300
    labels: ["Calories Burned"],
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }} className="p-4">
      <Chart options={options} series={[percentage]} type="radialBar" height={450} key={percentage} />
    </div>
  );
}

export default CalorieBurnedRadialChart;
