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
  pink: "#EC4899",
  gold: "#EAB308",
  slate: "#94A3B8",

  // Semantic (Custom)
  backgroundDark: "#121214",
  cardDark: "#1E1E22",
};

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

export const CategoryColors = {
  // Strength
  PUSH: Palette.royalPurple,
  PULL: Palette.electricBlue,
  LEGS: Palette.burntOrange,
  CORE: Palette.crimsonRed,
  NECK: Palette.slate,

  // Movement / recovery
  MOBILITY: Palette.solarYellow,
  STRETCH: Palette.teal,

  // Conditioning / skill
  CARDIO: Palette.pink,
  SKILL: Palette.gold,
  OTHER: Palette.silver,
};

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
