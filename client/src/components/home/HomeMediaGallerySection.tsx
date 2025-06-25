
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

const HomeMediaGallerySection: React.FC<HomeMediaGallerySectionProps> = ({ mediaItems, isLoading, variant = "default" }) => {
  const [currentScroll, setCurrentScroll] = useState([0, 0]); // [linha1, linha2]
  const containerRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const itemRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Configurações para mobile
  const scrollStep = 1; // Move 1 item por vez
  const visibleItems = 1; // 1 item por linha no mobile

  const handleScroll = (lineIndex: number, direction: 'next' | 'prev') => {
    if (!containerRefs[lineIndex].current || !itemRef.current || !mediaItems) return;
    
    const itemWidth = itemRef.current.offsetWidth + 16; // Largura do item + gap
    const maxScroll = (mediaItems.length - visibleItems) * itemWidth;
    
    setCurrentScroll(prev => {
      const newScroll = prev.map((scroll, idx) => {
        if (idx !== lineIndex) return scroll;
        
        return direction === 'next' 
          ? Math.min(scroll + (scrollStep * itemWidth), maxScroll)
          : Math.max(scroll - (scrollStep * itemWidth), 0);
      });
      return newScroll;
    });
  };

  // Divide as mídias em duas sequências deslocadas para mobile
  const getMediaSequence = (lineIndex: number) => {
    if (!mediaItems || !isMobile) return mediaItems || [];
    
    const offset = Math.floor(mediaItems.length / 2) * lineIndex;
    return [
      ...mediaItems.slice(offset),
      ...mediaItems.slice(0, offset)
    ];
  };

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
          </div>
        ) : mediaItems && mediaItems.length > 0 ? (
          <div className="mobile-gallery-container">
            {/* Versão desktop - única linha */}
            {!isMobile && (
              <div className="relative">
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
              </div>
            )}

            {/* Versão mobile - duas linhas independentes */}
            {isMobile && [0, 1].map(lineIndex => (
              <div key={lineIndex} className="mobile-gallery-line mb-6">
                <div className="media-scroll-wrapper overflow-hidden">
                  <div 
                    ref={containerRefs[lineIndex]}
                    className="media-items-container flex gap-4 transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentScroll[lineIndex]}px)`,
                    }}
                  >
                    {getMediaSequence(lineIndex).map((item, index) => (
                      <div 
                        key={`${lineIndex}-${item.id}`} 
                        ref={lineIndex === 0 && index === 0 ? itemRef : null} 
                        className="media-item flex-shrink-0 w-full"
                      >
                        <MediaDisplay 
                          item={item} 
                          className="w-full h-full transition-transform duration-300" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mobile-line-controls flex justify-center gap-5 mt-3">
                  <button 
                    className="nav-button bg-black/70 text-white border-none w-10 h-10 rounded-full cursor-pointer text-lg hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                    onClick={() => handleScroll(lineIndex, 'prev')}
                    disabled={currentScroll[lineIndex] <= 0}
                  >
                    ‹
                  </button>
                  <button 
                    className="nav-button bg-black/70 text-white border-none w-10 h-10 rounded-full cursor-pointer text-lg hover:bg-black/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                    onClick={() => handleScroll(lineIndex, 'next')}
                    disabled={currentScroll[lineIndex] >= (getMediaSequence(lineIndex).length - 1) * (itemRef.current?.offsetWidth || 0)}
                  >
                    ›
                  </button>
                </div>
              </div>
            ))}
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
