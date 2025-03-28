
import React, { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  videoPath?: string;
  opacity?: number;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ 
  videoPath = "/videos/BackgroundVideo.mp4",
  opacity = 0.3 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Recupera o tempo salvo ou inicia do zero
    const savedTime = localStorage.getItem('backgroundVideoTime');
    if (savedTime) {
      video.currentTime = parseFloat(savedTime);
    }

    // Função para salvar o tempo
    const saveTime = () => {
      localStorage.setItem('backgroundVideoTime', video.currentTime.toString());
    };

    // Salva o tempo periodicamente
    const interval = setInterval(saveTime, 1000);
    
    // Salva o tempo também quando o componente é desmontado
    return () => {
      clearInterval(interval);
      saveTime();
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1]">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover"
        style={{ opacity }}
      >
        <source src={videoPath} type="video/mp4" />
        Seu navegador não suporta vídeos HTML5.
      </video>
      {/* Overlay para controlar melhor a opacidade e garantir visibilidade do conteúdo */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
    </div>
  );
};

export default BackgroundVideo;
