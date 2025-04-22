
import React from 'react';
import { Link } from "wouter";

interface ChatTabLinkProps {
  children: React.ReactNode;
  className?: string;
  tab: 'chat' | 'agricultura' | 'pesca' | 'paa';
  retryInterval?: number;
  maxRetries?: number;
}

const ChatTabLink: React.FC<ChatTabLinkProps> = ({ 
  children, 
  className = "",
  tab = 'chat',
  retryInterval = 300,
  maxRetries = 5
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Evitar comportamento padrão do link
    e.preventDefault();
    
    console.log(`=== INICIANDO ABERTURA DO CHATBOT NA ABA ${tab.toUpperCase()} ===`);
    
    // Garantir que estados anteriores sejam limpos
    localStorage.removeItem('chatbot_tab');
    
    // Definir a aba ativa no localStorage
    localStorage.setItem('chatbot_tab', tab);
    console.log(`localStorage.chatbot_tab definido para '${tab}'`);
    
    // Definir hash na URL para persistir a intenção
    window.location.hash = `chatbot-tab=${tab}`;
    console.log(`Hash da URL definido para 'chatbot-tab=${tab}'`);
    
    // Gerar um ID único para este evento
    const eventId = `chat-tab-request-${Date.now()}`;
    
    // Disparar evento ANTES de abrir o chatbot
    window.dispatchEvent(new CustomEvent('open-chatbot', { 
      detail: { tab, timestamp: Date.now(), source: 'chatTabLink', eventId }
    }));
    console.log(`Evento 'open-chatbot' disparado ANTES do clique`);
    
    // Buscar o elemento do chatbot
    const chatbotButton = document.querySelector('[data-chatbot-button]');
    if (chatbotButton) {
      console.log("Botão do chatbot encontrado, clicando para abrir");
      (chatbotButton as HTMLButtonElement).click();
      
      // Sistema de retries - tenta várias vezes em intervalos diferentes
      let retries = 0;
      const attemptTimes = [100, 200, 300, 500, 800, 1200];
      
      const retryIntervalId = setInterval(() => {
        if (retries >= maxRetries || retries >= attemptTimes.length) {
          clearInterval(retryIntervalId);
          return;
        }
        
        // Disparar evento novamente após delay para garantir que seja capturado
        window.dispatchEvent(new CustomEvent('open-chatbot', { 
          detail: { 
            tab, 
            timestamp: Date.now(), 
            stage: 'retry', 
            retryCount: retries,
            eventId 
          }
        }));
        
        console.log(`Retry ${retries + 1}: Disparando evento para aba ${tab}`);
        
        // Tentar selecionar a aba diretamente
        const tabElement = document.querySelector(`[value="${tab}"]`);
        if (tabElement) {
          console.log(`Aba ${tab} encontrada, clicando (retry ${retries + 1})`);
          // Usar múltiplas abordagens para garantir o clique
          
          // Método 1: click()
          (tabElement as HTMLButtonElement).click();
          
          // Método 2: dispatchEvent para um clique mais "natural"
          tabElement.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          }));
        } else {
          console.log(`Aba ${tab} não encontrada (retry ${retries + 1})`);
        }
        
        retries++;
      }, retryInterval);
    } else {
      console.error("Botão do chatbot não encontrado");
      
      // Mesmo se o botão não for encontrado, tentar disparar o evento
      // para caso o chatbot já esteja aberto
      window.dispatchEvent(new CustomEvent('open-chatbot', { 
        detail: { tab, timestamp: Date.now(), force: true, eventId }
      }));
      console.log("Evento 'open-chatbot' disparado mesmo sem encontrar o botão");
    }
  };
  
  return (
    <Link 
      href={`#chatbot-tab=${tab}`}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default ChatTabLink;
