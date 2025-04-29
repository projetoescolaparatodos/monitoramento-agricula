import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import BackgroundVideo from "@/components/ui/BackgroundVideo";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, BarChart2, FilePieChart } from "lucide-react";
import { useLocation } from "wouter";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MediaDisplay from "@/components/common/MediaDisplay";
import InteractivePanel from "@/components/paa/InteractivePanel";
import AgricultureTabButton from "@/components/common/AgricultureTabButton";

const Agriculture = () => {
  // Detectar e rolar para âncoras na URL quando a página carrega
  React.useEffect(() => {
    // Verificar se há um hash na URL
    if (window.location.hash) {
      const id = window.location.hash.substring(1); // remover o caractere #
      const element = document.getElementById(id);
      if (element) {
        // Adicionar pequeno atraso para garantir que a página carregou completamente
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, []);

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
      <div className="fixed inset-0 w-full min-h-screen bg-black/40 z-[1]"></div>
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="flex flex-col sm:flex-row justify-end mb-6 gap-3">
          <AgricultureTabButton className="shadow-md text-sm sm:text-base w-full sm:w-auto">
            <span className="truncate">Serviços Agricultura</span>
          </AgricultureTabButton>
          <Button
            onClick={() => setLocation("/agriculture/map")}
            className="flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            <Map className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Acompanhar Serviços</span>
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
              {contents
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((content) => (
                <Card key={content.id} className="p-6 border-0 bg-white/10 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-sm">{content.title}</h3>
                  <p className="text-white text-lg leading-relaxed">{content.content}</p>
                </Card>
              ))}
            </div>
          )}
          
          {/* Seção de Painéis Interativos */}
          <section className="mt-16">
            <div className="p-6">
              <InteractivePanel 
                pageType="agriculture" 
                className="text-white"
              />
              
              {/* Novos botões abaixo do painel */}
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
                <AgricultureTabButton className="shadow-md text-sm md:text-lg py-3 px-4 md:px-6 rounded-lg w-full md:w-auto">
                  <span className="truncate">Sou Agricultor, Quero me Cadastrar</span>
                </AgricultureTabButton>
                
                <Button
                  onClick={() => setLocation("/agriculture/map")}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-sm md:text-lg py-3 px-4 md:px-6 rounded-lg shadow-md w-full md:w-auto"
                >
                  <Map className="h-4 w-4 flex-shrink-0"ssName="h-5 w-5" />
                  Acompanhe nossas Atividades em tempo real
                </Button>
              </div>
            </div>
          </section>

          <DataVisualizationSection 
            charts={charts || []} 
            isLoading={isLoadingCharts} 
          />

          {mediaItems && mediaItems.length > 0 && (
            <section id="media" className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">Galeria de Mídia</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaItems.map((item) => (
                  <MediaDisplay key={item.id} item={item} className="bg-opacity-90 backdrop-blur-sm" />
                ))}
              </div>
            </section>
          )}

          {/* Agriculture Report Section */}
          <section className="mt-16 rounded-lg p-8">
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
                  <p className="text-3xl font-bold">
                    {tratoresData?.reduce((sum, t) => {
                      // Certifica que tempoAtividade existe e é número
                      const tempo = typeof t.tempoAtividade === 'number' ? t.tempoAtividade : 0;
                      // Convertendo de minutos para horas se necessário
                      return sum + (tempo > 100 ? tempo / 60 : tempo);
                    }, 0).toFixed(2)} horas
                  </p>
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
                  <p className="text-3xl font-bold">
                    {(tratoresData?.reduce((sum, t) => {
                      // Verifica se areaTrabalhada existe e verifica seu tipo
                      if (typeof t.areaTrabalhada === 'number') {
                        return sum + t.areaTrabalhada;
                      } else if (typeof t.areaTrabalhada === 'string') {
                        // Tenta converter string para número
                        const parsed = parseFloat(t.areaTrabalhada);
                        return sum + (isNaN(parsed) ? 0 : parsed);
                      }
                      return sum;
                    }, 0) / 10000).toFixed(2)} ha
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm hidden md:block shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-2xl font-bold text-black">Detalhes das Atividades</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="w-full [&_th]:text-black [&_td]:text-gray-700 [&_tr:hover]:bg-gray-50/50">
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
                        <TableCell>
                          {(() => {
                            const tempo = typeof trator.tempoAtividade === 'number' 
                              ? trator.tempoAtividade 
                              : typeof trator.tempoAtividade === 'string' 
                                ? parseFloat(trator.tempoAtividade) 
                                : 0;
                            return (tempo > 100 ? tempo / 60 : tempo).toFixed(2);
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const area = typeof trator.areaTrabalhada === 'number' 
                              ? trator.areaTrabalhada 
                              : typeof trator.areaTrabalhada === 'string' 
                                ? parseFloat(trator.areaTrabalhada) 
                                : 0;
                            return (area / 10000).toFixed(2);
                          })()}
                        </TableCell>
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