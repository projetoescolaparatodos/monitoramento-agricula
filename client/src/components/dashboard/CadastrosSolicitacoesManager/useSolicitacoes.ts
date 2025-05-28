
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, updateDoc, doc, Timestamp, limit } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import { Solicitacao, FiltroSolicitacoes } from './types';

export const useSolicitacoes = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltroSolicitacoes>({ tipo: 'todas', status: 'todas' });
  // Contador para retry automático
  const [fetchAttempt, setFetchAttempt] = useState(0);

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

      console.log('⭐ INICIANDO BUSCA - Tentativa #', fetchAttempt + 1);
      console.log('⭐ Coleções a serem consultadas:', colecoesParaBuscar);

      const todasSolicitacoes: Solicitacao[] = [];
      const resultadosPorColecao: Record<string, number> = {};

      for (const colecao of colecoesParaBuscar) {
        const tipoSolicitacao = colecao.split('_')[1] as 'agricultura' | 'pesca' | 'paa' | 'servicos';
        
        console.log(`🔍 Buscando documentos na coleção: ${colecao}`);
        
        try {
          // Usar uma referência direta à coleção sem queries para minimizar problemas
          const colecaoRef = collection(db, colecao);
          const querySnapshot = await getDocs(colecaoRef);
          
          console.log(`✅ Encontrados ${querySnapshot.size} documentos na coleção ${colecao}`);
          resultadosPorColecao[colecao] = querySnapshot.size;
          
          if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnapshot) => {
              try {
                const data = docSnapshot.data();
                
                // Log detalhado para o primeiro documento apenas (evitar console excessivo)
                if (querySnapshot.docs.indexOf(docSnapshot) === 0) {
                  console.log(`📄 Exemplo de documento da coleção ${colecao}:`, 
                    { id: docSnapshot.id, ...data });
                }
                
                if (data) {
                  // Aplicar filtro de status somente se especificado
                  if (filtros.status !== 'todas' && data.status !== filtros.status) {
                    return;
                  }
                  
                  // Base da solicitação (mapear todos os campos importantes com fallbacks)
                  const solicitacaoObj: any = {
                    id: docSnapshot.id,
                    tipo: tipoSolicitacao,
                    colecao: colecao,
                    status: data.status || 'pendente',
                    rawData: data, // Mantém os dados originais para debug
                  };
                  
                  // Verificar todos os possíveis campos de data
                  if (data.timestamp) {
                    solicitacaoObj.criadoEm = data.timestamp;
                  } else if (data.criadoEm) {
                    solicitacaoObj.criadoEm = data.criadoEm;
                  } else if (data.dataCriacao) {
                    solicitacaoObj.criadoEm = data.dataCriacao;
                  } else {
                    // Caso não tenha nenhum timestamp, usa a data atual para não quebrar ordenação
                    solicitacaoObj.criadoEm = Timestamp.now();
                  }
                  
                  // MAPEAMENTO MELHORADO: Extrai dados de forma mais consistente
                  // Dados Pessoais: priorizar objeto estruturado, mas cair para campos diretos
                  if (data.dadosPessoais) {
                    solicitacaoObj.dadosPessoais = data.dadosPessoais;
                  } else {
                    solicitacaoObj.dadosPessoais = {
                      nome: data.nome || data.nomeCompleto || data.nomeProdutor || 'Nome não disponível',
                      cpf: data.cpf || data.documento || data.cpfProdutor || 'Não informado',
                      telefone: data.telefone || data.contato,
                      email: data.email,
                      endereco: data.endereco || data.localizacao
                    };
                  }
                  
                  // Dados de Propriedade: priorizar objeto estruturado, mas cair para campos diretos
                  if (data.dadosPropriedade) {
                    solicitacaoObj.dadosPropriedade = data.dadosPropriedade;
                  } else if (data.nomePropriedade || data.tamanho) {
                    solicitacaoObj.dadosPropriedade = {
                      nome: data.nomePropriedade || data.propriedadeNome,
                      tamanho: data.tamanho || data.area || data.tamanhoArea,
                      endereco: data.enderecoPropriedade || data.propriedadeEndereco
                    };
                  }
                  
                  // Detalhes do serviço
                  solicitacaoObj.tipoServico = data.servico || data.tipoServico;
                  solicitacaoObj.urgencia = data.urgencia;
                  solicitacaoObj.detalhes = data.descricao || data.detalhes || data.observacoes;
                  
                  // Dados específicos por tipo
                  if (tipoSolicitacao === 'agricultura') {
                    if (data.cultura) solicitacaoObj.cultura = data.cultura;
                    if (data.areaPlantio) solicitacaoObj.areaPlantio = data.areaPlantio;
                  } else if (tipoSolicitacao === 'pesca') {
                    if (data.dadosEmpreendimento) solicitacaoObj.dadosEmpreendimento = data.dadosEmpreendimento;
                    if (data.tipoTanque) solicitacaoObj.tipoTanque = data.tipoTanque;
                    if (data.volumeProducao) solicitacaoObj.volumeProducao = data.volumeProducao;
                  }
                  
                  // Adicionar à lista
                  todasSolicitacoes.push(solicitacaoObj);
                }
              } catch (err) {
                console.error(`❌ Erro ao processar documento ${docSnapshot.id} da coleção ${colecao}:`, err);
              }
            });
          } else {
            console.log(`⚠️ Nenhum documento encontrado na coleção ${colecao}`);
          }
        } catch (err) {
          console.error(`❌ ERRO AO ACESSAR COLEÇÃO ${colecao}:`, err);
        }
      }

      console.log('📊 RESUMO DA BUSCA:');
      Object.entries(resultadosPorColecao).forEach(([colecao, qtd]) => {
        console.log(`   - ${colecao}: ${qtd} documentos`);
      });
      console.log(`   - Total sem filtros: ${todasSolicitacoes.length} solicitações`);

      // Ordenar solicitações por data (mais recentes primeiro)
      const solicitacoesOrdenadas = todasSolicitacoes.sort((a, b) => {
        // Verificar se as datas existem e convertê-las para o mesmo formato
        const dateA = a.criadoEm ? 
          (a.criadoEm instanceof Timestamp ? a.criadoEm.toMillis() : 
           typeof a.criadoEm === 'object' && a.criadoEm.seconds ? a.criadoEm.seconds * 1000 :
           new Date(a.criadoEm).getTime()) : 0;
           
        const dateB = b.criadoEm ? 
          (b.criadoEm instanceof Timestamp ? b.criadoEm.toMillis() : 
           typeof b.criadoEm === 'object' && b.criadoEm.seconds ? b.criadoEm.seconds * 1000 :
           new Date(b.criadoEm).getTime()) : 0;
        
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
              console.error('❌ Erro ao filtrar solicitação:', err, sol);
              return false;
            }
          })
        : solicitacoesOrdenadas;
      
      console.log(`📊 RESULTADO FINAL:`);
      console.log(`   - Solicitações após filtros: ${solicitacoesFiltradas.length}`);
      
      if (solicitacoesFiltradas.length === 0 && fetchAttempt < 1) {
        console.log(`⚠️ ALERTA: Nenhuma solicitação encontrada. Isso pode indicar um problema.`);
        
        // Tentar novamente uma vez (retry automático)
        setFetchAttempt(prev => prev + 1);
      } else {
        // Reset contador de tentativas
        setFetchAttempt(0);
        
        if (solicitacoesFiltradas.length > 0) {
          console.log(`✅ Primeiras solicitações:`, solicitacoesFiltradas.slice(0, 2));
        }
        
        setSolicitacoes(solicitacoesFiltradas);
      }
    } catch (err) {
      console.error('❌ ERRO GRAVE ao buscar solicitações:', err);
      setError(`Falha ao carregar solicitações: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      
      // Tentar novamente uma vez em caso de erro (retry automático)
      if (fetchAttempt < 1) {
        console.log('🔄 Tentando novamente automaticamente...');
        setFetchAttempt(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [filtros, fetchAttempt]);

  // Refetch automático quando o contador de tentativas muda
  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchAttempt, fetchSolicitacoes]);
  
  // Fetch inicial
  useEffect(() => {
    console.log('🚀 Inicializando hook useSolicitacoes...');
    fetchSolicitacoes();
  }, []);

  const atualizarStatus = async (solicitacaoId: string, novoStatus: string, tipo: string, colecaoOrigem?: string) => {
    try {
      // Usar a coleção de origem se fornecida, caso contrário voltar ao padrão
      const colecao = colecaoOrigem || `solicitacoes_${tipo}`;
      console.log(`🔄 Atualizando status em ${colecao}/${solicitacaoId} para "${novoStatus}"`);
      
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
      
      await updateDoc(solicitacaoRef, updateData);
      console.log(`✅ Status atualizado com sucesso`);
      
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
      console.error('❌ Erro ao atualizar status:', err);
      return false;
    }
  };

  return {
    solicitacoes,
    loading,
    error,
    filtros,
    setFiltros,
    refreshSolicitacoes: () => {
      console.log('🔄 Atualizando solicitações manualmente...');
      // Reset contador e força novo fetch
      setFetchAttempt(0);
      fetchSolicitacoes();
    },
    atualizarStatus
  };
};
