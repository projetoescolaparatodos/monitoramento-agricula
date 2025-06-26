
import React, { useRef, useEffect, useState } from 'react';
import { MediaItem } from '@/types';
import MediaDisplay from '@/components/common/MediaDisplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Configuração responsiva
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lógica do carrossel infinito para desktop
  useEffect(() => {
    if (!carouselRef.current || isMobile) return;

    const carousel = carouselRef.current;
    const speed = 0.8;

    // Duplica os itens para efeito infinito
    const originalItems = Array.from(carousel.children);
    originalItems.forEach(item => {
      const clone = item.cloneNode(true) as HTMLElement;
      carousel.appendChild(clone);
    });

    const animate = () => {
      if (autoScrollEnabled) {
        carousel.scrollLeft += speed;
        
        // Reinicia ao chegar no final
        if (carousel.scrollLeft >= (carousel.scrollWidth / 2)) {
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
      // Remove clones
      const allItems = Array.from(carousel.children);
      allItems.slice(originalItems.length).forEach(clone => clone.remove());
    };
  }, [mediaItems, isMobile, autoScrollEnabled]);

  // Lógica do carrossel infinito para mobile - linha 1 (índices pares)
  useEffect(() => {
    if (!carouselRef.current || !isMobile) return;

    const carousel = carouselRef.current;
    const speed = 0.6;

    // Duplica os itens para efeito infinito
    const originalItems = Array.from(carousel.children);
    originalItems.forEach(item => {
      const clone = item.cloneNode(true) as HTMLElement;
      carousel.appendChild(clone);
    });

    const animate = () => {
      if (autoScrollEnabled) {
        carousel.scrollLeft += speed;
        
        if (carousel.scrollLeft >= (carousel.scrollWidth / 2)) {
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
      // Remove clones
      const allItems = Array.from(carousel.children);
      allItems.slice(originalItems.length).forEach(clone => clone.remove());
    };
  }, [mediaItems, isMobile, autoScrollEnabled]);

  // Lógica do carrossel infinito para mobile - linha 2 (índices ímpares)
  useEffect(() => {
    if (!carousel2Ref.current || !isMobile) return;

    const carousel = carousel2Ref.current;
    const speed = -0.5; // Velocidade negativa para movimento reverso

    // Duplica os itens para efeito infinito
    const originalItems = Array.from(carousel.children);
    originalItems.forEach(item => {
      const clone = item.cloneNode(true) as HTMLElement;
      carousel.appendChild(clone);
    });

    // Inicia do final para movimento reverso
    carousel.scrollLeft = carousel.scrollWidth / 2;

    const animate = () => {
      if (autoScrollEnabled) {
        carousel.scrollLeft += speed;
        
        if (carousel.scrollLeft <= 0) {
          carousel.scrollLeft = carousel.scrollWidth / 2;
        }
      }
      
      animationFrame2Ref.current = requestAnimationFrame(animate);
    };

    animationFrame2Ref.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame2Ref.current) {
        cancelAnimationFrame(animationFrame2Ref.current);
      }
      // Remove clones
      const allItems = Array.from(carousel.children);
      allItems.slice(originalItems.length).forEach(clone => clone.remove());
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

      {/* Carrossel Mobile (2 linhas independentes) */}
      {isMobile && (
        <div className="md:hidden space-y-6">
          {/* Linha 1 - Índices pares (movimento da esquerda para direita) */}
          <div 
            ref={carouselRef}
            className="flex overflow-hidden py-2"
            style={{ 
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onTouchStart={handleCardInteraction}
          >
            {renderItems((_, index) => index % 2 === 0)}
          </div>
          
          {/* Linha 2 - Índices ímpares (movimento da direita para esquerda) */}
          <div 
            ref={carousel2Ref}
            className="flex overflow-hidden py-2"
            style={{ 
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onTouchStart={handleCardInteraction}
          >
            {renderItems((_, index) => index % 2 !== 0)}
          </div>
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
