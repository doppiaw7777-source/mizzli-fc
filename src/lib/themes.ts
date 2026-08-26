import type { TeamData } from "./types";

export type GraphicStyle =
  | "stripes"
  | "grid"
  | "radial"
  | "chevrons"
  | "stars"
  | "noise"
  | "waves"
  | "bars"
  | "hex"
  | "frost"
  | "diagonal"
  | "carbon"
  | "rings"
  | "dunes"
  | "scanlines"
  | "spotlight"
  | "steel"
  | "diamonds"
  | "mesh"
  | "ember";

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  graphicStyle: GraphicStyle;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    cardBg: string;
  };
  fontFamily: string;
  navStyle: "solid" | "glass";
  overlay: number;
  cardRadius: number;
  titleSize: "normal" | "large" | "xl";
  buttonStyle: "rounded" | "pill" | "square";
  pitchColor: string;
  pitchColor2: string;
  gradient: string;
  cardGlow: boolean;
  heroStyle: "center" | "left" | "banner";
}

export const APP_THEMES: AppTheme[] = [
  {
    id: "mizzli-viola",
    name: "MIZZLI Viola",
    description: "Stemma ufficiale: viola, nero e bianco",
    graphicStyle: "rings",
    colors: {
      primary: "#91278e",
      secondary: "#0b0614",
      accent: "#f4f0ff",
      text: "#ffffff",
      cardBg: "rgba(145, 39, 142, 0.28)",
    },
    fontFamily: "Inter, system-ui, sans-serif",
    navStyle: "glass",
    overlay: 62,
    cardRadius: 20,
    titleSize: "large",
    buttonStyle: "rounded",
    pitchColor: "#2f7a3a",
    pitchColor2: "#145528",
    gradient: "linear-gradient(165deg, #07040e 0%, #6a1d68 42%, #12081f 100%)",
    cardGlow: true,
    heroStyle: "center",
  },
  {
    id: "verde-oro",
    name: "Verde Oro",
    description: "Classico da club, strisce da stadio",
    graphicStyle: "stripes",
    colors: {
      primary: "#0d4f2b",
      secondary: "#0a1628",
      accent: "#ffd700",
      text: "#ffffff",
      cardBg: "rgba(13, 79, 43, 0.28)",
    },
    fontFamily: "Inter, system-ui, sans-serif",
    navStyle: "glass",
    overlay: 58,
    cardRadius: 20,
    titleSize: "large",
    buttonStyle: "rounded",
    pitchColor: "#1a7a3a",
    pitchColor2: "#0d5c28",
    gradient: "linear-gradient(160deg, #06140c 0%, #0d4f2b 45%, #13203a 100%)",
    cardGlow: true,
    heroStyle: "center",
  },
  {
    id: "blu-notte",
    name: "Blu Notte",
    description: "Griglia neon da arena notturna",
    graphicStyle: "grid",
    colors: {
      primary: "#0b3d91",
      secondary: "#050814",
      accent: "#00d4ff",
      text: "#f4fbff",
      cardBg: "rgba(11, 61, 145, 0.28)",
    },
    fontFamily: "Trebuchet MS, sans-serif",
    navStyle: "solid",
    overlay: 62,
    cardRadius: 14,
    titleSize: "xl",
    buttonStyle: "square",
    pitchColor: "#0b4d8c",
    pitchColor2: "#062a52",
    gradient: "linear-gradient(180deg, #02040a 0%, #0b3d91 55%, #041428 100%)",
    cardGlow: true,
    heroStyle: "banner",
  },
  {
    id: "rosso-fuoco",
    name: "Rosso Fuoco",
    description: "Bagliore centrale, energia da derby",
    graphicStyle: "radial",
    colors: {
      primary: "#8b0018",
      secondary: "#140308",
      accent: "#ffcc33",
      text: "#fff7ea",
      cardBg: "rgba(139, 0, 24, 0.32)",
    },
    fontFamily: "Trebuchet MS, sans-serif",
    navStyle: "solid",
    overlay: 55,
    cardRadius: 16,
    titleSize: "xl",
    buttonStyle: "pill",
    pitchColor: "#6e1a1a",
    pitchColor2: "#3d0c0c",
    gradient: "radial-gradient(circle at 50% 20%, #c41e3a 0%, #3a0610 55%, #0a0204 100%)",
    cardGlow: true,
    heroStyle: "center",
  },
  {
    id: "bianco-nero",
    name: "Bianco Nero",
    description: "Minimalista, chevron da maglia",
    graphicStyle: "chevrons",
    colors: {
      primary: "#111111",
      secondary: "#000000",
      accent: "#f5f5f5",
      text: "#ffffff",
      cardBg: "rgba(255, 255, 255, 0.08)",
    },
    fontFamily: "Inter, system-ui, sans-serif",
    navStyle: "solid",
    overlay: 70,
    cardRadius: 8,
    titleSize: "normal",
    buttonStyle: "square",
    pitchColor: "#2a2a2a",
    pitchColor2: "#111111",
    gradient: "linear-gradient(135deg, #000 0%, #222 50%, #000 100%)",
    cardGlow: false,
    heroStyle: "left",
  },
  {
    id: "viola-galaxy",
    name: "Viola Galaxy",
    description: "Cielo stellato, look da coppa",
    graphicStyle: "stars",
    colors: {
      primary: "#4c1d95",
      secondary: "#0b0618",
      accent: "#e879f9",
      text: "#faf5ff",
      cardBg: "rgba(76, 29, 149, 0.3)",
    },
    fontFamily: "Palatino Linotype, serif",
    navStyle: "glass",
    overlay: 60,
    cardRadius: 24,
    titleSize: "large",
    buttonStyle: "pill",
    pitchColor: "#3b1d6e",
    pitchColor2: "#1c0d3a",
    gradient: "radial-gradient(ellipse at top, #6d28d9 0%, #1e0b3a 50%, #05010d 100%)",
    cardGlow: true,
    heroStyle: "center",
  },
  {
    id: "champagne",
    name: "Champagne",
    description: "Texture lusso, oro spumante",
    graphicStyle: "noise",
    colors: {
      primary: "#8a6a2f",
      secondary: "#16110a",
      accent: "#f3d38a",
      text: "#fff8e7",
      cardBg: "rgba(138, 106, 47, 0.22)",
    },
    fontFamily: "Georgia, serif",
    navStyle: "glass",
    overlay: 52,
    cardRadius: 22,
    titleSize: "large",
    buttonStyle: "rounded",
    pitchColor: "#6b5428",
    pitchColor2: "#3d3014",
    gradient: "linear-gradient(160deg, #1a140c 0%, #5c451c 40%, #2a2114 100%)",
    cardGlow: true,
    heroStyle: "banner",
  },
  {
    id: "azzurro-costa",
    name: "Azzurro Costa",
    description: "Onde marine, atmosfera estiva",
    graphicStyle: "waves",
    colors: {
      primary: "#0369a1",
      secondary: "#062033",
      accent: "#7dd3fc",
      text: "#ecfeff",
      cardBg: "rgba(3, 105, 161, 0.28)",
    },
    fontFamily: "Trebuchet MS, sans-serif",
    navStyle: "glass",
    overlay: 50,
    cardRadius: 28,
    titleSize: "large",
    buttonStyle: "pill",
    pitchColor: "#0e7490",
    pitchColor2: "#155e75",
    gradient: "linear-gradient(180deg, #082f49 0%, #0369a1 50%, #0c4a6e 100%)",
    cardGlow: false,
    heroStyle: "center",
  },
  {
    id: "arancio-sunset",
    name: "Arancio Sunset",
    description: "Bande da tramonto in tribù",
    graphicStyle: "bars",
    colors: {
      primary: "#c2410c",
      secondary: "#1c0b04",
      accent: "#fdba74",
      text: "#fff7ed",
      cardBg: "rgba(194, 65, 12, 0.28)",
    },
    fontFamily: "Trebuchet MS, sans-serif",
    navStyle: "solid",
    overlay: 54,
    cardRadius: 18,
    titleSize: "xl",
    buttonStyle: "rounded",
    pitchColor: "#9a3412",
    pitchColor2: "#7c2d12",
    gradient: "linear-gradient(120deg, #431407 0%, #c2410c 45%, #7c2d12 100%)",
    cardGlow: true,
    heroStyle: "banner",
  },
  {
    id: "forest-night",
    name: "Forest Night",
    description: "Esagoni da bosco, look tattica",
    graphicStyle: "hex",
    colors: {
      primary: "#14532d",
      secondary: "#052e16",
      accent: "#86efac",
      text: "#ecfdf5",
      cardBg: "rgba(20, 83, 45, 0.32)",
    },
    fontFamily: "Courier New, monospace",
    navStyle: "solid",
    overlay: 64,
    cardRadius: 12,
    titleSize: "normal",
    buttonStyle: "square",
    pitchColor: "#166534",
    pitchColor2: "#14532d",
    gradient: "linear-gradient(180deg, #022c22 0%, #14532d 60%, #052e16 100%)",
    cardGlow: false,
    heroStyle: "left",
  },
  {
    id: "ice-arena",
    name: "Ice Arena",
    description: "Ghiaccio, linee da palazzetto",
    graphicStyle: "frost",
    colors: {
      primary: "#155e75",
      secondary: "#083344",
      accent: "#a5f3fc",
      text: "#ecfeff",
      cardBg: "rgba(21, 94, 117, 0.3)",
    },
    fontFamily: "Inter, system-ui, sans-serif",
    navStyle: "glass",
    overlay: 48,
    cardRadius: 16,
    titleSize: "large",
    buttonStyle: "rounded",
    pitchColor: "#0e7490",
    pitchColor2: "#164e63",
    gradient: "linear-gradient(160deg, #082f49 0%, #155e75 50%, #0c4a6e 100%)",
    cardGlow: true,
    heroStyle: "center",
  },
  {
    id: "derby-vintage",
    name: "Derby Vintage",
    description: "Strisce retrò bordeaux e crema",
    graphicStyle: "diagonal",
    colors: {
      primary: "#7f1d1d",
      secondary: "#1c1917",
      accent: "#fde68a",
      text: "#fffbeb",
      cardBg: "rgba(127, 29, 29, 0.28)",
    },
    fontFamily: "Georgia, serif",
    navStyle: "solid",
    overlay: 58,
    cardRadius: 10,
    titleSize: "large",
    buttonStyle: "square",
    pitchColor: "#7f1d1d",
    pitchColor2: "#450a0a",
    gradient: "repeating-linear-gradient(135deg, #1c1917 0px, #1c1917 28px, #7f1d1d 28px, #7f1d1d 56px)",
    cardGlow: false,
    heroStyle: "left",
  },
  {
    id: "carbonio",
    name: "Carbonio",
    description: "Fibra di carbonio, racing club",
    graphicStyle: "carbon",
    colors: {
      primary: "#171717",
      secondary: "#0a0a0a",
      accent: "#facc15",
      text: "#fafafa",
      cardBg: "rgba(250, 204, 21, 0.08)",
    },
    fontFamily: "Inter, system-ui, sans-serif",
    navStyle: "solid",
    overlay: 66,
    cardRadius: 8,
    titleSize: "normal",
    buttonStyle: "square",
    pitchColor: "#262626",
    pitchColor2: "#171717",
    gradient: "linear-gradient(180deg, #000 0%, #171717 50%, #0a0a0a 100%)",
    cardGlow: true,
    heroStyle: "banner",
  },
  {
    id: "royal",
    name: "Royal",
    description: "Anelli da coppa, viola e oro",
    graphicStyle: "rings",
    colors: {
      primary: "#3730a3",
      secondary: "#1e1b4b",
      accent: "#fbbf24",
      text: "#eef2ff",
      cardBg: "rgba(55, 48, 163, 0.32)",
    },
    fontFamily: "Palatino Linotype, serif",
    navStyle: "glass",
    overlay: 56,
    cardRadius: 26,
    titleSize: "xl",
    buttonStyle: "pill",
    pitchColor: "#312e81",
    pitchColor2: "#1e1b4b",
    gradient: "radial-gradient(circle at 50% 0%, #4338ca 0%, #1e1b4b 55%, #0f0c29 100%)",
    cardGlow: true,
    heroStyle: "center",
  },
  {
    id: "deserto",
    name: "Deserto",
    description: "Dune calde, atmosfera da amichevole",
    graphicStyle: "dunes",
    colors: {
      primary: "#b45309",
      secondary: "#292524",
      accent: "#fcd34d",
      text: "#fffbeb",
      cardBg: "rgba(180, 83, 9, 0.24)",
    },
    fontFamily: "Georgia, serif",
    navStyle: "glass",
    overlay: 50,
    cardRadius: 20,
    titleSize: "large",
    buttonStyle: "rounded",
    pitchColor: "#a16207",
    pitchColor2: "#854d0e",
    gradient: "linear-gradient(180deg, #44403c 0%, #b45309 48%, #78350f 100%)",
    cardGlow: false,
    heroStyle: "banner",
  },
  {
    id: "lime-elettrico",
    name: "Lime Elettrico",
    description: "Scanline da e-sport, lime acido",
    graphicStyle: "scanlines",
    colors: {
      primary: "#365314",
      secondary: "#052e16",
      accent: "#a3e635",
      text: "#f7fee7",
      cardBg: "rgba(163, 230, 53, 0.1)",
    },
    fontFamily: "Courier New, monospace",
    navStyle: "solid",
    overlay: 68,
    cardRadius: 6,
    titleSize: "normal",
    buttonStyle: "square",
    pitchColor: "#3f6212",
    pitchColor2: "#1a2e05",
    gradient: "linear-gradient(180deg, #052e16 0%, #365314 60%, #14532d 100%)",
    cardGlow: true,
    heroStyle: "left",
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    description: "Faro centrale, night club luxury",
    graphicStyle: "spotlight",
    colors: {
      primary: "#1c1917",
      secondary: "#0c0a09",
      accent: "#eab308",
      text: "#fefce8",
      cardBg: "rgba(234, 179, 8, 0.1)",
    },
    fontFamily: "Georgia, serif",
    navStyle: "glass",
    overlay: 60,
    cardRadius: 18,
    titleSize: "xl",
    buttonStyle: "pill",
    pitchColor: "#3f3f46",
    pitchColor2: "#18181b",
    gradient: "radial-gradient(circle at 50% 30%, #854d0e 0%, #1c1917 45%, #000 100%)",
    cardGlow: true,
    heroStyle: "center",
  },
  {
    id: "acciaio-cremisi",
    name: "Acciaio Cremisi",
    description: "Barre industriali, acciaio e sangue",
    graphicStyle: "steel",
    colors: {
      primary: "#9f1239",
      secondary: "#18181b",
      accent: "#fda4af",
      text: "#fff1f2",
      cardBg: "rgba(159, 18, 57, 0.26)",
    },
    fontFamily: "Trebuchet MS, sans-serif",
    navStyle: "solid",
    overlay: 62,
    cardRadius: 4,
    titleSize: "large",
    buttonStyle: "square",
    pitchColor: "#881337",
    pitchColor2: "#4c0519",
    gradient: "linear-gradient(90deg, #18181b 0%, #9f1239 50%, #27272a 100%)",
    cardGlow: false,
    heroStyle: "left",
  },
  {
    id: "oceano",
    name: "Oceano",
    description: "Diamanti d'acqua, profondità teal",
    graphicStyle: "diamonds",
    colors: {
      primary: "#0f766e",
      secondary: "#042f2e",
      accent: "#5eead4",
      text: "#f0fdfa",
      cardBg: "rgba(15, 118, 110, 0.3)",
    },
    fontFamily: "Inter, system-ui, sans-serif",
    navStyle: "glass",
    overlay: 52,
    cardRadius: 24,
    titleSize: "large",
    buttonStyle: "pill",
    pitchColor: "#0f766e",
    pitchColor2: "#115e59",
    gradient: "linear-gradient(160deg, #042f2e 0%, #0f766e 50%, #134e4a 100%)",
    cardGlow: true,
    heroStyle: "center",
  },
  {
    id: "derby-tramonto",
    name: "Derby Tramonto",
    description: "Mesh magenta-arancio da night match",
    graphicStyle: "mesh",
    colors: {
      primary: "#9d174d",
      secondary: "#2e1065",
      accent: "#fb923c",
      text: "#fff7ed",
      cardBg: "rgba(157, 23, 77, 0.28)",
    },
    fontFamily: "Trebuchet MS, sans-serif",
    navStyle: "glass",
    overlay: 55,
    cardRadius: 20,
    titleSize: "xl",
    buttonStyle: "rounded",
    pitchColor: "#9d174d",
    pitchColor2: "#6b21a8",
    gradient: "linear-gradient(135deg, #2e1065 0%, #9d174d 50%, #c2410c 100%)",
    cardGlow: true,
    heroStyle: "banner",
  },
  {
    id: "cima-neve",
    name: "Cima Neve",
    description: "Ghiaccio chiaro, look invernale",
    graphicStyle: "ember",
    colors: {
      primary: "#1e3a5f",
      secondary: "#e2e8f0",
      accent: "#0f766e",
      text: "#0f172a",
      cardBg: "rgba(255, 255, 255, 0.72)",
    },
    fontFamily: "Inter, system-ui, sans-serif",
    navStyle: "solid",
    overlay: 22,
    cardRadius: 18,
    titleSize: "large",
    buttonStyle: "rounded",
    pitchColor: "#64748b",
    pitchColor2: "#334155",
    gradient: "linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)",
    cardGlow: false,
    heroStyle: "center",
  },
];

export function getTheme(id?: string) {
  return APP_THEMES.find((t) => t.id === id) || APP_THEMES[0];
}

export function graphicCss(style: GraphicStyle, accent: string): string {
  switch (style) {
    case "stripes":
      return `repeating-linear-gradient(-18deg, transparent 0 18px, ${accent}14 18px 22px)`;
    case "grid":
      return `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`;
    case "radial":
      return `radial-gradient(circle at 50% 18%, ${accent}55 0%, transparent 42%), radial-gradient(circle at 80% 90%, ${accent}22 0%, transparent 35%)`;
    case "chevrons":
      return `repeating-linear-gradient(135deg, transparent 0 16px, ${accent}18 16px 32px), repeating-linear-gradient(45deg, transparent 0 16px, ${accent}10 16px 32px)`;
    case "stars":
      return `radial-gradient(1.5px 1.5px at 12% 18%, #fff 70%, transparent), radial-gradient(1.5px 1.5px at 72% 28%, #fff 70%, transparent), radial-gradient(1.2px 1.2px at 40% 62%, ${accent} 70%, transparent), radial-gradient(1.5px 1.5px at 88% 70%, #fff 70%, transparent), radial-gradient(1px 1px at 22% 80%, ${accent} 70%, transparent), radial-gradient(1.4px 1.4px at 55% 12%, #fff 70%, transparent)`;
    case "noise":
      return `repeating-radial-gradient(circle at 20% 20%, ${accent}18 0 1px, transparent 1px 12px), repeating-linear-gradient(0deg, ${accent}08 0 1px, transparent 1px 3px)`;
    case "waves":
      return `radial-gradient(ellipse 80% 40% at 50% 100%, ${accent}33 0%, transparent 60%), radial-gradient(ellipse 70% 30% at 50% 80%, ${accent}22 0%, transparent 55%)`;
    case "bars":
      return `repeating-linear-gradient(90deg, transparent 0 42px, ${accent}16 42px 48px)`;
    case "hex":
      return `repeating-linear-gradient(60deg, ${accent}14 0 2px, transparent 2px 28px), repeating-linear-gradient(-60deg, ${accent}14 0 2px, transparent 2px 28px)`;
    case "frost":
      return `linear-gradient(115deg, transparent 40%, ${accent}22 50%, transparent 60%), linear-gradient(245deg, transparent 35%, #ffffff18 48%, transparent 62%)`;
    case "diagonal":
      return `repeating-linear-gradient(135deg, ${accent}20 0 14px, transparent 14px 32px)`;
    case "carbon":
      return `repeating-linear-gradient(45deg, #0006 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, ${accent}10 0 2px, transparent 2px 8px)`;
    case "rings":
      return `radial-gradient(circle at 50% 30%, transparent 18%, ${accent}30 19%, transparent 20%), radial-gradient(circle at 50% 30%, transparent 32%, ${accent}22 33%, transparent 34%), radial-gradient(circle at 50% 30%, transparent 46%, ${accent}16 47%, transparent 48%)`;
    case "dunes":
      return `radial-gradient(ellipse 120% 50% at 50% 110%, ${accent}40 0%, transparent 55%), radial-gradient(ellipse 90% 40% at 20% 100%, ${accent}22 0%, transparent 50%)`;
    case "scanlines":
      return `repeating-linear-gradient(0deg, transparent 0 3px, #00000055 3px 4px)`;
    case "spotlight":
      return `radial-gradient(ellipse 50% 40% at 50% 0%, ${accent}55 0%, transparent 70%)`;
    case "steel":
      return `repeating-linear-gradient(90deg, transparent 0 70px, ${accent}14 70px 74px), linear-gradient(180deg, #ffffff10, transparent 40%)`;
    case "diamonds":
      return `repeating-linear-gradient(45deg, transparent 0 18px, ${accent}16 18px 20px), repeating-linear-gradient(-45deg, transparent 0 18px, ${accent}16 18px 20px)`;
    case "mesh":
      return `radial-gradient(at 20% 20%, ${accent}33 0px, transparent 40%), radial-gradient(at 80% 0%, ${accent}22 0px, transparent 35%), radial-gradient(at 70% 80%, ${accent}28 0px, transparent 40%)`;
    case "ember":
      return `radial-gradient(circle at 15% 20%, #ffffff88 0 2px, transparent 3px), radial-gradient(circle at 80% 30%, #ffffff66 0 2px, transparent 3px), radial-gradient(circle at 40% 70%, ${accent}55 0 2px, transparent 3px), linear-gradient(180deg, #ffffff33, transparent 30%)`;
    default:
      return "none";
  }
}

export function graphicSize(style: GraphicStyle) {
  if (style === "grid") return "42px 42px";
  return "auto";
}

export function applyThemeToTeam(data: TeamData, themeId: string): TeamData {
  const theme = getTheme(themeId);
  return {
    ...data,
    settings: {
      ...data.settings,
      themeId: theme.id,
      graphicStyle: theme.graphicStyle,
      themeGradient: theme.gradient,
      colors: { ...theme.colors },
      fontFamily: theme.fontFamily,
      navStyle: theme.navStyle,
      ui: {
        ...data.settings.ui,
        cardRadius: theme.cardRadius,
        backgroundOverlay: theme.overlay,
        titleSize: theme.titleSize,
        buttonStyle: theme.buttonStyle,
        heroStyle: theme.heroStyle,
        cardGlow: theme.cardGlow,
      },
    },
    formation: {
      ...data.formation,
      pitchColor: theme.pitchColor,
      pitchColor2: theme.pitchColor2,
    },
  };
}
