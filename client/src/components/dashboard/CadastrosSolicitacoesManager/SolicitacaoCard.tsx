import React from 'react';
import { Solicitacao } from './types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SolicitacaoCardProps {
  solicitacao: Solicitacao;
  onOpenDetails: (solicitacao: Solicitacao) => void;
  onUpdateStatus: (solicitacao: Solicitacao) => void;
}

const SolicitacaoCard: React.FC<SolicitacaoCardProps> = ({ 
  solicitacao, 
  onOpenDetails, 
  onUpdateStatus 
}) => {
  // Configuração de cores para cada status
  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800',
    em_andamento: 'bg-blue-100 text-blue-800',
    concluido: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800'
  };

  // Mapeia o tipo para um texto mais amigável
  const tipoLabel = {
    agricultura: 'Agricultura',
    pesca: 'Pesca',
    paa: 'PAA',
    servicos: 'Serviços Gerais'
  }[solicitacao.tipo] || solicitacao.tipo;

  // Verifica se há dadosPessoais
  const temDadosPessoais = solicitacao.dadosPessoais && typeof solicitacao.dadosPessoais === 'object';
  const nome = temDadosPessoais ? solicitacao.dadosPessoais.nome : (solicitacao.nome || 'Nome não disponível');
  const cpf = temDadosPessoais ? solicitacao.dadosPessoais.cpf : (solicitacao.cpf || 'CPF não disponível');

  // Formata a data para exibição
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (err) {
      console.error('Erro ao formatar data:', err);
      return 'Data inválida';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold truncate" title={nome}>
              {nome}
            </h3>
            <p className="text-sm text-gray-500 truncate" title={cpf}>
              CPF: {cpf}
            </p>
          </div>
          <Badge className={statusColors[solicitacao.status as keyof typeof statusColors] || 'bg-gray-100'}>
            {solicitacao.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Tipo:</span>
            <span>{tipoLabel}</span>
          </div>

          {solicitacao.tipoServico && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Serviço:</span>
              <span className="text-right">{solicitacao.tipoServico}</span>
            </div>
          )}

          {/* Verifica se existe servico quando tipoServico não está presente */}
          {!solicitacao.tipoServico && solicitacao.servico && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Serviço:</span>
              <span className="text-right">{solicitacao.servico}</span>
            </div>
          )}

          {solicitacao.dadosPropriedade?.nome && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Propriedade:</span>
              <span className="text-right truncate" title={solicitacao.dadosPropriedade.nome}>
                {solicitacao.dadosPropriedade.nome}
              </span>
            </div>
          )}

          {/* Verifica se existe nomePropriedade quando dadosPropriedade não está presente */}
          {!solicitacao.dadosPropriedade?.nome && solicitacao.nomePropriedade && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Propriedade:</span>
              <span className="text-right truncate" title={solicitacao.nomePropriedade}>
                {solicitacao.nomePropriedade}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="font-medium">Criado:</span>
            <span>{formatDate(solicitacao.criadoEm || solicitacao.timestamp)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={() => onOpenDetails(solicitacao)}
        >
          Detalhes
        </Button>
        <Button 
          variant="default" 
          className="flex-1" 
          onClick={() => onUpdateStatus(solicitacao)}
        >
          Atualizar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SolicitacaoCard;