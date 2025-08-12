import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeToggle } from "@/common/components/ThemeToggle";
import ThemeRegistry from "@/common/components/ThemeRegistry";
import AppProviders from "@/common/components/AppProviders";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    const mode = localStorage.getItem('color-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effective = mode === 'dark' || (!mode && prefersDark) ? 'dark' : 'light';
    document.documentElement.style.colorScheme = effective;
    document.body.style.backgroundColor = effective === 'dark' ? '#121212' : '#ffffff';
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeRegistry>
          <AppProviders>
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
          </AppProviders>
        </ThemeRegistry>
      </body>
    </html>
  );
}
