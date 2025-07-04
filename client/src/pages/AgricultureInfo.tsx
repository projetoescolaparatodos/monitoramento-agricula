import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import InfoPage from "@/components/common/InfoPage";
import MediaDisplay from "@/components/common/MediaDisplay";
import InteractivePanel from "@/components/paa/InteractivePanel";

const AgricultureInfo = () => {
  const { data: contents, isLoading: isLoadingContents } = useQuery<ContentItem[]>({
    queryKey: ['/api/contents?pageType=agriculture'],
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ['/api/charts?pageType=agriculture'],
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items?pageType=agriculture'],
  });

  // Assume agriculturalData is fetched from Firebase here.  This needs to be added based on the actual implementation.
  const agriculturalData = useQuery(['agriculturalData'], () => fetch('/api/agriculturalData').then(res => res.json())).data;

  return (
    <>
      <Navbar />
      <InfoPage 
        title="Agricultura" 
        subtitle="Informações e dados sobre a agricultura local"
        contents={contents || []} 
        charts={charts || []} 
        mediaItems={[]} 
        isLoadingContents={isLoadingContents}
        isLoadingCharts={isLoadingCharts}
        isLoadingMedia={false}
      >
        {/* Added this section to display the area in hectares */}
        {agriculturalData && (
          <div>
            <p className="text-3xl font-bold">
              {(agriculturalData.reduce((total, data) => total + (data.areaTrabalhada || 0), 0) / 10000).toFixed(2)} ha
            </p>
          </div>
        )}
        
        {/* Exibição de mídias com tratamento adequado para vídeos do Google Drive */}
        {mediaItems && mediaItems.length > 0 && (
          <section className="mt-8 py-8 bg-neutral-50 dark:bg-zinc-900">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-2 text-center">Galeria de Mídia</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
                Imagens e vídeos relacionados às atividades agrícolas em nossa região
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mediaItems.map((item) => {
                  // Detecção robusta de vídeos verticais
                  const isVerticalVideo = item.mediaType === 'video' && (
                    item.aspectRatio === 'vertical' ||
                    item.aspectRatio === '9:16' ||
                    item.aspectRatio === '4:5' ||
                    item.title?.toLowerCase().includes('vertical') ||
                    item.title?.toLowerCase().includes('instagram') ||
                    item.title?.toLowerCase().includes('reels') ||
                    item.title?.toLowerCase().includes('tiktok') ||
                    item.title?.toLowerCase().includes('stories')
                  );

                  return (
                    <div key={item.id} className={`${isVerticalVideo ? 'flex justify-center md:col-span-1' : ''}`}>
                      <MediaDisplay 
                        item={item} 
                        className={`hover:scale-105 transition-all duration-300 hover:shadow-xl ${
                          isVerticalVideo ? 'w-full max-w-[400px] aspect-[9/16]' : 'w-full'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
        
        {/* Seção de Painéis Interativos */}
        <section className="mt-8 py-8">
          <div className="container mx-auto px-4">
            <InteractivePanel 
              pageType="agriculture" 
              className="rounded-lg shadow-md"
            />
          </div>
        </section>
      </InfoPage>
      <Footer />
    </>
  );
};

export default AgricultureInfo;