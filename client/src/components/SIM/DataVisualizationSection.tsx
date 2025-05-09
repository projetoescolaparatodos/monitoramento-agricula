
import React from 'react';
import { ChartItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import ChartComponent from "../common/ChartComponent";

interface DataVisualizationSectionProps {
  charts: ChartItem[];
  isLoading?: boolean;
}

const DataVisualizationSection: React.FC<DataVisualizationSectionProps> = ({ 
  charts, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Visualização de Dados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <Card key={i} className="h-80 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                  <div className="h-40 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!charts || charts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {charts.map((chart) => (
        <Card key={chart.id} className="bg-white/70 rounded-lg shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">{chart.title}</h3>
            <div className="h-[300px] relative">
              <ChartComponent chartData={chart.chartData} chartType={chart.chartType} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DataVisualizationSection;
