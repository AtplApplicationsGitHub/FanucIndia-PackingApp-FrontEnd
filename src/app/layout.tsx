// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./components/theme-provider";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toaster } from "sonner";
import { PreloadHandler } from "./components/PreloadHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fanuc India Packing App",
  description: "Admin & Sales Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background antialiased"
        )}
      >
        <PreloadHandler />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            richColors
            position="top-center"
            closeButton
            duration={3000}
            expand={true}
          />
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}