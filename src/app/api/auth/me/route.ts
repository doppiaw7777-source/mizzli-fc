import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ADMIN_USERNAME } from "@/lib/admin-credentials";

export async function GET() {
  const session = await getSession();
  const isAdmin =
    !!session &&
    session.username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
  return NextResponse.json({
    authenticated: isAdmin,
    isAdmin,
    user: isAdmin ? session : null,
  });
}
