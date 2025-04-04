
import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BackgroundVideoProps {
  videoPath?: string;
  opacity?: number;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ 
  videoPath = "/videos/BackgroundVideo.mp4",
  opacity = 0.3 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('error', (e) => {
      console.error("Erro ao carregar vídeo:", e);
    });
    
    video.addEventListener('loadeddata', () => {
      console.log("Vídeo carregado com sucesso!");
    });

    const savedTime = localStorage.getItem('backgroundVideoTime');
    if (savedTime) {
      video.currentTime = parseFloat(savedTime);
    }

    const saveTime = () => {
      localStorage.setItem('backgroundVideoTime', video.currentTime.toString());
    };

    const interval = setInterval(saveTime, 1000);
    
    return () => {
      clearInterval(interval);
      saveTime();
    };
  }, [videoPath]);

  if (isMobile) {
    return (
      <div 
        className="fixed top-0 left-0 w-full h-full z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("/fundo estatico.jpg")',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
      />
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden" style={{ zIndex: 0 }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ opacity }}
      >
        <source src={videoPath} type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black" style={{ opacity: 0.6 }} />
    </div>
  );
};

export default BackgroundVideo;
