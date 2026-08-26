import { readJson, writeJson } from "./store";

const FREE_KEY = "textbelt";

export interface SmsConfig {
  enabled: boolean;
  accountSid: string;
  authToken: string;
  fromNumber: string;
  textbeltKey: string;
}

export function smsConfigured(config: SmsConfig) {
  const key = config.textbeltKey?.trim() || "";
  return twilioReady(config) || (Boolean(key) && key !== FREE_KEY);
}

export function defaultSmsConfig(): SmsConfig {
  const hasEnvCreds = Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() ||
      process.env.TEXTBELT_API_KEY?.trim()
  );
  return {
    enabled: hasEnvCreds,
    accountSid: process.env.TWILIO_ACCOUNT_SID?.trim() || "",
    authToken: process.env.TWILIO_AUTH_TOKEN?.trim() || "",
    fromNumber: process.env.TWILIO_FROM?.trim() || "",
    textbeltKey: process.env.TEXTBELT_API_KEY?.trim() || "",
  };
}

export async function getSmsConfig(): Promise<SmsConfig> {
  const env = defaultSmsConfig();
  const parsed = await readJson<Partial<SmsConfig>>("sms", {});
  return {
    enabled: parsed.enabled ?? env.enabled,
    accountSid: parsed.accountSid || env.accountSid,
    authToken: parsed.authToken || env.authToken,
    fromNumber: parsed.fromNumber || env.fromNumber,
    textbeltKey: parsed.textbeltKey ?? env.textbeltKey ?? "",
  };
}

export async function saveSmsConfig(config: SmsConfig) {
  await writeJson("sms", config);
  return config;
}

export function twilioReady(config: SmsConfig) {
  return Boolean(config.accountSid && config.authToken && config.fromNumber);
}

export function publicSmsConfig(config: SmsConfig) {
  const key = config.textbeltKey?.trim() || "";
  return {
    enabled: config.enabled,
    fromNumber: config.fromNumber,
    accountSid: config.accountSid,
    hasAuthToken: Boolean(config.authToken),
    hasTextbeltKey: Boolean(key) && key !== FREE_KEY,
    configured: Boolean(config.enabled && smsConfigured(config)),
  };
}
