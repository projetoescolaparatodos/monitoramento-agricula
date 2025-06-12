
import React from 'react';
import { MediaItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MediaDisplay from '@/components/common/MediaDisplay';
import { isGoogleDriveLink, getGoogleDriveFileId, getGoogleDriveThumbnail } from '@/utils/driveHelper';
import { Instagram } from 'lucide-react';

interface HomeMediaGallerySectionProps {
  mediaItems?: MediaItem[];
  isLoading?: boolean;
  variant?: "default" | "transparent";
}

// Componente otimizado para preview de mídia na página inicial
const MediaPreviewCard: React.FC<{ item: MediaItem }> = ({ item }) => {
  const isGoogleDriveMedia = item.mediaUrl && isGoogleDriveLink(item.mediaUrl);
  const isVerticalVideo = item.mediaType === 'video' && 
    (item.aspectRatio === 'vertical' || 
    (item.title && item.title.toLowerCase().includes('vertical')) ||
    (item.title && item.title.toLowerCase().includes('instagram')));

  // Para vídeos do Google Drive, usar thumbnail otimizado
  const getThumbnailUrl = () => {
    if (isGoogleDriveMedia && item.mediaType === 'video') {
      const fileId = getGoogleDriveFileId(item.mediaUrl || '');
      if (fileId) {
        return getGoogleDriveThumbnail(fileId, 800); // Thumbnail em alta resolução
      }
    }
    return item.thumbnailUrl || item.mediaUrl;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <Card className={`media-card overflow-hidden shadow-md border-0 bg-gradient-to-b from-white to-green-50/50 dark:from-zinc-900 dark:to-zinc-900/95 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 ${isVerticalVideo ? 'max-w-[400px] mx-auto' : ''}`}>
      <div className="relative">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={item.title || 'Mídia'}
            className={`w-full object-cover rounded-t-xl ${
              isVerticalVideo 
                ? 'aspect-[9/16] max-h-[400px]' 
                : 'aspect-video max-h-[300px]'
            }`}
            loading="lazy"
            onError={(e) => {
              // Fallback para URL original se thumbnail falhar
              const target = e.target as HTMLImageElement;
              if (target.src !== item.mediaUrl && item.mediaUrl) {
                target.src = item.mediaUrl;
              }
            }}
          />
        ) : (
          <div className={`w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-xl ${
            isVerticalVideo ? 'aspect-[9/16] max-h-[400px]' : 'aspect-video max-h-[300px]'
          }`}>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Sem preview</p>
          </div>
        )}

        {/* Indicador de vídeo */}
        {item.mediaType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-xl opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 rounded-full p-3">
              <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Ícone do Instagram se disponível */}
        {item.instagramUrl && (
          <button
            onClick={() => window.open(item.instagramUrl, '_blank')}
            className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
            title="Ver no Instagram"
          >
            <Instagram size={16} />
          </button>
        )}
      </div>

      <CardContent className="p-4">
        {item.title && (
          <h3 className="font-semibold text-lg mb-2 text-green-800 dark:text-green-300 line-clamp-2">
            {/<\/?[a-z][\s\S]*>/i.test(item.title) ? (
              <div dangerouslySetInnerHTML={{ __html: item.title }} />
            ) : (
              item.title
            )}
          </h3>
        )}

        {item.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
            {item.description.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Metadados compactos */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {item.author && (
            <span className="truncate">{item.author}</span>
          )}
          {item.mediaType === 'video' && (
            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
              Vídeo
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const HomeMediaGallerySection: React.FC<HomeMediaGallerySectionProps> = ({ mediaItems, isLoading, variant = "default" }) => {
  return (
    <section id="home-media" className="py-12">
      <div className="container mx-auto px-4 mb-12">
        <h2 className={`text-4xl font-bold mb-4 text-center ${variant === "transparent" ? "text-white" : "text-gray-800 dark:text-white"}`}>
          Destaques da Semapa
        </h2>
        <div className="max-w-3xl mx-auto">
          <p className={`text-xl md:text-2xl font-medium tracking-wide max-w-3xl mx-auto ${variant === "transparent" ? "text-white" : "text-gray-700 dark:text-gray-200"} mb-6 text-center border-l-4 border-r-4 border-green-600/40 px-12 py-6`}>
            Fique por dentro dos projetos que estão transformando o setor agropecuário e pesqueiro do nosso município.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
                <Skeleton className="w-full aspect-video" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : mediaItems && mediaItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item) => {
              const isVerticalVideo = item.mediaType === 'video' && 
                (item.aspectRatio === 'vertical' || 
                (item.title && item.title.toLowerCase().includes('vertical')) ||
                (item.title && item.title.toLowerCase().includes('instagram')));
              
              return (
                <div key={item.id} className={`${isVerticalVideo ? 'md:col-span-1' : ''}`}>
                  <MediaPreviewCard item={item} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
            <p className={`${variant === "transparent" ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}>
              Nenhuma mídia disponível no momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeMediaGallerySection;
