import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from 'chart.js';
import { Bar, Bubble, Doughnut, Line, Pie, PolarArea, Radar, Scatter } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
);

const colorPalette = [
  'rgba(75, 192, 85, 0.7)',     // Verde principal
  'rgba(140, 176, 54, 0.7)',    // Verde oliva
  'rgba(202, 155, 68, 0.7)',    // Castanho
  'rgba(159, 112, 74, 0.7)',    // Marrom
  'rgba(108, 157, 198, 0.7)',   // Azul claro
  'rgba(225, 190, 106, 0.7)',   // Amarelo trigo
  'rgba(161, 215, 173, 0.7)',   // Verde claro
  'rgba(103, 126, 80, 0.7)',    // Verde escuro
  'rgba(199, 126, 59, 0.7)',    // Laranja terroso
  'rgba(71, 140, 111, 0.7)',    // Verde esmeralda
  'rgba(121, 189, 154, 0.7)',   // Verde menta
  'rgba(173, 216, 230, 0.7)',   // Azul céu
  'rgba(152, 251, 152, 0.7)',   // Verde pastel
  'rgba(221, 187, 153, 0.7)',   // Bege
  'rgba(226, 114, 91, 0.7)',    // Coral
  'rgba(175, 238, 238, 0.7)'    // Turquesa
];

const borderPalette = colorPalette.map(color => 
  color.replace(/[\d.]+\)$/, '1)')
);

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

const ChartComponent: React.FC<ChartComponentProps> = ({ 
  chartType, 
  chartData,
  height = 300
}) => {
  console.log(`Renderizando gráfico tipo ${chartType}:`, chartData);

  const processedData = React.useMemo(() => {
    const isAreaChart = ['pie', 'doughnut', 'polarArea'].includes(chartType.toLowerCase());

    return {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset, datasetIndex) => {
        if (isAreaChart) {
          const hasCustomColors = Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length === chartData.labels.length;

          if (hasCustomColors) {
            return {
              ...dataset,
              borderColor: dataset.borderColor || chartData.labels.map((_, i) => borderPalette[i % borderPalette.length]),
              borderWidth: dataset.borderWidth || 1
            };
          }

          return {
            ...dataset,
            backgroundColor: chartData.labels.map((_, i) => colorPalette[i % colorPalette.length]),
            borderColor: chartData.labels.map((_, i) => borderPalette[i % borderPalette.length]),
            borderWidth: dataset.borderWidth || 1
          };
        }

        if (chartType.toLowerCase() === 'line') {
          const color = dataset.backgroundColor || colorPalette[datasetIndex % colorPalette.length];
          const borderColor = dataset.borderColor || borderPalette[datasetIndex % borderPalette.length];

          return {
            ...dataset,
            backgroundColor: color,
            borderColor: borderColor,
            borderWidth: dataset.borderWidth || 2,
            tension: dataset.tension !== undefined ? dataset.tension : 0.4,
            fill: dataset.fill !== undefined ? dataset.fill : false,
            pointBackgroundColor: dataset.pointBackgroundColor || borderColor,
            pointBorderColor: dataset.pointBorderColor || borderColor,
            pointHoverRadius: dataset.pointHoverRadius || 6,
            pointRadius: dataset.pointRadius || 4
          };
        }

        return {
          ...dataset,
          backgroundColor: dataset.backgroundColor || colorPalette[datasetIndex % colorPalette.length],
          borderColor: dataset.borderColor || borderPalette[datasetIndex % borderPalette.length],
          borderWidth: dataset.borderWidth || 1
        };
      })
    };
  }, [chartType, chartData]);

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#555',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
        boxPadding: 4,
        bodyFont: {
          family: "'Poppins', 'Helvetica', 'Arial', sans-serif"
        },
        titleFont: {
          family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
          weight: 'bold',
          size: 14
        }
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

      case 'polarArea':
        return {
          ...baseOptions,
          scales: {
            r: {
              ticks: {
                backdropColor: 'transparent'
              }
            }
          }
        };

      case 'radar':
        return {
          ...baseOptions,
          scales: {
            r: {
              angleLines: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              pointLabels: {
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: 12
                }
              },
              ticks: {
                backdropColor: 'transparent'
              }
            }
          }
        };

      case 'bubble':
      case 'scatter':
        return {
          ...baseOptions,
          scales: {
            y: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
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
        return <Bar data={processedData} options={options} />;
      case 'line':
        return <Line data={processedData} options={options} />;
      case 'pie':
        return <Pie data={processedData} options={options} />;
      case 'doughnut':
        return <Doughnut data={processedData} options={options} />;
      case 'polarArea':
        return <PolarArea data={processedData} options={options} />;
      case 'radar':
        return <Radar data={processedData} options={options} />;
      case 'bubble':
        return <Bubble data={processedData} options={options} />;
      case 'scatter':
        return <Scatter data={processedData} options={options} />;
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
    <div style={{ height: `${height}px`, width: '100%' }}>
      {renderChart()}
    </div>
  );
};

export default ChartComponent;