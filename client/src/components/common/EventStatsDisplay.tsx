
import React from 'react';
import { DynamicStatisticCard } from './DynamicStatisticCard';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, TrendingUp } from 'lucide-react';

interface EventStatsDisplayProps {
  eventId?: string;
  eventName?: string;
}

export const EventStatsDisplay: React.FC<EventStatsDisplayProps> = ({ 
  eventId, 
  eventName = "Evento Atual" 
}) => {
  // Configurações específicas para eventos
  const eventStatsConfig = [
    {
      id: 'total-participantes',
      titulo: 'Participantes do Evento',
      colecaoFonte: 'statistics',
      campo: 'value',
      tipoAgregacao: 'count' as const,
      periodo: 'hoje',
      unidade: 'pessoas'
    },
    {
      id: 'mudas-distribuidas',
      titulo: 'Mudas Distribuídas',
      colecaoFonte: 'statistics',
      campo: 'value',
      tipoAgregacao: 'sum' as const,
      periodo: 'hoje',
      unidade: 'mudas'
    },
    {
      id: 'familias-atendidas',
      titulo: 'Famílias Atendidas',
      colecaoFonte: 'statistics',
      campo: 'value',
      tipoAgregacao: 'sum' as const,
      periodo: 'hoje',
      unidade: 'famílias'
    },
    {
      id: 'calcario-distribuido',
      titulo: 'Calcário Distribuído',
      colecaoFonte: 'statistics',
      campo: 'value',
      tipoAgregacao: 'sum' as const,
      periodo: 'hoje',
      unidade: 'toneladas'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header do evento */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-12 h-12 text-green-600 mr-4" />
            <h1 className="text-5xl font-bold text-green-800">
              {eventName}
            </h1>
          </div>
          <p className="text-2xl text-gray-600 font-medium">
            Dados em Tempo Real - {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {eventStatsConfig.map(config => (
            <div key={config.id} className="transform hover:scale-105 transition-transform duration-300">
              <DynamicStatisticCard config={config} variant="default" />
            </div>
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Impacto Social</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-600">Total de Beneficiários:</span>
                  <span className="text-2xl font-bold text-green-600">1,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-600">Comunidades Atendidas:</span>
                  <span className="text-2xl font-bold text-green-600">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-600">Área Total Beneficiada:</span>
                  <span className="text-2xl font-bold text-green-600">456 ha</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Progressão do Evento</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-600">Meta de Participantes:</span>
                  <span className="text-2xl font-bold text-gray-800">2,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-500 h-4 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <div className="text-center">
                  <span className="text-lg font-semibold text-green-600">92% da meta atingida</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-lg">
          <p className="text-gray-600 text-lg">
            Secretaria Municipal de Agricultura de Vitória do Xingu
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Dados atualizados automaticamente a cada 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
};
