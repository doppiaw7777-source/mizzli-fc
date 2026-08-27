import { randomBytes } from "crypto";
import { readJson, writeJson } from "./store";

const KEY = "notice-hook";

export async function getNoticeHookToken() {
  const env = String(process.env.NOTICE_WEBHOOK_TOKEN || "").trim();
  if (env) return env;
  const saved = await readJson<{ token?: string }>(KEY, {});
  if (saved.token) return saved.token;
  const token = randomBytes(24).toString("hex");
  await writeJson(KEY, { token });
  return token;
}

export async function rotateNoticeHookToken() {
  const token = randomBytes(24).toString("hex");
  await writeJson(KEY, { token });
  return token;
}

export function hookTokenMatches(given: string, expected: string) {
  const a = String(given || "").trim();
  const b = String(expected || "").trim();
  if (!a || !b || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
