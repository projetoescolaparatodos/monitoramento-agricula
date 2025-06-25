
import React from "react";
import { Link, useLocation } from "wouter";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import DataVisualizationSection from "@/components/home/DataVisualizationSection";
import MediaGallerySection from "@/components/home/MediaGallerySection";
import HomeMediaGallerySection from "@/components/home/HomeMediaGallerySection";
import AreasSection from "@/components/home/AreasSection";
import BackgroundVideo from "@/components/ui/BackgroundVideo";
import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "@/types";

const Home = () => {
  const [, setLocation] = useLocation();

  // Buscar mídias da página home
  const { data: allMediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items'],
  });

  // Filtrar apenas mídias da página home
  const homeMediaItems = allMediaItems?.filter(item => 
    item.active !== false && item.pageType === 'home'
  );

  // Função para lidar com a rolagem para a seção de mídia
  const scrollToMedia = (pageType: string) => {
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
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover z-0"
          style={{ opacity: 1 }}
        >
          <source src="/videos/BackgroundVideo.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        <div className="absolute top-0 left-0 w-full h-full z-10" 
             style={{
               background: 'linear-gradient(to right, rgba(22,101,52,0) 0%, rgba(22,101,52,0.4) 25%, rgba(22,101,52,0.4) 75%, rgba(22,101,52,0) 100%)'
             }} />
      </div>
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-20">
        <HeroSection />
        <section id="estatisticas" className="py-12">
          <StatisticsSection variant="transparent" />
        </section>
        <AreasSection />
        <section id="home-media" className="py-12">
          <HomeMediaGallerySection 
            mediaItems={homeMediaItems} 
            isLoading={isLoadingMedia} 
            variant="transparent" 
          />
        </section>
        <section id="visualization" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Visualização de Dados</h2>
          <DataVisualizationSection variant="transparent" />
        </section>
        <section id="media" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Mídias de Todos os Setores</h2>
          <MediaGallerySection variant="transparent" />
        </section>
      </main>
    </>
  );
};

export default Home;
