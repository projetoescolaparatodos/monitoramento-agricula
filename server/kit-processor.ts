
import { db } from './storage';
import { collection, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';

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

export async function processarDoacaoKit(
  doacaoData: any,
  insumoId: string,
  quantidadeKit: number
): Promise<void> {
  try {
    // Buscar dados do insumo para verificar se é um kit
    const insumoDoc = await getDoc(doc(db, 'insumos', insumoId));
    
    if (!insumoDoc.exists()) {
      throw new Error('Insumo não encontrado');
    }

    const insumo = { id: insumoDoc.id, ...insumoDoc.data() } as Insumo;

    if (!insumo.isKit || !insumo.kitComposicao) {
      // Se não é um kit, registra a doação normalmente
      await addDoc(collection(db, 'doacoes_evento'), doacaoData);
      return;
    }

    // Marcar a doação principal como kit
    const doacaoKitPrincipal = {
      ...doacaoData,
      isKit: true
    };

    // Registrar a doação do kit principal
    await addDoc(collection(db, 'doacoes_evento'), doacaoKitPrincipal);

    // Para cada item do kit, criar uma doação individual proporcional
    for (const kitItem of insumo.kitComposicao) {
      // Calcular quantidade proporcional: quantidade do kit × quantidade do item no kit
      const quantidadeIndividual = kitItem.quantidade * quantidadeKit;
      
      const doacaoIndividual = {
        eventoId: doacaoData.eventoId,
        insumoId: kitItem.insumoId,
        quantidade: quantidadeIndividual,
        timestamp: Timestamp.now(),
        kitOrigemId: insumoId,
        kitOrigemNome: insumo.nome,
        kitOrigemQuantidade: quantidadeKit,
        isFromKit: true,
        createdAt: Timestamp.now(),
        uniqueId: `kit_${doacaoData.uniqueId}_${kitItem.insumoId}_${Date.now()}_${Math.random()}`
      };

      await addDoc(collection(db, 'doacoes_evento'), doacaoIndividual);
    }

  } catch (error) {
    console.error('Erro ao processar doação de kit:', error);
    throw error;
  }
}
