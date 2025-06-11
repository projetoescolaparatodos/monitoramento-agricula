
import React from 'react';

interface MediaPreviewProps {
  aspectRatio: string;
  displayMode: string;
  mediaUrl?: string;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ aspectRatio, displayMode, mediaUrl }) => {
  const getRatioPercent = (ratio: string) => {
    switch(ratio) {
      case '16:9':
        return (9 / 16) * 100;
      case '9:16':
        return (16 / 9) * 100;
      case '1:1':
        return 100;
      case '4:5':
        return (5 / 4) * 100;
      case 'horizontal':
        return (9 / 16) * 100;
      case 'vertical':
        return (16 / 9) * 100;
      case 'square':
        return 100;
      default:
        if (ratio.includes(':')) {
          const [width, height] = ratio.split(':').map(Number);
          return (height / width) * 100;
        }
        return (9 / 16) * 100;
    }
  };

  const ratioPercent = getRatioPercent(aspectRatio);

  return (
    <div className="mx-auto" style={{ maxWidth: '300px' }}>
      <div 
        className="relative bg-gray-200 border border-gray-300 overflow-hidden rounded-lg"
        style={{ paddingBottom: `${Math.min(ratioPercent, 200)}%` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {mediaUrl ? (
            <div className={`w-full h-full flex items-center justify-center
              ${displayMode === 'cover' ? 'overflow-hidden' : ''}
            `}>
              {mediaUrl.includes('youtube') || mediaUrl.includes('youtu.be') ? (
                <div className="bg-red-100 border-2 border-dashed border-red-400 w-full h-full flex items-center justify-center">
                  <span className="text-xs text-red-600 text-center p-2">
                    YouTube Video<br/>
                    {aspectRatio} ({displayMode})
                  </span>
                </div>
              ) : mediaUrl.includes('video') || mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') ? (
                <div className="bg-purple-100 border-2 border-dashed border-purple-400 w-full h-full flex items-center justify-center">
                  <span className="text-xs text-purple-600 text-center p-2">
                    Vídeo<br/>
                    {aspectRatio} ({displayMode})
                  </span>
                </div>
              ) : (
                <img 
                  src={mediaUrl} 
                  alt="Preview"
                  className={`
                    ${displayMode === 'cover' ? 'object-cover w-full h-full' : ''}
                    ${displayMode === 'contain' ? 'object-contain max-w-full max-h-full' : ''}
                    ${displayMode === 'fill' ? 'object-fill w-full h-full' : ''}
                  `}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              )}
            </div>
          ) : (
            <div className="bg-blue-100 border-2 border-dashed border-blue-400 w-full h-full flex items-center justify-center">
              <span className="text-xs text-blue-600 text-center p-2">
                Pré-visualização<br/>
                {aspectRatio} ({displayMode})
              </span>
            </div>
          )}
          <div className="hidden bg-gray-100 border-2 border-dashed border-gray-400 w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-600 text-center p-2">
              Erro ao carregar<br/>
              {aspectRatio} ({displayMode})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
