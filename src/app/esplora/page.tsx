"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import { menuGroupsForUser } from "@/lib/menu";
import { useUser } from "@/context/UserContext";

export default function EsploraPage() {
  const { user } = useUser();

  const groups = menuGroupsForUser(user);

  return (
    <AppShell page="altro">
      <div className="space-y-8">
        <div>
          <p className="page-kicker">Club</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Esplora</h1>
          <p className="mt-2 max-w-xl opacity-70">
            Statistiche, convocati, storia, shop e tutto il resto del club.
          </p>
        </div>
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] opacity-50">
              {group.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-4 backdrop-blur-md hover:border-white/25"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>
                    <span className="block font-bold">{item.title}</span>
                    <span className="block text-sm opacity-60">{item.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
