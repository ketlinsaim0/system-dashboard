import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { MoreHorizontal, TrendingUp } from "lucide-react";

const monthly = [
  { m: "Nov", revenue: 42000, cost: 28000 },
  { m: "Dec", revenue: 51000, cost: 31000 },
  { m: "Jan", revenue: 47500, cost: 30200 },
  { m: "Feb", revenue: 58200, cost: 33500 },
  { m: "Mar", revenue: 65400, cost: 36900 },
  { m: "Apr", revenue: 72100, cost: 38400 },
];

const categories = [
  { name: "Software", value: 38, color: "hsl(var(--primary))" },
  { name: "Services", value: 27, color: "hsl(var(--info))" },
  { name: "Hardware", value: 18, color: "hsl(var(--success))" },
  { name: "Support", value: 11, color: "hsl(var(--warning))" },
  { name: "Other", value: 6, color: "hsl(var(--muted-foreground))" },
];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 6,
  fontSize: 11,
  padding: "6px 8px",
  color: "hsl(var(--popover-foreground))",
};

export function MonthlyGrowthChart() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Monthly Growth</h3>
          <p className="text-2xs text-muted-foreground mt-0.5">Revenue vs operating cost · last 6 months</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-2xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-sm bg-primary" /> Revenue
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-sm bg-muted-foreground/40" /> Cost
            </span>
          </div>
          <button className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="m" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
              formatter={(v: number) => `$${v.toLocaleString()}`}
            />
            <Bar dataKey="cost" fill="hsl(var(--muted-foreground) / 0.35)" radius={[2, 2, 0, 0]} maxBarSize={22} />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-2xs">
        <span className="text-muted-foreground">Avg monthly growth</span>
        <span className="inline-flex items-center gap-1 text-success font-semibold">
          <TrendingUp className="h-3 w-3" /> +14.8%
        </span>
      </div>
    </div>
  );
}

export function RevenueByCategoryChart() {
  const total = categories.reduce((a, b) => a + b.value, 0);
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Revenue by Category</h3>
          <p className="text-2xs text-muted-foreground mt-0.5">Distribution · current quarter</p>
        </div>
        <button className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <div className="h-[180px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categories} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="hsl(var(--card))" strokeWidth={2}>
                {categories.map((c) => (
                  <Cell key={c.name} fill={c.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-2xs text-muted-foreground">Total</div>
            <div className="text-lg font-semibold text-foreground num leading-none">{total}%</div>
          </div>
        </div>

        <ul className="space-y-1.5">
          {categories.map((c) => (
            <li key={c.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: c.color }} />
                <span className="text-foreground truncate">{c.name}</span>
              </div>
              <span className="text-muted-foreground font-medium num">{c.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
