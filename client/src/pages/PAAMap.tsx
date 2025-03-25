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
  areaMecanizacao?: number;
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
          areaMecanizacao: data.areaMecanizacao,
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
                  {paa.quantidadeProduzida}
                </p>
                <p>
                  <strong>Método de Colheita:</strong> {paa.metodoColheita}
                </p>
                <p>
                  <strong>Área de Mecanização:</strong>{" "}
                  {paa.areaMecanizacao
                    ? `${(paa.areaMecanizacao / 10000).toFixed(2)} ha`
                    : "0.00 ha"}
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
              <div className="media-container">
                <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
                <div
                  className={`grid ${isMaximized ? "grid-cols-3" : "grid-cols-2"} gap-2`}
                >
                  {paa.midias.map((url, index) =>
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
        options={{
          minZoom: 10,
          maxZoom: 16,
          restriction: {
            latLngBounds: bounds,
            strictBounds: true,
          },
        }}
      >
        {paaFiltrados.map((paa) => (
          <MarkerF
            key={paa.id}
            position={{ lat: paa.latitude, lng: paa.longitude }}
            icon={{
              url: "PAA-icon.png",
              scaledSize: { width: 50, height: 50 },
              anchor: { x: 25, y: 50 },
            }}
            onClick={() => setSelectedMarker(paa)}
          />
        ))}
        {selectedMarker && renderInfoWindow(selectedMarker)}
      </GoogleMap>
    </div>
  );
};

export default PAAMap;
