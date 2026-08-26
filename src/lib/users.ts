import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { AppUser } from "./types";
import { readJson, writeJson } from "./store";

const PRESET_USERS = [
  {
    email: "tifoso@mizzlifc.app",
    name: "Tifoso Mizzli",
    password: "Tifoso2026",
    role: "fan" as const,
  },
  {
    email: "mister@mizzlifc.app",
    name: "Mister",
    password: "Mister2026",
    role: "coach" as const,
  },
  {
    email: "vicemister@mizzlifc.app",
    name: "Vice Mister",
    password: "ViceMister2026",
    role: "assistant_coach" as const,
  },
  {
    email: "teammanager@mizzlifc.app",
    name: "Team Manager",
    password: "TeamManager2026",
    role: "team_manager" as const,
  },
];

async function seedPrivilegedUsers(users: AppUser[]) {
  let changed = false;
  for (const preset of PRESET_USERS) {
    const user = users.find((u) => u.email.toLowerCase() === preset.email.toLowerCase());
    if (!user) {
      users.push({
        id: randomUUID(),
        email: preset.email,
        name: preset.name,
        passwordHash: await bcrypt.hash(preset.password, 12),
        googleId: null,
        photoUrl: "",
        provider: "email",
        role: preset.role,
        createdAt: new Date().toISOString(),
        phone: "",
        phoneVerified: false,
      });
      changed = true;
      continue;
    }
    if (user.role !== preset.role) {
      user.role = preset.role;
      changed = true;
    }
  }
  return changed;
}

export async function getUsers(): Promise<AppUser[]> {
  let users = await readJson<AppUser[]>("users", []);

  users = users.map((u) => ({
    ...u,
    role: u.role || "fan",
    phone: u.phone || "",
    phoneVerified: Boolean(u.phoneVerified && u.phone),
  }));
  const changed = await seedPrivilegedUsers(users);
  if (changed || users.length === 0) {
    await writeJson("users", users);
  }
  return users;
}

export async function saveUsers(users: AppUser[]) {
  await writeJson("users", users);
}

export async function findUserByEmail(email: string) {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserByGoogleId(googleId: string) {
  const users = await getUsers();
  return users.find((u) => u.googleId === googleId) || null;
}

export async function findUserById(id: string) {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function findUserByPhone(phone: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return null;
  const users = await getUsers();
  return (
    users.find((u) => (u.phone || "").replace(/\D/g, "") === digits && u.phone) || null
  );
}

export async function upsertUser(user: AppUser) {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  await saveUsers(users);
  return user;
}

export function toPublicUser(user: AppUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl,
    provider: user.provider,
    role: user.role,
    phone: user.phone || "",
    phoneVerified: Boolean(user.phoneVerified && user.phone),
  };
}
