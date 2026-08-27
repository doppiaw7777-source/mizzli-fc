import type { Sponsor } from "./types";

export const MAX_SPONSORS = 5;

export function visibleSponsors(list: Sponsor[] | null | undefined) {
  return (list || []).filter((s) => s.logoUrl || s.name.trim()).slice(0, MAX_SPONSORS);
}

export function clampSponsors(list: Sponsor[] | null | undefined): Sponsor[] {
  return (list || []).slice(0, MAX_SPONSORS);
}
