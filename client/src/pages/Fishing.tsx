import React from "react";
import BackgroundVideo from "@/components/ui/BackgroundVideo";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map, BarChart2, FilePieChart, Fish, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation } from "wouter";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";
import MediaDisplay from "@/components/common/MediaDisplay";
import InteractivePanel from "@/components/paa/InteractivePanel";
import FishingTabButton from "@/components/common/FishingTabButton";
import MediaCarouselSection from "@/components/fishing/MediaCarouselSection";

const Fishing = () => {
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

  const { data: pescaData } = useQuery({
    queryKey: ["pesca"],
    queryFn: () =>
      getDocs(collection(db, "pesca")).then((snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Dados de pesca carregados:", data);
        return data;
      }),
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

  const [showHiddenAdminButton, setShowHiddenAdminButton] = React.useState(false);
  const [visibleItems, setVisibleItems] = React.useState(7);

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 10);
  };

  return (
    <>
      <div style={backgroundStyle} />
      <div className="fixed inset-0 w-full min-h-screen bg-black/40 z-[1]"></div>
      <div className="max-w-[480px] sm:max-w-none w-full mx-auto relative z-10">
      <main className="container mx-auto px-2 sm:px-4 pt-28 pb-16 relative z-10 overflow-x-hidden">
        <div className="flex flex-wrap justify-end items-center mb-6 gap-3">
          <FishingTabButton className="shadow-md whitespace-nowrap">
            Serviços Pesca
          </FishingTabButton>
          <Button
            onClick={() => setLocation("/pesca/map")}
            className="flex items-center justify-center gap-2 w-full text-sm sm:text-base md:w-auto px-6 py-3 bg-primary text-white rounded-lg shadow-md overflow-hidden transition-transform duration-150 hover:scale-105"
          >
            <Map className="h-4 w-4 flex-shrink-0" />
            <span className="whitespace-nowrap truncate">Acompanhar Serviços</span>
          </Button>
        </div>
        <main className="space-y-12">
          <div className="prose max-w-none">
            <h1 className="section-title text-4xl font-bold text-center mb-4 text-white">PESCA</h1>
            <p className="section-subtitle text-center text-lg text-white/80">
              Informações e dados sobre a pesca em Vitória do Xingu
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
                pageType="fishing" 
                className="text-white"
              />

              {/* Novos botões abaixo do painel */}
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
                <FishingTabButton className="shadow-md text-lg py-3 px-6 rounded-lg">
                  Iniciar Cadastro na Psicultura
                </FishingTabButton>

                <Button
                  onClick={() => setLocation("/pesca/map")}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-lg py-3 px-6 rounded-lg shadow-md"
                >
                  <Map className="h-5 w-5 flex-shrink-0" />
                  <span className="text-xs sm:text-lg">Acompanhe nossas Atividades em tempo real</span>
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

          {/* Fishing Report Section */}
          <section className="mt-16 rounded-lg p-2 sm:p-8">
            <h2 className="section-title text-2xl sm:text-3xl font-bold text-center mb-8 text-white">ATIVIDADES DA PESCA</h2>
            {pescaData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 w-full">
              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Fish className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">Produção Total de Pescado</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl sm:text-3xl font-bold">{(pescaData.reduce((sum, p) => sum + (p.quantidadePescado || 0) + (p.quantidadeAlevinos || 0), 0) || 0).toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="truncate">Sistemas Registrados</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl sm:text-3xl font-bold">{pescaData.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="w-full sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <FilePieChart className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="truncate">Área de Criação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl sm:text-3xl font-bold">
                    {pescaData.reduce((sum, p) => {
                      // Soma os valores de areaAlagada
                      if (typeof p.areaAlagada === 'number') {
                        return sum + p.areaAlagada;
                      } else if (typeof p.areaAlagada === 'string') {
                        // Tenta converter string para número
                        const parsed = parseFloat(p.areaAlagada);
                        return sum + (isNaN(parsed) ? 0 : parsed);
                      }
                      return sum;
                    }, 0).toFixed(2)} ha
                  </p>
                </CardContent>
              </Card>
            </div>
            ) : (
              <div className="text-center text-white mb-8">
                <p>Carregando dados das atividades...</p>
              </div>
            )}

            {pescaData && pescaData.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm hidden sm:block shadow-lg overflow-hidden">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-2xl font-bold text-black">Detalhes das Atividades</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="w-full [&_th]:text-black [&_td]:text-gray-700 [&_tr:hover]:bg-gray-50/50">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Localidade</TableHead>
                      <TableHead>Proprietário</TableHead>
                      <TableHead>Espécie de Peixe</TableHead>
                      <TableHead>Tipo de Sistema</TableHead>
                      <TableHead>Técnico Responsável</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quantidade KG</TableHead>
                      <TableHead>Área (ha)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pescaData?.slice(0, visibleItems).map((pesca) => (
                      <TableRow key={pesca.id}>
                        <TableCell>{pesca.localidade || '-'}</TableCell>
                        <TableCell>{pesca.proprietario || '-'}</TableCell>
                        <TableCell>{pesca.especiePeixe || '-'}</TableCell>
                        <TableCell>{pesca.estrutura || pesca.tipoTanque || '-'}</TableCell>
                        <TableCell>{pesca.tecnicoResponsavel || '-'}</TableCell>
                        <TableCell>{new Date(pesca.dataCadastro).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={pesca.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                            {pesca.concluido ? 'Concluído' : 'Em Andamento'}
                          </span>
                        </TableCell>
                        <TableCell>{pesca.quantidadeAlevinos ? pesca.quantidadeAlevinos.toFixed(2) : '0.00'}</TableCell>
                        <TableCell>{pesca.areaAlagada ? pesca.areaAlagada.toFixed(2) : '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pescaData && pescaData.length > visibleItems && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                    <Button 
                      onClick={handleLoadMore} 
                      variant="outline" 
                      className="w-full"
                    >
                      Ver mais atividades ({pescaData.length - visibleItems} restantes)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Mobile responsive cards for small screens */}
            {pescaData && pescaData.length > 0 && (
            <div className="sm:hidden space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Detalhes das Atividades</h3>
              {pescaData.slice(0, visibleItems).map((pesca) => (
                <Card key={pesca.id} className="bg-white/90 backdrop-blur-sm p-4">
                  <div className="space-y-2 text-sm">
                    <div><strong>Localidade:</strong> {pesca.localidade || '-'}</div>
                    <div><strong>Proprietário:</strong> {pesca.proprietario || '-'}</div>
                    <div><strong>Espécie:</strong> {pesca.especiePeixe || '-'}</div>
                    <div><strong>Sistema:</strong> {pesca.estrutura || pesca.tipoTanque || '-'}</div>
                    <div><strong>Técnico:</strong> {pesca.tecnicoResponsavel || '-'}</div>
                    <div><strong>Data:</strong> {new Date(pesca.dataCadastro).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> 
                      <span className={pesca.concluido ? 'text-green-600 font-medium ml-1' : 'text-blue-600 font-medium ml-1'}>
                        {pesca.concluido ? 'Concluído' : 'Em Andamento'}
                      </span>
                    </div>
                    <div><strong>Quantidade:</strong> {pesca.quantidadeAlevinos ? pesca.quantidadeAlevinos.toFixed(2) : '0.00'} kg</div>
                    <div><strong>Área:</strong> {pesca.areaAlagada ? pesca.areaAlagada.toFixed(2) : '0.00'} ha</div>
                  </div>
                </Card>
              ))}
              {pescaData.length > visibleItems && (
                <Button 
                  onClick={handleLoadMore} 
                  variant="outline" 
                  className="w-full bg-white/90"
                >
                  Ver mais atividades ({pescaData.length - visibleItems} restantes)
                </Button>
              )}
            </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default Fishing;