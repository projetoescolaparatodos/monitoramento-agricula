import React from 'react';

interface BackgroundVideoProps {
  src?: string;
  className?: string;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ 
  src = "/videos/BackgroundVideo.mp4", 
  className = "" 
}) => {
  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden ${className}`} style={{ zIndex: -10 }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          transform: 'none',
          scale: 'none'
        }}
      >
        <source src={src} type="video/mp4" />
        Seu navegador não suporta o elemento de vídeo.
      </video>
    </div>
  );
};

export default BackgroundVideo;