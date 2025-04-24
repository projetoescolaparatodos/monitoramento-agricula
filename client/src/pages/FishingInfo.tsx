import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import InfoPage from "@/components/common/InfoPage";
import MediaDisplay from "@/components/common/MediaDisplay";
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
        {/* Exibição de mídias com tratamento adequado para vídeos do YouTube */}
        {mediaItems && mediaItems.length > 0 && (
          <section className="mt-8 py-8 bg-neutral-50 dark:bg-zinc-900">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-2 text-center">Galeria de Mídia</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
                Imagens e vídeos relacionados às atividades pesqueiras em nossa região
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaItems.map((item) => (
                  <MediaDisplay key={item.id} item={item} className="hover:scale-105 transition-transform" />
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Seção de Painéis Interativos */}
        <section className="mt-8 py-8 bg-neutral-50 dark:bg-zinc-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-2 text-center">Painéis Informativos</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
              Informações importantes sobre pesca organizadas por categoria
            </p>
            <InteractivePanel 
              pageType="fishing" 
              className="bg-white dark:bg-zinc-800 rounded-lg shadow-md"
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