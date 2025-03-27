import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import InfoPage from "@/components/common/InfoPage";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { useLocation } from "wouter";

const Agriculture = () => {
  const { data: contents, isLoading: isLoadingContents } = useQuery<ContentItem[]>({
    queryKey: ['/api/contents?pageType=agriculture'],
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ['/api/charts?pageType=agriculture'],
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items?pageType=agriculture'],
  });
  const [, setLocation] = useLocation();

  return (
    <>
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setLocation("/agriculture-map")}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            Acompanhar Serviços
          </Button>
        </div>
        <InfoPage 
          title="Agricultura" 
          subtitle="Informações e dados sobre a agricultura brasileira"
          contents={contents || []} 
          charts={charts || []} 
          mediaItems={mediaItems || []} 
          isLoadingContents={isLoadingContents}
          isLoadingCharts={isLoadingCharts}
          isLoadingMedia={isLoadingMedia}
        />
      </main>
      <Footer />
    </>
  );
};

export default Agriculture;