import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getTeamData } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  await connection();
  const data = await getTeamData();
  const name = data.settings.teamName || "MIZZLI FC";
  const icon = data.settings.appIconUrl || data.settings.logoUrl || "/brand/mizzli-crest.png";
  const iconSrc = icon.includes("?") ? icon : `${icon}?v=${Date.now()}`;

  return {
    id: "/",
    name,
    short_name: name.length > 12 ? name.slice(0, 12) : name,
    description: "App ufficiale della squadra: rosa, calendario, formazione, convocati e risultati.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    lang: "it",
    dir: "ltr",
    background_color: "#0b0614",
    theme_color: data.settings.colors?.primary || "#91278e",
    categories: ["sports", "entertainment"],
    prefer_related_applications: false,
    icons: [
      { src: iconSrc, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: iconSrc, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: iconSrc, sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: iconSrc, sizes: "180x180", type: "image/png" },
    ],
  };
}
