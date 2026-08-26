import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/user-auth";
import { castPollVote, getMyPollVotes } from "@/lib/polls";

export async function GET() {
  const user = await getUserSession();
  const mine = await getMyPollVotes(user?.id);
  return NextResponse.json({ loggedIn: !!user, mine });
}

export async function POST(request: Request) {
  const user = await getUserSession();
  if (!user) {
    return NextResponse.json({ error: "Accedi per votare i sondaggi" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const pollId = String(body?.pollId || "").trim();
  const optionId = String(body?.optionId || "").trim();
  if (!pollId || !optionId) {
    return NextResponse.json({ error: "Sondaggio e opzione obbligatori" }, { status: 400 });
  }
  try {
    const result = await castPollVote(pollId, optionId, user.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Voto non salvato";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
