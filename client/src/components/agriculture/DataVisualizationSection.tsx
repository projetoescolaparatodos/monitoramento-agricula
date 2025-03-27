import { Card } from "@/components/ui/card";
import { ChartItem } from "@/types";
import ChartComponent from "@/components/common/ChartComponent";
import { Skeleton } from "@/components/ui/skeleton";

interface DataVisualizationSectionProps {
  charts: ChartItem[];
  isLoading: boolean;
}

const DataVisualizationSection = ({ charts, isLoading }: DataVisualizationSectionProps) => {
  // Ordenar os gráficos por ordem
  const sortedCharts = [...charts].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Visualização de Dados</h2>
      {isLoading ? (
        <div className="text-center">Carregando gráficos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sortedCharts.map((chart) => (
            <div key={chart.id} className="space-y-2">
              {chart.title && (
                <h3 className="text-lg font-semibold text-center">{chart.title}</h3>
              )}
              {chart.description && (
                <p className="text-sm text-gray-600 text-center">{chart.description}</p>
              )}
              <ChartComponent
                chartType={chart.chartType}
                chartData={{
                  ...chart.chartData,
                  title: chart.title,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DataVisualizationSection;