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

  // Sempre 200: Render usa healthCheckPath; un 503 qui tiene il servizio in 502.
  // Lo stato DB resta nel body per il monitoraggio.
  return NextResponse.json({
    ok: true,
    app: "MIZZLI FC",
    ts: Date.now(),
    database,
    storage,
  });
}
