
import { useState, useEffect } from 'react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Interface mantida para compatibilidade com código existente
interface UserLocation {
  latitude: number;
  longitude: number;
}

interface ChatContext {
  ultimasMensagens: Message[];
  setor: string;
  userLocation: UserLocation | null;
  dadosParciais?: Record<string, any>;
}

/**
 * Hook para gerenciar o contexto de conversação entre chatbot e formulários
 */
export function useChatContext() {
  const [context, setContext] = useState<ChatContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tentar recuperar contexto do localStorage ao iniciar
    const loadContext = () => {
      setIsLoading(true);
      try {
        const storedContext = localStorage.getItem('chatContext');
        if (storedContext) {
          const parsedContext = JSON.parse(storedContext);
          setContext(parsedContext);
        } else {
          setContext(null);
        }
      } catch (error) {
        console.error('Erro ao carregar contexto do chat:', error);
        setContext(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadContext();
  }, []);

  /**
   * Salva o contexto atual do chat
   */
  const saveContext = (newContext: ChatContext) => {
    try {
      localStorage.setItem('chatContext', JSON.stringify(newContext));
      setContext(newContext);
    } catch (error) {
      console.error('Erro ao salvar contexto do chat:', error);
    }
  };

  /**
   * Atualiza parcialmente o contexto
   */
  const updateContext = (partialContext: Partial<ChatContext>) => {
    try {
      const updatedContext = { ...context, ...partialContext };
      localStorage.setItem('chatContext', JSON.stringify(updatedContext));
      setContext(updatedContext as ChatContext);
    } catch (error) {
      console.error('Erro ao atualizar contexto do chat:', error);
    }
  };

  /**
   * Limpa o contexto atual
   */
  const clearContext = () => {
    localStorage.removeItem('chatContext');
    setContext(null);
  };

  /**
   * Extrai dados parciais das mensagens
   * Esta função usa regras simples para identificar informações importantes nas mensagens
   */
  const extractDataFromMessages = (messages: Message[]) => {
    if (!messages || !messages.length) return {};
    
    const extractedData: Record<string, string> = {};
    const cpfRegex = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
    const phoneRegex = /\(\d{2}\)\s*\d{4,5}-\d{4}/;
    
    // Procurar por padrões de dados nas mensagens
    messages.forEach(msg => {
      if (msg.isUser) {
        // Tentar extrair CPF
        const cpfMatch = msg.text.match(cpfRegex);
        if (cpfMatch && !extractedData.cpf) {
          extractedData.cpf = cpfMatch[0];
        }
        
        // Tentar extrair telefone
        const phoneMatch = msg.text.match(phoneRegex);
        if (phoneMatch && !extractedData.telefone) {
          extractedData.telefone = phoneMatch[0];
        }
        
        // Se uma mensagem do usuário contém "meu nome é" ou similar
        if (msg.text.toLowerCase().includes('meu nome é') || 
            msg.text.toLowerCase().includes('me chamo')) {
          const nameParts = msg.text.split(/meu nome é|me chamo/i);
          if (nameParts.length > 1) {
            const potentialName = nameParts[1].trim().split(/[.,!?]/)[0].trim();
            if (potentialName && potentialName.length > 3) {
              extractedData.nome = potentialName;
            }
          }
        }
      }
    });
    
    return extractedData;
  };

  return {
    context,
    isLoading,
    saveContext,
    updateContext,
    clearContext,
    extractDataFromMessages
  };
}

export default useChatContext;
