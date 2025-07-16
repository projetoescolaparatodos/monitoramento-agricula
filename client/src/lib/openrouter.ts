import axios from "axios";

// Usando import.meta.env para acessar variáveis de ambiente no frontend
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Adiciona log para verificar se a chave existe
console.log("OpenRouter API Key disponível:", !!OPENROUTER_API_KEY);

export async function getAIResponse(prompt: string, context: string) {
  try {
    // Verificar se a chave API existe
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API Key não encontrada. Verifique as variáveis de ambiente.");
      return "Desculpe, estou com um problema técnico no momento. Por favor, tente utilizar as opções sugeridas.";
    }

    const messages = [
      {
        role: "system",
        content: `Você é um assistente virtual da SEMAPA (Secretaria de Agricultura, Pesca e Abastecimento).
        Contexto: ${context}
        Responda de forma clara e objetiva, sempre sugerindo os formulários adequados.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    console.log("Enviando requisição para OpenRouter com prompt:", prompt);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-8b-instruct:free", // Modelo gratuito mais confiável
        messages,
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin, // Usar origin ao invés de href completo
          "X-Title": "Assistente SEMAPA", // Nome da aplicação
        },
        timeout: 30000, // Timeout de 30 segundos
      },
    );

    console.log("Resposta da OpenRouter:", response.data);
    
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      console.error("Resposta da API não contém o conteúdo esperado:", response.data);
      return "Desculpe, não consegui processar sua solicitação. Tente usar as opções sugeridas.";
    }
  } catch (error) {
    console.error("Erro na chamada à API OpenRouter:", error);

    // Melhor tratamento de erro
    if (axios.isAxiosError(error)) {
      console.error("Detalhes do erro:", error.response?.data);
      console.error("Status do erro:", error.response?.status);
      console.error("Headers da resposta:", error.response?.headers);
      
      // Tratar diferentes tipos de erro
      if (error.response?.status === 404) {
        console.error("Erro 404: Endpoint não encontrado. Verificando URL da API...");
        return "Serviço temporariamente indisponível. Tente usar as opções sugeridas ou aguarde alguns instantes.";
      } else if (error.response?.status === 401) {
        console.error("Erro 401: Chave API inválida ou expirada");
        return "Problema de autenticação com o serviço. Entre em contato com o suporte técnico.";
      } else if (error.response?.status === 429) {
        console.error("Erro 429: Rate limit excedido");
        return "Muitas solicitações. Aguarde alguns instantes e tente novamente.";
      } else if (error.response?.status >= 500) {
        console.error("Erro do servidor:", error.response.status);
        return "Problema no servidor. Tente novamente em alguns minutos.";
      }
    }

    // Erro de rede ou timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return "Conexão muito lenta. Tente novamente ou use as opções sugeridas.";
    }

    return "Desculpe, estou com dificuldades para processar sua solicitação. Por favor, tente novamente mais tarde ou utilize as opções de sugestão.";
  }
}