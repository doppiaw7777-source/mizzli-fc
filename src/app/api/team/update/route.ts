import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getTeamData, saveTeamData } from "@/lib/storage";
import type { TeamData } from "@/lib/types";
import { compactTeamData, staffWritableSubset } from "@/lib/roles";
import { requireTeamManagerUser } from "@/lib/user-auth";

async function authorizeAndSanitize(request: NextRequest, body: Partial<TeamData>) {
  try {
    await requireAdmin();
    return { mode: "admin" as const, payload: body };
  } catch {
    const staff = await requireTeamManagerUser();
    return {
      mode: "staff" as const,
      role: staff.role,
      payload: compactTeamData(staffWritableSubset(body, staff.role)) as Partial<TeamData>,
    };
  }
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
    if (mode === "admin") {
      await saveTeamData(payload as TeamData);
      return NextResponse.json(await getTeamData());
    }
    const current = await getTeamData();
    const updated = deepMerge(current, payload) as TeamData;
    await saveTeamData(updated);
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
