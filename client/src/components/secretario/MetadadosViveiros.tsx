
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
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ViveiroEstrutura {
  id: string;
  nomeProprietario?: string;
  proprietario?: string; // Campo alternativo
  localidade?: string;
  latitude?: number;
  longitude?: number;
  statusObra?: 'Iniciada' | 'Em andamento' | 'Concluída' | 'Parada';
  status?: string; // Campo alternativo
  tipoViveiro?: string;
  tipo?: string; // Campo alternativo
  tamanho?: number;
  capacidade?: number;
  observacoes?: string;
  observacao?: string; // Campo alternativo
  tecnicoResponsavel?: string;
  tecnico?: string; // Campo alternativo
  dataCadastro?: string;
  data?: string; // Campo alternativo
  criadoEm?: any;
  userId?: string;
}

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
        // Tenta buscar em diferentes coleções possíveis
        const possiveisColecoes = ['viveiros', 'viveiros_construcao', 'cadastro_viveiros', 'pesca_viveiros'];
        let viveirosData: ViveiroEstrutura[] = [];
        
        for (const nomeColecao of possiveisColecoes) {
          try {
            console.log(`🔍 Buscando viveiros na coleção: ${nomeColecao}`);
            const viveirosRef = collection(db, nomeColecao);
            const q = query(viveirosRef, orderBy('criadoEm', 'desc'));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              console.log(`✅ Encontrados ${snapshot.size} viveiros na coleção ${nomeColecao}`);
              viveirosData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as ViveiroEstrutura[];
              break; // Para na primeira coleção que encontrar dados
            } else {
              console.log(`⚠️ Coleção ${nomeColecao} está vazia`);
            }
          } catch (colecaoError) {
            console.log(`❌ Erro ao acessar coleção ${nomeColecao}:`, colecaoError);
            continue; // Tenta a próxima coleção
          }
        }
        
        if (viveirosData.length === 0) {
          console.warn('Nenhum viveiro encontrado em nenhuma das coleções');
          toast({
            title: "Aviso",
            description: "Nenhum viveiro cadastrado foi encontrado no sistema.",
            variant: "default",
          });
        } else {
          console.log(`📊 Total de viveiros carregados: ${viveirosData.length}`);
        }
        
        setViveiros(viveirosData);
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
      const status = viveiro.statusObra || viveiro.status || 'Não informado';
      const tecnico = viveiro.tecnicoResponsavel || viveiro.tecnico || 'Não informado';
      const localidade = viveiro.localidade || 'Não informado';
      const proprietario = viveiro.nomeProprietario || viveiro.proprietario || '';
      
      const matchStatus = filtroStatus === 'todos' || status === filtroStatus;
      const matchTecnico = filtroTecnico === 'todos' || tecnico === filtroTecnico;
      const matchLocalidade = filtroLocalidade === 'todos' || localidade === filtroLocalidade;
      const matchBusca = busca === '' || 
        proprietario.toLowerCase().includes(busca.toLowerCase()) ||
        localidade.toLowerCase().includes(busca.toLowerCase());
      
      return matchStatus && matchTecnico && matchLocalidade && matchBusca;
    });
  }, [viveiros, filtroStatus, filtroTecnico, filtroLocalidade, busca]);

  // Dados para gráficos
  const dadosStatus = useMemo(() => {
    const contagem = viveirosFiltrados.reduce((acc, viveiro) => {
      acc[viveiro.statusObra] = (acc[viveiro.statusObra] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(contagem).map(([status, quantidade]) => ({
      status,
      quantidade,
      cor: {
        'Iniciada': '#FCD34D',
        'Em andamento': '#60A5FA',
        'Concluída': '#34D399',
        'Parada': '#F87171'
      }[status] || '#9CA3AF'
    }));
  }, [viveirosFiltrados]);

  const dadosTemporais = useMemo(() => {
    const cadastrosPorMes = viveirosFiltrados.reduce((acc, viveiro) => {
      const mes = format(new Date(viveiro.dataCadastro), 'MM/yyyy');
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cadastrosPorMes)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, quantidade]) => ({ mes, quantidade }));
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
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-700 rounded-lg p-3">
              <div className="text-2xl font-bold">{dadosStatus.find(d => d.status === 'Concluída')?.quantidade || 0}</div>
              <div className="text-xs">Concluídos</div>
            </div>
            <div className="bg-green-700 rounded-lg p-3">
              <div className="text-2xl font-bold">{dadosStatus.find(d => d.status === 'Em andamento')?.quantidade || 0}</div>
              <div className="text-xs">Em Andamento</div>
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

      <Tabs defaultValue="tabela" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tabela">Tabela Interativa</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos e Análises</TabsTrigger>
          <TabsTrigger value="mapa">Visualização no Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="tabela" className="space-y-4">
          {viveirosFiltrados.length === 0 ? (
            <Alert>
              <Building className="h-4 w-4" />
              <AlertDescription>
                Nenhum viveiro encontrado com os filtros aplicados.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proprietário</TableHead>
                        <TableHead>Localidade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Técnico</TableHead>
                        <TableHead>Data Cadastro</TableHead>
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
                          <TableCell className="font-medium">{viveiro.nomeProprietario}</TableCell>
                          <TableCell>{viveiro.localidade}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(viveiro.statusObra)}>
                              {viveiro.statusObra}
                            </Badge>
                          </TableCell>
                          <TableCell>{viveiro.tipoViveiro}</TableCell>
                          <TableCell>{viveiro.tamanho}m²</TableCell>
                          <TableCell>{viveiro.tecnicoResponsavel}</TableCell>
                          <TableCell>
                            {format(new Date(viveiro.dataCadastro), 'dd/MM/yyyy', { locale: ptBR })}
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
                  Detalhes - {viveiroSelecionado.nomeProprietario}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <strong>Localidade:</strong> {viveiroSelecionado.localidade}
                  </div>
                  <div>
                    <strong>Capacidade:</strong> {viveiroSelecionado.capacidade} peixes
                  </div>
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
    </div>
  );
};

export default MetadadosViveiros;
