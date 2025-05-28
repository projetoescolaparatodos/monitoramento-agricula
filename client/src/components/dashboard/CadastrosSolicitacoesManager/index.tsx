import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useSolicitacoes } from './useSolicitacoes';
import { SolicitacaoCard } from './SolicitacaoCard';
import { SolicitacaoModal } from './SolicitacaoModal';
import { 
  Solicitacao, 
  FiltrosAtivos, 
  StatusFiltro, 
  UrgenciaFiltro, 
  OrigemFiltro, 
  TipoOrigemFiltro,
  EstatisticasSolicitacoes
} from './types';

export function CadastrosSolicitacoesManager() {
  const { solicitacoes, loading, error, refetch, updateSolicitacao, deleteSolicitacao } = useSolicitacoes();

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

  const handleAtualizarStatus = async (id: string, tipoOrigem: string, novoStatus: string) => {
    const sucesso = await updateSolicitacao(id, tipoOrigem, { status: novoStatus });
    if (sucesso) {
      console.log('Status atualizado com sucesso');
    }
  };

  const handleExcluir = async (id: string, tipoOrigem: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
      const sucesso = await deleteSolicitacao(id, tipoOrigem);
      if (sucesso) {
        console.log('Solicitação excluída com sucesso');
      }
    }
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
      <div className="text-center text-red-600 p-8">
        <p>Erro ao carregar solicitações: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Log para debug
  useEffect(() => {
    if (!loading) {
      console.log('Solicitações carregadas:', solicitacoes);
      console.log('Estatísticas calculadas:', estatisticas);

      // Log detalhado de cada tipo
      const porTipo = solicitacoes.reduce((acc, s) => {
        acc[s.tipoOrigem] = (acc[s.tipoOrigem] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Solicitações por tipo:', porTipo);
    }
  }, [loading, solicitacoes, estatisticas]);

  return (
    <div className="space-y-6">
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
            Filtros
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
            Solicitações ({solicitacoesFiltradas.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={refetch} variant="outline" size="sm">
              Atualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {solicitacoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma solicitação encontrada com os filtros aplicados.
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoesFiltradas.map((solicitacao) => (
                <SolicitacaoCard
                  key={`${solicitacao.tipoOrigem}-${solicitacao.id}`}
                  solicitacao={solicitacao}
                  onVisualizarDetalhes={() => handleAbrirModal(solicitacao)}
                  onAtualizarStatus={handleAtualizarStatus}
                  onExcluir={handleExcluir}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
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
}

export default CadastrosSolicitacoesManager;