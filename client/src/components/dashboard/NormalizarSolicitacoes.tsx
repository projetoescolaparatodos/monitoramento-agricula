
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Search, 
  Edit2, 
  Save, 
  X,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useSolicitacoes } from './CadastrosSolicitacoesManager/useSolicitacoes';
import { Solicitacao } from './CadastrosSolicitacoesManager/types';
import { useToast } from '@/hooks/use-toast';

interface CamposEditaveis {
  travessao: string;
  localidade: string;
  nomePropriedade: string;
  enderecoPropriedade: string;
  servico: string;
  tipoServico: string;
}

const NormalizarSolicitacoes = () => {
  const { solicitacoes, loading, error, refetch, updateSolicitacao } = useSolicitacoes();
  const { toast } = useToast();
  
  const [busca, setBusca] = useState('');
  const [solicitacaoEmEdicao, setSolicitacaoEmEdicao] = useState<string | null>(null);
  const [camposEditados, setCamposEditados] = useState<CamposEditaveis>({
    travessao: '',
    localidade: '',
    nomePropriedade: '',
    enderecoPropriedade: '',
    servico: '',
    tipoServico: ''
  });
  const [salvando, setSalvando] = useState(false);

  // Filtrar solicitações pela busca
  const solicitacoesFiltradas = useMemo(() => {
    if (!busca) return solicitacoes;

    const termoBusca = busca.toLowerCase();
    return solicitacoes.filter(s => 
      s.nome?.toLowerCase().includes(termoBusca) ||
      s.cpf?.includes(termoBusca) ||
      s.travessao?.toLowerCase().includes(termoBusca) ||
      s.localidade?.toLowerCase().includes(termoBusca) ||
      s.nomePropriedade?.toLowerCase().includes(termoBusca) ||
      s.enderecoPropriedade?.toLowerCase().includes(termoBusca)
    );
  }, [solicitacoes, busca]);

  // Agrupar por campo para mostrar estatísticas
  const estatisticasCampos = useMemo(() => {
    const travessoes = new Set<string>();
    const localidades = new Set<string>();
    const propriedades = new Set<string>();
    const servicos = new Set<string>();

    solicitacoes.forEach(s => {
      if (s.travessao) travessoes.add(s.travessao);
      if (s.localidade) localidades.add(s.localidade);
      if (s.nomePropriedade) propriedades.add(s.nomePropriedade);
      if (s.servico) servicos.add(s.servico);
    });

    return {
      travessoes: Array.from(travessoes).sort(),
      localidades: Array.from(localidades).sort(),
      propriedades: Array.from(propriedades).sort(),
      servicos: Array.from(servicos).sort()
    };
  }, [solicitacoes]);

  const handleIniciarEdicao = (solicitacao: Solicitacao) => {
    setSolicitacaoEmEdicao(solicitacao.id);
    setCamposEditados({
      travessao: solicitacao.travessao || '',
      localidade: solicitacao.localidade || '',
      nomePropriedade: solicitacao.nomePropriedade || '',
      enderecoPropriedade: solicitacao.enderecoPropriedade || '',
      servico: solicitacao.servico || '',
      tipoServico: solicitacao.tipoServico || ''
    });
  };

  const handleCancelar = () => {
    setSolicitacaoEmEdicao(null);
    setCamposEditados({
      travessao: '',
      localidade: '',
      nomePropriedade: '',
      enderecoPropriedade: '',
      servico: '',
      tipoServico: ''
    });
  };

  const handleSalvar = async (solicitacao: Solicitacao) => {
    setSalvando(true);
    try {
      const sucesso = await updateSolicitacao(
        solicitacao.id,
        solicitacao.tipoOrigem,
        camposEditados
      );

      if (sucesso) {
        toast({
          title: 'Sucesso',
          description: 'Dados normalizados com sucesso!',
        });
        handleCancelar();
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar as alterações.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSalvando(false);
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
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Normalizar Dados de Solicitações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Esta ferramenta permite editar campos específicos das solicitações para normalizar dados que foram digitados incorretamente.
              <br />
              <strong>Campos editáveis:</strong> Travessão, Localidade, Nome da Propriedade, Endereço da Propriedade, Serviço.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Estatísticas de valores únicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{estatisticasCampos.travessoes.length}</div>
            <p className="text-sm text-gray-600">Travessões únicos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{estatisticasCampos.localidades.length}</div>
            <p className="text-sm text-gray-600">Localidades únicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{estatisticasCampos.propriedades.length}</div>
            <p className="text-sm text-gray-600">Propriedades únicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{estatisticasCampos.servicos.length}</div>
            <p className="text-sm text-gray-600">Serviços únicos</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CPF, travessão, localidade ou propriedade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>
            Solicitações ({solicitacoesFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {solicitacoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma solicitação encontrada com os filtros aplicados.
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoesFiltradas.map((solicitacao) => (
                <Card key={`${solicitacao.tipoOrigem}-${solicitacao.id}`} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    {solicitacaoEmEdicao === solicitacao.id ? (
                      // Modo de edição
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{solicitacao.nome}</h3>
                            <p className="text-sm text-gray-600">CPF: {solicitacao.cpf}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSalvar(solicitacao)}
                              disabled={salvando}
                            >
                              {salvando ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Save className="h-4 w-4 mr-1" />
                              )}
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelar}
                              disabled={salvando}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`travessao-${solicitacao.id}`}>Travessão</Label>
                            <Input
                              id={`travessao-${solicitacao.id}`}
                              value={camposEditados.travessao}
                              onChange={(e) => setCamposEditados({ ...camposEditados, travessao: e.target.value })}
                              placeholder="Digite o travessão"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`localidade-${solicitacao.id}`}>Localidade</Label>
                            <Input
                              id={`localidade-${solicitacao.id}`}
                              value={camposEditados.localidade}
                              onChange={(e) => setCamposEditados({ ...camposEditados, localidade: e.target.value })}
                              placeholder="Digite a localidade"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`propriedade-${solicitacao.id}`}>Nome da Propriedade</Label>
                            <Input
                              id={`propriedade-${solicitacao.id}`}
                              value={camposEditados.nomePropriedade}
                              onChange={(e) => setCamposEditados({ ...camposEditados, nomePropriedade: e.target.value })}
                              placeholder="Digite o nome da propriedade"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`endereco-${solicitacao.id}`}>Endereço da Propriedade</Label>
                            <Input
                              id={`endereco-${solicitacao.id}`}
                              value={camposEditados.enderecoPropriedade}
                              onChange={(e) => setCamposEditados({ ...camposEditados, enderecoPropriedade: e.target.value })}
                              placeholder="Digite o endereço"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`servico-${solicitacao.id}`}>Serviço</Label>
                            <Input
                              id={`servico-${solicitacao.id}`}
                              value={camposEditados.servico}
                              onChange={(e) => setCamposEditados({ ...camposEditados, servico: e.target.value })}
                              placeholder="Digite o serviço"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`tipo-servico-${solicitacao.id}`}>Tipo de Serviço</Label>
                            <Input
                              id={`tipo-servico-${solicitacao.id}`}
                              value={camposEditados.tipoServico}
                              onChange={(e) => setCamposEditados({ ...camposEditados, tipoServico: e.target.value })}
                              placeholder="Digite o tipo de serviço"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Modo de visualização
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{solicitacao.nome}</h3>
                            <p className="text-sm text-gray-600">CPF: {solicitacao.cpf}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleIniciarEdicao(solicitacao)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar Campos
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Travessão:</span>
                            <span className="ml-2">{solicitacao.travessao || <em className="text-gray-400">Não informado</em>}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Localidade:</span>
                            <span className="ml-2">{solicitacao.localidade || <em className="text-gray-400">Não informado</em>}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Propriedade:</span>
                            <span className="ml-2">{solicitacao.nomePropriedade || <em className="text-gray-400">Não informado</em>}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Endereço Propriedade:</span>
                            <span className="ml-2">{solicitacao.enderecoPropriedade || <em className="text-gray-400">Não informado</em>}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Serviço:</span>
                            <span className="ml-2">{solicitacao.servico || <em className="text-gray-400">Não informado</em>}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Tipo Serviço:</span>
                            <span className="ml-2">{solicitacao.tipoServico || <em className="text-gray-400">Não informado</em>}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NormalizarSolicitacoes;
