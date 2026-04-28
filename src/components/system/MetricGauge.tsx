import type { LucideIcon } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { resolveTone, toneClass, type Thresholds } from "@/lib/thresholds";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  thresholds: Thresholds;
  hint?: string;
};

export function MetricGauge({ title, value, unit = "%", icon: Icon, thresholds, hint }: Props) {
  const tone = resolveTone(value, thresholds);
  const cls = toneClass[tone];
  const pct = Math.max(0, Math.min(100, value));
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", cls.bg)}>
            <Icon className={cn("h-3.5 w-3.5", cls.text)} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
        <span
          className={cn(
            "text-2xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded num",
            cls.bg,
            cls.text,
          )}
          aria-label={`Status ${tone}`}
        >
          {tone === "destructive" ? "Critical" : tone === "warning" ? "Warning" : "OK"}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-semibold tracking-tight num text-foreground tabular-nums">
          {pct.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full transition-[width] duration-500 ease-out", {
            "bg-success": tone === "success",
            "bg-warning": tone === "warning",
            "bg-destructive": tone === "destructive",
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <div className="text-2xs text-muted-foreground mt-2 truncate">{hint}</div>}
    </GlassCard>
  );
}