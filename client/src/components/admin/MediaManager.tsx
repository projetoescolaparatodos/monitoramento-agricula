
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaFileUploader from "./MediaFileUploader";
import MediaLinkUploader from "../MediaLinkUploader";
import { useToast } from "@/hooks/use-toast";

interface MediaManagerProps {
  onMediaUploaded: (url: string) => void;
  title?: string;
  acceptTypes?: string;
  folderPath?: string;
}

const MediaManager = ({
  onMediaUploaded,
  title = "Gerenciar Mídia",
  acceptTypes = "image/*,video/*",
  folderPath = "midias",
}: MediaManagerProps) => {
  const { toast } = useToast();

  const handleFileUploaded = (url: string) => {
    onMediaUploaded(url);
    toast({
      title: "Arquivo enviado",
      description: "O arquivo foi enviado com sucesso.",
    });
  };

  const handleLinkSubmit = (url: string) => {
    onMediaUploaded(url);
    toast({
      title: "Link adicionado",
      description: "O link foi adicionado com sucesso.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="file">Upload de Arquivo</TabsTrigger>
            <TabsTrigger value="link">Link Externo</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="mt-4">
            <MediaFileUploader 
              onFileUploaded={handleFileUploaded} 
              acceptTypes={acceptTypes}
              folderPath={folderPath}
              label="Enviar arquivo"
            />
          </TabsContent>
          <TabsContent value="link" className="mt-4">
            <MediaLinkUploader 
              onLinkSubmit={handleLinkSubmit}
              title="Adicionar por URL"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MediaManager;
