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
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              
              <div style={{ flexGrow: 1, paddingBottom: "30px" }}>
                <PageAnimationWrapper>
                    {children}
                </PageAnimationWrapper>
              </div>

              <footer style={{ 
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                textAlign: "center", 
                padding: "6px", 
                fontSize: "0.75rem", 
                color: "#888",
                backgroundColor: "rgba(var(--background-default), 0.8)", // Slight transparency
                backdropFilter: "blur(4px)", // Nice glass effect
                zIndex: 9999
              }}>
                Version {process.env.NEXT_PUBLIC_APP_VERSION}
              </footer>

            </div>
          </AppProviders>
        </ThemeRegistry>
      </body>
    </html>
  );
}
