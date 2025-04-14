import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import InfoPage from "@/components/common/InfoPage";

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
        mediaItems={mediaItems || []} 
        isLoadingContents={isLoadingContents}
        isLoadingCharts={isLoadingCharts}
        isLoadingMedia={isLoadingMedia}
      >
        {/* Added this section to display the area in hectares */}
        {agriculturalData && (
          <div>
            <p className="text-3xl font-bold">
              {(agriculturalData.reduce((total, data) => total + (data.areaTrabalhada || 0), 0) / 10000).toFixed(2)} ha
            </p>
          </div>
        )}
      </InfoPage>
      <Footer />
    </>
  );
};

export default AgricultureInfo;