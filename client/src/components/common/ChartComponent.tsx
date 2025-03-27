import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Card } from '@/components/ui/card'; // Assuming this import path is correct

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  chartType: string;
  chartData: any;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ chartType, chartData }) => {
  if (!chartData || !chartData.datasets || !chartData.labels) {
    return <div>Dados do gráfico não disponíveis</div>;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const renderChart = () => {
    switch (chartType.toLowerCase()) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'bar':
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <Card className="p-4">
      {renderChart()}
    </Card>
  );
};

export default ChartComponent;