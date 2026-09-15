import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { answerClubQuestion, type AssistantMessage } from "@/lib/assistant";
import { getTeamData } from "@/lib/storage";

function clubBrief(data: Awaited<ReturnType<typeof getTeamData>>) {
  if (!data) return "";
  const players = (data.players || [])
    .slice(0, 40)
    .map((p) => `${p.number} ${p.name} (${p.role}${p.status && p.status !== "available" ? `/${p.status}` : ""})`)
    .join("; ");
  const next = (data.matches || [])
    .filter((m) => !m.result)
    .slice(0, 5)
    .map((m) => `${m.date} ${m.opponent}`)
    .join("; ");
  return [
    `Squadra: ${data.settings.teamName}`,
    `Modulo: ${data.formation?.scheme || "-"}`,
    `Giocatori: ${players}`,
    `Prossime: ${next || "nessuna"}`,
    `News: ${(data.announcements || []).slice(0, 3).map((n) => n.title).join("; ") || "nessuna"}`,
  ].join("\n");
}

async function modelReply(prompt: string, brief: string) {
  const key = process.env.XAI_API_KEY || process.env.GROK_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return null;
  const xai = !!(process.env.XAI_API_KEY || process.env.GROK_API_KEY);
  const url = xai ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
  const model = xai ? "grok-4-fast" : "gpt-4o-mini";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Sei l'assistente admin di MIZZLI FC. Rispondi in italiano, breve e concreto. Aiuta a gestire rosa, calendario, formazione, convocati, news. Non inventare giocatori. Se manca un dato, dillo.",
        },
        { role: "user", content: `DATI CLUB:\n${brief}\n\nRICHIESTA ADMIN:\n${prompt}` },
      ],
    }),
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  const text = json?.choices?.[0]?.message?.content;
  return typeof text === "string" ? text.trim() : null;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Solo admin" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const message = String(body?.message || "").trim().slice(0, 800);
  const history = (Array.isArray(body?.history) ? body.history : []) as AssistantMessage[];
  if (!message) return NextResponse.json({ error: "Scrivi una domanda" }, { status: 400 });

  const data = await getTeamData();
  if (!data) return NextResponse.json({ error: "Dati squadra assenti" }, { status: 500 });

  const local = answerClubQuestion(data, message, history);
  const live = await modelReply(message, clubBrief(data)).catch(() => null);

  return NextResponse.json({
    text: live || local.text,
    links: local.links || [],
    source: live ? "model" : "club",
  });
}
