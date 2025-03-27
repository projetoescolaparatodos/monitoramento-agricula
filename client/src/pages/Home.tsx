import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import DataVisualizationSection from "@/components/home/DataVisualizationSection";
import MediaGallerySection from "@/components/home/MediaGallerySection";
import { Link } from "wouter";

const AreasSection = () => {
  return (
    <section id="areas" className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Áreas de Atuação</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/agriculture">
          <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary/10 rounded-full transform group-hover:scale-110 transition-transform"></div>
            <div className="absolute -top-5 -right-5 w-16 h-16 flex items-center justify-center">
              <img src="/trator-icon.png" alt="Agricultura" className="w-12 h-12 transform group-hover:rotate-12 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary">Agricultura</h3>
            <p className="text-gray-600 mb-4">
              Informações sobre a agricultura local, programas e iniciativas.
            </p>
          </div>
        </Link>
        <Link href="/fishing">
          <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full transform group-hover:scale-110 transition-transform"></div>
            <div className="absolute -top-5 -right-5 w-16 h-16 flex items-center justify-center">
              <img src="/pesca-icon.png" alt="Pesca" className="w-12 h-12 transform group-hover:rotate-12 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary">Pesca</h3>
            <p className="text-gray-600 mb-4">
              Dados sobre a atividade pesqueira e projetos relacionados.
            </p>
          </div>
        </Link>
        <Link href="/paa-info">
          <div className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer group">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full transform group-hover:scale-110 transition-transform"></div>
            <div className="absolute -top-5 -right-5 w-16 h-16 flex items-center justify-center">
              <img src="/paa-icon.png" alt="PAA" className="w-12 h-12 transform group-hover:rotate-12 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-primary">PAA</h3>
            <p className="text-gray-600 mb-4">
              Programa de Aquisição de Alimentos e seus benefícios.
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
};

const Home = () => {
  return (
    <>
      <main className="container mx-auto px-4 pt-28 pb-16">
        <HeroSection />
        <StatisticsSection />
        <AreasSection />
        <DataVisualizationSection />
        <MediaGallerySection />
      </main>
      <Footer />
    </>
  );
};

export default Home;