"use client";

import { useEffect } from "react";
import type { SessionInfo } from "@/lib/session-types";
import { activityOf, appLine, lookingLine, locationLine, phoneLine, windowStateLine } from "@/lib/session-display";

function formatValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function flatten(obj: unknown, prefix = ""): { key: string; value: string }[] {
  if (obj == null) return [];
  if (typeof obj !== "object") {
    return [{ key: prefix || "valore", value: formatValue(obj) }];
  }
  if (Array.isArray(obj)) {
    return [{ key: prefix || "lista", value: formatValue(obj) }];
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) return flatten(v, key);
    return [{ key, value: formatValue(v) }];
  });
}

function mapDelta(geo: { lat?: number; accuracyMeters?: number; source?: string }) {
  if (geo.source !== "gps") return 900 / 111320;
  const meters = Math.max(Number(geo.accuracyMeters) || 8, 6) * 1.5;
  return meters / 111320;
}

function Field({ label, value }: { label: string; value?: unknown }) {
  const text = formatValue(value);
  if (text === "—") return null;
  return (
    <div className="border-b border-white/5 py-2">
      <p className="text-[11px] uppercase tracking-wide opacity-50">{label}</p>
      <p className="whitespace-pre-wrap break-all text-sm">{text}</p>
    </div>
  );
}

function obj(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function bytes(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function batteryLine(c: Record<string, unknown>) {
  const native = obj(c.batteryNative);
  const web = obj(c.batteryWeb);
  const level = native?.batteryLevel ?? web?.level;
  if (level == null) return undefined;
  const pct = typeof level === "number" && level <= 1 ? Math.round(level * 100) : level;
  return `${pct}%`;
}

function storageLine(c: Record<string, unknown>) {
  const used = bytes(c.storageBytes);
  const quota = bytes(c.storageQuotaBytes);
  if (!used && !quota) return undefined;
  return [used, quota].filter(Boolean).join(" / ");
}

function mediaLine(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value
    .map((item) => {
      const row = obj(item);
      return `${row?.kind || "device"}: ${row?.label || ""}`;
    })
    .join("\n");
}

function missingAppsLine(value: unknown) {
  const data = obj(value);
  if (!data) return undefined;
  const missing = Array.isArray(data.missing) ? data.missing.filter((x) => typeof x === "string") : [];
  if (!missing.length) return undefined;
  return missing.join(", ");
}

function installedAppsLine(value: unknown) {
  const data = obj(value);
  if (!data) return undefined;
  const installed = Array.isArray(data.installed)
    ? data.installed.filter((x) => typeof x === "string")
    : [];
  const mode = data.mode ? ` [${data.mode}]` : "";
  const note = typeof data.note === "string" ? `\n${data.note}` : "";
  if (!installed.length) {
    return `Nessuna delle app controllate risulta installata${mode}${note}`;
  }
  return `${installed.join(", ")}${mode}${note}`;
}

export default function SessionDetailModal({
  title,
  subtitle,
  session,
  extra,
  onClose,
}: {
  title: string;
  subtitle?: string;
  session?: SessionInfo | null;
  extra?: Record<string, unknown>;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const geo = session?.geo;
  const c = (session?.client || {}) as Record<string, unknown>;
  const extraPhone = typeof extra?.phone === "string" ? extra.phone : "";
  const phone = phoneLine(session, extraPhone);
  const allRows = flatten({ ...(extra || {}), ...(session || {}) });

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Chiudi"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-3 top-[calc(env(safe-area-inset-top)+2.5rem)] mx-auto max-h-[min(82vh,44rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-[var(--team-secondary)] p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">{title}</h3>
            {subtitle && <p className="mt-1 text-sm opacity-70">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm opacity-70 hover:bg-white/10 hover:opacity-100"
          >
            Chiudi
          </button>
        </div>

        <section className="mb-5">
          <h4 className="mb-1 font-bold text-[var(--team-accent)]">Cosa sta facendo</h4>
          <p className="text-lg font-black">{lookingLine(session)}</p>
          <p className="mt-1 text-sm opacity-80">{windowStateLine(session)}</p>
          {activityOf(session)?.pageLabel && (
            <Field label="Schermata" value={activityOf(session)?.pageLabel} />
          )}
          <Field label="Come è aperta" value={activityOf(session)?.displayMode} />
          <Field
            label="Secondi su questa schermata"
            value={activityOf(session)?.secondsOnPage}
          />
          <Field label="Ultimo gesto" value={activityOf(session)?.lastAction} />
          {!!activityOf(session)?.actions?.length && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl bg-black/30 p-3">
              {[...(activityOf(session)?.actions || [])].reverse().map((row) => (
                <p key={`${row.at}-${row.text}`} className="border-b border-white/5 py-1.5 text-xs last:border-0">
                  <span className="opacity-50">
                    {new Date(row.at).toLocaleTimeString("it-IT")} ·{" "}
                  </span>
                  {row.text}
                </p>
              ))}
            </div>
          )}
        </section>

        <section className="mb-5">
          <h4 className="mb-1 font-bold text-[var(--team-accent)]">Numero di telefono</h4>
          <p className="text-lg font-black">{phone}</p>
        </section>

        {!session ? (
          <p className="text-sm opacity-70">
            Dettagli non ancora disponibili. Appena l&apos;utente manda un ping o fa login compariranno qui.
          </p>
        ) : (
          <div className="space-y-5 text-sm">
            <section>
              <h4 className="mb-1 font-bold text-[var(--team-accent)]">Posizione</h4>
              <p className="text-base font-semibold">{locationLine(session)}</p>
              {geo?.source === "gps" ? (
                <p className="text-xs text-green-300">
                  GPS del dispositivo
                  {geo.accuracyMeters != null ? ` · precisione ±${Math.round(geo.accuracyMeters)} m` : ""}
                </p>
              ) : (
                <p className="text-xs text-amber-300">Stimata da IP (imprecisa). Serve permesso posizione per il punto esatto.</p>
              )}
              {geo?.lat != null && geo?.lon != null && (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                  <iframe
                    title="Mappa posizione"
                    className="h-80 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={
                      geo.source === "gps"
                        ? `https://maps.google.com/maps?q=${geo.lat},${geo.lon}&ll=${geo.lat},${geo.lon}&z=21&hl=it&output=embed`
                        : `https://www.openstreetmap.org/export/embed.html?bbox=${
                            geo.lon - mapDelta(geo)
                          },${geo.lat - mapDelta(geo)},${geo.lon + mapDelta(geo)},${geo.lat + mapDelta(geo)}&layer=mapnik&marker=${geo.lat}%2C${geo.lon}`
                    }
                  />
                </div>
              )}
              <Field label="Indirizzo" value={geo?.displayName} />
              <Field label="Via" value={[geo?.street, geo?.houseNumber].filter(Boolean).join(" ")} />
              <Field label="Quartiere" value={geo?.neighbourhood} />
              <Field label="Città" value={geo?.city} />
              <Field label="Regione" value={geo?.region} />
              <Field label="Paese" value={geo?.country} />
              <Field label="Codice paese" value={geo?.countryCode || session.countryHeader} />
              <Field label="CAP" value={geo?.postal} />
              <Field label="Latitudine" value={geo?.lat != null ? geo.lat.toFixed(8) : undefined} />
              <Field label="Longitudine" value={geo?.lon != null ? geo.lon.toFixed(8) : undefined} />
              <Field
                label="Precisione GPS"
                value={
                  geo?.accuracyMeters != null
                    ? `±${geo.accuracyMeters < 20 ? geo.accuracyMeters.toFixed(1) : Math.round(geo.accuracyMeters)} m`
                    : undefined
                }
              />
              <Field label="Altitudine" value={geo?.altitude != null ? `${Math.round(geo.altitude)} m` : undefined} />
              <Field label="Direzione" value={geo?.heading} />
              <Field label="Velocità" value={geo?.speed != null ? `${(geo.speed * 3.6).toFixed(1)} km/h` : undefined} />
              <Field label="Fuso orario" value={session.timezone || geo?.timezone} />
              {geo?.lat != null && geo?.lon != null && (
                <div className="mt-2 flex flex-wrap gap-3 text-sm">
                  <a
                    href={`https://www.google.com/maps?q=${geo.lat},${geo.lon}&ll=${geo.lat},${geo.lon}&z=21`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--team-accent)] underline"
                  >
                    Google Maps
                  </a>
                  <a
                    href={`https://maps.apple.com/?ll=${geo.lat},${geo.lon}&q=Posizione&z=21`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--team-accent)] underline"
                  >
                    Apple Maps
                  </a>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lon}#map=21/${geo.lat}/${geo.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--team-accent)] underline"
                  >
                    OpenStreetMap
                  </a>
                </div>
              )}
            </section>

            <section>
              <h4 className="mb-1 font-bold text-[var(--team-accent)]">App e dispositivo</h4>
              <p className="text-base font-semibold">{appLine(session)}</p>
              <p className="mt-1 text-lg font-black text-[var(--team-accent)]">
                {String(
                  session.phoneModelExact ||
                    c.phoneModelExact ||
                    obj(c.phone)?.model ||
                    session.device ||
                    ""
                )}
              </p>
              <Field label="Modello esatto" value={session.phoneModelExact || c.phoneModelExact} />
              <Field label="Codice hardware" value={c.phoneHardware || obj(c.phone)?.model} />
              <Field label="App in uso" value={session.app} />
              <Field label="Tipo" value={session.deviceType} />
              <Field label="Sistema" value={session.os} />
              <Field label="Browser" value={session.browser} />
              <Field label="Pagina aperta" value={session.page || session.client?.page} />
              <Field label="User-Agent" value={session.userAgent} />
            </section>

            <section>
              <h4 className="mb-1 font-bold text-[var(--team-accent)]">Telefono e app</h4>
              <p className="mb-2 text-xs opacity-60">
                Dati del dispositivo e dell&apos;app. Rubrica, foto, SMS e file privati non vengono letti.
              </p>
              <Field label="Numero di telefono" value={phone} />
              <Field label="Nome telefono" value={obj(c.phone)?.name} />
              <Field label="Modello esatto" value={session.phoneModelExact || c.phoneModelExact} />
              <Field label="Codice hardware" value={c.phoneHardware || obj(c.phone)?.model} />
              <Field label="Modello UA" value={obj(c.uaHints)?.model} />
              <Field label="Produttore" value={obj(c.phone)?.manufacturer} />
              <Field label="Sistema" value={obj(c.phone)?.operatingSystem || session.os} />
              <Field label="Versione OS" value={obj(c.phone)?.osVersion} />
              <Field label="WebView" value={obj(c.phone)?.webViewVersion} />
              <Field label="Emulatore" value={obj(c.phone)?.isVirtual} />
              <Field label="ID dispositivo" value={c.phoneId} />
              <Field label="Memoria usata" value={bytes(obj(c.phone)?.memUsed)} />
              <Field label="RAM stimata" value={c.deviceMemory != null ? `${c.deviceMemory} GB` : undefined} />
              <Field label="CPU (core)" value={c.hardwareConcurrency} />
              <Field label="Batteria" value={batteryLine(c)} />
              <Field label="In carica" value={obj(c.batteryNative)?.isCharging ?? obj(c.batteryWeb)?.charging} />
              <Field label="Storage app" value={storageLine(c)} />
              <Field label="GPU" value={obj(c.gpu)?.renderer} />
              <Field label="GPU vendor" value={obj(c.gpu)?.vendor} />
              <Field label="App nome" value={obj(c.appInfo)?.name} />
              <Field label="App id" value={obj(c.appInfo)?.id} />
              <Field label="App versione" value={obj(c.appInfo)?.version} />
              <Field label="App build" value={obj(c.appInfo)?.build} />
              <Field label="App attiva" value={obj(c.appState)?.isActive} />
              <Field label="Launch URL" value={c.launchUrl} />
              <Field label="Tipo rete nativa" value={obj(c.networkNative)?.connectionType} />
              <Field label="Online nativo" value={obj(c.networkNative)?.connected} />
              <Field label="Lingua telefono" value={c.phoneLanguage || c.phoneTag} />
              <Field label="App installate" value={installedAppsLine(c.installedApps)} />
              <Field label="App controllate assenti" value={missingAppsLine(c.installedApps)} />
              <Field label="Permesso GPS" value={obj(c.permissions)?.geolocation} />
              <Field label="Permesso notifiche" value={obj(c.permissions)?.notifications} />
              <Field label="Permesso camera" value={obj(c.permissions)?.camera} />
              <Field label="Permesso microfono" value={obj(c.permissions)?.microphone} />
              <Field label="Fotocamere/microfoni" value={mediaLine(c.mediaDevices)} />
              <Field label="PWA / standalone" value={c.standalone} />
              <Field label="Service Worker" value={c.serviceWorker} />
              <Field label="Schermo" value={c.screen} />
              <Field label="Viewport" value={c.viewport} />
              <Field label="Pixel ratio" value={c.pixelRatio} />
              <Field label="Orientamento" value={c.orientation} />
              <Field label="Tema" value={c.colorScheme} />
              <Field label="Touch points" value={c.touchPoints || c.maxTouchPoints} />
              <Field label="Do Not Track" value={c.doNotTrack} />
              <Field label="Chiavi localStorage" value={c.localStorageKeys} />
            </section>

            <section>
              <h4 className="mb-1 font-bold text-[var(--team-accent)]">Rete</h4>
              <Field label="IP" value={session.ip} />
              <Field label="ISP" value={geo?.isp} />
              <Field label="Organizzazione" value={geo?.org} />
              <Field label="ASN" value={geo?.as} />
              <Field label="Connessione" value={session.client?.connection} />
              <Field label="Lingua" value={session.language || session.acceptLanguage} />
              <Field label="Host" value={session.host} />
              <Field label="Origin" value={session.origin} />
              <Field label="Referer" value={session.referer} />
              <Field label="CF-Ray" value={session.cfRay} />
            </section>

            <section>
              <h4 className="mb-2 font-bold text-[var(--team-accent)]">Ogni dato raccolto</h4>
              <div className="rounded-xl bg-black/30 p-3">
                {allRows.map((row) => (
                  <div key={row.key} className="border-b border-white/5 py-1.5 last:border-0">
                    <p className="break-all text-[11px] opacity-50">{row.key}</p>
                    <p className="whitespace-pre-wrap break-all text-xs">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
