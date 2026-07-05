/** Спільна палітра графіків — з дизайн-токенів застосунку */
export const CHART_COLORS = {
  ink: "#1a221c",
  inkSoft: "#49544c",
  inkFaint: "#86908a",
  line: "#d9d4c4",
  accent: "#1e7a4c",
  accentDeep: "#145736",
  lime: "#c9f04f",
  amber: "#d97a2b",
  loss: "#c2402a",
  paper: "#f2efe6",
  card: "#fbfaf5",
} as const;

export const PIE_PALETTE = [
  CHART_COLORS.accent,
  CHART_COLORS.lime,
  CHART_COLORS.amber,
  CHART_COLORS.inkSoft,
  CHART_COLORS.accentDeep,
  CHART_COLORS.inkFaint,
  CHART_COLORS.ink,
] as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: CHART_COLORS.card,
  border: `2px solid ${CHART_COLORS.ink}`,
  borderRadius: 0,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
} as const;
