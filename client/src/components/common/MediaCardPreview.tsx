
import React from 'react';
import { Link } from 'wouter';
import { MediaItem } from '@/types';
import { isYoutubeUrl, getYoutubeEmbedUrl } from '@/utils/mediaUtils';

interface MediaCardPreviewProps {
  item: MediaItem;
}

const MediaCardPreview: React.FC<MediaCardPreviewProps> = ({ item }) => {
  // Determinar a página de destino com base no pageType
  const getDestinationPage = () => {
    switch (item.pageType) {
      case 'agriculture':
        return '/agriculture/info';
      case 'fishing':
        return '/fishing/info';
      case 'paa':
        return '/paa';
      default:
        return '/media-gallery';
    }
  };

  // Determinar se é vídeo do Youtube
  const isYouTubeVideo = item.mediaUrl && isYoutubeUrl(item.mediaUrl);
  // Determinar se é vídeo do Firebase
  const isFirebaseVideo = item.mediaType === 'video' && item.mediaUrl?.includes('firebasestorage.googleapis.com');

  return (
    <Link href={getDestinationPage()}>
      <div className="w-full h-full group relative overflow-hidden">
        {/* Badge indicando a origem */}
        <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs rounded-full px-2 py-1">
          {item.pageType === 'agriculture' && 'Agricultura'}
          {item.pageType === 'fishing' && 'Pesca'}
          {item.pageType === 'paa' && 'PAA'}
          {!item.pageType && 'Geral'}
        </div>
        
        {/* Renderização de mídia específica */}
        {isYouTubeVideo ? (
          <iframe
            className="w-full h-full object-cover"
            src={getYoutubeEmbedUrl(item.mediaUrl)}
            title={item.title || "Vídeo do YouTube"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isFirebaseVideo ? (
          <video 
            className="w-full h-full object-cover"
            src={item.mediaUrl}
            poster={item.thumbnailUrl || ''}
            muted
            playsInline
            loop
          />
        ) : (
          <img 
            src={item.mediaUrl || item.thumbnailUrl || ''}
            alt={item.title || "Imagem"}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        )}
        
        {/* Overlay com titulo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          {item.title && (
            <div className="text-white text-sm font-medium line-clamp-2">
              {item.title.replace(/<[^>]*>/g, '')}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MediaCardPreview;
