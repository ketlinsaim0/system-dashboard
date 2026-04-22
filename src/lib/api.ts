import { supabase } from "@/integrations/supabase/client";

/**
 * Thin CRUD helpers — equivalent to REST endpoints
 * (GET /resource, POST /resource, PATCH /resource/:id, DELETE /resource/:id)
 * Auth (JWT) is attached automatically by the Supabase client.
 * Validate inputs with Zod schemas in src/lib/validation.ts before calling.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function ownerId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run<T>(builder: any): Promise<T> {
  const { data, error } = (await builder) as { data: T; error: { message: string } | null };
  if (error) throw new Error(error.message);
  return data;
}

export const api = {
  customers: {
    list: () => run(db.from("customers").select("*").order("created_at", { ascending: false })),
    get: (id: string) => run(db.from("customers").select("*").eq("id", id).single()),
    create: async (input: Record<string, unknown>) =>
      run(db.from("customers").insert({ ...input, owner_id: await ownerId() }).select().single()),
    update: (id: string, input: Record<string, unknown>) =>
      run(db.from("customers").update(input).eq("id", id).select().single()),
    remove: (id: string) => run(db.from("customers").delete().eq("id", id)),
  },
  leads: {
    list: () => run(db.from("leads").select("*, customers(name, company)").order("created_at", { ascending: false })),
    create: async (input: Record<string, unknown>) =>
      run(db.from("leads").insert({ ...input, owner_id: await ownerId() }).select().single()),
    update: (id: string, input: Record<string, unknown>) =>
      run(db.from("leads").update(input).eq("id", id).select().single()),
    remove: (id: string) => run(db.from("leads").delete().eq("id", id)),
  },
  products: {
    list: () => run(db.from("products").select("*").order("name")),
    create: async (input: Record<string, unknown>) =>
      run(db.from("products").insert({ ...input, owner_id: await ownerId() }).select().single()),
    update: (id: string, input: Record<string, unknown>) =>
      run(db.from("products").update(input).eq("id", id).select().single()),
    remove: (id: string) => run(db.from("products").delete().eq("id", id)),
  },
  employees: {
    list: () => run(db.from("employees").select("*").order("full_name")),
    create: (input: Record<string, unknown>) =>
      run(db.from("employees").insert(input).select().single()),
    update: (id: string, input: Record<string, unknown>) =>
      run(db.from("employees").update(input).eq("id", id).select().single()),
    remove: (id: string) => run(db.from("employees").delete().eq("id", id)),
  },
  invoices: {
    list: () => run(db.from("invoices").select("*, customers(name, company)").order("issue_date", { ascending: false })),
    create: async (input: Record<string, unknown>) =>
      run(db.from("invoices").insert({ ...input, owner_id: await ownerId() }).select().single()),
    update: (id: string, input: Record<string, unknown>) =>
      run(db.from("invoices").update(input).eq("id", id).select().single()),
    remove: (id: string) => run(db.from("invoices").delete().eq("id", id)),
  },
};