import { promises as fs } from "fs";
import path from "path";
import { getPool, isDatabaseEnabled } from "./pool";

const SCHEMA_PATH = path.join(process.cwd(), "src/lib/db/schema.sql");

export async function ensureSchema(): Promise<void> {
  if (!isDatabaseEnabled()) return;

  const sql = await fs.readFile(SCHEMA_PATH, "utf-8");
  const pool = getPool();
  await pool.query(sql);
}

export async function importJsonFilesIfEmpty(): Promise<number> {
  if (!isDatabaseEnabled()) return 0;

  const pool = getPool();
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM app_kv"
  );
  if (Number(rows[0]?.count || 0) > 0) return 0;

  const dataDir = path.join(process.cwd(), "data");
  let imported = 0;

  try {
    const files = await fs.readdir(dataDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const key = file.replace(/\.json$/, "");
      const raw = await fs.readFile(path.join(dataDir, file), "utf-8");
      const value = JSON.parse(raw) as unknown;
      await pool.query(
        `INSERT INTO app_kv (key, value, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO NOTHING`,
        [key, JSON.stringify(value)]
      );
      imported += 1;
    }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT") throw err;
  }

  return imported;
}
