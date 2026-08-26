const APPLE_MODELS: Record<string, string> = {
  "iPhone1,1": "iPhone",
  "iPhone1,2": "iPhone 3G",
  "iPhone2,1": "iPhone 3GS",
  "iPhone3,1": "iPhone 4",
  "iPhone3,2": "iPhone 4",
  "iPhone3,3": "iPhone 4",
  "iPhone4,1": "iPhone 4s",
  "iPhone5,1": "iPhone 5",
  "iPhone5,2": "iPhone 5",
  "iPhone5,3": "iPhone 5c",
  "iPhone5,4": "iPhone 5c",
  "iPhone6,1": "iPhone 5s",
  "iPhone6,2": "iPhone 5s",
  "iPhone7,1": "iPhone 6 Plus",
  "iPhone7,2": "iPhone 6",
  "iPhone8,1": "iPhone 6s",
  "iPhone8,2": "iPhone 6s Plus",
  "iPhone8,4": "iPhone SE (1ª gen)",
  "iPhone9,1": "iPhone 7",
  "iPhone9,2": "iPhone 7 Plus",
  "iPhone9,3": "iPhone 7",
  "iPhone9,4": "iPhone 7 Plus",
  "iPhone10,1": "iPhone 8",
  "iPhone10,2": "iPhone 8 Plus",
  "iPhone10,3": "iPhone X",
  "iPhone10,4": "iPhone 8",
  "iPhone10,5": "iPhone 8 Plus",
  "iPhone10,6": "iPhone X",
  "iPhone11,2": "iPhone XS",
  "iPhone11,4": "iPhone XS Max",
  "iPhone11,6": "iPhone XS Max",
  "iPhone11,8": "iPhone XR",
  "iPhone12,1": "iPhone 11",
  "iPhone12,3": "iPhone 11 Pro",
  "iPhone12,5": "iPhone 11 Pro Max",
  "iPhone12,8": "iPhone SE (2ª gen)",
  "iPhone13,1": "iPhone 12 mini",
  "iPhone13,2": "iPhone 12",
  "iPhone13,3": "iPhone 12 Pro",
  "iPhone13,4": "iPhone 12 Pro Max",
  "iPhone14,2": "iPhone 13 Pro",
  "iPhone14,3": "iPhone 13 Pro Max",
  "iPhone14,4": "iPhone 13 mini",
  "iPhone14,5": "iPhone 13",
  "iPhone14,6": "iPhone SE (3ª gen)",
  "iPhone14,7": "iPhone 14",
  "iPhone14,8": "iPhone 14 Plus",
  "iPhone15,2": "iPhone 14 Pro",
  "iPhone15,3": "iPhone 14 Pro Max",
  "iPhone15,4": "iPhone 15",
  "iPhone15,5": "iPhone 15 Plus",
  "iPhone16,1": "iPhone 15 Pro",
  "iPhone16,2": "iPhone 15 Pro Max",
  "iPhone17,1": "iPhone 16 Pro",
  "iPhone17,2": "iPhone 16 Pro Max",
  "iPhone17,3": "iPhone 16",
  "iPhone17,4": "iPhone 16 Plus",
  "iPhone17,5": "iPhone 16e",
  "iPhone18,1": "iPhone 17 Pro",
  "iPhone18,2": "iPhone 17 Pro Max",
  "iPhone18,3": "iPhone 17",
  "iPhone18,4": "iPhone Air",
  "iPad4,1": "iPad Air",
  "iPad5,3": "iPad Air 2",
  "iPad11,3": "iPad Air (3ª gen)",
  "iPad13,1": "iPad Air (4ª gen)",
  "iPad13,16": "iPad Air (5ª gen)",
  "iPad14,8": "iPad Air (M2)",
  "iPad6,7": "iPad Pro 12.9",
  "iPad7,1": "iPad Pro 12.9 (2ª gen)",
  "iPad8,1": "iPad Pro 11",
  "iPad8,5": "iPad Pro 12.9 (3ª gen)",
  "iPad8,9": "iPad Pro 11 (2ª gen)",
  "iPad8,11": "iPad Pro 12.9 (4ª gen)",
  "iPad13,4": "iPad Pro 11 (3ª gen)",
  "iPad13,8": "iPad Pro 12.9 (5ª gen)",
  "iPad14,3": "iPad Pro 11 (4ª gen)",
  "iPad14,5": "iPad Pro 12.9 (6ª gen)",
  "iPad16,3": "iPad Pro 11 (M4)",
  "iPad16,5": "iPad Pro 13 (M4)",
};

const SAMSUNG_MODELS: Record<string, string> = {
  "SM-S911B": "Samsung Galaxy S23",
  "SM-S911U": "Samsung Galaxy S23",
  "SM-S916B": "Samsung Galaxy S23+",
  "SM-S918B": "Samsung Galaxy S23 Ultra",
  "SM-S921B": "Samsung Galaxy S24",
  "SM-S926B": "Samsung Galaxy S24+",
  "SM-S928B": "Samsung Galaxy S24 Ultra",
  "SM-S931B": "Samsung Galaxy S25",
  "SM-S936B": "Samsung Galaxy S25+",
  "SM-S938B": "Samsung Galaxy S25 Ultra",
  "SM-F731B": "Samsung Galaxy Z Flip5",
  "SM-F741B": "Samsung Galaxy Z Flip6",
  "SM-F946B": "Samsung Galaxy Z Fold5",
  "SM-F956B": "Samsung Galaxy Z Fold6",
  "SM-A546B": "Samsung Galaxy A54",
  "SM-A556B": "Samsung Galaxy A55",
  "SM-A356B": "Samsung Galaxy A35",
};

function lookupCode(code: string) {
  const key = code.trim();
  return APPLE_MODELS[key] || SAMSUNG_MODELS[key] || SAMSUNG_MODELS[key.toUpperCase()];
}

function fromUserAgent(ua: string) {
  const samsung = ua.match(/\b(SM-[A-Z0-9]+)\b/i);
  if (samsung?.[1]) {
    return lookupCode(samsung[1]) || `Samsung ${samsung[1]}`;
  }
  const pixel = ua.match(/\b(Pixel [^;/)]+)/);
  if (pixel?.[1]) return pixel[1].trim();
  const hw = ua.match(/\b(iPhone\d+,\d+|iPad\d+,\d+)\b/);
  if (hw?.[1]) return lookupCode(hw[1]);
  const android = ua.match(/Android [^;]+; ([^)]+) Build\//);
  if (android?.[1] && android[1] !== "wv") {
    const raw = android[1].replace(/^Linux; /, "").trim();
    return lookupCode(raw) || raw;
  }
  return undefined;
}

export function resolvePhoneModel(input: {
  hardware?: string;
  uaModel?: string;
  manufacturer?: string;
  userAgent?: string;
  headerModel?: string;
}) {
  const candidates = [
    input.hardware,
    input.uaModel,
    input.headerModel,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  for (const code of candidates) {
    const named = lookupCode(code);
    if (named) return named;
  }

  const fromUa = input.userAgent ? fromUserAgent(input.userAgent) : undefined;
  if (fromUa) return fromUa;

  for (const code of candidates) {
    if (code && code !== "Unknown" && code !== "undefined") {
      const maker = input.manufacturer && input.manufacturer !== "unknown" ? `${input.manufacturer} ` : "";
      return `${maker}${code}`.trim();
    }
  }
  return undefined;
}
