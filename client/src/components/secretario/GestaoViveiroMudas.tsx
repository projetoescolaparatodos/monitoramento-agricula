
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
  TrendingUp,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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
  insumos?: {
    sacolas: number;
    calcario: number;
    adubo: number;
    valorSacola: number;
    valorCalcario: number;
    valorAdubo: number;
  };
  timestamp: any;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const GestaoViveiroMudas: React.FC = () => {
  const [mudas, setMudas] = useState<Muda[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'mensal' | 'semestral' | 'anual'>('mensal');
  const { toast } = useToast();

  // 🆕 Sincronizar estoque de mudas prontas com doações
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

        // Calcular estoque disponível (diminuir baseado nas doações)
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

      // 🆕 Filtrar por período selecionado
      const dataAtual = new Date();
      const mudasFiltradas = mudasData.filter(muda => {
        const dataPlantio = new Date(muda.dataPlantio);
        
        if (periodo === 'mensal') {
          // Últimos 30 dias
          const umMesAtras = new Date(dataAtual);
          umMesAtras.setDate(dataAtual.getDate() - 30);
          return dataPlantio >= umMesAtras;
        } else if (periodo === 'semestral') {
          // Últimos 6 meses
          const seisMesesAtras = new Date(dataAtual);
          seisMesesAtras.setMonth(dataAtual.getMonth() - 6);
          return dataPlantio >= seisMesesAtras;
        } else if (periodo === 'anual') {
          // Último ano
          const umAnoAtras = new Date(dataAtual);
          umAnoAtras.setFullYear(dataAtual.getFullYear() - 1);
          return dataPlantio >= umAnoAtras;
        }
        return true;
      });

      setMudas(mudasFiltradas.sort((a, b) => a.especieMuda.localeCompare(b.especieMuda)));
      setLoading(false);

      // 🆕 Sincronizar estoque de cada muda com insumoId
      mudasFiltradas.forEach(muda => {
        if (muda.insumoId) {
          sincronizarEstoque(muda.id, muda.insumoId);
        }
      });
    });

    return () => unsubscribe();
  }, [periodo]);

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

  // Cálculos de estatísticas
  const mudasEmProcesso = mudas.filter(m => m.quantidadeEmProcesso > 0);
  const mudasProntas = mudas.filter(m => m.quantidadePronta > 0);
  const totalMudasPlantadas = mudas.reduce((sum, m) => sum + m.quantidadePlantada, 0);
  const totalMudasProntas = mudasProntas.reduce((sum, m) => sum + m.quantidadePronta, 0);
  const totalMudasEmProcesso = mudasEmProcesso.reduce((sum, m) => sum + m.quantidadeEmProcesso, 0);

  // Custo total
  const custoTotal = mudas.reduce((sum, m) => {
    if (!m.insumos) return sum;
    return sum + 
      (m.insumos.sacolas * m.insumos.valorSacola) +
      (m.insumos.calcario * m.insumos.valorCalcario) +
      (m.insumos.adubo * m.insumos.valorAdubo);
  }, 0);

  const custoPorMuda = totalMudasPlantadas > 0 ? custoTotal / totalMudasPlantadas : 0;

  // Previsão próximos 30 dias
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + 30);
  
  const mudasProximas30Dias = mudas.filter(m => {
    const previsao = new Date(m.previsaoDoacao);
    const quantidade = m.quantidadeEmProcesso + m.quantidadePronta;
    return previsao <= dataLimite && quantidade > 0;
  });

  // Dados para gráfico de produção por espécie
  const producaoPorEspecie = mudas.reduce((acc, muda) => {
    const existing = acc.find(item => item.especie === muda.especieMuda);
    if (existing) {
      existing.quantidade += muda.quantidadePlantada;
    } else {
      acc.push({ especie: muda.especieMuda, quantidade: muda.quantidadePlantada });
    }
    return acc;
  }, [] as { especie: string; quantidade: number }[]);

  // Dados para gráfico de custos
  const custosPorInsumo = mudas.reduce((acc, muda) => {
    if (!muda.insumos) return acc;
    
    acc.sacolas += muda.insumos.sacolas * muda.insumos.valorSacola;
    acc.calcario += muda.insumos.calcario * muda.insumos.valorCalcario;
    acc.adubo += muda.insumos.adubo * muda.insumos.valorAdubo;
    
    return acc;
  }, { sacolas: 0, calcario: 0, adubo: 0 });

  const dadosCustos = [
    { name: 'Sacolas', value: custosPorInsumo.sacolas },
    { name: 'Calcário', value: custosPorInsumo.calcario },
    { name: 'Adubo', value: custosPorInsumo.adubo }
  ].filter(item => item.value > 0);

  // Previsão acumulativa por espécie
  const previsaoPorEspecie = mudas.reduce((acc, muda) => {
    // Incluir mudas em processo E prontas (que ainda não foram doadas)
    const quantidade = muda.quantidadeEmProcesso + muda.quantidadePronta;
    if (quantidade === 0) return acc;
    
    const existing = acc.find(item => item.especie === muda.especieMuda);
    const previsao = new Date(muda.previsaoDoacao);
    
    if (existing) {
      existing.quantidade += quantidade;
      existing.producoes += 1;
      if (previsao < new Date(existing.proximaDisponibilidade)) {
        existing.proximaDisponibilidade = muda.previsaoDoacao;
      }
    } else {
      acc.push({
        especie: muda.especieMuda,
        quantidade: quantidade,
        proximaDisponibilidade: muda.previsaoDoacao,
        producoes: 1
      });
    }
    return acc;
  }, [] as { especie: string; quantidade: number; proximaDisponibilidade: string; producoes: number }[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controle de Período */}
      <div className="flex gap-2">
        <Button
          variant={periodo === 'mensal' ? 'default' : 'outline'}
          onClick={() => setPeriodo('mensal')}
          className={periodo === 'mensal' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Mensal
        </Button>
        <Button
          variant={periodo === 'semestral' ? 'default' : 'outline'}
          onClick={() => setPeriodo('semestral')}
          className={periodo === 'semestral' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Semestral
        </Button>
        <Button
          variant={periodo === 'anual' ? 'default' : 'outline'}
          onClick={() => setPeriodo('anual')}
          className={periodo === 'anual' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Anual
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Mudas Plantadas</p>
                <p className="text-2xl font-bold">{totalMudasPlantadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prontas p/ Doação</p>
                <p className="text-2xl font-bold">{totalMudasProntas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Em Processo</p>
                <p className="text-2xl font-bold">{totalMudasEmProcesso}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Custo Total</p>
                <p className="text-2xl font-bold">R$ {custoTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-400">R$ {custoPorMuda.toFixed(2)}/muda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previsões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previsão 30 dias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Previsão Acumulativa - Próximos 30 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mudasProximas30Dias.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma doação prevista para os próximos 30 dias</p>
            ) : (
              <div className="space-y-2">
                {mudasProximas30Dias.map(muda => {
                  const quantidadeTotal = muda.quantidadeEmProcesso + muda.quantidadePronta;
                  return (
                    <div key={muda.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-semibold">{muda.especieMuda}</p>
                        <p className="text-sm text-gray-500">
                          Previsão: {new Date(muda.previsaoDoacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-green-600">{quantidadeTotal} mudas</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previsão por Espécie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Previsão Acumulativa por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previsaoPorEspecie.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma produção em andamento</p>
            ) : (
              <div className="space-y-2">
                {previsaoPorEspecie.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{item.especie}</p>
                      <p className="text-sm text-gray-500">
                        Próxima disponibilidade: {new Date(item.proximaDisponibilidade).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-400">{item.producoes} produção(ões) em andamento</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{item.quantidade}</p>
                    <span className="text-xs text-gray-500">mudas acumuladas</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Produção por Espécie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Produção por Espécie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={producaoPorEspecie}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="especie" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Custos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Distribuição de Custos por Insumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosCustos.length === 0 ? (
              <p className="text-center text-gray-500 py-12">Nenhum custo registrado</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosCustos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosCustos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evolução da Produção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolução da Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={producaoPorEspecie}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="especie" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="quantidade" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
          ✅ O estoque de mudas é sincronizado automaticamente com as doações registradas nos eventos.
          Quando uma doação é feita usando mudas, a quantidade é descontada automaticamente do estoque disponível.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GestaoViveiroMudas;
