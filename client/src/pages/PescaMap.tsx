import { useState, useEffect, useCallback } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useLoadScript } from "@react-google-maps/api";
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

// Custom caching hook
import { useMapCache } from '../hooks/useMapCache';


const PescaMap = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc",
  });

  if (!isLoaded) return <div>Loading...</div>;
  const fetchPesqueiros = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, "pesca"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        localidade: data.localidade,
        tipoTanque: data.tipoTanque,
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
  }, []);

  const { data: pesqueiros, loading } = useMapCache(fetchPesqueiros, {
    key: 'pesca_map_data',
    expirationTime: 30 // 30 minutos
  });
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  const updateReportData = async (pescaData: any) => {
    try {
      const docRef = doc(db, "pesca", pescaData.id);
      await updateDoc(docRef, pescaData);
      // Force report data refresh by updating collection
      const querySnapshot = await getDocs(collection(db, "pesca"));
      const pescaDataUpdated = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Update report statistics
      const event = new CustomEvent('pescaDataUpdated', { detail: pescaDataUpdated });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error updating report data:", error);
    }
  };


  interface Pesca {
    id: string;
    numeroRegistro?: string;
    localidade: string;
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

  const [filtro, setFiltro] = useState("todos");

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

  const [isMaximized, setIsMaximized] = useState(false);

  const renderInfoWindow = (pesca: Pesca) => {
    const status = pesca.concluido
      ? '<span class="text-green-600 font-medium">Concluído</span>'
      : '<span class="text-blue-600 font-medium">Em Andamento</span>';

    return (
      <InfoWindow
        position={{ lat: pesca.latitude, lng: pesca.longitude }}
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
          id={`popup-${pesca.id}`}
        >
          {/* Texto à esquerda */}
          <div className="text-content">
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
                <strong>Tipo de Ambiente de Cultivo:</strong> {pesca.tipoTanque}
              </p>
              <p>
                <strong>Área do imóvel:</strong> {pesca.areaImovel ? `${pesca.areaImovel} ha` : "-"}
              </p>
              <p>
                <strong>Área Alagada:</strong> {pesca.areaAlagada ? `${pesca.areaAlagada} ha` : "-"}
              </p>
              <p>
                <strong>Ciclo de produção:</strong> {pesca.cicloProdução || "-"}
              </p>
              <p>
                <strong>Sistema de cultivo:</strong> {pesca.sistemaCultivo || "-"}
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
                <strong>Status:</strong>{" "}
                <span dangerouslySetInnerHTML={{ __html: status }} />
              </p>
            </div>
          </div>

          {/* Mídias à direita (apenas se houver mídias) */}
          {pesca.midias && pesca.midias.length > 0 && (
            <div className="media-container">
              <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div
                className={`grid ${isMaximized ? "grid-cols-3" : "grid-cols-2"} gap-2`}
              >
                {pesca.midias.map((url, index) =>
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

  const pesqueirosFiltrados = pesqueiros.filter((pesca) => {
    if (filtro === "todos") return true;
    if (filtro === "em-servico") return !pesca.concluido;
    if (filtro === "concluidos") return pesca.concluido;
    return true;
  });

  return (
    <div className="pt-16 relative h-screen">
      <Card className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] p-4 bg-white/95 shadow-lg">
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

      <LoadScript googleMapsApiKey="AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc" loadingElement={<div>Loading...</div>}>
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
          {pesqueirosFiltrados.map((pesca) => (
            <MarkerF
              key={pesca.id}
              position={{ lat: pesca.latitude, lng: pesca.longitude }}
              icon={{
                url: "pesca-icon.png",
                scaledSize: {
                  width: 50,
                  height: 50,
                },
                anchor: {
                  x: 25,
                  y: 50,
                },
              }}
              onClick={() => setSelectedMarker(pesca)}
            />
          ))}
          {selectedMarker && renderInfoWindow(selectedMarker)}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default PescaMap;