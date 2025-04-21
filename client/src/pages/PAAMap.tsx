import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useKmlBoundary } from "../hooks/useKmlBoundary";
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

  // Estilo para a área externa - removido o filtro
  const maskStyle = useMemo(() => ({
    fillColor: 'transparent',
    fillOpacity: 0,
    strokeWeight: 0,
    clickable: false
  }), []);

  // Estilo apenas para o contorno do município sem preenchimento
  const boundaryStyle = useMemo(() => ({
    fillColor: 'transparent',
    fillOpacity: 0,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    strokeDasharray: [4, 4], // Linha tracejada para visual mais profissional
    clickable: false
  }), []);

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
      const status = paa.concluido ? (
        <span className="text-green-600 font-medium">Concluído</span>
      ) : (
        <span className="text-blue-600 font-medium">Em Andamento</span>
      );

      return (
        <InfoWindow
          position={{ lat: paa.latitude, lng: paa.longitude }}
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
                <h3 className="font-bold text-lg">{paa.localidade}</h3>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Localidade:</strong> {paa.localidade}
                </p>
                <p>
                  <strong>Nome do Proprietário:</strong>{" "}
                  {paa.proprietario || "-"}
                </p>
                <p>
                  <strong>Tipo de Alimento:</strong> {paa.tipoAlimento}
                </p>
                <p>
                  <strong>Quantidade Produzida:</strong>{" "}
                  {(() => {
                    const quantidade = typeof paa.quantidadeProduzida === 'number' 
                      ? paa.quantidadeProduzida 
                      : typeof paa.quantidadeProduzida === 'string' 
                        ? parseFloat(paa.quantidadeProduzida) 
                        : null;

                    if (quantidade === null) return "-";
                    return quantidade.toFixed(2) + " kg";
                  })()}
                </p>
                <p>
                  <strong>Método de Colheita:</strong> {paa.metodoColheita}
                </p>
                <p>
                  <strong>Área de Mecanização:</strong>{" "}
                  {(() => {
                    // Verifica múltiplas possíveis propriedades para a área de mecanização
                    const areaValue = paa.areaMecanization || paa.areaMecanizacao || paa.areaTrabalhada || paa.area;
                    const area = typeof areaValue === 'number' 
                      ? areaValue 
                      : typeof areaValue === 'string' 
                        ? parseFloat(areaValue) 
                        : null;

                    if (area === null || isNaN(area)) return "0.00 ha";
                    return (area / 10000).toFixed(2) + " ha";
                  })()}
                </p>
                <p>
                  <strong>Operador:</strong> {paa.operador || "-"}
                </p>
                <p>
                  <strong>Técnico Responsável:</strong>{" "}
                  {paa.tecnicoResponsavel || "-"}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(paa.dataCadastro).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {status}
                </p>
              </div>
            </div>

            {paa.midias && paa.midias.length > 0 && (
              <div className={styles["media-container"]}>
                <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
                <div className={styles.grid}>
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
                        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
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
      <Card className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] p-4 bg-white/95 shadow-lg">
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
          styles: [
            {
              featureType: "administrative",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "poi",
              stylers: [{ visibility: "on" }]
            }
          ]
        }}
      >
        {paaFiltrados.map((paa) => (
          <MarkerF
            key={paa.id}
            position={{ lat: paa.latitude, lng: paa.longitude }}
            icon={{
              url: "/paa-icon.png",
              scaledSize: new window.google.maps.Size(50, 50),
              anchor: new window.google.maps.Point(25, 50),
            }}
            onClick={() => setSelectedMarker(paa)}
          />
        ))}
        {selectedMarker && renderInfoWindow(selectedMarker)}
        
        <KmlLayer
          url="https://firebasestorage.googleapis.com/v0/b/transparencia-agricola.appspot.com/o/uploads%2Fvitoria-xingu.kml?alt=media"
          options={{
            preserveViewport: true,
            suppressInfoWindows: true,
          }}
        />
        
        {/* Máscara escura aplicada FORA do município (sempre visível) */}
        <Polygon
          paths={[
            worldBounds, // Primeiro caminho: mundo inteiro
            [...municipioBoundary].reverse() // Segundo caminho: município em ordem inversa
          ]}
          options={maskStyle}
        />
        
        {/* Contorno do município (opcional, controlado pelo filtro) */}
        {showBoundary && (
          <Polygon
            paths={municipioBoundary}
            options={boundaryStyle}
          />
        )}
        
        {/* Botão de controle para o limite com estilo profissional */}
        <div className="absolute top-20 right-4 z-50">
          <button
            onClick={() => setShowBoundary(!showBoundary)}
            className={styles["boundary-toggle"]}
          >
            {showBoundary ? "Ocultar Contorno Municipal" : "Mostrar Contorno Municipal"}
          </button>
        </div>
      </GoogleMap>
    </div>
  );
};

export default PAAMap;