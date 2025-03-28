import { useQuery } from "@tanstack/react-query";
import { ChartItem } from "@/types";
import { Link } from "wouter";
import ChartComponent from "@/components/common/ChartComponent";
import { Skeleton } from "@/components/ui/skeleton";

const DataVisualizationSection = () => {
  const { data: charts, isLoading } = useQuery<ChartItem[]>({
    queryKey: ['/api/charts?pageType=home'],
  });

  return (
    <section className="mb-16">
      
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          // Loading skeletons
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
      
      <div className="text-center mt-8">
        </div>
    </section>
  );
};

export default DataVisualizationSection;
