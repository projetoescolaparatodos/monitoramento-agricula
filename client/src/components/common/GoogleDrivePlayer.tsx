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
        // Adicionar parâmetros para melhor controle de vídeo
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
    // Usar diferentes abordagens de URL para autoplay
    const fileId = getGoogleDriveFileId(mediaUrl);
    
    // Tentar URLs diferentes para maximizar compatibilidade
    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview?usp=sharing`;
    
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
          
          {/* Botão de Play manual para garantir que funcione */}
          <button
            onClick={() => {
              const iframe = document.querySelector(`iframe[data-file-id="${fileId}"]`) as HTMLIFrameElement;
              if (iframe && iframe.contentWindow) {
                // Simular clique no centro do iframe
                const rect = iframe.getBoundingClientRect();
                const clickEvent = new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  clientX: rect.left + rect.width / 2,
                  clientY: rect.top + rect.height / 2
                });
                iframe.dispatchEvent(clickEvent);
                
                // Métodos adicionais
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                iframe.focus();
                
                // Ocultar overlay temporariamente
                (event?.target as HTMLElement)?.style.setProperty('display', 'none');
                
                // Pausar após 1 segundo e mostrar overlay novamente
                setTimeout(() => {
                  iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                  (event?.target as HTMLElement)?.style.setProperty('display', 'flex');
                }, 1000);
              }
            }}
            className="absolute inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-300 group"
            title="Reproduzir vídeo"
          >
            <div className="bg-white bg-opacity-20 rounded-full p-4 group-hover:bg-opacity-30 transition-all duration-300 group-hover:scale-110">
              <Play size={48} className="text-white fill-white ml-1" />
            </div>
          </button>

          <iframe
            src={embedUrl}
            title={title}
            data-file-id={fileId}
            className="w-full h-full border-0 max-w-full max-h-full"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            loading="lazy"
            style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}
            onLoad={() => {
              console.log('🎥 Vídeo do Google Drive carregado');
              
              // Autoplay automático após carregar
              setTimeout(() => {
                try {
                  const iframe = document.querySelector(`iframe[data-file-id="${fileId}"]`) as HTMLIFrameElement;
                  if (iframe && iframe.contentWindow) {
                    console.log('🚀 Iniciando autoplay automático...');
                    
                    // Método 1: Simular clique no centro do iframe (mais efetivo)
                    const rect = iframe.getBoundingClientRect();
                    const clickEvent = new MouseEvent('click', {
                      view: window,
                      bubbles: true,
                      cancelable: true,
                      clientX: rect.left + rect.width / 2,
                      clientY: rect.top + rect.height / 2
                    });
                    iframe.dispatchEvent(clickEvent);
                    
                    // Método 2: PostMessage para Google Drive
                    setTimeout(() => {
                      iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    }, 200);
                    
                    // Método 3: Tentar focus + space key
                    setTimeout(() => {
                      iframe.focus();
                      const spaceKeyEvent = new KeyboardEvent('keydown', {
                        key: ' ',
                        code: 'Space',
                        keyCode: 32,
                        bubbles: true
                      });
                      iframe.dispatchEvent(spaceKeyEvent);
                    }, 400);
                    
                    // Remover overlay de play após iniciar
                    setTimeout(() => {
                      const playButton = document.querySelector(`button[title="Reproduzir vídeo"]`);
                      if (playButton) {
                        (playButton as HTMLElement).style.display = 'none';
                      }
                    }, 800);
                    
                    // Pausar após 1 segundo de reprodução
                    setTimeout(() => {
                      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                      console.log('⏸️ Vídeo pausado automaticamente após 1 segundo');
                      
                      // Mostrar overlay de play novamente
                      const playButton = document.querySelector(`button[title="Reproduzir vídeo"]`);
                      if (playButton) {
                        (playButton as HTMLElement).style.display = 'flex';
                      }
                    }, 1800); // 800ms para iniciar + 1000ms de reprodução
                    
                  }
                } catch (error) {
                  console.log('❌ Erro ao tentar autoplay:', error);
                }
              }, 500); // Reduzido para 500ms para resposta mais rápida
            }}
          />
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
            className="w-full h-full object-contain max-w-full max-h-full"
            loading="lazy"
            onError={() => setError('Erro ao carregar imagem')}
            style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}
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