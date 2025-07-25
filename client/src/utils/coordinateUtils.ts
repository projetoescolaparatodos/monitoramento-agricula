
/**
 * Utilitários para conversão e manipulação de coordenadas geográficas
 */

/**
 * Converte uma coordenada no formato DMS (graus, minutos, segundos) ou similar para decimal
 * Ex: "52° 4.229'O" ou "2° 48.104'S"
 */
export function parseDMS(coordinate: string): number | null {
  // Se já for um número, apenas retorna
  if (!isNaN(Number(coordinate))) {
    return Number(coordinate);
  }

  try {
    // Limpar e normalizar a entrada
    const cleanCoord = coordinate.replace(/\s+/g, ' ').trim();
    
    // Verificar se contém caracteres indicando formato DMS
    if (!cleanCoord.includes('°') && !cleanCoord.includes("'") && !cleanCoord.includes('"')) {
      // Provavelmente já é decimal, tenta converter
      return parseFloat(cleanCoord);
    }

    // Extrair partes
    const parts = cleanCoord.split(/[°'"\s]+/);
    let degrees = parseFloat(parts[0] || '0');
    let minutes = parts[1] ? parseFloat(parts[1]) : 0;
    let seconds = parts[2] ? parseFloat(parts[2]) : 0;
    
    // Determinar direção
    let direction = 1;
    const lastPart = cleanCoord.toUpperCase();
    if (lastPart.includes('O') || lastPart.includes('W') || 
        lastPart.includes('S') || lastPart.includes('SUL') || 
        lastPart.includes('SOUTH') || lastPart.includes('WEST') ||
        lastPart.includes('OESTE')) {
      direction = -1;
    }

    // Calcular valor decimal
    return direction * (degrees + (minutes / 60) + (seconds / 3600));
  } catch (e) {
    console.error("Erro ao converter coordenada:", coordinate, e);
    return null;
  }
}

/**
 * Verifica se as coordenadas são válidas
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Formata uma coordenada para exibição
 */
export function formatCoordinate(value: number, isLatitude: boolean): string {
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutes = (abs - degrees) * 60;
  
  const direction = isLatitude
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'O');
    
  return `${degrees}° ${minutes.toFixed(3)}'${direction}`;
}

/**
 * Obtém uma instância de mapa Leaflet existente de forma segura
 * @param container O elemento HTML container do mapa
 * @returns A instância do mapa ou null se não encontrada
 */
export function getLeafletMapInstance(container: HTMLElement): any {
  try {
    // Verifica se já existe uma instância Leaflet no container
    if (container._leaflet) {
      return container._leaflet;
    }
    
    // Tenta acessar via coleção global do Leaflet (depende da versão)
    if (window.L && window.L.maps) {
      const maps = Object.values(window.L.maps);
      const existingMap = maps.find(m => m._container === container);
      if (existingMap) return existingMap;
    }
    
    // Tenta obter usando o ID do container
    if (container._leaflet_id && window.L && window.L.Map && window.L.Map.get) {
      const mapInstance = window.L.Map.get(container._leaflet_id);
      if (mapInstance) return mapInstance;
    }
    
    // Última tentativa: procura por mapas que possam estar associados a este container
    if (window.L && window.L._leaflet_id_map) {
      for (const id in window.L._leaflet_id_map) {
        const obj = window.L._leaflet_id_map[id];
        if (obj instanceof window.L.Map && obj._container === container) {
          return obj;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao obter instância do mapa:", error);
    return null;
  }
}

/**
 * Função segura para adicionar marcador a um mapa
 * @param map Instância do mapa Leaflet
 * @param lat Latitude do marcador
 * @param lng Longitude do marcador
 * @param clearExisting Se deve limpar marcadores existentes
 * @returns O marcador criado ou null em caso de erro
 */
export function addMarkerToMap(map: any, lat: number, lng: number, clearExisting: boolean = true): any {
  try {
    if (!map) return null;
    
    // Limpa marcadores existentes se solicitado
    if (clearExisting) {
      map.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker) {
          map.removeLayer(layer);
        }
      });
    }
    
    // Adiciona novo marcador
    const marker = window.L.marker([lat, lng]).addTo(map);
    
    // Centraliza o mapa no marcador
    map.setView([lat, lng], map.getZoom());
    
    return marker;
  } catch (error) {
    console.error("Erro ao adicionar marcador:", error);
    return null;
  }
}
