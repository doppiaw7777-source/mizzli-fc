import type { Sponsor, SponsorTier } from "./types";

export const MAX_MAIN_SPONSORS = 8;
export const MAX_PARTNER_SPONSORS = 100;
export const MAX_SPONSORS = MAX_MAIN_SPONSORS + MAX_PARTNER_SPONSORS;

export function sponsorTier(s: Sponsor): SponsorTier {
  return s.tier === "partner" ? "partner" : "main";
}

export function isFilledSponsor(s: Sponsor) {
  return Boolean(s.logoUrl || (s.name && s.name.trim()));
}

export function mainSponsors(list: Sponsor[] | null | undefined) {
  return (list || [])
    .filter((s) => sponsorTier(s) === "main" && isFilledSponsor(s))
    .slice(0, MAX_MAIN_SPONSORS);
}

export function partnerSponsors(list: Sponsor[] | null | undefined) {
  return (list || [])
    .filter((s) => sponsorTier(s) === "partner" && isFilledSponsor(s))
    .slice(0, MAX_PARTNER_SPONSORS);
}

/** Banner principale: solo main sponsor. */
export function visibleSponsors(list: Sponsor[] | null | undefined) {
  return mainSponsors(list);
}

export function clampSponsors(list: Sponsor[] | null | undefined): Sponsor[] {
  const all = list || [];
  const mains = all.filter((s) => sponsorTier(s) === "main").slice(0, MAX_MAIN_SPONSORS);
  const partners = all.filter((s) => sponsorTier(s) === "partner").slice(0, MAX_PARTNER_SPONSORS);
  return [...mains, ...partners];
}
