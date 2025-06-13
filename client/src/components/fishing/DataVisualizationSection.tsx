
import { ChartItem } from "@/types";
import ChartComponent from "../common/ChartComponent";

interface DataVisualizationSectionProps {
  charts: ChartItem[];
  isLoading: boolean;
}

const DataVisualizationSection = ({ charts, isLoading }: DataVisualizationSectionProps) => {
  if (isLoading) return <div>Carregando gráficos...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {charts.map((chart) => (
        <div key={chart.id} className="relative">
          <ChartComponent 
            chartData={chart.chartData} 
            chartType={chart.chartType}
            title={chart.title}
            description={chart.description}
            height={300}
            metadata={{
              source: "Secretaria Municipal de Pesca",
              lastUpdated: "Janeiro 2024",
              units: "Toneladas",
              period: "Produção anual"
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DataVisualizationSection;
