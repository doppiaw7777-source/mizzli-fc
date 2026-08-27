import type { ClubInfo, SocialLink, TeamData } from "./types";
import { nextPlayableFixture } from "./next-fixture";
import { matchPageTitle } from "./match-kind";
import { formatItDate } from "./dates";

export type ClubSocial = {
  id: string;
  label: string;
  href: string;
};

export function clubSocials(data: TeamData): ClubSocial[] {
  const info = data.club?.info || ({} as ClubInfo);
  const items: ClubSocial[] = [
    { id: "instagram", label: "Instagram", href: "/instagram" },
    { id: "tiktok", label: "TikTok", href: "/tiktok" },
  ];
  if (info.facebookUrl) items.push({ id: "facebook", label: "Facebook", href: info.facebookUrl });
  if (info.youtubeUrl) items.push({ id: "youtube", label: "YouTube", href: info.youtubeUrl });
  if (info.whatsapp) {
    const phone = info.whatsapp.replace(/\D/g, "");
    items.push({
      id: "whatsapp",
      label: "WhatsApp",
      href: phone ? `https://wa.me/${phone}` : info.whatsapp,
    });
  }
  for (const link of data.socialLinks || []) {
    if (!link.url) continue;
    const hay = `${link.label} ${link.url}`.toLowerCase();
    if (items.some((i) => hay.includes(i.id))) continue;
    items.push({ id: link.id, label: link.label || "Social", href: link.url });
  }
  return items;
}

export function publicSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://mizzlifc.it").replace(/\/$/, "");
}

export function sharePayload(data: TeamData) {
  const next = nextPlayableFixture(data);
  const site = publicSiteUrl();
  if (!next) {
    return {
      text: `Segui ${data.settings.teamName} su ${site}`,
      url: site,
    };
  }
  const when = formatItDate(next.date, { weekday: "short", day: "numeric", month: "short" });
  const text = `${matchPageTitle(next, data.settings.teamName)} · ${when}${next.time ? ` ${next.time}` : ""}`;
  return { text, url: `${site}/partita/${next.id}` };
}

export function shareTargets(text: string, url: string) {
  const full = `${text} ${url}`.trim();
  return [
    { id: "wa", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(full)}` },
    {
      id: "fb",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    { id: "ig", label: "Instagram", href: "/instagram" },
    { id: "tt", label: "TikTok", href: "/tiktok" },
  ];
}

export function extraSocialLinks(links: SocialLink[]) {
  return links;
}
