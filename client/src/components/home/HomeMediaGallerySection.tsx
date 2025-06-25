import React, { useState, useEffect, useCallback, useRef } from "react";
import { MediaItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import MediaDisplay from "@/components/common/MediaDisplay";

interface HomeMediaGallerySectionProps {
  mediaItems?: MediaItem[];
  isLoading?: boolean;
  variant?: "default" | "transparent";
}

const HomeMediaGallerySection: React.FC<HomeMediaGallerySectionProps> = ({
  mediaItems,
  isLoading,
  variant = "default",
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const autoScrollTimer = useRef<NodeJS.Timeout>();
  const carouselApi1 = useRef<any>();
  const carouselApi2 = useRef<any>();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // Função para parar o auto-scroll
  const stopAutoScroll = () => {
    setAutoScrollEnabled(false);
    if (autoScrollTimer.current) {
      clearTimeout(autoScrollTimer.current);
    }
  };

  const renderDesktopCarousel = () => (
    <Carousel
      className="w-full"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {mediaItems?.map((item) => (
          <CarouselItem
            key={item.id}
            className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
          >
            <div className="h-full">
              <MediaDisplay
                item={item}
                className="hover:scale-105 transition-transform duration-300 h-full"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-12 bg-black/70 text-white hover:bg-black/90 border-0 w-12 h-12" />
      <CarouselNext className="hidden md:flex -right-12 bg-black/70 text-white hover:bg-black/90 border-0 w-12 h-12" />
    </Carousel>
  );

  const renderMobileCarousels = () => {
    if (!mediaItems || mediaItems.length < 2) {
      return renderDesktopCarousel();
    }

    // Divide os itens em dois grupos para as duas linhas
    const half = Math.ceil(mediaItems.length / 2);
    const firstLineItems = mediaItems.slice(0, half);
    const secondLineItems = mediaItems.slice(half);

    return (
      <div className="space-y-8">
        <style>{`
          .carousel-button-indicator {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 30px;
            height: 30px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20;
            opacity: 0;
            transition: opacity 0.3s ease;
            font-size: 14px;
          }
          .carousel-container:hover .carousel-button-indicator,
          .carousel-container:active .carousel-button-indicator {
            opacity: 1;
          }
          .carousel-button-indicator.prev {
            left: 10px;
          }
          .carousel-button-indicator.next {
            right: 10px;
          }
          .carousel-button-indicator:disabled {
            opacity: 0 !important;
            cursor: not-allowed;
          }
          .carousel-container {
            position: relative;
          }
        `}</style>

        {/* Primeira linha */}
        <div className="relative carousel-container">
          <Carousel
            setApi={(api) => {
              carouselApi1.current = api;
              if (api && autoScrollEnabled) {
                startAutoScroll(api);
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
              {firstLineItems.map((item) => (
                <CarouselItem
                  key={`line1-${item.id}`}
                  className="pl-2 basis-full"
                >
                  <div className="h-full" onClick={stopAutoScroll}>
                    <MediaDisplay
                      item={item}
                      className="hover:scale-105 transition-transform duration-300 h-full"
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
              carouselApi1.current?.scrollPrev();
              stopAutoScroll();
            }}
            disabled={!carouselApi1.current?.canScrollPrev()}
          >
            &lt;
          </button>
          <button 
            className="carousel-button-indicator next"
            onClick={() => {
              carouselApi1.current?.scrollNext();
              stopAutoScroll();
            }}
            disabled={!carouselApi1.current?.canScrollNext()}
          >
            &gt;
          </button>
        </div>

        {/* Segunda linha */}
        <div className="relative carousel-container">
          <Carousel
            setApi={(api) => {
              carouselApi2.current = api;
              if (api && autoScrollEnabled) {
                setTimeout(() => startAutoScroll(api), 2500); // Offset para não sincronizar
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
              {secondLineItems.map((item) => (
                <CarouselItem
                  key={`line2-${item.id}`}
                  className="pl-2 basis-full"
                >
                  <div className="h-full" onClick={stopAutoScroll}>
                    <MediaDisplay
                      item={item}
                      className="hover:scale-105 transition-transform duration-300 h-full"
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
              carouselApi2.current?.scrollPrev();
              stopAutoScroll();
            }}
            disabled={!carouselApi2.current?.canScrollPrev()}
          >
            &lt;
          </button>
          <button 
            className="carousel-button-indicator next"
            onClick={() => {
              carouselApi2.current?.scrollNext();
              stopAutoScroll();
            }}
            disabled={!carouselApi2.current?.canScrollNext()}
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  return (
    <section id="home-media" className="py-12">
      <div className="container mx-auto px-4 mb-12">
        <h2
          className={`text-4xl font-bold mb-4 text-center ${variant === "transparent" ? "text-white" : "text-gray-800 dark:text-white"}`}
        >
          Destaques da Semapa
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div
              className={`text-xl md:text-2xl font-semibold tracking-wide leading-relaxed ${variant === "transparent" ? "text-white" : "text-gray-800 dark:text-gray-100"} mb-6 text-center px-8 py-8 bg-gradient-to-r from-green-600/15 via-green-500/25 to-green-600/15 rounded-2xl border border-green-500/30 backdrop-blur-sm shadow-lg relative overflow-hidden`}
              style={{ 
                fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
                textShadow: variant === "transparent" ? "0 1px 3px rgba(0,0,0,0.3)" : "none"
              }}
            >
              {/* Efeito de brilho sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50"></div>
              <div className="relative z-10">
                Fique por dentro dos projetos que estão transformando o setor
                agropecuário e pesqueiro do nosso município.
              </div>
            </div>
          </div>
        </div>
        
        {/* Indicador de Scroll */}
        <div className="flex items-center justify-center mb-8 md:hidden">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-green-600/10 via-green-500/20 to-green-600/10 px-6 py-3 rounded-full border border-green-500/30 backdrop-blur-sm">
            <div className="flex items-center space-x-1">
              <span className="text-green-600 text-lg font-bold">←</span>
              <span className="text-green-600 text-lg font-bold">←</span>
            </div>
            <span className={`text-sm font-semibold tracking-wider uppercase ${variant === "transparent" ? "text-green-300" : "text-green-600"}`}>
              DESLIZE
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-green-600 text-lg font-bold">→</span>
              <span className="text-green-600 text-lg font-bold">→</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <CarouselItem
                      key={index}
                      className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                    >
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
          <div className="relative">
            {isMobile ? renderMobileCarousels() : renderDesktopCarousel()}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
            <div
              className={`${variant === "transparent" ? "text-white/80" : "text-gray-500 dark:text-gray-400"}`}
            >
              Nenhuma mídia disponível no momento.
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeMediaGallerySection;
