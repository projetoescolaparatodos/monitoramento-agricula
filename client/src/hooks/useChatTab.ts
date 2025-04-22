
import { useState, useEffect, useCallback } from 'react';

export interface UseChatTabOptions {
  retryInterval?: number;
  maxRetries?: number;
}

/**
 * Hook personalizado para gerenciar a abertura do chat em abas específicas
 */
export function useChatTab(options: UseChatTabOptions = {}) {
  const { 
    retryInterval = 300,
    maxRetries = 5
  } = options;
  
  const [targetTab, setTargetTab] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Função para abrir o chat em uma aba específica
  const openChatWithTab = useCallback((tab: 'chat' | 'agricultura' | 'pesca' | 'paa') => {
    if (!['chat', 'agricultura', 'pesca', 'paa'].includes(tab)) {
      console.error(`Aba inválida: ${tab}`);
      return;
    }
    
    console.log(`Iniciando abertura do chat na aba: ${tab}`);
    setTargetTab(tab);
    setIsProcessing(true);
    
    // Definir a preferência no localStorage
    localStorage.setItem('chatbot_tab', tab);
    
    // Definir hash na URL para persistência
    window.location.hash = `chatbot-tab=${tab}`;
    
    // Gerar ID único para o evento
    const eventId = `chat-tab-request-${Date.now()}`;
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('open-chatbot', {
      detail: {
        tab,
        timestamp: Date.now(),
        source: 'useChatTab',
        eventId
      }
    }));
    
    // Buscar o botão do chat e clicar
    const chatbotButton = document.querySelector('[data-chatbot-button]');
    if (chatbotButton) {
      (chatbotButton as HTMLButtonElement).click();
      
      // Sistema de retry
      let retries = 0;
      
      const retryInterval = setInterval(() => {
        if (retries >= maxRetries) {
          clearInterval(retryInterval);
          setIsProcessing(false);
          return;
        }
        
        // Disparar evento novamente
        window.dispatchEvent(new CustomEvent('open-chatbot', {
          detail: {
            tab,
            timestamp: Date.now(),
            stage: 'retry',
            retryCount: retries,
            eventId
          }
        }));
        
        // Tentar clicar na aba diretamente
        const tabElement = document.querySelector(`[value="${tab}"]`);
        if (tabElement) {
          (tabElement as HTMLButtonElement).click();
        }
        
        retries++;
      }, retryInterval);
      
      // Limpar após sucesso ou máximo de tentativas
      setTimeout(() => {
        clearInterval(retryInterval);
        setIsProcessing(false);
        setTargetTab(null);
      }, retryInterval * (maxRetries + 1));
    } else {
      console.error("Botão do chatbot não encontrado");
      setIsProcessing(false);
    }
  }, [maxRetries, retryInterval]);
  
  // Monitorar mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chatbot_tab' && e.newValue) {
        if (['chat', 'agricultura', 'pesca', 'paa'].includes(e.newValue)) {
          setTargetTab(e.newValue);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return {
    targetTab,
    isProcessing,
    openChatWithTab
  };
}

export default useChatTab;
