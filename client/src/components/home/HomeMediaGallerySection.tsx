
import React, { useState, useRef, useEffect } from 'react';
import { MediaItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import MediaDisplay from '@/components/common/MediaDisplay';
import { useIsMobile } from '@/hooks/use-mobile';

interface HomeMediaGallerySectionProps {
  mediaItems?: MediaItem[];
  isLoading?: boolean;
  variant?: "default" | "transparent";
}

const MobileDoubleCarousel: React.FC<{ mediaItems: MediaItem[] }> = ({ mediaItems }) => {
  const [currentScroll1, setCurrentScroll1] = useState(0);
  const [currentScroll2, setCurrentScroll2] = useState(1); // Começa deslocado
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const scrollStep = 1; // Movimentação suave
  const visibleItems = 1; // 1 item visível por linha no mobile
  const autoScrollInterval = 3000; // 3 segundos

  useEffect(() => {
    const interval = setInterval(() => {
      if (!itemRef.current || mediaItems.length === 0) return;

      const itemWidth = itemRef.current.offsetWidth + 16; // 16px de gap
      const maxScroll = (mediaItems.length - visibleItems) * itemWidth;

      setCurrentScroll1(prev => {
        const newScroll = prev + (scrollStep * itemWidth);
        return newScroll >= maxScroll ? 0 : newScroll;
      });

      setCurrentScroll2(prev => {
        const newScroll = prev - (scrollStep * itemWidth);
        return newScroll <= 0 ? maxScroll : newScroll;
      });
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [mediaItems.length, visibleItems, scrollStep]);

  if (mediaItems.length === 0) return null;

  return (
    <div className="mobile-double-carousel space-y-4">
      {/* Primeira linha - movimento para direita */}
      <div className="carousel-line overflow-hidden">
        <div 
          ref={containerRef1}
          className="carousel-items-container flex gap-4 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentScroll1}px)`,
          }}
        >
          {mediaItems.map((item, index) => (
            <div 
              key={`line1-${item.id}-${index}`}
              ref={index === 0 ? itemRef : undefined}
              className="carousel-item flex-shrink-0 w-full"
            >
              <MediaDisplay 
                item={item} 
                className="h-full transform hover:scale-105 transition-transform duration-300" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Segunda linha - movimento para esquerda */}
      <div className="carousel-line overflow-hidden">
        <div 
          ref={containerRef2}
          className="carousel-items-container flex gap-4 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentScroll2}px)`,
          }}
        >
          {mediaItems.map((item, index) => (
            <div 
              key={`line2-${item.id}-${index}`}
              className="carousel-item flex-shrink-0 w-full"
            >
              <MediaDisplay 
                item={item} 
                className="h-full transform hover:scale-105 transition-transform duration-300" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores de navegação */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array(mediaItems.length).fill(0).map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 opacity-60"
          />
        ))}
      </div>
    </div>
  );
};

const HomeMediaGallerySection: React.FC<HomeMediaGallerySectionProps> = ({ mediaItems, isLoading, variant = "default" }) => {
  const isMobile = useIsMobile();

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
          <div className="relative">
            {isMobile ? (
              <div className="space-y-4">
                {/* Skeleton para carrossel duplo mobile */}
                <div className="flex gap-4">
                  {Array(2).fill(0).map((_, index) => (
                    <Card key={`skeleton-1-${index}`} className="flex-1 overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
                      <Skeleton className="w-full aspect-video" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-4">
                  {Array(2).fill(0).map((_, index) => (
                    <Card key={`skeleton-2-${index}`} className="flex-1 overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
                      <Skeleton className="w-full aspect-video" />
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {Array(6).fill(0).map((_, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card className="overflow-hidden bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
                        <Skeleton className="w-full aspect-video" />
                        <CardContent className="p-4 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-12 bg-black/70 text-white hover:bg-black/90 border-0" />
                <CarouselNext className="hidden md:flex -right-12 bg-black/70 text-white hover:bg-black/90 border-0" />
              </Carousel>
            )}
          </div>
        ) : mediaItems && mediaItems.length > 0 ? (
          <div className="relative">
            {isMobile ? (
              <MobileDoubleCarousel mediaItems={mediaItems} />
            ) : (
              <Carousel 
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {mediaItems.map((item) => {
                    const isVerticalVideo = item.mediaType === 'video' && 
                      (item.aspectRatio === 'vertical' || 
                      (item.title && item.title.toLowerCase().includes('vertical')) ||
                      (item.title && item.title.toLowerCase().includes('instagram')));
                    
                    return (
                      <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="h-full">
                          <MediaDisplay 
                            item={item} 
                            className="hover:scale-105 transition-transform duration-300 h-full" 
                          />
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                
                {/* Botões de navegação - estilo Netflix */}
                <CarouselPrevious className="hidden md:flex -left-12 bg-black/70 text-white hover:bg-black/90 border-0 w-12 h-12" />
                <CarouselNext className="hidden md:flex -right-12 bg-black/70 text-white hover:bg-black/90 border-0 w-12 h-12" />
              </Carousel>
            )}
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
