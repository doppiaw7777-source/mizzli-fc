export function normalizePhone(value: string) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("3")) digits = `39${digits}`;
  return digits;
}

export function isValidPhone(value: string) {
  const digits = normalizePhone(value);
  if (digits.startsWith("39")) return /^393\d{9}$/.test(digits);
  return digits.length >= 8 && digits.length <= 15;
}

export function maskPhone(value?: string | null) {
  const digits = normalizePhone(value || "");
  if (!digits) return "";
  const last = digits.slice(-3);
  return `+${digits.slice(0, -3).replace(/\d/g, "•")}${last}`;
}

export function formatItPhone(value?: string | null) {
  const digits = normalizePhone(value || "");
  if (!digits) return "";
  if (digits.startsWith("39") && digits.length >= 11) {
    const local = digits.slice(2);
    if (local.length === 10) {
      return `+39 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
    }
    return `+39 ${local}`;
  }
  return `+${digits}`;
}

export function phoneLabel(value?: string | null) {
  return formatItPhone(value) || "Non associato";
}
