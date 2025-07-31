import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useKmlBoundary, isClockwise, ensureClockwise } from "../hooks/useKmlBoundary";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  InfoWindow,
  KmlLayer,
  Polygon
} from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react"; // Importando o ícone de fechar
import styles from "./PescaMap.module.css";
import LoadingOptimizer from "@/components/common/LoadingOptimizer";

interface Pesca {
  id: string;
  numeroRegistro?: string;
  localidade: string;
  nomeImovel?: string;
  proprietario?: string;
  tipoTanque: string;
  areaImovel?: number;
  areaAlagada?: number;
  cicloProdução?: string;
  sistemaCultivo?: string;
  especiePeixe: string;
  quantidadeAlevinos: number;
  metodoAlimentacao: string;
  operador?: string;
  tecnicoResponsavel?: string;
  dataCadastro: string;
  concluido: boolean;
  latitude: number;
  longitude: number;
  midias?: string[];
}

interface ViveiroEmConstrucao {
  id: string;
  localidade: string;
  nomePropriedade: string;
  especieCultivada: string;
  tamanhoViveiro: number;
  dataInicio: string;
  dataTermino: string;
  latitude: number;
  longitude: number;
  midias?: string[];
}

const PescaMap = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc",
  });

  const [pesqueiros, setPesqueiros] = useState<Pesca[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Pesca | null>(null);
  const [filtro, setFiltro] = useState("todos");
  const [isMaximized, setIsMaximized] = useState(false);
  const [viveirosEmConstrucao, setViveirosEmConstrucao] = useState<ViveiroEmConstrucao[]>([]);
  const [selectedViveiro, setSelectedViveiro] = useState<ViveiroEmConstrucao | null>(null);

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = useMemo(() => ({ lat: -3.15, lng: -52.0088 }), []); // Movido mais para o sul
  const bounds = useMemo(
    () => ({
      north: -2.5,
      south: -3.8, // Aumentado para mostrar mais ao sul
      east: -51.5,
      west: -52.5,
    }),
    [],
  );

  // Estado para controlar a exibição do contorno do município
  const [showBoundary, setShowBoundary] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // URL do KML no Firebase Storage
  const kmlUrl = "https://firebasestorage.googleapis.com/v0/b/transparencia-agricola.appspot.com/o/uploads%2Fvitoria-xingu.kml?alt=media";

  // Usando o hook personalizado para carregar o KML
  const { boundaryCoordinates, loading: loadingKml, error: kmlError } = useKmlBoundary(kmlUrl);

  // Fallback para coordenadas caso o KML não seja carregado
  const fallbackBoundary = useMemo(() => [
    { lat: -2.85, lng: -52.05 },
    { lat: -2.88, lng: -51.95 },
    { lat: -2.93, lng: -51.98 },
    { lat: -2.91, lng: -52.07 },
    { lat: -2.85, lng: -52.05 }, // Fechar o polígono
  ], []);

  // Usar coordenadas do KML se disponíveis, senão usar fallback
  const municipioBoundary = useMemo(() => {
    if (boundaryCoordinates.length > 0) {
      return boundaryCoordinates;
    }
    return fallbackBoundary;
  }, [boundaryCoordinates, fallbackBoundary]);

  // Coordenadas para o polígono que cobre a área externa (mundo)
  const worldBounds = useMemo(() => [
    { lat: -90, lng: -180 }, // SW
    { lat: -90, lng: 180 },  // SE
    { lat: 90, lng: 180 },   // NE
    { lat: 90, lng: -180 },  // NW
    { lat: -90, lng: -180 }, // Fechar o polígono
  ], []);

  // Estilo para a máscara escura (área externa)
  const maskStyle = useMemo(() => ({
    fillColor: '#000000',
    fillOpacity: 0.6,
    strokeWeight: 0,
    clickable: false,
    zIndex: 1
  }), []);

  // Estilo para o contorno do município
  const boundaryStyle = useMemo(() => ({
    fillColor: '#00ff88',
    fillOpacity: 0.1,
    strokeColor: '#00ff88',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    zIndex: 2,
    clickable: false
  }), []);

  // Usamos as funções importadas diretamente

  // Garantir que o caminho do município esteja no sentido horário
  const correctedBoundary = useMemo(() => {
    return ensureClockwise(municipioBoundary);
  }, [municipioBoundary]);

  const fetchPesqueiros = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pesca"));
      const pesqueirosData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          numeroRegistro: data.numeroRegistro,
          localidade: data.localidade,
          nomeImovel: data.nomeImovel,
          proprietario: data.proprietario,
          tipoTanque: data.tipoTanque,
          areaImovel: data.areaImovel,
          areaAlagada: data.areaAlagada,
          cicloProdução: data.cicloProdução,
          sistemaCultivo: data.sistemaCultivo,
          especiePeixe: data.especiePeixe,
          quantidadeAlevinos: data.quantidadeAlevinos,
          metodoAlimentacao: data.metodoAlimentacao,
          operador: data.operador,
          tecnicoResponsavel: data.tecnicoResponsavel,
          dataCadastro: data.dataCadastro,
          concluido: data.concluido,
          latitude: data.latitude,
          longitude: data.longitude,
          midias: data.midias,
        };
      });
      setPesqueiros(pesqueirosData);
    } catch (error) {
      console.error("Erro ao buscar pesqueiros:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchPesqueiros = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "pesca"));
        const pescaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pesca[];
        setPesqueiros(pescaData);
      } catch (error) {
        console.error("Erro ao buscar dados de pesca:", error);
        // Fallback para dados em cache se disponível
        const cachedData = localStorage.getItem('pesca_cache');
        if (cachedData) {
          setPesqueiros(JSON.parse(cachedData));
        }
      }
    };

    const fetchViveiros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "viveiros_em_construcao"));
        const viveirosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ViveiroEmConstrucao[];
        setViveirosEmConstrucao(viveirosData);
        // Cache dos dados
        localStorage.setItem('viveiros_cache', JSON.stringify(viveirosData));
      } catch (error) {
        console.error("Erro ao buscar viveiros em construção:", error);
        // Fallback para dados em cache
        const cachedData = localStorage.getItem('viveiros_cache');
        if (cachedData) {
          setViveirosEmConstrucao(JSON.parse(cachedData));
        }
      } finally {
        setLoading(false);
      }
    };

    // Carregar dados em cache primeiro para UI responsiva
    const loadCachedData = () => {
      const cachedPesca = localStorage.getItem('pesca_cache');
      const cachedViveiros = localStorage.getItem('viveiros_cache');
      
      if (cachedPesca) setPesqueiros(JSON.parse(cachedPesca));
      if (cachedViveiros) setViveirosEmConstrucao(JSON.parse(cachedViveiros));
      
      if (cachedPesca || cachedViveiros) {
        setLoading(false);
      }
    };

    loadCachedData();
    
    // Usar setTimeout para não bloquear a UI
    setTimeout(() => {
      fetchPesqueiros();
      fetchViveiros();
    }, 100);
  }, []);

  const pesqueirosFiltrados = useMemo(() => {
    return pesqueiros.filter((pesca) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !pesca.concluido;
      if (filtro === "concluidos") return pesca.concluido;
      return true;
    });
  }, [pesqueiros, filtro]);

  // Hook para detectar se é um dispositivo móvel
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768); // Define 768px como largura máxima para dispositivos móveis
      };

      // Define o valor inicial
      handleResize();

      // Adiciona um listener para o evento de redimensionamento
      window.addEventListener("resize", handleResize);

      // Remove o listener quando o componente é desmontado
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    return isMobile;
  };

  const isMobile = useIsMobile();

  const renderViveiroInfoWindow = useCallback(
    (viveiro: ViveiroEmConstrucao) => {
      const infoWindowStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        border: "2px solid #f59e0b",
        borderRadius: isMobile ? "12px" : "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        padding: isMobile ? "1rem" : "1.5rem",
        width: isMobile ? `${Math.floor(window.innerWidth * 0.92)}px` : "420px",
        maxHeight: isMobile ? "75vh" : "80vh",
        overflowY: "auto",
        backdropFilter: "blur(8px)",
        position: "relative",
        margin: "0",
        boxSizing: "border-box",
      };

      return (
        <InfoWindow
          position={{ lat: viveiro.latitude, lng: viveiro.longitude }}
          onCloseClick={() => setSelectedViveiro(null)}
          options={{
            maxWidth: isMobile ? Math.floor(window.innerWidth * 0.95) : 500,
            pixelOffset: isMobile ? new google.maps.Size(0, -10) : new google.maps.Size(0, 0),
          }}
        >
          <div className="relative" style={infoWindowStyle}>
            <div className={`flex items-start gap-3 mb-4`}>
              <div className="p-3 rounded-lg bg-amber-100 text-amber-800">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{viveiro.localidade}</h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                  Viveiro em Construção
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Informações do Projeto</h3>
                <div className="space-y-2">
                  <p className="text-base text-gray-600">
                    <span className="font-medium">Propriedade:</span> 
                    <span className="ml-1">{viveiro.nomePropriedade}</span>
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium">Espécie Cultivada:</span> 
                    <span className="ml-1">{viveiro.especieCultivada}</span>
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium">Tamanho:</span> 
                    <span className="ml-1">{viveiro.tamanhoViveiro} ha</span>
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium">Início:</span> 
                    <span className="ml-1">{new Date(viveiro.dataInicio).toLocaleDateString('pt-BR')}</span>
                  </p>
                  <p className="text-base text-gray-600">
                    <span className="font-medium">Previsão de Término:</span> 
                    <span className="ml-1">{new Date(viveiro.dataTermino).toLocaleDateString('pt-BR')}</span>
                  </p>
                </div>
              </div>
            </div>

            {viveiro.midias && viveiro.midias.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 text-lg mb-3">Mídias do Projeto</h3>
                <div className="grid grid-cols-1 gap-4">
                  {viveiro.midias.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="Mídia do viveiro"
                      className="w-full h-auto rounded-lg object-cover aspect-square bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Mídia+indisponível';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </InfoWindow>
      );
    },
    [isMobile],
  );

  const renderInfoWindow = useCallback(
    (pesca: Pesca) => {
      const infoWindowStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        border: "2px solid #38a169",
        borderRadius: isMobile ? "12px" : "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        padding: isMobile ? "1rem" : "1.5rem",
        width: isMobile ? `${Math.floor(window.innerWidth * 0.92)}px` : (isMaximized ? "90vw" : "420px"),
        maxWidth: isMobile ? `${Math.floor(window.innerWidth * 0.92)}px` : "none",
        maxHeight: isMobile ? "75vh" : (isMaximized ? "90vh" : "80vh"),
        overflowY: "auto",
        backdropFilter: "blur(8px)",
        position: "relative",
        margin: "0",
        boxSizing: "border-box",
      };

      return (
        <InfoWindow
          position={{ lat: pesca.latitude, lng: pesca.longitude }}
          onCloseClick={() => {
            setSelectedMarker(null);
            setIsMaximized(false);
          }}
          options={{
            maxWidth: isMobile ? Math.floor(window.innerWidth * 0.95) : (isMaximized ? window.innerWidth * 0.9 : 500),
            maxHeight: isMobile ? Math.floor(window.innerHeight * 0.8) : (isMaximized ? window.innerHeight * 0.9 : undefined),
            pixelOffset: isMobile ? new google.maps.Size(0, -10) : new google.maps.Size(0, 0),
            disableAutoPan: isMobile ? false : true,
          }}
        >
          <div className="relative" style={infoWindowStyle}>
            {/* Botão de fechar */}
            <button 
              onClick={() => setSelectedMarker(null)} 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho */}
            <div className={`flex items-start gap-${isMobile ? '2' : '3'} mb-${isMobile ? '3' : '4'}`}>
              <div className={`p-${isMobile ? '2' : '3'} rounded-lg ${pesca.concluido ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {pesca.concluido ? (
                  <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8A8 8 0 11.344 6.024C.845 5.427 1.42 5 2.071 5H5.07c.652 0 1.226.427 1.428 1.024L8.5 10.5 10 8l1.5 2.5 2.002-4.476C13.926 5.427 14.5 5 15.15 5h3c.651 0 1.226.427 1.428 1.024A8.003 8.003 0 0118 8z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-1 leading-tight line-clamp-2`}>{pesca.localidade}</h2>
                <div className={`inline-flex items-center px-${isMobile ? '2' : '3'} py-1 rounded-full text-${isMobile ? 'xs' : 'sm'} font-medium 
                  ${pesca.concluido ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {pesca.concluido ? 'Concluído' : 'Em Andamento'}
                </div>
              </div>
            </div>

            {/* Corpo das informações */}
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'md:grid-cols-2 gap-4'}`}>
              {/* Coluna 1 */}
              <div className={`space-y-${isMobile ? '2' : '3'}`}>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-700 mb-${isMobile ? '2' : '3'}`}>Identificação</h3>
                <div className={`space-y-${isMobile ? '1.5' : '2'}`}>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">N° Registro:</span> 
                    <span className={`ml-1 ${isMobile ? 'text-xs' : 'text-sm'} bg-blue-50 px-2 py-1 rounded text-blue-800`}>
                      {pesca.numeroRegistro || "Não informado"}
                    </span>
                  </p>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">Localidade:</span> 
                    <span className="ml-1 line-clamp-2">{pesca.localidade}</span>
                  </p>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">Imóvel Rural:</span> 
                    <span className="ml-1 line-clamp-2">{pesca.nomeImovel || "Não informado"}</span>
                  </p>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">Proprietário:</span> 
                    <span className="ml-1 line-clamp-2">{pesca.proprietario || "Não informado"}</span>
                  </p>
                </div>
              </div>

              {/* Coluna 2 */}
              <div className={`space-y-${isMobile ? '2' : '3'}`}>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-700 mb-${isMobile ? '2' : '3'}`}>Operação Aquícola</h3>
                <div className={`space-y-${isMobile ? '1.5' : '2'}`}>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">Estrutura:</span> 
                    <span className="ml-1 line-clamp-2">{pesca.tipoTanque}</span>
                  </p>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">Área Alagada:</span> 
                    <span className="ml-1">{pesca.areaAlagada || 0} ha</span>
                  </p>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">Espécie:</span> 
                    <span className="ml-1 line-clamp-2">{pesca.especiePeixe}</span>
                  </p>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">Alevinos:</span> 
                    <span className="ml-1">{pesca.quantidadeAlevinos ? `${pesca.quantidadeAlevinos} kg` : 'N/A'}</span>
                  </p>
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                    <span className="font-medium">Alimentação:</span> 
                    <span className="ml-1 line-clamp-2">{pesca.metodoAlimentacao}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Seção de Responsáveis */}
            <div className={`mt-${isMobile ? '3' : '4'}`}>
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-700 mb-${isMobile ? '2' : '3'}`}>Responsáveis</h3>
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'md:grid-cols-2 gap-4'}`}>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                  <span className="font-medium">Operador:</span> 
                  <span className="ml-1 line-clamp-2">{pesca.operador || "Não informado"}</span>
                </p>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
                  <span className="font-medium">Técnico:</span> 
                  <span className="ml-1 line-clamp-2">{pesca.tecnicoResponsavel || "Não informado"}</span>
                </p>
              </div>
            </div>

            {/* Rodapé */}
            <div className={`mt-${isMobile ? '3' : '4'} pt-${isMobile ? '2' : '4'} border-t border-gray-200`}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                Cadastrado em: {new Date(pesca.dataCadastro).toLocaleDateString('pt-BR')}
              </p>
            </div>

            {pesca.midias && pesca.midias.length > 0 && (
              <div className={`mt-${isMobile ? '4' : '6'}`}>
                <h3 className={`font-semibold text-gray-700 ${isMobile ? 'text-base' : 'text-lg'} mb-${isMobile ? '2' : '3'}`}>Mídias</h3>
                <div className={`grid grid-cols-${isMobile ? '1' : '1'} ${isMobile ? 'gap-2' : 'md:grid-cols-2 gap-4'}`}>
                  {pesca.midias.map((url, index) => {
                    // Verifica se é um vídeo do YouTube
                    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

                    if (isYouTube) {
                      // Extrair o ID do vídeo
                      let videoId = '';
                      try {
                        if (url.includes("youtu.be")) {
                          videoId = url.split("/").pop() || '';
                        } else {
                          // Para links como youtube.com/watch?v=XYZ123
                          const urlObj = new URL(url);
                          videoId = urlObj.searchParams.get("v") || '';
                        }
                      } catch (e) {
                        console.error("Erro ao processar URL do YouTube:", e);
                      }

                      if (videoId) {
                        const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1&showinfo=0&fs=1&enablejsapi=1`;
                        return (
                          <iframe
                            key={index}
                            className="w-full aspect-video rounded-lg"
                            src={embedUrl}
                            title={`YouTube video ${index}`}
                            allowFullScreen
                          />
                        );
                      }
                    }

                    // Verifica se é um vídeo comum (não YouTube)
                    const isRegularVideo = 
                      url.includes("/video/") || 
                      url.includes("/video/upload/") || 
                      url.endsWith(".mp4") || 
                      url.endsWith(".webm") || 
                      url.endsWith(".ogg") || 
                      url.endsWith(".mov") ||
                      url.includes("vimeo.com");

                    if (isRegularVideo) {
                      return (
                        <div key={index} className="relative">
                          <video
                            src={url}
                            controls
                            preload="metadata"
                            className="w-full aspect-video rounded-lg bg-gray-100"
                          />
                        </div>
                      );
                    }

                    // Se não for vídeo, exibe como imagem
                    return (
                      <img
                        key={index}
                        src={url}
                        alt="Mídia"
                        className="w-full h-auto rounded-lg object-cover aspect-square bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Mídia+indisponível';
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="absolute top-3 right-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              {isMaximized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              )}
            </button>
          </div>
        </InfoWindow>
      );
    },
    [isMaximized, isMobile],
  );

  if (!isLoaded) return <LoadingOptimizer isLoading={true} />;

  return (
    <LoadingOptimizer isLoading={loading}>
      <>
      {!loading && (
    <div className="pt-16 relative h-screen">
      <Card className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] p-4 bg-white/95 shadow-lg hidden md:block">
        <RadioGroup value={filtro} onValueChange={setFiltro}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="todos" id="todos-pesca" />
            <Label htmlFor="todos-pesca">Todos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="em-servico" id="em-servico-pesca" />
            <Label htmlFor="em-servico-pesca">Em Andamento</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="concluidos" id="concluidos-pesca" />
            <Label htmlFor="concluidos-pesca">Concluídos</Label>
          </div>
        </RadioGroup>
      </Card>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={() => setMapLoaded(true)}
        options={{
          minZoom: 8,
          maxZoom: 16,
          restriction: {
            latLngBounds: bounds,
            strictBounds: true,
          },
          mapTypeId: google.maps.MapTypeId.HYBRID,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [
              google.maps.MapTypeId.SATELLITE,
              google.maps.MapTypeId.ROADMAP,
              google.maps.MapTypeId.HYBRID,
              google.maps.MapTypeId.TERRAIN
            ]
          },
          styles: [
            {
              featureType: "administrative",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "poi",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "road",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "water",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "transit",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "landscape",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "poi.business",
              stylers: [{ visibility: "on" }]
            }
          ]
        }}
      >
        {pesqueirosFiltrados.map((pesca) => (
          <MarkerF
            key={pesca.id}
            position={{ lat: pesca.latitude, lng: pesca.longitude }}
            options={{ visible: true, clickable: true }}
            icon={{
              url: "/pesca-icon.png",
              scaledSize: new window.google.maps.Size(70, 70),
              anchor: new window.google.maps.Point(35, 70),
              origin: new window.google.maps.Point(0, 0),
              zIndex: 1000,
            }}
            onClick={() => setSelectedMarker(pesca)}
          />
        ))}
        
        {viveirosEmConstrucao.map((viveiro) => (
          <MarkerF
            key={`viveiro-${viveiro.id}`}
            position={{ lat: viveiro.latitude, lng: viveiro.longitude }}
            options={{ visible: true, clickable: true }}
            icon={{
              url: "/videos/viveiro.gif",
              scaledSize: new window.google.maps.Size(70, 70),
              anchor: new window.google.maps.Point(35, 70),
              origin: new window.google.maps.Point(0, 0),
              zIndex: 999,
            }}
            onClick={() => setSelectedViveiro(viveiro)}
          />
        ))}
        
        {selectedMarker && renderInfoWindow(selectedMarker)}
        {selectedViveiro && renderViveiroInfoWindow(selectedViveiro)}

        {/* Contorno do município (opcional, controlado pelo filtro) */}
        {showBoundary && (
          <Polygon
            paths={correctedBoundary}
            options={boundaryStyle}
          />
        )}

        {/* Botão de controle para o limite com ícone do município */}
        <div className="absolute top-36 right-4 z-50">
          <button
            onClick={() => setShowBoundary(!showBoundary)}
            className={styles["boundary-toggle"]}
            title={showBoundary ? "Ocultar Contorno Municipal" : "Mostrar Contorno Municipal"}
          >
            <img 
              src="/contornoicone.png" 
              alt="Contorno Municipal" 
              className={`${showBoundary ? styles["icon-active"] : ""}`}
            />
          </button>
        </div>
      </GoogleMap>
    </div>
      )}
      </>
    </LoadingOptimizer>
  );
};

export default PescaMap;