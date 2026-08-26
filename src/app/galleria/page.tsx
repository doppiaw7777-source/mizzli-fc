"use client";

import AppShell from "@/components/AppShell";
import SectionPage, { SoftCard } from "@/components/SectionPage";
import { useTeam } from "@/context/TeamContext";

export default function GalleriaPage() {
  const { data } = useTeam();
  if (!data) return null;
  const albums = Array.from(new Set(data.club.gallery.map((g) => g.album)));

  return (
    <AppShell page="altro">
      <SectionPage title="Galleria" subtitle="Foto e album del club">
        {data.club.gallery.length === 0 ? (
          <p className="opacity-60">Nessuna foto. Caricale da Admin → Club.</p>
        ) : (
          albums.map((album) => (
            <div key={album}>
              <h2 className="mb-3 text-xl font-bold">{album}</h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {data.club.gallery
                  .filter((g) => g.album === album)
                  .map((g) => (
                    <SoftCard key={g.id}>
                      {g.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.url} alt={g.caption} className="mb-2 h-40 w-full rounded-xl object-cover" />
                      ) : (
                        <div className="mb-2 flex h-40 items-center justify-center rounded-xl bg-white/5 text-4xl">
                          📷
                        </div>
                      )}
                      <p className="text-sm">{g.caption}</p>
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
