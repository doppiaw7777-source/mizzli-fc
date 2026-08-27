"use client";

import { useTeam } from "@/context/TeamContext";
import { clubSocials, sharePayload, shareTargets } from "@/lib/social";

export default function SocialHub({ compact = false }: { compact?: boolean }) {
  const { data } = useTeam();
  if (!data) return null;
  const follows = clubSocials(data);
  const share = sharePayload(data);
  const targets = shareTargets(share.text, share.url);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${share.text} ${share.url}`);
    } catch {
      /* ignore */
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: data.settings.teamName, text: share.text, url: share.url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copy();
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 team-card">
      <p className="page-kicker">Social</p>
      <h2 className="mt-1 text-xl font-black">Segui Mizzli FC</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {follows.map((s) => (
          <a
            key={s.id}
            href={s.href}
            target={s.href.startsWith("/") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black"
          >
            {s.label}
          </a>
        ))}
      </div>
      {!compact && (
        <>
          <p className="mt-5 text-xs uppercase tracking-wider opacity-50">Condividi la prossima</p>
          <p className="mt-1 text-sm opacity-80">{share.text}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {targets.map((t) => (
              <a
                key={t.id}
                href={t.href}
                target={t.href.startsWith("/") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold"
              >
                {t.label}
              </a>
            ))}
            <button type="button" onClick={() => void nativeShare()} className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold">
              Condividi
            </button>
          </div>
        </>
      )}
    </section>
  );
}
