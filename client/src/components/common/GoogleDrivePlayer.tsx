
import React, { useState, useEffect } from 'react';
import { 
  getGoogleDriveFileId, 
  getGoogleDriveFileMetadata, 
  getGoogleDriveStreamingUrl,
  initializeGoogleDriveAPI,
  isGoogleDriveLink 
} from '@/utils/driveHelper';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Play } from 'lucide-react';

interface GoogleDrivePlayerProps {
  mediaUrl: string;
  title?: string;
  className?: string;
  aspectRatio?: 'horizontal' | 'vertical' | 'square';
}

const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  mediaUrl,
  title = 'Mídia do Google Drive',
  className = '',
  aspectRatio = 'horizontal'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    const loadGoogleDriveMedia = async () => {
      if (!isGoogleDriveLink(mediaUrl)) {
        setError('URL não é do Google Drive');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Extrair ID do arquivo
        const fileId = getGoogleDriveFileId(mediaUrl);
        if (!fileId) {
          throw new Error('Não foi possível extrair ID do arquivo');
        }

        // Tentar inicializar API
        const initialized = await initializeGoogleDriveAPI();
        
        if (initialized) {
          // Se a API foi inicializada, tentar buscar metadados
          try {
            const metadata = await getGoogleDriveFileMetadata(fileId);
            if (metadata) {
              setFileMetadata(metadata);
              setIsVideo(metadata.mimeType?.startsWith('video/') || false);

              // Buscar URL de streaming/visualização
              const url = await getGoogleDriveStreamingUrl(fileId);
              if (url) {
                setStreamingUrl(url);
                return;
              }
            }
          } catch (apiError) {
            console.warn('Erro na API, usando fallback:', apiError);
          }
        }

        // Fallback: usar URLs diretas sem API
        console.log('Usando URLs diretas como fallback');
        
        // Assumir que é vídeo se a URL contém indicadores comuns
        const isLikelyVideo = mediaUrl.includes('video') || 
                             mediaUrl.includes('.mp4') || 
                             mediaUrl.includes('.avi') ||
                             mediaUrl.includes('.mov');
        
        setIsVideo(isLikelyVideo);
        
        if (isLikelyVideo) {
          setStreamingUrl(`https://drive.google.com/file/d/${fileId}/preview`);
        } else {
          setStreamingUrl(`https://drive.google.com/uc?export=view&id=${fileId}`);
        }

        // Definir metadados básicos
        setFileMetadata({
          id: fileId,
          name: title || 'Arquivo do Google Drive',
          mimeType: isLikelyVideo ? 'video/mp4' : 'image/jpeg'
        });

      } catch (err: any) {
        console.error('Erro ao carregar mídia do Google Drive:', err);
        setError('Erro ao carregar mídia. Verifique se o arquivo é público.');
      } finally {
        setLoading(false);
      }
    };

    loadGoogleDriveMedia();
  }, [mediaUrl, title]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'vertical':
        return 'aspect-[9/16]';
      case 'square':
        return 'aspect-square';
      default:
        return 'aspect-video';
    }
  };

  if (loading) {
    return (
      <div className={`w-full ${getAspectRatioClass()} ${className}`}>
        <Skeleton className="w-full h-full rounded-lg" />
        <div className="mt-2 text-center text-sm text-gray-500">
          Carregando mídia do Google Drive...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${getAspectRatioClass()} bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center p-4 ${className}`}>
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-red-700 text-sm text-center">{error}</p>
        <p className="text-gray-500 text-xs mt-1">
          Verifique se o arquivo é público
        </p>
      </div>
    );
  }

  if (isVideo && streamingUrl) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`w-full ${getAspectRatioClass()} relative overflow-hidden rounded-lg bg-black`}>
          <iframe
            src={streamingUrl}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
          />
          
          {/* Overlay com informações do arquivo */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
            <Play className="w-3 h-3 mr-1" />
            Vídeo do Google Drive
          </div>
        </div>
        
        {fileMetadata?.name && (
          <p className="text-sm text-gray-600 mt-2 truncate">
            {fileMetadata.name}
          </p>
        )}
      </div>
    );
  }

  if (!isVideo && streamingUrl) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`w-full ${getAspectRatioClass()} relative overflow-hidden rounded-lg bg-gray-100`}>
          <img
            src={streamingUrl}
            alt={title}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={() => setError('Erro ao carregar imagem')}
          />
        </div>
        
        {fileMetadata?.name && (
          <p className="text-sm text-gray-600 mt-2 truncate">
            {fileMetadata.name}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${getAspectRatioClass()} bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center ${className}`}>
      <p className="text-gray-500 text-sm">Formato não suportado</p>
    </div>
  );
};

export default GoogleDrivePlayer;
