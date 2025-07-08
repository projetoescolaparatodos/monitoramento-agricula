import { useQuery } from "@tanstack/react-query";
import { ChartItem } from "@/types";
import { Link } from "wouter";
import ChartComponent from "@/components/common/ChartComponent";
import AnimatedChartComponent from "@/components/common/AnimatedChartComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { useEffect, useState, useCallback, useRef } from "react";

const DataVisualizationSection = ({ variant = "default" }: { variant?: "default" | "transparent" }) => {
  const { data: charts, isLoading } = useQuery<ChartItem[]>({
    queryKey: ['/api/charts?pageType=home'],
  });

  // Estados para controle do carrossel
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const chartRefs = useRef<{ [key: string]: any }>({});

  // Buscar gráficos destacados e regulares
  const featuredCharts = charts?.filter(chart => chart.isFeatured) || [];
  const regularCharts = charts?.filter(chart => !chart.isFeatured) || [];

  // Configurar carrossel
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);



  // Função para iniciar animação dos gráficos
  const startChartAnimation = (chartId: string) => {
    const chartRef = chartRefs.current[chartId];
    if (chartRef && chartRef.startAnimation) {
      chartRef.startAnimation();
    }
  };

  // Iniciar animação do primeiro gráfico destacado
  useEffect(() => {
    if (featuredCharts.length > 0) {
      const timer = setTimeout(() => {
        startChartAnimation(featuredCharts[0].id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [featuredCharts]);

  // Iniciar animação quando o slide muda
  useEffect(() => {
    if (featuredCharts.length > 0 && current > 0) {
      const currentChart = featuredCharts[current - 1];
      if (currentChart) {
        const timer = setTimeout(() => {
          startChartAnimation(currentChart.id);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [current, featuredCharts]);

  if (isLoading) {
    return (
      <section className="mb-16 space-y-12">
        {/* Featured chart skeleton */}
        <div className="w-full animate-pulse">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-[400px] bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Regular charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="relative animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-[300px] bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16 space-y-12">
      {/* Subseção dos gráficos destacados com carrossel */}
      {featuredCharts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full space-y-8"
        >
          {featuredCharts.length === 1 ? (
            // Renderizar gráfico único sem carrossel
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <AnimatedChartComponent 
                ref={(ref) => {
                  if (ref) chartRefs.current[featuredCharts[0].id] = ref;
                }}
                chartData={featuredCharts[0].chartData} 
                chartType={featuredCharts[0].chartType} 
                title={featuredCharts[0].title}
                description={featuredCharts[0].description}
                height={400}
                animate={true}
                metadata={{
                  source: "Secretaria Municipal de Agricultura",
                  lastUpdated: "Janeiro 2024",
                  units: "Unidades",
                  period: "Dados consolidados"
                }} 
              />
            </motion.div>
          ) : (
            // Renderizar carrossel para múltiplos gráficos
            <div className="relative">
              <Carousel
                setApi={setApi}
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent>
                  {featuredCharts.map((chart, index) => (
                    <CarouselItem key={chart.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <AnimatedChartComponent 
                          ref={(ref) => {
                            if (ref) chartRefs.current[chart.id] = ref;
                          }}
                          chartData={chart.chartData} 
                          chartType={chart.chartType} 
                          title={chart.title}
                          description={chart.description}
                          height={400}
                          animate={true}
                          metadata={{
                            source: "Secretaria Municipal de Agricultura",
                            lastUpdated: "Janeiro 2024",
                            units: "Unidades",
                            period: "Dados consolidados"
                          }} 
                        />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Controles personalizados */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    onClick={() => api?.scrollPrev()}
                    className="bg-white/90 hover:bg-white shadow-lg border border-gray-200 rounded-full p-2 transition-all duration-300 hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => api?.scrollNext()}
                    className="bg-white/90 hover:bg-white shadow-lg border border-gray-200 rounded-full p-2 transition-all duration-300 hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Indicadores */}
                {featuredCharts.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex space-x-2">
                      {featuredCharts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => api?.scrollTo(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === current - 1 
                              ? 'bg-green-600 w-6' 
                              : 'bg-white/60 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Carousel>

              {/* Contador de slides */}
              {featuredCharts.length > 1 && (
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {current} / {count}
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Seção de gráficos regulares */}
      {regularCharts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >


          {/* Grid de gráficos regulares */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {regularCharts.map((chart, index) => (
              <motion.div
                key={chart.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + (index * 0.1), duration: 0.5 }}
                className="relative"
              >
                <ChartComponent 
                  chartData={chart.chartData} 
                  chartType={chart.chartType} 
                  title={chart.title}
                  description={chart.description}
                  height={300}
                  metadata={{
                    source: "Secretaria Municipal",
                    lastUpdated: "Janeiro 2024",
                    units: "Unidades",
                    period: "Dados consolidados"
                  }} 
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fallback se não houver gráficos */}
      {(!charts || charts.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12"
        >
          <div className="bg-gray-50 rounded-xl p-8">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum gráfico disponível
            </h3>
            <p className="text-gray-500">
              Os dados serão carregados em breve.
            </p>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default DataVisualizationSection;