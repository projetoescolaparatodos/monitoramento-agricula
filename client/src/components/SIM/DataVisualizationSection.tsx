
import { ChartItem } from "@/types";
import ChartComponent from "../common/ChartComponent";
import { Card } from "@/components/ui/card";

interface DataVisualizationSectionProps {
  charts: ChartItem[];
  isLoading: boolean;
}

const DataVisualizationSection = ({ charts, isLoading }: DataVisualizationSectionProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 bg-white/10 backdrop-blur-sm">
            <div className="h-64 animate-pulse bg-white/20 rounded-lg"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {charts.map((chart) => (
        <Card key={chart.id} className="p-6 bg-white/10 backdrop-blur-sm border-0">
          <ChartComponent chartData={chart} />
        </Card>
      ))}
    </div>
  );
};

export default DataVisualizationSection;
