// Google Drive API configuration
const GOOGLE_DRIVE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// Declaração de tipo para o Google API
declare global {
  interface Window {
    gapi: any;
  }
}

let gapi: any;
let gapiInitialized = false;

// Initialize Google Drive API
export const initializeGoogleDriveAPI = async (): Promise<boolean> => {
  if (gapiInitialized) return true;

  try {
    // Verificar se a API key está configurada
    if (!GOOGLE_DRIVE_API_KEY) {
      console.warn('Google Drive API key not configured');
      return false;
    }

    // Load Google API script if not already loaded
    if (!window.gapi) {
      await loadGoogleAPIScript();
    }

    // Verificar se o gapi foi carregado corretamente
    if (!window.gapi) {
      throw new Error('Google API script failed to load');
    }

    gapi = window.gapi;

    // Aguardar o carregamento do cliente de forma mais robusta
    await new Promise<void>((resolve, reject) => {
      gapi.load('client', {
        callback: async () => {
          try {
            await gapi.client.init({
              apiKey: GOOGLE_DRIVE_API_KEY,
              discoveryDocs: [DISCOVERY_DOC],
            });
            resolve();
          } catch (initError) {
            reject(initError);
          }
        },
        onerror: () => {
          reject(new Error('Failed to load Google API client'));
        }
      });
    });

    gapiInitialized = true;
    console.log('Google Drive API initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Google Drive API:', error);
    gapiInitialized = false;
    return false;
  }
};

// Load Google API script dynamically
const loadGoogleAPIScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Se o script já existe e gapi está disponível, resolver imediatamente
    if (window.gapi && document.getElementById('google-api-script')) {
      resolve();
      return;
    }

    // Verificar se o script já existe mas ainda não carregou
    const existingScript = document.getElementById('google-api-script');
    if (existingScript) {
      // Aguardar o carregamento do script existente
      const checkGapi = () => {
        if (window.gapi) {
          resolve();
        } else {
          setTimeout(checkGapi, 100);
        }
      };
      checkGapi();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-api-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Aguardar um pouco para garantir que gapi esteja disponível
      setTimeout(() => {
        if (window.gapi) {
          resolve();
        } else {
          reject(new Error('Google API script loaded but gapi is not available'));
        }
      }, 200);
    };
    
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.head.appendChild(script);
  });
};

export const isGoogleDriveLink = (url: string): boolean => {
  if (!url) return false;
  return url.includes('drive.google.com') && 
    (url.includes('/file/d/') || 
     url.includes('/open?id=') || 
     url.includes('/uc?export=view') ||
     url.includes('/uc?id='));
};

export const getGoogleDriveFileId = (url: string): string => {
  if (!url) return '';

  try {
    // Extract ID from different URL formats
    if (url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : '';
    }

    if (url.includes('id=')) {
      const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : '';
    }

    if (url.includes('/open?id=')) {
      const match = url.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : '';
    }

    if (url.includes('uc?export=view&id=')) {
      const match = url.match(/uc\?export=view&id=([a-zA-Z0-9_-]+)/);
      return match ? match[1] : '';
    }

    console.warn('Unrecognized Google Drive URL format:', url);
    return '';
  } catch (error) {
    console.error('Error extracting Google Drive ID:', error);
    return '';
  }
};

// Get file metadata using Google Drive API
export const getGoogleDriveFileMetadata = async (fileId: string) => {
  try {
    if (!gapiInitialized) {
      const initialized = await initializeGoogleDriveAPI();
      if (!initialized) throw new Error('Failed to initialize Google Drive API');
    }

    // Verificar se gapi.client.drive está disponível
    if (!gapi?.client?.drive) {
      throw new Error('Google Drive client not available');
    }

    console.log('Tentando buscar metadados para arquivo:', fileId);

    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,size,thumbnailLink,videoMediaMetadata,imageMediaMetadata,webViewLink,webContentLink'
    });

    console.log('Resposta da API:', response);
    return response.result;
  } catch (error: any) {
    console.error('Erro detalhado ao buscar metadados:', {
      error: error,
      status: error.status,
      statusText: error.statusText,
      details: error.result?.error,
      message: error.message
    });

    if (error.status === 403) {
      console.error('Erro 403: Verifique se o arquivo é público e se a API key tem permissões adequadas');
    } else if (error.status === 404) {
      console.error('Erro 404: Arquivo não encontrado ou não acessível');
    } else if (error.message?.includes('gapi')) {
      console.error('Erro na inicialização da API Google');
    }

    return null;
  }
};

// Get optimized streaming URL for video files
export const getGoogleDriveStreamingUrl = async (fileId: string): Promise<string | null> => {
  try {
    const metadata = await getGoogleDriveFileMetadata(fileId);
    
    // Para vídeos, SEMPRE usar URL de preview (nunca webContentLink que força download)
    if (metadata?.mimeType?.startsWith('video/') || !metadata) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Para imagens, usar URL de visualização
    if (metadata.mimeType?.startsWith('image/')) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    // Fallback padrão: usar preview
    return `https://drive.google.com/file/d/${fileId}/preview`;
  } catch (error) {
    console.error('Error getting streaming URL:', error);
    // Em caso de erro, sempre retornar URL de preview
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
};

// Check if file is accessible (public or shared)
export const checkGoogleDriveFileAccess = async (fileId: string): Promise<boolean> => {
  try {
    const metadata = await getGoogleDriveFileMetadata(fileId);
    return metadata !== null;
  } catch (error) {
    console.error('Error checking file access:', error);
    return false;
  }
};

// Get thumbnail URL with custom size
export const getGoogleDriveThumbnail = (fileIdOrUrl: string, size: number = 1000): string => {
  // Se for uma URL, extrair o ID primeiro
  const fileId = isGoogleDriveLink(fileIdOrUrl) ? getGoogleDriveFileId(fileIdOrUrl) : fileIdOrUrl;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
};

// Get optimized thumbnail for video preview
export const getGoogleDriveVideoThumbnail = (fileId: string): string => {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
};