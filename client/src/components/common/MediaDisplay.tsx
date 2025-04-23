
import React from 'react';
import { MediaItem } from '@/types';
import { isYoutubeUrl, getYoutubeVideoId } from '@/utils/mediaUtils';

interface MediaDisplayProps {
  item: MediaItem;
  className?: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ item, className = '' }) => {
  // Determinar o tipo de mídia - imagem, vídeo do YouTube ou outro
  const getMediaType = (item: MediaItem) => {
    if (item.mediaType === 'video' || (item.mediaUrl && isYoutubeUrl(item.mediaUrl))) {
      return 'video';
    }
    return item.mediaType || 'image';
  };

  const mediaType = getMediaType(item);

  return (
    <div className={`media-display overflow-hidden rounded-lg shadow-md ${className}`}>
      {mediaType === 'image' ? (
        <div className="relative group h-48">
          <img
            src={item.mediaUrl}
            alt={item.title || 'Imagem'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4 text-white">
              {item.title && <h4 className="font-heading font-semibold">{item.title}</h4>}
              {item.description && <p className="text-sm opacity-90 mt-1">{item.description}</p>}
            </div>
          </div>
        </div>
      ) : mediaType === 'video' ? (
        <div className="relative h-48">
          <iframe 
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${getYoutubeVideoId(item.mediaUrl || '')}`}
            title={item.title || 'Vídeo do YouTube'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
            {item.title && <h4 className="font-heading font-semibold text-white text-sm">{item.title}</h4>}
          </div>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Mídia não suportada</p>
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;
