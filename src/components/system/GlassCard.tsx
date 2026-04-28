import { cn } from "@/lib/utils";

/** Glassmorphism card — blurred, translucent surface with a subtle gradient ring. */
export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl",
        "shadow-[0_8px_32px_-12px_hsl(var(--primary)/0.18)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-xl",
        "before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-60",
        "dark:before:from-white/[0.04]",
        className,
      )}
      {...props}
    >
      <div className="relative">{children}</div>
    </div>
  );
}