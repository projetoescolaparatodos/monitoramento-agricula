import React from "react";
import BackgroundVideo from "@/components/common/BackgroundVideo";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";
import MediaGallerySection from "@/components/agriculture/MediaGallerySection";

const Agriculture = () => {
  return (
    <>
      <BackgroundVideo videoPath="/videos/fundo-agricultura.mp4" opacity={0.2} />
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <DataVisualizationSection />
        <MediaGallerySection />
      </main>
    </>
  );
};

export default Agriculture;