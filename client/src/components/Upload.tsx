import { useState } from "react";
import { storage } from "@/utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UploadProps {
  folder: string;
  onUploadComplete: (urls: string[]) => void;
}

export default function Upload({ folder, onUploadComplete }: UploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name}`);
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
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        className="relative"
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          "Escolher Arquivos"
        )}
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
      </Button>
    </div>
  );
}