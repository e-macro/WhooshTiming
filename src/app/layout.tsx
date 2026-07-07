import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header/Header";
import "./globals.css";
import QueryProvider from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ВЖЖЖТаймінг — Повтори F1 гонок",
  description:
    "Replay any Formula 1 session with live-style timing, theoretical standings and track data.",
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
