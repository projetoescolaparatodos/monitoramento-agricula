import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export interface Solicitacao {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  nomePropriedade?: string;
  tamanho?: string;
  servico?: string;
  tipoServico?: string;
  descricao?: string;
  detalhes?: string;
  urgencia: string;
  status: string;
  timestamp: any;
  origem: string;
  tipoOrigem: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  // Campos específicos do PAA
  dapCaf?: string;
  localidade?: string;
  produtos?: string;
  areaMecanizacao?: string;
  interesse?: string;
  quantidadeEstimada?: string;
  observacoes?: string;
  // Campos específicos da agricultura completa
  nomePropriedade?: string;
  situacaoLegal?: string;
  culturas?: any;
  maquinario?: any;
  maodeobra?: any;
  periodoDesejado?: string;
  tipo?: string;
}

// Função de normalização para garantir consistência dos dados
const normalizarSolicitacao = (doc: any, nomeColecao: string): Solicitacao => {
  const data = doc.data();
  
  return {
    id: doc.id,
    
    // Campos obrigatórios normalizados
    nome: data.nome || 'Não informado',
    cpf: data.cpf || 'Não informado',
    status: data.status || 'pendente',
    urgencia: data.urgencia || 'normal',
    timestamp: data.timestamp || new Date(),
    origem: data.origem || 'formulario_web',
    tipoOrigem: nomeColecao,
    
    // Dados pessoais com múltiplas fontes possíveis
    telefone: data.telefone || data.celular || '',
    email: data.email || '',
    endereco: data.endereco || '',
    identidade: data.identidade || data.rg || '',
    emissor: data.emissor || '',
    sexo: data.sexo || '',
    travessao: data.travessao || '',
    
    // Dados da propriedade
    nomePropriedade: data.nomePropriedade || data.nome || '',
    enderecoPropriedade: data.enderecoPropriedade || data.endereco || '',
    tamanho: data.tamanho || data.tamanhoPropriedade || '',
    distanciaMunicipio: data.distanciaMunicipio || '',
    situacaoLegal: data.situacaoLegal || '',
    outraSituacaoLegal: data.outraSituacaoLegal || '',
    
    // Serviços com múltiplas fontes
    servico: data.servico || data.tipoServico || '',
    tipoServico: data.tipoServico || data.servico || '',
    descricao: data.descricao || data.detalhes || data.observacoes || '',
    detalhes: data.detalhes || data.descricao || '',
    periodoDesejado: data.periodoDesejado || '',
    
    // Dados específicos da Agricultura Completa
    culturas: data.culturas || {},
    maquinario: data.maquinario || {},
    maodeobra: data.maodeobra || {},
    tipo: data.tipo || '',
    
    // Dados específicos do PAA
    dapCaf: data.dapCaf || '',
    localidade: data.localidade || '',
    produtos: data.produtos || '',
    areaMecanizacao: data.areaMecanizacao || data.areaMecanization || '',
    interesse: data.interesse || '',
    quantidadeEstimada: data.quantidadeEstimada || '',
    observacoes: data.observacoes || '',
    
    // Localização
    userLocation: data.userLocation || undefined
  };
};

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolicitacoes = async () => {
    setLoading(true);
    setError(null);

    try {
      const colecoes = [
        'solicitacoes_agricultura',
        'solicitacoes_agricultura_completo', 
        'solicitacoes_pesca',
        'solicitacoes_pesca_completo',
        'solicitacoes_paa',
        'solicitacoes_servicos'
      ];

      const todasSolicitacoes: Solicitacao[] = [];

      // Buscar dados de cada coleção com normalização
      for (const nomeColecao of colecoes) {
        try {
          console.log(`Buscando dados da coleção: ${nomeColecao}`);
          const snapshot = await getDocs(collection(db, nomeColecao));

          const docs = snapshot.docs.map(doc => normalizarSolicitacao(doc, nomeColecao));

          console.log(`Encontrados ${docs.length} documentos em ${nomeColecao}:`, docs);
          todasSolicitacoes.push(...docs);
        } catch (err) {
          console.error(`Erro ao buscar ${nomeColecao}:`, err);
        }
      }

      // Ordenar por timestamp mais recente
      todasSolicitacoes.sort((a, b) => {
        const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return timestampB.getTime() - timestampA.getTime();
      });

      console.log(`Total de solicitações carregadas e normalizadas: ${todasSolicitacoes.length}`);
      setSolicitacoes(todasSolicitacoes);
    } catch (err) {
      console.error('Erro geral ao buscar solicitações:', err);
      setError('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const updateSolicitacao = async (id: string, tipoOrigem: string, updates: Partial<Solicitacao>) => {
    try {
      await updateDoc(doc(db, tipoOrigem, id), updates);
      await fetchSolicitacoes(); // Recarregar dados
      return true;
    } catch (err) {
      console.error('Erro ao atualizar solicitação:', err);
      return false;
    }
  };

  const deleteSolicitacao = async (id: string, tipoOrigem: string) => {
    try {
      await deleteDoc(doc(db, tipoOrigem, id));
      await fetchSolicitacoes(); // Recarregar dados
      return true;
    } catch (err) {
      console.error('Erro ao deletar solicitação:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  // Log para debug
  useEffect(() => {
    if (!loading) {
      console.log('Solicitações carregadas:', solicitacoes);
    }
  }, [loading, solicitacoes]);

  return { 
    solicitacoes, 
    loading, 
    error,
    refetch: fetchSolicitacoes,
    updateSolicitacao,
    deleteSolicitacao
  };
}