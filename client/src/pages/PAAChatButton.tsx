
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface PAAChatButtonProps {
  buttonText?: string;
  className?: string;
}

const PAAChatButton: React.FC<PAAChatButtonProps> = ({ 
  buttonText = "Abrir Chat PAA", 
  className = "bg-amber-600 hover:bg-amber-700 text-white" 
}) => {
  const openChatPAA = () => {
    // Salvar a preferência no localStorage
    localStorage.setItem('chatbot_tab', 'paa');
    
    // Definir a âncora na URL para persistir a intenção
    window.location.hash = `chatbot-tab=paa`;
    
    // Primeiro, abrir o chatbot
    const chatbotButton = document.querySelector('[data-chatbot-button]');
    if (chatbotButton) {
      (chatbotButton as HTMLButtonElement).click();
      
      // Aguardar tempo suficiente para o chatbot abrir completamente
      setTimeout(() => {
        // Disparar o evento personalizado após o chatbot abrir
        window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { tab: 'paa' } }));
        
        // Tentar clicar na aba PAA
        const paaTab = document.querySelector('[value="paa"]');
        if (paaTab) {
          (paaTab as HTMLButtonElement).click();
          console.log("Clicou na aba PAA");
        } else {
          // Tentar novamente após um pequeno atraso
          setTimeout(() => {
            const retryPaaTab = document.querySelector('[value="paa"]');
            if (retryPaaTab) {
              (retryPaaTab as HTMLButtonElement).click();
              console.log("Clicou na aba PAA (segunda tentativa)");
            }
          }, 200);
        }
      }, 400);
    }
  };

  return (
    <Button
      onClick={openChatPAA}
      className={className}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
};

export default PAAChatButton;
