import { useEffect, useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { parse, formatHex } from 'culori';
import DaisyColorsRaw from '../../../../utils/DaisyColors';

function HeatMap() {
  const [colorRanges, setColorRanges] = useState([]);

  // Convert raw Daisy colors to hex using culori
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

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const series = Array.from({ length: 31 }, (_, day) => ({
    name: `${day + 1}`,
    data: months.map(month => ({
      x: month,
      y: Math.floor(Math.random() * 31)
    }))
  }));

  // 👇 useMemo to ensure options re-calculate when colorRanges updates
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
      categories: months,
      labels: {
        style: { colors: DaisyColors.info }
      }
    },
    yaxis: {
      title: { text: 'Day' },
      labels: {
        style: { colors: DaisyColors.info }
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        useFillColorAsStroke: true,
        distributed: false,
        colorScale: {
          ranges: colorRanges
        }
      }
    }
  }), [colorRanges, DaisyColors]);

  return (
    <div style={{ width: '720px', height: '930px' }}>
      <Chart
        options={options}
        series={series}
        type="heatmap"
        width={12 * 40}
        height={31 * 30}
      />
    </div>
  );
}

export default HeatMap;
