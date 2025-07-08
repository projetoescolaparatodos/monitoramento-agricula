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
import { ChevronDown, ChevronUp, Calendar, Database, Info, Play, RotateCcw } from 'lucide-react';

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
  const [animationStarted, setAnimationStarted] = useState(false);

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
          // Garantir cores diferentes para cada dataset
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
              tension: 0.4, // Increased tension for smoother curves
            },
            point: {
              radius: 4,
              hoverRadius: 8,
              hoverBorderWidth: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderWidth: 2,
              pointStyle: 'circle'
            }
          },
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              ...baseOptions.plugins.tooltip,
              enabled: true, // Manter tooltip habilitado
              displayColors: true,
              mode: 'nearest' as const,
              intersect: false,
              animation: {
                duration: 150,
                easing: 'easeOutQuart'
              },
              callbacks: {
                title: function(context) {
                  return context[0].label || '';
                },
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${value.toLocaleString('pt-BR')}`;
                },
                labelColor: function(context) {
                  return {
                    borderColor: context.dataset.borderColor,
                    backgroundColor: context.dataset.backgroundColor
                  };
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
      // Create chart with complete data but hidden lines
      chartInstance.current = new ChartJS(ctx, {
        type: chartType as any,
        data: {
          ...processedData,
          datasets: processedData.datasets.map((dataset, index) => ({
            ...dataset,
            borderColor: 'transparent', // Start with invisible lines
            backgroundColor: 'transparent',
            pointRadius: 0, // Hide points initially
            pointHoverRadius: 0,
          }))
        },
        options: {
          ...options,
          animation: {
            duration: 0 // Disable default animation for custom control
          }
        }
      });

      // Function to start animation
      const startAnimation = () => {
        if (animationStarted) return;

        setAnimationStarted(true);

        // Animate each dataset progressively with independent tooltips and different colors
        processedData.datasets.forEach((originalDataset, datasetIndex) => {
          // Garantir cores diferentes para cada linha
          const color = borderPalette[datasetIndex % borderPalette.length];
          const bgColor = colorPalette[datasetIndex % colorPalette.length];

          setTimeout(() => {
            let progress = 0;
            const totalPoints = originalDataset.data.length;
            const animationDuration = 8000; // 8 segundos por linha - velocidade mais rápida
            const totalSteps = 200; // Menos passos para animação mais fluida
            const stepDuration = animationDuration / totalSteps;
            let currentTooltipTimeout: NodeJS.Timeout | null = null;
            let lastPointShown = -1;

            const animateDataset = () => {
              if (chartInstance.current && progress <= totalSteps) {
                const currentDataset = chartInstance.current.data.datasets[datasetIndex];

                if (progress === 0) {
                  // Start animation - make line visible
                  currentDataset.borderColor = color;
                  currentDataset.backgroundColor = bgColor;
                  currentDataset.pointRadius = 0;
                }

                // Calculate smooth progress
                const normalizedProgress = Math.min(progress / totalSteps, 1);
                const easedProgress = normalizedProgress < 0.5 
                  ? 2 * normalizedProgress * normalizedProgress 
                  : 1 - Math.pow(-2 * normalizedProgress + 2, 2) / 2;

                // Calculate exact position for smooth line drawing
                const exactPointProgress = easedProgress * (totalPoints - 1);
                const currentPointToShow = Math.floor(exactPointProgress);
                const nextPointProgress = exactPointProgress - currentPointToShow;

                // Create smooth interpolated data for gradual line drawing
                const animatedData = originalDataset.data.map((value, index) => {
                  if (index < currentPointToShow) {
                    return value; // Complete points
                  } else if (index === currentPointToShow && index < totalPoints - 1) {
                    // Interpolate between current and next point for smooth line
                    const nextValue = originalDataset.data[index + 1];
                    if (nextValue !== undefined && nextPointProgress > 0) {
                      return value + (nextValue - value) * nextPointProgress;
                    }
                    return value;
                  } else if (index === currentPointToShow) {
                    return value; // Last point
                  } else {
                    return null; // Hide future points
                  }
                });

                currentDataset.data = animatedData;

                // Show points progressively
                const pointRadii = new Array(totalPoints).fill(0);
                const pointHoverRadii = new Array(totalPoints).fill(0);

                for (let i = 0; i <= currentPointToShow && i < totalPoints; i++) {
                  pointRadii[i] = 6;
                  pointHoverRadii[i] = 9;
                }

                currentDataset.pointRadius = pointRadii;
                currentDataset.pointHoverRadius = pointHoverRadii;

                // Show tooltip for new points with independent system per dataset
                if (currentPointToShow >= 0 && currentPointToShow < totalPoints && currentPointToShow > lastPointShown) {
                  lastPointShown = currentPointToShow;
                  
                  // Clear any existing tooltip for this dataset
                  if (currentTooltipTimeout) {
                    clearTimeout(currentTooltipTimeout);
                  }
                  
                  // Create unique tooltip for this dataset with delay
                  setTimeout(() => {
                    if (chartInstance.current) {
                      const chart = chartInstance.current;
                      
                      // Create custom tooltip element for this specific dataset and point
                      const tooltipId = `tooltip-${datasetIndex}-${currentPointToShow}-${Date.now()}`;
                      let tooltipElement = document.createElement('div');
                      tooltipElement.id = tooltipId;
                      tooltipElement.style.cssText = `
                        position: absolute;
                        background: rgba(255, 255, 255, 0.98);
                        border: 2px solid ${color};
                        border-radius: 10px;
                        padding: 10px 14px;
                        font-size: 13px;
                        font-family: 'Poppins', sans-serif;
                        font-weight: 500;
                        color: #374151;
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                        z-index: ${1000 + datasetIndex * 10 + currentPointToShow};
                        pointer-events: none;
                        transition: all 0.3s ease;
                        transform: scale(0.8);
                        opacity: 0;
                      `;
                      document.body.appendChild(tooltipElement);

                      const meta = chart.getDatasetMeta(datasetIndex);
                      if (meta && meta.data[currentPointToShow]) {
                        const point = meta.data[currentPointToShow];
                        const canvasPosition = chart.canvas.getBoundingClientRect();
                        
                        // Position tooltip near the point with offset based on dataset to avoid overlap
                        const baseOffsetX = 15;
                        const baseOffsetY = -50;
                        const datasetOffsetX = datasetIndex * 20; // Offset horizontal para cada série
                        const datasetOffsetY = datasetIndex * -15; // Offset vertical para cada série
                        
                        const tooltipX = canvasPosition.left + point.x + baseOffsetX + datasetOffsetX;
                        const tooltipY = canvasPosition.top + point.y + baseOffsetY + datasetOffsetY;
                        
                        tooltipElement.style.left = `${tooltipX}px`;
                        tooltipElement.style.top = `${tooltipY}px`;
                        
                        // Set tooltip content
                        const label = originalDataset.label || `Série ${datasetIndex + 1}`;
                        const value = originalDataset.data[currentPointToShow];
                        const xLabel = chartInstance.current.data.labels?.[currentPointToShow] || '';
                        
                        tooltipElement.innerHTML = `
                          <div style="color: ${color}; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center;">
                            <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%; margin-right: 8px;"></div>
                            ${label}
                          </div>
                          <div style="font-size: 12px; color: #6b7280; font-weight: 600;">${xLabel}</div>
                          <div style="font-size: 14px; color: #1f2937; font-weight: 700; margin-top: 2px;">${value.toLocaleString('pt-BR')}</div>
                        `;
                        
                        // Animate tooltip appearance
                        requestAnimationFrame(() => {
                          tooltipElement.style.opacity = '1';
                          tooltipElement.style.transform = 'scale(1)';
                        });
                        
                        // Hide tooltip after reading time (2.5 seconds for better flow)
                        currentTooltipTimeout = setTimeout(() => {
                          if (tooltipElement) {
                            tooltipElement.style.opacity = '0';
                            tooltipElement.style.transform = 'scale(0.8)';
                            setTimeout(() => {
                              if (tooltipElement && tooltipElement.parentNode) {
                                tooltipElement.parentNode.removeChild(tooltipElement);
                              }
                            }, 300);
                          }
                        }, 2500);
                      }
                    }
                  }, 200); // Delay reduzido para melhor sincronização
                }

                // Animation complete
                if (progress === totalSteps) {
                  currentDataset.data = originalDataset.data;
                  const finalPointRadii = new Array(totalPoints).fill(6);
                  const finalPointHoverRadii = new Array(totalPoints).fill(9);
                  currentDataset.pointRadius = finalPointRadii;
                  currentDataset.pointHoverRadius = finalPointHoverRadii;

                  // Clean up any remaining tooltips for this dataset
                  if (currentTooltipTimeout) {
                    clearTimeout(currentTooltipTimeout);
                  }

                  if (datasetIndex === processedData.datasets.length - 1) {
                    setAnimationComplete(true);
                  }
                }

                chartInstance.current.update('none');
                progress++;

                if (progress <= totalSteps) {
                  animationRef.current = setTimeout(animateDataset, stepDuration);
                }
              }
            };

            animateDataset();
          }, datasetIndex * 800); // 800ms de delay entre linhas para melhor fluxo
        });
      };

      // Store animation function for manual trigger
      (chartInstance.current as any).startAnimation = startAnimation;
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
      
      // Limpar todos os tooltips personalizados
      const tooltips = document.querySelectorAll('[id^="tooltip-dataset-"]');
      tooltips.forEach(tooltip => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      });
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartType, processedData, animate]);

  // Function to start/restart animation
  const handleStartAnimation = () => {
    if (chartInstance.current && (chartInstance.current as any).startAnimation) {
      // Reset animation state
      setAnimationStarted(false);
      setAnimationComplete(false);

      // Clear any existing animation
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      // Start animation
      setTimeout(() => {
        (chartInstance.current as any).startAnimation();
      }, 100);
    }
  };

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

            {/* Botão de controle da animação para gráficos de linha */}
            {animate && chartType.toLowerCase() === 'line' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="absolute top-4 right-4 z-10"
              >
                <button
                  onClick={handleStartAnimation}
                  className="bg-white shadow-lg hover:shadow-xl border border-gray-200 rounded-full p-3 transition-all duration-300 hover:scale-105 group"
                  title={animationStarted ? "Reiniciar animação" : "Iniciar animação"}
                >
                  {animationStarted ? (
                    <RotateCcw className="w-4 h-4 text-green-600 group-hover:rotate-180 transition-transform duration-300" />
                  ) : (
                    <Play className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  )}
                </button>
              </motion.div>
            )}

            {animate && animationStarted && !animationComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-full px-4 py-2 shadow-lg border border-gray-200"
              >
                <div className="text-green-600 text-sm font-medium flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-2"></div>
                  Animando gráfico...
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