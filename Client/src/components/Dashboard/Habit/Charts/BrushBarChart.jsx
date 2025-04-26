import React, { PureComponent } from 'react';
import {
    BarChart,
    Bar,
    Brush,
    ReferenceLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { name: '01', uv: 300, pv: 456 },
    { name: '02', uv: -145, pv: 230 },
    { name: '03', uv: -100, pv: 345 },
    { name: '04', uv: -8, pv: 450 },
    { name: '05', uv: 100, pv: 321 },
    { name: '06', uv: 9, pv: 235 },
    { name: '07', uv: 53, pv: 267 },
    { name: '08', uv: 252, pv: -378 },
    { name: '09', uv: 79, pv: -210 },
    { name: '10', uv: 294, pv: -23 },
    { name: '12', uv: 43, pv: 45 },
    { name: '13', uv: -74, pv: 90 },
    { name: '14', uv: -71, pv: 130 },
    { name: '15', uv: -117, pv: 11 },
    { name: '16', uv: -186, pv: 107 },
    { name: '17', uv: -16, pv: 926 },
    { name: '18', uv: -125, pv: 653 },
    { name: '19', uv: 222, pv: 366 },
    { name: '20', uv: 372, pv: 486 },
    { name: '21', uv: 182, pv: 512 },
    { name: '22', uv: 164, pv: 302 },
    { name: '23', uv: 316, pv: 425 },
    { name: '24', uv: 131, pv: 467 },
    { name: '25', uv: 291, pv: -190 },
    { name: '26', uv: -47, pv: 194 },
    { name: '27', uv: -415, pv: 371 },
    { name: '28', uv: -182, pv: 376 },
    { name: '29', uv: -93, pv: 295 },
    { name: '30', uv: -99, pv: 322 },
];

export default class Example extends PureComponent {
    static demoUrl = 'https://codesandbox.io/p/sandbox/bar-chart-with-brush-twqyp2';

    render() {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    width={900}
                    height={300}
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid
                        stroke="#eaeaea" // light grey color
                        strokeWidth={0.2} // thin lines
                        strokeDasharray="3 3" // small dashes
                    />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
                    <ReferenceLine y={0} stroke="#000" />
                    <Brush
                        dataKey="name"
                        height={30}
                        stroke="#8884d8"      // Border/stroke of the brush (purple)
                        fill="rgba(241, 217, 217, 0.1)" // Light purple background with transparency
                        alwaysShowText={true}
                    />
                    <Bar dataKey="pv" fill="#8884d8" />
                    <Bar dataKey="uv" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        );
    }
}
