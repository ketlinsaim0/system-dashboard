import { cn } from "@/lib/utils";

type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";
type InvoiceStatus = "draft" | "pending" | "paid" | "failed" | "refunded";
type StockStatus = "ok" | "low" | "out";

const leadStyles: Record<LeadStatus, string> = {
  new: "bg-info/10 text-info",
  contacted: "bg-primary/10 text-primary",
  qualified: "bg-warning/10 text-warning",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

const invoiceStyles: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-info/10 text-info",
};

const stockStyles: Record<StockStatus, string> = {
  ok: "bg-success/10 text-success",
  low: "bg-warning/10 text-warning",
  out: "bg-destructive/10 text-destructive",
};

export function LeadStatusBadge({
  status,
  onClick,
  className,
}: {
  status: LeadStatus;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "text-2xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded transition-opacity",
        leadStyles[status],
        onClick && "cursor-pointer hover:opacity-80",
        !onClick && "cursor-default",
        className,
      )}
      title={onClick ? "Click to advance status" : undefined}
    >
      {status}
    </button>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-block text-2xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
        invoiceStyles[status],
      )}
    >
      {status}
    </span>
  );
}

export function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  const status: StockStatus = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";
  const label = status === "ok" ? "In stock" : status === "low" ? "Low" : "Out";
  return (
    <span
      className={cn(
        "inline-block text-2xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
        stockStyles[status],
      )}
    >
      {label}
    </span>
  );
}

export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost"];
export const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "pending", "paid", "failed", "refunded"];
export type { LeadStatus, InvoiceStatus };