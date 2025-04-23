
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MediaItem } from '@/types';
import MediaDisplay from '@/components/common/MediaDisplay';
import { Skeleton } from '@/components/ui/skeleton';

const MediaGallerySection = () => {
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items?pageType=agriculture'],
  });

  const displayItems = mediaItems?.slice(0, 4);

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl font-bold mb-2">Galeria de Mídia</h2>
        <p className="text-gray-600 mb-8">Imagens e vídeos das atividades agrícolas em Vitória do Xingu</p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
              </div>
            ))}
          </div>
        ) : displayItems && displayItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayItems.map((item) => (
              <MediaDisplay key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-neutral-dark">Nenhuma mídia disponível no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaGallerySection;
