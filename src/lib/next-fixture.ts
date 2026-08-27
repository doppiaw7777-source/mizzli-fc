import type { TeamData } from "./types";
import { dateKey, todayKey } from "./dates";
import { getMatchKind, isLeagueFixture } from "./match-kind";

/** Prima partita o amichevole futura, preferendo il campionato. */
export function nextPlayableFixture(data: TeamData) {
  const today = todayKey();
  const upcoming = [...(data.matches || [])]
    .filter((m) => {
      if (getMatchKind(m) === "allenamento") return false;
      if (m.result) return false;
      const d = dateKey(m.date);
      return !d || d >= today;
    })
    .sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)));
  return upcoming.find(isLeagueFixture) || upcoming[0];
}
