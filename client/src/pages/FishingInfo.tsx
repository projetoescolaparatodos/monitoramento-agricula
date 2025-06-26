import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import InfoPage from "@/components/common/InfoPage";
import MediaCarouselSection from "@/components/fishing/MediaCarouselSection";
import InteractivePanel from "@/components/paa/InteractivePanel";

const FishingInfo = () => {
  const { data: contents, isLoading: isLoadingContents } = useQuery<ContentItem[]>({
    queryKey: ['/api/contents?pageType=fishing'],
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ['/api/charts?pageType=fishing'],
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items?pageType=fishing'],
  });

  return (
    <>
      <Navbar />
      <InfoPage 
        title="Pesca" 
        subtitle="Informações e dados sobre a pesca local"
        contents={contents || []} 
        charts={charts || []} 
        mediaItems={mediaItems || []} 
        isLoadingContents={isLoadingContents}
        isLoadingCharts={isLoadingCharts}
        isLoadingMedia={isLoadingMedia}
      >
        {/* Carrossel de mídias com as funcionalidades do Agriculture */}
        {mediaItems && mediaItems.length > 0 && (
          <MediaCarouselSection mediaItems={mediaItems} />
        )}

        {/* Seção de Painéis Interativos */}
        <section className="mt-8 py-8">
          <div className="container mx-auto px-4">
            <InteractivePanel 
              pageType="fishing" 
              className="rounded-lg shadow-md"
            />
          </div>
        </section>
      </InfoPage>
      <Footer />
    </>
  );
};

export default FishingInfo;

// Added to address the original error message.  Path may need adjustment.
//  This is a placeholder; replace with the actual component code.
export const DashboardSidebar = () => {
  return <div>Dashboard Sidebar</div>;
}