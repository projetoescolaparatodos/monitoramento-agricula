
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sprout,
  CalendarClock,
  Package,
  TrendingUp,
  DollarSign,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface InsumoUtilizado {
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

interface ProducaoMuda {
  id: string;
  especieMuda: string;
  quantidadePlantada: number;
  dataPlantio: string;
  previsaoDoacao: string;
  tempoEstimadoMeses?: number;
  insumos: {
    sacolas?: number;
    calcario?: number;
    adubo?: number;
    valorSacola?: number;
    valorCalcario?: number;
    valorAdubo?: number;
  };
  quantidadePronta: number;
  quantidadeEmProcesso: number;
  status: 'em_processo' | 'pronta' | 'doada';
  observacoes?: string;
}

const GestaoViveiroMudas = () => {
  const [producoes, setProducoes] = useState<ProducaoMuda[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoAnalise, setPeriodoAnalise] = useState<'mensal' | 'semestral' | 'anual'>('mensal');

  useEffect(() => {
    const fetchProducoes = async () => {
      try {
        const producoesSnapshot = await getDocs(collection(db, 'viveiro_mudas'));
        const producoesData = producoesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProducaoMuda[];

        setProducoes(producoesData);
      } catch (error) {
        console.error('Erro ao buscar produções de mudas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducoes();
  }, []);

  // Cálculo de custos
  const calcularCustoTotal = (producao: ProducaoMuda) => {
    const custoSacolas = (producao.insumos.sacolas || 0) * (producao.insumos.valorSacola || 0);
    const custoCalcario = (producao.insumos.calcario || 0) * (producao.insumos.valorCalcario || 0);
    const custoAdubo = (producao.insumos.adubo || 0) * (producao.insumos.valorAdubo || 0);
    return custoSacolas + custoCalcario + custoAdubo;
  };

  const calcularCustoPorMuda = (producao: ProducaoMuda) => {
    const custoTotal = calcularCustoTotal(producao);
    return producao.quantidadePlantada > 0 ? custoTotal / producao.quantidadePlantada : 0;
  };

  // Filtrar por período
  const filtrarPorPeriodo = (producoes: ProducaoMuda[]) => {
    const hoje = new Date();
    const dataLimite = new Date();

    switch (periodoAnalise) {
      case 'mensal':
        dataLimite.setMonth(hoje.getMonth() - 1);
        break;
      case 'semestral':
        dataLimite.setMonth(hoje.getMonth() - 6);
        break;
      case 'anual':
        dataLimite.setFullYear(hoje.getFullYear() - 1);
        break;
    }

    return producoes.filter(p => new Date(p.dataPlantio) >= dataLimite);
  };

  const producoesFiltradas = filtrarPorPeriodo(producoes);

  // Estatísticas gerais
  const totalMudasPlantadas = producoesFiltradas.reduce((sum, p) => sum + p.quantidadePlantada, 0);
  const totalMudasProntas = producoesFiltradas.reduce((sum, p) => sum + p.quantidadePronta, 0);
  const totalMudasEmProcesso = producoesFiltradas.reduce((sum, p) => sum + p.quantidadeEmProcesso, 0);
  const custoTotalPeriodo = producoesFiltradas.reduce((sum, p) => sum + calcularCustoTotal(p), 0);
  const custoPorMudaMedia = totalMudasPlantadas > 0 ? custoTotalPeriodo / totalMudasPlantadas : 0;

  // Dados para gráfico de espécies
  const especiesData = Object.entries(
    producoesFiltradas.reduce((acc, p) => {
      acc[p.especieMuda] = (acc[p.especieMuda] || 0) + p.quantidadePlantada;
      return acc;
    }, {} as Record<string, number>)
  ).map(([especie, quantidade]) => ({ especie, quantidade }));

  // Dados para gráfico de custos por insumo
  const insumosData = [
    {
      nome: 'Sacolas',
      custo: producoesFiltradas.reduce((sum, p) => 
        sum + (p.insumos.sacolas || 0) * (p.insumos.valorSacola || 0), 0)
    },
    {
      nome: 'Calcário',
      custo: producoesFiltradas.reduce((sum, p) => 
        sum + (p.insumos.calcario || 0) * (p.insumos.valorCalcario || 0), 0)
    },
    {
      nome: 'Adubo',
      custo: producoesFiltradas.reduce((sum, p) => 
        sum + (p.insumos.adubo || 0) * (p.insumos.valorAdubo || 0), 0)
    }
  ];

  // Dados para linha do tempo de produção
  const timelineData = producoesFiltradas
    .sort((a, b) => new Date(a.dataPlantio).getTime() - new Date(b.dataPlantio).getTime())
    .map(p => ({
      data: new Date(p.dataPlantio).toLocaleDateString('pt-BR', { month: 'short' }),
      plantadas: p.quantidadePlantada,
      prontas: p.quantidadePronta
    }));

  const cores = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Carregando dados do viveiro...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seletor de período */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriodoAnalise('mensal')}
          className={`px-4 py-2 rounded-lg ${
            periodoAnalise === 'mensal' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}
        >
          Mensal
        </button>
        <button
          onClick={() => setPeriodoAnalise('semestral')}
          className={`px-4 py-2 rounded-lg ${
            periodoAnalise === 'semestral' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}
        >
          Semestral
        </button>
        <button
          onClick={() => setPeriodoAnalise('anual')}
          className={`px-4 py-2 rounded-lg ${
            periodoAnalise === 'anual' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}
        >
          Anual
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Sprout className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Mudas Plantadas</h3>
                  <p className="text-2xl font-bold text-green-600">{totalMudasPlantadas}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Prontas p/ Doação</h3>
                  <p className="text-2xl font-bold text-blue-600">{totalMudasProntas}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <CalendarClock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Em Processo</h3>
                  <p className="text-2xl font-bold text-amber-600">{totalMudasEmProcesso}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Custo Total</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {custoTotalPeriodo.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    R$ {custoPorMudaMedia.toFixed(2)}/muda
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Previsão de Doação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              Próximas Doações (Próximos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {producoesFiltradas
                .filter(p => {
                  const previsao = new Date(p.previsaoDoacao);
                  const hoje = new Date();
                  const dias30 = new Date();
                  dias30.setDate(hoje.getDate() + 30);
                  return p.status === 'em_processo' && previsao >= hoje && previsao <= dias30;
                })
                .sort((a, b) => new Date(a.previsaoDoacao).getTime() - new Date(b.previsaoDoacao).getTime())
                .slice(0, 5)
                .map((producao) => {
                  const diasRestantes = Math.ceil((new Date(producao.previsaoDoacao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={producao.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{producao.especieMuda}</p>
                        <p className="text-sm text-gray-600">
                          Previsão: {new Date(producao.previsaoDoacao).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''} restante{diasRestantes !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {producao.quantidadeEmProcesso || producao.quantidadePlantada}
                        </p>
                        <p className="text-xs text-gray-500">mudas estimadas</p>
                      </div>
                    </div>
                  );
                })}
              {producoesFiltradas.filter(p => {
                const previsao = new Date(p.previsaoDoacao);
                const hoje = new Date();
                const dias30 = new Date();
                dias30.setDate(hoje.getDate() + 30);
                return p.status === 'em_processo' && previsao >= hoje && previsao <= dias30;
              }).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma doação prevista para os próximos 30 dias
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Previsão de Estoque por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                producoesFiltradas
                  .filter(p => p.status === 'em_processo')
                  .reduce((acc, p) => {
                    if (!acc[p.especieMuda]) {
                      acc[p.especieMuda] = {
                        quantidade: 0,
                        proximaData: p.previsaoDoacao
                      };
                    }
                    acc[p.especieMuda].quantidade += (p.quantidadeEmProcesso || p.quantidadePlantada);
                    if (new Date(p.previsaoDoacao) < new Date(acc[p.especieMuda].proximaData)) {
                      acc[p.especieMuda].proximaData = p.previsaoDoacao;
                    }
                    return acc;
                  }, {} as Record<string, {quantidade: number, proximaData: string}>)
              )
              .sort((a, b) => new Date(a[1].proximaData).getTime() - new Date(b[1].proximaData).getTime())
              .map(([especie, dados]) => (
                <div key={especie} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{especie}</p>
                    <p className="text-sm text-gray-600">
                      Próxima disponibilidade: {new Date(dados.proximaData).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{dados.quantidade}</p>
                    <p className="text-xs text-gray-500">mudas previstas</p>
                  </div>
                </div>
              ))}
              {Object.keys(
                producoesFiltradas
                  .filter(p => p.status === 'em_processo')
                  .reduce((acc, p) => {
                    acc[p.especieMuda] = true;
                    return acc;
                  }, {} as Record<string, boolean>)
              ).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma produção em processo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Produção por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={especiesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="especie" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Distribuição de Custos por Insumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={insumosData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="custo"
                  label={({nome, custo}) => `${nome}: R$ ${custo.toFixed(2)}`}
                >
                  {insumosData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Custo']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução da Produção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="plantadas" stroke="#22C55E" name="Plantadas" />
                <Line type="monotone" dataKey="prontas" stroke="#3B82F6" name="Prontas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Produções Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border text-left">Espécie</th>
                  <th className="p-3 border text-center">Plantadas</th>
                  <th className="p-3 border text-center">Prontas</th>
                  <th className="p-3 border text-center">Em Processo</th>
                  <th className="p-3 border text-center">Previsão Doação</th>
                  <th className="p-3 border text-center">Custo Total</th>
                  <th className="p-3 border text-center">Custo/Muda</th>
                  <th className="p-3 border text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {producoesFiltradas.map((producao) => (
                  <tr key={producao.id} className="hover:bg-gray-50">
                    <td className="p-3 border font-medium">{producao.especieMuda}</td>
                    <td className="p-3 border text-center">{producao.quantidadePlantada}</td>
                    <td className="p-3 border text-center">{producao.quantidadePronta}</td>
                    <td className="p-3 border text-center">{producao.quantidadeEmProcesso}</td>
                    <td className="p-3 border text-center">
                      {new Date(producao.previsaoDoacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 border text-center font-semibold">
                      R$ {calcularCustoTotal(producao).toFixed(2)}
                    </td>
                    <td className="p-3 border text-center">
                      R$ {calcularCustoPorMuda(producao).toFixed(2)}
                    </td>
                    <td className="p-3 border text-center">
                      <Badge 
                        variant={
                          producao.status === 'pronta' ? 'default' : 
                          producao.status === 'doada' ? 'secondary' : 'outline'
                        }
                        className={
                          producao.status === 'pronta' ? 'bg-green-100 text-green-800' :
                          producao.status === 'doada' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }
                      >
                        {producao.status === 'pronta' ? 'Pronta' : 
                         producao.status === 'doada' ? 'Doada' : 'Em Processo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {producoesFiltradas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma produção de mudas registrada no período selecionado.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoViveiroMudas;
