import React from "react";
import BackgroundVideo from "@/components/common/BackgroundVideo";
import { Card } from "@/components/ui/card";
import StatisticsSection from "@/components/home/StatisticsSection";
import DataVisualizationSection from "@/components/home/DataVisualizationSection";
import MediaGallerySection from "@/components/home/MediaGallerySection";
import Footer from "@/components/layout/Footer";

const Fishing = () => {
  return (
    <>
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Pesca</h2>
          <StatisticsSection variant="transparent" />
        </section>
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Visualização de Dados</h2>
          <DataVisualizationSection variant="transparent" />
        </section>
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Galeria de Mídia</h2>
          <MediaGallerySection variant="transparent" />
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Fishing;