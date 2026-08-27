import { randomUUID } from "crypto";
import { readJson, writeJson } from "./store";
import { withRetry } from "./retry";

export type ClubNotice = {
  id: string;
  title: string;
  body: string;
  href: string;
  kind: "callup" | "live" | "news" | "custom";
  createdAt: string;
  idempotencyKey?: string;
  playerIds?: string[];
  playerNames?: string[];
};

const KEY = "notices";

export async function getNotices(): Promise<ClubNotice[]> {
  const list = await withRetry(() => readJson<ClubNotice[]>(KEY, []), 3, 200);
  return list.slice(0, 40);
}

export async function addNotice(input: {
  title: string;
  body?: string;
  href?: string;
  kind?: ClubNotice["kind"];
  idempotencyKey?: string;
  playerIds?: string[];
  playerNames?: string[];
}) {
  const title = String(input.title || "").trim();
  if (!title) return { notice: null as ClubNotice | null, duplicate: false };
  const list = await getNotices();
  const key = String(input.idempotencyKey || "").trim();
  if (key) {
    const existing = list.find((n) => n.idempotencyKey === key);
    if (existing) return { notice: existing, duplicate: true };
  }
  const notice: ClubNotice = {
    id: randomUUID(),
    title,
    body: String(input.body || "").trim(),
    href: input.href || "/",
    kind: input.kind || "custom",
    createdAt: new Date().toISOString(),
    idempotencyKey: key || undefined,
    playerIds: input.playerIds?.filter(Boolean),
    playerNames: input.playerNames?.filter(Boolean),
  };
  const next = [notice, ...list].slice(0, 40);
  await withRetry(() => writeJson(KEY, next), 3, 200);
  return { notice, duplicate: false };
}
