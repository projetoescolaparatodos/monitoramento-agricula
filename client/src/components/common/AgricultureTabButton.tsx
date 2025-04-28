
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

interface AgricultureTabButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const AgricultureTabButton: React.FC<AgricultureTabButtonProps> = ({ className = "", children }) => {
  // Estado para rastrear se o chatbot foi aberto por este botão
  const [chatOpened, setChatOpened] = useState(false);

  // Efeito para lidar com a comunicação entre componentes
  useEffect(() => {
    // Função para manipular eventos de abertura do chat
    const handleChatOpen = (event: CustomEvent) => {
      if (event.detail) {
        // Quando o chat é aberto pelo nosso botão
        if (event.detail.source === 'agriculture-button' && event.detail.isOpen === true) {
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

  // Função para abrir o chat na aba Agricultura
  const openChatAgricultureTab = () => {
    // Método otimizado para abrir o chat diretamente na aba agricultura sem fechamentos intermediários
    
    // 1. Definir aba no localStorage para garantir persistência
    localStorage.setItem('open_chat_tab', 'agricultura');
    console.log("AgricultureTab: Definindo aba no localStorage:", 'agricultura');
    
    // 2. Disparar evento especial para abrir na aba agricultura
    const agricultureEvent = new CustomEvent('direct_paa_open', {
      detail: { directTab: 'agricultura' }
    });
    window.dispatchEvent(agricultureEvent);
    
    // 3. Abrir o chat com evento simplificado
    const openEvent = new CustomEvent('chat_instance_toggle', { 
      detail: { 
        isOpen: true, 
        source: 'agriculture-button', 
        tab: 'agricultura',
        priority: 10,  // Prioridade alta
        preventClose: true // Flag para evitar o fechamento automático
      } 
    });
    window.dispatchEvent(openEvent);
    
    setChatOpened(true);
  };

  return (
    <Button 
      onClick={openChatAgricultureTab} 
      className={`bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 ${className}`}
    >
      <Sprout size={18} className="flex-shrink-0" />
      {children || <span className="truncate">Serviços Agricultura</span>}
    </Button>
  );
};

export default AgricultureTabButton;
