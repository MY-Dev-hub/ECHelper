import React from 'react';
import { Card } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ClassDistributionChartProps {
  data: { class: string; count: number }[];
}

const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.class),
    datasets: [
      {
        label: '건수',
        data: data.map(d => d.count),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Class 분포',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <div style={{ height: 350 }}>
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
};

export default ClassDistributionChart;