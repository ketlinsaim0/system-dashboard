import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Package } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { StockBadge } from "@/components/erp/StatusBadge";
import { EmptyState } from "@/components/erp/EmptyState";
import { Modal } from "@/components/erp/Modal";
import { api } from "@/lib/api";
import { productSchema, type ProductInput } from "@/lib/validation";
import { fmtCurrency, fmtNumber } from "@/lib/format";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Product = ProductInput & { id: string };
type SortKey = "name" | "sku" | "price" | "stock";
const PAGE_SIZE = 10;

export default function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductInput>({ sku: "", name: "", description: "", category: "", price: 0, stock: 0, low_stock_threshold: 5 });

  async function load() {
    setLoading(true);
    try { setItems(((await api.products.list()) as Product[]) ?? []); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((p) =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())
  ), [items, q]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key];
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av ?? "").localeCompare(String(bv ?? ""));
    return sort.dir === "asc" ? cmp : -cmp;
  }), [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = productSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    try {
      await api.products.create(parsed.data);
      toast.success("Product added"); setOpen(false);
      setForm({ sku: "", name: "", description: "", category: "", price: 0, stock: 0, low_stock_threshold: 5 });
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to create"); }
  }

  async function remove(id: string) {
    setItems((xs) => xs.filter((x) => x.id !== id));
    try { await api.products.remove(id); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); load(); }
  }

  return (
    <>
      <AppHeader title="Products" subtitle={`${items.length} items`} actions={
        <button onClick={() => setOpen(true)} className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New product
        </button>
      } />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-[1400px] mx-auto w-full">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name or SKU…" className="w-full h-9 pl-8 pr-3 text-sm rounded-md bg-card border focus:border-ring focus:outline-none" />
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? <Skeleton className="h-64" /> : sorted.length === 0 ? <EmptyState icon={Package} title="No products" description="Add your first product to get started." /> : (
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  {(["name", "sku", "price", "stock"] as SortKey[]).map((k) => (
                    <th key={k} className="text-left px-3 py-2 font-medium cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort(k)}>
                      {k.toUpperCase()}{sort.key === k ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                  ))}
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2 text-foreground">{p.name}</td>
                    <td className="px-3 py-2 text-muted-foreground tabular-nums">{p.sku}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtCurrency(Number(p.price))}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtNumber(Number(p.stock))}</td>
                    <td className="px-3 py-2"><StockBadge stock={Number(p.stock)} threshold={Number(p.low_stock_threshold)} /></td>
                    <td className="px-3 py-2">
                      <button onClick={() => remove(p.id)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
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

      <Modal open={open} onClose={() => setOpen(false)} title="New product">
        <form onSubmit={add} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input required placeholder="SKU *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
            <input required placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          </div>
          <input placeholder="Category" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" min={0} step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
            <input type="number" min={0} placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
            <input type="number" min={0} placeholder="Low threshold" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} className="h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="h-9 px-3 text-sm rounded-md border hover:bg-muted">Cancel</button>
            <button type="submit" className="h-9 px-3 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Add product</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
