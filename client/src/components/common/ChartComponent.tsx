import React, { useState } from 'react';
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
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, Database, Info } from 'lucide-react';

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
  'rgba(52, 152, 219, 0.8)',    // Azul vibrante
  'rgba(241, 196, 15, 0.8)',    // Amarelo dourado
  'rgba(46, 204, 113, 0.8)',    // Verde esmeralda
  'rgba(231, 76, 60, 0.8)',     // Vermelho vibrante
  'rgba(155, 89, 182, 0.8)',    // Roxo vibrante
  'rgba(230, 126, 34, 0.8)',    // Laranja vibrante
  'rgba(26, 188, 156, 0.8)',    // Turquesa
  'rgba(243, 156, 18, 0.8)',    // Laranja dourado
  'rgba(142, 68, 173, 0.8)',    // Violeta
  'rgba(22, 160, 133, 0.8)',    // Verde petróleo
  'rgba(192, 57, 43, 0.8)',     // Vermelho escuro
  'rgba(41, 128, 185, 0.8)',    // Azul oceano
  'rgba(39, 174, 96, 0.8)',     // Verde floresta
  'rgba(211, 84, 0, 0.8)',      // Laranja queimado
  'rgba(149, 165, 166, 0.8)',   // Cinza azulado
  'rgba(232, 67, 147, 0.8)'     // Rosa vibrante
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
  title?: string;
  description?: string;
  showSidebar?: boolean;
  metadata?: {
    source?: string;
    lastUpdated?: string;
    units?: string;
    period?: string;
  };
}

const ChartComponent: React.FC<ChartComponentProps> = ({ 
  chartType, 
  chartData,
  height = 300,
  title,
  description,
  showSidebar = true,
  metadata
}) => {
  const [expanded, setExpanded] = useState(false);
  console.log(`Renderizando gráfico tipo ${chartType}:`, chartData);

  const processedData = React.useMemo(() => {
    const isAreaChart = ['pie', 'doughnut', 'polarArea'].includes(chartType.toLowerCase());
    const isBarChart = chartType.toLowerCase() === 'bar';

    return {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset, datasetIndex) => {
        if (isBarChart) {
          const hasCustomColors = Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length === dataset.data.length;

          if (hasCustomColors) {
            return {
              ...dataset,
              borderColor: dataset.borderColor || dataset.data.map((_, i) => borderPalette[i % borderPalette.length]),
              borderWidth: dataset.borderWidth || 1
            };
          }

          return {
            ...dataset,
            backgroundColor: dataset.data.map((_, i) => colorPalette[i % colorPalette.length]),
            borderColor: dataset.data.map((_, i) => borderPalette[i % borderPalette.length]),
            borderWidth: dataset.borderWidth || 1
          };
        }

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

  const isMobile = window.innerWidth <= 768;

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: (isMobile ? 'bottom' : 'top') as const,
        labels: {
          font: {
            family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
            size: isMobile ? 10 : 12
          },
          color: '#000000',
          padding: isMobile ? 8 : 20,
          usePointStyle: true,
          boxWidth: isMobile ? 6 : 8,
          maxWidth: isMobile ? 200 : undefined
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000000',
        bodyColor: '#000000',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: isMobile ? 8 : 12,
        cornerRadius: 6,
        boxPadding: 4,
        bodyFont: {
          family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
          size: isMobile ? 12 : 14
        },
        titleFont: {
          family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
          weight: 'bold',
          size: isMobile ? 12 : 14
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
                color: '#000000',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: isMobile ? 10 : 12
                },
                maxTicksLimit: isMobile ? 5 : 8
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#000000',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: isMobile ? 9 : 12
                },
                maxRotation: isMobile ? 45 : 0,
                minRotation: isMobile ? 45 : 0
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
              },
              ticks: {
                color: '#000000',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: isMobile ? 10 : 12
                },
                maxTicksLimit: isMobile ? 5 : 8
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#000000',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: isMobile ? 9 : 12
                },
                maxRotation: isMobile ? 45 : 0,
                minRotation: isMobile ? 45 : 0
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
              position: (isMobile ? 'bottom' : 'right') as const,
              labels: {
                ...baseOptions.plugins.legend.labels,
                color: '#000000',
                padding: isMobile ? 6 : 20,
                font: {
                  ...baseOptions.plugins.legend.labels.font,
                  size: isMobile ? 9 : 12
                }
              }
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
                color: '#000000',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: 12
                }
              },
              ticks: {
                color: '#000000',
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
              },
              ticks: {
                color: '#000000',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif"
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                color: '#000000',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif"
                }
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

  // Limitar a descrição para exibição inicial
  const previewLength = 150;
  const shouldTruncate = description && description.length > previewLength;
  const previewText = shouldTruncate ? description.slice(0, previewLength) + '...' : description;

  const getChartTypeDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      'bar': 'Gráfico de Barras',
      'line': 'Gráfico de Linhas',
      'pie': 'Gráfico de Pizza',
      'doughnut': 'Gráfico de Rosca',
      'radar': 'Gráfico Radar',
      'polarArea': 'Área Polar',
      'scatter': 'Gráfico de Dispersão',
      'bubble': 'Gráfico de Bolhas'
    };
    return types[type] || type;
  };

  return (
    <div className="w-full">
      <Card className="bg-white/80 dark:bg-zinc-900/80 border-gray-200 dark:border-zinc-700 shadow-md">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          {title && (
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-gray-100 mb-4`}>
              {title}
            </h3>
          )}

          {description && (
            <div className="mb-6">
              <AnimatePresence initial={false}>
                <motion.div 
                  className="text-sm text-gray-700 dark:text-gray-300"
                  initial={expanded ? { height: 0, opacity: 0 } : {}}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {expanded ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p>{description}</p>

                      {(metadata?.source || metadata?.lastUpdated || metadata?.units || metadata?.period) && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            Informações Adicionais
                          </h4>
                          <dl className="space-y-2">
                            <div className="flex justify-between items-center">
                              <dt className="text-xs text-gray-600 dark:text-gray-400">Tipo de Gráfico</dt>
                              <dd className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                {getChartTypeDisplay(chartType)}
                              </dd>
                            </div>

                            {metadata?.source && (
                              <div className="flex justify-between items-center">
                                <dt className="text-xs text-gray-600 dark:text-gray-400">Fonte dos Dados</dt>
                                <dd className="text-xs text-gray-800 dark:text-gray-200 text-right max-w-48 truncate">
                                  {metadata.source}
                                </dd>
                              </div>
                            )}

                            {metadata?.lastUpdated && (
                              <div className="flex justify-between items-center">
                                <dt className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Última Atualização
                                </dt>
                                <dd className="text-xs text-gray-800 dark:text-gray-200">
                                  {metadata.lastUpdated}
                                </dd>
                              </div>
                            )}

                            {metadata?.units && (
                              <div className="flex justify-between items-center">
                                <dt className="text-xs text-gray-600 dark:text-gray-400">Unidade</dt>
                                <dd className="text-xs text-gray-800 dark:text-gray-200">
                                  {metadata.units}
                                </dd>
                              </div>
                            )}

                            {metadata?.period && (
                              <div className="flex justify-between items-center">
                                <dt className="text-xs text-gray-600 dark:text-gray-400">Período</dt>
                                <dd className="text-xs text-gray-800 dark:text-gray-200">
                                  {metadata.period}
                                </dd>
                              </div>
                            )}

                            <div className="flex justify-between items-center">
                              <dt className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                <Database className="w-3 h-3 mr-1" />
                                Total de Pontos
                              </dt>
                              <dd className="text-xs text-gray-800 dark:text-gray-200">
                                {chartData.labels.length}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{shouldTruncate ? previewText : description}</p>
                  )}
                </motion.div>
              </AnimatePresence>

              {shouldTruncate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    className="mt-3 text-blue-600 dark:text-blue-400 flex items-center text-sm font-medium hover:underline transition-colors"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <>
                        <span>Mostrar menos</span>
                        <ChevronUp size={16} className="ml-1" />
                      </>
                    ) : (
                      <>
                        <span>Ver detalhes</span>
                        <ChevronDown size={16} className="ml-1" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          )}

          <div style={{ height: isMobile ? Math.min(height, 250) : height }}>
            {renderChart()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartComponent;