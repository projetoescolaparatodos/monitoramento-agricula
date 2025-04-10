import axios from "axios";

// Usando import.meta.env para acessar variáveis de ambiente no frontend
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

export async function getAIResponse(prompt: string, context: string) {
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
      },
    },
  );

  return response.data.choices[0].message.content;
}
