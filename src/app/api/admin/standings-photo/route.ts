import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

function extractJson(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Solo admin" }, { status: 401 });
  }

  const key = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Manca la chiave AI su Render (XAI_API_KEY). Senza quella non posso leggere la foto.",
      },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const image = String(body?.image || "");
  if (!image.startsWith("data:image")) {
    return NextResponse.json({ error: "Carica una foto della classifica" }, { status: 400 });
  }

  const xai = !!(process.env.XAI_API_KEY || process.env.GROK_API_KEY);
  const url = xai ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const model = xai ? "grok-2-vision-latest" : "gpt-4o-mini";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Leggi la classifica di calcio in foto. Rispondi SOLO con JSON array. Ogni oggetto: name, played, won, drawn, lost, goalsFor, goalsAgainst. Numeri interi. Nomi squadra completi. Se vedi GF-GS o reti usa goalsFor e goalsAgainst. Nessun testo extra.",
            },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return NextResponse.json({ error: "Lettura foto non riuscita", detail: err.slice(0, 200) }, { status: 502 });
  }

  const json = await res.json().catch(() => null);
  const text = String(json?.choices?.[0]?.message?.content || "");
  const rows = extractJson(text)
    .filter((r: { name?: string }) => String(r?.name || "").trim())
    .map((r: Record<string, unknown>, i: number) => ({
      id: `st-photo-${i + 1}`,
      name: String(r.name || "").trim(),
      played: Number(r.played) || 0,
      won: Number(r.won) || 0,
      drawn: Number(r.drawn) || 0,
      lost: Number(r.lost) || 0,
      goalsFor: Number(r.goalsFor) || 0,
      goalsAgainst: Number(r.goalsAgainst) || 0,
      isUs: /mizzli/i.test(String(r.name || "")),
    }));

  if (!rows.length) {
    return NextResponse.json({ error: "Non ho letto nessuna riga. Riprova con una foto più nitida." }, { status: 422 });
  }

  return NextResponse.json({ rows });
}
