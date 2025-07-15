
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CustomVideoPreviewProps {
  videoUrl: string;
  title?: string;
  aspectRatio?: 'horizontal' | 'vertical' | 'square' | '9:16' | '16:9';
  className?: string;
  customPreviewImage?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

const CustomVideoPreview: React.FC<CustomVideoPreviewProps> = ({
  videoUrl,
  title = 'Vídeo',
  aspectRatio = 'horizontal',
  className = '',
  customPreviewImage,
  autoPlay = false,
  showControls = true
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

  // Função para gerar preview automático do vídeo
  const generatePreview = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Aguardar o vídeo carregar metadados
        const handleLoadedMetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Capturar frame aos 2 segundos ou 10% do vídeo
          const captureTime = Math.min(2, video.duration * 0.1);
          video.currentTime = captureTime;
        };

        const handleSeeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const previewDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setGeneratedPreview(previewDataUrl);
          video.currentTime = 0; // Resetar para o início
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('seeked', handleSeeked);
        
        // Cleanup
        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('seeked', handleSeeked);
        };
      }
    }
  };

  const getAspectRatioClass = () => {
    if (aspectRatio?.includes(':')) {
      const [width, height] = aspectRatio.split(':');
      return `aspect-[${width}/${height}]`;
    }

    switch (aspectRatio) {
      case 'vertical':
      case '9:16':
        return 'aspect-[9/16] max-w-[400px] mx-auto';
      case 'square':
      case '1:1':
        return 'aspect-square';
      case 'horizontal':
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setShowPreview(false);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoLoaded(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && !customPreviewImage) {
      generatePreview();
    }
  }, [videoUrl]);

  const previewImage = customPreviewImage || generatedPreview;

  return (
    <Card className={`relative overflow-hidden bg-black rounded-lg shadow-lg ${className}`}>
      <div className={`relative w-full ${getAspectRatioClass()}`}>
        {/* Canvas oculto para gerar preview */}
        <canvas
          ref={canvasRef}
          className="hidden"
          style={{ display: 'none' }}
        />
        
        {/* Vídeo */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={videoUrl}
          muted={isMuted}
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setShowPreview(true);
          }}
          style={{
            visibility: showPreview ? 'hidden' : 'visible',
            opacity: showPreview ? 0 : 1,
          }}
        />

        {/* Prévia personalizada */}
        {showPreview && previewImage && (
          <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
            <img
              src={previewImage}
              alt={title}
              className="w-full h-full object-cover"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            
            {/* Overlay com botão de play */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full p-4 transition-all duration-300 hover:scale-110 shadow-lg"
              >
                <Play size={32} fill="currentColor" />
              </button>
            </div>
          </div>
        )}

        {/* Fallback quando não há prévia */}
        {showPreview && !previewImage && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-4">
                <Play size={48} className="mx-auto text-gray-400" />
              </div>
              <p className="text-lg font-semibold mb-2">{title}</p>
              <button
                onClick={handlePlayPause}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-full transition-all duration-300"
              >
                Reproduzir Vídeo
              </button>
            </div>
          </div>
        )}

        {/* Controles customizados */}
        {!showPreview && showControls && videoLoaded && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
            {/* Barra de progresso */}
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ffffff ${(currentTime / duration) * 100}%, #4a5568 ${(currentTime / duration) * 100}%)`
                }}
              />
            </div>

            {/* Controles principais */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMuteToggle}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <span className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CustomVideoPreview;
