
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
        
        let q;
        
        try {
          // Vamos determinar qual campo usar para ordenação com base na coleção
          let timestampField = 'timestamp'; // Padrão para todas as coleções baseado no exemplo
          
          // Verificamos qual campo usar para cada coleção específica
          if (colecao.includes('_completo')) {
            timestampField = 'criadoEm';
          }
          
          console.log(`Usando campo de data '${timestampField}' para coleção ${colecao}`);
          
          // Adicionar filtro de status se não for 'todas'
          if (filtros.status !== 'todas') {
            q = query(collection(db, colecao), where('status', '==', filtros.status), orderBy(timestampField, 'desc'));
          } else {
            q = query(collection(db, colecao), orderBy(timestampField, 'desc'));
          }
          
          console.log(`Consulta para ${colecao} usando campo de timestamp: ${timestampField}`);
        } catch (err) {
          // Fallback para consulta sem ordenação caso o campo de timestamp não exista
          console.warn(`Erro ao configurar ordenação para ${colecao}:`, err);
          
          if (filtros.status !== 'todas') {
            q = query(collection(db, colecao), where('status', '==', filtros.status));
          } else {
            q = query(collection(db, colecao));
          }
        }
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          try {
            const data = doc.data();
            console.log(`Documento encontrado na coleção ${colecao}:`, doc.id, data);
            
            // Verificamos se o documento tem dados
            if (data) {
              // Estrutura base para mapeamento
              const solicitacaoObj: any = {
                id: doc.id,
                tipo: tipoSolicitacao,
                colecao: colecao,
                status: data.status || 'pendente',
              };
              
              // Mapeamento para o formato esperado pelo componente
              if (colecao.includes('agricultura')) {
                // Se for agricultura, vamos criar a estrutura esperada
                solicitacaoObj.dadosPessoais = {
                  nome: data.nome || 'Nome não disponível',
                  cpf: data.cpf || 'Não informado',
                  telefone: data.telefone,
                  email: data.email,
                  endereco: data.endereco
                };
                
                solicitacaoObj.dadosPropriedade = {
                  nome: data.nomePropriedade,
                  tamanho: data.tamanho,
                };
                
                solicitacaoObj.tipoServico = data.servico;
                solicitacaoObj.urgencia = data.urgencia;
                solicitacaoObj.detalhes = data.descricao;
                solicitacaoObj.criadoEm = data.timestamp;
              } else {
                // Para outros tipos, mantemos o comportamento atual
                Object.assign(solicitacaoObj, data);
                
                // Se não tiver dadosPessoais, tentamos criar a partir de outros campos
                if (!data.dadosPessoais) {
                  solicitacaoObj.dadosPessoais = {
                    nome: data.nome || data.nomeCompleto || data.nomeProdutor || 'Nome não disponível',
                    cpf: data.cpf || data.documento || data.cpfProdutor || 'Não informado'
                  };
                  console.log(`Adaptando estrutura para documento ${doc.id} em ${colecao}`);
                }
              }
              
              console.log(`Documento mapeado: `, solicitacaoObj);
              todasSolicitacoes.push(solicitacaoObj);
            } else {
              console.warn(`Documento ${doc.id} na coleção ${colecao} não tem dados:`, data);
            }
          } catch (err) {
            console.error(`Erro ao processar documento ${doc.id} da coleção ${colecao}:`, err);
          }
        });
      }

      // Aplicar filtro de pesquisa se existir
      const solicitacoesFiltradas = filtros.pesquisa 
        ? todasSolicitacoes.filter(sol => {
            try {
              // Verificar se os dados necessários existem antes de acessá-los
              if (sol.dadosPessoais && sol.dadosPessoais.nome) {
                const nome = sol.dadosPessoais.nome.toLowerCase();
                const cpf = sol.dadosPessoais.cpf || '';
                const termo = (filtros.pesquisa || '').toLowerCase();
                return nome.includes(termo) || cpf.includes(termo);
              }
              return false;
            } catch (err) {
              console.error('Erro ao filtrar solicitação:', err, sol);
              return false;
            }
          })
        : todasSolicitacoes;
      
      console.log(`Total de solicitações encontradas: ${todasSolicitacoes.length}`);
      console.log(`Solicitações após filtro: ${solicitacoesFiltradas.length}`);

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
      
      // Determinar o nome do campo a ser atualizado (atualizadoEm ou timestamp)
      const isCompleto = colecao.includes('_completo');
      const updateData: any = { status: novoStatus };
      
      // Atualizar o campo de data adequado
      if (isCompleto) {
        updateData.atualizadoEm = Timestamp.now();
      } else {
        // Para formulários simples, usar o mesmo campo de data original
        updateData.timestamp = Timestamp.now();
      }
      
      console.log(`Atualizando documento em ${colecao} com dados:`, updateData);
      
      await updateDoc(solicitacaoRef, updateData);
      
      // Atualizar localmente
      setSolicitacoes(prev => 
        prev.map(sol => {
          if (sol.id === solicitacaoId) {
            // Criar uma cópia atualizada da solicitação
            const updated = { ...sol, status: novoStatus as any };
            
            // Atualizar o campo de data correspondente
            if (isCompleto) {
              updated.atualizadoEm = Timestamp.now();
            } else {
              updated.timestamp = Timestamp.now();
            }
            
            return updated;
          }
          return sol;
        })
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
