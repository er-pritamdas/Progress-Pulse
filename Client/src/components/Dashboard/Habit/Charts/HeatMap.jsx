import { useEffect, useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { parse, formatHex } from 'culori';
import DaisyColorsRaw from '../../../../utils/DaisyColors';

function HeatMap() {
  const [colorRanges, setColorRanges] = useState([]);

  // Convert raw Daisy colors (CSS vars) to hex using culori
  const DaisyColors = useMemo(() => {
    const convertToHex = (value) => {
      const parsed = parse(value);
      return parsed ? formatHex(parsed) : '#ffffff';
    };

    return Object.fromEntries(
      Object.entries(DaisyColorsRaw).map(([key, value]) => [key, convertToHex(value)])
    );
  }, []);

  useEffect(() => {
    setColorRanges([
      {
        from: 0,
        to: 10,
        name: 'Low',
        color: DaisyColors.success
      },
      {
        from: 11,
        to: 20,
        name: 'Medium',
        color: DaisyColors.warning
      },
      {
        from: 21,
        to: 31,
        name: 'High',
        color: DaisyColors.error
      }
    ]);
  }, [DaisyColors]);

  const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const series = useMemo(() =>
    months.map(month => ({
      name: month,
      data: days.map(day => ({
        x: day,
        y: Math.floor(Math.random() * 31)
      }))
    })), []);

  const options = useMemo(() => ({
    chart: {
      type: 'heatmap',
      toolbar: { show: true }
    },
    dataLabels: {
      enabled: true
    },
    xaxis: {
      type: 'category',
      categories: days,
      labels: {
        style: { colors: DaisyColors.info }
      }
    },
    yaxis: {
      categories: months,
      labels: {
        style: { colors: DaisyColors.info }
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0,
        useFillColorAsStroke: true,
        distributed: false,
        colorScale: {
          ranges: colorRanges
        }
      }
    }
  }), [colorRanges, DaisyColors]);

  return (
    <div style={{ width: '1280px', height: '720px' }}>
      <Chart
        options={options}
        series={series}
        type="heatmap"
        width={31 * 42} // 31 days
        height={12 * 42} // 12 months
      />
    </div>
  );
}

export default HeatMap;
