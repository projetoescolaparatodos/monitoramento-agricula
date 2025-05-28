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

      // Buscar dados de cada coleção
      for (const nomeColecao of colecoes) {
        try {
          console.log(`Buscando dados da coleção: ${nomeColecao}`);
          const snapshot = await getDocs(collection(db, nomeColecao));

          const docs = snapshot.docs.map(doc => {
            const data = doc.data();

            return {
              id: doc.id,
              ...data,
              tipoOrigem: nomeColecao,
              // Normalizar campos comuns
              nome: data.nome || '',
              cpf: data.cpf || '',
              telefone: data.telefone || data.celular || '',
              email: data.email || '',
              urgencia: data.urgencia || 'normal',
              status: data.status || 'pendente',
              timestamp: data.timestamp,
              origem: data.origem || 'formulario_web'
            } as Solicitacao;
          });

          console.log(`Encontrados ${docs.length} documentos em ${nomeColecao}`);
          todasSolicitacoes.push(...docs);
        } catch (err) {
          console.error(`Erro ao buscar ${nomeColecao}:`, err);
        }
      }

      console.log(`Total de solicitações carregadas: ${todasSolicitacoes.length}`);
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