import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cinzel = localFont({
  src: "../fonts/Cinzel-Bold.ttf",
  weight: "700",
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = localFont({
  src: "../fonts/CormorantGaramond-Bold.ttf",
  weight: "700",
  variable: "--font-cormorant",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "../fonts/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Inter-SemiBold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MI HIERRO · Tu hierro, tu marca, tu legado",
    template: "%s · MI HIERRO",
  },
  description:
    "Diseña tu hierro ganadero, la marca personal de tu novillada o el emblema de tu yeguada PRE. Propuestas con IA, visor realista y descarga vectorial forjable.",
  applicationName: "MI HIERRO",
  keywords: [
    "hierro ganadero",
    "diseñar hierro",
    "hierro de ganadería",
    "marca personal novillero",
    "hierro yeguada PRE",
    "hierro forjado",
  ],
  authors: [{ name: "MI HIERRO" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "MI HIERRO",
    title: "MI HIERRO · Tu hierro, tu marca, tu legado",
    description:
      "Transforma tu nombre y apellidos en propuestas de hierro ganadero tradicional. Gratis, sin registro obligatorio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MI HIERRO · Tu hierro, tu marca, tu legado",
    description: "Forja digital de hierros ganaderos, marcas de novillero y emblemas de yeguada.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0C0B0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-forge-void text-forge-ivory">{children}</body>
    </html>
  );
}
