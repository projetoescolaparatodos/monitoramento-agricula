import React, { useState, useEffect } from 'react';
import { 
  getGoogleDriveFileId, 
  getGoogleDriveFileMetadata, 
  getGoogleDriveStreamingUrl,
  initializeGoogleDriveAPI,
  isGoogleDriveLink 
} from '@/utils/driveHelper';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Play, Instagram } from 'lucide-react';
import { useScreenSize } from '@/hooks/useScreenSize';
import CustomVideoPreview from './CustomVideoPreview';

interface GoogleDrivePlayerProps {
  mediaUrl: string;
  title?: string;
  className?: string;
  aspectRatio?: 'horizontal' | 'vertical' | 'square' | '9:16' | '16:9' | string;
  instagramUrl?: string;
}

const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  mediaUrl,
  title = 'Mídia do Google Drive',
  className = '',
  aspectRatio = 'horizontal',
  instagramUrl
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const screenSize = useScreenSize();

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
        console.log('Tentando inicializar Google Drive API...');
        const initialized = await initializeGoogleDriveAPI();
        console.log('API inicializada:', initialized);

        if (initialized) {
          // Se a API foi inicializada, tentar buscar metadados
          try {
            console.log('Buscando metadados do arquivo...');
            const metadata = await getGoogleDriveFileMetadata(fileId);
            if (metadata) {
              console.log('Metadados encontrados:', metadata);
              setFileMetadata(metadata);
              setIsVideo(metadata.mimeType?.startsWith('video/') || false);

              // Buscar URL de streaming/visualização
              const url = await getGoogleDriveStreamingUrl(fileId);
              if (url) {
                setStreamingUrl(url);
                setLoading(false);
                return;
              }
            } else {
              console.log('Nenhum metadado retornado, usando fallback');
            }
          } catch (apiError) {
            console.warn('Erro na API, usando fallback:', apiError);
          }
        } else {
          console.log('Falha na inicialização da API, usando fallback');
        }

        // Fallback: usar URLs diretas sem API
        console.log('Usando URLs diretas como fallback');

        // Detecção melhorada de tipo de mídia
        const isLikelyVideo = mediaUrl.includes('video') || 
                             mediaUrl.includes('.mp4') || 
                             mediaUrl.includes('.avi') ||
                             mediaUrl.includes('.mov') ||
                             mediaUrl.includes('.webm') ||
                             mediaUrl.includes('.mkv') ||
                             title?.toLowerCase().includes('video') ||
                             title?.toLowerCase().includes('vídeo') ||
                             title?.toLowerCase().includes('instagram') ||
                             title?.toLowerCase().includes('reels') ||
                             title?.toLowerCase().includes('stories');

        setIsVideo(isLikelyVideo);

        // SEMPRE usar preview URL para evitar downloads forçados
        setStreamingUrl(`https://drive.google.com/file/d/${fileId}/preview`);

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
    // Implementação baseada no documento: controle explícito de aspect ratio
    // Usar CSS aspect-ratio para melhor controle responsivo
    
    // Verificar se é proporção específica (ex: "9:16", "16:9")
    if (aspectRatio?.includes(':')) {
      const [width, height] = aspectRatio.split(':');
      return `relative w-full max-w-full aspect-[${width}/${height}]`;
    }

    // Proporções nomeadas com aspect ratio explícito
    switch (aspectRatio) {
      case 'vertical':
      case '9:16':
        return 'relative w-full max-w-[400px] mx-auto aspect-[9/16]';
      case 'square':
      case '1:1':
        return 'relative w-full max-w-full aspect-square';
      case 'horizontal':
      case '16:9':
      default:
        return 'relative w-full max-w-full aspect-video';
    }
  };

  // Verificar se é vídeo vertical para ajustar container
  const isVerticalAspect = aspectRatio === 'vertical' || 
                          aspectRatio === '9:16' || 
                          aspectRatio?.includes('9/16') ||
                          (aspectRatio?.includes(':') && 
                           parseInt(aspectRatio.split(':')[1]) > parseInt(aspectRatio.split(':')[0]));

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
    // Para vídeos do Google Drive, tentar usar o player customizado se possível
    // Se for um link direto de vídeo, usar CustomVideoPreview
    if (streamingUrl.includes('/preview') || streamingUrl.includes('/view')) {
      return (
        <div className={`w-full ${className}`}>
          <div className={`google-drive-container ${getAspectRatioClass()} overflow-hidden rounded-lg bg-black relative`}>
            {instagramUrl && (
              <button
                onClick={() => window.open(instagramUrl, '_blank')}
                className="absolute top-2 right-2 z-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                title="Ver no Instagram"
              >
                <Instagram size={isVerticalAspect ? 20 : 24} />
              </button>
            )}
            <iframe
              src={streamingUrl}
              title={title}
              className="absolute top-0 left-0 w-full h-full border-0"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              loading="lazy"
              style={{ 
                width: '100%', 
                height: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: '#000',
                display: 'block',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      );
    } else {
      // Para URLs diretas de vídeo, usar CustomVideoPreview
      return (
        <div className={`w-full ${className} relative`}>
          {instagramUrl && (
            <button
              onClick={() => window.open(instagramUrl, '_blank')}
              className="absolute top-2 right-2 z-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
              title="Ver no Instagram"
            >
              <Instagram size={isVerticalAspect ? 20 : 24} />
            </button>
          )}
          <CustomVideoPreview
            videoUrl={streamingUrl}
            title={title}
            aspectRatio={aspectRatio}
            className="w-full h-full"
            showControls={true}
            autoPlay={false}
          />
        </div>
      );
    }
  }

  if (!isVideo && streamingUrl) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`${getAspectRatioClass()} overflow-hidden rounded-lg bg-gray-100`}>
          {instagramUrl && (
            <button
              onClick={() => window.open(instagramUrl, '_blank')}
              className="absolute top-2 right-2 z-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
              title="Ver no Instagram"
            >
              <Instagram size={isVerticalAspect ? 20 : 24} />
            </button>
          )}
          <img
            src={streamingUrl}
            alt={title}
            className="absolute top-0 left-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => setError('Erro ao carregar imagem')}
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
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