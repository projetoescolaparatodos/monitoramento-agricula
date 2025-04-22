
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Função para abrir o chatbot na seção do PAA
const openChatbotPAA = () => {
  console.log("Iniciando abertura do chatbot na aba PAA");
  
  // Definir a aba ativa no localStorage
  localStorage.setItem('chatbot_tab', 'paa');
  
  // Definir hash na URL para persistir a intenção
  window.location.hash = 'chatbot-tab=paa';
  
  // Primeiro, disparar o evento para informar a preferência de aba
  window.dispatchEvent(new CustomEvent('open-chatbot', { detail: { tab: 'paa' } }));
  console.log("Evento 'open-chatbot' disparado com tab='paa'");
  
  // Buscar o elemento do chatbot e simular um clique se estiver fechado
  const chatbotButton = document.querySelector('[data-chatbot-button]');
  if (chatbotButton) {
    console.log("Botão do chatbot encontrado, clicando para abrir");
    // Clicar para abrir o chatbot
    (chatbotButton as HTMLButtonElement).click();
    
    // Sequência de tentativas para selecionar a aba PAA
    // Primeira tentativa imediata
    setTimeout(() => {
      const paaTab = document.querySelector('[value="paa"]');
      if (paaTab) {
        console.log("Aba PAA encontrada (tentativa 1), clicando");
        (paaTab as HTMLButtonElement).click();
      } else {
        console.log("Aba PAA não encontrada na primeira tentativa, tentando novamente");
        
        // Segunda tentativa após 150ms
        setTimeout(() => {
          const paaTab2 = document.querySelector('[value="paa"]');
          if (paaTab2) {
            console.log("Aba PAA encontrada (tentativa 2), clicando");
            (paaTab2 as HTMLButtonElement).click();
          } else {
            console.log("Aba PAA não encontrada na segunda tentativa, tentando novamente");
            
            // Terceira tentativa após mais 200ms
            setTimeout(() => {
              const paaTab3 = document.querySelector('[value="paa"]');
              if (paaTab3) {
                console.log("Aba PAA encontrada (tentativa 3), clicando");
                (paaTab3 as HTMLButtonElement).click();
              } else {
                console.log("Falha ao encontrar aba PAA após múltiplas tentativas");
              }
            }, 200);
          }
        }, 150);
      }
    }, 100);
  } else {
    console.error("Botão do chatbot não encontrado");
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
