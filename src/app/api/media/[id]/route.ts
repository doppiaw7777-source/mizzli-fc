import { NextRequest, NextResponse } from "next/server";
import { getMedia, updateMediaBytes } from "@/lib/media-store";
import { compressImageBuffer } from "@/lib/compress-image";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const media = await getMedia(id);
  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  let bytes = media.bytes;
  let type = media.contentType;
  if (bytes.length > 90_000 && type.startsWith("image/") && type !== "image/svg+xml" && type !== "image/gif") {
    const compact = await compressImageBuffer(bytes);
    if (compact.bytes.length && compact.bytes.length < bytes.length) {
      bytes = compact.bytes;
      type = compact.contentType || "image/jpeg";
      void updateMediaBytes(id, bytes, type, media.filename.replace(/\.\w+$/, ".jpg"));
    }
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${media.filename.replace(/"/g, "")}"`,
    },
  });
}
