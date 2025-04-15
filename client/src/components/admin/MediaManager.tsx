
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Upload from "../Upload";
import MediaLinkUploader from '../MediaLinkUploader';

interface MediaManagerProps {
  onMediaUploaded: (url: string) => void;
  title?: string;
}

const MediaManager = ({ onMediaUploaded, title = "Gerenciador de Mídia" }: MediaManagerProps) => {
  const { toast } = useToast();

  const handleUpload = (url: string) => {
    // Passar a URL diretamente para a função de callback
    onMediaUploaded(url);
    
    // Não precisamos mostrar toast aqui pois o componente de upload já faz isso
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Arquivo</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="mt-2">
            <Upload onUpload={handleUpload} />
          </TabsContent>
          <TabsContent value="link" className="mt-2">
            <MediaLinkUploader onLinkSubmit={handleUpload} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MediaManager;
