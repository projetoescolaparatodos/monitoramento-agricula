import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isYoutubeUrl } from '@/utils/isYoutubeUrl';
import { isGoogleDriveLink } from '@/utils/driveHelper';
import GoogleDrivePlayer from './GoogleDrivePlayer';
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
  const videoRef = React.useRef<HTMLVideoElement>(null);

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
      // 1. Primeiro verifica Google Drive
      if (isGoogleDriveLink(mediaUrl)) {
        return (
          <div className="w-full">
            <GoogleDrivePlayer
              mediaUrl={mediaUrl}
              title={title}
              aspectRatio={isVerticalVideo ? 'vertical' : 'horizontal'}
              className="w-full"
            />
          </div>
        );
      }
      
      // 2. Depois verifica YouTube
      if (isYoutubeUrl(mediaUrl)) {
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
      // Para imagens, verificar se é Google Drive
      if (isGoogleDriveLink(mediaUrl)) {
        return (
          <div className="w-full">
            <GoogleDrivePlayer
              mediaUrl={mediaUrl}
              title={title}
              aspectRatio="horizontal"
              className="w-full"
            />
          </div>
        );
      }
      
      return (
        <div className="w-full mx-auto">
          <div className="w-full overflow-hidden bg-black/5 rounded-t-xl">
            <img
              src={mediaUrl}
              alt={title}
              className={`w-full h-auto object-contain`}
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