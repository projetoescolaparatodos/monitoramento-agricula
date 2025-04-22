import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useChatTab } from "@/hooks/useChatTab";

interface OpenChatPAAProps {
  buttonText?: string;
  className?: string;
}

const OpenChatPAA: React.FC<OpenChatPAAProps> = ({ 
  buttonText = "Abrir Chat PAA", 
  className = "bg-amber-600 hover:bg-amber-700"
}) => {
  const { openChatWithTab } = useChatTab({
    retryInterval: 300,
    maxRetries: 5
  });

  const handleClick = () => {
    // Usar o hook useChatTab para abrir o chat diretamente na aba PAA
    openChatWithTab('paa');
  };

  return (
    <Button
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      {buttonText}
    </Button>
  );
};

export default OpenChatPAA;