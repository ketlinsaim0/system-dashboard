import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Target,
  Users,
  AlertTriangle,
  Plus,
  Settings2,
  RefreshCw,
  Inbox,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppHeader } from "@/components/layout/AppHeader";
import { KpiCard } from "@/components/erp/KpiCard";
import { LeadStatusBadge } from "@/components/erp/StatusBadge";
import { EmptyState } from "@/components/erp/EmptyState";
import { LayoutSettingsDrawer } from "@/components/erp/LayoutSettingsDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardConfig, type WidgetKey } from "@/hooks/useDashboardConfig";
import { api } from "@/lib/api";
import { fmtCurrency, fmtNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeadStatus } from "@/components/erp/StatusBadge";

type Lead = {
  id: string;
  title: string;
  status: LeadStatus;
  value: number | null;
  created_at: string;
};
type Customer = { id: string; name: string; created_at: string };
type Product = { id: string; name: string; sku: string; stock: number; low_stock_threshold: number };
type Invoice = { id: string; total: number; status: string; issue_date: string };

const PIPELINE_COLORS: Record<LeadStatus, string> = {
  new: "hsl(var(--info))",
  contacted: "hsl(var(--primary))",
  qualified: "hsl(var(--warning))",
  won: "hsl(var(--success))",
  lost: "hsl(var(--destructive))",
};

export default function Index() {
  const { user, isDemo } = useAuth();
  const { config } = useDashboardConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [l, c, p, i] = await Promise.all([
        api.leads.list(),
        api.customers.list(),
        api.products.list(),
        api.invoices.list(),
      ]);
      setLeads((l as Lead[]) ?? []);
      setCustomers((c as Customer[]) ?? []);
      setProducts((p as Product[]) ?? []);
      setInvoices((i as Invoice[]) ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const totalRevenue = useMemo(
    () => invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total ?? 0), 0),
    [invoices],
  );
  const activeLeads = useMemo(
    () => leads.filter((l) => l.status !== "won" && l.status !== "lost").length,
    [leads],
  );
  const lowStockItems = useMemo(
    () => products.filter((p) => p.stock <= p.low_stock_threshold),
    [products],
  );

  const pipelineData = useMemo(() => {
    const counts: Record<LeadStatus, { count: number; value: number }> = {
      new: { count: 0, value: 0 },
      contacted: { count: 0, value: 0 },
      qualified: { count: 0, value: 0 },
      won: { count: 0, value: 0 },
      lost: { count: 0, value: 0 },
    };
    for (const l of leads) {
      counts[l.status].count += 1;
      counts[l.status].value += Number(l.value ?? 0);
    }
    return (Object.keys(counts) as LeadStatus[]).map((s) => ({
      status: s,
      count: counts[s].count,
      value: counts[s].value,
    }));
  }, [leads]);

  const monthlyRevenue = useMemo(() => {
    const buckets = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString(undefined, { month: "short" });
      buckets.set(key, 0);
    }
    for (const inv of invoices) {
      if (inv.status !== "paid") continue;
      const d = new Date(inv.issue_date);
      if (Number.isNaN(d.getTime())) continue;
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (monthsAgo < 0 || monthsAgo > 5) continue;
      const key = d.toLocaleString(undefined, { month: "short" });
      buckets.set(key, (buckets.get(key) ?? 0) + Number(inv.total ?? 0));
    }
    return Array.from(buckets, ([month, total]) => ({ month, total }));
  }, [invoices]);

  const recentLeads = useMemo(() => leads.slice(0, 5), [leads]);

  const widgets: Record<WidgetKey, JSX.Element> = {
    kpi_revenue: (
      <KpiCard
        label={config.titles.kpi_revenue}
        value={fmtCurrency(totalRevenue)}
        icon={DollarSign}
        tone="primary"
        hint={`${invoices.filter((i) => i.status === "paid").length} paid invoices`}
      />
    ),
    kpi_leads: (
      <KpiCard
        label={config.titles.kpi_leads}
        value={fmtNumber(activeLeads)}
        icon={Target}
        tone="info"
        hint={`${leads.length} total leads`}
      />
    ),
    kpi_customers: (
      <KpiCard
        label={config.titles.kpi_customers}
        value={fmtNumber(customers.length)}
        icon={Users}
        tone="success"
        hint="Active accounts"
      />
    ),
    kpi_lowstock: (
      <KpiCard
        label={config.titles.kpi_lowstock}
        value={fmtNumber(lowStockItems.length)}
        icon={AlertTriangle}
        tone="warning"
        hint={`${products.length} products tracked`}
      />
    ),
    chart_pipeline: (
      <div className="rounded-xl border bg-card p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{config.titles.chart_pipeline}</h3>
          <span className="text-2xs text-muted-foreground">By status</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={pipelineData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, name) => (name === "value" ? [fmtCurrency(v), "Pipeline value"] : [v, "Count"])}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {pipelineData.map((d) => (
                  <Cell key={d.status} fill={PIPELINE_COLORS[d.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    chart_revenue: (
      <div className="rounded-xl border bg-card p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{config.titles.chart_revenue}</h3>
          <span className="text-2xs text-muted-foreground">Last 6 months</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={monthlyRevenue} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmtCurrency(v), "Revenue"]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="total" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    ),
    recent_leads: (
      <div className="rounded-xl border bg-card p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{config.titles.recent_leads}</h3>
          <Link to="/leads" className="text-2xs text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        {recentLeads.length === 0 ? (
          <EmptyState icon={Inbox} title="No leads yet" description="Capture your first lead to see it here." />
        ) : (
          <ul className="space-y-2">
            {recentLeads.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-1.5 border-b last:border-b-0">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{l.title}</div>
                  <div className="text-2xs text-muted-foreground">{fmtCurrency(Number(l.value ?? 0))}</div>
                </div>
                <LeadStatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    low_stock: (
      <div className="rounded-xl border bg-card p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">{config.titles.low_stock}</h3>
          <Link to="/products" className="text-2xs text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        {lowStockItems.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="All stock healthy" description="No products below their threshold." />
        ) : (
          <ul className="space-y-2">
            {lowStockItems.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-1.5 border-b last:border-b-0">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                  <div className="text-2xs text-muted-foreground">SKU {p.sku}</div>
                </div>
                <span className="text-xs font-semibold tabular-nums text-warning">{p.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
  };

  const orderedVisible = config.order.filter((k) => config.visible[k]);
  const greeting = isDemo ? "Welcome to the demo" : `Welcome back, ${user?.email?.split("@")[0] ?? "there"}`;

  return (
    <>
      <AppHeader
        title="Overview"
        subtitle={greeting}
        actions={
          <>
            <button
              onClick={load}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md border bg-card hover:bg-muted text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md border bg-card hover:bg-muted text-foreground"
            >
              <Settings2 className="h-3.5 w-3.5" /> Edit dashboard
            </button>
            <Link
              to="/leads"
              className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> New lead
            </Link>
          </>
        }
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-4 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {orderedVisible
                  .filter((k) => k.startsWith("kpi_"))
                  .map((k) => (
                    <div key={k}>{widgets[k]}</div>
                  ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {orderedVisible
                  .filter((k) => k.startsWith("chart_"))
                  .map((k) => (
                    <div key={k}>{widgets[k]}</div>
                  ))}
              </div>

              {/* Lists row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {orderedVisible
                  .filter((k) => !k.startsWith("kpi_") && !k.startsWith("chart_"))
                  .map((k) => (
                    <div key={k}>{widgets[k]}</div>
                  ))}
              </div>
            </>
          )}
        </div>
      </main>

      <LayoutSettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
