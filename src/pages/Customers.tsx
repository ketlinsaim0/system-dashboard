import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { customerSchema, type CustomerInput } from "@/lib/validation";
import { toast } from "sonner";

type Customer = CustomerInput & { id: string; created_at: string };

export default function Customers() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CustomerInput>({
    name: "", email: "", phone: "", company: "", address: "", notes: "",
  });

  async function load() {
    setLoading(true);
    try {
      const data = await api.customers.list<Customer[]>();
      setItems(data ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    try {
      await api.customers.create(parsed.data);
      toast.success("Customer added");
      setForm({ name: "", email: "", phone: "", company: "", address: "", notes: "" });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    }
  }

  async function remove(id: string) {
    try {
      await api.customers.remove(id);
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to dashboard
        </Link>

        <div>
          <h1 className="text-lg font-semibold text-foreground">Customers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">CRM contacts · CRUD via Lovable Cloud</p>
        </div>

        <form onSubmit={add} className="bg-card border border-border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(["name", "email", "phone", "company"] as const).map((f) => (
            <input
              key={f}
              placeholder={f}
              value={form[f] ?? ""}
              onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              className="h-9 px-3 text-sm rounded-md bg-muted/60 border border-border focus:bg-card focus:border-ring focus:outline-none"
            />
          ))}
          <button type="submit" className="sm:col-span-2 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-1.5">
            <Plus className="h-4 w-4" /> Add customer
          </button>
        </form>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Name</th>
                <th className="text-left px-3 py-2 font-medium">Email</th>
                <th className="text-left px-3 py-2 font-medium">Company</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && items.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No customers yet.</td></tr>
              )}
              {items.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{c.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.email}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.company}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => remove(c.id)} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}