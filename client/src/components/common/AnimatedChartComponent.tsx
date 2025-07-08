
import React, { useEffect, useRef, useState } from 'react';
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
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
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
  'rgba(75, 192, 85, 0.7)',
  'rgba(140, 176, 54, 0.7)',
  'rgba(202, 155, 68, 0.7)',
  'rgba(159, 112, 74, 0.7)',
  'rgba(108, 157, 198, 0.7)',
  'rgba(225, 190, 106, 0.7)',
  'rgba(161, 215, 173, 0.7)',
  'rgba(103, 126, 80, 0.7)',
  'rgba(199, 126, 59, 0.7)',
  'rgba(71, 140, 111, 0.7)',
  'rgba(121, 189, 154, 0.7)',
  'rgba(173, 216, 230, 0.7)',
  'rgba(152, 251, 152, 0.7)',
  'rgba(221, 187, 153, 0.7)',
  'rgba(226, 114, 91, 0.7)',
  'rgba(175, 238, 238, 0.7)'
];

const borderPalette = colorPalette.map(color => 
  color.replace(/[\d.]+\)$/, '1)')
);

interface AnimatedChartComponentProps {
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
  animate?: boolean;
  metadata?: {
    source?: string;
    lastUpdated?: string;
    units?: string;
    period?: string;
  };
}

const AnimatedChartComponent: React.FC<AnimatedChartComponentProps> = ({ 
  chartType, 
  chartData,
  height = 400,
  title,
  description,
  animate = true,
  metadata
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

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
              borderWidth: dataset.borderWidth || 2
            };
          }

          return {
            ...dataset,
            backgroundColor: chartData.labels.map((_, i) => colorPalette[i % colorPalette.length]),
            borderColor: chartData.labels.map((_, i) => borderPalette[i % borderPalette.length]),
            borderWidth: dataset.borderWidth || 2
          };
        }

        if (chartType.toLowerCase() === 'line') {
          const color = dataset.backgroundColor || colorPalette[datasetIndex % colorPalette.length];
          const borderColor = dataset.borderColor || borderPalette[datasetIndex % borderPalette.length];

          return {
            ...dataset,
            backgroundColor: color,
            borderColor: borderColor,
            borderWidth: dataset.borderWidth || 3,
            tension: dataset.tension !== undefined ? dataset.tension : 0.4,
            fill: dataset.fill !== undefined ? dataset.fill : false,
            pointBackgroundColor: dataset.pointBackgroundColor || borderColor,
            pointBorderColor: dataset.pointBorderColor || borderColor,
            pointHoverRadius: dataset.pointHoverRadius || 8,
            pointRadius: dataset.pointRadius || 6
          };
        }

        return {
          ...dataset,
          backgroundColor: dataset.backgroundColor || colorPalette[datasetIndex % colorPalette.length],
          borderColor: dataset.borderColor || borderPalette[datasetIndex % borderPalette.length],
          borderWidth: dataset.borderWidth || 2
        };
      })
    };
  }, [chartType, chartData]);

  const isMobile = window.innerWidth <= 768;

  const getAnimationConfig = () => {
    if (!animate) return { duration: 0 };

    const baseConfig = {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    };

    switch (chartType.toLowerCase()) {
      case 'line':
        // For line charts, we handle animation manually
        return { duration: 0 };
      case 'bar':
        return {
          ...baseConfig,
          y: {
            type: 'number' as const,
            easing: 'easeOutBounce' as const,
            duration: 1500,
            from: 0,
            to: 1,
          }
        };
      case 'pie':
      case 'doughnut':
        return {
          ...baseConfig,
          animateRotate: true,
          animateScale: true
        };
      default:
        return baseConfig;
    }
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: getAnimationConfig(),
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
            size: isMobile ? 12 : 14,
            weight: '500' as const
          },
          color: '#1f2937',
          padding: isMobile ? 12 : 20,
          usePointStyle: true,
          boxWidth: isMobile ? 8 : 12,
          maxWidth: isMobile ? 200 : undefined
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#d1d5db',
        borderWidth: 1,
        padding: isMobile ? 10 : 16,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        bodyFont: {
          family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
          size: isMobile ? 12 : 14
        },
        titleFont: {
          family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
          weight: 'bold' as const,
          size: isMobile ? 12 : 14
        }
      }
    },
    onAnimationComplete: () => {
      setAnimationComplete(true);
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
                color: 'rgba(0, 0, 0, 0.05)',
                lineWidth: 1
              },
              ticks: {
                color: '#374151',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: isMobile ? 11 : 13
                },
                maxTicksLimit: isMobile ? 5 : 8
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#374151',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: isMobile ? 10 : 13
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
          interaction: {
            intersect: false,
            mode: 'index' as const,
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                lineWidth: 1
              },
              ticks: {
                color: '#374151',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: isMobile ? 11 : 13
                },
                maxTicksLimit: isMobile ? 5 : 8
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#374151',
                font: {
                  family: "'Poppins', 'Helvetica', 'Arial', sans-serif",
                  size: isMobile ? 10 : 13
                },
                maxRotation: isMobile ? 45 : 0,
                minRotation: isMobile ? 45 : 0
              }
            }
          },
          elements: {
            line: {
              borderJoinStyle: 'round' as const,
              borderCapStyle: 'round' as const,
            },
            point: {
              radius: 5,
              hoverRadius: 8,
              hoverBorderWidth: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderWidth: 2
            }
          },
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              ...baseOptions.plugins.tooltip,
              filter: function(tooltipItem) {
                return tooltipItem.dataIndex < (chartInstance.current?.data.labels?.length || 0);
              },
              callbacks: {
                title: function(context) {
                  return context[0].label || '';
                },
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value.toLocaleString('pt-BR')}`;
                }
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
                padding: isMobile ? 8 : 20,
                font: {
                  ...baseOptions.plugins.legend.labels.font,
                  size: isMobile ? 11 : 13
                }
              }
            }
          }
        };

      default:
        return baseOptions;
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const options = getOptions();

    // Special animation for line charts
    if (animate && chartType.toLowerCase() === 'line') {
      // Create initial empty chart
      chartInstance.current = new ChartJS(ctx, {
        type: chartType as any,
        data: {
          ...processedData,
          datasets: processedData.datasets.map(dataset => ({
            ...dataset,
            data: []
          })),
          labels: []
        },
        options: {
          ...options,
          animation: {
            duration: 0 // Disable default animation for custom control
          }
        }
      });

      let currentStep = 0;
      const totalSteps = processedData.labels.length;
      
      const animateLineProgress = () => {
        if (currentStep < totalSteps && chartInstance.current) {
          currentStep++;
          
          // Update chart data progressively
          const animatedData = {
            ...processedData,
            datasets: processedData.datasets.map(dataset => ({
              ...dataset,
              data: dataset.data.slice(0, currentStep)
            })),
            labels: processedData.labels.slice(0, currentStep)
          };
          
          chartInstance.current.data = animatedData;
          chartInstance.current.update('none');
          
          if (currentStep < totalSteps) {
            animationRef.current = setTimeout(animateLineProgress, 600);
          } else {
            setAnimationComplete(true);
          }
        }
      };

      // Start progressive animation after initial render
      setTimeout(() => {
        animateLineProgress();
      }, 300);
    } else {
      // Create chart with normal animation for other chart types
      chartInstance.current = new ChartJS(ctx, {
        type: chartType as any,
        data: processedData,
        options: options
      });
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartType, processedData, animate]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardContent className="p-6 md:p-8">
          {title && (
            <motion.h3 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent"
            >
              {title}
            </motion.h3>
          )}

          {description && (
            <div className="mb-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-gray-700"
              >
                {expanded ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed">{description}</p>

                    {(metadata?.source || metadata?.lastUpdated || metadata?.units || metadata?.period) && (
                      <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                          <Info className="w-4 h-4 mr-2 text-green-600" />
                          Informações Adicionais
                        </h4>
                        <dl className="space-y-3">
                          <div className="flex justify-between items-center">
                            <dt className="text-sm text-gray-600">Tipo de Gráfico</dt>
                            <dd className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                              {getChartTypeDisplay(chartType)}
                            </dd>
                          </div>

                          {metadata?.source && (
                            <div className="flex justify-between items-center">
                              <dt className="text-sm text-gray-600">Fonte dos Dados</dt>
                              <dd className="text-sm text-gray-800 text-right max-w-48 truncate font-medium">
                                {metadata.source}
                              </dd>
                            </div>
                          )}

                          {metadata?.lastUpdated && (
                            <div className="flex justify-between items-center">
                              <dt className="text-sm text-gray-600 flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Última Atualização
                              </dt>
                              <dd className="text-sm text-gray-800 font-medium">
                                {metadata.lastUpdated}
                              </dd>
                            </div>
                          )}

                          {metadata?.units && (
                            <div className="flex justify-between items-center">
                              <dt className="text-sm text-gray-600">Unidade</dt>
                              <dd className="text-sm text-gray-800 font-medium">
                                {metadata.units}
                              </dd>
                            </div>
                          )}

                          {metadata?.period && (
                            <div className="flex justify-between items-center">
                              <dt className="text-sm text-gray-600">Período</dt>
                              <dd className="text-sm text-gray-800 font-medium">
                                {metadata.period}
                              </dd>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <dt className="text-sm text-gray-600 flex items-center">
                              <Database className="w-3 h-3 mr-1" />
                              Total de Pontos
                            </dt>
                            <dd className="text-sm text-gray-800 font-medium">
                              {chartData.labels.length}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-base leading-relaxed">{shouldTruncate ? previewText : description}</p>
                )}
              </motion.div>

              {shouldTruncate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    className="mt-4 text-green-600 hover:text-green-700 flex items-center text-sm font-semibold hover:underline transition-colors"
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ height: isMobile ? Math.min(height, 300) : height }}
            className="relative"
          >
            <canvas ref={chartRef} className="w-full h-full" />
            
            {animate && !animationComplete && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 3, duration: 0.5 }}
                className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center"
              >
                <div className="text-green-600 text-sm font-medium flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                  Carregando animação...
                </div>
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedChartComponent;
