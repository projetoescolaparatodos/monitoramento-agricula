
import { useState } from 'react';

interface UseImageUploadProps {
  maxSizeInMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const useImageUpload = ({
  maxSizeInMB = 2,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
}: UseImageUploadProps = {}) => {
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para blob com qualidade reduzida
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const processImage = async (file: File): Promise<File> => {
    setIsUploading(true);
    
    try {
      // Verificar se o arquivo já está dentro do limite
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      if (file.size <= maxSizeInBytes) {
        return file;
      }

      // Comprimir se necessário
      const compressedFile = await compressImage(file);
      return compressedFile;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    processImage,
    isUploading
  };
};
