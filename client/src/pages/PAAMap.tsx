import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { GoogleMap, LoadScript, MarkerF, InfoWindow } from '@react-google-maps/api';

const PAAMap = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  interface PAA {
    id: string;
    localidade: string;
    tipoAlimento: string;
    quantidadeProduzida: number;
    metodoColheita: string;
    operador: string;
    tecnicoResponsavel: string;
    dataCadastro: string;
    concluido: boolean;
    latitude: number;
    longitude: number;
    midias?: string[];
    proprietario?: string;
    areaMecanizacao?: number;
  }

  const [paaLocais, setPaaLocais] = useState<PAA[]>([]);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const fetchPAA = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paa"));
        const paaData = querySnapshot.docs.map((doc) => {
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
        setPaaLocais(paaData);
      } catch (error) {
        console.error("Erro ao buscar dados do PAA:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPAA();
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const center = {
    lat: -2.87922,
    lng: -52.0088
  };

  const renderInfoWindow = (paa: PAA) => {
    const status = paa.concluido
      ? '<span class="text-green-600 font-medium">Concluído</span>'
      : '<span class="text-blue-600 font-medium">Em Andamento</span>';

    return (
      <InfoWindow
        position={{ lat: paa.latitude, lng: paa.longitude }}
        onCloseClick={() => setSelectedMarker(null)}
      >
        <div className="p-4 max-w-md popup-content" id={`popup-${paa.id}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{paa.localidade}</h3>
          </div>
          <div className="space-y-2">
            <p><strong>Localidade:</strong> {paa.localidade}</p>
            <p><strong>Nome do Proprietário:</strong> {paa.proprietario || "-"}</p>
            <p><strong>Tipo de Alimento:</strong> {paa.tipoAlimento}</p>
            <p><strong>Quantidade Produzida:</strong> {paa.quantidadeProduzida}</p>
            <p><strong>Método de Colheita:</strong> {paa.metodoColheita}</p>
            <p><strong>Área de Mecanização:</strong> {paa.areaMecanizacao ? (paa.areaMecanizacao / 10000).toFixed(2) : "0.00"} ha</p>
            <p><strong>Operador:</strong> {paa.operador}</p>
            <p><strong>Técnico Responsável:</strong> {paa.tecnicoResponsavel || "-"}</p>
            <p><strong>Data:</strong> {new Date(paa.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span dangerouslySetInnerHTML={{ __html: status }} /></p>
          </div>
          {paa.midias && paa.midias.length > 0 && (
            <div className="mt-4 media-container">
              <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div className="grid grid-cols-2 gap-2">
                {paa.midias.map((url, index) => (
                  url.includes("/video/") || url.includes("/video/upload/") ? (
                    <div key={index} className="relative">
                      <video
                        src={url}
                        controls
                        className="w-full h-24 object-cover rounded-lg popup-media"
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
                      className="w-full h-24 object-cover rounded-lg popup-media"
                      data-src={url}
                      data-index={index}
                      data-type="image"
                    />
                  )
                ))}
              </div>
            </div>
          )}
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
            styles: [
              {
                featureType: "all",
                elementType: "all",
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
                url: "PAA-icon.png",
                scaledSize: {
                  width: 50,
                  height: 50
                },
                anchor: {
                  x: 30,
                  y: 60
                }
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