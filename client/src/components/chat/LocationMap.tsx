import React, { useEffect, useState, useRef } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LocationMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  initialLocation?: { latitude: number; longitude: number };
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  onLocationSelect,
  initialLocation 
}) => {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation || null
  );

  useEffect(() => {
    // Carregar o script do Leaflet apenas se ele ainda não estiver carregado
    if (!window.L) {
      const linkCSS = document.createElement('link');
      linkCSS.rel = 'stylesheet';
      linkCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkCSS);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  // Inicializar o mapa quando o script estiver carregado
  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    // Coordenadas padrão para o centro do Brasil
    const defaultLat = -10.0;
    const defaultLng = -55.0;

    const initialLat = location?.latitude || defaultLat;
    const initialLng = location?.longitude || defaultLng;

    const mapInstance = window.L.map(mapRef.current).setView([initialLat, initialLng], 5);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    // Adicionar marcador inicial se tiver localização
    let markerInstance = null;
    if (location) {
      markerInstance = window.L.marker([location.latitude, location.longitude]).addTo(mapInstance);
    }

    // Configurar evento de clique no mapa
    mapInstance.on('click', (e: any) => {
      const { lat, lng } = e.latlng;

      // Atualizar localização
      setLocation({ latitude: lat, longitude: lng });

      // Remover o marcador existente se houver
      if (markerInstance) {
        mapInstance.removeLayer(markerInstance);
      }

      // Adicionar novo marcador
      markerInstance = window.L.marker([lat, lng]).addTo(mapInstance);
      setMarker(markerInstance);

      // Notificar o componente pai
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  // Atualizar o mapa quando a localização mudar
  useEffect(() => {
    if (!map || !window.L) return;

    // Se não houver localização inicial mas recebeu uma nova
    if (!marker && location) {
      const newMarker = window.L.marker([location.latitude, location.longitude]).addTo(map);
      setMarker(newMarker);
      map.setView([location.latitude, location.longitude], 15);
    } 
    // Se já tem marcador e recebeu nova localização
    else if (marker && location) {
      const newLatLng = window.L.latLng(location.latitude, location.longitude);
      marker.setLatLng(newLatLng);
      map.setView(newLatLng, 15);
    }
  }, [location, map]);

  // Obter localização atual do usuário
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          // Notificar o componente pai
          if (onLocationSelect) {
            onLocationSelect(latitude, longitude);
          }
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert("Não foi possível obter sua localização. Por favor, clique no mapa para selecionar manualmente.");
        }
      );
    } else {
      alert("Seu navegador não suporta geolocalização. Por favor, clique no mapa para selecionar manualmente.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-2 flex justify-end">
        <Button 
          size="sm" 
          onClick={getCurrentLocation}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
        >
          <MapIcon size={16} />
          <span>Minha localização</span>
        </Button>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-full flex-1 rounded-md overflow-hidden"
        style={{ minHeight: "200px" }}
      />
    </div>
  );
};

export default LocationMap;