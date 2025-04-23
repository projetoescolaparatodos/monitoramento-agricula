
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface PAATabButtonProps {
  className?: string;
}

const PAATabButton: React.FC<PAATabButtonProps> = ({ className = "" }) => {
  // Estado para rastrear se o chatbot já foi aberto por este botão
  const [chatOpened, setChatOpened] = useState(false);

  // Efeito para observar eventos de abertura/fechamento do chat
  useEffect(() => {
    const handleChatOpen = (event: CustomEvent) => {
      if (event.detail && event.detail.source === 'paa-button' && event.detail.isOpen === true) {
        setChatOpened(true);
      } else if (event.detail && event.detail.isOpen === false) {
        setChatOpened(false);
      }
    };

    window.addEventListener('chat_instance_toggle', handleChatOpen as EventListener);
    return () => {
      window.removeEventListener('chat_instance_toggle', handleChatOpen as EventListener);
    };
  }, []);

  // Função para abrir o chat na aba PAA
  const openChatPAATab = () => {
    // Primeiro, fechar qualquer instância aberta do chat
    const closeEvent = new CustomEvent('chat_instance_toggle', { 
      detail: { isOpen: false } 
    });
    window.dispatchEvent(closeEvent);

    // Um pequeno atraso para garantir que o chat feche antes de abrir novamente
    setTimeout(() => {
      // Definir no localStorage a aba a ser aberta
      localStorage.setItem('open_chat_tab', 'paa');

      // Disparar evento para abrir o chat na aba PAA
      const openEvent = new CustomEvent('chat_instance_toggle', { 
        detail: { isOpen: true, source: 'paa-button', tab: 'paa' } 
      });
      window.dispatchEvent(openEvent);
      
      setChatOpened(true);
    }, 100);
  };

  return (
    <Button 
      onClick={openChatPAATab} 
      className={`bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 ${className}`}
      disabled={chatOpened}
    >
      <ShoppingBag size={18} />
      <span>Programa PAA</span>
    </Button>
  );
};

export default PAATabButton;
