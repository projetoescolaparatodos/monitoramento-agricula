import React from "react";
import Footer from "@/components/layout/Footer";
import BackgroundVideo from "@/components/common/BackgroundVideo";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Map } from "lucide-react";
import { useLocation } from "wouter";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";

const Fishing = () => {
  const backgroundStyle = {
    backgroundImage: 'url("/fundo estatico.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    opacity: 0.8,
    pointerEvents: 'none',
  } as React.CSSProperties;

  const [, setLocation] = useLocation();
  const { data: contents, isLoading: isLoadingContents } = useQuery<ContentItem[]>({
    queryKey: ["contents", "fishing"],
    queryFn: () =>
      getDocs(
        query(collection(db, "contents"), where("pageType", "==", "fishing")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ["charts", "fishing"],
    queryFn: async () => {
      const chartsQuery = query(
        collection(db, "charts"),
        where("pageType", "==", "fishing")
      );
      const snapshot = await getDocs(chartsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ["media", "fishing"],
    queryFn: () =>
      getDocs(
        query(collection(db, "media"), where("pageType", "==", "fishing")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  const { data: pescaData } = useQuery({
    queryKey: ["pesca"],
    queryFn: () =>
      getDocs(collection(db, "pesca")).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      ),
  });

  return (
    <>
      <div style={backgroundStyle} /> {/* Added background image */}
      <BackgroundVideo videoPath="/videos/fundo-pesca.mp4" opacity={0.2} />
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setLocation("/fishing/map")}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            Acompanhar Serviços
          </Button>
        </div>
        <main className="space-y-12">
          <div className="prose max-w-none">
            <h1 className="text-4xl font-bold text-center mb-4">Pesca</h1>
            <p className="text-center text-lg text-muted-foreground">
              Informações e dados sobre a pesca local
            </p>
          </div>

          {contents && contents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contents.map((content) => (
                <Card key={content.id} className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{content.title}</h3>
                  <p className="text-gray-600">{content.content}</p>
                </Card>
              ))}
            </div>
          )}

          <DataVisualizationSection 
            charts={charts || []} 
            isLoading={isLoadingCharts} 
          />

          {mediaItems && mediaItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mediaItems.map((media) => (
                <Card key={media.id} className="overflow-hidden">
                  {media.mediaType === 'image' && (
                    <img 
                      src={media.mediaUrl} 
                      alt={media.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold">{media.title}</h3>
                    <p className="text-sm text-gray-600">{media.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {pescaData && pescaData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pescaData.map((item) => (
                <Card key={item.id} className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{item.title || 'Dados de Pesca'}</h3> {/*Added default title*/}
                  <p className="text-gray-600">{item.content || 'Sem dados disponíveis'}</p> {/*Added default content*/}
                </Card>
              ))}
            </div>
          )}
        </main>
      </main>
      <Footer />
    </>
  );
};

export default Fishing;