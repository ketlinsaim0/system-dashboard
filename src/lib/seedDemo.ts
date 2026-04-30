import { api } from "@/lib/api";

const CUSTOMERS = [
  { name: "Acme Corp", company: "Acme Corp", email: "ops@acme.test", phone: "+1 555 0100" },
  { name: "Globex", company: "Globex Inc.", email: "hello@globex.test", phone: "+1 555 0123" },
  { name: "Initech", company: "Initech LLC", email: "billing@initech.test", phone: "+1 555 0144" },
  { name: "Umbrella", company: "Umbrella Co.", email: "contact@umbrella.test", phone: "+1 555 0188" },
];

const PRODUCTS = [
  { sku: "SKU-001", name: "Pro Plan License", category: "Software", price: 499, stock: 120, low_stock_threshold: 20 },
  { sku: "SKU-002", name: "Onboarding Package", category: "Services", price: 1500, stock: 8, low_stock_threshold: 10 },
  { sku: "SKU-003", name: "Wireless Headset", category: "Hardware", price: 199, stock: 3, low_stock_threshold: 5 },
  { sku: "SKU-004", name: "USB-C Hub", category: "Hardware", price: 79, stock: 60, low_stock_threshold: 15 },
  { sku: "SKU-005", name: "Annual Support", category: "Services", price: 1200, stock: 25, low_stock_threshold: 5 },
];

const LEAD_TITLES = [
  { title: "Acme — Pro Plan upgrade", status: "qualified", value: 12000, source: "Website" },
  { title: "Globex — POC integration", status: "contacted", value: 8000, source: "Referral" },
  { title: "Initech — Annual renewal", status: "won", value: 15000, source: "Outbound" },
  { title: "Umbrella — Pilot program", status: "new", value: 5000, source: "Conference" },
  { title: "Stark Industries — Custom build", status: "lost", value: 22000, source: "Website" },
] as const;

function isoMonthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

export async function seedDemoData() {
  // Customers
  const createdCustomers: { id: string; name: string }[] = [];
  for (const c of CUSTOMERS) {
    const row = (await api.customers.create(c)) as { id: string; name: string };
    createdCustomers.push(row);
  }

  // Products
  for (const p of PRODUCTS) {
    await api.products.create(p);
  }

  // Leads (some linked to customers)
  for (let i = 0; i < LEAD_TITLES.length; i++) {
    const l = LEAD_TITLES[i];
    await api.leads.create({
      title: l.title,
      status: l.status,
      value: l.value,
      source: l.source,
      customer_id: createdCustomers[i % createdCustomers.length]?.id,
    });
  }

  // Invoices spread across last 6 months, mostly paid
  let n = 1001;
  for (let m = 5; m >= 0; m--) {
    for (let k = 0; k < 2; k++) {
      const cust = createdCustomers[(m + k) % createdCustomers.length];
      await api.invoices.create({
        invoice_number: `INV-${n++}`,
        customer_id: cust.id,
        issue_date: isoMonthsAgo(m),
        status: m === 0 && k === 1 ? "pending" : "paid",
        total: 1000 + Math.round(Math.random() * 4000),
      });
    }
  }
}
