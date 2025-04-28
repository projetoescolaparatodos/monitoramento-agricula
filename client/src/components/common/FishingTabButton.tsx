
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Fish } from "lucide-react";

interface FishingTabButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const FishingTabButton: React.FC<FishingTabButtonProps> = ({ className = "", children }) => {
  // Estado para rastrear se o chatbot foi aberto por este botão
  const [chatOpened, setChatOpened] = useState(false);

  // Efeito para lidar com a comunicação entre componentes
  useEffect(() => {
    // Função para manipular eventos de abertura do chat
    const handleChatOpen = (event: CustomEvent) => {
      if (event.detail) {
        // Quando o chat é aberto pelo nosso botão
        if (event.detail.source === 'fishing-button' && event.detail.isOpen === true) {
          setChatOpened(true);
        }
        // Quando o chat é fechado
        else if (event.detail.isOpen === false) {
          setChatOpened(false);
        }
      }
    };

    // Adicionar listener para o evento personalizado
    window.addEventListener('chat_instance_toggle', handleChatOpen as EventListener);

    // Limpeza ao desmontar o componente
    return () => {
      window.removeEventListener('chat_instance_toggle', handleChatOpen as EventListener);
    };
  }, []);

  // Função para abrir o chat na aba Pesca
  const openChatFishingTab = () => {
    // Método otimizado para abrir o chat diretamente na aba pesca sem fechamentos intermediários
    
    // 1. Definir aba no localStorage para garantir persistência
    localStorage.setItem('open_chat_tab', 'pesca');
    console.log("FishingTab: Definindo aba no localStorage:", 'pesca');
    
    // 2. Disparar evento especial para abrir na aba pesca
    const fishingEvent = new CustomEvent('direct_paa_open', {
      detail: { directTab: 'pesca' }
    });
    window.dispatchEvent(fishingEvent);
    
    // 3. Abrir o chat com evento simplificado
    const openEvent = new CustomEvent('chat_instance_toggle', { 
      detail: { 
        isOpen: true, 
        source: 'fishing-button', 
        tab: 'pesca',
        priority: 10,  // Prioridade alta
        preventClose: true // Flag para evitar o fechamento automático
      } 
    });
    window.dispatchEvent(openEvent);
    
    setChatOpened(true);
  };

  return (
    <Button 
      onClick={openChatFishingTab} 
      className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 ${className}`}
    >
      <Fish size={18} className="flex-shrink-0" />
      {children || <span className="truncate">Serviços Pesca</span>}
    </Button>
  );
};

export default FishingTabButton;
