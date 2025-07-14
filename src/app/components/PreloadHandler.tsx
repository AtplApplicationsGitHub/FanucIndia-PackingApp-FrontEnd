// src/app/components/PreloadHandler.tsx
'use client';

import { useEffect } from 'react';

export function PreloadHandler() {
  useEffect(() => {
    // Add preload class to prevent transition flash on initial load
    document.documentElement.classList.add('preload');
    
    // Remove preload class after a short delay to enable transitions
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('preload');
    }, 100);
    
    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything visible
  return null;
}