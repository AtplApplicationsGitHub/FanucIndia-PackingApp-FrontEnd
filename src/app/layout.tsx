import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/common/theme-provider";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Toaster } from "sonner";
import { InitialTransitionPreload } from "@/components/common/InitialTransitionPreload";

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
        <InitialTransitionPreload />
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