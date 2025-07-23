import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import Navbar from "@/components/layout/Navbar";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, BarChart2, FilePieChart } from "lucide-react";
import { useLocation } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MediaDisplay from "@/components/common/MediaDisplay";
import InteractivePanel from "@/components/paa/InteractivePanel";
import AgricultureTabButton from "@/components/common/AgricultureTabButton";
import MediaCarouselSection from "@/components/agriculture/MediaCarouselSection";

const Agriculture = () => {
  // Detectar e rolar para âncoras na URL quando a página carrega
  React.useEffect(() => {
    // Função para tentar realizar a rolagem
    const scrollToHashElement = () => {
      if (window.location.hash) {
        const id = window.location.hash.substring(1); // remover o caractere #
        const element = document.getElementById(id);

        if (element) {
          // Quando o elemento for encontrado, rolar até ele
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true; // Rolagem realizada com sucesso
        }
        return false; // Elemento não encontrado
      }
      return true; // Não há hash, não é necessário rolar
    };

    // Tentar rolar imediatamente
    if (!scrollToHashElement()) {
      // Se não conseguir, tentar várias vezes com intervalos crescentes
      const attempts = [500, 1000, 1500, 2000]; // tempos em ms

      attempts.forEach((delay, index) => {
        setTimeout(() => {
          scrollToHashElement();
        }, delay);
      });
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
    minHeight: '100vh',
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
    queryKey: ['/api/media-items?pageType=agriculture'],
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

  const [showHiddenAdminButton, setShowHiddenAdminButton] = React.useState(false);
  const [visibleItems, setVisibleItems] = React.useState(7);

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 10);
  };

  return (
    <>
      <div style={backgroundStyle}></div>
      <div className="fixed inset-0 w-full min-h-screen bg-black/40 z-[1]"></div>
      <div className="max-w-[480px] sm:max-w-none w-full mx-auto relative z-10">
        <main className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 pt-20 pb-16 relative z-10 overflow-x-hidden">
          <div className="prose max-w-none mb-6 sm:mb-8">
            <h1 className="section-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center mb-4 text-white">AGRICULTURA</h1>
            <p className="section-subtitle text-center text-base sm:text-lg md:text-xl lg:text-2xl text-white/80">
              Informações e dados sobre a agricultura em Vitória do Xingu
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end mb-6 sm:mb-8 md:mb-10 gap-3 md:gap-4">
            <AgricultureTabButton className="shadow-md text-sm sm:text-base md:text-lg lg:text-xl w-full sm:w-auto py-3 md:py-4">
              <span className="truncate">Serviços Agricultura</span>
            </AgricultureTabButton>
            <Button
              onClick={() => setLocation("/agricultura/map")}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm md:text-lg lg:text-xl w-full sm:w-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4"
            >
              <Map className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 flex-shrink-0" />
              <span className="truncate text-xs sm:text-sm md:text-lg lg:text-xl whitespace-nowrap">Acompanhar Serviços</span>
            </Button>
          </div>
          <div className="space-y-8 sm:space-y-12">

          {contents && contents.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {contents
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((content) => (
                  <Card key={content.id} className="p-4 sm:p-6 border-0 bg-white/10 backdrop-blur-sm">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-white drop-shadow-sm">{content.title}</h3>
                    <p className="text-white text-base sm:text-lg leading-relaxed">{content.content}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* Seção de Painéis Interativos */}
            <section className="mt-12 sm:mt-16">
              <div className="p-4 sm:p-6">
                <InteractivePanel 
                  pageType="agriculture" 
                  className="text-white"
                />

                {/* Novos botões abaixo do painel */}
                <div className="flex flex-col lg:flex-row justify-center gap-4 mt-6 sm:mt-8">
                  <AgricultureTabButton className="shadow-md text-sm lg:text-lg py-3 px-4 lg:px-6 rounded-lg w-full lg:w-auto">
                    <span className="truncate">Sou Agricultor, Quero me Cadastrar</span>
                  </AgricultureTabButton>

                  <Button
                    onClick={() => setLocation("/agricultura/map")}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-xs sm:text-sm lg:text-lg py-3 px-2 sm:px-4 lg:px-6 rounded-lg shadow-md w-full lg:w-auto"
                  >
                    <Map className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span className="truncate text-xs sm:text-sm lg:text-lg whitespace-nowrap">Acompanhe nossas Atividades em tempo real</span>
                  </Button>
                </div>
              </div>
            </section>

            <DataVisualizationSection 
              charts={charts || []} 
              isLoading={isLoadingCharts} 
            />

            {mediaItems && mediaItems.length > 0 && (
              <MediaCarouselSection mediaItems={mediaItems} />
            )}

            {/* Agriculture Report Section */}
            <section className="mt-12 sm:mt-16 rounded-lg p-2 sm:p-6 lg:p-8">
              <h2 className="section-title text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 text-white">ATIVIDADES DA AGRICULTURA</h2>
              {tratoresData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                      <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0" />
                      <span className="truncate">Atendimentos Registrados</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{tratoresData.length || 0} <span className="text-lg sm:text-2xl lg:text-3xl font-bold">famílias</span></p>
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                      <FilePieChart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-500 flex-shrink-0" />
                      <span className="truncate">Hora/Máquina</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                      {tratoresData.reduce((sum, t) => {
                        const horaMaquina = typeof t.horaMaquina === 'number' ? t.horaMaquina : 0;
                        return sum + horaMaquina;
                      }, 0).toFixed(2)} h
                    </p>
                  </CardContent>
                </Card>
                <Card className="w-full sm:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
                      <FilePieChart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
                      <span className="truncate">Área Trabalhada</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                      {tratoresData.reduce((sum, t) => {
                        const area = typeof t.areaTrabalhada === 'number' ? t.areaTrabalhada : 0;
                        return sum + area;
                      }, 0).toFixed(2)} ha
                    </p>
                  </CardContent>
                </Card>
              </div>
              ) : (
                <div className="text-center text-white mb-6 sm:mb-8">
                  <p className="text-base sm:text-lg">Carregando dados das atividades...</p>
                </div>
              )}

              {tratoresData && tratoresData.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm hidden sm:block shadow-lg overflow-hidden">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Detalhes das Atividades</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table className="w-full min-w-[800px] [&_th]:text-black [&_td]:text-gray-700 [&_tr:hover]:bg-gray-50/50">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-sm lg:text-base">Nome</TableHead>
                          <TableHead className="text-sm lg:text-base">Fazenda</TableHead>
                          <TableHead className="text-sm lg:text-base">Atividade</TableHead>
                          <TableHead className="text-sm lg:text-base">Operador</TableHead>
                          <TableHead className="text-sm lg:text-base">Técnico Responsável</TableHead>
                          <TableHead className="text-sm lg:text-base">Data</TableHead>
                          <TableHead className="text-sm lg:text-base">Status</TableHead>
                          <TableHead className="text-sm lg:text-base">Hora/Máquina</TableHead>
                          <TableHead className="text-sm lg:text-base">Área (ha)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tratoresData?.slice(0, visibleItems).map((trator) => (
                          <TableRow key={trator.id}>
                            <TableCell className="text-sm lg:text-base">{trator.nome || '-'}</TableCell>
                            <TableCell className="text-sm lg:text-base">{trator.fazenda || '-'}</TableCell>
                            <TableCell className="text-sm lg:text-base">{trator.atividade || '-'}</TableCell>
                            <TableCell className="text-sm lg:text-base">{trator.piloto || '-'}</TableCell>
                            <TableCell className="text-sm lg:text-base">{trator.tecnicoResponsavel || '-'}</TableCell>
                            <TableCell className="text-sm lg:text-base">{new Date(trator.dataCadastro).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`text-sm lg:text-base font-medium ${trator.concluido ? 'text-green-600' : 'text-blue-600'}`}>
                                {trator.concluido ? 'Concluído' : 'Em Serviço'}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm lg:text-base">{trator.horaMaquina ? trator.horaMaquina.toFixed(2) : '0.00'} h</TableCell>
                            <TableCell className="text-sm lg:text-base">{trator.areaTrabalhada ? trator.areaTrabalhada.toFixed(2) : '0.00'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {tratoresData && tratoresData.length > visibleItems && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                      <Button 
                        onClick={handleLoadMore} 
                        variant="outline" 
                        className="w-full text-sm lg:text-base"
                      >
                        Ver mais atividades ({tratoresData.length - visibleItems} restantes)
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Agriculture;