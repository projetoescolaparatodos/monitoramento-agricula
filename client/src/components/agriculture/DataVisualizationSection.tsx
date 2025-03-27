
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChartComponent from '@/components/common/ChartComponent';
import { ChartItem } from '@/types';

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
      <section className="py-16 bg-green-50">
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

  const chartsByType = charts.reduce((acc, chart) => {
    const type = chart.chartType || 'outros';
    if (!acc[type]) acc[type] = [];
    acc[type].push(chart);
    return acc;
  }, {} as Record<string, ChartItem[]>);

  const chartTypes = Object.keys(chartsByType);

  return (
    <section className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-3 text-center">Visualização de Dados</h2>
        <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto">
          Análises e estatísticas importantes para compreensão do cenário agrícola brasileiro
        </p>

        {chartTypes.length > 1 ? (
          <Tabs defaultValue={chartTypes[0]} className="w-full">
            <TabsList className="mb-8 w-full justify-center">
              {chartTypes.map(type => (
                <TabsTrigger key={type} value={type} className="capitalize">
                  {type === 'bar' && 'Barras'}
                  {type === 'line' && 'Linhas'}
                  {type === 'pie' && 'Pizza'}
                  {type === 'doughnut' && 'Rosca'}
                  {type === 'radar' && 'Radar'}
                  {type === 'polarArea' && 'Área Polar'}
                  {type === 'bubble' && 'Bolhas'}
                  {type === 'scatter' && 'Dispersão'}
                  {type === 'outros' && 'Outros'}
                </TabsTrigger>
              ))}
            </TabsList>

            {chartTypes.map(type => (
              <TabsContent key={type} value={type} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {chartsByType[type].map(chart => (
                    <Card key={chart.id} className="overflow-hidden hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{chart.title}</h3>
                        {chart.description && (
                          <p className="text-gray-600 mb-6 text-sm">{chart.description}</p>
                        )}
                        <div className="h-[300px] w-full">
                          <ChartComponent 
                            chartType={chart.chartType} 
                            chartData={chart.chartData} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {charts.map(chart => (
              <Card key={chart.id} className="overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{chart.title}</h3>
                  {chart.description && (
                    <p className="text-gray-600 mb-6 text-sm">{chart.description}</p>
                  )}
                  <div className="h-[300px] w-full">
                    <ChartComponent 
                      chartType={chart.chartType} 
                      chartData={chart.chartData} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DataVisualizationSection;
