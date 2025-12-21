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

interface CountryData {
  country: string;
  strategic: number;
  nonStrategic: number;
}

interface CountryChartProps {
  data: CountryData[];
}

const CountryChart: React.FC<CountryChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.country),
    datasets: [
      {
        label: '전략물자',
        data: data.map(d => d.strategic),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
      },
      {
        label: '비전략물자',
        data: data.map(d => d.nonStrategic),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '국가별 Top 20',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <div style={{ height: 400 }}>
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
};

export default CountryChart;