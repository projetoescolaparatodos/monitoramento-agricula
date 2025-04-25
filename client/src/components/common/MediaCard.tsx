
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isYoutubeUrl } from '@/utils/isYoutubeUrl';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
              className="w-full h-full"
              title={title}
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      } else {
        return (
          <div className="aspect-video w-full">
            <video 
              src={mediaUrl} 
              controls 
              className="w-full h-full"
              title={title}
            />
          </div>
        );
      }
    } else {
      return (
        <div className="aspect-video w-full flex items-center justify-center bg-muted">
          <img
            src={mediaUrl}
            alt={title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }
  };

  return (
    <Card className="overflow-hidden shadow-md border-0">
      {renderMedia()}
      <CardContent className="p-4">
        <h3 className="font-semibold text-base mb-2">{title}</h3>
        <div className="text-sm text-muted-foreground">
          {isMobile ? (expanded ? description : previewText) : description}
        </div>
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-primary w-full flex items-center justify-center gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <span>Mostrar menos</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>Saiba mais</span>
                <ChevronDown size={16} />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaCard;
