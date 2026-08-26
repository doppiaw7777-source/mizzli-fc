"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ASSISTANT_PROMPTS,
  answerClubQuestion,
  welcomeMessage,
  type AssistantLink,
  type AssistantMessage,
} from "@/lib/assistant";
import { MIZZLI_NAME } from "@/lib/brand";
import { playClickSound } from "@/lib/sound";
import { useTeam } from "@/context/TeamContext";

type ChatItem = AssistantMessage & { links?: AssistantLink[] };

export function AssistantThread({
  variant = "sheet",
}: {
  variant?: "sheet" | "page";
}) {
  const { data } = useTeam();
  const name = data?.settings.teamName || MIZZLI_NAME;
  const intro = welcomeMessage(name);
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shown = messages.length > 0 ? messages : [{ role: "assistant" as const, ...intro }];

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function send(raw: string) {
    const text = raw.trim();
    if (!text) return;
    if (!data) return;
    const history = shown.map(({ role, text: t }) => ({ role, text: t }));
    const answer = answerClubQuestion(data, text, history);
    setMessages([
      ...shown,
      { role: "user", text },
      { role: "assistant", text: answer.text, links: answer.links },
    ]);
    setInput("");
    void playClickSound("tap");
  }

  return (
    <div className={`flex min-h-0 flex-col ${variant === "page" ? "h-[min(70vh,36rem)]" : "h-full"}`}>
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {shown.map((m, i) => (
          <div key={`${m.role}-${i}`} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[var(--team-accent)] text-[var(--team-secondary)]"
                  : "border border-white/10 bg-white/10"
              }`}
            >
              {m.text}
              {!!m.links?.length && (
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {m.links.map((l) => (
                    <Link
                      key={`${l.href}-${l.label}`}
                      href={l.href}
                      className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-semibold opacity-80 hover:bg-white/10"
                    >
                      {l.label}
                    </Link>
                  ))}
                </span>
              )}
            </div>
          </div>
        ))}
        {shown.length <= 1 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {ASSISTANT_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/10"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      <form
        className="flex gap-2 border-t border-white/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder={data ? "Chiedi alla squadra..." : "Caricamento squadra..."}
          className="input-field flex-1"
          aria-label="Messaggio per l'assistente"
          disabled={!data}
        />
        <button type="submit" className="btn-add shrink-0 px-3" disabled={!data || !input.trim()}>
          Invia
        </button>
      </form>
    </div>
  );
}

export default function AssistantChat() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPath(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (pathname === "/assistente" || pathname.startsWith("/admin")) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void playClickSound("kick");
          setOpenPath(pathname);
        }}
        className="assistant-fab fixed right-4 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-[55] flex h-14 w-14 items-center justify-center rounded-full border border-[var(--team-accent)]/40 bg-[var(--team-secondary)] text-xl shadow-xl shadow-black/40 md:bottom-6"
        aria-label="Apri assistente"
      >
        ✦
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[80] more-overlay-in">
            <button
              type="button"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Chiudi assistente"
              onClick={() => setOpenPath(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="assistant-title"
              className="assistant-sheet-in absolute inset-x-0 bottom-0 flex h-[min(86vh,40rem)] flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[var(--team-secondary)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <h2 id="assistant-title" className="text-lg font-black">
                    Assistente
                  </h2>
                  <p className="text-xs opacity-60">Rosa, partite, formazione e stadio</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenPath(null)}
                  className="rounded-lg px-2 py-1 text-sm opacity-70 hover:bg-white/10 hover:opacity-100"
                >
                  Chiudi
                </button>
              </div>
              <AssistantThread />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
