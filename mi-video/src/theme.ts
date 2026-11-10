import { loadFont } from "@remotion/google-fonts/Inter";

export const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
});

/** Colores de la marca (mismos que la landing de la app). */
export const BRAND = {
  accent: "#5b54f0",
  accentLight: "#8b84ff",
  gradient:
    "linear-gradient(135deg, #312e81 0%, #5b54f0 45%, #9333ea 75%, #db2777 100%)",
  textGradient: "linear-gradient(90deg, #a5f3fc, #fbcfe8)",
  dark: "#0a0c18",
};

/** Tokens del tema claro de la app (globals.css). */
export const APP = {
  bg: "#f5f6fb",
  surface: "#ffffff",
  soft: "#f0f2f8",
  text: "#121826",
  muted: "#6b7489",
  border: "#e4e7ef",
  accent: "#5b54f0",
  danger: "#e5484d",
  warning: "#d97706",
  success: "#12a150",
};

/** Colores de asignaturas de ejemplo. */
export const SUBJECT = {
  distribuidos: "#6c63ff",
  redes: "#f43f5e",
  bd: "#10b981",
  ia: "#f59e0b",
  so: "#06b6d4",
};
