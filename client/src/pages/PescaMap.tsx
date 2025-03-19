
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GoogleMap, LoadScript, MarkerF, InfoWindow } from '@react-google-maps/api';
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PescaMap = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchPesqueiros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pesca"));
        const pesqueirosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Pesca));
        setPesqueiros(pesqueirosData);
      } catch (error) {
        console.error("Erro ao buscar pesqueiros:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPesqueiros();
  }, []);

  const filteredPesqueiros = pesqueiros.filter((pesca) => {
    if (filtro === "todos") return true;
    if (filtro === "em-servico") return !pesca.concluido;
    if (filtro === "concluidos") return pesca.concluido;
    return true;
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const center = {
    lat: -2.87922,
    lng: -52.0088
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

      <LoadScript googleMapsApiKey="AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
        >
          {filteredPesqueiros.map((pesca) => (
            <MarkerF
              key={pesca.id}
              position={{ lat: pesca.latitude, lng: pesca.longitude }}
              onClick={() => setSelectedMarker(pesca.id)}
              icon={{
                url: pesca.concluido 
                  ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
              }}
            >
              {selectedMarker === pesca.id && (
                <InfoWindow
                  position={{ lat: pesca.latitude, lng: pesca.longitude }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <h3 className="font-bold text-lg">{pesca.localidade}</h3>
                    <p><strong>Tipo de Tanque:</strong> {pesca.tipoTanque}</p>
                    <p><strong>Espécie:</strong> {pesca.especiePeixe}</p>
                    <p><strong>Quantidade de Alevinos:</strong> {pesca.quantidadeAlevinos}</p>
                    <p><strong>Método de Alimentação:</strong> {pesca.metodoAlimentacao}</p>
                    <p><strong>Operador:</strong> {pesca.operador}</p>
                    <p><strong>Técnico Responsável:</strong> {pesca.tecnicoResponsavel}</p>
                    <p><strong>Status:</strong> {pesca.concluido ? 'Concluído' : 'Em andamento'}</p>
                  </div>
                </InfoWindow>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default PescaMap;
