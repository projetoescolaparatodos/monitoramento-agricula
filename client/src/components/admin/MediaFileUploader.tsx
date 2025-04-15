
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
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="mediaFile">Selecione o arquivo</Label>
            <Input
              id="mediaFile"
              type="file"
              accept={acceptTypes}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
              <p className="text-xs text-center mt-1">{progress}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaFileUploader;
