/** Traffic-light tone resolution from a 0-100 percent value and thresholds. */
export type Tone = "success" | "warning" | "destructive";

export type Thresholds = { warn: number; crit: number };

export function resolveTone(value: number, t: Thresholds): Tone {
  if (value >= t.crit) return "destructive";
  if (value >= t.warn) return "warning";
  return "success";
}

export const toneColor: Record<Tone, string> = {
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
};

export const toneClass: Record<Tone, { text: string; bg: string; ring: string }> = {
  success: { text: "text-success", bg: "bg-success/10", ring: "ring-success/30" },
  warning: { text: "text-warning", bg: "bg-warning/10", ring: "ring-warning/30" },
  destructive: { text: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30" },
};