
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, MapPin } from "lucide-react";

interface IconSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
}

const IconSelector = ({ onLocationSelect, initialLatitude, initialLongitude }: IconSelectorProps) => {
  const [latitude, setLatitude] = useState<string>(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialLongitude?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  const handleSetLocation = () => {
    // Validar se os campos de latitude e longitude estão preenchidos e são válidos
    if (!latitude || !longitude) {
      setError("Preencha a latitude e longitude");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Valores de latitude e longitude inválidos");
      return;
    }

    // Validar os limites da latitude e longitude
    if (lat < -90 || lat > 90) {
      setError("Latitude deve estar entre -90 e 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      setError("Longitude deve estar entre -180 e 180");
      return;
    }

    setError(null);
    onLocationSelect(lat, lng);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 space-y-3">
      <h3 className="text-md font-medium mb-2 flex items-center">
        <MapPin className="mr-2 h-5 w-5" />
        Adicionar por Coordenadas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="text"
            placeholder="-2.87922"
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
      
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
      
      <Button 
        type="button" 
        onClick={handleSetLocation}
        className="w-full"
        variant="outline"
      >
        <Map className="mr-2 h-4 w-4" />
        Definir Localização
      </Button>
    </div>
  );
};

export default IconSelector;
