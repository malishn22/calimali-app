/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: "#09090B",
          900: "#18181B",
          800: "#27272A",
          700: "#3F3F46",
          600: "#52525B",
          500: "#71717A",
          400: "#A1A1AA",
          300: "#D4D4D8",
          100: "#F4F4F5",
        },
        blue: {
          500: "#3B82F6",
          900: "#1B3B6F",
        },
        green: {
          500: "#22C55E",
        },
        yellow: {
          400: "#FACC15",
        },
        red: {
          500: "#EF4444",
        },
        orange: {
          500: "#F97316",
        },
        purple: {
          500: "#A855F7",
        },
        background: {
          dark: "#121214",
        },
        card: {
          dark: "#1E1E22",
        },
      },
    },
  },
  plugins: [],
};
