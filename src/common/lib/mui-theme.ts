// src/common/lib/mui-theme.ts

import { ThemeOptions } from '@mui/material';

// --- Our Fanuc Palette ---
const fanuc = {
  yellow: "#FFD200",
  red: "#D00000",
  charcoal: "#1F2933",
  graphite: "#2C3540",
  steel: "#4B5563",
  line: "#E5E7EB",
  surface: "#F7F7F7",
  card: "#FFFFFF",
  link: "#0EA5E9",
};

// --- New Light Theme ---
export const LIGHT_THEME: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: fanuc.yellow, // Fanuc Yellow
      contrastText: fanuc.charcoal, // Dark text for good contrast on yellow
    },
    secondary: {
      main: fanuc.red, // Fanuc Red
      contrastText: fanuc.card,
    },
    background: {
      default: fanuc.surface, // Light grey background
      paper: fanuc.card,     // White for cards and tables
    },
    text: {
      primary: fanuc.charcoal, // Dark text
      secondary: fanuc.steel,  // Muted text
    },
    divider: fanuc.line,
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: fanuc.link, // Blue color
          textDecoration: 'none',
          '&:hover': {
            color: '#0b8acb', // A slightly darker blue for hover
          },
        },
      },
    },
  },
};

// --- New Dark Theme ---
export const DARK_THEME: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: fanuc.yellow, // Fanuc Yellow
      contrastText: fanuc.charcoal, // Dark text still works best
    },
    secondary: {
      main: fanuc.red, // Fanuc Red
      contrastText: fanuc.card,
    },
    background: {
      default: fanuc.charcoal, // Darkest color for background
      paper: fanuc.charcoal,   // Slightly lighter for cards
    },
    text: {
      primary: fanuc.card,     // White text
      secondary: fanuc.line,   // Light grey text
    },
    divider: fanuc.steel,
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: fanuc.link, // Blue color
          textDecoration: 'none',
          '&:hover': {
            color: '#38bdf8', // A slightly lighter blue for hover
          },
        },
      },
    },
  },
};