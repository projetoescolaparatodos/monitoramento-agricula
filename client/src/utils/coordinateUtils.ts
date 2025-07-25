
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

    // Determinar direção primeiro
    let direction = 1;
    const upperCoord = cleanCoord.toUpperCase();
    if (upperCoord.includes('O') || upperCoord.includes('W') || 
        upperCoord.includes('S') || upperCoord.includes('SUL') || 
        upperCoord.includes('SOUTH') || upperCoord.includes('WEST') ||
        upperCoord.includes('OESTE')) {
      direction = -1;
    }

    // Remover letras direcionais para facilitar o parsing
    const coordWithoutDirection = cleanCoord.replace(/[NSEWOSUL]/gi, '').trim();
    
    // Extrair graus, minutos e segundos usando regex mais precisa
    const dmsRegex = /(\d+(?:\.\d+)?)°?\s*(\d+(?:\.\d+)?)'?\s*(\d+(?:\.\d+)?)?"?/;
    const match = coordWithoutDirection.match(dmsRegex);
    
    if (match) {
      const degrees = parseFloat(match[1] || '0');
      const minutes = parseFloat(match[2] || '0');
      const seconds = parseFloat(match[3] || '0');
      
      // Validar valores
      if (degrees < 0 || degrees > 180 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
        console.error("Valores DMS inválidos:", { degrees, minutes, seconds });
        return null;
      }
      
      // Calcular valor decimal
      const decimal = degrees + (minutes / 60) + (seconds / 3600);
      return direction * decimal;
    }

    // Tentar parsing alternativo para formatos como "2° 48.104'S"
    const altRegex = /(\d+(?:\.\d+)?)°?\s*(\d+(?:\.\d+)?)'?/;
    const altMatch = coordWithoutDirection.match(altRegex);
    
    if (altMatch) {
      const degrees = parseFloat(altMatch[1] || '0');
      const minutes = parseFloat(altMatch[2] || '0');
      
      // Validar valores
      if (degrees < 0 || degrees > 180 || minutes < 0 || minutes >= 60) {
        console.error("Valores DM inválidos:", { degrees, minutes });
        return null;
      }
      
      // Calcular valor decimal
      const decimal = degrees + (minutes / 60);
      return direction * decimal;
    }

    // Se não conseguiu fazer o parsing, retorna null
    console.error("Não foi possível fazer parsing da coordenada:", coordinate);
    return null;
    
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
