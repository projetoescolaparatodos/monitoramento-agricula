
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface UploadProps {
  onUpload: (url: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const { toast } = useToast();

  // Função para upload via servidor seguro
  const handleCloudinaryUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Iniciando upload para Cloudinary via servidor seguro...");
      
      // Verificar se o arquivo é muito grande
      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new Error("Arquivo muito grande. O limite é de 10MB.");
      }
      
      // Enviar para o endpoint seguro do servidor
      const response = await fetch(
        `/api/upload`, // Endpoint do servidor que lida com o upload seguro
        {
          method: "POST",
          body: formData,
        }
      );

      // Capturar o texto da resposta para diagnóstico
      const responseText = await response.text();
      console.log("Resposta Cloudinary:", responseText);
      console.log("Status Cloudinary:", response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Erro de autenticação no Cloudinary. Verifique a chave API e o upload_preset.");
        } else if (response.status === 400) {
          throw new Error(`Erro no formato dos dados enviados ao Cloudinary: ${response.statusText}`);
        } else {
          throw new Error(`Falha no upload para o Cloudinary: ${response.status} ${response.statusText}`);
        }
      }

      // Tentar converter texto para JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erro ao analisar resposta JSON:", parseError);
        throw new Error("Resposta inválida do Cloudinary");
      }

      if (!data.secure_url) {
        throw new Error("URL segura não encontrada na resposta do Cloudinary");
      }

      console.log("URL gerada:", data.secure_url);
      onUpload(data.secure_url);
      toast({
        title: "Upload concluído",
        description: "A mídia foi enviada com sucesso",
      });
    } catch (error) {
      console.error("Erro no upload para Cloudinary:", error);
      toast({
        title: "Erro no upload",
        description: `Falha no upload: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Upload por URL
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadUrl.trim()) {
      onUpload(uploadUrl.trim());
      setUploadUrl("");
      toast({
        title: "URL adicionada",
        description: "A URL da mídia foi adicionada com sucesso",
      });
    } else {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida",
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
              handleCloudinaryUpload(file);
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
