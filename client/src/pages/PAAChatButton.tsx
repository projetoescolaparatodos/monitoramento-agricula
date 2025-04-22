import React from 'react';
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
  const { openChatWithTab } = useChatTab({
    retryInterval: 300,
    maxRetries: 5
  });

  const handleClick = () => {
    openChatWithTab('paa');
  };

  return (
    <Button
      onClick={handleClick}
      className={className}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  );
};

export default PAAChatButton;