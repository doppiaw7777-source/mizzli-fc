import { NextResponse } from "next/server";
import { getTeamData } from "@/lib/storage";

export async function GET() {
  const data = await getTeamData();
  return NextResponse.json(data);
}
