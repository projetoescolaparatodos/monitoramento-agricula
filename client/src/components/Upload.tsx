import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase";
import { isGoogleDriveLink } from "@/utils/driveHelper";

interface UploadProps {
  onUpload: (url: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const { toast } = useToast();

  // Função para upload via Firebase Storage
  const handleFirebaseUpload = async (file: File) => {
    setUploading(true);

    try {
      console.log("Iniciando upload para Firebase Storage...");

      // Verificar se o arquivo é muito grande
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error("Arquivo muito grande. O limite é de 10MB.");
      }

      // Criar uma referência para o arquivo no Firebase Storage
      const fileType = file.type.split('/')[0]; // 'image' ou 'video'
      const timestamp = Date.now();
      const fileRef = ref(storage, `uploads/${fileType}/${timestamp}_${file.name}`);

      // Fazer upload do arquivo
      await uploadBytes(fileRef, file);

      // Obter URL do arquivo enviado
      const downloadUrl = await getDownloadURL(fileRef);

      console.log("Upload concluído para Firebase Storage, URL:", downloadUrl);
      onUpload(downloadUrl);

      toast({
        title: "Upload concluído",
        description: "Arquivo enviado com sucesso para o Firebase Storage.",
      });
    } catch (error) {
      console.error("Erro ao fazer upload para o Firebase Storage:", error);
      toast({
        title: "Erro no upload",
        description: `Falha ao enviar arquivo: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Isso evita que a página seja recarregada
    
    if (!uploadUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida",
        variant: "destructive",
      });
      return;
    }
    
    if (!uploadUrl.startsWith("http://") && !uploadUrl.startsWith("https://")) {
      toast({
        title: "Erro",
        description: "A URL deve começar com http:// ou https://",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadUrl.trim() && (uploadUrl.startsWith("http://") || uploadUrl.startsWith("https://"))) {
      
      // Processar links do Google Drive
      if (isGoogleDriveLink(uploadUrl)) {
        try {
          const directLink = await convertGoogleDriveLink(uploadUrl);
          onUpload(directLink);
          setUploadUrl("");
          
          toast({
            title: "Google Drive adicionado",
            description: "Link do Google Drive processado com sucesso."
          });
          return;
        } catch (error) {
          toast({
            title: "Erro no Google Drive",
            description: "Verifique se o link está configurado como público.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Enviar URL e prevenir navegação
      onUpload(uploadUrl);
      setUploadUrl("");
      
      // Salvar o estado atual no localStorage para recuperação caso ocorra navegação
      try {
        const formData = JSON.parse(localStorage.getItem('currentFormData') || '{}');
        localStorage.setItem('lastUploadedMedia', JSON.stringify([...formData.midias || [], uploadUrl]));
      } catch (error) {
        console.error('Erro ao salvar mídia no armazenamento local:', error);
      }
      toast({
        title: "URL adicionada",
        description: "A URL da mídia foi adicionada com sucesso."
      });
    } else {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida começando com http:// ou https://",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <input
          className="border rounded p-2 text-sm w-full"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFirebaseUpload(file);
            }
          }}
          disabled={uploading}
        />

        <div className="flex items-center space-x-2 rounded-md border p-2">
          <form onSubmit={handleUrlSubmit} className="flex w-full gap-2">
            <Input
              className="flex-1"
              type="url"
              placeholder="Ou adicione por URL (https://...)"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
            />
            <Button type="submit" variant="outline" size="sm">
              Adicionar URL
            </Button>
          </form>
        </div>
      </div>

      {uploading && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          <span className="ml-2 text-sm text-gray-500">Enviando...</span>
        </div>
      )}
    </div>
  );
};

export default Upload;