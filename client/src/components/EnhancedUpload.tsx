
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Upload from "./Upload";
import MediaLinkUploader from "./MediaLinkUploader";
import { useToast } from "@/hooks/use-toast";

interface EnhancedUploadProps {
  onUpload: (url: string) => void;
  title?: string;
}

const EnhancedUpload = ({
  onUpload,
  title = "Adicionar Mídia"
}: EnhancedUploadProps) => {
  const { toast } = useToast();

  const handleFileUploaded = (url: string) => {
    onUpload(url);
  };

  const handleLinkSubmit = (url: string) => {
    onUpload(url);
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="py-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="file">Upload de Arquivo</TabsTrigger>
            <TabsTrigger value="link">Link Externo</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="mt-2">
            <Upload onUpload={handleFileUploaded} />
          </TabsContent>
          <TabsContent value="link" className="mt-2">
            <MediaLinkUploader onLinkSubmit={handleLinkSubmit} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedUpload;
