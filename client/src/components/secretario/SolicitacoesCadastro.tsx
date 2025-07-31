
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Search, 
  Filter, 
  Eye, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  RefreshCw
} from 'lucide-react';

// Importar hooks e componentes do dashboard existente
import { useSolicitacoes } from '@/components/dashboard/CadastrosSolicitacoesManager/useSolicitacoes';
import { SolicitacaoModal } from '@/components/dashboard/CadastrosSolicitacoesManager/SolicitacaoModal';
import { 
  Solicitacao, 
  FiltrosAtivos, 
  StatusFiltro, 
  UrgenciaFiltro, 
  OrigemFiltro, 
  TipoOrigemFiltro,
  EstatisticasSolicitacoes
} from '@/components/dashboard/CadastrosSolicitacoesManager/types';

// Componente para card de solicitação (apenas visualização)
const SolicitacaoCardReadOnly = ({ 
  solicitacao, 
  onVisualizarDetalhes 
}: {
  solicitacao: Solicitacao;
  onVisualizarDetalhes: () => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'baixa': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="h-3 w-3" />;
      case 'em_andamento': return <AlertTriangle className="h-3 w-3" />;
      case 'concluido': return <CheckCircle className="h-3 w-3" />;
      case 'cancelado': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getTipoOrigemLabel = (tipo: string) => {
    switch (tipo) {
      case 'solicitacoes_agricultura_completo': return 'Agricultura Completa';
      case 'solicitacoes_agricultura': return 'Agricultura';
      case 'solicitacoes_pesca_completo': return 'Pesca Completa';
      case 'solicitacoes_pesca': return 'Pesca';
      case 'solicitacoes_paa': return 'PAA';
      case 'solicitacoes_servicos': return 'Serviços';
      default: return tipo.replace('solicitacoes_', '').replace('_', ' ');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Data não informada';

    try {
      let date: Date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }

      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {solicitacao.nome}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>CPF: {solicitacao.cpf}</span>
              {solicitacao.telefone && (
                <>
                  <span>•</span>
                  <Phone className="h-4 w-4" />
                  <span>{solicitacao.telefone}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(solicitacao.status)}>
              {getStatusIcon(solicitacao.status)}
              <span className="ml-1 capitalize">{solicitacao.status.replace('_', ' ')}</span>
            </Badge>
            <Badge className={getUrgenciaColor(solicitacao.urgencia)}>
              {solicitacao.urgencia === 'urgente' && <AlertTriangle className="h-3 w-3 mr-1" />}
              <span className="capitalize">{solicitacao.urgencia}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Informações principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Tipo:</span>
            <span>{getTipoOrigemLabel(solicitacao.tipoOrigem)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Data:</span>
            <span>{formatTimestamp(solicitacao.timestamp)}</span>
          </div>

          {solicitacao.servico && (
            <div className="flex items-center gap-2 md:col-span-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Serviço:</span>
              <span>{solicitacao.servico}</span>
            </div>
          )}

          {solicitacao.enderecoPropriedade && (
            <div className="flex items-center gap-2 md:col-span-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Propriedade:</span>
              <span>{solicitacao.enderecoPropriedade}</span>
            </div>
          )}
        </div>

        {/* Ações - apenas visualização */}
        <div className="flex items-center justify-end pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onVisualizarDetalhes}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SolicitacoesCadastro = () => {
  const { solicitacoes, loading, error, refetch } = useSolicitacoes();
  
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [filtros, setFiltros] = useState<FiltrosAtivos>({
    status: 'todos',
    urgencia: 'todos',
    origem: 'todos',
    tipoOrigem: 'todos',
    busca: ''
  });

  // Calcular estatísticas
  const estatisticas = useMemo((): EstatisticasSolicitacoes => {
    const total = solicitacoes.length;
    const pendentes = solicitacoes.filter(s => s.status === 'pendente').length;
    const emAndamento = solicitacoes.filter(s => s.status === 'em_andamento').length;
    const concluidas = solicitacoes.filter(s => s.status === 'concluido').length;
    const canceladas = solicitacoes.filter(s => s.status === 'cancelado').length;

    const porUrgencia = solicitacoes.reduce((acc, s) => {
      acc[s.urgencia] = (acc[s.urgencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porOrigem = solicitacoes.reduce((acc, s) => {
      acc[s.origem] = (acc[s.origem] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porTipo = solicitacoes.reduce((acc, s) => {
      acc[s.tipoOrigem] = (acc[s.tipoOrigem] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      pendentes,
      emAndamento,
      concluidas,
      canceladas,
      porUrgencia,
      porOrigem,
      porTipo
    };
  }, [solicitacoes]);

  // Filtrar solicitações
  const solicitacoesFiltradas = useMemo(() => {
    return solicitacoes.filter(solicitacao => {
      // Filtro por status
      if (filtros.status !== 'todos' && solicitacao.status !== filtros.status) {
        return false;
      }

      // Filtro por urgência
      if (filtros.urgencia !== 'todos' && solicitacao.urgencia !== filtros.urgencia) {
        return false;
      }

      // Filtro por origem
      if (filtros.origem !== 'todos' && solicitacao.origem !== filtros.origem) {
        return false;
      }

      // Filtro por tipo de origem
      if (filtros.tipoOrigem !== 'todos' && solicitacao.tipoOrigem !== filtros.tipoOrigem) {
        return false;
      }

      // Filtro por busca
      if (filtros.busca) {
        const termoBusca = filtros.busca.toLowerCase();
        const buscaEm = [
          solicitacao.nome,
          solicitacao.cpf,
          solicitacao.telefone,
          solicitacao.email,
          solicitacao.servico,
          solicitacao.tipoServico,
          solicitacao.nomePropriedade,
          solicitacao.descricao,
          solicitacao.detalhes
        ].filter(Boolean).join(' ').toLowerCase();

        if (!buscaEm.includes(termoBusca)) {
          return false;
        }
      }

      return true;
    });
  }, [solicitacoes, filtros]);

  const handleAbrirModal = (solicitacao: Solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setSolicitacaoSelecionada(null);
    setModalAberto(false);
  };

  // Funções vazias para o modal (apenas visualização)
  const handleAtualizarStatus = () => {
    // Não faz nada - apenas visualização
  };

  const handleExcluir = () => {
    // Não faz nada - apenas visualização
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando solicitações...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Erro ao carregar solicitações: {error}
          <Button onClick={refetch} className="mt-2 ml-2" size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com informação */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este painel exibe as solicitações de cadastro feitas por agricultores e pescadores. 
          <br />
          <strong>Modo apenas leitura:</strong> Visualização das solicitações sem possibilidade de edição ou exclusão.
        </AlertDescription>
      </Alert>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</div>
            <p className="text-sm text-gray-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.emAndamento}</div>
            <p className="text-sm text-gray-600">Em Andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</div>
            <p className="text-sm text-gray-600">Concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{estatisticas.canceladas}</div>
            <p className="text-sm text-gray-600">Canceladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CPF, etc..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Status */}
            <Select
              value={filtros.status}
              onValueChange={(value: StatusFiltro) => setFiltros(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* Urgência */}
            <Select
              value={filtros.urgencia}
              onValueChange={(value: UrgenciaFiltro) => setFiltros(prev => ({ ...prev, urgencia: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Urgências</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>

            {/* Origem */}
            <Select
              value={filtros.origem}
              onValueChange={(value: OrigemFiltro) => setFiltros(prev => ({ ...prev, origem: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Origens</SelectItem>
                <SelectItem value="formulario_web">Formulário Web</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
              </SelectContent>
            </Select>

            {/* Tipo */}
            <Select
              value={filtros.tipoOrigem}
              onValueChange={(value: TipoOrigemFiltro) => setFiltros(prev => ({ ...prev, tipoOrigem: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="solicitacoes_agricultura">Agricultura</SelectItem>
                <SelectItem value="solicitacoes_agricultura_completo">Agricultura Completa</SelectItem>
                <SelectItem value="solicitacoes_pesca">Pesca</SelectItem>
                <SelectItem value="solicitacoes_pesca_completo">Pesca Completa</SelectItem>
                <SelectItem value="solicitacoes_paa">PAA</SelectItem>
                <SelectItem value="solicitacoes_servicos">Serviços</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Solicitações de Cadastro ({solicitacoesFiltradas.length})
          </CardTitle>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {solicitacoesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              {solicitacoes.length === 0 ? (
                <div className="text-gray-500">
                  <p className="text-lg font-medium">Nenhuma solicitação encontrada</p>
                  <p className="text-sm mt-2">As solicitações aparecerão aqui quando forem criadas através dos formulários.</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>Nenhuma solicitação encontrada com os filtros aplicados.</p>
                  <Button 
                    onClick={() => setFiltros({
                      status: 'todos',
                      urgencia: 'todos',
                      origem: 'todos',
                      tipoOrigem: 'todos',
                      busca: ''
                    })}
                    className="mt-2"
                    variant="outline"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoesFiltradas.map((solicitacao) => (
                <SolicitacaoCardReadOnly
                  key={`${solicitacao.tipoOrigem}-${solicitacao.id}`}
                  solicitacao={solicitacao}
                  onVisualizarDetalhes={() => handleAbrirModal(solicitacao)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes - Apenas visualização */}
      {solicitacaoSelecionada && (
        <SolicitacaoModal
          solicitacao={solicitacaoSelecionada}
          isOpen={modalAberto}
          onClose={handleFecharModal}
          onAtualizarStatus={handleAtualizarStatus}
          onExcluir={handleExcluir}
        />
      )}
    </div>
  );
};

export default SolicitacoesCadastro;
