import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { site, siteUrl, siteIndexable } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const introScript = localFont({ src: "../../public/fonts/LaBelleAurore-Regular.ttf", variable: "--font-intro-script", weight: "400", display: "swap" });
const introHand = localFont({ src: "../../public/fonts/Caveat-Variable.ttf", variable: "--font-intro-hand", weight: "400 700", display: "swap" });

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  applicationName: "Portfólio de Joelson Vicente",
  authors: [{ name: "Joelson Vicente" }],
  metadataBase: siteUrl,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: { title: site.name, description: site.description, type: "website", locale: "pt_BR", ...(siteUrl ? { url: siteUrl, images: [{ url: "/images/tv-zoom/desktop-60fps/frame-0001.webp", width:1280, height:720, alt:"Televisão CRT em uma colina ao pôr do sol" }] } : {}) },
  twitter: { card: siteUrl ? "summary_large_image" : "summary", title:site.name, description:site.description },
  robots: { index: siteIndexable, follow: siteIndexable },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-reduced-motion="false"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${introScript.variable} ${introHand.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
