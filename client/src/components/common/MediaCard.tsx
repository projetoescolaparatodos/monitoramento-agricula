import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isYoutubeUrl } from '@/utils/isYoutubeUrl';
import { isGoogleDriveLink, getGoogleDriveFileId } from '@/utils/driveHelper';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaCardProps {
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
}

const MediaCard: React.FC<MediaCardProps> = ({ title, description, mediaUrl, mediaType }) => {
  const [expanded, setExpanded] = useState(false);
  const [isVideoPortrait, setIsVideoPortrait] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const isMobile = useIsMobile();

  const previewLength = 100;
  const shouldTruncate = description.length > previewLength;
  const previewText = shouldTruncate ? description.slice(0, previewLength) + '...' : description;

  // Detectar orientação do vídeo ao carregar
  React.useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      const handleMetadata = () => {
        if (videoRef.current) {
          const { videoWidth, videoHeight } = videoRef.current;
          setIsVideoPortrait(videoHeight > videoWidth);
        }
      };

      videoRef.current.addEventListener('loadedmetadata', handleMetadata);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', handleMetadata);
        }
      };
    }
  }, [mediaType, mediaUrl]);

  // Detectar se é vídeo vertical a partir do título
  const isVerticalVideo = mediaType === 'video' && 
    (title.toLowerCase().includes('vertical') || 
     title.toLowerCase().includes('instagram') ||
     title.toLowerCase().includes('reels') ||
     title.toLowerCase().includes('tiktok'));

  const renderMedia = () => {
    if (mediaType === 'video') {
      // 1. Primeiro verifica se é Google Drive
      if (isGoogleDriveLink(mediaUrl)) {
        const fileId = getGoogleDriveFileId(mediaUrl);
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        const directUrl = `https://drive.google.com/file/d/${fileId}/view`;

        return (
          <div 
            className={`relative w-full bg-black ${
              isVerticalVideo ? 'aspect-[9/16] max-w-[400px] mx-auto' : 'aspect-video'
            }`}
            style={{
              minHeight: isVerticalVideo ? '400px' : '200px'
            }}
          >
            <iframe
              key={`drive-iframe-${fileId}`}
              ref={iframeRef}
              src={previewUrl}
              className="absolute top-0 left-0 w-full h-full border-0 rounded-t-xl"
              title={title}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; accelerometer; gyroscope"
              allowFullScreen
              frameBorder="0"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
              playsInline
              webkit-playsinline="true"
              style={{ 
                border: 'none',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
              onLoad={() => {
                console.log('Iframe do Google Drive carregado com sucesso');
                setIframeLoaded(true);
              }}
              onError={() => {
                console.error('Erro ao carregar iframe do Google Drive');
                setIframeLoaded(false);
              }}
            />

            {/* Fallback quando iframe falha */}
            {!iframeLoaded && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-800">
                <img
                  src={`https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`}
                  alt={`Thumbnail do vídeo: ${title}`}
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4 text-center"
                >
                  <div>
                    <p>Não foi possível carregar o vídeo.</p>
                    <p className="mt-2 underline">Clique para abrir no Google Drive</p>
                  </div>
                </a>
              </div>
            )}

            {/* Botão de fallback sempre visível */}
            <div className="absolute bottom-4 right-4 z-10">
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/90 text-black px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg hover:bg-white transition-colors"
              >
                <ExternalLink size={14} />
                <span>Abrir vídeo</span>
              </a>
            </div>
          </div>
        );
      } 
      // 2. Depois verifica YouTube
      else if (isYoutubeUrl(mediaUrl)) {
        const videoId = mediaUrl.includes('youtu.be') 
          ? mediaUrl.split('/').pop() 
          : new URLSearchParams(new URL(mediaUrl).search).get('v');

        return (
          <div className="w-full bg-black flex items-center justify-center">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&controls=1`}
              className={`w-full ${isVerticalVideo ? 'aspect-[9/16] max-w-[400px] mx-auto' : 'aspect-video'}`}
              title={title}
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      } else {
        return (
          <div className="w-full mx-auto">
            <div className={`${isVerticalVideo ? 'max-w-[400px] mx-auto' : 'w-full'} flex justify-center items-center bg-black rounded-xl overflow-hidden`}>
              <video
                ref={videoRef}
                src={mediaUrl}
                controls
                title={title}
                className={`${isVerticalVideo ? 'aspect-[9/16] max-h-[70vh] w-auto' : 'w-full h-auto object-contain aspect-video'}`}
              />
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="w-full mx-auto">
          <div className="w-full overflow-hidden bg-black/5 rounded-t-xl">
            <img
              src={mediaUrl}
              alt={title}
              className={`w-full h-auto object-contain ${isMobile ? 'max-h-[50vh]' : 'max-h-[60vh]'}`}
              onError={(e) => {
                // Fallback para Google Drive
                if (isGoogleDriveLink(mediaUrl)) {
                  const fileId = getGoogleDriveFileId(mediaUrl);
                  if (fileId) {
                    e.currentTarget.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                  }
                }
              }}
            />
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="overflow-hidden shadow-md border-0 bg-gradient-to-b from-white to-green-50/50 dark:from-zinc-900 dark:to-zinc-900/95">
      {renderMedia()}
      <CardContent className="p-4">
        {/<\/?[a-z][\s\S]*>/i.test(title) ? (
          <h3 
            className="font-semibold text-base mb-2 text-green-800 dark:text-green-300 media-title" 
            dangerouslySetInnerHTML={{ __html: title }}
          />
        ) : (
          <h3 className="font-semibold text-base mb-2 text-green-800 dark:text-green-300">{title}</h3>
        )}

        <AnimatePresence initial={false}>
          <motion.div 
            className="text-sm text-gray-700 dark:text-gray-300"
            initial={expanded ? { height: 0, opacity: 0 } : {}}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {expanded ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }}
              />
            ) : (
              <p dangerouslySetInnerHTML={{ 
                __html: shouldTruncate 
                  ? previewText.replace(/<[^>]*>/g, '') 
                  : previewText.replace(/\n/g, '<br/>') 
              }} />
            )}
          </motion.div>
        </AnimatePresence>

        {shouldTruncate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-primary w-full flex items-center justify-center gap-1 group hover:bg-primary/10"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <span>Mostrar menos</span>
                  <ChevronUp size={16} className="transition-transform group-hover:-translate-y-0.5" />
                </>
              ) : (
                <>
                  <span>Saiba mais</span>
                  <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {mediaType === 'video' && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <ExternalLink size={14} className="mr-1" />
            Vídeo
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaCard;