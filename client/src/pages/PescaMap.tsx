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

const PescaMap = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc",
  });

  const [pesqueiros, setPesqueiros] = useState<Pesca[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Pesca | null>(null);
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
    fetchPesqueiros();
  }, [fetchPesqueiros]);

  const pesqueirosFiltrados = useMemo(() => {
    return pesqueiros.filter((pesca) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !pesca.concluido;
      if (filtro === "concluidos") return pesca.concluido;
      return true;
    });
  }, [pesqueiros, filtro]);

  const renderInfoWindow = useCallback(
    (pesca: Pesca) => {
      const status = pesca.concluido ? (
        <span className="text-green-600 font-medium">Concluído</span>
      ) : (
        <span className="text-blue-600 font-medium">Em Andamento</span>
      );

      return (
        <InfoWindow
          position={{ lat: pesca.latitude, lng: pesca.longitude }}
          onCloseClick={() => {
            setSelectedMarker(null);
            setIsMaximized(false);
          }}
          options={{
            maxWidth: isMaximized ? window.innerWidth * 0.9 : 500,
            maxHeight: isMaximized ? window.innerHeight * 0.9 : undefined,
          }}
        >
          <div
            className={`p-4 ${isMaximized ? styles.maximized : ""}`}
          >
            {/* Botão de Fechar */}
            <button
              onClick={() => {
                setSelectedMarker(null);
                setIsMaximized(false);
              }}
              className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2 z-10"
            >
              <X className="h-4 w-4" /> {/* Ícone de fechar */}
            </button>

            <div className={styles["text-content"]}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{pesca.localidade}</h3>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>N° de Registro:</strong> {pesca.numeroRegistro || "-"}
                </p>
                <p>
                  <strong>Localidade:</strong> {pesca.localidade}
                </p>
                <p>
                  <strong>Nome do Imóvel Rural:</strong> {pesca.nomeImovel || "-"}
                </p>
                <p>
                  <strong>Nome do Proprietário:</strong> {pesca.proprietario || "-"}
                </p>
                <p>
                  <strong>Estrutura Aquícola:</strong>{" "}
                  {pesca.tipoTanque}
                </p>
                <p>
                  <strong>Espécie:</strong> {pesca.especiePeixe}
                </p>
                <p>
                  <strong>Quantidade de Alevinos:</strong>{" "}
                  {pesca.quantidadeAlevinos} unidades
                </p>
                <p>
                  <strong>Método de Alimentação:</strong>{" "}
                  {pesca.metodoAlimentacao}
                </p>
                <p>
                  <strong>Operador:</strong> {pesca.operador || "-"}
                </p>
                <p>
                  <strong>Técnico Responsável:</strong>{" "}
                  {pesca.tecnicoResponsavel || "-"}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(pesca.dataCadastro).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {status}
                </p>
              </div>
            </div>

            {pesca.midias && pesca.midias.length > 0 && (
              <div className={styles["media-container"]}>
                <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
                <div className={styles.grid}>
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
                            width="100%"
                            height="240"
                            src={embedUrl}
                            title={`YouTube video ${index}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className={`${styles["popup-media"]} rounded-lg`}
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
                            className={`${styles["popup-media"]}`}
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
                        className={`${styles["popup-media"]}`}
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
              className="absolute top-2 right-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 z-10"
            >
              {isMaximized ? "Reduzir" : "Maximizar"}
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

export default PescaMap;