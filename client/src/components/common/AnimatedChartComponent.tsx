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
                // Lógica personalizada para lidar com cliques na legenda
                const chart = legend.chart;
                const index = legendItem.datasetIndex;
                const meta = chart.getDatasetMeta(index);

                // Toggle visibility
                meta.hidden = !meta.hidden;

                // Limpa animação da série se escondida
                if (meta.hidden) {
                  cleanupSeriesAnimation(index);
                }

                // Atualiza o gráfico
                chart.update();

                // Reinicia animação se série foi mostrada
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

  // Estados para controle individual das animações
  const [seriesAnimations, setSeriesAnimations] = useState<Record<number, boolean>>({});
  const animationFrameRefs = useRef<Record<number, number>>({});
  const dedicatedCanvases = useRef<Record<number, HTMLCanvasElement>>({});

  // Interfaces para tipagem
  interface AnimationPoint {
    x: number;
    y: number;
    value: number;
    label: string;
  }

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
    points: AnimationPoint[],
    progress: number,
    color: string,
    lineWidth: number = 4
  ) => {
    if (points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'source-over';

    // Sombra sutil
    ctx.shadowColor = color;
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0.5;

    const totalLength = calculateTotalLength(points);
    const animatedLength = totalLength * progress;

    let currentLength = 0;
    ctx.beginPath();

    if (points[0]) {
      ctx.moveTo(points[0].x, points[0].y);
    }

    for (let i = 1; i < points.length && currentLength < animatedLength; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];

      if (!prevPoint || !currentPoint) continue;

      const segmentLength = distanceBetween(prevPoint, currentPoint);

      if (currentLength + segmentLength <= animatedLength) {
        // Desenha segmento completo
        if (i === 1) {
          ctx.lineTo(currentPoint.x, currentPoint.y);
        } else {
          // Curva suave para segmentos subsequentes
          const nextPoint = points[i + 1];
          const cpX = (prevPoint.x + currentPoint.x) / 2;
          const cpY = (prevPoint.y + currentPoint.y) / 2;

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
        // Desenha segmento parcial
        const remaining = animatedLength - currentLength;
        const ratio = remaining / segmentLength;
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
        break;
      }
    }

    if (progress > 0) {
      ctx.stroke();
    }
    ctx.restore();
  };

  const showFloatingTooltip = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    text: string, 
    color: string
  ) => {
    ctx.save();

    const padding = 12;
    const fontSize = 12;
    const borderRadius = 6;

    ctx.font = `600 ${fontSize}px 'Inter', sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const tooltipWidth = textWidth + padding * 2;
    const tooltipHeight = fontSize + padding * 2;

    let tooltipX = x - tooltipWidth / 2;
    let tooltipY = y;

    // Ajusta posição se sair da área do gráfico
    const chartArea = chartInstance.current?.chartArea;
    if (chartArea) {
      if (tooltipX < chartArea.left) tooltipX = chartArea.left + 5;
      if (tooltipX + tooltipWidth > chartArea.right) tooltipX = chartArea.right - tooltipWidth - 5;
      if (tooltipY < chartArea.top) tooltipY = chartArea.top + 10;
      if (tooltipY + tooltipHeight > chartArea.bottom) tooltipY = chartArea.bottom - tooltipHeight - 10;
    }

    // Sombra do tooltip
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.roundRect(tooltipX + 2, tooltipY + 2, tooltipWidth, tooltipHeight, borderRadius);
    ctx.fill();

    // Fundo do tooltip
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, borderRadius);
    ctx.fill();
    ctx.stroke();

    // Texto
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight / 2);

    ctx.restore();
  };

  // Função principal para criar canvas dedicado para cada série
  const createDedicatedCanvas = (datasetIndex: number): HTMLCanvasElement | null => {
    if (!chartRef.current) return null;

    // Remove canvas anterior se existir
    if (dedicatedCanvases.current[datasetIndex]) {
      dedicatedCanvases.current[datasetIndex].remove();
    }

    const canvas = document.createElement('canvas');
    canvas.className = `series-animation-canvas dataset-${datasetIndex}`;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = `${15 + datasetIndex}`;
    canvas.width = chartRef.current.width;
    canvas.height = chartRef.current.height;

    const container = chartRef.current.parentElement;
    if (container) {
      if (container.style.position !== 'relative') {
        container.style.position = 'relative';
      }
      container.appendChild(canvas);
      dedicatedCanvases.current[datasetIndex] = canvas;
      return canvas;
    }

    return null;
  };

  // Função para animar uma série específica
  const animateSeriesLine = (datasetIndex: number, originalDataset: any, color: string) => {
    if (!chartInstance.current) return;

    const chart = chartInstance.current;
    const meta = chart.getDatasetMeta(datasetIndex);

    // Verifica se a série está visível
    if (!meta || meta.hidden) return;

    // Cria canvas dedicado
    const canvas = createDedicatedCanvas(datasetIndex);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mapeia pontos válidos
    const points: AnimationPoint[] = meta.data
      .map((point: any, index: number) => {
        if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
          return null;
        }
        return {
          x: point.x,
          y: point.y,
          value: originalDataset.data[index],
          label: chart.data.labels?.[index] || ''
        };
      })
      .filter(Boolean) as AnimationPoint[];

    if (points.length === 0) return;

    // Configurações da animação - mantendo mesmo tempo
    const duration = 8000; // 8 segundos mantido
    const startTime = Date.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing suave
      const easedProgress = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Limpa canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Verifica se ainda está visível
      const currentMeta = chart.getDatasetMeta(datasetIndex);
      if (currentMeta && !currentMeta.hidden) {
        // Desenha apenas a linha - sem pontos ou tooltips
        drawOrganicLine(ctx, points, easedProgress, color, 4);

        // Desenha pontos básicos sem tooltips elaborados
        const totalPoints = points.length;
        const visiblePointsFloat = totalPoints * easedProgress;
        const visiblePointsInt = Math.floor(visiblePointsFloat);

        // Pontos simples
        for (let i = 0; i < visiblePointsInt; i++) {
          if (points[i]) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Tooltip simples mantendo o offset por série
            const tooltipOffset = 40 + (datasetIndex * 30);
            showFloatingTooltip(
              ctx, 
              points[i].x, 
              points[i].y - tooltipOffset,
              `${originalDataset.label || 'Série'}: ${points[i].value}`, 
              color
            );
          }
        }

        // Ponto atual com fade-in
        if (visiblePointsInt < totalPoints && points[visiblePointsInt]) {
          const partialAlpha = visiblePointsFloat - visiblePointsInt;
          ctx.globalAlpha = partialAlpha;

          ctx.beginPath();
          ctx.arc(points[visiblePointsInt].x, points[visiblePointsInt].y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Tooltip atual
          const tooltipOffset = 40 + (datasetIndex * 30);
          showFloatingTooltip(
            ctx, 
            points[visiblePointsInt].x, 
            points[visiblePointsInt].y - tooltipOffset,
            `${originalDataset.label || 'Série'}: ${points[visiblePointsInt].value}`, 
            color
          );

          ctx.globalAlpha = 1;

          // Efeito pulsação
          const pulseRadius = 8 + Math.sin(elapsed / 400) * 4;
          ctx.beginPath();
          ctx.arc(points[visiblePointsInt].x, points[visiblePointsInt].y, pulseRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.3 * partialAlpha;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Continua animação
      if (progress < 1 && seriesAnimations[datasetIndex]) {
        animationFrameRefs.current[datasetIndex] = requestAnimationFrame(animate);
      } else {
        // Finaliza animação
        setSeriesAnimations(prev => ({
          ...prev,
          [datasetIndex]: false
        }));

        if (progress >= 1) {
          setAnimationComplete(true);
        }
      }
    };

    // Inicia animação
    setSeriesAnimations(prev => ({
      ...prev,
      [datasetIndex]: true
    }));

    animationFrameRefs.current[datasetIndex] = requestAnimationFrame(animate);
  };

  // Função para limpar animações de uma série
  const cleanupSeriesAnimation = (datasetIndex: number) => {
    // Cancela animação
    if (animationFrameRefs.current[datasetIndex]) {
      cancelAnimationFrame(animationFrameRefs.current[datasetIndex]);
      delete animationFrameRefs.current[datasetIndex];
    }

    // Remove canvas
    if (dedicatedCanvases.current[datasetIndex]) {
      dedicatedCanvases.current[datasetIndex].remove();
      delete dedicatedCanvases.current[datasetIndex];
    }

    // Atualiza estado
    setSeriesAnimations(prev => ({
      ...prev,
      [datasetIndex]: false
    }));
  };

  // Função principal de animação (substitui animateOrganicDataset)
  const animateOrganicDataset = (datasetIndex: number, originalDataset: any, color: string) => {
    // Limpa animação anterior
    cleanupSeriesAnimation(datasetIndex);

    // Inicia nova animação
    setTimeout(() => {
      animateSeriesLine(datasetIndex, originalDataset, color);
    }, 100);
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

        // Remove todos os canvas de animação existentes antes de iniciar
        if (chartRef.current?.parentElement) {
          const existingOverlays = chartRef.current.parentElement.querySelectorAll('.series-animation-canvas, .organic-animation-canvas');
          existingOverlays.forEach(overlay => {
            overlay.remove();
          });
        }

        // Anima cada dataset com delay progressivo, mas apenas os visíveis
        processedData.datasets.forEach((originalDataset, datasetIndex) => {
          const meta = chartInstance.current?.getDatasetMeta(datasetIndex);

          // Só anima se o dataset estiver visível
          if (meta && !meta.hidden) {
            const color = borderPalette[datasetIndex % borderPalette.length];

            setTimeout(() => {
              animateOrganicDataset(datasetIndex, originalDataset, color);
            }, datasetIndex * 800);
          }
        });
      };

      // Armazena função para controle manual
      (chartInstance.current as any).startAnimation = startAnimation;

      // Inicia a animação automaticamente após um breve delay
      setTimeout(() => {
        startAnimation();
      }, 500);
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      // Limpa todas as animações das séries
      Object.keys(animationFrameRefs.current).forEach(key => {
        const datasetIndex = Number(key);
        cleanupSeriesAnimation(datasetIndex);
      });

      // Remove todos os canvas de animação
      if (chartRef.current?.parentElement) {
        const existingOverlays = chartRef.current.parentElement.querySelectorAll('.series-animation-canvas, .organic-animation-canvas');
        existingOverlays.forEach(overlay => {
          overlay.remove();
        });
      }

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

      // Limpa todas as animações em andamento
      Object.keys(animationFrameRefs.current).forEach(key => {
        const datasetIndex = Number(key);
        cleanupSeriesAnimation(datasetIndex);
      });

      // Remove todos os canvas de animação existentes
      if (chartRef.current?.parentElement) {
        const existingOverlays = chartRef.current.parentElement.querySelectorAll('.series-animation-canvas, .organic-animation-canvas');
        existingOverlays.forEach(overlay => {
          overlay.remove();
        });
      }

      // Clear any existing animation
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      // Reset estado das séries
      setSeriesAnimations({});

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