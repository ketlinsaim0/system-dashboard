import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Wallet,
  Users,
  Settings,
  ChevronLeft,
  ChevronDown,
  ShoppingCart,
  Receipt,
  BarChart3,
  Boxes,
  Building2,
  FileText,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavChild = { label: string; badge?: string };
type NavItem = {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  badge?: string;
  children?: NavChild[];
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, active: true },
      {
        label: "Inventory",
        icon: Package,
        children: [{ label: "Items" }, { label: "Stock", badge: "12" }, { label: "Warehouses" }],
      },
      {
        label: "Finance",
        icon: Wallet,
        children: [{ label: "Invoices" }, { label: "Expenses" }, { label: "Reports" }],
      },
      {
        label: "CRM",
        icon: Users,
        children: [{ label: "Leads", badge: "4" }, { label: "Contacts" }, { label: "Deals" }],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Orders", icon: ShoppingCart, badge: "23" },
      { label: "Billing", icon: Receipt },
      { label: "Analytics", icon: BarChart3 },
      { label: "Products", icon: Boxes },
      { label: "Vendors", icon: Building2 },
      { label: "Documents", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", icon: Settings },
      { label: "Help & Docs", icon: HelpCircle },
    ],
  },
];

export function ErpSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [openItem, setOpenItem] = useState<string | null>("Inventory");

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200 ease-out shrink-0",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Brand */}
      <div className="h-12 flex items-center gap-2 px-3 border-b border-sidebar-border">
        <div className="h-7 w-7 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xs shrink-0">
          N
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white tracking-tight leading-none">Nexus ERP</div>
            <div className="text-2xs text-sidebar-foreground/60 mt-0.5">Acme Corp · Prod</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {navGroups.map((group) => (
          <div key={group.title} className="px-2 mb-3">
            {!collapsed && (
              <div className="px-2 mb-1 text-2xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
                {group.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isOpen = openItem === item.label;
                const hasChildren = !!item.children?.length;
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => hasChildren && !collapsed && setOpenItem(isOpen ? null : item.label)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors group",
                        item.active
                          ? "bg-sidebar-primary/15 text-white border-l-2 border-sidebar-primary -ml-px pl-[7px]"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-2xs px-1.5 py-0.5 rounded bg-sidebar-primary/20 text-sidebar-primary-foreground font-medium num">
                              {item.badge}
                            </span>
                          )}
                          {hasChildren && (
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 text-sidebar-foreground/50 transition-transform",
                                isOpen && "rotate-180"
                              )}
                            />
                          )}
                        </>
                      )}
                    </button>
                    {hasChildren && !collapsed && isOpen && (
                      <ul className="mt-0.5 ml-7 space-y-0.5 border-l border-sidebar-border pl-2">
                        {item.children!.map((child) => (
                          <li key={child.label}>
                            <a
                              href="#"
                              className="flex items-center justify-between px-2 py-1 rounded text-[12.5px] text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent transition-colors"
                            >
                              <span>{child.label}</span>
                              {child.badge && (
                                <span className="text-2xs px-1 rounded bg-warning/20 text-warning num">
                                  {child.badge}
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-2xs font-semibold text-white shrink-0">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate leading-tight">Jane Doe</div>
              <div className="text-2xs text-sidebar-foreground/50 truncate">Admin · v2.4.1</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
