const Palette = {
  // Zinc Scale (Grays)
  zinc950: "#09090B",
  zinc900: "#18181B",
  zinc800: "#27272A", // Progress bg, Dark Borders
  zinc700: "#3F3F46", // Separators, Dark Icons
  zinc600: "#52525B", // Placeholders, Muted Icons
  zinc500: "#71717A", // Subtitles
  zinc400: "#A1A1AA", // Lighter Text/Icons
  zinc300: "#D4D4D8",
  zinc100: "#F4F4F5",

  // Base
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Accents
  blue500: "#3B82F6", // Electric Blue (Primary)
  blue900: "#1B3B6F", // Gradient Start
  green500: "#22C55E", // Success
  yellow400: "#FACC15", // Warning/Skills
  red500: "#EF4444", // Error/Push
  orange500: "#F97316", // Legs
  purple500: "#A855F7", // Core

  // Semantic (Custom)
  backgroundDark: "#121214", // Main App BG
  cardDark: "#1E1E22", // Paper/Card BG
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
    success: Palette.green500,
    warning: Palette.yellow400,
    card: Palette.white,
    icon: Palette.zinc600,
    border: Palette.zinc300,
  },
  dark: {
    text: Palette.white,
    background: Palette.backgroundDark,
    navigationBackground: Palette.zinc900,
    tint: Palette.blue500,
    tabIconDefault: Palette.zinc600,
    tabIconSelected: Palette.blue500,
    success: Palette.green500,
    warning: Palette.yellow400,
    card: Palette.cardDark,
    icon: Palette.zinc400,
    border: Palette.zinc800,
  },
};

export const CategoryColors = {
  // Strength
  PUSH: Palette.red500,
  PULL: Palette.blue500,
  LEGS: Palette.orange500,
  CORE: Palette.purple500,
  NECK: "#8B5CF6", // Violet
  // Movement / recovery
  MOBILITY: Palette.yellow400,
  STRETCH: Palette.green500,
  // Conditioning / skill
  CARDIO: "#EC4899", // Pink
  SKILL: Palette.yellow400,
  OTHER: Palette.zinc400,
};

export const EffectColors = {
  TRAIN: {
    PRIMARY: "#00F2FF",    // Neon Cyan (Strongest)
    SECONDARY: "#3B82F6",  // Electric Blue (Stronger)
    STABILIZER: "#1E3A8A", // Dark Navy (Strong)
  },
  ISOMETRIC: {
    PRIMARY: "#E879F9",    // Neon Pink/Purple
    SECONDARY: "#A855F7",  // Purple
    STABILIZER: "#581C87", // Dark Deep Purple
  },
  STRETCH: {
    PRIMARY: "#4ADE80",    // Neon Green
    SECONDARY: "#16A34A",  // Forest Green
    STABILIZER: "#14532D", // Dark Green
  },
  MOBILITY: {
    PRIMARY: "#FDE047",    // Neon Yellow
    SECONDARY: "#EAB308",  // Golden Yellow
    STABILIZER: "#713F12", // Dark Earth Yellow
  },
};

export const SessionColors = {
  BLUE: "#3B82F6", // Palette.blue500
  RED: "#EF4444", // Palette.red500
  GREEN: "#22C55E", // Palette.green500
  ORANGE: "#F97316", // Palette.orange500
  PURPLE: "#A855F7", // Palette.purple500
  PINK: "#EC4899", // New Pink
  YELLOW: "#FACC15", // Palette.yellow400
};

export default Colors;
