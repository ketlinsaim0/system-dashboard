import { useState } from "react";
import {
  ArrowUpDown,
  Filter,
  Download,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "Paid" | "Pending" | "Failed" | "Refunded" | "Draft";

const statusStyles: Record<Status, string> = {
  Paid: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
  Refunded: "bg-info/10 text-info border-info/20",
  Draft: "bg-muted text-muted-foreground border-border",
};

type Tx = {
  id: string;
  date: string;
  customer: string;
  email: string;
  channel: string;
  amount: number;
  status: Status;
};

const txs: Tx[] = [
  { id: "INV-2041", date: "Apr 18, 2026", customer: "Initech Labs", email: "ap@initech.io", channel: "Stripe", amount: 12480.0, status: "Paid" },
  { id: "INV-2040", date: "Apr 18, 2026", customer: "Hooli Group", email: "billing@hooli.com", channel: "Wire", amount: 8200.5, status: "Pending" },
  { id: "INV-2039", date: "Apr 17, 2026", customer: "Pied Piper Inc.", email: "richard@piedpiper.com", channel: "ACH", amount: 24990.0, status: "Paid" },
  { id: "INV-2038", date: "Apr 17, 2026", customer: "Massive Dynamic", email: "ops@massive.dyn", channel: "Stripe", amount: 1499.99, status: "Refunded" },
  { id: "INV-2037", date: "Apr 16, 2026", customer: "Stark Industries", email: "pepper@stark.com", channel: "Wire", amount: 87500.0, status: "Paid" },
  { id: "INV-2036", date: "Apr 16, 2026", customer: "Wayne Enterprises", email: "lucius@wayne.co", channel: "ACH", amount: 5320.0, status: "Failed" },
  { id: "INV-2035", date: "Apr 15, 2026", customer: "Acme Co.", email: "wile@acme.test", channel: "Stripe", amount: 320.0, status: "Draft" },
  { id: "INV-2034", date: "Apr 15, 2026", customer: "Globex Corp", email: "ar@globex.com", channel: "Wire", amount: 14200.0, status: "Paid" },
  { id: "INV-2033", date: "Apr 14, 2026", customer: "Soylent Corp", email: "finance@soylent.co", channel: "ACH", amount: 6750.25, status: "Pending" },
];

export function TransactionsTable() {
  const [filter, setFilter] = useState<"All" | Status>("All");
  const filtered = filter === "All" ? txs : txs.filter((t) => t.status === filter);

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-2xs text-muted-foreground mt-0.5">
            Showing {filtered.length} of 1,284 entries · Updated 2 min ago
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              placeholder="Filter…"
              className="h-7 pl-7 pr-2 w-40 text-xs rounded-md bg-muted/60 border border-transparent focus:bg-card focus:border-ring focus:outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="h-7 px-2 inline-flex items-center gap-1 text-xs rounded-md border border-border hover:bg-muted text-foreground">
            <Filter className="h-3 w-3" /> Filter
          </button>
          <button className="h-7 px-2 inline-flex items-center gap-1 text-xs rounded-md border border-border hover:bg-muted text-foreground">
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>

      {/* Status chips */}
      <div className="px-4 py-2 border-b border-border flex items-center gap-1 overflow-x-auto scrollbar-thin">
        {(["All", "Paid", "Pending", "Failed", "Refunded", "Draft"] as const).map((s) => {
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "h-6 px-2.5 text-2xs rounded-full font-medium border transition-colors whitespace-nowrap",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/40"
              )}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-auto scrollbar-thin max-h-[420px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted/70 backdrop-blur z-10">
            <tr className="text-muted-foreground">
              {[
                { l: "Invoice", w: "w-24" },
                { l: "Date", w: "w-28" },
                { l: "Customer", w: "" },
                { l: "Channel", w: "w-24" },
                { l: "Amount", w: "w-28 text-right" },
                { l: "Status", w: "w-24" },
                { l: "", w: "w-10" },
              ].map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-3 py-2 text-left font-medium text-2xs uppercase tracking-wider border-b border-border",
                    h.w
                  )}
                >
                  <span className="inline-flex items-center gap-1 cursor-pointer hover:text-foreground">
                    {h.l}
                    {h.l && h.l !== "" && <ArrowUpDown className="h-2.5 w-2.5 opacity-50" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, idx) => (
              <tr
                key={tx.id}
                className={cn(
                  "border-b border-border/60 hover:bg-accent/40 transition-colors",
                  idx % 2 === 1 && "bg-muted/30"
                )}
              >
                <td className="px-3 py-2 font-mono text-2xs font-medium text-primary">{tx.id}</td>
                <td className="px-3 py-2 text-muted-foreground num">{tx.date}</td>
                <td className="px-3 py-2">
                  <div className="font-medium text-foreground leading-tight">{tx.customer}</div>
                  <div className="text-2xs text-muted-foreground">{tx.email}</div>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{tx.channel}</td>
                <td className="px-3 py-2 text-right font-semibold text-foreground num">
                  ${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-1.5 py-0.5 text-2xs font-medium rounded border",
                      statusStyles[tx.status]
                    )}
                  >
                    <span className="h-1 w-1 rounded-full bg-current" />
                    {tx.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between text-2xs text-muted-foreground">
        <div>
          Page <span className="text-foreground font-medium num">1</span> of{" "}
          <span className="text-foreground font-medium num">143</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="h-6 w-6 inline-flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40" disabled>
            <ChevronLeft className="h-3 w-3" />
          </button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              className={cn(
                "h-6 min-w-6 px-1.5 rounded border text-2xs num",
                p === 1
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted text-foreground"
              )}
            >
              {p}
            </button>
          ))}
          <button className="h-6 w-6 inline-flex items-center justify-center rounded border border-border hover:bg-muted">
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
