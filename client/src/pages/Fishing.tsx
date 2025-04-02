import React from "react";
import Footer from "@/components/layout/Footer";
import BackgroundVideo from "@/components/common/BackgroundVideo";
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
      <div style={backgroundStyle} /> {/* Added background image */}
      <BackgroundVideo videoPath="/videos/fundo-pesca.mp4" opacity={0.2} />
      <div className="fixed inset-0 w-full min-h-screen bg-black/60 z-[1]"></div>
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
              {contents.map((content) => (
                <Card key={content.id} className="p-6 border-0">
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
                  <p className="text-3xl font-bold">{(pescaData?.reduce((sum, p) => sum + (p.areaTanque || 0), 0) / 10000).toFixed(2)} ha</p>
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

            <Card className="bg-white/70 backdrop-blur-sm hidden md:block">
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
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