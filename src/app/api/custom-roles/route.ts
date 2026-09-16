import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { readJson, writeJson } from "@/lib/store";
import { ALL_GRANTS, type UserGrant } from "@/lib/permissions";

export type CustomRole = { id: string; name: string; grants: UserGrant[] };

const KEY = "custom-roles";
const allowed = new Set(ALL_GRANTS.map((g) => g.id));

function cleanGrants(input: unknown): UserGrant[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((g): g is UserGrant => allowed.has(g as UserGrant)))];
}

async function listRoles(): Promise<CustomRole[]> {
  return (await readJson<CustomRole[]>(KEY, [])) || [];
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  return NextResponse.json({ roles: await listRoles() });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Dai un nome al ruolo" }, { status: 400 });
  }
  const roles = await listRoles();
  const existing = roles.find((r) => r.id === body?.id);
  if (existing) {
    existing.name = name;
    existing.grants = cleanGrants(body?.grants);
  } else {
    roles.push({ id: randomUUID(), name, grants: cleanGrants(body?.grants) });
  }
  await writeJson(KEY, roles);
  return NextResponse.json({ ok: true, roles });
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const id = String(body?.id || "").trim();
  const roles = (await listRoles()).filter((r) => r.id !== id);
  await writeJson(KEY, roles);
  return NextResponse.json({ ok: true, roles });
}
