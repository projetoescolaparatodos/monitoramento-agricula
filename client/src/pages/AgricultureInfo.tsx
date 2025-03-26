
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
      />
      <Footer />
    </>
  );
};

export default AgricultureInfo;
