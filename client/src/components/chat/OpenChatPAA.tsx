
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Função para abrir o chatbot na seção do PAA
const openChatbotPAA = () => {
  console.log("=== INICIANDO ABERTURA DO CHATBOT NA ABA PAA ===");
  
  // Armazenar o tempo de início para análise de tempo de resposta
  const startTime = Date.now();
  
  // Garantir que qualquer estado anterior seja limpo
  localStorage.removeItem('chatbot_tab');
  
  // Definir a aba ativa no localStorage
  localStorage.setItem('chatbot_tab', 'paa');
  console.log("localStorage.chatbot_tab definido para 'paa'");
  
  // Definir hash na URL para persistir a intenção
  window.location.hash = 'chatbot-tab=paa';
  console.log("Hash da URL definido para 'chatbot-tab=paa'");
  
  // Gerar um ID único para este evento
  const eventId = `paa-open-request-${Date.now()}`;
  
  // Buscar o elemento do chatbot
  const chatbotButton = document.querySelector('[data-chatbot-button]');
  if (chatbotButton) {
    console.log("Botão do chatbot encontrado, clicando para abrir");
    
    // Disparar evento ANTES de abrir o chatbot
    window.dispatchEvent(new CustomEvent('open-chatbot', { 
      detail: { 
        tab: 'paa', 
        timestamp: Date.now(),
        eventId: eventId,
        source: 'OpenChatPAA'
      }
    }));
    console.log("Evento 'open-chatbot' disparado ANTES do clique");
    
    // Clicar para abrir o chatbot
    (chatbotButton as HTMLButtonElement).click();
    
    // Usar múltiplas estratégias para garantir a seleção da aba PAA
    
    // Estratégia 1: Sequência de tentativas com intervalos progressivos
    const attemptTimes = [100, 200, 400, 700, 1000, 1500];
    
    // Função para tentar selecionar a aba PAA
    attemptTimes.forEach((delay, index) => {
      setTimeout(() => {
        // Tentar selecionar a aba PAA
        const paaTab = document.querySelector('[value="paa"]');
        
        if (paaTab) {
          console.log(`Aba PAA encontrada (tentativa ${index+1} após ${delay}ms), clicando`);
          
          // Tentar diferentes métodos para garantir o clique
          // Método 1: click()
          (paaTab as HTMLButtonElement).click();
          
          // Método 2: dispatchEvent para um clique mais "natural"
          paaTab.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          }));
          
          // Disparar evento novamente confirmando que a aba foi selecionada
          if (index === 2) { // Na terceira tentativa
            window.dispatchEvent(new CustomEvent('open-chatbot', { 
              detail: { 
                tab: 'paa', 
                timestamp: Date.now(),
                eventId: eventId,
                stage: 'post-click',
                elapsedTime: Date.now() - startTime
              }
            }));
          }
        } else {
          console.log(`Aba PAA não encontrada na tentativa ${index+1} (${delay}ms)`);
          
          // Verificar se o chat foi aberto corretamente
          const chatWindow = document.querySelector('[role="dialog"]');
          if (!chatWindow) {
            console.log("Chat não foi aberto corretamente. Tentando abrir novamente.");
            (chatbotButton as HTMLButtonElement).click();
          }
        }
      }, delay);
    });
    
  } else {
    console.error("Botão do chatbot não encontrado");
    
    // Mesmo se o botão não for encontrado, tentar disparar o evento
    // para caso o chatbot já esteja aberto
    window.dispatchEvent(new CustomEvent('open-chatbot', { 
      detail: { 
        tab: 'paa', 
        timestamp: Date.now(), 
        force: true,
        eventId: eventId 
      }
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
