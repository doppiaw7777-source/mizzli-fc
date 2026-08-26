import type { SessionInfo } from "@/lib/session-types";
import { readJson, writeJson } from "./store";

export interface AuthAuditEntry {
  at: string;
  channel: "admin" | "user";
  identifier: string;
  ok: boolean;
  role: string;
  reason?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  session?: SessionInfo;
}

export async function readAuthAudit(): Promise<AuthAuditEntry[]> {
  try {
    return await readJson<AuthAuditEntry[]>("auth-audit", []);
  } catch {
    return [];
  }
}

export async function appendAuthAudit(entry: AuthAuditEntry) {
  const list = await readAuthAudit();
  const next = [entry, ...list].slice(0, 200);
  await writeJson("auth-audit", next);
}
