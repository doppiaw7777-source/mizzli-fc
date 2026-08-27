import { randomUUID } from "crypto";
import { getPool, isDatabaseEnabled } from "./db/pool";
import { ensureSchema } from "./db/migrate";

export type StoredMedia = {
  id: string;
  filename: string;
  contentType: string;
  bytes: Buffer;
};

function contentTypeFromName(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
}

export async function saveMedia(
  buffer: Buffer,
  filename: string,
  contentType?: string
): Promise<string> {
  if (!isDatabaseEnabled()) {
    throw new Error("Database non disponibile per le foto");
  }
  await ensureSchema();
  const id = randomUUID();
  const type = contentType || contentTypeFromName(filename);
  const pool = getPool();
  await pool.query(
    `INSERT INTO app_media (id, filename, content_type, bytes)
     VALUES ($1, $2, $3, $4)`,
    [id, filename.slice(0, 180), type, buffer]
  );
  return `/api/media/${id}`;
}

export async function getMedia(id: string): Promise<StoredMedia | null> {
  if (!isDatabaseEnabled()) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  await ensureSchema();
  const pool = getPool();
  const { rows } = await pool.query<{
    id: string;
    filename: string;
    content_type: string;
    bytes: Buffer;
  }>("SELECT id, filename, content_type, bytes FROM app_media WHERE id = $1", [id]);
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    filename: rows[0].filename,
    contentType: rows[0].content_type,
  bytes: Buffer.from(rows[0].bytes),
  };
}
