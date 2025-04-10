
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase";

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

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaFileUploader;
