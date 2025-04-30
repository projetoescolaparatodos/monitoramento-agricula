
import React from 'react';
import { MediaItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MediaDisplay from '@/components/common/MediaDisplay';

interface HomeMediaGallerySectionProps {
  mediaItems?: MediaItem[];
  isLoading?: boolean;
  variant?: "default" | "transparent";
}

const HomeMediaGallerySection: React.FC<HomeMediaGallerySectionProps> = ({ mediaItems, isLoading, variant = "default" }) => {
  return (
    <section id="home-media" className="py-12">
      <div className="w-full bg-gradient-to-r from-green-700/90 via-green-600 to-green-700/90 py-3 mb-8 shadow-md">
        <div className="container mx-auto px-4 flex items-center">
          <div className="w-1/6 border-t border-white/30 mr-4 hidden md:block"></div>
          <div className="flex-grow text-center">
            <span className="text-white text-sm uppercase tracking-wider font-medium">Últimas Atualizações</span>
          </div>
          <div className="w-1/6 border-t border-white/30 ml-4 hidden md:block"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-2 text-center ${variant === "transparent" ? "text-white" : ""}`}>Destaques da Semapa</h2>
        <p className={`${variant === "transparent" ? "text-white/80" : "text-gray-600 dark:text-gray-400"} mb-8 text-center max-w-2xl mx-auto`}>
          Conheça as principais ações e iniciativas da Secretaria Municipal de Agricultura, Pesca e Abastecimento. Fique por dentro dos projetos que estão transformando o setor agropecuário e pesqueiro do nosso município.
        </p>

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
                  <MediaDisplay item={item} className="hover:scale-105 transition-transform" />
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
