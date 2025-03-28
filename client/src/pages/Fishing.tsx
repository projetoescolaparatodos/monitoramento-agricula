import React from "react";
import BackgroundVideo from "@/components/common/BackgroundVideo";
import DataVisualizationSection from "@/components/fishing/DataVisualizationSection";
import MediaGallerySection from "@/components/fishing/MediaGallerySection";

const Fishing = () => {
  return (
    <>
      <BackgroundVideo videoPath="/videos/fundo-pesca.mp4" opacity={0.2} />
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <DataVisualizationSection />
        <MediaGallerySection />
      </main>
    </>
  );
};

export default Fishing;