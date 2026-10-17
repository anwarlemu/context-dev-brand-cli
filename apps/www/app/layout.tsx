import type { Metadata } from "next";
import { Doto, IBM_Plex_Mono, Rethink_Sans } from "next/font/google";

import { registryName, registryUrl } from "@www/lib/registry";

import "./globals.css";

const rethinkSans = Rethink_Sans({ subsets: ["latin"], variable: "--font-rethink-sans" });
const doto = Doto({ subsets: ["latin"], weight: ["400", "500", "800"], variable: "--font-doto" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ibm-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(registryUrl),
  title: { default: `${registryName} design system`, template: `%s | ${registryName} design system` },
  description: `Components, tokens, and CLI instructions for the ${registryName} team and coding agents building pages and interfaces.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rethinkSans.variable} ${doto.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
