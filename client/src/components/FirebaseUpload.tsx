
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase";

interface FirebaseUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
}

const FirebaseUpload: React.FC<FirebaseUploadProps> = ({ onUpload, folder = "uploads" }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const { toast } = useToast();

  const handleFirebaseUpload = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Verificar tamanho do arquivo
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error("Arquivo muito grande. O limite é de 10MB.");
      }
      
      // Criar referência de armazenamento para o arquivo
      const fileType = file.type.split('/')[0]; // 'image' ou 'video'
      const timestamp = Date.now();
      const fileRef = ref(storage, `${folder}/${fileType}/${timestamp}_${file.name}`);
      
      // Fazer upload do arquivo
      await uploadBytes(fileRef, file);
      
      // Obter URL do arquivo enviado
      const downloadUrl = await getDownloadURL(fileRef);
      
      onUpload(downloadUrl);
      
      toast({
        title: "Upload concluído",
        description: "O arquivo foi carregado com sucesso."
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao enviar o arquivo: " + (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Garantir que a página não recarregue
    if (uploadUrl.trim() && (uploadUrl.startsWith("http://") || uploadUrl.startsWith("https://"))) {
      onUpload(uploadUrl);
      setUploadUrl("");
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

export default FirebaseUpload;
