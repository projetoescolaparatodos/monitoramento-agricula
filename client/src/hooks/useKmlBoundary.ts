
import { useState, useEffect } from 'react';
import { kml } from '@mapbox/togeojson';
import { DOMParser } from '@xmldom/xmldom';

interface LatLng {
  lat: number;
  lng: number;
}

export function useKmlBoundary(kmlUrl: string) {
  const [boundaryCoordinates, setBoundaryCoordinates] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseKml = async () => {
      try {
        setLoading(true);
        const response = await fetch(kmlUrl);
        const kmlText = await response.text();
        const kmlDoc = new DOMParser().parseFromString(kmlText, 'text/xml');
        const geoJson = kml(kmlDoc);
        
        // Extrai as coordenadas do GeoJSON
        // Assumindo que estamos trabalhando com um polígono simples
        if (geoJson.features.length > 0 && geoJson.features[0].geometry) {
          const geometry = geoJson.features[0].geometry;
          
          if (geometry.type === 'Polygon' && geometry.coordinates.length > 0) {
            const coordinates = geometry.coordinates[0];
            const formattedCoords = coordinates.map(([lng, lat]: number[]) => ({ lat, lng }));
            setBoundaryCoordinates(formattedCoords);
          } else {
            setError('Formato de geometria não suportado no KML');
          }
        } else {
          setError('Nenhuma feature encontrada no KML');
        }
      } catch (err) {
        console.error('Erro ao processar KML:', err);
        setError('Falha ao processar o arquivo KML');
      } finally {
        setLoading(false);
      }
    };

    if (kmlUrl) {
      parseKml();
    }
  }, [kmlUrl]);

  return { boundaryCoordinates, loading, error };
}
