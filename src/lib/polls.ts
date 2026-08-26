import { readJson, writeJson } from "./store";
import { getTeamData, saveTeamData } from "./storage";
import type { Poll } from "./types";

export type PollVote = {
  pollId: string;
  optionId: string;
  voterId: string;
  at: string;
};

type PollVotesStore = { votes: PollVote[] };

async function getVotes(): Promise<PollVotesStore> {
  const raw = await readJson<PollVotesStore>("poll-votes", { votes: [] });
  return { votes: Array.isArray(raw.votes) ? raw.votes : [] };
}

export function myPollVote(votes: PollVote[], pollId: string, voterId?: string | null) {
  if (!voterId) return null;
  return votes.find((v) => v.pollId === pollId && v.voterId === voterId)?.optionId || null;
}

export async function getMyPollVotes(voterId?: string | null) {
  if (!voterId) return {} as Record<string, string>;
  const store = await getVotes();
  const mine: Record<string, string> = {};
  for (const vote of store.votes) {
    if (vote.voterId === voterId) mine[vote.pollId] = vote.optionId;
  }
  return mine;
}

export async function castPollVote(pollId: string, optionId: string, voterId: string) {
  const team = await getTeamData();
  const poll = (team.club.polls || []).find((p) => p.id === pollId);
  if (!poll) throw new Error("Sondaggio non trovato");
  const option = poll.options.find((o) => o.id === optionId);
  if (!option) throw new Error("Opzione non valida");

  const store = await getVotes();
  const prev = store.votes.find((v) => v.pollId === pollId && v.voterId === voterId);
  if (prev?.optionId === optionId) {
    return { poll, mine: optionId };
  }

  if (prev) {
    const old = poll.options.find((o) => o.id === prev.optionId);
    if (old) old.votes = Math.max(0, (old.votes || 0) - 1);
    prev.optionId = optionId;
    prev.at = new Date().toISOString();
  } else {
    store.votes.push({
      pollId,
      optionId,
      voterId,
      at: new Date().toISOString(),
    });
  }
  option.votes = (option.votes || 0) + 1;
  await writeJson("poll-votes", store);
  await saveTeamData(team);
  const saved = (await getTeamData()).club.polls.find((p) => p.id === pollId) as Poll;
  return { poll: saved, mine: optionId };
}
