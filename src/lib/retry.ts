export async function withRetry<T>(
  fn: () => Promise<T>,
  tries = 3,
  baseMs = 400
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i += 1) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (i === tries - 1) break;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** i));
    }
  }
  throw last;
}

export function retryAfterSeconds(attempt: number) {
  return Math.min(60, 2 ** Math.max(0, attempt));
}
