import { X, RotateCcw } from "lucide-react";
import { useDashboardConfig, type WidgetKey, DEFAULT_CONFIG } from "@/hooks/useDashboardConfig";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onClose: () => void };

const widgetKeys: WidgetKey[] = ["cpu", "memory", "network", "disk", "chart", "logs"];
const thresholdKeys: ("cpu" | "memory" | "disk")[] = ["cpu", "memory", "disk"];

export function ConfigDrawer({ open, onClose }: Props) {
  const { config, update, reset } = useDashboardConfig();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-card border-l border-border shadow-xl",
          "transition-transform duration-300 ease-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Dashboard Configuration</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={reset}
              className="h-7 px-2 inline-flex items-center gap-1 text-2xs rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
            <button
              onClick={onClose}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
          <section>
            <h3 className="text-xs font-semibold text-foreground mb-2">Refresh interval</h3>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={1000}
                max={10000}
                step={500}
                value={config.refreshMs}
                onChange={(e) => update({ refreshMs: Number(e.target.value) })}
                className="flex-1 accent-primary"
              />
              <span className="text-xs text-foreground num tabular-nums w-16 text-right">
                {(config.refreshMs / 1000).toFixed(1)}s
              </span>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-foreground mb-2">Widgets</h3>
            <ul className="space-y-2">
              {widgetKeys.map((k) => (
                <li key={k} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.visible[k]}
                    onChange={(e) =>
                      update({ visible: { ...config.visible, [k]: e.target.checked } })
                    }
                    className="h-4 w-4 accent-primary"
                    id={`vis-${k}`}
                  />
                  <label htmlFor={`vis-${k}`} className="text-2xs text-muted-foreground w-16 capitalize">
                    {k}
                  </label>
                  <input
                    value={config.titles[k]}
                    onChange={(e) => update({ titles: { ...config.titles, [k]: e.target.value } })}
                    className="flex-1 h-8 px-2 text-xs rounded-md bg-muted/60 border border-border focus:bg-card focus:border-ring focus:outline-none"
                    placeholder={DEFAULT_CONFIG.titles[k]}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-foreground mb-2">Thresholds (warn / critical)</h3>
            <div className="space-y-3">
              {thresholdKeys.map((k) => {
                const t = config.thresholds[k];
                return (
                  <div key={k} className="space-y-1">
                    <div className="flex justify-between text-2xs">
                      <span className="text-foreground capitalize font-medium">{k}</span>
                      <span className="text-muted-foreground num tabular-nums">
                        warn {t.warn}% · crit {t.crit}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={10}
                        max={Math.max(11, t.crit - 1)}
                        value={t.warn}
                        onChange={(e) =>
                          update({
                            thresholds: {
                              ...config.thresholds,
                              [k]: { ...t, warn: Number(e.target.value) },
                            },
                          })
                        }
                        className="flex-1 accent-warning"
                      />
                      <input
                        type="range"
                        min={Math.min(98, t.warn + 1)}
                        max={99}
                        value={t.crit}
                        onChange={(e) =>
                          update({
                            thresholds: {
                              ...config.thresholds,
                              [k]: { ...t, crit: Number(e.target.value) },
                            },
                          })
                        }
                        className="flex-1 accent-destructive"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="px-4 py-3 border-t border-border text-2xs text-muted-foreground">
          Changes sync to your account when signed in, and stay on this device otherwise.
        </footer>
      </aside>
    </>
  );
}