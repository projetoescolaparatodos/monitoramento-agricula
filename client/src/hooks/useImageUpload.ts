
import { useState } from 'react';

interface UseImageUploadProps {
  maxSizeInMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const useImageUpload = ({
  maxSizeInMB = 5,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
}: UseImageUploadProps = {}) => {
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calcular novas dimensões mantendo proporção
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
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
        } catch (error) {
          console.error('Erro na compressão:', error);
          resolve(file);
        }
      };

      img.onerror = () => {
        console.error('Erro ao carregar imagem para compressão');
        resolve(file);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const processImage = async (file: File): Promise<File> => {
    setIsUploading(true);
    
    try {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        return file;
      }

      // Verificar se o arquivo já está dentro do limite
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      if (file.size <= maxSizeInBytes) {
        return file;
      }

      // Comprimir se necessário
      const compressedFile = await compressImage(file);
      
      // Se ainda estiver muito grande, tentar comprimir mais
      if (compressedFile.size > maxSizeInBytes) {
        const furtherCompressed = await compressImage(compressedFile);
        return furtherCompressed;
      }
      
      return compressedFile;
    } catch (error) {
      console.error('Erro no processamento da imagem:', error);
      return file;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    processImage,
    isUploading
  };
};
