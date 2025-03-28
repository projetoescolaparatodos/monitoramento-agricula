import React from 'react';
import { Bar, Bubble, Doughnut, Line, Pie, PolarArea, Radar, Scatter } from 'react-chartjs-2';

interface ChartComponentProps {
  chartType: string;
  chartData: {
    labels: string[];
    datasets: Array<{
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      fill?: boolean;
      tension?: number;
      pointBackgroundColor?: string;
      pointBorderColor?: string;
      pointHoverRadius?: number;
      pointRadius?: number;
      [key: string]: any;
    }>;
  };
  height?: number;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({ 
  chartType, 
  chartData,
  height = 300
}) => {
  console.log(`Renderizando gráfico tipo ${chartType}:`, chartData);

  const colorPalette = [
    '#4CAF50', '#2196F3', '#FFC107', '#E91E63',
    '#9C27B0', '#00BCD4', '#FF5722', '#795548'
  ];

  const borderPalette = [
    '#388E3C', '#1976D2', '#FFA000', '#C2185B',
    '#7B1FA2', '#0097A7', '#E64A19', '#5D4037'
  ];

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const
      }
    }
  };

  const getOptions = () => {
    switch (chartType.toLowerCase()) {
      case 'bar':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif"
                }
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif"
                }
              }
            }
          }
        };

      case 'line':
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        };

      case 'pie':
      case 'doughnut':
        return {
          ...baseOptions,
          cutout: chartType.toLowerCase() === 'doughnut' ? '60%' : undefined,
          plugins: {
            ...baseOptions.plugins,
            legend: {
              ...baseOptions.plugins.legend,
              position: 'right' as const
            }
          }
        };

      default:
        return baseOptions;
    }
  };

  const renderChart = () => {
    const options = getOptions();

    switch (chartType.toLowerCase()) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      case 'polarArea':
        return <PolarArea data={chartData} options={options} />;
      case 'radar':
        return <Radar data={chartData} options={options} />;
      case 'bubble':
        return <Bubble data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      default:
        console.warn(`Tipo de gráfico não suportado: ${chartType}`);
        return (
          <div className="flex items-center justify-center h-full w-full bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-gray-500 font-medium mb-2">Tipo de gráfico não suportado</p>
              <p className="text-sm text-gray-400">{chartType}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
};

export default ChartComponent;