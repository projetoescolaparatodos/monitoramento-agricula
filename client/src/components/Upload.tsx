import { useState } from "react";
import { Button } from "@/components/ui/button";
import { storage } from "@/utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UploadProps {
  folder: string;
  onUploadComplete: (urls: string[]) => void;
}

const Upload = ({ folder, onUploadComplete }: UploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    });

    try {
      const urls = await Promise.all(uploadPromises);
      onUploadComplete(urls);
      setUploading(false);
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={uploading}
          asChild
        >
          <span>{uploading ? "Enviando..." : "Selecionar Arquivos"}</span>
        </Button>
      </label>
    </div>
  );
};

export default Upload;