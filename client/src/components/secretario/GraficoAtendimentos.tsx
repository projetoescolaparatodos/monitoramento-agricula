
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  MapPin,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  Loader2,
  Settings,
  Info,
  Eye,
  Calendar
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
import { useToast } from '@/hooks/use-toast';
import { fetchAtendimentosUnificados, fetchEstatisticasAtendimentos } from '@/utils/fetchAtendimentos';
import { agruparLocalidades, prepararDadosGrafico, LocalidadeAgrupada } from '@/utils/agruparLocalidades';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/utils/firebase';

const GraficoAtendimentos = () => {
  const [loading, setLoading] = useState(true);
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [localidadesAgrupadas, setLocalidadesAgrupadas] = useState<LocalidadeAgrupada[]>([]);
  const [solicitacoesAgrupadas, setSolicitacoesAgrupadas] = useState<LocalidadeAgrupada[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>(null);
  const [limiarSimilaridade, setLimiarSimilaridade] = useState(0.7);
  const [filtroOrigem, setFiltroOrigem] = useState<'todos' | 'agricultura' | 'pesca' | 'paa'>('todos');
  const [showDetalhes, setShowDetalhes] = useState(false);
  const { toast } = useToast();

  // Carregar dados
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Carregando atendimentos...');
        const [atendimentosData, estatisticasData] = await Promise.all([
          fetchAtendimentosUnificados(),
          fetchEstatisticasAtendimentos()
        ]);
        
        console.log('📊 Dados carregados:', {
          totalAtendimentos: atendimentosData.length,
          localidadesEncontradas: atendimentosData.map(a => a.localidade),
          atendimentosPorOrigem: {
            agricultura: atendimentosData.filter(a => a.origem === 'agricultura').length,
            pesca: atendimentosData.filter(a => a.origem === 'pesca').length,
            paa: atendimentosData.filter(a => a.origem === 'paa').length
          }
        });
        
        setAtendimentos(atendimentosData);
        setEstatisticas(estatisticasData);
        
        // Agrupar localidades
        console.log('🔄 Agrupando localidades...');
        const grupos = agruparLocalidades(atendimentosData, limiarSimilaridade);
        setLocalidadesAgrupadas(grupos);
        
        console.log(`✅ ${grupos.length} grupos de localidades criados`, grupos);
        
        // Carregar solicitações pendentes
        console.log('🔄 Carregando solicitações pendentes...');
        const solicitacoesData = [];
        
        // Buscar solicitações de agricultura
        const agriculturaRef = collection(db, 'solicitacoes_agricultura');
        const agriculturaQuery = query(agriculturaRef, where('status', '==', 'pendente'));
        const agriculturaSnapshot = await getDocs(agriculturaQuery);
        agriculturaSnapshot.forEach(doc => {
          const data = doc.data();
          solicitacoesData.push({
            id: doc.id,
            localidade: data.localidade || data.fazenda || 'Não informado',
            origem: 'agricultura',
            data: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            solicitante: data.nome || 'Não informado',
            detalhes: data.descricao || data.servico || '',
            status: data.status
          });
        });
        
        // Buscar solicitações de pesca
        const pescaRef = collection(db, 'solicitacoes_pesca');
        const pescaQuery = query(pescaRef, where('status', '==', 'pendente'));
        const pescaSnapshot = await getDocs(pescaQuery);
        pescaSnapshot.forEach(doc => {
          const data = doc.data();
          solicitacoesData.push({
            id: doc.id,
            localidade: data.localidade || 'Não informado',
            origem: 'pesca',
            data: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            solicitante: data.nome || 'Não informado',
            detalhes: data.descricao || data.servico || '',
            status: data.status
          });
        });
        
        // Buscar solicitações de PAA
        const paaRef = collection(db, 'solicitacoes_paa');
        const paaQuery = query(paaRef, where('status', '==', 'pendente'));
        const paaSnapshot = await getDocs(paaQuery);
        paaSnapshot.forEach(doc => {
          const data = doc.data();
          solicitacoesData.push({
            id: doc.id,
            localidade: data.localidade || 'Não informado',
            origem: 'paa',
            data: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            solicitante: data.nome || 'Não informado',
            detalhes: data.descricao || data.servico || '',
            status: data.status
          });
        });
        
        setSolicitacoes(solicitacoesData);
        
        // Agrupar solicitações por localidade
        const gruposSolicitacoes = agruparLocalidades(solicitacoesData, limiarSimilaridade);
        setSolicitacoesAgrupadas(gruposSolicitacoes);
        
        console.log(`✅ ${solicitacoesData.length} solicitações pendentes encontradas em ${gruposSolicitacoes.length} localidades`);
        
        toast({
          title: "Dados carregados",
          description: `${atendimentosData.length} atendimentos e ${solicitacoesData.length} solicitações pendentes processados.`,
        });
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados dos atendimentos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [limiarSimilaridade, toast]);

  // Dados filtrados
  const dadosFiltrados = useMemo(() => {
    let atendimentosFiltrados = atendimentos;
    
    if (filtroOrigem !== 'todos') {
      atendimentosFiltrados = atendimentos.filter(a => a.origem === filtroOrigem);
    }
    
    const grupos = agruparLocalidades(atendimentosFiltrados, limiarSimilaridade);
    return prepararDadosGrafico(grupos);
  }, [atendimentos, filtroOrigem, limiarSimilaridade]);

  // Dados de solicitações filtrados
  const solicitacoesFiltradas = useMemo(() => {
    let solicitacoesFiltradas = solicitacoes;
    
    if (filtroOrigem !== 'todos') {
      solicitacoesFiltradas = solicitacoes.filter(s => s.origem === filtroOrigem);
    }
    
    const grupos = agruparLocalidades(solicitacoesFiltradas, limiarSimilaridade);
    return prepararDadosGrafico(grupos);
  }, [solicitacoes, filtroOrigem, limiarSimilaridade]);

  // Dados temporais (últimos 6 meses)
  const dadosTemporais = useMemo(() => {
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const data = subMonths(new Date(), i);
      const inicio = startOfMonth(data);
      const fim = endOfMonth(data);
      
      const atendimentosDoMes = atendimentos.filter(a => {
        const dataAtendimento = new Date(a.data);
        return dataAtendimento >= inicio && dataAtendimento <= fim;
      });
      
      meses.push({
        mes: format(data, 'MMM/yyyy', { locale: ptBR }),
        total: atendimentosDoMes.length,
        agricultura: atendimentosDoMes.filter(a => a.origem === 'agricultura').length,
        pesca: atendimentosDoMes.filter(a => a.origem === 'pesca').length,
        paa: atendimentosDoMes.filter(a => a.origem === 'paa').length
      });
    }
    
    return meses;
  }, [atendimentos]);

  // Cores para os gráficos
  const cores = {
    agricultura: '#22C55E',
    pesca: '#3B82F6', 
    paa: '#F59E0B',
    total: '#8B5CF6'
  };

  const coresPizza = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Exportar dados
  const exportarCSV = () => {
    const headers = ['Localidade', 'Quantidade', 'Variantes', 'Origens'];
    const linhas = localidadesAgrupadas.map(grupo => [
      grupo.nome,
      grupo.quantidade,
      grupo.variantes.length,
      grupo.variantes.join('; ')
    ]);
    
    const csvContent = [headers, ...linhas]
      .map(linha => linha.map(campo => `"${campo}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_atendimentos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando e processando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gráfico de Áreas Atendidas</h2>
            <div className="flex flex-wrap gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{estatisticas?.total || 0} atendimentos</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{localidadesAgrupadas.length} localidades agrupadas</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">{estatisticas?.ultimoMes || 0} no último mês</span>
              </div>
            </div>
          </div>
          <Button onClick={exportarCSV} className="bg-white text-blue-600 hover:bg-blue-50">
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Controles e Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Controles de Agrupamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filtrar por Origem</label>
              <select
                value={filtroOrigem}
                onChange={(e) => setFiltroOrigem(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="todos">Todas as origens</option>
                <option value="agricultura">Agricultura</option>
                <option value="pesca">Pesca</option>
                <option value="paa">PAA</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Similaridade ({Math.round(limiarSimilaridade * 100)}%)
              </label>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.1"
                value={limiarSimilaridade}
                onChange={(e) => setLimiarSimilaridade(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                Maior valor = agrupamento mais rigoroso
              </div>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={() => setShowDetalhes(!showDetalhes)}
                variant="outline"
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showDetalhes ? 'Ocultar' : 'Ver'} Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas com gráficos */}
      <Tabs defaultValue="localidades" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="localidades">Localidades</TabsTrigger>
          <TabsTrigger value="temporal">Evolução Temporal</TabsTrigger>
          <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="localidades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atendimentos por Localidade Agrupada</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosFiltrados.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="localidade" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill={cores.total} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detalhes das localidades */}
          {showDetalhes && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Agrupamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {localidadesAgrupadas.slice(0, 10).map((grupo, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-lg">{grupo.nome}</h4>
                        <Badge variant="outline">{grupo.quantidade} atendimentos</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Variantes encontradas:</strong> {grupo.variantes.join(', ')}
                      </div>
                      {grupo.coordenadas && grupo.coordenadas.length > 0 && (
                        <div className="text-sm text-gray-500 mt-1">
                          {grupo.coordenadas.length} coordenadas registradas
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção de Solicitações Pendentes */}
          <Card className="mt-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Info className="h-5 w-5" />
                Solicitações Pendentes por Localidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              {solicitacoesFiltradas.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={solicitacoesFiltradas.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="localidade" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantidade" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {showDetalhes && (
                    <div className="space-y-4 mt-4">
                      <h4 className="font-semibold">Detalhes das Solicitações</h4>
                      {solicitacoesAgrupadas.slice(0, 10).map((grupo, index) => (
                        <div key={index} className="border border-amber-300 rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-lg">{grupo.nome}</h4>
                            <Badge variant="outline" className="bg-amber-100">{grupo.quantidade} solicitações</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Variantes encontradas:</strong> {grupo.variantes.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Nenhuma solicitação pendente no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evolução dos Atendimentos (Últimos 6 Meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dadosTemporais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="agricultura" stroke={cores.agricultura} strokeWidth={2} />
                  <Line type="monotone" dataKey="pesca" stroke={cores.pesca} strokeWidth={2} />
                  <Line type="monotone" dataKey="paa" stroke={cores.paa} strokeWidth={2} />
                  <Line type="monotone" dataKey="total" stroke={cores.total} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribuicao" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Origem</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: 'Agricultura', value: estatisticas?.porOrigem?.agricultura || 0 },
                        { name: 'Pesca', value: estatisticas?.porOrigem?.pesca || 0 },
                        { name: 'PAA', value: estatisticas?.porOrigem?.paa || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {[cores.agricultura, cores.pesca, cores.paa].map((cor, index) => (
                        <Cell key={`cell-${index}`} fill={cor} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {estatisticas?.porOrigem?.agricultura || 0}
                    </div>
                    <div className="text-sm text-green-700">Agricultura</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {estatisticas?.porOrigem?.pesca || 0}
                    </div>
                    <div className="text-sm text-blue-700">Pesca</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {estatisticas?.porOrigem?.paa || 0}
                    </div>
                    <div className="text-sm text-amber-700">PAA</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {estatisticas?.comCoordenadas || 0}
                    </div>
                    <div className="text-sm text-purple-700">Com GPS</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Informações sobre o agrupamento */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Como funciona o agrupamento inteligente:</strong>
          <br />
          O sistema identifica localidades similares como "KM-40", "km 40", "Travessão do km 40" e as agrupa automaticamente.
          Você pode ajustar o nível de similaridade para criar agrupamentos mais ou menos rigorosos.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GraficoAtendimentos;
