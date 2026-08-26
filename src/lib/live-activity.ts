export type WindowState = "primo-piano" | "finestra" | "fuori";

export type LiveAction = {
  at: string;
  text: string;
};

export type LiveActivity = {
  looking: string;
  pageLabel: string;
  page: string;
  windowState: WindowState;
  windowStateLabel: string;
  displayMode: string;
  focused: boolean;
  visible: boolean;
  nativeActive?: boolean;
  secondsOnPage: number;
  lastAction?: string;
  actions: LiveAction[];
};

const MAX_ACTIONS = 40;
const actions: LiveAction[] = [];
let pageEnteredAt = Date.now();
let lastPath = "";
let nativeActive: boolean | null = null;
let started = false;
let pingQuick: (() => void) | null = null;

function nowIso() {
  return new Date().toISOString();
}

function pushAction(text: string) {
  const clean = text.replace(/\s+/g, " ").trim().slice(0, 120);
  if (!clean) return;
  const last = actions[actions.length - 1];
  if (last && last.text === clean && Date.now() - new Date(last.at).getTime() < 1500) return;
  actions.push({ at: nowIso(), text: clean });
  if (actions.length > MAX_ACTIONS) actions.splice(0, actions.length - MAX_ACTIONS);
}

export function pageLabel(pathRaw: string) {
  const path = (pathRaw.split("?")[0] || "/").replace(/\/$/, "") || "/";
  if (path === "/") return "Home";
  if (path.startsWith("/rosa")) return "Rosa";
  if (path.startsWith("/giocatore/")) return "Scheda giocatore";
  if (path.startsWith("/calendario")) return "Calendario";
  if (path.startsWith("/partita/")) return "Dettaglio partita";
  if (path.startsWith("/formazione")) return "Formazione";
  if (path.startsWith("/live")) return "Live";
  if (path.startsWith("/convocati")) return "Convocati";
  if (path.startsWith("/statistiche")) return "Statistiche";
  if (path.startsWith("/classifica")) return "Classifica";
  if (path.startsWith("/galleria") || path.startsWith("/media")) return "Galleria";
  if (path.startsWith("/infortuni")) return "Infortuni";
  if (path.startsWith("/shop") || path.startsWith("/kit")) return "Shop / kit";
  if (path.startsWith("/scarica")) return "Scarica app";
  if (path.startsWith("/profilo")) return "Profilo";
  if (path.startsWith("/accedi")) return "Accesso";
  if (path.startsWith("/registrati")) return "Registrazione";
  if (path.startsWith("/admin")) return "Admin";
  if (path.startsWith("/staff")) return "Area staff";
  if (path.startsWith("/assistente")) return "Assistente";
  if (path.startsWith("/esplora")) return "Esplora";
  if (path.startsWith("/tifosi")) return "Tifosi";
  if (path.startsWith("/cerca")) return "Ricerca";
  if (path.startsWith("/contatti")) return "Contatti";
  if (path.startsWith("/storia")) return "Storia";
  if (path.startsWith("/record")) return "Record";
  if (path.startsWith("/canti")) return "Canti";
  if (path.startsWith("/faq")) return "FAQ";
  if (path.startsWith("/privacy")) return "Privacy";
  if (path.startsWith("/termini")) return "Termini";
  return path.slice(1) || "Home";
}

function displayMode() {
  if (typeof window === "undefined") return "sconosciuto";
  if (window.matchMedia("(display-mode: fullscreen)").matches) return "schermo intero";
  if (window.matchMedia("(display-mode: standalone)").matches) return "app installata";
  if (window.matchMedia("(display-mode: minimal-ui)").matches) return "finestra compatta";
  return "scheda del browser";
}

function currentWindowState(): WindowState {
  if (typeof document === "undefined") return "fuori";
  if (document.hidden || nativeActive === false) return "fuori";
  if (!document.hasFocus()) return "finestra";
  return "primo-piano";
}

function windowStateLabel(state: WindowState) {
  if (state === "primo-piano") return "In primo piano, sta usando MIZZLI FC";
  if (state === "finestra") return "App aperta in finestra, non in primo piano";
  return "Ha lasciato l'app (un'altra scheda, finestra o app)";
}

export function currentLiveActivity(): LiveActivity {
  const page = typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.search}`;
  const label = pageLabel(page);
  const state = currentWindowState();
  const secondsOnPage = Math.max(0, Math.floor((Date.now() - pageEnteredAt) / 1000));
  const lastAction = actions[actions.length - 1]?.text;
  let looking = `Sta guardando: ${label}`;
  if (state === "fuori") {
    looking = `Ha lasciato MIZZLI FC. Un'altra scheda, finestra o app. Ultima schermata: ${label}`;
  } else if (state === "finestra") {
    looking = `MIZZLI FC è aperta in finestra, non in primo piano. Schermata: ${label}`;
  }
  return {
    looking,
    pageLabel: label,
    page,
    windowState: state,
    windowStateLabel: windowStateLabel(state),
    displayMode: displayMode(),
    focused: typeof document === "undefined" ? false : document.hasFocus(),
    visible: typeof document === "undefined" ? false : !document.hidden,
    nativeActive: nativeActive ?? undefined,
    secondsOnPage,
    lastAction,
    actions: actions.slice(-MAX_ACTIONS),
  };
}

function onNavigate() {
  if (typeof window === "undefined") return;
  const path = `${window.location.pathname}${window.location.search}`;
  if (path === lastPath) return;
  lastPath = path;
  pageEnteredAt = Date.now();
  pushAction(`Aperto: ${pageLabel(path)}`);
  pingQuick?.();
}

export function notePath(path: string) {
  if (typeof window === "undefined") return;
  if (path && path !== lastPath) {
    lastPath = path;
    pageEnteredAt = Date.now();
    pushAction(`Aperto: ${pageLabel(path)}`);
    pingQuick?.();
  }
}

function clickLabel(el: HTMLElement) {
  if (el.closest("input[type=password], textarea, [contenteditable=true]")) {
    return "Sta scrivendo in un campo";
  }
  const field = el.closest("input, select") as HTMLInputElement | HTMLSelectElement | null;
  if (field) {
    const name = field.getAttribute("aria-label") || field.getAttribute("name") || field.getAttribute("placeholder") || "campo";
    return `Sta usando il campo: ${name}`.slice(0, 120);
  }
  const hit = el.closest("a, button, [role=button], [role=tab], label") as HTMLElement | null;
  if (!hit) return "";
  const text =
    hit.getAttribute("aria-label") ||
    hit.getAttribute("title") ||
    hit.textContent ||
    "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "Ha toccato un tasto";
  return `Toccato: ${clean}`.slice(0, 120);
}

export function startLiveActivity(onPing: () => void) {
  if (typeof window === "undefined") return;
  pingQuick = onPing;
  if (started) return;
  started = true;
  lastPath = `${window.location.pathname}${window.location.search}`;
  pageEnteredAt = Date.now();
  pushAction(`Aperto: ${pageLabel(lastPath)}`);

  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = function pushStateWrapped(
    this: History,
    ...args: Parameters<History["pushState"]>
  ) {
    const ret = origPush(...args);
    onNavigate();
    return ret;
  };
  history.replaceState = function replaceStateWrapped(
    this: History,
    ...args: Parameters<History["replaceState"]>
  ) {
    const ret = origReplace(...args);
    onNavigate();
    return ret;
  };
  window.addEventListener("popstate", onNavigate);

  document.addEventListener(
    "click",
    (e) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const text = clickLabel(el);
      if (text) {
        pushAction(text);
        pingQuick?.();
      }
    },
    true
  );

  const onFocusChange = () => {
    const state = currentWindowState();
    if (state === "fuori") pushAction("Ha lasciato l'app (un'altra scheda, finestra o app)");
    else if (state === "finestra") pushAction("App restata aperta in finestra");
    else pushAction(`Di nuovo in primo piano · ${pageLabel(window.location.pathname)}`);
    pingQuick?.();
  };
  document.addEventListener("visibilitychange", onFocusChange);
  window.addEventListener("focus", onFocusChange);
  window.addEventListener("blur", onFocusChange);

  void (async () => {
    try {
      const { App } = await import("@capacitor/app");
      const state = await App.getState();
      nativeActive = state.isActive;
      App.addListener("appStateChange", ({ isActive }) => {
        nativeActive = isActive;
        pushAction(
          isActive
            ? "Tornato nell'app"
            : "App in background: home o un'altra app"
        );
        pingQuick?.();
      });
    } catch {
      nativeActive = null;
    }
  })();
}
