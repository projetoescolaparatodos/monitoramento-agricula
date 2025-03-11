import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; //Example Icon - Replace with your preferred library and icon
import ExpandLessIcon from '@mui/icons-material/ExpandLess'; //Example Icon - Replace with your preferred library and icon


const AgriculturaMap = () => {
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
      iconUrl: "trator-icon.png", 
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
        <div class="p-4 max-w-md popup-content" id="popup-${trator.id}">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-lg">${trator.nome}</h3>
            <button class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs expand-popup" data-id="${trator.id}">
              <ExpandMoreIcon/>
            </button>
          </div>
          <div class="space-y-2">
            <p><strong>Localidade:</strong> ${trator.localidade || '-'}</p>
            <p><strong>Nome do Imóvel Rural:</strong> ${trator.fazenda}</p>
            <p><strong>Nome do Proprietário:</strong> ${trator.proprietario || '-'}</p>
            <p><strong>Operação:</strong> ${trator.atividade}</p>
            <p><strong>Hora/máquina:</strong> ${trator.tempoAtividade || '-'}</p>
            <p><strong>Área para mecanização:</strong> ${trator.areaTrabalhada || '-'}</p>
            <p><strong>Operador:</strong> ${trator.piloto}</p>
            <p><strong>Técnico Responsável:</strong> ${trator.tecnicoResponsavel || '-'}</p>
            <p><strong>Data:</strong> ${new Date(trator.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${status}</p>
          </div>
          ${trator.midias && trator.midias.length > 0 ? `
            <div class="mt-4 media-container">
              <h4 class="font-semibold mb-2">Fotos/Vídeos:</h4>
              <div class="grid grid-cols-2 gap-2">
                ${trator.midias.map((url, index) => {
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
            </div>
          ` : ''}
        </div>
      `;

      // Adicionar listener para o botão de expandir após criar o popup
      marker.on('popupopen', function() {
        setTimeout(() => {
          const expandButtons = document.querySelectorAll('.expand-popup');
          expandButtons.forEach(button => {
            button.addEventListener('click', function(e) {
              e.stopPropagation();
              const id = this.getAttribute('data-id');
              const popupContent = document.getElementById(`popup-${id}`);

              if (this.querySelector('svg').getAttribute('data-testid') === 'ExpandMoreIcon'){
                // Expandir popup
                popupContent.classList.add('expanded-popup');
                document.querySelectorAll('.popup-media').forEach(media => {
                  if (media.closest(`#popup-${id}`)) {
                    media.classList.remove('h-24');
                    media.classList.add('h-40');
                  }
                });
                this.querySelector('svg').setAttribute('data-testid', 'ExpandLessIcon');
                this.querySelector('svg').setAttribute('data-testid','ExpandLessIcon')

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
                  .leaflet-popup-content {
                    margin: 0 !important;
                    width: auto !important;
                    min-width: 320px !important;
                  }
                  .leaflet-popup {
                    max-width: 90vw !important;
                  }
                `;
                document.head.appendChild(style);
              } else {
                // Minimizar popup
                popupContent.classList.remove('expanded-popup');
                document.querySelectorAll('.popup-media').forEach(media => {
                  if (media.closest(`#popup-${id}`)) {
                    media.classList.add('h-24');
                    media.classList.remove('h-40');
                  }
                });
                this.querySelector('svg').setAttribute('data-testid', 'ExpandMoreIcon');

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

export default AgriculturaMap;