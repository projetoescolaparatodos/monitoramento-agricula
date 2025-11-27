
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

      {/* Cards de Previsão de Doação Acumulativa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              Previsão Acumulativa - Próximos 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                // Agrupar produções por data de previsão (acumulativo)
                const previsoesPorData = new Map<string, {quantidade: number, especies: Set<string>}>();
                
                producoesFiltradas
                  .filter(p => {
                    const previsao = new Date(p.previsaoDoacao);
                    const hoje = new Date();
                    const dias30 = new Date();
                    dias30.setDate(hoje.getDate() + 30);
                    return p.status === 'em_processo' && previsao >= hoje && previsao <= dias30;
                  })
                  .forEach(producao => {
                    const dataKey = producao.previsaoDoacao;
                    const atual = previsoesPorData.get(dataKey) || {quantidade: 0, especies: new Set()};
                    atual.quantidade += (producao.quantidadeEmProcesso || producao.quantidadePlantada);
                    atual.especies.add(producao.especieMuda);
                    previsoesPorData.set(dataKey, atual);
                  });

                const previsoesList = Array.from(previsoesPorData.entries())
                  .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                  .slice(0, 5);

                if (previsoesList.length === 0) {
                  return (
                    <p className="text-center text-gray-500 py-4">
                      Nenhuma doação prevista para os próximos 30 dias
                    </p>
                  );
                }

                return previsoesList.map(([data, info]) => {
                  const diasRestantes = Math.ceil((new Date(data).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const especiesArray = Array.from(info.especies);
                  
                  return (
                    <div key={data} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {especiesArray.length} espécie{especiesArray.length !== 1 ? 's' : ''}: {especiesArray.slice(0, 2).join(', ')}
                          {especiesArray.length > 2 && ` +${especiesArray.length - 2}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''} restante{diasRestantes !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{info.quantidade}</p>
                        <p className="text-xs text-gray-500">mudas totais</p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Previsão Acumulativa por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                // Agrupar por espécie e calcular quantidade acumulativa
                const especiesAcumuladas = Object.entries(
                  producoesFiltradas
                    .filter(p => p.status === 'em_processo')
                    .reduce((acc, p) => {
                      if (!acc[p.especieMuda]) {
                        acc[p.especieMuda] = {
                          quantidadeTotal: 0,
                          proximaData: p.previsaoDoacao,
                          producoes: []
                        };
                      }
                      acc[p.especieMuda].quantidadeTotal += (p.quantidadeEmProcesso || p.quantidadePlantada);
                      acc[p.especieMuda].producoes.push({
                        data: p.previsaoDoacao,
                        quantidade: p.quantidadeEmProcesso || p.quantidadePlantada
                      });
                      if (new Date(p.previsaoDoacao) < new Date(acc[p.especieMuda].proximaData)) {
                        acc[p.especieMuda].proximaData = p.previsaoDoacao;
                      }
                      return acc;
                    }, {} as Record<string, {quantidadeTotal: number, proximaData: string, producoes: Array<{data: string, quantidade: number}>}>)
                )
                .sort((a, b) => new Date(a[1].proximaData).getTime() - new Date(b[1].proximaData).getTime());

                if (especiesAcumuladas.length === 0) {
                  return (
                    <p className="text-center text-gray-500 py-4">
                      Nenhuma produção em processo
                    </p>
                  );
                }

                return especiesAcumuladas.map(([especie, dados]) => (
                  <div key={especie} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{especie}</p>
                      <p className="text-sm text-gray-600">
                        Próxima disponibilidade: {new Date(dados.proximaData).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dados.producoes.length} produção{dados.producoes.length !== 1 ? 'ões' : ''} em andamento
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{dados.quantidadeTotal}</p>
                      <p className="text-xs text-gray-500">mudas acumuladas</p>
                    </div>
                  </div>
                ));
              })()}
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
import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  where,
  getDocs 
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Sprout, 
  Package, 
  Clock, 
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface Muda {
  id: string;
  especieMuda: string;
  quantidadePlantada: number;
  quantidadePronta: number;
  quantidadeEmProcesso: number;
  dataPlantio: string;
  previsaoDoacao: string;
  status: 'em_processo' | 'pronta' | 'doada';
  insumoId?: string;
  timestamp: any;
}

const GestaoViveiroMudas: React.FC = () => {
  const [mudas, setMudas] = useState<Muda[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Sincronizar estoque de mudas prontas com doações
  const sincronizarEstoque = async (mudaId: string, insumoId: string) => {
    try {
      // Buscar total doado deste insumo
      const doacoesRef = collection(db, 'doacoes_evento');
      const qDoacoes = query(doacoesRef, where('insumoId', '==', insumoId));
      const doacoesSnapshot = await getDocs(qDoacoes);
      
      const totalDoado = doacoesSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().quantidade || 0);
      }, 0);

      // Buscar dados da muda
      const mudasRef = collection(db, 'viveiro_mudas');
      const qMudas = query(mudasRef, where('insumoId', '==', insumoId));
      const mudasSnapshot = await getDocs(qMudas);

      if (!mudasSnapshot.empty) {
        const mudaDoc = mudasSnapshot.docs[0];
        const mudaData = mudaDoc.data();
        const quantidadeAtualPronta = mudaData.quantidadePronta || 0;
        const quantidadeTotalProduzida = mudaData.quantidadePlantada || 0;

        // Calcular estoque disponível
        const estoqueDisponivel = Math.max(0, quantidadeAtualPronta - totalDoado);

        // Atualizar apenas se houver mudança
        if (estoqueDisponivel !== quantidadeAtualPronta) {
          await updateDoc(doc(db, 'viveiro_mudas', mudaDoc.id), {
            quantidadePronta: estoqueDisponivel,
            quantidadeDoada: totalDoado,
            ultimaSincronizacao: new Date().toISOString()
          });

          console.log(`📊 Estoque sincronizado - ${mudaData.especieMuda}: ${estoqueDisponivel} mudas disponíveis (${totalDoado} doadas)`);
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar estoque:', error);
    }
  };

  useEffect(() => {
    const mudasQuery = query(
      collection(db, 'viveiro_mudas')
    );

    const unsubscribe = onSnapshot(mudasQuery, (snapshot) => {
      const mudasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Muda[];

      setMudas(mudasData.sort((a, b) => a.especieMuda.localeCompare(b.especieMuda)));
      setLoading(false);

      // Sincronizar estoque de cada muda com insumoId
      mudasData.forEach(muda => {
        if (muda.insumoId) {
          sincronizarEstoque(muda.id, muda.insumoId);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const marcarComoPronta = async (mudaId: string) => {
    try {
      const mudaRef = doc(db, 'viveiro_mudas', mudaId);
      const muda = mudas.find(m => m.id === mudaId);
      
      if (muda) {
        await updateDoc(mudaRef, {
          status: 'pronta',
          quantidadePronta: muda.quantidadeEmProcesso,
          quantidadeEmProcesso: 0
        });

        toast({
          title: "Sucesso",
          description: `${muda.especieMuda} marcada como pronta para doação!`
        });
      }
    } catch (error) {
      console.error('Erro ao marcar como pronta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const mudasEmProcesso = mudas.filter(m => m.status === 'em_processo');
  const mudasProntas = mudas.filter(m => m.status === 'pronta' && m.quantidadePronta > 0);
  const totalMudasProntas = mudasProntas.reduce((sum, m) => sum + m.quantidadePronta, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Em Processo</p>
                <p className="text-2xl font-bold">{mudasEmProcesso.length} espécies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prontas para Doação</p>
                <p className="text-2xl font-bold">{totalMudasProntas.toLocaleString()} mudas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Espécies Disponíveis</p>
                <p className="text-2xl font-bold">{mudasProntas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mudas Prontas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            Mudas Prontas para Doação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mudasProntas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma muda pronta para doação.</p>
          ) : (
            <div className="space-y-4">
              {mudasProntas.map(muda => (
                <Card key={muda.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{muda.especieMuda}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-gray-500">Disponível</p>
                            <p className="font-bold text-green-600">{muda.quantidadePronta} mudas</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Plantadas</p>
                            <p className="font-medium">{muda.quantidadePlantada}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Data Plantio</p>
                            <p className="font-medium">{new Date(muda.dataPlantio).toLocaleDateString('pt-BR')}</p>
                          </div>
                          {muda.insumoId && (
                            <div>
                              <Badge variant="outline" className="bg-blue-50">
                                <Package className="h-3 w-3 mr-1" />
                                Insumo Vinculado
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mudas Em Processo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
            Mudas Em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mudasEmProcesso.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma muda em processo.</p>
          ) : (
            <div className="space-y-4">
              {mudasEmProcesso.map(muda => (
                <Card key={muda.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{muda.especieMuda}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-gray-500">Em Processo</p>
                            <p className="font-bold text-yellow-600">{muda.quantidadeEmProcesso} mudas</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Plantadas</p>
                            <p className="font-medium">{muda.quantidadePlantada}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Previsão</p>
                            <p className="font-medium">{new Date(muda.previsaoDoacao).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <Button
                              size="sm"
                              onClick={() => marcarComoPronta(muda.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Marcar como Pronta
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerta de Sincronização */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          O estoque de mudas é sincronizado automaticamente com as doações registradas nos eventos.
          Quando uma doação é feita usando mudas, a quantidade é descontada automaticamente do estoque disponível.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GestaoViveiroMudas;
