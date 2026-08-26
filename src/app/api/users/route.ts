import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getUsers, saveUsers, toPublicUser } from "@/lib/users";
import type { UserRole } from "@/lib/types";

function isUserRole(value: unknown): value is UserRole {
  return value === "fan" || value === "coach" || value === "assistant_coach" || value === "team_manager";
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const users = await getUsers();
  return NextResponse.json({
    users: users.map((u) => ({
      ...toPublicUser(u),
      createdAt: u.createdAt,
    })),
  });
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const id = String(body?.id || "").trim();
  const role = body?.role;
  if (!id || !isUserRole(role)) {
    return NextResponse.json({ error: "Utente o ruolo non valido" }, { status: 400 });
  }
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  if (!user) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }
  user.role = role;
  await saveUsers(users);
  return NextResponse.json({ ok: true, user: toPublicUser(user) });
}
