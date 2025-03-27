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
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-3 text-primary">Agricultura</h3>
            <p className="text-gray-600 mb-4">
              Informações sobre a agricultura local, programas e iniciativas.
            </p>
          </div>
        </Link>
        <Link href="/fishing">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-3 text-primary">Pesca</h3>
            <p className="text-gray-600 mb-4">
              Dados sobre a atividade pesqueira e projetos relacionados.
            </p>
          </div>
        </Link>
        <Link href="/paa-info">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
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