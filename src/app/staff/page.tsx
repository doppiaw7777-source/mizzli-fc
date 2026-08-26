"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import AdminPanel, { type AdminTab } from "@/components/AdminPanel";
import { useTeam } from "@/context/TeamContext";
import { useUser } from "@/context/UserContext";
import { apiFetch } from "@/lib/api";
import {
  ROLE_BLURBS,
  ROLE_LABELS,
  canAccessStaff,
  isCoachRole,
  staffPanelTabs,
} from "@/lib/roles";
import type { TeamData } from "@/lib/types";

export default function StaffPage() {
  const { data, refresh } = useTeam();
  const { user, loading, logout } = useUser();
  const router = useRouter();
  const allowed = !loading && canAccessStaff(user);
  const tabs = user ? (staffPanelTabs(user.role) as AdminTab[]) : [];

  useEffect(() => {
    if (!loading && !user) router.replace("/accedi");
  }, [loading, user, router]);

  if (loading || !data) {
    return (
      <AppShell page="admin">
        <p className="text-center opacity-70">Caricamento area staff...</p>
      </AppShell>
    );
  }

  if (!allowed) {
    return (
      <AppShell page="admin">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-8 text-center">
          <h1 className="text-3xl font-black">Area staff protetta</h1>
          <p className="mt-3 opacity-70">
            Il mister gestisce formazione, convocati e live. Il team manager gestisce multe, documenti ed eventi. I tifosi votano e leggono dal profilo.
          </p>
        </div>
      </AppShell>
    );
  }

  const handleSave = async (teamData: TeamData) => {
    const res = await apiFetch("/api/team/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamData),
    });
    if (res.ok) {
      await refresh();
      router.refresh();
    }
    return res.ok;
  };

  return (
    <AppShell page="admin">
      <div className="space-y-6">
        <p className="text-sm opacity-70">{ROLE_BLURBS[user!.role]}</p>
        <AdminPanel
          data={data}
          onSave={handleSave}
          onLogout={async () => {
            await logout();
            router.push("/");
          }}
          allowedTabs={tabs}
          limitedClubTab={isCoachRole(user!.role)}
          title={`Area ${ROLE_LABELS[user!.role]}`}
        />
      </div>
    </AppShell>
  );
}
