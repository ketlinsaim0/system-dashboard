import { supabase } from "@/integrations/supabase/client";

/**
 * Thin typed CRUD helpers — equivalent to REST endpoints
 * (GET /resource, POST /resource, PATCH /resource/:id, DELETE /resource/:id)
 * Auth (JWT) is automatically attached by the Supabase client.
 */

function unwrap<T>(p: Promise<{ data: T | null; error: { message: string } | null }>) {
  return p.then(({ data, error }) => {
    if (error) throw new Error(error.message);
    return data as T;
  });
}

export const api = {
  customers: {
    list: () => unwrap(supabase.from("customers").select("*").order("created_at", { ascending: false })),
    get: (id: string) => unwrap(supabase.from("customers").select("*").eq("id", id).single()),
    create: async (input: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return unwrap(supabase.from("customers").insert({ ...input, owner_id: user.id }).select().single());
    },
    update: (id: string, input: Record<string, unknown>) =>
      unwrap(supabase.from("customers").update(input).eq("id", id).select().single()),
    remove: (id: string) => unwrap(supabase.from("customers").delete().eq("id", id)),
  },
  leads: {
    list: () => unwrap(supabase.from("leads").select("*, customers(name, company)").order("created_at", { ascending: false })),
    create: async (input: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return unwrap(supabase.from("leads").insert({ ...input, owner_id: user.id }).select().single());
    },
    update: (id: string, input: Record<string, unknown>) =>
      unwrap(supabase.from("leads").update(input).eq("id", id).select().single()),
    remove: (id: string) => unwrap(supabase.from("leads").delete().eq("id", id)),
  },
  products: {
    list: () => unwrap(supabase.from("products").select("*").order("name")),
    create: async (input: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return unwrap(supabase.from("products").insert({ ...input, owner_id: user.id }).select().single());
    },
    update: (id: string, input: Record<string, unknown>) =>
      unwrap(supabase.from("products").update(input).eq("id", id).select().single()),
    remove: (id: string) => unwrap(supabase.from("products").delete().eq("id", id)),
  },
  employees: {
    list: () => unwrap(supabase.from("employees").select("*").order("full_name")),
    create: (input: Record<string, unknown>) =>
      unwrap(supabase.from("employees").insert(input).select().single()),
    update: (id: string, input: Record<string, unknown>) =>
      unwrap(supabase.from("employees").update(input).eq("id", id).select().single()),
    remove: (id: string) => unwrap(supabase.from("employees").delete().eq("id", id)),
  },
  invoices: {
    list: () => unwrap(supabase.from("invoices").select("*, customers(name, company)").order("issue_date", { ascending: false })),
    create: async (input: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return unwrap(supabase.from("invoices").insert({ ...input, owner_id: user.id }).select().single());
    },
    update: (id: string, input: Record<string, unknown>) =>
      unwrap(supabase.from("invoices").update(input).eq("id", id).select().single()),
    remove: (id: string) => unwrap(supabase.from("invoices").delete().eq("id", id)),
  },
};