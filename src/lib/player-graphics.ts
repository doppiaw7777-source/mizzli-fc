export const DEFAULT_PLAYER_GRAPHIC = "orb";

export type PlayerGraphicId =
  | "orb"
  | "hex"
  | "tile"
  | "ring"
  | "pill"
  | "glass"
  | "neon"
  | "crest"
  | "stripe"
  | "diamond"
  | "shield"
  | "minimal"
  | "stack"
  | "dot"
  | "medal"
  | "pixel"
  | "outline"
  | "split"
  | "ticker"
  | "halo"
  | "flag"
  | "cube"
  | "capsule"
  | "stamp"
  | "radar"
  | "eclipse"
  | "prism"
  | "carbon"
  | "seal"
  | "pulse";

export interface PlayerGraphic {
  id: PlayerGraphicId;
  name: string;
  description: string;
  photo: boolean;
}

export const PLAYER_GRAPHICS: PlayerGraphic[] = [
  { id: "orb", name: "Sfera", description: "Chip tondo da app, foto e numero", photo: true },
  { id: "hex", name: "Esagono", description: "Tattica, taglio esagonale", photo: true },
  { id: "tile", name: "Tile", description: "Quadrato morbido, look UI", photo: true },
  { id: "ring", name: "Anello", description: "Numero nel cerchio vuoto", photo: false },
  { id: "pill", name: "Pill", description: "Capsula da stadio", photo: false },
  { id: "glass", name: "Vetro", description: "Vetro smerigliato", photo: true },
  { id: "neon", name: "Neon", description: "Anello luminoso", photo: true },
  { id: "crest", name: "Stemma", description: "Foto con stemma in filigrana", photo: true },
  { id: "stripe", name: "Strisce", description: "Pannello a strisce club", photo: false },
  { id: "diamond", name: "Diamante", description: "Rombo da copertina", photo: true },
  { id: "shield", name: "Scudo", description: "Badge da stemma", photo: true },
  { id: "minimal", name: "Minimal", description: "Solo il numero, pulito", photo: false },
  { id: "stack", name: "Stack", description: "Numero grande e ruolo", photo: false },
  { id: "dot", name: "Dot", description: "Pallino compatto", photo: false },
  { id: "medal", name: "Medaglia", description: "Cerchio a doppio bordo", photo: true },
  { id: "pixel", name: "Pixel", description: "Quadrato 8-bit", photo: false },
  { id: "outline", name: "Outline", description: "Solo il bordo, aria", photo: false },
  { id: "split", name: "Split", description: "Due colori, taglio netto", photo: false },
  { id: "ticker", name: "Ticker", description: "Barra numero da tabellone", photo: false },
  { id: "halo", name: "Halo", description: "Doppio anello", photo: true },
  { id: "flag", name: "Bandiera", description: "Rettangolo verticale", photo: true },
  { id: "cube", name: "Cubo", description: "Angoli vivi, look tech", photo: true },
  { id: "capsule", name: "Capsula", description: "Ovale da maglia", photo: false },
  { id: "stamp", name: "Timbro", description: "Timbro da convocazione", photo: false },
  { id: "radar", name: "Radar", description: "Bersaglio da analisi", photo: false },
  { id: "eclipse", name: "Eclissi", description: "Mezzaluna sul numero", photo: false },
  { id: "prism", name: "Prisma", description: "Taglio diagonale", photo: true },
  { id: "carbon", name: "Carbonio", description: "Texture racing", photo: false },
  { id: "seal", name: "Sigillo", description: "Oro da capitano", photo: true },
  { id: "pulse", name: "Pulse", description: "Anello che respira", photo: true },
];

export function getPlayerGraphic(id?: string | null): PlayerGraphic {
  return PLAYER_GRAPHICS.find((g) => g.id === id) || PLAYER_GRAPHICS[0];
}

export function isPlayerGraphicId(id: string): id is PlayerGraphicId {
  return PLAYER_GRAPHICS.some((g) => g.id === id);
}
