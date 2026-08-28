import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getTeamData, saveTeamData } from "@/lib/storage";
import type { ClubEvent, Match, TeamData } from "@/lib/types";
import { compactTeamData, staffWritableSubset } from "@/lib/roles";
import { requireStaffUser } from "@/lib/user-auth";
import { addNotice } from "@/lib/notices";
import { matchPublicDetail, matchPublicTitle } from "@/lib/match-kind";

export const dynamic = "force-dynamic";

async function authorizeAndSanitize(request: NextRequest, body: Partial<TeamData>) {
  try {
    await requireAdmin();
    return { mode: "admin" as const, payload: body };
  } catch {
    const staff = await requireStaffUser();
    return {
      mode: "staff" as const,
      role: staff.role,
      payload: compactTeamData(staffWritableSubset(body, staff.role)) as Partial<TeamData>,
    };
  }
}

function stamp(m: Match) {
  return `${m.date}|${m.time || ""}|${m.opponent || ""}|${m.venue || ""}|${m.kickoffNote || ""}`;
}

async function notifyCalendarChanges(before: TeamData, after: TeamData) {
  const prevMatches = new Map((before.matches || []).map((m) => [m.id, m]));
  const nextMatches = after.matches || [];
  let sent = 0;
  for (const match of nextMatches) {
    if (sent >= 6) break;
    const old = prevMatches.get(match.id);
    const title = matchPublicTitle(match);
    const detail = matchPublicDetail(match);
    if (!old) {
      await addNotice({
        title,
        body: detail,
        href: `/partita/${match.id}`,
        kind: "news",
        idempotencyKey: `match-new-${match.id}`,
      });
      sent += 1;
      continue;
    }
    if (stamp(old) !== stamp(match)) {
      await addNotice({
        title: `Aggiornato: ${title}`,
        body: detail,
        href: `/partita/${match.id}`,
        kind: "news",
        idempotencyKey: `match-upd-${match.id}-${stamp(match)}`,
      });
      sent += 1;
    }
  }

  const prevEvents = new Map(((before.club?.events || []) as ClubEvent[]).map((e) => [e.id, e]));
  const nextEvents = (after.club?.events || []) as ClubEvent[];
  for (const event of nextEvents) {
    if (sent >= 8) break;
    const old = prevEvents.get(event.id);
    const when = [event.date, event.place].filter(Boolean).join(" · ");
    if (!old) {
      await addNotice({
        title: event.title || "Nuovo evento",
        body: when,
        href: "/calendario",
        kind: "news",
        idempotencyKey: `event-new-${event.id}`,
      });
      sent += 1;
      continue;
    }
    if (old.date !== event.date || old.place !== event.place || old.title !== event.title) {
      await addNotice({
        title: `Aggiornato: ${event.title}`,
        body: when,
        href: "/calendario",
        kind: "news",
        idempotencyKey: `event-upd-${event.id}-${event.date}-${event.place || ""}`,
      });
      sent += 1;
    }
  }
}

async function notifyCallupIfPublished(before: TeamData, after: TeamData) {
  const prev = before.club?.callupPublishedAt || "";
  const next = after.club?.callupPublishedAt || "";
  const ids = after.club?.callupPlayerIds || [];
  if (!next || next === prev || ids.length === 0) return;
  const names = after.players
    .filter((p) => ids.includes(p.id))
    .map((p) => p.name);
  await addNotice({
    title: `Convocati · ${ids.length}`,
    body: names.join(", "),
    href: "/convocati",
    kind: "callup",
    idempotencyKey: `callup-${next}`,
    playerIds: ids,
    playerNames: names,
  });
}

async function notifyChanges(before: TeamData, after: TeamData) {
  await notifyCallupIfPublished(before, after);
  await notifyCalendarChanges(before, after);
}

function isAuthError(err: unknown) {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return (
    msg.includes("non autenticato") ||
    msg.includes("non autorizzato") ||
    msg.includes("unauthorized") ||
    msg.includes("accesso negato") ||
    msg.includes("sessione")
  );
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as TeamData;
    const { mode, payload } = await authorizeAndSanitize(request, body);
    const current = await getTeamData();
    if (mode === "admin") {
      await saveTeamData(payload as TeamData);
      const saved = await getTeamData();
      await notifyChanges(current, saved);
      return NextResponse.json(saved);
    }
    const updated = deepMerge(current, payload) as TeamData;
    await saveTeamData(updated);
    await notifyChanges(current, updated);
    return NextResponse.json(updated);
  } catch (err) {
    if (isAuthError(err)) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Salvataggio non riuscito";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const partial = (await request.json()) as Partial<TeamData>;
    const { payload } = await authorizeAndSanitize(request, partial);
    const current = await getTeamData();
    const updated = deepMerge(current, payload) as TeamData;
    await saveTeamData(updated);
    await notifyChanges(current, updated);
    return NextResponse.json(updated);
  } catch (err) {
    if (isAuthError(err)) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Salvataggio non riuscito";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function deepMerge(target: unknown, source: unknown): unknown {
  if (
    typeof target !== "object" ||
    target === null ||
    typeof source !== "object" ||
    source === null
  ) {
    return source;
  }

  const result = { ...target } as Record<string, unknown>;
  for (const key of Object.keys(source as Record<string, unknown>)) {
    const srcVal = (source as Record<string, unknown>)[key];
    if (srcVal === undefined) continue;
    const tgtVal = result[key];
    if (
      typeof srcVal === "object" &&
      srcVal !== null &&
      !Array.isArray(srcVal) &&
      typeof tgtVal === "object" &&
      tgtVal !== null &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal, srcVal);
    } else {
      result[key] = srcVal;
    }
  }
  return result;
}
