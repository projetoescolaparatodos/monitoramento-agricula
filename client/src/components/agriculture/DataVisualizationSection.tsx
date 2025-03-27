
import { ChartItem } from "@/types";
import ChartComponent from "../common/ChartComponent";
import { Card } from "@/components/ui/card";

const defaultColors = [
  'rgba(75, 192, 85, 0.8)',   
  'rgba(140, 176, 54, 0.8)',  
  'rgba(202, 155, 68, 0.8)',  
  'rgba(159, 112, 74, 0.8)',  
  'rgba(108, 157, 198, 0.8)', 
  'rgba(225, 190, 106, 0.8)', 
  'rgba(161, 215, 173, 0.8)', 
  'rgba(103, 126, 80, 0.8)',  
  'rgba(199, 126, 59, 0.8)',  
  'rgba(71, 140, 111, 0.8)'   
];

const defaultBorders = defaultColors.map(color => color.replace('0.8', '1'));

interface DataVisualizationSectionProps {
  charts: ChartItem[];
  isLoading: boolean;
}

const DataVisualizationSection = ({ charts, isLoading }: DataVisualizationSectionProps) => {
  if (isLoading) return <div>Carregando gráficos...</div>;

  const processedCharts = charts.map(chart => ({
    ...chart,
    chartData: {
      ...chart.chartData,
      datasets: chart.chartData.datasets.map((dataset: any, index: number) => {
        if (chart.chartType.toLowerCase() === 'pie' || chart.chartType.toLowerCase() === 'doughnut') {
          return {
            ...dataset,
            backgroundColor: dataset.backgroundColor || 
              chart.chartData.labels.map((_: any, i: number) => defaultColors[i % defaultColors.length]),
            borderColor: dataset.borderColor || 
              chart.chartData.labels.map((_: any, i: number) => defaultBorders[i % defaultBorders.length])
          };
        }
        return {
          ...dataset,
          backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length],
          borderColor: dataset.borderColor || defaultBorders[index % defaultBorders.length]
        };
      })
    }
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {processedCharts.map((chart) => (
        <Card key={chart.id} className="p-6">
          <ChartComponent chartType={chart.chartType} chartData={chart.chartData} />
        </Card>
      ))}
    </div>
  );
};

export default DataVisualizationSection;
