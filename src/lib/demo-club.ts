import { readJson, writeJson } from "./store";

export const DEMO_KEY = "team-demo";

export type DemoClub = {
  teamName: string;
  motto: string;
  primary: string;
  accent: string;
  players: { name: string; number: number; role: string }[];
  createdAt: string;
};

export function blankDemo(name: string): DemoClub {
  const teamName = name.trim() || "ASD Prova FC";
  return {
    teamName,
    motto: "Solo una prova. MIZZLI non viene toccato.",
    primary: "#0f172a",
    accent: "#f59e0b",
    players: [
      { name: "Portiere Prova", number: 1, role: "POR" },
      { name: "Difensore Prova", number: 4, role: "DIF" },
      { name: "Attaccante Prova", number: 9, role: "ATT" },
    ],
    createdAt: new Date().toISOString(),
  };
}

export async function getDemoClub() {
  return readJson<DemoClub | null>(DEMO_KEY, null);
}

export async function saveDemoClub(club: DemoClub) {
  await writeJson(DEMO_KEY, club);
  return club;
}

export async function deleteDemoClub() {
  await writeJson(DEMO_KEY, null);
}
