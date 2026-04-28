import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "./GlassCard";
import type { MetricSample } from "@/lib/mockMetrics";

type Props = { title: string; data: MetricSample[] };

export function ResourceChart({ title, data }: Props) {
  const chartData = data.map((d) => ({
    t: new Date(d.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    cpu: d.cpu,
    memory: d.memory,
    disk: d.disk,
  }));

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-3 text-2xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" /> CPU
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-info" /> Memory
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-warning" /> Disk
          </span>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="g-cpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-mem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-disk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#g-cpu)" />
            <Area type="monotone" dataKey="memory" stroke="hsl(var(--info))" strokeWidth={1.5} fill="url(#g-mem)" />
            <Area type="monotone" dataKey="disk" stroke="hsl(var(--warning))" strokeWidth={1.5} fill="url(#g-disk)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}