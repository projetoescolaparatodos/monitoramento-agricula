import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  chartType: string;
  chartData: any;
}

const ChartComponent = ({ chartType, chartData }: ChartComponentProps) => {
  if (!chartData || !chartData.datasets) {
    return <div>Dados do gráfico não disponíveis</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: true,
      },
      title: {
        display: !!chartData.title,
        text: chartData.title || '',
      },
    },
    scales: chartType.toLowerCase() !== 'pie' ? {
      y: {
        beginAtZero: true,
      },
      x: {
        display: true,
      }
    } : undefined
  };

  switch (chartType.toLowerCase()) {
    case 'line':
      return <Line data={chartData} options={options} />;
    case 'bar':
      return <Bar data={chartData} options={options} />;
    case 'pie':
      return <Pie data={chartData} options={options} />;
    case 'doughnut':
      return <Doughnut data={chartData} options={options} />;
    default:
      return <div>Tipo de gráfico não suportado</div>;
  }
};

export default ChartComponent;