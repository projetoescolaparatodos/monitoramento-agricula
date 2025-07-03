import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase";

interface UploadProps {
  onUpload: (url: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
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