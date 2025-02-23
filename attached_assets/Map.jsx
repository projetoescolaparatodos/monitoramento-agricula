import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import tratorIcon from "../assets/trator.png"; // Importe o ícone do trator

const Map = () => {
  const [tratores, setTratores] = useState([]); // Estado para armazenar os tratores
  const [filtro, setFiltro] = useState("todos"); // Estado para o filtro: "todos", "em-servico", "concluidos"

  // Busca os tratores no Firestore
  useEffect(() => {
    const fetchTratores = async () => {
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTratores(tratoresData);
    };

    fetchTratores();
  }, []);

  // Filtra os tratores com base no estado "filtro"
  const tratoresFiltrados = tratores.filter((trator) => {
    if (filtro === "todos") return true; // Mostra todos os tratores
    if (filtro === "em-servico") return !trator.concluido; // Mostra tratores em serviço
    if (filtro === "concluidos") return trator.concluido; // Mostra tratores concluídos
    return true;
  });

  // Inicializa o mapa e adiciona marcadores
  useEffect(() => {
    const map = L.map("map").setView([-2.87922, -52.0088], 12); // Coordenadas iniciais e nível de zoom

    // Adiciona o tile layer do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Configura o ícone personalizado
    const tratorMarker = L.icon({
      iconUrl: tratorIcon, // Caminho para o ícone do trator
      iconSize: [40, 40], // Tamanho do ícone
      iconAnchor: [20, 40], // Ponto de ancoragem do ícone
      popupAnchor: [0, -40], // Posição do popup em relação ao ícone
    });

    // Adiciona marcadores para cada trator filtrado
    tratoresFiltrados.forEach((trator) => {
      const marker = L.marker([trator.latitude, trator.longitude], { icon: tratorMarker }).addTo(map);

      // Cria um popup com as informações básicas do trator
      const popupContent = `
        <div style="max-width: 600px;">
          <h3 style="margin: 0; font-size: 18px;">${trator.nome}</h3>
          <p style="margin: 5px 0;"><strong>Fazenda:</strong> ${trator.fazenda}</p>
          <p style="margin: 5px 0;"><strong>Atividade:</strong> ${trator.atividade}</p>
          <p style="margin: 5px 0;"><strong>Operador:</strong> ${trator.piloto}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date(trator.dataCadastro).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${trator.concluido ? "Concluído" : "Em Serviço"}</p>
          <div>
            <h4 style="margin: 0 0 5px; font-size: 16px;">Fotos/Vídeos:</h4>
            ${
              trator.midias && trator.midias.length > 0
                ? trator.midias
                    .map(
                      (url) => `
                    <img src="${url}" alt="Mídia" style="max-width: 100%; margin: 5px 0; border-radius: 5px;" />
                  `
                    )
                    .join("")
                : "<p>Nenhuma mídia disponível.</p>"
            }
          </div>
        </div>
      `;

      // Adiciona o popup ao marcador
      const popup = L.popup({ maxWidth: 600 }).setContent(popupContent); // Popup maior
      marker.bindPopup(popup).openPopup();
    });

    // Limpa o mapa ao desmontar o componente
    return () => map.remove();
  }, [tratoresFiltrados]); // Re-renderiza o mapa quando os tratores filtrados mudam

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Filtro de pesquisa */}
      <div style={{ 
        position: "absolute", 
        top: "50%", // Posiciona na metade da tela
        left: "10px", // Mantém no lado esquerdo
        transform: "translateY(-50%)", // Centraliza verticalmente
        zIndex: 1000, 
        backgroundColor: "white", 
        padding: "10px", 
        borderRadius: "5px", 
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" 
      }}>
        <label style={{ marginRight: "10px", display: "flex", alignItems: "center" }}>
          <input
            type="radio"
            name="filtro"
            value="todos"
            checked={filtro === "todos"}
            onChange={() => setFiltro("todos")}
            style={{ marginRight: "5px" }}
          />
          <span style={{ color: "black", fontWeight: "bold" }}>Todos</span>
        </label>
        <label style={{ marginRight: "10px", display: "flex", alignItems: "center" }}>
          <input
            type="radio"
            name="filtro"
            value="em-servico"
            checked={filtro === "em-servico"}
            onChange={() => setFiltro("em-servico")}
            style={{ marginRight: "5px" }}
          />
          <span style={{ color: "black", fontWeight: "bold" }}>Em Serviço</span>
        </label>
        <label style={{ display: "flex", alignItems: "center" }}>
          <input
            type="radio"
            name="filtro"
            value="concluidos"
            checked={filtro === "concluidos"}
            onChange={() => setFiltro("concluidos")}
            style={{ marginRight: "5px" }}
          />
          <span style={{ color: "black", fontWeight: "bold" }}>Concluído</span>
        </label>
      </div>

      {/* Mapa */}
      <div id="map" style={{ width: "100%", height: "100%" }}></div>
    </div>
  );
};

export default Map;