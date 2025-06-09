import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase,
  AlertTriangle,
  FileText,
  Home,
  Tractor,
  Users,
  X,
  Download
} from 'lucide-react';
import { Solicitacao } from './types';
import { generatePDF } from './generatePdf';

interface SolicitacaoModalProps {
  solicitacao: Solicitacao;
  isOpen: boolean;
  onClose: () => void;
  onAtualizarStatus: (id: string, tipoOrigem: string, novoStatus: string) => void;
  onExcluir: (id: string, tipoOrigem: string) => void;
}

export function SolicitacaoModal({ 
  solicitacao, 
  isOpen, 
  onClose, 
  onAtualizarStatus, 
  onExcluir 
}: SolicitacaoModalProps) {

  const handleGerarPdf = () => {
    try {
      generatePDF(solicitacao);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
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

  const renderDadosPessoais = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <p className="text-sm text-gray-900">{solicitacao.nome}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">CPF</label>
            <p className="text-sm text-gray-900">{solicitacao.cpf}</p>
          </div>
          {solicitacao.telefone && (
            <div>
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <p className="text-sm text-gray-900 flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {solicitacao.telefone}
              </p>
            </div>
          )}
          {solicitacao.email && (
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {solicitacao.email}
              </p>
            </div>
          )}
          {solicitacao.identidade && (
            <div>
              <label className="text-sm font-medium text-gray-700">Identidade</label>
              <p className="text-sm text-gray-900">{solicitacao.identidade}</p>
            </div>
          )}
          {solicitacao.endereco && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Endereço</label>
              <p className="text-sm text-gray-900 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {solicitacao.endereco}
              </p>
            </div>
          )}
          {solicitacao.travessao && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Travessão</label>
              <p className="text-sm text-gray-900 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {solicitacao.travessao}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDadosPropriedade = () => {
    if (!solicitacao.nomePropriedade && !solicitacao.tamanho && !solicitacao.enderecoPropriedade) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Dados da Propriedade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solicitacao.nomePropriedade && (
              <div>
                <label className="text-sm font-medium text-gray-700">Nome da Propriedade</label>
                <p className="text-sm text-gray-900">{solicitacao.nomePropriedade}</p>
              </div>
            )}
            {solicitacao.tamanho && (
              <div>
                <label className="text-sm font-medium text-gray-700">Tamanho</label>
                <p className="text-sm text-gray-900">{solicitacao.tamanho} hectares</p>
              </div>
            )}
            {solicitacao.enderecoPropriedade && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Endereço da Propriedade</label>
                <p className="text-sm text-gray-900">{solicitacao.enderecoPropriedade}</p>
              </div>
            )}
            {solicitacao.situacaoLegal && (
              <div>
                <label className="text-sm font-medium text-gray-700">Situação Legal</label>
                <p className="text-sm text-gray-900">{solicitacao.situacaoLegal}</p>
              </div>
            )}
            {solicitacao.distanciaMunicipio && (
              <div>
                <label className="text-sm font-medium text-gray-700">Distância do Município</label>
                <p className="text-sm text-gray-900">{solicitacao.distanciaMunicipio} km</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDadosServico = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Serviço Solicitado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(solicitacao.servico || solicitacao.tipoServico) && (
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de Serviço</label>
              <p className="text-sm text-gray-900">{solicitacao.servico || solicitacao.tipoServico}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Urgência</label>
            <Badge className={getUrgenciaColor(solicitacao.urgencia)}>
              {solicitacao.urgencia === 'urgente' && <AlertTriangle className="h-3 w-3 mr-1" />}
              <span className="capitalize">{solicitacao.urgencia}</span>
            </Badge>
          </div>
          {solicitacao.periodoDesejado && (
            <div>
              <label className="text-sm font-medium text-gray-700">Período Desejado</label>
              <p className="text-sm text-gray-900">{solicitacao.periodoDesejado}</p>
            </div>
          )}
        </div>

        {(solicitacao.descricao || solicitacao.detalhes) && (
          <div>
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {solicitacao.descricao || solicitacao.detalhes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDadosEspecificos = () => {
    // Dados específicos do PAA
    if (solicitacao.tipoOrigem === 'solicitacoes_paa') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados do PAA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solicitacao.dapCaf && (
                <div>
                  <label className="text-sm font-medium text-gray-700">DAP/CAF</label>
                  <p className="text-sm text-gray-900">{solicitacao.dapCaf}</p>
                </div>
              )}
              {solicitacao.localidade && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Localidade</label>
                  <p className="text-sm text-gray-900">{solicitacao.localidade}</p>
                </div>
              )}
              {solicitacao.produtos && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Produtos</label>
                  <p className="text-sm text-gray-900">{solicitacao.produtos}</p>
                </div>
              )}
              {solicitacao.interesse && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Interesse no PAA</label>
                  <p className="text-sm text-gray-900">{solicitacao.interesse}</p>
                </div>
              )}
              {solicitacao.quantidadeEstimada && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Quantidade Estimada</label>
                  <p className="text-sm text-gray-900">{solicitacao.quantidadeEstimada}</p>
                </div>
              )}
            </div>
            {solicitacao.observacoes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {solicitacao.observacoes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Dados crus para inspeção e relatórios
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Dados Técnicos (Inspeção)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-xs overflow-auto max-h-60">
            {JSON.stringify(solicitacao.raw, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>

    {/* Dados específicos da agricultura completa */}
    if (solicitacao.tipo === 'agricultura_completo') {
      return (
        <div className="space-y-4">
          {/* Culturas */}
          {solicitacao.culturas && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Culturas Produzidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(solicitacao.culturas).map(([key, cultura]) => {
                    if (cultura?.selecionado) {
                      return (
                        <div key={key} className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-medium text-green-800 capitalize">{key}</h4>
                          {cultura.area && <p className="text-sm text-green-700">Área: {cultura.area} ha</p>}
                          {cultura.producao && <p className="text-sm text-green-700">Produção: {cultura.producao} kg/ano</p>}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maquinário */}
          {solicitacao.maquinario && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tractor className="h-5 w-5" />
                  Maquinário Disponível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(solicitacao.maquinario).map(([key, value]) => {
                    if (value) {
                      return (
                        <Badge key={key} variant="secondary" className="capitalize">
                          {key.replace('_', ' ')}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mão de obra */}
          {solicitacao.maodeobra && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mão de Obra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(solicitacao.maodeobra).map(([key, mao]) => {
                    if (mao?.selecionado) {
                      return (
                        <div key={key} className="flex justify-between items-center bg-blue-50 p-2 rounded">
                          <span className="capitalize font-medium">{key.replace('_', ' ')}</span>
                          {mao.quantidade && <span className="text-blue-700">{mao.quantidade} pessoas</span>}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    return null;
  };

  const renderLocalizacao = () => {
    if (!solicitacao.userLocation) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Coordenadas GPS</p>
            <p className="text-sm text-blue-700">
              Latitude: {solicitacao.userLocation.latitude.toFixed(6)}
            </p>
            <p className="text-sm text-blue-700">
              Longitude: {solicitacao.userLocation.longitude.toFixed(6)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">
                Detalhes da Solicitação - {solicitacao.nome}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(solicitacao.status)}>
                  <span className="capitalize">{solicitacao.status.replace('_', ' ')}</span>
                </Badge>
                <Badge variant="outline">
                  {solicitacao.tipoOrigem.replace('solicitacoes_', '').replace('_', ' ')}
                </Badge>
                <span className="text-sm text-gray-500">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {formatTimestamp(solicitacao.timestamp)}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {renderDadosPessoais()}
          {renderDadosPropriedade()}
          {renderDadosServico()}
          {renderDadosEspecificos()}
          {renderLocalizacao()}
        </div>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={handleGerarPdf}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Gerar PDF
          </Button>

          <div className="flex gap-2">
            {solicitacao.status === 'pendente' && (
              <Button 
                onClick={() => {
                  onAtualizarStatus(solicitacao.id, solicitacao.tipoOrigem, 'em_andamento');
                  onClose();
                }}
              >
                Iniciar Atendimento
              </Button>
            )}

            {solicitacao.status === 'em_andamento' && (
              <Button 
                onClick={() => {
                  onAtualizarStatus(solicitacao.id, solicitacao.tipoOrigem, 'concluido');
                  onClose();
                }}
              >
                Marcar como Concluído
              </Button>
            )}

            <Button 
              variant="destructive"
              onClick={() => {
                onExcluir(solicitacao.id, solicitacao.tipoOrigem);
                onClose();
              }}
            >
              Excluir Solicitação
            </Button>

            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}