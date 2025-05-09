
import React from "react";
import Footer from "@/components/layout/Footer";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2, FilePieChart, Users, ClipboardCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";
import MediaDisplay from "@/components/common/MediaDisplay";
import InteractivePanel from "@/components/paa/InteractivePanel";
import SIMTabButton from "@/components/common/SIMTabButton";

const SIM = () => {
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

  const { data: contents, isLoading: isLoadingContents } = useQuery<ContentItem[]>({
    queryKey: ["contents", "sim"],
    queryFn: () =>
      getDocs(
        query(collection(db, "contents"), where("pageType", "==", "sim")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ["charts", "sim"],
    queryFn: async () => {
      const chartsQuery = query(
        collection(db, "charts"),
        where("pageType", "==", "sim")
      );
      const snapshot = await getDocs(chartsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ["media", "sim"],
    queryFn: () =>
      getDocs(
        query(collection(db, "media"), where("pageType", "==", "sim")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  return (
    <>
      <div style={backgroundStyle} />
      <div className="fixed inset-0 w-full min-h-screen bg-black/40 z-[1]"></div>
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="flex flex-wrap justify-end items-center mb-6 gap-3">
          <SIMTabButton className="shadow-md whitespace-nowrap">
            Serviços SIM
          </SIMTabButton>
        </div>
        <main className="space-y-12">
          <div className="prose max-w-none">
            <h1 className="text-4xl font-bold text-center mb-4 text-white">Serviço de Inspeção Municipal</h1>
            <p className="text-center text-lg text-white/80">
              Informações sobre o SIM - Serviço de Inspeção Municipal de Vitória do Xingu
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
                pageType="sim" 
                className="text-white"
              />
              
              {/* Botões do painel */}
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
                <SIMTabButton className="shadow-md text-lg py-3 px-6 rounded-lg">
                  Solicitar Registro no SIM
                </SIMTabButton>
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

          {/* SIM Report Section */}
          <section className="mt-16 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Atividades do SIM</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    Estabelecimentos Registrados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">12</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-500" />
                    Inspeções Realizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">48</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePieChart className="h-5 w-5 text-green-500" />
                    Produtos Certificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">96</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-500" />
                    Produtores Atendidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">28</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm hidden md:block shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-2xl font-bold text-black">Registros do SIM</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="w-full [&_th]:text-black [&_td]:text-gray-700 [&_tr:hover]:bg-gray-50/50">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registro SIM</TableHead>
                      <TableHead>Estabelecimento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Responsável Técnico</TableHead>
                      <TableHead>Produtos Registrados</TableHead>
                      <TableHead>Última Inspeção</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>SIM-001</TableCell>
                      <TableCell>Laticínios Vale Verde</TableCell>
                      <TableCell>Laticínios</TableCell>
                      <TableCell>Dr. João Silva</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>15/01/2024</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">Ativo</span>
                      </TableCell>
                    </TableRow>
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

export default SIM;
