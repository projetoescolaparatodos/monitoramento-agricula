import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PAAMap = () => {
  const [loading, setLoading] = useState(true);
  interface PAA {
    id: string;
    localidade: string;
    nomeImovel: string;
    proprietario: string;
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
            nomeImovel: data.nomeImovel,
            proprietario: data.proprietario,
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

  useEffect(() => {
    if (loading) return;

    const map = L.map("paa-map").setView([-2.87922, -52.0088], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Criar ícone personalizado para PAA
    const paaIcon = L.icon({
      iconUrl: "paa-icon.png", 
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const paaFiltrados = paaLocais.filter((paa) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !paa.concluido;
      if (filtro === "concluidos") return paa.concluido;
      return true;
    });

    paaFiltrados.forEach((paa) => {
      const marker = L.marker([paa.latitude, paa.longitude], {
        icon: paaIcon
      }).addTo(map);

      const status = paa.concluido ? 
        '<span class="text-green-600 font-medium">Concluído</span>' : 
        '<span class="text-blue-600 font-medium">Em Andamento</span>';

      const popupContent = `
        <div class="popup-content">
          <h3 class="text-lg font-bold">${paa.localidade}</h3>
          <p><strong>Imóvel Rural:</strong> ${paa.nomeImovel}</p>
          <p><strong>Proprietário:</strong> ${paa.proprietario}</p>
          <p><strong>Tipo de Alimento:</strong> ${paa.tipoAlimento || 'Não informado'}</p>
          <p><strong>Quantidade Produzida:</strong> ${paa.quantidadeProduzida || '0'} kg</p>
          <p><strong>Método de Colheita:</strong> ${paa.metodoColheita || 'Não informado'}</p>
          <p><strong>Operador:</strong> ${paa.operador}</p>
          <p><strong>Técnico Responsável:</strong> ${paa.tecnicoResponsavel}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Data:</strong> ${new Date(paa.dataCadastro).toLocaleDateString()}</p>
        </div>
      `;

      const fullPopupContent = `
        <div class="p-4 max-w-md">
          <h3 class="font-bold text-lg mb-2">${paa.localidade}</h3>
          <div class="space-y-2">
            <p><strong>Localidade:</strong> ${paa.localidade}</p>
            <p><strong>Nome do Imóvel Rural:</strong> ${paa.nomeImovel}</p>
            <p><strong>Nome do Proprietário:</strong> ${paa.proprietario}</p>
            <p><strong>Operação:</strong> ${paa.operacao || 'Não informado'}</p>
            <p><strong>Operador:</strong> ${paa.operador}</p>
            <p><strong>Técnico Responsável:</strong> ${paa.tecnicoResponsavel || 'Não informado'}</p>
            <p><strong>Data:</strong> ${new Date(paa.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${paa.concluido ? "Concluído" : "Em Andamento"}</p>
            ${paa.horaMaquina ? `<p><strong>Hora/máquina:</strong> ${paa.horaMaquina} horas</p>` : ''}
            ${paa.areaMecanizacao ? `<p><strong>Área para mecanização:</strong> ${paa.areaMecanizacao} hectares</p>` : ''}
          </div>
          ${paa.midias && paa.midias.length > 0 ? `
            <div class="mt-4">
              <h4 class="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div class="grid grid-cols-2 gap-2">
                ${paa.midias.map(url => `
                  <img src="${url}" alt="Mídia" class="w-full h-24 object-cover rounded-lg" />
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(fullPopupContent, {
        maxWidth: 400,
        className: 'rounded-lg shadow-lg'
      });
    });

    return () => {
      map.remove();
    };
  }, [paaLocais, filtro, loading]);

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

      <div id="paa-map" className="h-full w-full" />
    </div>
  );
};

export default PAAMap;