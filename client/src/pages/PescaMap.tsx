import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const PescaMap = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Pesca | null>(null); // Changed PAA to Pesca
  const [center, setCenter] = useState({ lat: -2.87922, lng: -52.0088 }); // Use original center

  interface Pesca {
    id: string;
    localidade: string;
    tipoTanque: string;
    especiePeixe: string;
    quantidadeAlevinos: number;
    metodoAlimentacao: string;
    operador: string;
    tecnicoResponsavel: string;
    dataCadastro: string;
    concluido: boolean;
    latitude: number;
    longitude: number;
    midias?: string[];
  }

  const [pesqueiros, setPesqueiros] = useState<Pesca[]>([]);
  const [filtro, setFiltro] = useState("todos");

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  const options = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  useEffect(() => {
    const fetchPesqueiros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pesca"));
        const pescaData = querySnapshot.docs.map((doc) => {
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
        setPesqueiros(pescaData);
      } catch (error) {
        console.error("Erro ao buscar dados de pesca:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPesqueiros();
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ''}>
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
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center}
            options={options}
          >
            {pesqueiros.filter((pesca) => {
              if (filtro === "todos") return true;
              if (filtro === "em-servico") return !pesca.concluido;
              if (filtro === "concluidos") return pesca.concluido;
              return true;
            }).map((pesca) => (
              <Marker
                key={pesca.id}
                position={{ lat: pesca.latitude, lng: pesca.longitude }}
                onClick={() => setSelectedMarker(pesca)}
              >
                {selectedMarker?.id === pesca.id && (
                  <InfoWindow
                    position={{ lat: pesca.latitude, lng: pesca.longitude }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-4 max-w-md">
                      <h3 className="font-bold text-lg">{pesca.localidade}</h3>
                      <div className="space-y-2">
                        <p><strong>Tipo de Tanque:</strong> {pesca.tipoTanque}</p>
                        <p><strong>Espécie de Peixe:</strong> {pesca.especiePeixe}</p>
                        <p><strong>Quantidade de Alevinos:</strong> {pesca.quantidadeAlevinos} unidades</p>
                        <p><strong>Método de Alimentação:</strong> {pesca.metodoAlimentacao}</p>
                        <p><strong>Operador:</strong> {pesca.operador}</p>
                        <p><strong>Técnico Responsável:</strong> {pesca.tecnicoResponsavel || 'Não informado'}</p>
                        <p><strong>Data:</strong> {new Date(pesca.dataCadastro).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> {pesca.concluido ? '<span class="text-green-600 font-medium">Concluído</span>' : '<span class="text-blue-600 font-medium">Em Andamento</span>'}</p>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </GoogleMap>
        )}
      </div>
    </LoadScript>
  );
};

export default PescaMap;