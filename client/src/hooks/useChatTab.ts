
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
    
    // Limpar quaisquer processos em andamento primeiro
    const existingIntervals = window._chatTabIntervals || [];
    existingIntervals.forEach((intervalId: number) => clearInterval(intervalId));
    window._chatTabIntervals = [];
    
    console.log(`Iniciando abertura do chat na aba: ${tab} (${Date.now()})`);
    
    // Limpar quaisquer solicitações antigas
    localStorage.removeItem('chatbot_tab');
    
    // Definir novo estado
    setTargetTab(tab);
    setIsProcessing(true);
    
    // Definir a preferência no localStorage 
    localStorage.setItem('chatbot_tab', tab);
    
    // Atualizar hash na URL para persistência
    window.location.hash = `chatbot-tab=${tab}`;
    
    // Gerar ID único para o evento
    const eventId = `chat-tab-request-${Date.now()}`;
    
    // Disparar evento personalizado
    const event = new CustomEvent('open-chatbot', {
      detail: {
        tab,
        timestamp: Date.now(),
        source: 'useChatTab',
        eventId
      }
    });
    
    window.dispatchEvent(event);
    
    // Buscar o botão do chat
    const chatbotButton = document.querySelector('[data-chatbot-button]');
    
    // Variável para rastrear se o chatbot já está aberto
    const isChatOpen = document.querySelector('[role="dialog"]') !== null;
    
    if (chatbotButton || isChatOpen) {
      // Se o chat não estiver aberto, clicar no botão para abrir
      if (!isChatOpen && chatbotButton) {
        (chatbotButton as HTMLButtonElement).click();
      }
      
      // Sistema de retry com intervalos crescentes
      let retries = 0;
      
      const interval = setInterval(() => {
        if (retries >= maxRetries) {
          clearInterval(interval);
          setIsProcessing(false);
          return;
        }
        
        console.log(`Tentativa ${retries+1} de alternar para a aba ${tab}`);
        
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
          // Usar método tradicional e dispatch de evento para garantir
          (tabElement as HTMLButtonElement).click();
          
          tabElement.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          }));
          
          console.log(`Clicou na aba ${tab} (tentativa ${retries+1})`);
        } else {
          console.log(`Aba ${tab} não encontrada na tentativa ${retries+1}`);
        }
        
        retries++;
      }, retryInterval * Math.pow(1.2, retries)); // Intervalos crescentes
      
      // Armazenar referência ao intervalo para poder cancelar se necessário
      if (!window._chatTabIntervals) window._chatTabIntervals = [];
      window._chatTabIntervals.push(interval);
      
      // Limpar após sucesso ou máximo de tentativas
      setTimeout(() => {
        clearInterval(interval);
        setIsProcessing(false);
        setTargetTab(null);
        console.log('Processo de abertura do chat finalizado');
      }, retryInterval * (maxRetries + 2));
    } else {
      console.error("Botão do chatbot não encontrado e chat não está aberto");
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
