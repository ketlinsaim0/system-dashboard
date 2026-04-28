import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { GlassCard } from "./GlassCard";
import type { MetricSample } from "@/lib/mockMetrics";
import type { DashboardConfig } from "@/hooks/useDashboardConfig";
import { resolveTone } from "@/lib/thresholds";
import { cn } from "@/lib/utils";

type LogEntry = { id: string; t: string; level: "info" | "warn" | "error"; message: string };

const levelClass = {
  info: "text-muted-foreground",
  warn: "text-warning",
  error: "text-destructive",
};

type Props = { title: string; latest: MetricSample | null; thresholds: DashboardConfig["thresholds"] };

export function LogsCard({ title, latest, thresholds }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const lastSeenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!latest) return;
    if (lastSeenRef.current === latest.created_at) return;
    lastSeenRef.current = latest.created_at;

    const next: LogEntry[] = [];
    const time = new Date(latest.created_at).toLocaleTimeString();
    const cpuTone = resolveTone(latest.cpu, thresholds.cpu);
    const memTone = resolveTone(latest.memory, thresholds.memory);
    const diskTone = resolveTone(latest.disk, thresholds.disk);

    if (cpuTone !== "success")
      next.push({
        id: `${latest.created_at}-cpu`,
        t: time,
        level: cpuTone === "destructive" ? "error" : "warn",
        message: `CPU at ${latest.cpu.toFixed(1)}%`,
      });
    if (memTone !== "success")
      next.push({
        id: `${latest.created_at}-mem`,
        t: time,
        level: memTone === "destructive" ? "error" : "warn",
        message: `Memory at ${latest.memory.toFixed(1)}%`,
      });
    if (diskTone !== "success")
      next.push({
        id: `${latest.created_at}-disk`,
        t: time,
        level: diskTone === "destructive" ? "error" : "warn",
        message: `Disk at ${latest.disk.toFixed(1)}%`,
      });
    if (next.length === 0)
      next.push({
        id: `${latest.created_at}-tick`,
        t: time,
        level: "info",
        message: `Sample · CPU ${latest.cpu.toFixed(0)}% · Mem ${latest.memory.toFixed(0)}% · Net ${latest.network_in.toFixed(0)}/${latest.network_out.toFixed(0)} KB/s`,
      });

    setLogs((prev) => [...next, ...prev].slice(0, 50));
  }, [latest, thresholds]);

  return (
    <GlassCard className="p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          onClick={() => setLogs([])}
          className="text-2xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Trash2 className="h-3 w-3" /> Clear logs
        </button>
      </div>
      <ul className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin pr-1">
        {logs.length === 0 && (
          <li className="text-2xs text-muted-foreground italic">No events recorded.</li>
        )}
        {logs.map((l) => (
          <li key={l.id} className="flex items-start gap-2 text-2xs">
            <span className="text-muted-foreground shrink-0 num tabular-nums">{l.t}</span>
            <span className={cn("uppercase font-semibold shrink-0 w-10", levelClass[l.level])}>
              {l.level}
            </span>
            <span className="text-foreground/90">{l.message}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}