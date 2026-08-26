/** Optional Redis helpers. Unused unless KV env vars are set. */

export function isKvConfigured(): boolean {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return Boolean(url && token);
}

export async function kvGet<T>(_key: string): Promise<T | null> {
  return null;
}

export async function kvSet<T>(_key: string, _value: T, _ttlSeconds?: number): Promise<void> {}

export async function kvDel(_key: string): Promise<void> {}
