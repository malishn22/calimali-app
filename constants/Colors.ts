const Palette = {
  // Grayscale / Materials
  obsidian: "#09090B", // zinc950
  night: "#18181B",    // zinc900
  charcoal: "#27272A", // zinc800
  iron: "#3F3F46",     // zinc700
  steel: "#52525B",    // zinc600
  stone: "#71717A",    // zinc500
  silver: "#A1A1AA",   // zinc400
  fog: "#D4D4D8",      // zinc300
  cloud: "#F4F4F5",    // zinc100

  // Base
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // thematic Accents (Primary)
  electricBlue: "#3B82F6",
  deepBlue: "#1B3B6F",
  emeraldGreen: "#22C55E",
  solarYellow: "#FACC15",
  crimsonRed: "#EF4444",
  burntOrange: "#F97316",
  royalPurple: "#A855F7",

  // Secondary / Stabilizer Variants (Wholesome/Soft)
  skyBlue: "#60A5FA",
  softBlue: "#93C5FD",
  
  lighterPurple: "#C084FC",
  palePurple: "#E9D5FF",
  
  freshGreen: "#4ADE80",
  paleGreen: "#BBF7D0",
  
  sunshineYellow: "#FDE047",
  paleYellow: "#FEF08A",

  // Extras
  teal: "#14B8A6",
  cyan: "#06B6D4",
  pink: "#EC4899",
  gold: "#EAB308",
  lime: "#84CC16", // MOBILITY – yellow-green, distinct from cyan/teal/emerald
  slate: "#94A3B8",

  // Semantic (Custom)
  backgroundDark: "#121214",
  cardDark: "#1E1E22",
};

export const palette = Palette;

const Colors = {
  palette: Palette,
  light: {
    text: Palette.black,
    background: Palette.white,
    navigationBackground: Palette.white,
    tint: "#2f95dc",
    tabIconDefault: "#ccc",
    tabIconSelected: "#2f95dc",
    success: Palette.emeraldGreen,
    warning: Palette.solarYellow,
    card: Palette.white,
    icon: Palette.steel,
    border: Palette.fog,
  },
  dark: {
    text: Palette.white,
    background: Palette.backgroundDark,
    navigationBackground: Palette.night,
    tint: Palette.electricBlue,
    tabIconDefault: Palette.steel,
    tabIconSelected: Palette.electricBlue,
    success: Palette.emeraldGreen,
    warning: Palette.solarYellow,
    card: Palette.cardDark,
    icon: Palette.silver,
    border: Palette.charcoal,
  },
};

/** One distinct color per category – no two categories share a hue family. */
export const CategoryColors = {
  // Strength (keep as-is)
  PUSH: Palette.royalPurple,
  PULL: Palette.electricBlue,
  LEGS: Palette.burntOrange,
  CORE: Palette.crimsonRed,
  NECK: Palette.cyan,

  // Movement / recovery
  MOBILITY: Palette.lime,          // yellow-green, not cyan/teal
  STRETCH: Palette.emeraldGreen,

  // Conditioning / skill
  CARDIO: Palette.pink,            // pink, not purple
  SKILL: Palette.solarYellow,
};

export const getCategoryColor = (slugOrName: string): string =>
  CategoryColors[slugOrName?.toUpperCase() as keyof typeof CategoryColors] ?? Palette.silver;

/** Blend a hex color toward black. amount 0 = no change, 1 = black. */
function darkenHex(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const blend = (c: number) => Math.round(c * (1 - amount));
  return `#${blend(r).toString(16).padStart(2, "0")}${blend(g).toString(16).padStart(2, "0")}${blend(b).toString(16).padStart(2, "0")}`;
}

/** Blend a hex color toward white. amount 0 = no change, 1 = white. */
function lightenHex(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const blend = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${blend(r).toString(16).padStart(2, "0")}${blend(g).toString(16).padStart(2, "0")}${blend(b).toString(16).padStart(2, "0")}`;
}

/** Gradient for filled badge: original color → darker (same hue). */
export const getFilledBadgeGradientColors = (hex: string): [string, string] => [
  hex,
  darkenHex(hex, 0.2),
];

/** Primary (full), secondary (lighter), stabilizer (lightest) for a category – for muscle impact coloring. */
export const getCategoryColorVariants = (
  slugOrName: string
): { PRIMARY: string; SECONDARY: string; STABILIZER: string } => {
  const primary = getCategoryColor(slugOrName);
  return {
    PRIMARY: primary,
    SECONDARY: lightenHex(primary, 0.25),
    STABILIZER: lightenHex(primary, 0.5),
  };
};

/** Colors for exercise unit labels (REPS, SECS, etc.) */
export const UnitColors: Record<string, string> = {
  REPS: Palette.electricBlue,
  REP: Palette.electricBlue,
  SECS: Palette.teal,
  SEC: Palette.teal,
  SECONDS: Palette.teal,
  SECOND: Palette.teal,
  default: Palette.electricBlue,
};

export const getUnitColor = (unit: string): string =>
  UnitColors[unit?.toUpperCase()] ?? UnitColors.default;

export const DifficultyColors = {
  BEGINNER: Palette.emeraldGreen,
  INTERMEDIATE: Palette.burntOrange,
  ADVANCED: Palette.crimsonRed,
  ELITE: Palette.royalPurple,
};

export const EffectColors = {
  TRAIN: {
    PRIMARY: Palette.electricBlue,
    SECONDARY: Palette.skyBlue,
    STABILIZER: Palette.softBlue,
  },
  ISOMETRIC: {
    PRIMARY: Palette.royalPurple,
    SECONDARY: Palette.lighterPurple,
    STABILIZER: Palette.palePurple,
  },
  STRETCH: {
    PRIMARY: Palette.emeraldGreen,
    SECONDARY: Palette.freshGreen,
    STABILIZER: Palette.paleGreen,
  },
  MOBILITY: {
    PRIMARY: Palette.solarYellow,
    SECONDARY: Palette.sunshineYellow,
    STABILIZER: Palette.paleYellow,
  },
};

export const SessionColors = {
  BLUE: Palette.electricBlue,
  RED: Palette.crimsonRed,
  GREEN: Palette.emeraldGreen,
  ORANGE: Palette.burntOrange,
  PURPLE: Palette.royalPurple,
  PINK: Palette.pink,
  YELLOW: Palette.solarYellow,
};

export default Colors;
