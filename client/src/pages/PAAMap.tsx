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
import styles from "./PAAMap.module.css";

interface PAA {
  id: string;
  localidade: string;
  tipoAlimento: string;
  quantidadeProduzida: number;
  metodoColheita: string;
  operador?: string;
  tecnicoResponsavel?: string;
  dataCadastro: string;
  concluido: boolean;
  latitude: number;
  longitude: number;
  midias?: string[];
  proprietario?: string;
  areaMecanization?: number;
}

const PAAMap = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc",
  });

  const [paaLocais, setPaaLocais] = useState<PAA[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<PAA | null>(null);
  const [filtro, setFiltro] = useState("todos");
  const [isMaximized, setIsMaximized] = useState(false);

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

  const fetchPAA = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "paa"));
      const paaLocaisData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          localidade: data.localidade,
          tipoAlimento: data.tipoAlimento,
          quantidadeProduzida: data.quantidadeProduzida,
          metodoColheita: data.metodoColheita,
          operador: data.operador,
          tecnicoResponsavel: data.tecnicoResponsavel,
          dataCadastro: data.dataCadastro,
          concluido: data.concluido,
          latitude: data.latitude,
          longitude: data.longitude,
          midias: data.midias,
          proprietario: data.proprietario,
          areaMecanization: data.areaMecanization,
        };
      });
      setPaaLocais(paaLocaisData);
    } catch (error) {
      console.error("Erro ao buscar locais do PAA:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPAA();
  }, [fetchPAA]);

  const paaFiltrados = useMemo(() => {
    return paaLocais.filter((paa) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !paa.concluido;
      if (filtro === "concluidos") return paa.concluido;
      return true;
    });
  }, [paaLocais, filtro]);

  const renderInfoWindow = useCallback(
    (paa: PAA) => {
      const infoWindowStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        border: "2px solid #38a169",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        padding: "2rem",
        width: isMaximized ? "90vw" : "480px",
        maxHeight: isMaximized ? "90vh" : "85vh",
        overflowY: "auto",
        backdropFilter: "blur(12px)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      };

      return (
        <InfoWindow
          position={{ lat: paa.latitude, lng: paa.longitude }}
          onCloseClick={() => {
            setSelectedMarker(null);
            setIsMaximized(false);
          }}
          options={{
            maxWidth: isMaximized ? window.innerWidth * 0.9 : 550,
            maxHeight: isMaximized ? window.innerHeight * 0.9 : undefined,
          }}
        >
          <div className="relative" style={infoWindowStyle}>
            <button
              onClick={() => {
                setSelectedMarker(null);
                setIsMaximized(false);
              }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X size={18} />
            </button>

            {/* Cabeçalho melhorado */}
            <div className="flex items-start gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className={`p-4 rounded-xl shadow-sm ${paa.concluido ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-700' : 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700'}`}>
                {paa.concluido ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">{paa.localidade}</h2>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm
                  ${paa.concluido ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                  {paa.concluido ? '✓ Concluído' : '🌾 Em Andamento'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seção Localização */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Localização</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Localidade</span>
                    <span className="bg-gradient-to-r from-green-50 to-green-100 px-3 py-2 rounded-lg text-green-800 font-medium">
                      {paa.localidade}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Proprietário</span>
                    <span className="text-gray-700 font-medium">{paa.proprietario || "Não informado"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Área de Mecanização</span>
                    <span className="bg-orange-50 px-3 py-2 rounded-lg text-orange-800 font-bold text-lg">
                      {(() => {
                        const areaValue = paa.areaMecanization || paa.areaMecanizacao || paa.areaTrabalhada || paa.area;
                        const area = typeof areaValue === 'number' 
                          ? areaValue 
                          : typeof areaValue === 'string' 
                            ? parseFloat(areaValue) 
                            : null;

                        if (area === null || isNaN(area)) return "0.00 ha";
                        return (area / 10000).toFixed(2) + " ha";
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seção Produção */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span>Produção</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tipo de Alimento</span>
                    <span className="text-gray-700 font-medium">{paa.tipoAlimento}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Quantidade Produzida</span>
                    <span className="text-gray-700 font-medium">
                      {(() => {
                        const quantidade = typeof paa.quantidadeProduzida === 'number' 
                          ? paa.quantidadeProduzida 
                          : typeof paa.quantidadeProduzida === 'string' 
                            ? parseFloat(paa.quantidadeProduzida) 
                            : null;

                        if (quantidade === null || isNaN(quantidade)) return "Não informado";
                        return quantidade.toFixed(1) + " kg";
                      })()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Método de Colheita</span>
                    <span className="text-gray-700 font-medium">{paa.metodoColheita}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé com informações adicionais */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-medium">Operador</span>
                    <span className="font-semibold text-gray-700">{paa.operador || "Não informado"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-medium">Técnico</span>
                    <span className="font-semibold text-gray-700">{paa.tecnicoResponsavel || "Não informado"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-medium">Data</span>
                    <span className="font-semibold text-gray-700">{new Date(paa.dataCadastro).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {paa.midias && paa.midias.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 text-lg mb-3">Mídias</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paa.midias.map((url, index) => {
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
    [isMaximized],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="pt-16 relative h-screen">
      <Card className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] p-4 bg-white/95 shadow-lg ${styles['mobile-filter']}`}>
        <RadioGroup value={filtro} onValueChange={setFiltro}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="todos" id="todos-paa" />
            <Label htmlFor="todos-paa">Todos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="em-servico" id="em-servico-paa" />
            <Label htmlFor="em-servico-paa">Em Andamento</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="concluidos" id="concluidos-paa" />
            <Label htmlFor="concluidos-paa">Concluídos</Label>
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
        {paaFiltrados.map((paa) => (
          <MarkerF
            key={paa.id}
            position={{ lat: paa.latitude, lng: paa.longitude }}
            options={{ visible: true, clickable: true }}
            icon={{
              url: "/paa-icon.png",
              scaledSize: new window.google.maps.Size(70, 70),
              anchor: new window.google.maps.Point(35, 70),
              origin: new window.google.maps.Point(0, 0),
              zIndex: 1000,
            }}
            onClick={() => setSelectedMarker(paa)}
          />
        ))}
        {selectedMarker && renderInfoWindow(selectedMarker)}
        
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
  );
};

export default PAAMap;