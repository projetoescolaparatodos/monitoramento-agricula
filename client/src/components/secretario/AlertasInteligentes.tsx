
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Wrench,
  TrendingDown,
  Calendar,
  Bell
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface Veiculo {
  id: string;
  modelo: string;
  tipo: string;
  consumoMedio: number;
  status: 'funcionando' | 'quebrado';
  manutencoes: Array<{
    descricao: string;
    custo: number;
    data: string;
    tempoInatividade?: number;
    prioridadeUrgencia?: 'baixa' | 'media' | 'alta' | 'critica';
  }>;
  dataCadastro: string;
}

interface AlertaInteligente {
  id: string;
  tipo: 'custo_alto' | 'tempo_inativo' | 'manutencoes_frequentes' | 'veiculo_antigo' | 'baixa_eficiencia';
  severidade: 'info' | 'warning' | 'error' | 'critical';
  titulo: string;
  descricao: string;
  veiculoId: string;
  veiculo: string;
  valor?: number;
  recomendacao: string;
  dataDeteccao: Date;
}

const AlertasInteligentes: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [alertas, setAlertas] = useState<AlertaInteligente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const veiculosSnapshot = await getDocs(collection(db, 'veiculos'));
        const veiculosData = veiculosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Veiculo[];

        setVeiculos(veiculosData);
        
        // Processar alertas inteligentes
        const alertasGerados = processarAlertasInteligentes(veiculosData);
        setAlertas(alertasGerados);

      } catch (error) {
        console.error('Erro ao carregar dados para alertas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processarAlertasInteligentes = (veiculos: Veiculo[]): AlertaInteligente[] => {
    const alertas: AlertaInteligente[] = [];

    veiculos.forEach(veiculo => {
      const custoTotalManutencoes = veiculo.manutencoes?.reduce((sum, m) => sum + m.custo, 0) || 0;
      const numeroManutencoes = veiculo.manutencoes?.length || 0;
      const manutencoesCriticas = veiculo.manutencoes?.filter(m => m.prioridadeUrgencia === 'critica').length || 0;
      const tempoTotalInativo = veiculo.manutencoes?.reduce((sum, m) => sum + (m.tempoInatividade || 0), 0) || 0;
      const diasDesdeUltimaManutencao = veiculo.manutencoes?.length > 0 
        ? Math.floor((new Date().getTime() - new Date(veiculo.manutencoes[veiculo.manutencoes.length - 1].data).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Alerta 1: Custo alto de manutenção
      if (custoTotalManutencoes > 8000) {
        alertas.push({
          id: `custo_alto_${veiculo.id}`,
          tipo: 'custo_alto',
          severidade: custoTotalManutencoes > 15000 ? 'critical' : 'error',
          titulo: '💰 Custo de Manutenção Elevado',
          descricao: `Já foram gastos R$ ${custoTotalManutencoes.toLocaleString()} em manutenções`,
          veiculoId: veiculo.id,
          veiculo: `${veiculo.modelo} (${veiculo.tipo})`,
          valor: custoTotalManutencoes,
          recomendacao: custoTotalManutencoes > 15000 
            ? 'Considere substituir o veículo - pode não ser mais econômico'
            : 'Monitore custos futuros e considere análise de viabilidade',
          dataDeteccao: new Date()
        });
      }

      // Alerta 2: Manutenções muito frequentes
      if (numeroManutencoes > 5) {
        alertas.push({
          id: `manutencoes_frequentes_${veiculo.id}`,
          tipo: 'manutencoes_frequentes',
          severidade: numeroManutencoes > 8 ? 'error' : 'warning',
          titulo: '🔧 Manutenções Muito Frequentes',
          descricao: `${numeroManutencoes} manutenções registradas`,
          veiculoId: veiculo.id,
          veiculo: `${veiculo.modelo} (${veiculo.tipo})`,
          valor: numeroManutencoes,
          recomendacao: 'Investigue possíveis problemas crônicos ou uso inadequado',
          dataDeteccao: new Date()
        });
      }

      // Alerta 3: Tempo inativo excessivo
      if (tempoTotalInativo > 30) {
        alertas.push({
          id: `tempo_inativo_${veiculo.id}`,
          tipo: 'tempo_inativo',
          severidade: tempoTotalInativo > 60 ? 'error' : 'warning',
          titulo: '⏰ Alto Tempo de Inatividade',
          descricao: `${tempoTotalInativo} dias parado para manutenções`,
          veiculoId: veiculo.id,
          veiculo: `${veiculo.modelo} (${veiculo.tipo})`,
          valor: tempoTotalInativo,
          recomendacao: 'Analise se vale a pena manter este veículo na frota',
          dataDeteccao: new Date()
        });
      }

      // Alerta 4: Múltiplas manutenções críticas
      if (manutencoesCriticas > 1) {
        alertas.push({
          id: `criticas_${veiculo.id}`,
          tipo: 'manutencoes_frequentes',
          severidade: 'critical',
          titulo: '🚨 Múltiplas Emergências',
          descricao: `${manutencoesCriticas} manutenções críticas/emergenciais`,
          veiculoId: veiculo.id,
          veiculo: `${veiculo.modelo} (${veiculo.tipo})`,
          valor: manutencoesCriticas,
          recomendacao: 'Veículo com alto risco operacional - considere substituição urgente',
          dataDeteccao: new Date()
        });
      }

      // Alerta 5: Baixa eficiência de combustível
      if (veiculo.consumoMedio < 3 && veiculo.tipo !== 'trator') {
        alertas.push({
          id: `baixa_eficiencia_${veiculo.id}`,
          tipo: 'baixa_eficiencia',
          severidade: 'warning',
          titulo: '⛽ Baixa Eficiência de Combustível',
          descricao: `Apenas ${veiculo.consumoMedio} km/L - abaixo do esperado`,
          veiculoId: veiculo.id,
          veiculo: `${veiculo.modelo} (${veiculo.tipo})`,
          valor: veiculo.consumoMedio,
          recomendacao: 'Verifique necessidade de manutenção preventiva no motor',
          dataDeteccao: new Date()
        });
      }
    });

    // Ordenar por severidade
    const ordemSeveridade = { 'critical': 4, 'error': 3, 'warning': 2, 'info': 1 };
    return alertas.sort((a, b) => ordemSeveridade[b.severidade] - ordemSeveridade[a.severidade]);
  };

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeveridadeIcon = (severidade: string) => {
    switch (severidade) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Processando alertas inteligentes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo de alertas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {alertas.filter(a => a.severidade === 'critical').length}
              </div>
              <div className="text-sm text-red-700">Críticos</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {alertas.filter(a => a.severidade === 'error').length}
              </div>
              <div className="text-sm text-orange-700">Erro</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {alertas.filter(a => a.severidade === 'warning').length}
              </div>
              <div className="text-sm text-yellow-700">Atenção</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {veiculos.length - alertas.length}
              </div>
              <div className="text-sm text-green-700">OK</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Inteligentes da Frota
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <Alert className="border-green-200 bg-green-50">
              <Bell className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Parabéns! Nenhum alerta crítico detectado na sua frota.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div 
                  key={alerta.id}
                  className={`border rounded-lg p-4 ${getSeveridadeColor(alerta.severidade)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeveridadeIcon(alerta.severidade)}
                        <h4 className="font-semibold">{alerta.titulo}</h4>
                        <Badge variant="outline" className="ml-auto">
                          {alerta.severidade.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm mb-1">
                        <strong>Veículo:</strong> {alerta.veiculo}
                      </p>
                      
                      <p className="text-sm mb-2">{alerta.descricao}</p>
                      
                      <div className="bg-white bg-opacity-50 p-2 rounded text-sm">
                        <strong>💡 Recomendação:</strong> {alerta.recomendacao}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertasInteligentes;
