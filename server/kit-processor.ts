
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
    console.log(`🎯 Servidor - Processando doação de kit: ${insumoId} (quantidade: ${quantidadeKit})`);
    
    // Buscar dados do insumo para verificar se é um kit
    const insumoDoc = await getDoc(doc(db, 'insumos', insumoId));
    
    if (!insumoDoc.exists()) {
      throw new Error(`Insumo não encontrado: ${insumoId}`);
    }

    const insumo = { id: insumoDoc.id, ...insumoDoc.data() } as Insumo;
    console.log(`📦 Insumo encontrado:`, { nome: insumo.nome, isKit: insumo.isKit, composicao: insumo.kitComposicao?.length });

    if (!insumo.isKit || !insumo.kitComposicao || insumo.kitComposicao.length === 0) {
      // Se não é um kit, registra a doação normalmente
      console.log(`📋 Registrando insumo individual (não é kit)`);
      await addDoc(collection(db, 'doacoes_evento'), doacaoData);
      return;
    }

    // Marcar a doação principal como kit
    const doacaoKitPrincipal = {
      ...doacaoData,
      isKit: true,
      kitComposicao: insumo.kitComposicao
    };

    // Registrar a doação do kit principal
    console.log(`📦 Registrando kit principal:`, doacaoKitPrincipal);
    await addDoc(collection(db, 'doacoes_evento'), doacaoKitPrincipal);

    // Para cada item do kit, criar uma doação individual proporcional
    console.log(`🔄 Processando ${insumo.kitComposicao.length} itens do kit`);
    for (const kitItem of insumo.kitComposicao) {
      // Calcular quantidade proporcional: quantidade do kit × quantidade do item no kit
      const quantidadeIndividual = kitItem.quantidade * quantidadeKit;
      
      console.log(`🔢 Item: ${kitItem.insumoId} - Quantidade no kit: ${kitItem.quantidade} × Kits: ${quantidadeKit} = Total: ${quantidadeIndividual}`);
      
      const doacaoIndividual = {
        eventoId: doacaoData.eventoId,
        insumoId: kitItem.insumoId,
        quantidade: quantidadeIndividual,
        tecnico: doacaoData.tecnico,
        beneficiario: doacaoData.beneficiario,
        timestamp: Timestamp.now(),
        kitOrigemId: insumoId,
        kitOrigemNome: insumo.nome,
        kitOrigemQuantidade: quantidadeKit,
        isFromKit: true,
        createdAt: Timestamp.now(),
        uniqueId: `server_kit_${doacaoData.uniqueId}_${kitItem.insumoId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      };

      console.log(`📋 Registrando item individual:`, doacaoIndividual);
      await addDoc(collection(db, 'doacoes_evento'), doacaoIndividual);
    }

    console.log(`✅ Kit processado com sucesso no servidor: ${insumo.kitComposicao.length} itens registrados`);

  } catch (error) {
    console.error('❌ Erro ao processar doação de kit no servidor:', error);
    throw error;
  }
}
