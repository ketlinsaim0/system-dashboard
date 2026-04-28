import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
};

const toneMap = {
  primary: { text: "text-primary", bg: "bg-primary/10" },
  success: { text: "text-success", bg: "bg-success/10" },
  warning: { text: "text-warning", bg: "bg-warning/10" },
  info: { text: "text-info", bg: "bg-info/10" },
};

export function KpiCard({ label, value, delta, hint, icon: Icon, tone = "primary" }: Props) {
  const t = toneMap[tone];
  return (
    <div className="rounded-xl border bg-card p-4 hover:border-ring/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", t.bg)}>
            <Icon className={cn("h-3.5 w-3.5", t.text)} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-2xs font-semibold px-1.5 py-0.5 rounded",
              delta >= 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10",
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">{value}</div>
      {hint && <div className="text-2xs text-muted-foreground mt-1.5">{hint}</div>}
    </div>
  );
}