import { MIZZLI_CREST } from "./brand";
import { friendlyOpponent, getMatchKind } from "./match-kind";
import type { ClubTeam, TeamData } from "./types";

export function clubNameKey(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\b(fc|asd|us|ss|ac|calcio|united|club)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function teamInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((w) => w && !/^(fc|asd|us|ss|ac)$/i.test(w));
  const letters = (parts.length ? parts : name.trim().split(/\s+/))
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
  return letters || "FC";
}

export function isOurClub(data: TeamData, name: string) {
  return clubNameKey(name) === clubNameKey(data.settings?.teamName || "MIZZLI FC");
}

function catalog(data: TeamData): ClubTeam[] {
  return Array.isArray(data.teams) ? data.teams : [];
}

export function resolveTeamLogo(data: TeamData, name: string): string {
  const key = clubNameKey(name);
  if (!key) return "";
  if (isOurClub(data, name)) {
    return (
      data.settings?.logoUrl ||
      catalog(data).find((t) => clubNameKey(t.name) === key)?.logoUrl ||
      MIZZLI_CREST
    );
  }
  const fromCatalog = catalog(data).find((t) => clubNameKey(t.name) === key)?.logoUrl;
  if (fromCatalog) return fromCatalog;
  const row = data.standings?.rows?.find((r) => clubNameKey(r.name) === key);
  if (row?.logoUrl) return row.logoUrl;
  const match = data.matches?.find(
    (m) => clubNameKey(m.opponent) === key && m.opponentLogoUrl
  );
  return match?.opponentLogoUrl || "";
}

export type ListedClubTeam = {
  name: string;
  logoUrl: string;
  isUs: boolean;
};

export function listClubTeams(data: TeamData): ListedClubTeam[] {
  const map = new Map<string, ListedClubTeam>();
  const put = (raw: string, logo: string, isUs = false) => {
    const name = (raw || "").trim();
    if (!name || /^allenamento$/i.test(name) || /^amichevole$/i.test(name)) return;
    const key = clubNameKey(name);
    if (!key) return;
    const prev = map.get(key);
    const ours = isUs || prev?.isUs || false;
    map.set(key, {
      name: ours ? data.settings.teamName || name : prev?.name || name,
      logoUrl: logo || prev?.logoUrl || "",
      isUs: ours,
    });
  };

  put(data.settings?.teamName || "MIZZLI FC", data.settings?.logoUrl || "", true);
  for (const team of catalog(data)) put(team.name, team.logoUrl || "");
  for (const row of data.standings?.rows || []) put(row.name, row.logoUrl || "", row.isUs);
  for (const match of data.matches || []) {
    if (getMatchKind(match) === "allenamento") continue;
    const opp =
      getMatchKind(match) === "amichevole"
        ? friendlyOpponent(match) || match.opponent
        : match.opponent;
    put(opp, match.opponentLogoUrl || "");
  }

  return [...map.values()].sort((a, b) => {
    if (a.isUs !== b.isUs) return a.isUs ? -1 : 1;
    return a.name.localeCompare(b.name, "it");
  });
}

export function setTeamLogo(data: TeamData, name: string, logoUrl: string): TeamData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  const key = clubNameKey(trimmed);
  const ours = isOurClub(data, trimmed);
  const nextTeams = [...catalog(data)];
  const idx = nextTeams.findIndex((t) => clubNameKey(t.name) === key);
  if (idx >= 0) {
    nextTeams[idx] = {
      ...nextTeams[idx],
      name: ours ? data.settings.teamName : trimmed,
      logoUrl,
    };
  } else {
    nextTeams.push({
      id: `tm-${key || Date.now()}`,
      name: ours ? data.settings.teamName : trimmed,
      logoUrl,
    });
  }

  return {
    ...data,
    teams: nextTeams,
    settings: ours ? { ...data.settings, logoUrl } : data.settings,
    matches: data.matches.map((m) =>
      clubNameKey(m.opponent) === key ? { ...m, opponentLogoUrl: logoUrl } : m
    ),
    standings: {
      ...data.standings,
      rows: data.standings.rows.map((row) =>
        clubNameKey(row.name) === key ? { ...row, logoUrl } : row
      ),
    },
  };
}

export function renameClubTeam(data: TeamData, from: string, to: string): TeamData {
  const nextName = to.trim();
  if (!from.trim() || !nextName || clubNameKey(from) === clubNameKey(nextName)) {
    if (!nextName) return data;
    return {
      ...data,
      standings: {
        ...data.standings,
        rows: data.standings.rows.map((row) =>
          clubNameKey(row.name) === clubNameKey(from) ? { ...row, name: nextName } : row
        ),
      },
    };
  }
  const key = clubNameKey(from);
  const ours = isOurClub(data, from);
  const storedLogo =
    catalog(data).find((t) => clubNameKey(t.name) === key)?.logoUrl ||
    data.standings.rows.find((r) => clubNameKey(r.name) === key)?.logoUrl ||
    (ours ? data.settings.logoUrl : "") ||
    "";
  const renamed: TeamData = {
    ...data,
    settings: ours ? { ...data.settings, teamName: nextName } : data.settings,
    teams: catalog(data).map((t) =>
      clubNameKey(t.name) === key ? { ...t, name: nextName } : t
    ),
    matches: data.matches.map((m) =>
      clubNameKey(m.opponent) === key ? { ...m, opponent: nextName } : m
    ),
    standings: {
      ...data.standings,
      rows: data.standings.rows.map((row) =>
        clubNameKey(row.name) === key ? { ...row, name: nextName, isUs: ours } : row
      ),
    },
  };
  return storedLogo ? setTeamLogo(renamed, nextName, storedLogo) : renamed;
}

/** Attach a crest to a classifica row. Works even before the team has a name. */
export function setStandingRowLogo(data: TeamData, rowId: string, logoUrl: string): TeamData {
  const row = data.standings.rows.find((r) => r.id === rowId);
  if (!row) return data;
  const name = row.isUs || isOurClub(data, row.name) ? data.settings.teamName : row.name.trim();
  if (name) return setTeamLogo(data, name, logoUrl);
  return {
    ...data,
    standings: {
      ...data.standings,
      rows: data.standings.rows.map((r) => (r.id === rowId ? { ...r, logoUrl } : r)),
    },
  };
}

function ensureCatalogEntry(data: TeamData, name: string, logoUrl = ""): TeamData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  if (logoUrl) return setTeamLogo(data, trimmed, logoUrl);
  const key = clubNameKey(trimmed);
  const teams = [...catalog(data)];
  if (teams.some((t) => clubNameKey(t.name) === key)) return data;
  teams.push({ id: `tm-${key || Date.now()}`, name: trimmed, logoUrl: "" });
  return { ...data, teams };
}

/** Commit a classifica team name, including first-time naming after the logo. */
export function setStandingTeamName(data: TeamData, rowId: string, nextName: string): TeamData {
  const row = data.standings.rows.find((r) => r.id === rowId);
  if (!row) return data;
  if (row.isUs || isOurClub(data, row.name)) return data;
  const prev = row.name;
  const next = nextName.trim();
  if (!next) {
    return {
      ...data,
      standings: {
        ...data.standings,
        rows: data.standings.rows.map((r) => (r.id === rowId ? { ...r, name: "" } : r)),
      },
    };
  }
  if (prev.trim() && clubNameKey(prev) !== clubNameKey(next)) {
    return ensureCatalogEntry(renameClubTeam(data, prev, next), next, row.logoUrl || "");
  }
  const withName: TeamData = {
    ...data,
    standings: {
      ...data.standings,
      rows: data.standings.rows.map((r) => (r.id === rowId ? { ...r, name: next } : r)),
    },
  };
  return ensureCatalogEntry(withName, next, row.logoUrl || "");
}
