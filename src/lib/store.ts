import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
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
  await ensureDir();
  const filePath = path.join(DATA_DIR, `${key}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") return fallback;
    // Corrupt/partial read: do not invent empty data that overwrites later.
    throw err;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
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
