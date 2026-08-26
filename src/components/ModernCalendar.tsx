"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ClubEvent, Match } from "@/lib/types";
import { dateKey, formatItDate, localDateKey, todayKey } from "@/lib/dates";
import {
  cellBackground,
  defaultEventColor,
  hexAlpha,
  inkOn,
  normalizeHex,
} from "@/lib/event-color";
import {
  getCalendarModel,
  getCalendarSize,
  type CalendarModel,
  type CalendarSize,
} from "@/lib/calendar-models";
import { MATCH_KIND_META, getMatchKind, matchPublicDetail, matchPublicTitle } from "@/lib/match-kind";

export type CalendarItem = {
  id: string;
  date: string;
  time: string;
  title: string;
  detail: string;
  href?: string;
  color: string;
  kind: "match" | "event";
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function weekNumber(d: Date) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3);
  const first = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round((t.getTime() - first.getTime()) / 86400000 / 7);
}

export function toCalendarItems(matches: Match[], events: ClubEvent[] = []): CalendarItem[] {
  const fromMatches: CalendarItem[] = matches.map((m) => {
    const kind = getMatchKind(m);
    return {
      id: m.id,
      date: dateKey(m.date),
      time: m.time || "",
      title: matchPublicTitle(m),
      detail: matchPublicDetail(m),
      href: `/partita/${m.id}`,
      color:
        normalizeHex(m.color) ||
        MATCH_KIND_META[kind].color ||
        defaultEventColor("match"),
      kind: "match",
    };
  });
  const fromEvents: CalendarItem[] = events
    .filter((e) => dateKey(e.date))
    .map((e) => ({
      id: e.id,
      date: dateKey(e.date),
      time: "",
      title: e.title,
      detail: e.place || "Evento club",
      color: normalizeHex(e.color) || defaultEventColor("event"),
      kind: "event",
    }));
  return [...fromMatches, ...fromEvents];
}

export default function ModernCalendar({
  matches,
  events = [],
  modelId,
  sizeId,
}: {
  matches: Match[];
  events?: ClubEvent[];
  modelId?: string;
  sizeId?: string;
}) {
  const model = getCalendarModel(modelId);
  const size = getCalendarSize(sizeId);
  const items = useMemo(() => toCalendarItems(matches, events), [matches, events]);
  return (
    <CalendarGrid items={items} model={model} size={size} competitions={matches} />
  );
}

function CalendarGrid({
  items,
  model,
  size,
  competitions,
}: {
  items: CalendarItem[];
  model: CalendarModel;
  size: CalendarSize;
  competitions: Match[];
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [competition, setCompetition] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(() => todayKey());

  const competitionNames = useMemo(
    () => [
      "all",
      ...new Set(
        competitions.map((m) => {
          const k = getMatchKind(m);
          if (k === "allenamento") return "Allenamento";
          if (k === "amichevole") return "Amichevole";
          return m.competition;
        }).filter(Boolean)
      ),
    ],
    [competitions]
  );

  const filtered = useMemo(() => {
    if (competition === "all") return items;
    const allowed = new Set(
      competitions
        .filter((m) => {
          const k = getMatchKind(m);
          if (competition === "Allenamento") return k === "allenamento";
          if (competition === "Amichevole") return k === "amichevole";
          return m.competition === competition;
        })
        .map((m) => m.id)
    );
    // Keep club events (Open Day, etc.) when filtering by competition.
    return items.filter((it) => it.kind !== "match" || allowed.has(it.id));
  }, [competition, items, competitions]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const groupedByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of filtered) {
      if (!item.date) continue;
      if (!map.has(item.date)) map.set(item.date, []);
      map.get(item.date)!.push(item);
    }
    return map;
  }, [filtered]);

  const selectedItems = selectedDate ? (groupedByDate.get(selectedDate) ?? []) : [];
  const today = todayKey();
  const cols = model.showWeekNumbers ? "grid-cols-8" : "grid-cols-7";
  const monthPrefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
  const monthLegend = useMemo(() => {
    const seen = new Map<string, CalendarItem>();
    for (const item of filtered) {
      if (!item.date.startsWith(monthPrefix)) continue;
      if (!seen.has(item.id)) seen.set(item.id, item);
    }
    return [...seen.values()].slice(0, 8);
  }, [filtered, monthPrefix]);

  const goToday = () => {
    const now = new Date();
    setCursor(startOfMonth(now));
    setSelectedDate(todayKey());
  };

  return (
    <section className={`cal-shell p-5 backdrop-blur-md ${model.frame}`} style={{ borderRadius: model.radius }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm transition hover:bg-white/20"
            aria-label="Mese precedente"
          >
            ◀
          </button>
          <h3 className={`${model.header} min-w-[10rem] text-center capitalize`}>
            {cursor.toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
          </h3>
          <button
            type="button"
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm transition hover:bg-white/20"
            aria-label="Mese successivo"
          >
            ▶
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:bg-white/12"
          >
            Oggi
          </button>
        </div>
        <select
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          className="rounded-full border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none"
        >
          {competitionNames.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Tutti gli eventi" : c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className={`grid ${cols} text-center text-[11px] font-semibold tracking-[0.18em] ${model.weekday}`} style={{ gap: size.gap }}>
          {model.showWeekNumbers && <div>Sett.</div>}
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className={`mt-2 grid ${cols}`} style={{ gap: size.gap }}>
          {weeks.map((week, wi) => {
            const probe = week.find((x): x is Date => !!x) || monthStart;
            return (
              <div key={`week-${wi}`} className="contents">
                {model.showWeekNumbers && (
                  <div
                    className={`flex items-center justify-center text-[10px] opacity-50 ${model.empty}`}
                    style={{ minHeight: size.cell, borderRadius: Math.max(0, model.radius - 8) }}
                  >
                    {weekNumber(probe)}
                  </div>
                )}
                {week.map((d, di) => {
                  if (!d) {
                    return (
                      <div
                        key={`e-${wi}-${di}`}
                        className={model.empty}
                        style={{ minHeight: size.cell, borderRadius: Math.max(0, model.radius - 8) }}
                      />
                    );
                  }
                  const key = localDateKey(d);
                  const dayItems = groupedByDate.get(key) ?? [];
                  const active = key === selectedDate;
                  const isToday = key === today;
                  const colors = dayItems.map((item) => item.color);
                  const fill = cellBackground(colors);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(key)}
                      className={`cal-cell p-2 text-left ${active ? model.cellOn : model.cell} ${
                        dayItems.length ? "cal-cell-busy" : ""
                      }`}
                      style={{
                        minHeight: size.cell,
                        borderRadius: Math.max(0, model.radius - 8),
                        background: fill,
                        boxShadow: colors[0]
                          ? `inset 0 0 0 ${active ? 2 : 1}px ${hexAlpha(colors[0], active ? 0.95 : 0.55)}`
                          : isToday
                            ? "inset 0 0 0 1px color-mix(in srgb, var(--team-accent) 70%, transparent)"
                            : undefined,
                      }}
                    >
                      {colors[0] && (
                        <span
                          className="absolute inset-x-1.5 top-1 h-1 rounded-full"
                          style={{
                            background:
                              colors.length === 1
                                ? colors[0]
                                : `linear-gradient(90deg, ${colors.join(", ")})`,
                          }}
                          aria-hidden
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold tabular-nums ${isToday ? model.today : ""}`}>
                          {d.getDate()}
                        </span>
                        {dayItems.length > 0 && (
                          <span
                            className="rounded-full px-2 text-[10px] font-black"
                            style={{
                              background: colors[0],
                              color: inkOn(colors[0]),
                            }}
                          >
                            {dayItems.length}
                          </span>
                        )}
                      </div>
                      {isToday && (
                        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider opacity-80">
                          Oggi
                        </p>
                      )}
                      <div className="mt-1 space-y-1">
                        {dayItems.slice(0, size.chips).map((item) => (
                          <p
                            key={item.id}
                            className="truncate px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              borderRadius: 999,
                              background: item.color,
                              color: inkOn(item.color),
                            }}
                          >
                            {item.time ? `${item.time} · ` : ""}
                            {item.title}
                          </p>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {monthLegend.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {monthLegend.map((item) => (
            <span
              key={item.id}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px]"
            >
              <i
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: item.color }}
                aria-hidden
              />
              <span className="truncate">{item.title}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] opacity-70">
          Agenda del giorno{" "}
          {selectedDate ? formatItDate(selectedDate) : "(seleziona una data)"}
        </h4>
        {selectedDate && selectedItems.length > 0 ? (
          <div className="space-y-2">
            {selectedItems.map((item) => {
              const body = (
                <>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm opacity-70">
                    {item.detail}
                    {item.time ? ` · ${item.time}` : ""}
                  </p>
                </>
              );
              const box = {
                borderLeft: `4px solid ${item.color}`,
                background: hexAlpha(item.color, 0.12),
              };
              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-xl border border-white/10 p-3 transition hover:brightness-110"
                  style={box}
                >
                  {body}
                </Link>
              ) : (
                <div key={item.id} className="rounded-xl border border-white/10 p-3" style={box}>
                  {body}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm opacity-60">Nessun evento in questa giornata.</p>
        )}
      </div>
    </section>
  );
}
