import { useQuery } from "@tanstack/react-query";
import { ChartItem } from "@/types";
import { Link } from "wouter";
import ChartComponent from "@/components/common/ChartComponent";
import AnimatedChartComponent from "@/components/common/AnimatedChartComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";

const DataVisualizationSection = () => {
  const { data: charts, isLoading } = useQuery<ChartItem[]>({
    queryKey: ['/api/charts?pageType=home'],
  });

  // Buscar gráfico destacado (primeiro gráfico ou o com maior ordem)
  const featuredChart = charts?.length ? charts[0] : null;
  const regularCharts = charts?.slice(1) || [];

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
      {/* Subseção do gráfico destacado */}
      {featuredChart && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full"
        >
          

          {/* Gráfico destacado */}
          <AnimatedChartComponent 
            chartData={featuredChart.chartData} 
            chartType={featuredChart.chartType} 
            title={featuredChart.title}
            description={featuredChart.description}
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