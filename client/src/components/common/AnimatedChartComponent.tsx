
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

const AnimatedChartComponent = React.forwardRef<any, AnimatedChartComponentProps>(({ 
  chartType, 
  chartData,
  height = 400,
  title,
  description,
  animate = true,
  metadata
}, ref) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const animationCanvases = useRef<HTMLCanvasElement[]>([]);
  const animationContexts = useRef<CanvasRenderingContext2D[]>([]);
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
              tension: 0.4,
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
            legend: {
              ...baseOptions.plugins.legend,
              onClick: (e: any, legendItem: any, legend: any) => {
                const chart = legend.chart;
                const index = legendItem.datasetIndex;
                const meta = chart.getDatasetMeta(index);
                
                // Toggle visibility
                meta.hidden = !meta.hidden;
                
                // Remove canvas de animação da série escondida
                if (meta.hidden) {
                  const canvasToRemove = animationCanvases.current[index];
                  if (canvasToRemove) {
                    canvasToRemove.remove();
                    animationCanvases.current[index] = null;
                  }
                  
                  // Remove tooltip da série escondida
                  const tooltipToRemove = document.getElementById(`organic-tooltip-${index}`);
                  if (tooltipToRemove) {
                    tooltipToRemove.remove();
                  }
                }
                
                chart.update();
                
                // Reinicia animação se necessário
                if (!meta.hidden && animate) {
                  setTimeout(() => {
                    const color = borderPalette[index % borderPalette.length];
                    const originalDataset = processedData.datasets[index];
                    animateOrganicDataset(index, originalDataset, color);
                  }, 100);
                }
              }
            },
            tooltip: {
              ...baseOptions.plugins.tooltip,
              enabled: true,
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

    // Configurações de estilo mais robustas
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'source-over';

    // Adiciona sombra sutil para destaque
    ctx.shadowColor = color;
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0.5;

    const totalLength = calculateTotalLength(points);
    const animatedLength = totalLength * progress;

    let currentLength = 0;
    let pathStarted = false;

    // Criar um caminho suave usando curvas de Bézier
    ctx.beginPath();

    if (points.length > 0 && points[0]) {
      ctx.moveTo(points[0].x, points[0].y);
      pathStarted = true;
    }

    for (let i = 1; i < points.length && currentLength < animatedLength; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      // Verifica se os pontos são válidos
      if (!prevPoint || !currentPoint) continue;
      
      const segmentLength = distanceBetween(prevPoint, currentPoint);

      if (currentLength + segmentLength <= animatedLength) {
        // Desenha segmento completo com curva suave
        if (i === 1) {
          // Primeiro segmento - linha simples
          ctx.lineTo(currentPoint.x, currentPoint.y);
        } else {
          // Segmentos subsequentes - curva quadrática para suavidade
          const nextPoint = points[i + 1] || currentPoint;
          const cpX = (prevPoint.x + currentPoint.x) / 2;
          const cpY = (prevPoint.y + currentPoint.y) / 2;

          // Ajusta o ponto de controle baseado na direção geral
          if (nextPoint) {
            const directionX = nextPoint.x - prevPoint.x;
            const directionY = nextPoint.y - prevPoint.y;
            const adjustedCpX = cpX + directionX * 0.08;
            const adjustedCpY = cpY + directionY * 0.08;

            ctx.quadraticCurveTo(adjustedCpX, adjustedCpY, currentPoint.x, currentPoint.y);
          } else {
            ctx.lineTo(currentPoint.x, currentPoint.y);
          }
        }
        currentLength += segmentLength;
      } else {
        // Desenha apenas parte do segmento com interpolação suave
        const remaining = animatedLength - currentLength;
        const ratio = remaining / segmentLength;

        // Aplica easing na interpolação para movimento mais fluido
        const easedRatio = ratio < 0.5 ? 2 * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 2) / 2;

        const intermediatePoint = {
          x: prevPoint.x + (currentPoint.x - prevPoint.x) * easedRatio,
          y: prevPoint.y + (currentPoint.y - prevPoint.y) * easedRatio
        };

        if (i === 1) {
          ctx.lineTo(intermediatePoint.x, intermediatePoint.y);
        } else {
          const cpX = (prevPoint.x + intermediatePoint.x) / 2;
          const cpY = (prevPoint.y + intermediatePoint.y) / 2;
          ctx.quadraticCurveTo(cpX, cpY, intermediatePoint.x, intermediatePoint.y);
        }
        currentLength = animatedLength;
        break;
      }
    }

    // Desenha o caminho apenas se foi iniciado
    if (pathStarted && progress > 0) {
      ctx.stroke();
    }

    ctx.restore();
  };

  const updateOrganicTooltip = (
    datasetIndex: number,
    x: number,
    y: number,
    value: number,
    color: string,
    label: string = ''
  ) => {
    let tooltip = document.getElementById(`organic-tooltip-${datasetIndex}`);
    
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = `organic-tooltip-${datasetIndex}`;
      tooltip.className = 'organic-tooltip';
      chartRef.current?.parentElement?.appendChild(tooltip);
    }

    // Posicionamento com offset diferente para cada série
    const offsetX = 40 + (datasetIndex * 30);
    const offsetY = -30 - (datasetIndex * 15);
    
    tooltip.style.cssText = `
      position: absolute;
      left: ${x + offsetX}px;
      top: ${y + offsetY}px;
      background: ${color.replace('0.7', '0.9')};
      color: white;
      padding: 8px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: translate(-50%, -50%);
      pointer-events: none;
      transition: all 0.1s ease;
      z-index: ${1000 + datasetIndex};
      white-space: nowrap;
      border: 2px solid white;
    `;
    
    const datasetLabel = processedData.datasets[datasetIndex]?.label || 'Série';
    tooltip.textContent = `${datasetLabel}: ${value.toLocaleString('pt-BR')}`;
  };

  const animateOrganicDataset = (datasetIndex: number, originalDataset: any, color: string) => {
    if (!chartRef.current || !chartInstance.current) return;

    const chart = chartInstance.current;
    const meta = chart.getDatasetMeta(datasetIndex);
    if (!meta || meta.hidden) return;

    // Remove canvas anterior se existir
    if (animationCanvases.current[datasetIndex]) {
      animationCanvases.current[datasetIndex].remove();
    }

    // Cria canvas dedicado para esta série
    const canvas = document.createElement('canvas');
    canvas.className = `organic-animation-canvas dataset-${datasetIndex}`;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = `${10 + datasetIndex}`;
    canvas.width = chartRef.current.width;
    canvas.height = chartRef.current.height;

    const container = chartRef.current.parentElement;
    if (!container) return;

    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Armazena referências
    animationCanvases.current[datasetIndex] = canvas;
    animationContexts.current[datasetIndex] = ctx;

    // Pega as posições dos pontos no canvas
    const points = meta.data
      .map((point: any, index: number) => {
        if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
          return null;
        }
        return {
          x: point.x + Math.sin(datasetIndex * 10) * 1, // Variação orgânica
          y: point.y + Math.cos(datasetIndex * 10) * 1,
          value: originalDataset.data[index],
          label: chart.data.labels?.[index] || ''
        };
      })
      .filter(Boolean);

    if (points.length === 0) return;

    const duration = 2500 + (datasetIndex * 200); // Duração ligeiramente diferente para cada série
    const startTime = Date.now();
    let animationId: number;

    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing orgânico diferente para cada série
      const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Limpa apenas este canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Verifica se o dataset ainda está visível
      const currentMeta = chart.getDatasetMeta(datasetIndex);
      if (currentMeta && !currentMeta.hidden) {
        // Desenha a linha orgânica
        drawOrganicLine(ctx, points, easedProgress, color, 4);
        
        // Desenha pontos progressivamente
        const totalPoints = points.length;
        const visiblePointsFloat = totalPoints * easedProgress;
        const visiblePointsInt = Math.floor(visiblePointsFloat);

        // Desenha pontos completos
        for (let i = 0; i < visiblePointsInt; i++) {
          if (points[i]) {
            // Desenha o ponto
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Atualiza tooltip
            updateOrganicTooltip(
              datasetIndex,
              points[i].x,
              points[i].y,
              points[i].value,
              color,
              points[i].label
            );
          }
        }

        // Desenha ponto parcial (transição suave)
        if (visiblePointsInt < totalPoints && points[visiblePointsInt]) {
          const partialAlpha = visiblePointsFloat - visiblePointsInt;
          
          ctx.globalAlpha = partialAlpha;
          
          // Ponto com fade-in
          ctx.beginPath();
          ctx.arc(points[visiblePointsInt].x, points[visiblePointsInt].y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Efeito de pulsação no ponto atual
          const pulseRadius = 8 + Math.sin(elapsed / 300) * 3;
          ctx.beginPath();
          ctx.arc(points[visiblePointsInt].x, points[visiblePointsInt].y, pulseRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.4 * partialAlpha;
          ctx.stroke();
          
          ctx.globalAlpha = 1;
        }
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animateFrame);
      } else {
        setAnimationComplete(true);
      }
    };

    animationId = requestAnimationFrame(animateFrame);

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
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

        // Limpa animações anteriores
        animationCanvases.current.forEach(canvas => {
          if (canvas) canvas.remove();
        });
        animationCanvases.current = [];
        
        // Remove tooltips anteriores
        document.querySelectorAll('.organic-tooltip').forEach(tooltip => {
          tooltip.remove();
        });

        // Anima cada dataset com delay progressivo
        processedData.datasets.forEach((originalDataset, datasetIndex) => {
          const meta = chartInstance.current?.getDatasetMeta(datasetIndex);
          
          // Só anima se o dataset estiver visível
          if (meta && !meta.hidden) {
            const color = borderPalette[datasetIndex % borderPalette.length];

            setTimeout(() => {
              animateOrganicDataset(datasetIndex, originalDataset, color);
            }, datasetIndex * 400); // Delay escalonado
          }
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

      // Remove todos os canvas de animação
      animationCanvases.current.forEach(canvas => {
        if (canvas) canvas.remove();
      });
      animationCanvases.current = [];

      // Remove todos os tooltips
      document.querySelectorAll('.organic-tooltip').forEach(tooltip => {
        tooltip.remove();
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

      // Remove todos os canvas de animação existentes
      animationCanvases.current.forEach(canvas => {
        if (canvas) canvas.remove();
      });
      animationCanvases.current = [];

      // Remove todos os tooltips
      document.querySelectorAll('.organic-tooltip').forEach(tooltip => {
        tooltip.remove();
      });

      // Clear any existing animation
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      // Restaura visibilidade original do chart mantendo o estado da legenda
      chartInstance.current.data.datasets.forEach((dataset: any, index: number) => {
        dataset.borderWidth = 0;
        dataset.pointRadius = 0;
        dataset.pointHoverRadius = 0;
        
        // Mantém o estado de visibilidade da legenda
        const meta = chartInstance.current?.getDatasetMeta(index);
        if (meta && meta.hidden) {
          dataset.hidden = true;
        }
      });
      chartInstance.current.update('none');

      // Start animation
      setTimeout(() => {
        (chartInstance.current as any).startAnimation();
      }, 200);
    }
  };

  // Expor a função através da ref
  React.useImperativeHandle(ref, () => ({
    startAnimation: handleStartAnimation
  }));

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
                <p className="text-base leading-relaxed">{description}</p>
              </motion.div>
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
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

AnimatedChartComponent.displayName = 'AnimatedChartComponent';

export default AnimatedChartComponent;
