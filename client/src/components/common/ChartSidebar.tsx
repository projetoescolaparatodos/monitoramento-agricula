
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, LightBulb, Info, Download, Calendar, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ChartSidebarProps {
  chart: {
    title: string;
    description?: string;
    chartData: {
      labels: string[];
      datasets: Array<{
        label?: string;
        data: number[];
      }>;
    };
    chartType: string;
    metadata?: {
      source?: string;
      lastUpdated?: string;
      units?: string;
      period?: string;
    };
  };
  insights?: string[];
  className?: string;
}

const ChartSidebar: React.FC<ChartSidebarProps> = ({ 
  chart, 
  insights: customInsights,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'data' | 'about'>('insights');

  // Gerar insights automáticos baseados nos dados
  const generateInsights = () => {
    if (customInsights && customInsights.length > 0) {
      return customInsights;
    }

    const insights: string[] = [];
    const values = chart.chartData.datasets[0]?.data || [];
    const labels = chart.chartData.labels;

    if (values.length === 0) return [];

    // Insight 1: Valor máximo
    const maxValue = Math.max(...values);
    const maxIndex = values.indexOf(maxValue);
    if (labels[maxIndex]) {
      insights.push(`O maior valor foi registrado em "${labels[maxIndex]}" com ${maxValue.toLocaleString('pt-BR')} unidades.`);
    }

    // Insight 2: Valor mínimo
    const minValue = Math.min(...values);
    const minIndex = values.indexOf(minValue);
    if (labels[minIndex]) {
      insights.push(`O menor valor ocorreu em "${labels[minIndex]}" com ${minValue.toLocaleString('pt-BR')} unidades.`);
    }

    // Insight 3: Tendência geral
    if (values.length > 1) {
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      const change = ((lastValue - firstValue) / firstValue * 100);
      
      if (Math.abs(change) > 5) {
        const trend = change > 0 ? 'crescimento' : 'redução';
        insights.push(`Observa-se ${trend} de ${Math.abs(change).toFixed(1)}% do início ao fim do período.`);
      } else {
        insights.push('Os valores mantiveram-se relativamente estáveis ao longo do período.');
      }
    }

    // Insight 4: Média
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    insights.push(`A média dos valores é de ${average.toFixed(1)} unidades.`);

    return insights;
  };

  const insights = generateInsights();

  const getChartTypeDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      'bar': 'Gráfico de Barras',
      'line': 'Gráfico de Linhas',
      'pie': 'Gráfico de Pizza',
      'doughnut': 'Gráfico de Rosca',
      'radar': 'Gráfico Radar',
      'polarArea': 'Área Polar',
      'scatter': 'Gráfico de Dispersão',
      'bubble': 'Gráfico de Bolhas'
    };
    return types[type] || type;
  };

  const exportData = () => {
    const data = chart.chartData.labels.map((label, index) => ({
      label,
      value: chart.chartData.datasets[0]?.data[index] || 0
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Rótulo,Valor\n"
      + data.map(row => `"${row.label}","${row.value}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${chart.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`w-full mt-4 ${className}`}>
      {/* Botão para expandir/recolher */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          Detalhes e Análise do Gráfico
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {/* Conteúdo expandível */}
      {isExpanded && (
        <Card className="mt-2 border-t-0 rounded-t-none">
          <CardContent className="p-4">
            {/* Navegação por abas */}
            <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'insights'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LightBulb className="w-4 h-4 inline mr-1" />
                Insights
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'data'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-4 h-4 inline mr-1" />
                Dados
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'about'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Info className="w-4 h-4 inline mr-1" />
                Sobre
              </button>
            </div>

            {/* Conteúdo das abas */}
            {activeTab === 'insights' && (
              <div className="space-y-4">
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    <LightBulb className="w-4 h-4 mr-2 text-yellow-500" />
                    Principais Insights
                  </h4>
                  {insights.length > 0 ? (
                    <ul className="space-y-2">
                      {insights.map((insight, i) => (
                        <li key={i} className="flex items-start">
                          <span className="flex-shrink-0 mt-2 mr-3 inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Não foram identificados insights específicos para este gráfico.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Dados do Gráfico
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportData}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Exportar CSV
                  </Button>
                </div>
                
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {chart.chartData.labels.map((label, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {label}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {chart.chartData.datasets[0]?.data[i]?.toLocaleString('pt-BR') || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Informações do Gráfico
                  </h4>
                  
                  {chart.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {chart.description}
                      </p>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <dl className="space-y-3">
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo de Gráfico</dt>
                      <dd>
                        <Badge variant="outline" className="text-xs">
                          {getChartTypeDisplay(chart.chartType)}
                        </Badge>
                      </dd>
                    </div>
                    
                    {chart.metadata?.source && (
                      <div className="flex justify-between items-center">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Fonte dos Dados</dt>
                        <dd className="text-sm text-gray-900 dark:text-white text-right max-w-48 truncate">
                          {chart.metadata.source}
                        </dd>
                      </div>
                    )}
                    
                    {chart.metadata?.lastUpdated && (
                      <div className="flex justify-between items-center">
                        <dt className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Última Atualização
                        </dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {chart.metadata.lastUpdated}
                        </dd>
                      </div>
                    )}
                    
                    {chart.metadata?.units && (
                      <div className="flex justify-between items-center">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Unidade de Medida</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {chart.metadata.units}
                        </dd>
                      </div>
                    )}
                    
                    {chart.metadata?.period && (
                      <div className="flex justify-between items-center">
                        <dt className="text-sm text-gray-500 dark:text-gray-400">Período</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {chart.metadata.period}
                        </dd>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Total de Pontos</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {chart.chartData.labels.length}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChartSidebar;
