
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface PAATabButtonProps {
  className?: string;
}

const PAATabButton: React.FC<PAATabButtonProps> = ({ className = "" }) => {
  // Estado para rastrear se o chatbot foi aberto por este botão
  const [chatOpened, setChatOpened] = useState(false);

  // Efeito para lidar com a comunicação entre componentes
  useEffect(() => {
    // Função para manipular eventos de abertura do chat
    const handleChatOpen = (event: CustomEvent) => {
      if (event.detail) {
        // Quando o chat é aberto pelo nosso botão
        if (event.detail.source === 'paa-button' && event.detail.isOpen === true) {
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

  // Função para abrir o chat na aba PAA
  const openChatPAATab = () => {
    // Método otimizado para abrir o chat diretamente na aba PAA sem fechamentos intermediários
    
    // 1. Definir aba no localStorage para garantir persistência
    localStorage.setItem('open_chat_tab', 'paa');
    console.log("PAATab: Definindo aba no localStorage:", 'paa');
    
    // 2. Disparar evento especial para abrir na aba PAA
    const paaEvent = new CustomEvent('direct_paa_open', {
      detail: { directTab: 'paa' }
    });
    window.dispatchEvent(paaEvent);
    
    // 3. Abrir o chat com evento simplificado
    const openEvent = new CustomEvent('chat_instance_toggle', { 
      detail: { 
        isOpen: true, 
        source: 'paa-button', 
        tab: 'paa',
        priority: 10,  // Prioridade alta
        preventClose: true // Flag para evitar o fechamento automático
      } 
    });
    window.dispatchEvent(openEvent);
    
    setChatOpened(true);
  };

  return (
    <Button 
      onClick={openChatPAATab} 
      className={`bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 ${className}`}
    >
      <ShoppingBag size={18} />
      <span>Programa PAA</span>
    </Button>
  );
};

export default PAATabButton;
