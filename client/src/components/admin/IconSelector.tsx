
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IconSelectorProps {
  latitude: number | null;
  longitude: number | null;
  onIconSelect: (iconUrl: string) => void;
  iconType: 'agricultura' | 'pesca' | 'paa';
}

const IconSelector: React.FC<IconSelectorProps> = ({ latitude, longitude, onIconSelect, iconType }) => {
  const [customIconUrl, setCustomIconUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  
  // Definindo ícones padrão para cada tipo
  const defaultIcons = {
    agricultura: "/trator-icon.png",
    pesca: "/pesca-icon.png",
    paa: "/paa-icon.png"
  };

  const useDefaultIcon = () => {
    onIconSelect(defaultIcons[iconType]);
  };

  const useCustomIcon = () => {
    if (customIconUrl && customIconUrl.trim() !== "") {
      onIconSelect(customIconUrl);
    }
  };

  // Renderiza o mapa de prévia quando há coordenadas
  const renderMapPreview = () => {
    if (!latitude || !longitude || !showPreview) return null;

    // Criar um ID único para o mapa
    const previewMapId = `preview-map-${Date.now()}`;
    
    // Usar useEffect para renderizar o mapa após renderização do componente
    React.useEffect(() => {
      if (!latitude || !longitude || !showPreview) return;

      const map = L.map(previewMapId).setView([latitude, longitude], 15);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Criar ícone personalizado baseado no tipo ou URL customizada
      const iconUrl = customIconUrl && customIconUrl.trim() !== "" 
        ? customIconUrl 
        : defaultIcons[iconType];
      
      const currentIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Adicionar marcador ao mapa
      L.marker([latitude, longitude], { icon: currentIcon }).addTo(map);

      return () => map.remove();
    }, [latitude, longitude, customIconUrl, showPreview]);

    return (
      <div className="mt-4">
        <div id={previewMapId} style={{ height: '200px', borderRadius: '8px' }}></div>
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold mb-4">Seleção de Ícone</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Button 
                onClick={useDefaultIcon} 
                variant="outline" 
                className="w-full"
              >
                Usar Ícone Padrão
              </Button>
              <div className="flex justify-center mt-2">
                <img src={defaultIcons[iconType]} alt="Ícone padrão" className="h-12 w-12" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customIcon">URL do Ícone Personalizado</Label>
              <div className="flex gap-2">
                <Input
                  id="customIcon"
                  value={customIconUrl}
                  onChange={(e) => setCustomIconUrl(e.target.value)}
                  placeholder="https://exemplo.com/icone.png"
                />
                <Button onClick={useCustomIcon} variant="secondary">Aplicar</Button>
              </div>
            </div>
          </div>

          {latitude && longitude && (
            <div>
              <Button 
                onClick={() => setShowPreview(!showPreview)} 
                variant="outline"
                className="w-full"
              >
                {showPreview ? "Ocultar Prévia" : "Mostrar Prévia no Mapa"}
              </Button>
              {renderMapPreview()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IconSelector;
