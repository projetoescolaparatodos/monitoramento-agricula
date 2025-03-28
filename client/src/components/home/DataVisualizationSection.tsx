import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartComponent } from "@/components/common/ChartComponent";
import { ChartItem } from "@/types";

export const DataVisualizationSection = () => {
  const [charts, setCharts] = useState<ChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await fetch('/api/charts?pageType=home');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCharts(data);
      } catch (error) {
        console.error("Error fetching charts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharts();
  }, []);

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-secondary mb-2">
          Visualização de Dados
        </h2>
        <p className="text-neutral max-w-3xl mx-auto">
          Gráficos interativos sobre agricultura, pesca e PAA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <Skeleton className="h-6 w-2/3 mb-4" />
              <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
                <span className="text-gray-400">Carregando gráfico...</span>
              </div>
            </div>
          ))
        ) : (
          charts?.map((chart) => (
            <div key={chart.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-heading font-semibold mb-4 text-secondary">
                {chart.title}
              </h3>
              <div className="h-[300px] relative">
                <ChartComponent chartData={chart.chartData} chartType={chart.chartType} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};