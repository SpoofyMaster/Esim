// Mobile theme: BLEUSIM design tokens plus the light "Universe B" surfaces and the pink accent.
import { color as tokens, radius } from "@bleusim/design-tokens";

export const C = {
  bg: "#F3F6FC",
  card: tokens.white,
  ink: "#0B1530",
  ink2: tokens.ice[700],
  muted: tokens.ice[500],
  faint: tokens.ice[400],
  line: "#E4EAF5",
  soft: "#EAF1FF",
  blue: tokens.blue[500],
  blueDeep: tokens.blue[600],
  blueSoft: "#DCE8FF",
  cyan: tokens.cyan[400],
  pink: "#FF3EA5",
  pinkSoft: "#FFE3F2",
  navy: tokens.space[900],
  navy2: tokens.space[850],
  white: tokens.white,
  success: tokens.success,
  warning: tokens.warning,
  danger: tokens.danger,
  amberSoft: "#FFF4DB",
} as const;

export const R = radius;

export const F = {
  display: "Sora_700Bold",
  displaySemi: "Sora_600SemiBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
  arabic: "IBMPlexSansArabic_400Regular",
  arabicMedium: "IBMPlexSansArabic_500Medium",
  arabicBold: "IBMPlexSansArabic_700Bold",
} as const;

export const shadow = {
  card: { shadowColor: "#0B1530", shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  float: { shadowColor: "#0B1530", shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
} as const;
