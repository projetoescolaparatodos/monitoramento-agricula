
import { SuggestionButton } from "@/components/chat/ChatbotWidget";

interface KeywordMap {
  [key: string]: {
    responses: string[];
    suggestions?: SuggestionButton[];
    action?: string;
    score: number;
  };
}

// Padrão inicial de palavras-chave
export const defaultKeywordMap: KeywordMap = {
  // Agricultura
  "assistência técnica": {
    responses: [
      "Oferecemos assistência técnica agrícola gratuita para produtores cadastrados.",
      "Para solicitar assistência técnica, você precisa preencher o formulário de cadastro."
    ],
    suggestions: [
      { text: "Solicitar Assistência", action: "Solicitar Assistência" }
    ],
    score: 2
  },
  "análise de solo": {
    responses: [
      "Realizamos análise de solo gratuita para produtores cadastrados.",
      "O kit para coleta de solo está disponível na nossa sede."
    ],
    action: "fluxoAgricultura",
    score: 2
  },
  "mecanização": {
    responses: [
      "Nosso programa de mecanização agrícola oferece serviços de preparo do solo, plantio e colheita.",
      "Para solicitar o serviço de mecanização, é necessário estar cadastrado no sistema."
    ],
    action: "fluxoAgricultura",
    score: 2
  },
  
  // Pesca
  "licenciamento pesca": {
    responses: [
      "O licenciamento para atividade pesqueira requer documentação específica.",
      "Podemos ajudar com todo processo de licenciamento ambiental para pesca."
    ],
    suggestions: [
      { text: "Formulário de Pesca", action: "Pré-Cadastro" }
    ],
    score: 3
  },
  "piscicultura": {
    responses: [
      "Oferecemos suporte técnico para criação de peixes em tanques e açudes.",
      "Nossa equipe pode auxiliar com orientações sobre manejo, alimentação e comercialização."
    ],
    action: "fluxoPesca",
    score: 3
  },
  
  // PAA
  "vender para o governo": {
    responses: [
      "Através do PAA, você pode vender seus produtos diretamente para instituições públicas.",
      "O Programa de Aquisição de Alimentos (PAA) garante preços justos para agricultores familiares."
    ],
    action: "fluxoPAA",
    score: 3
  },
  
  // Genéricos
  "horário de atendimento": {
    responses: [
      "Atendemos de segunda a sexta, das 8h às 14h.",
      "Nosso horário de funcionamento é das 8h às 14h, exceto feriados."
    ],
    score: 1
  },
  "endereço": {
    responses: [
      "Estamos localizados na Av. Principal, nº 500, Centro, Vitória do Xingu/PA.",
      "Nossa sede fica na avenida principal da cidade, próximo à prefeitura."
    ],
    score: 1
  },
  "contato": {
    responses: [
      "Você pode entrar em contato pelo telefone (99) 3333-4444 ou pelo email semapa@prefeitura.gov.br",
      "Para falar com nossa equipe, ligue (99) 3333-4444 ou envie um email."
    ],
    score: 1
  }
};

// Este será o mapa de palavras-chave utilizado pelo sistema
export let keywordMap: KeywordMap = { ...defaultKeywordMap };

/**
 * Encontra a melhor correspondência de palavra-chave na mensagem do usuário
 * @param userInput Mensagem do usuário
 * @returns A palavra-chave correspondente ou null se não encontrar
 */
export function findBestKeywordMatch(userInput: string): string | null {
  const normalizedInput = userInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let bestMatch: { keyword: string; score: number } | null = null;
  
  // Função aprimorada para calcular a pontuação de correspondência
  const calculateMatchScore = (input: string, keyword: string, baseScore: number): number => {
    let score = baseScore;
    
    // Dividir em palavras
    const inputWords = input.split(/\s+/);
    const keywordWords = keyword.split(/\s+/);
    
    // CORRESPONDÊNCIA EXATA - Alta prioridade
    if (input === keyword) {
      score += 20; // Pontuação muito alta para correspondência exata
      console.log(`  💯 Match exato "${keyword}" = +20`);
    }
    
    // CORRESPONDÊNCIA DE FRASE - Alta prioridade
    if (input.includes(keyword)) {
      // Quanto maior a palavra-chave, maior a pontuação (mais específica)
      const phraseScore = 10 + (keyword.length / 10);
      score += phraseScore;
      console.log(`  🔤 Contém frase "${keyword}" = +${phraseScore.toFixed(1)}`);
      
      // Bônus para palavra no início da frase (mais relevante)
      if (input.startsWith(keyword)) {
        score += 5;
        console.log(`  🔝 Início da frase "${keyword}" = +5`);
      }
    }
    
    // CORRESPONDÊNCIA DE PALAVRA COMPLETA - Média prioridade
    // Verificar se as palavras da keyword aparecem como palavras completas no input
    if (keywordWords.length > 0) {
      let fullWordsFound = 0;
      
      for (const keywordWord of keywordWords) {
        if (keywordWord.length < 3) continue; // Ignorar palavras muito curtas
        
        const wordRegex = new RegExp(`\\b${keywordWord}\\b`, 'i');
        if (wordRegex.test(input)) {
          fullWordsFound++;
          // Palavra maior = mais específica = maior pontuação
          score += 2 + (keywordWord.length / 10);
        }
      }
      
      if (fullWordsFound > 0) {
        // Bônus para múltiplas palavras encontradas (melhor contexto)
        if (fullWordsFound > 1) {
          const multiWordBonus = fullWordsFound * 3;
          score += multiWordBonus;
          console.log(`  📚 ${fullWordsFound} palavras completas = +${multiWordBonus}`);
        } else {
          console.log(`  📝 1 palavra completa = +2`);
        }
        
        // Super bônus quando TODAS as palavras-chave são encontradas
        if (fullWordsFound === keywordWords.length && keywordWords.length > 1) {
          score += 8;
          console.log(`  🌟 Todas palavras encontradas = +8`);
        }
      }
    }
    
    // Normalizar pontuação com base no tamanho da entrada
    // Isso evita que entradas longas tenham vantagem injusta
    const lengthNormalization = Math.min(1, 15 / Math.max(1, input.length));
    score *= (0.7 + (0.3 * lengthNormalization));
    
    return score;
  };

  console.log(`🔍 Analisando palavras-chave para: "${normalizedInput}"`);
  
  // Verificar cada palavra-chave no mapa
  for (const keyword of Object.keys(keywordMap)) {
    const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Verificar correspondência de substring ou palavras
    let matchFound = false;
    
    // Correspondência de substring
    if (normalizedInput.includes(normalizedKeyword)) {
      matchFound = true;
    } else {
      // Verificar palavras individuais para casos mais complexos
      const keywordWords = normalizedKeyword.split(/\s+/).filter(w => w.length > 3);
      if (keywordWords.length > 0) {
        const inputWords = normalizedInput.split(/\s+/);
        const foundWords = keywordWords.filter(kw => inputWords.some(iw => iw.includes(kw) || kw.includes(iw)));
        
        // Se encontrou pelo menos metade das palavras ou uma palavra longa
        matchFound = foundWords.length >= Math.ceil(keywordWords.length / 2) || 
                     foundWords.some(w => w.length > 6 && normalizedInput.includes(w));
      }
    }
    
    if (matchFound) {
      console.log(`Avaliando: "${keyword}"`);
      const baseScore = keywordMap[keyword].score;
      const currentScore = calculateMatchScore(normalizedInput, normalizedKeyword, baseScore);
      
      console.log(`  Base: ${baseScore}, Total: ${currentScore.toFixed(1)}`);
      
      if (!bestMatch || currentScore > bestMatch.score) {
        bestMatch = { keyword, score: currentScore };
      }
    }
  }

  if (bestMatch) {
    console.log(`✅ Melhor correspondência: "${bestMatch.keyword}" com pontuação ${bestMatch.score.toFixed(1)}`);
  } else {
    console.log(`❌ Nenhuma correspondência de palavra-chave encontrada`);
  }

  // Retornar apenas se a pontuação for suficiente (evitar falsos positivos)
  const MIN_SCORE_THRESHOLD = 5.0;
  return (bestMatch && bestMatch.score >= MIN_SCORE_THRESHOLD) ? bestMatch.keyword : null;
}

/**
 * Obtém uma resposta aleatória para uma palavra-chave
 * @param keyword A palavra-chave
 * @returns Uma resposta aleatória ou null se a palavra-chave não existir
 */
export function getRandomResponse(keyword: string): string | null {
  const entry = keywordMap[keyword];
  if (!entry || !entry.responses || entry.responses.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * entry.responses.length);
  return entry.responses[randomIndex];
}

/**
 * Obtém sugestões associadas a uma palavra-chave
 * @param keyword A palavra-chave
 * @returns Array de botões de sugestão ou undefined
 */
export function getSuggestions(keyword: string): SuggestionButton[] | undefined {
  return keywordMap[keyword]?.suggestions;
}

/**
 * Obtém a ação associada a uma palavra-chave
 * @param keyword A palavra-chave
 * @returns String da ação ou undefined
 */
export function getAction(keyword: string): string | undefined {
  return keywordMap[keyword]?.action;
}

/**
 * Processa uma entrada de texto para extrair palavras-chave significativas
 * @param text O texto a ser processado
 * @returns Array de palavras-chave significativas
 */
export function extractKeywords(text: string): string[] {
  const stopWords = [
    'a', 'o', 'e', 'é', 'de', 'da', 'do', 'em', 'para', 'por', 'com', 'sem',
    'como', 'qual', 'quais', 'onde', 'quando', 'quem', 'que', 'porque', 'pois',
    'ao', 'aos', 'ou', 'um', 'uma', 'uns', 'umas', 'me', 'mim', 'meu', 'minha',
    'seu', 'sua', 'seus', 'suas', 'não', 'sim', 'talvez'
  ];
  
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Remove acentos
    .replace(/[^\w\s]/g, '')          // Remove pontuação
    .split(/\s+/)                      // Divide em palavras
    .filter(word => !stopWords.includes(word) && word.length > 2);
}

/**
 * Encontra as palavras-chave mais relevantes em um conjunto de texto
 * @param texts Array de textos
 * @returns Mapa de palavras-chave e suas frequências
 */
export function analyzeKeywordFrequency(texts: string[]): Map<string, number> {
  const frequencyMap = new Map<string, number>();
  
  texts.forEach(text => {
    const keywords = extractKeywords(text);
    keywords.forEach(keyword => {
      const count = frequencyMap.get(keyword) || 0;
      frequencyMap.set(keyword, count + 1);
    });
  });
  
  return frequencyMap;
}

/**
 * Carrega palavras-chave do Firestore e atualiza o keywordMap
 * @param db Instância do Firestore
 */
export async function loadKeywordsFromFirestore(db: any) {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const keywordsSnapshot = await getDocs(collection(db, 'keywords'));
    
    // Começamos com as palavras-chave padrão
    const updatedKeywordMap = { ...defaultKeywordMap };
    
    // Adicionamos ou substituímos com as palavras-chave do Firestore
    keywordsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.keyword && data.responses) {
        updatedKeywordMap[data.keyword] = {
          responses: data.responses,
          score: data.score || 1,
          action: data.action,
          suggestions: data.suggestions
        };
      }
    });
    
    // Atualizamos o mapa de palavras-chave
    keywordMap = updatedKeywordMap;
    console.log('Palavras-chave carregadas do Firestore:', Object.keys(keywordMap).length);
    return true;
  } catch (error) {
    console.error('Erro ao carregar palavras-chave do Firestore:', error);
    return false;
  }
}
