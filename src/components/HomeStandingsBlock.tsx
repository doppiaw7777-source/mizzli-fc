"use client";

import StandingsTable from "@/components/StandingsTable";
import MizzliMatchLog from "@/components/MizzliMatchLog";
import { useTeam } from "@/context/TeamContext";

export default function HomeStandingsBlock() {
  const { data } = useTeam();
  if (!data) return null;
  const show = data.settings.ui.showStandings && data.standings?.rows?.length > 0;
  return (
    <>
      {show ? <StandingsTable standings={data.standings} /> : null}
      <MizzliMatchLog data={data} />
    </>
  );
}
