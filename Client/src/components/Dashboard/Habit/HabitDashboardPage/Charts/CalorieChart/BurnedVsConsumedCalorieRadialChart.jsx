import Chart from "react-apexcharts";
import { useState, useEffect } from "react";

function BurnedVsConsumedCalorieRadialChart({
  habitData,
  ConsumedCalorieMax,
  BurnedCalorieMax,
}) {
  const [series, setSeries] = useState([0, 0]);
  const [effectiveKcal, setEffectiveKcal] = useState(0);
  const [rawValues, setRawValues] = useState([0, 0]);

  useEffect(() => {
    if (!Array.isArray(habitData)) return;

    let consumed = 0;
    let burned = 0;

    for (const { intake, burned: burnedVal } of habitData) {
      consumed += Number(intake) || 0;
      burned += Number(burnedVal) || 0;
    }

    const totalDays = habitData.length || 1;
    const totalConsumedMax = (Number(ConsumedCalorieMax) || 1) * totalDays;
    const totalBurnedMax = (Number(BurnedCalorieMax) || 1) * totalDays;

    const consumedPercent = Math.min(100, Math.round((consumed / totalConsumedMax) * 100));
    const burnedPercent = Math.min(100, Math.round((burned / totalBurnedMax) * 100));

    // ✅ Use local values directly, no stale state involved
    setSeries([consumedPercent, burnedPercent]);
    setEffectiveKcal(consumed - burned);
    setRawValues([consumed, burned]); // used only for tooltip
  }, [habitData, ConsumedCalorieMax, BurnedCalorieMax]);


  const options = {
    chart: {
      height: 450,
      type: "radialBar",
      toolbar: { show: true },
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
          show: true,
          name: {
            show: true,
            color: "#d1d5db",
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
            formatter: () => `${effectiveKcal} kcal`,
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (_, opts) => `${rawValues[opts.seriesIndex]} kcal`,
        title: {
          formatter: (seriesName) => seriesName,
        },
      },
    },
    colors: ["#1E3A8A", "#3abcf7"],
    labels: ["Calories Consumed", "Calories Burned"],
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }} className="p-4">
      <Chart options={options} series={series} type="radialBar" height={450} key={series.join("-")} />
    </div>
  );
}

export default BurnedVsConsumedCalorieRadialChart;
