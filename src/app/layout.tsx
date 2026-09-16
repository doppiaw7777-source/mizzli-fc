import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TeamProvider } from "@/context/TeamContext";
import { UserProvider } from "@/context/UserContext";
import NativeBootstrap from "@/components/NativeBootstrap";
import { MIZZLI_CREST } from "@/lib/brand";
import "./globals.css";
import "./crest-plain.css";
import "./crest-gold.css";
import "./partner-ticker.css";
import "./sponsor-fit.css";
import "./motto-gold.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MIZZLI FC",
  description: "App ufficiale: rosa, calendario, formazione e risultati della squadra",
  applicationName: "MIZZLI FC",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "MIZZLI FC",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: MIZZLI_CREST, sizes: "192x192" }],
    apple: MIZZLI_CREST,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#91278e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${inter.variable}`}>
      <body className="antialiased">
        <TeamProvider>
          <UserProvider>
            <NativeBootstrap />
            {children}
          </UserProvider>
        </TeamProvider>
      </body>
    </html>
  );
}
