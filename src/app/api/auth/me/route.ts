import { NextResponse } from "next/server";
import { applyAdminSessionCookie, getSession } from "@/lib/auth";
import { ADMIN_USERNAME } from "@/lib/admin-credentials";

export async function GET(request: Request) {
  const session = await getSession();
  const isAdmin =
    !!session &&
    session.username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();

  const res = NextResponse.json({
    authenticated: isAdmin,
    isAdmin,
    user: isAdmin ? session : null,
  });

  const auth = request.headers.get("authorization");
  if (isAdmin && auth?.startsWith("Bearer ")) {
    applyAdminSessionCookie(res, auth.slice(7), request);
  }
  return res;
}
