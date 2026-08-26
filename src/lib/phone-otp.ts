import { createHash, randomInt, timingSafeEqual } from "crypto";
import { isValidPhone, normalizePhone } from "./phone";
import { sendSms, smsReady } from "./sms";
import { readJson, writeJson } from "./store";

const TTL_MS = 10 * 60 * 1000;
const RESEND_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PHONE_HOUR = 4;
const MAX_SENDS_IP_HOUR = 10;

export type OtpPurpose = "register" | "update";

interface OtpEntry {
  phone: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
  used: boolean;
}

interface OtpState {
  codes: OtpEntry[];
  sends: { key: string; at: number }[];
}

const SECRET = process.env.JWT_SECRET || "squadra-calcio-secret-key-noldi-2026";

function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}:${SECRET}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function readState(): Promise<OtpState> {
  const now = Date.now();
  const parsed = await readJson<OtpState>("phone-otp", { codes: [], sends: [] });
  return {
    codes: (parsed.codes || []).filter((x) => x.expiresAt > now - TTL_MS),
    sends: (parsed.sends || []).filter((x) => now - x.at < 60 * 60 * 1000),
  };
}

async function writeState(state: OtpState) {
  await writeJson("phone-otp", state);
}

function countSends(state: OtpState, key: string) {
  return state.sends.filter((x) => x.key === key).length;
}

export async function sendPhoneCode(phoneRaw: string, purpose: OtpPurpose, ip = "") {
  if (!isValidPhone(phoneRaw)) {
    throw new Error("Inserisci un numero di cellulare valido");
  }
  const phone = normalizePhone(phoneRaw);
  const state = await readState();
  const now = Date.now();

  if (countSends(state, `p:${phone}`) >= MAX_SENDS_PHONE_HOUR) {
    throw new Error("Troppi SMS su questo numero. Riprova più tardi.");
  }
  if (ip && countSends(state, `ip:${ip}`) >= MAX_SENDS_IP_HOUR) {
    throw new Error("Troppi tentativi. Riprova più tardi.");
  }

  const existing = state.codes.find(
    (x) => x.phone === phone && x.purpose === purpose && !x.used && x.expiresAt > now
  );
  if (existing && now - existing.lastSentAt < RESEND_MS) {
    const wait = Math.ceil((RESEND_MS - (now - existing.lastSentAt)) / 1000);
    throw new Error(`Attendi ${wait} secondi prima di chiedere un altro codice`);
  }

  const canSendSms = await smsReady();
  const fallbackCode = "123456";
  const devFallback = process.env.NODE_ENV !== "production";
  let code = canSendSms
    ? String(randomInt(100000, 1000000))
    : devFallback
      ? fallbackCode
      : String(randomInt(100000, 1000000));

  const entry: OtpEntry = {
    phone,
    purpose,
    codeHash: hashCode(phone, code),
    expiresAt: now + TTL_MS,
    lastSentAt: now,
    attempts: 0,
    used: false,
  };
  state.codes = state.codes.filter((x) => !(x.phone === phone && x.purpose === purpose));
  state.codes.push(entry);
  state.sends.push({ key: `p:${phone}`, at: now });
  if (ip) state.sends.push({ key: `ip:${ip}`, at: now });

  if (canSendSms) {
    try {
      await sendSms(
        phone,
        `MIZZLI FC: il tuo codice è ${code}. Scade tra 10 minuti. Se non l'hai richiesto tu, ignora questo SMS.`
      );
      await writeState(state);
      return { ok: true as const, retryAfter: 60 } as const;
    } catch (err) {
      if (!devFallback) throw err;
      code = fallbackCode;
      entry.codeHash = hashCode(phone, code);
    }
  }

  if (!devFallback) {
    throw new Error("Invio SMS non riuscito. Riprova.");
  }

  await writeState(state);
  return {
    ok: true as const,
    retryAfter: 60,
    demoCode: fallbackCode,
    message: "Modalità demo: usa il codice 123456",
  } as const;
}

export async function consumePhoneCode(phoneRaw: string, codeRaw: string, purpose: OtpPurpose) {
  if (!isValidPhone(phoneRaw)) {
    throw new Error("Inserisci un numero di cellulare valido");
  }
  const phone = normalizePhone(phoneRaw);
  const code = String(codeRaw || "").replace(/\D/g, "");
  if (code.length !== 6) throw new Error("Inserisci il codice di 6 cifre ricevuto via SMS");

  const state = await readState();
  const now = Date.now();
  const idx = state.codes.findIndex(
    (x) => x.phone === phone && x.purpose === purpose && !x.used
  );
  if (idx < 0) throw new Error("Codice non valido o scaduto. Richiedine uno nuovo.");
  const entry = state.codes[idx];
  if (entry.expiresAt < now) {
    entry.used = true;
    await writeState(state);
    throw new Error("Codice scaduto. Richiedine uno nuovo.");
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.used = true;
    await writeState(state);
    throw new Error("Troppi tentativi. Richiedi un nuovo codice.");
  }
  entry.attempts += 1;
  if (!safeEqual(entry.codeHash, hashCode(phone, code))) {
    await writeState(state);
    throw new Error("Codice non corretto. Controlla l'SMS e riprova.");
  }
  entry.used = true;
  await writeState(state);
}
