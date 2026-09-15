export type PhotoFit = {
  photoFocusX: number;
  photoFocusY: number;
  photoZoom: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Foto non leggibile"));
    img.src = src;
  });
}

type Box = { x: number; y: number; w: number; h: number };

async function detectFaceBox(img: HTMLImageElement): Promise<Box | null> {
  const FaceDetectorCtor = (
    window as Window & {
      FaceDetector?: new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
        detect: (image: HTMLImageElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
      };
    }
  ).FaceDetector;
  if (!FaceDetectorCtor) return null;
  try {
    const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 });
    const faces = await detector.detect(img);
    const box = faces[0]?.boundingBox;
    if (!box || box.width < 8 || box.height < 8) return null;
    return { x: box.x, y: box.y, w: box.width, h: box.height };
  } catch {
    return null;
  }
}

function guessSubjectBox(img: HTMLImageElement): Box {
  const w = 64;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { x: img.width * 0.25, y: img.height * 0.08, w: img.width * 0.5, h: img.height * 0.35 };
  }
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let hits = 0;
  for (let y = 0; y < Math.floor(h * 0.72); y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const skin =
        r > 80 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        r - g > 12 &&
        Math.abs(g - b) < 55;
      if (!skin) continue;
      hits += 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (hits < 18) {
    return { x: img.width * 0.22, y: img.height * 0.06, w: img.width * 0.56, h: img.height * 0.38 };
  }
  const pad = 3;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  return {
    x: (minX / w) * img.width,
    y: (minY / h) * img.height,
    w: ((maxX - minX) / w) * img.width,
    h: ((maxY - minY) / h) * img.height,
  };
}

function fitFromBox(img: HTMLImageElement, box: Box): PhotoFit {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h * 0.38;
  const faceRatio = box.h / img.height;
  let zoom = 118;
  if (faceRatio < 0.12) zoom = 210;
  else if (faceRatio < 0.2) zoom = 175;
  else if (faceRatio < 0.32) zoom = 145;
  else if (faceRatio < 0.45) zoom = 122;
  else zoom = 105;
  const tall = img.height / Math.max(1, img.width);
  if (tall > 1.45) zoom = Math.min(240, zoom + 18);
  if (tall < 0.9) zoom = Math.max(100, zoom - 10);
  return {
    photoFocusX: Math.round(clamp((cx / img.width) * 100, 0, 100)),
    photoFocusY: Math.round(clamp((cy / img.height) * 100, 0, 100)),
    photoZoom: Math.round(clamp(zoom, 80, 280)),
  };
}

export async function autoPhotoFit(src: string): Promise<PhotoFit> {
  const fallback: PhotoFit = { photoFocusX: 50, photoFocusY: 18, photoZoom: 118 };
  if (!src || typeof window === "undefined") return fallback;
  try {
    const img = await loadImage(src);
    const face = (await detectFaceBox(img)) || guessSubjectBox(img);
    return fitFromBox(img, face);
  } catch {
    return fallback;
  }
}
