const STORAGE_KEY = "mizzli-sound";

let ctx: AudioContext | null = null;
let lastAt = 0;

export function isSoundEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    if (on) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, "off");
  } catch {
    /* ignore */
  }
}

function allowed() {
  return isSoundEnabled();
}

async function audio() {
  const AC =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") await ctx.resume();
  return ctx;
}

function tone(
  ac: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  when = 0
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + when);
  gain.gain.setValueAtTime(Math.max(0.0001, volume), ac.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + when + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + when);
  osc.stop(ac.currentTime + when + duration + 0.02);
}

function thud(ac: AudioContext, volume: number) {
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.04), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.05);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start();
}

export async function playClickSound(kind: "tap" | "kick" = "tap") {
  if (!allowed()) return;
  const now = performance.now();
  if (now - lastAt < 45) return;
  lastAt = now;
  try {
    const ac = await audio();
    if (!ac) return;
    if (kind === "kick") {
      thud(ac, 0.16);
      tone(ac, 196, 0.09, "sine", 0.07);
      tone(ac, 980, 0.035, "triangle", 0.045, 0.01);
      return;
    }
    tone(ac, 1860, 0.028, "sine", 0.055);
    tone(ac, 620, 0.04, "triangle", 0.03);
  } catch {
    /* autoplay or unsupported */
  }
}

function isSoundTarget(el: EventTarget | null) {
  if (!(el instanceof Element)) return false;
  const node = el.closest(
    "a, button, [role='button'], summary, label, input[type='button'], input[type='submit'], input[type='checkbox'], input[type='radio']"
  );
  if (!node) return false;
  if (node.hasAttribute("data-silent")) return false;
  if (node.getAttribute("aria-disabled") === "true") return false;
  if (node instanceof HTMLButtonElement && node.disabled) return false;
  if (node instanceof HTMLInputElement && (node.disabled || node.type === "range")) return false;
  if (node instanceof HTMLAnchorElement && node.getAttribute("aria-disabled") === "true") {
    return false;
  }
  return true;
}

export function installClickSounds() {
  if (typeof window === "undefined") return () => {};
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!isSoundTarget(e.target)) return;
    const kick = !!(e.target instanceof Element && e.target.closest("nav a, nav button"));
    void playClickSound(kick ? "kick" : "tap");
  };
  window.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
  return () => window.removeEventListener("pointerdown", onPointer, true);
}
