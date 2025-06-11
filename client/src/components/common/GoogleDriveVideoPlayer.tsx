
import React, { useState } from 'react';
import { isGoogleDriveLink, getGoogleDriveFileId } from '../../utils/driveHelper';

interface GoogleDriveVideoPlayerProps {
  mediaUrl: string;
  thumbnailUrl?: string;
  title?: string;
  aspectRatio?: 'horizontal' | 'vertical' | 'square';
}

const GoogleDriveVideoPlayer: React.FC<GoogleDriveVideoPlayerProps> = ({
  mediaUrl,
  thumbnailUrl,
  title,
  aspectRatio = 'horizontal',
}) => {
  const [videoError, setVideoError] = useState(false);

  if (!isGoogleDriveLink(mediaUrl)) {
    return null;
  }

  const fileId = getGoogleDriveFileId(mediaUrl);
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
  const thumbnailFallback = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

  return (
    <div className={`relative w-full ${aspectRatio === 'vertical' ? 'aspect-[9/16] max-w-[400px] mx-auto' : 'aspect-video'} bg-black rounded-t-lg overflow-hidden`}>
      {!videoError ? (
        <>
          {/* Iframe do Google Drive como método principal */}
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            title={title || 'Vídeo do Google Drive'}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            loading="lazy"
            onError={() => setVideoError(true)}
          />
          
          {/* Botão de fallback sobreposto */}
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
        /* Fallback quando iframe falha */
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          {(thumbnailUrl || thumbnailFallback) && (
            <img
              src={thumbnailUrl || thumbnailFallback}
              alt="Thumbnail do vídeo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
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
