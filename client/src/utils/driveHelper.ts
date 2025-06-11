
export const isGoogleDriveLink = (url: string) => {
  return url.includes('drive.google.com') && 
         (url.includes('/file/d/') || url.includes('/open?id='));
};

export const convertGoogleDriveLink = async (url: string): Promise<string> => {
  let fileId = '';
  
  // Extrai o ID do arquivo de diferentes formatos de URL
  if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0];
  } else if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0];
  } else {
    throw new Error("Formato de link do Google Drive não reconhecido");
  }
  
  // Para vídeos, usa o preview player
  if (await isVideoFile(url)) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  // Para imagens, usa o link direto
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

const isVideoFile = async (url: string): Promise<boolean> => {
  // Verifica extensões de vídeo na URL original
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

export const getGoogleDriveFileId = (url: string): string => {
  if (url.includes('/file/d/')) {
    return url.split('/file/d/')[1].split('/')[0];
  } else if (url.includes('id=')) {
    return url.split('id=')[1].split('&')[0];
  }
  return '';
};
