"use client";

import type { SocialLink } from "@/lib/types";

function InstagramLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#E4405F" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="#fff" />
    </svg>
  );
}

function instagramUsername(link: SocialLink) {
  const fromUrl = link.url.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  if (fromUrl?.[1] && fromUrl[1] !== "accounts") return fromUrl[1];
  return link.label.replace(/^@/, "").trim() || "mizzlifc";
}

function isInstagram(link: SocialLink) {
  const hay = `${link.url} ${link.label}`.toLowerCase();
  return hay.includes("instagram") || hay.includes("mizzlifc") || link.label.startsWith("@");
}

function hrefFor(link: SocialLink) {
  if (isInstagram(link)) return "/instagram";
  return link.url || "#";
}

export default function SocialButtons({
  links,
  className = "",
}: {
  links: SocialLink[];
  className?: string;
}) {
  return (
    <section className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {links.map((sl) => {
        const ig = isInstagram(sl);
        const label = sl.label.startsWith("@")
          ? sl.label
          : ig
            ? `@${instagramUsername(sl)}`
            : sl.label;
        return (
          <a
            key={sl.id}
            href={hrefFor(sl)}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-base font-bold text-black shadow-lg"
          >
            {ig && <InstagramLogo />}
            <span>{label}</span>
          </a>
        );
      })}
    </section>
  );
}
