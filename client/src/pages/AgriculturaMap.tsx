import "@dotlottie/player-component";
import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useKmlBoundary, isClockwise, ensureClockwise } from "../hooks/useKmlBoundary";
import { useIsMobile } from "../hooks/use-mobile";
import {
  useLoadScript,
  GoogleMap,
  InfoWindow, 
  KmlLayer,
  Polygon
} from "@react-google-maps/api";
import { Loader2, X, CheckCircle, Activity, MapPin, Clock, Calendar, User, HardHat, ArrowLeft } from "lucide-react"; 
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import styles from "./AgriculturaMap.module.css";

interface Trator {
  id: string;
  nome: string;
  fazenda: string;
  atividade: string;
  piloto: string;
  dataCadastro: string;
  concluido: boolean;
  latitude: number;
  longitude: number;
  tempoAtividade?: number;
  areaTrabalhada?: number;
  horaMaquina?: number;
  midias?: string[];
  localidade?: string;
  proprietario?: string;
  tecnicoResponsavel?: string;
}

const AgriculturaMapContent = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc",
  });

  // Tratamento de erro de carregamento do Google Maps
  if (loadError) {
    console.error('Erro ao carregar Google Maps:', loadError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">📍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Erro ao Carregar Mapa
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar o Google Maps. Verifique sua conexão e tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const [tratores, setTratores] = useState<Trator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Trator | null>(null);
  const [filtro, setFiltro] = useState("todos");
  const [isMaximized, setIsMaximized] = useState(false);
  const [showBoundary, setShowBoundary] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const isMobile = useIsMobile();

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = useMemo(() => ({ lat: -3.15, lng: -52.0088 }), []);
  const bounds = useMemo(
    () => ({
      north: -2.5,
      south: -3.8,
      east: -51.5,
      west: -52.5,
    }),
    [],
  );

  const kmlUrl = "https://firebasestorage.googleapis.com/v0/b/transparencia-agricola.appspot.com/o/uploads%2Fvitoria-xingu.kml?alt=media";
  const { boundaryCoordinates, loading: loadingKml, error: kmlError } = useKmlBoundary(kmlUrl);

  const fallbackBoundary = useMemo(() => [
    { lat: -2.85, lng: -52.05 },
    { lat: -2.88, lng: -51.95 },
    { lat: -2.93, lng: -51.98 },
    { lat: -2.91, lng: -52.07 },
    { lat: -2.85, lng: -52.05 },
  ], []);

  const municipioBoundary = useMemo(() => {
    if (boundaryCoordinates.length > 0) {
      return boundaryCoordinates;
    }
    return fallbackBoundary;
  }, [boundaryCoordinates, fallbackBoundary]);

  const worldBounds = useMemo(() => [
    { lat: -90, lng: -180 },
    { lat: -90, lng: 180 },
    { lat: 90, lng: 180 },
    { lat: 90, lng: -180 },
    { lat: -90, lng: -180 },
  ], []);

  const maskStyle = useMemo(() => ({
    fillColor: '#000000',
    fillOpacity: 0.6,
    strokeWeight: 0,
    clickable: false,
    zIndex: 1
  }), []);

  const boundaryStyle = useMemo(() => ({
    fillColor: '#00ff88',
    fillOpacity: 0.1,
    strokeColor: '#00ff88',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    zIndex: 2,
    clickable: false
  }), []);

  const correctedBoundary = useMemo(() => {
    return ensureClockwise(municipioBoundary);
  }, [municipioBoundary]);

  const formatTempoAtividade = useCallback((tempo?: number) => {
    if (!tempo) return "Não registrado";

    if (tempo > 100) {
      const horas = Math.floor(tempo / 60);
      const minutos = Math.round(tempo % 60);
      return `${horas}h ${minutos}m`;
    } else {
      return `${tempo.toFixed(1)} horas`;
    }
  }, []);

  const fetchTratores = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let areaTrabalhada = undefined;
        if (data.areaTrabalhada !== undefined && data.areaTrabalhada !== null) {
          areaTrabalhada = typeof data.areaTrabalhada === 'number' 
            ? data.areaTrabalhada 
            : parseFloat(data.areaTrabalhada);
        }

        return {
          id: doc.id,
          nome: data.nome,
          fazenda: data.fazenda,
          atividade: data.atividade,
          piloto: data.piloto,
          dataCadastro: data.dataCadastro,
          concluido: data.concluido,
          latitude: data.latitude,
          longitude: data.longitude,
          tempoAtividade: data.tempoAtividade,
          areaTrabalhada: areaTrabalhada,
          horaMaquina: data.horaMaquina,
          midias: data.midias,
          localidade: data.localidade,
          proprietario: data.proprietario,
          tecnicoResponsavel: data.tecnicoResponsavel,
        };
      });
      setTratores(tratoresData);
    } catch (error) {
      console.error("Erro ao buscar tratores:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTratores();
  }, [fetchTratores]);

  // useEffect para gerenciar marcadores avançados
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;

    // Limpar marcadores existentes
    markers.forEach(marker => {
      marker.map = null;
    });
    setMarkers([]);

    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    tratoresFiltrados.forEach((trator) => {
      const img = document.createElement('img');
      img.src = trator.concluido ? "/trator-icon.png" : "/giftrator.gif";
      img.style.width = trator.concluido ? '60px' : '100px';
      img.style.height = trator.concluido ? '60px' : '100px';
      img.style.cursor = 'pointer';

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstance,
        position: { lat: trator.latitude, lng: trator.longitude },
        content: img,
        title: trator.nome,
      });

      marker.addListener('click', () => {
        setSelectedMarker(trator);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [mapInstance, isLoaded, tratoresFiltrados]);

  // Log para debug
  console.log('Tratores carregados:', tratores);

  const tratoresFiltrados = useMemo(() => {
    return tratores.filter((trator) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !trator.concluido;
      if (filtro === "concluidos") return trator.concluido;
      return true;
    });
  }, [tratores, filtro]);

  console.log('Tratores filtrados:', tratoresFiltrados);

  const renderInfoWindow = useCallback(
    (trator: Trator) => {
      const infoWindowStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.97)",
        border: "2px solid #38a169",
        borderRadius: isMobile ? "12px" : "16px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        padding: isMobile ? "1rem" : "2rem",
        width: isMobile ? `${Math.floor(window.innerWidth * 0.92)}px` : (isMaximized ? "90vw" : "480px"),
        maxWidth: isMobile ? `${Math.floor(window.innerWidth * 0.92)}px` : "none",
        maxHeight: isMobile ? "75vh" : (isMaximized ? "90vh" : "85vh"),
        overflowY: "auto",
        backdropFilter: "blur(12px)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        position: "relative",
        margin: "0",
        boxSizing: "border-box",
      };

      return (
        <InfoWindow
          position={{ lat: trator.latitude, lng: trator.longitude }}
          onCloseClick={() => {
            setSelectedMarker(null);
            setIsMaximized(false);
          }}
          options={{
            maxWidth: isMobile ? Math.floor(window.innerWidth * 0.95) : (isMaximized ? window.innerWidth * 0.9 : 550),
            maxHeight: isMobile ? Math.floor(window.innerHeight * 0.8) : (isMaximized ? window.innerHeight * 0.9 : undefined),
            pixelOffset: isMobile ? new google.maps.Size(0, -10) : new google.maps.Size(0, 0),
            disableAutoPan: isMobile ? false : true,
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
            <div className={`flex items-start gap-${isMobile ? '3' : '4'} mb-${isMobile ? '4' : '6'} pb-${isMobile ? '3' : '4'} border-b border-gray-100`}>
              <div className={`p-${isMobile ? '3' : '4'} rounded-xl shadow-sm ${trator.concluido ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700'}`}>
                {trator.concluido ? (
                  <CheckCircle size={isMobile ? 24 : 28} />
                ) : (
                  <Activity size={isMobile ? 24 : 28} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-800 mb-1 leading-tight truncate`}>{trator.fazenda}</h2>
                <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 mb-2 font-medium line-clamp-2`}>{trator.localidade || "Localidade não informada"}</p>
                <div className={`inline-flex items-center px-${isMobile ? '3' : '4'} py-${isMobile ? '1.5' : '2'} rounded-full text-${isMobile ? 'xs' : 'sm'} font-semibold shadow-sm
                  ${trator.concluido ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {trator.concluido ? '✓ Concluído' : '⚡ Em Serviço'}
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-6'}`}>
              {/* Seção Localização */}
              <div className={`space-y-${isMobile ? '3' : '4'}`}>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-700 flex items-center gap-2 mb-${isMobile ? '2' : '3'}`}>
                  <MapPin size={isMobile ? 18 : 20} className="text-green-600" /> 
                  <span>Localização</span>
                </h3>
                <div className={`space-y-${isMobile ? '2' : '3'}`}>
                  <div className="flex flex-col gap-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 uppercase tracking-wide`}>Proprietário</span>
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 font-medium line-clamp-2`}>{trator.proprietario || "Não informado"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 uppercase tracking-wide`}>Operador</span>
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 font-medium line-clamp-2`}>{trator.piloto}</span>
                  </div>
                </div>
              </div>

              {/* Seção Operação */}
              <div className={`space-y-${isMobile ? '3' : '4'}`}>
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-700 flex items-center gap-2 mb-${isMobile ? '2' : '3'}`}>
                  <HardHat size={isMobile ? 18 : 20} className="text-blue-600" /> 
                  <span>Operação</span>
                </h3>
                <div className={`space-y-${isMobile ? '2' : '3'}`}>
                  <div className="flex flex-col gap-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 uppercase tracking-wide`}>Trator</span>
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 font-medium line-clamp-2`}>{trator.nome}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 uppercase tracking-wide`}>Atividade</span>
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 font-medium line-clamp-2`}>{trator.atividade}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 uppercase tracking-wide`}>Área Trabalhada</span>
                    <span className={`bg-blue-50 px-${isMobile ? '2' : '3'} py-${isMobile ? '1.5' : '2'} rounded-lg text-blue-800 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
                      {trator.areaTrabalhada?.toFixed(2) || "0"} ha
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 uppercase tracking-wide`}>Hora/Máquina</span>
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 font-medium line-clamp-2`}>{trator.horaMaquina || "Não informado"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé com informações adicionais */}
            <div className={`mt-${isMobile ? '4' : '6'} pt-${isMobile ? '3' : '4'} border-t border-gray-100`}>
              <div className={`grid grid-cols-1 ${isMobile ? 'gap-2' : 'sm:grid-cols-2 gap-4'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className={`flex items-center gap-2 p-${isMobile ? '2' : '3'} bg-gray-50 rounded-lg`}>
                  <HardHat size={isMobile ? 14 : 16} className="text-gray-600" />
                  <div className="min-w-0 flex-1">
                    <span className={`block ${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 uppercase font-medium`}>Técnico</span>
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-700 line-clamp-1`}>{trator.tecnicoResponsavel || "Não informado"}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 p-${isMobile ? '2' : '3'} bg-gray-50 rounded-lg`}>
                  <Calendar size={isMobile ? 14 : 16} className="text-gray-600" />
                  <div className="min-w-0 flex-1">
                    <span className={`block ${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 uppercase font-medium`}>Data</span>
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-700`}>{new Date(trator.dataCadastro).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {trator.midias && trator.midias.length > 0 && (
              <div className={`mt-${isMobile ? '4' : '6'}`}>
                <h3 className={`font-semibold text-gray-700 ${isMobile ? 'text-base' : 'text-lg'} mb-${isMobile ? '2' : '3'}`}>Mídias</h3>
                <div className={`grid grid-cols-${isMobile ? '1' : '2'} ${isMobile ? 'gap-2' : 'sm:grid-cols-3 gap-3'}`}>
                  {trator.midias.map((url, index) => {
                    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

                    if (isYouTube) {
                      let videoId = '';
                      try {
                        if (url.includes("youtu.be")) {
                          videoId = url.split("/").pop() || '';
                        } else {
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
    [isMaximized, formatTempoAtividade],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados da agricultura...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-green-200 rounded-full mx-auto mb-4"></div>
          </div>
          <p className="text-gray-600">Carregando Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'pt-0' : 'pt-16'} relative h-screen`}>
      {isMobile && (
        <button 
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 z-[1001] bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border border-gray-200"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
      )}
      <Card className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] p-4 bg-white/95 shadow-lg hidden md:block">
        <RadioGroup value={filtro} onValueChange={setFiltro}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="todos" id="todos" />
            <Label htmlFor="todos">Todos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="em-servico" id="em-servico" />
            <Label htmlFor="em-servico">Em Serviço</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="concluidos" id="concluidos" />
            <Label htmlFor="concluidos">Concluídos</Label>
          </div>
        </RadioGroup>
      </Card>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={(map) => {
          setMapLoaded(true);
          setMapInstance(map);
        }}
        options={{
          mapId: "DEMO_MAP_ID",
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

        {selectedMarker && renderInfoWindow(selectedMarker)}

        {showBoundary && (
          <Polygon
            paths={correctedBoundary}
            options={boundaryStyle}
          />
        )}

        <div className="absolute top-36 right-4 z-50">
          <button
            onClick={() => setShowBoundary(!showBoundary)}
            className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors ${showBoundary ? 'ring-2 ring-green-500' : ''}`}
            title={showBoundary ? "Ocultar Contorno Municipal" : "Mostrar Contorno Municipal"}
          >
            <img 
              src="/contornoicone.png" 
              alt="Contorno Municipal" 
              className="w-6 h-6"
            />
          </button>
        </div>
      </GoogleMap>
    </div>
  );
};

const AgriculturaMap = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Erro específico no AgriculturaMap:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          location: window.location.href,
          userAgent: navigator.userAgent
        });
      }}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">🚜</div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Problema no Mapa da Agricultura
            </h2>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro ao carregar o mapa. Isso pode ser um problema temporário.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                🔄 Recarregar Mapa
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </div>
      }
    >
      <AgriculturaMapContent />
    </ErrorBoundary>
  );
};

export default AgriculturaMap;