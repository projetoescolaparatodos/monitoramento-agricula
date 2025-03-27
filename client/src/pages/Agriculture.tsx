import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import InfoPage from "@/components/common/InfoPage";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { useLocation } from "wouter";

const Agriculture = () => {
  const { data: contents, isLoading: isLoadingContents } = useQuery<
    ContentItem[]
  >({
    queryKey: ["contents", "agriculture"],
    queryFn: () =>
      getDocs(
        query(
          collection(db, "contents"),
          where("pageType", "==", "agriculture"),
        ),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ["charts", "agriculture"],
    queryFn: async () => {
      const chartsQuery = query(
        collection(db, "charts"),
        where("pageType", "==", "agriculture")
      );
      
      const snapshot = await getDocs(chartsQuery);
      
      console.log("Query agriculture charts:", {
        collectionPath: "charts",
        whereField: "pageType",
        whereValue: "agriculture",
        documentsFound: snapshot.docs.length
      });
      
      if (snapshot.empty) {
        console.log("Nenhum gráfico encontrado para pageType='agriculture'");
        return [];
      }
      
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log(`Documento ${doc.id}:`, data);
        
        if (!data.chartData || !data.chartType) {
          console.warn(`Gráfico ${doc.id} não tem dados ou tipo válidos:`, data);
        }
        
        if (data.chartData && (!data.chartData.datasets || !data.chartData.labels)) {
          console.warn(`Gráfico ${doc.id} tem chartData incompleto:`, data.chartData);
        }
        
        const chartData = {
          datasets: Array.isArray(data.chartData?.datasets) ? data.chartData.datasets.map(dataset => ({
            label: dataset.label || "Dados",
            data: Array.isArray(dataset.data) ? dataset.data : [],
            backgroundColor: dataset.backgroundColor || "#4CAF50",
            borderColor: dataset.borderColor || "#2196F3",
            borderWidth: typeof dataset.borderWidth === 'number' ? dataset.borderWidth : 1
          })) : [],
          labels: Array.isArray(data.chartData?.labels) ? data.chartData.labels : []
        };
        
        return {
          id: doc.id,
          pageType: data.pageType,
          title: data.title || "",
          description: data.description || "",
          chartType: data.chartType || "bar",
          chartData: chartData,
          active: data.active !== false,
          order: data.order || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      });
    },
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ["media", "agriculture"],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(
          collection(db, "media"),
          where("pageType", "==", "agriculture"),
        ),
      );
      
      console.log("Número de mídias encontradas:", snapshot.docs.length);
      
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        
        console.log("Processando mídia:", {
          id: doc.id,
          title: data.title,
          mediaType: data.mediaType
        });
        
        return {
          id: doc.id,
          pageType: data.pageType,
          title: data.title || "",
          description: data.description || "",
          mediaType: data.mediaType || "image",
          mediaUrl: data.mediaUrl || "",
          thumbnailUrl: data.thumbnailUrl || "",
          active: data.active !== false,
          order: data.order || 0,
          createdAt: data.createdAt || new Date().toISOString()
        };
      });
    },
  });
  const [, setLocation] = useLocation();

  console.log("Dados passados para InfoPage:", {
    contentCount: contents?.length || 0,
    chartCount: charts?.length || 0,
    mediaCount: mediaItems?.length || 0,
    chartExample: charts && charts.length > 0 ? {
      chartType: charts[0].chartType,
      hasDatasets: !!charts[0].chartData?.datasets,
      hasLabels: !!charts[0].chartData?.labels,
      datasetCount: charts[0].chartData?.datasets?.length || 0
    } : null
  });

  return (
    <>
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setLocation("/agriculture/map")}
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
