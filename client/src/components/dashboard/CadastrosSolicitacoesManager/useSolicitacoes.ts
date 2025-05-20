
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, updateDoc, doc, Timestamp, limit } from 'firebase/firestore';
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
        
        console.log(`Buscando documentos na coleção: ${colecao}`);
        
        // Buscar documentos sem ordenação ou filtros inicialmente
        // para garantir que recuperamos todos os documentos
        let q = collection(db, colecao);
        
        try {
          const querySnapshot = await getDocs(q);
          console.log(`Encontrados ${querySnapshot.size} documentos na coleção ${colecao}`);
          
          if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnapshot) => {
              try {
                const data = docSnapshot.data();
                console.log(`Documento ${docSnapshot.id} da coleção ${colecao}:`, data);
                
                if (data) {
                  // Verificar filtro de status aqui se necessário
                  if (filtros.status !== 'todas' && data.status !== filtros.status) {
                    console.log(`Documento ${docSnapshot.id} filtrado pelo status: ${data.status} ≠ ${filtros.status}`);
                    return;
                  }
                  
                  // Base da solicitação
                  const solicitacaoObj: any = {
                    id: docSnapshot.id,
                    tipo: tipoSolicitacao,
                    colecao: colecao,
                    status: data.status || 'pendente',
                  };
                  
                  // Verificar se há timestamp e adicionar
                  if (data.timestamp) {
                    solicitacaoObj.criadoEm = data.timestamp;
                  } else if (data.criadoEm) {
                    solicitacaoObj.criadoEm = data.criadoEm;
                  } else if (data.dataCriacao) {
                    solicitacaoObj.criadoEm = data.dataCriacao;
                  }
                  
                  // Mapeamento para estruturas específicas
                  if (colecao.includes('agricultura')) {
                    // Mapear campos específicos de agricultura
                    solicitacaoObj.dadosPessoais = {
                      nome: data.nome || data.nomeCompleto || 'Nome não disponível',
                      cpf: data.cpf || data.documento || 'Não informado',
                      telefone: data.telefone,
                      email: data.email,
                      endereco: data.endereco
                    };
                    
                    solicitacaoObj.dadosPropriedade = {
                      nome: data.nomePropriedade || data.propriedadeNome,
                      tamanho: data.tamanho || data.area,
                    };
                    
                    solicitacaoObj.tipoServico = data.servico || data.tipoServico;
                    solicitacaoObj.urgencia = data.urgencia;
                    solicitacaoObj.detalhes = data.descricao || data.detalhes;
                  } else if (colecao.includes('pesca')) {
                    // Mapear campos específicos de pesca
                    if (!data.dadosPessoais) {
                      solicitacaoObj.dadosPessoais = {
                        nome: data.nome || data.nomeCompleto || data.nomeProdutor || 'Nome não disponível',
                        cpf: data.cpf || data.documento || data.cpfProdutor || 'Não informado',
                        telefone: data.telefone || data.contato,
                        email: data.email,
                        endereco: data.endereco || data.localizacao
                      };
                    } else {
                      solicitacaoObj.dadosPessoais = data.dadosPessoais;
                    }
                    
                    // Dados específicos de pesca, se existirem
                    if (data.dadosEmpreendimento) {
                      solicitacaoObj.dadosEmpreendimento = data.dadosEmpreendimento;
                    }
                    
                    solicitacaoObj.tipoServico = data.servico || data.tipoServico;
                  } else {
                    // Para outros tipos, preservar estrutura original
                    Object.assign(solicitacaoObj, data);
                    
                    // Garantir que dadosPessoais sempre exista
                    if (!solicitacaoObj.dadosPessoais) {
                      solicitacaoObj.dadosPessoais = {
                        nome: data.nome || data.nomeCompleto || data.nomeProdutor || 'Nome não disponível',
                        cpf: data.cpf || data.documento || data.cpfProdutor || 'Não informado'
                      };
                    }
                  }
                  
                  console.log(`Documento mapeado para solicitação:`, solicitacaoObj);
                  todasSolicitacoes.push(solicitacaoObj);
                }
              } catch (err) {
                console.error(`Erro ao processar documento ${docSnapshot.id} da coleção ${colecao}:`, err);
              }
            });
          } else {
            console.log(`Nenhum documento encontrado na coleção ${colecao}`);
          }
        } catch (err) {
          console.error(`Erro ao buscar documentos da coleção ${colecao}:`, err);
        }
      }

      // Ordenar solicitações por data (mais recentes primeiro)
      const solicitacoesOrdenadas = todasSolicitacoes.sort((a, b) => {
        // Verificar se as datas existem e convertê-las para o mesmo formato
        const dateA = a.criadoEm ? 
          (a.criadoEm instanceof Timestamp ? a.criadoEm.toMillis() : new Date(a.criadoEm).getTime()) : 0;
        const dateB = b.criadoEm ? 
          (b.criadoEm instanceof Timestamp ? b.criadoEm.toMillis() : new Date(b.criadoEm).getTime()) : 0;
        
        return dateB - dateA;
      });

      // Aplicar filtro de pesquisa se existir
      const solicitacoesFiltradas = filtros.pesquisa 
        ? solicitacoesOrdenadas.filter(sol => {
            try {
              // Verificar se os dados necessários existem antes de acessá-los
              const nome = sol.dadosPessoais?.nome?.toLowerCase() || '';
              const cpf = sol.dadosPessoais?.cpf?.toLowerCase() || '';
              const termo = (filtros.pesquisa || '').toLowerCase();
              return nome.includes(termo) || cpf.includes(termo);
            } catch (err) {
              console.error('Erro ao filtrar solicitação:', err, sol);
              return false;
            }
          })
        : solicitacoesOrdenadas;
      
      console.log(`Total de solicitações encontradas: ${todasSolicitacoes.length}`);
      console.log(`Solicitações após filtro: ${solicitacoesFiltradas.length}`);
      
      if (solicitacoesFiltradas.length === 0) {
        console.log(`Nenhuma solicitação encontrada após filtros aplicados`);
      } else {
        console.log(`Primeiras 3 solicitações:`, solicitacoesFiltradas.slice(0, 3));
      }

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
