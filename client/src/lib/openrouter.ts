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
        model: "openai/gpt-3.5-turbo", // ou outro modelo compatível como "mistralai/mixtral-8x7b"
        messages,
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href, // Origem da requisição
          "X-Title": "Assistente SEMAPA", // Nome da aplicação
        },
      },
    );

    console.log("Resposta da OpenRouter:", response.data);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Erro na chamada à API OpenRouter:", error);

    // Melhor tratamento de erro
    if (axios.isAxiosError(error)) {
      console.error("Detalhes do erro:", error.response?.data);
    }

    return "Desculpe, estou com dificuldades para processar sua solicitação. Por favor, tente novamente mais tarde ou utilize as opções de sugestão.";
  }
}