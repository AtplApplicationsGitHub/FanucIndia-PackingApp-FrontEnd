// components/common/Providers.tsx
"use client";

import { ReactNode, useMemo } from "react";
// This is your wrapper around next-themes’ ThemeProvider
import { ThemeProvider as NextThemesProvider } from "@/components/common/theme-provider";
// But import the hook from next-themes itself
import { useTheme as useNextTheme } from "next-themes";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // get the current light/dark value
  const { resolvedTheme } = useNextTheme();

  // rebuild MUI theme whenever it changes
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme === "dark" ? "dark" : "light",
          primary: { main: "#5781e9" },
          background: {
            default: resolvedTheme === "dark" ? "#121212" : "#fafafa",
          },
        },
        typography: {
          fontFamily: `"Inter", sans-serif`,
        },
      }),
    [resolvedTheme]
  );

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </NextThemesProvider>
  );
}