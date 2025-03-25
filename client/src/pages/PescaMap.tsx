import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  InfoWindow,
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

  const center = useMemo(() => ({ lat: -2.87922, lng: -52.0088 }), []);
  const bounds = useMemo(
    () => ({
      north: -2.5,
      south: -3.5,
      east: -51.5,
      west: -52.5,
    }),
    [],
  );

  const fetchPesqueiros = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pesca"));
      const pesqueirosData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          numeroRegistro: data.numeroRegistro,
          localidade: data.localidade,
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
            maxWidth: isMaximized ? window.innerWidth * 0.9 : undefined,
          }}
        >
          <div
            className={`p-4 ${isMaximized ? "maximized" : ""} popup-content`}
          >
            {/* Botão de Fechar */}
            <button
              onClick={() => {
                setSelectedMarker(null);
                setIsMaximized(false);
              }}
              className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
            >
              <X className="h-4 w-4" /> {/* Ícone de fechar */}
            </button>

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
                  <strong>Tipo de Ambiente de Cultivo:</strong>{" "}
                  {pesca.tipoTanque}
                </p>
                <p>
                  <strong>Área do imóvel:</strong>{" "}
                  {pesca.areaImovel ? `${pesca.areaImovel} ha` : "-"}
                </p>
                <p>
                  <strong>Área Alagada:</strong>{" "}
                  {pesca.areaAlagada ? `${pesca.areaAlagada} ha` : "-"}
                </p>
                <p>
                  <strong>Ciclo de produção:</strong>{" "}
                  {pesca.cicloProdução || "-"}
                </p>
                <p>
                  <strong>Sistema de cultivo:</strong>{" "}
                  {pesca.sistemaCultivo || "-"}
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
              <div className="media-container">
                <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
                <div
                  className={`grid ${isMaximized ? "grid-cols-3" : "grid-cols-2"} gap-2`}
                >
                  {pesca.midias.map((url, index) =>
                    url.includes("/video/") ||
                    url.includes("/video/upload/") ? (
                      <div key={index} className="relative">
                        <video
                          src={url}
                          controls
                          className="w-full h-auto max-h-48 object-cover rounded-lg popup-media"
                        />
                      </div>
                    ) : (
                      <img
                        key={index}
                        src={url}
                        alt="Mídia"
                        className="w-full h-auto max-h-48 object-cover rounded-lg popup-media"
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="absolute top-2 right-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
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
        options={{
          minZoom: 10,
          maxZoom: 16,
          restriction: {
            latLngBounds: bounds,
            strictBounds: true,
          },
        }}
      >
        {pesqueirosFiltrados.map((pesca) => (
          <MarkerF
            key={pesca.id}
            position={{ lat: pesca.latitude, lng: pesca.longitude }}
            icon={{
              url: "pesca-icon.png",
              scaledSize: { width: 50, height: 50 },
              anchor: { x: 25, y: 50 },
            }}
            onClick={() => setSelectedMarker(pesca)}
          />
        ))}
        {selectedMarker && renderInfoWindow(selectedMarker)}
      </GoogleMap>
    </div>
  );
};

export default PescaMap;
