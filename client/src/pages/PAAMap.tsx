import { useState, useEffect, useCallback } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  GoogleMap,
  LoadScript,
  MarkerF,
  InfoWindow,
} from "@react-google-maps/api";

const useMapCache = (fetchFunction, options) => {
  const { key, expirationTime } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cachedData = localStorage.getItem(key);
  const cachedDataExpiration = localStorage.getItem(key + '_expiration');

  const isCachedDataValid = cachedData && cachedDataExpiration && (new Date(cachedDataExpiration) > new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isCachedDataValid) {
        result = JSON.parse(cachedData);
      } else {
        result = await fetchFunction();
        localStorage.setItem(key, JSON.stringify(result));
        localStorage.setItem(key + '_expiration', (new Date(Date.now() + expirationTime * 60 * 1000)).toString());
      }
      setData(result);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, key, expirationTime, isCachedDataValid]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
};


const PAAMap = () => {
  const fetchPAA = async () => {
    const querySnapshot = await getDocs(collection(db, "paa"));
    return querySnapshot.docs.map((doc) => {
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
        areaMecanizacao: data.areaMecanizacao,
      };
    });
  };

  const { data: paaLocais, loading } = useMapCache(fetchPAA, {
    key: 'paa_map_data',
    expirationTime: 30 // 30 minutos
  });

  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [filtro, setFiltro] = useState("todos");
  const [isMaximized, setIsMaximized] = useState(false);

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = {
    lat: -2.87922,
    lng: -52.0088,
  };

  const bounds = {
    north: -2.5,
    south: -3.5,
    east: -51.5,
    west: -52.5,
  };

  const renderInfoWindow = (paa: any) => {
    const status = paa.concluido
      ? '<span class="text-green-600 font-medium">Concluído</span>'
      : '<span class="text-blue-600 font-medium">Em Andamento</span>';

    return (
      <InfoWindow
        position={{ lat: paa.latitude, lng: paa.longitude }}
        onCloseClick={() => {
          setSelectedMarker(null);
          setIsMaximized(false);
        }}
        options={{
          maxWidth: isMaximized ? window.innerWidth * 0.9 : undefined,
        }}
      >
        <div
          className={`p-4 ${isMaximized ? "maximized" : ""} popup-content`}
          id={`popup-${paa.id}`}
        >
          {/* Texto à esquerda */}
          <div className="text-content">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{paa.localidade}</h3>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Localidade:</strong> {paa.localidade}
              </p>
              <p>
                <strong>Nome do Proprietário:</strong> {paa.proprietario || "-"}
              </p>
              <p>
                <strong>Tipo de Alimento:</strong> {paa.tipoAlimento}
              </p>
              <p>
                <strong>Quantidade Produzida:</strong> {paa.quantidadeProduzida}
              </p>
              <p>
                <strong>Método de Colheita:</strong> {paa.metodoColheita}
              </p>
              <p>
                <strong>Área de Mecanização:</strong>{" "}
                {paa.areaMecanizacao
                  ? (paa.areaMecanizacao / 10000).toFixed(2)
                  : "0.00"}{" "}
                ha
              </p>
              <p>
                <strong>Operador:</strong> {paa.operador}
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
                <strong>Status:</strong>{" "}
                <span dangerouslySetInnerHTML={{ __html: status }} />
              </p>
            </div>
          </div>

          {/* Mídias à direita (apenas se houver mídias) */}
          {paa.midias && paa.midias.length > 0 && (
            <div className="media-container">
              <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div
                className={`grid ${isMaximized ? "grid-cols-3" : "grid-cols-2"} gap-2`}
              >
                {paa.midias.map((url, index) =>
                  url.includes("/video/") || url.includes("/video/upload/") ? (
                    <div key={index} className="relative">
                      <video
                        src={url}
                        controls
                        className="w-full h-auto max-h-48 object-cover rounded-lg popup-media"
                        data-src={url}
                        data-index={index}
                        data-type="video"
                      />
                    </div>
                  ) : (
                    <img
                      key={index}
                      src={url}
                      alt="Mídia"
                      className="w-full h-auto max-h-48 object-cover rounded-lg popup-media"
                      data-src={url}
                      data-index={index}
                      data-type="image"
                    />
                  ),
                )}
              </div>
            </div>
          )}

          {/* Botão de Maximizar/Reduzir */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
          >
            {isMaximized ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6"></path>
                <path d="M9 21H3v-6"></path>
                <path d="M21 3l-7 7"></path>
                <path d="M3 21l7-7"></path>
              </svg>
            )}
          </button>
        </div>
      </InfoWindow>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const paaFiltrados = paaLocais.filter((paa) => {
    if (filtro === "todos") return true;
    if (filtro === "em-servico") return !paa.concluido;
    if (filtro === "concluidos") return paa.concluido;
    return true;
  });

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

      <LoadScript googleMapsApiKey="AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          options={{
            minZoom: 10,
            maxZoom: 16,
            restriction: {
              latLngBounds: bounds,
              strictBounds: true,
            },
            styles: [
              {
                featureType: "all",
                elementType: "all",
                stylers: [{ visibility: "on" }],
              },
            ],
          }}
        >
          {paaFiltrados.map((paa) => (
            <MarkerF
              key={paa.id}
              position={{ lat: paa.latitude, lng: paa.longitude }}
              icon={{
                url: "PAA-icon.png",
                scaledSize: {
                  width: 50,
                  height: 50,
                },
                anchor: {
                  x: 30,
                  y: 60,
                },
              }}
              onClick={() => setSelectedMarker(paa)}
            />
          ))}
          {selectedMarker && renderInfoWindow(selectedMarker)}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default PAAMap;