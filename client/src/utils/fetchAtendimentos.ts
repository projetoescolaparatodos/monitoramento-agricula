
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface AtendimentoUnificado {
  id: string;
  localidade: string;
  latitude?: number;
  longitude?: number;
  origem: 'agricultura' | 'pesca' | 'paa';
  data: string;
  tecnico?: string;
  detalhes?: string;
  [key: string]: any;
}

/**
 * Busca atendimentos de todas as áreas (agricultura, pesca, PAA)
 */
export async function fetchAtendimentosUnificados(): Promise<AtendimentoUnificado[]> {
  const atendimentos: AtendimentoUnificado[] = [];
  
  try {
    // 1. Buscar dados da Agricultura (coleção "tratores")
    console.log('🌾 Buscando dados da Agricultura...');
    const agriculturaRef = collection(db, 'tratores');
    const agriculturaSnapshot = await getDocs(agriculturaRef);
    
    agriculturaSnapshot.forEach(doc => {
      const data = doc.data();
      atendimentos.push({
        id: doc.id,
        localidade: data.fazenda || data.localidade || 'Não informado',
        latitude: data.latitude,
        longitude: data.longitude,
        origem: 'agricultura',
        data: data.dataCadastro || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        tecnico: data.tecnicoResponsavel || data.piloto,
        detalhes: `${data.atividade || ''} - ${data.nome || ''}`.trim(),
        ...data
      });
    });
    
    // 2. Buscar dados da Pesca (coleção "pesca")
    console.log('🐟 Buscando dados da Pesca...');
    const pescaRef = collection(db, 'pesca');
    const pescaSnapshot = await getDocs(pescaRef);
    
    pescaSnapshot.forEach(doc => {
      const data = doc.data();
      atendimentos.push({
        id: doc.id,
        localidade: data.localidade || data.nomeImovel || 'Não informado',
        latitude: data.latitude,
        longitude: data.longitude,
        origem: 'pesca',
        data: data.dataCadastro || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        tecnico: data.tecnicoResponsavel || data.operador,
        detalhes: `${data.especiePeixe || ''} - ${data.tipoTanque || ''}`.trim(),
        ...data
      });
    });
    
    // 3. Buscar dados do PAA (coleção "paa")
    console.log('🥬 Buscando dados do PAA...');
    const paaRef = collection(db, 'paa');
    const paaSnapshot = await getDocs(paaRef);
    
    paaSnapshot.forEach(doc => {
      const data = doc.data();
      atendimentos.push({
        id: doc.id,
        localidade: data.localidade || 'Não informado',
        latitude: data.latitude,
        longitude: data.longitude,
        origem: 'paa',
        data: data.dataCadastro || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        tecnico: data.tecnicoResponsavel || data.operador,
        detalhes: `${data.tipoAlimento || ''} - ${data.metodoColheita || ''}`.trim(),
        ...data
      });
    });
    
    // 4. Buscar viveiros em construção (parte da pesca)
    console.log('🏗️ Buscando viveiros em construção...');
    const viveirosRef = collection(db, 'viveiros_em_construcao');
    const viveirosSnapshot = await getDocs(viveirosRef);
    
    viveirosSnapshot.forEach(doc => {
      const data = doc.data();
      atendimentos.push({
        id: doc.id,
        localidade: data.localidade || data.nomePropriedade || 'Não informado',
        latitude: data.latitude,
        longitude: data.longitude,
        origem: 'pesca', // Viveiros são da área de pesca
        data: data.dataInicio || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        tecnico: data.tecnicoResponsavel || 'Não informado',
        detalhes: `Viveiro - ${data.especieCultivada || ''}`.trim(),
        ...data
      });
    });
    
    console.log(`✅ Total de atendimentos encontrados: ${atendimentos.length}`);
    console.log('📊 Distribuição por origem:', {
      agricultura: atendimentos.filter(a => a.origem === 'agricultura').length,
      pesca: atendimentos.filter(a => a.origem === 'pesca').length,
      paa: atendimentos.filter(a => a.origem === 'paa').length
    });
    
    return atendimentos;
    
  } catch (error) {
    console.error('❌ Erro ao buscar atendimentos:', error);
    throw new Error('Não foi possível carregar os dados dos atendimentos');
  }
}

/**
 * Busca estatísticas básicas dos atendimentos
 */
export async function fetchEstatisticasAtendimentos() {
  try {
    const atendimentos = await fetchAtendimentosUnificados();
    
    const estatisticas = {
      total: atendimentos.length,
      porOrigem: {
        agricultura: atendimentos.filter(a => a.origem === 'agricultura').length,
        pesca: atendimentos.filter(a => a.origem === 'pesca').length,
        paa: atendimentos.filter(a => a.origem === 'paa').length
      },
      localidadesUnicas: new Set(atendimentos.map(a => a.localidade)).size,
      comCoordenadas: atendimentos.filter(a => a.latitude && a.longitude).length,
      ultimoMes: atendimentos.filter(a => {
        const dataAtendimento = new Date(a.data);
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        return dataAtendimento >= umMesAtras;
      }).length
    };
    
    return estatisticas;
    
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    return null;
  }
}
