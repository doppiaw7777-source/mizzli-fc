import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function safeFilename(filename: string): string {
  return `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
}

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

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  if (!supabase) supabase = createClient(url, key);
  return supabase;
}

async function saveToSupabase(buffer: Buffer, filename: string): Promise<string> {
  const client = getSupabase();
  if (!client) throw new Error("Supabase non configurato");

  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "uploads";
  const objectKey = safeFilename(filename);
  const contentType = contentTypeFromName(filename);

  const { error } = await client.storage.from(bucket).upload(objectKey, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;

  const { data } = client.storage.from(bucket).getPublicUrl(objectKey);
  return data.publicUrl;
}

async function saveToS3(buffer: Buffer, filename: string): Promise<string> {
  const bucket = process.env.S3_BUCKET?.trim();
  const region = process.env.S3_REGION?.trim() || "auto";
  const accessKey = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const publicBase = process.env.S3_PUBLIC_BASE_URL?.trim();

  if (!bucket || !accessKey || !secretKey) {
    throw new Error("S3 non configurato");
  }

  const endpoint = process.env.S3_ENDPOINT?.trim();
  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  });

  const objectKey = safeFilename(filename);
  const putInput: {
    Bucket: string;
    Key: string;
    Body: Buffer;
    ContentType: string;
    ACL?: string;
  } = {
    Bucket: bucket,
    Key: objectKey,
    Body: buffer,
    ContentType: contentTypeFromName(filename),
  };
  const acl = process.env.S3_ACL?.trim();
  if (acl) putInput.ACL = acl;

  await client.send(new PutObjectCommand(putInput));

  if (publicBase) {
    return `${publicBase.replace(/\/$/, "")}/${objectKey}`;
  }
  if (endpoint) {
    return `${endpoint.replace(/\/$/, "")}/${bucket}/${objectKey}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
}

async function saveToLocal(buffer: Buffer, filename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const safeName = safeFilename(filename);
  await fs.writeFile(path.join(uploadsDir, safeName), buffer);
  return `/uploads/${safeName}`;
}

export type StorageBackend = "supabase" | "s3" | "local";

export function getStorageBackend(): StorageBackend {
  if (getSupabase()) return "supabase";
  if (process.env.S3_BUCKET?.trim() && process.env.S3_ACCESS_KEY_ID?.trim()) {
    return "s3";
  }
  return "local";
}

export async function saveUploadedImage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const backend = getStorageBackend();
  switch (backend) {
    case "supabase":
      return saveToSupabase(buffer, filename);
    case "s3":
      return saveToS3(buffer, filename);
    default:
      return saveToLocal(buffer, filename);
  }
}
