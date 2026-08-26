/** Calendar date as YYYY-MM-DD in local time — never UTC. */
export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function localDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayKey() {
  return localDateKey(new Date());
}

/** Normalize stored dates (YYYY-MM-DD, ISO datetime, or DD/MM/YYYY). */
export function dateKey(value: string | Date | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    return localDateKey(value);
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const it = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
  if (it) return `${it[3]}-${pad2(Number(it[2]))}-${pad2(Number(it[1]))}`;
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return localDateKey(parsed);
  return "";
}

export function formatItDate(value: string, options?: Intl.DateTimeFormatOptions) {
  const key = dateKey(value);
  if (!key) return "";
  return new Date(`${key}T12:00:00`).toLocaleDateString("it-IT", options);
}
