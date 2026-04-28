import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type WidgetKey = "cpu" | "memory" | "network" | "disk" | "chart" | "logs";

export type DashboardConfig = {
  titles: Record<WidgetKey, string>;
  visible: Record<WidgetKey, boolean>;
  thresholds: Record<"cpu" | "memory" | "disk", { warn: number; crit: number }>;
  refreshMs: number;
};

export const DEFAULT_CONFIG: DashboardConfig = {
  titles: {
    cpu: "CPU Usage",
    memory: "Memory",
    network: "Network",
    disk: "Disk",
    chart: "Resource Timeline",
    logs: "Activity Logs",
  },
  visible: { cpu: true, memory: true, network: true, disk: true, chart: true, logs: true },
  thresholds: {
    cpu: { warn: 65, crit: 85 },
    memory: { warn: 70, crit: 88 },
    disk: { warn: 75, crit: 90 },
  },
  refreshMs: 2000,
};

const STORAGE_KEY = "sysdash:config";

function merge(base: DashboardConfig, partial: Partial<DashboardConfig> | null | undefined): DashboardConfig {
  if (!partial) return base;
  return {
    titles: { ...base.titles, ...(partial.titles ?? {}) },
    visible: { ...base.visible, ...(partial.visible ?? {}) },
    thresholds: {
      cpu: { ...base.thresholds.cpu, ...(partial.thresholds?.cpu ?? {}) },
      memory: { ...base.thresholds.memory, ...(partial.thresholds?.memory ?? {}) },
      disk: { ...base.thresholds.disk, ...(partial.thresholds?.disk ?? {}) },
    },
    refreshMs: partial.refreshMs ?? base.refreshMs,
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