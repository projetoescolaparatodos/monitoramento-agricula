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

const MobileSingleCarousel: React.FC<{ mediaItems: MediaItem[] }> = ({ mediaItems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = 6000; // 6 segundos

  // Auto scroll que para quando há interação
  useEffect(() => {
    if (!autoScroll || mediaItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex >= mediaItems.length ? 0 : nextIndex;
      });
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [mediaItems.length, autoScroll]);

  // Funções para controle touch/swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setAutoScroll(false); // Para o auto scroll quando usuário interage
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < mediaItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Para o auto scroll quando usuário clica nos indicadores
  const handleIndicatorClick = (index: number) => {
    setCurrentIndex(index);
    setAutoScroll(false);
  };

  if (mediaItems.length === 0) return null;

  return (
    <div className="mobile-single-carousel w-full max-w-full overflow-hidden">
      {/* Carrossel com uma mídia por linha */}
      <div className="carousel-line relative w-full overflow-hidden">
        <div 
          ref={containerRef}
          className="carousel-items-container flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            width: `${mediaItems.length * 100}%`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {mediaItems.map((item, index) => (
            <div 
              key={`mobile-${item.id}-${index}`}
              className="carousel-item flex-shrink-0 px-4"
              style={{ 
                width: `${100 / mediaItems.length}%`,
                minWidth: `${100 / mediaItems.length}%`,
                maxWidth: `${100 / mediaItems.length}%`
              }}
              onClick={() => setAutoScroll(false)} // Para auto scroll ao clicar no card
            >
              <div className="w-full max-w-sm mx-auto">
                <MediaDisplay 
                  item={item} 
                  className="w-full h-auto" 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botões de navegação lateral (opcionais para mobile) */}
        {!autoScroll && (
          <>
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10 transition-opacity ${
                currentIndex === 0 ? 'opacity-30' : 'opacity-70 hover:opacity-100'
              }`}
              disabled={currentIndex === 0}
            >
              ←
            </button>
            <button
              onClick={() => currentIndex < mediaItems.length - 1 && setCurrentIndex(currentIndex + 1)}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10 transition-opacity ${
                currentIndex === mediaItems.length - 1 ? 'opacity-30' : 'opacity-70 hover:opacity-100'
              }`}
              disabled={currentIndex === mediaItems.length - 1}
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Indicadores de navegação interativos */}
      <div className="flex justify-center mt-6 space-x-2">
        {mediaItems.map((_, index) => (
          <button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
              index === currentIndex 
                ? 'bg-green-600 w-6' 
                : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Ir para mídia ${index + 1}`}
          />
        ))}
      </div>

      {/* Status do auto scroll */}
      {!autoScroll && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setAutoScroll(true)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ▶ Reativar rotação automática
          </button>
        </div>
      )}
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
              <MobileSingleCarousel mediaItems={mediaItems} />
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