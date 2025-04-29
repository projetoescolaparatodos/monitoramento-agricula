
import React from "react";
import { Link } from "wouter";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import DataVisualizationSection from "@/components/home/DataVisualizationSection";
import MediaGallerySection from "@/components/home/MediaGallerySection";
import BackgroundVideo from "@/components/ui/BackgroundVideo";

const AreasSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Link href="/agriculture" onClick={(e) => {
        e.preventDefault();
        window.location.href = "/agriculture";
      }}>
        <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group">
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary/10 rounded-full transform group-hover:scale-110 transition-transform"></div>
          <div className="absolute -top-5 -right-5 w-16 h-16 flex items-center justify-center">
            <img src="/trator-icon.png" alt="Agricultura" className="w-12 h-12 transform group-hover:rotate-12 transition-transform" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Agricultura</h3>
          <p className="text-gray-600">Informações sobre agricultura e produção rural</p>
        </div>
      </Link>
      <Link href="/fishing" onClick={(e) => {
        e.preventDefault();
        window.location.href = "/fishing";
      }}>
        <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full transform group-hover:scale-110 transition-transform"></div>
          <div className="absolute -top-5 -right-5 w-16 h-16 flex items-center justify-center">
            <img src="/pesca-icon.png" alt="Pesca" className="w-14 h-14 transform group-hover:rotate-12 transition-transform" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Pesca</h3>
          <p className="text-gray-600">Dados sobre pesca e atividades pesqueiras</p>
        </div>
      </Link>
      <Link href="/paa" onClick={(e) => {
        e.preventDefault();
        window.location.href = "/paa";
      }}>
        <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full transform group-hover:scale-110 transition-transform"></div>
          <div className="absolute -top-5 -right-5 w-16 h-16 flex items-center justify-center">
            <img src="/paa-icon.png" alt="PAA" className="w-12 h-12 transform group-hover:rotate-12 transition-transform" />
          </div>
          <h3 className="text-xl font-semibold mb-2">PAA</h3>
          <p className="text-gray-600">Programa de Aquisição de Alimentos</p>
        </div>
      </Link>
    </div>
  );
};

const Home = () => {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover"
          style={{ opacity: 0.4 }}
        >
          <source src="/videos/BackgroundVideo.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60" />
      </div>
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <HeroSection />
        <section id="estatisticas" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Estatísticas Principais</h2>
          <StatisticsSection variant="transparent" />
        </section>

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

        <section id="areas" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Áreas de Atuação</h2>
          <AreasSection />
        </section>
        <section id="visualization" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Visualização de Dados</h2>
          <DataVisualizationSection variant="transparent" />
        </section>
        <section id="media" className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Galeria de Mídia</h2>
          <MediaGallerySection variant="transparent" />
        </section>
      </main>
    </>
  );
};

export default Home;
