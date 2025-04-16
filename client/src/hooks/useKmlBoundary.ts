
import { useState, useEffect } from 'react';
import { kml } from '@mapbox/togeojson';
import { DOMParser } from '@xmldom/xmldom';

interface LatLng {
  lat: number;
  lng: number;
}

// Coordenadas precisas do município de Vitória do Xingu
// Estas coordenadas serão usadas quando o KML falhar
const FIXED_MUNICIPALITY_COORDINATES: LatLng[] = [
  // Aqui você deverá inserir as coordenadas do seu KML quando as tiver
  // Exemplo do formato: { lat: -2.85123, lng: -52.05678 },
  // Por enquanto, mantendo as coordenadas aproximadas
  { lat: -2.85, lng: -52.05 },
  { lat: -2.88, lng: -51.95 },
  { lat: -2.93, lng: -51.98 },
  { lat: -2.91, lng: -52.07 },
  { lat: -2.85, lng: -52.05 }, // Fechar o polígono
];

export function useKmlBoundary(kmlUrl: string) {
  const [boundaryCoordinates, setBoundaryCoordinates] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFixedCoordinates, setUsingFixedCoordinates] = useState(false);

  useEffect(() => {
    const parseKml = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingFixedCoordinates(false);
        
        const response = await fetch(kmlUrl);
        const kmlText = await response.text();
        const kmlDoc = new DOMParser().parseFromString(kmlText, 'text/xml');
        const geoJson = kml(kmlDoc);
        
        // Extrai as coordenadas do GeoJSON
        if (geoJson.features.length > 0 && geoJson.features[0].geometry) {
          const geometry = geoJson.features[0].geometry;
          
          if (geometry.type === 'Polygon' && geometry.coordinates.length > 0) {
            const coordinates = geometry.coordinates[0];
            const formattedCoords = coordinates.map(([lng, lat]: number[]) => ({ lat, lng }));
            setBoundaryCoordinates(formattedCoords);
          } else {
            throw new Error('Formato de geometria não suportado no KML');
          }
        } else {
          throw new Error('Nenhuma feature encontrada no KML');
        }
      } catch (err) {
        console.error('Erro ao processar KML:', err);
        // Em caso de erro, use as coordenadas fixas
        setError('Falha ao processar o arquivo KML. Usando coordenadas fixas.');
        setBoundaryCoordinates(FIXED_MUNICIPALITY_COORDINATES);
        setUsingFixedCoordinates(true);
      } finally {
        setLoading(false);
      }
    };

    if (kmlUrl) {
      parseKml();
    } else {
      // Se não houver URL de KML, use coordenadas fixas imediatamente
      setBoundaryCoordinates(FIXED_MUNICIPALITY_COORDINATES);
      setUsingFixedCoordinates(true);
      setLoading(false);
    }
  }, [kmlUrl]);

  return { 
    boundaryCoordinates, 
    loading, 
    error, 
    usingFixedCoordinates 
  };
}
