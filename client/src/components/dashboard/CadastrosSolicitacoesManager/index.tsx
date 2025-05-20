
import React, { useState } from 'react';
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Solicitacao, FiltroSolicitacoes } from './types';
import { useSolicitacoes } from './useSolicitacoes';
import SolicitacaoCard from './SolicitacaoCard';
import SolicitacaoModal from './SolicitacaoModal';
import { useToast } from '../../../hooks/use-toast';

const CadastrosSolicitacoesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('todas');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
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
  const handleStatusChange = async (solicitacaoId: string, novoStatus: string, tipo: string) => {
    const success = await atualizarStatus(solicitacaoId, novoStatus, tipo);
    
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gerenciar Cadastros e Solicitações</h2>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
          <TabsTrigger value="pesca">Pesca</TabsTrigger>
          <TabsTrigger value="paa">PAA</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex items-center gap-2">
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={filtros.pesquisa || ''}
            onChange={handleSearch}
            className="max-w-xs"
          />
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
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {solicitacoes.map((solicitacao) => (
                <SolicitacaoCard
                  key={solicitacao.id}
                  solicitacao={solicitacao}
                  onVerDetalhes={() => setSelectedSolicitacao(solicitacao)}
                  onChangeStatus={(sol, status) => 
                    handleStatusChange(sol.id, status, sol.tipo)
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
