import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
    descricao?: string; // Added based on the new map component
    beneficiario?: string; // Added based on the new map component
    areaMecanizacao?: string; // Added based on the new map component
    dataInicio?: string; // Added based on the new map component

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

  // Example Vitória do Xingu boundary (replace with actual data)
  const municipioBoundary = [
    { lat: -8.6, lng: -51.7 },
    { lat: -8.7, lng: -51.7 },
    { lat: -8.7, lng: -51.6 },
    { lat: -8.6, lng: -51.6 },
    { lat: -8.6, lng: -51.7 },
  ];

  const municipioStyle = {
    options: {
      fillColor: 'rgba(0, 0, 255, 0.3)', // Example blue fill
      fillOpacity: 0.5,
      strokeOpacity: 1,
      strokeWeight: 2,
      strokeColor: 'blue',
    },
  };

  const mapOptions = {
    // Add any other map options here as needed
    styles: [
      {
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [
              {
                  "color": "#ffffff"
              }
          ]
      },
      {
          "featureType": "landscape",
          "elementType": "all",
          "stylers": [
              {
                  "color": "#f2f2f2"
              }
          ]
      },
      {
          "featureType": "poi",
          "elementType": "all",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "road",
          "elementType": "all",
          "stylers": [
              {
                  "saturation": -100
              },
              {
                  "lightness": 45
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "all",
          "stylers": [
              {
                  "visibility": "simplified"
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "elementType": "labels.icon",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "transit",
          "elementType": "all",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "water",
          "elementType": "all",
          "stylers": [
              {
                  "color": "#46bcec"
              },
              {
                  "visibility": "on"
              }
          ]
      }
  ]
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

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredTratores.map((trator) => (
          <Marker
            key={trator.id}
            position={[trator.latitude, trator.longitude]}
            icon={L.icon({
              iconUrl: trator.concluido
                ? '/marker-icon-green.png'
                : '/marker-icon-red.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl: '/marker-shadow.png',
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold mb-2">{trator.nome}</h3>
                <p className="text-sm">{trator.descricao || '-'}</p>
                {trator.beneficiario && (
                  <p className="text-sm mt-2">
                    <strong>Beneficiário:</strong> {trator.beneficiario}
                  </p>
                )}
                {trator.areaMecanizacao && (
                  <p className="text-sm">
                    <strong>Área:</strong> {trator.areaMecanizacao} ha
                  </p>
                )}
                {trator.dataInicio && (
                  <p className="text-sm">
                    <strong>Data Início:</strong>{" "}
                    {new Date(trator.dataInicio).toLocaleDateString()}
                  </p>
                )}
                {trator.concluido && (
                  <p className="text-sm">
                    <strong>Status:</strong> Concluído
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AgriculturaMap;