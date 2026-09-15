"use client";

import { useEffect, useMemo, useState } from "react";
import { useTeam } from "@/context/TeamContext";

export default function AdminRosaPicker() {
  const { data } = useTeam();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pickedId, setPickedId] = useState("");
  const [rosaOn, setRosaOn] = useState(false);

  const players = data?.players ?? [];
  const nq = q.trim().toLowerCase();
  const names = useMemo(
    () =>
      [...players]
        .sort((a, b) => a.name.localeCompare(b.name, "it"))
        .filter((p) => !nq || p.name.toLowerCase().includes(nq)),
    [players, nq]
  );

  useEffect(() => {
    const scan = () => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const rosaTab = buttons.find((b) => /\uD83D\uDC65\s*Rosa/.test(b.textContent || "") || (b.textContent || "").trim() === "Rosa");
      const active =
        !!document.querySelector("h2") &&
        Array.from(document.querySelectorAll("h2")).some((h) =>
          (h.textContent || "").includes("Gestione Rosa")
        );
      setRosaOn(active);
      if (!active) return;

      const cards = Array.from(
        document.querySelectorAll(".rounded-xl.border.border-white\\/10.p-4")
      ) as HTMLElement[];
      cards.forEach((card) => {
        const titleInput = card.querySelector("input.input-field") as HTMLInputElement | null;
        const name = titleInput?.value || "";
        const player = players.find((p) => p.name === name);
        if (!pickedId) {
          card.style.display = "";
          return;
        }
        card.style.display = player && player.id === pickedId ? "" : "none";
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    const t = window.setInterval(scan, 700);
    return () => {
      mo.disconnect();
      window.clearInterval(t);
    };
  }, [pickedId, players]);

  if (!rosaOn) return null;

  const picked = players.find((p) => p.id === pickedId);

  return (
    <div className="sticky top-2 z-[45] mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/20 bg-[#16081e] px-4 py-3 text-left shadow-xl"
      >
        <span className="font-semibold">{picked ? picked.name : "Scegli un giocatore"}</span>
        <span className="text-xs opacity-60">{open ? "chiudi" : "apri"}</span>
      </button>
      {open && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-white/15 bg-[#120616] shadow-2xl">
          <div className="border-b border-white/10 p-2">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca nome..."
              className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm outline-none"
              type="search"
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                setPickedId("");
                setOpen(false);
                setQ("");
              }}
              className={`block w-full px-4 py-2 text-left text-sm ${!pickedId ? "bg-white/10 font-bold" : "opacity-80"}`}
            >
              Tutti i giocatori
            </button>
            {names.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPickedId(p.id);
                  setOpen(false);
                  setQ("");
                }}
                className={`block w-full px-4 py-2 text-left text-sm ${pickedId === p.id ? "bg-white/10 font-bold" : "hover:bg-white/5"}`}
              >
                {p.name}
              </button>
            ))}
            {names.length === 0 && (
              <p className="px-4 py-3 text-sm opacity-60">Nessun nome trovato.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
