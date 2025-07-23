'use client';

import { useEffect } from 'react';

export function InitialTransitionPreload() {
  useEffect(() => {
    document.documentElement.classList.add('preload');

    const timer = setTimeout(() => {
      document.documentElement.classList.remove('preload');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}