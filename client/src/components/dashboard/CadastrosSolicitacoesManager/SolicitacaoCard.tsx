import React from 'react';
import { Solicitacao } from './types';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface SolicitacaoCardProps {
  solicitacao: Solicitacao;
  onVerDetalhes: () => void;
  onChangeStatus: (solicitacao: Solicitacao, novoStatus: string) => void;
}

const SolicitacaoCard: React.FC<SolicitacaoCardProps> = ({ 
  solicitacao, 
  onVerDetalhes,
  onChangeStatus 
}) => {
  // Função para formatar data (timestamp do Firebase ou string)
  const formatarData = (data: any) => {
    if (!data) return 'Data não disponível';

    try {
      // Verificar se é um timestamp do Firebase (tem método toDate)
      if (data && typeof data.toDate === 'function') {
        return data.toDate().toLocaleDateString('pt-BR');
      } 
      // Verificar se é um objeto Date
      else if (data instanceof Date) {
        return data.toLocaleDateString('pt-BR');
      }
      // Verificar se é uma string ISO ou timestamp em milissegundos
      else if (typeof data === 'string' || typeof data === 'number') {
        return new Date(data).toLocaleDateString('pt-BR');
      }
      // Se for um objeto com seconds (formato alternativo do Firestore)
      else if (data && data.seconds) {
        return new Date(data.seconds * 1000).toLocaleDateString('pt-BR');
      }
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Tipo:', typeof data, 'Valor:', data);
      return 'Data inválida';
    }
  };

  // Definir cor do badge baseado no status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatar status para exibição
  const formatarStatus = (status: string) => {
    switch(status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  // Acessar os dados de maneira segura
  const getNome = () => {
    try {
      return solicitacao.dadosPessoais?.nome || 
             solicitacao.nome || 
             solicitacao.nomeCompleto || 
             'Nome não disponível';
    } catch (error) {
      console.error('Erro ao obter nome:', error);
      return 'Nome não disponível';
    }
  };

  const getCpf = () => {
    try {
      return solicitacao.dadosPessoais?.cpf || 
             solicitacao.cpf || 
             solicitacao.documento || 
             'Não informado';
    } catch (error) {
      console.error('Erro ao obter CPF:', error);
      return 'Não informado';
    }
  };

  const getTipoServico = () => {
    try {
      return solicitacao.tipoServico || 
             solicitacao.servico || 
             (solicitacao.tipo === 'servicos' ? 'Serviço municipal' : null);
    } catch (error) {
      console.error('Erro ao obter tipo de serviço:', error);
      return null;
    }
  };

  const getNomePropriedade = () => {
    try {
      return solicitacao.dadosPropriedade?.nome || 
             solicitacao.nomePropriedade || 
             solicitacao.propriedade?.nome;
    } catch (error) {
      console.error('Erro ao obter nome da propriedade:', error);
      return null;
    }
  };

  const getTipoFormatado = () => {
    switch(solicitacao.tipo) {
      case 'agricultura': return 'Agricultura';
      case 'pesca': return 'Pesca';
      case 'paa': return 'PAA';
      case 'servicos': return 'Serviços';
      default: return 'Outro';
    }
  };

  console.log('Renderizando solicitação:', solicitacao.id, 'Nome:', getNome(), 'Tipo:', solicitacao.tipo);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">
          {getNome()}
        </CardTitle>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={getStatusColor(solicitacao.status)}>
            {formatarStatus(solicitacao.status)}
          </Badge>
          <Badge variant="outline">
            {getTipoFormatado()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">CPF:</span>{' '}
            {getCpf()}
          </div>

          {getTipoServico() && (
            <div>
              <span className="font-semibold">Serviço:</span>{' '}
              {getTipoServico()}
            </div>
          )}

          {getNomePropriedade() && (
            <div>
              <span className="font-semibold">Propriedade:</span>{' '}
              {getNomePropriedade()}
            </div>
          )}

          <div>
            <span className="font-semibold">Criado em:</span>{' '}
            {formatarData(solicitacao.criadoEm)}
          </div>

          <div className="text-xs text-gray-500 mt-1">
            ID: {solicitacao.id.substring(0, 8)}...
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2 justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onVerDetalhes}
        >
          Ver Detalhes
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => {
            // Próximo status baseado no atual
            let proximoStatus = '';
            switch(solicitacao.status) {
              case 'pendente': 
                proximoStatus = 'em_andamento'; 
                break;
              case 'em_andamento': 
                proximoStatus = 'concluido'; 
                break;
              default: 
                proximoStatus = 'pendente';
            }
            onChangeStatus(solicitacao, proximoStatus);
          }}
        >
          {solicitacao.status === 'pendente' ? 'Iniciar' : 
           solicitacao.status === 'em_andamento' ? 'Concluir' : 
           'Reabrir'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SolicitacaoCard;