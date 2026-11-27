// Flat and quiet, like the best banking apps: near-black, three greys, white type, and Access orange
// kept for the logo and the single action that matters on a screen.
export const colors = {
  bg: "#0B0B0D",
  surface: "#19191C",
  raised: "#242428",
  field: "#242428",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.14)",
  text: "#FFFFFF",
  soft: "#C7C7CF",
  muted: "#8E8E98",
  faint: "#5E5E68",
  accent: "#EF8532",
  accentSoft: "rgba(239,133,50,0.16)",
  onAccent: "#FFFFFF",
  good: "#34C77B",
  goodSoft: "rgba(52,199,123,0.15)",
  bad: "#FF5F57",
  badSoft: "rgba(255,95,87,0.15)",
  glass: "rgba(255,255,255,0.16)",
} as const;

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const radius = { sm: 12, md: 16, lg: 20, xl: 28 } as const;
