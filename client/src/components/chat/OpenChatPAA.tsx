import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Função para abrir o chatbot na seção do PAA
const openChatbotPAA = () => {
  // Criar ou atualizar um item no localStorage para indicar qual aba abrir
  localStorage.setItem('chatbot_tab', 'paa');
  
  // Buscar o elemento do chatbot e simular um clique se estiver fechado
  const chatbotButton = document.querySelector('[data-chatbot-button]');
  if (chatbotButton) {
    (chatbotButton as HTMLButtonElement).click();
    
    // Aguardar um pouco para dar tempo do chatbot abrir
    setTimeout(() => {
      // Buscar a aba PAA dentro do chatbot e clicar nela
      const paaTab = document.querySelector('[value="paa"]');
      if (paaTab) {
        (paaTab as HTMLButtonElement).click();
      }
    }, 300);
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