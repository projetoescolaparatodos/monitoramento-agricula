
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Função para abrir o chatbot na seção do PAA
const openChatbotPAA = () => {
  // Definir a aba ativa no localStorage
  localStorage.setItem('chatbot_tab', 'paa');
  
  // Definir hash na URL para persistir a intenção
  window.location.hash = 'chatbot-tab=paa';
  
  // Buscar o elemento do chatbot e simular um clique se estiver fechado
  const chatbotButton = document.querySelector('[data-chatbot-button]');
  if (chatbotButton) {
    // Primeiro clique para abrir o chatbot
    (chatbotButton as HTMLButtonElement).click();
    
    // Aguardar tempo suficiente para o chatbot abrir completamente
    setTimeout(() => {
      // Disparar um evento personalizado depois de abrir
      window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { tab: 'paa' } }));
      
      // Buscar a aba PAA dentro do chatbot e clicar nela
      const paaTab = document.querySelector('[value="paa"]');
      if (paaTab) {
        (paaTab as HTMLButtonElement).click();
      } else {
        // Se não encontrou a aba, tentar novamente após mais tempo
        setTimeout(() => {
          const retryPaaTab = document.querySelector('[value="paa"]');
          if (retryPaaTab) {
            (retryPaaTab as HTMLButtonElement).click();
          }
        }, 200);
      }
    }, 400); // Aumentado para 400ms para dar mais tempo
  }
};

interface OpenChatPAAProps {
  buttonText?: string;
  className?: string;
}

const OpenChatPAA: React.FC<OpenChatPAAProps> = ({ 
  buttonText = "Abrir Chat PAA", 
  className = "bg-amber-600 hover:bg-amber-700"
}) => {
  return (
    <Button
      onClick={openChatbotPAA}
      className={`flex items-center gap-2 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      {buttonText}
    </Button>
  );
};

export default OpenChatPAA;
