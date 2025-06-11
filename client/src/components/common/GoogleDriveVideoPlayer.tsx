
import React, { useState, useEffect } from 'react';
import { 
  isGoogleDriveLink, 
  getGoogleDriveFileId, 
  initializeGoogleDriveAPI,
  getGoogleDriveFileMetadata,
  getGoogleDriveStreamingUrl,
  getGoogleDriveThumbnail
} from '../../utils/driveHelper';

interface GoogleDriveVideoPlayerProps {
  mediaUrl: string;
  thumbnailUrl?: string;
  title?: string;
  aspectRatio?: 'horizontal' | 'vertical' | 'square';
}

interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  videoMediaMetadata?: {
    width: number;
    height: number;
    durationMillis: string;
  };
}

const GoogleDriveVideoPlayer: React.FC<GoogleDriveVideoPlayerProps> = ({
  mediaUrl,
  thumbnailUrl,
  title,
  aspectRatio = 'horizontal',
}) => {
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    const initializeAPI = async () => {
      try {
        const initialized = await initializeGoogleDriveAPI();
        setApiReady(initialized);
        if (!initialized) {
          console.warn('Google Drive API not available, falling back to iframe');
        }
      } catch (error) {
        console.error('Failed to initialize Google Drive API:', error);
        setApiReady(false);
      }
    };

    initializeAPI();
  }, []);

  useEffect(() => {
    const loadVideoData = async () => {
      if (!apiReady || !isGoogleDriveLink(mediaUrl)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fileId = getGoogleDriveFileId(mediaUrl);
        
        // Get file metadata
        const fileMetadata = await getGoogleDriveFileMetadata(fileId);
        if (fileMetadata) {
          setMetadata(fileMetadata);
          
          // Get streaming URL
          const url = await getGoogleDriveStreamingUrl(fileId);
          setStreamingUrl(url);
        }
      } catch (error) {
        console.error('Error loading video data:', error);
        setVideoError(true);
      } finally {
        setLoading(false);
      }
    };

    if (apiReady) {
      loadVideoData();
    }
  }, [apiReady, mediaUrl]);

  if (!isGoogleDriveLink(mediaUrl)) {
    return null;
  }

  const fileId = getGoogleDriveFileId(mediaUrl);
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
  const fallbackThumbnail = getGoogleDriveThumbnail(fileId, 1000);

  // Determine if video is vertical based on metadata or aspect ratio prop
  const isVertical = aspectRatio === 'vertical' || 
    (metadata?.videoMediaMetadata && 
     metadata.videoMediaMetadata.height > metadata.videoMediaMetadata.width);

  const containerClass = `relative w-full ${
    isVertical ? 'aspect-[9/16] max-w-[400px] mx-auto' : 'aspect-video'
  } bg-black rounded-t-lg overflow-hidden`;

  if (loading) {
    return (
      <div className={containerClass}>
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // If API is ready and we have a streaming URL, use HTML5 video
  if (apiReady && streamingUrl && !videoError) {
    return (
      <div className={containerClass}>
        <video
          className="w-full h-full object-contain"
          controls
          playsInline
          webkit-playsinline="true"
          src={streamingUrl}
          poster={metadata?.thumbnailLink || thumbnailUrl || fallbackThumbnail}
          title={metadata?.name || title || 'Vídeo do Google Drive'}
          onError={() => setVideoError(true)}
        >
          Seu navegador não suporta reprodução de vídeo.
        </video>
        
        {/* Info overlay */}
        {metadata && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {metadata.name}
          </div>
        )}
        
        {/* Fallback button */}
        <div className="absolute bottom-4 right-4 z-10">
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500/90 text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg hover:bg-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z" />
            </svg>
            Abrir
          </a>
        </div>
      </div>
    );
  }

  // Fallback to iframe method
  return (
    <div className={containerClass}>
      {!videoError ? (
        <>
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={metadata?.name || title || 'Vídeo do Google Drive'}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            loading="lazy"
            onError={() => setVideoError(true)}
          />
          
          <div className="absolute bottom-4 right-4 z-10">
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500/90 text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg hover:bg-orange-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l8-5-8-5z" />
              </svg>
              Abrir vídeo
            </a>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <img
            src={metadata?.thumbnailLink || thumbnailUrl || fallbackThumbnail}
            alt="Thumbnail do vídeo"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 text-white text-center"
            >
              <div className="bg-orange-500 p-4 rounded-full">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l8-5-8-5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Abrir no Google Drive</p>
                <p className="text-sm opacity-75">Toque para reproduzir</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveVideoPlayer;
