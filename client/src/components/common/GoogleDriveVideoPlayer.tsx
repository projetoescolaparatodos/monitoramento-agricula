
import React from 'react';
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
  if (!isGoogleDriveLink(mediaUrl)) {
    return null;
  }

  const fileId = getGoogleDriveFileId(mediaUrl);
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;

  return (
    <div className={`relative w-full ${aspectRatio === 'vertical' ? 'aspect-[9/16] max-w-[400px] mx-auto' : 'aspect-video'} bg-black rounded-t-lg overflow-hidden`}>
      {/* Tentativa de reprodução direta */}
      <video
        className="w-full h-full object-contain"
        controls
        playsInline
        webkit-playsinline="true"
        src={directUrl}
        poster={thumbnailUrl}
        title={title || 'Vídeo do Google Drive'}
      />

      {/* Fallback com thumbnail e botão */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 group">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Thumbnail do vídeo"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute flex items-center gap-2 px-4 py-2 bg-orange-500/90 text-white rounded-full text-sm font-semibold shadow-lg group-hover:bg-orange-600 transition-colors duration-300"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 5v10l8-5-8-5z" />
          </svg>
          Abrir no Google Drive
        </a>
      </div>
    </div>
  );
};

export default GoogleDriveVideoPlayer;
