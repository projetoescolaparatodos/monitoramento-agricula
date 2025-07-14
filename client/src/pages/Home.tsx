import React, { Suspense, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "@/types";
import BackgroundVideo from "@/components/ui/BackgroundVideo";

// Lazy loading dos componentes pesados
const HeroSection = React.lazy(() => import("@/components/home/HeroSection"));
const StatisticsSection = React.lazy(() => import("@/components/home/StatisticsSection"));
const DataVisualizationSection = React.lazy(() => import("@/components/home/DataVisualizationSection"));
const MediaGallerySection = React.lazy(() => import("@/components/home/MediaGallerySection"));
const HomeMediaGallerySection = React.lazy(() => import("@/components/home/HomeMediaGallerySection"));
const AreasSection = React.lazy(() => import("@/components/home/AreasSection"));

// Componente de loading otimizado
const SectionSkeleton = React.memo(({ height = "400px" }: { height?: string }) => (
  <div 
    className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded-lg"
    style={{ height, animationDuration: '1.5s' }}
  />
));

const Home = () => {
  const [, setLocation] = useLocation();

  // Buscar mídias da página home com staleTime para cache
  const { data: allMediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items'],
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos no garbage collector
  });

  // Memoizar filtro de mídias para evitar recálculos
  const homeMediaItems = useMemo(() => 
    allMediaItems?.filter(item => 
      item.active !== false && item.pageType === 'home'
    ) || [],
    [allMediaItems]
  );

  // Otimizar função de scroll com useCallback
  const scrollToMedia = useCallback((pageType: string) => {
    // Navegar para a página correspondente se não estiver nela
    if (pageType === 'agriculture') {
      setLocation('/agriculture');
    } else if (pageType === 'fishing') {
      setLocation('/fishing');
    } else if (pageType === 'paa') {
      setLocation('/paa');
    }

    // Pequeno atraso para garantir que a navegação ocorra primeiro
    setTimeout(() => {
      const mediaSection = document.getElementById('media');
      if (mediaSection) {
        mediaSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  }, [setLocation]);

  return (
    <>
      {/* Vídeo de fundo otimizado */}
      <BackgroundVideo overlay={true} overlayOpacity={0.6} />
      
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-20">
        <Suspense fallback={<SectionSkeleton height="500px" />}>
          <HeroSection />
        </Suspense>
        
        <section id="estatisticas" className="py-12">
          <Suspense fallback={<SectionSkeleton height="300px" />}>
            <StatisticsSection variant="transparent" />
          </Suspense>
        </section>
        
        <Suspense fallback={<SectionSkeleton height="400px" />}>
          <AreasSection />
        </Suspense>
        
        <section id="home-media" className="py-12 pb-0">
          <Suspense fallback={<SectionSkeleton height="350px" />}>
            <HomeMediaGallerySection 
              mediaItems={homeMediaItems} 
              isLoading={isLoadingMedia} 
              variant="transparent" 
            />
          </Suspense>
        </section>
      </main>

      {/* Degradê de transição otimizado */}
      <div className="video-to-white-gradient will-change-transform"></div>

      {/* Seções com fundo branco otimizado */}
      <div className="bg-white relative will-change-transform">
        <main className="container mx-auto px-4 pt-2 pb-4">
          <section id="visualization" className="py-0">
            <h2 className="section-title text-4xl font-bold text-center mb-8 text-green-700">NOSSA PRODUÇÃO EM PERSPECTIVA</h2>
            <Suspense fallback={<SectionSkeleton height="600px" />}>
              <DataVisualizationSection variant="default" />
            </Suspense>
          </section>
        </main>
      </div>

      {/* Degradê de transição otimizado */}
      <div className="white-to-video-gradient will-change-transform"></div>

      {/* Seção de mídia final otimizada */}
      <div className="relative will-change-transform">
        <main className="container mx-auto px-4 py-16 relative z-20">
          <section id="media" className="py-12">
            <h2 className="section-title text-4xl font-bold text-center mb-8 text-white">MÍDIAS DE TODOS OS SETORES</h2>
            <Suspense fallback={<SectionSkeleton height="400px" />}>
              <MediaGallerySection variant="transparent" />
            </Suspense>
          </section>
        </main>
      </div>
    </>
  );
};

export default Home;