
import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import paaIcon from "../assets/paa-icon.png";

const PAAMap: React.FC = () => {
  const [paaLocais, setPaaLocais] = useState<any[]>([]);

  useEffect(() => {
    const fetchPaaLocais = async () => {
      const querySnapshot = await getDocs(collection(db, "paa"));
      const paaData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPaaLocais(paaData);
    };
    fetchPaaLocais();
  }, []);

  useEffect(() => {
    const map = L.map("paa-map").setView([-2.87922, -52.0088], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Criar um ícone personalizado
    const customIcon = L.icon({
      iconUrl: paaIcon,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Adicionar marcadores para cada ponto PAA
    paaLocais.forEach((paa) => {
      if (paa.latitude && paa.longitude) {
        const status = paa.concluido ? "Concluído" : "Em Andamento";
        const statusClass = paa.concluido ? "text-green-600 font-bold" : "text-blue-600 font-bold";

        const popupContent = `
        <div class="p-4 max-w-md">
          <h3 class="font-bold text-lg mb-2">${paa.localidade || 'Localidade não informada'}</h3>
          <div class="space-y-2">
        </div>
      `;

      const fullPopupContent = `
        <div class="p-4 max-w-md">
          <h3 class="font-bold text-lg mb-2">${paa.localidade || 'Localidade não informada'}</h3>
          <div class="space-y-2">
            <p><strong>Localidade:</strong> ${paa.localidade || 'Não informado'}</p>
            <p><strong>Nome do Imóvel Rural:</strong> ${paa.nomeImovel || 'Não informado'}</p>
            <p><strong>Nome do Proprietário:</strong> ${paa.proprietario || 'Não informado'}</p>
            <p><strong>Operação:</strong> ${paa.operacao || 'Não informado'}</p>
            <p><strong>Operador:</strong> ${paa.operador || 'Não informado'}</p>
            <p><strong>Técnico Responsável:</strong> ${paa.tecnicoResponsavel || 'Não informado'}</p>
            <p><strong>Data:</strong> ${new Date(paa.dataCadastro).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="${statusClass}">${status}</span></p>
            ${paa.horaMaquina ? `<p><strong>Hora/máquina:</strong> ${paa.horaMaquina} horas</p>` : ''}
            ${paa.areaMecanizacao ? `<p><strong>Área para mecanização:</strong> ${paa.areaMecanizacao} hectares</p>` : ''}
          </div>
        </div>
      `;

        const marker = L.marker([paa.latitude, paa.longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(fullPopupContent, {
          maxWidth: 400,
          className: 'rounded-lg shadow-lg'
        });
      }
    });

    return () => {
      map.remove();
    };
  }, [paaLocais]);

  return <div id="paa-map" className="w-full h-[80vh] rounded-lg overflow-hidden" />;
};

export default PAAMap;
