import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1326",
        surface: {
          DEFAULT: "#0b1326",
          dim: "#0b1326",
          bright: "#31394e",
          variant: "#2d3449",
          glass: "rgba(11, 19, 38, 0.65)",
          container: {
            lowest: "#060d20",
            low: "#131b2e",
            DEFAULT: "#171f33",
            high: "#222a3e",
            highest: "#2d3449",
          },
        },
        primary: {
          DEFAULT: "#d0bcff",
          fixed: "#e9ddff",
          "fixed-dim": "#d0bcff",
          container: "#a078ff",
          dark: "#37265e",
        },
        secondary: {
          DEFAULT: "#4cd7f6",
          fixed: "#acedff",
          "fixed-dim": "#4cd7f6",
          container: "#03b5d4",
          dark: "#003640",
        },
        tertiary: {
          DEFAULT: "#ffb2b7",
          fixed: "#ffdadb",
          container: "#ff516a",
          dark: "#522126",
        },
        "on-background": "#dbe2fd",
        "on-surface": "#dbe2fd",
        "on-surface-variant": "#cbc3d7",
        "outline-glow": "rgba(255, 255, 255, 0.15)",
        outline: "#948f9a",
        "outline-variant": "#49454f",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      spacing: {
        "panel-padding": "1.5rem",
        "container-margin": "2rem",
        "element-gap": "1rem",
        "topbar-height": "72px",
        "sidebar-width": "280px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      boxShadow: {
        "neu-raised": "-4px -4px 10px rgba(255, 255, 255, 0.03), 4px 4px 10px rgba(0, 0, 0, 0.6)",
        "neu-pressed": "inset -4px -4px 10px rgba(255, 255, 255, 0.03), inset 4px 4px 10px rgba(0, 0, 0, 0.6)",
        "glass-panel": "0 20px 40px rgba(0, 0, 0, 0.4)",
        "glow-violet": "0 0 25px rgba(208, 188, 255, 0.25)",
        "glow-cyan": "0 0 25px rgba(76, 215, 246, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
