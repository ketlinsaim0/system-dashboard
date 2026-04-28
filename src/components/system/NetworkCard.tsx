import { Network, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { GlassCard } from "./GlassCard";

type Props = { title: string; inKbps: number; outKbps: number };

export function NetworkCard({ title, inKbps, outKbps }: Props) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-info/10">
            <Network className="h-3.5 w-3.5 text-info" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
        <span className="text-2xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-info/10 text-info">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1 text-2xs text-muted-foreground mb-1">
            <ArrowDownToLine className="h-3 w-3" /> In
          </div>
          <div className="text-lg font-semibold num tabular-nums text-foreground">
            {inKbps.toFixed(0)}
            <span className="text-xs text-muted-foreground ml-1">KB/s</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-2xs text-muted-foreground mb-1">
            <ArrowUpFromLine className="h-3 w-3" /> Out
          </div>
          <div className="text-lg font-semibold num tabular-nums text-foreground">
            {outKbps.toFixed(0)}
            <span className="text-xs text-muted-foreground ml-1">KB/s</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}