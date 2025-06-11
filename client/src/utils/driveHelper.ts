
// Google Drive API configuration
const GOOGLE_DRIVE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

let gapi: any;
let gapiInitialized = false;

// Initialize Google Drive API
export const initializeGoogleDriveAPI = async (): Promise<boolean> => {
  if (gapiInitialized) return true;
  
  try {
    // Load Google API script if not already loaded
    if (!window.gapi) {
      await loadGoogleAPIScript();
    }
    
    gapi = window.gapi;
    await gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: GOOGLE_DRIVE_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
    });
    
    gapiInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Google Drive API:', error);
    return false;
  }
};

// Load Google API script dynamically
const loadGoogleAPIScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-api-script')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-api-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
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
      details: error.result?.error
    });
    
    if (error.status === 403) {
      console.error('Erro 403: Verifique se o arquivo é público e se a API key tem permissões adequadas');
    } else if (error.status === 404) {
      console.error('Erro 404: Arquivo não encontrado ou não acessível');
    }
    
    return null;
  }
};

// Get optimized streaming URL for video files
export const getGoogleDriveStreamingUrl = async (fileId: string): Promise<string | null> => {
  try {
    const metadata = await getGoogleDriveFileMetadata(fileId);
    if (!metadata) return null;

    // For video files, try to get streaming URL
    if (metadata.mimeType?.startsWith('video/')) {
      // Use webContentLink for direct download/streaming
      if (metadata.webContentLink) {
        return metadata.webContentLink;
      }
      
      // Fallback to preview URL
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // For images, use direct view URL
    if (metadata.mimeType?.startsWith('image/')) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    return null;
  } catch (error) {
    console.error('Error getting streaming URL:', error);
    return null;
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
export const getGoogleDriveThumbnail = (fileId: string, size: number = 1000): string => {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
};

// Legacy functions for backward compatibility
export const convertGoogleDriveLink = async (url: string): Promise<string> => {
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) throw new Error("Unrecognized Google Drive link format");

  const streamingUrl = await getGoogleDriveStreamingUrl(fileId);
  if (streamingUrl) return streamingUrl;

  // Fallback to preview URL
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

// Check if it's a video file based on Drive API
export const isGoogleDriveVideoFile = async (url: string): Promise<boolean> => {
  try {
    const fileId = getGoogleDriveFileId(url);
    if (!fileId) return false;

    const metadata = await getGoogleDriveFileMetadata(fileId);
    return metadata?.mimeType?.startsWith('video/') || false;
  } catch (error) {
    console.error('Error checking if file is video:', error);
    return true; // Default to true for fallback behavior
  }
};
