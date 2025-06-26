
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MediaItem } from '@/types';
import MediaDisplay from '@/components/common/MediaDisplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MediaCarouselSectionProps {
  mediaItems: MediaItem[];
}

const MediaCarouselSection: React.FC<MediaCarouselSectionProps> = ({ mediaItems }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const carousel2Ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const animationFrameRef = useRef<number>();
  const animationFrame2Ref = useRef<number>();
  const autoScrollTimer = useRef<NodeJS.Timeout>();
  const carouselApi1 = useRef<any>();
  const carouselApi2 = useRef<any>();

  // Configuração responsiva
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função para lidar com o auto-scroll
  const startAutoScroll = useCallback((api: any) => {
    if (!autoScrollEnabled) return;
    
    autoScrollTimer.current = setTimeout(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0); // Volta ao início
      }
      startAutoScroll(api);
    }, 5000);
  }, [autoScrollEnabled]);

  // Efeito para limpar o timer
  useEffect(() => {
    return () => {
      if (autoScrollTimer.current) {
        clearTimeout(autoScrollTimer.current);
      }
    };
  }, []);

  // Lógica do carrossel infinito para desktop (sem duplicação)
  useEffect(() => {
    if (!carouselRef.current || isMobile) return;

    const carousel = carouselRef.current;
    const speed = 0.8;

    const animate = () => {
      if (autoScrollEnabled) {
        carousel.scrollLeft += speed;
        
        // Reinicia ao chegar no final
        if (carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth)) {
          carousel.scrollLeft = 0;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mediaItems, isMobile, autoScrollEnabled]);

  // Funções de controle manual
  const scrollLeft = () => {
    setAutoScrollEnabled(false);
    if (!isMobile && carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    setAutoScrollEnabled(false);
    if (!isMobile && carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Função para parar o auto-scroll
  const stopAutoScroll = () => {
    setAutoScrollEnabled(false);
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
    }
  };

  const handleCardInteraction = () => {
    setAutoScrollEnabled(false);
  };

  // Renderização dos itens com detecção de vídeos verticais
  const renderItems = (filterFn?: (item: MediaItem, index: number) => boolean) => {
    const itemsToRender = filterFn ? mediaItems.filter(filterFn) : mediaItems;
    
    return itemsToRender.map((item, originalIndex) => {
      // Detecção robusta de vídeos verticais
      const isVerticalVideo = item.mediaType === 'video' && (
        item.aspectRatio === 'vertical' ||
        item.aspectRatio === '9:16' ||
        item.aspectRatio === '4:5' ||
        item.title?.toLowerCase().includes('vertical') ||
        item.title?.toLowerCase().includes('instagram') ||
        item.title?.toLowerCase().includes('reels') ||
        item.title?.toLowerCase().includes('tiktok') ||
        item.title?.toLowerCase().includes('stories')
      );

      return (
        <div 
          key={`${item.id}-${originalIndex}`}
          className={`
            flex-shrink-0 
            ${isMobile ? 'w-full px-2' : 'basis-1/3 px-4'}
            ${isVerticalVideo ? 'flex justify-center' : ''}
          `}
          onClick={handleCardInteraction}
          onMouseEnter={handleCardInteraction}
        >
          <MediaDisplay 
            item={item}
            className="hover:scale-105 transition-all duration-300 hover:shadow-xl"
          />
        </div>
      );
    });
  };

  return (
    <section id="media" className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-8 text-white">🌱Sementes do Nosso Trabalho🌱</h2>
      
      {/* Carrossel Desktop (1 linha) */}
      <div className="hidden md:block relative group">
        <div 
          ref={carouselRef}
          className="flex overflow-hidden py-6"
          style={{ 
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {renderItems()}
        </div>
        
        {/* Controles manuais para desktop */}
        <button
          onClick={scrollLeft}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Carrossel Mobile (2 linhas independentes com controles de toque) */}
      {isMobile && (
        <div className="md:hidden space-y-8">
          <style>{`
            .carousel-button-indicator {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              width: 44px;
              height: 44px;
              background: rgba(0,0,0,0.7);
              color: white;
              border: none;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 20;
              opacity: 1;
              transition: all 0.3s ease;
              font-size: 18px;
              font-weight: bold;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .carousel-button-indicator:hover {
              background: rgba(0,0,0,0.9);
              transform: translateY(-50%) scale(1.1);
            }
            .carousel-button-indicator.prev {
              left: 10px;
            }
            .carousel-button-indicator.next {
              right: 10px;
            }
            .carousel-button-indicator:disabled {
              opacity: 0.3 !important;
              cursor: not-allowed;
            }
            .carousel-container {
              position: relative;
            }
          `}</style>

          {/* Função para renderizar linha do carrossel com formatação padronizada */}
          {(() => {
            const renderCarouselLine = (items: typeof mediaItems, lineKey: string, apiRef: any, offset: number = 0) => (
              <div className="relative carousel-container">
                <Carousel
                  setApi={(api) => {
                    apiRef.current = api;
                    if (api && autoScrollEnabled) {
                      if (offset > 0) {
                        setTimeout(() => startAutoScroll(api), offset);
                      } else {
                        startAutoScroll(api);
                      }
                    }
                  }}
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                >
                  <CarouselContent 
                    className="-ml-2"
                    onClick={stopAutoScroll}
                  >
                    {items.map((item, index) => (
                      <CarouselItem
                        key={`${lineKey}-${item.id}-${index}`}
                        className="pl-2 basis-full"
                      >
                        <div className="h-full w-full" onClick={stopAutoScroll}>
                          <MediaDisplay
                            item={item}
                            className="hover:scale-105 transition-transform duration-300 h-full w-full"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex -left-6 bg-black/70 text-white hover:bg-black/90 border-0 w-10 h-10" />
                  <CarouselNext className="hidden sm:flex -right-6 bg-black/70 text-white hover:bg-black/90 border-0 w-10 h-10" />
                </Carousel>
                <button 
                  className="carousel-button-indicator prev"
                  onClick={() => {
                    apiRef.current?.scrollPrev();
                    stopAutoScroll();
                  }}
                  disabled={!apiRef.current?.canScrollPrev()}
                >
                  &lt;
                </button>
                <button 
                  className="carousel-button-indicator next"
                  onClick={() => {
                    apiRef.current?.scrollNext();
                    stopAutoScroll();
                  }}
                  disabled={!apiRef.current?.canScrollNext()}
                >
                  &gt;
                </button>
              </div>
            );

            return (
              <>
                {/* Linha 1 - Índices pares */}
                {renderCarouselLine(
                  mediaItems.filter((_, index) => index % 2 === 0),
                  'line1',
                  carouselApi1,
                  0
                )}

                {/* Linha 2 - Índices ímpares */}
                {renderCarouselLine(
                  mediaItems.filter((_, index) => index % 2 !== 0),
                  'line2',
                  carouselApi2,
                  2500
                )}
              </>
            );
          })()}
        </div>
      )}
      
      {/* Indicador de status da rolagem automática */}
      {!autoScrollEnabled && (
        <div className="text-center mt-4">
          <button
            onClick={() => setAutoScrollEnabled(true)}
            className="text-white/70 hover:text-white text-sm underline"
          >
            Reativar rolagem automática
          </button>
        </div>
      )}
    </section>
  );
};

export default MediaCarouselSection;
