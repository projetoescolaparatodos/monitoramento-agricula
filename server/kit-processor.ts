
import { db } from './storage';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  writeBatch, 
  runTransaction,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';

export interface KitItem {
  insumoId: string;
  quantidade: number;
}

export interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  ativo: boolean;
  isKit?: boolean;
  kitComposicao?: KitItem[];
}

// Gerador de IDs únicos mais robusto para alta concorrência
function generateUniqueId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 12);
  const performance_now = performance.now().toString(36).substr(2, 8);
  return `${prefix}${timestamp}_${performance_now}_${random}`;
}

export async function processarDoacaoKit(
  doacaoData: any,
  insumoId: string,
  quantidadeKit: number
): Promise<void> {
  const uniqueProcessId = generateUniqueId('process_');
  
  try {
    console.log(`🎯 [${uniqueProcessId}] Iniciando processamento robusto de kit: ${insumoId} (quantidade: ${quantidadeKit})`);
    
    // Usar transação para garantir atomicidade e consistência
    await runTransaction(db, async (transaction) => {
      console.log(`🔒 [${uniqueProcessId}] Iniciando transação...`);
      
      // 1. Buscar dados do insumo dentro da transação
      const insumoDocRef = doc(db, 'insumos', insumoId);
      const insumoDoc = await transaction.get(insumoDocRef);
      
      if (!insumoDoc.exists()) {
        throw new Error(`Insumo não encontrado: ${insumoId}`);
      }

      const insumo = { id: insumoDoc.id, ...insumoDoc.data() } as Insumo;
      console.log(`📦 [${uniqueProcessId}] Insumo encontrado:`, { 
        nome: insumo.nome, 
        isKit: insumo.isKit, 
        composicao: insumo.kitComposicao?.length 
      });

      // 2. Preparar timestamps consistentes para todos os registros
      const transactionTimestamp = serverTimestamp();
      const baseUniqueId = generateUniqueId(`${uniqueProcessId}_`);

      if (!insumo.isKit || !insumo.kitComposicao || insumo.kitComposicao.length === 0) {
        // Insumo individual - registrar diretamente
        console.log(`📋 [${uniqueProcessId}] Registrando insumo individual (não é kit)`);
        
        const doacaoIndividual = {
          ...doacaoData,
          timestamp: transactionTimestamp,
          createdAt: transactionTimestamp,
          uniqueId: `${baseUniqueId}_individual`,
          processId: uniqueProcessId
        };

        const docRef = doc(collection(db, 'doacoes_evento'));
        transaction.set(docRef, doacaoIndividual);
        return;
      }

      // 3. Kit - registrar doação principal e itens em uma transação atômica
      console.log(`🔄 [${uniqueProcessId}] Processando kit com ${insumo.kitComposicao.length} itens`);

      // Registrar doação principal do kit
      const doacaoKitPrincipal = {
        ...doacaoData,
        isKit: true,
        kitComposicao: insumo.kitComposicao,
        timestamp: transactionTimestamp,
        createdAt: transactionTimestamp,
        uniqueId: `${baseUniqueId}_kit_principal`,
        processId: uniqueProcessId
      };

      const kitPrincipalRef = doc(collection(db, 'doacoes_evento'));
      transaction.set(kitPrincipalRef, doacaoKitPrincipal);
      
      console.log(`📦 [${uniqueProcessId}] Agendado registro do kit principal`);

      // Registrar cada item do kit individualmente
      insumo.kitComposicao.forEach((kitItem, index) => {
        const quantidadeIndividual = kitItem.quantidade * quantidadeKit;
        
        console.log(`🔢 [${uniqueProcessId}] Item ${index + 1}: ${kitItem.insumoId} - ${kitItem.quantidade} × ${quantidadeKit} = ${quantidadeIndividual}`);
        
        const doacaoIndividual = {
          eventoId: doacaoData.eventoId,
          insumoId: kitItem.insumoId,
          quantidade: quantidadeIndividual,
          tecnico: doacaoData.tecnico,
          beneficiario: doacaoData.beneficiario,
          timestamp: transactionTimestamp,
          createdAt: transactionTimestamp,
          kitOrigemId: insumoId,
          kitOrigemNome: insumo.nome,
          kitOrigemQuantidade: quantidadeKit,
          isFromKit: true,
          uniqueId: `${baseUniqueId}_item_${index}_${kitItem.insumoId}`,
          processId: uniqueProcessId
        };

        const itemDocRef = doc(collection(db, 'doacoes_evento'));
        transaction.set(itemDocRef, doacaoIndividual);
        
        console.log(`📋 [${uniqueProcessId}] Agendado registro do item ${index + 1}/${insumo.kitComposicao.length}`);
      });

      console.log(`✅ [${uniqueProcessId}] Todos os registros agendados na transação (${1 + insumo.kitComposicao.length} documentos)`);
    });

    console.log(`🎉 [${uniqueProcessId}] Transação concluída com sucesso! Kit processado atomicamente.`);

  } catch (error) {
    console.error(`❌ [${uniqueProcessId}] Erro na transação:`, error);
    
    // Re-tentar uma vez em caso de conflito de concorrência
    if (error.code === 'aborted' || error.message?.includes('transaction')) {
      console.log(`🔄 [${uniqueProcessId}] Tentando novamente após conflito de transação...`);
      
      // Aguardar um tempo aleatório para reduzir conflitos
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      try {
        await processarDoacaoKit(doacaoData, insumoId, quantidadeKit);
        console.log(`✅ [${uniqueProcessId}] Sucesso na segunda tentativa`);
        return;
      } catch (retryError) {
        console.error(`❌ [${uniqueProcessId}] Falha na segunda tentativa:`, retryError);
      }
    }
    
    throw error;
  }
}

// Função auxiliar para verificar integridade dos dados
export async function verificarIntegridadeDoacao(processId: string): Promise<{
  kitPrincipal: any;
  itensIndividuais: any[];
  integridadeOk: boolean;
}> {
  try {
    console.log(`🔍 Verificando integridade para processId: ${processId}`);
    
    // Buscar todas as doações relacionadas ao processId
    const doacoesRef = collection(db, 'doacoes_evento');
    const snapshot = await getDocs(query(doacoesRef, where('processId', '==', processId)));
    
    const doacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const kitPrincipal = doacoes.find(d => d.isKit === true);
    const itensIndividuais = doacoes.filter(d => d.isFromKit === true);
    
    const integridadeOk = kitPrincipal && 
                         kitPrincipal.kitComposicao &&
                         itensIndividuais.length === kitPrincipal.kitComposicao.length;
    
    console.log(`📊 Integridade: ${integridadeOk ? '✅ OK' : '❌ FALHA'} - Kit: ${!!kitPrincipal}, Itens: ${itensIndividuais.length}`);
    
    return {
      kitPrincipal,
      itensIndividuais,
      integridadeOk
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar integridade:', error);
    throw error;
  }
}
