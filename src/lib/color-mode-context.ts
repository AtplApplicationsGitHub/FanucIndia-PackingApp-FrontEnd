'use client';

import * as React from 'react';

export type ColorMode = 'light' | 'dark' | 'system';

export interface ColorModeContextProps {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
}

export const ColorModeContext = React.createContext<ColorModeContextProps>({
  mode: 'system',
  setMode: () => {},
});
