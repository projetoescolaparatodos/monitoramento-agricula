import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, RadioGroup, RadioGroupItem, Label } from "@/components/ui";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// Import the icon image
import tratorImage from "../../public/trator.png";

const Map = () => {
  const [loading, setLoading] = useState(true);
  const [tratores, setTratores] = useState([]);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    const fetchTratores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tratores"));
        const tratoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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

    //Correctly configuring the Leaflet icon.
    const tratorIcon = L.icon({
      iconUrl: tratorImage,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
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
            ${trator.tempoAtividade ? `<p><strong>Tempo de Atividade:</strong> ${trator.tempoAtividade} minutos</p>` : ''}
            ${trator.areaTrabalhada ? `<p><strong>Área Trabalhada:</strong> ${trator.areaTrabalhada}</p>` : ''}
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

    return () => map.remove();
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
      <div id="map" className="h-full w-full" />
    </div>
  );
};

export default Map;