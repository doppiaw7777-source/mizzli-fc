import { apiFetch } from "./api";

const MAX_BASE64_SIZE = 1.5 * 1024 * 1024;

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size < 120_000 && (file.type === "image/jpeg" || file.type === "image/webp")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 960;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.72
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

async function postFile(file: File): Promise<{ url: string | null; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiFetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      return { url: data.url, message: "Immagine caricata" };
    }
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) {
      return { url: null, message: err.error || "Sessione scaduta. Rientra in Admin." };
    }
  } catch {
    /* fallback */
  }

  if (file.size <= MAX_BASE64_SIZE) {
    const url = await readFileAsDataURL(file);
    return { url, message: "Immagine salvata. Pubblica per confermare." };
  }

  return {
    url: null,
    message: "Immagine troppo grande per il salvataggio di riserva.",
  };
}

export async function uploadImageWithFallback(
  file: File
): Promise<{ url: string | null; message?: string }> {
  if (!file || file.size === 0) return { url: null, message: "File non valido" };
  if (!file.type.startsWith("image/")) {
    return { url: null, message: "Seleziona un file immagine (JPG, PNG, WEBP)" };
  }
  return postFile(await compressImage(file));
}

export async function uploadOriginalImage(
  file: File
): Promise<{ url: string | null; message?: string }> {
  if (!file || file.size === 0) return { url: null, message: "File non valido" };
  if (!file.type.startsWith("image/")) {
    return { url: null, message: "Seleziona un file immagine (JPG, PNG, WEBP)" };
  }
  return postFile(file);
}

export function isValidImageUrl(value: string) {
  if (!value.trim()) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("/uploads/") ||
    value.startsWith("/")
  );
}
