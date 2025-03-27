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

const defaultColors = [
  'rgba(75, 192, 85, 0.8)',   
  'rgba(140, 176, 54, 0.8)',  
  'rgba(202, 155, 68, 0.8)',  
  'rgba(159, 112, 74, 0.8)',  
  'rgba(108, 157, 198, 0.8)', 
  'rgba(225, 190, 106, 0.8)', 
  'rgba(161, 215, 173, 0.8)', 
  'rgba(103, 126, 80, 0.8)',  
  'rgba(199, 126, 59, 0.8)',  
  'rgba(71, 140, 111, 0.8)'   
];

const defaultBorders = defaultColors.map(color => color.replace('0.8', '1'));

const ChartComponent = ({ chartType, chartData }: ChartComponentProps) => {
  if (!chartData || !chartData.datasets) {
    return <div>Dados do gráfico não disponíveis</div>;
  }

  const processedData = {
    labels: chartData.labels,
    datasets: chartData.datasets.map((dataset: any, index: number) => {
      const baseConfig = {
        ...dataset,
        borderWidth: dataset.borderWidth || 2,
      };

      if (chartType.toLowerCase() === 'pie' || chartType.toLowerCase() === 'doughnut') {
        return {
          ...baseConfig,
          backgroundColor: dataset.backgroundColor || 
            chartData.labels.map((_: any, i: number) => defaultColors[i % defaultColors.length]),
          borderColor: dataset.borderColor || 
            chartData.labels.map((_: any, i: number) => defaultBorders[i % defaultBorders.length]),
        };
      }

      return {
        ...baseConfig,
        backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
        borderColor: dataset.borderColor || defaultBorders[index % defaultBorders.length],
      };
    })
  };

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
      return <Line data={processedData} options={options} />;
    case 'bar':
      return <Bar data={processedData} options={options} />;
    case 'pie':
      return <Pie data={processedData} options={options} />;
    case 'doughnut':
      return <Doughnut data={processedData} options={options} />;
    default:
      return <div>Tipo de gráfico não suportado</div>;
  }
};

export default ChartComponent;