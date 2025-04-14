
import { SuggestionButton } from "@/components/chat/ChatbotWidget";

interface KeywordMap {
  [key: string]: {
    responses: string[];
    suggestions?: SuggestionButton[];
    action?: string;
    score: number;
  };
}

export const keywordMap: KeywordMap = {
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

/**
 * Encontra a melhor correspondência de palavra-chave na mensagem do usuário
 * @param userInput Mensagem do usuário
 * @returns A palavra-chave correspondente ou null se não encontrar
 */
export function findBestKeywordMatch(userInput: string): string | null {
  const normalizedInput = userInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let bestMatch: { keyword: string; score: number } | null = null;

  // Função para calcular a pontuação de correspondência
  const calculateMatchScore = (input: string, keyword: string, baseScore: number): number => {
    let score = baseScore;
    
    // Correspondência exata ou como palavra completa recebe pontuação adicional
    const inputWords = input.split(/\s+/);
    const keywordWords = keyword.split(/\s+/);
    
    // Bônus para correspondência exata
    if (input === keyword) {
      score += 10;
    }
    
    // Bônus para palavra no início da frase
    if (input.startsWith(keyword)) {
      score += 3;
    }
    
    // Bônus para palavras completas
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (keywordRegex.test(input)) {
      score += 5;
    }
    
    // Bônus para palavras compartilhadas
    const sharedWords = keywordWords.filter(word => inputWords.includes(word));
    score += sharedWords.length * 2;
    
    return score;
  };

  for (const keyword of Object.keys(keywordMap)) {
    const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (normalizedInput.includes(normalizedKeyword)) {
      const baseScore = keywordMap[keyword].score;
      const currentScore = calculateMatchScore(normalizedInput, normalizedKeyword, baseScore);
      
      if (!bestMatch || currentScore > bestMatch.score) {
        bestMatch = { keyword, score: currentScore };
      }
    }
  }

  return bestMatch?.keyword || null;
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
