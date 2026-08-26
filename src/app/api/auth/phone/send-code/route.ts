import { NextResponse } from "next/server";
import { getUserSession, isValidEmail } from "@/lib/user-auth";
import { findUserByEmail, findUserByPhone } from "@/lib/users";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { sendPhoneCode, type OtpPurpose } from "@/lib/phone-otp";

function clientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    ""
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const purpose = (body?.purpose === "update" ? "update" : "register") as OtpPurpose;
  const phone = String(body?.phone || "");
  const email = String(body?.email || "").trim().toLowerCase();

  try {
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Inserisci un numero di cellulare valido" },
        { status: 400 }
      );
    }
    const digits = normalizePhone(phone);
    const taken = await findUserByPhone(digits);

    if (purpose === "register") {
      if (email && isValidEmail(email)) {
        const existing = await findUserByEmail(email);
        if (existing) {
          return NextResponse.json(
            { error: "Questa email è già registrata. Accedi." },
            { status: 400 }
          );
        }
      }
      if (taken) {
        return NextResponse.json(
          { error: "Questo numero è già associato a un account. Accedi." },
          { status: 400 }
        );
      }
    } else {
      const user = await getUserSession();
      if (!user) {
        return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
      }
      if (taken && taken.id !== user.id) {
        return NextResponse.json(
          { error: "Questo numero è già associato a un account" },
          { status: 400 }
        );
      }
    }

    const result = await sendPhoneCode(phone, purpose, clientIp(request));
    return NextResponse.json({
      ok: true,
      retryAfter: result.retryAfter,
      message:
        (result as { message?: string }).message ||
        "Ti abbiamo inviato un SMS con il codice.",
      demoCode: (result as { demoCode?: string }).demoCode || "",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invio SMS non riuscito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
