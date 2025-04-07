import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  editable?: boolean;
}

// Este componente atualiza a visualização do mapa quando as coordenadas mudam
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

const LocationMap: React.FC<LocationMapProps> = ({ 
  latitude, 
  longitude, 
  onLocationChange,
  editable = false
}) => {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
  
  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);
  
  const handleMarkerDrag = (e: L.LeafletEvent) => {
    if (!editable) return;
    
    const marker = e.target;
    const newPosition = marker.getLatLng();
    setPosition([newPosition.lat, newPosition.lng]);
    
    if (onLocationChange) {
      onLocationChange(newPosition.lat, newPosition.lng);
    }
  };

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-green-300 mt-2 mb-4">
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={position}
          draggable={editable}
          eventHandlers={{
            dragend: handleMarkerDrag
          }}
        />
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
};

export default LocationMap;