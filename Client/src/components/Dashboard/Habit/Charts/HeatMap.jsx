import React from 'react';
import Chart from 'react-apexcharts';

function HeatMap() {
  // Sample data for the heat map
  const series = [
    {
      name: 'Monday',
      data: [
        { x: 'Jan', y: 5 },
        { x: 'Feb', y: 10 },
        { x: 'Mar', y: 8 },
        { x: 'Apr', y: 15 },
        { x: 'May', y: 12 },
        { x: 'Jun', y: 7 },
        { x: 'Jul', y: 712 },

      ]
    },
    {
      name: 'Tuesday',
      data: [
        { x: 'Jan', y: 12 },
        { x: 'Feb', y: 18 },
        { x: 'Mar', y: 15 },
        { x: 'Apr', y: 22 },
        { x: 'May', y: 19 },
        { x: 'Jun', y: 14 }
      ]
    },
    {
      name: 'Wednesday',
      data: [
        { x: 'Jan', y: 8 },
        { x: 'Feb', y: 13 },
        { x: 'Mar', y: 11 },
        { x: 'Apr', y: 17 },
        { x: 'May', y: 14 },
        { x: 'Jun', y: 9 }
      ]
    },
    {
      name: 'Thursday',
      data: [
        { x: 'Jan', y: 15 },
        { x: 'Feb', y: 20 },
        { x: 'Mar', y: 18 },
        { x: 'Apr', y: 25 },
        { x: 'May', y: 22 },
        { x: 'Jun', y: 17 }
      ]
    },
    {
      name: 'Friday',
      data: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 15 },
        { x: 'Mar', y: 20 },
        { x: 'Apr', y: 20 },
        { x: 'May', y: 17 },
        { x: 'Jun', y: 12 }
      ]
    }
  ];

  const options = {
    chart: {
      type: 'heatmap',
      height: 350,
      toolbar: {
        show: true
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#ffffff']
      }
    },
    colors: ["#ffffff"],
    title: {
      text: 'HeatMap Chart',
      style: {
      color: '#FF0000', // Red color
      fontSize: '18px',
      fontWeight: 'bold'
    }
    },
    xaxis: {
      type: 'category',  // This goes here
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],  // This goes here
      labels: {
        style: {
          colors: 'oklch(71.76% 0.221 22.18)' 
        }
      }
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 10,
              name: 'low',
              color: '#00A100'
            },
            {
              from: 11,
              to: 20,
              name: 'medium',
              color: '#FFB200'
            },
            {
              from: 21,
              to: 30,
              name: 'high',
              color: '#FF0000'
            }
          ]
        }
      }
    }
  };

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="heatmap"
        height={350}
      />
    </div>
  );
}

export default HeatMap;