
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Função para abrir o chatbot na seção do PAA
const openChatbotPAA = () => {
  console.log("=== INICIANDO ABERTURA DO CHATBOT NA ABA PAA ===");
  
  // Garantir que qualquer estado anterior seja limpo
  localStorage.removeItem('chatbot_tab');
  
  // Definir a aba ativa no localStorage
  localStorage.setItem('chatbot_tab', 'paa');
  console.log("localStorage.chatbot_tab definido para 'paa'");
  
  // Definir hash na URL para persistir a intenção
  window.location.hash = 'chatbot-tab=paa';
  console.log("Hash da URL definido para 'chatbot-tab=paa'");
  
  // Buscar o elemento do chatbot
  const chatbotButton = document.querySelector('[data-chatbot-button]');
  if (chatbotButton) {
    console.log("Botão do chatbot encontrado, clicando para abrir");
    
    // Disparar evento ANTES de abrir o chatbot
    window.dispatchEvent(new CustomEvent('open-chatbot', { 
      detail: { tab: 'paa', timestamp: Date.now() }
    }));
    console.log("Evento 'open-chatbot' disparado ANTES do clique");
    
    // Clicar para abrir o chatbot
    (chatbotButton as HTMLButtonElement).click();
    
    // Sequência de tentativas para garantir que a aba PAA seja selecionada
    // Usamos mais tentativas e com intervalos maiores para garantir
    const attemptTimes = [100, 200, 400, 600, 800, 1000, 1500, 2000];
    
    // Funções para tentar selecionar a aba PAA
    const trySelectPaaTab = (attempt: number) => {
      setTimeout(() => {
        // Disparar evento novamente após o chatbot estar aberto
        if (attempt === 2) {
          window.dispatchEvent(new CustomEvent('open-chatbot', { 
            detail: { tab: 'paa', timestamp: Date.now(), stage: 'post-open' }
          }));
          console.log(`Evento 'open-chatbot' disparado novamente após abertura (${attemptTimes[attempt]}ms)`);
        }
        
        // Tentar selecionar a aba PAA diretamente
        const paaTab = document.querySelector('[value="paa"]');
        if (paaTab) {
          console.log(`Aba PAA encontrada (tentativa ${attempt+1}), clicando após ${attemptTimes[attempt]}ms`);
          // Usar click() para a interação programática
          (paaTab as HTMLButtonElement).click();
          
          // Alternativa usando dispatchEvent para um clique mais "natural"
          paaTab.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          }));
        } else {
          console.log(`Aba PAA não encontrada na tentativa ${attempt+1} (${attemptTimes[attempt]}ms)`);
        }
      }, attemptTimes[attempt]);
    };
    
    // Executar todas as tentativas
    attemptTimes.forEach((_, index) => trySelectPaaTab(index));
    
  } else {
    console.error("Botão do chatbot não encontrado");
    
    // Mesmo se o botão não for encontrado, tentar disparar o evento
    // para caso o chatbot já esteja aberto
    window.dispatchEvent(new CustomEvent('open-chatbot', { 
      detail: { tab: 'paa', timestamp: Date.now(), force: true }
    }));
    console.log("Evento 'open-chatbot' disparado mesmo sem encontrar o botão");
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
