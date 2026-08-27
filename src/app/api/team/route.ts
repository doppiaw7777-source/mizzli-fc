import { NextResponse } from "next/server";
import { getTeamData } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getTeamData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
