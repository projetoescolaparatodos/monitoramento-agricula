
import React, { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Upload from "./Upload";
import MediaLinkUploader from "./MediaLinkUploader";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface EnhancedUploadProps {
  onUpload: (url: string) => void;
  title?: string;
}

const EnhancedUpload = ({
  onUpload,
  title = "Adicionar Mídia"
}: EnhancedUploadProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFileUploaded = (url: string) => {
    onUpload(url);
  };

  const handleLinkSubmit = (url: string) => {
    // Processa o link imediatamente, sem necessidade de submeter o formulário
    onUpload(url);
    
    // Limpa o campo após o envio
    setUrl('');
    
    toast({
      title: "Link adicionado",
      description: "O link da mídia foi adicionado com sucesso."
    });
  };

  // Função que é acionada quando o valor da URL muda
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Valida a URL automaticamente
    if (newUrl.trim() && (newUrl.startsWith("http://") || newUrl.startsWith("https://"))) {
      // Envia automaticamente se for uma URL válida
      handleLinkSubmit(newUrl);
    }
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
            <div className="space-y-2">
              <div className="text-sm text-gray-500 mb-2">
                Cole a URL da mídia abaixo. Será adicionada automaticamente quando for uma URL válida.
              </div>
              <Input
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={url}
                onChange={handleUrlChange}
                className="flex-1"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedUpload;
};

export default EnhancedUpload;
