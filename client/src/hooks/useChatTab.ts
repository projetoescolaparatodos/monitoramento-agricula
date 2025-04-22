
import { useState, useEffect, useCallback } from 'react';

// Interface to declare global window property for storing intervals
declare global {
  interface Window {
    _chatTabIntervals?: number[];
    _chatOpeningInProgress?: boolean;
  }
}

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
    
    // Prevenir múltiplas aberturas simultâneas
    if (window._chatOpeningInProgress) {
      console.log('Uma operação de abertura de chat já está em andamento');
      return;
    }
    
    // Marcar que uma operação está em andamento
    window._chatOpeningInProgress = true;
    
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
    
    // Verificar se o chatbot já está aberto
    const isChatOpen = document.querySelector('[role="dialog"]') !== null;
    
    if (chatbotButton || isChatOpen) {
      // Se o chat não estiver aberto, clicar no botão para abrir
      if (!isChatOpen && chatbotButton) {
        (chatbotButton as HTMLButtonElement).click();
      }
      
      // Sistema de retry com um único intervalo
      let retries = 0;
      
      const interval = setInterval(() => {
        if (retries >= maxRetries) {
          clearInterval(interval);
          setIsProcessing(false);
          window._chatOpeningInProgress = false;
          return;
        }
        
        console.log(`Tentativa ${retries+1} de alternar para a aba ${tab}`);
        
        // Tentar clicar na aba diretamente
        const tabElement = document.querySelector(`[value="${tab}"]`);
        if (tabElement) {
          // Usar método tradicional para clicar na aba
          (tabElement as HTMLButtonElement).click();
          console.log(`Clicou na aba ${tab} (tentativa ${retries+1})`);
          
          // Se conseguiu clicar, interromper as tentativas
          clearInterval(interval);
          setIsProcessing(false);
          window._chatOpeningInProgress = false;
        }
        
        retries++;
      }, retryInterval);
      
      // Armazenar referência ao intervalo para poder cancelar se necessário
      if (!window._chatTabIntervals) window._chatTabIntervals = [];
      window._chatTabIntervals.push(interval);
      
      // Limpar após o tempo máximo, se não for interrompido antes
      setTimeout(() => {
        clearInterval(interval);
        setIsProcessing(false);
        window._chatOpeningInProgress = false;
        console.log('Processo de abertura do chat finalizado pelo timeout');
      }, retryInterval * (maxRetries + 1));
    } else {
      console.error("Botão do chatbot não encontrado e chat não está aberto");
      setIsProcessing(false);
      window._chatOpeningInProgress = false;
    }
  }, [maxRetries, retryInterval]);
  
  // Limpar eventos e intervalos quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Limpar todos os intervalos registrados
      const existingIntervals = window._chatTabIntervals || [];
      existingIntervals.forEach(intervalId => clearInterval(intervalId));
      window._chatTabIntervals = [];
      window._chatOpeningInProgress = false;
    };
  }, []);
  
  return {
    targetTab,
    isProcessing,
    openChatWithTab
  };
}

export default useChatTab;
