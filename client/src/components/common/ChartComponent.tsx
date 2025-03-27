
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
import { Card } from '@/components/ui/card';

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
    console.warn('Dados do gráfico inválidos:', chartData);
    return <div>Gráfico não disponível</div>;
  }

  // Configuração de cores padrão caso não sejam fornecidas
  const defaultColors = [
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
  ];

  // Garantir que cada dataset tenha uma cor
  const enhancedData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset: any, index: number) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      borderWidth: dataset.borderWidth || 1,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: true,
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: chartData.title || '',
        font: {
          size: 16
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        }
      }
    } : undefined
  };

  const renderChart = () => {
    switch (chartType.toLowerCase()) {
      case 'line':
        return <Line data={enhancedData} options={options} height={300} />;
      case 'pie':
        return <Pie data={enhancedData} options={options} height={300} />;
      case 'bar':
      default:
        return <Bar data={enhancedData} options={options} height={300} />;
    }
  };

  return (
    <Card className="p-6">
      <div style={{ height: '400px' }}>
        {renderChart()}
      </div>
    </Card>
  );
};

export default ChartComponent;
