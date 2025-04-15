
import React, { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Upload from "./Upload";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";

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

  // Função que processa o link automaticamente quando ele é válido
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Valida a URL automaticamente
    if (newUrl.trim() && (newUrl.startsWith("http://") || newUrl.startsWith("https://"))) {
      // Envia automaticamente se for uma URL válida
      handleLinkSubmit(newUrl);
    }
  };

  const handleLinkSubmit = (url: string) => {
    if (!url.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida",
        variant: "destructive"
      });
      return;
    }
    
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast({
        title: "Erro",
        description: "A URL deve começar com http:// ou https://",
        variant: "destructive"
      });
      return;
    }
    
    // Processa o link imediatamente, sem necessidade de submeter o formulário
    onUpload(url);
    
    // Feedback visual para o usuário
    toast({
      title: "Link adicionado",
      description: "O link da mídia foi adicionado com sucesso."
    });
    
    // Limpa o campo após o envio
    setUrl('');
  };

  return (
    <Card>
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
