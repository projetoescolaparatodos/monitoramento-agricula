
import { useEffect, useRef } from 'react';

const BackgroundVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute min-w-full min-h-full object-cover opacity-20"
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default BackgroundVideo;
