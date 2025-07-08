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
            pointHoverBackgroundColor: dataset.pointHoverBackgroundColor || borderColor,
            pointHoverBorderColor: dataset.pointHoverBorderColor || borderColor,
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

  // Funções para animação orgânica fluida
  const distanceBetween = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculateTotalLength = (points: {x: number, y: number}[]) => {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += distanceBetween(points[i-1], points[i]);
    }
    return length;
  };

  const drawOrganicLine = (
    ctx: CanvasRenderingContext2D,
    points: {x: number, y: number}[],
    progress: number,
    color: string,
    lineWidth: number = 3
  ) => {
    if (points.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Calcula o comprimento total e quanto desenhar
    const totalLength = calculateTotalLength(points);
    const animatedLength = totalLength * progress;

    let currentLength = 0;
    let currentPoint = points[0];
    
    ctx.moveTo(currentPoint.x, currentPoint.y);

    // Desenha segmentos até alcançar o comprimento animado
    for (let i = 1; i < points.length && currentLength < animatedLength; i++) {
      const nextPoint = points[i];
      const segmentLength = distanceBetween(currentPoint, nextPoint);
      
      if (currentLength + segmentLength <= animatedLength) {
        // Adiciona variação orgânica sutil
        const variation = Math.sin(i * 0.5 + Date.now() * 0.001) * 0.8;
        ctx.lineTo(nextPoint.x + variation, nextPoint.y + variation * 0.5);
        currentLength += segmentLength;
      } else {
        // Desenha apenas parte do segmento
        const remaining = animatedLength - currentLength;
        const ratio = remaining / segmentLength;
        const intermediatePoint = {
          x: currentPoint.x + (nextPoint.x - currentPoint.x) * ratio,
          y: currentPoint.y + (nextPoint.y - currentPoint.y) * ratio
        };
        
        const variation = Math.sin(i * 0.5 + Date.now() * 0.001) * 0.8 * ratio;
        ctx.lineTo(intermediatePoint.x + variation, intermediatePoint.y + variation * 0.5);
        break;
      }
      
      currentPoint = nextPoint;
    }

    ctx.stroke();
    ctx.restore();
  };

  const drawOrganicTooltip = (
    x: number, 
    y: number, 
    value: number, 
    label: string,
    xLabel: string,
    color: string,
    datasetIndex: number
  ) => {
    // Remove tooltip anterior deste dataset
    const existingTooltip = document.getElementById(`organic-tooltip-${datasetIndex}`);
    if (existingTooltip) existingTooltip.remove();

    const tooltip = document.createElement('div');
    tooltip.id = `organic-tooltip-${datasetIndex}`;
    tooltip.className = 'organic-tooltip';
    
    // Posicionamento com movimento orgânico sutil
    const time = Date.now() * 0.001;
    const offsetX = 15 + Math.sin(time + datasetIndex) * 2;
    const offsetY = -40 + Math.cos(time * 0.8 + datasetIndex) * 1.5;
    
    const canvasRect = chartRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const tooltipX = canvasRect.left + x + offsetX + window.scrollX;
    const tooltipY = canvasRect.top + y + offsetY + window.scrollY;
    
    tooltip.style.cssText = `
      position: fixed;
      left: ${tooltipX}px;
      top: ${tooltipY}px;
      background: linear-gradient(135deg, ${color.replace('0.7', '0.95')}, ${color.replace('0.7', '0.85')});
      color: white;
      padding: 10px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: ${10000 + datasetIndex};
      white-space: nowrap;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      animation: organicFloat 3s infinite ease-in-out;
    `;
    
    tooltip.innerHTML = `
      <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${label}</div>
      <div style="font-size: 10px; opacity: 0.7; margin-bottom: 6px;">${xLabel}</div>
      <div style="font-size: 16px; font-weight: 800;">${value.toLocaleString('pt-BR')}</div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Remove tooltip após 2.5 segundos
    setTimeout(() => {
      if (tooltip && tooltip.parentNode) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
          if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 300);
      }
    }, 2500);
  };

  const animateOrganicDataset = (datasetIndex: number, originalDataset: any, color: string) => {
    if (!chartInstance.current || !chartRef.current) return;

    const chart = chartInstance.current;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Pega as posições dos pontos no canvas
    const meta = chart.getDatasetMeta(datasetIndex);
    const points = meta.data.map((point: any, index: number) => ({
      x: point.x,
      y: point.y,
      value: originalDataset.data[index],
      label: chart.data.labels?.[index] || ''
    }));

    const duration = 3000; // 3 segundos para animação mais suave
    const startTime = Date.now();
    let lastTooltipIndex = -1;

    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function para movimento mais natural
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Limpa e redesenha
      chart.draw();
      
      // Desenha a linha orgânica
      drawOrganicLine(ctx, points, easedProgress, color, 4);
      
      // Desenha pontos até a posição atual
      const currentPointIndex = Math.floor(easedProgress * (points.length - 1));
      
      for (let i = 0; i <= currentPointIndex; i++) {
        const point = points[i];
        const pointProgress = Math.min((easedProgress * (points.length - 1) - i), 1);
        
        if (pointProgress > 0) {
          // Efeito de ponto pulsante
          const pulseSize = 6 + Math.sin(Date.now() * 0.005 + i) * 1.5;
          const alpha = 0.3 + pointProgress * 0.7;
          
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(point.x, point.y, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }
      
      // Mostra tooltip no ponto atual
      if (currentPointIndex >= 0 && currentPointIndex < points.length && currentPointIndex > lastTooltipIndex) {
        lastTooltipIndex = currentPointIndex;
        const currentPoint = points[currentPointIndex];
        
        drawOrganicTooltip(
          currentPoint.x,
          currentPoint.y,
          currentPoint.value,
          originalDataset.label || `Série ${datasetIndex + 1}`,
          currentPoint.label,
          color,
          datasetIndex
        );
      }

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        // Animação completa - deixa o Chart.js assumir
        if (datasetIndex === processedData.datasets.length - 1) {
          setTimeout(() => {
            setAnimationComplete(true);
            chart.update();
          }, 500);
        }
      }
    };

    animateFrame();
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

    // Criar gráfico base
    chartInstance.current = new ChartJS(ctx, {
      type: chartType as any,
      data: processedData,
      options: {
        ...options,
        animation: {
          duration: animate && chartType.toLowerCase() === 'line' ? 0 : 2000
        }
      }
    });

    // Animação orgânica para gráficos de linha
    if (animate && chartType.toLowerCase() === 'line') {
      // Esconde as linhas e pontos inicialmente
      chartInstance.current.data.datasets.forEach((dataset: any) => {
        dataset.borderWidth = 0;
        dataset.pointRadius = 0;
        dataset.pointHoverRadius = 0;
      });
      chartInstance.current.update('none');

      // Função para iniciar animação
      const startAnimation = () => {
        if (animationStarted) return;
        
        setAnimationStarted(true);

        // Anima cada dataset com delay progressivo
        processedData.datasets.forEach((originalDataset, datasetIndex) => {
          const color = borderPalette[datasetIndex % borderPalette.length];
          
          setTimeout(() => {
            animateOrganicDataset(datasetIndex, originalDataset, color);
          }, datasetIndex * 1000);
        });
      };

      // Armazena função para controle manual
      (chartInstance.current as any).startAnimation = startAnimation;
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      
      // Remove todos os tooltips orgânicos
      const tooltips = document.querySelectorAll('[id^="organic-tooltip-"]');
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