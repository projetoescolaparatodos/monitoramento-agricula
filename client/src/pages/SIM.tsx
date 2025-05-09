import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FirebaseContentItem, FirebaseChartItem, FirebaseMediaItem } from "@/types";
import InteractivePanel from "@/components/paa/InteractivePanel";

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

  const { data: contents, isLoading: isLoadingContents } = useQuery<FirebaseContentItem[]>({
    queryKey: ["contents", "sim"],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(
          collection(db, "contents"),
          where("pageType", "==", "sim")
        )
      );
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return { 
          id: doc.id,
          pageType: data.pageType || '',
          sectionType: data.sectionType || '',
          title: data.title || '',
          content: data.content || '',
          active: data.active || true,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          order: data.order || 0
        } as FirebaseContentItem;
      });
    },
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<FirebaseChartItem[]>({
    queryKey: ["charts", "sim"],
    queryFn: async () => {
      const chartsQuery = query(
        collection(db, "charts"),
        where("pageType", "==", "sim")
      );
      const snapshot = await getDocs(chartsQuery);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          pageType: data.pageType || '',
          title: data.title || '',
          description: data.description,
          chartType: data.chartType || '',
          chartData: data.chartData || { labels: [], datasets: [] },
          active: data.active || true,
          order: data.order || 0,
          timestamp: data.timestamp || Date.now()
        } as FirebaseChartItem;
      });
    },
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<FirebaseMediaItem[]>({
    queryKey: ["media", "sim"],
    queryFn: async () => {
      const snapshot = await getDocs(
        query(collection(db, "media"), where("pageType", "==", "sim"))
      );
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          pageType: data.pageType || '',
          title: data.title || '',
          description: data.description,
          mediaType: data.mediaType || '',
          mediaUrl: data.mediaUrl || '',
          thumbnailUrl: data.thumbnailUrl,
          active: data.active || true,
          order: data.order || 0,
          timestamp: data.timestamp || Date.now()
        } as FirebaseMediaItem;
      });
    },
  });

  return (
    <>
      <div style={backgroundStyle} />
      <div className="fixed inset-0 w-full min-h-screen bg-black/40 z-[1]"></div>
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 relative z-10">
        <div className="prose max-w-none">
          <h1 className="text-4xl font-bold text-center mb-4 text-white">Serviço de Inspeção Municipal (SIM)</h1>
          <p className="text-center text-lg text-white/80">
            Normas para inspeção e fiscalização sanitária de produtos de origem animal
          </p>
        </div>

        {contents && contents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {contents
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((content) => (
              <div key={content.id} className="p-6 border-0 bg-white/10 backdrop-blur-sm rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-sm">{content.title}</h3>
                <div className="prose prose-lg prose-invert">
                  <div className="text-white text-lg leading-relaxed whitespace-pre-line">
                    {content.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Seção de Painéis Interativos */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Informações do SIM</h2>
          <InteractivePanel 
            pageType="sim"
            className="bg-white/10 backdrop-blur-sm p-6 rounded-lg" 
          />
        </section>
        
        {/* Documentação Necessária */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Documentação Necessária</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-sm">Produtor Familiar DAP/CAF</h3>
              <ul className="list-disc pl-5 text-white space-y-2">
                <li>RG</li>
                <li>CPF</li>
                <li>Requerimento de ingresso (modelo fornecido pelo SIM)</li>
                <li>Comprovante de endereço do estabelecimento</li>
                <li>Declaração de aptidão do PRONAF-DAP (ou CAF)</li>
                <li>Inscrição Estadual</li>
                <li>Planta baixa do estabelecimento</li>
                <li>2 Vias Memorial Econômico-Sanitário do estabelecimento</li>
                <li>2 Vias Memorial Descritivo do Processo de Fabricação e Rotulagem</li>
                <li>Comprovação de contratação de Responsável Técnico</li>
                <li>Certificado de conformidade junto aos bombeiros (Se for o caso)</li>
                <li>Certificado de dedetização do estabelecimento (Com data de validade)</li>
                <li>Licença ambiental (Se for o caso)</li>
                <li>2 Vias Análise da água da indústria (parceria com VISA)</li>
                <li>Cópia do Documento do automóvel utilizado para transporte da mercadoria</li>
                <li>2 Vias da etiqueta de cada produto cadastrado</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-sm">Pessoa Jurídica</h3>
              <ul className="list-disc pl-5 text-white space-y-2">
                <li>RG do(s) proprietário(s)</li>
                <li>CPF do(s) proprietário(s)</li>
                <li>CNPJ</li>
                <li>Requerimento de ingresso (modelo fornecido pelo SIM)</li>
                <li>Comprovante de endereço do estabelecimento</li>
                <li>Contrato social da empresa</li>
                <li>Extrato de cadastro junto ao SEFAZ</li>
                <li>Planta baixa do estabelecimento</li>
                <li>Memorial Econômico-Sanitário do estabelecimento</li>
                <li>Memorial Descritivo do Processo de Fabricação e Rotulagem</li>
                <li>Comprovação de contratação de Responsável Técnico Veterinário – RT</li>
                <li>Alvará de funcionamento</li>
                <li>Alvará sanitário (Se realizado comercialização no local)</li>
                <li>Certificado de conformidade junto aos bombeiros (Se for o caso)</li>
                <li>Licença ambiental</li>
                <li>Certificado de dedetização do estabelecimento (Com data de validade)</li>
                <li>Análise da água da indústria (parceria com VISA)</li>
                <li>Cópia do Documento do automóvel utilizado para transporte da mercadoria</li>
                <li>2 Vias da etiqueta de cada produto cadastrado</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8 text-white/90 font-semibold text-lg">
            SE TÁ INSPECIONADO, TÁ NA MESA, TÁ SEGURO!
          </div>
          
          <div className="mt-4 text-center text-white/80">
            <p>Travessa Castelo Branco s/n° - Centro</p>
            <p>CEP: 68.383-000 VITÓRIA DO XINGU – PA</p>
            <p>E-MAIL: secagricultura@vitoriadoxingu.pa.gov.br / simservicodeinspecaomunicipal@gmail.com</p>
          </div>
        </section>

        {mediaItems && mediaItems.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Galeria de Mídia</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative overflow-hidden rounded-lg shadow-md group h-56">
                  {item.mediaType === "image" ? (
                    <img 
                      src={item.mediaUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-dark mb-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-neutral-dark font-medium">{item.title}</p>
                      <a 
                        href={item.mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 text-xs text-primary underline"
                      >
                        Abrir vídeo
                      </a>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h4 className="font-heading font-semibold">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs opacity-80">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default SIM;