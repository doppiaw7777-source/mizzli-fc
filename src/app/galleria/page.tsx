"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function GalleriaPage() {
  const { data } = useTeam();
  if (!data) return null;
  const albums = Array.from(new Set(data.club.gallery.map((g) => g.album || "Generale")));

  return (
    <AppShell page="altro">
      <SectionPage title="Galleria" subtitle="Foto del club. Tocca Scarica per l'originale.">
        {data.club.gallery.length === 0 ? (
          <p className="opacity-60">Nessuna foto pubblicata.</p>
        ) : (
          albums.map((album) => (
            <div key={album} className="mb-8">
              <h2 className="mb-3 text-xl font-bold">{album}</h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {data.club.gallery
                  .filter((g) => (g.album || "Generale") === album)
                  .map((g) => (
                    <SoftCard key={g.id}>
                      {g.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.url} alt={g.caption} className="mb-2 w-full rounded-xl object-contain" />
                      ) : (
                        <div className="mb-2 flex h-40 items-center justify-center rounded-xl bg-white/5 text-4xl">
                          📷
                        </div>
                      )}
                      {g.caption ? <p className="text-sm">{g.caption}</p> : null}
                      {g.url ? (
                        <a href={g.url} download className="mt-2 inline-block text-sm font-semibold text-[#d4af37]">
                          Scarica originale
                        </a>
                      ) : null}
                    </SoftCard>
                  ))}
              </div>
            </div>
          ))
        )}
      </SectionPage>
    </AppShell>
  );
}
