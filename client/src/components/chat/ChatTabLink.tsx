
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
    
    // Definir a aba ativa
    localStorage.setItem('chatbot_tab', tab);
    
    // Definir a âncora na URL
    window.location.hash = `chatbot-tab=${tab}`;
    
    // Dispara um evento personalizado para notificar o chatbot
    window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { tab } }));
    
    // Aguardar um pouco para garantir que o chatbot já esteja carregado
    setTimeout(() => {
      // Clicar no botão do chatbot
      const chatbotButton = document.querySelector('[data-chatbot-button]');
      if (chatbotButton) {
        (chatbotButton as HTMLButtonElement).click();
        
        // Aguardar mais um pouco para o chatbot abrir
        setTimeout(() => {
          // Buscar a aba dentro do chatbot e clicar nela
          const tabElement = document.querySelector(`[value="${tab}"]`);
          if (tabElement) {
            (tabElement as HTMLButtonElement).click();
          }
        }, 300);
      }
    }, 100);
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
