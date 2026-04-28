import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type WidgetKey =
  | "kpi_revenue"
  | "kpi_leads"
  | "kpi_customers"
  | "kpi_lowstock"
  | "chart_pipeline"
  | "chart_revenue"
  | "recent_leads"
  | "low_stock";

export type DashboardConfig = {
  titles: Record<WidgetKey, string>;
  visible: Record<WidgetKey, boolean>;
  order: WidgetKey[];
};

export const ALL_WIDGETS: WidgetKey[] = [
  "kpi_revenue",
  "kpi_leads",
  "kpi_customers",
  "kpi_lowstock",
  "chart_pipeline",
  "chart_revenue",
  "recent_leads",
  "low_stock",
];

export const DEFAULT_CONFIG: DashboardConfig = {
  titles: {
    kpi_revenue: "Total Revenue",
    kpi_leads: "Active Leads",
    kpi_customers: "Customers",
    kpi_lowstock: "Low Stock",
    chart_pipeline: "Sales Pipeline",
    chart_revenue: "Monthly Revenue",
    recent_leads: "Recent Leads",
    low_stock: "Low Stock Items",
  },
  visible: {
    kpi_revenue: true,
    kpi_leads: true,
    kpi_customers: true,
    kpi_lowstock: true,
    chart_pipeline: true,
    chart_revenue: true,
    recent_leads: true,
    low_stock: true,
  },
  order: [...ALL_WIDGETS],
};

const STORAGE_KEY = "sysdash:config";

function merge(base: DashboardConfig, partial: Partial<DashboardConfig> | null | undefined): DashboardConfig {
  if (!partial) return base;
  // Preserve only keys that exist in current schema (keeps state fresh after refactors)
  const order = Array.isArray(partial.order)
    ? (partial.order.filter((k): k is WidgetKey => ALL_WIDGETS.includes(k as WidgetKey)))
    : base.order;
  // Append any new widgets that the persisted state didn't know about
  const orderComplete = [...order, ...ALL_WIDGETS.filter((k) => !order.includes(k))];
  return {
    titles: { ...base.titles, ...(partial.titles ?? {}) },
    visible: { ...base.visible, ...(partial.visible ?? {}) },
    order: orderComplete,
  };
}

function readLocal(): DashboardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return merge(DEFAULT_CONFIG, JSON.parse(raw));
  } catch {
    return DEFAULT_CONFIG;
  }
}

type Ctx = {
  config: DashboardConfig;
  update: (patch: Partial<DashboardConfig>) => void;
  reset: () => void;
};

const ConfigContext = createContext<Ctx>({
  config: DEFAULT_CONFIG,
  update: () => {},
  reset: () => {},
});

export function DashboardConfigProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [config, setConfig] = useState<DashboardConfig>(() => readLocal());
  const hydrated = useRef(false);

  // Load from Cloud once authenticated
  useEffect(() => {
    if (!user) {
      hydrated.current = false;
      return;
    }
    let cancelled = false;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("user_settings")
        .select("config")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data?.config) {
        setConfig((prev) => merge(prev, data.config));
      }
      hydrated.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Persist locally on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Persist to Cloud (debounced) once we've hydrated, to avoid overwriting on first load
  useEffect(() => {
    if (!user || !hydrated.current) return;
    const handle = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("user_settings")
        .upsert({ user_id: user.id, config }, { onConflict: "user_id" })
        .then(() => {});
    }, 600);
    return () => clearTimeout(handle);
  }, [config, user]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        update: (patch) => setConfig((prev) => merge(prev, patch)),
        reset: () => setConfig(DEFAULT_CONFIG),
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export const useDashboardConfig = () => useContext(ConfigContext);