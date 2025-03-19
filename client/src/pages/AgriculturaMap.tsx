
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GoogleMap, LoadScript, MarkerF, InfoWindow } from '@react-google-maps/api';
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

const AgriculturaMap = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
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
    areaTrabalhada?: string;
    midias?: string[];
    localidade?: string;
    proprietario?: string;
    tecnicoResponsavel?: string;
  }

  const [tratores, setTratores] = useState<Trator[]>([]);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const fetchTratores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tratores"));
        const tratoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Trator));
        setTratores(tratoresData);
      } catch (error) {
        console.error("Erro ao buscar tratores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTratores();
  }, []);

  const filteredTratores = tratores.filter((trator) => {
    if (filtro === "todos") return true;
    if (filtro === "em-servico") return !trator.concluido;
    if (filtro === "concluidos") return trator.concluido;
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
          {filteredTratores.map((trator) => (
            <MarkerF
              key={trator.id}
              position={{ lat: trator.latitude, lng: trator.longitude }}
              onClick={() => setSelectedMarker(trator.id)}
              icon={{
                url: trator.concluido 
                  ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
              }}
            >
              {selectedMarker === trator.id && (
                <InfoWindow
                  position={{ lat: trator.latitude, lng: trator.longitude }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2">
                    <h3 className="font-bold text-lg">{trator.nome}</h3>
                    <p><strong>Fazenda:</strong> {trator.fazenda}</p>
                    <p><strong>Atividade:</strong> {trator.atividade}</p>
                    <p><strong>Piloto:</strong> {trator.piloto}</p>
                    <p><strong>Status:</strong> {trator.concluido ? 'Concluído' : 'Em serviço'}</p>
                    {trator.tempoAtividade && <p><strong>Tempo de Atividade:</strong> {trator.tempoAtividade}h</p>}
                    {trator.areaTrabalhada && <p><strong>Área Trabalhada:</strong> {trator.areaTrabalhada}</p>}
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

export default AgriculturaMap;
