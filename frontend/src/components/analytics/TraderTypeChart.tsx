import React from 'react';
import { Card } from 'antd';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TraderTypeChartProps {
  data: { type: string; count: number }[];
}

const TraderTypeChart: React.FC<TraderTypeChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.type),
    datasets: [
      {
        label: '건수',
        data: data.map(d => d.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Trader Type 분포',
        font: {
          size: 16
        }
      },
    },
  };

  return (
    <Card>
      <div style={{ height: 400 }}>
        <Pie data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default TraderTypeChart;