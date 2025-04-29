
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
