// BLEUSIM mobile tokens (mirror packages/design-tokens): light, soft ice background, blue primary, pink accent.
export const C = {
  bg: "#F4F7FC",
  card: "#FFFFFF",
  ink: "#0D1526",
  ink2: "#2C3A57",
  muted: "#44567A",
  faint: "#8A9EC4",
  border: "#E3EBF7",
  fill: "#E9EFF8",
  blue: "#0057FF",
  blueDark: "#0047D6",
  blueSoft: "#E6EEFF",
  cyan: "#39C6FF",
  navy: "#06152E",
  pink: "#FF3EA5",
  pinkSoft: "#FFE3F1",
  pinkInk: "#B0136A",
  green: "#18B26B",
  greenSoft: "#E7F7EF",
  greenInk: "#0E7A4A",
  amberSoft: "#FFF5DB",
  amberInk: "#7A5200",
} as const;

export const R = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 } as const;

/** Latin fonts; Arabic uses the system font (set per locale in Txt). */
export const F = {
  display: "Sora_600SemiBold",
  displayBold: "Sora_700Bold",
  body: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
} as const;

export const shadow = {
  card: { shadowColor: "#0D1526", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  float: { shadowColor: "#0D1526", shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  blue: { shadowColor: "#0057FF", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
} as const;
