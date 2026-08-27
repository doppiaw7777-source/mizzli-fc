import { straightenLogo } from "@/lib/logo-edit";

async function bitmapFrom(source: File | Blob | string) {
  if (typeof source !== "string") {
    try {
      return await createImageBitmap(source, {
        imageOrientation: "from-image",
      } as ImageBitmapOptions);
    } catch {
      // fall through to HTMLImageElement
    }
  }
  const img = new Image();
  const src = typeof source === "string" ? source : URL.createObjectURL(source);
  if (!src.startsWith("data:") && !src.startsWith("blob:")) img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Immagine non caricabile"));
    img.src = src;
  });
  if (typeof source !== "string") URL.revokeObjectURL(src);
  return img;
}

function drawToImageData(source: CanvasImageSource, w: number, h: number) {
  const canvas = document.createElement("canvas");
  const max = 720;
  const scale = Math.min(1, max / Math.max(w, h));
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return { canvas, data: ctx.getImageData(0, 0, canvas.width, canvas.height) };
}

/** Orient, strip background, crop and center the crest in a square PNG. */
export async function straightenLogoFile(file: File, teamName: string): Promise<File> {
  const bmp = await bitmapFrom(file);
  const w = "width" in bmp ? Number(bmp.width) : (bmp as ImageBitmap).width;
  const h = "height" in bmp ? Number(bmp.height) : (bmp as ImageBitmap).height;
  const { canvas, data } = drawToImageData(bmp, w, h);
  if ("close" in bmp && typeof bmp.close === "function") bmp.close();
  const straight = straightenLogo(data);
  canvas.width = straight.width;
  canvas.height = straight.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");
  ctx.putImageData(straight, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Esportazione fallita"))), "image/png");
  });
  const safe = teamName.replace(/[^\w-]+/g, "-").slice(0, 40) || "logo";
  return new File([blob], `${safe}-logo.png`, { type: "image/png" });
}
