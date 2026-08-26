import { promises as fs } from "fs";
import path from "path";
import { getPool, isDatabaseEnabled } from "./db/pool";
import { ensureSchema } from "./db/migrate";

const DATA_DIR = path.join(process.cwd(), "data");
let schemaReady = false;

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function ensureDb() {
  if (!isDatabaseEnabled() || schemaReady) return;
  await ensureSchema();
  schemaReady = true;
}

async function atomicWrite(filePath: string, contents: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
  );
  await fs.writeFile(tmp, contents, "utf-8");
  await fs.rename(tmp, filePath);
}

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  if (isDatabaseEnabled()) {
    await ensureDb();
    const pool = getPool();
    const { rows } = await pool.query<{ value: T }>(
      "SELECT value FROM app_kv WHERE key = $1",
      [key]
    );
    if (rows.length === 0) return fallback;
    return rows[0].value;
  }

  await ensureDir();
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") return fallback;
    throw err;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  if (isDatabaseEnabled()) {
    await ensureDb();
    const pool = getPool();
    await pool.query(
      `INSERT INTO app_kv (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
    return;
  }

  await ensureDir();
  await atomicWrite(
    path.join(DATA_DIR, `${key}.json`),
    JSON.stringify(value, null, 2)
  );
}

export async function readJsonWithTtl<T>(key: string, fallback: T): Promise<T> {
  return readJson(key, fallback);
}

export async function writeJsonWithTtl<T>(key: string, value: T): Promise<void> {
  await writeJson(key, value);
}

export { atomicWrite, DATA_DIR };
