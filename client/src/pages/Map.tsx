import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Map = () => {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (loading) return;

    const map = L.map("map").setView([-2.87922, -52.0088], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Criar ícone personalizado do trator
    const tratorIcon = L.icon({
      iconUrl: "trator-icon.png", // Assuming this is the correct path
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const tratoresFiltrados = tratores.filter((trator) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !trator.concluido;
      if (filtro === "concluidos") return trator.concluido;
      return true;
    });

    tratoresFiltrados.forEach((trator) => {
      const marker = L.marker([trator.latitude, trator.longitude], {
        icon: tratorIcon
      }).addTo(map);

      const status = trator.concluido ? 
        '<span class="text-green-600 font-medium">Concluído</span>' : 
        '<span class="text-blue-600 font-medium">Em Serviço</span>';

      const popupContent = `
        <div class="p-4 max-w-md">
          <h3 class="font-bold text-lg mb-2">${trator.nome}</h3>
          <div class="space-y-2">
            <p><strong>Fazenda:</strong> ${trator.fazenda}</p>
            <p><strong>Atividade:</strong> ${trator.atividade}</p>
            <p><strong>Operador:</strong> ${trator.piloto}</p>
            <p><strong>Data:</strong> ${new Date(trator.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${(() => {
              const tempoValue = trator.tempoAtividade || trator.horasMaquina || trator.horas || trator.tempo;
              if (!tempoValue) return '';
              const tempo = typeof tempoValue === 'number' ? tempoValue : parseFloat(tempoValue);
              if (isNaN(tempo)) return '';
              const displayTempo = tempo > 100 ? (tempo / 60).toFixed(2) + ' horas' : tempo.toFixed(2) + ' horas';
              return `<p><strong>Tempo de Atividade:</strong> ${displayTempo}</p>`;
            })()}
            ${(() => {
              const areaValue = trator.areaTrabalhada || trator.areaMecanizacao || trator.areaMecanization || trator.area;
              if (!areaValue) return '';
              const area = typeof areaValue === 'number' ? areaValue : parseFloat(areaValue);
              if (isNaN(area)) return '';
              return `<p><strong>Área Trabalhada:</strong> ${(area / 10000).toFixed(2)} ha</p>`;
            })()}
          </div>
          ${trator.midias && trator.midias.length > 0 ? `
            <div class="mt-4">
              <h4 class="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div class="grid grid-cols-2 gap-2">
                ${trator.midias.map(url => `
                  <img src="${url}" alt="Mídia" class="w-full h-24 object-cover rounded-lg" />
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 400,
        className: 'rounded-lg shadow-lg'
      });
    });

    return () => {
      map.remove();
    };
  }, [tratores, filtro, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-16 relative h-screen">
      <Card 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] p-4 bg-white/95 shadow-lg"
      >
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

      <div id="map" className="h-full w-full" />
    </div>
  );
};

export default Map;