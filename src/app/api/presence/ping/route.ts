import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserSession } from "@/lib/user-auth";
import { touchPresence } from "@/lib/presence";
import { buildSessionInfo } from "@/lib/session-info";

export async function POST(request: Request) {
  let device: unknown;
  try {
    const body = await request.json();
    device = body?.device ?? body;
  } catch {
    device = undefined;
  }

  const session = await buildSessionInfo(request, device);

  const user = await getUserSession();
  if (user) {
    const phone = user.phone || "";
    await touchPresence({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone,
      session: { ...session, phoneNumber: phone || session.phoneNumber },
    });
    return NextResponse.json({ ok: true });
  }

  const admin = await getSession();
  if (admin) {
    await touchPresence({
      userId: `admin:${admin.username}`,
      email: `${admin.username.toLowerCase()}@admin.local`,
      name: admin.username,
      role: "admin",
      session,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
