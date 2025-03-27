
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
        <ChartComponent key={chart.id} chartData={chart} />
      ))}
    </div>
  );
};

export default DataVisualizationSection;
