/**
 * LUSO DTF STUDIO - Centralized Design & Ambient Theme Tokens
 * Single source of truth for color palettes, typography, spacing, and WebGL/CSS ambient light rendering.
 */

export const AMBIENT_TOKENS = {
  colors: {
    deepNavy: "#0b1326",
    midnightBlue: "#131b2e",
    indigo: "#1f1d47",
    violet: "#5c3d99",
    purple: "#843896",
    magenta: "#b8337a",
    fuchsia: "#d93b94",
    subtleCyan: "#1ebfef",
    surfaceContainer: "#171f33",
    onSurface: "#dbe2fd",
    onSurfaceVariant: "#cbc3d7",
  },
  // Normalized GLSL RGB float values for WebGL shaders [R, G, B]
  glslRgb: {
    deepNavy: [0.043, 0.075, 0.149] as [number, number, number],
    midnightBlue: [0.075, 0.106, 0.180] as [number, number, number],
    indigo: [0.122, 0.114, 0.278] as [number, number, number],
    violet: [0.361, 0.239, 0.600] as [number, number, number],
    purple: [0.518, 0.220, 0.588] as [number, number, number],
    magenta: [0.722, 0.200, 0.478] as [number, number, number],
    fuchsia: [0.851, 0.231, 0.580] as [number, number, number],
    subtleCyan: [0.118, 0.749, 0.937] as [number, number, number],
  },
  performanceTiers: {
    tier1: {
      resolutionScale: 0.5, // Render WebGL at half resolution + CSS blur (saves 75% GPU pixels)
      targetFps: 60,
      blurAmount: "12px",
    },
    tier2: {
      resolutionScale: 0.35, // Low-density WebGL render
      targetFps: 30,
      blurAmount: "20px",
    },
    tier3: {
      useCssFallback: true, // CSS hardware-accelerated ambient gradient blur
      blurAmount: "80px",
    },
  },
};

export type AmbientTier = "tier1" | "tier2" | "tier3";
