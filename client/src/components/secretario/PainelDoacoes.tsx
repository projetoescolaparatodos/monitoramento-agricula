
import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  getDocs,
  where 
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Info, 
  Gift, 
  Users, 
  Package, 
  Calendar,
  Eye,
  Download,
  Search,
  Filter
} from 'lucide-react';

interface Doacao {
  id: string;
  eventoId: string;
  insumoId: string;
  quantidade: number;
  tecnico: {
    id: string;
    nome: string;
  };
  beneficiario: {
    nome: string;
    cpf?: string;
    propriedade?: string;
  };
  timestamp: any;
  observacoes?: string;
}

interface Evento {
  id: string;
  nome: string;
}

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
}

interface DoacaoDetalhesModalProps {
  doacao: Doacao | null;
  evento: Evento | null;
  insumo: Insumo | null;
  isOpen: boolean;
  onClose: () => void;
}

const DoacaoDetalhesModal: React.FC<DoacaoDetalhesModalProps> = ({
  doacao,
  evento,
  insumo,
  isOpen,
  onClose
}) => {
  if (!isOpen || !doacao) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="h-6 w-6 text-green-600" />
              Detalhes da Doação
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* Informações do Evento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 font-medium">
                  {evento?.nome || 'Evento não encontrado'}
                </p>
                <p className="text-sm text-gray-500">
                  Data: {doacao.timestamp?.toDate().toLocaleDateString('pt-BR')} às {doacao.timestamp?.toDate().toLocaleTimeString('pt-BR')}
                </p>
              </CardContent>
            </Card>

            {/* Informações do Insumo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Insumo Doado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 font-medium">
                  {insumo?.nome || 'Insumo não encontrado'}
                </p>
                <p className="text-sm text-gray-500">
                  Quantidade: {doacao.quantidade} {insumo?.unidade || ''}
                </p>
              </CardContent>
            </Card>

            {/* Informações do Beneficiário */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Beneficiário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">{doacao.beneficiario.nome}</p>
                  {doacao.beneficiario.cpf && (
                    <p className="text-sm text-gray-600">
                      <strong>CPF:</strong> {doacao.beneficiario.cpf}
                    </p>
                  )}
                  {doacao.beneficiario.propriedade && (
                    <p className="text-sm text-gray-600">
                      <strong>Propriedade:</strong> {doacao.beneficiario.propriedade}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações do Técnico */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Técnico Responsável</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 font-medium">{doacao.tecnico.nome}</p>
                <p className="text-sm text-gray-500">ID: {doacao.tecnico.id}</p>
              </CardContent>
            </Card>

            {/* Observações */}
            {doacao.observacoes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{doacao.observacoes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Botão Fechar */}
          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoacaoCardReadOnly: React.FC<{
  doacao: Doacao;
  evento: Evento | null;
  insumo: Insumo | null;
  onVisualizarDetalhes: () => void;
}> = ({ doacao, evento, insumo, onVisualizarDetalhes }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-green-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {evento?.nome || 'Evento não encontrado'}
                </h3>
                <p className="text-sm text-gray-500">
                  {doacao.timestamp?.toDate().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Insumo</p>
                <p className="text-gray-900">{insumo?.nome || 'N/A'}</p>
                <p className="text-sm text-gray-500">
                  {doacao.quantidade} {insumo?.unidade || ''}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Beneficiário</p>
                <p className="text-gray-900">{doacao.beneficiario.nome}</p>
                {doacao.beneficiario.propriedade && (
                  <p className="text-sm text-gray-500">{doacao.beneficiario.propriedade}</p>
                )}
              </div>
            </div>

            {/* Técnico */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <strong>Técnico:</strong> {doacao.tecnico.nome}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onVisualizarDetalhes}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PainelDoacoes: React.FC = () => {
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filtroEvento, setFiltroEvento] = useState('');
  const [filtroInsumo, setFiltroInsumo] = useState('');
  const [filtroBeneficiario, setFiltroBeneficiario] = useState('');
  
  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [doacaoSelecionada, setDoacaoSelecionada] = useState<Doacao | null>(null);

  // Carregar dados do Firebase
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar eventos
        const eventosSnapshot = await getDocs(collection(db, 'eventos'));
        const eventosData = eventosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Evento[];
        setEventos(eventosData);

        // Carregar insumos
        const insumosSnapshot = await getDocs(collection(db, 'insumos'));
        const insumosData = insumosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Insumo[];
        setInsumos(insumosData);

        // Configurar listener para doações
        const doacoesQuery = query(
          collection(db, 'doacoes_evento'),
          orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(doacoesQuery, (snapshot) => {
          const doacoesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Doacao[];
          setDoacoes(doacoesData);
          setLoading(false);
        }, (error) => {
          console.error('Erro ao carregar doações:', error);
          setError('Erro ao carregar doações. Tente novamente.');
          setLoading(false);
        });

        return () => unsubscribe();

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Tente novamente.');
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Filtrar doações
  const doacoesFiltradas = doacoes.filter(doacao => {
    const evento = eventos.find(e => e.id === doacao.eventoId);
    const insumo = insumos.find(i => i.id === doacao.insumoId);

    return (
      (!filtroEvento || evento?.nome.toLowerCase().includes(filtroEvento.toLowerCase())) &&
      (!filtroInsumo || insumo?.nome.toLowerCase().includes(filtroInsumo.toLowerCase())) &&
      (!filtroBeneficiario || doacao.beneficiario.nome.toLowerCase().includes(filtroBeneficiario.toLowerCase()))
    );
  });

  // Abrir modal de detalhes
  const handleAbrirModal = (doacao: Doacao) => {
    setDoacaoSelecionada(doacao);
    setModalAberto(true);
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const headers = ['Data', 'Evento', 'Insumo', 'Quantidade', 'Beneficiário', 'CPF', 'Propriedade', 'Técnico'];
    
    const csvData = doacoesFiltradas.map(doacao => {
      const evento = eventos.find(e => e.id === doacao.eventoId);
      const insumo = insumos.find(i => i.id === doacao.insumoId);
      
      return [
        doacao.timestamp?.toDate().toLocaleDateString('pt-BR') || '',
        evento?.nome || '',
        `${insumo?.nome || ''} (${insumo?.unidade || ''})`,
        doacao.quantidade,
        doacao.beneficiario.nome,
        doacao.beneficiario.cpf || '',
        doacao.beneficiario.propriedade || '',
        doacao.tecnico.nome
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `doacoes_secretario_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Estatísticas
  const totalDoacoes = doacoesFiltradas.length;
  const totalBeneficiarios = new Set(doacoesFiltradas.map(d => d.beneficiario.nome)).size;
  const totalQuantidade = doacoesFiltradas.reduce((sum, d) => sum + d.quantidade, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <Info className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
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
          Este painel exibe os registros de doações realizadas durante os eventos da SEMAPA.
          <br />
          <strong>Modo apenas leitura:</strong> Visualização das doações sem possibilidade de edição ou exclusão.
        </AlertDescription>
      </Alert>

      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Doações</p>
                <p className="text-2xl font-bold text-gray-900">{totalDoacoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Beneficiários Únicos</p>
                <p className="text-2xl font-bold text-gray-900">{totalBeneficiarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Itens Distribuídos</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuantidade.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Exportação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filtrar por Evento</label>
              <select
                value={filtroEvento}
                onChange={(e) => setFiltroEvento(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos os eventos</option>
                {eventos.map((evento) => (
                  <option key={evento.id} value={evento.nome}>
                    {evento.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filtrar por Insumo</label>
              <select
                value={filtroInsumo}
                onChange={(e) => setFiltroInsumo(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Todos os insumos</option>
                {insumos.map((insumo) => (
                  <option key={insumo.id} value={insumo.nome}>
                    {insumo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filtrar por Beneficiário</label>
              <input
                type="text"
                value={filtroBeneficiario}
                onChange={(e) => setFiltroBeneficiario(e.target.value)}
                placeholder="Nome do beneficiário..."
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={exportarCSV} className="flex items-center gap-2 w-full">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Mostrando {doacoesFiltradas.length} de {doacoes.length} doações
          </div>
        </CardContent>
      </Card>

      {/* Lista de Doações */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Doações</CardTitle>
        </CardHeader>
        <CardContent>
          {doacoesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhuma doação encontrada com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {doacoesFiltradas.map((doacao) => (
                <DoacaoCardReadOnly
                  key={doacao.id}
                  doacao={doacao}
                  evento={eventos.find(e => e.id === doacao.eventoId) || null}
                  insumo={insumos.find(i => i.id === doacao.insumoId) || null}
                  onVisualizarDetalhes={() => handleAbrirModal(doacao)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <DoacaoDetalhesModal
        doacao={doacaoSelecionada}
        evento={doacaoSelecionada ? eventos.find(e => e.id === doacaoSelecionada.eventoId) || null : null}
        insumo={doacaoSelecionada ? insumos.find(i => i.id === doacaoSelecionada.insumoId) || null : null}
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setDoacaoSelecionada(null);
        }}
      />
    </div>
  );
};

export default PainelDoacoes;
