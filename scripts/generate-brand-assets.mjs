import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = join(root, "public", "brand");
const playersDir = join(brandDir, "players");
mkdirSync(playersDir, { recursive: true });

function pngFromSvg(svg, width) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background: "rgba(0,0,0,0)",
  }).render().asPng();
}

function writePng(rel, svg, width) {
  const out = join(root, "public", rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, pngFromSvg(svg, width));
  console.log("wrote", rel, width);
}

const crestSvg = readFileSync(join(brandDir, "mizzli-crest.svg"), "utf8");
writePng("brand/mizzli-crest.png", crestSvg, 512);
writePng("icon-180.png", crestSvg, 180);
writePng("icon-192.png", crestSvg, 192);
writePng("icon-512.png", crestSvg, 512);
writePng("apple-touch-icon.png", crestSvg, 180);
writePng("favicon.png", crestSvg, 64);

const roles = {
  gk: { letter: "P", bg: "#c9a227", fg: "#1a1208", label: "POR" },
  df: { letter: "D", bg: "#1e4d8c", fg: "#f4f7fb", label: "DIF" },
  mf: { letter: "C", bg: "#1f6b3a", fg: "#f4f7fb", label: "CEN" },
  fw: { letter: "A", bg: "#8c1e3a", fg: "#f4f7fb", label: "ATT" },
};

function playerSvg({ letter, bg, fg }, size) {
  const stroke = size >= 400 ? 18 : 10;
  const font = Math.round(size * 0.42);
  const cy = Math.round(size * 0.58);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="#0b0b0b"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="url(#bg)"/>
  <circle cx="${size / 2}" cy="${size * 0.32}" r="${size * 0.16}" fill="${fg}" opacity="0.92"/>
  <path d="M${size * 0.22} ${size * 0.92} C${size * 0.22} ${size * 0.58}, ${size * 0.78} ${size * 0.58}, ${size * 0.78} ${size * 0.92} Z" fill="${fg}" opacity="0.92"/>
  <text x="${size / 2}" y="${cy}" text-anchor="middle" font-size="${font}" font-family="Arial Black, Impact, sans-serif" fill="${bg}" stroke="#000" stroke-width="${stroke / 6}" paint-order="stroke">${letter}</text>
  <rect x="${stroke / 2}" y="${stroke / 2}" width="${size - stroke}" height="${size - stroke}" rx="${Math.round(size * 0.16)}" fill="none" stroke="#ffd700" stroke-width="${stroke / 3}" opacity="0.7"/>
</svg>`;
}

for (const [key, role] of Object.entries(roles)) {
  writePng(`brand/players/player-${key}.jpg`.replace(".jpg", ".png"), playerSvg(role, 512), 512);
  writePng(`brand/players/thumb-${key}.png`, playerSvg(role, 256), 256);
}
