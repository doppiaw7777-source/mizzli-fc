import { NextResponse } from "next/server";
import { getStorageBackend } from "@/lib/blob-storage";
import { isDatabaseEnabled } from "@/lib/db/pool";
import { importJsonFilesIfEmpty } from "@/lib/db/migrate";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "connected" | "disabled" | "error" = "disabled";
  let storage = getStorageBackend();

  if (isDatabaseEnabled()) {
    try {
      await importJsonFilesIfEmpty();
      database = "connected";
    } catch {
      database = "error";
    }
  }

  const ok = database !== "error";

  return NextResponse.json(
    {
      ok,
      app: "MIZZLI FC",
      ts: Date.now(),
      database,
      storage,
    },
    { status: ok ? 200 : 503 }
  );
}
