import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Calendar, Database } from 'lucide-react';
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
  className?: string;
}

const ChartSidebar: React.FC<ChartSidebarProps> = ({ 
  chart, 
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'about'>('data');

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
          Detalhes do Gráfico
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
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Dados do Gráfico
                  </h4>

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
                              {chart.metadata?.units ? ` ${chart.metadata.units}` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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