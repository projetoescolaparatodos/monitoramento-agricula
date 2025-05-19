import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download, 
  Filter, 
  Search, 
  Trash, 
  X 
} from 'lucide-react';
import { db } from "@/utils/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Solicitacao {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  descricao?: string;
  servico: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado' | 'aprovado' | 'rejeitado';
  timestamp: { seconds: number, nanoseconds: number };
  setor: string;
  origem: 'chatbot' | 'formulario_web' | 'formulario_web_completo_agricultura' | 'formulario_web_completo_pesca' | 'formulario_web_completo_paa';
  detalhes?: Record<string, any>;
  historico?: Array<{
    acao: string;
    por: string;
    data: Timestamp;
    comentario?: string;
  }>;
}

interface DashboardStat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  em_andamento: "bg-blue-100 text-blue-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
  aprovado: "bg-emerald-100 text-emerald-800",
  rejeitado: "bg-rose-100 text-rose-800"
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado"
};

const CadastrosSolicitacoesManager: React.FC = () => {
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todas");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dateRange, setDateRange] = useState<{start?: Date; end?: Date}>({});

  // Modal de detalhes
  const [detalhesModalOpen, setDetalhesModalOpen] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [confirmRejectDialogOpen, setConfirmRejectDialogOpen] = useState(false);

  // Dashboard data
  const [estatisticasDashboard, setEstatisticasDashboard] = useState<{
    total: number;
    emAndamento: number;
    concluidos: number;
    pendentes: number;
    porSetor: Record<string, number>;
  }>({
    total: 0,
    emAndamento: 0,
    concluidos: 0,
    pendentes: 0,
    porSetor: {}
  });

  // Gráfico de crescimento
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([]);

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    setLoading(true);
    try {
      // Obter solicitações dos três setores
      const colecoes = ['solicitacoes_agricultura', 'solicitacoes_pesca', 'solicitacoes_paa', 'solicitacoes_agricultura_completo', 'solicitacoes_pesca_completo', 'solicitacoes_paa_completo'];
      let todasSolicitacoes: Solicitacao[] = [];

      for (const colecao of colecoes) {
        const setor = colecao.includes('_completo') ? colecao.split('_')[1] : colecao.split('_')[1];
        const q = query(
          collection(db, colecao),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const solicitacoesSetor = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          setor,
          origem: colecao
        })) as Solicitacao[];

        todasSolicitacoes = [...todasSolicitacoes, ...solicitacoesSetor];
      }

      // Ordenar por data mais recente
      todasSolicitacoes.sort((a, b) => {
        return b.timestamp.seconds - a.timestamp.seconds;
      });

      setSolicitacoes(todasSolicitacoes);

      // Calcular estatísticas para o dashboard
      calcularEstatisticas(todasSolicitacoes);

      // Preparar dados para o gráfico
      prepararDadosGrafico(todasSolicitacoes);

    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (solicitacoes: Solicitacao[]) => {
    const estatisticas = {
      total: solicitacoes.length,
      emAndamento: solicitacoes.filter(s => s.status === 'em_andamento').length,
      concluidos: solicitacoes.filter(s => ['concluido', 'aprovado'].includes(s.status)).length,
      pendentes: solicitacoes.filter(s => s.status === 'pendente').length,
      porSetor: {} as Record<string, number>
    };

    // Calcular totais por setor
    solicitacoes.forEach(s => {
      if (!estatisticas.porSetor[s.setor]) {
        estatisticas.porSetor[s.setor] = 0;
      }
      estatisticas.porSetor[s.setor]++;
    });

    setEstatisticasDashboard(estatisticas);
  };

  const prepararDadosGrafico = (solicitacoes: Solicitacao[]) => {
    // Agrupar solicitações por semana (últimas 6 semanas)
    const hoje = new Date();
    const ultimasSemanas: Record<string, {agricultura: number, pesca: number, paa: number}> = {};

    // Inicializar semanas (6 semanas anteriores)
    for (let i = 5; i >= 0; i--) {
      const dataInicio = new Date();
      dataInicio.setDate(hoje.getDate() - (i * 7));
      const nomeSemana = `Semana ${5-i+1}`;
      ultimasSemanas[nomeSemana] = { agricultura: 0, pesca: 0, paa: 0 };
    }

    // Agrupar solicitações
    solicitacoes.forEach(s => {
      const dataSolicitacao = new Date(s.timestamp.seconds * 1000);
      const diffDias = Math.floor((hoje.getTime() - dataSolicitacao.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDias <= 42) { // Dentro das últimas 6 semanas
        const semanaIndex = Math.floor(diffDias / 7);
        if (semanaIndex >= 0 && semanaIndex < 6) {
          const nomeSemana = `Semana ${6-semanaIndex}`;
          if (ultimasSemanas[nomeSemana]) {
            ultimasSemanas[nomeSemana][s.setor as 'agricultura' | 'pesca' | 'paa']++;
          }
        }
      }
    });

    // Converter para formato do gráfico
    const dados = Object.entries(ultimasSemanas).map(([name, values]) => ({
      name,
      agricultura: values.agricultura,
      pesca: values.pesca,
      paa: values.paa,
    }));

    setDadosGrafico(dados);
  };

  const atualizarStatus = async (id: string, novoStatus: string, setor: string, comentario?: string) => {
    try {
      const colecao = `solicitacoes_${setor}`;
      const docRef = doc(db, colecao, id);

      // Obter documento atual para poder atualizar o histórico
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("Documento não encontrado");
      }

      const dadosAtuais = docSnap.data();

      // Criar entrada de histórico
      const novaAcao = {
        acao: novoStatus,
        por: "gestor",
        data: Timestamp.now(),
        comentario: comentario || ""
      };

      // Atualizar histórico
      const historicoAtual = dadosAtuais.historico || [];
      const historicoAtualizado = [...historicoAtual, novaAcao];

      // Atualizar documento
      await updateDoc(docRef, {
        status: novoStatus,
        historico: historicoAtualizado
      });

      // Atualizar estado local
      setSolicitacoes(prev => 
        prev.map(item => 
          item.id === id 
            ? { 
                ...item, 
                status: novoStatus as any,
                historico: historicoAtualizado
              } 
            : item
        )
      );

      toast({
        title: "Status atualizado",
        description: `Solicitação ${statusLabels[novoStatus].toLowerCase()} com sucesso.`,
      });

      // Recalcular estatísticas
      calcularEstatisticas(
        solicitacoes.map(item => 
          item.id === id 
            ? { 
                ...item, 
                status: novoStatus as any
              } 
            : item
        )
      );

      // Fechar modal se necessário
      if (detalhesModalOpen) {
        setDetalhesModalOpen(false);
      }

    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da solicitação.",
        variant: "destructive"
      });
    }
  };

  const handleRejeitar = () => {
    if (!solicitacaoSelecionada) return;

    setConfirmRejectDialogOpen(true);
  };

  const confirmarRejeicao = async () => {
    if (!solicitacaoSelecionada) return;

    await atualizarStatus(
      solicitacaoSelecionada.id, 
      'rejeitado', 
      solicitacaoSelecionada.setor,
      motivoRejeicao
    );

    setConfirmRejectDialogOpen(false);
    setMotivoRejeicao("");
  };

  const formatarData = (seconds: number) => {
    const data = new Date(seconds * 1000);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };

  const visualizarDetalhes = (solicitacao: Solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setDetalhesModalOpen(true);
  };

  // Filtrar solicitações
  const solicitacoesFiltradas = solicitacoes
    .filter(s => {
      // Filtro por setor
      if (activeTab !== "todas" && s.setor !== activeTab) {
        return false;
      }

      // Filtro por status
      if (statusFilter !== "todos" && s.status !== statusFilter) {
        return false;
      }

      // Filtro por data
      if (dateRange.start) {
        const dataInicio = dateRange.start;
        const dataSolicitacao = new Date(s.timestamp.seconds * 1000);
        if (dataSolicitacao < dataInicio) {
          return false;
        }
      }

      if (dateRange.end) {
        const dataFim = dateRange.end;
        dataFim.setHours(23, 59, 59);
        const dataSolicitacao = new Date(s.timestamp.seconds * 1000);
        if (dataSolicitacao > dataFim) {
          return false;
        }
      }

      // Busca por nome ou CPF
      if (searchTerm) {
        return (
          s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.cpf.includes(searchTerm) ||
          s.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return true;
    });

  // Cartões do dashboard
  const dashboardCards: DashboardStat[] = [
    {
      label: "Total de Solicitações",
      value: estatisticasDashboard.total,
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      color: "bg-blue-50"
    },
    {
      label: "Em Andamento",
      value: estatisticasDashboard.emAndamento,
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      color: "bg-amber-50"
    },
    {
      label: "Concluídos",
      value: estatisticasDashboard.concluidos,
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      color: "bg-green-50"
    },
    {
      label: "Pendentes",
      value: estatisticasDashboard.pendentes,
      icon: <Clock className="h-8 w-8 text-orange-500" />,
      color: "bg-orange-50"
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Cadastros e Solicitações</CardTitle>
          <CardDescription>
            Monitore todas as solicitações e cadastros recebidos pelos cidadãos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardCards.map((card, index) => (
                  <Card key={index} className={`${card.color} border`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{card.label}</p>
                          <p className="text-3xl font-bold">{card.value}</p>
                        </div>
                        <div>{card.icon}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolução Semanal de Solicitações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dadosGrafico}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="agricultura" name="Agricultura" fill="#4ade80" />
                        <Bar dataKey="pesca" name="Pesca" fill="#60a5fa" />
                        <Bar dataKey="paa" name="PAA" fill="#fbbf24" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solicitações */}
            <TabsContent value="solicitacoes">
              <div className="space-y-4">
                {/* Filtros */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="search">Buscar</Label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            id="search"
                            placeholder="Nome, CPF ou ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={statusFilter} 
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todos os status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os status</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_andamento">Em andamento</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                            <SelectItem value="aprovado">Aprovado</SelectItem>
                            <SelectItem value="rejeitado">Rejeitado</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Setor</Label>
                        <Tabs 
                          value={activeTab} 
                          onValueChange={setActiveTab}
                          className="mt-1"
                        >
                          <TabsList className="grid grid-cols-4 h-9">
                            <TabsTrigger value="todas" className="text-xs">Todas</TabsTrigger>
                            <TabsTrigger value="agricultura" className="text-xs">Agricultura</TabsTrigger>
                            <TabsTrigger value="pesca" className="text-xs">Pesca</TabsTrigger>
                            <TabsTrigger value="paa" className="text-xs">PAA</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("todos");
                            setDateRange({});
                          }}
                        >
                          <Filter className="mr-2 h-4 w-4" />
                          Limpar Filtros
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabela */}
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Carregando solicitações...</p>
                  </div>
                ) : solicitacoesFiltradas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma solicitação encontrada com os filtros selecionados
                  </div>
                ) : (
                  <div className="bg-white rounded-md border shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Serviço/Solicitação</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {solicitacoesFiltradas.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="whitespace-nowrap">
                                {formatarData(item.timestamp.seconds)}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{item.nome}</div>
                                <div className="text-sm text-gray-500">{item.telefone}</div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate" title={item.servico}>
                                  {item.servico}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    item.setor === 'agricultura'
                                      ? 'bg-green-50 text-green-800 border-green-200'
                                      : item.setor === 'pesca'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }
                                >
                                  {item.setor.charAt(0).toUpperCase() + item.setor.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    item.origem.includes('completo')
                                      ? 'bg-purple-50 text-purple-800 border-purple-200'
                                      : 'bg-blue-50 text-blue-800 border-blue-200'
                                  }
                                >
                                  {item.origem.includes('completo') ? 'Cadastro Completo' : 'Solicitação Simples'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={statusColors[item.status]}>
                                  {statusLabels[item.status]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {item.origem === 'chatbot' ? 'Chatbot' : 'Formulário'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-xs h-7" 
                                    onClick={() => visualizarDetalhes(item)}
                                  >
                                    Detalhes
                                  </Button>

                                  {item.status === 'pendente' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-xs h-7" 
                                      onClick={() => atualizarStatus(item.id, 'em_andamento', item.setor)}
                                    >
                                      Iniciar
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {solicitacaoSelecionada && (
        <Dialog open={detalhesModalOpen} onOpenChange={setDetalhesModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Solicitação</DialogTitle>
              <DialogDescription>
                ID: {solicitacaoSelecionada.id}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="font-semibold mb-2">Dados do Solicitante</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Nome:</span>
                    <span className="text-sm col-span-2">{solicitacaoSelecionada.nome}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">CPF:</span>
                    <span className="text-sm col-span-2">{solicitacaoSelecionada.cpf}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Telefone:</span>
                    <span className="text-sm col-span-2">{solicitacaoSelecionada.telefone}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Setor:</span>
                    <span className="text-sm col-span-2">
                      <Badge 
                        variant="outline" 
                        className={
                          solicitacaoSelecionada.setor === 'agricultura'
                            ? 'bg-green-50 text-green-800 border-green-200'
                            : solicitacaoSelecionada.setor === 'pesca'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : solicitacaoSelecionada.setor === 'paa'
                        }
                      >
                        {solicitacaoSelecionada.setor.charAt(0).toUpperCase() + solicitacaoSelecionada.setor.slice(1)}
                      </Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Status:</span>
                    <span className="text-sm col-span-2">
                      <Badge className={statusColors[solicitacaoSelecionada.status]}>
                        {statusLabels[solicitacaoSelecionada.status]}
                      </Badge>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Data:</span>
                    <span className="text-sm col-span-2">
                      {formatarData(solicitacaoSelecionada.timestamp.seconds)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-sm font-medium">Origem:</span>
                    <span className="text-sm col-span-2">
                      {solicitacaoSelecionada.origem === 'chatbot' ? 'Chatbot' : 'Formulário Web'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Detalhes da Solicitação</h3>
                <div className="space-y-2">
                  {solicitacaoSelecionada.origem.includes('completo') ? (
                    <>
                      {/* Campos específicos para formulários completos */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* Propriedade */}
                        {solicitacaoSelecionada.nomePropriedade && (
                          <div className="border p-3 rounded-md">
                            <h4 className="font-medium mb-2">Dados da Propriedade</h4>
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm font-medium">Nome:</span>
                                <span className="text-sm col-span-2">{solicitacaoSelecionada.nomePropriedade}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm font-medium">Endereço:</span>
                                <span className="text-sm col-span-2">{solicitacaoSelecionada.enderecoPropriedade}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm font-medium">Tamanho:</span>
                                <span className="text-sm col-span-2">{solicitacaoSelecionada.tamanhoPropriedade} ha</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <span className="text-sm font-medium">Situação Legal:</span>
                                <span className="text-sm col-span-2">{solicitacaoSelecionada.situacaoLegal}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Culturas (Agricultura) */}
                        {solicitacaoSelecionada.culturas && (
                          <div className="border p-3 rounded-md">
                            <h4 className="font-medium mb-2">Culturas</h4>
                            <div className="space-y-2">
                              {Object.entries(solicitacaoSelecionada.culturas)
                                .filter(([_, value]) => value.selecionado)
                                .map(([cultura, dados]) => (
                                  <div key={cultura} className="grid grid-cols-3 gap-1">
                                    <span className="text-sm font-medium">{cultura}:</span>
                                    <span className="text-sm col-span-2">
                                      Área: {dados.area} ha, Produção: {dados.producao} kg/ano
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Estruturas (Pesca) */}
                        {solicitacaoSelecionada.estruturas && (
                          <div className="border p-3 rounded-md">
                            <h4 className="font-medium mb-2">Estruturas</h4>
                            <div className="space-y-2">
                              {Object.entries(solicitacaoSelecionada.estruturas)
                                .filter(([_, value]) => value === true)
                                .map(([estrutura]) => (
                                  <div key={estrutura} className="grid grid-cols-3 gap-1">
                                    <span className="text-sm font-medium">{estrutura.replace(/_/g, ' ')}:</span>
                                    <span className="text-sm col-span-2">Presente</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Recursos */}
                        {(solicitacaoSelecionada.maquinario || solicitacaoSelecionada.maodeobra) && (
                          <div className="border p-3 rounded-md">
                            <h4 className="font-medium mb-2">Recursos</h4>
                            {solicitacaoSelecionada.maquinario && (
                              <div className="mb-2">
                                <h5 className="text-sm font-medium mb-1">Maquinário:</h5>
                                {Object.entries(solicitacaoSelecionada.maquinario)
                                  .filter(([_, value]) => value === true)
                                  .map(([maquina]) => (
                                    <Badge key={maquina} className="mr-2 mb-1">
                                      {maquina.replace(/_/g, ' ')}
                                    </Badge>
                                  ))}
                              </div>
                            )}
                            {solicitacaoSelecionada.maodeobra && (
                              <div>
                                <h5 className="text-sm font-medium mb-1">Mão de obra:</h5>
                                {Object.entries(solicitacaoSelecionada.maodeobra)
                                  .filter(([_, value]) => value.selecionado)
                                  .map(([tipo, dados]) => (
                                    <div key={tipo} className="grid grid-cols-3 gap-1">
                                      <span className="text-sm font-medium">{tipo.replace(/_/g, ' ')}:</span>
                                      <span className="text-sm col-span-2">{dados.quantidade} pessoas</span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Campos para solicitações simples */}
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm font-medium">Serviço:</span>
                        <span className="text-sm col-span-2">{solicitacaoSelecionada.servico}</span>
                      </div>
                      {solicitacaoSelecionada.descricao && (
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-sm font-medium">Descrição:</span>
                          <span className="text-sm col-span-2">{solicitacaoSelecionada.descricao}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Detalhes adicionais se disponíveis */}
                  {solicitacaoSelecionada.detalhes && Object.entries(solicitacaoSelecionada.detalhes).map(([key, value]) => (
                    <div className="grid grid-cols-3 gap-1" key={key}>
                      <span className="text-sm font-medium">{key}:</span>
                      <span className="text-sm col-span-2">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Histórico de ações */}
            {solicitacaoSelecionada.historico && solicitacaoSelecionada.historico.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Histórico de Ações</h3>
                <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
                  <ul className="space-y-2">
                    {solicitacaoSelecionada.historico.map((evento, index) => (
                      <li key={index} className="text-sm border-b pb-1 last:border-0">
                        <div className="flex justify-between">
                          <span>
                            <Badge variant="outline" className="mr-2">
                              {statusLabels[evento.acao] || evento.acao}
                            </Badge>
                            por {evento.por}
                          </span>
                          <span className="text-gray-500">
                            {new Date(evento.data.seconds * 1000).toLocaleString()}
                          </span>
                        </div>
                        {evento.comentario && (
                          <p className="mt-1 text-gray-600 italic">"{evento.comentario}"</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              {/* Botões baseados no status atual */}
              {solicitacaoSelecionada.status === 'pendente' && (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => atualizarStatus(solicitacaoSelecionada.id, 'em_andamento', solicitacaoSelecionada.setor)}
                  >
                    Iniciar Análise
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => atualizarStatus(solicitacaoSelecionada.id, 'aprovado', solicitacaoSelecionada.setor)}
                  >
                    Aprovar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleRejeitar}
                  >
                    Rejeitar
                  </Button>
                </>
              )}

              {solicitacaoSelecionada.status === 'em_andamento' && (
                <>
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => atualizarStatus(solicitacaoSelecionada.id, 'aprovado', solicitacaoSelecionada.setor)}
                  >
                    Aprovar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleRejeitar}
                  >
                    Rejeitar
                  </Button>
                </>
              )}

              <Button 
                variant="outline"
                onClick={() => setDetalhesModalOpen(false)}
              >
                Fechar
              </Button>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Confirmação de Rejeição */}
      <Dialog open={confirmRejectDialogOpen} onOpenChange={setConfirmRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Rejeição</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da rejeição da solicitação.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="motivoRejeicao">Motivo da Rejeição</Label>
            <Textarea
              id="motivoRejeicao"
              placeholder="Informe o motivo da rejeição..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmRejectDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmarRejeicao}
              disabled={!motivoRejeicao.trim()}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CadastrosSolicitacoesManager;