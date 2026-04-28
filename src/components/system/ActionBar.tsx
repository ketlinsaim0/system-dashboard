import { LogOut, Pause, Play, RefreshCw, Settings2, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

type Props = {
  paused: boolean;
  onTogglePaused: () => void;
  onRefresh: () => void;
  onOpenConfig: () => void;
  source: "cloud" | "mock";
};

export function ActionBar({ paused, onTogglePaused, onRefresh, onOpenConfig, source }: Props) {
  const { user, isDemo, signOut } = useAuth();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground tracking-tight">System Dashboard</h1>
          <p className="text-2xs text-muted-foreground">
            {isDemo ? "Demo mode · mock data" : source === "cloud" ? "Live · synced via Cloud" : "Live · local mock"}
            {user?.email && !isDemo ? ` · ${user.email}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onTogglePaused}
          className={cn(
            "h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md border border-border/60 bg-card/60 backdrop-blur transition-colors",
            paused ? "text-warning hover:bg-warning/10" : "text-foreground hover:bg-muted",
          )}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={onRefresh}
          className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md border border-border/60 bg-card/60 backdrop-blur hover:bg-muted text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
        <button
          onClick={onOpenConfig}
          className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md border border-border/60 bg-card/60 backdrop-blur hover:bg-muted text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" /> Configure
        </button>
        <ThemeToggle />
        <button
          onClick={() => signOut()}
          className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <LogOut className="h-3.5 w-3.5" /> {isDemo ? "Exit demo" : "Sign out"}
        </button>
      </div>
    </div>
  );
}