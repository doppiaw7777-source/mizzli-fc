import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { setPresenceOffline } from "@/lib/presence";
import { getUserSession } from "@/lib/user-auth";

export async function POST() {
  const user = await getUserSession();
  if (user) {
    await setPresenceOffline(user.id);
    return NextResponse.json({ ok: true });
  }

  const admin = await getSession();
  if (admin) {
    await setPresenceOffline(`admin:${admin.username}`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
