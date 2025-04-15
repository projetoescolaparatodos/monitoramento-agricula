import "@dotlottie/player-component";

import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  InfoWindow,
} from "@react-google-maps/api";
import { Loader2, X } from "lucide-react"; 
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  areaTrabalhada?: number; // Changed to number for easier calculation
  midias?: string[];
  localidade?: string;
  proprietario?: string;
  tecnicoResponsavel?: string;
}

const AgriculturaMap = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc",
  });

  const [tratores, setTratores] = useState<Trator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Trator | null>(null);
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

  const fetchTratores = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
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
          areaTrabalhada: data.areaTrabalhada ? parseFloat(data.areaTrabalhada) : undefined, //Parse areaTrabalhada to a number
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

  const tratoresFiltrados = useMemo(() => {
    return tratores.filter((trator) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !trator.concluido;
      if (filtro === "concluidos") return trator.concluido;
      return true;
    });
  }, [tratores, filtro]);

  const renderInfoWindow = useCallback(
    (trator: Trator) => {
      const status = trator.concluido ? (
        <span className="text-green-600 font-medium">Concluído</span>
      ) : (
        <span className="text-blue-600 font-medium">Em Serviço</span>
      );

      return (
        <InfoWindow
          position={{ lat: trator.latitude, lng: trator.longitude }}
          onCloseClick={() => {
            setSelectedMarker(null);
            setIsMaximized(false);
          }}
          options={{
            maxWidth: isMaximized ? window.innerWidth * 0.9 : undefined,
          }}
        >
          <div
            className={`p-4 popup-content ${isMaximized ? "maximized" : ""}`}
          >
            <button
              onClick={() => {
                setSelectedMarker(null);
                setIsMaximized(false);
              }}
              className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2 z-10"
            >
              <X className="h-4 w-4" /> 
            </button>

            <div className="text-content">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{trator.nome}</h3>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Localidade:</strong> {trator.localidade || "-"}
                </p>
                <p>
                  <strong>Nome do Imóvel Rural:</strong> {trator.fazenda}
                </p>
                <p>
                  <strong>Nome do Proprietário:</strong>{" "}
                  {trator.proprietario || "-"}
                </p>
                <p>
                  <strong>Operação:</strong> {trator.atividade}
                </p>
                <p>
                  <strong>Hora/máquina:</strong>{" "}
                  {(() => {
                    // Verifica múltiplas possíveis propriedades para o tempo
                    const tempoValue = trator.tempoAtividade || trator.horasMaquina || trator.horas || trator.tempo;
                    const tempo = typeof tempoValue === 'number' 
                      ? tempoValue 
                      : typeof tempoValue === 'string' 
                        ? parseFloat(tempoValue) 
                        : null;

                    if (tempo === null || isNaN(tempo)) return "-";
                    return (tempo > 100 ? (tempo / 60).toFixed(2) : tempo.toFixed(2)) + " horas";
                  })()}
                </p>
                <p>
                  <strong>Área para mecanização:</strong>{" "}
                  {trator.areaTrabalhada ? (trator.areaTrabalhada / 10000).toFixed(2) : "-"} ha
                </p>
                <p>
                  <strong>Operador:</strong> {trator.piloto}
                </p>
                <p>
                  <strong>Técnico Responsável:</strong>{" "}
                  {trator.tecnicoResponsavel || "-"}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(trator.dataCadastro).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong> {status}
                </p>
              </div>
            </div>

            {trator.midias && trator.midias.length > 0 && (
              <div className="media-container">
                <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
                <div className="grid gap-2">
                  {trator.midias.map((url, index) =>
                    url.includes("/video/") ||
                    url.includes("/video/upload/") ? (
                      <div key={index} className="relative">
                        <video
                          src={url}
                          controls
                          className="popup-media w-full h-auto object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <img
                        key={index}
                        src={url}
                        alt="Mídia"
                        className="popup-media"
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
        options={{
          minZoom: 10,
          maxZoom: 16,
          restriction: {
            latLngBounds: bounds,
            strictBounds: true,
          },
        }}
      >
        {tratoresFiltrados.map((trator) => (
          <MarkerF
            key={trator.id}
            position={{ lat: trator.latitude, lng: trator.longitude }}
            onClick={() => setSelectedMarker(trator)}
            icon={{
              url: trator.concluido ? "/trator-icon.png" : "/giftrator.gif",
              scaledSize: new window.google.maps.Size(
                trator.concluido ? 40 : 100,
                trator.concluido ? 40 : 100
              ),
              anchor: new window.google.maps.Point(
                trator.concluido ? 20 : 50,
                trator.concluido ? 20 : 50
              ),
            }}
          />
        ))}
        {selectedMarker && renderInfoWindow(selectedMarker)}
      </GoogleMap>
    </div>
  );
};

export default AgriculturaMap;