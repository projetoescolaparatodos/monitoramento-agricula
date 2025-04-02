import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import BackgroundVideo from "@/components/common/BackgroundVideo";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, BarChart2, FilePieChart } from "lucide-react";
import { useLocation } from "wouter";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Agriculture = () => {
  const { data: tratoresData } = useQuery({
    queryKey: ['tratores'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'tratores'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  });

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
        if (!doc.exists()) {
          console.warn("Documento não existe:", doc.id);
          return null;
        }
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
      }).filter(Boolean);
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
        if (!doc.exists()) {
          console.warn("Documento não existe:", doc.id);
          return null;
        }
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
      }).filter(Boolean);
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
      <div style={backgroundStyle}></div>
      <BackgroundVideo videoPath="/videos/fundo-agricultura.mp4" opacity={0.2} />
      <div className="absolute inset-0 bg-black/60 z-[1]"></div>
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setLocation("/agriculture/map")}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            Acompanhar Serviços
          </Button>
        </div>
        <main className="space-y-12">
          <div className="prose max-w-none">
            <h1 className="text-4xl font-bold text-center mb-4 text-white">Agricultura</h1>
            <p className="text-center text-lg text-white/80">
              Informações e dados sobre a agricultura em Vitória do Xingu
            </p>
          </div>

          {contents && contents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contents.map((content) => (
                <Card key={content.id} className="p-6 backdrop-blur-sm border-0">
                  <h3 className="text-xl font-semibold mb-4 text-white">{content.title}</h3>
                  <p className="text-white/80">{content.content}</p>
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
                    <h3 className="font-semibold text-white">{media.title}</h3>
                    <p className="text-sm text-white/80">{media.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Agriculture Report Section */}
          <section className="mt-16 bg-black/40 backdrop-blur-sm rounded-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Atividades da Agricultura</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Total de Maquinários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{tratoresData?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePieChart className="h-5 w-5 text-blue-500" />
                    Hora/Máquina
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{tratoresData?.reduce((sum, t) => sum + ((t.tempoAtividade || 0) / 60), 0).toFixed(2)} horas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePieChart className="h-5 w-5 text-green-500" />
                    Área Trabalhada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{(tratoresData?.reduce((sum, t) => sum + (t.areaTrabalhada || 0), 0) / 10000).toFixed(2)} ha</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm hidden md:block">
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Fazenda</TableHead>
                      <TableHead>Atividade</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hora/Máquina</TableHead>
                      <TableHead>Área (ha)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tratoresData?.map((trator) => (
                      <TableRow key={trator.id}>
                        <TableCell>{trator.nome}</TableCell>
                        <TableCell>{trator.fazenda}</TableCell>
                        <TableCell>{trator.atividade}</TableCell>
                        <TableCell>{trator.piloto}</TableCell>
                        <TableCell>{new Date(trator.dataCadastro).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={trator.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                            {trator.concluido ? 'Concluído' : 'Em Serviço'}
                          </span>
                        </TableCell>
                        <TableCell>{(trator.tempoAtividade / 60).toFixed(2)}</TableCell>
                        <TableCell>{(trator.areaTrabalhada / 10000).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </main>
      </main>
      <Footer />
    </>
  );
};

export default Agriculture;