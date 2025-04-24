
/**
 * Utilitários para processamento de mídia, incluindo vídeos do YouTube e arquivos do Firebase Storage
 */

/**
 * Verifica se uma URL é do Firebase Storage
 * @param url URL a ser verificada
 * @returns true se for URL do Firebase Storage, false caso contrário
 */
export const isFirebaseStorageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('firebasestorage.googleapis.com');
};

/**
 * Tenta determinar o tipo de mídia com base na URL
 * @param url URL da mídia
 * @param defaultType Tipo padrão se não for possível determinar
 * @returns 'image', 'video' ou o valor padrão fornecido
 */
export const detectMediaType = (url: string, defaultType: string = 'image'): string => {
  if (!url) return defaultType;
  
  if (isYoutubeUrl(url)) return 'video';
  
  if (isFirebaseStorageUrl(url)) {
    // Tentar determinar com base na extensão
    const fileExtension = url.split('.').pop()?.toLowerCase();
    if (fileExtension) {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv'];
      
      if (imageExtensions.includes(fileExtension)) return 'image';
      if (videoExtensions.includes(fileExtension)) return 'video';
    }
    
    // Verificar se a URL contém indicações do tipo
    if (url.includes('/video/')) return 'video';
    if (url.includes('/image/')) return 'image';
  }
  
  return defaultType;
};

/**
 * Verifica se uma URL é do YouTube
 * @param url URL a ser verificada
 * @returns true se for URL do YouTube, false caso contrário
 */
export const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return regex.test(url);
};

/**
 * Extrai o ID do vídeo do YouTube de uma URL
 * @param url URL do YouTube
 * @returns ID do vídeo ou null se não for encontrado
 */
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Gera a URL para incorporar um vídeo do YouTube
 * @param url URL original do YouTube
 * @returns URL para incorporação ou null se não for possível extrair o ID
 */
export const getYoutubeEmbedUrl = (url: string): string | null => {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};
