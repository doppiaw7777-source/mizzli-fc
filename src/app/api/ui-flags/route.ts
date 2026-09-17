import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readJson, writeJson } from "@/lib/store";

const KEY = "ui-flags";

export type UiFlags = {
  showCrestGoldRing: boolean;
  showRosaMiniBadge: boolean;
};

const defaults: UiFlags = {
  showCrestGoldRing: true,
  showRosaMiniBadge: false,
};

export async function GET() {
  const saved = (await readJson<Partial<UiFlags>>(KEY, defaults)) || defaults;
  return NextResponse.json({
    showCrestGoldRing: saved.showCrestGoldRing !== false,
    showRosaMiniBadge: !!saved.showRosaMiniBadge,
  });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const current = (await readJson<UiFlags>(KEY, defaults)) || defaults;
  const next: UiFlags = {
    showCrestGoldRing:
      body.showCrestGoldRing === undefined ? current.showCrestGoldRing !== false : !!body.showCrestGoldRing,
    showRosaMiniBadge:
      body.showRosaMiniBadge === undefined ? !!current.showRosaMiniBadge : !!body.showRosaMiniBadge,
  };
  await writeJson(KEY, next);
  return NextResponse.json(next);
}
