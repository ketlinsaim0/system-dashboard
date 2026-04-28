import { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

type Props = { title: string; subtitle?: string; actions?: ReactNode };

export function AppHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="h-14 border-b bg-card/60 backdrop-blur sticky top-0 z-20 flex items-center px-3 sm:px-4 gap-3">
      <SidebarTrigger />
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-2xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1.5">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
