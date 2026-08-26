import { normalizePhone } from "./phone";
import { getSmsConfig, smsConfigured, twilioReady } from "./sms-store";

export async function smsReady() {
  const config = await getSmsConfig();
  if (!config.enabled) return false;
  return smsConfigured(config);
}

export async function sendSms(to: string, body: string) {
  const config = await getSmsConfig();
  if (!config.enabled) {
    throw new Error("Invio SMS disattivato.");
  }
  const phone = normalizePhone(to);
  if (!phone) throw new Error("Numero di cellulare non valido");

  if (twilioReady(config)) {
    try {
      await sendViaTwilio(config.accountSid, config.authToken, config.fromNumber, phone, body);
      return;
    } catch {
      if (!config.textbeltKey) throw new Error("Invio SMS non riuscito. Riprova.");
    }
  }

  if (config.textbeltKey) {
    await sendViaTextbelt(config.textbeltKey, phone, body);
    return;
  }

  throw new Error("Invio SMS non riuscito. Riprova.");
}

async function sendViaTwilio(
  sid: string,
  token: string,
  from: string,
  phone: string,
  body: string
) {
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: `+${phone}`,
      From: from,
      Body: body,
    }),
  });
  if (!res.ok) {
    const details = await res.text().catch(() => "");
    if (/unverified|trial/i.test(details)) {
      throw new Error("Questo numero non può ricevere SMS dal servizio attuale.");
    }
    throw new Error("Invio SMS non riuscito. Riprova.");
  }
}

async function sendViaTextbelt(key: string, phone: string, body: string) {
  const res = await fetch("https://textbelt.com/text", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      phone: `+${phone}`,
      message: body,
      key,
      sender: "MIZZLI FC",
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    quotaRemaining?: number;
  };
  if (data.success) return;
  const err = String(data.error || "");
  if (/quota|disabled|exceed/i.test(err)) {
    throw new Error("Limite SMS raggiunto. Riprova più tardi.");
  }
  throw new Error("Invio SMS non riuscito. Riprova.");
}
