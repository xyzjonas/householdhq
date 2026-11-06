/**
 * Text colour that stays readable on a `#rrggbb` background. Anything that is
 * not a six-digit hex colour is treated as dark.
 */
export function readableTextOn(background: string): "#000000" | "#ffffff" {
  const match = /^#([0-9a-f]{6})$/i.exec(background);
  if (!match) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((i) =>
    parseInt(match[1].slice(i, i + 2), 16),
  );
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 135 ? "#000000" : "#ffffff";
}
