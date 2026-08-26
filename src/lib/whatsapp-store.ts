import { randomBytes } from "crypto";
import { readJson, writeJson } from "./store";

export interface WhatsAppLogItem {
  at: string;
  from: string;
  text: string;
  ok: boolean;
  detail: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  phone: string;
  allowedFrom: string[];
  ingestToken: string;
  verifyToken: string;
  cloudAccessToken: string;
  cloudPhoneNumberId: string;
  log: WhatsAppLogItem[];
}

function freshTokens(): Pick<WhatsAppConfig, "ingestToken" | "verifyToken"> {
  return {
    ingestToken: randomBytes(24).toString("hex"),
    verifyToken: randomBytes(12).toString("hex"),
  };
}

export function defaultWhatsAppConfig(): WhatsAppConfig {
  return {
    enabled: true,
    phone: "",
    allowedFrom: [],
    ...freshTokens(),
    cloudAccessToken: "",
    cloudPhoneNumberId: "",
    log: [],
  };
}

export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  const parsed = await readJson<Partial<WhatsAppConfig>>("whatsapp", {});
  const base = defaultWhatsAppConfig();
  if (!parsed || !parsed.ingestToken) {
    await writeJson("whatsapp", base);
    return base;
  }
  return {
    ...base,
    ...parsed,
    ingestToken: parsed.ingestToken || base.ingestToken,
    verifyToken: parsed.verifyToken || base.verifyToken,
    allowedFrom: Array.isArray(parsed.allowedFrom) ? parsed.allowedFrom : [],
    log: Array.isArray(parsed.log) ? parsed.log.slice(0, 30) : [],
  };
}

export async function saveWhatsAppConfig(config: WhatsAppConfig) {
  const next = {
    ...config,
    log: (config.log || []).slice(0, 30),
  };
  await writeJson("whatsapp", next);
  return next;
}

export async function appendWhatsAppLog(item: WhatsAppLogItem) {
  const config = await getWhatsAppConfig();
  config.log = [item, ...config.log].slice(0, 30);
  await saveWhatsAppConfig(config);
  return config;
}

export function publicWhatsAppConfig(config: WhatsAppConfig) {
  return {
    enabled: config.enabled,
    phone: config.phone,
    allowedFrom: config.allowedFrom,
    ingestToken: config.ingestToken,
    verifyToken: config.verifyToken,
    cloudPhoneNumberId: config.cloudPhoneNumberId,
    hasCloudToken: Boolean(config.cloudAccessToken),
    log: config.log,
  };
}
