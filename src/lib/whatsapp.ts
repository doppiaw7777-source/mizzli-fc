import { getTeamData, saveTeamData } from "./storage";
import { saveMatchLivesStore, livesStoreFromTeam } from "./match-lives-store";
import { appendWhatsAppLog, getWhatsAppConfig, type WhatsAppConfig } from "./whatsapp-store";
import {
  applyWhatsAppResult,
  normalizePhone,
  parseWhatsAppResult,
} from "./whatsapp-results";

export async function ingestWhatsAppText(text: string, from = "") {
  const config = await getWhatsAppConfig();
  if (!config.enabled) {
    return { ok: false as const, error: "Automazione WhatsApp disattivata" };
  }

  const fromDigits = normalizePhone(from);
  const allowed = config.allowedFrom.map(normalizePhone).filter(Boolean);
  if (allowed.length > 0 && fromDigits && !allowed.includes(fromDigits)) {
    await appendWhatsAppLog({
      at: new Date().toISOString(),
      from: fromDigits,
      text,
      ok: false,
      detail: "Numero non autorizzato",
    });
    return { ok: false as const, error: "Numero non autorizzato" };
  }

  const parsed = parseWhatsAppResult(text);
  if (!parsed) {
    const error =
      "Non ho letto un risultato. Scrivi ad esempio: risultato 2-1 oppure 2-1 vs Nola";
    await appendWhatsAppLog({
      at: new Date().toISOString(),
      from: fromDigits,
      text,
      ok: false,
      detail: error,
    });
    return { ok: false as const, error };
  }

  const team = await getTeamData();
  const applied = applyWhatsAppResult(team, parsed);
  if (!applied.ok) {
    await appendWhatsAppLog({
      at: new Date().toISOString(),
      from: fromDigits,
      text,
      ok: false,
      detail: applied.error,
    });
    return applied;
  }

  await saveMatchLivesStore(livesStoreFromTeam(applied.data));
  await saveTeamData(applied.data);
  await appendWhatsAppLog({
    at: new Date().toISOString(),
    from: fromDigits,
    text,
    ok: true,
    detail: applied.message,
  });
  return applied;
}

export async function replyOnWhatsApp(config: WhatsAppConfig, to: string, body: string) {
  if (!config.cloudAccessToken || !config.cloudPhoneNumberId || !to) return;
  const phone = normalizePhone(to);
  if (!phone) return;
  await fetch(`https://graph.facebook.com/v21.0/${config.cloudPhoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.cloudAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body },
    }),
  });
}

export function waMeLink(phone: string, text = "Risultato 2-1") {
  const digits = normalizePhone(phone);
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
