import React from "react";
import Footer from "@/components/layout/Footer";
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

const Fishing = () => {
  const { data: pescaData } = useQuery({
    queryKey: ["pesca"],
    queryFn: () =>
      getDocs(collection(db, "pesca")).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      ),
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

  return (
    <>
      <div style={backgroundStyle} />
      <div className="fixed inset-0 w-full min-h-screen bg-black/40 z-[1]"></div>
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
            <h1 className="text-4xl font-bold text-center mb-4 text-white">Pesca</h1>
            <p className="text-center text-lg text-white/80">
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
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Painéis Informativos</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <InteractivePanel 
                pageType="fishing" 
                className="text-white"
              />
            </div>
          </section>

          <DataVisualizationSection 
            charts={charts || []} 
            isLoading={isLoadingCharts} 
          />

          {mediaItems && mediaItems.length > 0 && (
            <section className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">Galeria de Mídia</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaItems.map((item) => (
                  <MediaDisplay key={item.id} item={item} className="bg-opacity-90 backdrop-blur-sm" />
                ))}
              </div>
            </section>
          )}

          {/* Fishing Report Section */}
          <section className="mt-16 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Atividades da Pesca</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fish className="h-5 w-5 text-blue-500" />
                    Produção Total de Pescado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{pescaData?.reduce((sum, p) => sum + (p.quantidadePescado || 0), 0).toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Sistemas Registrados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{new Set(pescaData?.map(p => p.idTanque).filter(Boolean)).size}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePieChart className="h-5 w-5 text-green-500" />
                    Área de Criação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {(pescaData?.reduce((sum, p) => {
                      // Verifica se areaTanque existe e verifica seu tipo
                      if (typeof p.areaTanque === 'number') {
                        return sum + p.areaTanque;
                      } else if (typeof p.areaTanque === 'string') {
                        // Tenta converter string para número
                        const parsed = parseFloat(p.areaTanque);
                        return sum + (isNaN(parsed) ? 0 : parsed);
                      }
                      return sum;
                    }, 0) / 10000).toFixed(2)} ha
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-500" />
                    Produtores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{new Set(pescaData?.map(p => p.nomePescador).filter(Boolean)).size}</p>
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
                      <TableHead>Número Registro</TableHead>
                      <TableHead>Espécie</TableHead>
                      <TableHead>Tipo Tanque</TableHead>
                      <TableHead>Localidade</TableHead>
                      <TableHead>Área Imóvel (ha)</TableHead>
                      <TableHead>Área Alagada (ha)</TableHead>
                      <TableHead>Sistema Cultivo</TableHead>
                      <TableHead>Método Alimentação</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Ração (kg)</TableHead>
                      <TableHead>Quantidade (kg)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pescaData?.map((pesca) => (
                      <TableRow key={pesca.id}>
                        <TableCell>{pesca.numeroRegistro || "—"}</TableCell>
                        <TableCell>{pesca.especiePeixe || "—"}</TableCell>
                        <TableCell>{pesca.tipoTanque || "—"}</TableCell>
                        <TableCell>{pesca.localidade || "—"}</TableCell>
                        <TableCell>{pesca.areaImovel ? `${pesca.areaImovel} ha` : "—"}</TableCell>
                        <TableCell>{pesca.areaAlagada ? `${pesca.areaAlagada} ha` : "—"}</TableCell>
                        <TableCell>{pesca.sistemaCultivo || "—"}</TableCell>
                        <TableCell>{pesca.metodoAlimentacao || "—"}</TableCell>
                        <TableCell>{pesca.operador || "—"}</TableCell>
                        <TableCell>{pesca.tecnicoResponsavel || "—"}</TableCell>
                        <TableCell>{pesca.quantidadeRacao ? `${pesca.quantidadeRacao.toFixed(2)} kg` : "—"}</TableCell>
                        <TableCell>{pesca.quantidadePescado ? `${pesca.quantidadePescado.toFixed(2)} kg` : "—"}</TableCell>
                        <TableCell>
                          <span className={pesca.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                            {pesca.concluido ? 'Concluído' : 'Em Andamento'}
                          </span>
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

export default Fishing;