
/**
 * Utilitários para processamento de mídia, especialmente vídeos do YouTube
 */

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
