import { useState, useCallback } from 'react';
import { optimizeImage, validateImageFile } from '@/utils/imageUpload';

interface UseImageUploadOptions {
  maxSizeInMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

interface UseImageUploadReturn {
  processImage: (file: File) => Promise<File>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  clearError: () => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    maxSizeInMB = 2,
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8
  } = options;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          // Melhorar qualidade da compressão
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Falha ao comprimir imagem'));
              }
            },
            'image/webp',
            quality
          );
        } else {
          reject(new Error('Falha ao criar contexto do canvas'));
        }
      };

      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  }, [maxWidth, maxHeight, quality]);

  const processImage = useCallback(async (file: File): Promise<File> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Validar arquivo
      validateImageFile(file);
      setUploadProgress(25);

      // Verificar tamanho do arquivo
      const fileSizeInMB = file.size / (1024 * 1024);
      setUploadProgress(50);

      if (fileSizeInMB <= maxSizeInMB) {
        setUploadProgress(100);
        return file; // Arquivo já está no tamanho adequado
      }

      // Comprimir se necessário
      setUploadProgress(75);
      const compressedFile = await compressImage(file);
      setUploadProgress(100);

      return compressedFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar imagem';
      setError(errorMessage);
      console.error('Erro ao processar imagem:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [maxSizeInMB, compressImage]);

  return {
    processImage,
    isUploading,
    uploadProgress,
    error,
    clearError
  };
};