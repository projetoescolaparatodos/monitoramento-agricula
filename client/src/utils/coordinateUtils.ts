
export interface CoordinateInfo {
  value: number;
  originalFormat: string;
  formatType: 'decimal' | 'dm' | 'dms';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Converte coordenadas DMS (Graus, Minutos, Segundos) para decimal
 */
function parseDMS(coordinate: string): number | null {
  // Padroniza a string removendo espaços desnecessários e normalizando aspas
  const standardized = coordinate
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/''/g, '"')
    .replace(/´/g, "'")
    .replace(/″/g, '"');

  // Expressão regular para DMS completo (graus, minutos, segundos)
  const dmsRegex = /^(\d{1,3})°\s*(\d{1,2})'\s*(\d{1,2}(?:\.\d+)?)"\s*([NSEOW])?$/i;
  
  // Expressão regular para DM (graus e minutos)
  const dmRegex = /^(\d{1,3})°\s*(\d{1,2}(?:\.\d+)?)'\s*([NSEOW])?$/i;
  
  // Expressão regular para decimal
  const decimalRegex = /^-?\d{1,3}(?:\.\d+)?$/;

  let matches;
  let degrees, minutes, seconds, direction;

  // Tentar casar com DMS primeiro
  if ((matches = standardized.match(dmsRegex))) {
    degrees = parseFloat(matches[1]);
    minutes = parseFloat(matches[2]);
    seconds = parseFloat(matches[3]);
    direction = matches[4]?.toUpperCase();
  } 
  // Tentar casar com DM
  else if ((matches = standardized.match(dmRegex))) {
    degrees = parseFloat(matches[1]);
    minutes = parseFloat(matches[2]);
    seconds = 0;
    direction = matches[3]?.toUpperCase();
  } 
  // Tentar casar com decimal
  else if (decimalRegex.test(standardized)) {
    return parseFloat(standardized);
  } else {
    return null;
  }

  // Validar valores
  if (minutes >= 60 || seconds >= 60) {
    return null;
  }

  // Calcular o valor decimal
  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  
  // Aplicar direção (para S e W, o valor deve ser negativo)
  if (direction === 'S' || direction === 'W' || direction === 'O') {
    decimal = -decimal;
  }

  return decimal;
}

/**
 * Analisa uma coordenada em qualquer formato e retorna informações estruturadas
 */
export function parseCoordinateWithFormat(coordinate: string): CoordinateInfo | null {
  if (!coordinate || typeof coordinate !== 'string') {
    return null;
  }

  const trimmed = coordinate.trim();
  if (!trimmed) {
    return null;
  }

  // Detectar formato
  let formatType: 'decimal' | 'dm' | 'dms' = 'decimal';
  
  if (trimmed.includes('°') && trimmed.includes('"')) {
    formatType = 'dms';
  } else if (trimmed.includes('°') && trimmed.includes("'")) {
    formatType = 'dm';
  }

  const value = parseDMS(trimmed);
  
  if (value === null) {
    return null;
  }

  return {
    value,
    originalFormat: trimmed,
    formatType
  };
}

/**
 * Valida o formato de uma coordenada
 */
export function validateCoordinateFormat(coordinate: string): ValidationResult {
  const errors: string[] = [];

  if (!coordinate || typeof coordinate !== 'string') {
    errors.push('Coordenada deve ser uma string válida');
    return { isValid: false, errors };
  }

  const trimmed = coordinate.trim();
  if (!trimmed) {
    errors.push('Coordenada não pode estar vazia');
    return { isValid: false, errors };
  }

  // Tenta fazer o parse
  const parsed = parseDMS(trimmed);
  
  if (parsed === null) {
    errors.push('Formato de coordenada inválido. Use formatos como: -3.123, 3° 7.38\'S ou 3° 7\' 22.8"S');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
}

/**
 * Verifica se as coordenadas estão dentro dos limites válidos
 */
export function isValidCoordinate(latitude: number, longitude: number): boolean {
  // Verifica se são números válidos
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }

  // Verifica se não são NaN ou infinitos
  if (!isFinite(latitude) || !isFinite(longitude)) {
    return false;
  }

  // Verifica os limites geográficos
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Formata uma coordenada decimal para DMS
 */
export function formatCoordinate(decimal: number, type: 'lat' | 'lng'): string {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;

  let direction = '';
  if (type === 'lat') {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return `${degrees}° ${minutes}' ${seconds.toFixed(2)}"${direction}`;
}

/**
 * Converte coordenadas DMS para decimal (função auxiliar)
 */
export function dmsToDecimal(degrees: number, minutes: number, seconds: number, direction: string): number {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  if (direction === 'S' || direction === 'W' || direction === 'O') {
    decimal = -decimal;
  }
  
  return decimal;
}

/**
 * Valida se uma string contém uma coordenada válida
 */
export function isValidCoordinateString(coordinate: string): boolean {
  const validation = validateCoordinateFormat(coordinate);
  if (!validation.isValid) {
    return false;
  }

  const parsed = parseCoordinateWithFormat(coordinate);
  if (!parsed) {
    return false;
  }

  // Para latitude: -90 a 90
  // Para longitude: -180 a 180
  return Math.abs(parsed.value) <= 180;
}
