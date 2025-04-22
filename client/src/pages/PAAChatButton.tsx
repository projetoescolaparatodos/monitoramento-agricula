
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
    
    // Definir a âncora na URL
    window.location.hash = `chatbot-tab=paa`;
    
    // Disparar o evento personalizado que o ChatbotWidget escuta
    window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { tab: 'paa' } }));
    
    // Aguardar um pouco e clicar no botão do chatbot
    setTimeout(() => {
      const chatbotButton = document.querySelector('[data-chatbot-button]');
      if (chatbotButton) {
        (chatbotButton as HTMLButtonElement).click();
        
        // Aguardar mais um pouco para o chatbot abrir e então clicar na aba PAA
        setTimeout(() => {
          const paaTab = document.querySelector('[value="paa"]');
          if (paaTab) {
            (paaTab as HTMLButtonElement).click();
          }
        }, 300);
      }
    }, 100);
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
