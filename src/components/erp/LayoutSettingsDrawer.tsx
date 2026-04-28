import { X, RotateCcw, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import {
  useDashboardConfig,
  type WidgetKey,
  DEFAULT_CONFIG,
  ALL_WIDGETS,
} from "@/hooks/useDashboardConfig";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onClose: () => void };

export function LayoutSettingsDrawer({ open, onClose }: Props) {
  const { config, update, reset } = useDashboardConfig();

  function move(key: WidgetKey, dir: -1 | 1) {
    const order = [...config.order];
    const i = order.indexOf(key);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    update({ order });
  }

  function toggleVisible(key: WidgetKey) {
    update({ visible: { ...config.visible, [key]: !config.visible[key] } });
  }

  function setTitle(key: WidgetKey, title: string) {
    update({ titles: { ...config.titles, [key]: title } });
  }

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
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] bg-card border-l shadow-xl",
          "transition-transform duration-300 ease-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="h-12 px-4 flex items-center justify-between border-b shrink-0">
          <h2 className="text-sm font-semibold">Edit dashboard</h2>
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

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-2xs text-muted-foreground mb-2">
            Pin/hide widgets and reorder them. Changes save automatically and sync across your devices.
          </p>
          {config.order.map((key, idx) => {
            const visible = config.visible[key];
            return (
              <div
                key={key}
                className={cn(
                  "border rounded-lg p-3 transition-colors",
                  visible ? "bg-card" : "bg-muted/40 opacity-70",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => toggleVisible(key)}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border hover:bg-muted"
                    aria-label={visible ? "Hide" : "Show"}
                    title={visible ? "Hide widget" : "Show widget"}
                  >
                    {visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                  <input
                    value={config.titles[key]}
                    onChange={(e) => setTitle(key, e.target.value)}
                    placeholder={DEFAULT_CONFIG.titles[key]}
                    className="flex-1 h-8 px-2 text-xs rounded-md bg-muted/60 border focus:bg-card focus:border-ring focus:outline-none"
                  />
                  <button
                    onClick={() => move(key, -1)}
                    disabled={idx === 0}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(key, 1)}
                    disabled={idx === ALL_WIDGETS.length - 1}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-2xs text-muted-foreground capitalize">
                  {key.replace(/_/g, " ")}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}