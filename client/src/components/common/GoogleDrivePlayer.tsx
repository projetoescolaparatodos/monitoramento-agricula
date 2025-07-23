import React, { useState, useEffect } from 'react';
import { 
  getGoogleDriveFileId, 
  getGoogleDriveFileMetadata, 
  getGoogleDriveStreamingUrl,
  initializeGoogleDriveAPI,
  isGoogleDriveLink 
} from '@/utils/driveHelper';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Play, Instagram, ChevronLeft } from 'lucide-react';

interface GoogleDrivePlayerProps {
  mediaUrl: string;
  title?: string;
  className?: string;
  aspectRatio?: 'horizontal' | 'vertical' | 'square' | '9:16' | '16:9' | string;
  instagramUrl?: string;
  customThumbnail?: string;
  onVideoPlay?: () => void;
}

const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  mediaUrl,
  title = 'Mídia do Google Drive',
  className = '',
  aspectRatio = 'horizontal',
  instagramUrl,
  customThumbnail,
  onVideoPlay
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

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

        // Para garantir que não haja download, sempre assumir vídeo primeiro
        // e usar URL de preview que funciona tanto para vídeos quanto imagens
        const isLikelyVideo = mediaUrl.includes('video') || 
                             mediaUrl.includes('.mp4') || 
                             mediaUrl.includes('.avi') ||
                             mediaUrl.includes('.mov') ||
                             title?.toLowerCase().includes('video') ||
                             title?.toLowerCase().includes('vídeo');

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
    // Verificar se é proporção específica (ex: "9:16", "16:9")
    if (aspectRatio?.includes(':')) {
      const [width, height] = aspectRatio.split(':');
      return `aspect-[${width}/${height}]`;
    }

    // Proporções nomeadas
    switch (aspectRatio) {
      case 'vertical':
      case '9:16':
        return 'aspect-[9/16]';
      case 'square':
      case '1:1':
        return 'aspect-square';
      case 'horizontal':
      case '16:9':
      default:
        return 'aspect-video';
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
    // Se tem thumbnail personalizada e não está reproduzindo, mostrar preview
    if (customThumbnail && !isPlaying) {
      return (
        <div className={`w-full ${className}`}>
          <div className={`w-full ${getAspectRatioClass()} relative overflow-hidden rounded-lg bg-black cursor-pointer group`}>
            {instagramUrl && (
              <button
                onClick={() => window.open(instagramUrl, '_blank')}
                className="absolute top-3 right-3 z-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                title="Ver no Instagram"
              >
                <Instagram size={24} />
              </button>
            )}
            
            {/* Thumbnail personalizada */}
            <img
              src={customThumbnail}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Overlay com botão de play */}
            <div 
              className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-all duration-300"
              onClick={() => {
                setIsPlaying(true);
                onVideoPlay?.();
              }}
            >
              <div className="bg-white/90 rounded-full p-4 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Play size={32} className="text-gray-800 ml-1" fill="currentColor" />
              </div>
            </div>
            
            {/* Indicador de vídeo */}
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
              📹 Vídeo
            </div>
          </div>
        </div>
      );
    }

    // Modo de reprodução (ou sem thumbnail personalizada)
    return (
      <div className={`w-full ${className}`}>
        <div className={`w-full ${getAspectRatioClass()} relative overflow-hidden rounded-lg bg-black`}>
          {instagramUrl && (
            <button
              onClick={() => window.open(instagramUrl, '_blank')}
              className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
              title="Ver no Instagram"
            >
              <Instagram size={24} />
            </button>
          )}
          
          {/* Botão para voltar ao preview (se tem thumbnail personalizada) */}
          {customThumbnail && isPlaying && (
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-3 left-3 z-10 bg-black/70 text-white p-2 rounded-full shadow-lg hover:bg-black/90 transition-all duration-200"
              title="Voltar ao preview"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          
          <iframe
            src={streamingUrl}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            loading="lazy"
            onLoad={() => {
              setVideoLoaded(true);
              console.log('Google Drive video iframe carregado');
            }}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              border: 'none',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
          
          {/* Loading indicator para Google Drive videos */}
          {!videoLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-500 text-sm">Carregando vídeo...</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isVideo && streamingUrl) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`w-full ${getAspectRatioClass()} relative overflow-hidden rounded-lg bg-gray-100`}>
          {instagramUrl && (
            <button
              onClick={() => window.open(instagramUrl, '_blank')}
              className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
              title="Ver no Instagram"
            >
              <Instagram size={24} />
            </button>
          )}
          <img
            src={streamingUrl}
            alt={title}
            className="w-full h-full object-cover"
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
    <div className={`w-full ${className}`}>
      <div className={`w-full ${getAspectRatioClass()} bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden`}>
        <p className="text-gray-500 text-sm">Formato não suportado</p>
      </div>
    </div>
  );
};

export default GoogleDrivePlayer;