import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import NavigationProgress from "@/components/NavigationProgress";
import "./globals.css";

// Configure Manrope as the primary font with multiple weights
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "Rumik AI - Building Human AI",
  description: "Building AI beings who can connect with humans on a personal level. Meet Ira, our first AI built for 1.3bn+ Indians.",
  icons: {
    icon: '/3d_logo.webp',
    shortcut: '/3d_logo.webp',
    apple: '/3d_logo.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.className}>
      <head>
        <link rel="icon" href="/3d_logo.webp" type="image/webp" />
        <link rel="shortcut icon" href="/3d_logo.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/3d_logo.webp" />
        <script type="module" src="https://unpkg.com/@splinetool/viewer@1.9.28/build/spline-viewer.js" async></script>
      </head>
      <body className="antialiased">
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
