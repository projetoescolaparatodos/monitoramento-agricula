import React from 'react';
import { MediaItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { isYoutubeUrl, getYoutubeEmbedUrl } from '@/utils/isYoutubeUrl';

interface MediaDisplayProps {
  item: MediaItem;
  className?: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ item, className = "" }) => {
  // Renderização de vídeos do YouTube
  if (item.mediaUrl && isYoutubeUrl(item.mediaUrl)) {
    const embedUrl = getYoutubeEmbedUrl(item.mediaUrl);
    if (!embedUrl) return null;

    return (
      <Card className={`overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl shadow-md ${className}`}>
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full rounded-t-lg"
            src={embedUrl}
            title={item.title || "Vídeo do YouTube"}
            allowFullScreen
          />
        </div>
        <CardContent className="p-4">
          {item.title && <h3 className="font-medium text-lg mb-1">{item.title}</h3>}
          {item.description && <p className="text-gray-600 dark:text-gray-400">{item.description}</p>}
        </CardContent>
      </Card>
    );
  }

  // Renderização padrão para imagens e outros tipos de mídia
  return (
    <Card className={`overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl shadow-md ${className}`}>
      <img 
        src={item.mediaUrl} 
        alt={item.title || "Mídia"} 
        className="w-full object-cover aspect-video rounded-t-lg"
      />
      <CardContent className="p-4">
        {item.title && <h3 className="font-medium text-lg mb-1">{item.title}</h3>}
        {item.description && <p className="text-gray-600 dark:text-gray-400">{item.description}</p>}
      </CardContent>
    </Card>
  );
};

export default MediaDisplay;