'use client';

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { NextAppDirEmotionCacheProvider } from './EmotionCache';
import { ColorModeContext, ColorMode } from '@/lib/color-mode-context';
import { LIGHT_THEME, DARK_THEME } from '@/lib/mui-theme';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ColorMode>('system');

  React.useLayoutEffect(() => {
    try {
      const storedMode = localStorage.getItem('color-mode') as ColorMode | null;
      if (storedMode) setMode(storedMode);
    } catch (e) {
      console.error("Could not access localStorage for theme.", e);
    }
  }, []);

  React.useEffect(() => {
    try {
      if (mode !== 'system') {
        localStorage.setItem('color-mode', mode);
      } else {
        localStorage.removeItem('color-mode');
      }
    } catch (e) {
      console.error("Could not update localStorage for theme.", e);
    }
  }, [mode]);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const effectiveMode = mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;

  const theme = React.useMemo(
    () => createTheme(effectiveMode === 'dark' ? DARK_THEME : LIGHT_THEME),
    [effectiveMode]
  );

  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
      <ColorModeContext.Provider value={{ mode, setMode }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </NextAppDirEmotionCacheProvider>
  );
}
