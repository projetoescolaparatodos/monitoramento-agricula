
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

  // Função para upload via Cloudinary
  const handleCloudinaryUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "semapa_uploads"); // Preset configurado no Cloudinary

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dwtcpujnm/upload", // Cloud name do Cloudinary
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Falha no upload para o Cloudinary");
      }

      const data = await response.json();
      onUpload(data.secure_url);
      toast({
        title: "Upload concluído",
        description: "A mídia foi enviada com sucesso",
      });
    } catch (error) {
      console.error("Erro no upload para Cloudinary:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da mídia. Verifique o console para mais detalhes.",
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
