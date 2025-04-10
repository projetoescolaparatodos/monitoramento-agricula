
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaFileUploaderProps {
  onFileUploaded: (url: string) => void;
  label?: string;
  acceptTypes?: string;
  folderPath?: string;
}

const MediaFileUploader = ({
  onFileUploaded,
  label = "Arquivo de Mídia",
  acceptTypes = "image/*,video/*",
  folderPath = "midias",
}: MediaFileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaLink, setMediaLink] = useState("");
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setProgress(10);

      // Criar uma referência de storage para o arquivo
      const fileType = file.type.split('/')[0]; // 'image' ou 'video'
      const timestamp = Date.now();
      const fileRef = ref(storage, `${folderPath}/${fileType}/${timestamp}_${file.name}`);
      
      setProgress(30);
      // Fazer upload do arquivo
      await uploadBytes(fileRef, file);
      setProgress(70);
      
      // Obter URL do arquivo enviado
      const downloadUrl = await getDownloadURL(fileRef);
      setProgress(100);
      
      // Notificar o componente pai sobre o URL do arquivo
      onFileUploaded(downloadUrl);
      
      toast({
        title: "Upload concluído",
        description: "O arquivo foi carregado com sucesso.",
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao enviar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleLinkSubmit = () => {
    if (!mediaLink.trim()) {
      toast({
        title: "Link vazio",
        description: "Por favor, insira um link válido para a mídia.",
        variant: "destructive",
      });
      return;
    }

    // Verificação básica se é uma URL
    if (!mediaLink.startsWith('http')) {
      toast({
        title: "Link inválido",
        description: "O link deve começar com http:// ou https://",
        variant: "destructive",
      });
      return;
    }

    // Notificar o componente pai sobre o URL do link
    onFileUploaded(mediaLink);
    
    toast({
      title: "Link adicionado",
      description: "O link de mídia foi adicionado com sucesso.",
    });

    // Limpar o campo
    setMediaLink("");
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
            <TabsTrigger value="link">Inserir Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label htmlFor="media-upload">Selecione um arquivo</Label>
              <Input
                id="media-upload"
                type="file"
                accept={acceptTypes}
                onChange={handleFileChange}
                disabled={uploading}
                className="mt-1"
              />
            </div>
            
            {uploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center mt-1">{progress}% Concluído</p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Formatos suportados: JPG, PNG, GIF, MP4, WebM
            </p>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <div>
              <Label htmlFor="media-link">URL da mídia</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="media-link"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={mediaLink}
                  onChange={(e) => setMediaLink(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleLinkSubmit} type="button">
                  Adicionar
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Insira um link direto para a imagem ou vídeo (começa com http:// ou https://)
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MediaFileUploader;
