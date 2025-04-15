
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import EnhancedUpload from "../EnhancedUpload";

interface MediaManagerProps {
  onMediaUploaded: (url: string) => void;
  title?: string;
}

const MediaManager = ({ onMediaUploaded, title = "Gerenciador de Mídia" }: MediaManagerProps) => {
  const { toast } = useToast();

  const handleUpload = (url: string) => {
    // Passar a URL diretamente para a função de callback
    onMediaUploaded(url);
    
    // Não precisamos mostrar toast aqui pois o EnhancedUpload já faz isso
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <EnhancedUpload onUpload={handleUpload} title="Adicionar nova mídia" />
      </CardContent>
    </Card>
  );
};

export default MediaManager;
