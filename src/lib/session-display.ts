import type { SessionInfo } from "@/lib/session-types";
import { phoneLabel } from "@/lib/phone";

export function locationLine(session?: SessionInfo | null) {
  if (!session) return "Posizione non disponibile";
  const g = session.geo;
  if (!g) {
    if (session.timezone) return session.timezone;
    return session.ip || "sconosciuta";
  }
  const street = [g.street, g.houseNumber].filter(Boolean).join(" ");
  const parts = [street, g.neighbourhood, g.city, g.region, g.country || session.countryHeader].filter(Boolean);
  const label = parts.length ? parts.join(", ") : session.ip || "sconosciuta";
  if (g.source === "gps" && g.accuracyMeters != null) {
    return `${label} · GPS ±${Math.round(g.accuracyMeters)} m`;
  }
  if (g.source === "ip") return `${label} · stimata da IP`;
  return label;
}

export function appLine(session?: SessionInfo | null) {
  if (!session) return "App non disponibile";
  const model = session.phoneModelExact;
  return [model, session.app, session.os, session.browser].filter(Boolean).join(" · ");
}

export function phoneLine(session?: SessionInfo | null, fallback?: string | null) {
  return phoneLabel(session?.phoneNumber || fallback);
}

export function activityOf(session?: SessionInfo | null) {
  return session?.activity || (session?.client?.activity as SessionInfo["activity"] | undefined);
}

export function lookingLine(session?: SessionInfo | null) {
  const a = activityOf(session);
  if (a?.looking) return a.looking;
  if (session?.page) return `Ultima pagina: ${session.page}`;
  return "Ancora nessuna attività";
}

export function windowStateLine(session?: SessionInfo | null) {
  const a = activityOf(session);
  if (a?.windowStateLabel) return a.windowStateLabel;
  if (session?.client && session.client.documentHidden === true) {
    return "Ha lasciato l'app (un'altra scheda, finestra o app)";
  }
  return "Stato finestra non disponibile";
}
