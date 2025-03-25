import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload as UploadIcon } from "lucide-react";
import { storage } from "../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UploadProps {
  folder: string;
  onUploadComplete: (urls: string[]) => void;
}

const Upload = ({ folder, onUploadComplete }: UploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }

      onUploadComplete(urls);
      toast({
        title: "Sucesso",
        description: "Arquivos enviados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Enviando...</span>
        </div>
      )}
    </div>
  );
};

export default Upload;