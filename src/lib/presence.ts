import type { SessionInfo } from "@/lib/session-types";
import type { LiveActivity, LiveAction } from "@/lib/live-activity";
import { readJson, writeJson } from "./store";

export interface PresenceEntry {
  userId: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  lastSeenAt: string;
  forceOffline?: boolean;
  session?: SessionInfo;
}

export async function getPresence(): Promise<PresenceEntry[]> {
  return readJson<PresenceEntry[]>("presence", []);
}

export async function savePresence(list: PresenceEntry[]) {
  await writeJson("presence", list);
}

function mergeActions(prev?: LiveAction[], next?: LiveAction[]) {
  const map = new Map<string, LiveAction>();
  for (const item of [...(prev || []), ...(next || [])]) {
    if (!item?.at || !item?.text) continue;
    map.set(`${item.at}|${item.text}`, item);
  }
  return [...map.values()]
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(-40);
}

function mergeActivity(prev?: SessionInfo, next?: SessionInfo): LiveActivity | undefined {
  const a = next?.activity || (next?.client?.activity as LiveActivity | undefined);
  const b = prev?.activity || (prev?.client?.activity as LiveActivity | undefined);
  if (!a && !b) return undefined;
  const base = a || b;
  if (!base) return undefined;
  return {
    ...base,
    actions: mergeActions(b?.actions, a?.actions),
  };
}

function keepPhone(prev?: string, next?: string) {
  const n = String(next || "").trim();
  if (n) return n;
  return String(prev || "").trim();
}

function mergeSession(prev?: SessionInfo, next?: SessionInfo): SessionInfo | undefined {
  if (!next) return prev;
  const activity = mergeActivity(prev, next);
  const withExtras = (session: SessionInfo): SessionInfo => ({
    ...session,
    phoneNumber: keepPhone(prev?.phoneNumber, next.phoneNumber) || session.phoneNumber,
    activity: activity || session.activity,
    page: next.page || session.page,
  });
  if (!prev) return withExtras(next);
  if (next.geo?.source === "gps") {
    const prevAcc = prev.geo?.source === "gps" ? prev.geo.accuracyMeters ?? 999 : 999;
    const nextAcc = next.geo.accuracyMeters ?? 999;
    if (prev.geo?.source === "gps" && prevAcc + 0.5 < nextAcc) {
      return withExtras({ ...next, geo: prev.geo });
    }
    return withExtras(next);
  }
  if (prev.geo?.source === "gps") {
    return withExtras({ ...next, geo: prev.geo });
  }
  return withExtras(next);
}

export async function touchPresence(
  entry: Omit<PresenceEntry, "lastSeenAt" | "forceOffline">
) {
  const list = await getPresence();
  const now = new Date().toISOString();
  const idx = list.findIndex((x) => x.userId === entry.userId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      ...entry,
      phone: keepPhone(list[idx].phone, entry.phone),
      session: mergeSession(list[idx].session, entry.session),
      lastSeenAt: now,
      forceOffline: false,
    };
  } else {
    list.push({ ...entry, lastSeenAt: now, forceOffline: false });
  }
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const cleaned = list.filter((x) => new Date(x.lastSeenAt).getTime() >= dayAgo);
  await savePresence(cleaned);
}

export async function setPresenceOffline(userId: string) {
  const list = await getPresence();
  const idx = list.findIndex((x) => x.userId === userId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      forceOffline: true,
      lastSeenAt: new Date().toISOString(),
    };
    await savePresence(list);
  }
}

export function withStatus(list: PresenceEntry[]) {
  const now = Date.now();
  return list
    .map((x) => {
      const diffSec = Math.floor((now - new Date(x.lastSeenAt).getTime()) / 1000);
      const activeByHeartbeat = diffSec <= 180;
      return {
        ...x,
        online: !x.forceOffline && activeByHeartbeat,
        secondsSinceSeen: Math.max(0, diffSec),
      };
    })
    .sort((a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name, "it"));
}
