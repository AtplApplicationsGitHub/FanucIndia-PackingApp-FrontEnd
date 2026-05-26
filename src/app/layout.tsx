import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from "@/common/components/ThemeRegistry";
import AppProviders from "@/common/components/AppProviders";
import PageAnimationWrapper from "@/common/components/PageAnimationWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fanuc India Packing App",
  description: "Picking & Packing Management",
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
          id="theme-initializer"
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
      <body className={inter.className} suppressHydrationWarning>
        <ThemeRegistry>
          <AppProviders>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <div style={{ flexGrow: 1 }}>
                <PageAnimationWrapper>
                    {children}
                </PageAnimationWrapper>
              </div>
            </div>
          </AppProviders>
        </ThemeRegistry>
      </body>
    </html>
  );
}