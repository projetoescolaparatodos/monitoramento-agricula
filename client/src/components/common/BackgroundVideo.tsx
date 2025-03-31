import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BackgroundVideoProps {
  videoUrl: string;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ videoUrl = "/videos/BackgroundVideo.mp4" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadVideo = async () => {
      try {
        console.log("Tentando carregar vídeo de:", videoUrl);
        if (videoRef.current) {
          await videoRef.current.play();
          console.log("Vídeo carregado com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao carregar o vídeo:", error);
      }
    };

    loadVideo();
  }, [videoUrl]);

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-green-900/20 to-black/20" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta vídeos.
      </video>
    </div>
  );
};

export default BackgroundVideo;