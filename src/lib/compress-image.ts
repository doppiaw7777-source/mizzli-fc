import type { Buffer as NodeBuffer } from "buffer";

export async function compressImageBuffer(
  input: Buffer,
  maxEdge = 900,
  quality = 72
): Promise<{ bytes: Buffer; contentType: string }> {
  try {
    const sharp = (await import("sharp")).default;
    const bytes = await sharp(input)
      .rotate()
      .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
    if (bytes.length && bytes.length < input.length * 0.98) {
      return { bytes, contentType: "image/jpeg" };
    }
    if (bytes.length && bytes.length <= 90_000) {
      return { bytes, contentType: "image/jpeg" };
    }
  } catch {
    /* sharp assente: lascia originale */
  }
  return { bytes: input, contentType: "" };
}
