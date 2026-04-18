import { CheckCircle2, AlertTriangle, FileText, UserPlus, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: CheckCircle2, tone: "success", title: "Invoice INV-2039 paid", meta: "Pied Piper Inc. · $24,990.00", time: "2m" },
  { icon: AlertTriangle, tone: "warning", title: "Low stock: SKU-A23", meta: "Warehouse 02 · 14 units left", time: "11m" },
  { icon: UserPlus, tone: "info", title: "New lead assigned", meta: "Sarah Connor → Q2 pipeline", time: "32m" },
  { icon: Package, tone: "primary", title: "Shipment SHP-881 dispatched", meta: "DHL · ETA Apr 22", time: "1h" },
  { icon: FileText, tone: "default", title: "Q1 report generated", meta: "Finance · 32 pages", time: "3h" },
  { icon: CheckCircle2, tone: "success", title: "Reconciliation complete", meta: "Bank of America · 412 entries", time: "5h" },
];

const toneStyles: Record<string, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  primary: "bg-primary/10 text-primary",
  default: "bg-muted text-muted-foreground",
};

export function ActivityFeed() {
  return (
    <div className="bg-card border border-border rounded-lg flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Activity Stream</h3>
          <p className="text-2xs text-muted-foreground mt-0.5">Real-time system events</p>
        </div>
        <span className="inline-flex items-center gap-1 text-2xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
          Live
        </span>
      </div>
      <ul className="divide-y divide-border overflow-y-auto scrollbar-thin">
        {items.map((it, idx) => {
          const Icon = it.icon;
          return (
            <li key={idx} className="px-4 py-2.5 flex items-start gap-2.5 hover:bg-accent/40 transition-colors">
              <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", toneStyles[it.tone])}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground leading-tight truncate">{it.title}</div>
                <div className="text-2xs text-muted-foreground mt-0.5 truncate">{it.meta}</div>
              </div>
              <span className="text-2xs text-muted-foreground num shrink-0">{it.time}</span>
            </li>
          );
        })}
      </ul>
      <div className="px-4 py-2 border-t border-border text-center">
        <button className="text-2xs font-medium text-primary hover:underline">View all activity →</button>
      </div>
    </div>
  );
}
