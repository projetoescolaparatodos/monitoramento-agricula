import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, MapPin, Info } from "lucide-react";
import { parseDMS, isValidCoordinate, formatCoordinate } from "@/utils/coordinateUtils";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [latitude, setLatitude] = useState<string>(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialLongitude?.toString() || '');
  const [parsedLat, setParsedLat] = useState<number | null>(initialLatitude);
  const [parsedLng, setParsedLng] = useState<number | null>(initialLongitude);
  const [error, setError] = useState<string | null>(null);

  // Atualizar os campos quando os valores iniciais mudarem
  useEffect(() => {
    if (initialLatitude !== null) {
      setLatitude(initialLatitude.toString());
      setParsedLat(initialLatitude);
    }
    if (initialLongitude !== null) {
      setLongitude(initialLongitude.toString());
      setParsedLng(initialLongitude);
    }
  }, [initialLatitude, initialLongitude]);

  // Parse input as user types or when they're done
  const handleLatitudeChange = (value: string) => {
    setLatitude(value);
    try {
      const parsedValue = parseDMS(value);
      if (parsedValue !== null) {
        setParsedLat(parsedValue);
        setError(null);
      }
    } catch (e) {
      // Continue typing, will validate on blur
    }
  };

  const handleLongitudeChange = (value: string) => {
    setLongitude(value);
    try {
      const parsedValue = parseDMS(value);
      if (parsedValue !== null) {
        setParsedLng(parsedValue);
        setError(null);
      }
    } catch (e) {
      // Continue typing, will validate on blur
    }
  };

  const validateCoordinates = () => {
    // Try to parse latitude
    const latResult = parseDMS(latitude);
    if (latResult === null) {
      setError("Formato de latitude inválido. Ex: '2° 48.104'S' ou '-2.81'");
      return false;
    }

    // Try to parse longitude
    const lngResult = parseDMS(longitude);
    if (lngResult === null) {
      setError("Formato de longitude inválido. Ex: '52° 4.229'O' ou '-52.07'");
      return false;
    }

    // Check if within valid range
    if (!isValidCoordinate(latResult, lngResult)) {
      setError("Coordenadas fora dos limites válidos (lat: -90 a 90, lng: -180 a 180)");
      return false;
    }

    // Everything is valid
    setParsedLat(latResult);
    setParsedLng(lngResult);
    setError(null);
    return true;
  };

  const handleSetLocation = () => {
    if (validateCoordinates() && parsedLat !== null && parsedLng !== null) {
      onLocationSelect(parsedLat, parsedLng);
      
      // Adicionamos um feedback visual para o usuário
      toast({
        title: "Localização definida",
        description: `Coordenadas: ${formatCoordinate(parsedLat, true)}, ${formatCoordinate(parsedLng, false)}`,
      });
    }
  };

  return (
    <div className="space-y-4 mb-6 p-4 bg-gray-500 rounded-lg">
      <h3 className="text-md font-medium text-white">Definir Localização por Coordenadas</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">
            Latitude 
            <span className="ml-2 text-xs text-gray-500">
              {parsedLat !== null ? `(${parsedLat.toFixed(6)})` : ''}
            </span>
          </Label>
          <Input
            id="latitude"
            type="text"
            placeholder="Ex: 2° 48.104'S ou -2.81"
            value={latitude}
            onChange={(e) => handleLatitudeChange(e.target.value)}
            onBlur={() => validateCoordinates()}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">
            Longitude
            <span className="ml-2 text-xs text-gray-500">
              {parsedLng !== null ? `(${parsedLng.toFixed(6)})` : ''}
            </span>
          </Label>
          <Input
            id="longitude"
            type="text"
            placeholder="Ex: 52° 4.229'O ou -52.07"
            value={longitude}
            onChange={(e) => handleLongitudeChange(e.target.value)}
            onBlur={() => validateCoordinates()}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 flex items-start gap-1 mt-1">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        <p>Formatos aceitos:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Decimal: -2.8792, -52.0088</li>
          <li>Graus e minutos: 2° 52.752'S, 52° 0.528'O</li>
        </ul>
      </div>

      <Button 
        type="button" 
        onClick={handleSetLocation}
        className="w-full flex items-center justify-center"
        disabled={parsedLat === null || parsedLng === null}
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