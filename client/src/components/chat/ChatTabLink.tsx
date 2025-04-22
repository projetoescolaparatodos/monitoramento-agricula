
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
    
    // Definir a aba ativa no localStorage
    localStorage.setItem('chatbot_tab', tab);
    
    // Definir a âncora na URL para persistir a intenção
    window.location.hash = `chatbot-tab=${tab}`;
    
    // Clicar no botão do chatbot primeiro para garantir que ele está aberto
    const chatbotButton = document.querySelector('[data-chatbot-button]');
    if (chatbotButton) {
      (chatbotButton as HTMLButtonElement).click();
      
      // Aguardar tempo suficiente para o chatbot abrir completamente
      setTimeout(() => {
        // Disparar evento após chatbot abrir
        window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { tab } }));
        
        // Buscar a aba dentro do chatbot e clicar nela
        const tabElement = document.querySelector(`[value="${tab}"]`);
        if (tabElement) {
          (tabElement as HTMLButtonElement).click();
        } else {
          // Se não encontrou a aba, tentar novamente após mais tempo
          setTimeout(() => {
            const retryTabElement = document.querySelector(`[value="${tab}"]`);
            if (retryTabElement) {
              (retryTabElement as HTMLButtonElement).click();
            }
          }, 200);
        }
      }, 400); // Aumentado para 400ms para dar mais tempo
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
