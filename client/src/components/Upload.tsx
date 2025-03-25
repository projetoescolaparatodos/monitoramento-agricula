
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
      const storageRef = ref(storage, `${folder}/${file.name}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });

    try {
      const urls = await Promise.all(uploadPromises);
      onUploadComplete(urls);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
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
