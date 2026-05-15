// Literal hex values mirroring STYLES.md.
// Use these where CSS variables don't resolve (SVG stroke/fill in recharts, canvas, etc.).

export const themeTokens = {
  background: "#F5DEB3",
  card: "#FFFFFF",
  secondary: "#FEFCF8",
  muted: "#FEFCF8",
  foreground: "#2D3748",
  mutedForeground: "#767676",
  accent: "#D38E45",
  accentForeground: "#FFFFFF",
  primary: "#6EE7B7",
  primaryForeground: "#2D3748",
  primaryText: "#059669",
  success: "#10B981",
  warning: "#F59E0B",
  destructive: "#E53E3E",
  border: "#E8DBBF",
} as const;

export const chartSeriesColors = {
  conservative: themeTokens.mutedForeground,
  moderate: themeTokens.accent,
  optimistic: themeTokens.primaryText,
} as const;
