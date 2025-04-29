
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, MapPin } from "lucide-react";

interface IconSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLatitude: number | null;
  initialLongitude: number | null;
}

const IconSelector: React.FC<IconSelectorProps> = ({ 
  onLocationSelect, 
  initialLatitude, 
  initialLongitude 
}) => {
  const [latitude, setLatitude] = useState<string>(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialLongitude?.toString() || '');

  // Atualizar os campos quando os valores iniciais mudarem
  useEffect(() => {
    if (initialLatitude !== null) {
      setLatitude(initialLatitude.toString());
    }
    if (initialLongitude !== null) {
      setLongitude(initialLongitude.toString());
    }
  }, [initialLatitude, initialLongitude]);

  const handleSetLocation = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      // Validar latitude (-90 a 90)
      if (lat < -90 || lat > 90) {
        alert("Latitude deve estar entre -90 e 90");
        return;
      }
      
      // Validar longitude (-180 a 180)
      if (lng < -180 || lng > 180) {
        alert("Longitude deve estar entre -180 e 180");
        return;
      }
      
      onLocationSelect(lat, lng);
    } else {
      alert("Por favor, insira coordenadas válidas");
    }
  };

  return (
    <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-md font-medium">Definir Localização por Coordenadas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="text"
            placeholder="-2.8792"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="text"
            placeholder="-52.0088"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>
      </div>
      <Button 
        type="button" 
        onClick={handleSetLocation}
        className="w-full flex items-center justify-center"
      >
        <MapPin className="mr-2 h-4 w-4" />
        Definir Localização
      </Button>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Clique no mapa para selecionar manualmente ou insira as coordenadas acima.
      </p>
    </div>
  );
};

export default IconSelector;
