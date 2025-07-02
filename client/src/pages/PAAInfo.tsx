import React, { useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/layout/Footer";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import parse from 'html-react-parser';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map, BarChart2, FilePieChart, Users } from "lucide-react";
import PAATabButton from "@/components/common/PAATabButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation } from "wouter";
import DataVisualizationSection from "@/components/agriculture/DataVisualizationSection";
import BackgroundVideo from "@/components/ui/BackgroundVideo";
import MediaDisplay from '@/components/common/MediaDisplay';
import MediaCarouselSection from '@/components/paa/MediaCarouselSection';
import InteractivePanel from "@/components/paa/InteractivePanel";


const PAAInfo = () => {
  const [showHiddenAdminButton, setShowHiddenAdminButton] = React.useState(false);

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

  // Detectar e rolar para âncoras na URL quando a página carrega
  useEffect(() => {
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

  // Keyboard listener for Ctrl+M+I combination to show hidden admin button
  useEffect(() => {
    let keysPressed: { [key: string]: boolean } = {};

    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed[event.key.toLowerCase()] = true;
      
      // Check for Ctrl+M+I combination
      if (event.ctrlKey && keysPressed['m'] && keysPressed['i']) {
        setShowHiddenAdminButton(true);
        setTimeout(() => setShowHiddenAdminButton(false), 10000); // Hide after 10 seconds
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed[event.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <>
      <div style={backgroundStyle} />
      <div className="fixed inset-0 w-full min-h-screen bg-black/40 z-[1]"></div>
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="flex flex-wrap justify-end items-center mb-6 gap-3">
          <PAATabButton className="shadow-md whitespace-nowrap" />
          <Button
            onClick={() => setLocation("/paa/map")}
            className="flex items-center gap-2 whitespace-nowrap"
            size="sm"
          >
            <Map className="h-4 w-4" />
            <span className="hidden md:inline">Acompanhar Serviços</span>
            <span className="md:hidden">Mapa</span>
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
              {contents
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((content) => (
                <Card key={content.id} className="p-6 border-0 bg-white/10 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-sm">{content.title}</h3>
                  <div className="text-white text-lg leading-relaxed rich-content">
                    {parse(content.content || '')}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Seção de Painéis Interativos */}
          <section className="mt-16">
            <div className="p-6">
              <InteractivePanel 
                pageType="paa" 
                className="text-white"
              />
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <Button 
                onClick={() => setLocation("/paa/map")}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Map className="h-4 w-4" />
                Atividades do PAA
              </Button>
              <PAATabButton className="bg-amber-600 hover:bg-amber-700">
                Solicitar Cadastro no PAA
              </PAATabButton>
            </div>
          </section>

          <DataVisualizationSection 
            charts={charts || []} 
            isLoading={isLoadingCharts} 
          />

          {mediaItems && mediaItems.length > 0 && (
            <MediaCarouselSection mediaItems={mediaItems} />
          )}

          {/* Seção de Estatísticas do PAA */}
          <section className="mt-16 rounded-lg p-8">
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
                  <p className="text-3xl font-bold">15.185,87 kg</p>
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
                    <Users className="h-5 w-5 text-purple-500" />
                    Famílias Acompanhadas Pela Assistente Social do PAA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">56 famílias</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePieChart className="h-5 w-5 text-blue-500" />
                    Recursos do Governo Federal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R$ 174.551,87</p>
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
                      <TableHead>Localidade</TableHead>
                      <TableHead>Produtor</TableHead>
                      <TableHead>Tipo de Alimento</TableHead>
                      <TableHead>Variedade de Alimentos</TableHead>
                      <TableHead>Técnico Responsável</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paaData?.map((paa) => (
                      <TableRow key={paa.id}>
                        <TableCell>{paa.localidade || '-'}</TableCell>
                        <TableCell>{paa.proprietario || '-'}</TableCell>
                        <TableCell>{paa.tipoAlimento || '-'}</TableCell>
                        <TableCell>{paa.tipoAlimento || '-'}</TableCell>
                        <TableCell>{paa.tecnicoResponsavel || '-'}</TableCell>
                        <TableCell>{new Date(paa.dataCadastro).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={paa.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                            {paa.concluido ? 'Concluído' : 'Em Andamento'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* Hidden Admin Button - only visible with Ctrl+M+I */}
          {showHiddenAdminButton && (
            <div className="fixed bottom-4 right-4 z-50 animate-in fade-in-0 slide-in-from-bottom-4">
              <Button
                onClick={() => setLocation("/admin")}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg border-2 border-red-400"
                size="sm"
              >
                🔑 Admin Geral
              </Button>
            </div>
          )}

          </main>
      </main>
      <Footer />
    </>
  );
};

export default PAAInfo;