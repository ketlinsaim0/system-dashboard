import { useState } from "react";
import { DollarSign, ShoppingCart, AlertTriangle, Activity, Calendar, Filter, Download } from "lucide-react";
import { ErpSidebar } from "@/components/erp/Sidebar";
import { ErpHeader } from "@/components/erp/Header";
import { MetricCard } from "@/components/erp/MetricCard";
import { TransactionsTable } from "@/components/erp/TransactionsTable";
import { MonthlyGrowthChart, RevenueByCategoryChart } from "@/components/erp/AnalyticsCharts";
import { ActivityFeed } from "@/components/erp/ActivityFeed";

const spark = (seed: number) =>
  Array.from({ length: 12 }, (_, i) => ({
    v: 40 + Math.sin(i * 0.7 + seed) * 18 + (i * seed) / 8 + Math.random() * 6,
  }));

const Index = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <ErpSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex-1 flex flex-col min-w-0">
        <ErpHeader />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
            {/* Page heading */}
            <div className="flex items-end justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">Operations Overview</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Welcome back, Jane. Here's what's happening across your organization today.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="h-7 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md border border-border bg-card hover:bg-muted text-foreground">
                  <Calendar className="h-3 w-3" /> Last 30 days
                </button>
                <button className="h-7 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md border border-border bg-card hover:bg-muted text-foreground">
                  <Filter className="h-3 w-3" /> Filters
                </button>
                <button className="h-7 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="h-3 w-3" /> Export report
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                label="Total Revenue"
                value="$248,932"
                delta={12.4}
                hint="vs $221,489 last period"
                icon={DollarSign}
                tone="default"
                data={spark(1)}
              />
              <MetricCard
                label="Active Orders"
                value="1,284"
                delta={4.2}
                hint="184 awaiting fulfillment"
                icon={ShoppingCart}
                tone="success"
                data={spark(2)}
                variant="bar"
              />
              <MetricCard
                label="Inventory Alerts"
                value="23"
                delta={-8.1}
                hint="7 critical · 16 low stock"
                icon={AlertTriangle}
                tone="warning"
                data={spark(3)}
              />
              <MetricCard
                label="System Health"
                value="99.98%"
                delta={0.2}
                hint="All services operational"
                icon={Activity}
                tone="success"
                data={spark(4)}
                variant="bar"
              />
            </div>

            {/* Analytics row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2">
                <MonthlyGrowthChart />
              </div>
              <RevenueByCategoryChart />
            </div>

            {/* Table + activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              <div className="xl:col-span-2">
                <TransactionsTable />
              </div>
              <ActivityFeed />
            </div>

            <div className="text-2xs text-muted-foreground text-center py-2">
              Nexus ERP · v2.4.1 · © 2026 Acme Corp
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
