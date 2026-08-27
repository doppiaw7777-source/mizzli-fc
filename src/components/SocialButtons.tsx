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

function TikTokLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#111" />
      <path
        fill="#25F4EE"
        d="M14.2 7.2c.7.9 1.7 1.5 2.9 1.7v2.1c-.9 0-1.8-.3-2.6-.7v4.7c0 2.4-1.9 4.3-4.3 4.3S6 17.4 6 15c0-2.4 1.9-4.3 4.3-4.3.3 0 .5 0 .8.1v2.2c-.2-.1-.5-.1-.8-.1-1.2 0-2.1 1-2.1 2.1s1 2.1 2.1 2.1 2.1-1 2.1-2.1V7.2h1.8z"
      />
      <path
        fill="#FE2C55"
        d="M13.7 6.7c.7.9 1.7 1.5 2.9 1.7v1.6c-.9 0-1.8-.3-2.6-.7v4.7c0 2.4-1.9 4.3-4.3 4.3-.6 0-1.2-.1-1.7-.4 1 .9 2.3 1.4 3.8 1.4 2.4 0 4.3-1.9 4.3-4.3V6.7h-2.4z"
      />
      <path
        fill="#fff"
        d="M13.4 7.6c.7.9 1.7 1.5 2.9 1.7v1.4c-.9 0-1.8-.3-2.6-.7v4.7c0 2.4-1.9 4.3-4.3 4.3S6.8 17.1 6.8 14.7c0-2.4 1.9-4.3 4.3-4.3.3 0 .5 0 .8.1v1.5c-.2-.1-.5-.1-.8-.1-1.2 0-2.1 1-2.1 2.1s1 2.1 2.1 2.1 2.1-1 2.1-2.1V7.6h.2z"
      />
    </svg>
  );
}

function isInstagram(link: SocialLink) {
  const hay = `${link.url} ${link.label}`.toLowerCase();
  return hay.includes("instagram");
}

function isTikTok(link: SocialLink) {
  const hay = `${link.url} ${link.label}`.toLowerCase();
  return hay.includes("tiktok");
}

export default function SocialButtons({
  links = [],
  className = "",
}: {
  links?: SocialLink[];
  className?: string;
}) {
  const extras = links.filter((l) => l.url && !isInstagram(l) && !isTikTok(l));

  return (
    <section className={`flex flex-wrap justify-center gap-3 ${className}`}>
      <a
        href="/instagram"
        className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-base font-bold text-black shadow-lg"
      >
        <InstagramLogo />
        <span>@mizzlifc</span>
      </a>
      <a
        href="/tiktok"
        className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-base font-bold text-black shadow-lg"
      >
        <TikTokLogo />
        <span>@mizzlitv</span>
      </a>
      {extras.map((sl) => (
        <a
          key={sl.id}
          href={sl.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-base font-bold text-black shadow-lg"
        >
          <span>{sl.label}</span>
        </a>
      ))}
    </section>
  );
}
