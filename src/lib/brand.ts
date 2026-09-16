export const MIZZLI_CREST = "/api/media/16eafe68-678b-4ec8-9889-02b44185d296";
export const MIZZLI_NAME = "MIZZLI FC";

export function teamCrest(settings?: {
  logoUrl?: string;
  appIconUrl?: string;
} | null) {
  return settings?.appIconUrl || settings?.logoUrl || MIZZLI_CREST;
}

export function clubLogo(settings?: {
  logoUrl?: string;
  appIconUrl?: string;
} | null) {
  return settings?.logoUrl || settings?.appIconUrl || MIZZLI_CREST;
}
