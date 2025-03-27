
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";

import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import InfoPage from "@/components/common/InfoPage";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { useLocation } from "wouter";

const PAA = () => {
  const { data: contents, isLoading: isLoadingContents } = useQuery<ContentItem[]>({
    queryKey: ['contents', 'paa'],
    queryFn: () => getDocs(query(collection(db, 'contents'), where('pageType', '==', 'paa'))).then(
      snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ),
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ['charts', 'paa'],
    queryFn: () => getDocs(query(collection(db, 'charts'), where('pageType', '==', 'paa'))).then(
      snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ),
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ['media', 'paa'],
    queryFn: () => getDocs(query(collection(db, 'media'), where('pageType', '==', 'paa'))).then(
      snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ),
  });
  const [, setLocation] = useLocation();

  return (
    <>
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setLocation("/paa/map")}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            Acompanhar Serviços
          </Button>
        </div>
        <InfoPage 
          title="Programa de Aquisição de Alimentos (PAA)" 
          subtitle="Informações e dados sobre o PAA - política pública de fortalecimento da agricultura familiar"
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

export default PAA;