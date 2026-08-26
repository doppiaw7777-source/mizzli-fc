import { NextResponse } from "next/server";
import { getUserSession, updateUserPhone } from "@/lib/user-auth";

export async function GET() {
  const user = await getUserSession();
  return NextResponse.json({ authenticated: !!user, user });
}

export async function PATCH(request: Request) {
  const user = await getUserSession();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    const updated = await updateUserPhone(
      user.id,
      String(body?.phone || ""),
      String(body?.smsCode || "")
    );
    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Numero non aggiornato";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
