"use client";

import StandingsTable from "@/components/StandingsTable";
import MizzliMatchLog from "@/components/MizzliMatchLog";
import { useTeam } from "@/context/TeamContext";
import { useUser } from "@/context/UserContext";
import { canEditStandings } from "@/lib/roles";

export default function HomeStandingsBlock() {
  const { data, isAdmin, updateData } = useTeam();
  const { user } = useUser();
  if (!data) return null;
  const show = data.settings.ui.showStandings && data.standings?.rows?.length > 0;
  return (
    <>
      {show ? (
        <StandingsTable
          standings={data.standings}
          matches={data.matches}
          teamName={data.settings.teamName}
          editable={isAdmin || canEditStandings(user)}
          onSave={async (next) => updateData({ standings: next })}
        />
      ) : null}
      <MizzliMatchLog data={data} />
    </>
  );
}
