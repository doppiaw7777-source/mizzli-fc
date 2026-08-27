import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { getUsers, saveUsers, toPublicUser } from "@/lib/users";
import { hashPassword, isValidEmail, validatePassword } from "@/lib/user-auth";
import type { AppUser, UserRole } from "@/lib/types";

function isUserRole(value: unknown): value is UserRole {
  return (
    value === "fan" ||
    value === "player" ||
    value === "coach" ||
    value === "assistant_coach" ||
    value === "team_manager"
  );
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

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const role = body?.role;
  if (name.length < 2) {
    return NextResponse.json({ error: "Inserisci il nome" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }
  if (!isUserRole(role) || role === "fan") {
    return NextResponse.json(
      { error: "Scegli un ruolo: giocatore, allenatore o vice" },
      { status: 400 }
    );
  }
  const pwdError = validatePassword(password);
  if (pwdError) {
    return NextResponse.json({ error: pwdError }, { status: 400 });
  }
  const users = await getUsers();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "Questa email e gia registrata" }, { status: 409 });
  }
  const user: AppUser = {
    id: randomUUID(),
    email,
    name,
    passwordHash: await hashPassword(password),
    googleId: null,
    photoUrl: "",
    provider: "email",
    role,
    createdAt: new Date().toISOString(),
    phone: "",
    phoneVerified: false,
  };
  users.push(user);
  await saveUsers(users);
  return NextResponse.json({ ok: true, user: toPublicUser(user) });
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
