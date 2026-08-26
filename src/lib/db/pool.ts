import { Pool, type PoolConfig } from "pg";

let pool: Pool | null = null;

export function isDatabaseEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getPool(): Pool {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL non configurato");
  }

  if (!pool) {
    const config: PoolConfig = { connectionString: url };
    if (process.env.NODE_ENV === "production") {
      config.ssl = { rejectUnauthorized: false };
    }
    pool = new Pool(config);
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
