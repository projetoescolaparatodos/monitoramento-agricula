
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Briefcase,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { Solicitacao } from './types';

interface SolicitacaoCardProps {
  solicitacao: Solicitacao;
  onVisualizarDetalhes: () => void;
  onAtualizarStatus: (id: string, tipoOrigem: string, novoStatus: string) => void;
  onExcluir: (id: string, tipoOrigem: string) => void;
}

export function SolicitacaoCard({ 
  solicitacao, 
  onVisualizarDetalhes, 
  onAtualizarStatus, 
  onExcluir 
}: SolicitacaoCardProps) {
  
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

  const getTipoOrigemLabel = (tipo: string) => {
    switch (tipo) {
      case 'agricultura_completo': return 'Agricultura Completa';
      case 'agricultura': return 'Agricultura';
      case 'pesca_completo': return 'Pesca Completa';
      case 'pesca': return 'Pesca';
      case 'paa': return 'PAA';
      case 'servicos': return 'Serviços';
      default: return tipo;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="h-4 w-4" />;
      case 'em_andamento': return <PlayCircle className="h-4 w-4" />;
      case 'concluido': return <CheckCircle className="h-4 w-4" />;
      case 'cancelado': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
            <span>{getTipoOrigemLabel(solicitacao.tipo)}</span>
          </div>
          
          {solicitacao.tipoServico && solicitacao.tipoServico !== 'Não informado' && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Serviço:</span>
              <span>{solicitacao.tipoServico}</span>
            </div>
          )}
          
          {solicitacao.enderecoPropriedade && solicitacao.enderecoPropriedade !== 'Não informado' && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Propriedade:</span>
              <span className="truncate">{solicitacao.enderecoPropriedade}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Data:</span>
            <span>{formatTimestamp(solicitacao.timestamp)}</span>
          </div>
        </div>

        {/* Descrição resumida */}
        {(solicitacao.descricao || solicitacao.detalhes) && (
          <div className="text-sm">
            <span className="font-medium text-gray-700">Descrição:</span>
            <p className="text-gray-600 line-clamp-2 mt-1">
              {solicitacao.descricao || solicitacao.detalhes}
            </p>
          </div>
        )}

        {/* Dados específicos por tipo */}
        {solicitacao.tipo === 'paa' && (
          <div className="text-sm bg-amber-50 p-3 rounded-lg">
            <span className="font-medium text-amber-800">PAA:</span>
            {solicitacao.interesse && solicitacao.interesse !== 'Não informado' && (
              <p className="text-amber-700">Interesse: {solicitacao.interesse}</p>
            )}
            {solicitacao.localidade && (
              <p className="text-amber-700">Localidade: {solicitacao.localidade}</p>
            )}
            {solicitacao.produtos && (
              <p className="text-amber-700">Produtos: {solicitacao.produtos}</p>
            )}
          </div>
        )}

        {solicitacao.tipo === 'agricultura_completo' && solicitacao.culturas && (
          <div className="text-sm bg-green-50 p-3 rounded-lg">
            <span className="font-medium text-green-800">Agricultura:</span>
            {Object.entries(solicitacao.culturas).some(([_, cultura]) => cultura?.selecionado) && (
              <p className="text-green-700">
                Culturas: {Object.entries(solicitacao.culturas)
                  .filter(([_, cultura]) => cultura?.selecionado)
                  .map(([nome]) => nome)
                  .join(', ')}
              </p>
            )}
          </div>
        )}

        {solicitacao.tipo.includes('pesca') && (
          <div className="text-sm bg-blue-50 p-3 rounded-lg">
            <span className="font-medium text-blue-800">Pesca:</span>
            {solicitacao.tipoServico && (
              <p className="text-blue-700">Tipo: {solicitacao.tipoServico}</p>
            )}
          </div>
        )}

        {/* Localização */}
        {solicitacao.userLocation && (
          <div className="text-sm bg-blue-50 p-2 rounded">
            <span className="font-medium text-blue-800">Localização disponível</span>
            <p className="text-blue-600 text-xs">
              Lat: {solicitacao.userLocation.latitude.toFixed(6)}, 
              Lng: {solicitacao.userLocation.longitude.toFixed(6)}
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onVisualizarDetalhes}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
          </div>
          
          <div className="flex gap-1">
            {solicitacao.status === 'pendente' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAtualizarStatus(solicitacao.id, solicitacao.tipoOrigem, 'em_andamento')}
              >
                Iniciar
              </Button>
            )}
            
            {solicitacao.status === 'em_andamento' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAtualizarStatus(solicitacao.id, solicitacao.tipoOrigem, 'concluido')}
              >
                Concluir
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExcluir(solicitacao.id, solicitacao.tipoOrigem)}
              className="text-red-600 hover:text-red-700"
            >
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
