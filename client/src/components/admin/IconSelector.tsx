
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Map, MapPin, Info, AlertCircle, CheckCircle } from "lucide-react";
import { 
  parseCoordinateWithFormat, 
  isValidCoordinate, 
  formatCoordinate, 
  validateCoordinateFormat,
  CoordinateInfo
} from "@/utils/coordinateUtils";
import { useToast } from "@/hooks/use-toast";

interface IconSelectorProps {
  onLocationSelect: (lat: number, lng: number, metadata?: any) => void;
  initialLatitude: number | null;
  initialLongitude: number | null;
  onMapCenterChange?: (lat: number, lng: number) => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ 
  onLocationSelect, 
  initialLatitude, 
  initialLongitude,
  onMapCenterChange
}) => {
  const { toast } = useToast();
  const [latitude, setLatitude] = useState<string>(initialLatitude?.toString() || '');
  const [longitude, setLongitude] = useState<string>(initialLongitude?.toString() || '');
  const [parsedLatInfo, setParsedLatInfo] = useState<CoordinateInfo | null>(null);
  const [parsedLngInfo, setParsedLngInfo] = useState<CoordinateInfo | null>(null);
  const [errors, setErrors] = useState<{lat?: string; lng?: string}>({});
  const [validationStatus, setValidationStatus] = useState<{lat?: boolean; lng?: boolean}>({});

  // Atualizar os campos quando os valores iniciais mudarem
  useEffect(() => {
    if (initialLatitude !== null) {
      setLatitude(initialLatitude.toString());
      const coordInfo = parseCoordinateWithFormat(initialLatitude.toString());
      setParsedLatInfo(coordInfo);
    }
    if (initialLongitude !== null) {
      setLongitude(initialLongitude.toString());
      const coordInfo = parseCoordinateWithFormat(initialLongitude.toString());
      setParsedLngInfo(coordInfo);
    }
  }, [initialLatitude, initialLongitude]);

  // Validação em tempo real para latitude
  const handleLatitudeChange = (value: string) => {
    setLatitude(value);
    
    if (!value.trim()) {
      setParsedLatInfo(null);
      setErrors(prev => ({ ...prev, lat: undefined }));
      setValidationStatus(prev => ({ ...prev, lat: undefined }));
      return;
    }

    const validation = validateCoordinateFormat(value);
    const coordInfo = parseCoordinateWithFormat(value);
    
    if (validation.isValid && coordInfo) {
      // Validação adicional para latitude
      if (Math.abs(coordInfo.value) > 90) {
        setErrors(prev => ({ ...prev, lat: 'Latitude deve estar entre -90° e 90°' }));
        setValidationStatus(prev => ({ ...prev, lat: false }));
        setParsedLatInfo(null);
      } else {
        setParsedLatInfo(coordInfo);
        setErrors(prev => ({ ...prev, lat: undefined }));
        setValidationStatus(prev => ({ ...prev, lat: true }));
      }
    } else {
      setParsedLatInfo(null);
      setErrors(prev => ({ ...prev, lat: validation.errors[0] || 'Formato inválido' }));
      setValidationStatus(prev => ({ ...prev, lat: false }));
    }
  };

  // Validação em tempo real para longitude
  const handleLongitudeChange = (value: string) => {
    setLongitude(value);
    
    if (!value.trim()) {
      setParsedLngInfo(null);
      setErrors(prev => ({ ...prev, lng: undefined }));
      setValidationStatus(prev => ({ ...prev, lng: undefined }));
      return;
    }

    const validation = validateCoordinateFormat(value);
    const coordInfo = parseCoordinateWithFormat(value);
    
    if (validation.isValid && coordInfo) {
      // Validação adicional para longitude
      if (Math.abs(coordInfo.value) > 180) {
        setErrors(prev => ({ ...prev, lng: 'Longitude deve estar entre -180° e 180°' }));
        setValidationStatus(prev => ({ ...prev, lng: false }));
        setParsedLngInfo(null);
      } else {
        setParsedLngInfo(coordInfo);
        setErrors(prev => ({ ...prev, lng: undefined }));
        setValidationStatus(prev => ({ ...prev, lng: true }));
      }
    } else {
      setParsedLngInfo(null);
      setErrors(prev => ({ ...prev, lng: validation.errors[0] || 'Formato inválido' }));
      setValidationStatus(prev => ({ ...prev, lng: false }));
    }
  };

  const validateCoordinates = () => {
    if (!parsedLatInfo || !parsedLngInfo) {
      return false;
    }

    if (!isValidCoordinate(parsedLatInfo.value, parsedLngInfo.value)) {
      setErrors({
        lat: 'Coordenadas fora dos limites válidos',
        lng: 'Coordenadas fora dos limites válidos'
      });
      return false;
    }

    return true;
  };

  const handleSetLocation = () => {
    if (validateCoordinates() && parsedLatInfo && parsedLngInfo) {
      // Criar metadados com informações do formato original
      const metadata = {
        latitude: {
          decimal: parsedLatInfo.value,
          originalFormat: parsedLatInfo.originalFormat,
          formatType: parsedLatInfo.formatType
        },
        longitude: {
          decimal: parsedLngInfo.value,
          originalFormat: parsedLngInfo.originalFormat,
          formatType: parsedLngInfo.formatType
        },
        timestamp: new Date().toISOString()
      };

      onLocationSelect(parsedLatInfo.value, parsedLngInfo.value, metadata);

      // Notifica a mudança de centro do mapa se a função foi fornecida
      if (onMapCenterChange) {
        onMapCenterChange(parsedLatInfo.value, parsedLngInfo.value);
      }

      // Feedback para o usuário
      toast({
        title: "Localização definida",
        description: `Coordenadas: ${parsedLatInfo.originalFormat}, ${parsedLngInfo.originalFormat}`
      });
    }
  };

  // Função para obter ícone de status
  const getStatusIcon = (field: 'lat' | 'lng') => {
    const status = validationStatus[field];
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === false) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Definir Localização por Coordenadas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude" className="flex items-center gap-2">
            Latitude 
            {getStatusIcon('lat')}
            {parsedLatInfo && (
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {parsedLatInfo.formatType.toUpperCase()}: {parsedLatInfo.value.toFixed(6)}°
              </span>
            )}
          </Label>
          <Input
            id="latitude"
            type="text"
            placeholder="Ex: 2° 48' 6.25&quot;S, 2° 48.104'S ou -2.81"
            value={latitude}
            onChange={(e) => handleLatitudeChange(e.target.value)}
            className={`${errors.lat ? 'border-red-500' : validationStatus.lat ? 'border-green-500' : ''}`}
          />
          {errors.lat && (
            <div className="text-sm text-red-500 flex items-start gap-1">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errors.lat}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude" className="flex items-center gap-2">
            Longitude
            {getStatusIcon('lng')}
            {parsedLngInfo && (
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {parsedLngInfo.formatType.toUpperCase()}: {parsedLngInfo.value.toFixed(6)}°
              </span>
            )}
          </Label>
          <Input
            id="longitude"
            type="text"
            placeholder="Ex: 52° 4' 13.74&quot;O, 52° 4.229'O ou -52.07"
            value={longitude}
            onChange={(e) => handleLongitudeChange(e.target.value)}
            className={`${errors.lng ? 'border-red-500' : validationStatus.lng ? 'border-green-500' : ''}`}
          />
          {errors.lng && (
            <div className="text-sm text-red-500 flex items-start gap-1">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errors.lng}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <div className="flex items-start gap-1 mb-2">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="font-medium">Formatos aceitos:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Decimal:</strong> -2.8792, -52.0088</li>
            <li><strong>Graus e minutos:</strong> 2° 52.752'S, 52° 0.528'O</li>
            <li><strong>Graus, minutos e segundos:</strong> 2° 48' 6.25"S, 52° 4' 13.74"O</li>
          </ul>
          <p className="mt-2 text-xs text-blue-600">
            💡 O formato original será preservado no banco de dados
          </p>
        </div>
      </div>

      <Button 
        type="button" 
        onClick={handleSetLocation}
        className="w-full flex items-center justify-center"
        disabled={!parsedLatInfo || !parsedLngInfo || !!errors.lat || !!errors.lng}
      >
        <MapPin className="mr-2 h-4 w-4" />
        Definir Localização
        {parsedLatInfo && parsedLngInfo && (
          <span className="ml-2 text-xs opacity-75">
            ({parsedLatInfo.formatType.toUpperCase()})
          </span>
        )}
      </Button>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Clique no mapa para selecionar manualmente ou insira as coordenadas acima.
        <br />
        <span className="text-green-600">✓ Formato original será mantido</span>
      </p>
    </div>
  );
};

export default IconSelector;
