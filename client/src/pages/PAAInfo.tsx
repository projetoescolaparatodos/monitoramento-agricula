import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map, BarChart2, FilePieChart, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation } from "wouter";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";
import BackgroundVideo from "@/components/common/BackgroundVideo";

const PAAInfo = () => {
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
    queryKey: ["contents", "paa"],
    queryFn: () =>
      getDocs(
        query(collection(db, "contents"), where("pageType", "==", "paa")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ["charts", "paa"],
    queryFn: async () => {
      const chartsQuery = query(
        collection(db, "charts"),
        where("pageType", "==", "paa")
      );
      const snapshot = await getDocs(chartsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ["media", "paa"],
    queryFn: () =>
      getDocs(
        query(collection(db, "media"), where("pageType", "==", "paa")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  const { data: paaData } = useQuery({
    queryKey: ["paa"],
    queryFn: () =>
      getDocs(collection(db, "paa")).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      ),
  });

  return (
    <>
      <div style={backgroundStyle} /> {/* Added background image */}
      <BackgroundVideo videoPath="/videos/fundo-paa.mp4" opacity={0.2} />
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => setLocation("/paa/map")}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            Acompanhar Serviços
          </Button>
        </div>
        <main className="space-y-12">
          <div className="prose max-w-none">
            <h1 className="text-4xl font-bold text-center mb-4 text-white">PAA</h1>
            <p className="text-center text-lg text-white/80">
              Informações e dados sobre o Programa de Aquisição de Alimentos em Vitória do Xingu
            </p>
          </div>

          {contents && contents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contents.map((content) => (
                <Card key={content.id} className="p-6 bg-black/40 backdrop-blur-sm border-0">
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
                    <h3 className="font-semibold">{media.title}</h3>
                    <p className="text-sm text-gray-600">{media.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Seção de Estatísticas do PAA */}
          <section className="mt-16 bg-black/40 backdrop-blur-sm rounded-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Atividades do PAA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Total de Alimentos Adquiridos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{paaData?.reduce((total, paa) => total + (paa.quantidadeProduzida || 0), 0).toFixed(2)} kg</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Produtores Participantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{new Set(paaData?.map(p => p.proprietario)).size}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePieChart className="h-5 w-5 text-blue-500" />
                    Área Total Cultivada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{(paaData?.reduce((total, paa) => total + (paa.areaMecanizacao || 0), 0) / 10000).toFixed(2)} ha</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Localidade</TableHead>
                      <TableHead>Produtor</TableHead>
                      <TableHead>Tipo de Alimento</TableHead>
                      <TableHead>Quantidade (kg)</TableHead>
                      <TableHead>Método de Colheita</TableHead>
                      <TableHead>Técnico Responsável</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Área (ha)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paaData?.map((paa) => (
                      <TableRow key={paa.id}>
                        <TableCell>{paa.localidade || '-'}</TableCell>
                        <TableCell>{paa.proprietario || '-'}</TableCell>
                        <TableCell>{paa.tipoAlimento || '-'}</TableCell>
                        <TableCell>{paa.quantidadeProduzida ? paa.quantidadeProduzida.toFixed(2) : '0.00'}</TableCell>
                        <TableCell>{paa.metodoColheita || '-'}</TableCell>
                        <TableCell>{paa.tecnicoResponsavel || '-'}</TableCell>
                        <TableCell>{new Date(paa.dataCadastro).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={paa.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                            {paa.concluido ? 'Concluído' : 'Em Andamento'}
                          </span>
                        </TableCell>
                        <TableCell>{paa.areaMecanizacao ? (paa.areaMecanizacao / 10000).toFixed(2) : '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </main>
      <Footer />
    </>
  );
};

export default PAAInfo;