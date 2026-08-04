import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header/Header";
import "./globals.css";
import QueryProvider from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL('https://whoosh-timing.vercel.app'),
  title: { 
    default: "ВЖЖЖТаймінг — Повтори F1 гонок",
    template: '%s · ВЖЖЖТаймінг',
  },
  description:
    "Переграй будь-яку сесію Formula 1 з таймінгами як наживо, теоретичними заліками та даними траси.",
    openGraph: {
    type: 'website',
    url: 'https://whoosh-timing.vercel.app',
    },
  twitter: {
    card: 'summary_large_image',
    },
};





export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <Header />
        <QueryProvider>
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
