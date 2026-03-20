import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Container Ritz – Materialscanner",
  description: "KI-gestützte Bauschutterkennung mit Preiszuordnung",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Ritz Scanner" },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1,
  userScalable: false, themeColor: "#E8541A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, background: "#F5F3F0" }}>{children}</body>
    </html>
  );
}
