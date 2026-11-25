// BLEUSIM design tokens — single source for web (CSS vars), mobile (RN) and admin.
export const color = {
  space: { 950: "#010714", 900: "#020B1F", 850: "#06152E", 800: "#0A1E3F", 700: "#122B55", 600: "#1D3A6B" },
  blue: { 600: "#0047D6", 500: "#0057FF", 400: "#2F7BFF", 300: "#6FA3FF" },
  cyan: { 500: "#1FB4F2", 400: "#39C6FF", 300: "#7DDCFF", 200: "#BDEEFF" },
  ice: { 50: "#F4F8FF", 100: "#E8F0FE", 200: "#D3E0F7", 300: "#B4C6E6", 400: "#8A9EC4", 500: "#61759C", 600: "#44567A", 700: "#2C3A57", 900: "#0D1526" },
  white: "#FFFFFF",
  success: "#18B26B", warning: "#F5A524", danger: "#E5484D",
} as const;

export const font = {
  display: '"Sora Variable", "Sora", ui-sans-serif, system-ui, sans-serif',
  body: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
  arabic: '"IBM Plex Sans Arabic", "Inter Variable", system-ui, sans-serif',
  mono: '"JetBrains Mono Variable", ui-monospace, monospace',
} as const;

export const radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const space = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128] as const;
export const motion = {
  ease: { out: "cubic-bezier(0.16, 1, 0.3, 1)", inOut: "cubic-bezier(0.65, 0, 0.35, 1)" },
  duration: { fast: 160, base: 260, slow: 520, camera: 1600 },
} as const;
