import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Users } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/erp/EmptyState";
import { Modal } from "@/components/erp/Modal";
import { api } from "@/lib/api";
import { customerSchema, type CustomerInput } from "@/lib/validation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Customer = CustomerInput & { id: string; created_at: string };

export default function Customers() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomerInput>({ name: "", email: "", phone: "", company: "", address: "", notes: "" });

  async function load() {
    setLoading(true);
    try { setItems(((await api.customers.list()) as Customer[]) ?? []); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter((c) =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.company ?? "").toLowerCase().includes(q.toLowerCase()) || (c.email ?? "").toLowerCase().includes(q.toLowerCase())
  ), [items, q]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    try {
      await api.customers.create(parsed.data);
      toast.success("Customer added"); setOpen(false);
      setForm({ name: "", email: "", phone: "", company: "", address: "", notes: "" });
      load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to create"); }
  }

  async function remove(id: string) {
    setItems((xs) => xs.filter((x) => x.id !== id));
    try { await api.customers.remove(id); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); load(); }
  }

  return (
    <>
      <AppHeader title="Customers" subtitle={`${items.length} total · ${filtered.length} shown`} actions={
        <button onClick={() => setOpen(true)} className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> New customer
        </button>
      } />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-[1400px] mx-auto w-full">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, company, email…" className="w-full h-9 pl-8 pr-3 text-sm rounded-md bg-card border focus:border-ring focus:outline-none" />
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? <Skeleton className="h-64" /> : filtered.length === 0 ? <EmptyState icon={Users} title="No customers" description="Add your first customer to get started." /> : (
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Company</th>
                  <th className="text-left px-3 py-2 font-medium">Email</th>
                  <th className="text-left px-3 py-2 font-medium">Phone</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2 text-foreground">{c.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.company || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.email || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.phone || "—"}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => remove(c.id)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <Modal open={open} onClose={() => setOpen(false)} title="New customer">
        <form onSubmit={add} className="space-y-3">
          <input required placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Company" value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} className="h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
            <input type="email" placeholder="Email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          </div>
          <input placeholder="Phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-9 px-3 text-sm rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="h-9 px-3 text-sm rounded-md border hover:bg-muted">Cancel</button>
            <button type="submit" className="h-9 px-3 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Add customer</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
