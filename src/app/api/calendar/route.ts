import { NextResponse } from "next/server";
import { getTeamData } from "@/lib/storage";
import { dateKey } from "@/lib/dates";
import { getMatchKind, matchPublicTitle } from "@/lib/match-kind";

export async function GET() {
  const data = await getTeamData();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${data.settings.teamName}//Calendario//IT`,
  ];
  for (const m of data.matches) {
    const day = dateKey(m.date).replace(/-/g, "");
    const uid = `${m.id}@mizzli`;
    const kind = getMatchKind(m);
    const summary =
      kind === "partita"
        ? `${data.settings.teamName} vs ${m.opponent}`
        : matchPublicTitle(m);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART:${day}`,
      `SUMMARY:${summary}`,
      `LOCATION:${m.location}`,
      `DESCRIPTION:${[m.competition, m.time].filter(Boolean).join(" ")}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "attachment; filename=calendario.ics",
    },
  });
}
