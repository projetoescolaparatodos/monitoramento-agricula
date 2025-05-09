
import React from 'react';
import { FirebaseChartItem } from '@/types';
import Chart from '@/components/common/Chart';

interface DataVisualizationSectionProps {
  charts: FirebaseChartItem[];
  isLoading: boolean;
}

const DataVisualizationSection: React.FC<DataVisualizationSectionProps> = ({ charts, isLoading }) => {
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {charts.map((chart) => (
        <div key={chart.id} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">{chart.title}</h3>
          <p className="text-white/80 mb-4">{chart.description}</p>
          <Chart data={chart.chartData} type={chart.chartType} />
        </div>
      ))}
    </div>
  );
};

export default DataVisualizationSection;
