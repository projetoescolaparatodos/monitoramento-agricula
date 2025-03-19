import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const AgriculturaMap = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<Trator | null>(null);
  const [center, setCenter] = useState({ lat: -3.7436, lng: -38.5229 }); // Fortaleza como exemplo

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

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  const options = {
    disableDefaultUI: true,
    zoomControl: true,
  };

  useEffect(() => {
    const fetchTratores = async () => {
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
            areaTrabalhada: data.areaTrabalhada,
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
    };

    fetchTratores();
  }, []);


  return (
    <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY || ''}>
      <div className="p-4">
        <Card className="mb-4 p-4">
          <RadioGroup
            value={filtro}
            onValueChange={setFiltro}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="todos" id="todos" />
              <Label htmlFor="todos">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="concluidos" id="concluidos" />
              <Label htmlFor="concluidos">Concluídos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pendentes" id="pendentes" />
              <Label htmlFor="pendentes">Pendentes</Label>
            </div>
          </RadioGroup>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center}
            options={options}
          >
            {tratores.filter((trator) => {
              if (filtro === "todos") return true;
              if (filtro === "pendentes") return !trator.concluido;
              if (filtro === "concluidos") return trator.concluido;
              return true;
            }).map((trator) => (
              <Marker
                key={trator.id}
                position={{ lat: trator.latitude, lng: trator.longitude }}
                onClick={() => setSelectedMarker(trator)}
              />
            ))}

            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <h3 className="font-bold">{selectedMarker.nome}</h3>
                  <p>Fazenda: {selectedMarker.fazenda}</p>
                  <p>Atividade: {selectedMarker.atividade}</p>
                  <p>Piloto: {selectedMarker.piloto}</p>
                  <p>Status: {selectedMarker.concluido ? 'Concluído' : 'Pendente'}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
    </LoadScript>
  );
};

export default AgriculturaMap;