import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Inbox } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { LeadStatusBadge, LEAD_STATUSES, type LeadStatus } from "@/components/erp/StatusBadge";
import { EmptyState } from "@/components/erp/EmptyState";
import { Modal } from "@/components/erp/Modal";
import { api } from "@/lib/api";
import { leadSchema, type LeadInput } from "@/lib/validation";
import { fmtCurrency } from "@/lib/format";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Lead = LeadInput & { id: string; created_at: string };

const NEXT: Record<LeadStatus, LeadStatus> = {
  new: "contacted", contacted: "qualified", qualified: "won", won: "lost", lost: "new",
};

export default function Leads() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeadInput>({ title: "", status: "new", value: 0, source: "", notes: "", customer_id: null });

  async function load() {
    setLoading(true);
    try { setItems(((await api.leads.list()) as Lead[]) ?? []); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, filter]);

  const grouped = useMemo(() => {
    const m: Record<LeadStatus, Lead[]> = { new: [], contacted: [], qualified: [], won: [], lost: [] };
    for (const l of filtered) m[l.status].push(l);
    return m;
  }, [filtered]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    try {
      const payload = { ...parsed.data };
      if (!payload.customer_id) delete (payload as Partial<LeadInput>).customer_id;
      await api.leads.create(payload as Record<string, unknown>);
      toast.success("Lead added");
      setOpen(false);
      setForm({ title: "", status: "new", value: 0, source: "", notes: "", customer_id: null });
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to create"); }
  }

  async function advance(l: Lead) {
    const next = NEXT[l.status];
    setItems((xs) => xs.map((x) => x.id === l.id ? { ...x, status: next } : x));
    try { await api.leads.update(l.id, { status: next }); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); load(); }
  }

  async function remove(id: string) {
    setItems((xs) => xs.filter((x) => x.id !== id));
    try { await api.leads.remove(id); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); load(); }
  }

  return (
    <>
      <AppHeader title="Leads" subtitle={`${items.length} total · ${filtered.length} shown`} actions={
        <button onClick={() => setOpen(true)} className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New lead
        </button>
      } />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads…" className="w-full h-9 pl-8 pr-3 text-sm rounded-md bg-card border focus:border-ring focus:outline-none" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {(["all", ...LEAD_STATUSES] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`h-8 px-2.5 text-2xs uppercase tracking-wider rounded-md border transition-colors ${filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="No leads yet" description="Click 'New lead' to capture your first lead." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {LEAD_STATUSES.map((s) => (
              <div key={s} className="rounded-xl border bg-muted/30 p-3 min-h-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <LeadStatusBadge status={s} />
                  <span className="text-2xs text-muted-foreground tabular-nums">{grouped[s].length}</span>
                </div>
                <ul className="space-y-2">
                  {grouped[s].map((l) => (
                    <li key={l.id} className="bg-card rounded-lg border p-2.5 group">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-xs font-medium text-foreground truncate flex-1">{l.title}</div>
                        <button onClick={() => remove(l.id)} className="opacity-0 group-hover:opacity-100 h-6 w-6 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-2xs text-muted-foreground mb-1.5">{fmtCurrency(Number(l.value ?? 0))}{l.source ? ` · ${l.source}` : ""}</div>
                      <button onClick={() => advance(l)} className="text-2xs text-primary hover:underline">Advance →</button>
                    </li>
                  ))}
                  {grouped[s].length === 0 && <li className="text-2xs text-muted-foreground italic text-center py-4">Empty</li>}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal open={open} onClose={() => setOpen(false)} title="New lead" description="Capture a new lead.">
        <form onSubmit={add} className="space-y-3">
          <input required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })} className="h-9 px-2 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none capitalize">
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" min={0} placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          </div>
          <input placeholder="Source (optional)" value={form.source ?? ""} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          <textarea placeholder="Notes (optional)" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="h-9 px-3 text-sm rounded-md border hover:bg-muted">Cancel</button>
            <button type="submit" className="h-9 px-3 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Add lead</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
