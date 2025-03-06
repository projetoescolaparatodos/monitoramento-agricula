import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Corrigir o problema do ícone do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Tipos de mapa e seus títulos
const tiposTitulos = {
  agricultura: "Mapa de Maquinário Agrícola",
  pesca: "Mapa de Equipamentos de Pesca",
  paa: "Mapa de Distribuição PAA"
};

const Map = ({ tipo = "agricultura" }) => {
  const [position, setPosition] = useState<[number, number]>([-3.10719, -60.0261]);
  const [zoom, setZoom] = useState(12);

  // Buscar dados baseados no tipo de mapa
  const { data: pontos, isLoading } = useQuery({
    queryKey: ["pontos", tipo],
    queryFn: async () => {
      const q = query(collection(db, "tratores"), where("tipo", "==", tipo));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
  });

  // Centralizar o mapa se houver pontos
  useEffect(() => {
    if (pontos && pontos.length > 0 && pontos[0].latitude && pontos[0].longitude) {
      setPosition([pontos[0].latitude, pontos[0].longitude]);
    }
  }, [pontos]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-96">
              <p>Carregando mapa...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">{tiposTitulos[tipo] || "Mapa"}</h1>
      <Card>
        <CardContent className="p-6">
          <div className="h-[600px] w-full">
            <MapContainer
              center={position}
              zoom={zoom}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {pontos && pontos.map((ponto) => (
                ponto.latitude && ponto.longitude ? (
                  <Marker 
                    key={ponto.id} 
                    position={[ponto.latitude, ponto.longitude]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-lg">{ponto.nome || "Sem nome"}</h3>
                        <p><strong>Local:</strong> {ponto.fazenda || "Sem localização"}</p>
                        {ponto.dataCadastro && (
                          <p>
                            <strong>Data de cadastro:</strong>{" "}
                            {format(new Date(ponto.dataCadastro), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        )}
                        {ponto.areaTrabalhada && (
                          <p><strong>Área trabalhada:</strong> {ponto.areaTrabalhada.toLocaleString('pt-BR')} m²</p>
                        )}
                        {ponto.observacoes && (
                          <p><strong>Observações:</strong> {ponto.observacoes}</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Map;