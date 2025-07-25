
export interface CoordinateInfo {
  value: number;
  originalFormat: string;
  formatType: 'decimal' | 'dm' | 'dms';
}

// Função para detectar o tipo de formato
export function detectCoordinateFormat(input: string): 'decimal' | 'dm' | 'dms' | 'invalid' {
  const cleanInput = input.trim();
  
  // Formato DMS (graus, minutos, segundos)
  if (/^\d{1,3}°\s*\d{1,2}['′]\s*[\d.]+["″]\s*[NSEO]$/i.test(cleanInput)) {
    return 'dms';
  }
  
  // Formato DM (graus e minutos)
  if (/^\d{1,3}°\s*[\d.]+['′]\s*[NSEO]$/i.test(cleanInput)) {
    return 'dm';
  }
  
  // Formato decimal
  if (/^-?[\d.]+$/.test(cleanInput)) {
    return 'decimal';
  }
  
  return 'invalid';
}

// Função melhorada para parsing que mantém formato original
export function parseCoordinateWithFormat(input: string): CoordinateInfo | null {
  if (!input || typeof input !== 'string') return null;
  
  const cleanInput = input.trim();
  const formatType = detectCoordinateFormat(cleanInput);
  
  if (formatType === 'invalid') return null;
  
  let decimalValue: number;
  
  try {
    switch (formatType) {
      case 'decimal':
        decimalValue = parseFloat(cleanInput);
        if (isNaN(decimalValue)) return null;
        break;
        
      case 'dm':
        decimalValue = parseDM(cleanInput);
        if (decimalValue === null) return null;
        break;
        
      case 'dms':
        decimalValue = parseDMSToDecimal(cleanInput);
        if (decimalValue === null) return null;
        break;
        
      default:
        return null;
    }
    
    return {
      value: decimalValue,
      originalFormat: cleanInput,
      formatType: formatType
    };
    
  } catch (error) {
    console.error('Erro ao fazer parsing da coordenada:', error);
    return null;
  }
}

// Função para parsing DM (graus e minutos)
function parseDM(input: string): number | null {
  const match = input.match(/^(\d{1,3})°\s*([\d.]+)['′]\s*([NSEO])$/i);
  if (!match) return null;
  
  const degrees = parseInt(match[1]);
  const minutes = parseFloat(match[2]);
  const direction = match[3].toUpperCase();
  
  // Validações
  if (degrees < 0 || degrees > 180) return null;
  if (minutes < 0 || minutes >= 60) return null;
  
  // Validação específica por direção
  if (['N', 'S'].includes(direction) && degrees > 90) return null;
  if (['E', 'O', 'W'].includes(direction) && degrees > 180) return null;
  
  let decimal = degrees + (minutes / 60);
  
  // Aplicar sinal baseado na direção
  if (['S', 'O', 'W'].includes(direction)) {
    decimal = -decimal;
  }
  
  return decimal;
}

// Função para parsing DMS (graus, minutos, segundos)
function parseDMSToDecimal(input: string): number | null {
  const match = input.match(/^(\d{1,3})°\s*(\d{1,2})['′]\s*([\d.]+)["″]\s*([NSEO])$/i);
  if (!match) return null;
  
  const degrees = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = parseFloat(match[3]);
  const direction = match[4].toUpperCase();
  
  // Validações rigorosas
  if (degrees < 0 || degrees > 180) return null;
  if (minutes < 0 || minutes >= 60) return null;
  if (seconds < 0 || seconds >= 60) return null;
  
  // Validação específica por direção
  if (['N', 'S'].includes(direction) && degrees > 90) return null;
  if (['E', 'O', 'W'].includes(direction) && degrees > 180) return null;
  
  let decimal = degrees + (minutes / 60) + (seconds / 3600);
  
  // Aplicar sinal baseado na direção
  if (['S', 'O', 'W'].includes(direction)) {
    decimal = -decimal;
  }
  
  return decimal;
}

// Função legada mantida para compatibilidade
export function parseDMS(input: string): number | null {
  const coordInfo = parseCoordinateWithFormat(input);
  return coordInfo ? coordInfo.value : null;
}

// Função para validar coordenadas
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Função para formatar coordenada de volta ao formato original ou preferido
export function formatCoordinate(value: number, isLatitude: boolean, preferredFormat?: 'decimal' | 'dm' | 'dms'): string {
  if (preferredFormat === 'decimal' || !preferredFormat) {
    return value.toFixed(6);
  }
  
  const absValue = Math.abs(value);
  const degrees = Math.floor(absValue);
  const minutesFloat = (absValue - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;
  
  let direction: string;
  if (isLatitude) {
    direction = value >= 0 ? 'N' : 'S';
  } else {
    direction = value >= 0 ? 'E' : 'O';
  }
  
  if (preferredFormat === 'dm') {
    const totalMinutes = (absValue - degrees) * 60;
    return `${degrees}° ${totalMinutes.toFixed(3)}' ${direction}`;
  }
  
  if (preferredFormat === 'dms') {
    return `${degrees}° ${minutes}' ${seconds.toFixed(2)}" ${direction}`;
  }
  
  return value.toFixed(6);
}

// Função para converter coordenada em objeto com metadados
export function createCoordinateMetadata(input: string): {
  decimal: number;
  originalFormat: string;
  formatType: string;
  formatted: string;
} | null {
  const coordInfo = parseCoordinateWithFormat(input);
  if (!coordInfo) return null;
  
  return {
    decimal: coordInfo.value,
    originalFormat: coordInfo.originalFormat,
    formatType: coordInfo.formatType,
    formatted: coordInfo.originalFormat
  };
}

// Função para validar formato específico
export function validateCoordinateFormat(input: string, expectedFormat?: 'decimal' | 'dm' | 'dms'): {
  isValid: boolean;
  detectedFormat: string;
  errors: string[];
} {
  const errors: string[] = [];
  const detectedFormat = detectCoordinateFormat(input);
  
  if (detectedFormat === 'invalid') {
    errors.push('Formato de coordenada não reconhecido');
    return { isValid: false, detectedFormat: 'invalid', errors };
  }
  
  if (expectedFormat && detectedFormat !== expectedFormat) {
    errors.push(`Esperado formato ${expectedFormat}, mas detectado ${detectedFormat}`);
  }
  
  const coordInfo = parseCoordinateWithFormat(input);
  if (!coordInfo) {
    errors.push('Não foi possível fazer parsing da coordenada');
    return { isValid: false, detectedFormat, errors };
  }
  
  // Validações adicionais baseadas no formato
  if (detectedFormat === 'dms' || detectedFormat === 'dm') {
    const match = input.match(/(\d+)°.*([NSEO])/i);
    if (match) {
      const degrees = parseInt(match[1]);
      const direction = match[2].toUpperCase();
      
      if (['N', 'S'].includes(direction) && degrees > 90) {
        errors.push('Graus para latitude não podem exceder 90°');
      }
      if (['E', 'O', 'W'].includes(direction) && degrees > 180) {
        errors.push('Graus para longitude não podem exceder 180°');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    detectedFormat,
    errors
  };
}
