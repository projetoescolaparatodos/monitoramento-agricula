import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload as UploadIcon } from "lucide-react";

interface UploadProps {
  onUpload: (url: string) => void;
}

const Upload = ({ onUpload }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para fazer upload.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "tratores_preset");
    formData.append("cloud_name", "di3lqsxxc");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/di3lqsxxc/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      onUpload(data.secure_url);
      toast({
        title: "Sucesso",
        description: "Upload realizado com sucesso!",
      });
      setFile(null);
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload do arquivo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="flex-1"
      />
      <Button 
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" />
            Enviar
          </span>
        )}
      </Button>
    </div>
  );
};

export default Upload;
