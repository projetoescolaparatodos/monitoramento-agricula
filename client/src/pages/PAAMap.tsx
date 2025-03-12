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
    proprietario?: string; // Added for consistency
    areaMecanizacao?: number; // Added for consistency
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
            proprietario: data.proprietario, // Added for consistency
            areaMecanizacao: data.areaMecanizacao, // Added for consistency
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
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Criar ícone personalizado para PAA
    const paaIcon = L.icon({
      iconUrl: "PAA-icon.png", // Substitua pelo caminho correto do ícone
      iconSize: [50, 50],
      iconAnchor: [30, 60],
      popupAnchor: [0, -32],
    });

    const paaFiltrados = paaLocais.filter((paa) => {
      if (filtro === "todos") return true;
      if (filtro === "em-servico") return !paa.concluido;
      if (filtro === "concluidos") return paa.concluido;
      return true;
    });

    paaFiltrados.forEach((paa) => {
      const marker = L.marker([paa.latitude, paa.longitude], {
        icon: paaIcon,
      }).addTo(map);

      const status = paa.concluido
        ? '<span class="text-green-600 font-medium">Concluído</span>'
        : '<span class="text-blue-600 font-medium">Em Andamento</span>';

      const popupContent = document.createElement('div');
      popupContent.className = 'popup-content';
      popupContent.innerHTML = `
        <div class="p-4 max-w-md" id="popup-${paa.id}">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-lg">${paa.localidade}</h3>
            <button class="expand-popup bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs" data-id="${paa.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-testid="ExpandMoreIcon"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/></svg>
            </button>
          </div>
          <div class="space-y-2">
            <p><strong>Produtor:</strong> ${paa.proprietario || "Não informado"}</p>
            <p><strong>Tipo de Alimento:</strong> ${paa.tipoAlimento || "Não informado"}</p>
            <p><strong>Quantidade Produzida:</strong> ${paa.quantidadeProduzida || 0} kg</p>
            <p><strong>Método de Colheita:</strong> ${paa.metodoColheita || "Não informado"}</p>
            <p><strong>Técnico Responsável:</strong> ${paa.tecnicoResponsavel || "Não informado"}</p>
            <p><strong>Data:</strong> ${new Date(paa.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Área Cultivada:</strong> ${paa.areaMecanizacao || 0} ha</p>
          </div>
          <div class="media-container">${paa.midias && paa.midias.length > 0 ?
            `<div class="mt-4">
              <h4 class="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div class="grid grid-cols-2 gap-2">
                ${paa.midias.map((url, index) => {
                  // Verificar se é um vídeo (URLs do Cloudinary com /video/)
                  if (url.includes('/video/') || url.includes('/video/upload/')) {
                    return `
                      <div class="relative">
                        <video src="${url}" controls class="w-full h-24 object-cover rounded-lg popup-media" data-src="${url}" data-index="${index}" data-type="video"></video>
                      </div>
                    `;
                  } else {
                    return `
                      <img src="${url}" alt="Mídia" class="w-full h-24 object-cover rounded-lg popup-media" data-src="${url}" data-index="${index}" data-type="image" />
                    `;
                  }
                }).join('')}
              </div>
            </div>` : ""
          }</div>
        </div>
      `;

      const popup = L.popup({
        maxWidth: 400,
        className: "rounded-lg shadow-lg",
      }).setContent(popupContent);
      marker.bindPopup(popup);

      marker.on('popupopen', function() {
        setTimeout(() => {
          const expandButtons = document.querySelectorAll('.expand-popup');
          expandButtons.forEach(button => {
            button.addEventListener('click', function(e) {
              e.stopPropagation();
              const id = this.getAttribute('data-id');
              const popupContent = document.getElementById(`popup-${id}`);
              const mediaElements = document.querySelectorAll(`#popup-${id} .popup-media`);
              const expandText = this.querySelector('span');
              const expandIcon = this.querySelector('svg');

              if (!popupContent.classList.contains('expanded-popup')) {
                // Expandir popup
                popupContent.classList.add('expanded-popup');
                mediaElements.forEach(media => {
                  media.classList.remove('h-24');
                  media.classList.add('h-40');
                });
                this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-testid="ExpandLessIcon"><path d="M8 3v4h13"/><path d="M3 21h13v-4"/><path d="m21 7-5-5-5 5"/><path d="m3 17 5 5 5-5"/></svg>`;

                // Adicionar estilo para expandir
                const style = document.createElement('style');
                style.id = 'expanded-popup-style';
                style.textContent = `
                  .expanded-popup {
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    width: 90vw !important;
                    max-width: 800px !important;
                    max-height: 90vh !important;
                    overflow-y: auto !important;
                    z-index: 10000 !important;
                    background: white !important;
                    border-radius: 8px !important;
                    box-shadow: 0 0 20px rgba(0,0,0,0.3) !important;
                  }
                  .expanded-popup .media-container {
                    margin-top: 20px !important;
                  }
                  .expanded-popup .media-container .grid {
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 12px !important;
                  }
                  .expanded-popup .popup-media {
                    height: 160px !important;
                    width: 100% !important;
                    object-fit: cover !important;
                    border-radius: 8px !important;
                    transition: all 0.3s ease !important;
                  }
                `;
                document.head.appendChild(style);
              } else {
                // Recolher popup
                popupContent.classList.remove('expanded-popup');
                mediaElements.forEach(media => {
                  media.classList.add('h-24');
                  media.classList.remove('h-40');
                });
                this.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-testid="ExpandMoreIcon"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/></svg>`;

                // Remover o estilo
                const expandedStyle = document.getElementById('expanded-popup-style');
                if (expandedStyle) expandedStyle.remove();
              }
            });
          });
        }, 100);
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
      <Card className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] p-4 bg-white/95 shadow-lg">
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