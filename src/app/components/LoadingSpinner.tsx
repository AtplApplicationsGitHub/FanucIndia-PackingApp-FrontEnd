// src/components/LoadingSpinner.tsx
import React from 'react';
import { Spinner } from '@/components/ui/Spinner';

export function LoadingSpinner({
  text = 'Loading',
  size = 'medium',
  show = true,
}: {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  show?: boolean;
}) {
  return (
    <Spinner size={size} show={show} className="text-[#FF2D20]">
      <span className="text-[#FF2D20] font-medium mt-1">{text}</span>
    </Spinner>
  );
}
