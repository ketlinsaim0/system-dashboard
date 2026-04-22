import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const leadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  status: z.enum(["new", "contacted", "qualified", "won", "lost"]).default("new"),
  value: z.coerce.number().min(0).default(0),
  source: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  customer_id: z.string().uuid().optional().nullable(),
});
export type LeadInput = z.infer<typeof leadSchema>;

export const productSchema = z.object({
  sku: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  price: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  low_stock_threshold: z.coerce.number().int().min(0).default(5),
});
export type ProductInput = z.infer<typeof productSchema>;

export const employeeSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  department: z.string().trim().max(80).optional().or(z.literal("")),
  position: z.string().trim().max(80).optional().or(z.literal("")),
  hire_date: z.string().optional().or(z.literal("")),
  salary: z.coerce.number().min(0).optional(),
  status: z.enum(["active", "on_leave", "terminated"]).default("active"),
});
export type EmployeeInput = z.infer<typeof employeeSchema>;

export const invoiceSchema = z.object({
  invoice_number: z.string().trim().min(1).max(40),
  customer_id: z.string().uuid(),
  issue_date: z.string().optional(),
  due_date: z.string().optional().or(z.literal("")),
  channel: z.string().trim().max(40).optional().or(z.literal("")),
  status: z.enum(["draft", "pending", "paid", "failed", "refunded"]).default("draft"),
  total: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const authSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});