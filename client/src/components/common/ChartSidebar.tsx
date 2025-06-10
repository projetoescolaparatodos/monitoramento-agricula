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
        <Card className="mt-2 border-t-0 rounded-t-none bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Navegação por abas */}
            <div className="flex space-x-1 mb-4 bg-slate-200/70 dark:bg-slate-700/70 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'data'
                    ? 'bg-white/90 dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-600/50'
                }`}
              >
                <Database className="w-4 h-4 inline mr-1" />
                Dados
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'about'
                    ? 'bg-white/90 dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-600/50'
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
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Dados do Gráfico
                  </h4>

                  <div className="max-h-40 overflow-y-auto border border-slate-300/60 dark:border-slate-600/60 rounded-lg">
                    <table className="min-w-full divide-y divide-slate-300/60 dark:divide-slate-600/60">
                      <thead className="bg-slate-100/80 dark:bg-slate-700/80 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/70 dark:bg-slate-800/70 divide-y divide-slate-300/40 dark:divide-slate-600/40">
                        {chart.chartData.labels.map((label, i) => (
                          <tr key={i} className="hover:bg-slate-100/60 dark:hover:bg-slate-700/60">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                              {label}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
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
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Informações do Gráfico
                  </h4>

                  {chart.description && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {chart.description}
                      </p>
                    </div>
                  )}

                  <Separator className="my-4 bg-slate-300/60 dark:bg-slate-600/60" />

                  <dl className="space-y-3">
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-slate-600 dark:text-slate-400">Tipo de Gráfico</dt>
                      <dd>
                        <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                          {getChartTypeDisplay(chart.chartType)}
                        </Badge>
                      </dd>
                    </div>

                    {chart.metadata?.source && (
                      <div className="flex justify-between items-center">
                        <dt className="text-sm text-slate-600 dark:text-slate-400">Fonte dos Dados</dt>
                        <dd className="text-sm text-slate-800 dark:text-slate-200 text-right max-w-48 truncate">
                          {chart.metadata.source}
                        </dd>
                      </div>
                    )}

                    {chart.metadata?.lastUpdated && (
                      <div className="flex justify-between items-center">
                        <dt className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Última Atualização
                        </dt>
                        <dd className="text-sm text-slate-800 dark:text-slate-200">
                          {chart.metadata.lastUpdated}
                        </dd>
                      </div>
                    )}

                    {chart.metadata?.units && (
                      <div className="flex justify-between items-center">
                        <dt className="text-sm text-slate-600 dark:text-slate-400">Unidade de Medida</dt>
                        <dd className="text-sm text-slate-800 dark:text-slate-200">
                          {chart.metadata.units}
                        </dd>
                      </div>
                    )}

                    {chart.metadata?.period && (
                      <div className="flex justify-between items-center">
                        <dt className="text-sm text-slate-600 dark:text-slate-400">Período</dt>
                        <dd className="text-sm text-slate-800 dark:text-slate-200">
                          {chart.metadata.period}
                        </dd>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-slate-600 dark:text-slate-400">Total de Pontos</dt>
                      <dd className="text-sm text-slate-800 dark:text-slate-200">
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