import { useState } from "react";
import { Cpu, MemoryStick, HardDrive } from "lucide-react";
import { ActionBar } from "@/components/system/ActionBar";
import { MetricGauge } from "@/components/system/MetricGauge";
import { NetworkCard } from "@/components/system/NetworkCard";
import { ResourceChart } from "@/components/system/ResourceChart";
import { LogsCard } from "@/components/system/LogsCard";
import { SkeletonCard } from "@/components/system/SkeletonCard";
import { ConfigDrawer } from "@/components/system/ConfigDrawer";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";

const Index = () => {
  const { config } = useDashboardConfig();
  const { history, latest, loading, paused, source, togglePaused, refreshNow } =
    useSystemMetrics(config.refreshMs);
  const [configOpen, setConfigOpen] = useState(false);

  const visibleGaugeCount =
    Number(config.visible.cpu) + Number(config.visible.memory) + Number(config.visible.network) + Number(config.visible.disk);

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden">
      {/* Ambient gradient backdrop for the glassmorphism look */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -right-24 h-96 w-96 rounded-full bg-info/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-warning/10 blur-3xl" />
      </div>

      <main className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-4">
        <ActionBar
          paused={paused}
          onTogglePaused={togglePaused}
          onRefresh={refreshNow}
          onOpenConfig={() => setConfigOpen(true)}
          source={source}
        />

        {/* Metric gauges */}
        <div
          className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${
            visibleGaugeCount >= 4 ? "lg:grid-cols-4" : visibleGaugeCount === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {loading
            ? Array.from({ length: Math.max(visibleGaugeCount, 1) }).map((_, i) => <SkeletonCard key={i} />)
            : (
              <>
                {config.visible.cpu && (
                  <MetricGauge
                    title={config.titles.cpu}
                    value={latest?.cpu ?? 0}
                    icon={Cpu}
                    thresholds={config.thresholds.cpu}
                    hint={`Threshold ${config.thresholds.cpu.warn}% / ${config.thresholds.cpu.crit}%`}
                  />
                )}
                {config.visible.memory && (
                  <MetricGauge
                    title={config.titles.memory}
                    value={latest?.memory ?? 0}
                    icon={MemoryStick}
                    thresholds={config.thresholds.memory}
                    hint={`Threshold ${config.thresholds.memory.warn}% / ${config.thresholds.memory.crit}%`}
                  />
                )}
                {config.visible.network && (
                  <NetworkCard
                    title={config.titles.network}
                    inKbps={latest?.network_in ?? 0}
                    outKbps={latest?.network_out ?? 0}
                  />
                )}
                {config.visible.disk && (
                  <MetricGauge
                    title={config.titles.disk}
                    value={latest?.disk ?? 0}
                    icon={HardDrive}
                    thresholds={config.thresholds.disk}
                    hint={`Threshold ${config.thresholds.disk.warn}% / ${config.thresholds.disk.crit}%`}
                  />
                )}
              </>
            )}
        </div>

        {/* Chart + logs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {config.visible.chart && (
            <div className="xl:col-span-2">
              {loading ? <SkeletonCard /> : <ResourceChart title={config.titles.chart} data={history} />}
            </div>
          )}
          {config.visible.logs && (
            <div className={config.visible.chart ? "" : "xl:col-span-3"}>
              {loading ? (
                <SkeletonCard />
              ) : (
                <LogsCard title={config.titles.logs} latest={latest} thresholds={config.thresholds} />
              )}
            </div>
          )}
        </div>

        <div className="text-2xs text-muted-foreground text-center py-2">
          System Dashboard · refresh {(config.refreshMs / 1000).toFixed(1)}s · {source === "cloud" ? "Cloud-synced" : "Local mock"}
        </div>
      </main>

      <ConfigDrawer open={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
};

export default Index;
