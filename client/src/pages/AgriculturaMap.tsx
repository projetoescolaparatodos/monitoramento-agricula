import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { GoogleMap, LoadScript, MarkerF, InfoWindow } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const AgriculturaMap = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

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
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar tratores:", error);
        setLoading(false);
      }
    };

    fetchTratores();
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const center = {
    lat: -2.87922,
    lng: -52.0088
  };

  const [isMaximized, setIsMaximized] = useState(false);

  const renderInfoWindow = (trator: Trator) => {
    const status = trator.concluido
      ? '<span class="text-green-600 font-medium">Concluído</span>'
      : '<span class="text-blue-600 font-medium">Em Serviço</span>';

    return (
      <InfoWindow
        position={{ lat: trator.latitude, lng: trator.longitude }}
        onCloseClick={() => {
          setSelectedMarker(null);
          setIsMaximized(false);
        }}
        options={{
          maxWidth: isMaximized ? window.innerWidth * 0.9 : undefined
        }}
      >
        <div className={`p-4 ${isMaximized ? 'w-[90vw] flex' : 'max-w-md'} popup-content`} id={`popup-${trator.id}`}>
          <div className={`${isMaximized ? 'w-1/2 pr-4' : 'w-full'}`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{trator.nome}</h3>
          </div>
          <div className="space-y-2">
            <p><strong>Localidade:</strong> {trator.localidade || "-"}</p>
            <p><strong>Nome do Imóvel Rural:</strong> {trator.fazenda}</p>
            <p><strong>Nome do Proprietário:</strong> {trator.proprietario || "-"}</p>
            <p><strong>Operação:</strong> {trator.atividade}</p>
            <p><strong>Hora/máquina:</strong> {trator.tempoAtividade || "-"}</p>
            <p><strong>Área para mecanização:</strong> {trator.areaTrabalhada || "-"}</p>
            <p><strong>Operador:</strong> {trator.piloto}</p>
            <p><strong>Técnico Responsável:</strong> {trator.tecnicoResponsavel || "-"}</p>
            <p><strong>Data:</strong> {new Date(trator.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span dangerouslySetInnerHTML={{ __html: status }} /></p>
          </div>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="absolute top-2 right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
          >
            {isMaximized ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"></path>
                <path d="M9 21H3v-6"></path>
                <path d="M21 3l-7 7"></path>
                <path d="M3 21l7-7"></path>
              </svg>
            )}
          </button>
          {trator.midias && trator.midias.length > 0 && (
            <div className={`${isMaximized ? 'w-1/2' : 'mt-4'} media-container`}>
              <h4 className="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div className={`grid ${isMaximized ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                {trator.midias.map((url, index) => (
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

  const tratoresFiltrados = tratores.filter((trator) => {
    if (filtro === "todos") return true;
    if (filtro === "em-servico") return !trator.concluido;
    if (filtro === "concluidos") return trator.concluido;
    return true;
  });

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
          {tratoresFiltrados.map((trator) => (
            <MarkerF
              key={trator.id}
              position={{ lat: trator.latitude, lng: trator.longitude }}
              icon={{
                url: "trator-icon.png",
                scaledSize: {
                  width: 32,
                  height: 32
                },
                anchor: {
                  x: 16,
                  y: 32
                }
              }}
              onClick={() => setSelectedMarker(trator)}
            />
          ))}
          {selectedMarker && renderInfoWindow(selectedMarker)}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default AgriculturaMap;