import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { requireTeamManagerUser } from "@/lib/user-auth";
import { saveUploadedImage } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireUploader() {
  try {
    await requireAdmin();
  } catch {
    await requireTeamManagerUser();
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUploader();
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const dataUrl = body.dataUrl as string | undefined;
      if (!dataUrl?.startsWith("data:image/")) {
        return NextResponse.json({ error: "Immagine non valida" }, { status: 400 });
      }
      const match = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: "Formato base64 non valido" }, { status: 400 });
      }
      const ext = match[1].split("/")[1]?.replace("jpeg", "jpg") || "png";
      const buffer = Buffer.from(match[2], "base64");
      const url = await saveUploadedImage(buffer, `upload.${ext}`);
      return NextResponse.json({ url });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Nessun file selezionato" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Solo immagini consentite" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveUploadedImage(buffer, file.name);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Non autorizzato";
    if (
      message === "Unauthorized" ||
      /non autenticato|non autorizzato|sessione/i.test(message)
    ) {
      return NextResponse.json(
        { error: "Sessione scaduta. Esci e rientra in Admin." },
        { status: 401 }
      );
    }
    console.error("upload failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Errore upload" },
      { status: 500 }
    );
  }
}
