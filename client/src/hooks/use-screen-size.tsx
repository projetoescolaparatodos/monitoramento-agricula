
import { useState, useEffect } from 'react';

interface ScreenSize {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  width: number;
  height: number;
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    if (typeof window !== 'undefined') {
      return {
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024 && window.innerWidth < 1440,
        isLargeScreen: window.innerWidth >= 1440,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLargeScreen: false,
      width: 1024,
      height: 768,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024 && width < 1440,
        isLargeScreen: width >= 1440,
        width,
        height,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}
