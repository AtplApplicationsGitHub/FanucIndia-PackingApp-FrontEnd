import { ThemeOptions } from '@mui/material';

export const LIGHT_THEME: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: {
      default: '#f5f5f5',
      paper: '#f5f5f5',
    },
  },
};

export const DARK_THEME: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    background: {
      default: '#121212',
      paper: '#121212',
    },
  },
};
