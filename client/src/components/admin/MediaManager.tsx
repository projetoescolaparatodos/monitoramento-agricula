import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaFileUploader from "./MediaFileUploader";
import MediaLinkUploader from "../MediaLinkUploader";
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
    toast({
      title: "Sucesso",
      description: "Mídia adicionada com sucesso",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <EnhancedUpload onUpload={handleUpload} />
      </CardContent>
    </Card>
  );
};

export default MediaManager;