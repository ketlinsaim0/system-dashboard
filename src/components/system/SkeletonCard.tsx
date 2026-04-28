import { GlassCard } from "./GlassCard";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-2 w-full mb-3" />
      <Skeleton className="h-12 w-full" />
    </GlassCard>
  );
}