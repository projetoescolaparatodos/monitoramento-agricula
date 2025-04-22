
import React from 'react';
import { Link } from "wouter";

interface PAADirectLinkProps {
  children: React.ReactNode;
  className?: string;
}

const PAADirectLink: React.FC<PAADirectLinkProps> = ({ 
  children, 
  className = ""
}) => {
  return (
    <Link 
      href="#open-paa-chat" 
      className={className}
      onClick={(e) => {
        // Evitar comportamento padrão do link
        e.preventDefault();
        
        // Definir a aba ativa
        localStorage.setItem('chatbot_tab', 'paa');
        
        // Definir a âncora na URL (isso irá ativar o useEffect no App.tsx)
        window.location.hash = 'open-paa-chat';
        
        // Aguardar um pouco para garantir que o chatbot já esteja carregado
        setTimeout(() => {
          // Clicar no botão do chatbot
          const chatbotButton = document.querySelector('[data-chatbot-button]');
          if (chatbotButton) {
            (chatbotButton as HTMLButtonElement).click();
            
            // Aguardar mais um pouco para o chatbot abrir
            setTimeout(() => {
              // Buscar a aba PAA dentro do chatbot e clicar nela
              const paaTab = document.querySelector('[value="paa"]');
              if (paaTab) {
                (paaTab as HTMLButtonElement).click();
              }
            }, 300);
          }
        }, 100);
      }}
    >
      {children}
    </Link>
  );
};

export default PAADirectLink;
