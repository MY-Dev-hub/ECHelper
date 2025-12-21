import React from 'react';
import { Card } from 'antd';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TypeDistributionChartProps {
  data: { type: string; count: number }[];
}

const TypeDistributionChart: React.FC<TypeDistributionChartProps> = ({ data }) => {
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
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
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
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Type 분포',
        font: {
          size: 16
        }
      },
    },
  };

  return (
    <Card>
      <div style={{ height: 350 }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default TypeDistributionChart;