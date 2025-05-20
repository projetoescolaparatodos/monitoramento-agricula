
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { Solicitacao, FiltroSolicitacoes } from './types';

export const useSolicitacoes = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltroSolicitacoes>({ tipo: 'todas', status: 'todas' });

  const fetchSolicitacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar solicitações de cada coleção
      const colecoes = [
        'solicitacoes_agricultura', 
        'solicitacoes_agricultura_completo', 
        'solicitacoes_pesca', 
        'solicitacoes_pesca_completo',
        'solicitacoes_paa',
        'solicitacoes_servicos'
      ];
      
      // Filtrar por tipo se necessário
      const colecoesParaBuscar = filtros.tipo === 'todas' 
        ? colecoes 
        : colecoes.filter(col => {
            if (filtros.tipo === 'agricultura') return col.includes('agricultura');
            if (filtros.tipo === 'pesca') return col.includes('pesca');
            if (filtros.tipo === 'paa') return col === 'solicitacoes_paa';
            if (filtros.tipo === 'servicos') return col === 'solicitacoes_servicos';
            return false;
          });

      const todasSolicitacoes: Solicitacao[] = [];

      for (const colecao of colecoesParaBuscar) {
        const tipoSolicitacao = colecao.split('_')[1] as 'agricultura' | 'pesca' | 'paa' | 'servicos';
        
        let q = query(collection(db, colecao), orderBy('criadoEm', 'desc'));
        
        // Adicionar filtro de status se não for 'todas'
        if (filtros.status !== 'todas') {
          q = query(collection(db, colecao), where('status', '==', filtros.status), orderBy('criadoEm', 'desc'));
        }
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Solicitacao, 'id' | 'tipo' | 'colecao'>;
          todasSolicitacoes.push({
            ...data,
            id: doc.id,
            tipo: tipoSolicitacao,
            colecao: colecao
          });
        });
      }

      // Aplicar filtro de pesquisa se existir
      const solicitacoesFiltradas = filtros.pesquisa 
        ? todasSolicitacoes.filter(sol => 
            sol.dadosPessoais.nome.toLowerCase().includes(filtros.pesquisa?.toLowerCase() || '') || 
            sol.dadosPessoais.cpf.includes(filtros.pesquisa || '')
          )
        : todasSolicitacoes;

      setSolicitacoes(solicitacoesFiltradas);
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err);
      setError('Falha ao carregar solicitações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const atualizarStatus = async (solicitacaoId: string, novoStatus: string, tipo: string, colecaoOrigem?: string) => {
    try {
      // Usar a coleção de origem se fornecida, caso contrário voltar ao padrão
      const colecao = colecaoOrigem || `solicitacoes_${tipo}`;
      const solicitacaoRef = doc(db, colecao, solicitacaoId);
      
      await updateDoc(solicitacaoRef, {
        status: novoStatus,
        atualizadoEm: Timestamp.now()
      });
      
      // Atualizar localmente
      setSolicitacoes(prev => 
        prev.map(sol => 
          sol.id === solicitacaoId 
            ? { ...sol, status: novoStatus as any, atualizadoEm: Timestamp.now() } 
            : sol
        )
      );
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  return {
    solicitacoes,
    loading,
    error,
    filtros,
    setFiltros,
    refreshSolicitacoes: fetchSolicitacoes,
    atualizarStatus
  };
};
