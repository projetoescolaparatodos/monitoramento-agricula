
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
  identidade?: string;
  travessao?: string;
  enderecoPropriedade?: string;
  distanciaMunicipio?: string;
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
  console.log(`📝 Normalizando solicitação ${data.id} do tipo ${tipo}:`, data);
  
  const normalizada = {
    id: data.id,
    
    // Campos obrigatórios sempre preenchidos
    nome: data.nome || 'Não informado',
    cpf: data.cpf || 'Não informado',
    status: data.status || 'pendente',
    urgencia: data.urgencia || 'normal',
    timestamp: data.timestamp || new Date(),
    origem: data.origem || 'formulario_web',
    tipoOrigem: tipo, // Usar o tipo da coleção
    tipo: tipo.replace('solicitacoes_', ''), // Remover prefixo
    
    // Contatos com fallbacks
    telefone: data.telefone || data.celular || '',
    email: data.email || '',
    endereco: data.endereco || '',
    
    // Dados pessoais adicionais
    identidade: data.identidade || data.rg || '',
    travessao: data.travessao || '',
    
    // Propriedade com múltiplas fontes
    nomePropriedade: data.nomePropriedade || data.nome || 'Não informado',
    enderecoPropriedade: data.enderecoPropriedade || data.endereco || 'Não informado',
    tamanho: data.tamanho || data.tamanhoPropriedade || '',
    situacaoLegal: data.situacaoLegal || '',
    distanciaMunicipio: data.distanciaMunicipio || '',
    
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

  console.log(`✅ Solicitação normalizada:`, normalizada);
  return normalizada;
};

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuração unificada das coleções
  const colecoes = [
    { nome: 'solicitacoes_agricultura_completo', tipo: 'solicitacoes_agricultura_completo' },
    { nome: 'solicitacoes_agricultura', tipo: 'solicitacoes_agricultura' },
    { nome: 'solicitacoes_pesca_completo', tipo: 'solicitacoes_pesca_completo' },
    { nome: 'solicitacoes_pesca', tipo: 'solicitacoes_pesca' },
    { nome: 'solicitacoes_paa', tipo: 'solicitacoes_paa' },
    { nome: 'solicitacoes_servicos', tipo: 'solicitacoes_servicos' }
  ];

  const fetchSolicitacoes = async () => {
    console.log('🚀 Iniciando busca de solicitações...');
    setLoading(true);
    setError(null);

    try {
      // Teste de conexão com Firebase
      console.log('🔧 Testando conexão com Firebase...');
      console.log('Database instance:', db);
      console.log('Firebase app:', db.app);
      console.log('Firebase app name:', db.app.name);
      console.log('Firebase project ID:', db.app.options.projectId);
      
      // Teste básico de conectividade
      try {
        const testeRef = collection(db, 'teste_conexao');
        console.log('✅ Conseguiu criar referência de teste');
      } catch (testeErr) {
        console.error('❌ Erro ao criar referência de teste:', testeErr);
      }
      
      const todasSolicitacoes: Solicitacao[] = [];

      // Buscar com query ordenada e normalização robusta
      for (const { nome, tipo } of colecoes) {
        try {
          console.log(`🔍 Buscando coleção: ${nome} (tipo: ${tipo})`);
          
          // Verificar se a coleção existe
          const colecaoRef = collection(db, nome);
          console.log(`📦 Referência da coleção ${nome} criada:`, colecaoRef);

          // Primeiro, tentar buscar sem ordenação para verificar se existem documentos
          const snapshotSimples = await getDocs(colecaoRef);
          console.log(`📊 Busca simples em ${nome}:`, {
            empty: snapshotSimples.empty,
            size: snapshotSimples.size,
            docs: snapshotSimples.docs.length
          });

          if (!snapshotSimples.empty) {
            // Se existem documentos, tentar com ordenação
            try {
              const q = query(colecaoRef, orderBy('timestamp', 'desc'));
              const snapshot = await getDocs(q);
              
              console.log(`📊 Busca ordenada em ${nome}:`, {
                empty: snapshot.empty,
                size: snapshot.size,
                docs: snapshot.docs.length
              });

              const docs = snapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                console.log(`📄 Documento ${doc.id} de ${nome}:`, data);
                return normalizarSolicitacao(data, tipo);
              });

              console.log(`✅ ${docs.length} documentos processados de ${nome}`);
              todasSolicitacoes.push(...docs);
            } catch (orderErr) {
              console.warn(`⚠️ Erro na ordenação de ${nome}, usando ordem natural:`, orderErr);
              
              // Fallback: usar documentos sem ordenação
              const docs = snapshotSimples.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                console.log(`📄 Documento ${doc.id} de ${nome} (sem ordenação):`, data);
                return normalizarSolicitacao(data, tipo);
              });

              console.log(`✅ ${docs.length} documentos processados de ${nome} (sem ordenação)`);
              todasSolicitacoes.push(...docs);
            }
          } else {
            console.log(`⚠️ Coleção ${nome} está realmente vazia`);
          }
        } catch (err) {
          console.error(`❌ Erro ao buscar ${nome}:`, err);
          console.error('Detalhes do erro:', {
            message: err.message,
            code: err.code,
            stack: err.stack
          });
          // Continua mesmo com erro em uma coleção específica
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

      console.log(`🎯 Total de solicitações encontradas: ${todasSolicitacoes.length}`);
      console.log('📋 Resumo por tipo:', todasSolicitacoes.reduce((acc, s) => {
        acc[s.tipoOrigem] = (acc[s.tipoOrigem] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));

      setSolicitacoes(todasSolicitacoes);
      
      if (todasSolicitacoes.length === 0) {
        console.log('⚠️ Nenhuma solicitação encontrada. Verifique se existem dados nas coleções do Firebase.');
      }
    } catch (err: any) {
      console.error('💥 Erro geral ao buscar solicitações:', err);
      setError(err.message || 'Erro ao carregar solicitações');
    } finally {
      setLoading(false);
      console.log('🏁 Busca de solicitações finalizada');
    }
  };

  const updateSolicitacao = async (id: string, tipoOrigem: string, updates: Partial<Solicitacao>) => {
    try {
      console.log(`📝 Atualizando solicitação ${id} em ${tipoOrigem}:`, updates);
      await updateDoc(doc(db, tipoOrigem, id), updates);
      await fetchSolicitacoes(); // Recarregar dados
      console.log('✅ Solicitação atualizada com sucesso');
      return true;
    } catch (err) {
      console.error('❌ Erro ao atualizar solicitação:', err);
      return false;
    }
  };

  const deleteSolicitacao = async (id: string, tipoOrigem: string) => {
    try {
      console.log(`🗑️ Deletando solicitação ${id} de ${tipoOrigem}`);
      await deleteDoc(doc(db, tipoOrigem, id));
      await fetchSolicitacoes(); // Recarregar dados
      console.log('✅ Solicitação deletada com sucesso');
      return true;
    } catch (err) {
      console.error('❌ Erro ao deletar solicitação:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  return { 
    solicitacoes, 
    loading, 
    error,
    refetch: fetchSolicitacoes,
    updateSolicitacao,
    deleteSolicitacao
  };
}
