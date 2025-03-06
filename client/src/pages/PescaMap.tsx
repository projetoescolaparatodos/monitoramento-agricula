import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PescaMap = () => {
  const [loading, setLoading] = useState(true);
  interface Pesca {
    id: string;
    localidade: string;
    nomeImovel: string;
    proprietario: string;
    operacao: string;
    horaMaquina: number;
    areaMecanizacao: number;
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
        const pescaData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            localidade: data.localidade,
            nomeImovel: data.nomeImovel,
            proprietario: data.proprietario,
            operacao: data.operacao,
            horaMaquina: data.horaMaquina,
            areaMecanizacao: data.areaMecanizacao,
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

  useEffect(() => {
    if (loading) return;

    const map = L.map("pesca-map").setView([-2.87922, -52.0088], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Criar ícone personalizado para pesca
    const pescaIcon = L.icon({
      iconUrl: "pesca-icon.png", 
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const pesqueirosFiltrados = pesqueiros.filter((pesca) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !pesca.concluido;
      if (filtro === "concluidos") return pesca.concluido;
      return true;
    });

    pesqueirosFiltrados.forEach((pesca) => {
      const marker = L.marker([pesca.latitude, pesca.longitude], {
        icon: pescaIcon
      }).addTo(map);

      const status = pesca.concluido ? 
        '<span class="text-green-600 font-medium">Concluído</span>' : 
        '<span class="text-blue-600 font-medium">Em Andamento</span>';

      const popupContent = `
        <div class="p-4 max-w-md">
          <h3 class="font-bold text-lg mb-2">${pesca.localidade}</h3>
          <div class="space-y-2">
            <p><strong>Localidade:</strong> ${pesca.localidade}</p>
            <p><strong>Nome do Imóvel Rural:</strong> ${pesca.nomeImovel}</p>
            <p><strong>Nome do Proprietário:</strong> ${pesca.proprietario}</p>
            <p><strong>Operação:</strong> ${pesca.operacao}</p>
            <p><strong>Operador:</strong> ${pesca.operador}</p>
            <p><strong>Técnico Responsável:</strong> ${pesca.tecnicoResponsavel || 'Não informado'}</p>
            <p><strong>Data:</strong> ${new Date(pesca.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${status}</p>
            ${pesca.horaMaquina ? `<p><strong>Hora/máquina:</strong> ${pesca.horaMaquina} horas</p>` : ''}
            ${pesca.areaMecanizacao ? `<p><strong>Área para mecanização:</strong> ${pesca.areaMecanizacao} hectares</p>` : ''}
          </div>
          ${pesca.midias && pesca.midias.length > 0 ? `
            <div class="mt-4">
              <h4 class="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div class="grid grid-cols-2 gap-2">
                ${pesca.midias.map(url => `
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
  }, [pesqueiros, filtro, loading]);

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

      <div id="pesca-map" className="h-full w-full" />
    </div>
  );
};

export default PescaMap;