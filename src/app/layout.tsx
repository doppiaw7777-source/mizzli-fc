import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TeamProvider } from "@/context/TeamContext";
import { UserProvider } from "@/context/UserContext";
import NativeBootstrap from "@/components/NativeBootstrap";
import { getTeamData } from "@/lib/storage";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getTeamData();
  const appName = data.settings.teamName || "MIZZLI FC";
  const appIcon = data.settings.appIconUrl || data.settings.logoUrl || "/brand/mizzli-crest.png";
  const cacheBust = appIcon.includes("?") ? appIcon : `${appIcon}?v=${encodeURIComponent(appName)}`;

  return {
    title: appName,
    description: "App ufficiale: rosa, calendario, formazione e risultati della squadra",
    applicationName: appName,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: appName,
      statusBarStyle: "black-translucent",
    },
    icons: {
      icon: [
        { url: cacheBust, sizes: "192x192" },
        { url: cacheBust, sizes: "512x512" },
      ],
      apple: cacheBust,
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

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
