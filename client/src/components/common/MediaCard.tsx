
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isYoutubeUrl } from '@/utils/isYoutubeUrl';
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
  const isMobile = useIsMobile();
  
  // Limitar a 100 caracteres em dispositivos móveis
  const previewLength = 100;
  const shouldTruncate = isMobile && description.length > previewLength;
  const previewText = shouldTruncate ? description.slice(0, previewLength) + '...' : description;

  // Verificar se é um URL do YouTube e obter o ID do vídeo
  const renderMedia = () => {
    if (mediaType === 'video') {
      if (isYoutubeUrl(mediaUrl)) {
        // Extrair o ID do vídeo do YouTube
        const videoId = mediaUrl.includes('youtu.be') 
          ? mediaUrl.split('/').pop() 
          : new URLSearchParams(new URL(mediaUrl).search).get('v');
        
        return (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&controls=1`}
              className="w-full h-full"
              title={title}
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      } else {
        return (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <video 
              src={mediaUrl} 
              controls 
              className="w-full h-full object-cover"
              title={title}
            />
          </div>
        );
      }
    } else {
      return (
        <div className="aspect-video w-full flex items-center justify-center bg-muted/40 rounded-t-lg overflow-hidden">
          <img
            src={mediaUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
  };

  return (
    <Card className="overflow-hidden shadow-md border-0 transition-all duration-300 hover:shadow-lg">
      {renderMedia()}
      <CardContent className="p-4 bg-gradient-to-b from-white to-green-50/50 dark:from-zinc-900 dark:to-zinc-900/95">
        <h3 className="font-semibold text-base mb-2 text-green-800 dark:text-green-300">{title}</h3>
        
        <AnimatePresence initial={false}>
          {isMobile ? (
            <>
              <motion.div 
                className="text-sm text-gray-700 dark:text-gray-300 prose-sm"
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
                  // Se o texto contém tags HTML, removê-las para a preview
                  <p dangerouslySetInnerHTML={{ 
                    __html: shouldTruncate 
                      ? previewText.replace(/<[^>]*>/g, '') + '...'
                      : previewText.replace(/\n/g, '<br/>') 
                  }} />
                )}
              </motion.div>
              
              {shouldTruncate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-primary w-full flex items-center justify-center gap-1 group hover:bg-primary/10"
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
            </>
          ) : (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {description.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-2">{paragraph}</p>
              ))}
            </div>
          )}
        </AnimatePresence>
        
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
