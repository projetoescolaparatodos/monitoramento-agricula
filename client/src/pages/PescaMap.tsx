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
        const pescaData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            localidade: data.localidade,
            tipoTanque: data.tipoTanque,
            especiePeixe: data.especiePeixe,
            quantidadeAlevinos: data.quantidadeAlevinos,
            metodoAlimentacao: data.metodoAlimentacao,
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

    const pescaIcon = L.icon({
      iconUrl: "pesca-icon.png", 
      iconSize: [50, 50], 
      iconAnchor: [25, 50], 
      popupAnchor: [0, -50] 
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

      let popupContent = `
        <div class="p-4 max-w-md popup-content" id="popup-${pesca.id}">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-lg">${pesca.localidade}</h3>
            <button class="bg-cyan-500 hover:bg-cyan-700 text-white py-1 px-2 rounded text-xs expand-popup" data-id="${pesca.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-testid="ExpandMoreIcon"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/></svg>
            </button>
          </div>
          <div class="space-y-2">
            <p><strong>Localidade:</strong> ${pesca.localidade}</p>
            <p><strong>Tipo de Tanque:</strong> ${pesca.tipoTanque}</p>
            <p><strong>Espécie de Peixe:</strong> ${pesca.especiePeixe}</p>
            <p><strong>Quantidade de Alevinos:</strong> ${pesca.quantidadeAlevinos} unidades</p>
            <p><strong>Método de Alimentação:</strong> ${pesca.metodoAlimentacao}</p>
            <p><strong>Operador:</strong> ${pesca.operador}</p>
            <p><strong>Técnico Responsável:</strong> ${pesca.tecnicoResponsavel || 'Não informado'}</p>
            <p><strong>Data:</strong> ${new Date(pesca.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${status}</p>
          </div>
      `;

      if (pesca.midias && pesca.midias.length > 0) {
        popupContent += `
          <div class="mt-4 media-container">
            <h4 class="font-semibold mb-2">Fotos/Vídeos:</h4>
            <div class="grid grid-cols-2 gap-2">
              ${pesca.midias.map((url, index) => {
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
          </div>
        `;
      }
      popupContent += `</div>`;


      marker.on('popupopen', function() {
        setTimeout(() => {
          const expandButtons = document.querySelectorAll('.expand-popup');
          expandButtons.forEach(button => {
            button.addEventListener('click', function(e) {
              e.stopPropagation();
              const id = this.getAttribute('data-id');
              const popupContent = document.getElementById(`popup-${id}`);

              if (!popupContent.classList.contains('expanded-popup')) {
                // Expandir popup
                popupContent.classList.add('expanded-popup');
                document.querySelectorAll('.popup-media').forEach(media => {
                  if (media.closest(`#popup-${id}`)) {
                    media.classList.remove('h-24');
                    media.classList.add('h-40');
                  }
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
                document.querySelectorAll('.popup-media').forEach(media => {
                  if (media.closest(`#popup-${id}`)) {
                    media.classList.remove('h-40');
                    media.classList.add('h-24');
                  }
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
      <Card className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] p-4 bg-white/95 shadow-lg">
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