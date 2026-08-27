import { randomUUID } from "crypto";
import { readJson, writeJson } from "./store";

export type ClubNotice = {
  id: string;
  title: string;
  body: string;
  href: string;
  kind: "callup" | "live" | "news" | "custom";
  createdAt: string;
};

const KEY = "notices";

export async function getNotices(): Promise<ClubNotice[]> {
  const list = await readJson<ClubNotice[]>(KEY, []);
  return list.slice(0, 40);
}

export async function addNotice(input: {
  title: string;
  body?: string;
  href?: string;
  kind?: ClubNotice["kind"];
}) {
  const title = String(input.title || "").trim();
  if (!title) return null;
  const notice: ClubNotice = {
    id: randomUUID(),
    title,
    body: String(input.body || "").trim(),
    href: input.href || "/",
    kind: input.kind || "custom",
    createdAt: new Date().toISOString(),
  };
  const list = await getNotices();
  const next = [notice, ...list].slice(0, 40);
  await writeJson(KEY, next);
  return notice;
}
