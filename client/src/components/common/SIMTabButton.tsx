
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";

interface SIMTabButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const SIMTabButton = ({ className = "", children }: SIMTabButtonProps) => {
  const [chatOpened, setChatOpened] = useState(false);

  const openChatSIMTab = () => {
    localStorage.setItem('open_chat_tab', 'sim');
    
    const simEvent = new CustomEvent('direct_sim_open', {
      detail: { directTab: 'sim' }
    });
    window.dispatchEvent(simEvent);
    
    const openEvent = new CustomEvent('chat_instance_toggle', { 
      detail: { 
        isOpen: true, 
        source: 'sim-button', 
        tab: 'sim',
        priority: 10,
        preventClose: true
      } 
    });
    window.dispatchEvent(openEvent);
    
    setChatOpened(true);
  };

  return (
    <Button 
      onClick={openChatSIMTab} 
      className={`bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 ${className}`}
    >
      <ClipboardCheck size={18} className="flex-shrink-0" />
      {children || <span className="truncate">Serviços SIM</span>}
    </Button>
  );
};

export default SIMTabButton;
