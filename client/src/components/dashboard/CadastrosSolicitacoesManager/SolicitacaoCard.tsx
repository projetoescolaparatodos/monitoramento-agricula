
import React from 'react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Solicitacao } from './types';

interface SolicitacaoCardProps {
  solicitacao: Solicitacao;
  onVerDetalhes: (solicitacao: Solicitacao) => void;
  onChangeStatus: (solicitacao: Solicitacao, novoStatus: string) => void;
}

// Mapear status para badges coloridas
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pendente':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    case 'em_andamento':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Em andamento</Badge>;
    case 'concluido':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
    case 'cancelado':
      return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

// Mapear tipo para badges coloridas
const getTipoBadge = (tipo: string) => {
  switch (tipo) {
    case 'agricultura':
      return <Badge variant="outline" className="bg-green-50 text-green-700">Agricultura</Badge>;
    case 'pesca':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Pesca</Badge>;
    case 'paa':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700">PAA</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
  }
};

const SolicitacaoCard: React.FC<SolicitacaoCardProps> = ({ 
  solicitacao, 
  onVerDetalhes, 
  onChangeStatus 
}) => {
  const formatarData = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';
    
    try {
      // Tratar tanto Timestamp do Firebase quanto string ISO
      const data = typeof timestamp === 'string' 
        ? new Date(timestamp) 
        : timestamp.toDate ? timestamp.toDate() : new Date();
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(data);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  // Para evitar nomes muito longos
  const nomeCurto = solicitacao.dadosPessoais?.nome 
    ? solicitacao.dadosPessoais.nome.length > 25 
      ? `${solicitacao.dadosPessoais.nome.substring(0, 25)}...` 
      : solicitacao.dadosPessoais.nome
    : 'Nome não disponível';

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {getStatusBadge(solicitacao.status)}
          {getTipoBadge(solicitacao.tipo)}
        </div>
        <CardTitle className="text-lg">{nomeCurto}</CardTitle>
        <div className="text-sm text-gray-500">
          CPF: {solicitacao.dadosPessoais?.cpf || 'Não informado'}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Data:</span>
            <span>{formatarData(solicitacao.criadoEm)}</span>
          </div>
          {solicitacao.tipoServico && (
            <div className="flex justify-between">
              <span className="font-medium">Serviço:</span>
              <span>{solicitacao.tipoServico}</span>
            </div>
          )}
          {solicitacao.urgencia && (
            <div className="flex justify-between">
              <span className="font-medium">Urgência:</span>
              <span>{solicitacao.urgencia}</span>
            </div>
          )}
          {solicitacao.dadosPropriedade?.endereco && (
            <div>
              <span className="font-medium">Endereço:</span>
              <p className="text-xs mt-1">{solicitacao.dadosPropriedade.endereco}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-col gap-2">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => onVerDetalhes(solicitacao)}
        >
          Ver Detalhes
        </Button>
        
        <div className="w-full flex gap-2 mt-1">
          {solicitacao.status !== 'pendente' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onChangeStatus(solicitacao, 'pendente')}
            >
              Pendente
            </Button>
          )}
          
          {solicitacao.status !== 'em_andamento' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onChangeStatus(solicitacao, 'em_andamento')}
            >
              Em andamento
            </Button>
          )}
          
          {solicitacao.status !== 'concluido' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => onChangeStatus(solicitacao, 'concluido')}
            >
              Concluído
            </Button>
          )}
          
          {solicitacao.status !== 'cancelado' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 text-xs text-red-500 hover:text-red-700"
              onClick={() => onChangeStatus(solicitacao, 'cancelado')}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SolicitacaoCard;
