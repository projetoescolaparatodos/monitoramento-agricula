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
            <div key={index} className="bg-white/70 rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-[300px] bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          charts?.map((chart) => (
            <div key={chart.id} className="bg-white/70 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {chart.title}
              </h3>
              <div className="h-[300px] relative">
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