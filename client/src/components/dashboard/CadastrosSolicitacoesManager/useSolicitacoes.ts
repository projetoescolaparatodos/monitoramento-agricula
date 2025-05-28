import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export interface Solicitacao {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  enderecoPropriedade?: string;
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
  tipo: string;
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
  situacaoLegal?: string;
  culturas?: any;
  maquinario?: any;
  maodeobra?: any;
  periodoDesejado?: string;
  // Dados crus para inspeção detalhada
  raw?: any;
}

// Função de normalização robusta
const normalizarSolicitacao = (data: any, tipo: string): Solicitacao => {
  return {
    id: data.id,
    
    // Campos obrigatórios sempre preenchidos
    nome: data.nome || 'Não informado',
    cpf: data.cpf || 'Não informado',
    status: data.status || 'pendente',
    urgencia: data.urgencia || 'normal',
    timestamp: data.timestamp || new Date(),
    origem: data.origem || 'formulario_web',
    tipoOrigem: data.tipoOrigem || tipo,
    tipo,
    
    // Contatos com fallbacks
    telefone: data.telefone || data.celular || '',
    email: data.email || '',
    endereco: data.endereco || '',
    
    // Propriedade com múltiplas fontes
    nomePropriedade: data.nomePropriedade || data.nome || 'Não informado',
    enderecoPropriedade: data.enderecoPropriedade || data.endereco || 'Não informado',
    tamanho: data.tamanho || data.tamanhoPropriedade || '',
    situacaoLegal: data.situacaoLegal || '',
    
    // Serviços normalizados
    servico: data.servico || data.tipoServico || data.interesse || 'Não informado',
    tipoServico: data.tipoServico || data.servico || data.interesse || 'Não informado',
    descricao: data.descricao || data.detalhes || data.observacoes || '',
    detalhes: data.detalhes || data.descricao || '',
    periodoDesejado: data.periodoDesejado || '',
    
    // Dados específicos preservados
    culturas: data.culturas || {},
    maquinario: data.maquinario || {},
    maodeobra: data.maodeobra || {},
    
    // PAA específicos
    dapCaf: data.dapCaf || '',
    localidade: data.localidade || '',
    produtos: data.produtos || '',
    areaMecanizacao: data.areaMecanizacao || data.areaMecanization || '',
    interesse: data.interesse || '',
    quantidadeEstimada: data.quantidadeEstimada || '',
    observacoes: data.observacoes || '',
    
    // Localização e dados crus
    userLocation: data.userLocation || undefined,
    raw: data // Mantém dados originais para inspeção
  };
};

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuração unificada das coleções
  const colecoes = [
    { nome: 'solicitacoes_agricultura_completo', tipo: 'agricultura_completo' },
    { nome: 'solicitacoes_agricultura', tipo: 'agricultura' },
    { nome: 'solicitacoes_pesca_completo', tipo: 'pesca_completo' },
    { nome: 'solicitacoes_pesca', tipo: 'pesca' },
    { nome: 'solicitacoes_paa', tipo: 'paa' },
    { nome: 'solicitacoes_servicos', tipo: 'servicos' }
  ];

  const fetchSolicitacoes = async () => {
    setLoading(true);
    setError(null);

    try {
      const todasSolicitacoes: Solicitacao[] = [];

      // Buscar com query ordenada e normalização robusta
      for (const { nome, tipo } of colecoes) {
        try {
          console.log(`🔍 Buscando coleção: ${nome}`);
          
          const q = query(collection(db, nome), orderBy('timestamp', 'desc'));
          const snapshot = await getDocs(q);

          const docs = snapshot.docs.map(doc => 
            normalizarSolicitacao({ id: doc.id, ...doc.data() }, tipo)
          );

          console.log(`✅ Encontrados ${docs.length} docs em ${nome}`);
          todasSolicitacoes.push(...docs);
        } catch (err) {
          console.error(`❌ Erro ao buscar ${nome}:`, err);
          // Continua mesmo com erro em uma coleção
        }
      }

      // Ordenação final por timestamp
      todasSolicitacoes.sort((a, b) => {
        const getTimestamp = (ts: any) => {
          if (ts?.toDate) return ts.toDate();
          if (ts instanceof Date) return ts;
          return new Date(ts || 0);
        };
        
        return getTimestamp(b.timestamp).getTime() - getTimestamp(a.timestamp).getTime();
      });

      console.log(`🎯 Total normalizado: ${todasSolicitacoes.length} solicitações`);
      setSolicitacoes(todasSolicitacoes);
    } catch (err: any) {
      console.error('💥 Erro geral:', err);
      setError(err.message || 'Erro ao carregar solicitações');
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