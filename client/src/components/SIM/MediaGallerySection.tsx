import React from 'react';
import { FirebaseMediaItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MediaDisplay from '@/components/common/MediaDisplay';

interface MediaGallerySectionProps {
  mediaItems?: FirebaseMediaItem[];
  isLoading?: boolean;
}

const MediaGallerySection: React.FC<MediaGallerySectionProps> = ({ mediaItems, isLoading }) => {
  return (
    <div className="container mx-auto">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden bg-white/10 backdrop-blur-sm border-0 rounded-xl">
              <Skeleton className="w-full aspect-video" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : mediaItems && mediaItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item) => {
            const isVerticalVideo = item.mediaType === 'video' && 
              (item.aspectRatio === 'vertical' || 
              item.title?.toLowerCase().includes('vertical') ||
              item.title?.toLowerCase().includes('instagram'));
            
            return (
              <div key={item.id} className={`${isVerticalVideo ? 'md:col-span-1' : ''}`}>
                <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border-0 rounded-xl hover:scale-105 transition-transform duration-300">
                  <MediaDisplay item={item} />
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12 bg-white/10 backdrop-blur-sm border-0 rounded-xl">
          <p className="text-white/80">Nenhuma mídia disponível no momento.</p>
        </Card>
      )}
    </div>
  );
};

export default MediaGallerySection;