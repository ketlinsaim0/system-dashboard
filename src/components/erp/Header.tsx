import { Search, Bell, Plus, HelpCircle, Command, ChevronDown, LogOut, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ErpHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="h-12 bg-card border-b border-border flex items-center px-4 gap-4 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Acme Corp</span>
        <span className="text-border">/</span>
        <span>Operations</span>
        <span className="text-border">/</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Global entity search — invoices, items, contacts, orders…"
            className="w-full h-8 pl-8 pr-16 text-xs rounded-md bg-muted/60 border border-transparent focus:bg-card focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition placeholder:text-muted-foreground"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-2xs text-muted-foreground bg-card border border-border rounded px-1 py-0.5">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Link
          to="/customers"
          className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md text-xs text-foreground hover:bg-muted"
        >
          <Users className="h-3.5 w-3.5" /> Customers
        </Link>
        <button className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" />
          New
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
        <button
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-card" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Profile */}
        <button className="h-8 pl-1 pr-2 flex items-center gap-2 rounded-md hover:bg-muted transition-colors">
          <div className="relative">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-2xs font-semibold text-white">
              {(user?.email?.[0] ?? "U").toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-card animate-pulse-dot" />
          </div>
          <div className="text-left hidden md:block leading-tight">
            <div className="text-xs font-medium text-foreground truncate max-w-[140px]">{user?.email ?? "Guest"}</div>
            <div className="text-2xs text-muted-foreground">Signed in</div>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          onClick={() => signOut()}
          aria-label="Sign out"
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
