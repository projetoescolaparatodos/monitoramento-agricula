import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import AreasSection from "@/components/home/AreasSection";
import DataVisualizationSection from "@/components/home/DataVisualizationSection";
import MediaGallerySection from "@/components/home/MediaGallerySection";

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