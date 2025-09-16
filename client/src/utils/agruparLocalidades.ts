
export interface LocalidadeAgrupada {
  nome: string;
  variantes: string[];
  quantidade: number;
  coordenadas?: { lat: number; lng: number }[];
}

export interface AtendimentoLocalidade {
  localidade: string;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

/**
 * Normaliza string para comparação
 */
function normalizarString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/km[\s-]*(\d+)/gi, 'km$1') // Padroniza "km-40", "km 40" para "km40"
    .replace(/travess[aã]o\s*do\s*/gi, 'travessao-') // Padroniza "Travessão do"
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
}

/**
 * Calcula similaridade entre duas strings (versão simplificada)
 */
function calcularSimilaridade(str1: string, str2: string): number {
  const norm1 = normalizarString(str1);
  const norm2 = normalizarString(str2);
  
  if (norm1 === norm2) return 1.0;
  
  // Verifica se uma string contém a outra
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.8;
  }
  
  // Algoritmo de distância de Levenshtein simplificado
  const matriz: number[][] = [];
  const len1 = norm1.length;
  const len2 = norm2.length;
  
  for (let i = 0; i <= len1; i++) {
    matriz[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matriz[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const custo = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
      matriz[i][j] = Math.min(
        matriz[i - 1][j] + 1,     // exclusão
        matriz[i][j - 1] + 1,     // inserção
        matriz[i - 1][j - 1] + custo // substituição
      );
    }
  }
  
  const distancia = matriz[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1.0 : 1.0 - (distancia / maxLen);
}

/**
 * Agrupa localidades similares
 */
export function agruparLocalidades(
  atendimentos: AtendimentoLocalidade[],
  limiarSimilaridade = 0.7
): LocalidadeAgrupada[] {
  const grupos: LocalidadeAgrupada[] = [];
  const processados = new Set<number>();
  
  atendimentos.forEach((atendimento, index) => {
    if (processados.has(index) || !atendimento.localidade) return;
    
    const localidadePrincipal = atendimento.localidade;
    const grupo: LocalidadeAgrupada = {
      nome: localidadePrincipal,
      variantes: [localidadePrincipal],
      quantidade: 1,
      coordenadas: atendimento.latitude && atendimento.longitude 
        ? [{ lat: atendimento.latitude, lng: atendimento.longitude }]
        : []
    };
    
    processados.add(index);
    
    // Procura por localidades similares
    atendimentos.forEach((outroAtendimento, outroIndex) => {
      if (processados.has(outroIndex) || !outroAtendimento.localidade) return;
      
      const similaridade = calcularSimilaridade(
        localidadePrincipal,
        outroAtendimento.localidade
      );
      
      if (similaridade >= limiarSimilaridade) {
        grupo.variantes.push(outroAtendimento.localidade);
        grupo.quantidade++;
        
        if (outroAtendimento.latitude && outroAtendimento.longitude) {
          grupo.coordenadas?.push({
            lat: outroAtendimento.latitude,
            lng: outroAtendimento.longitude
          });
        }
        
        processados.add(outroIndex);
      }
    });
    
    grupos.push(grupo);
  });
  
  // Ordena por quantidade (maior primeiro)
  return grupos.sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Prepara dados agrupados para gráficos
 */
export function prepararDadosGrafico(grupos: LocalidadeAgrupada[]) {
  return grupos.map(grupo => ({
    localidade: grupo.nome,
    quantidade: grupo.quantidade,
    variantes: grupo.variantes.length,
    coordenadas: grupo.coordenadas?.length || 0
  }));
}

/**
 * Exemplo de uso com debug
 */
export function exemploUso() {
  const atendimentosExemplo: AtendimentoLocalidade[] = [
    { localidade: 'KM-40', latitude: -2.8792, longitude: -52.0088 },
    { localidade: 'km 40', latitude: -2.8795, longitude: -52.0090 },
    { localidade: 'Travessão do km 40', latitude: -2.8800, longitude: -52.0085 },
    { localidade: 'Centro', latitude: -2.8700, longitude: -52.0000 },
    { localidade: 'centro', latitude: -2.8705, longitude: -52.0005 }
  ];
  
  const grupos = agruparLocalidades(atendimentosExemplo);
  console.log('Grupos formados:', grupos);
  
  const dadosGrafico = prepararDadosGrafico(grupos);
  console.log('Dados para gráfico:', dadosGrafico);
  
  return { grupos, dadosGrafico };
}
