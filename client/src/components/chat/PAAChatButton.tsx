
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useChatTab } from "@/hooks/useChatTab";

interface PAAChatButtonProps {
  buttonText?: string;
  className?: string;
}

const PAAChatButton: React.FC<PAAChatButtonProps> = ({ 
  buttonText = "Abrir Chat PAA", 
  className = "bg-amber-600 hover:bg-amber-700 text-white" 
}) => {
  const { openChatWithTab, isProcessing } = useChatTab({
    retryInterval: 300,
    maxRetries: 5
  });
  
  const [isClicked, setIsClicked] = useState(false);
  
  // Limpar estado de clique após 2 segundos
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  // Função com debounce para evitar cliques múltiplos
  const handleClick = useCallback(() => {
    if (isClicked || isProcessing) {
      console.log('Botão já foi clicado recentemente, ignorando clique adicional');
      return;
    }
    
    setIsClicked(true);
    openChatWithTab('paa');
  }, [openChatWithTab, isClicked, isProcessing]);

  return (
    <Button
      onClick={handleClick}
      className={className}
      disabled={isClicked || isProcessing}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
};

export default PAAChatButton;
