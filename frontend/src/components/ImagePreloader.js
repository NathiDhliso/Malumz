import { useEffect } from 'react';

// Critical images that should be preloaded
const CRITICAL_IMAGES = [
  'https://images.unsplash.com/photo-1633108091790-4cfd06e8d5da?w=1920&h=1080&fit=crop&crop=entropy&cs=srgb&fm=webp&q=75',
  'https://images.unsplash.com/photo-1597524624057-0a3cba4d77b1?w=1920&h=1080&fit=crop&crop=entropy&cs=srgb&fm=webp&q=75',
];

export const ImagePreloader = () => {
  useEffect(() => {
    // Preload critical images
    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null; // This component doesn't render anything
};