
import React, { useRef, useEffect } from 'react';

interface BackgroundVideoProps {
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ 
  overlay = true, 
  overlayOpacity = 0.6,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Otimizações para performance
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    
    // Garantir que o vídeo seja reproduzido sem som
    video.muted = true;
    video.volume = 0;

    // Tentar reproduzir o vídeo
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Erro ao reproduzir vídeo de fundo:', error);
      });
    }

    // Cleanup
    return () => {
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 w-full h-full overflow-hidden -z-10 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute min-w-full min-h-full object-cover z-0"
        preload="metadata"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23000' viewBox='0 0 1 1'%3E%3C/svg%3E"
        style={{ 
          opacity: 1,
          willChange: 'auto',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        <source src="/videos/BackgroundVideo.mp4" type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>
      
      {overlay && (
        <div 
          className="absolute top-0 left-0 w-full h-full bg-black z-10" 
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
};

export default BackgroundVideo;
