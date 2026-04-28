import { useEffect, useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { InvoiceStatusBadge, INVOICE_STATUSES } from "@/components/erp/StatusBadge";
import { EmptyState } from "@/components/erp/EmptyState";
import { api } from "@/lib/api";
import { fmtCurrency, fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Invoice = {
  id: string; invoice_number: string; total: number; status: typeof INVOICE_STATUSES[number];
  issue_date: string; due_date: string | null; customers?: { name: string; company: string | null } | null;
};
type SortKey = "invoice_number" | "issue_date" | "total" | "status";
const PAGE_SIZE = 10;

export default function Invoices() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | typeof INVOICE_STATUSES[number]>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "issue_date", dir: "desc" });
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try { setItems(((await api.invoices.list()) as Invoice[]) ?? []); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => filter === "all" ? items : items.filter((i) => i.status === filter), [items, filter]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key];
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av ?? "").localeCompare(String(bv ?? ""));
    return sort.dir === "asc" ? cmp : -cmp;
  }), [filtered, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalAmount = useMemo(() => sorted.reduce((s, i) => s + Number(i.total ?? 0), 0), [sorted]);

  function toggleSort(key: SortKey) {
    setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  return (
    <>
      <AppHeader title="Invoices" subtitle={`${sorted.length} shown · ${fmtCurrency(totalAmount)} total`} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-1 flex-wrap">
          {(["all", ...INVOICE_STATUSES] as const).map((s) => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }} className={`h-8 px-2.5 text-2xs uppercase tracking-wider rounded-md border transition-colors ${filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? <Skeleton className="h-64" /> : sorted.length === 0 ? <EmptyState icon={Receipt} title="No invoices" description="Invoices created via the API will appear here." /> : (
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("invoice_number")}>NUMBER{sort.key === "invoice_number" ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}</th>
                  <th className="text-left px-3 py-2 font-medium">CUSTOMER</th>
                  <th className="text-left px-3 py-2 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("issue_date")}>DATE{sort.key === "issue_date" ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}</th>
                  <th className="text-left px-3 py-2 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("total")}>TOTAL{sort.key === "total" ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}</th>
                  <th className="text-left px-3 py-2 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("status")}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((inv) => (
                  <tr key={inv.id} className="border-t">
                    <td className="px-3 py-2 text-foreground tabular-nums">{inv.invoice_number}</td>
                    <td className="px-3 py-2 text-muted-foreground">{inv.customers?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground tabular-nums">{fmtDate(inv.issue_date)}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtCurrency(Number(inv.total))}</td>
                    <td className="px-3 py-2"><InvoiceStatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-8 px-3 rounded-md border hover:bg-muted disabled:opacity-40">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 px-3 rounded-md border hover:bg-muted disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
