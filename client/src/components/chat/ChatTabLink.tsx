
import React from 'react';
import { Link } from "wouter";

interface ChatTabLinkProps {
  children: React.ReactNode;
  className?: string;
  tab: 'chat' | 'agricultura' | 'pesca' | 'paa';
}

const ChatTabLink: React.FC<ChatTabLinkProps> = ({ 
  children, 
  className = "",
  tab = 'chat'
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Evitar comportamento padrão do link
    e.preventDefault();
    
    console.log(`=== ATIVANDO CHATLINK PARA ABA ${tab.toUpperCase()} ===`);
    
    // Remover qualquer configuração anterior
    localStorage.removeItem('chatbot_tab');
    
    // Definir a aba ativa no localStorage
    localStorage.setItem('chatbot_tab', tab);
    console.log(`localStorage.chatbot_tab definido para '${tab}'`);
    
    // Definir a âncora na URL para persistir a intenção
    window.location.hash = `chatbot-tab=${tab}`;
    console.log(`Hash da URL definido para 'chatbot-tab=${tab}'`);
    
    // Disparar evento ANTES de abrir o chatbot
    window.dispatchEvent(new CustomEvent('open-chatbot', { 
      detail: { tab, timestamp: Date.now(), source: 'chatTabLink' }
    }));
    console.log(`Evento 'open-chatbot' disparado ANTES do clique`);
    
    // Clicar no botão do chatbot primeiro para garantir que ele está aberto
    const chatbotButton = document.querySelector('[data-chatbot-button]');
    if (chatbotButton) {
      console.log("Botão do chatbot encontrado, clicando para abrir");
      (chatbotButton as HTMLButtonElement).click();
      
      // Tentar selecionar a aba em vários intervalos para aumentar a chance de sucesso
      const attemptTimes = [100, 200, 400, 600, 800, 1000];
      
      // Funções para tentar selecionar a aba
      const trySelectTab = (attempt: number) => {
        setTimeout(() => {
          // Disparar evento novamente após o chatbot estar aberto
          if (attempt === 2) {
            window.dispatchEvent(new CustomEvent('open-chatbot', { 
              detail: { tab, timestamp: Date.now(), stage: 'post-open' }
            }));
            console.log(`Evento 'open-chatbot' disparado novamente após abertura (${attemptTimes[attempt]}ms)`);
          }
          
          // Buscar a aba dentro do chatbot e clicar nela
          const tabElement = document.querySelector(`[value="${tab}"]`);
          if (tabElement) {
            console.log(`Aba ${tab} encontrada (tentativa ${attempt+1}), clicando após ${attemptTimes[attempt]}ms`);
            // Usar click() para a interação programática
            (tabElement as HTMLButtonElement).click();
            
            // Alternativa usando dispatchEvent para um clique mais "natural"
            tabElement.dispatchEvent(new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            }));
          } else {
            console.log(`Aba ${tab} não encontrada na tentativa ${attempt+1} (${attemptTimes[attempt]}ms)`);
          }
        }, attemptTimes[attempt]);
      };
      
      // Executar todas as tentativas
      attemptTimes.forEach((_, index) => trySelectTab(index));
    } else {
      console.error("Botão do chatbot não encontrado");
      
      // Mesmo se o botão não for encontrado, tentar disparar o evento
      // para caso o chatbot já esteja aberto
      window.dispatchEvent(new CustomEvent('open-chatbot', { 
        detail: { tab, timestamp: Date.now(), force: true }
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
