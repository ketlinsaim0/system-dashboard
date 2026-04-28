import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { nextSample, seedHistory, type MetricSample } from "@/lib/mockMetrics";

const HISTORY_LIMIT = 30;

export type SystemMetricsState = {
  history: MetricSample[];
  latest: MetricSample | null;
  loading: boolean;
  paused: boolean;
  source: "cloud" | "mock";
  togglePaused: () => void;
  refreshNow: () => void;
  clearHistory: () => void;
};

export function useSystemMetrics(refreshMs: number): SystemMetricsState {
  const { user, isDemo } = useAuth();
  const useCloud = !!user && !isDemo;

  const [history, setHistory] = useState<MetricSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const append = (s: MetricSample) =>
    setHistory((prev) => {
      const next = [...prev, s];
      if (next.length > HISTORY_LIMIT) next.splice(0, next.length - HISTORY_LIMIT);
      return next;
    });

  // Initial load
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHistory([]);

    if (useCloud && user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("system_metrics")
        .select("cpu, memory, network_in, network_out, disk, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT)
        .then(({ data }: { data: MetricSample[] | null }) => {
          if (cancelled) return;
          const rows = (data ?? []).slice().reverse();
          if (rows.length === 0) {
            // Seed locally so charts render immediately while we wait for the first insert.
            setHistory(seedHistory(HISTORY_LIMIT));
          } else {
            setHistory(rows);
          }
          setLoading(false);
        });
    } else {
      // Demo / unauthenticated: seed mock history
      const t = setTimeout(() => {
        if (cancelled) return;
        setHistory(seedHistory(HISTORY_LIMIT));
        setLoading(false);
      }, 500); // small delay to show skeletons
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [useCloud, user]);

  // Realtime subscription (cloud mode)
  useEffect(() => {
    if (!useCloud || !user) return;
    const channel = supabase
      .channel(`system_metrics:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "system_metrics", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as MetricSample;
          append(row);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [useCloud, user]);

  // Producer loop
  useEffect(() => {
    if (paused) return;
    const tick = async () => {
      const sample = nextSample();
      if (useCloud && user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("system_metrics").insert({
          user_id: user.id,
          cpu: sample.cpu,
          memory: sample.memory,
          network_in: sample.network_in,
          network_out: sample.network_out,
          disk: sample.disk,
        });
        // Realtime listener will append; no local append to avoid duplicates.
      } else {
        append(sample);
      }
    };
    intervalRef.current = window.setInterval(tick, Math.max(500, refreshMs));
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused, refreshMs, useCloud, user]);

  const latest = history.length ? history[history.length - 1] : null;

  return {
    history,
    latest,
    loading,
    paused,
    source: useCloud ? "cloud" : "mock",
    togglePaused: () => setPaused((p) => !p),
    refreshNow: () => {
      const s = nextSample();
      append(s);
    },
    clearHistory: () => setHistory([]),
  };
}