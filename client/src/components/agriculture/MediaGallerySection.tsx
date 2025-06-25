import React from 'react';
import { MediaItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MediaDisplay from '@/components/common/MediaDisplay';
// Já utiliza o componente MediaDisplay que terá os parâmetros atualizados

interface MediaGallerySectionProps {
  mediaItems?: MediaItem[];
  isLoading?: boolean;
}

const MediaGallerySection: React.FC<MediaGallerySectionProps> = ({ mediaItems, isLoading }) => {
  return (
    <section id="media" className="py-12 bg-neutral-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">Galeria de Mídia</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
          Imagens e vídeos relacionados às atividades agrícolas em nossa região
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item) => {
              const isVerticalVideo = item.mediaType === 'video' && 
                (item.aspectRatio === 'vertical' || 
                item.aspectRatio === '9:16' ||
                item.aspectRatio === '4:5' ||
                (item.title && item.title.toLowerCase().includes('vertical')) ||
                (item.title && item.title.toLowerCase().includes('instagram')) ||
                (item.title && item.title.toLowerCase().includes('reels')) ||
                (item.title && item.title.toLowerCase().includes('tiktok')));
              
              return (
                <div key={item.id} className={`${isVerticalVideo ? 'flex justify-center md:col-span-1' : ''}`}>
                  <MediaDisplay 
                    item={item} 
                    className={`hover:scale-105 transition-all duration-300 hover:shadow-xl ${
                      isVerticalVideo ? 'w-full max-w-[400px] aspect-[9/16]' : 'w-full'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
            <p className="text-gray-500 dark:text-gray-400">Nenhuma mídia disponível no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaGallerySection;