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

interface YearlyData {
  year: number;
  strategic: number;
  nonStrategic: number;
}

interface YearlyTrendChartProps {
  data: YearlyData[];
}

const YearlyTrendChart: React.FC<YearlyTrendChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.year.toString()),
    datasets: [
      {
        label: '전략물자',
        data: data.map(d => d.strategic),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      },
      {
        label: '비전략물자',
        data: data.map(d => d.nonStrategic),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 2,
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
        text: '연도별 전략/비전략 물자 트렌드',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
        stacked: false,
        ticks: {
          stepSize: 5
        }
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

export default YearlyTrendChart;