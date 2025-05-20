
import React, { useState, useEffect } from 'react';
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Solicitacao, FiltroSolicitacoes } from './types';
import { useSolicitacoes } from './useSolicitacoes';
import SolicitacaoCard from './SolicitacaoCard';
import SolicitacaoModal from './SolicitacaoModal';
import { useToast } from '../../../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

const CadastrosSolicitacoesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('todas');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { 
    solicitacoes, 
    loading, 
    error, 
    filtros, 
    setFiltros,
    refreshSolicitacoes,
    atualizarStatus
  } = useSolicitacoes();

  // Atualizar filtro quando a aba mudar
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFiltros({
      ...filtros,
      tipo: value as FiltroSolicitacoes['tipo']
    });
  };

  // Manipular mudança de status
  const handleStatusChange = async (solicitacaoId: string, novoStatus: string, tipo: string, colecao?: string) => {
    const success = await atualizarStatus(solicitacaoId, novoStatus, tipo, colecao);
    
    if (success) {
      toast({
        title: "Status atualizado",
        description: `A solicitação foi marcada como "${novoStatus.replace('_', ' ')}".`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da solicitação.",
        variant: "destructive",
      });
    }
  };

  // Manipular pesquisa
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({
      ...filtros,
      pesquisa: e.target.value
    });
  };

  // Manipular filtro de status
  const handleStatusFilter = (value: string) => {
    setFiltros({
      ...filtros,
      status: value as FiltroSolicitacoes['status']
    });
  };

  // Efeito para carregar solicitações quando o componente montar
  useEffect(() => {
    console.log("CadastrosSolicitacoesManager montado - buscando solicitações iniciais");
    refreshSolicitacoes();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Cadastros e Solicitações</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDebugMode(!debugMode)}
        >
          {debugMode ? "Ocultar Debug" : "Modo Debug"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
          <TabsTrigger value="pesca">Pesca</TabsTrigger>
          <TabsTrigger value="paa">PAA</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={filtros.pesquisa || ''}
            onChange={handleSearch}
            className="max-w-xs"
          />
          
          <Select 
            value={filtros.status} 
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refreshSolicitacoes()}
          >
            Atualizar
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mt-2">
            {error}
          </div>
        )}

        {debugMode && (
          <div className="mt-4 p-4 border rounded bg-gray-50 overflow-auto max-h-40">
            <h3 className="font-semibold">Informações de Debug:</h3>
            <p>Filtros atuais: Tipo: {filtros.tipo}, Status: {filtros.status}, Pesquisa: {filtros.pesquisa || '(vazio)'}</p>
            <p>Total de solicitações carregadas: {solicitacoes.length}</p>
            <p>Estado de carregamento: {loading ? 'Carregando...' : 'Completo'}</p>
          </div>
        )}

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg p-4 h-64 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-auto"></div>
                </div>
              ))}
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="text-center p-8 border rounded-lg mt-4">
              <h3 className="font-semibold text-lg">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-500 mt-2">
                {filtros.pesquisa 
                  ? "Nenhum resultado para a sua pesquisa. Tente outros termos." 
                  : `Não há solicitações ${activeTab !== 'todas' ? `de ${activeTab}` : ''} para exibir.`}
              </p>
              <div className="mt-4 text-left p-4 bg-gray-100 rounded-md overflow-auto max-h-48 text-xs">
                <p className="font-semibold">Coleções verificadas:</p>
                <ul className="list-disc list-inside">
                  {['solicitacoes_agricultura', 'solicitacoes_agricultura_completo', 'solicitacoes_pesca', 'solicitacoes_pesca_completo', 'solicitacoes_paa', 'solicitacoes_servicos'].map(col => (
                    <li key={col} className={activeTab === 'todas' || col.includes(activeTab) ? '' : 'text-gray-400'}>
                      {col} {activeTab === 'todas' || col.includes(activeTab) ? '(verificada)' : '(ignorada pelo filtro)'}
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      console.log("Forçando nova busca de solicitações");
                      refreshSolicitacoes();
                    }}
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {solicitacoes.map((solicitacao) => (
                <SolicitacaoCard
                  key={solicitacao.id}
                  solicitacao={solicitacao}
                  onVerDetalhes={() => setSelectedSolicitacao(solicitacao)}
                  onChangeStatus={(sol, status) => 
                    handleStatusChange(sol.id, status, sol.tipo, sol.colecao)
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SolicitacaoModal
        solicitacao={selectedSolicitacao}
        onClose={() => setSelectedSolicitacao(null)}
        onChangeStatus={handleStatusChange}
      />
    </div>
  );
};

export default CadastrosSolicitacoesManager;
