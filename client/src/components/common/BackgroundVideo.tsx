
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
  }, []);

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-[-1] bg-gradient-to-b from-green-900/20 to-black/20"></div>
    );
  }

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
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
    </div>
  );
};

export default BackgroundVideo;
