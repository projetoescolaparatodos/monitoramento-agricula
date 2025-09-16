import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Eye,
  Filter,
  Calendar,
  User,
  Building,
  BarChart3,
  TrendingUp,
  Clock,
  ExternalLink,
  Search,
  Loader2,
  Map as MapIcon,
  Building2,
  Fuel,
  Calculator,
  Truck,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ViveiroEstrutura {
  id: string;
  localidade: string;
  nomePropriedade: string;
  especieCultivada: string;
  tamanhoViveiro: number | string;
  dataInicio: string;
  dataTermino: string;
  latitude: number;
  longitude: number;
  midias?: string[];
  criadoEm?: any;
  timestamp?: any;
  userId?: string;
  tipo?: string;
  // Campos opcionais para compatibilidade
  observacoes?: string;
  tecnicoResponsavel?: string;
  statusObra?: string;
  // Campos para estimativa de combustível
  maquinaUtilizada?: 'retroescavadeira' | 'trator' | 'pá carregadeira' | 'escavadeira';
  horasOperacaoDia?: number;
}

interface EstimativaCombustivel {
  totalLitros: number;
  diasOperacao: number;
  maquinaUsada: string;
  consumoPorHora: number;
  horasPorDia: number;
}

// Função para calcular estimativa de combustível
const calcularEstimativaCombustivel = (viveiro: ViveiroEstrutura): EstimativaCombustivel => {
  const consumoPorHora = {
    retroescavadeira: 12,
    trator: 10,
    'pá carregadeira': 14,
    escavadeira: 15,
  };

  const horasPorDiaPadrao = viveiro.horasOperacaoDia || 5;
  const maquinaUsada = viveiro.maquinaUtilizada || 'retroescavadeira';

  // Calcular dias de operação
  const inicio = new Date(viveiro.dataInicio);
  const fim = new Date(viveiro.dataTermino);
  const diasOperacao = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  const consumoHora = consumoPorHora[maquinaUsada];
  const totalLitros = diasOperacao * horasPorDiaPadrao * consumoHora;

  return {
    totalLitros,
    diasOperacao,
    maquinaUsada,
    consumoPorHora: consumoHora,
    horasPorDia: horasPorDiaPadrao
  };
};

const MetadadosViveiros = () => {
  const [viveiros, setViveiros] = useState<ViveiroEstrutura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTecnico, setFiltroTecnico] = useState<string>('todos');
  const [filtroLocalidade, setFiltroLocalidade] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [viveiroSelecionado, setViveiroSelecionado] = useState<ViveiroEstrutura | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchViveiros = async () => {
      try {
        console.log('🔍 Buscando viveiros na coleção: viveiros_em_construcao');
        const viveirosRef = collection(db, 'viveiros_em_construcao');
        const q = query(viveirosRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          console.log(`✅ Encontrados ${snapshot.size} viveiros na coleção viveiros_em_construcao`);
          const viveirosData = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('📋 Dados do viveiro:', data);
            return {
              id: doc.id,
              ...data
            };
          }) as ViveiroEstrutura[];

          console.log(`📊 Total de viveiros carregados: ${viveirosData.length}`);
          console.log('📝 Primeiro viveiro:', viveirosData[0]);
          setViveiros(viveirosData);
        } else {
          console.log('⚠️ Coleção viveiros_em_construcao está vazia');
          console.log('🔍 Tentando buscar em outras possíveis coleções...');

          // Tentar buscar em coleções alternativas
          const alternativeCollections = ['viveiros_construcao', 'viveiros', 'construcao_viveiros'];

          for (const collectionName of alternativeCollections) {
            try {
              console.log(`🔍 Verificando coleção: ${collectionName}`);
              const altRef = collection(db, collectionName);
              const altSnapshot = await getDocs(altRef);

              if (!altSnapshot.empty) {
                console.log(`✅ Encontrados ${altSnapshot.size} viveiros na coleção ${collectionName}`);
                const altViveirosData = altSnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })) as ViveiroEstrutura[];

                setViveiros(altViveirosData);
                toast({
                  title: "Sucesso",
                  description: `Dados encontrados na coleção ${collectionName}`,
                });
                return;
              }
            } catch (err) {
              console.log(`❌ Erro ao buscar na coleção ${collectionName}:`, err);
            }
          }

          toast({
            title: "Aviso",
            description: "Nenhum viveiro em construção foi encontrado no sistema.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Erro ao buscar viveiros:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados dos viveiros.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchViveiros();
  }, [toast]);

  // Dados filtrados
  const viveirosFiltrados = useMemo(() => {
    return viveiros.filter(viveiro => {
      const status = viveiro.statusObra || 'Em construção';
      const tecnico = viveiro.tecnicoResponsavel || 'Não informado';
      const localidade = viveiro.localidade || 'Não informado';
      const proprietario = viveiro.nomePropriedade || '';

      const matchStatus = filtroStatus === 'todos' || status === filtroStatus;
      const matchTecnico = filtroTecnico === 'todos' || tecnico === filtroTecnico;
      const matchLocalidade = filtroLocalidade === 'todos' || localidade === filtroLocalidade;
      const matchBusca = busca === '' || 
        proprietario.toLowerCase().includes(busca.toLowerCase()) ||
        localidade.toLowerCase().includes(busca.toLowerCase()) ||
        viveiro.especieCultivada?.toLowerCase().includes(busca.toLowerCase());

      return matchStatus && matchTecnico && matchLocalidade && matchBusca;
    });
  }, [viveiros, filtroStatus, filtroTecnico, filtroLocalidade, busca]);

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    const contagem = viveirosFiltrados.reduce((acc, viveiro) => {
      const status = viveiro.statusObra || 'Em construção';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(contagem).map(([status, quantidade]) => ({
      status,
      quantidade,
      cor: {
        'Iniciada': '#FCD34D',
        'Em andamento': '#60A5FA',
        'Em construção': '#60A5FA',
        'Concluída': '#34D399',
        'Parada': '#F87171'
      }[status] || '#9CA3AF'
    }));
  }, [viveirosFiltrados]);

  const dadosTemporais = useMemo(() => {
    const cadastrosPorMes = viveirosFiltrados.reduce((acc, viveiro) => {
      const dataInicio = viveiro.dataInicio || viveiro.criadoEm?.toDate?.() || new Date();
      const mes = format(new Date(dataInicio), 'MM/yyyy');
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cadastrosPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, quantidade]) => ({ mes, quantidade }));
  }, [viveirosFiltrados]);

  // Dados de combustível
  const dadosCombustivel = useMemo(() => {
    const combustivelPorMes = viveirosFiltrados.reduce((acc, viveiro) => {
      const dataInicio = viveiro.dataInicio || viveiro.criadoEm?.toDate?.() || new Date();
      const mes = format(new Date(dataInicio), 'MM/yyyy');
      const estimativa = calcularEstimativaCombustivel(viveiro);
      acc[mes] = (acc[mes] || 0) + estimativa.totalLitros;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(combustivelPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, litros]) => ({ mes, litros: Math.round(litros) }));
  }, [viveirosFiltrados]);

  const totalCombustivelEstimado = useMemo(() => {
    return viveirosFiltrados.reduce((total, viveiro) => {
      const estimativa = calcularEstimativaCombustivel(viveiro);
      return total + estimativa.totalLitros;
    }, 0);
  }, [viveirosFiltrados]);

  const tecnicos = useMemo(() => 
    [...new Set(viveiros.map(v => v.tecnicoResponsavel))].filter(Boolean)
  , [viveiros]);

  const localidades = useMemo(() => 
    [...new Set(viveiros.map(v => v.localidade))].filter(Boolean)
  , [viveiros]);

  const abrirNoMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Iniciada': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Em andamento': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Em construção': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Concluída': return 'bg-green-100 text-green-800 border-green-300';
      case 'Parada': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando dados dos viveiros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botão de teste - remover após verificação */}
      <div className="mb-4">
        <Button
          onClick={async () => {
            try {
              const testRef = collection(db, 'viveiros_em_construcao');
              const testSnapshot = await getDocs(testRef);
              console.log('🧪 Teste direto - Documentos encontrados:', testSnapshot.size);
              testSnapshot.forEach(doc => {
                console.log('📄 Documento:', doc.id, doc.data());
              });
              toast({
                title: "Teste Executado",
                description: `Encontrados ${testSnapshot.size} documentos. Verifique o console.`,
              });
            } catch (error) {
              console.error('❌ Erro no teste:', error);
              toast({
                title: "Erro no Teste",
                description: "Verifique o console para detalhes.",
                variant: "destructive",
              });
            }
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          🧪 Testar Conexão Firebase
        </Button>
      </div>

      {/* Header com estatísticas gerais */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Metadados de Viveiros em Construção</h2>
            <div className="flex flex-wrap gap-4 text-green-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">{viveiros.length} viveiros cadastrados</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">{viveirosFiltrados.length} após filtros</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-700 rounded-lg p-3">
              <div className="text-2xl font-bold">{dadosStatus.find(d => d.status === 'Concluída')?.quantidade || 0}</div>
              <div className="text-xs">Concluídos</div>
            </div>
            <div className="bg-green-700 rounded-lg p-3">
              <div className="text-2xl font-bold">{dadosStatus.find(d => d.status === 'Em construção' || d.status === 'Em andamento')?.quantidade || 0}</div>
              <div className="text-xs">Em Construção</div>
            </div>
            <div className="bg-green-700 rounded-lg p-3">
              <div className="text-2xl font-bold">{Math.round(totalCombustivelEstimado).toLocaleString()}</div>
              <div className="text-xs">Litros Estimados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar por nome/localidade</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite para buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status da Obra</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="Iniciada">Iniciada</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Parada">Parada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Técnico Responsável</label>
              <Select value={filtroTecnico} onValueChange={setFiltroTecnico}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os técnicos</SelectItem>
                  {tecnicos.map(tecnico => (
                    <SelectItem key={tecnico} value={tecnico}>{tecnico}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Localidade</label>
              <Select value={filtroLocalidade} onValueChange={setFiltroLocalidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as localidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as localidades</SelectItem>
                  {localidades.map(localidade => (
                    <SelectItem key={localidade} value={localidade}>{localidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fallback quando não há dados */}
      {viveiros.length === 0 && !loading && (
        <Alert className="border-amber-200 bg-amber-50">
          <Building2 className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Nenhum viveiro em construção encontrado.</strong>
            <br />
            Os viveiros cadastrados através do formulário aparecerão aqui automaticamente.
            <br />
            <span className="text-sm text-amber-600 mt-2 block">
              💡 Dica: Verifique se os dados estão sendo salvos na coleção correta no Firebase.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Viveiros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Viveiros em Construção ({viveirosFiltrados.length})
          </CardTitle>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>

        <Tabs defaultValue="tabela" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tabela">Tabela Interativa</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos e Análises</TabsTrigger>
            <TabsTrigger value="mapa">Visualização no Mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="tabela" className="space-y-4">
            {viveirosFiltrados.length === 0 && (
              <Alert>
                <Building className="h-4 w-4" />
                <AlertDescription>
                  Nenhum viveiro encontrado com os filtros aplicados.
                </AlertDescription>
              </Alert>
            )}

            {viveirosFiltrados.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Propriedade</TableHead>
                          <TableHead>Localidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Espécie Cultivada</TableHead>
                          <TableHead>Tamanho</TableHead>
                          <TableHead>Combustível Est.</TableHead>
                          <TableHead>Técnico</TableHead>
                          <TableHead>Data Início</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viveirosFiltrados.map((viveiro) => (
                          <TableRow 
                            key={viveiro.id}
                            className={`cursor-pointer hover:bg-gray-50 ${viveiroSelecionado?.id === viveiro.id ? 'bg-blue-50' : ''}`}
                            onClick={() => setViveiroSelecionado(viveiro)}
                          >
                            <TableCell className="font-medium">{viveiro.nomePropriedade}</TableCell>
                            <TableCell>{viveiro.localidade}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getStatusColor(viveiro.statusObra || 'Em construção')}>
                                {viveiro.statusObra || 'Em construção'}
                              </Badge>
                            </TableCell>
                            <TableCell>{viveiro.especieCultivada}</TableCell>
                            <TableCell>{typeof viveiro.tamanhoViveiro === 'string' ? parseFloat(viveiro.tamanhoViveiro).toFixed(0) : viveiro.tamanhoViveiro}m²</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-amber-600">
                                <Fuel className="h-4 w-4" />
                                <span className="font-medium">{Math.round(calcularEstimativaCombustivel(viveiro).totalLitros)}L</span>
                              </div>
                            </TableCell>
                            <TableCell>{viveiro.tecnicoResponsavel || 'Não informado'}</TableCell>
                            <TableCell>
                              {viveiro.dataInicio ? format(new Date(viveiro.dataInicio), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informado'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirNoMaps(viveiro.latitude, viveiro.longitude);
                                  }}
                                >
                                  <MapPin className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detalhes do viveiro selecionado */}
            {viveiroSelecionado && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Detalhes - {viveiroSelecionado.nomePropriedade}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <strong>Localidade:</strong> {viveiroSelecionado.localidade}
                    </div>
                    <div>
                      <strong>Espécie Cultivada:</strong> {viveiroSelecionado.especieCultivada}
                    </div>
                    <div>
                      <strong>Tamanho:</strong> {viveiroSelecionado.tamanhoViveiro}m²
                    </div>
                    <div>
                      <strong>Data Início:</strong> {viveiroSelecionado.dataInicio ? format(new Date(viveiroSelecionado.dataInicio), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informado'}
                    </div>
                    <div>
                      <strong>Data Término:</strong> {viveiroSelecionado.dataTermino ? format(new Date(viveiroSelecionado.dataTermino), 'dd/MM/yyyy', { locale: ptBR }) : 'Não informado'}
                    </div>
                    <div>
                      <strong>Coordenadas:</strong> {viveiroSelecionado.latitude?.toFixed(6)}, {viveiroSelecionado.longitude?.toFixed(6)}
                    </div>
                  </div>

                  {/* Seção de Estimativa de Combustível */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <Fuel className="h-5 w-5" />
                      Estimativa de Combustível
                    </h4>
                    {(() => {
                      const estimativa = calcularEstimativaCombustivel(viveiroSelecionado);
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="bg-white rounded p-3 text-center">
                            <div className="text-xl font-bold text-amber-600">{Math.round(estimativa.totalLitros)}L</div>
                            <div className="text-amber-700">Total Estimado</div>
                          </div>
                          <div className="bg-white rounded p-3 text-center">
                            <div className="text-lg font-semibold text-gray-700">{estimativa.diasOperacao} dias</div>
                            <div className="text-gray-600">Duração da Obra</div>
                          </div>
                          <div className="bg-white rounded p-3 text-center">
                            <div className="text-lg font-semibold text-gray-700">{estimativa.horasPorDia}h/dia</div>
                            <div className="text-gray-600">Horas Operação</div>
                          </div>
                          <div className="bg-white rounded p-3 text-center">
                            <div className="text-lg font-semibold text-gray-700">{estimativa.consumoPorHora}L/h</div>
                            <div className="text-gray-600">{estimativa.maquinaUsada}</div>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="mt-3 text-xs text-amber-700 bg-amber-100 p-2 rounded">
                      <strong>💡 Cálculo:</strong> {calcularEstimativaCombustivel(viveiroSelecionado).diasOperacao} dias × {calcularEstimativaCombustivel(viveiroSelecionado).horasPorDia}h/dia × {calcularEstimativaCombustivel(viveiroSelecionado).consumoPorHora}L/h = {Math.round(calcularEstimativaCombustivel(viveiroSelecionado).totalLitros)} litros
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <strong>Coordenadas:</strong> {viveiroSelecionado.latitude?.toFixed(6)}, {viveiroSelecionado.longitude?.toFixed(6)}
                    </div>
                  </div>
                  {viveiroSelecionado.observacoes && (
                    <div>
                      <strong>Observações:</strong>
                      <p className="mt-1 text-gray-700 bg-white p-3 rounded border">
                        {viveiroSelecionado.observacoes}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => abrirNoMaps(viveiroSelecionado.latitude, viveiroSelecionado.longitude)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir no Google Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="graficos" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribuição por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="quantidade"
                        data={dadosStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({status, quantidade}) => `${status}: ${quantidade}`}
                      >
                        {dadosStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico Temporal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Cadastros por Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dadosTemporais}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="quantidade" stroke="#059669" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Combustível */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5" />
                    Estimativa de Combustível por Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosCombustivel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} litros`, 'Combustível']} />
                      <Bar dataKey="litros" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Resumo de Combustível
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-2">
                        {Math.round(totalCombustivelEstimado).toLocaleString()} L
                      </div>
                      <div className="text-amber-700 font-medium">Total Estimado de Combustível</div>
                      <div className="text-sm text-amber-600 mt-2">
                        Para {viveirosFiltrados.length} viveiros em construção
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Média por viveiro:</span>
                      <span className="font-medium">
                        {viveirosFiltrados.length > 0 ? Math.round(totalCombustivelEstimado / viveirosFiltrados.length) : 0}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custo estimado*:</span>
                      <span className="font-medium">
                        R$ {(totalCombustivelEstimado * 6.50).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      * Baseado em R$ 6,50 por litro de diesel
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {dadosStatus.map((item) => (
                <Card key={item.status} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold" style={{ color: item.cor }}>
                      {item.quantidade}
                    </div>
                    <p className="text-sm text-gray-600">{item.status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Card Especial de Combustível */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Fuel className="h-6 w-6" />
                  Estimativa Total de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-amber-600">
                      {Math.round(totalCombustivelEstimado).toLocaleString()}L
                    </div>
                    <div className="text-amber-700 text-sm">Total Estimado</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      R$ {(totalCombustivelEstimado * 6.50).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </div>
                    <div className="text-green-700 text-sm">Custo Estimado</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {viveirosFiltrados.length > 0 ? Math.round(totalCombustivelEstimado / viveirosFiltrados.length) : 0}L
                    </div>
                    <div className="text-blue-700 text-sm">Média por Viveiro</div>
                  </div>
                </div>
                <div className="mt-4 text-center text-xs text-amber-600 bg-amber-100 p-2 rounded">
                  💡 <strong>Como calculamos:</strong> Dias de obra × Horas/dia × Consumo da máquina (L/h)
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="h-5 w-5" />
                  Localização dos Viveiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <MapIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Mapa Interativo</h3>
                  <p className="text-gray-600 mb-4">
                    Visualização geográfica dos viveiros em construção com marcadores coloridos por status.
                  </p>
                  <p className="text-sm text-gray-500">
                    Integração com Google Maps em desenvolvimento na próxima versão.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default MetadadosViveiros;