import { Area, AreaChart, ResponsiveContainer, Bar, BarChart } from "recharts";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  delta: number; // percent
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success" | "destructive";
  data: { v: number }[];
  variant?: "area" | "bar";
};

const toneMap = {
  default: { ring: "text-primary", bg: "bg-primary/10", stroke: "hsl(var(--primary))" },
  success: { ring: "text-success", bg: "bg-success/10", stroke: "hsl(var(--success))" },
  warning: { ring: "text-warning", bg: "bg-warning/10", stroke: "hsl(var(--warning))" },
  destructive: { ring: "text-destructive", bg: "bg-destructive/10", stroke: "hsl(var(--destructive))" },
};

export function MetricCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  tone = "default",
  data,
  variant = "area",
}: Props) {
  const positive = delta >= 0;
  const t = toneMap[tone];

  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:border-ring/30 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-6 w-6 rounded-md flex items-center justify-center", t.bg)}>
            <Icon className={cn("h-3.5 w-3.5", t.ring)} />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-2xs font-semibold px-1.5 py-0.5 rounded num",
            positive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}
        >
          {positive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
          {Math.abs(delta)}%
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xl font-semibold text-foreground tracking-tight num leading-none">{value}</div>
          {hint && <div className="text-2xs text-muted-foreground mt-1.5 truncate">{hint}</div>}
        </div>
        <div className="h-9 w-20 shrink-0 -mr-1 -mb-1">
          <ResponsiveContainer width="100%" height="100%">
            {variant === "area" ? (
              <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={t.stroke}
                  strokeWidth={1.5}
                  fill={`url(#grad-${label})`}
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <Bar dataKey="v" fill={t.stroke} radius={[1, 1, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
