export const MIZZLI_CREST = "/brand/mizzli-crest.png";
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
